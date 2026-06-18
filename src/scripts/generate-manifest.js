#!/usr/bin/env node
/**
 * Generate / update card-manifest.json from expansion scrapes and hand-authored defs.
 * DSL status resolves abilities by card identity name (reprints inherit canonical DSL).
 *
 * Usage: node src/scripts/generate-manifest.js [--set BP01]
 */
const fs = require("fs");
const path = require("path");
const { buildIdentityIndex, resolveAbilitiesForCard } = require("./identity-dsl");

const ROOT = path.join(__dirname, "..", "..");
const SCRIPTS = path.join(__dirname);
const MANIFEST_PATH = path.join(ROOT, "packages", "sve-engine", "data", "card-manifest.json");
const CARD_DEFS_DIR = path.join(ROOT, "packages", "sve-engine", "data", "card-defs");
const SCENARIOS_DIR = path.join(ROOT, "packages", "sve-engine", "scenarios");

function setPrefix(cardNo) {
  return String(cardNo).replace(/-.*$/, "");
}

function loadExpansionCards() {
  const cards = {};
  for (const file of fs.readdirSync(SCRIPTS).filter((f) => f.endsWith("-cards.json"))) {
    for (const c of JSON.parse(fs.readFileSync(path.join(SCRIPTS, file), "utf8"))) {
      cards[c.cardNo] = c;
    }
  }
  return cards;
}

function loadHandAuthored() {
  const defs = {};
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (
        entry.name.endsWith(".json") &&
        entry.name !== "parsed-stubs.json" &&
        entry.name !== "deck-cards.json"
      ) {
        const chunk = JSON.parse(fs.readFileSync(full, "utf8"));
        const first = Object.keys(chunk)[0];
        if (first && /^[A-Z]/.test(first)) Object.assign(defs, chunk);
      }
    }
  };
  walk(CARD_DEFS_DIR);
  return defs;
}

function complexityTier(text, card) {
  if (!text || !String(text).trim()) return "keyword-only";
  const t = String(text).toLowerCase();
  if (!/\[fanfare\]|\[lastwords\]|\[act\]|on evolve|strike|necrocharge|choose/i.test(t)) {
    return "keyword-only";
  }
  if (/\bchoose\b|\bor\b|if |instead/i.test(t)) return "complex";
  if (/\[fanfare\]|\[lastwords\]|\[act\]|on evolve/i.test(t)) return "simple";
  return "keyword-only";
}

function scenarioIdsForCard(cardNo) {
  if (!fs.existsSync(SCENARIOS_DIR)) return [];
  const ids = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.includes(cardNo) && /\.(json|ya?ml)$/i.test(entry.name)) {
        ids.push(entry.name.replace(/\.(json|ya?ml)$/i, ""));
      }
    }
  };
  walk(SCENARIOS_DIR);
  return ids;
}

function hasNoopOnly(abilities) {
  if (!abilities?.length) return false;
  return abilities.every((a) => {
    const eff = a.effect;
    if (!eff) return true;
    if (eff.op === "noop") return true;
    if (eff.op === "sequence") return eff.steps?.every((s) => s.op === "noop");
    return false;
  });
}

function effectHasNoopInTree(effect) {
  if (!effect) return false;
  if (effect.op === "noop") return true;
  if (effect.op === "sequence") return effect.steps?.some(effectHasNoopInTree);
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    return effect.options?.some((o) => effectHasNoopInTree(o.effect));
  }
  if (effect.op === "if") return effectHasNoopInTree(effect.then) || effectHasNoopInTree(effect.else);
  if (effect.op === "optionalCost") return effectHasNoopInTree(effect.then);
  return false;
}

function dslStatus(cardNo, def, tier, identityIndex, handAuthored) {
  const abilities = resolveAbilitiesForCard(cardNo, handAuthored, identityIndex);
    const direct = handAuthored[cardNo];
  const parseConfidence = direct?.parseConfidence ?? def?.parseConfidence;

  if (parseConfidence === "vanguard-deferred") return "keyword-only";

  if (abilities && abilities.length > 0) {
    const hasNoop = abilities.some((a) => effectHasNoopInTree(a.effect));
    if (hasNoopOnly(abilities)) return "stub";
    if (hasNoop) {
      if (parseConfidence === "review") return "review";
      if (parseConfidence === "manual" && !hasNoopOnly(abilities)) return "review";
      return "stub";
    }
    if (parseConfidence === "auto") return "authored";
    if (parseConfidence === "review") return "review";
    if (parseConfidence === "manual") return "authored";
    return direct?.abilities?.length ? dslStatusFromConfidence(parseConfidence) : "inherited";
  }
  if (tier === "keyword-only") return "keyword-only";
  return "missing";
}

function dslStatusFromConfidence(parseConfidence) {
  if (parseConfidence === "auto") return "stub";
  if (parseConfidence === "review") return "review";
  if (parseConfidence === "manual") return "authored";
  return "authored";
}

function main() {
  const setFilter = process.argv.includes("--set")
    ? process.argv[process.argv.indexOf("--set") + 1]
    : null;

  const expansion = loadExpansionCards();
  const handAuthored = loadHandAuthored();
  const identityIndex = buildIdentityIndex(expansion, handAuthored);
  const prev = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : {};

  const manifest = { ...prev };
  for (const [cardNo, card] of Object.entries(expansion)) {
    if (setFilter && setPrefix(cardNo) !== setFilter) continue;
    const text = card.details?.effect || card.cardText || "";
    const tier = complexityTier(text, card);
    const def = handAuthored[cardNo];
    const prevEntry = prev[cardNo] ?? {};
    const abilities = resolveAbilitiesForCard(cardNo, handAuthored, identityIndex);
    const canonicalNo = identityIndex.canonicalByIdentity.get(
      identityIndex.cardNoToIdentity.get(cardNo),
    );
    manifest[cardNo] = {
      set: setPrefix(cardNo),
      name: card.name,
      complexityTier: tier,
      dslStatus: dslStatus(cardNo, def, tier, identityIndex, handAuthored),
      dslSource: abilities.length
        ? cardNo === canonicalNo || def?.abilities?.length
          ? canonicalNo
          : canonicalNo
        : undefined,
      evalStatus: prevEntry.evalStatus ?? "unverified",
      scenarioIds: scenarioIdsForCard(cardNo),
      blockers: prevEntry.blockers ?? [],
      lastEvalAt: prevEntry.lastEvalAt,
      notes: prevEntry.notes,
    };
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  const count = Object.keys(manifest).length;
  const byStatus = {};
  for (const m of Object.values(manifest)) {
    byStatus[m.dslStatus] = (byStatus[m.dslStatus] || 0) + 1;
  }
  console.log(`Wrote ${MANIFEST_PATH} (${count} entries)`);
  console.log("  By dslStatus:", byStatus);
}

main();
