#!/usr/bin/env node

/**
 * Shadowverse Evolve Card Code Generator
 *
 * Reads a JSON file of card data (from the scraper or manually created)
 * and updates AllCards.js, AllCardsEvo.js, AllTokens.js, and getCards.js.
 *
 * Usage:
 *   node scripts/generate-card-files.js BP17
 *   node scripts/generate-card-files.js BP17 --dry-run    # preview without writing
 *   node scripts/generate-card-files.js BP17 --set-number 17
 *
 * Input JSON format (scripts/BP17-cards.json):
 * [
 *   { "cardNo": "BP17-001EN", "name": "Card Name", "type": "base", "class": "forest" },
 *   { "cardNo": "BP17-002EN", "name": "Card Name Evolved", "type": "evolved", "class": "forest" },
 *   { "cardNo": "BP17-T01EN", "name": "Token Name TOKEN", "type": "token" }
 * ]
 *
 * Type is auto-detected from the name/cardNo if not provided:
 *   - Names ending in " Evolved" or " ADVANCED" → evolved
 *   - Card numbers containing "-T" → token
 *   - Everything else → base
 */

const fs = require("fs");
const path = require("path");

const EXPANSION = process.argv[2];
const DRY_RUN = process.argv.includes("--dry-run");

if (!EXPANSION) {
  console.error("Usage: node scripts/generate-card-files.js <EXPANSION> [--dry-run]");
  console.error("Example: node scripts/generate-card-files.js BP17");
  process.exit(1);
}

const setNumberArg = process.argv.indexOf("--set-number");
const SET_NUMBER = setNumberArg !== -1 ? process.argv[setNumberArg + 1] : EXPANSION.replace(/\D/g, "");

// Optional human-readable set name. When provided, the deck-builder UI
// (CreateDeck.js) is wired up too (import + filter case + menu item).
const nameArg = process.argv.indexOf("--name");
const DISPLAY_NAME = nameArg !== -1 ? process.argv[nameArg + 1] : null;

const SCRIPTS_DIR = __dirname;
const SRC_DIR = path.join(__dirname, "..", "decks");
const JSON_FILE = path.join(SCRIPTS_DIR, `${EXPANSION}-cards.json`);

if (!fs.existsSync(JSON_FILE)) {
  console.error(`Card data file not found: ${JSON_FILE}`);
  console.error(`\nYou can create it manually or run the scraper first:`);
  console.error(`  node scripts/scrape-cards.js ${EXPANSION}`);
  console.error(`\nOr create it by hand with this format:`);
  console.error(
    JSON.stringify(
      [
        { cardNo: `${EXPANSION}-001EN`, name: "Card Name", type: "base", class: "forest" },
        { cardNo: `${EXPANSION}-002EN`, name: "Card Name Evolved", type: "evolved", class: "forest" },
        { cardNo: `${EXPANSION}-T01EN`, name: "Token Name TOKEN", type: "token" },
      ],
      null,
      2
    )
  );
  process.exit(1);
}

const cards = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));

// Auto-classify cards if type is missing
cards.forEach((card) => {
  if (!card.type) {
    if (card.name.endsWith(" Evolved") || card.name.endsWith(" ADVANCED")) {
      card.type = "evolved";
    } else if (card.cardNo.includes("-T") || card.name.endsWith(" TOKEN")) {
      card.type = "token";
    } else {
      card.type = "base";
    }
  }
});

const baseCards = cards.filter((c) => c.type === "base");
const evoCards = cards.filter((c) => c.type === "evolved");
const tokenCards = cards.filter((c) => c.type === "token");

console.log(`Expansion: ${EXPANSION}`);
console.log(`Base cards: ${baseCards.length}`);
console.log(`Evolved cards: ${evoCards.length}`);
console.log(`Token cards: ${tokenCards.length}`);
console.log(`Total: ${cards.length}`);
if (DRY_RUN) console.log("(dry run - no files will be modified)\n");
else console.log("");

// --- Update AllCards.js ---
function updateAllCards() {
  const filePath = path.join(SRC_DIR, "AllCards.js");
  let content = fs.readFileSync(filePath, "utf8");

  // Only add names not already present (reprints/shared cards keep one entry).
  const isPresent = (name) => content.includes(`"${name}"`);
  const newBase = baseCards.filter((c) => !isPresent(c.name));

  // 1. Add new base card names at the TOP of the allCards array, so the newest
  //    set shows first in the deck-builder "All" view (which lists newest-first).
  if (newBase.length > 0) {
    const EOL = content.includes("\r\n") ? "\r\n" : "\n";
    const newCardEntries = newBase.map((c) => `  "${c.name}",`).join(EOL);
    content = content.replace(
      /(export const allCards = \[\r?\n)/,
      `$1${newCardEntries}${EOL}`
    );
  }

  // 2. Add a new set export (the full set membership), unless it already exists
  const setExists = new RegExp(`export const set${SET_NUMBER}\\s*=`).test(content);
  if (!setExists && baseCards.length > 0) {
    const setExport = `\nexport const set${SET_NUMBER} = [\n${baseCards.map((c) => `  "${c.name}",`).join("\n")}\n];\n`;
    const lastSetMatch = content.match(/export const set\d+ = \[[\s\S]*?\];\n/g);
    if (lastSetMatch) {
      const lastSet = lastSetMatch[0];
      const lastSetIndex = content.lastIndexOf(lastSet) + lastSet.length;
      content = content.slice(0, lastSetIndex) + setExport + content.slice(lastSetIndex);
    } else {
      content += setExport;
    }
  }

  // 3. Add cards to class arrays if class info is available
  const classMappings = {
    forestcraft: "forest",
    swordcraft: "sword",
    runecraft: "rune",
    dragoncraft: "dragon",
    abysscraft: "abyss",
    havencraft: "haven",
    neutral: "neutral",
    forest: "forest",
    sword: "sword",
    rune: "rune",
    dragon: "dragon",
    abyss: "abyss",
    haven: "haven",
  };

  const byClass = {};
  newBase.forEach((c) => {
    if (c.class) {
      const normalized = classMappings[c.class.toLowerCase()] || c.class.toLowerCase();
      if (!byClass[normalized]) byClass[normalized] = [];
      byClass[normalized].push(c.name);
    }
  });

  const unmappedClasses = new Set();
  for (const [cls, names] of Object.entries(byClass)) {
    const pattern = new RegExp(`(export const ${cls} = \\[[\\s\\S]*?)(^\\];)`, "m");
    const match = content.match(pattern);
    if (match) {
      const entries = names.map((n) => `  "${n}",`).join("\n");
      content = content.replace(pattern, `$1\n${entries}\n$2`);
    } else {
      unmappedClasses.add(cls);
    }
  }
  if (unmappedClasses.size > 0) {
    console.log(`AllCards.js: WARNING no class array for: ${[...unmappedClasses].join(", ")} (cards still added to allCards/set, but not to a class filter)`);
  }

  if (DRY_RUN) {
    console.log("AllCards.js: Would add", newBase.length, "new base cards (", baseCards.length - newBase.length, "already present)");
  } else {
    fs.writeFileSync(filePath, content);
    console.log("AllCards.js: Updated with", newBase.length, "new base cards (", baseCards.length - newBase.length, "already present)");
  }
}

// --- Update AllCardsEvo.js ---
function updateAllCardsEvo() {
  const filePath = path.join(SRC_DIR, "AllCardsEvo.js");
  let content = fs.readFileSync(filePath, "utf8");

  if (evoCards.length === 0) {
    console.log("AllCardsEvo.js: No evolved cards to add.");
    return;
  }

  const isPresent = (name) => content.includes(`"${name}"`);
  const newEvo = evoCards.filter((c) => !isPresent(c.name));

  // Add new evolved names at the TOP of the allCardsEvo array (newest-first).
  if (newEvo.length > 0) {
    const EOL = content.includes("\r\n") ? "\r\n" : "\n";
    const newEntries = newEvo.map((c) => `  "${c.name}",`).join(EOL);
    content = content.replace(
      /(export const allCardsEvo = \[\r?\n)/,
      `$1${newEntries}${EOL}`
    );
  }

  // Add set-specific evo export (full set membership), unless it already exists
  const setEvoExists = new RegExp(`export const set${SET_NUMBER}Evo\\s*=`).test(content);
  if (!setEvoExists) {
    const setEvoExport = `\nexport const set${SET_NUMBER}Evo = [\n${evoCards.map((c) => `  "${c.name}",`).join("\n")}\n];\n`;
    const lastEvoSetMatch = content.match(/export const set\d+Evo = \[[\s\S]*?\];\n/g);
    if (lastEvoSetMatch) {
      const lastSet = lastEvoSetMatch[0];
      const lastSetIndex = content.lastIndexOf(lastSet) + lastSet.length;
      content = content.slice(0, lastSetIndex) + setEvoExport + content.slice(lastSetIndex);
    } else {
      content += setEvoExport;
    }
  }

  // Add to class evo arrays
  const classMappings = {
    forestcraft: "forestEvo",
    swordcraft: "swordEvo",
    runecraft: "runeEvo",
    dragoncraft: "dragonEvo",
    abysscraft: "abyssEvo",
    havencraft: "havenEvo",
    neutral: "neutralEvo",
    forest: "forestEvo",
    sword: "swordEvo",
    rune: "runeEvo",
    dragon: "dragonEvo",
    abyss: "abyssEvo",
    haven: "havenEvo",
  };

  const byClass = {};
  newEvo.forEach((c) => {
    if (c.class) {
      const normalized = classMappings[c.class.toLowerCase()];
      if (normalized) {
        if (!byClass[normalized]) byClass[normalized] = [];
        byClass[normalized].push(c.name);
      }
    }
  });

  for (const [cls, names] of Object.entries(byClass)) {
    const pattern = new RegExp(`(export const ${cls} = \\[[\\s\\S]*?)(^\\];)`, "m");
    const match = content.match(pattern);
    if (match) {
      const entries = names.map((n) => `  "${n}",`).join("\n");
      content = content.replace(pattern, `$1\n${entries}\n$2`);
    }
  }

  if (DRY_RUN) {
    console.log("AllCardsEvo.js: Would add", newEvo.length, "new evolved cards (", evoCards.length - newEvo.length, "already present)");
  } else {
    fs.writeFileSync(filePath, content);
    console.log("AllCardsEvo.js: Updated with", newEvo.length, "new evolved cards (", evoCards.length - newEvo.length, "already present)");
  }
}

// --- Update AllTokens.js ---
function updateAllTokens() {
  const filePath = path.join(SRC_DIR, "AllTokens.js");
  let content = fs.readFileSync(filePath, "utf8");

  if (tokenCards.length === 0) {
    console.log("AllTokens.js: No token cards to add.");
    return;
  }

  const isPresent = (name) => content.includes(`"${name}"`);
  const newTokens = tokenCards.filter((c) => !isPresent(c.name));

  if (newTokens.length === 0) {
    console.log("AllTokens.js: All tokens already present, skipping.");
    return;
  }

  const newEntries = newTokens.map((c) => `  "${c.name}",`).join("\n");
  content = content.replace(
    /^(export const allTokens = \[[\s\S]*?)(^\];)/m,
    `$1\n${newEntries}\n$2`
  );

  if (DRY_RUN) {
    console.log("AllTokens.js: Would add", newTokens.length, "new token cards (", tokenCards.length - newTokens.length, "already present)");
  } else {
    fs.writeFileSync(filePath, content);
    console.log("AllTokens.js: Updated with", newTokens.length, "new token cards (", tokenCards.length - newTokens.length, "already present)");
  }
}

// --- Update getCards.js ---
function updateGetCards() {
  const filePath = path.join(SRC_DIR, "getCards.js");
  let content = fs.readFileSync(filePath, "utf8");

  // Skip names that already have a case (reprints/shared tokens) to avoid
  // duplicate switch labels.
  const newCards = cards.filter((c) => !content.includes(`case "${c.name}":`));

  if (newCards.length === 0) {
    console.log("getCards.js: All cards already mapped, skipping.");
    return;
  }

  // Build new switch cases for the new cards
  const newCases = newCards
    .map((c) => {
      return `    case "${c.name}":\n      return "../textures/${c.cardNo}.png";`;
    })
    .join("\n");

  // Insert before the default case
  content = content.replace(
    /(\s*default:\s*\n\s*return "";)/,
    `\n${newCases}\n$1`
  );

  if (DRY_RUN) {
    console.log("getCards.js: Would add", newCards.length, "new switch cases (", cards.length - newCards.length, "already present)");
  } else {
    fs.writeFileSync(filePath, content);
    console.log("getCards.js: Updated with", newCards.length, "new card image mappings (", cards.length - newCards.length, "already present)");
  }
}

// --- Update CreateDeck.js (deck-builder UI) ---
// Wires the set into the imports, the class-filter switch, and the set menu.
// Requires a display name (--name); without one, prints the snippets to add.
function updateCreateDeck() {
  const filePath = path.join(__dirname, "..", "pages", "CreateDeck.js");
  if (!fs.existsSync(filePath)) {
    console.log("CreateDeck.js: not found, skipping UI wiring.");
    return;
  }
  const setName = `set${SET_NUMBER}`;
  const evoName = `set${SET_NUMBER}Evo`;
  const label = `set ${SET_NUMBER}`;

  if (!DISPLAY_NAME) {
    console.log(
      `\nCreateDeck.js: no --name given, leaving UI untouched. To wire it up, add:\n` +
        `  - import { ${setName} } from "../decks/AllCards" and { ${evoName} } from "../decks/AllCardsEvo"\n` +
        `  - case "${label}": return ${setName};   and   case "${label} evo": return ${evoName};\n` +
        `  - <MenuItem value={"${label}"}>YOUR SET NAME</MenuItem>`
    );
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const EOL = content.includes("\r\n") ? "\r\n" : "\n"; // CreateDeck.js uses CRLF

  if (content.includes(`case "${label}":`)) {
    console.log(`CreateDeck.js: "${label}" already wired, skipping.`);
    return;
  }

  // Anchors use \r?\n so they match regardless of line endings; inserts reuse EOL.
  const steps = [
    {
      what: `import ${setName}`,
      re: /(import \{\r?\n\s*allCards,\r?\n)/,
      ins: `  ${setName},${EOL}`,
    },
    {
      what: `import ${evoName}`,
      re: /(import \{\r?\n\s*allCardsEvo,\r?\n)/,
      ins: `  ${evoName},${EOL}`,
    },
    {
      what: `filter case "${label}"`,
      re: /(const getCardsFromName = \(name\) => \{\r?\n\s*switch \(name\) \{\r?\n)/,
      ins: `      case "${label}":${EOL}        return ${setName};${EOL}`,
    },
    {
      what: `filter case "${label} evo"`,
      re: /(      case "set 1":\r?\n        return set1;\r?\n)/,
      ins: `      case "${label} evo":${EOL}        return ${evoName};${EOL}`,
    },
    {
      what: `menu item`,
      re: /(<MenuItem value=\{"all"\}>All<\/MenuItem>\r?\n)/,
      ins: `                <MenuItem value={"${label}"}>${DISPLAY_NAME}</MenuItem>${EOL}`,
    },
  ];

  const missing = [];
  for (const s of steps) {
    if (s.re.test(content)) content = content.replace(s.re, `$1${s.ins}`);
    else missing.push(s.what);
  }

  if (missing.length > 0) {
    console.log(`CreateDeck.js: WARNING could not place: ${missing.join(", ")} (anchor not found). No changes written - wire these manually.`);
    return;
  }

  if (DRY_RUN) {
    console.log(`CreateDeck.js: Would wire "${label}" (${DISPLAY_NAME}).`);
  } else {
    fs.writeFileSync(filePath, content);
    console.log(`CreateDeck.js: Wired "${label}" as "${DISPLAY_NAME}".`);
  }
}

// Run all updates
updateAllCards();
updateAllCardsEvo();
updateAllTokens();
updateGetCards();
updateCreateDeck();

if (DRY_RUN) {
  console.log("\nDry run complete. Run without --dry-run to apply changes.");
} else {
  console.log("\nAll files updated successfully!");
  console.log("Verify changes with: git diff src/decks/ src/pages/CreateDeck.js");
}
