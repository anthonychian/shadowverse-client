#!/usr/bin/env node

/**
 * Generates small thumbnail copies of the card PNGs for the deck-builder card
 * LIST (the pool grid), so that view loads far fewer bytes. The full-size images
 * in public/textures/ are untouched and still used by the inspector preview,
 * deck export, and the Game.
 *
 * Thumbnails go to public/textures/thumbs/<same-filename>.png, downscaled to
 * THUMB_W wide (aspect preserved) with an area-average filter, then palette-
 * quantized with the same UPNG engine as compressimages.js. The card list maps
 * "../textures/X.png" -> "../textures/thumbs/X.png" and falls back to the full
 * image if a thumb is ever missing.
 *
 * Requires: npm install upng-js   (dev-only; not needed at runtime)
 *
 * Usage:
 *   node src/scripts/makethumbs.js                 # build any missing thumbs
 *   node src/scripts/makethumbs.js BP17            # only BP17-*.png
 *   node src/scripts/makethumbs.js --force         # rebuild all (overwrite)
 *   node src/scripts/makethumbs.js --width 248
 *   node src/scripts/makethumbs.js --dry-run
 */

const fs = require("fs");
const path = require("path");
const UPNG = require("upng-js");

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");

// Flags that take a value; their following token is consumed, not a positional.
const VALUE_FLAGS = new Set(["--width", "--colors"]);
const consumed = new Set();
args.forEach((a, i) => {
  if (VALUE_FLAGS.has(a)) consumed.add(i + 1);
});
// The optional positional set-prefix is the first non-flag, non-flag-value arg.
const PREFIX =
  args.find((a, i) => !a.startsWith("--") && !consumed.has(i)) || null;

function getArg(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 ? parseInt(args[i + 1], 10) : def;
}

// Display tiles are 124px wide; 186 (1.5x) keeps them legible while keeping the
// card list ~5x lighter than the source images.
const THUMB_W = getArg("--width", 186);
const COLORS = getArg("--colors", 256);

const TEXTURES_DIR = path.join(__dirname, "..", "..", "public", "textures");
const THUMBS_DIR = path.join(TEXTURES_DIR, "thumbs");

if (!DRY_RUN) fs.mkdirSync(THUMBS_DIR, { recursive: true });

const files = fs
  .readdirSync(TEXTURES_DIR)
  .filter((f) => f.toLowerCase().endsWith(".png"))
  .filter((f) => (PREFIX ? f.startsWith(`${PREFIX}-`) || f.startsWith(`${PREFIX}`) : true))
  .sort();

if (files.length === 0) {
  console.error(`No matching .png files found in ${TEXTURES_DIR}`);
  process.exit(1);
}

// Area-average (box) downscale of an RGBA buffer — the right filter for shrinking
// images; each destination pixel is the mean of the source pixels it covers.
function downscaleRGBA(src, sw, sh, dw, dh) {
  const dst = new Uint8Array(dw * dh * 4);
  const xRatio = sw / dw;
  const yRatio = sh / dh;
  for (let dy = 0; dy < dh; dy++) {
    const sy0 = Math.floor(dy * yRatio);
    const sy1 = Math.max(sy0 + 1, Math.ceil((dy + 1) * yRatio));
    for (let dx = 0; dx < dw; dx++) {
      const sx0 = Math.floor(dx * xRatio);
      const sx1 = Math.max(sx0 + 1, Math.ceil((dx + 1) * xRatio));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = sy0; sy < sy1 && sy < sh; sy++) {
        let p = (sy * sw + sx0) * 4;
        for (let sx = sx0; sx < sx1 && sx < sw; sx++) {
          r += src[p]; g += src[p + 1]; b += src[p + 2]; a += src[p + 3];
          n++; p += 4;
        }
      }
      const o = (dy * dw + dx) * 4;
      dst[o] = (r / n) | 0;
      dst[o + 1] = (g / n) | 0;
      dst[o + 2] = (b / n) | 0;
      dst[o + 3] = (a / n) | 0;
    }
  }
  return dst;
}

console.log(
  `Thumbnailing ${files.length}${PREFIX ? ` ${PREFIX}` : ""} images -> ${THUMB_W}px wide` +
    `${FORCE ? " [force]" : ""}${DRY_RUN ? " [dry run]" : ""}\n`
);

let before = 0;
let after = 0;
let processed = 0;
let skipped = 0;
let failed = 0;

for (const f of files) {
  const out = path.join(THUMBS_DIR, f);
  if (!FORCE && fs.existsSync(out)) {
    skipped++;
    continue;
  }
  const fp = path.join(TEXTURES_DIR, f);
  try {
    const buf = fs.readFileSync(fp);
    const img = UPNG.decode(buf);
    const rgba = new Uint8Array(UPNG.toRGBA8(img)[0]);
    const dw = THUMB_W;
    const dh = Math.max(1, Math.round((img.height / img.width) * dw));
    // Never upscale: if the source is already small, just re-encode at size.
    const small =
      dw >= img.width
        ? rgba
        : downscaleRGBA(rgba, img.width, img.height, dw, dh);
    const w = dw >= img.width ? img.width : dw;
    const h = dw >= img.width ? img.height : dh;
    const enc = Buffer.from(UPNG.encode([small.buffer], w, h, COLORS));

    before += buf.length;
    after += enc.length;
    processed++;
    if (!DRY_RUN) fs.writeFileSync(out, enc);
    process.stdout.write(
      `  ${f}: ${(buf.length / 1024).toFixed(0)}KB -> ${(enc.length / 1024).toFixed(0)}KB (${w}x${h})   \r`
    );
  } catch (e) {
    failed++;
    process.stdout.write(`\n  ! ${f}: ${e.message}\n`);
  }
}

process.stdout.write("\n");
const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`\nProcessed ${processed} (skipped ${skipped} existing, ${failed} failed).`);
if (processed > 0) {
  console.log(`  Source total: ${mb(before)} MB`);
  console.log(`  Thumbs total: ${mb(after)} MB`);
  console.log(`  ${(100 * (1 - after / before)).toFixed(0)}% smaller for the card list.`);
}
if (DRY_RUN) console.log("\n(dry run - no files written)");
