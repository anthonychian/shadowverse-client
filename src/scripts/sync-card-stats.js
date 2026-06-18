#!/usr/bin/env node
/**
 * Sync engine card data → src/engine/card-stats.json for the client UI.
 * Merges packages/sve-engine/data/cards.json with hand-authored deck overlays.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const CARDS_DB = path.join(ROOT, "packages", "sve-engine", "data", "cards.json");
const DECK_CARDS = path.join(ROOT, "packages", "sve-engine", "data", "card-defs", "deck-cards.json");
const SCRAPED = path.join(__dirname, "deck-scraped-cards.json");
const OUTPUT = path.join(__dirname, "..", "engine", "card-stats.json");

function entryFromCard(card) {
  return {
    attack: card.attack ?? null,
    defense: card.defense ?? null,
    cost: card.cost ?? null,
    keywords: card.keywords || [],
    cardType: card.cardType || card.type || "follower",
    name: card.name,
    reprintOf: card.reprintOf || undefined,
    evolveCost: card.evolveCost ?? undefined,
  };
}

function mergeOverlay(prev, def) {
  if (!def) return prev;
  return {
    attack: def.attack ?? prev.attack ?? null,
    defense: def.defense ?? prev.defense ?? null,
    cost: def.cost ?? prev.cost ?? null,
    keywords: def.keywords?.length ? def.keywords : prev.keywords || [],
    cardType: def.cardType || prev.cardType || "follower",
    name: def.name || prev.name,
    reprintOf: prev.reprintOf,
    evolveCost: def.evolveCost ?? prev.evolveCost,
  };
}

function main() {
  const cards = JSON.parse(fs.readFileSync(CARDS_DB, "utf8"));
  const stats = {};
  for (const card of Object.values(cards)) {
    if (!card?.cardNo) continue;
    stats[card.cardNo] = entryFromCard(card);
  }

  if (fs.existsSync(DECK_CARDS)) {
    const deck = JSON.parse(fs.readFileSync(DECK_CARDS, "utf8"));
    for (const [cardNo, def] of Object.entries(deck)) {
      stats[cardNo] = mergeOverlay(stats[cardNo] || {}, def);
    }
  }

  if (fs.existsSync(SCRAPED)) {
    const scraped = JSON.parse(fs.readFileSync(SCRAPED, "utf8"));
    for (const card of scraped) {
      if (!card?.cardNo) continue;
      const prev = stats[card.cardNo] || {
        attack: null,
        defense: null,
        cost: null,
        keywords: [],
        cardType: card.cardType || "follower",
      };
      stats[card.cardNo] = {
        ...prev,
        name: prev.name || card.name,
        attack: prev.attack ?? card.attack ?? null,
        defense: prev.defense ?? card.defense ?? null,
        cost: prev.cost ?? card.cost ?? null,
        cardType: prev.cardType || card.cardType || "follower",
        evolveCost: prev.evolveCost ?? parseEvolveCost(card.cardText),
      };
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(stats));
  console.log(`Wrote ${OUTPUT} (${Object.keys(stats).length} cards)`);
}

function parseEvolveCost(text) {
  const m = (text || "").match(/\[evolve\]\s*\[cost(\d+)\]/i);
  return m ? Number(m[1]) : undefined;
}

main();
