#!/usr/bin/env node
/**
 * Pattern-based parser: reads deck-scraped-cards.json and emits starter DSL
 * in packages/sve-engine/data/card-defs/parsed-stubs.json for human review.
 *
 * Full authoritative defs live in deck-cards.json (hand-tuned after parsing).
 *
 * Usage: node src/scripts/parse-effects-to-dsl.js
 */
const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "deck-scraped-cards.json");
const OUTPUT = path.join(
  __dirname,
  "..",
  "..",
  "packages",
  "sve-engine",
  "data",
  "card-defs",
  "parsed-stubs.json",
);

const TOKEN_MAP = {
  "Glittering Gold": "BP14-T02EN",
  Sootspawn: "BP14-T01EN",
  "Assembly Droid": "BP17-T17EN",
  "Repair Mode": "BP17-T18EN",
};

function parseKeywords(text) {
  const kw = [];
  if (/\bStorm\b/i.test(text)) kw.push("storm");
  if (/\bWard\b/i.test(text)) kw.push("ward");
  if (/\[fanfare\]/i.test(text)) kw.push("fanfare");
  if (/\[lastwords\]/i.test(text)) kw.push("lastWords");
  if (/\[evolve\]/i.test(text)) kw.push("evolve");
  if (/\[quick\]/i.test(text)) kw.push("quick");
  if (/\bStrike\b/i.test(text) || /Strike\s*-/i.test(text)) kw.push("strike");
  if (/\bIntimidate\b/i.test(text)) kw.push("intimidate");
  if (/\bAura\b/i.test(text)) kw.push("aura");
  if (/\[adv\]/i.test(text)) kw.push("advanced");
  return kw;
}

function tokenSummon(text) {
  for (const [name, cardNo] of Object.entries(TOKEN_MAP)) {
    if (text.includes(name)) {
      const m = text.match(new RegExp(`(\\d+)\\s+${name}`, "i"));
      const count = m ? parseInt(m[1], 10) : 1;
      const zone = /EX area/i.test(text) ? "exArea" : "field";
      return { op: "summon", tokenCardNo: cardNo, count, zone };
    }
  }
  return null;
}

function parseEffectBlock(text) {
  const abilities = [];
  const keywords = parseKeywords(text);

  if (/\[fanfare\][^]*?Draw a card/i.test(text)) {
    const steps = [{ op: "draw", count: 1 }];
    const discard = /Discard a card/i.test(text);
    if (discard) steps.push({ op: "discard", count: 1 });
    const tok = tokenSummon(text);
    if (tok) steps.push(tok);
    abilities.push({
      timing: "fanfare",
      effect: steps.length === 1 ? steps[0] : { op: "sequence", steps },
    });
  } else if (/\[fanfare\][^]*?Bury the top (\d+)/i.test(text)) {
    const m = text.match(/Bury the top (\d+)/i);
    abilities.push({
      timing: "fanfare",
      effect: { op: "mill", count: parseInt(m[1], 10) },
    });
  } else if (/\[fanfare\][^]*?Summon/i.test(text)) {
    const tok = tokenSummon(text);
    if (tok) abilities.push({ timing: "fanfare", effect: tok });
  } else if (/\[lastwords\][^]*?leader.*\+(\d+)/i.test(text)) {
    const m = text.match(/leader.*\+(\d+)/i);
    abilities.push({
      timing: "lastWords",
      effect: { op: "healLeader", amount: parseInt(m[1], 10) },
    });
  } else if (/On Evolve/i.test(text)) {
    const tok = tokenSummon(text);
    if (tok) abilities.push({ timing: "onEvolve", effect: tok });
    else if (/Deal (\d+) damage/i.test(text)) {
      const m = text.match(/Deal (\d+) damage/i);
      abilities.push({
        timing: "onEvolve",
        effect: {
          op: "dealDamage",
          amount: parseInt(m[1], 10),
          targets: { type: "enemyFollower", count: 1 },
        },
      });
    }
  } else if (text.includes("Choose")) {
    abilities.push({
      timing: text.includes("[quick]") ? "spell" : "spell",
      effect: { op: "choose", min: 1, max: 1, options: [{ label: "TODO", effect: { op: "draw", count: 1 } }] },
      quick: /\[quick\]/i.test(text),
    });
  } else if (/Deal (\d+) damage/i.test(text) && !text.includes("Choose")) {
    const m = text.match(/Deal (\d+) damage/i);
    abilities.push({
      timing: "spell",
      effect: {
        op: "dealDamage",
        amount: parseInt(m[1], 10),
        targets: { type: "enemyFollower", count: 1 },
      },
    });
  } else if (/Draw a card/i.test(text) && !/\[fanfare\]/i.test(text)) {
    abilities.push({
      timing: "spell",
      effect: { op: "draw", count: 1 },
    });
  }

  return { keywords: [...new Set(keywords)], abilities };
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error("Run scrapecardnos.js first to create", INPUT);
    process.exit(1);
  }
  const cards = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  const out = {};
  for (const card of cards) {
    const parsed = parseEffectBlock(card.cardText || "");
    if (parsed.keywords.length || parsed.abilities.length) {
      out[card.cardNo] = parsed;
    }
  }
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  console.log(`Wrote ${Object.keys(out).length} parsed stubs to ${OUTPUT}`);
  console.log("Review and merge into deck-cards.json as needed.");
}

main();
