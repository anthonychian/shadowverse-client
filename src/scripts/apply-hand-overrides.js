#!/usr/bin/env node
/**
 * Merge hand-authored-overrides.json into set JSON files.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const OVERRIDES_PATH = path.join(
  ROOT,
  "packages",
  "sve-engine",
  "data",
  "card-defs",
  "hand-authored-overrides.json",
);
const SETS_DIR = path.join(ROOT, "packages", "sve-engine", "data", "card-defs", "sets");

function setPrefix(cardNo) {
  return String(cardNo).replace(/-.*$/, "");
}

function main() {
  if (!fs.existsSync(OVERRIDES_PATH)) {
    console.log("No hand-authored-overrides.json");
    return;
  }
  const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"));
  const bySet = {};
  if (fs.existsSync(SETS_DIR)) {
    for (const file of fs.readdirSync(SETS_DIR).filter((f) => f.endsWith(".json"))) {
      bySet[file.replace(/\.json$/, "")] = JSON.parse(
        fs.readFileSync(path.join(SETS_DIR, file), "utf8"),
      );
    }
  }

  let applied = 0;
  for (const [cardNo, override] of Object.entries(overrides)) {
    const set = setPrefix(cardNo);
    if (!bySet[set]) bySet[set] = {};
    bySet[set][cardNo] = {
      ...bySet[set][cardNo],
      ...override,
      parseConfidence: "manual",
    };
    applied++;
  }

  for (const [set, defs] of Object.entries(bySet)) {
    fs.writeFileSync(
      path.join(SETS_DIR, `${set}.json`),
      JSON.stringify(defs, null, 2) + "\n",
    );
  }
  console.log(`Applied ${applied} hand-authored overrides to set JSON`);
}

main();
