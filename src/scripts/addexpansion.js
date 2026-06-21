#!/usr/bin/env node

/**
 * One-shot pipeline to add a whole expansion of cards.
 *
 * Runs, in order:
 *   1. acquire cards + images:
 *        - default:   scrapecards.js     (EN site: card data + images)
 *        - --csv ...: csv-to-cards.js    (CSV is the data source) +
 *                     fetch-jp-images.js (JP site images) — for upcoming sets
 *                     with no EN release yet
 *   2. compressimages.js   - shrink the downloaded PNGs (same engine as compressimage.io)
 *   3. makethumbs.js       - build the deck-list thumbnails (public/textures/thumbs/)
 *   4. generatecardfiles.js - update AllCards / AllCardsEvo / AllTokens / getCards,
 *                             theme.js Set labels, and rebuild cardPrintings/cardData
 *
 * Usage:
 *   node src/scripts/addexpansion.js BP18 --name "Set Display Name"                 # EN scrape
 *   node src/scripts/addexpansion.js BP18 --csv ./BP18.csv --name "Neometropolis"   # CSV + JP images
 *
 * Options (all optional):
 *   --csv <path>       Build <EXPANSION>-cards.json from this CSV and pull images
 *                      from the JP site (shadowverse-evolve.com) instead of EN
 *   --name "..."       Set display name -> details.cardSet + deck-builder labels
 *   --no-images        Skip image download
 *   --colors <N>       Palette size for compression (default 256, lower = smaller)
 *   --skip-scrape      Reuse the existing <EXPANSION>-cards.json / images
 *   --skip-compress    Don't compress images
 *   --skip-thumbs      Don't (re)build thumbnails
 *   --dry-run          Preview every step without writing
 *
 * After it finishes, verify with:
 *   git diff src/decks/ src/pages/CreateDeck.js   (and check the new public/textures/ images)
 */

const { execFileSync } = require("child_process");
const path = require("path");

const argv = process.argv.slice(2);
const EXPANSION = argv[0];

if (!EXPANSION || EXPANSION.startsWith("--")) {
  console.error('Usage: node src/scripts/addexpansion.js <EXPANSION> [--csv <path>] --name "Set Name" [options]');
  console.error('Example (EN):  node src/scripts/addexpansion.js BP18 --name "Convergent Destinies"');
  console.error('Example (CSV): node src/scripts/addexpansion.js BP18 --csv ./BP18.csv --name "Neometropolis"');
  console.error("Options: --csv <path>  --no-images  --colors N  --skip-scrape  --skip-compress  --skip-thumbs  --dry-run");
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
const CSV_PATH = value("--csv"); // CSV/JP mode: CSV is the data source, JP site the images

const HERE = __dirname;

function run(label, script, args) {
  console.log(`\n${"=".repeat(60)}\n  ${label}\n${"=".repeat(60)}`);
  execFileSync("node", [path.join(HERE, script), ...args], { stdio: "inherit" });
}

try {
  if (flag("--skip-scrape")) {
    console.log("Skipping data/image acquisition (--skip-scrape).");
  } else if (CSV_PATH) {
    // CSV/JP mode: CSV -> <SET>-cards.json, images from the JP site.
    const csvArgs = [EXPANSION, CSV_PATH];
    if (DISPLAY_NAME) csvArgs.push("--name", DISPLAY_NAME);
    if (DRY_RUN) csvArgs.push("--dry-run");
    run("STEP 1/4 - Building cards from CSV", "csv-to-cards.js", csvArgs);

    if (flag("--no-images")) {
      console.log("\nSkipping JP image fetch (--no-images).");
    } else if (DRY_RUN && !require("fs").existsSync(path.join(HERE, `${EXPANSION}-cards.json`))) {
      // Dry run with no card file yet -> nothing to map image URLs from.
      console.log("\nSTEP 1/4 - Fetching JP images: would run after the CSV build (dry run).");
    } else {
      const jpArgs = [EXPANSION];
      if (DRY_RUN) jpArgs.push("--dry-run");
      run("STEP 1/4 - Fetching JP images", "fetch-jp-images.js", jpArgs);
    }
  } else {
    const scrapeArgs = [EXPANSION];
    if (flag("--no-images")) scrapeArgs.push("--no-images");
    run("STEP 1/4 - Scraping cards (EN)", "scrapecards.js", scrapeArgs);
  }

  if (!flag("--skip-compress") && !flag("--no-images")) {
    const compressArgs = [EXPANSION];
    if (COLORS) compressArgs.push("--colors", COLORS);
    if (DRY_RUN) compressArgs.push("--dry-run");
    run("STEP 2/4 - Compressing images", "compressimages.js", compressArgs);
  } else {
    console.log("\nSkipping compression.");
  }

  if (!flag("--skip-thumbs") && !flag("--no-images")) {
    const thumbArgs = [EXPANSION];
    if (DRY_RUN) thumbArgs.push("--dry-run");
    run("STEP 3/4 - Building thumbnails", "makethumbs.js", thumbArgs);
  } else {
    console.log("\nSkipping thumbnails.");
  }

  const genArgs = [EXPANSION];
  if (DISPLAY_NAME) genArgs.push("--name", DISPLAY_NAME);
  if (DRY_RUN) genArgs.push("--dry-run");
  run("STEP 4/4 - Generating card files", "generatecardfiles.js", genArgs);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Done adding ${EXPANSION}${DISPLAY_NAME ? ` ("${DISPLAY_NAME}")` : ""}.`);
  if (!DISPLAY_NAME) {
    console.log(`  Tip: pass --name "Set Name" to also wire the deck-builder UI.`);
  }
  console.log(`  Verify: git diff src/decks/ src/components/deckbuilder/theme.js   (and new public/textures/ images + thumbs/)`);
  console.log(`${"=".repeat(60)}`);
} catch (err) {
  console.error(`\nPipeline failed during a step: ${err.message}`);
  process.exit(1);
}
