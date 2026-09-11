#!/usr/bin/env node

/**
 * Download a set's card images from the ENGLISH site (en.shadowverse-evolve.com)
 * into public/textures/, named with the app's EN card numbers.
 *
 * Reads src/scripts/<SET>-cards.json and uses each entry's imgSrc (the EN cardlist
 * path) to fetch the English artwork. Use this to replace JP art that was pulled
 * down early via fetch-jp-images.js once the EN site has the set up.
 *
 * Usage:
 *   node src/scripts/fetch-en-images.js BP19 BP20
 *   node src/scripts/fetch-en-images.js BP19 --force
 */

const fs = require("fs");
const path = require("path");

const SETS = process.argv.filter((a) => !a.startsWith("--"));
if (SETS.length < 3) {
  console.error("Usage: node src/scripts/fetch-en-images.js <SET> [<SET> ...] [--force]");
  process.exit(1);
}
const FORCE = process.argv.includes("--force");

const BASE = "https://en.shadowverse-evolve.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const TEXTURES_DIR = path.join(__dirname, "..", "..", "public", "textures");
const CONCURRENCY = 4;
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

if (!fs.existsSync(TEXTURES_DIR)) fs.mkdirSync(TEXTURES_DIR, { recursive: true });

async function fetchOne(cardNo, imgSrc) {
  const dest = path.join(TEXTURES_DIR, `${cardNo}.png`);
  if (!FORCE && fs.existsSync(dest)) return { cardNo, status: "skip" };
  if (!imgSrc) return { cardNo, status: "fail", detail: "no imgSrc in JSON" };
  const url = imgSrc.startsWith("http") ? imgSrc : `${BASE}${imgSrc}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) return { cardNo, status: "fail", detail: `HTTP ${res.status}`, url };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000 || !buf.subarray(0, 8).equals(PNG_SIG)) {
      return { cardNo, status: "fail", detail: "not a PNG", url };
    }
    fs.writeFileSync(dest, buf);
    return { cardNo, status: "ok", bytes: buf.length };
  } catch (e) {
    return { cardNo, status: "fail", detail: e.message, url };
  }
}

async function run() {
  for (const SET of SETS.slice(2)) {
    const JSON_FILE = path.join(__dirname, `${SET}-cards.json`);
    if (!fs.existsSync(JSON_FILE)) {
      console.error(`Card data not found: ${JSON_FILE}`);
      process.exitCode = 1;
      continue;
    }
    const cards = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
    console.log(`Fetching ${cards.length} ${SET} images from ${BASE}${FORCE ? " [force]" : ""}`);

    const results = [];
    let idx = 0;
    async function worker() {
      while (idx < cards.length) {
        const c = cards[idx++];
        const r = await fetchOne(c.cardNo, c.imgSrc);
        results.push(r);
        if (r.status === "ok") process.stdout.write(`  ${r.cardNo} (${Math.round(r.bytes / 1024)}KB)\r`);
        if (r.status === "fail")
          console.log(`\n  FAIL ${r.cardNo}: ${r.detail}  (${r.url || "no imgSrc"})`);
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, cards.length) }, worker));
    process.stdout.write("\n");

    const by = results.reduce((m, r) => ((m[r.status] = (m[r.status] || 0) + 1), m), {});
    console.log(
      `Images: ${by.ok || 0} downloaded, ${by.skip || 0} already present, ${by.fail || 0} failed.`
    );
    if (by.fail) process.exitCode = 1;
  }
  console.log("\nNext: node src/scripts/compressimages.js <SET>, then makethumbs.js --force <SET>, then build-card-atlases.js");
}

run();