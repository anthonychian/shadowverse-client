#!/usr/bin/env node
/**
 * Coverage dashboard for card definition pipeline.
 * Usage: node src/scripts/card-coverage.js [--set BP01]
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const MANIFEST_PATH = path.join(ROOT, "packages", "sve-engine", "data", "card-manifest.json");
const script = path.join(__dirname, "mergecards.js");

console.log(execSync(`node "${script}" --report`, { encoding: "utf8" }));

if (!fs.existsSync(MANIFEST_PATH)) {
  console.log("\nNo card-manifest.json — run: npm run generate:manifest");
  process.exit(0);
}

const setFilter = process.argv.includes("--set")
  ? process.argv[process.argv.indexOf("--set") + 1]
  : null;

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const entries = Object.entries(manifest).filter(
  ([, m]) => !setFilter || m.set === setFilter,
);

const bySet = {};
const byDsl = {};
const byEval = {};
const byTier = {};
let blockers = 0;

for (const [, m] of entries) {
  bySet[m.set] = (bySet[m.set] ?? 0) + 1;
  byDsl[m.dslStatus] = (byDsl[m.dslStatus] ?? 0) + 1;
  byEval[m.evalStatus] = (byEval[m.evalStatus] ?? 0) + 1;
  byTier[m.complexityTier] = (byTier[m.complexityTier] ?? 0) + 1;
  if (m.blockers?.length) blockers++;
}

console.log(`\nManifest summary${setFilter ? ` (${setFilter})` : ""}: ${entries.length} cards`);
console.log("  By set:", bySet);
console.log("  By dslStatus:", byDsl);
console.log("  By evalStatus:", byEval);
console.log("  By complexityTier:", byTier);
console.log(`  Cards with engine blockers: ${blockers}`);
