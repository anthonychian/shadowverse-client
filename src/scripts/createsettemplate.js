#!/usr/bin/env node

/**
 * Creates a JSON template for a new card set from the official card list page.
 *
 * Quick workflow (when the scraper doesn't work or you prefer manual):
 *
 * 1. Run this to generate a numbered template:
 *      node scripts/create-set-template.js BP17 120
 *
 * 2. Open the generated BP17-cards.json in your editor
 *
 * 3. Go to https://en.shadowverse-evolve.com/cards/?expansion_name=BP17
 *    and fill in the card names. The card numbers are pre-filled.
 *
 * 4. Run the generator:
 *      node scripts/generate-card-files.js BP17
 *
 * Usage:
 *   node scripts/create-set-template.js <EXPANSION> <MAX_CARD_NUMBER> [OPTIONS]
 *
 * Options:
 *   --ultra <count>    Number of ultra rare cards (U-prefix), default 7
 *   --special <count>  Number of special cards (SP-prefix), default 0
 *   --tokens <count>   Number of token cards (T-prefix), default 0
 */

const fs = require("fs");
const path = require("path");

const EXPANSION = process.argv[2];
const MAX_NUM = parseInt(process.argv[3], 10);

if (!EXPANSION || isNaN(MAX_NUM)) {
  console.error("Usage: node scripts/create-set-template.js <EXPANSION> <MAX_CARD_NUMBER> [--ultra N] [--special N] [--tokens N]");
  console.error("Example: node scripts/create-set-template.js BP17 120 --ultra 7 --tokens 5");
  process.exit(1);
}

function getArg(flag, defaultVal) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : defaultVal;
}

const ULTRA_COUNT = getArg("--ultra", 7);
const SPECIAL_COUNT = getArg("--special", 0);
const TOKEN_COUNT = getArg("--tokens", 0);

const cards = [];

// Regular numbered cards (001 to MAX_NUM)
for (let i = 1; i <= MAX_NUM; i++) {
  const num = String(i).padStart(3, "0");
  cards.push({
    cardNo: `${EXPANSION}-${num}EN`,
    name: "",
    type: "base",
    class: "",
  });
}

// Ultra rare cards
for (let i = 1; i <= ULTRA_COUNT; i++) {
  const num = String(i).padStart(2, "0");
  cards.push({
    cardNo: `${EXPANSION}-U${num}EN`,
    name: "",
    type: "base",
    class: "",
  });
}

// Special cards
for (let i = 1; i <= SPECIAL_COUNT; i++) {
  const num = String(i).padStart(2, "0");
  cards.push({
    cardNo: `${EXPANSION}-SP${num}EN`,
    name: "",
    type: "base",
    class: "",
  });
}

// Token cards
for (let i = 1; i <= TOKEN_COUNT; i++) {
  const num = String(i).padStart(2, "0");
  cards.push({
    cardNo: `${EXPANSION}-T${num}EN`,
    name: "",
    type: "token",
    class: "",
  });
}

const outputPath = path.join(__dirname, `${EXPANSION}-cards.json`);
fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2));

console.log(`Template created: ${outputPath}`);
console.log(`  ${MAX_NUM} regular cards`);
console.log(`  ${ULTRA_COUNT} ultra rare cards`);
console.log(`  ${SPECIAL_COUNT} special cards`);
console.log(`  ${TOKEN_COUNT} token cards`);
console.log(`  ${cards.length} total entries`);
console.log(`\nNext steps:`);
console.log(`  1. Open ${outputPath} and fill in the "name" fields`);
console.log(`     - For evolved cards, set type to "evolved" and add " Evolved" to the name`);
console.log(`     - For tokens, add " TOKEN" suffix to the name`);
console.log(`     - Set class to: forest, sword, rune, dragon, abyss, haven, or neutral`);
console.log(`  2. Download card images to public/textures/ (named like ${EXPANSION}-001EN.png)`);
console.log(`  3. Run: node scripts/generate-card-files.js ${EXPANSION}`);
