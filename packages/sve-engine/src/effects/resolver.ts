import { getCardDef, resolveCardNoByIdentity } from "../cards/registry";
import { normalizeIdentityName } from "../cards/reprints";

import { onCardEntersExArea, onFollowerEntersField, queueLastWords } from "../rules/confirmation";

import { runConfirmationTiming } from "../rules/confirmation";
import { queueOnBecomeEngaged } from "../rules/trigger-queue";
import { describeEffect } from "../rules/trigger-labels";
import {
  contextForTriggerResolution,
  finishDeferredTriggers,
  withChoiceContext,
} from "../rules/effect-utils";

import { cardMatchesFilter, evalCondition } from "../state/conditions";

import { createCardInstance } from "../state/factory";

import {
  clampDamageToFollower,
  findInstance,
  findMatchingEvolveCard,
  getEffectiveStats,
  getPlayer,
  hasKeyword,
  isFieldFollower,
  opponentOf,
  resolveCardDefCost,
  resolveCardNo,
} from "../state/queries";
import { resetCardInstanceState, resetFieldInstanceState } from "../state/card-reset";
import {
  countEvolveDeckFaceup,
  filterEvolveDeckCards,
  setEvolveDeckOrientation,
} from "../state/evolve-deck";
import { destroyFollower, drawCard, moveCard, putFieldCardOnDeckBottom, putFieldCardOnDeckTop, returnEvolveCardToDeck, shuffleDeck } from "../state/zones";
import { queueOnDamagedAbilities, queueOnAbilityDamaged } from "../rules/trigger-queue";
import {
  DamageAmount,
  DeckFilter,
  Effect,
  GameState,
  Keyword,
  PlayerId,
  TargetSelector,
} from "../types";

function resolutionContextFields(ctx: GameState["resolutionContext"]) {
  return {
    buriedCosts: ctx?.buriedCosts,
    lastDiscardedCardNo: ctx?.lastDiscardedCardNo,
    lastTutoredInstanceId: ctx?.lastTutoredInstanceId,
    lastSummonedInstanceId: ctx?.lastSummonedInstanceId,
  };
}

export function appendResumeEffects(state: GameState, effects: Effect[]): GameState {
  if (effects.length === 0) return state;
  const next = structuredClone(state);
  const existing = next.resolutionContext?.resumeAfterChoice ?? [];
  next.resolutionContext = {
    sourceInstanceId: next.resolutionContext?.sourceInstanceId,
    effectStack: next.resolutionContext?.effectStack ?? [],
    resumeAfterChoice: [...existing, ...effects],
    forcedTargetId: next.resolutionContext?.forcedTargetId,
    ...resolutionContextFields(next.resolutionContext),
    deferTriggers: true,
  };
  return next;
}

function fieldCardMatchesTarget(
  state: GameState,
  card: import("../types").CardInstance,
  selector: TargetSelector,
): boolean {
  const cardNo = resolveCardNo(state, card);
  const def = getCardDef(cardNo);
  if (!def) return false;
  if (selector.type === "enemyFollower" && !isFieldFollower(state, card)) return false;
  if (selector.type === "enemyFieldCard" && def.cardType === "spell") return false;
  if (
    (selector.type === "enemyFollower" || selector.type === "enemyFieldCard") &&
    selector.filter &&
    !cardMatchesFilter(cardNo, selector.filter)
  ) {
    return false;
  }
  const cost = resolveCardDefCost(cardNo);
  const maxCost =
    selector.type === "enemyFollower" || selector.type === "enemyFieldCard"
      ? selector.maxCost
      : undefined;
  if (maxCost != null && cost > maxCost) return false;
  const maxDef =
    selector.type === "enemyFollower" || selector.type === "enemyFieldCard"
      ? selector.maxDef
      : undefined;
  if (maxDef != null) {
    const { def } = getEffectiveStats(card, state);
    if (def > maxDef) return false;
  }
  if (
    (selector.type === "enemyFollower" ||
      selector.type === "enemyFieldCard" ||
      selector.type === "selfFollower" ||
      selector.type === "anyFollower") &&
    selector.engaged != null &&
    card.engaged !== selector.engaged
  ) {
    return false;
  }
  if (selector.type === "selfFollower") {
    if (!isFieldFollower(state, card)) return false;
    if (selector.excludeSelf !== false && card.instanceId === state.resolutionContext?.sourceInstanceId) {
      return false;
    }
    if (selector.filter && !cardMatchesFilter(cardNo, selector.filter)) return false;
  }
  return true;
}

function getTargetCandidates(

  state: GameState,

  player: PlayerId,

  selector: TargetSelector,

): string[] {

  const enemy = opponentOf(player);

  switch (selector.type) {

    case "selfLeader":

      return ["selfLeader"];

    case "enemyLeader":

      return ["leader"];

    case "enemyFollower":
    case "enemyFieldCard": {

      return getPlayer(state, enemy).zones.field
        .filter((c) => !hasKeyword(c, "aura", state, enemy))
        .filter((c) => fieldCardMatchesTarget(state, c, selector))
        .map((c) => c.instanceId);
    }

    case "selfFollower": {
      const fieldIds = getPlayer(state, player).zones.field
        .filter((c) => fieldCardMatchesTarget(state, c, selector))
        .map((c) => c.instanceId);
      if (!selector.includeExArea) return fieldIds;
      const exIds = getPlayer(state, player).zones.exArea
        .filter((c) => {
          const cardNo = resolveCardNo(state, c);
          if (selector.filter && !cardMatchesFilter(cardNo, selector.filter)) return false;
          const def = getCardDef(cardNo);
          return def?.cardType === "follower" || def?.cardType === "amulet";
        })
        .map((c) => c.instanceId);
      return [...fieldIds, ...exIds];
    }

    case "lastSummoned": {
      const id = state.resolutionContext?.lastSummonedInstanceId;
      if (!id) return [];
      const found = findInstance(state, id);
      if (!found || found.player !== player || found.zone !== "field") return [];
      if (!isFieldFollower(state, found.card)) return [];
      return [id];
    }

    case "anyFollower":

      return [...getPlayer(state, 0).zones.field, ...getPlayer(state, 1).zones.field]
        .filter((c) => {
          if (!isFieldFollower(state, c)) return false;
          const owner = getPlayer(state, 0).zones.field.some((f) => f.instanceId === c.instanceId)
            ? 0
            : 1;
          const effectEnemy = opponentOf(player);
          if (owner === effectEnemy && hasKeyword(c, "aura", state, owner)) return false;
          return true;
        })
        .map((c) => c.instanceId);

    case "self":

      return state.resolutionContext?.sourceInstanceId

        ? [state.resolutionContext.sourceInstanceId]

        : [];

    default:

      return [];

  }

}

function shouldPromptTargetSelection(
  selector: TargetSelector,
  candidates: string[],
): boolean {
  if (candidates.length === 0) return false;
  if (candidates.length > 1) return true;
  return (
    selector.type === "enemyFollower" ||
    selector.type === "enemyFieldCard" ||
    selector.type === "anyFollower" ||
    selector.type === "selfFollower"
  );
}



function banishFieldCard(state: GameState, instanceId: string): GameState {
  let next = returnEvolveCardToDeck(state, instanceId, true);
  const found = findInstance(next, instanceId);
  if (!found || found.zone !== "field") return state;
  const p = next.players[found.player];
  const idx = p.zones.field.findIndex((c) => c.instanceId === instanceId);
  if (idx < 0) return state;
  const [card] = p.zones.field.splice(idx, 1);
  resetCardInstanceState(card);
  p.zones.banish.push(card);
  return next;
}

function moveFieldCardToExArea(state: GameState, instanceId: string): GameState {
  const found = findInstance(state, instanceId);
  if (!found || found.zone !== "field") return state;
  const p = getPlayer(state, found.player);
  if (p.zones.exArea.length >= p.exLimit) return state;
  return moveCard(state, instanceId, "exArea", found.player);
}

function dealDamageToFollower(
  state: GameState,
  instanceId: string,
  amount: number,
  options?: { combat?: boolean },
): GameState {

  const next = structuredClone(state);

  const found = findInstance(next, instanceId);

  if (!found) return state;

  const dmg = clampDamageToFollower(next, found.card, found.player, amount);

  found.card.modifiers.push({ atk: 0, def: -dmg, sourceId: "effect" });

  const { def } = getEffectiveStats(found.card, next);

  if (dmg > 0) {
    if (!options?.combat) {
      queueOnDamagedAbilities(next, instanceId, found.player);
      queueOnAbilityDamaged(next, instanceId, found.player);
    } else {
      queueOnDamagedAbilities(next, instanceId, found.player);
    }
  }

  if (def <= 0) {

    queueLastWords(next, instanceId, found.player);

    return destroyFollower(next, instanceId);

  }

  return next;

}



function resolveDamageAmount(state: GameState, player: PlayerId, amount: DamageAmount): number {
  if (typeof amount === "number") return amount;
  if (amount.op === "otherFieldTraitCount") {
    const sourceId = state.resolutionContext?.sourceInstanceId;
    return getPlayer(state, player).zones.field.filter((c) => {
      if (c.instanceId === sourceId) return false;
      const def = getCardDef(c.cardNo);
      return def?.traits?.includes(amount.trait);
    }).length;
  }
  if (amount.op === "fieldTraitCount") {
    return getPlayer(state, player).zones.field.filter((c) => {
      const def = getCardDef(c.cardNo);
      return def?.traits?.includes(amount.trait);
    }).length;
  }
  if (amount.op === "selfAttack") {
    const sourceId = state.resolutionContext?.sourceInstanceId;
    if (!sourceId) return 0;
    const found = findInstance(state, sourceId);
    if (!found) return 0;
    return getEffectiveStats(found.card, state).atk;
  }
  if (amount.op === "traitFieldCount") {
    const count = getPlayer(state, player).zones.field.filter((c) => {
      const def = getCardDef(resolveCardNo(state, c));
      return def?.traits?.includes(amount.trait);
    }).length;
    return count * (amount.multiplier ?? 1);
  }
  if (amount.op === "namedIdentityFieldCount") {
    const target = normalizeIdentityName(amount.identityName);
    const count = getPlayer(state, player).zones.field.filter((c) => {
      const def = getCardDef(resolveCardNo(state, c));
      return def && normalizeIdentityName(def.name) === target;
    }).length;
    return count * (amount.multiplier ?? 1);
  }
  if (amount.op === "targetAttack") {
    const forced = state.resolutionContext?.forcedTargetId;
    if (!forced) return 0;
    const found = findInstance(state, forced);
    if (!found) return 0;
    return getEffectiveStats(found.card, state).atk;
  }
  if (amount.op === "handCount") {
    return getPlayer(state, player).zones.hand.length;
  }
  if (amount.op === "targetControllerHandCount") {
    const forced = state.resolutionContext?.forcedTargetId;
    if (!forced) return 0;
    const found = findInstance(state, forced);
    if (!found) return 0;
    const controller = found.player;
    return getPlayer(state, controller).zones.hand.length;
  }
  if (amount.op === "exAreaCount") {
    return getPlayer(state, player).zones.exArea.length;
  }
  if (amount.op === "handExAreaTotal") {
    const p = getPlayer(state, player);
    return p.zones.hand.length + p.zones.exArea.length;
  }
  if (amount.op === "selfDefense") {
    const sourceId = state.resolutionContext?.sourceInstanceId;
    if (!sourceId) return 0;
    const found = findInstance(state, sourceId);
    if (!found) return 0;
    return getEffectiveStats(found.card, state).def;
  }
  if (amount.op === "maxPp") {
    return getPlayer(state, player).maxPp;
  }
  if (amount.op === "cemeteryFilterCount") {
    return getPlayer(state, player).zones.cemetery.filter((c) =>
      cardMatchesFilter(c.cardNo, amount.filter),
    ).length;
  }
  if (amount.op === "leaderDefLostCount") {
    return getPlayer(state, player).flags.leaderDefLostCountThisTurn;
  }
  if (amount.op === "chosenNumber") {
    return state.resolutionContext?.chosenNumber ?? 0;
  }
  if (amount.op === "cardsPlayedThisTurn") {
    let count = getPlayer(state, player).flags.cardsPlayedThisTurn;
    if (amount.excludeSelf) count = Math.max(0, count - 1);
    return count;
  }
  if (amount.op === "exAreaNamedCount") {
    const target = normalizeIdentityName(amount.identityName);
    return getPlayer(state, player).zones.exArea.filter((c) => {
      const def = getCardDef(resolveCardNo(state, c));
      return def && normalizeIdentityName(def.name) === target;
    }).length;
  }
  if (amount.op === "engagedNamedIdentityCount") {
    const target = normalizeIdentityName(amount.identityName);
    return getPlayer(state, player).zones.field.filter((c) => {
      if (!c.engaged) return false;
      const def = getCardDef(resolveCardNo(state, c));
      return def && normalizeIdentityName(def.name) === target;
    }).length;
  }
  if (amount.op === "wardFieldCount") {
    return getPlayer(state, player).zones.field.filter((c) => {
      const def = getCardDef(resolveCardNo(state, c));
      return def?.cardType === "follower" && def.keywords?.includes("ward");
    }).length;
  }
  if (amount.op === "secondTargetAttack") {
    const ids = state.resolutionContext?.compareTargetIds;
    const secondId = ids?.[1];
    if (!secondId) return 0;
    const found = findInstance(state, secondId);
    if (!found) return 0;
    return getEffectiveStats(found.card, state).atk;
  }
  if (amount.op === "evolveDeckFaceupCount") {
    return countEvolveDeckFaceup(state, player, amount.filter);
  }
  return 0;
}

function promptSelectZoneCards(
  state: GameState,
  player: PlayerId,
  fromZone: "cemetery" | "hand" | "exArea" | "field" | "deck",
  count: number,
  action: "banish" | "discard" | "bury",
  matches: { instanceId: string; cardNo: string }[],
  resumeActivate?: {
    sourceInstanceId: string;
    zone: "field" | "cemetery" | "exArea" | "hand";
    abilityKey: string;
  },
  minCount?: number,
  maxCount?: number,
): GameState {
  const next = structuredClone(state);
  next.pendingChoices = withChoiceContext(next, {
    type: "selectZoneCards",
    player,
    fromZone,
    count: minCount == null && maxCount == null ? count : undefined,
    minCount: minCount ?? (maxCount != null ? 0 : undefined),
    maxCount: maxCount ?? count,
    action,
    resumeActivate,
    reasonLabel: `${action} card(s)`,
    options: zoneCardOptions(matches),
  });
  return next;
}

function dealDamageToLeader(state: GameState, player: PlayerId, amount: number): GameState {

  const next = structuredClone(state);
  const p = next.players[player];
  if (amount > 0 && (p.flags.leaderDamageShields ?? 0) > 0) {
    p.flags.leaderDamageShields = (p.flags.leaderDamageShields ?? 0) - 1;
    return next;
  }

  p.leaderDef -= amount;

  next.players[player].flags.leaderLostDefThisTurn = true;
  next.players[player].flags.leaderDefLostCountThisTurn += 1;

  return next;

}



function labelForInstance(state: GameState, id: string): string {

  if (id === "leader") return "Enemy Leader";

  if (id === "selfLeader") return "Your Leader";

  const found = findInstance(state, id);

  if (!found) return id.slice(0, 8);

  const def = getCardDef(found.card.cardNo);

  const name = def?.name || found.card.cardNo;

  const { atk, def: defense } = getEffectiveStats(found.card, state);

  return `${name} (${atk}/${defense})`;

}



function promptSelectTarget(

  state: GameState,

  player: PlayerId,

  effect: Effect,

  candidates: string[],

): GameState {

  const next = structuredClone(state);

  next.pendingChoices = withChoiceContext(next, {
    type: "selectTarget",
    player,
    effect,
    reasonLabel: describeEffect(effect),
    candidates: candidates.map((instanceId) => {
      const found = findInstance(next, instanceId);
      return {
        instanceId,
        label: labelForInstance(next, instanceId),
        cardNo: found?.card.cardNo,
      };
    }),
  });

  return next;

}



function zoneCardOptions(cards: { instanceId: string; cardNo: string }[]) {

  return cards.map((c) => ({

    instanceId: c.instanceId,

    label: getCardDef(c.cardNo)?.name || c.cardNo,

    cardNo: c.cardNo,

  }));

}



function promptSelectZoneCard(

  state: GameState,

  player: PlayerId,

  fromZone: "deck" | "cemetery" | "hand" | "evolveDeck",

  to: "hand" | "exArea" | "field",

  matches: { instanceId: string; cardNo: string }[],

  optional?: boolean,

  playCostReduction?: number,

  reveal?: boolean,

): GameState {

  const next = structuredClone(state);

  next.pendingChoices = withChoiceContext(next, {
    type: "selectZoneCard",
    player,
    fromZone,
    to,
    optional,
    playCostReduction,
    reveal,
    options: zoneCardOptions(matches),
  });

  return next;

}

function promptSelectEvolveDeckCard(
  state: GameState,
  player: PlayerId,
  matches: { instanceId: string; cardNo: string }[],
  opts: {
    turnTo?: "faceup" | "facedown";
    pendingEffect?: import("../types").Effect;
    optional?: boolean;
  },
): GameState {
  const next = structuredClone(state);
  next.pendingChoices = withChoiceContext(next, {
    type: "selectEvolveDeckCard",
    player,
    turnTo: opts.turnTo,
    pendingEffect: opts.pendingEffect,
    optional: opts.optional,
    reasonLabel: "Select a card in your evolve deck",
    options: zoneCardOptions(matches),
  });
  return next;
}

function promptSearchDeckTop(

  state: GameState,

  player: PlayerId,

  top: { instanceId: string; cardNo: string }[],

  filter: DeckFilter,

  to: "hand" | "exArea" | "field" | "banish",

  optional?: boolean,

  playCostReduction?: number,

  remainderTo: "cemetery" | "deckBottom" = "cemetery",

  reveal?: boolean,

): GameState {

  const next = structuredClone(state);

  next.pendingChoices = withChoiceContext(next, {
    type: "searchDeckTop",
    player,
    to,
    filter,
    topInstanceIds: top.map((c) => c.instanceId),
    optional,
    playCostReduction,
    remainderTo,
    reveal,
    reasonLabel: "Search deck",
    options: top.map((c) => ({
      instanceId: c.instanceId,
      label: getCardDef(c.cardNo)?.name || c.cardNo,
      cardNo: c.cardNo,
      eligible: cardMatchesFilter(c.cardNo, filter),
    })),
  });

  return next;

}

function promptSelectDeckSummon(
  state: GameState,
  player: PlayerId,
  top: { instanceId: string; cardNo: string }[],
  filter: DeckFilter,
  maxTotalCost: number,
  remainderTo: "cemetery" | "deckBottom",
): GameState {
  const next = structuredClone(state);
  next.pendingChoices = withChoiceContext(next, {
    type: "selectDeckSummon",
    player,
    maxTotalCost,
    filter,
    topInstanceIds: top.map((c) => c.instanceId),
    remainderTo,
    reasonLabel: "Summon followers from deck",
    options: top.map((c) => ({
      instanceId: c.instanceId,
      label: getCardDef(c.cardNo)?.name || c.cardNo,
      cardNo: c.cardNo,
      cost: resolveCardDefCost(c.cardNo),
      eligible: cardMatchesFilter(c.cardNo, filter),
    })),
  });
  return next;
}

export function buryDeckCards(state: GameState, player: PlayerId, instanceIds: string[]): GameState {

  let next = structuredClone(state);

  const p = next.players[player];

  for (const id of instanceIds) {

    const idx = p.zones.deck.findIndex((c) => c.instanceId === id);

    if (idx < 0) continue;

    const [card] = p.zones.deck.splice(idx, 1);

    p.zones.cemetery.push(card);

    next.eventLog.push({ type: "bury", player });

  }

  return next;

}



export function moveZoneCardTo(

  state: GameState,

  player: PlayerId,

  instanceId: string,

  fromZone: "deck" | "cemetery" | "hand" | "evolveDeck",

  to: "hand" | "exArea" | "field" | "banish",

): GameState {

  let next = structuredClone(state);

  const p = next.players[player];

  const list = p.zones[fromZone];

  const idx = list.findIndex((c) => c.instanceId === instanceId);

  if (idx < 0) return state;

  const [card] = list.splice(idx, 1);

  if (to === "banish") {
    resetCardInstanceState(card);
    p.zones.banish.push(card);
    if (fromZone === "deck") return shuffleDeck(next, player);
    return next;
  }

  if (to === "hand") {

    p.zones.hand.push(card);
    if (fromZone === "cemetery" || fromZone === "deck") {
      next.resolutionContext = {
        ...next.resolutionContext,
        sourceInstanceId: next.resolutionContext?.sourceInstanceId,
        effectStack: next.resolutionContext?.effectStack ?? [],
        lastTutoredInstanceId: card.instanceId,
      };
    }

  } else if (to === "exArea" && p.zones.exArea.length < p.exLimit) {

    p.zones.exArea.push(card);

    onCardEntersExArea(next, card.instanceId, player);

  } else if (to === "field") {

    if (p.zones.field.length >= p.fieldLimit) {
      list.push(card);
    } else {
      if (fromZone === "cemetery") {
        card.enteredFromCemetery = true;
        card.enteredFromHand = false;
      }
      p.zones.field.push(card);
      onFollowerEntersField(next, card.instanceId, player);
      next.resolutionContext = {
        ...next.resolutionContext,
        sourceInstanceId: next.resolutionContext?.sourceInstanceId,
        effectStack: next.resolutionContext?.effectStack ?? [],
        lastSummonedInstanceId: card.instanceId,
      };
    }

  } else {

    list.push(card);

  }

  if (fromZone === "deck") return shuffleDeck(next, player);

  return next;

}



function applyGrantKeyword(

  state: GameState,

  player: PlayerId,

  keyword: Keyword,

  targets: TargetSelector,

): GameState {

  const next = structuredClone(state);

  const candidates = getTargetCandidates(next, player, targets);

  if (candidates.length === 0) return state;

  const found = findInstance(next, candidates[0]);

  if (!found) return state;

  if (!found.card.grantedKeywords.includes(keyword)) {

    found.card.grantedKeywords.push(keyword);

  }

  return next;

}



function canSatisfyOptionalCost(state: GameState, player: PlayerId, effect: Effect): boolean {
  switch (effect.op) {
    case "discardFromHand": {
      const need = effect.count ?? 1;
      const matches = getPlayer(state, player).zones.hand.filter((c) =>
        cardMatchesFilter(c.cardNo, effect.filter),
      );
      return matches.length >= need;
    }
    case "selectFromHand":
      return getPlayer(state, player).zones.hand.some((c) =>
        cardMatchesFilter(c.cardNo, effect.filter),
      );
    case "banishFromExArea": {
      const need = effect.count ?? 1;
      return (
        getPlayer(state, player).zones.exArea.filter((c) =>
          cardMatchesFilter(c.cardNo, effect.filter),
        ).length >= need
      );
    }
    case "banishFromCemetery": {
      const need = effect.count ?? 1;
      return (
        getPlayer(state, player).zones.cemetery.filter((c) =>
          cardMatchesFilter(c.cardNo, effect.filter),
        ).length >= need
      );
    }
    case "spendPp":
      return getPlayer(state, player).pp >= effect.amount;
    case "sequence":
      return effect.steps.every((step) => canSatisfyOptionalCost(state, player, step));
    default:
      return true;
  }
}

export type ResolveEffectOptions = {
  deferConfirmation?: boolean;
};

export function resolveEffect(
  state: GameState,
  effect: Effect,
  player: PlayerId,
  options?: ResolveEffectOptions,
): GameState {

  let next = structuredClone(state);

  if (options?.deferConfirmation) {
    next.resolutionContext = {
      sourceInstanceId: next.resolutionContext?.sourceInstanceId,
      effectStack: next.resolutionContext?.effectStack ?? [],
      resumeAfterChoice: next.resolutionContext?.resumeAfterChoice,
      forcedTargetId: next.resolutionContext?.forcedTargetId,
      ...resolutionContextFields(next.resolutionContext),
      deferTriggers: true,
    };
  }

  switch (effect.op) {

    case "draw":

      for (let i = 0; i < effect.count; i++) {

        next = drawCard(next, player);

      }

      break;

    case "drawDynamic": {
      const count = resolveDamageAmount(next, player, effect.amount);
      for (let i = 0; i < count; i++) {
        next = drawCard(next, player);
      }
      break;
    }



    case "recoverPp": {
      const p = next.players[player];
      const amt = resolveDamageAmount(next, player, effect.amount);
      p.pp = Math.min(p.pp + amt, p.maxPp);
      break;
    }

    case "spendPp": {
      const p = next.players[player];
      p.pp = Math.max(0, p.pp - effect.amount);
      break;
    }

    case "rollDie": {
      const roll = Math.floor(Math.random() * effect.sides) + 1;
      next.eventLog.push({ type: "diceRoll", player, data: { roll } });
      const outcome = effect.outcomes.find((o) => o.on.includes(roll));
      if (outcome) {
        next = resolveEffect(next, outcome.effect, player, options);
        if (next.pendingChoices) return next;
      }
      break;
    }

    case "buryOpponentMaxAttackFollower": {
      for (const opp of [opponentOf(player)] as PlayerId[]) {
        const field = getPlayer(next, opp).zones.field;
        if (field.length === 0) continue;
        let best = field[0];
        let bestAtk = getEffectiveStats(best, next).atk;
        for (const card of field.slice(1)) {
          const atk = getEffectiveStats(card, next).atk;
          if (atk > bestAtk) {
            best = card;
            bestAtk = atk;
          }
        }
        const p = next.players[opp];
        const idx = p.zones.field.findIndex((c) => c.instanceId === best.instanceId);
        if (idx < 0) continue;
        const [buried] = p.zones.field.splice(idx, 1);
        resetCardInstanceState(buried);
        p.zones.cemetery.push(buried);
        next.eventLog.push({ type: "bury", player: opp });
      }
      break;
    }



    case "healLeader":

      next.players[player].leaderDef += effect.amount;

      break;



    case "dealDamage": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);

      if (candidates.length === 0) break;

      let targetId: string;

      if (forced) {

        if (!candidates.includes(forced)) break;

        targetId = forced;

      } else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {

        return promptSelectTarget(next, player, effect, candidates);

      } else {

        targetId = candidates[0];

      }

      const damage = resolveDamageAmount(next, player, effect.amount);

      if (targetId === "leader") {

        next = dealDamageToLeader(next, opponentOf(player), damage);

      } else if (targetId === "selfLeader") {

        next = dealDamageToLeader(next, player, damage);

      } else {

        next = dealDamageToFollower(next, targetId, damage);

      }

      break;

    }



    case "buffFieldTrait": {
      const p = next.players[player];
      const sourceId = next.resolutionContext?.sourceInstanceId || "effect";
      const zones = effect.includeExArea
        ? [...p.zones.field, ...p.zones.exArea]
        : p.zones.field;
      for (const card of zones) {
        if (effect.excludeSelf && card.instanceId === sourceId) continue;
        if (effect.otherOnly && card.instanceId === sourceId) continue;
        const def = getCardDef(resolveCardNo(next, card));
        if (!def) continue;
        if (effect.cardClass && def.class !== effect.cardClass) continue;
        if (effect.trait && !def.traits?.includes(effect.trait)) continue;
        if (!effect.cardClass && !effect.trait) continue;
        card.modifiers.push({ atk: effect.atk ?? 0, def: effect.def ?? 0, sourceId });
        if (effect.keyword && !card.grantedKeywords.includes(effect.keyword)) {
          card.grantedKeywords.push(effect.keyword);
        }
      }
      break;
    }

    case "buff": {

      const forced = next.resolutionContext?.forcedTargetId;

      const candidates = getTargetCandidates(next, player, effect.targets);

      if (candidates.length === 0) break;

      let targetId: string;

      if (forced) {

        if (!candidates.includes(forced)) break;

        targetId = forced;

      } else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {

        return promptSelectTarget(next, player, effect, candidates);

      } else {

        targetId = candidates[0];

      }

      const found = findInstance(next, targetId);

      if (found) {

        found.card.modifiers.push({

          atk: effect.atk ?? 0,

          def: effect.def ?? 0,

          sourceId: next.resolutionContext?.sourceInstanceId || "effect",

        });

      }

      break;

    }



    case "grantKeyword":

      next = applyGrantKeyword(next, player, effect.keyword, effect.targets);

      break;



    case "destroy": {

      const forced = next.resolutionContext?.forcedTargetId;

      const candidates = getTargetCandidates(next, player, effect.targets);

      if (candidates.length === 0) break;

      let targetId: string;

      if (forced) {

        if (!candidates.includes(forced)) break;

        targetId = forced;

      } else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {

        return promptSelectTarget(next, player, effect, candidates);

      } else {

        targetId = candidates[0];

      }

      queueLastWords(next, targetId, player);

      const destroyTarget = findInstance(next, targetId);
      if (destroyTarget?.card.indestructibleByAbilities) break;

      next = destroyFollower(next, targetId);

      break;

    }

    case "banish": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId: string;
      if (forced) {
        if (!candidates.includes(forced)) break;
        targetId = forced;
      } else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      } else {
        targetId = candidates[0];
      }
      next = banishFieldCard(next, targetId);
      break;
    }

    case "moveToExArea": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId: string;
      if (forced) {
        if (!candidates.includes(forced)) break;
        targetId = forced;
      } else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      } else {
        targetId = candidates[0];
      }
      next = moveFieldCardToExArea(next, targetId);
      break;
    }

    case "clash": {
      const ctx = next.resolutionContext;
      const forced = ctx?.forcedTargetId;
      if (!ctx?.clashSelfId) {
        const selfCandidates = getTargetCandidates(next, player, {
          type: "selfFollower",
          excludeSelf: true,
        });
        if (selfCandidates.length === 0) break;
        if (forced && selfCandidates.includes(forced)) {
          next.resolutionContext = {
            ...ctx,
            sourceInstanceId: ctx?.sourceInstanceId,
            effectStack: ctx?.effectStack ?? [],
            clashSelfId: forced,
            clashStep: "pickEnemy",
            forcedTargetId: undefined,
          };
        } else if (!next.pendingChoices) {
          return promptSelectTarget(next, player, effect, selfCandidates);
        } else {
          break;
        }
      }
      const selfId = next.resolutionContext?.clashSelfId;
      if (!selfId) break;
      const enemyCandidates = getTargetCandidates(next, player, { type: "enemyFollower" });
      if (enemyCandidates.length === 0) break;
      const enemyForced = next.resolutionContext?.forcedTargetId;
      let enemyId: string;
      if (enemyForced && enemyCandidates.includes(enemyForced)) {
        enemyId = enemyForced;
      } else if (!enemyForced && !next.pendingChoices) {
        return promptSelectTarget(next, player, effect, enemyCandidates);
      } else if (!enemyForced) {
        break;
      } else {
        break;
      }
      const selfFound = findInstance(next, selfId);
      const enemyFound = findInstance(next, enemyId);
      if (!selfFound || !enemyFound) break;
      const selfAtk = getEffectiveStats(selfFound.card, next).atk;
      const enemyAtk = getEffectiveStats(enemyFound.card, next).atk;
      next = dealDamageToFollower(next, selfId, enemyAtk, { combat: true });
      next = dealDamageToFollower(next, enemyId, selfAtk, { combat: true });
      next.resolutionContext = {
        ...next.resolutionContext,
        sourceInstanceId: next.resolutionContext?.sourceInstanceId,
        effectStack: next.resolutionContext?.effectStack ?? [],
        clashSelfId: undefined,
        clashStep: undefined,
        forcedTargetId: undefined,
      };
      break;
    }

    case "summon": {

      const p = next.players[player];

      const zone = effect.zone === "exArea" ? p.zones.exArea : p.zones.field;

      const limit = effect.zone === "exArea" ? p.exLimit : p.fieldLimit;

      const tokenCardNo =
        effect.tokenCardNo ?? (effect.tokenName ? resolveCardNoByIdentity(effect.tokenName) : undefined);

      if (!tokenCardNo) break;

      for (let i = 0; i < effect.count && zone.length < limit; i++) {

        const token = createCardInstance(tokenCardNo, player, player);

        zone.push(token);

        if (effect.zone === "field") {

          onFollowerEntersField(next, token.instanceId, player);

        } else {

          onCardEntersExArea(next, token.instanceId, player);

        }

      }

      break;

    }



    case "discard": {

      const hand = next.players[player].zones.hand;

      const toDiscard = Math.min(effect.count, hand.length);

      if (toDiscard <= 0) break;

      if (toDiscard > 0 && !next.pendingChoices) {

        return promptSelectZoneCards(next, player, "hand", toDiscard, "discard", hand);

      }

      for (let i = 0; i < toDiscard; i++) {

        const card = hand.pop()!;

        next.players[player].zones.cemetery.push(card);

      }

      break;

    }



    case "if":

      if (evalCondition(next, player, effect.condition)) {

        next = resolveEffect(next, effect.then, player);

      } else if (effect.else) {

        next = resolveEffect(next, effect.else, player);

      }

      break;



    case "noop":
      break;

    case "optionalCost": {
      if (!canSatisfyOptionalCost(next, player, effect.cost)) break;
      if (!next.pendingChoices) {
        next.pendingChoices = withChoiceContext(next, {
          type: "choose",
          player,
          min: 1,
          max: 1,
          reasonLabel: effect.label ?? "Optional effect",
          options: [
            {
              index: 0,
              label: effect.label ?? "Pay cost",
              effect: { op: "sequence", steps: [effect.cost, effect.then] },
            },
            { index: 1, label: "Skip", effect: { op: "noop" } },
          ],
        });
        return next;
      }
      break;
    }

    case "sequence": {
      next.resolutionContext = {
        sourceInstanceId: next.resolutionContext?.sourceInstanceId,
        effectStack: next.resolutionContext?.effectStack ?? [],
        resumeAfterChoice: next.resolutionContext?.resumeAfterChoice,
        forcedTargetId: next.resolutionContext?.forcedTargetId,
        ...resolutionContextFields(next.resolutionContext),
        deferTriggers: true,
      };
      for (let i = 0; i < effect.steps.length; i++) {
        next = resolveEffect(next, effect.steps[i], player, { deferConfirmation: true });
        if (next.pendingChoices) {
          return appendResumeEffects(next, effect.steps.slice(i + 1));
        }
      }
      break;
    }



    case "choose":

      if (!next.pendingChoices) {

        const affordableOptions = effect.options
          .map((o, i) => ({
            index: i,
            label: o.label,
            effect: o.effect,
            additionalPpCost: o.additionalPpCost,
          }))
          .filter((o) => !o.additionalPpCost || next.players[player].pp >= o.additionalPpCost);
        if (affordableOptions.length === 0) break;
        next.pendingChoices = withChoiceContext(next, {
          type: "choose",
          player,
          reasonLabel: "Choose an option",
          options: affordableOptions,
          min: effect.min,
          max: effect.max,
        });

        return next;

      }

      break;



    case "chooseMultiple":

      if (!next.pendingChoices) {

        next.pendingChoices = withChoiceContext(next, {
          type: "chooseMultiple",
          player,
          reasonLabel: "Choose effects and order",
          options: effect.options.map((o, i) => ({
            index: i,
            label: o.label,
            effect: o.effect,
          })),
          min: effect.min,
          max: effect.max,
        });

        return next;

      }

      break;



    case "mill": {

      const deck = next.players[player].zones.deck;

      for (let i = 0; i < effect.count && deck.length > 0; i++) {

        const [card] = deck.splice(0, 1);

        next.players[player].zones.cemetery.push(card);

        next.eventLog.push({ type: "bury", player });

      }

      if (deck.length === 0 && effect.count > 0) {

        next.eventLog.push({ type: "deckOut", player });

      }

      break;

    }



    case "millOpponent": {

      const opp = opponentOf(player);

      const deck = next.players[opp].zones.deck;

      for (let i = 0; i < effect.count && deck.length > 0; i++) {

        const [card] = deck.splice(0, 1);

        next.players[opp].zones.cemetery.push(card);

      }

      break;

    }



    case "damageFollowerAndLeader": {

      const forced = next.resolutionContext?.forcedTargetId;

      const candidates = getTargetCandidates(next, player, { type: "enemyFollower" });

      if (candidates.length === 0) break;

      let targetId: string;

      if (forced) {

        if (!candidates.includes(forced)) break;

        targetId = forced;

      } else if (
        shouldPromptTargetSelection({ type: "enemyFollower", count: 1 }, candidates) &&
        !next.pendingChoices
      ) {

        return promptSelectTarget(next, player, effect, candidates);

      } else {

        targetId = candidates[0];

      }

      next = dealDamageToFollower(next, targetId, resolveDamageAmount(next, player, effect.followerAmount));

      next = dealDamageToLeader(next, opponentOf(player), resolveDamageAmount(next, player, effect.leaderAmount));

      break;

    }



    case "tutorFromCemetery": {

      const p = next.players[player];

      const matches = p.zones.cemetery.filter((c) => cardMatchesFilter(c.cardNo, effect.filter));

      if (matches.length === 0) break;

      if (!next.pendingChoices) {

        return promptSelectZoneCard(
          next,
          player,
          "cemetery",
          effect.to,
          matches,
          undefined,
          effect.playCostReduction,
          effect.reveal,
        );

      }

      break;

    }



    case "autoEvolveIf": {

      if (!evalCondition(next, player, effect.condition)) break;

      const sourceId = next.resolutionContext?.sourceInstanceId;

      if (!sourceId) break;

      const fieldFound = findInstance(next, sourceId);

      if (!fieldFound || fieldFound.zone !== "field" || fieldFound.card.linkedEvoInstanceId) break;

      const evoCard = findMatchingEvolveCard(next, player, sourceId);

      if (!evoCard) break;

      const evoFound = findInstance(next, evoCard.instanceId);

      if (!evoFound || evoFound.zone !== "evolveDeck") break;

      next = moveCard(next, evoCard.instanceId, "resolutionZone", player);

      const fieldOnNext = findInstance(next, sourceId);
      if (!fieldOnNext || fieldOnNext.zone !== "field") break;

      fieldOnNext.card.linkedEvoInstanceId = evoCard.instanceId;

      fieldOnNext.card.evolvedThisTurn = true;

      // Preserve leader-attack eligibility when evolving a follower already on board since turn start.

      next.players[player].flags.evolvedThisTurn = true;

      next.players[player].zones.evolveZone.push({

        fieldInstanceId: sourceId,

        evolveInstanceId: evoCard.instanceId,

      });

      if (effect.triggerOnEvolve === true) {
        const evoDef = getCardDef(evoFound.card.cardNo);
        for (const ability of evoDef?.abilities?.filter((a) => a.timing === "onEvolve") ?? []) {
          next.resolutionContext = contextForTriggerResolution(next, sourceId, ability.effect);
          next = resolveEffect(next, ability.effect, player);
          if (next.pendingChoices || (next.resolutionContext?.resumeAfterChoice?.length ?? 0) > 0) {
            return next;
          }
          next.resolutionContext = null;
        }
      }

      break;

    }



    case "tutorFromDeck": {

      const p = next.players[player];

      const matches = p.zones.deck.filter((c) => cardMatchesFilter(c.cardNo, effect.filter));

      if (matches.length === 0) break;

      if (!next.pendingChoices) {

        return promptSelectZoneCard(
          next,
          player,
          "deck",
          effect.to,
          matches,
          undefined,
          effect.playCostReduction,
          effect.reveal,
        );

      }

      break;

    }



    case "searchDeckChoose": {

      const p = next.players[player];

      const top = p.zones.deck.slice(0, effect.lookAt);

      if (top.length === 0) break;

      if (!next.pendingChoices) {

        return promptSearchDeckTop(
          next,
          player,
          top,
          effect.filter,
          effect.to,
          effect.optional,
          effect.playCostReduction,
          effect.remainderTo ?? "cemetery",
          effect.reveal,
        );

      }

      break;

    }



    case "engage": {

      const forced = next.resolutionContext?.forcedTargetId;

      const candidates = getTargetCandidates(next, player, effect.targets);

      if (candidates.length === 0) break;

      let targetId: string;

      if (forced) {

        if (!candidates.includes(forced)) break;

        targetId = forced;

      } else if (candidates.length >= 1 && !next.pendingChoices) {

        return promptSelectTarget(next, player, effect, candidates);

      } else {

        targetId = candidates[0];

      }

      const found = findInstance(next, targetId);

      if (found) {
        found.card.engaged = true;
        if (effect.skipRefreshNextStart) {
          found.card.skipRefreshOnTurn = next.turnNumber + 1;
        }
        queueOnBecomeEngaged(next, targetId, found.player);
      }

      break;

    }



    case "box": {

      const forced = next.resolutionContext?.forcedTargetId;

      const candidates = getTargetCandidates(next, player, effect.targets);

      if (candidates.length === 0) break;

      let targetId: string;

      if (forced) {

        if (!candidates.includes(forced)) break;

        targetId = forced;

      } else if (candidates.length >= 1 && !next.pendingChoices) {

        return promptSelectTarget(next, player, effect, candidates);

      } else {

        targetId = candidates[0];

      }

      const found = findInstance(next, targetId);

      if (found) {

        found.card.engaged = true;

        found.card.boxedUntilTurn = next.turnNumber + 2;

      }

      break;

    }



    case "grantPlayCostReduction": {

      const candidates = getTargetCandidates(next, player, effect.targets);

      if (candidates.length === 0) break;

      const targetId = candidates[0];

      const found = findInstance(next, targetId);

      if (found) found.card.persistentPlayCostReduction += effect.amount;

      break;

    }



    case "banishFromCemetery": {

      const p = next.players[player];

      const matches = p.zones.cemetery.filter((c) => cardMatchesFilter(c.cardNo, effect.filter));

      const toBanish = Math.min(effect.count, matches.length);

      if (toBanish <= 0) break;

      if (matches.length >= toBanish && !next.pendingChoices) {

        return promptSelectZoneCards(next, player, "cemetery", toBanish, "banish", matches);

      }

      for (let i = 0; i < toBanish; i++) {

        const idx = p.zones.cemetery.findIndex((c) => cardMatchesFilter(c.cardNo, effect.filter));

        if (idx < 0) break;

        const [card] = p.zones.cemetery.splice(idx, 1);

        p.zones.banish.push(card);

      }

      break;

    }



    case "banishFromExArea": {

      const p = next.players[player];

      for (let i = 0; i < effect.count; i++) {

        const idx = p.zones.exArea.findIndex((c) => cardMatchesFilter(c.cardNo, effect.filter));

        if (idx < 0) break;

        const [card] = p.zones.exArea.splice(idx, 1);

        p.zones.banish.push(card);

      }

      break;

    }



    case "reviveSelfFromCemetery": {

      const sourceId = next.resolutionContext?.sourceInstanceId;

      if (!sourceId) break;

      const p = next.players[player];

      const idx = p.zones.cemetery.findIndex((c) => c.instanceId === sourceId);

      if (idx < 0 || p.zones.field.length >= p.fieldLimit) break;

      const [card] = p.zones.cemetery.splice(idx, 1);

      p.zones.field.push(card);

      onFollowerEntersField(next, card.instanceId, player);

      break;

    }



    case "moveSourceToExArea": {

      const sourceId = next.resolutionContext?.sourceInstanceId;

      if (!sourceId) break;

      const p = next.players[player];

      if (p.zones.exArea.length >= p.exLimit) break;

      let fromZone: "cemetery" | "hand" | null = null;

      let idx = p.zones.cemetery.findIndex((c) => c.instanceId === sourceId);

      if (idx >= 0) fromZone = "cemetery";

      if (fromZone === null) {

        idx = p.zones.hand.findIndex((c) => c.instanceId === sourceId);

        if (idx >= 0) fromZone = "hand";

      }

      if (fromZone === null || idx < 0) break;

      const [card] = p.zones[fromZone].splice(idx, 1);

      p.zones.exArea.push(card);

      onCardEntersExArea(next, card.instanceId, player);

      break;

    }



    case "selectFromHand": {

      const p = next.players[player];

      const matches = p.zones.hand.filter((c) => cardMatchesFilter(c.cardNo, effect.filter));

      if (matches.length === 0) {

        if (effect.optional) break;

        return next;

      }

      if (!next.pendingChoices) {

        return promptSelectZoneCard(
          next,
          player,
          "hand",
          effect.to,
          matches,
          effect.optional,
          effect.playCostReduction,
        );

      }

      break;

    }



    case "discardFromHand": {

      const p = next.players[player];

      const matches = p.zones.hand.filter((c) => cardMatchesFilter(c.cardNo, effect.filter));

      const toDiscard = Math.min(effect.count, matches.length);

      if (toDiscard <= 0) break;

      if (toDiscard > 0 && !next.pendingChoices) {

        return promptSelectZoneCards(next, player, "hand", toDiscard, "discard", matches);

      }

      let remaining = toDiscard;

      for (let i = p.zones.hand.length - 1; i >= 0 && remaining > 0; i--) {

        const card = p.zones.hand[i];

        if (!cardMatchesFilter(card.cardNo, effect.filter)) continue;

        p.zones.hand.splice(i, 1);

        p.zones.cemetery.push(card);

        next.resolutionContext = {
          ...next.resolutionContext,
          sourceInstanceId: next.resolutionContext?.sourceInstanceId,
          effectStack: next.resolutionContext?.effectStack ?? [],
          lastDiscardedCardNo: card.cardNo,
        };

        remaining--;

      }

      break;

    }



    case "triggerAbilities": {

      const sourceId = next.resolutionContext?.sourceInstanceId;

      if (!sourceId) break;

      const found = findInstance(next, sourceId);

      if (!found) break;

      const def = getCardDef(resolveCardNo(next, found.card));

      const abilities = def?.abilities?.filter((a) => a.timing === effect.timing) ?? [];

      for (const ability of abilities) {

        next = resolveEffect(next, ability.effect, player);

        if (next.pendingChoices) return next;

      }

      break;

    }



    case "banishSelf": {

      const sourceId = next.resolutionContext?.sourceInstanceId;

      if (!sourceId) break;

      const found = findInstance(next, sourceId);

      if (!found) break;

      const p = next.players[found.player];

      const zoneKey = found.zone as keyof typeof p.zones;

      const list = p.zones[zoneKey] as typeof p.zones.hand;

      const idx = list.findIndex((c) => c.instanceId === sourceId);

      if (idx < 0) break;

      const [card] = list.splice(idx, 1);

      resetCardInstanceState(card);

      p.zones.banish.push(card);

      break;

    }



    case "grantLastWords": {

      const sourceId = next.resolutionContext?.sourceInstanceId;

      const found = sourceId ? findInstance(next, sourceId) : null;

      if (!found) break;

      if (!found.card.grantedLastWords) found.card.grantedLastWords = [];

      found.card.grantedLastWords.push(effect.effect);

      break;

    }



    case "putHandCardOnDeck": {

      const hand = next.players[player].zones.hand;

      if (hand.length === 0) break;

      if (!next.pendingChoices) {

        const pick = structuredClone(next);

        pick.pendingChoices = withChoiceContext(pick, {
          type: "putHandOnDeck",
          player,
          phase: "selectCard",
          position: effect.position,
          reasonLabel: "Put a hand card on your deck",
          options: hand.map((c) => ({
            instanceId: c.instanceId,
            cardNo: c.cardNo,
            label: getCardDef(c.cardNo)?.name || c.cardNo,
          })),
        });

        return pick;

      }

      break;

    }



    case "summonFromEvolveDeck": {

      const p = next.players[player];

      if (p.zones.field.length >= p.fieldLimit) break;

      const filter = effect.filter ?? {};

      const matches = p.zones.evolveDeck.filter((c) => cardMatchesFilter(c.cardNo, filter));

      if (matches.length === 0) break;

      if (!next.pendingChoices) {
        if (matches.length === 1) {
          next = moveZoneCardTo(next, player, matches[0].instanceId, "evolveDeck", "field");
          break;
        }
        return promptSelectZoneCard(next, player, "evolveDeck", "field", matches);
      }

      break;

    }



    case "summonFromCemetery": {

      const p = next.players[player];

      const slots = p.fieldLimit - p.zones.field.length;

      if (slots <= 0) break;

      const toSummon = Math.min(effect.count, slots);

      if (toSummon <= 0) break;

      const matches = p.zones.cemetery.filter((c) => cardMatchesFilter(c.cardNo, effect.filter));

      if (matches.length === 0) break;

      if (effect.maxTotalCost != null) {

        if (!next.pendingChoices) {

          const pick = structuredClone(next);

          pick.pendingChoices = withChoiceContext(pick, {
            type: "selectCemeterySummon",
            player,
            count: toSummon,
            maxTotalCost: effect.maxTotalCost,
            filter: effect.filter,
            reasonLabel: "Summon from cemetery",
            options: matches.map((c) => ({
              instanceId: c.instanceId,
              cardNo: c.cardNo,
              label: getCardDef(c.cardNo)?.name || c.cardNo,
              cost: resolveCardDefCost(c.cardNo),
              eligible: resolveCardDefCost(c.cardNo) <= effect.maxTotalCost!,
            })),
          });

          return pick;

        }

        break;

      }

      let summoned = 0;

      for (const card of [...matches]) {

        if (summoned >= toSummon || p.zones.field.length >= p.fieldLimit) break;

        const idx = p.zones.cemetery.findIndex((c) => c.instanceId === card.instanceId);

        if (idx < 0) continue;

        const [picked] = p.zones.cemetery.splice(idx, 1);

        p.zones.field.push(picked);

        onFollowerEntersField(next, picked.instanceId, player);

        summoned++;

      }

      break;

    }



    case "searchDeckSummonMultiple": {
      const p = next.players[player];
      const top = p.zones.deck.slice(0, effect.lookAt);
      if (top.length === 0) break;
      if (!next.pendingChoices) {
        return promptSelectDeckSummon(
          next,
          player,
          top,
          effect.filter,
          effect.maxTotalCost,
          effect.remainderTo ?? "deckBottom",
        );
      }
      break;
    }

    case "buryFieldFollowers": {
      const p = next.players[player];
      const sourceId = next.resolutionContext?.sourceInstanceId;
      const buriedCosts: number[] = [];
      let toBury;
      if (effect.sourceOnly && sourceId) {
        const source = findInstance(next, sourceId);
        toBury = source?.zone === "field" ? [source.card] : [];
      } else {
        toBury = p.zones.field.filter((card) => {
          if (effect.excludeSelf && card.instanceId === sourceId) return false;
          const cardNo = resolveCardNo(next, card);
          if (effect.filter && !cardMatchesFilter(cardNo, effect.filter)) return false;
          if (effect.minCost != null && resolveCardDefCost(cardNo) < effect.minCost) {
            return false;
          }
          return true;
        });
      }
      for (const card of toBury) {
        buriedCosts.push(resolveCardDefCost(resolveCardNo(next, card)));
        queueLastWords(next, card.instanceId, player);
        next = destroyFollower(next, card.instanceId);
      }
      next.resolutionContext = {
        ...next.resolutionContext,
        sourceInstanceId: next.resolutionContext?.sourceInstanceId,
        effectStack: next.resolutionContext?.effectStack ?? [],
        buriedCosts,
      };
      break;
    }

    case "dealDamageAllEnemies": {
      const opp = opponentOf(player);
      const dmg = resolveDamageAmount(next, player, effect.amount);
      if (!effect.followersOnly) {
        next = dealDamageToLeader(next, opp, dmg);
      }
      for (const card of [...next.players[opp].zones.field]) {
        next = dealDamageToFollower(next, card.instanceId, dmg);
      }
      break;
    }

    case "banishAllFieldAndEx": {
      for (const pid of [0, 1] as PlayerId[]) {
        const p = next.players[pid];
        for (const card of [...p.zones.field]) {
          next = banishFieldCard(next, card.instanceId);
        }
        while (p.zones.exArea.length > 0) {
          const [card] = p.zones.exArea.splice(0, 1);
          resetCardInstanceState(card);
          p.zones.banish.push(card);
        }
      }
      break;
    }

    case "millToBanish": {
      for (const pid of [0, 1] as PlayerId[]) {
        const deck = next.players[pid].zones.deck;
        for (let i = 0; i < effect.count && deck.length > 0; i++) {
          const [card] = deck.splice(0, 1);
          resetCardInstanceState(card);
          next.players[pid].zones.banish.push(card);
        }
      }
      break;
    }

    case "banishFromDeck": {
      const deck = next.players[player].zones.deck;
      const matches = deck
        .filter((c) => !effect.filter || cardMatchesFilter(c.cardNo, effect.filter))
        .map((c) => ({ instanceId: c.instanceId, cardNo: c.cardNo }));
      if (matches.length === 0) break;
      if (!next.pendingChoices) {
        const maxPick = Math.min(effect.maxCount, matches.length);
        return promptSelectZoneCards(
          next,
          player,
          "deck",
          maxPick,
          "banish",
          matches,
          undefined,
          0,
          maxPick,
        );
      }
      break;
    }

    case "discardOptionalDraw": {
      const hand = next.players[player].zones.hand;
      if (!next.pendingChoices) {
        next.pendingChoices = withChoiceContext(next, {
          type: "discardVariable",
          player,
          min: 0,
          max: hand.length,
          drawBonus: effect.drawBonus,
          candidates: hand.map((c) => ({
            instanceId: c.instanceId,
            cardNo: c.cardNo,
            label: getCardDef(c.cardNo)?.name || c.cardNo,
          })),
        });
        return next;
      }
      break;
    }

    case "winGame": {
      next.winner = player;
      next.phase = "gameOver";
      break;
    }

    case "maneuver": {
      const sourceId = next.resolutionContext?.sourceInstanceId;
      if (!sourceId) break;
      const found = findInstance(next, sourceId);
      if (!found || found.zone !== "field") break;
      const cardNo = resolveCardNo(next, found.card);
      const def = getCardDef(cardNo);
      if (def?.cardType !== "amulet") break;
      if (def.attack == null || def.defense == null) break;
      found.card.maneuveringUntilTurn = next.turnNumber;
      break;
    }

    case "opponentDiscardEach": {
      const opp = opponentOf(player);
      const hand = next.players[opp].zones.hand;
      if (hand.length === 0) break;
      if (!next.pendingChoices) {
        next.pendingChoices = withChoiceContext(next, {
          type: "discard",
          player: opp,
          count: Math.min(effect.count, hand.length),
          duringEffect: true,
          candidates: hand.map((c) => ({
            instanceId: c.instanceId,
            cardNo: c.cardNo,
            label: getCardDef(c.cardNo)?.name || c.cardNo,
          })),
        });
        return next;
      }
      break;
    }

    case "dealDamageSplit": {
      if (!next.pendingChoices) {
        const candidates = getTargetCandidates(next, player, effect.targets).slice(
          0,
          effect.maxTargets,
        );
        if (candidates.length === 0) break;
        const primaryAmt = resolveDamageAmount(next, player, effect.primaryAmount);
        const secondaryAmt =
          effect.secondaryAmount != null
            ? resolveDamageAmount(next, player, effect.secondaryAmount)
            : 0;
        next.pendingChoices = withChoiceContext(next, {
          type: "dealDamageSplit",
          player,
          primaryAmount: primaryAmt,
          secondaryAmount: secondaryAmt,
          selectedIds: [],
          phase: "selectTargets",
          options: candidates.map((id) => {
            const card = findInstance(next, id)?.card;
            const cardNo = card ? resolveCardNo(next, card) : id;
            return {
              instanceId: id,
              cardNo,
              label: getCardDef(cardNo)?.name || cardNo,
            };
          }),
        });
        return next;
      }
      break;
    }

    case "burySelf": {
      const sourceId = next.resolutionContext?.sourceInstanceId;
      if (!sourceId) break;
      const found = findInstance(next, sourceId);
      if (!found || found.zone !== "field") break;
      queueLastWords(next, sourceId, found.player);
      next = destroyFollower(next, sourceId);
      break;
    }

    case "buryFromFieldSelect": {
      const p = next.players[player];
      const sourceId = next.resolutionContext?.sourceInstanceId;
      const matches = p.zones.field.filter((c) => {
        if (effect.excludeSelf && c.instanceId === sourceId) return false;
        return true;
      });
      if (matches.length === 0) break;
      if (!next.pendingChoices) {
        next.pendingChoices = withChoiceContext(next, {
          type: "selectZoneCards",
          player,
          fromZone: "field",
          count: 1,
          action: "bury",
          options: matches.map((c) => ({
            instanceId: c.instanceId,
            cardNo: c.cardNo,
            label: getCardDef(resolveCardNo(next, c))?.name || c.cardNo,
          })),
        });
        return next;
      }
      break;
    }

    case "summonLastTutoredFromHand": {
      const tutoredId = next.resolutionContext?.lastTutoredInstanceId;
      if (!tutoredId) break;
      const p = next.players[player];
      if (p.zones.field.length >= p.fieldLimit) break;
      const idx = p.zones.hand.findIndex((c) => c.instanceId === tutoredId);
      if (idx < 0) break;
      const [card] = p.zones.hand.splice(idx, 1);
      p.zones.field.push(card);
      onFollowerEntersField(next, card.instanceId, player);
      next.resolutionContext = {
        ...next.resolutionContext,
        sourceInstanceId: next.resolutionContext?.sourceInstanceId,
        effectStack: next.resolutionContext?.effectStack ?? [],
        lastSummonedInstanceId: card.instanceId,
      };
      break;
    }

    case "summonSameNameToken": {
      const tokenNo = next.resolutionContext?.leftTokenCardNo;
      if (!tokenNo) break;
      const p = next.players[player];
      if (p.zones.field.length >= p.fieldLimit) break;
      const token = createCardInstance(tokenNo, player);
      p.zones.field.push(token);
      onFollowerEntersField(next, token.instanceId, player);
      break;
    }

    case "transform": {
      const tokenCardNo =
        effect.tokenCardNo ??
        (effect.tokenName ? resolveCardNoByIdentity(effect.tokenName) : undefined);
      if (!tokenCardNo) break;
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      const maxCount = effect.count ?? candidates.length;
      if (candidates.length === 0) break;
      let targetIds: string[];
      if (forced && candidates.includes(forced)) {
        targetIds = [forced];
      } else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices &&
        maxCount === 1
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      } else {
        targetIds = candidates.slice(0, maxCount);
      }
      for (const targetId of targetIds) {
        const found = findInstance(next, targetId);
        if (!found || found.zone !== "field") continue;
        found.card.cardNo = tokenCardNo;
        found.card.modifiers = [];
        found.card.grantedKeywords = [];
        resetCardInstanceState(found.card);
        onFollowerEntersField(next, targetId, player);
      }
      break;
    }

    case "returnToHand": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId: string;
      if (forced) {
        if (!candidates.includes(forced)) break;
        targetId = forced;
      } else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      } else {
        targetId = candidates[0];
      }
      next = returnEvolveCardToDeck(next, targetId, false);
      const found = findInstance(next, targetId);
      if (!found || found.zone !== "field") break;
      resetFieldInstanceState(found.card);
      next = moveCard(next, targetId, "hand", player);
      break;
    }

    case "addStack": {
      const p = next.players[player];
      const stackCard = p.zones.field.find((c) => {
        const def = getCardDef(resolveCardNo(next, c));
        return def?.keywords?.includes("stack");
      });
      if (stackCard) {
        stackCard.counters.stack = (stackCard.counters.stack ?? 0) + effect.amount;
      } else {
        const sediment = resolveCardNoByIdentity("Magic Sediment");
        if (sediment && p.zones.field.length < p.fieldLimit) {
          const token = createCardInstance(sediment, player, player);
          token.counters.stack = effect.amount;
          p.zones.field.push(token);
          onFollowerEntersField(next, token.instanceId, player);
        }
      }
      break;
    }

    case "reviveToField": {
      const sourceId = next.resolutionContext?.sourceInstanceId;
      if (!sourceId) break;
      const p = next.players[player];
      if (p.zones.field.length >= p.fieldLimit) break;
      const cemIdx = p.zones.cemetery.findIndex((c) => c.instanceId === sourceId);
      if (cemIdx < 0) break;
      const [card] = p.zones.cemetery.splice(cemIdx, 1);
      card.engaged = effect.engaged ?? false;
      resetCardInstanceState(card);
      card.enteredFromCemetery = true;
      card.enteredFromHand = false;
      p.zones.field.push(card);
      onFollowerEntersField(next, card.instanceId, player);
      break;
    }

    case "refresh": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId: string;
      if (forced && candidates.includes(forced)) targetId = forced;
      else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      } else {
        targetId = candidates[0];
      }
      const found = findInstance(next, targetId);
      if (found) found.card.engaged = false;
      break;
    }

    case "cannotAttack":
      break;

    case "increaseMaxPp": {
      const p = next.players[player];
      p.maxPp = Math.min(10, p.maxPp + effect.amount);
      p.pp = Math.min(p.pp + effect.amount, p.maxPp);
      break;
    }

    case "putOnBottomOfDeck": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId: string;
      if (forced && candidates.includes(forced)) targetId = forced;
      else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      } else {
        targetId = candidates[0];
      }
      next = putFieldCardOnDeckBottom(next, targetId, player);
      break;
    }

    case "putOnTopOfDeck": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId: string;
      if (forced && candidates.includes(forced)) targetId = forced;
      else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      } else {
        targetId = candidates[0];
      }
      next = putFieldCardOnDeckTop(next, targetId, player);
      break;
    }

    case "buryEachOpponentDeck": {
      for (const opp of [0, 1] as PlayerId[]) {
        if (opp === player) continue;
        const deck = next.players[opp].zones.deck;
        for (let i = 0; i < effect.count && deck.length > 0; i++) {
          const [card] = deck.splice(0, 1);
          resetCardInstanceState(card);
          next.players[opp].zones.cemetery.push(card);
        }
      }
      break;
    }

    case "tutorFromDeckAny": {
      const deck = next.players[player].zones.deck;
      if (deck.length === 0) break;
      if (!next.pendingChoices) {
        return promptSearchDeckTop(
          next,
          player,
          deck.map((c) => ({ instanceId: c.instanceId, cardNo: c.cardNo })),
          {},
          effect.to,
          effect.optional,
          undefined,
          "deckBottom",
          effect.reveal,
        );
      }
      break;
    }

    case "grantIgnoresWard": {
      const sourceId = next.resolutionContext?.sourceInstanceId;
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId = forced && candidates.includes(forced) ? forced : candidates[0];
      if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !forced &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      }
      const found = findInstance(next, targetId);
      if (found) found.card.ignoresWard = true;
      break;
    }

    case "damageImmunity": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId = forced && candidates.includes(forced) ? forced : candidates[0];
      if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !forced &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      }
      const found = findInstance(next, targetId);
      if (found) found.card.damageImmunityThisTurn = effect.amount;
      break;
    }

    case "swapAtkDef": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId = forced && candidates.includes(forced) ? forced : candidates[0];
      if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !forced &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      }
      const found = findInstance(next, targetId);
      if (!found) break;
      const stats = getEffectiveStats(found.card, next);
      const deltaAtk = stats.def - stats.atk;
      const deltaDef = stats.atk - stats.def;
      found.card.modifiers.push({ atk: deltaAtk, def: deltaDef, sourceId: "swapAtkDef" });
      break;
    }

    case "defAsAttackAura":
      break;

    case "destroyAllEnemyField": {
      const opp = opponentOf(player);
      const field = [...getPlayer(next, opp).zones.field];
      for (const card of field) {
        if (card.indestructibleByAbilities) continue;
        queueLastWords(next, card.instanceId, opp);
        next = destroyFollower(next, card.instanceId);
      }
      break;
    }

    case "discardHand": {
      const p = next.players[player];
      while (p.zones.hand.length > 0) {
        const [card] = p.zones.hand.splice(0, 1);
        resetCardInstanceState(card);
        p.zones.cemetery.push(card);
      }
      break;
    }

    case "grantIndestructible": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId: string;
      if (forced && candidates.includes(forced)) targetId = forced;
      else if (
        shouldPromptTargetSelection(effect.targets, candidates) &&
        !next.pendingChoices
      ) {
        return promptSelectTarget(next, player, effect, candidates);
      } else {
        targetId = candidates[0];
      }
      const found = findInstance(next, targetId);
      if (found) found.card.indestructibleByAbilities = true;
      break;
    }

    case "withChosenNumber": {
      if (next.resolutionContext?.chosenNumber == null && !next.pendingChoices) {
        const pick = structuredClone(next);
        pick.pendingChoices = withChoiceContext(pick, {
          type: "chooseNumber",
          player,
          min: effect.min,
          max: effect.max,
          pendingEffect: effect.then,
          reasonLabel: `Choose a number from ${effect.min} to ${effect.max}`,
        });
        return pick;
      }
      if (next.resolutionContext?.chosenNumber != null) {
        next = resolveEffect(next, effect.then, player, options);
        if (next.pendingChoices) return next;
      }
      break;
    }

    case "buffDynamic": {
      const forced = next.resolutionContext?.forcedTargetId;
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId: string;
      if (forced) {
        if (!candidates.includes(forced)) break;
        targetId = forced;
      } else if (shouldPromptTargetSelection(effect.targets, candidates) && !next.pendingChoices) {
        return promptSelectTarget(next, player, effect, candidates);
      } else {
        targetId = candidates[0];
      }
      const found = findInstance(next, targetId);
      if (found) {
        const atk = effect.atk != null ? resolveDamageAmount(next, player, effect.atk) : 0;
        const def = effect.def != null ? resolveDamageAmount(next, player, effect.def) : 0;
        found.card.modifiers.push({
          atk,
          def,
          sourceId: next.resolutionContext?.sourceInstanceId || "effect",
        });
      }
      break;
    }

    case "peekDeck": {
      const p = next.players[player];
      const top = p.zones.deck.slice(0, effect.count);
      if (top.length === 0) break;
      next.resolutionContext = {
        ...next.resolutionContext,
        sourceInstanceId: next.resolutionContext?.sourceInstanceId,
        effectStack: next.resolutionContext?.effectStack ?? [],
        peekedInstanceIds: top.map((c) => c.instanceId),
      };
      if (effect.optionalBury && !next.pendingChoices) {
        next.pendingChoices = withChoiceContext(next, {
          type: "choose",
          player,
          min: 1,
          max: 1,
          options: [
            { index: 0, label: "Put on bottom of deck", effect: { op: "noop" } },
            {
              index: 1,
              label: "Put into cemetery",
              effect: {
                op: "sequence",
                steps: top.map((c) => ({
                  op: "mill",
                  count: 1,
                })),
              },
            },
          ],
        });
        return next;
      }
      if (effect.then) {
        next = resolveEffect(next, effect.then, player, options);
      }
      break;
    }

    case "dealDamageOtherFollowers": {
      const sourceId = next.resolutionContext?.sourceInstanceId;
      const dmg = resolveDamageAmount(next, player, effect.amount);
      for (const pid of [0, 1] as PlayerId[]) {
        if (effect.includeLeaders) {
          if (pid !== player) next = dealDamageToLeader(next, pid, dmg);
        }
        for (const card of [...next.players[pid].zones.field]) {
          if (card.instanceId === sourceId) continue;
          const def = getCardDef(resolveCardNo(next, card));
          if (def?.cardType !== "follower") continue;
          next = dealDamageToFollower(next, card.instanceId, dmg);
        }
      }
      break;
    }

    case "setStats": {
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId = candidates[0];
      if (shouldPromptTargetSelection(effect.targets, candidates) && !next.pendingChoices) {
        return promptSelectTarget(next, player, effect, candidates);
      }
      const found = findInstance(next, targetId);
      if (found) {
        found.card.statOverride = { atk: effect.atk, def: effect.def };
        found.card.modifiers = found.card.modifiers.filter((m) => m.sourceId !== "setStats");
      }
      break;
    }

    case "silence": {
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId = candidates[0];
      if (shouldPromptTargetSelection(effect.targets, candidates) && !next.pendingChoices) {
        return promptSelectTarget(next, player, effect, candidates);
      }
      const found = findInstance(next, targetId);
      if (found) found.card.abilitiesSilenced = true;
      break;
    }

    case "silenceOpponents":
      break;

    case "dealDamageCompare": {
      if (!next.pendingChoices) {
        const candidates = getTargetCandidates(next, player, effect.targets);
        if (candidates.length < 2) break;
        next.pendingChoices = withChoiceContext(next, {
          type: "dealDamageCompare",
          player,
          phase: "selectTargets",
          selectedIds: [],
          options: candidates.map((id) => ({
            instanceId: id,
            cardNo: findInstance(next, id)?.card.cardNo ?? id,
            label: labelForInstance(next, id),
          })),
        });
        return next;
      }
      break;
    }

    case "playFromOpponentCemetery": {
      const opp = opponentOf(player);
      const matches = next.players[opp].zones.cemetery.filter((c) => {
        if (effect.filter && !cardMatchesFilter(c.cardNo, effect.filter)) return false;
        if (effect.maxCost != null && resolveCardDefCost(c.cardNo) > effect.maxCost) return false;
        return true;
      });
      if (matches.length === 0) break;
      if (!next.pendingChoices) {
        next.pendingChoices = withChoiceContext(next, {
          type: "selectZoneCards",
          player,
          fromZone: "opponentCemetery",
          count: 1,
          action: "play",
          options: zoneCardOptions(matches),
        });
        return next;
      }
      break;
    }

    case "addCounter": {
      const candidates = getTargetCandidates(next, player, effect.targets);
      if (candidates.length === 0) break;
      let targetId = candidates[0];
      if (shouldPromptTargetSelection(effect.targets, candidates) && !next.pendingChoices) {
        return promptSelectTarget(next, player, effect, candidates);
      }
      const found = findInstance(next, targetId);
      if (found) {
        const n = effect.amount ?? 1;
        found.card.counters[effect.counter] = (found.card.counters[effect.counter] ?? 0) + n;
      }
      break;
    }

    case "removeCounter": {
      const sourceId = next.resolutionContext?.sourceInstanceId;
      const targets = effect.targets ?? { type: "self" as const };
      const candidates = getTargetCandidates(next, player, targets);
      const targetId = candidates[0] ?? sourceId;
      if (!targetId) break;
      const found = findInstance(next, targetId);
      if (!found) break;
      const n = effect.amount ?? 1;
      const cur = found.card.counters[effect.counter] ?? 0;
      if (cur < n) break;
      found.card.counters[effect.counter] = cur - n;
      if (effect.then) next = resolveEffect(next, effect.then, player, options);
      break;
    }

    case "grantLeaderDamageShield": {
      const p = next.players[player];
      p.flags.leaderDamageShields = (p.flags.leaderDamageShields ?? 0) + effect.charges;
      break;
    }

    case "destroyAllFollowers": {
      for (const pid of [0, 1] as PlayerId[]) {
        for (const card of [...next.players[pid].zones.field]) {
          const def = getCardDef(resolveCardNo(next, card));
          if (def?.cardType !== "follower") continue;
          queueLastWords(next, card.instanceId, pid);
          next = destroyFollower(next, card.instanceId);
        }
      }
      break;
    }

    case "grantNextPlayCostReduction": {
      const p = next.players[player];
      if (!p.flags.nextPlayDiscounts) p.flags.nextPlayDiscounts = [];
      p.flags.nextPlayDiscounts.push({ filter: effect.filter, amount: effect.amount });
      break;
    }

    case "turnEvolveDeck": {
      const sourceFace = effect.orientation === "faceup" ? "facedown" : "faceup";
      const matches = filterEvolveDeckCards(next, player, {
        filter: effect.filter,
        face: sourceFace,
      });
      const pickCount = effect.allMatching ? matches.length : Math.min(effect.count, matches.length);
      if (pickCount <= 0) break;
      const ids = matches.slice(0, pickCount).map((c) => c.instanceId);
      next = setEvolveDeckOrientation(next, ids, effect.orientation);
      break;
    }

    case "selectEvolveDeckCard": {
      const matches = filterEvolveDeckCards(next, player, {
        filter: effect.filter,
        face: effect.face,
      });
      if (matches.length === 0) break;
      if (!next.pendingChoices) {
        if (matches.length === 1) {
          const id = matches[0].instanceId;
          if (effect.turnTo) {
            next = setEvolveDeckOrientation(next, [id], effect.turnTo);
          }
          if (effect.then) {
            next.resolutionContext = {
              ...next.resolutionContext,
              sourceInstanceId: next.resolutionContext?.sourceInstanceId,
              effectStack: next.resolutionContext?.effectStack ?? [],
              selectedEvolveDeckId: id,
            };
            next = resolveEffect(next, effect.then, player, options);
            if (next.pendingChoices) return next;
          }
          break;
        }
        return promptSelectEvolveDeckCard(next, player, matches, {
          turnTo: effect.turnTo,
          pendingEffect: effect.then,
          optional: effect.optional,
        });
      }
      break;
    }

    case "takeExtraTurn": {
      next.players[player].flags.extraTurnPending = true;
      break;
    }

    case "gainEvolutionPoint": {
      const p = next.players[player];
      p.evoPoints += effect.amount ?? 1;
      break;
    }

    case "grantOnCardPlayed": {
      const sourceId = next.resolutionContext?.sourceInstanceId;
      const found = sourceId ? findInstance(next, sourceId) : null;
      if (!found) break;
      if (!found.card.grantedOnCardPlayed) found.card.grantedOnCardPlayed = [];
      found.card.grantedOnCardPlayed.push({
        filter: effect.filter,
        effect: effect.effect,
        untilEndOfTurn: effect.untilEndOfTurn,
        oncePerTurn: effect.oncePerTurn,
        maxPerTurn: effect.maxPerTurn,
        label: effect.label,
      });
      break;
    }

    case "grantOnDamaged": {
      const sourceId = next.resolutionContext?.sourceInstanceId;
      const found = sourceId ? findInstance(next, sourceId) : null;
      if (!found) break;
      if (!found.card.grantedOnDamaged) found.card.grantedOnDamaged = [];
      found.card.grantedOnDamaged.push({
        effect: effect.effect,
        oncePerTurn: effect.oncePerTurn,
        label: effect.label,
      });
      break;
    }

    case "passiveKeywords":

    case "auraGrantKeyword":

    case "damageCap":

      break;

  }



  if (options?.deferConfirmation) {
    return next;
  }

  next = finishDeferredTriggers(next);
  return runConfirmationTiming(next);

}



export function canEffectResolve(state: GameState, player: PlayerId, effect: Effect): boolean {
  switch (effect.op) {
    case "buff":
    case "dealDamage":
    case "engage":
    case "box":
    case "destroy":
    case "banish":
    case "moveToExArea":
      return getTargetCandidates(state, player, effect.targets).length > 0;
    case "clash":
      return (
        getTargetCandidates(state, player, { type: "selfFollower", excludeSelf: true }).length >
          0 &&
        getTargetCandidates(state, player, { type: "enemyFollower" }).length > 0
      );
    case "sequence":
      return effect.steps.every((step) => canEffectResolve(state, player, step));
    case "if":
      return canEffectResolve(state, player, effect.then);
    case "optionalCost":
      return canEffectResolve(state, player, effect.then);
    case "choose":
    case "chooseMultiple":
      return effect.options.some(
        (o) =>
          (!o.additionalPpCost || state.players[player].pp >= o.additionalPpCost) &&
          canEffectResolve(state, player, o.effect),
      );
    case "discardFromHand": {
      const need = effect.count ?? 1;
      const matches = getPlayer(state, player).zones.hand.filter((c) =>
        cardMatchesFilter(c.cardNo, effect.filter),
      );
      return matches.length >= need;
    }
    default:
      return true;
  }
}

export function canPlayCardFromZones(
  state: GameState,
  player: PlayerId,
  cardNo: string,
): boolean {
  const def = getCardDef(cardNo);
  if (!def) return false;
  if (def.cardType === "spell") {
    const spell = def.abilities?.find((a) => a.timing === "spell");
    if (!spell) return false;
    if (spell.condition && !evalCondition(state, player, spell.condition)) return false;
    return canEffectResolve(state, player, spell.effect);
  }
  return true;
}

export function resolveSpell(state: GameState, cardNo: string, player: PlayerId): GameState {

  const def = getCardDef(cardNo);

  const spell = def?.abilities?.find((a) => a.timing === "spell");

  if (!spell) return state;

  return resolveEffect(state, spell.effect, player);

}


