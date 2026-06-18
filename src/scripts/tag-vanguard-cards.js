#!/usr/bin/env node
/**
 * Tag Vanguard cards as keyword-only and record engine blockers.
 */
const fs = require("fs");
const path = require("path");
const { loadAllExpansionCards, loadSetDefs, isVanguardCard, VANGUARD_RE } = require("./card-dsl-utils");
const { buildIdentityIndex, cardIdentityKey } = require("./identity-dsl");

const ROOT = path.join(__dirname, "..", "..");
const SETS_DIR = path.join(ROOT, "packages", "sve-engine", "data", "card-defs", "sets");
const BLOCKERS_PATH = path.join(ROOT, "packages", "sve-engine", "data", "engine-blockers.json");

function setPrefix(cardNo) {
  return String(cardNo).replace(/-.*$/, "");
}

function main() {
  const expansion = loadAllExpansionCards();
  const cardByNo = Object.fromEntries(expansion.map((c) => [c.cardNo, c]));
  const setDefs = loadSetDefs();
  const identityIndex = buildIdentityIndex(cardByNo, setDefs);

  const bySet = {};
  for (const [cardNo, def] of Object.entries(setDefs)) {
    const set = setPrefix(cardNo);
    if (!bySet[set]) bySet[set] = {};
    bySet[set][cardNo] = def;
  }

  const vanguardIds = [];
  for (const [key, canonNo] of identityIndex.canonicalByIdentity.entries()) {
    const card = cardByNo[canonNo];
    if (!card || !isVanguardCard(card)) continue;
    const set = setPrefix(canonNo);
    if (!bySet[set][canonNo]) bySet[set][canonNo] = { name: card.name };
    bySet[set][canonNo] = {
      ...bySet[set][canonNo],
      name: card.name?.replace(/\s+TOKEN$/i, "").trim(),
      class: card.class || bySet[set][canonNo].class || "neutral",
      printingType: card.type === "evolved" ? "evolved" : card.type || "base",
      parseConfidence: "vanguard-deferred",
      keywords: bySet[set][canonNo].keywords || [],
      abilities: bySet[set][canonNo].abilities?.length
        ? bySet[set][canonNo].abilities
        : [{ timing: "passive", effect: { op: "passiveKeywords", keywords: [] } }],
    };
    vanguardIds.push({ canonNo, key, name: card.name });
  }

  for (const [set, defs] of Object.entries(bySet)) {
    fs.writeFileSync(
      path.join(SETS_DIR, `${set}.json`),
      JSON.stringify(defs, null, 2) + "\n",
    );
  }

  const blockers = fs.existsSync(BLOCKERS_PATH)
    ? JSON.parse(fs.readFileSync(BLOCKERS_PATH, "utf8"))
    : {};
  blockers.vanguard = {
    reason: "Vanguard ride/feed/drive/race zones deferred",
    pattern: VANGUARD_RE.source,
    cardNos: [...new Set(vanguardIds.map((v) => v.canonNo))].sort(),
  };
  fs.writeFileSync(BLOCKERS_PATH, JSON.stringify(blockers, null, 2) + "\n");
  console.log(`Tagged ${vanguardIds.length} Vanguard canonical identities`);
}

main();
