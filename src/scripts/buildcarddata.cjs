#!/usr/bin/env node

/**
 * Builds the runtime card-metadata lookup used by the deck builder UI.
 *
 * Merges every src/scripts/<SET>-cards.json (scraper output) into a single map
 * keyed by card NAME -> { class, type, cardType, trait, rarity, cost, attack,
 * defense, effect, cardSet }, and writes it to src/decks/cardData.json so the
 * React app can `import cardData from "../decks/cardData.json"`.
 *
 * Also copies the keyword-icon manifest (icons.json) into src/decks/ so the app
 * can import it from within src/ (CRA only bundles files under src/).
 *
 * Usage: node src/scripts/buildcarddata.cjs
 *
 * Cards are keyed by name (matching how AllCards.js / getCards.js key cards).
 * On duplicate names (reprints across sets) we keep the most complete entry
 * (one that actually has a rarity + effect).
 */

const fs = require("fs");
const path = require("path");

const SCRIPTS_DIR = __dirname;
const DECKS_DIR = path.join(__dirname, "..", "decks");
const OUT_JSON = path.join(DECKS_DIR, "cardData.json");
const ICONS_SRC = path.join(SCRIPTS_DIR, "icons.json");
const ICONS_OUT = path.join(DECKS_DIR, "icons.json");

const files = fs
  .readdirSync(SCRIPTS_DIR)
  .filter((f) => /-cards\.json$/.test(f))
  .sort();

if (files.length === 0) {
  console.error("No <SET>-cards.json files found in", SCRIPTS_DIR);
  process.exit(1);
}

// When a card has several printings, keep the most representative one. Prefer a
// regular-rarity printing (Bronze/Silver/Gold/Legendary) over alt-art reprints
// (Premium/Special/Ultimate/Promo), so a card's default set + rarity reflect its
// normal release rather than a promo/foil. Effect text breaks ties.
const RARITY_PREF = {
  Bronze: 6, Silver: 6, Gold: 6, Legendary: 6,
  Premium: 4, Special: 3, Ultimate: 3, Promo: 2,
};
const completeness = (d) => {
  if (!d) return -1;
  const rar = RARITY_PREF[d.rarity] != null ? RARITY_PREF[d.rarity] : d.rarity ? 1 : 0;
  return rar * 2 + (d.effect ? 1 : 0);
};

const byName = {};
let total = 0;
for (const f of files) {
  const cards = JSON.parse(fs.readFileSync(path.join(SCRIPTS_DIR, f), "utf8"));
  for (const c of cards) {
    if (!c.name) continue;
    const d = c.details || {};
    // Leader cards aren't deckable and are excluded from the builder data.
    if ((d.cardType || "").toLowerCase().includes("leader")) continue;
    total++;
    const rec = {
      class: c.class || "",
      type: c.type || "", // base | evolved | token
      cardType: d.cardType || "",
      trait: d.trait || "",
      rarity: d.rarity || "",
      cost: d.cost != null ? String(d.cost) : "",
      attack: d.attack != null ? String(d.attack) : "",
      defense: d.defense != null ? String(d.defense) : "",
      effect: d.effect || "",
      cardSet: d.cardSet || "",
    };
    const existing = byName[c.name];
    if (!existing || completeness(rec) > completeness(existing)) {
      byName[c.name] = rec;
    }
  }
}

// Stable, sorted output for clean diffs.
const sorted = {};
for (const name of Object.keys(byName).sort()) sorted[name] = byName[name];

fs.writeFileSync(OUT_JSON, JSON.stringify(sorted, null, 2));

if (fs.existsSync(ICONS_SRC)) {
  fs.copyFileSync(ICONS_SRC, ICONS_OUT);
}

const names = Object.keys(sorted);
const byRarity = {};
for (const n of names) {
  const r = sorted[n].rarity || "(none)";
  byRarity[r] = (byRarity[r] || 0) + 1;
}
console.log(`Merged ${total} card records from ${files.length} files.`);
console.log(`Unique names written: ${names.length} -> ${OUT_JSON}`);
console.log(`Rarity breakdown:`, byRarity);
if (fs.existsSync(ICONS_OUT)) console.log(`Copied icon manifest -> ${ICONS_OUT}`);
