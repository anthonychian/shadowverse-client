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

async function fetchDetail(cardNo) {
  const html = await getHtml(detailUrl(cardNo));
  const name = decodeEntities((html.match(/<h1 class="ttl[^"]*">([^<]+)</) || [])[1]);
  const cls = decodeEntities((html.match(/<dt>Class<\/dt><dd>([^<]+)</) || [])[1]);
  const cardType = decodeEntities((html.match(/<dt>Card Type<\/dt><dd>([^<]+)</) || [])[1]);
  return { name, cls, cardType };
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

    detailed.push({
      cardNo: c.cardNo,
      name,
      type,
      class: cls,
      imgSrc: c.imgSrc,
    });
    process.stdout.write(`  [${i + 1}/${listCards.length}] ${c.cardNo}\r`);
  }
  process.stdout.write("\n");

  // Canonical card slots are the plain-numbered cards (001-) and tokens (T##).
  // P## (parallel foil), SL## (super legendary), SP## (special) and U## (ultimate)
  // are alternate-art reprints of those, so we keep a canonical card over an alt
  // whenever they share a name. Always process canonical slots first so the
  // canonical card number / image wins the dedup.
  const isCanonical = (no) =>
    new RegExp(`^${EXPANSION}-(\\d+|T\\d+)EN$`).test(no);
  const ordered = [
    ...detailed.filter((c) => isCanonical(c.cardNo)),
    ...detailed.filter((c) => !isCanonical(c.cardNo)),
  ];

  const byName = new Map();
  const skipped = [];
  const deduped = [];
  for (const c of ordered) {
    if (byName.has(c.name)) {
      // A later (alt-art) card with a name we already have - drop it.
      skipped.push(`${c.cardNo} (alt of ${byName.get(c.name)}: "${c.name}")`);
      continue;
    }
    byName.set(c.name, c.cardNo);
    deduped.push(c);
  }

  deduped.sort((a, b) => a.cardNo.localeCompare(b.cardNo, undefined, { numeric: true }));

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(deduped, null, 2));

  const byClass = {};
  for (const c of deduped) byClass[c.class || "(none)"] = (byClass[c.class || "(none)"] || 0) + 1;

  console.log(`\nCard data saved to: ${OUTPUT_JSON}`);
  console.log(`  Base cards:    ${deduped.filter((c) => c.type === "base").length}`);
  console.log(`  Evolved cards: ${deduped.filter((c) => c.type === "evolved").length}`);
  console.log(`  Token cards:   ${deduped.filter((c) => c.type === "token").length}`);
  console.log(`  Total kept:    ${deduped.length}`);
  console.log(`  Class breakdown:`, byClass);
  if (skipped.length) {
    console.log(`  Skipped ${skipped.length} alt-art reprints (kept canonical card for each name).`);
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
