#!/usr/bin/env node
/**
 * Backfill promo / alt-art entries in cards.json with gameplay data from the
 * richest printing that shares the same card identity name.
 *
 * Usage: node src/scripts/backfill-reprints.js
 */
const fs = require("fs");
const path = require("path");
const { applyReprintInheritance, cardIdentityKey } = require("./scrape-utils");

const CARDS_DB = path.join(__dirname, "..", "..", "packages", "sve-engine", "data", "cards.json");

function main() {
  const cards = JSON.parse(fs.readFileSync(CARDS_DB, "utf8"));
  const all = Object.values(cards).filter((c) => c && c.cardNo);
  const byExpansion = new Map();
  for (const card of all) {
    const exp = card.cardNo.split("-")[0];
    if (!byExpansion.has(exp)) byExpansion.set(exp, []);
    byExpansion.get(exp).push(card);
  }

  const updated = {};
  let inherited = 0;
  for (const [exp, group] of byExpansion.entries()) {
    const fixed = applyReprintInheritance(group, exp);
    for (const card of fixed) {
      updated[card.cardNo] = card;
      if (card.reprintOf) inherited++;
    }
  }

  for (const card of all) {
    if (!updated[card.cardNo]) updated[card.cardNo] = card;
  }

  for (const card of Object.values(updated)) {
    if (!card.reprintOf) continue;
    const source = updated[card.reprintOf];
    if (!source || cardIdentityKey(card) !== cardIdentityKey(source)) {
      delete card.reprintOf;
    }
  }

  fs.writeFileSync(CARDS_DB, JSON.stringify(updated, null, 2));
  console.log(`Updated ${CARDS_DB}`);
  console.log(`  Total cards: ${Object.keys(updated).length}`);
  console.log(`  Promo/alt inherited gameplay: ${inherited}`);

  require("./sync-card-stats");
}

main();
