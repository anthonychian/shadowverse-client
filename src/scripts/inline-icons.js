#!/usr/bin/env node

/**
 * Inlines the small keyword/stat/class icons as data URIs so they cost zero
 * requests instead of one apiece.
 *
 * Why inline rather than pack into a sprite sheet like the card pool: these are
 * tiny (26 of the 32 are 28x28, 35KB for the lot) and they're used SPARSELY —
 * the inspector shows a cost gem, two stat icons and a couple of keywords, each
 * from a different file. A sheet would still be one request but it would also
 * mean a coordinate lookup and a fixed grid for icons that aren't a uniform
 * size. At this scale a data URI is strictly better: no request at all, and the
 * bytes ride along in a bundle that's already being downloaded.
 *
 * The large icons stay as files. icon_ride alone is 34KB and would bloat the
 * bundle for every visitor to save one request on the rare card that uses it.
 *
 * Output: src/decks/iconData.json  { "[cost00]": "data:image/png;base64,…" }
 * Consumed by src/components/deckbuilder/icons.js, which falls back to the URL
 * for any token that isn't inlined.
 *
 * Usage:
 *   node src/scripts/inline-icons.js
 *   node src/scripts/inline-icons.js --max-bytes 20000
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const TEXTURES = path.join(ROOT, "public", "textures");
const MANIFEST = path.join(ROOT, "src", "decks", "icons.json");
const OUT = path.join(ROOT, "src", "decks", "iconData.json");

const args = process.argv.slice(2);
const i = args.indexOf("--max-bytes");
// 6KB is where the curve knees: it catches all 26 of the 28x28 icons plus
// [quick] and [adv] for 59KB of base64. Going to 12KB costs another 42KB to
// pick up just three rarely-shown icons, which isn't worth it in a bundle every
// visitor downloads. Raising it trades bundle size for requests.
const MAX_BYTES = i === -1 ? 6000 : Number(args[i + 1]);

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

const inlined = {};
let inlinedBytes = 0;
const skipped = [];

for (const [token, rel] of Object.entries(manifest)) {
  const file = path.join(TEXTURES, rel);
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch {
    skipped.push(`${token} (missing ${rel})`);
    continue;
  }
  if (buf.length > MAX_BYTES) {
    skipped.push(`${token} (${(buf.length / 1024).toFixed(0)}KB)`);
    continue;
  }
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`;
  inlined[token] = `data:${mime};base64,${buf.toString("base64")}`;
  inlinedBytes += buf.length;
}

fs.writeFileSync(OUT, JSON.stringify(inlined));

const outSize = fs.statSync(OUT).size;
console.log(
  `Inlined ${Object.keys(inlined).length}/${Object.keys(manifest).length} icons ` +
    `(${(inlinedBytes / 1024).toFixed(0)}KB raw -> ${(outSize / 1024).toFixed(0)}KB base64)`,
);
if (skipped.length) {
  console.log(`Left as files (> ${(MAX_BYTES / 1024).toFixed(0)}KB or missing):`);
  skipped.forEach((s) => console.log(`   ${s}`));
}
