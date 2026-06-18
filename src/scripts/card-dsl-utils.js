/**
 * Shared helpers for DSL completeness checks and completion loop.
 */
const fs = require("fs");
const path = require("path");
const { buildIdentityIndex, cardIdentityKey } = require("./identity-dsl");

const ROOT = path.join(__dirname, "..", "..");
const SETS_DIR = path.join(ROOT, "packages", "sve-engine", "data", "card-defs", "sets");
const MANIFEST_PATH = path.join(ROOT, "packages", "sve-engine", "data", "card-manifest.json");

const VANGUARD_RE =
  /\[ride\]|\[feed\]|on drive|on race|single drive|drive point|vanguard/i;

function loadAllExpansionCards() {
  const cards = [];
  for (const file of fs.readdirSync(__dirname).filter((f) => f.endsWith("-cards.json"))) {
    cards.push(...JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8")));
  }
  return cards;
}

function loadSetDefs() {
  const merged = {};
  if (!fs.existsSync(SETS_DIR)) return merged;
  for (const file of fs.readdirSync(SETS_DIR).filter((f) => f.endsWith(".json"))) {
    Object.assign(merged, JSON.parse(fs.readFileSync(path.join(SETS_DIR, file), "utf8")));
  }
  return merged;
}

function effectHasNoopInTree(effect) {
  if (!effect) return false;
  if (effect.op === "noop") return true;
  if (effect.op === "sequence") return effect.steps?.some(effectHasNoopInTree);
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    return effect.options?.some((o) => effectHasNoopInTree(o.effect));
  }
  if (effect.op === "if") {
    return effectHasNoopInTree(effect.then) || effectHasNoopInTree(effect.else);
  }
  if (effect.op === "optionalCost") return effectHasNoopInTree(effect.then);
  return false;
}

function countNoops(def) {
  let n = 0;
  function walk(e) {
    if (!e) return;
    if (e.op === "noop") n++;
    if (e.op === "sequence") e.steps?.forEach(walk);
    if (e.op === "choose" || e.op === "chooseMultiple") e.options?.forEach((o) => walk(o.effect));
    if (e.op === "if") {
      walk(e.then);
      walk(e.else);
    }
    if (e.op === "optionalCost") walk(e.then);
  }
  for (const a of def.abilities || []) walk(a.effect);
  return n;
}

function isVanguardCard(card) {
  const text = card?.cardText || card?.details?.effect || "";
  return VANGUARD_RE.test(text);
}

function getCanonicalNoopReport() {
  const expansion = loadAllExpansionCards();
  const cardByNo = Object.fromEntries(expansion.map((c) => [c.cardNo, c]));
  const setDefs = loadSetDefs();
  const identityIndex = buildIdentityIndex(cardByNo, setDefs);

  const incomplete = [];
  let totalNoop = 0;

  for (const [key, canonNo] of identityIndex.canonicalByIdentity.entries()) {
    const card = cardByNo[canonNo];
    const def = setDefs[canonNo];
    if (!def?.abilities?.length) continue;
    if (def.parseConfidence === "vanguard-deferred") continue;
    if (card && isVanguardCard(card)) continue;

    const noopCount = countNoops(def);
    if (noopCount > 0) {
      totalNoop += noopCount;
      incomplete.push({ key, canonNo, noopCount, name: def.name || card?.name });
    }
  }

  incomplete.sort((a, b) => b.noopCount - a.noopCount);
  return { incomplete, totalNoop, canonicalWithNoop: incomplete.length };
}

module.exports = {
  VANGUARD_RE,
  loadAllExpansionCards,
  loadSetDefs,
  effectHasNoopInTree,
  countNoops,
  isVanguardCard,
  getCanonicalNoopReport,
  SETS_DIR,
  MANIFEST_PATH,
};
