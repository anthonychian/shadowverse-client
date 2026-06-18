#!/usr/bin/env node
/**
 * Roll out DSL parsing for all expansion card files except Vanguard crossovers.
 *
 * Usage: node src/scripts/rollout-all-expansions.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SCRIPTS = __dirname;
const ROOT = path.join(__dirname, "..", "..");
const SET_ROLLOUT_PATH = path.join(
  ROOT,
  "packages",
  "sve-engine",
  "data",
  "set-rollout.json",
);

/** Cardfight!! Vanguard crossover sets — skipped per user request. */
const VANGUARD_SETS = new Set(["CP03", "CSD03a", "CSD03b"]);

const SKIP = new Set(["deck-scraped", "extra", ...VANGUARD_SETS]);

function listExpansionSets() {
  return fs
    .readdirSync(SCRIPTS)
    .filter((f) => f.endsWith("-cards.json"))
    .map((f) => f.replace(/-cards\.json$/, ""))
    .filter((set) => !SKIP.has(set))
    .sort();
}

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function main() {
  const sets = listExpansionSets();
  console.log(`Rolling out ${sets.length} expansions (skipping: ${[...SKIP].join(", ")})`);

  const results = {};
  const skipped = [...VANGUARD_SETS].map((set) => ({
    set,
    status: "skipped",
    reason: "Vanguard crossover expansion",
  }));

  try {
    const out = execSync("node src/scripts/parse-effects-to-dsl.js --all", {
      cwd: ROOT,
      encoding: "utf8",
    });
    console.log(out.trim());
    for (const set of sets) {
      const cardsFile = path.join(SCRIPTS, `${set}-cards.json`);
      const total = JSON.parse(fs.readFileSync(cardsFile, "utf8")).length;
      results[set] = {
        status: "parsed",
        parsedAt: new Date().toISOString().slice(0, 10),
        total,
      };
      console.log(`✓ ${set}`);
    }
  } catch (e) {
    console.error("Parse failed:", e.message);
    process.exit(1);
  }

  run("node src/scripts/regenerate-deck-cards.js");
  run("npm run build:engine");
  run("node src/scripts/generate-manifest.js");
  run("npm run eval:scenarios");

  const rollout = {};
  for (const [set, info] of Object.entries(results)) {
    rollout[set] = info;
  }
  for (const s of skipped) {
    rollout[s.set] = { status: s.status, reason: s.reason };
  }

  fs.mkdirSync(path.dirname(SET_ROLLOUT_PATH), { recursive: true });
  fs.writeFileSync(SET_ROLLOUT_PATH, JSON.stringify(rollout, null, 2) + "\n");
  console.log(`\nWrote ${SET_ROLLOUT_PATH}`);

  const ok = Object.values(results).filter((r) => r.status === "parsed").length;
  const err = Object.values(results).filter((r) => r.status === "error").length;
  console.log(`\nDone: ${ok} parsed, ${err} errors, ${VANGUARD_SETS.size} Vanguard sets skipped`);
  if (err > 0) process.exit(1);
}

main();
