#!/usr/bin/env node
/**
 * Re-parse cards marked review or stub in card-manifest.json and update set DSL.
 *
 * Usage: node src/scripts/fix-review-stubs.js [--dry-run]
 */
const fs = require("fs");
const path = require("path");
const { parseCardToDsl, buildTokenMap } = require("./effect-text-parser");
const { buildIdentityIndex, cardIdentityKey } = require("./identity-dsl");

const ROOT = path.join(__dirname, "..", "..");
const MANIFEST_PATH = path.join(ROOT, "packages", "sve-engine", "data", "card-manifest.json");
const SETS_DIR = path.join(ROOT, "packages", "sve-engine", "data", "card-defs", "sets");
const OVERRIDES_PATH = path.join(
  ROOT,
  "packages",
  "sve-engine",
  "data",
  "card-defs",
  "hand-authored-overrides.json",
);

function setPrefix(cardNo) {
  return String(cardNo).replace(/-.*$/, "");
}

function loadAllCards() {
  const cards = [];
  for (const file of fs.readdirSync(__dirname).filter((f) => f.endsWith("-cards.json"))) {
    cards.push(...JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8")));
  }
  return cards;
}

function loadSetFiles() {
  const bySet = {};
  if (!fs.existsSync(SETS_DIR)) return bySet;
  for (const file of fs.readdirSync(SETS_DIR).filter((f) => f.endsWith(".json"))) {
    bySet[file.replace(/\.json$/, "")] = JSON.parse(
      fs.readFileSync(path.join(SETS_DIR, file), "utf8"),
    );
  }
  return bySet;
}

function effectHasNoop(effect) {
  if (!effect) return false;
  if (effect.op === "noop") return true;
  if (effect.op === "sequence") return effect.steps?.some(effectHasNoop);
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    return effect.options?.some((o) => effectHasNoop(o.effect));
  }
  if (effect.op === "if") return effectHasNoop(effect.then) || effectHasNoop(effect.else);
  if (effect.op === "optionalCost") return effectHasNoop(effect.then);
  return false;
}

function noopScore(abilities) {
  if (!abilities?.length) return 999;
  let score = 0;
  function walk(e) {
    if (!e) return;
    if (e.op === "noop") score += 10;
    if (e.op === "sequence") e.steps?.forEach(walk);
    if (e.op === "choose" || e.op === "chooseMultiple") e.options?.forEach((o) => walk(o.effect));
    if (e.op === "if") {
      walk(e.then);
      walk(e.else);
    }
    if (e.op === "optionalCost") walk(e.then);
  }
  for (const a of abilities) walk(a.effect);
  return score;
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const targets = Object.entries(manifest).filter(
    ([, m]) => m.dslStatus === "review" || m.dslStatus === "stub",
  );
  const overrideNos = fs.existsSync(OVERRIDES_PATH)
    ? new Set(Object.keys(JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"))))
    : new Set();

  const allCards = loadAllCards();
  const cardByNo = Object.fromEntries(allCards.map((c) => [c.cardNo, c]));
  const tokenMap = buildTokenMap(allCards);
  const setDefs = loadSetFiles();
  const flatDefs = {};
  for (const defs of Object.values(setDefs)) Object.assign(flatDefs, defs);
  const identityIndex = buildIdentityIndex(cardByNo, flatDefs);

  let improved = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const [cardNo, meta] of targets) {
    if (overrideNos.has(cardNo)) {
      skipped++;
      continue;
    }
    const card = cardByNo[cardNo];
    if (!card) continue;

    const key = cardIdentityKey(card.name, card.type || "base");
    const canonicalNo = identityIndex.canonicalByIdentity.get(key) || cardNo;
    if (cardNo !== canonicalNo) continue;

    const parsed = parseCardToDsl(card, tokenMap);
    if (!parsed.abilities.length) continue;

    const canonSet = setPrefix(canonicalNo);
    if (!setDefs[canonSet]) setDefs[canonSet] = {};
    const prev = setDefs[canonSet][canonicalNo] || {};
    const prevScore = noopScore(prev.abilities);
    const newScore = noopScore(parsed.abilities);

    if (newScore > prevScore && prev.abilities?.length) {
      unchanged++;
      continue;
    }

    const prevJson = JSON.stringify(prev.abilities ?? []);
    const newJson = JSON.stringify(parsed.abilities);
    if (prevJson === newJson) {
      unchanged++;
      continue;
    }

    setDefs[canonSet][canonicalNo] = {
      ...prev,
      name: card.name?.replace(/\s+TOKEN$/i, "").trim(),
      class: card.class || prev.class || "neutral",
      printingType: card.type === "evolved" ? "evolved" : card.type || prev.printingType,
      keywords: parsed.keywords,
      parseConfidence: parsed.confidence,
      abilities: parsed.abilities,
    };
    improved++;
  }

  if (!dryRun) {
    for (const [set, defs] of Object.entries(setDefs)) {
      fs.writeFileSync(
        path.join(SETS_DIR, `${set}.json`),
        JSON.stringify(defs, null, 2) + "\n",
      );
    }
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}Fixed review/stub: ${improved} improved, ${unchanged} unchanged, ${skipped} skipped (overrides), ${targets.length} targeted`,
  );
}

main();
