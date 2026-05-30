#!/usr/bin/env node

/**
 * Compresses card PNGs in public/textures/ in-place, using the same engine as
 * compressimage.io (UPNG.js lossy palette quantization). Keeps the original
 * dimensions; just reduces the color palette so the files match the rest of
 * the repo (~150KB instead of ~600KB).
 *
 * Requires: npm install upng-js   (dev-only; not needed at runtime)
 *
 * Usage:
 *   node src/scripts/compressimages.js BP17           # compress all BP17-*.png
 *   node src/scripts/compressimages.js BP17 --colors 256
 *   node src/scripts/compressimages.js BP17 --min-kb 200   # skip files already <200KB
 *   node src/scripts/compressimages.js BP17 --dry-run
 */

const fs = require("fs");
const path = require("path");
const UPNG = require("upng-js");

const PREFIX = process.argv[2];
const DRY_RUN = process.argv.includes("--dry-run");

if (!PREFIX) {
  console.error("Usage: node src/scripts/compressimages.js <PREFIX> [--colors N] [--min-kb N] [--dry-run]");
  console.error("Example: node src/scripts/compressimages.js BP17");
  process.exit(1);
}

function getArg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? parseInt(process.argv[i + 1], 10) : def;
}

const COLORS = getArg("--colors", 256); // 256-color palette ~ matches the existing set
const MIN_KB = getArg("--min-kb", 200); // don't bother re-compressing files already small

const TEXTURES_DIR = path.join(__dirname, "..", "..", "public", "textures");

const files = fs
  .readdirSync(TEXTURES_DIR)
  .filter((f) => f.startsWith(`${PREFIX}-`) && f.toLowerCase().endsWith(".png"))
  .sort();

if (files.length === 0) {
  console.error(`No ${PREFIX}-*.png files found in ${TEXTURES_DIR}`);
  process.exit(1);
}

console.log(`Compressing ${files.length} ${PREFIX} images (palette ${COLORS} colors)${DRY_RUN ? " [dry run]" : ""}\n`);

let before = 0;
let after = 0;
let processed = 0;
let skipped = 0;

for (const f of files) {
  const fp = path.join(TEXTURES_DIR, f);
  const buf = fs.readFileSync(fp);
  const kb = buf.length / 1024;
  if (kb < MIN_KB) {
    skipped++;
    continue;
  }

  const img = UPNG.decode(buf);
  const rgba = UPNG.toRGBA8(img); // array of frame ArrayBuffers
  const out = Buffer.from(UPNG.encode(rgba, img.width, img.height, COLORS));

  // Only keep the result if it's actually smaller.
  if (out.length >= buf.length) {
    skipped++;
    continue;
  }

  before += buf.length;
  after += out.length;
  processed++;

  if (!DRY_RUN) fs.writeFileSync(fp, out);
  process.stdout.write(
    `  ${f}: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB\r`
  );
}

process.stdout.write("\n");
const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`\nProcessed ${processed} files (${skipped} skipped/unchanged).`);
if (processed > 0) {
  console.log(`  Before: ${mb(before)} MB`);
  console.log(`  After:  ${mb(after)} MB`);
  console.log(`  Saved:  ${mb(before - after)} MB (${(100 * (1 - after / before)).toFixed(0)}% smaller)`);
}
if (DRY_RUN) console.log("\n(dry run - no files written)");
