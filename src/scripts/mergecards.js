#!/usr/bin/env node
/**
 * Merge expansion JSON files into canonical cards.json and report coverage.
 *
 * Usage:
 *   node src/scripts/mergecards.js
 *   node src/scripts/mergecards.js --report
 */
const fs = require("fs");
const path = require("path");

const SCRIPTS_DIR = __dirname;
const CARDS_DB = path.join(__dirname, "..", "..", "packages", "sve-engine", "data", "cards.json");
const MVP_DEFS = path.join(__dirname, "..", "..", "packages", "sve-engine", "src", "cards", "mvp-cards.ts");
const CARD_DEFS_DIR = path.join(__dirname, "..", "..", "packages", "sve-engine", "data", "card-defs");

const REPORT_ONLY = process.argv.includes("--report");

function loadExpansionFiles() {
  const files = fs.readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith("-cards.json"));
  const merged = {};
  for (const file of files) {
    const cards = JSON.parse(fs.readFileSync(path.join(SCRIPTS_DIR, file), "utf8"));
    for (const card of cards) {
      merged[card.cardNo] = card;
    }
  }
  return merged;
}

function loadHandAuthoredDefs() {
  const defs = {};
  if (!fs.existsSync(CARD_DEFS_DIR)) return defs;
  for (const file of fs.readdirSync(CARD_DEFS_DIR).filter((f) => f.endsWith(".json"))) {
    const data = JSON.parse(fs.readFileSync(path.join(CARD_DEFS_DIR, file), "utf8"));
    for (const [cardNo, def] of Object.entries(data)) {
      defs[cardNo] = def;
    }
  }
  return defs;
}

function main() {
  const scraped = loadExpansionFiles();
  const handAuthored = loadHandAuthoredDefs();
  const existing = fs.existsSync(CARDS_DB) ? JSON.parse(fs.readFileSync(CARDS_DB, "utf8")) : {};
  // Do not merge hand-authored ability defs into cards.json — the engine overlays
  // those from packages/sve-engine/data/card-defs/ at runtime.
  const merged = { ...existing, ...scraped };

  const withAbilities = Object.values(merged).filter((c) => c.abilities?.length > 0).length;
  const withStats = Object.values(merged).filter((c) => c.cost != null).length;
  const total = Object.keys(merged).length;

  console.log("Card coverage report:");
  console.log(`  Total cards in DB:     ${total}`);
  console.log(`  With cost/stats:       ${withStats} (${total ? ((withStats / total) * 100).toFixed(1) : 0}%)`);
  console.log(`  With ability defs:     ${withAbilities} (${total ? ((withAbilities / total) * 100).toFixed(1) : 0}%)`);
  console.log(`  Expansion files:       ${fs.readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith("-cards.json")).join(", ")}`);

  if (!REPORT_ONLY) {
    fs.mkdirSync(path.dirname(CARDS_DB), { recursive: true });
    fs.writeFileSync(CARDS_DB, JSON.stringify(merged, null, 2));
    console.log(`\nWrote ${CARDS_DB}`);
  }
}

main();
