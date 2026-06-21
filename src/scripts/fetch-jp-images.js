#!/usr/bin/env node

/**
 * Download a set's card images from the Japanese site (shadowverse-evolve.com)
 * into public/textures/, named with the app's EN card numbers.
 *
 * Use for upcoming sets whose images aren't on the EN site yet. Reads the set's
 * src/scripts/<SET>-cards.json and, for each card, maps the EN card number to
 * the JP filename (strip the "EN" suffix, lowercase) and fetches:
 *   https://shadowverse-evolve.com/wordpress/wp-content/images/cardlist/<SET>/<jp>.png
 * e.g. BP18-001EN -> bp18-001.png, BP18-T01EN -> bp18-t01.png, BP18-SEPEN -> bp18-sep.png
 *
 * Output goes to public/textures/<EN-cardNo>.png so compressimages.js /
 * makethumbs.js / getCards.js all pick it up unchanged.
 *
 * Usage:
 *   node src/scripts/fetch-jp-images.js <SET> [--force] [--dry-run]
 *   node src/scripts/fetch-jp-images.js BP18
 */

const fs = require("fs");
const path = require("path");

const SET = process.argv[2];
const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");

if (!SET || SET.startsWith("--")) {
  console.error("Usage: node src/scripts/fetch-jp-images.js <SET> [--force] [--dry-run]");
  console.error("Example: node src/scripts/fetch-jp-images.js BP18");
  process.exit(1);
}

const JSON_FILE = path.join(__dirname, `${SET}-cards.json`);
if (!fs.existsSync(JSON_FILE)) {
  console.error(`Card data not found: ${JSON_FILE}`);
  console.error(`Run csv-to-cards.js (or the scraper) for ${SET} first.`);
  process.exit(1);
}

const TEXTURES_DIR = path.join(__dirname, "..", "..", "public", "textures");
const BASE = `https://shadowverse-evolve.com/wordpress/wp-content/images/cardlist/${SET}`;
const UA = "Mozilla/5.0 (compatible; sve-client/1.0)";
const CONCURRENCY = 4;
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const cards = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
// JP filename: drop the EN suffix, lowercase. BP18-T01EN -> bp18-t01.
const jpName = (cardNo) => cardNo.replace(/EN$/, "").toLowerCase();

async function fetchOne(card) {
  const dest = path.join(TEXTURES_DIR, `${card.cardNo}.png`);
  if (!FORCE && fs.existsSync(dest)) return { cardNo: card.cardNo, status: "skip" };
  const url = `${BASE}/${jpName(card.cardNo)}.png`;
  if (DRY_RUN) return { cardNo: card.cardNo, status: "would-fetch", url };
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) return { cardNo: card.cardNo, status: "fail", detail: `HTTP ${res.status}`, url };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000 || !buf.subarray(0, 8).equals(PNG_SIG)) {
      return { cardNo: card.cardNo, status: "fail", detail: "not a PNG", url };
    }
    fs.writeFileSync(dest, buf);
    return { cardNo: card.cardNo, status: "ok", bytes: buf.length };
  } catch (e) {
    return { cardNo: card.cardNo, status: "fail", detail: e.message, url };
  }
}

async function run() {
  if (!fs.existsSync(TEXTURES_DIR)) fs.mkdirSync(TEXTURES_DIR, { recursive: true });
  console.log(`Fetching ${cards.length} ${SET} images from ${BASE}${DRY_RUN ? " [dry run]" : ""}`);

  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < cards.length) {
      const c = cards[idx++];
      const r = await fetchOne(c);
      results.push(r);
      if (r.status === "ok") process.stdout.write(`  ${r.cardNo} (${Math.round(r.bytes / 1024)}KB)\r`);
      if (r.status === "fail") console.log(`\n  FAIL ${r.cardNo}: ${r.detail}  (${r.url})`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, cards.length) }, worker));
  process.stdout.write("\n");

  const by = results.reduce((m, r) => ((m[r.status] = (m[r.status] || 0) + 1), m), {});
  console.log(
    `Images: ${by.ok || 0} downloaded, ${by.skip || 0} already present, ` +
      `${by.fail || 0} failed${DRY_RUN ? `, ${by["would-fetch"] || 0} would fetch` : ""}.`
  );
  if (by.fail) process.exitCode = 1;
}

run();
