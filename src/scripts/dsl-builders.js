/**
 * Shared DSL builders for effect-text-parser and hand-authored overrides.
 * Lesson (X) = banish X Magical Item tokens from EX area.
 */
const { normalizeIdentityName } = require("./scrape-utils");

const MAGICAL_ITEM = { trait: "Magical Item" };

function lessonBanishCost(count) {
  return { op: "banishFromExArea", filter: MAGICAL_ITEM, count };
}

function lessonOptionalCost(count, thenEffect, label) {
  return {
    op: "optionalCost",
    label: label || `Lesson (${count})`,
    cost: lessonBanishCost(count),
    then: thenEffect,
  };
}

function lessonActivateCost(count, extra = {}) {
  return {
    ...extra,
    banishFromExArea: MAGICAL_ITEM,
    banishCount: count,
  };
}

function traitFieldDamage(trait, multiplier = 1) {
  return { op: "traitFieldCount", trait, multiplier };
}

function namedFieldDamage(identityName, multiplier = 1) {
  return {
    op: "namedIdentityFieldCount",
    identityName: normalizeIdentityName(identityName),
    multiplier,
  };
}

function handExAreaTotalDamage() {
  return { op: "handExAreaTotal" };
}

function exAreaCountDamage() {
  return { op: "exAreaCount" };
}

function targetAttackDamage() {
  return { op: "targetAttack" };
}

function selfAttackDamage() {
  return { op: "selfAttack" };
}

function dealEnemyFollower(amount, count = 1, extra = {}) {
  return {
    op: "dealDamage",
    amount,
    targets: { type: "enemyFollower", count, ...extra },
  };
}

function dealEnemyFieldCard(amount) {
  return {
    op: "dealDamage",
    amount,
    targets: { type: "enemyFieldCard", count: 1 },
  };
}

function dealSelfLeader(amount) {
  return {
    op: "dealDamage",
    amount,
    targets: { type: "selfLeader" },
  };
}

function buffSelf(atk, def) {
  return {
    op: "buff",
    atk,
    def: def ?? atk,
    targets: { type: "self" },
  };
}

function buffSelfFollower(atk, def, count = 1, excludeSelf = false) {
  return {
    op: "buff",
    atk,
    def: def ?? atk,
    targets: { type: "selfFollower", count, excludeSelf },
  };
}

function ifThen(condition, thenEffect, elseEffect) {
  const out = { op: "if", condition, then: thenEffect };
  if (elseEffect) out.else = elseEffect;
  return out;
}

function sequence(...steps) {
  const flat = steps.flat().filter(Boolean);
  if (flat.length === 0) return { op: "noop" };
  if (flat.length === 1) return flat[0];
  return { op: "sequence", steps: flat };
}

function evolveSelf(triggerOnEvolve = false) {
  return {
    op: "autoEvolveIf",
    condition: { type: "always" },
    triggerOnEvolve: !!triggerOnEvolve,
  };
}

function evolveDeckFaceupCount(filter) {
  return { op: "evolveDeckFaceupCount", filter };
}

function turnEvolveDeck(orientation, count, filter, allMatching = false) {
  return {
    op: "turnEvolveDeck",
    orientation,
    count,
    ...(filter ? { filter } : {}),
    ...(allMatching ? { allMatching: true } : {}),
  };
}

function selectEvolveDeckTurn(filter, face, turnTo, thenEffect, optional) {
  return {
    op: "selectEvolveDeckCard",
    ...(filter ? { filter } : {}),
    ...(face ? { face } : {}),
    ...(turnTo ? { turnTo } : {}),
    ...(thenEffect ? { then: thenEffect } : {}),
    ...(optional ? { optional: true } : {}),
  };
}

function parseClassFromBracket(text) {
  const m = String(text).match(
    /\[(forestcraft|swordcraft|runecraft|dragoncraft|shadowcraft|abysscraft|havencraft|portalcraft|neutral)\]/i,
  );
  if (!m) return null;
  const map = {
    forestcraft: "forest",
    swordcraft: "sword",
    runecraft: "rune",
    dragoncraft: "dragon",
    shadowcraft: "abyss",
    abysscraft: "abyss",
    havencraft: "haven",
    portalcraft: "portal",
    neutral: "neutral",
  };
  return map[m[1].toLowerCase()];
}

function parseInlineCondition(text) {
  const t = String(text).trim();
  if (/^overflow is active for you$/i.test(t)) return { type: "overflow" };
  if (/^sanguine is active for you$/i.test(t)) return { type: "sanguine" };
  const evoFace = t.match(/^there are at least (\d+) faceup evolved followers in your evolve deck/i);
  if (evoFace) {
    return { type: "evolveDeckFaceupMin", count: parseInt(evoFace[1], 10), filter: { cardType: "follower" } };
  }
  const evoFaceNamed = t.match(
    /^there are at least (\d+) faceup evolved followers named (.+?) in your evolve deck/i,
  );
  if (evoFaceNamed) {
    return {
      type: "evolveDeckFaceupMin",
      count: parseInt(evoFaceNamed[1], 10),
      filter: { identityName: normalizeIdentityName(evoFaceNamed[2].trim()) },
    };
  }
  const classSpells = t.match(
    /^there are at least (\d+) \[(forestcraft|swordcraft|runecraft|dragoncraft|shadowcraft|abysscraft|havencraft|portalcraft)\] spells with different names in your cemetery/i,
  );
  if (classSpells) {
    const cardClass = parseClassFromBracket(`[${classSpells[2]}]`);
    if (cardClass) {
      return { type: "cemeteryClassSpellNamesMin", cardClass, count: parseInt(classSpells[1], 10) };
    }
  }
  const nameOnField = t.match(/^there'?s a follower with "(.+?)" in its name on your field/i);
  if (nameOnField) {
    return { type: "identityNameOnField", identityNameContains: nameOnField[1].trim() };
  }
  const cemTrait = t.match(/^there are at least (\d+) (.+?) cards in your cemetery$/i);
  if (cemTrait) {
    return {
      type: "ownCemeteryTraitMin",
      trait: cemTrait[2].trim(),
      count: parseInt(cemTrait[1], 10),
    };
  }
  const fieldTrait = t.match(/^there are at least (\d+) (.+?) cards on your field$/i);
  if (fieldTrait) {
    return {
      type: "fieldTraitMin",
      trait: fieldTrait[2].trim(),
      count: parseInt(fieldTrait[1], 10),
    };
  }
  const oppCem = t.match(/^there are at least (\d+) cards in opponents'? cemeteries$/i);
  if (oppCem) return { type: "opponentCemeteryMin", count: parseInt(oppCem[1], 10) };
  if (/^there is an amulet on your field$/i.test(t)) return { type: "amuletOnField" };
  const pp = t.match(/^you have at least (\d+) play points$/i);
  if (pp) return { type: "ppMin", count: parseInt(pp[1], 10) };
  const hand = t.match(/^you have at least (\d+) cards in your hand$/i);
  if (hand) return { type: "handMin", count: parseInt(hand[1], 10) };
  return null;
}

function parseVariableDamageAmount(text) {
  const t = String(text).trim();
  if (/^x equals the selected follower's attack$/i.test(t)) return targetAttackDamage();
  if (/^x equals the number of cards in your ex area$/i.test(t)) return exAreaCountDamage();
  if (
    /^x equals the total number of cards in your hand and ex area$/i.test(t) ||
    /^x equals the number of cards in your hand and ex area$/i.test(t)
  ) {
    return handExAreaTotalDamage();
  }
  if (/^x equals the number of cards you've played this turn/i.test(t)) {
    return { op: "cardsPlayedThisTurn", excludeSelf: /excluding this card/i.test(t) };
  }
  if (/^x equals the number of followers with ward on your field/i.test(t)) {
    return { op: "wardFieldCount" };
  }
  if (/^x equals the number of faceup evolved followers in your evolve deck/i.test(t)) {
    return evolveDeckFaceupCount({ cardType: "follower" });
  }
  if (/^x equals the number of faceup followers in your evolve deck/i.test(t)) {
    return evolveDeckFaceupCount();
  }
  if (/^x equals this follower's attack$/i.test(t)) {
    return selfAttackDamage();
  }
  if (/^x equals the number of cards in your hand$/i.test(t)) {
    return { op: "handCount" };
  }
  const chosen = t.match(/^x equals a number of your choice from (\d+) to (\d+)$/i);
  if (chosen) {
    return { op: "chosenNumber", min: parseInt(chosen[1], 10), max: parseInt(chosen[2], 10) };
  }
  return null;
}

function parseLessonPrefix(text) {
  const m = text.match(/^Lesson\s*\((\d+)\):\s*(.+)$/i);
  if (!m) return null;
  return { count: parseInt(m[1], 10), rest: m[2].trim() };
}

function parseMultiplierDamage(text) {
  const named = text.match(
    /damage equal to (\d+) times the number of cards named (.+?) on your field/i,
  );
  if (named) {
    return {
      amount: namedFieldDamage(named[2], parseInt(named[1], 10)),
      confidence: "review",
    };
  }
  const trait = text.match(
    /damage equal to (?:the number of|(\d+) times the number of) (\w+(?:\s+\w+)?) (?:followers?|cards?) on your field/i,
  );
  if (trait) {
    const mult = trait[1] ? parseInt(trait[1], 10) : 1;
    return { amount: traitFieldDamage(trait[2], mult), confidence: "review" };
  }
  const timesTrait = text.match(
    /deal it (\d+) times the number of (\w+(?:\s+\w+)?) (?:followers?|cards?) on your field/i,
  );
  if (timesTrait) {
    return {
      amount: traitFieldDamage(timesTrait[2], parseInt(timesTrait[1], 10)),
      confidence: "review",
    };
  }
  if (/damage equal to the number of cards in your hand and ex area/i.test(text)) {
    return { amount: handExAreaTotalDamage(), confidence: "review" };
  }
  if (/damage equal to the number of cards in your ex area/i.test(text)) {
    return { amount: exAreaCountDamage(), confidence: "review" };
  }
  if (/damage equal to the number of faceup evolved followers in your evolve deck/i.test(text)) {
    return { amount: evolveDeckFaceupCount({ cardType: "follower" }), confidence: "review" };
  }
  if (/damage equal to the number of/i.test(text)) {
    const t = text.match(/number of (\w+(?:\s+\w+)?) (?:followers?|cards?)/i);
    if (t) return { amount: traitFieldDamage(t[1], 1), confidence: "manual" };
  }
  return null;
}

function wrapConditionalSelect(targets, conditionText, innerEffect) {
  const cond = parseInlineCondition(conditionText);
  if (!cond) return innerEffect;
  const base = innerEffect;
  if (base.op === "dealDamage" && base.targets?.type === "enemyFollower") {
    return ifThen(cond, base);
  }
  return ifThen(cond, base);
}

function resolveToken(nameRaw, tokenMap) {
  const aliases = {
    "magical item": "Cool Earrings",
    "assembly droid": "Assembly Droid",
    "ghost": "Ghost",
    "fable": "Fable",
    "fairy wisp": "Fairy Wisp",
    "repair mode": "Repair Mode",
  };
  let cleaned = normalizeIdentityName(
    String(nameRaw)
      .replace(/\s+tokens?$/i, "")
      .replace(/^(?:a|an)\s+/i, "")
      .trim(),
  );
  const aliasKey = cleaned.toLowerCase();
  if (aliases[aliasKey]) cleaned = normalizeIdentityName(aliases[aliasKey]);
  const cardNo = tokenMap?.nameToCardNo?.[cleaned];
  if (cardNo) return { tokenCardNo: cardNo, tokenName: cleaned };
  return { tokenName: cleaned };
}

module.exports = {
  MAGICAL_ITEM,
  lessonBanishCost,
  lessonOptionalCost,
  lessonActivateCost,
  traitFieldDamage,
  namedFieldDamage,
  handExAreaTotalDamage,
  exAreaCountDamage,
  targetAttackDamage,
  selfAttackDamage,
  dealEnemyFollower,
  dealEnemyFieldCard,
  dealSelfLeader,
  buffSelf,
  buffSelfFollower,
  ifThen,
  sequence,
  evolveSelf,
  evolveDeckFaceupCount,
  turnEvolveDeck,
  selectEvolveDeckTurn,
  parseClassFromBracket,
  parseInlineCondition,
  parseVariableDamageAmount,
  parseLessonPrefix,
  parseMultiplierDamage,
  wrapConditionalSelect,
  resolveToken,
};
