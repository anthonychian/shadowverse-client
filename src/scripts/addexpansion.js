#!/usr/bin/env node

/**
 * One-shot pipeline to add a whole expansion of cards.
 *
 * Runs, in order:
 *   1. scrapecards.js      - scrape card data + download images from the official site
 *   2. compressimages.js   - shrink the downloaded PNGs (same engine as compressimage.io)
 *   3. generatecardfiles.js - update AllCards / AllCardsEvo / AllTokens / getCards
 *                             (+ CreateDeck.js UI wiring when --name is given)
 *
 * Usage:
 *   node src/scripts/addexpansion.js BP18 --name "Set Display Name"
 *
 * Options (all optional):
 *   --name "..."       Set display name -> also wires the deck-builder menu/filter
 *   --no-images        Skip image download in the scrape step
 *   --colors <N>       Palette size for compression (default 256, lower = smaller)
 *   --skip-scrape      Reuse the existing <EXPANSION>-cards.json / images
 *   --skip-compress    Don't compress images
 *   --dry-run          Preview the compress + generate steps without writing
 *
 * After it finishes, verify with:
 *   git diff src/decks/ src/pages/CreateDeck.js   (and check the new public/textures/ images)
 */

const { execFileSync } = require("child_process");
const path = require("path");

const argv = process.argv.slice(2);
const EXPANSION = argv[0];

if (!EXPANSION || EXPANSION.startsWith("--")) {
  console.error('Usage: node src/scripts/addexpansion.js <EXPANSION> --name "Set Name" [options]');
  console.error('Example: node src/scripts/addexpansion.js BP18 --name "Convergent Destinies"');
  console.error("Options: --no-images  --colors N  --skip-scrape  --skip-compress  --dry-run");
  process.exit(1);
}

function flag(name) {
  return argv.includes(name);
}
function value(name) {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : null;
}

const DISPLAY_NAME = value("--name");
const DRY_RUN = flag("--dry-run");
const COLORS = value("--colors");

const HERE = __dirname;

function run(label, script, args) {
  console.log(`\n${"=".repeat(60)}\n  ${label}\n${"=".repeat(60)}`);
  execFileSync("node", [path.join(HERE, script), ...args], { stdio: "inherit" });
}

try {
  if (!flag("--skip-scrape")) {
    const scrapeArgs = [EXPANSION];
    if (flag("--no-images")) scrapeArgs.push("--no-images");
    run("STEP 1/3 - Scraping cards", "scrapecards.js", scrapeArgs);
  } else {
    console.log("Skipping scrape (--skip-scrape).");
  }

  if (!flag("--skip-compress") && !flag("--no-images")) {
    const compressArgs = [EXPANSION];
    if (COLORS) compressArgs.push("--colors", COLORS);
    if (DRY_RUN) compressArgs.push("--dry-run");
    run("STEP 2/3 - Compressing images", "compressimages.js", compressArgs);
  } else {
    console.log("\nSkipping compression.");
  }

  const genArgs = [EXPANSION];
  if (DISPLAY_NAME) genArgs.push("--name", DISPLAY_NAME);
  if (DRY_RUN) genArgs.push("--dry-run");
  run("STEP 3/3 - Generating card files", "generatecardfiles.js", genArgs);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Done adding ${EXPANSION}${DISPLAY_NAME ? ` ("${DISPLAY_NAME}")` : ""}.`);
  if (!DISPLAY_NAME) {
    console.log(`  Tip: pass --name "Set Name" to also wire the deck-builder UI.`);
  }
  console.log(`  Verify: git diff src/decks/ src/pages/CreateDeck.js`);
  console.log(`${"=".repeat(60)}`);
} catch (err) {
  console.error(`\nPipeline failed during a step: ${err.message}`);
  process.exit(1);
}
