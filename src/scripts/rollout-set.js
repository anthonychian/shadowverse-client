#!/usr/bin/env node
/**
 * Per-expansion DSL rollout checklist.
 * Usage: node src/scripts/rollout-set.js BP01
 */
const { execSync } = require("child_process");
const path = require("path");

const set = process.argv[2];
if (!set) {
  console.error("Usage: node src/scripts/rollout-set.js <SET>  e.g. BP01");
  process.exit(1);
}

const root = path.join(__dirname, "..", "..");
const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
};

console.log(`=== Rollout checklist for ${set} ===`);

const cardsFile = path.join(__dirname, `${set}-cards.json`);
const fs = require("fs");
if (!fs.existsSync(cardsFile)) {
  console.error(`Missing ${cardsFile} — scrape expansion first.`);
  process.exit(1);
}

run(`node src/scripts/parse-effects-to-dsl.js --set ${set}`);
run("npm run build:engine");
run("node src/scripts/generate-manifest.js");
run(`node src/scripts/eval-card.js --set ${set} --inventory`);
run("npm run eval:scenarios");

console.log(`\n=== ${set} rollout pass complete ===`);
console.log("Next: LLM-evaluate non-keyword cards and update card-manifest.json evalStatus.");
