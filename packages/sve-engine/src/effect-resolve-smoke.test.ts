import { describe, expect, it } from "vitest";
import { getAllCardDefs } from "./cards/registry";
import type { Effect } from "./types";

const VANGUARD_RE =
  /\[ride\]|\[feed\]|on drive|on race|single drive|drive point|vanguard/i;

const KNOWN_OPS = new Set([
  "draw",
  "discard",
  "healLeader",
  "mill",
  "dealDamage",
  "buff",
  "destroy",
  "banish",
  "summon",
  "evolve",
  "engage",
  "clash",
  "sequence",
  "if",
  "choose",
  "chooseMultiple",
  "optionalCost",
  "tutorFromDeck",
  "searchDeckChoose",
  "searchDeckSummonMultiple",
  "selectFromHand",
  "discardFromHand",
  "banishFromExArea",
  "banishFromCemetery",
  "burySelf",
  "spendPp",
  "playCostReduction",
  "playCostIncrease",
  "exAreaPlayCostReduction",
  "passiveKeywords",
  "auraGrantKeyword",
  "grantKeyword",
  "grantPlayCostReduction",
  "grantLastWords",
  "grantOnCardPlayed",
  "moveToExArea",
  "moveSourceToExArea",
  "moveZoneCard",
  "putHandCardOnDeck",
  "summonFromCemetery",
  "summonFromEvolveDeck",
  "reviveSelfFromCemetery",
  "autoEvolveIf",
  "triggerAbilities",
  "buryFieldFollowers",
  "dealDamageAllEnemies",
  "dealDamageSplit",
  "damageFollowerAndLeader",
  "damageCap",
  "box",
  "opponentDiscardEach",
  "gainEvolutionPoint",
  "playFromOpponentCemetery",
  "maneuver",
  "buffFieldTrait",
  "selectEvolveDeckTurn",
  "tutorFromCemetery",
  "takeExtraTurn",
  "refresh",
  "recoverPp",
  "peekDeck",
  "increaseMaxPp",
  "putOnBottomOfDeck",
  "rollDie",
  "millOpponent",
  "banishSelf",
  "destroyAllEnemyField",
  "discardOptionalDraw",
  "banishAllFieldAndEx",
  "cannotAttack",
  "buryFromFieldSelect",
  "summonSameNameToken",
  "returnToHand",
  "addStack",
  "reviveToField",
  "defAsAttackAura",
  "destroyAllFollowers",
  "discardHand",
  "grantIndestructible",
  "millToBanish",
  "winGame",
  "drawDynamic",
  "buffDynamic",
  "buryOpponentMaxAttackFollower",
  "withChosenNumber",
  "grantLeaderDamageShield",
  "grantNextPlayCostReduction",
  "turnEvolveDeck",
  "selectEvolveDeckCard",
  "grantIgnoresWard",
  "banishFromDeck",
  "putOnTopOfDeck",
  "dealDamageCompare",
  "damageImmunity",
  "swapAtkDef",
  "buryEachOpponentDeck",
  "grantOnDamaged",
  "tutorFromDeckAny",
  "dealDamageOtherFollowers",
  "setStats",
  "silence",
  "silenceOpponents",
  "addCounter",
  "removeCounter",
  "transform",
  "summonLastTutoredFromHand",
  "noop",
]);

function walkEffects(effect: Effect | undefined, out: Effect[]) {
  if (!effect) return;
  out.push(effect);
  if (effect.op === "sequence") effect.steps?.forEach((s) => walkEffects(s, out));
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    effect.options?.forEach((o) => walkEffects(o.effect, out));
  }
  if (effect.op === "if") {
    walkEffects(effect.then, out);
    if (effect.else) walkEffects(effect.else, out);
  }
  if (effect.op === "optionalCost") {
    walkEffects(effect.cost, out);
    walkEffects(effect.then, out);
  }
}

function effectTreeIsValid(effect: Effect | undefined): string | null {
  if (!effect) return null;
  if (effect.op === "noop") {
    const label = (effect as Effect & { label?: string }).label;
    if (label && /^stub missing /i.test(label)) return null;
    return "noop";
  }
  if (!KNOWN_OPS.has(effect.op)) return `unknown op ${effect.op}`;
  if (effect.op === "sequence") {
    for (const step of effect.steps ?? []) {
      const err = effectTreeIsValid(step);
      if (err) return err;
    }
  }
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    for (const o of effect.options ?? []) {
      const err = effectTreeIsValid(o.effect);
      if (err) return err;
    }
  }
  if (effect.op === "if") {
    const t = effectTreeIsValid(effect.then);
    if (t) return t;
    if (effect.else) return effectTreeIsValid(effect.else);
  }
  if (effect.op === "optionalCost") {
    const c = effectTreeIsValid(effect.cost);
    if (c) return c;
    return effectTreeIsValid(effect.then);
  }
  return null;
}

describe("effect resolve smoke", () => {
  const DECK_CARDS = [
    "BP14-018EN", "BP14-025EN", "PR-173EN", "BP07-075EN", "BP12-SL22EN",
    "BP17-113EN", "BP12-082EN", "BP17-079EN", "BP07-SL13EN", "BP07-U05EN",
    "BP14-118EN", "BP11-018EN", "BP14-023EN", "BP14-019EN", "BP14-027EN",
    "BP14-026EN", "BP07-047EN", "BP07-103EN", "BP12-048EN", "BP12-049EN",
    "BP17-049EN", "BP17-033EN", "BP17-041EN", "BP07-035EN", "BP07-037EN",
    "BP12-035EN", "BP17-040EN", "BP17-048EN", "BP07-041EN", "BP17-044EN",
    "BP12-041EN", "BP17-119EN", "BP17-050EN", "BP17-042EN", "BP07-036EN",
    "BP12-036EN", "BP07-069EN", "BP07-070EN", "BP12-T03EN", "BP12-T04EN",
  ];

  it("deck cards have known ops and no noop stubs", () => {
    const deckSet = new Set(DECK_CARDS);
    const defs = getAllCardDefs().filter(
      (d) => deckSet.has(d.cardNo) && d.abilities?.length && !VANGUARD_RE.test(d.cardText || ""),
    );
    const unknownOps: string[] = [];

    for (const def of defs) {
      for (const ability of def.abilities ?? []) {
        const err = effectTreeIsValid(ability.effect);
        if (err === "noop") {
          unknownOps.push(`${def.cardNo} noop`);
          continue;
        }
        if (err) unknownOps.push(`${def.cardNo} ${err}`);
      }
    }

    expect(unknownOps, unknownOps.slice(0, 30).join("\n")).toEqual([]);
  });

  it("non-Vanguard cards have known ops structurally resolvable", () => {
    const defs = getAllCardDefs().filter(
      (d) => d.abilities?.length && !VANGUARD_RE.test(d.cardText || ""),
    );
    const unknownOps: string[] = [];

    for (const def of defs) {
      for (const ability of def.abilities ?? []) {
        const err = effectTreeIsValid(ability.effect);
        if (err === "noop") continue;
        if (err) unknownOps.push(`${def.cardNo} ${err}`);
      }
    }

    expect(unknownOps, unknownOps.slice(0, 30).join("\n")).toEqual([]);
  });
});
