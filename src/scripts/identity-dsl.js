/**
 * Shared card-identity helpers for DSL reuse across printings.
 */
const { normalizeIdentityName } = require("./scrape-utils");

function cardIdentityKey(name, printingType) {
  const role = printingType || "base";
  const isToken = role === "token" || /\s+TOKEN$/i.test(name || "");
  const isEvolved =
    role === "evolved" ||
    (role !== "base" && role !== "token" && /\s+Evolved$/i.test(name || ""));
  const kind = isToken ? "token" : isEvolved ? "evolved" : "base";
  return `${normalizeIdentityName(name || "")}|${kind}`;
}

function isCanonicalSlot(cardNo) {
  return /^[A-Z0-9]+-(\d+|T\d+)EN$/i.test(cardNo);
}

function abilityRichness(abilities) {
  if (!abilities?.length) return 0;
  return JSON.stringify(abilities).length;
}

function pickCanonicalCardNo(cards) {
  if (!cards.length) return undefined;
  return [...cards].sort((a, b) => {
    const aAbil = abilityRichness(a.def?.abilities);
    const bAbil = abilityRichness(b.def?.abilities);
    if (bAbil !== aAbil) return bAbil - aAbil;
    const aCanon = isCanonicalSlot(a.cardNo) ? 1 : 0;
    const bCanon = isCanonicalSlot(b.cardNo) ? 1 : 0;
    if (bCanon !== aCanon) return bCanon - aCanon;
    return a.cardNo.localeCompare(b.cardNo);
  })[0].cardNo;
}

function buildIdentityIndex(expansionCards, handDefs = {}) {
  const byIdentity = new Map();
  const cardNoToIdentity = new Map();

  const allNos = new Set([
    ...Object.keys(expansionCards),
    ...Object.keys(handDefs),
  ]);

  for (const cardNo of allNos) {
    const scraped = expansionCards[cardNo];
    const def = handDefs[cardNo];
    const name = def?.name || scraped?.name || cardNo;
    const printingType = def?.printingType || scraped?.type || "base";
    const key = cardIdentityKey(name, printingType);
    if (!byIdentity.has(key)) byIdentity.set(key, []);
    const entry = { cardNo, name, printingType, def: def || {}, scraped };
    byIdentity.get(key).push(entry);
    cardNoToIdentity.set(cardNo, key);
  }

  const canonicalByIdentity = new Map();
  for (const [key, members] of byIdentity) {
    canonicalByIdentity.set(key, pickCanonicalCardNo(members));
  }

  return { byIdentity, cardNoToIdentity, canonicalByIdentity };
}

function resolveAbilitiesForCard(cardNo, handDefs, identityIndex) {
  const direct = handDefs[cardNo]?.abilities;
  if (direct?.length) return direct;

  const key = identityIndex.cardNoToIdentity.get(cardNo);
  if (!key) return [];

  const members = identityIndex.byIdentity.get(key) || [];
  let best = [];
  for (const m of members) {
    const ab = handDefs[m.cardNo]?.abilities;
    if (abilityRichness(ab) > abilityRichness(best)) best = ab || [];
  }
  return best;
}

function resolveDefOverlayForCard(cardNo, handDefs, identityIndex) {
  const direct = handDefs[cardNo];
  const abilities = resolveAbilitiesForCard(cardNo, handDefs, identityIndex);
  if (!abilities.length && !direct) return direct;

  const key = identityIndex.cardNoToIdentity.get(cardNo);
  const members = key ? identityIndex.byIdentity.get(key) || [] : [];
  let bestDef = direct || {};
  let bestScore = abilityRichness(direct?.abilities);
  for (const m of members) {
    const d = handDefs[m.cardNo];
    if (!d) continue;
    const score = abilityRichness(d.abilities);
    if (score > bestScore) {
      bestScore = score;
      bestDef = d;
    }
  }

  if (abilities.length) {
    return { ...bestDef, ...direct, abilities };
  }
  return direct || bestDef;
}

module.exports = {
  cardIdentityKey,
  isCanonicalSlot,
  abilityRichness,
  pickCanonicalCardNo,
  buildIdentityIndex,
  resolveAbilitiesForCard,
  resolveDefOverlayForCard,
};
