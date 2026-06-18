/**
 * Comprehensive stub pattern library — covers remaining noop labels.
 * Called from noop-patterns.js before the core matcher.
 */
const {
  lessonOptionalCost,
  parseLessonPrefix,
  parseMultiplierDamage,
  parseInlineCondition,
  parseVariableDamageAmount,
  traitFieldDamage,
  namedFieldDamage,
  dealEnemyFollower,
  dealEnemyFieldCard,
  dealSelfLeader,
  buffSelf,
  buffSelfFollower,
  ifThen,
  sequence,
  evolveSelf,
  wrapConditionalSelect,
  handExAreaTotalDamage,
  exAreaCountDamage,
  targetAttackDamage,
  selfAttackDamage,
  evolveDeckFaceupCount,
  turnEvolveDeck,
  selectEvolveDeckTurn,
  parseClassFromBracket,
} = require("./dsl-builders");
const { resolveToken } = require("./dsl-builders");

function traitFilter(name) {
  const t = String(name).trim();
  if (/^\[(.+?)\]$/i.test(t)) {
    const map = {
      forestcraft: "forest",
      swordcraft: "sword",
      runecraft: "rune",
      dragoncraft: "dragon",
      shadowcraft: "abyss",
      bloodcraft: "abyss",
      havencraft: "haven",
      portalcraft: "portal",
      neutral: "neutral",
    };
    const key = t.replace(/[\[\]]/g, "").toLowerCase();
    if (map[key]) return { cardClass: map[key] };
  }
  return { trait: t.replace(/\s+follower$/i, "") };
}

function parseDamageEqualTail(tail) {
  if (/^this follower's attack/i.test(tail)) {
    return selfAttackDamage();
  }
  if (/^its attack/i.test(tail) || /^the selected follower's attack/i.test(tail)) {
    return targetAttackDamage();
  }
  if (/^the number of cards in your hand and ex area/i.test(tail)) {
    return handExAreaTotalDamage();
  }
  if (/^the number of cards in your ex area/i.test(tail)) {
    return exAreaCountDamage();
  }
  if (/^the number of times your leader has lost defense this turn/i.test(tail)) {
    return { op: "leaderDefLostCount" };
  }
  if (/^the number of cards in your hand$/i.test(tail)) {
    return { op: "handCount" };
  }
  if (/^the number of cards in its controller'?s hand/i.test(tail)) {
    return { op: "targetControllerHandCount" };
  }
  const timesTrait = tail.match(/^(\d+) times the number of (.+?) (?:followers?|cards?) on your field/i);
  if (timesTrait) {
    const f = traitFilter(timesTrait[2]);
    if (f.trait) {
      return { op: "traitFieldCount", trait: f.trait, multiplier: parseInt(timesTrait[1], 10) };
    }
  }
  if (/^your max play points/i.test(tail)) {
    return { op: "maxPp" };
  }
  if (/^the number of cards you'?ve played this turn/i.test(tail)) {
    return { op: "cardsPlayedThisTurn", excludeSelf: /excluding this card/i.test(tail) };
  }
  if (/^the number of followers with ward on your field/i.test(tail)) {
    return { op: "wardFieldCount" };
  }
  if (/^this follower's defense/i.test(tail)) {
    return { op: "selfDefense" };
  }
  const classCem = tail.match(
    /^the number of \[(\w+)\] (?:spells?|cards?) in your cemetery/i,
  );
  if (classCem) {
    const f = traitFilter(`[${classCem[1]}]`);
    return {
      op: "cemeteryFilterCount",
      filter: { ...f, cardType: /spell/i.test(tail) ? "spell" : undefined },
    };
  }
  const traitCem = tail.match(/^the number of (.+?) cards in your cemetery/i);
  if (traitCem) {
    return {
      op: "cemeteryFilterCount",
      filter: traitFilter(traitCem[1]),
    };
  }
  const mult = parseMultiplierDamage(`damage equal to ${tail}`);
  if (mult) return mult.amount;
  return null;
}

function parseTailEffect(tail, tokenMap) {
  const t = String(tail).trim().replace(/\.\s*$/, "");
  if (!t) return { op: "noop" };
  const dealNum = t.match(/^deal it (\d+) damage/i);
  if (dealNum) {
    return dealEnemyFollower(parseInt(dealNum[1], 10));
  }
  const dealEq = t.match(/^deal it damage equal to (.+)$/i);
  if (dealEq) {
    const amt = parseDamageEqualTail(dealEq[1].trim());
    if (amt) return dealEnemyFollower(amt);
  }
  if (/^destroy it/i.test(t)) {
    return { op: "destroy", targets: { type: "enemyFollower", count: 1 } };
  }
  if (/^banish it/i.test(t)) {
    return { op: "banish", targets: { type: "enemyFollower", count: 1 } };
  }
  if (/^draw a card/i.test(t)) {
    return { op: "draw", count: 1 };
  }
  const heal = t.match(/^give your leader \[def\]\+(\d+)/i);
  if (heal) {
    return { op: "healLeader", amount: parseInt(heal[1], 10) };
  }
  const buff = t.match(/^give it \[atk\]\+(\d+)\/\[def\]\+(\d+)/i);
  if (buff) {
    return {
      op: "buff",
      atk: parseInt(buff[1], 10),
      def: parseInt(buff[2], 10),
      targets: { type: "selfFollower", count: 1 },
    };
  }
  const grantKw = t.match(/^give it (Storm|Rush|Ward|Bane|Drain|Assail)/i);
  if (grantKw) {
    return {
      op: "grantKeyword",
      keyword: grantKw[1].toLowerCase(),
      targets: { type: "selfFollower", count: 1 },
    };
  }
  return { op: "noop", label: t.slice(0, 80) };
}

/**
 * @param {string} text
 * @param {{ tokenMap: object }} ctx
 */
function matchStubPatterns(text, ctx) {
  const { tokenMap, parseInner } = ctx;
  const t = String(text).trim();
  if (!t) return null;

  // --- damage equal to (truncated labels) ---
  let m = t.match(
    /^Select an enemy follower on the field and deal it damage equal to (.+)$/i,
  );
  if (m) {
    const amt = parseDamageEqualTail(m[1].trim());
    if (amt) {
      return {
        effect: dealEnemyFollower(amt),
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(/^Deal it (\d+) damage$/i);
  if (m) {
    return {
      effect: dealEnemyFollower(parseInt(m[1], 10)),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Deal (\d+) damage to it and (\d+) damage to its leader/i);
  if (m) {
    return {
      effect: {
        op: "damageFollowerAndLeader",
        followerAmount: parseInt(m[1], 10),
        leaderAmount: parseInt(m[2], 10),
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Select an enemy leader or enemy follower on the field and deal (?:it |them )?(.+)$/i,
  );
  if (m) {
    const tail = m[1].trim();
    const num = tail.match(/^(\d+) damage/i);
    if (num) {
      return {
        effect: dealEnemyFieldCard(parseInt(num[1], 10)),
        rest: "",
        confidence: "review",
      };
    }
    const varAmt = parseDamageEqualTail(tail.replace(/^damage equal to /i, ""));
    if (varAmt) {
      return {
        effect: { op: "dealDamage", amount: varAmt, targets: { type: "enemyFieldCard", count: 1 } },
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(/^Select an enemy leader on the field and deal (?:it )?(\d+) damage/i);
  if (m) {
    return {
      effect: { op: "dealDamage", amount: parseInt(m[1], 10), targets: { type: "enemyLeader" } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select up to (\d+) enemy followers? on the field\.?$/i);
  if (m) {
    return {
      effect: dealEnemyFollower(1, parseInt(m[1], 10)),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select a follower on your field\.?$/i);
  if (m) {
    return {
      effect: { op: "buff", atk: 0, def: 0, targets: { type: "selfFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Select a (.+?) (?:follower )?on your field(?: or in your ex area)? and give (?:it|them) (.+)$/i,
  );
  if (m) {
    const filter = traitFilter(m[1]);
    const tail = m[2];
    const kw = tail.match(/^(Storm|Rush|Ward|Bane|Drain|Aura|Assail)/i);
    if (kw) {
      return {
        effect: {
          op: "grantKeyword",
          keyword: kw[1].toLowerCase(),
          targets: {
            type: "selfFollower",
            count: 1,
            filter: filter.trait ? { trait: filter.trait } : filter.cardClass ? { cardClass: filter.cardClass } : undefined,
            includeExArea: /ex area/i.test(m[0]),
          },
        },
        rest: "",
        confidence: "review",
      };
    }
    const buff = tail.match(/\[atk\]\+(\d+)(?:\/\[def\]\+(\d+))?/i);
    if (buff) {
      return {
        effect: {
          op: "buff",
          atk: parseInt(buff[1], 10),
          def: parseInt(buff[2] ?? buff[1], 10),
          targets: {
            type: "selfFollower",
            count: 1,
            filter: filter.trait ? { trait: filter.trait } : undefined,
            includeExArea: /ex area/i.test(m[0]),
          },
        },
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(/^Select a (.+?) follower on your field and deal [Xx] damage/i);
  if (m) {
    return {
      effect: dealEnemyFollower(selfAttackDamage()),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Deal [Xx] damage to each enemy follower on the field\.? [Xx] equals (.+)$/i);
  if (m) {
    const varAmt = parseVariableDamageAmount(m[1].trim()) || parseDamageEqualTail(m[1].trim());
    if (varAmt) {
      return {
        effect: { op: "dealDamageAllEnemies", amount: varAmt, followersOnly: true },
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(/^Draw [Xx] cards\.? [Xx] equals (.+)$/i);
  if (m) {
    const varAmt = parseVariableDamageAmount(m[1].trim());
    if (varAmt) {
      return {
        effect: { op: "drawDynamic", amount: varAmt },
        rest: "",
        confidence: "review",
      };
    }
  }

  // --- deck search / summon ---
  m = t.match(
    /^Look at the top (\d+) cards of your deck\. From among them, you may summon any number of (.+?) followers that cost a total of (\d+) or less\. Put the rest on the bottom of your deck in any order/i,
  );
  if (m) {
    const f = traitFilter(m[2]);
    return {
      effect: {
        op: "searchDeckSummonMultiple",
        filter: { ...f, cardType: "follower" },
        lookAt: parseInt(m[1], 10),
        maxTotalCost: parseInt(m[3], 10),
        remainderTo: "deckBottom",
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Search your deck for any card, add it to your hand, then shuffle/i);
  if (m) {
    return {
      effect: { op: "tutorFromDeckAny", to: "hand", reveal: true },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Search your deck for an? (.+?) card, put it into your EX area/i);
  if (m) {
    const f = traitFilter(m[1]);
    return {
      effect: {
        op: "searchDeckChoose",
        filter: f.trait ? { trait: f.trait } : f.cardClass ? { cardClass: f.cardClass } : {},
        lookAt: 40,
        to: "exArea",
        remainderTo: "deckBottom",
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Search your deck for a (.+?) follower that costs (\d+) or less, summon it, then shuffle/i,
  );
  if (m) {
    const f = traitFilter(m[1]);
    return {
      effect: {
        op: "searchDeckChoose",
        filter: { ...f, cardType: "follower", maxCost: parseInt(m[2], 10) },
        lookAt: 40,
        to: "field",
        remainderTo: "deckBottom",
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select up to (\d+) cards? in your cemetery and put (?:them|it) into your deck/i);
  if (m) {
    return {
      effect: {
        op: "tutorFromCemetery",
        filter: {},
        to: "hand",
      },
      rest: "",
      confidence: "manual",
    };
  }

  // --- triggers / passives ---
  m = t.match(/^When this card leaves the field, put (?:a |an )?(.+?) tokens? into your EX area/i);
  if (m) {
    const tok = resolveToken(m[1], tokenMap);
    return {
      effect: { op: "summon", ...tok, count: 1, zone: "exArea" },
      rest: "",
      confidence: tok.tokenCardNo ? "auto" : "review",
    };
  }

  m = t.match(/^Whenever an officer follower is put onto your field, give it (Storm|Rush|Ward|Bane)/i);
  if (m) {
    return {
      effect: {
        op: "grantKeyword",
        keyword: m[1].toLowerCase(),
        targets: { type: "lastSummoned" },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Whenever you play an amulet, select a follower on your field and (.+)$/i);
  if (m) {
    return {
      effect: {
        op: "grantOnCardPlayed",
        filter: { cardType: "amulet" },
        effect: parseTailEffect(m[1], tokenMap),
        oncePerTurn: true,
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^When you play a (.+?) card, give your leader \[def\]\+(\d+)/i);
  if (m) {
    const f = traitFilter(m[1]);
    return {
      effect: {
        op: "grantOnCardPlayed",
        filter: f.trait ? { trait: f.trait } : f.cardClass ? { cardClass: f.cardClass } : {},
        effect: { op: "healLeader", amount: parseInt(m[2], 10) },
        oncePerTurn: /once per turn/i.test(t),
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Whenever a follower on your field evolves, deal (\d+) damage to each enemy leader and (\d+) damage to each enemy follower on the field, and give your leader \[def\]\+(\d+)/i,
  );
  if (m) {
    return {
      effect: sequence(
        { op: "dealDamageAllEnemies", amount: parseInt(m[1], 10), followersOnly: false },
        { op: "dealDamageAllEnemies", amount: parseInt(m[2], 10), followersOnly: true },
        { op: "healLeader", amount: parseInt(m[3], 10) },
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Whenever a follower on your field evolves, deal (\d+) damage to each enemy leader and (\d+) damage to each enemy follower/i,
  );
  if (m) {
    return {
      effect: sequence(
        { op: "dealDamageAllEnemies", amount: parseInt(m[1], 10), followersOnly: false },
        { op: "dealDamageAllEnemies", amount: parseInt(m[2], 10), followersOnly: true },
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Whenever this follower takes damage, select an enemy follower on the field and (.+)$/i);
  if (m) {
    return {
      effect: parseTailEffect(m[1], tokenMap),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^This follower ignores ward/i);
  if (m) {
    return {
      effect: { op: "grantIgnoresWard", targets: { type: "self" } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^While this card is on your field, your followers deal damage equal to their defense/i);
  if (m) {
    return { effect: { op: "defAsAttackAura" }, rest: "", confidence: "review" };
  }

  m = t.match(/^While Sanguine is active for you, this has (Storm|Rush|Drain)/i);
  if (m) {
    return {
      effect: {
        op: "if",
        condition: { type: "sanguine" },
        then: { op: "passiveKeywords", keywords: [m[1].toLowerCase()] },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^While your leader's defense is (\d+) or less, this has (Drain|Storm)/i);
  if (m) {
    return {
      effect: {
        op: "if",
        condition: { type: "leaderDefenseMax", max: parseInt(m[1], 10) },
        then: { op: "passiveKeywords", keywords: [m[2].toLowerCase()] },
      },
      rest: "",
      confidence: "review",
    };
  }

  // --- end / main phase ---
  m = t.match(/^At the start of your end phase, select an enemy follower on the field and (.+)$/i);
  if (m) {
    return { effect: parseTailEffect(m[1], tokenMap), rest: "", confidence: "review" };
  }

  m = t.match(/^At the start of each opponent's main phase, select an enemy follower on the field and (.+)$/i);
  if (m) {
    return { effect: parseTailEffect(m[1], tokenMap), rest: "", confidence: "review" };
  }

  m = t.match(/^At the start of each opponent's main phase, give your leader \[def\]\+(\d+)/i);
  if (m) {
    return {
      effect: { op: "healLeader", amount: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^At the start of your main phase, banish this card/i);
  if (m) {
    return { effect: { op: "banishSelf" }, rest: "", confidence: "review" };
  }

  m = t.match(/^At the start of your end phase, give this follower and your leader \[def\]\+(\d+)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    return {
      effect: sequence(buffSelfFollower(0, n), { op: "healLeader", amount: n }),
      rest: "",
      confidence: "review",
    };
  }

  // --- conditional cemetery ---
  m = t.match(/^If there are at least (\d+) (.+?) cards in your cemetery, select an enemy follower on the field and (.+)$/i);
  if (m) {
    return {
      effect: ifThen(
        { type: "ownCemeteryTraitMin", trait: m[2].trim(), count: parseInt(m[1], 10) },
        parseTailEffect(m[3], tokenMap),
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^If there are at least (\d+) (.+?) cards in your cemetery, give (.+)$/i);
  if (m) {
    return {
      effect: ifThen(
        { type: "ownCemeteryTraitMin", trait: m[2].trim(), count: parseInt(m[1], 10) },
        parseTailEffect(m[3], tokenMap),
      ),
      rest: "",
      confidence: "review",
    };
  }

  // --- misc ---
  m = t.match(/^Each opponent buries the top card of their deck/i);
  if (m) {
    return { effect: { op: "buryEachOpponentDeck", count: 1 }, rest: "", confidence: "review" };
  }

  m = t.match(/^Each opponent buries the top (\d+) cards? of their deck/i);
  if (m) {
    return {
      effect: { op: "buryEachOpponentDeck", count: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Engage it and draw a card/i);
  if (m) {
    return {
      effect: sequence(
        { op: "engage", targets: { type: "selfFollower", count: 1 } },
        { op: "draw", count: 1 },
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Combo \((\d+)\): give it \[atk\]\+(\d+) more/i);
  if (m) {
    return {
      effect: ifThen(
        { type: "combo", count: parseInt(m[1], 10) },
        { op: "buff", atk: parseInt(m[2], 10), targets: { type: "selfFollower", count: 1 } },
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Combo \((\d+)\) - draw a card/i);
  if (m) {
    return {
      effect: ifThen({ type: "combo", count: parseInt(m[1], 10) }, { op: "draw", count: 1 }),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy follower on the field and put it on top of its owner'?s deck/i);
  if (m) {
    return {
      effect: { op: "putOnTopOfDeck", targets: { type: "enemyFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy follower on the field and put it into its owner'?s cemetery/i);
  if (m) {
    return {
      effect: { op: "destroy", targets: { type: "enemyFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy follower on the field and change its attack to match its defense/i);
  if (m) {
    return {
      effect: { op: "swapAtkDef", targets: { type: "enemyFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^For the rest of this turn, this follower doesn't take damage/i);
  if (m) {
    return {
      effect: { op: "damageImmunity", amount: 0, targets: { type: "self" } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^If this wasn't put onto the field from hand, evolve it/i);
  if (m) {
    return {
      effect: { op: "autoEvolveIf", condition: { type: "enteredByAbility" }, triggerOnEvolve: true },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^withChosenNumber|X equals a number of your choice from (\d+) to (\d+)/i);
  if (m) {
    return null;
  }

  m = t.match(/^[Xx] equals a number of your choice from (\d+) to (\d+)/i);
  if (m) {
    return {
      effect: {
        op: "withChosenNumber",
        min: parseInt(m[1], 10),
        max: parseInt(m[2], 10),
        then: { op: "noop", label: "chosen number follow-up" },
      },
      rest: "",
      confidence: "manual",
    };
  }

  m = t.match(/^Activate only if you've played at least (\d+) cards this turn/i);
  if (m) {
    return { effect: { op: "noop", label: "activate cardsPlayedMin" }, rest: "", confidence: "keyword-only" };
  }

  m = t.match(/^Activate only if overflow is active for you/i);
  if (m) {
    return { effect: { op: "noop", label: "activate overflow" }, rest: "", confidence: "keyword-only" };
  }

  m = t.match(/^Once on each of your turns,\s*(.+)$/i);
  if (m) {
    const eff = parseTailEffect(m[1], tokenMap);
    if (eff.op !== "noop") {
      return { effect: eff, rest: "", confidence: "review" };
    }
  }

  m = t.match(/^This costs (\d+) less to play if there's a follower on your field/i);
  if (m) {
    return {
      effect: { op: "noop", label: "play cost reduction condition" },
      rest: "",
      confidence: "keyword-only",
    };
  }

  m = t.match(/^Select a card in an opponent's cemetery and play it for 0 play points/i);
  if (m) {
    return { effect: { op: "noop", label: "play opponent cemetery card" }, rest: "", confidence: "manual" };
  }

  m = t.match(/^Abilities can't be performed/i);
  if (m) {
    return { effect: { op: "silenceOpponents" }, rest: "", confidence: "review" };
  }

  // --- hand / controller hand damage equal ---
  m = t.match(/^Select an enemy follower on the field and deal it damage equal to the number of cards in your hand/i);
  if (m) {
    return { effect: dealEnemyFollower({ op: "handCount" }), rest: "", confidence: "review" };
  }

  m = t.match(
    /^Select an enemy follower on the field and deal it damage equal to the number of cards in its controller'?s hand/i,
  );
  if (m) {
    return {
      effect: dealEnemyFollower({ op: "targetControllerHandCount" }),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Select an enemy follower on the field and deal it damage equal to (\d+) times the number of (.+?) (?:followers?|cards?) on your field/i,
  );
  if (m) {
    const f = traitFilter(m[2]);
    if (f.trait) {
      return {
        effect: dealEnemyFollower({
          op: "traitFieldCount",
          trait: f.trait,
          multiplier: parseInt(m[1], 10),
        }),
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(
    /^Select an enemy follower on the field and deal it damage equal to the number of cards named (.+?) engaged/i,
  );
  if (m) {
    return {
      effect: dealEnemyFollower(namedFieldDamage(m[1].trim())),
      rest: "",
      confidence: "review",
    };
  }

  // --- move to ex area / destroy cheap ---
  m = t.match(/^Select an enemy follower on the field and put it into its owner'?s ex area/i);
  if (m) {
    return {
      effect: { op: "moveToExArea", targets: { type: "enemyFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Select an enemy card that costs (\d+) or less on the field and destroy it/i,
  );
  if (m) {
    return {
      effect: {
        op: "destroy",
        targets: { type: "enemyFollower", count: 1, maxCost: parseInt(m[1], 10) },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy leader on the field and deal (?:it )?(\d+) damage/i);
  if (m) {
    return {
      effect: { op: "dealDamage", amount: parseInt(m[1], 10), targets: { type: "enemyLeader" } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy follower on the field and change its attack and defense to (\d+)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    return {
      effect: {
        op: "sequence",
        steps: [
          { op: "buff", atk: 0, def: 0, targets: { type: "enemyFollower", count: 1 } },
        ],
      },
      rest: "",
      confidence: "manual",
    };
  }

  // --- variable X patterns ---
  m = t.match(/^Select up to (\d+) enemy followers on the field and deal [Xx] damage divided between them\.? [Xx] equals (.+)$/i);
  if (m) {
    const varAmt = parseVariableDamageAmount(m[2].trim()) || parseDamageEqualTail(m[2].trim());
    if (varAmt) {
      return {
        effect: {
          op: "dealDamageSplit",
          primaryAmount: varAmt,
          secondaryAmount: 0,
          maxTargets: parseInt(m[1], 10),
          targets: { type: "enemyFollower", count: parseInt(m[1], 10) },
        },
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(/^Select any number of enemy followers on the field and deal [Xx] damage divided between them\.? [Xx] equals (.+)$/i);
  if (m) {
    const varAmt = parseVariableDamageAmount(m[1].trim()) || parseDamageEqualTail(m[1].trim());
    if (varAmt) {
      return {
        effect: {
          op: "dealDamageSplit",
          primaryAmount: varAmt,
          secondaryAmount: 0,
          maxTargets: 99,
          targets: { type: "enemyFollower", count: 99 },
        },
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(/^Draw [Xx] cards\.? [Xx] equals (.+)$/i);
  if (m) {
    const varAmt = parseVariableDamageAmount(m[1].trim()) || parseDamageEqualTail(m[1].trim());
    if (varAmt) {
      return { effect: { op: "drawDynamic", amount: varAmt }, rest: "", confidence: "review" };
    }
  }

  m = t.match(/^At the start of your end phase, give this follower \[attack\]\+[Xx], where [Xx] equals (.+)$/i);
  if (m) {
    return {
      effect: { op: "noop", label: `end phase variable atk: ${m[1].slice(0, 40)}` },
      rest: "",
      confidence: "manual",
    };
  }

  // --- ally enter / officer / nattaran ---
  m = t.match(/^Whenever an officer follower is put onto your field, give it \[atk\]\+(\d+)/i);
  if (m) {
    return {
      effect: {
        op: "grantOnCardPlayed",
        filter: { trait: "Officer", cardType: "follower" },
        effect: {
          op: "buff",
          atk: parseInt(m[1], 10),
          def: 0,
          targets: { type: "lastSummoned" },
        },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Whenever a Naterran Great Tree is put onto your field, recover (\d+) play point/i);
  if (m) {
    return {
      effect: {
        op: "grantOnCardPlayed",
        filter: { identityName: "Naterran Great Tree" },
        effect: { op: "recoverPp", amount: parseInt(m[1], 10) },
        oncePerTurn: true,
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Whenever an enemy follower is put from the field into the cemetery, (.+)$/i);
  if (m) {
    const tail = parseTailEffect(m[1], tokenMap);
    if (tail.op !== "noop") {
      return { effect: tail, rest: "", confidence: "review" };
    }
  }

  // --- on damaged / damage cap ---
  m = t.match(/^Whenever this follower takes damage, give it and your leader \[def\]\+(\d+)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    return {
      effect: {
        op: "grantOnDamaged",
        effect: sequence(buffSelfFollower(0, n), { op: "healLeader", amount: n }),
        oncePerTurn: false,
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^If a follower on your field would take more than (\d+) damage, it takes (\d+) instead/i);
  if (m) {
    return {
      effect: { op: "damageCap", maxPerHit: parseInt(m[2], 10) },
      rest: "",
      confidence: "review",
    };
  }

  // --- end phase / bury self ---
  m = t.match(/^At the start of your end phase, give your leader \[def\]\+(\d+)/i);
  if (m) {
    return {
      effect: { op: "healLeader", amount: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^At the start of your end phase, deal (\d+) damage to each enemy leader/i);
  if (m) {
    return {
      effect: { op: "dealDamageAllEnemies", amount: parseInt(m[1], 10), followersOnly: false },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Bury this card/i);
  if (m) {
    return { effect: { op: "burySelf" }, rest: "", confidence: "review" };
  }

  m = t.match(/^Banish the top card of your deck/i);
  if (m) {
    return { effect: { op: "millToBanish", count: 1 }, rest: "", confidence: "review" };
  }

  m = t.match(/^Each player draws a card/i);
  if (m) {
    return {
      effect: {
        op: "sequence",
        steps: [{ op: "draw", count: 1 }, { op: "draw", count: 1 }],
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Each opponent buries a follower/i);
  if (m) {
    return {
      effect: { op: "buryOpponentMaxAttackFollower" },
      rest: "",
      confidence: "review",
    };
  }

  // --- named follower passive keywords ---
  m = t.match(/^While there'?s a (.+?) on your field, this follower has (Assail|Storm|Rush|Drain)/i);
  if (m) {
    return {
      effect: {
        op: "if",
        condition: { type: "namedFollowerOnFieldByName", identityName: m[1].trim() },
        then: { op: "passiveKeywords", keywords: [m[2].toLowerCase()] },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^While there are at least (\d+) (.+?) cards in your cemetery, this follower has (Storm|Rush|Drain|Bane)/i);
  if (m) {
    return {
      effect: {
        op: "if",
        condition: { type: "ownCemeteryTraitMin", trait: m[2].trim(), count: parseInt(m[1], 10) },
        then: { op: "passiveKeywords", keywords: [m[3].toLowerCase()] },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Give this (Storm|Rush|Ward|Bane|Drain|Assail)/i);
  if (m) {
    return {
      effect: { op: "grantKeyword", keyword: m[1].toLowerCase(), targets: { type: "self" } },
      rest: "",
      confidence: "review",
    };
  }

  // --- deck search compound ---
  m = t.match(
    /^Search your deck for a (\d+)-cost follower and (\d+)-cost follower, summon them, then shuffle/i,
  );
  if (m) {
    return {
      effect: {
        op: "sequence",
        steps: [
          {
            op: "searchDeckChoose",
            filter: { cardType: "follower", minCost: parseInt(m[1], 10), maxCost: parseInt(m[1], 10) },
            lookAt: 40,
            to: "field",
            remainderTo: "deckBottom",
          },
          {
            op: "searchDeckChoose",
            filter: { cardType: "follower", minCost: parseInt(m[2], 10), maxCost: parseInt(m[2], 10) },
            lookAt: 40,
            to: "field",
            remainderTo: "deckBottom",
          },
        ],
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Put the rest on the bottom of your deck in any order/i);
  if (m) {
    return { effect: { op: "noop", label: "put rest on deck bottom" }, rest: "", confidence: "keyword-only" };
  }

  // --- cemetery ally enter (Delta Cannon style) ---
  m = t.match(
    /^When (?:a|an) (.+?) is put onto your field, \[cost0?(\d+)\]: Put this card from your cemetery into your EX area/i,
  );
  if (m) {
    return {
      effect: {
        op: "moveSourceToExArea",
      },
      rest: "",
      confidence: "manual",
    };
  }

  // --- evolve cost / activate limits (keyword-only metadata) ---
  m = t.match(/^This card'?s \[evolve\] costs (\d+) less this turn/i);
  if (m) {
    return {
      effect: { op: "noop", label: "evolve cost reduction this turn" },
      rest: "",
      confidence: "keyword-only",
    };
  }

  m = t.match(/^Activate only twice per turn/i);
  if (m) {
    return { effect: { op: "noop", label: "activate twice per turn" }, rest: "", confidence: "keyword-only" };
  }

  m = t.match(/^You can put up to (\d+) of this card into your evolve deck/i);
  if (m) {
    return {
      effect: { op: "noop", label: "evolve deck limit" },
      rest: "",
      confidence: "keyword-only",
    };
  }

  m = t.match(/^Select a fable follower on your field or in your ex area and put a Fable counter on it/i);
  if (m) {
    return {
      effect: {
        op: "addCounter",
        counter: "fable",
        amount: 1,
        targets: {
          type: "selfFollower",
          count: 1,
          filter: { trait: "Fable" },
          includeExArea: true,
        },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select a faceup evolved follower in your evolve deck/i);
  if (m) {
    return {
      effect: selectEvolveDeckTurn({ cardType: "follower" }, "faceup", "facedown"),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select a faceup (.+?) in your evolve deck/i);
  if (m) {
    return {
      effect: selectEvolveDeckTurn(
        { identityName: m[1].trim() },
        "faceup",
        "facedown",
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Turn it facedown and draw a card/i);
  if (m) {
    return {
      effect: sequence(
        turnEvolveDeck("facedown", 1, undefined, false),
        { op: "draw", count: 1 },
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Turn (\d+) facedown evolved followers? in your evolve deck faceup/i);
  if (m) {
    return {
      effect: turnEvolveDeck("faceup", parseInt(m[1], 10), { cardType: "follower" }),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Turn them facedown$/i);
  if (m) {
    return {
      effect: turnEvolveDeck("facedown", 99, undefined, true),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^You may turn (\d+) faceup evolved (.+?) followers? in your evolve deck facedown\. If you do, (.+)$/i,
  );
  if (m) {
    const inner = parseInner(m[3]);
    return {
      effect: {
        op: "optionalCost",
        label: "turn evolve deck facedown",
        cost: turnEvolveDeck("facedown", parseInt(m[1], 10), {
          cardType: "follower",
          trait: m[2].trim(),
        }),
        then: inner.effect,
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Recover [Xx] play points\.? [Xx] equals the number of faceup followers? in your evolve deck\. Turn them facedown/i,
  );
  if (m) {
    return {
      effect: sequence(
        { op: "recoverPp", amount: evolveDeckFaceupCount() },
        turnEvolveDeck("facedown", 99, undefined, true),
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Give this follower \[attack\]\+[Xx]\/\[defense\]\+[Xx], where [Xx] equals the number of faceup evolved followers in your evolve deck/i,
  );
  if (m) {
    return {
      effect: {
        op: "buffDynamic",
        atk: evolveDeckFaceupCount({ cardType: "follower" }),
        def: evolveDeckFaceupCount({ cardType: "follower" }),
        targets: { type: "self" },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select a fable follower on your field or in your ex area/i);
  m = t.match(/^Spellchain \((\d+)\) - This costs (\d+) less to play/i);
  if (m) {
    return {
      effect: ifThen(
        { type: "spellchain", count: parseInt(m[1], 10) },
        { op: "playCostReduction", amount: parseInt(m[2], 10) },
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Deal (\d+) damage to each other follower on the field/i);
  if (m) {
    return {
      effect: { op: "dealDamageOtherFollowers", amount: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy follower on the field and change its attack and defense to (\d+)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    return {
      effect: { op: "setStats", atk: n, def: n, targets: { type: "enemyFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select a card in an opponent'?s cemetery and play it for 0 play points/i);
  if (m) {
    return {
      effect: { op: "playFromOpponentCemetery", filter: {} },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Deal the first follower damage equal to the second'?s attack/i);
  if (m) {
    return {
      effect: {
        op: "dealDamageCompare",
        targets: { type: "anyFollower", count: 2 },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Destroy each follower on the field/i);
  if (m) {
    return { effect: { op: "destroyAllFollowers" }, rest: "", confidence: "review" };
  }

  m = t.match(/^The next (.+?) card you play this turn costs (\d+) less/i);
  if (m) {
    const f = traitFilter(m[1]);
    return {
      effect: {
        op: "grantNextPlayCostReduction",
        filter: f.trait ? { trait: f.trait } : f.cardClass ? { cardClass: f.cardClass } : {},
        amount: parseInt(m[2], 10),
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^This card costs (\d+) more to play for every follower on the field/i);
  if (m) {
    return {
      effect: { op: "playCostIncrease", amountPerFollower: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Look at the top (\d+) cards? of your deck/i);
  if (m) {
    return {
      effect: { op: "peekDeck", count: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Look at the top card of your deck/i);
  if (m) {
    return { effect: { op: "peekDeck", count: 1 }, rest: "", confidence: "review" };
  }

  m = t.match(/^Put a Fable counter on (?:it|this card|them)/i);
  if (m) {
    return {
      effect: { op: "addCounter", counter: "fable", amount: 1, targets: { type: "selfFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Place (\d+) Fable counters? on (?:it|them)/i);
  if (m) {
    return {
      effect: {
        op: "addCounter",
        counter: "fable",
        amount: parseInt(m[1], 10),
        targets: { type: "selfFollower", count: 1 },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Whenever an enemy follower is put from the field into the cemetery, (.+)$/i);
  if (m) {
    const tail = parseTailEffect(m[1], tokenMap);
    if (tail.op !== "noop") {
      return { effect: tail, rest: "", confidence: "review" };
    }
  }

  m = t.match(/^Whenever this takes ability damage, (.+)$/i);
  if (m) {
    const tail = parseTailEffect(m[1], tokenMap);
    if (tail.op !== "noop") {
      return { effect: tail, rest: "", confidence: "review" };
    }
  }

  m = t.match(/^Abilities can'?t be performed/i);
  if (m) {
    return { effect: { op: "silenceOpponents" }, rest: "", confidence: "review" };
  }

  m = t.match(/^Your opponents'? abilities (?:can'?t be performed|don'?t trigger)/i);
  if (m) {
    return { effect: { op: "silenceOpponents" }, rest: "", confidence: "review" };
  }

  m = t.match(/^The next time your leader would take damage this turn, it doesn'?t take damage/i);
  if (m) {
    return { effect: { op: "grantLeaderDamageShield", charges: 1 }, rest: "", confidence: "review" };
  }

  m = t.match(/^You may summon an amulet that costs (\d+) or less from your hand/i);
  if (m) {
    return {
      effect: {
        op: "selectFromHand",
        filter: { cardType: "amulet", maxCost: parseInt(m[1], 10) },
        to: "field",
        optional: true,
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an im@s cg card in your ex area and give it "this costs (\d+) less to play/i);
  if (m) {
    return {
      effect: {
        op: "grantPlayCostReduction",
        amount: parseInt(m[1], 10),
        targets: {
          type: "selfFollower",
          count: 1,
          filter: { trait: "iM@S CG" },
          includeExArea: true,
        },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^At the start of your end phase, give this follower \[attack\]\+[Xx], where [Xx] equals (.+)$/i);
  if (m) {
    const varAmt = parseDamageEqualTail(m[1].trim());
    if (varAmt) {
      return {
        effect: { op: "buffDynamic", atk: varAmt, def: 0, targets: { type: "self" } },
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(/^Deal it (\d+) damage, draw a card, then discard a card/i);
  if (m) {
    return {
      effect: sequence(
        dealEnemyFollower(parseInt(m[1], 10)),
        { op: "draw", count: 1 },
        { op: "discard", count: 1 },
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Deal (\d+) damage to it and its leader/i);
  if (m) {
    return {
      effect: {
        op: "damageFollowerAndLeader",
        followerAmount: parseInt(m[1], 10),
        leaderAmount: parseInt(m[1], 10),
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy leader and deal (?:it )?(\d+) damage/i);
  if (m) {
    return {
      effect: { op: "dealDamage", amount: parseInt(m[1], 10), targets: { type: "enemyLeader" } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Whenever an enemy follower is destroyed, give this follower \[atk\]\+(\d+)/i);
  if (m) {
    return {
      effect: buffSelfFollower(parseInt(m[1], 10), 0),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Each opponent discards a (?:random )?card/i);
  if (m) {
    return { effect: { op: "opponentDiscardEach", count: 1 }, rest: "", confidence: "review" };
  }

  m = t.match(/^Gain (\d+) Evolution Point/i);
  if (m) {
    return {
      effect: { op: "gainEvolutionPoint", amount: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Put a card from your hand on the bottom of your deck/i);
  if (m) {
    return { effect: { op: "putHandCardOnDeck", position: "bottom" }, rest: "", confidence: "review" };
  }

  m = t.match(/^and give it \[attack\]-(\d+)\/\[defense\]-(\d+)/i);
  if (m) {
    return {
      effect: buffSelfFollower(-parseInt(m[1], 10), -parseInt(m[2], 10)),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^and give it \[atk\]\-(\d+)/i);
  if (m) {
    return {
      effect: buffSelfFollower(-parseInt(m[1], 10), 0),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^and destroy it$/i);
  if (m) {
    return {
      effect: { op: "destroy", targets: { type: "enemyFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^and draw a card$/i);
  if (m) {
    return { effect: { op: "draw", count: 1 }, rest: "", confidence: "review" };
  }

  m = t.match(/^Deal it (\d+) damage and give this follower \+(\d+)\/\+(\d+)/i);
  if (m) {
    return {
      effect: sequence(
        dealEnemyFollower(parseInt(m[1], 10)),
        buffSelfFollower(parseInt(m[2], 10), parseInt(m[3], 10)),
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Select an enemy follower on the field and deal it (\d+) damage\. If there are at least (\d+) faceup evolved followers in your evolve deck, deal (\d+) damage instead/i,
  );
  if (m) {
    return {
      effect: ifThen(
        { type: "evolveDeckFaceupMin", count: parseInt(m[2], 10), filter: { cardType: "follower" } },
        dealEnemyFollower(parseInt(m[3], 10)),
        dealEnemyFollower(parseInt(m[1], 10)),
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^If there are at least (\d+) faceup evolved followers in your evolve deck, evolve this/i,
  );
  if (m) {
    return {
      effect: ifThen(
        { type: "evolveDeckFaceupMin", count: parseInt(m[1], 10), filter: { cardType: "follower" } },
        evolveSelf(true),
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^On Evolve - Select a faceup evolved follower in your evolve deck\. Turn it facedown, then (.+)$/i);
  if (m) {
    const inner = parseInner(m[1]);
    return {
      effect: sequence(
        selectEvolveDeckTurn({ cardType: "follower" }, "faceup", "facedown"),
        inner.effect,
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^and engage it$/i);
  if (m) {
    return {
      effect: { op: "engage", targets: { type: "selfFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^your leader \[def\]\+(\d+)/i);
  if (m) {
    return { effect: { op: "healLeader", amount: parseInt(m[1], 10) }, rest: "", confidence: "review" };
  }

  m = t.match(/^\(2\) draw a card$/i);
  if (m) {
    return { effect: { op: "draw", count: 1 }, rest: "", confidence: "review" };
  }

  m = t.match(/^Deal (\d+) damage instead\.?$/i);
  if (m) {
    return {
      effect: dealEnemyFollower(parseInt(m[1], 10)),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^This card costs (\d+) less to play\.?$/i);
  if (m) {
    return {
      effect: { op: "playCostReduction", amount: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^This card costs (\d+) play points to play\.?$/i);
  if (m) {
    return {
      effect: { op: "playCostIncrease", amountPerFollower: 0 },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Take another turn after this one\.?$/i);
  if (m) {
    return { effect: { op: "takeExtraTurn" }, rest: "", confidence: "review" };
  }

  m = t.match(
    /^Give \+(\d+)\/\+(\d+) to each other (.+?) follower on your field and in your EX area\.?$/i,
  );
  if (m) {
    const trait = m[3].trim();
    return {
      effect: {
        op: "buffFieldTrait",
        trait,
        atk: parseInt(m[1], 10),
        def: parseInt(m[2], 10),
        excludeSelf: true,
        includeExArea: true,
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Search your deck for a (\d+)-cost (.+?) follower, summon it, then shuffle your deck\.?$/i,
  );
  if (m) {
    const filter = traitFilter(m[2]);
    return {
      effect: {
        op: "tutorFromDeck",
        filter: { ...filter, cardType: "follower", maxCost: parseInt(m[1], 10), minCost: parseInt(m[1], 10) },
        to: "field",
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select any number of enemy followers on the field and deal (\d+) damage divided among them\.?$/i);
  if (m) {
    return {
      effect: {
        op: "dealDamageSplit",
        primaryAmount: parseInt(m[1], 10),
        targets: { type: "enemyFollower", count: 99 },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^and destroy it\.?$/i);
  if (m) {
    return {
      effect: { op: "destroy", targets: { type: "enemyFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^and give it \[storm\]\.?$/i);
  if (m) {
    return {
      effect: { op: "grantKeyword", keyword: "storm", targets: { type: "enemyFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Deal it (\d+) damage and put a (.+?) token into your EX area\.?$/i);
  if (m) {
    const tok = resolveToken(m[2], tokenMap);
    return {
      effect: sequence(
        dealEnemyFollower(parseInt(m[1], 10)),
        { op: "summon", tokenCardNo: tok.cardNo, tokenName: tok.name, count: 1, zone: "exArea" },
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^If there are at least (\d+) cards on their field, give this follower \+(\d+)\/\+(\d+)\.?$/i,
  );
  if (m) {
    return {
      effect: ifThen(
        { type: "enemyFieldMin", count: parseInt(m[1], 10) },
        buffSelfFollower(parseInt(m[2], 10), parseInt(m[3], 10)),
      ),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Whenever an enemy follower is put from the field into the cemetery, (.+)$/i);
  if (m) {
    const inner = parseInner(m[1]);
    return {
      effect: inner.effect,
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Whenever this takes ability damage, (.+)$/i);
  if (m) {
    const inner = parseInner(m[1]);
    return {
      effect: inner.effect,
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^X equals this follower's attack\.?$/i);
  if (m) {
    return {
      effect: { op: "noop", label: "variable: self attack" },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^X equals the total number of cards in your hand and EX area\.?$/i);
  if (m) {
    return {
      effect: { op: "noop", label: "variable: hand+ex count" },
      rest: "",
      confidence: "review",
    };
  }

  return null;
}

module.exports = { matchStubPatterns, parseDamageEqualTail, traitFilter };
