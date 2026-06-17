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
 * Output:
 *   - src/scripts/<EXPANSION>-cards.json   full card data (incl. a `details`
 *       object: format, class, card type, trait, rarity, card set, cost,
 *       attack, defense, and the effect/description text).
 *   - public/textures/<cardNo>.png         card images
 *   - public/textures/icons/*.png          keyword/stat icons (Evolve, Cost,
 *       Fanfare, Attack, Defense, class symbols, ...) used in effect text
 *   - src/scripts/icons.json               manifest mapping effect-text tokens
 *       like "[fanfare]" to their icon path, merged across sets.
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
// Skip the site's expansion-search entirely and take the card numbers from the
// app's getCards.js. Use this for already-imported sets whose on-site search is
// unreliable (returns nothing, or doesn't list every card) - e.g. the collab
// sets - so the scrape matches exactly what's wired into the app.
const FROM_GETCARDS = process.argv.includes("--from-getcards");
// Capture EVERY printing (incl. alt-art Ultimate/Special/Super-Legend/Premium/
// Parallel/Promo) without the by-name dedup, writing them to
// <EXPANSION>-printings.json (the deduped <EXPANSION>-cards.json is left
// untouched, so the name-keyed Game pipeline is unaffected). Details already in
// <EXPANSION>-cards.json are reused, so only the extra alt-art cards are fetched.
const ALL_PRINTINGS = process.argv.includes("--all-printings");

if (!EXPANSION) {
  console.error("Usage: node src/scripts/scrapecards.js <EXPANSION> [--no-images] [--json-only] [--from-getcards]");
  console.error("Example: node src/scripts/scrapecards.js BP17");
  process.exit(1);
}

const BASE_URL = "https://en.shadowverse-evolve.com";
const listUrl = (page) =>
  `${BASE_URL}/cards/searchresults/?expansion=${EXPANSION}&view=text&page=${page}`;
const detailUrl = (cardNo) => `${BASE_URL}/cards/?cardno=${cardNo}&view=text`;
const TEXTURES_DIR = path.join(__dirname, "..", "..", "public", "textures");
const ICONS_DIR = path.join(TEXTURES_DIR, "icons");
const OUTPUT_JSON = path.join(__dirname, `${EXPANSION}-cards.json`);
const PRINTINGS_JSON = path.join(__dirname, `${EXPANSION}-printings.json`);
// Keyword/stat icons are shared across every set, so the manifest is not
// expansion-specific; each run merges its icons into this one file.
const ICON_MANIFEST = path.join(__dirname, "icons.json");

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

// Turn an HTML fragment into plain text. Keyword/ability icons in the card text
// (e.g. <img alt="[fanfare]">) are replaced by their alt label so abilities keep
// their "[Fanfare] ..." wording; <br> becomes a space; all other tags are dropped.
function stripTags(s) {
  if (!s) return "";
  return s
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, "$1")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Read a <dl><dt>Label</dt><dd>value</dd></dl> pair from the detail page.
// Tolerant of whitespace between the tags and of trailing markup in the <dd>.
function ddValue(html, label) {
  const re = new RegExp(`<dt>\\s*${label}\\s*</dt>\\s*<dd>([\\s\\S]*?)</dd>`, "i");
  const m = html.match(re);
  return m ? decodeEntities(stripTags(m[1])) : "";
}

// Read a stat from the <div class="status"> block. The heading classes are
// Cost (heading-Cost), Attack (heading-Power) and Defense (heading-Hp); the
// value sits between the heading's closing </span> and the next </span>.
// Spells/amulets omit Attack/Defense, in which case this returns "".
function statValue(html, headingClass) {
  const re = new RegExp(`heading-${headingClass}">[^<]*</span>\\s*([^<]*)<`, "i");
  const m = html.match(re);
  return m ? decodeEntities(m[1].trim()) : "";
}

// The card's ability/effect text, with keyword icons rendered as their labels.
function detailText(html) {
  const m = html.match(/<div class="detail">([\s\S]*?)<\/div>/i);
  return m ? decodeEntities(stripTags(m[1])) : "";
}

// Collect every keyword/stat icon used on a detail page (Evolve, Cost##,
// Fanfare, Attack, Defense, class symbols, etc.). Returns {src, alt} pairs;
// `alt` is the bracket token that also appears in the effect text ("[fanfare]").
function extractIcons(html) {
  const icons = [];
  const tags = html.match(/<img[^>]*class="icon-square"[^>]*>/gi) || [];
  for (const t of tags) {
    const src = (t.match(/src="([^"]+)"/) || [])[1];
    const alt = decodeEntities((t.match(/alt="([^"]*)"/) || [])[1] || "");
    if (src) icons.push({ src, alt });
  }
  return icons;
}

// Fallback card-number source for sets whose expansion search is broken on the
// site (the list page returns 0 results) but whose individual detail pages still
// work — this is the case for some already-released sets. We read the card
// numbers already wired into the app's getCards.js. The detail pages still
// provide the name/class/stats, and imgSrc is left blank so the image step uses
// the standard cardlist path.
function cardNosFromGetCards(expansion) {
  const getCardsPath = path.join(__dirname, "..", "decks", "getCards.js");
  if (!fs.existsSync(getCardsPath)) return [];
  const content = fs.readFileSync(getCardsPath, "utf8");
  const re = new RegExp(`textures/(${expansion}-[0-9A-Za-z]+)\\.png`, "g");
  const seen = new Set();
  const found = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    found.push({ cardNo: m[1], listName: "", imgSrc: "" });
  }
  return found;
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
  return {
    name,
    format: ddValue(html, "Format"),
    cls: ddValue(html, "Class"),
    cardType: ddValue(html, "Card Type"),
    trait: ddValue(html, "Trait"),
    rarity: ddValue(html, "Rarity"),
    cardSet: ddValue(html, "Card Set"),
    cost: statValue(html, "Cost"),
    attack: statValue(html, "Power"),
    defense: statValue(html, "Hp"),
    effect: detailText(html),
    icons: extractIcons(html),
  };
}

async function scrapeCards() {
  console.log(`Scraping expansion: ${EXPANSION}`);
  console.log(`List URL: ${listUrl(1)}\n`);

  console.log("Collecting card list...");
  let listCards = FROM_GETCARDS ? [] : await scrapeList();
  if (listCards.length === 0) {
    console.log(
      FROM_GETCARDS
        ? "Using card numbers from getCards.js (--from-getcards)..."
        : "Expansion search returned 0 results; falling back to card numbers already in getCards.js..."
    );
    listCards = cardNosFromGetCards(EXPANSION);
  }
  console.log(`Found ${listCards.length} cards in the list.\n`);

  if (listCards.length === 0) {
    console.error("No cards found. Is the expansion code correct (e.g. BP17)?");
    process.exit(1);
  }

  console.log("Fetching full card details (class, type, trait, rarity, set, stats, effect)...");
  const detailed = [];
  // Unique keyword/stat icons across the whole set: src -> alt token.
  const iconMap = new Map();
  // In all-printings mode, reuse records already in <EXP>-cards.json so only the
  // extra alt-art cards trigger a network fetch.
  const existingByNo = new Map();
  if (ALL_PRINTINGS && fs.existsSync(OUTPUT_JSON)) {
    try {
      for (const r of JSON.parse(fs.readFileSync(OUTPUT_JSON, "utf8"))) existingByNo.set(r.cardNo, r);
    } catch {}
  }
  for (let i = 0; i < listCards.length; i++) {
    const c = listCards[i];
    if (ALL_PRINTINGS && existingByNo.has(c.cardNo)) {
      detailed.push(existingByNo.get(c.cardNo));
      process.stdout.write(`  [${i + 1}/${listCards.length}] ${c.cardNo} (cached)\r`);
      continue;
    }
    let detail;
    try {
      detail = await fetchDetail(c.cardNo);
    } catch (err) {
      console.log(`\n  Warning: failed detail for ${c.cardNo}: ${err.message}`);
      detail = { name: c.listName, cls: "", cardType: "" };
    }
    detail = { format: "", trait: "", rarity: "", cardSet: "", cost: "", attack: "", defense: "", effect: "", icons: [], ...detail };
    for (const ic of detail.icons) {
      if (!iconMap.has(ic.src)) iconMap.set(ic.src, ic.alt);
    }
    const baseName = detail.name || c.listName;
    const ct = (detail.cardType || "").toLowerCase();
    const isToken = c.cardNo.includes("-T") || ct.includes("token");
    const isEvolved = ct.includes("evolved");
    // "Advanced" evolve cards (Card Type "Follower / Advanced") live in the
    // evolve deck like evolved cards, but the Game keys them by an " ADVANCED"
    // suffix (Field.js/EvoDeck.js match name.slice(-8) === "ADVANCED"), so we
    // must name them that way rather than " Evolved".
    const isAdvanced = ct.includes("advanced");

    let name = baseName;
    if (isEvolved) name += " Evolved";
    else if (isAdvanced) name += " ADVANCED";
    if (isToken) name += " TOKEN";

    const type = isToken ? "token" : isEvolved || isAdvanced ? "evolved" : "base";
    const cls = CLASS_MAP[(detail.cls || "").toLowerCase()] || "";

    detailed.push({
      cardNo: c.cardNo,
      name,
      type,
      class: cls,
      // Full, human-readable card details scraped from the detail page. Kept in
      // its own object so the top-level `class` (short app key, e.g. "forest")
      // doesn't collide with the site's class label (e.g. "Forestcraft").
      details: {
        format: detail.format,
        class: detail.cls,
        cardType: detail.cardType,
        trait: detail.trait,
        rarity: detail.rarity,
        cardSet: detail.cardSet,
        cost: detail.cost,
        attack: detail.attack,
        defense: detail.defense,
        effect: detail.effect,
      },
      imgSrc: c.imgSrc,
    });
    process.stdout.write(`  [${i + 1}/${listCards.length}] ${c.cardNo}\r`);
  }
  process.stdout.write("\n");

  let outputList;
  const skipped = [];
  if (ALL_PRINTINGS) {
    // Keep every printing (no by-name dedup) so each alt-art version is its own
    // entry. Written to a separate file; <EXPANSION>-cards.json is left alone.
    outputList = detailed
      .slice()
      .sort((a, b) => a.cardNo.localeCompare(b.cardNo, undefined, { numeric: true }));
    fs.writeFileSync(PRINTINGS_JSON, JSON.stringify(outputList, null, 2));
  } else {
    // Canonical card slots are the plain-numbered cards (001-) and tokens (T##).
    // P## (parallel foil), SL## (super legendary), SP## (special) and U## (ultimate)
    // are alternate-art reprints of those, so we keep a canonical card over an alt
    // whenever they share a name. Always process canonical slots first so the
    // canonical card number / image wins the dedup.
    const isCanonical = (no) => new RegExp(`^${EXPANSION}-(\\d+|T\\d+)EN$`).test(no);
    const ordered = [
      ...detailed.filter((c) => isCanonical(c.cardNo)),
      ...detailed.filter((c) => !isCanonical(c.cardNo)),
    ];
    const byName = new Map();
    const deduped = [];
    for (const c of ordered) {
      if (byName.has(c.name)) {
        skipped.push(`${c.cardNo} (alt of ${byName.get(c.name)}: "${c.name}")`);
        continue;
      }
      byName.set(c.name, c.cardNo);
      deduped.push(c);
    }
    deduped.sort((a, b) => a.cardNo.localeCompare(b.cardNo, undefined, { numeric: true }));
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(deduped, null, 2));
    outputList = deduped;
  }

  // Merge the icon manifest: maps each bracket token that appears in a card's
  // `details.effect` (e.g. "[fanfare]") to its icon image path, so the app can
  // swap tokens for <img> tags. Icons are shared across sets, so we accumulate
  // into one shared file rather than one-per-expansion.
  if (iconMap.size) {
    let manifest = {};
    if (fs.existsSync(ICON_MANIFEST)) {
      try {
        manifest = JSON.parse(fs.readFileSync(ICON_MANIFEST, "utf8"));
      } catch {
        manifest = {};
      }
    }
    for (const [src, alt] of iconMap) {
      if (alt) manifest[alt] = `icons/${path.basename(src.split("?")[0])}`;
    }
    fs.writeFileSync(ICON_MANIFEST, JSON.stringify(manifest, null, 2));
    console.log(`Icon manifest: ${Object.keys(manifest).length} tokens -> ${ICON_MANIFEST}`);
  }

  const byClass = {};
  for (const c of outputList) byClass[c.class || "(none)"] = (byClass[c.class || "(none)"] || 0) + 1;

  console.log(`\nCard data saved to: ${ALL_PRINTINGS ? PRINTINGS_JSON : OUTPUT_JSON}`);
  console.log(`  Base cards:    ${outputList.filter((c) => c.type === "base").length}`);
  console.log(`  Evolved cards: ${outputList.filter((c) => c.type === "evolved").length}`);
  console.log(`  Token cards:   ${outputList.filter((c) => c.type === "token").length}`);
  console.log(`  Total ${ALL_PRINTINGS ? "printings" : "kept"}:    ${outputList.length}`);
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
  for (const card of outputList) {
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

  // Download the keyword/stat icons (Evolve, Cost##, Fanfare, Attack, Defense,
  // class symbols, ...) into public/textures/icons/, so the app can render them
  // inline in card effect text via the icon manifest written above.
  if (iconMap.size) {
    console.log("\nDownloading keyword/stat icons...");
    if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
    let idl = 0;
    let iexists = 0;
    let ifail = 0;
    for (const src of iconMap.keys()) {
      const filename = path.basename(src.split("?")[0]);
      const filepath = path.join(ICONS_DIR, filename);
      if (fs.existsSync(filepath)) {
        iexists++;
        continue;
      }
      const iconUrl = src.startsWith("http") ? src : `${BASE_URL}${src}`;
      try {
        await downloadImage(iconUrl, filepath);
        idl++;
        process.stdout.write(`  downloaded ${filename} (${idl})\r`);
      } catch (err) {
        ifail++;
        console.log(`\n  Failed icon ${filename}: ${err.message}`);
      }
    }
    process.stdout.write("\n");
    console.log(`Icons: ${idl} downloaded, ${iexists} already present, ${ifail} failed.`);
  }

  console.log(`\nDone! Now run: node src/scripts/generatecardfiles.js ${EXPANSION}`);
}

scrapeCards().catch((err) => {
  console.error("Scraper error:", err);
  process.exit(1);
});
