#!/usr/bin/env node

/**
 * Convert a translated card-list CSV into src/scripts/<SET>-cards.json — the
 * scrape-shaped dataset the rest of the pipeline consumes (buildprintings.cjs,
 * buildcarddata.cjs, generatecardfiles.js).
 *
 * Use this for upcoming sets that have no official EN scrape yet: the CSV (a
 * fan/early translation) is the data source instead of en.shadowverse-evolve.com.
 *
 * The CSV is the "transposed" community layout: one COLUMN per card, with these
 * ROW labels in column A — "English Name", "Card Number", "Class", "Card Type",
 * "Cost", "Stats", "Trait", "Rarity", "Card Text" (a "Notes" row is ignored).
 *
 * Usage:
 *   node src/scripts/csv-to-cards.js <SET> <csv-path> [--name "Display Name"]
 *   node src/scripts/csv-to-cards.js BP18 ./BP18.csv --name "Neometropolis"
 *
 * Options:
 *   --name "..."       Set display name -> details.cardSet = Booster Set "<name>"
 *   --card-set "..."   Override details.cardSet verbatim (for Starter/Showdown etc.)
 *   --dry-run          Print a summary; don't write the file
 *
 * Output matches BP17-cards.json: { cardNo, name, type, class, details:{ format,
 * class, cardType, trait, rarity, cardSet, cost, attack, defense, effect }, imgSrc }.
 */

const fs = require("fs");
const path = require("path");

const SET = process.argv[2];
const CSV_PATH = process.argv[3];
const DRY_RUN = process.argv.includes("--dry-run");

function optVal(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : null;
}
const DISPLAY_NAME = optVal("--name");
const CARD_SET = optVal("--card-set") || (DISPLAY_NAME ? `Booster Set "${DISPLAY_NAME}"` : "");

if (!SET || !CSV_PATH || SET.startsWith("--") || CSV_PATH.startsWith("--")) {
  console.error('Usage: node src/scripts/csv-to-cards.js <SET> <csv-path> [--name "Display Name"]');
  console.error('Example: node src/scripts/csv-to-cards.js BP18 ./BP18.csv --name "Neometropolis"');
  process.exit(1);
}
if (!fs.existsSync(CSV_PATH)) {
  console.error(`CSV not found: ${CSV_PATH}`);
  process.exit(1);
}

// Short class code (top-level) keyed by the CSV's full "<X>craft" name.
const CLASS_SHORT = {
  Forestcraft: "forest", Swordcraft: "sword", Runecraft: "rune",
  Dragoncraft: "dragon", Abysscraft: "abyss", Havencraft: "haven", Neutral: "neutral",
};
// Single-letter CSV rarity -> the full label the deck builder expects.
const RARITY = {
  L: "Legendary", G: "Gold", S: "Silver", B: "Bronze",
  Token: "-", U: "Ultimate", SP: "Special", PR: "Promo", SEP: "-",
};
const CRAFTS = ["Forestcraft", "Swordcraft", "Runecraft", "Dragoncraft", "Abysscraft", "Havencraft"];

// --- RFC4180-ish CSV parser (handles quoted, multi-line fields) ---
function parseCsv(t) {
  const rows = [];
  let row = [], field = "", i = 0, q = false;
  while (i < t.length) {
    const c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { field += '"'; i += 2; continue; } q = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { q = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  row.push(field); rows.push(row);
  return rows;
}

// --- prose card text -> bracket-token effect (matches the official scrape style) ---
function tokenizeEffect(raw) {
  let t = String(raw || "").replace(/\r\n/g, "\n");
  // stat icons
  t = t.replace(/🗡️?\s*\+\s*(\d+)/g, "[attack]+$1").replace(/🛡️?\s*\+\s*(\d+)/g, "[defense]+$1");
  t = t.replace(/\[attack\]\+(\d+)\s*\/\s*\[defense\]\+(\d+)/g, "[attack]+$1/[defense]+$2");
  // evolve cost
  t = t.replace(/Evolve \((\d+)\):\s*Evolve this\./g, (m, n) => `[evolve] [cost0${n}]: Evolve this.`);
  // keyword icons
  t = t.replace(/\bFanfare\b/g, "[fanfare]");
  t = t.replace(/\bLast Words\b/g, "[lastwords]");
  t = t.replace(/(^|\n|\. )Quick\./g, "$1[quick].");
  // activated-ability cost chains (leave "Activate only ..." restrictions as prose)
  t = t.replace(/\bActivate (?!only\b)/g, "[act] ");
  t = t.replace(/\bengage this\b/gi, "[engage]");
  t = t.replace(/\b(\d)PP\b/g, "[cost0$1]");
  // class-name icons
  t = t.replace(new RegExp(`\\b(${CRAFTS.join("|")})\\b`, "g"), (m) => `[${m.toLowerCase()}]`);
  // single-line, tidy whitespace
  t = t.replace(/\n+/g, " ").replace(/[ \t]+/g, " ").trim();
  return t;
}

const fixName = (n) => String(n || "").trim().replace(/\s*\(Evolved\)\s*$/, " Evolved");

// --- build ---
const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
const byLabel = {};
for (const r of rows) if (r.length) byLabel[(r[0] || "").trim()] = r;

const numRow = byLabel["Card Number"];
if (!numRow) {
  console.error('CSV has no "Card Number" row — is this the transposed community layout?');
  process.exit(1);
}
const get = (label, col) => {
  const r = byLabel[label];
  return r ? (r[col] || "").trim() : "";
};

const cards = [];
let skippedLeaders = 0;
for (let col = 1; col < numRow.length; col++) {
  const rawNo = (numRow[col] || "").trim();
  if (!rawNo) continue;
  const cardNo = rawNo.replace(/\s+/g, "") + "EN";
  const ctypeRaw = get("Card Type", col);
  // Leaders are never added (not deckable, not a Game card here) — skip entirely.
  if (ctypeRaw.toLowerCase().includes("leader")) { skippedLeaders++; continue; }
  const parts = ctypeRaw.split("/").map((s) => s.trim().toLowerCase());
  // Advanced (advanced-evolve) cards live in the evolve deck like evolved cards.
  const isAdvanced = parts.includes("advanced");
  const type =
    parts.includes("evolved") || isAdvanced ? "evolved" : parts.includes("token") ? "token" : "base";
  const cls = get("Class", col);
  const stats = get("Stats", col);
  const cost = get("Cost ", col) || get("Cost", col);
  const rarityRaw = get("Rarity", col);

  let name = fixName(get("English Name", col));
  // Advanced cards carry an internal " ADVANCED" marker (the app strips it for
  // display and uses it to register advanced-evolve cards); tokens use " TOKEN".
  if (isAdvanced && !/ ADVANCED$/.test(name)) name += " ADVANCED";
  else if (type === "token" && !/ TOKEN$/.test(name)) name += " TOKEN";

  cards.push({
    cardNo,
    name,
    type,
    class: CLASS_SHORT[cls] || cls.toLowerCase(),
    details: {
      format: "Any",
      class: cls,
      cardType: ctypeRaw,
      trait: get("Trait", col),
      rarity: RARITY[rarityRaw] !== undefined ? RARITY[rarityRaw] : rarityRaw,
      cardSet: CARD_SET,
      cost: cost && cost !== "-" ? cost : "-",
      attack: stats && stats !== "-" ? (stats.split("/")[0] || "-").trim() : "-",
      defense: stats && stats !== "-" ? (stats.split("/")[1] || "-").trim() : "-",
      effect: tokenizeEffect(get("Card Text", col)),
    },
    imgSrc: `/wordpress/wp-content/images/cardlist/${SET}/${cardNo}.png`,
  });
}

const byType = cards.reduce((m, c) => ((m[c.type] = (m[c.type] || 0) + 1), m), {});
console.log(`${SET}: parsed ${cards.length} cards from ${path.basename(CSV_PATH)} (${JSON.stringify(byType)})`);
if (skippedLeaders) console.log(`  Skipped ${skippedLeaders} Leader card(s) (never added).`);
if (!CARD_SET) console.log('  NOTE: no --name/--card-set given; details.cardSet left blank.');

const unknownRarity = [...new Set(cards.map((c) => c.details.rarity))].filter(
  (r) => r && !Object.values(RARITY).includes(r)
);
if (unknownRarity.length) console.log(`  NOTE: rarities passed through unchanged: ${unknownRarity.join(", ")}`);

const outPath = path.join(__dirname, `${SET}-cards.json`);
if (DRY_RUN) {
  console.log(`(dry run) would write ${cards.length} cards to ${outPath}`);
} else {
  fs.writeFileSync(outPath, JSON.stringify(cards, null, 2) + "\n");
  console.log(`Wrote ${outPath}`);
}
