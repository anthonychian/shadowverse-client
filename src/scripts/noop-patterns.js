/**
 * Fallback pattern matcher for card text that the phrase parser misses.
 * Returns { effect, rest, confidence } or null.
 */
const {
  lessonOptionalCost,
  parseLessonPrefix,
  parseMultiplierDamage,
  parseInlineCondition,
  parseVariableDamageAmount,
  traitFieldDamage,
  dealEnemyFollower,
  dealEnemyFieldCard,
  buffSelf,
  buffSelfFollower,
  ifThen,
  sequence,
  evolveSelf,
  wrapConditionalSelect,
  resolveToken,
} = require("./dsl-builders");
const { matchStubPatterns } = require("./stub-patterns");

function parseTraitOrClass(fragment) {
  const classM = fragment.match(
    /\[(forestcraft|swordcraft|runecraft|dragoncraft|shadowcraft|havencraft|portalcraft|neutral)\]/i,
  );
  if (classM) {
    const map = {
      forestcraft: "forest",
      swordcraft: "sword",
      runecraft: "rune",
      dragoncraft: "dragon",
      shadowcraft: "abyss",
      havencraft: "haven",
      portalcraft: "portal",
      neutral: "neutral",
    };
    return { cardClass: map[classM[1].toLowerCase()] };
  }
  const traitM = fragment.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
  if (traitM && !/other|each|your|field|follower|enemy/i.test(traitM[1])) {
    return { trait: traitM[1] };
  }
  return {};
}

function parseSelectEnemyDamage(tail, targets) {
  const num = tail.match(/^(\d+) damage/i);
  if (num) {
    return { op: "dealDamage", amount: parseInt(num[1], 10), targets };
  }
  const varAmt = parseVariableDamageAmount(tail);
  if (varAmt) {
    return { op: "dealDamage", amount: varAmt, targets };
  }
  if (/X damage/i.test(tail) && /selected follower's attack/i.test(tail)) {
    return { op: "dealDamage", amount: { op: "targetAttack" }, targets };
  }
  const dmg = parseMultiplierDamage(tail);
  if (dmg) {
    return { op: "dealDamage", amount: dmg.amount, targets };
  }
  if (/^deal it damage equal to its attack/i.test(tail)) {
    return { op: "dealDamage", amount: { op: "targetAttack" }, targets };
  }
  return null;
}

/**
 * @param {string} text
 * @param {{ tokenMap: object, seg: object, parseInner: (t: string) => object }} ctx
 */
function matchNoopPattern(text, ctx) {
  const { tokenMap, parseInner } = ctx;
  const t = String(text).trim();
  if (!t) return null;

  const stub = matchStubPatterns(t, { tokenMap, parseInner });
  if (stub) return stub;

  const lesson = parseLessonPrefix(t);
  if (lesson) {
    const inner = parseInner(lesson.rest);
    return {
      effect: lessonOptionalCost(lesson.count, inner.effect),
      rest: "",
      confidence: "review",
    };
  }

  if (/^evolve this(?: follower)?\.?$/i.test(t)) {
    return { effect: evolveSelf(true), rest: "", confidence: "review" };
  }

  if (/^if this card was put onto the field by an ability, evolve it\.?$/i.test(t)) {
    return {
      effect: { op: "autoEvolveIf", condition: { type: "enteredByAbility" }, triggerOnEvolve: true },
      rest: "",
      confidence: "review",
    };
  }

  let m = t.match(
    /^Search your deck for up to (\d+) cards and banish them\.?$/i,
  );
  if (m) {
    return {
      effect: { op: "banishFromDeck", maxCount: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Select (?:an enemy leader or enemy follower|an enemy leader|an enemy follower) on the field and deal (?:it |them )?(.+)$/i,
  );
  if (m) {
    const tail = m[1].trim();
    const targets = /enemy leader or/i.test(m[0])
      ? { type: "enemyFieldCard", count: 1 }
      : /enemy leader$/i.test(m[0].replace(/ or enemy follower/i, ""))
        ? { type: "enemyLeader" }
        : { type: "enemyFollower", count: 1 };
    const effect = parseSelectEnemyDamage(tail, targets);
    if (effect) {
      return { effect, rest: "", confidence: /X equals|enemy leader or/i.test(tail) ? "review" : "auto" };
    }
  }

  m = t.match(
    /^Select (?:up to )?(\d+)? enemy followers? on the field and deal (?:them )?X damage divided between them\.? X equals (.+)$/i,
  );
  if (m) {
    const maxTargets = m[1] ? parseInt(m[1], 10) : 1;
    const varAmt = parseVariableDamageAmount(m[2].trim());
    if (varAmt) {
      return {
        effect: {
          op: "dealDamageSplit",
          primaryAmount: varAmt,
          secondaryAmount: 0,
          maxTargets,
          targets: { type: "enemyFollower", count: maxTargets },
        },
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(
    /^Select (?:up to )?(\d+)? enemy followers? on the field and deal (?:them )?X damage\.? X equals (.+)$/i,
  );
  if (m) {
    const count = m[1] ? parseInt(m[1], 10) : 1;
    const varAmt = parseVariableDamageAmount(m[2].trim());
    if (varAmt) {
      return {
        effect: dealEnemyFollower(varAmt, count),
        rest: "",
        confidence: "review",
      };
    }
  }

  m = t.match(
    /^Select an enemy follower with (\d+) defense or less on the field and (banish|destroy) it/i,
  );
  if (m) {
    const op = m[2].toLowerCase() === "banish" ? "banish" : "destroy";
    return {
      effect: {
        op,
        targets: { type: "enemyFollower", count: 1, maxDef: parseInt(m[1], 10) },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy follower on the field and, if (.+?), (.+)$/i);
  if (m) {
    const inner = parseInner(m[2]);
    return {
      effect: wrapConditionalSelect({ type: "enemyFollower", count: 1 }, m[1], inner.effect),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy follower on the field and deal it damage equal to (.+)$/i);
  if (m) {
    const dmg = parseMultiplierDamage(`damage equal to ${m[1]}`);
    if (dmg) {
      return {
        effect: dealEnemyFollower(dmg.amount),
        rest: "",
        confidence: dmg.confidence,
      };
    }
  }

  m = t.match(/^Select an enemy follower on the field and put it on the bottom of its owner'?s deck/i);
  if (m) {
    return {
      effect: { op: "putOnBottomOfDeck", targets: { type: "enemyFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy card on the field and destroy it/i);
  if (m) {
    return {
      effect: { op: "destroy", targets: { type: "enemyFieldCard", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Select an enemy follower on the field and return it to its owner'?s hand/i);
  if (m) {
    return {
      effect: { op: "returnToHand", targets: { type: "enemyFollower", count: 1 } },
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

  m = t.match(/^Select a follower on your field and give it (Storm|Rush|Ward|Bane|Drain|Aura|Assail)/i);
  if (m) {
    return {
      effect: {
        op: "grantKeyword",
        keyword: m[1].toLowerCase(),
        targets: { type: "selfFollower", count: 1 },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(
    /^Select a (.+?) (?:follower )?on your field(?: or in your ex area)? and give (?:it|them) \[attack\]\+(\d+)\/\[defense\]\+(\d+)/i,
  );
  if (m) {
    const filter = parseTraitOrClass(m[1]);
    return {
      effect: {
        op: "buff",
        atk: parseInt(m[2], 10),
        def: parseInt(m[3], 10),
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

  m = t.match(/^Lesson\s*\((\d+)\):\s*Select an enemy follower on the field and deal it (\d+) damage/i);
  if (m) {
    return {
      effect: lessonOptionalCost(parseInt(m[1], 10), dealEnemyFollower(parseInt(m[2], 10))),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Lesson\s*\((\d+)\):\s*Destroy each enemy card on the field/i);
  if (m) {
    return {
      effect: lessonOptionalCost(parseInt(m[1], 10), { op: "destroyAllEnemyField" }),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Lesson\s*\((\d+)\):\s*Give your leader \[def\]\+(\d+)/i);
  if (m) {
    return {
      effect: lessonOptionalCost(parseInt(m[1], 10), { op: "healLeader", amount: parseInt(m[2], 10) }),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Lesson\s*\((\d+)\):\s*Give this follower (Storm|Rush|Ward|Aura|Assail)/i);
  if (m) {
    return {
      effect: lessonOptionalCost(parseInt(m[1], 10), {
        op: "grantKeyword",
        keyword: m[2].toLowerCase(),
        targets: { type: "self" },
      }),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Increase your max(?:imum)? play points by (\d+)/i);
  if (m) {
    return {
      effect: { op: "increaseMaxPp", amount: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Roll a (\d+)-sided die/i);
  if (m) {
    const sides = parseInt(m[1], 10);
    return {
      effect: {
        op: "rollDie",
        sides,
        outcomes: [{ on: Array.from({ length: sides }, (_, i) => i + 1), effect: { op: "noop" } }],
      },
      rest: "",
      confidence: "manual",
    };
  }

  m = t.match(/^Destroy each enemy card on the field/i);
  if (m) {
    return { effect: { op: "destroyAllEnemyField" }, rest: "", confidence: "review" };
  }

  m = t.match(/^Discard your hand/i);
  if (m) {
    return { effect: { op: "discardHand" }, rest: "", confidence: "auto" };
  }

  m = t.match(/^Put (?:a |an )?(.+?) tokens? into your EX area/i);
  if (m) {
    const tok = resolveToken(m[1], tokenMap);
    return {
      effect: { op: "summon", ...tok, count: 1, zone: "exArea" },
      rest: "",
      confidence: tok.tokenCardNo ? "auto" : "review",
    };
  }

  m = t.match(/^This card can't be destroyed by abilities/i);
  if (m) {
    return {
      effect: { op: "grantIndestructible", targets: { type: "self" } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Reduce damage dealt to this follower by (\d+)/i);
  if (m) {
    return {
      effect: { op: "damageCap", maxPerHit: parseInt(m[1], 10) },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^At the start of your end phase, if you have at least (\d+) play points,?\s*(.+)$/i);
  if (m) {
    const inner = parseInner(m[2]);
    return {
      effect: ifThen({ type: "ppMin", count: parseInt(m[1], 10) }, inner.effect),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^At the start of your end phase, if (?:Sanguine|sanguine) is active for you,?\s*(.+)$/i);
  if (m) {
    const inner = parseInner(m[1]);
    return {
      effect: ifThen({ type: "sanguine" }, inner.effect),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^At the start of your end phase, if this card is in your EX area,?\s*(.+)$/i);
  if (m) {
    const inner = parseInner(m[1]);
    return {
      effect: ifThen({ type: "inExArea" }, inner.effect),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^At the start of your end phase, give this follower \[def\]\+(\d+)/i);
  if (m) {
    return {
      effect: buffSelfFollower(0, parseInt(m[1], 10)),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^At the start of your end phase, return this card to its owner'?s hand/i);
  if (m) {
    return {
      effect: { op: "returnToHand", targets: { type: "self" } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^If (?:Sanguine|sanguine) is active for you,\s*(.+)$/i);
  if (m) {
    const inner = parseInner(m[1]);
    return {
      effect: ifThen({ type: "sanguine" }, inner.effect),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^If there is an amulet on your field, give your leader \[def\]\+(\d+)/i);
  if (m) {
    return {
      effect: ifThen({ type: "amuletOnField" }, { op: "healLeader", amount: parseInt(m[1], 10) }),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Deal it (\d+) damage and draw a card/i);
  if (m) {
    return {
      effect: sequence(dealEnemyFollower(parseInt(m[1], 10)), { op: "draw", count: 1 }),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^For the rest of this turn, it costs (\d+) less to play/i);
  if (m) {
    return {
      effect: { op: "grantPlayCostReduction", amount: parseInt(m[1], 10), targets: { type: "selfFollower", count: 1 } },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^(?:When this card is discarded,\s*)?you may put it into your EX area/i);
  if (m) {
    return {
      effect: { op: "moveSourceToExArea" },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Then, if there are at least (\d+) cards in opponents'? cemeteries, evolve this(?: follower)?/i);
  if (m) {
    return {
      effect: ifThen({ type: "opponentCemeteryMin", count: parseInt(m[1], 10) }, evolveSelf(true)),
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^When this follower deals attack damage to an enemy leader, you win the game/i);
  if (m) {
    return { effect: { op: "winGame" }, rest: "", confidence: "review" };
  }

  if (/^on drive\s*-/i.test(t)) {
    const inner = parseInner(t.replace(/^on drive\s*-\s*/i, ""));
    if (inner.effect && inner.effect.op !== "noop") {
      return { effect: inner.effect, rest: "", confidence: "review" };
    }
  }

  m = t.match(/^Put a Magical Item tokens? into your EX area/i);
  if (m) {
    const tok = resolveToken("Magical Item", tokenMap);
    return {
      effect: { op: "summon", ...tok, count: 1, zone: "exArea" },
      rest: "",
      confidence: tok.tokenCardNo ? "auto" : "review",
    };
  }

  m = t.match(
    /^You may put an iM@S CG follower that costs (\d+) or less from your hand into your EX area/i,
  );
  if (m) {
    return {
      effect: {
        op: "selectFromHand",
        filter: { trait: "iM@S CG", cardType: "follower", maxCost: parseInt(m[1], 10) },
        to: "exArea",
        optional: true,
        playCostReduction: 2,
      },
      rest: "",
      confidence: "review",
    };
  }

  if (/^you can put up to \d+ of this card into your evolve deck/i.test(t)) {
    return { effect: { op: "noop", label: "evolve deck limit" }, rest: "", confidence: "keyword-only" };
  }

  if (/^\(to perform lesson/i.test(t) || /^\(followers with storm/i.test(t)) {
    return { effect: { op: "noop", label: t.slice(0, 80) }, rest: "", confidence: "keyword-only" };
  }

  if (/^this card can't be played during your turn/i.test(t) || /^this card can't be played from the ex area/i.test(t)) {
    return { effect: { op: "noop", label: t.slice(0, 80) }, rest: "", confidence: "keyword-only" };
  }

  if (/^while this card is on your field, your followers deal damage equal to/i.test(t)) {
    return { effect: { op: "noop", label: "def-as-attack aura" }, rest: "", confidence: "manual" };
  }

  m = t.match(/^Select an enemy amulet on the field and (destroy|banish) it/i);
  if (m) {
    const op = m[1].toLowerCase() === "banish" ? "banish" : "destroy";
    return {
      effect: {
        op,
        targets: { type: "enemyFieldCard", count: 1, filter: { cardType: "amulet" } },
      },
      rest: "",
      confidence: "review",
    };
  }

  m = t.match(/^Deal (\d+) damage to it and (\d+) damage to your leader/i);
  if (m) {
    return {
      effect: sequence(
        dealEnemyFollower(parseInt(m[1], 10)),
        { op: "dealDamage", amount: parseInt(m[2], 10), targets: { type: "selfLeader" } },
      ),
      rest: "",
      confidence: "review",
    };
  }

  if (/^on race\s*-/i.test(t)) {
    const inner = parseInner(t.replace(/^on race\s*-\s*/i, ""));
    if (inner.effect && inner.effect.op !== "noop") {
      return { effect: inner.effect, rest: "", confidence: "review" };
    }
  }

  if (/^\[ride\]/i.test(t) || /^\[feed\]/i.test(t)) {
    const inner = parseInner(t.replace(/^\[(?:ride|feed)\]\s*/i, ""));
    if (inner.effect && inner.effect.op !== "noop") {
      return { effect: inner.effect, rest: "", confidence: "review" };
    }
  }

  m = t.match(/^Deal (\d+) damage to your leader/i);
  if (m) {
    return {
      effect: { op: "dealDamage", amount: parseInt(m[1], 10), targets: { type: "selfLeader" } },
      rest: "",
      confidence: "auto",
    };
  }

  return null;
}

module.exports = { matchNoopPattern, resolveToken };
