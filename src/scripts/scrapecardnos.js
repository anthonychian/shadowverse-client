#!/usr/bin/env node
/**
 * Scrape specific card numbers (detail pages) and merge into cards.json.
 *
 * Usage:
 *   node src/scripts/scrapecardnos.js BP14-018EN BP14-019EN ...
 *   node src/scripts/scrapecardnos.js --file src/scripts/deck-lists/festive-sword.json
 */
const fs = require("fs");
const path = require("path");

const {
  fetchDetail,
  normalizeCardType,
  normalizeIdentityName,
  CLASS_MAP,
  applyReprintInheritance,
} = require("./scrape-utils");

const CARDS_DB = path.join(__dirname, "..", "..", "packages", "sve-engine", "data", "cards.json");
const OUTPUT_JSON = path.join(__dirname, "deck-scraped-cards.json");

function cardNosFromDeckFile(filePath) {
  const deck = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const nos = new Set();
  for (const zone of [deck.mainDeck, deck.evoDeck]) {
    if (!zone) continue;
    for (const cardNo of Object.keys(zone)) nos.add(cardNo);
  }
  return [...nos];
}

function evolvePairsFromDeckFiles(filePaths) {
  const pairs = [];
  for (const filePath of filePaths) {
    const deck = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const main = Object.keys(deck.mainDeck || {});
    const evo = Object.keys(deck.evoDeck || {});
    for (const evoNo of evo) {
      const evoName = deck.evoDeck[evoNo]?.name || "";
      const baseName = evoName.replace(/\s*\(Evolved\)\s*$/i, "").trim();
      const baseNo = main.find((no) => {
        const n = deck.mainDeck[no]?.name || "";
        return normalizeIdentityName(n) === normalizeIdentityName(baseName);
      });
      if (baseNo) pairs.push([baseNo, evoNo]);
    }
  }
  return pairs;
}

const TOKEN_CARD_NOS = [
  "BP14-T01EN",
  "BP14-T02EN",
  "BP12-T10EN",
  "BP17-T17EN",
  "BP17-T18EN",
];

function parseArgs() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  if (fileIdx >= 0) {
    const files = args.slice(fileIdx + 1).filter((a) => !a.startsWith("--"));
    const nos = new Set();
    for (const f of files) {
      for (const no of cardNosFromDeckFile(path.resolve(f))) nos.add(no);
    }
    return [...nos];
  }
  return args.filter((a) => !a.startsWith("--"));
}

async function scrapeCardNo(cardNo) {
  const detail = await fetchDetail(cardNo);
  const baseName = detail.name || cardNo;
  const ct = (detail.cardType || "").toLowerCase();
  const isToken = cardNo.includes("-T") || ct.includes("token");
  const isEvolved = ct.includes("evolved");

  let name = baseName;
  if (isEvolved) name += " Evolved";
  if (isToken) name += " TOKEN";

  const type = isToken ? "token" : isEvolved ? "evolved" : "base";
  const cls = CLASS_MAP[(detail.cls || "").toLowerCase()] || "";
  const specialType = isToken
    ? "token"
    : isEvolved
      ? "evolved"
      : ct.includes("advanced")
        ? "advanced"
        : undefined;

  return {
    cardNo,
    name,
    type,
    cardType: detail.cardTypeNormalized || normalizeCardType(detail.cardType),
    specialType,
    class: cls,
    traits: detail.traits || [],
    cost: detail.cost,
    attack: detail.attack,
    defense: detail.defense,
    cardText: detail.cardText || "",
    keywords: detail.keywords || [],
    rarity: detail.rarity || "",
    format: detail.format || "",
    relatedCardNos: detail.relatedCardNos || [],
    imgSrc: `/wordpress/wp-content/images/cardlist/${cardNo.split("-")[0]}/${cardNo}.png`,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  const deckFiles =
    fileIdx >= 0 ? args.slice(fileIdx + 1).filter((a) => !a.startsWith("--")) : [];
  let cardNos = parseArgs();
  for (const t of TOKEN_CARD_NOS) {
    if (!cardNos.includes(t)) cardNos.push(t);
  }
  if (cardNos.length === 0) {
    console.error("Usage: node scrapecardnos.js <cardNo> ... | --file deck.json");
    process.exit(1);
  }

  console.log(`Scraping ${cardNos.length} cards...\n`);
  const scraped = {};
  for (let i = 0; i < cardNos.length; i++) {
    const cardNo = cardNos[i];
    try {
      scraped[cardNo] = await scrapeCardNo(cardNo);
      console.log(`  [${i + 1}/${cardNos.length}] ${cardNo} — ${scraped[cardNo].name}`);
    } catch (err) {
      console.error(`  [${i + 1}/${cardNos.length}] ${cardNo} FAILED: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  // Link base ↔ evolved by matching identity name on related cards.
  const byCardNo = new Map(Object.entries(scraped));
  for (const card of Object.values(scraped)) {
    if (card.type !== "base") continue;
    const baseName = normalizeIdentityName(card.name);
    const evo = card.relatedCardNos
      ?.map((no) => byCardNo.get(no))
      .find((c) => c && c.type === "evolved" && normalizeIdentityName(c.name) === baseName);
    if (evo) {
      card.evolvesTo = evo.cardNo;
      evo.evolvesFrom = card.cardNo;
    }
  }
  for (const card of Object.values(scraped)) {
    if (card.type !== "evolved") continue;
    const evoName = normalizeIdentityName(card.name);
    const base = card.relatedCardNos
      ?.map((no) => byCardNo.get(no))
      .find((c) => c && c.type === "base" && normalizeIdentityName(c.name) === evoName);
    if (base) {
      card.evolvesFrom = base.cardNo;
      if (!base.evolvesTo) base.evolvesTo = card.cardNo;
    }
  }

  // Deck-list evolve pairs override related-card guesses (e.g. ultimate printings).
  const deckPairs = deckFiles.map((f) => path.resolve(f));
  for (const [baseNo, evoNo] of evolvePairsFromDeckFiles(deckPairs)) {
    const base = scraped[baseNo];
    const evo = scraped[evoNo];
    if (!base || !evo) continue;
    base.evolvesTo = evoNo;
    evo.evolvesFrom = baseNo;
  }

  const expansion = cardNos[0]?.split("-")[0] || "";
  const inherited = applyReprintInheritance(Object.values(scraped), expansion);
  const inheritedByNo = Object.fromEntries(inherited.map((c) => [c.cardNo, c]));

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(inherited, null, 2));
  console.log(`\nWrote ${OUTPUT_JSON}`);

  const existing = fs.existsSync(CARDS_DB)
    ? JSON.parse(fs.readFileSync(CARDS_DB, "utf8"))
    : {};
  const merged = { ...existing, ...inheritedByNo };
  fs.writeFileSync(CARDS_DB, JSON.stringify(merged, null, 2));
  console.log(`Merged ${Object.keys(scraped).length} cards into ${CARDS_DB}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
