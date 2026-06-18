#!/usr/bin/env node
/**
 * Replace noop nodes by re-running stub/noop pattern matchers on their labels.
 * No manual input — uses existing stub-patterns.js + noop-patterns.js.
 *
 * Usage:
 *   node src/scripts/auto-resolve-noop-labels.js
 *   node src/scripts/auto-resolve-noop-labels.js --dry-run
 */
const fs = require("fs");
const path = require("path");
const { matchNoopPattern } = require("./noop-patterns");
const { buildTokenMap } = require("./effect-text-parser");
const { TIMING_STUB_RE } = require("./noop-label-utils");
const { buildIdentityIndex } = require("./identity-dsl");
const { loadAllExpansionCards, SETS_DIR } = require("./card-dsl-utils");

const OVERRIDES_PATH = path.join(
  __dirname,
  "..",
  "..",
  "packages",
  "sve-engine",
  "data",
  "card-defs",
  "hand-authored-overrides.json",
);

function setPrefix(cardNo) {
  return String(cardNo).replace(/-.*$/, "");
}

function loadSetFiles() {
  const bySet = {};
  for (const file of fs.readdirSync(SETS_DIR).filter((f) => f.endsWith(".json"))) {
    bySet[file.replace(/\.json$/, "")] = JSON.parse(
      fs.readFileSync(path.join(SETS_DIR, file), "utf8"),
    );
  }
  return bySet;
}

function isNoopLike(effect) {
  return !effect || effect.op === "noop";
}

function tryResolveLabel(label, tokenMap) {
  if (!label || TIMING_STUB_RE.test(label)) return null;
  const trimmed = String(label).trim();
  if (trimmed.length < 4) return null;

  function parseInner(text) {
    const hit = matchNoopPattern(text, { tokenMap, seg: {}, parseInner });
    if (hit?.effect && hit.effect.op !== "noop") {
      return { effect: hit.effect, confidence: hit.confidence || "auto" };
    }
    return { effect: { op: "noop", label: text } };
  }

  const hit = matchNoopPattern(trimmed, { tokenMap, seg: {}, parseInner });
  if (!hit?.effect || hit.effect.op === "noop") return null;
  return hit.effect;
}

function resolveNoopsInEffect(effect, tokenMap, stats) {
  if (!effect) return effect;

  if (effect.op === "noop") {
    const resolved = tryResolveLabel(effect.label, tokenMap);
    if (resolved) {
      stats.resolved++;
      return resolved;
    }
    stats.unresolved++;
    return effect;
  }

  if (effect.op === "sequence") {
    const steps = (effect.steps || []).map((s) => resolveNoopsInEffect(s, tokenMap, stats));
    const pruned = steps.filter((s) => !isNoopLike(s));
    if (!pruned.length) return effect;
    if (pruned.length === 1) return pruned[0];
    return { ...effect, steps: pruned };
  }

  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    return {
      ...effect,
      options: (effect.options || []).map((o) => ({
        ...o,
        effect: resolveNoopsInEffect(o.effect, tokenMap, stats),
      })),
    };
  }

  if (effect.op === "if") {
    return {
      ...effect,
      then: resolveNoopsInEffect(effect.then, tokenMap, stats),
      else: resolveNoopsInEffect(effect.else, tokenMap, stats),
    };
  }

  if (effect.op === "optionalCost") {
    return {
      ...effect,
      then: resolveNoopsInEffect(effect.then, tokenMap, stats),
    };
  }

  return effect;
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const overrideNos = fs.existsSync(OVERRIDES_PATH)
    ? new Set(Object.keys(JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"))))
    : new Set();

  const allCards = loadAllExpansionCards();
  const cardByNo = Object.fromEntries(allCards.map((c) => [c.cardNo, c]));
  const tokenMap = buildTokenMap(allCards);
  const setDefs = loadSetFiles();
  const flat = {};
  for (const defs of Object.values(setDefs)) Object.assign(flat, defs);
  const identityIndex = buildIdentityIndex(cardByNo, flat);

  const stats = { resolved: 0, unresolved: 0, identitiesTouched: 0 };

  for (const [, canonNo] of identityIndex.canonicalByIdentity.entries()) {
    if (overrideNos.has(canonNo)) continue;
    const set = setPrefix(canonNo);
    const def = setDefs[set]?.[canonNo];
    if (!def?.abilities?.length) continue;

    const before = JSON.stringify(def.abilities);
    const abilities = def.abilities.map((ab) => ({
      ...ab,
      effect: resolveNoopsInEffect(ab.effect, tokenMap, stats),
    }));
    const after = JSON.stringify(abilities);
    if (before !== after) {
      stats.identitiesTouched++;
      if (!dryRun) {
        setDefs[set][canonNo] = { ...def, abilities };
      }
    }
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
    `${dryRun ? "[dry-run] " : ""}Auto-resolve: ${stats.resolved} noop nodes replaced, ` +
      `${stats.unresolved} still noop, ${stats.identitiesTouched} identities touched`,
  );
}

main();
