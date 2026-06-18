#!/usr/bin/env node
/**
 * Generate starter YAML scenario from card DSL shape.
 *
 * Usage: node src/scripts/generate-scenario-stub.js BP12-041EN
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const ENGINE_DIST = path.join(ROOT, "packages", "sve-engine", "dist");
const SCENARIOS_DIR = path.join(ROOT, "packages", "sve-engine", "scenarios", "cards");

function collectExpectedZones(effect, zones = new Set()) {
  if (!effect) return zones;
  if (effect.op === "draw") zones.add("hand");
  if (effect.op === "summon" || effect.op === "reviveToField") zones.add("field");
  if (effect.op === "dealDamage" || effect.op === "healLeader") zones.add("leaderDef");
  if (effect.op === "sequence") effect.steps?.forEach((s) => collectExpectedZones(s, zones));
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    effect.options?.forEach((o) => collectExpectedZones(o.effect, zones));
  }
  if (effect.op === "if") {
    collectExpectedZones(effect.then, zones);
    collectExpectedZones(effect.else, zones);
  }
  if (effect.op === "optionalCost") {
    collectExpectedZones(effect.then, zones);
  }
  return zones;
}

function slugify(name) {
  return String(name || "card")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function main() {
  const cardNo = process.argv[2];
  if (!cardNo) {
    console.error("Usage: node src/scripts/generate-scenario-stub.js <cardNo>");
    process.exit(1);
  }
  if (!fs.existsSync(path.join(ENGINE_DIST, "index.js"))) {
    console.error("Build engine first: npm run build:engine");
    process.exit(1);
  }
  const { getCardDef } = require(ENGINE_DIST);
  const def = getCardDef(cardNo);
  if (!def) {
    console.error("Unknown card:", cardNo);
    process.exit(1);
  }

  const ability = def.abilities?.find(
    (a) => a.timing === "fanfare" || a.timing === "spell" || a.timing === "activated",
  );
  const zones = ability ? collectExpectedZones(ability.effect) : new Set(["hand"]);

  const setupHand = ability?.timing === "activated" ? [] : [cardNo];
  const setupField = ability?.timing === "activated" ? [cardNo] : [];

  const yaml = `id: ${slugify(def.name)}-${cardNo.toLowerCase()}
cardNo: ${cardNo}
name: "${def.name} — smoke stub"
setup:
  activePlayer: 0
  pp: [10, 10]
  leaderDef: [20, 20]
  hand:
    - ${JSON.stringify(setupHand)}
    - []
  field:
    - ${JSON.stringify(setupField.length ? setupField : ["BP07-001EN"])}
    - ["BP07-001EN"]
  deck:
    - ${JSON.stringify(Array(5).fill("BP07-002EN"))}
    - ${JSON.stringify(Array(5).fill("BP07-002EN"))}
actions:
  - ${ability?.timing === "activated" ? `{ activate: ${cardNo} }` : `{ play: ${cardNo} }`}
  - { autoResolve: true }
assertions:
  - { type: noPendingChoices }
# TODO: refine assertions for zones: ${[...zones].join(", ")}
`;

  fs.mkdirSync(SCENARIOS_DIR, { recursive: true });
  const outPath = path.join(SCENARIOS_DIR, `${slugify(def.name)}-${cardNo}.yaml`);
  fs.writeFileSync(outPath, yaml);
  console.log(`Wrote ${outPath}`);
}

main();
