#!/usr/bin/env node

/**
 * Packs the deck-builder thumbnails into sprite atlases so the card pool costs
 * one request per ~36 cards instead of one per card.
 *
 * Why atlases only for the POOL: the pool is browsed densely and in a fixed
 * order — you scroll through runs of adjacent cards — so an atlas is almost
 * entirely useful once fetched. Sparse views (a deck's ~25 unique cards, the
 * inspector's single card) touch one card per atlas and would download 36x what
 * they show, so those keep using individual images.
 *
 * Cards are chunked in the SAME order the pool sorts them (SET_CODE_ORDER rank,
 * then card number). That alignment is the whole point: scrolling down the
 * default view walks atlas 0, 1, 2 … in order rather than scattering across
 * them.
 *
 * Output:
 *   public/atlases/a000.png …   the sheets (GRID_COLS x GRID_ROWS tiles each)
 *   public/atlases/index.json   { tile, grid, order: [cardNo, …] }
 *
 * The runtime derives a card's position from its index in `order`, so the index
 * file carries no per-card coordinates:
 *   i = order.indexOf(cardNo)
 *   atlas = floor(i / (cols*rows)); cell = i % (cols*rows)
 *   col = cell % cols;  row = floor(cell / cols)
 *
 * Requires: upng-js (already a devDependency, same engine as makethumbs.js)
 *
 * Usage:
 *   node src/scripts/build-card-atlases.js
 *   node src/scripts/build-card-atlases.js --limit 3     # first 3 sheets only
 *   node src/scripts/build-card-atlases.js --colors 0    # lossless (big)
 *   node src/scripts/build-card-atlases.js --dry-run
 */

const fs = require("fs");
const path = require("path");
const UPNG = require("upng-js");

const ROOT = path.join(__dirname, "..", "..");
const THUMBS_DIR = path.join(ROOT, "public", "textures", "thumbs");
const OUT_DIR = path.join(ROOT, "public", "atlases");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const flag = (name, dflt) => {
  const i = args.indexOf(name);
  return i === -1 ? dflt : Number(args[i + 1]);
};
const LIMIT = flag("--limit", Infinity);
const COLORS = flag("--colors", 256);
const GRID_COLS = flag("--cols", 6);
const GRID_ROWS = flag("--rows", 6);
const PER_SHEET = GRID_COLS * GRID_ROWS;

// Read straight out of theme.js rather than keeping a copy here. theme.js is an
// ESM module this plain-node script can't require, but the array is a flat list
// of string literals, so lifting it textually is enough — and it means adding a
// set or reordering the Set dropdown can't silently leave the packer sorting by
// a stale order. (It did exactly that once: this copy missed BP21.)
const THEME = path.join(ROOT, "src", "components", "deckbuilder", "theme.js");
const SET_CODE_ORDER = (() => {
  const src = fs.readFileSync(THEME, "utf8");
  const m = src.match(/export const SET_CODE_ORDER\s*=\s*\[([\s\S]*?)\]/);
  if (!m) {
    console.error(`Could not find SET_CODE_ORDER in ${THEME}`);
    process.exit(1);
  }
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
})();

// CreateDeck.js:390 — sub-bundles like "GFB01a" collapse to their family.
const setFamily = (code) => code.replace(/[a-z]+$/, "");

// Upper-cased, because a handful of thumbnails carry a lower-case prefix
// (cp03-u01 … cp03-u06 came down from the JP site without the EN suffix). Left
// as-is they form a SECOND family whose sheet is named "cp03-0" — which on a
// case-insensitive filesystem is the same file as "CP03-0" and silently
// overwrites 36 cards of art with 6. Folding case here keeps them in the one
// CP03 family where they belong, and makes the output identical on Windows and
// on Linux (where the clash would otherwise go unnoticed until deploy).
const familyOf = (cardNo) =>
  (setFamily(cardNo.split("-")[0] || "") || "MISC").toUpperCase();
const setRank = (code) => {
  const i = SET_CODE_ORDER.indexOf(code);
  return i === -1 ? SET_CODE_ORDER.length : i;
};

const cardNos = fs
  .readdirSync(THUMBS_DIR)
  .filter((f) => f.toLowerCase().endsWith(".png"))
  .map((f) => f.replace(/\.png$/i, ""));

// Same comparator as the pool's sortItems (CreateDeck.js:481).
cardNos.sort((a, b) => {
  const ra = setRank(familyOf(a));
  const rb = setRank(familyOf(b));
  if (ra !== rb) return ra - rb;
  return a.localeCompare(b, undefined, { numeric: true });
});

if (!cardNos.length) {
  console.error(`No thumbnails found in ${THUMBS_DIR}`);
  process.exit(1);
}

// Sheets are scoped to ONE set family and named after it ("BP01-0", "BP01-1"),
// never packed globally with sequential numbers. That matters because the
// sheets are served `immutable`: with a global pack, adding a set would shift
// every card's position, rewrite all 185 sheets, and force every returning
// player to re-download art they already had. Set-scoped sheets mean a new set
// only ever ADDS files — every existing sheet keeps its URL and its bytes, so
// the year-long cache actually holds. The cost is one partially-filled sheet
// per set, which is the right trade.
const families = [];
const byFamily = new Map();
for (const no of cardNos) {
  const fam = familyOf(no);
  if (!byFamily.has(fam)) {
    byFamily.set(fam, []);
    families.push(fam);
  }
  byFamily.get(fam).push(no);
}

// [{ name, cards }] in pool order.
const sheets = [];
for (const fam of families) {
  const list = byFamily.get(fam);
  for (let i = 0; i * PER_SHEET < list.length; i++) {
    sheets.push({
      name: `${fam}-${i}`,
      cards: list.slice(i * PER_SHEET, (i + 1) * PER_SHEET),
    });
  }
}

// Tile size is taken from the first thumb; any thumb that doesn't match is
// letterboxed into the tile rather than silently stretched.
const probe = UPNG.decode(fs.readFileSync(path.join(THUMBS_DIR, cardNos[0] + ".png")));
const TILE_W = probe.width;
const TILE_H = probe.height;

// Two sheets whose names differ only by case would be one file on Windows and
// two on Linux — the build would "succeed" locally while shipping art that maps
// to the wrong cards. Fail loudly instead.
const seenLower = new Map();
for (const sh of sheets) {
  const k = sh.name.toLowerCase();
  if (seenLower.has(k)) {
    console.error(
      `Sheet name collision (case-insensitive): "${seenLower.get(k)}" vs "${sh.name}".\n` +
        `Both would write the same file on Windows. Normalise the set family in familyOf().`,
    );
    process.exit(1);
  }
  seenLower.set(k, sh.name);
}

const sheetCount = Math.min(sheets.length, LIMIT);

console.log(
  `${cardNos.length} thumbs across ${families.length} sets -> ${sheets.length} sheets ` +
    `(${GRID_COLS}x${GRID_ROWS} of ${TILE_W}x${TILE_H} = ${TILE_W * GRID_COLS}x${TILE_H * GRID_ROWS}px)` +
    `${LIMIT !== Infinity ? `, building ${sheetCount}` : ""}` +
    `, ${COLORS === 0 ? "lossless" : COLORS + " colors"}${DRY_RUN ? " [dry run]" : ""}\n`,
);

if (!DRY_RUN) fs.mkdirSync(OUT_DIR, { recursive: true });

const SHEET_W = TILE_W * GRID_COLS;
const SHEET_H = TILE_H * GRID_ROWS;

let mismatched = 0;
let bytesOut = 0;
let bytesIn = 0;

for (let s = 0; s < sheetCount; s++) {
  const slice = sheets[s].cards;
  const sheet = new Uint8Array(SHEET_W * SHEET_H * 4); // transparent

  slice.forEach((no, cell) => {
    const col = cell % GRID_COLS;
    const row = Math.floor(cell / GRID_COLS);
    const file = path.join(THUMBS_DIR, no + ".png");
    let rgba;
    let w;
    let h;
    try {
      const buf = fs.readFileSync(file);
      bytesIn += buf.length;
      const img = UPNG.decode(buf);
      rgba = new Uint8Array(UPNG.toRGBA8(img)[0]);
      w = img.width;
      h = img.height;
    } catch (e) {
      console.error(`\n  !! ${no}: ${e.message}`);
      return;
    }
    // Most thumbs are exactly TILE_W x TILE_H. The exceptions are a handful of
    // ±1px rounding differences and the genuinely landscape cards (PR-389EN,
    // PR-395EN are 641x459 sources). Centre anything off-size in its tile and
    // crop the overflow: centring reads as a landscape card sitting in a
    // portrait slot, where top-left alignment would leave a visible gap.
    if (w !== TILE_W || h !== TILE_H) mismatched++;
    const cw = Math.min(w, TILE_W);
    const ch = Math.min(h, TILE_H);
    const offX = Math.floor((TILE_W - cw) / 2);
    const offY = Math.floor((TILE_H - ch) / 2);
    const srcX = Math.floor((w - cw) / 2);
    const srcY = Math.floor((h - ch) / 2);
    for (let y = 0; y < ch; y++) {
      const srcOff = ((srcY + y) * w + srcX) * 4;
      const dstOff = ((row * TILE_H + offY + y) * SHEET_W + col * TILE_W + offX) * 4;
      sheet.set(rgba.subarray(srcOff, srcOff + cw * 4), dstOff);
    }
  });

  const enc = Buffer.from(UPNG.encode([sheet.buffer], SHEET_W, SHEET_H, COLORS));
  bytesOut += enc.length;
  if (!DRY_RUN) {
    fs.writeFileSync(path.join(OUT_DIR, `${sheets[s].name}.png`), enc);
  }
  process.stdout.write(
    `  sheet ${s + 1}/${sheetCount} (${sheets[s].name}): ${slice.length} cards, ${(enc.length / 1024).toFixed(0)}KB    \r`,
  );
}

if (!DRY_RUN && LIMIT === Infinity) {
  // sheetName -> the card numbers it holds, in cell order. The runtime derives
  // a card's cell from its position in that list.
  const index = JSON.stringify({
    tile: [TILE_W, TILE_H],
    grid: [GRID_COLS, GRID_ROWS],
    sheets: Object.fromEntries(sheets.map((sh) => [sh.name, sh.cards])),
  });
  fs.writeFileSync(path.join(OUT_DIR, "index.json"), index);
  // A second copy under src/ so the app can `import` it: CRA can't import out
  // of public/, and bundling the index costs one fewer request than fetching
  // it — the sheets themselves stay in public/ and are fetched by URL.
  fs.writeFileSync(path.join(ROOT, "src", "decks", "atlasIndex.json"), index);
}

const built = sheets.slice(0, sheetCount).reduce((n, sh) => n + sh.cards.length, 0);
console.log(
  `\n\n  ${sheetCount} sheets, ${(bytesOut / 1048576).toFixed(1)} MB` +
    `  vs  ${built} individual thumbs, ${(bytesIn / 1048576).toFixed(1)} MB` +
    `  (${((bytesOut / bytesIn) * 100).toFixed(0)}% of the bytes, ` +
    `${(built / sheetCount).toFixed(0)}x fewer requests)`,
);
if (mismatched) console.log(`  ${mismatched} thumbs were not ${TILE_W}x${TILE_H} (letterboxed)`);
