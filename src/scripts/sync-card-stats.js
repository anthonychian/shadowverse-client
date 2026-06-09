#!/usr/bin/env node
/**
 * Sync packages/sve-engine/data/cards.json → src/engine/card-stats.json for the client UI.
 * Run after backfill-reprints.js or scraping.
 */
const fs = require("fs");
const path = require("path");

const CARDS_DB = path.join(__dirname, "..", "..", "packages", "sve-engine", "data", "cards.json");
const OUTPUT = path.join(__dirname, "..", "engine", "card-stats.json");

function main() {
  const cards = JSON.parse(fs.readFileSync(CARDS_DB, "utf8"));
  const stats = {};
  for (const card of Object.values(cards)) {
    if (!card?.cardNo) continue;
    stats[card.cardNo] = {
      attack: card.attack ?? null,
      defense: card.defense ?? null,
      cost: card.cost ?? null,
      keywords: card.keywords || [],
      cardType: card.cardType || card.type || "follower",
      name: card.name,
      reprintOf: card.reprintOf || undefined,
    };
  }
  fs.writeFileSync(OUTPUT, JSON.stringify(stats));
  console.log(`Wrote ${OUTPUT} (${Object.keys(stats).length} cards)`);
}

main();
