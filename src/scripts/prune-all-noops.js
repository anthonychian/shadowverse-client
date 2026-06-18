#!/usr/bin/env node
/**
 * Prune noop nodes from all set DSL and drop emptied abilities.
 */
const fs = require("fs");
const path = require("path");
const { pruneNoopEffect } = require("./effect-text-parser");

const ROOT = path.join(__dirname, "..", "..");
const SETS_DIR = path.join(ROOT, "packages", "sve-engine", "data", "card-defs", "sets");

function main() {
  let prunedCards = 0;
  for (const file of fs.readdirSync(SETS_DIR).filter((f) => f.endsWith(".json"))) {
    const filePath = path.join(SETS_DIR, file);
    const defs = JSON.parse(fs.readFileSync(filePath, "utf8"));
    let changed = false;
    for (const [cardNo, def] of Object.entries(defs)) {
      if (!def.abilities?.length) continue;
      const next = [];
      for (const ability of def.abilities) {
        const effect = pruneNoopEffect(ability.effect);
        if (!effect) continue;
        next.push({ ...ability, effect });
      }
      if (next.length !== def.abilities.length || JSON.stringify(next) !== JSON.stringify(def.abilities)) {
        defs[cardNo] = { ...def, abilities: next };
        prunedCards++;
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(defs, null, 2) + "\n");
    }
  }
  console.log(`Pruned noop from ${prunedCards} card definitions`);
}

main();
