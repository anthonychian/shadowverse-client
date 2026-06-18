#!/usr/bin/env node

/**

 * Pattern-based parser: reads expansion card JSON and emits/merges starter DSL

 * into packages/sve-engine/data/card-defs/sets/<SET>.json

 *

 * Abilities are stored on the canonical printing per card identity; reprints inherit at runtime.

 *

 * Usage:

 *   node src/scripts/parse-effects-to-dsl.js --all

 *   node src/scripts/parse-effects-to-dsl.js --set BP01

 *   node src/scripts/parse-effects-to-dsl.js --file src/scripts/deck-scraped-cards.json

 */

const fs = require("fs");

const path = require("path");

const {

  parseKeywords,

  buildTokenMap,

  parseCardToDsl,

} = require("./effect-text-parser");

const { buildIdentityIndex, cardIdentityKey } = require("./identity-dsl");



const DEFAULT_INPUT = path.join(__dirname, "deck-scraped-cards.json");

const STUBS_OUTPUT = path.join(

  __dirname,

  "..",

  "..",

  "packages",

  "sve-engine",

  "data",

  "card-defs",

  "parsed-stubs.json",

);

const SETS_DIR = path.join(

  __dirname,

  "..",

  "..",

  "packages",

  "sve-engine",

  "data",

  "card-defs",

  "sets",

);



const OVERRIDES_PATH = path.join(
  __dirname,
  "..",
  "..",
  "packages",
  "sve-engine",
  "data",
  "card-defs",
  "hand-authored-overrides.json",
);

function loadOverrides() {
  if (!fs.existsSync(OVERRIDES_PATH)) return new Set();
  return new Set(Object.keys(JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"))));
}

function setPrefix(cardNo) {
  return String(cardNo).replace(/-.*$/, "");
}

  return String(cardNo).replace(/-.*$/, "");

}



function loadAllExpansionCards() {

  const cards = [];

  for (const file of fs.readdirSync(__dirname).filter((f) => f.endsWith("-cards.json"))) {

    cards.push(...JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8")));

  }

  return cards;

}



function loadSetFiles() {

  const bySet = {};

  if (!fs.existsSync(SETS_DIR)) return bySet;

  for (const file of fs.readdirSync(SETS_DIR).filter((f) => f.endsWith(".json"))) {

    bySet[file.replace(/\.json$/, "")] = JSON.parse(

      fs.readFileSync(path.join(SETS_DIR, file), "utf8"),

    );

  }

  return bySet;

}



function flushSetFiles(bySet) {

  fs.mkdirSync(SETS_DIR, { recursive: true });

  for (const [set, defs] of Object.entries(bySet)) {

    fs.writeFileSync(

      path.join(SETS_DIR, `${set}.json`),

      JSON.stringify(defs, null, 2) + "\n",

    );

  }

}



function parseEffectBlock(card, tokenMap) {

  return parseCardToDsl(card, tokenMap);

}



function statsFromCard(card) {

  const entry = {

    name: card.name?.replace(/\s+TOKEN$/i, "").trim(),

    class: card.class || "neutral",

  };

  if (card.type === "base" || card.type === "token") entry.printingType = card.type;

  if (card.type === "evolved") entry.printingType = "evolved";

  if (card.cost != null) entry.cost = card.cost;

  if (card.attack != null) entry.attack = card.attack;

  if (card.defense != null) entry.defense = card.defense;

  if (card.cardType) entry.cardType = card.cardType;

  if (card.traits?.length) entry.traits = card.traits;

  return entry;

}



function hasNoopOnly(abilities) {
  if (!abilities?.length) return true;
  return abilities.every((a) => {
    const eff = a.effect;
    if (!eff) return true;
    if (eff.op === "noop") return true;
    if (eff.op === "sequence") return eff.steps?.every((s) => s.op === "noop");
    return false;
  });
}

function isHandAuthored(existing, cardNo, overrideNos) {
  if (overrideNos?.has(cardNo)) return true;
  const entry = existing[cardNo];
  if (!entry?.abilities?.length) return false;
  return !hasNoopOnly(entry.abilities);
}



function mergeCard(

  card,

  parsed,

  setDefs,

  identityIndex,

  overrideNos,

  { onlyMissing = true, force = false } = {},

) {

  const setCode = setPrefix(card.cardNo);

  if (!setDefs[setCode]) setDefs[setCode] = {};

  const existing = setDefs[setCode];



  const key = cardIdentityKey(card.name, card.type || statsFromCard(card).printingType);

  const canonicalNo =

    identityIndex.canonicalByIdentity.get(key) ||

    identityIndex.canonicalByIdentity.get(

      cardIdentityKey(card.name, card.type || "base"),

    ) ||

    card.cardNo;

  const isCanonical = card.cardNo === canonicalNo;



  if (

    onlyMissing &&

    !force &&

    isHandAuthored(existing, card.cardNo, overrideNos) &&

    isCanonical

  ) {

    return { updated: false, skipped: true };

  }



  const entry = {

    ...statsFromCard(card),

    keywords: parsed.keywords,

    parseConfidence: parsed.confidence,

  };



  if (parsed.abilities.length && isCanonical) {

    const canonSet = setPrefix(canonicalNo);

    if (!setDefs[canonSet]) setDefs[canonSet] = {};

    const prev = setDefs[canonSet][canonicalNo] || existing[card.cardNo] || {};

    if (

      !onlyMissing ||

      force ||

      !prev.abilities?.length ||

      prev.abilities.every((a) => a.effect?.op === "noop")

    ) {

      setDefs[canonSet][canonicalNo] = {

        ...prev,

        ...entry,

        abilities: parsed.abilities,

      };

    }

  }



  const prevLocal = existing[card.cardNo] || {};

  existing[card.cardNo] = {

    ...prevLocal,

    ...entry,

    abilities: isCanonical

      ? setDefs[setPrefix(canonicalNo)]?.[canonicalNo]?.abilities ??

        prevLocal.abilities ??

        []

      : prevLocal.abilities ?? [],

  };



  return { updated: true, skipped: false };

}



function parseAllSets({ onlyMissing = true, force = false } = {}) {

  const allCards = loadAllExpansionCards();

  const tokenMap = buildTokenMap(allCards);

  const setDefs = loadSetFiles();

  const flatDefs = {};

  for (const defs of Object.values(setDefs)) Object.assign(flatDefs, defs);

  const identityIndex = buildIdentityIndex(

    Object.fromEntries(allCards.map((c) => [c.cardNo, c])),

    flatDefs,

  );

  const overrideNos = loadOverrides();

  let updated = 0;

  let skipped = 0;

  const stubs = {};



  for (const card of allCards) {

    const parsed = parseEffectBlock(card, tokenMap);

    if (parsed.keywords.length || parsed.abilities.length) {

      stubs[card.cardNo] = {

        keywords: parsed.keywords,

        abilities: parsed.abilities,

        parseConfidence: parsed.confidence,

      };

    }

    const result = mergeCard(card, parsed, setDefs, identityIndex, overrideNos, { onlyMissing, force });

    if (result.skipped) skipped++;

    else updated++;

  }



  flushSetFiles(setDefs);

  fs.mkdirSync(path.dirname(STUBS_OUTPUT), { recursive: true });

  fs.writeFileSync(STUBS_OUTPUT, JSON.stringify(stubs, null, 2) + "\n");



  return {

    updated,

    skipped,

    stubCount: Object.keys(stubs).length,

    setCount: Object.keys(setDefs).length,

  };

}



function loadCards(inputPath) {

  return JSON.parse(fs.readFileSync(inputPath, "utf8"));

}



function main() {

  const args = process.argv.slice(2);

  const setIdx = args.indexOf("--set");

  const fileIdx = args.indexOf("--file");

  const allSets = args.includes("--all");

  const force = args.includes("--force");

  const setCode = setIdx >= 0 ? args[setIdx + 1] : null;



  if (allSets) {

    const result = parseAllSets({ onlyMissing: !force, force });

    console.log(

      `Parsed all sets: ${result.updated} cards processed, ${result.skipped} hand-authored skipped, ${result.stubCount} stubs, ${result.setCount} set files`,

    );

    return;

  }



  const inputPath =

    fileIdx >= 0 ? args[fileIdx + 1] : setCode

      ? path.join(__dirname, `${setCode}-cards.json`)

      : DEFAULT_INPUT;



  if (!fs.existsSync(inputPath)) {

    console.error("Input not found:", inputPath);

    process.exit(1);

  }



  const allCards = loadAllExpansionCards();

  const tokenMap = buildTokenMap(allCards.length ? allCards : loadCards(inputPath));

  const cards = loadCards(inputPath);

  const stubs = {};

  for (const card of cards) {

    const parsed = parseEffectBlock(card, tokenMap);

    if (parsed.keywords.length || parsed.abilities.length) {

      stubs[card.cardNo] = {

        keywords: parsed.keywords,

        abilities: parsed.abilities,

        parseConfidence: parsed.confidence,

      };

    }

  }

  fs.mkdirSync(path.dirname(STUBS_OUTPUT), { recursive: true });

  fs.writeFileSync(STUBS_OUTPUT, JSON.stringify(stubs, null, 2) + "\n");

  console.log(`Wrote ${Object.keys(stubs).length} parsed stubs to ${STUBS_OUTPUT}`);



  if (setCode) {

    const setDefs = loadSetFiles();

    const flatDefs = {};

    for (const defs of Object.values(setDefs)) Object.assign(flatDefs, defs);

    const identityIndex = buildIdentityIndex(

      Object.fromEntries(allCards.map((c) => [c.cardNo, c])),

      flatDefs,

    );

    const overrideNos = loadOverrides();

    let added = 0;

    let skipped = 0;

    for (const card of cards.filter((c) => setPrefix(c.cardNo) === setCode)) {

      const parsed = parseEffectBlock(card, tokenMap);

      const result = mergeCard(card, parsed, setDefs, identityIndex, overrideNos, {

        onlyMissing: !force,

        force,

      });

      if (result.skipped) skipped++;

      else added++;

    }

    flushSetFiles(setDefs);

    const total = Object.keys(setDefs[setCode] || {}).length;

    console.log(

      `Merged ${setCode}: ${added} updated, ${skipped} skipped (hand-authored), ${total} total in set file`,

    );

  }

}



main();

