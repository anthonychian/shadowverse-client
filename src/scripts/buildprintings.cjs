#!/usr/bin/env node

/**
 * Builds src/decks/cardPrintings.json — the per-PRINTING dataset the deck
 * builder uses when "Exclude duplicates" is turned OFF (to reveal every
 * set/rarity/alt-art a card was printed in).
 *
 * For each set it prefers <SET>-printings.json (the full, no-dedup scrape that
 * includes alt-art Ultimate/Special/Super-Legend/Premium/Promo versions) and
 * falls back to the deduped <SET>-cards.json. Entries are keyed/de-duped by card
 * NUMBER, so a card bundled into more than one expansion's search results is
 * counted once. Tokens are excluded: they're never shown in the deck builder.
 *
 * The Game does not read this file; it only feeds the deck-builder pool view.
 *
 * Usage: node src/scripts/buildprintings.cjs
 */

const fs = require("fs");
const path = require("path");

const SCRIPTS_DIR = __dirname;
const DECKS_DIR = path.join(__dirname, "..", "decks");
const OUT = path.join(DECKS_DIR, "cardPrintings.json");

// Pick one source file per set: the full printings file if present, else the
// deduped cards file.
const all = fs.readdirSync(SCRIPTS_DIR);
const sets = new Set();
for (const f of all) {
  const m = f.match(/^(.*)-(?:cards|printings)\.json$/);
  if (m) sets.add(m[1]);
}
const files = [];
for (const s of [...sets].sort()) {
  files.push(all.includes(`${s}-printings.json`) ? `${s}-printings.json` : `${s}-cards.json`);
}

// "Gold / Premium" -> "Premium": collapse a composite rarity to its alt-art
// tier so it filters/displays as that tier; plain rarities pass through.
function normRarity(r) {
  if (!r) return "";
  const parts = r.split("/").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    return parts.find((p) => /Premium|Ultimate|Special|Promo|Super/i.test(p)) || parts[parts.length - 1];
  }
  return r;
}

const byNo = {}; // card number -> printing (globally unique => natural de-dupe)
for (const f of files) {
  const cards = JSON.parse(fs.readFileSync(path.join(SCRIPTS_DIR, f), "utf8"));
  for (const c of cards) {
    if (!c.cardNo || !c.name) continue;
    if (c.type === "token" || c.name.endsWith(" TOKEN")) continue; // never in the builder
    const dc = c.details || {};
    if ((dc.cardType || "").toLowerCase().includes("leader")) continue; // leaders aren't deckable
    if (byNo[c.cardNo]) continue;
    const d = c.details || {};
    byNo[c.cardNo] = {
      name: c.name,
      cardNo: c.cardNo,
      set: c.cardNo.split("-")[0], // e.g. "BP01"
      class: c.class || "",
      type: c.type || "base", // base | evolved
      cardType: d.cardType || "",
      trait: d.trait || "",
      rarity: normRarity(d.rarity || ""),
      cardSet: d.cardSet || "",
      cost: d.cost != null ? String(d.cost) : "",
      attack: d.attack != null ? String(d.attack) : "",
      defense: d.defense != null ? String(d.defense) : "",
    };
  }
}

const list = Object.values(byNo).sort(
  (a, b) =>
    a.name.localeCompare(b.name) ||
    a.cardNo.localeCompare(b.cardNo, undefined, { numeric: true })
);

fs.writeFileSync(OUT, JSON.stringify(list, null, 2));

const seen = new Set();
const dupNames = new Set();
for (const p of list) {
  if (seen.has(p.name)) dupNames.add(p.name);
  seen.add(p.name);
}
const byRarity = {};
for (const p of list) byRarity[p.rarity || "(none)"] = (byRarity[p.rarity || "(none)"] || 0) + 1;
console.log(`Printings written: ${list.length} (${seen.size} unique names) -> ${OUT}`);
console.log(`Names with >1 printing: ${dupNames.size}`);
console.log(`Rarity breakdown:`, byRarity);
