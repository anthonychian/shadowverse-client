#!/usr/bin/env node
/**
 * One-time / repeatable migration: split deck-cards.json into per-set files.
 * Usage: node src/scripts/split-deck-cards-to-sets.js
 */
const fs = require("fs");
const path = require("path");

const DECK_CARDS = path.join(
  __dirname,
  "..",
  "..",
  "packages",
  "sve-engine",
  "data",
  "card-defs",
  "deck-cards.json",
);
const SETS_DIR = path.join(
  __dirname,
  "..",
  "..",
  "packages",
  "sve-engine",
  "data",
  "card-defs",
  "sets",
);

function setPrefix(cardNo) {
  return cardNo.replace(/-.*$/, "");
}

function main() {
  if (!fs.existsSync(DECK_CARDS)) {
    console.error("Missing", DECK_CARDS);
    process.exit(1);
  }
  const all = JSON.parse(fs.readFileSync(DECK_CARDS, "utf8"));
  const bySet = {};
  for (const [cardNo, def] of Object.entries(all)) {
    const set = setPrefix(cardNo);
    if (!bySet[set]) bySet[set] = {};
    bySet[set][cardNo] = def;
  }
  fs.mkdirSync(SETS_DIR, { recursive: true });
  for (const [set, defs] of Object.entries(bySet).sort()) {
    const out = path.join(SETS_DIR, `${set}.json`);
    fs.writeFileSync(out, JSON.stringify(defs, null, 2) + "\n");
    console.log(`Wrote ${out} (${Object.keys(defs).length} cards)`);
  }
  console.log(`\nSplit ${Object.keys(all).length} cards into ${Object.keys(bySet).length} set files.`);
}

main();
