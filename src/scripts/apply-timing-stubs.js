#!/usr/bin/env node
/**
 * Ensure all canonical identities have DSL timings matching official text markers.
 */
const fs = require("fs");
const path = require("path");
const { ensureTimingStubs } = require("./dsl-audit-utils");
const { loadAllExpansionCards, loadSetDefs, SETS_DIR } = require("./card-dsl-utils");
const { buildIdentityIndex } = require("./identity-dsl");

function setPrefix(cardNo) {
  return String(cardNo).replace(/-.*$/, "");
}

function main() {
  const expansion = loadAllExpansionCards();
  const cardByNo = Object.fromEntries(expansion.map((c) => [c.cardNo, c]));
  const setDefs = loadSetDefs();
  const identityIndex = buildIdentityIndex(cardByNo, setDefs);
  const bySet = {};
  for (const [cardNo, def] of Object.entries(setDefs)) {
    const set = setPrefix(cardNo);
    if (!bySet[set]) bySet[set] = {};
    bySet[set][cardNo] = def;
  }

  let patched = 0;
  for (const [, canonNo] of identityIndex.canonicalByIdentity.entries()) {
    const card = cardByNo[canonNo];
    const set = setPrefix(canonNo);
    const prev = bySet[set]?.[canonNo];
    if (!prev) continue;
    const stubbed = ensureTimingStubs(card, prev, prev.abilities || []);
    if (JSON.stringify(stubbed) !== JSON.stringify(prev.abilities || [])) {
      bySet[set][canonNo] = { ...prev, abilities: stubbed };
      patched++;
    }
  }

  for (const [set, defs] of Object.entries(bySet)) {
    fs.writeFileSync(path.join(SETS_DIR, `${set}.json`), JSON.stringify(defs, null, 2) + "\n");
  }
  console.log(`Patched ${patched} canonical identities with timing stubs`);
}

main();
