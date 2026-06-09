#!/usr/bin/env node

/**
 * Shadowverse Evolve Card Scraper
 *
 * Scrapes card data and images from en.shadowverse-evolve.com for a given expansion.
 * Uses the site's static, server-rendered "text view" pages, so it only needs
 * Node 18+ (global fetch). No browser / Puppeteer required.
 *
 * Usage:
 *   node src/scripts/scrapecards.js BP17
 *   node src/scripts/scrapecards.js BP17 --no-images   # skip image download
 *   node src/scripts/scrapecards.js BP17 --json-only    # only output JSON, no images
 *
 * Output: src/scripts/<EXPANSION>-cards.json, plus images in public/textures/.
 * Then run: node src/scripts/generatecardfiles.js <EXPANSION>
 *
 * Notes on the data model (matches how the deck files are keyed):
 *   - Evolved followers share their base name on the site (Card Type "Follower / Evolved").
 *     We append " Evolved" so they get a distinct name + their own image mapping.
 *   - Tokens (card numbers like BP17-T01EN) get a " TOKEN" suffix.
 *   - Ultimate (U##) and Special (SP##) cards are alternate-art reprints of cards
 *     already in the set. Since the app keys images by card NAME, including them
 *     would create duplicate entries, so we skip any whose name already appears.
 *     (If a U/SP card has a unique name, it is kept.)
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const EXPANSION = process.argv[2];
const SKIP_IMAGES = process.argv.includes("--no-images");
const JSON_ONLY = process.argv.includes("--json-only");

if (!EXPANSION) {
  console.error("Usage: node src/scripts/scrapecards.js <EXPANSION> [--no-images] [--json-only]");
  console.error("Example: node src/scripts/scrapecards.js BP17");
  process.exit(1);
}

const BASE_URL = "https://en.shadowverse-evolve.com";
const listUrl = (page) =>
  `${BASE_URL}/cards/searchresults/?expansion=${EXPANSION}&view=text&page=${page}`;
const detailUrl = (cardNo) => `${BASE_URL}/cards/?cardno=${cardNo}&view=text`;
const TEXTURES_DIR = path.join(__dirname, "..", "..", "public", "textures");
const OUTPUT_JSON = path.join(__dirname, `${EXPANSION}-cards.json`);

const {
  applyReprintInheritance,
  isCanonicalSlot,
  cardIdentityKey,
} = require("./scrape-utils");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Maps the site's "...craft" class label to the short keys used in the deck files.
const CLASS_MAP = {
  forestcraft: "forest",
  swordcraft: "sword",
  runecraft: "rune",
  dragoncraft: "dragon",
  abysscraft: "abyss",
  shadowcraft: "abyss",
  bloodcraft: "abyss",
  havencraft: "haven",
  portalcraft: "portal",
  neutral: "neutral",
};

function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .trim();
}

async function getHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, { headers: { "User-Agent": UA } }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close();
          fs.unlink(filepath, () => {});
          downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
          return;
        }
        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(filepath, () => {});
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

// Pull every card anchor off the paginated text-view list pages.
async function scrapeList() {
  const found = [];
  const seen = new Set();
  for (let page = 1; page <= 50; page++) {
    const html = await getHtml(listUrl(page));
    const anchors = html.match(/<a[^>]*cardno=[^>]*>[\s\S]*?<\/a>/gi) || [];
    if (anchors.length === 0) break;
    let newOnPage = 0;
    for (const a of anchors) {
      const cardNo = (a.match(/class="number">([^<]+)</) || [])[1];
      const name = decodeEntities((a.match(/class="ttl">([^<]+)</) || [])[1]);
      const imgSrc = (a.match(/<img[^>]*src="([^"]+)"/) || [])[1];
      if (!cardNo || seen.has(cardNo)) continue;
      seen.add(cardNo);
      found.push({ cardNo, listName: name, imgSrc });
      newOnPage++;
    }
    process.stdout.write(`  page ${page}: +${newOnPage} (total ${found.length})\r`);
    if (newOnPage === 0) break;
  }
  process.stdout.write("\n");
  return found;
}

const KEYWORD_ICON_MAP = {
  icon_fanfare: "fanfare",
  icon_lastwords: "lastWords",
  icon_evolve: "evolve",
  icon_quick: "quick",
  icon_ward: "ward",
  icon_storm: "storm",
  icon_rush: "rush",
  icon_assail: "assail",
  icon_intimidate: "intimidate",
  icon_drain: "drain",
  icon_bane: "bane",
  icon_aura: "aura",
  icon_on_evolve: "onEvolve",
  icon_on_super_evolve: "onSuperEvolve",
  icon_strike: "strike",
  icon_advanced: "advanced",
  icon_stack: "stack",
  icon_serve: "serve",
};

function parseDlField(html, label) {
  const re = new RegExp(`<dt>${label}<\\/dt><dd>([\\s\\S]*?)<\\/dd>`, "i");
  const m = html.match(re);
  if (!m) return "";
  return decodeEntities(m[1].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim());
}

function parseStats(html) {
  const cost = parseInt(
    (html.match(/status-Item-Cost[\s\S]*?heading-Cost[^<]*<\/span>(\d+)/) || [])[1],
    10,
  );
  const attack = parseInt(
    (html.match(/status-Item-Power[\s\S]*?heading-Power[^<]*<\/span>(\d+)/) || [])[1],
    10,
  );
  const defense = parseInt(
    (html.match(/status-Item-Hp[\s\S]*?heading-Hp[^<]*<\/span>(\d+)/) || [])[1],
    10,
  );
  return {
    cost: Number.isFinite(cost) ? cost : null,
    attack: Number.isFinite(attack) ? attack : null,
    defense: Number.isFinite(defense) ? defense : null,
  };
}

function parseCardText(html) {
  const detailMatch = html.match(/<div class="detail">([\s\S]*?)<\/div>/i);
  if (!detailMatch) return { text: "", keywords: [] };
  const block = detailMatch[1];
  const keywords = [];
  for (const [icon, keyword] of Object.entries(KEYWORD_ICON_MAP)) {
    if (block.includes(icon)) keywords.push(keyword);
  }
  const text = decodeEntities(
    block
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<img[^>]*alt="\[([^\]]+)\]"[^>]*>/gi, "[$1] ")
      .replace(/<img[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
  return { text, keywords: [...new Set(keywords)] };
}

function parseRelatedCards(html) {
  const relationBlock = html.match(/<div class="cardlist-Detail_Relation">([\s\S]*?)<\/div>\s*<div class="cardlist-Under">/i);
  if (!relationBlock) return [];
  const links = relationBlock[1].match(/cardno=([A-Z0-9-]+)/gi) || [];
  return [...new Set(links.map((l) => l.replace(/^cardno=/i, "")))];
}

function normalizeCardType(raw) {
  const ct = (raw || "").toLowerCase();
  if (ct.includes("leader")) return "leader";
  if (ct.includes("spell")) return "spell";
  if (ct.includes("amulet")) return "amulet";
  if (ct.includes("follower")) return "follower";
  return "follower";
}

async function fetchDetail(cardNo) {
  const html = await getHtml(detailUrl(cardNo));
  const name = decodeEntities((html.match(/<h1 class="ttl[^"]*">([^<]+)</) || [])[1]);
  const cls = decodeEntities((html.match(/<dt>Class<\/dt><dd>([^<]+)</) || [])[1]);
  const cardTypeRaw = decodeEntities((html.match(/<dt>Card Type<\/dt><dd>([^<]+)</) || [])[1]);
  const traitRaw = parseDlField(html, "Trait");
  const rarity = parseDlField(html, "Rarity");
  const format = parseDlField(html, "Format");
  const stats = parseStats(html);
  const { text, keywords } = parseCardText(html);
  const relatedCardNos = parseRelatedCards(html);
  const traits = traitRaw
    ? traitRaw
        .split("/")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  return {
    name,
    cls,
    cardType: cardTypeRaw,
    cardTypeNormalized: normalizeCardType(cardTypeRaw),
    traits,
    rarity,
    format,
    ...stats,
    cardText: text,
    keywords,
    relatedCardNos,
  };
}

async function scrapeCards() {
  console.log(`Scraping expansion: ${EXPANSION}`);
  console.log(`List URL: ${listUrl(1)}\n`);

  console.log("Collecting card list...");
  const listCards = await scrapeList();
  console.log(`Found ${listCards.length} cards in the list.\n`);

  if (listCards.length === 0) {
    console.error("No cards found. Is the expansion code correct (e.g. BP17)?");
    process.exit(1);
  }

  console.log("Fetching card details (class + type)...");
  const detailed = [];
  for (let i = 0; i < listCards.length; i++) {
    const c = listCards[i];
    let detail;
    try {
      detail = await fetchDetail(c.cardNo);
    } catch (err) {
      console.log(`\n  Warning: failed detail for ${c.cardNo}: ${err.message}`);
      detail = { name: c.listName, cls: "", cardType: "" };
    }
    const baseName = detail.name || c.listName;
    const ct = (detail.cardType || "").toLowerCase();
    const isToken = c.cardNo.includes("-T") || ct.includes("token");
    const isEvolved = ct.includes("evolved");

    let name = baseName;
    if (isEvolved) name += " Evolved";
    if (isToken) name += " TOKEN";

    const type = isToken ? "token" : isEvolved ? "evolved" : "base";
    const cls = CLASS_MAP[(detail.cls || "").toLowerCase()] || "";
    const specialType = isToken ? "token" : isEvolved ? "evolved" : ct.includes("advanced") ? "advanced" : undefined;

    detailed.push({
      cardNo: c.cardNo,
      name,
      type,
      cardType: detail.cardTypeNormalized,
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
      imgSrc: c.imgSrc,
    });
    process.stdout.write(`  [${i + 1}/${listCards.length}] ${c.cardNo}\r`);
  }
  process.stdout.write("\n");

  // Promo / alt-art printings (P, SL, U, SP, PR, SDD, …) inherit gameplay data from the
  // richest printing with the same identity name so every card number works in the engine.
  const allCards = applyReprintInheritance(detailed, EXPANSION);
  const inheritedCount = allCards.filter((c) => c.reprintOf).length;

  // Deck name lists use one entry per identity; prefer plain numbered slots.
  const ordered = [
    ...allCards.filter((c) => isCanonicalSlot(c.cardNo, EXPANSION)),
    ...allCards.filter((c) => !isCanonicalSlot(c.cardNo, EXPANSION)),
  ];

  const byIdentity = new Map();
  const skipped = [];
  const deduped = [];
  for (const c of ordered) {
    const identity = cardIdentityKey(c);
    if (byIdentity.has(identity)) {
      skipped.push(`${c.cardNo} (alt of ${byIdentity.get(identity)}: "${c.name}")`);
      continue;
    }
    byIdentity.set(identity, c.cardNo);
    deduped.push(c);
  }

  deduped.sort((a, b) => a.cardNo.localeCompare(b.cardNo, undefined, { numeric: true }));

  // Link base cards to their evolved forms via related-card section.
  const byCardNo = new Map(deduped.map((c) => [c.cardNo, c]));
  for (const card of deduped) {
    if (card.type === "base" && card.relatedCardNos?.length) {
      const evo = card.relatedCardNos
        .map((no) => byCardNo.get(no))
        .find((c) => c && c.type === "evolved");
      if (evo) {
        card.evolvesTo = evo.cardNo;
        evo.evolvesFrom = card.cardNo;
      }
    }
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(deduped, null, 2));

  const CARDS_DB = path.join(__dirname, "..", "..", "packages", "sve-engine", "data", "cards.json");
  const cardsDbDir = path.dirname(CARDS_DB);
  if (!fs.existsSync(cardsDbDir)) fs.mkdirSync(cardsDbDir, { recursive: true });

  let merged = {};
  if (fs.existsSync(CARDS_DB)) {
    merged = JSON.parse(fs.readFileSync(CARDS_DB, "utf8"));
  }
  for (const card of allCards) {
    merged[card.cardNo] = card;
  }
  fs.writeFileSync(CARDS_DB, JSON.stringify(merged, null, 2));
  console.log(`Merged into canonical DB: ${CARDS_DB} (${Object.keys(merged).length} cards)`);

  const byClass = {};
  for (const c of deduped) byClass[c.class || "(none)"] = (byClass[c.class || "(none)"] || 0) + 1;

  console.log(`\nCard data saved to: ${OUTPUT_JSON}`);
  console.log(`  Base cards:    ${deduped.filter((c) => c.type === "base").length}`);
  console.log(`  Evolved cards: ${deduped.filter((c) => c.type === "evolved").length}`);
  console.log(`  Token cards:   ${deduped.filter((c) => c.type === "token").length}`);
  console.log(`  Total kept:    ${deduped.length}`);
  console.log(`  Class breakdown:`, byClass);
  if (inheritedCount) {
    console.log(`  Inherited gameplay data for ${inheritedCount} promo/alt-art printings.`);
  }
  if (skipped.length) {
    console.log(`  Skipped ${skipped.length} duplicate names in deck export (all kept in cards.json).`);
  }

  if (JSON_ONLY || SKIP_IMAGES) {
    console.log(`\nDone (no images). Next: node src/scripts/generatecardfiles.js ${EXPANSION}`);
    return;
  }

  console.log("\nDownloading card images...");
  if (!fs.existsSync(TEXTURES_DIR)) fs.mkdirSync(TEXTURES_DIR, { recursive: true });

  let dl = 0;
  let exists = 0;
  let fail = 0;
  for (const card of deduped) {
    const filepath = path.join(TEXTURES_DIR, `${card.cardNo}.png`);
    if (fs.existsSync(filepath)) {
      exists++;
      continue;
    }
    const imgUrl = card.imgSrc
      ? card.imgSrc.startsWith("http")
        ? card.imgSrc
        : `${BASE_URL}${card.imgSrc}`
      : `${BASE_URL}/wordpress/wp-content/images/cardlist/${EXPANSION}/${card.cardNo}.png`;
    try {
      await downloadImage(imgUrl, filepath);
      dl++;
      process.stdout.write(`  downloaded ${card.cardNo}.png (${dl})\r`);
    } catch (err) {
      fail++;
      console.log(`\n  Failed ${card.cardNo}.png: ${err.message}`);
    }
  }
  process.stdout.write("\n");
  console.log(`Images: ${dl} downloaded, ${exists} already present, ${fail} failed.`);
  console.log(`\nDone! Now run: node src/scripts/generatecardfiles.js ${EXPANSION}`);
}

scrapeCards().catch((err) => {
  console.error("Scraper error:", err);
  process.exit(1);
});
