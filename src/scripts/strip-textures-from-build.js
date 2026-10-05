// Card art is served from the Cloudflare R2 bucket (src/decks/assetBase.js), but
// react-scripts copies everything in public/ verbatim into build/ — so a local
// public/textures/ (~14k PNGs, >1GB) would ride along on every deploy even
// though the app never requests it. This runs after `react-scripts build` and
// drops it.
//
// public/textures/ is left untouched: it stays the staging dir the fetch-*/
// makethumbs/compressimages scripts write to and the source for R2 uploads.
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "..", "build", "textures");

if (!fs.existsSync(dir)) {
  console.log("strip-textures: build/textures absent — nothing to do.");
  process.exit(0);
}

const tally = (target) => {
  let files = 0;
  let size = 0;
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) {
      const sub = tally(full);
      files += sub.files;
      size += sub.size;
    } else {
      files += 1;
      size += fs.statSync(full).size;
    }
  }
  return { files, size };
};

const { files, size } = tally(dir);
fs.rmSync(dir, { recursive: true, force: true });
console.log(
  `strip-textures: removed build/textures (${files} files, ${(size / 1024 / 1024).toFixed(0)} MB).`,
);
