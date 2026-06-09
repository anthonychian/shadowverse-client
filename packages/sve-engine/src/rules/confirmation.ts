import { getCardDef } from "../cards/registry";
import { destinationForDestroyedCard } from "../cards/tokens";
import { resetCardInstanceState } from "../state/card-reset";
import { resolveEffect } from "../effects/resolver";
import { isBoxed } from "../state/passives";
import { contextForTriggerResolution, shouldClearResolutionContext } from "./effect-utils";
import { onCardEntersExAreaTriggers, queueFanfare, queueLastWords } from "./trigger-queue";
import { findInstance, getPlayer, getEffectiveStats, hasKeyword, resolveCardNo } from "../state/queries";
import { destroyFollower, drawCard, removeFromField } from "../state/zones";
import { GameState, PendingTrigger, PlayerId } from "../types";

function checkLosses(state: GameState): GameState {
  let next = structuredClone(state);
  for (const pid of [0, 1] as PlayerId[]) {
    if (next.players[pid].leaderDef <= 0) {
      next.winner = pid === 0 ? 1 : 0;
      next.phase = "gameOver";
      return next;
    }
    while (next.players[pid].flags.owedDraws > 0) {
      if (next.players[pid].zones.deck.length === 0) {
        next.winner = pid === 0 ? 1 : 0;
        next.phase = "gameOver";
        return next;
      }
      next = drawCard(next, pid);
      next.players[pid].flags.owedDraws -= 1;
    }
  }
  return next;
}

function destroyAtZeroDef(state: GameState): GameState {
  let next = state;
  let changed = true;
  while (changed) {
    changed = false;
    for (const pid of [0, 1] as PlayerId[]) {
      for (const card of [...getPlayer(next, pid).zones.field]) {
        const { def } = getEffectiveStats(card, next);
        if (def <= 0) {
          queueLastWords(next, card.instanceId, pid);
          next = destroyFollower(next, card.instanceId);
          changed = true;
        }
      }
    }
  }
  return next;
}

function resolveBane(state: GameState): GameState {
  let next = structuredClone(state);
  const toDestroy = new Set<string>();

  for (const pid of [0, 1] as PlayerId[]) {
    for (const card of next.players[pid].zones.field) {
      if (!card.foughtWithBane || !card.foughtWithInstanceId) continue;
      const opponent = findInstance(next, card.foughtWithInstanceId);
      if (!opponent || opponent.zone !== "field") continue;
      const cardHasBane = hasKeyword(card, "bane", next, pid);
      const oppHasBane = hasKeyword(opponent.card, "bane", next, opponent.player);
      if (cardHasBane && !oppHasBane) {
        toDestroy.add(card.foughtWithInstanceId);
      } else if (oppHasBane && !cardHasBane) {
        toDestroy.add(card.instanceId);
      } else if (cardHasBane && oppHasBane) {
        toDestroy.add(card.instanceId);
        toDestroy.add(card.foughtWithInstanceId);
      }
    }
  }

  for (const instanceId of toDestroy) {
    const found = findInstance(next, instanceId);
    if (!found || found.zone !== "field") continue;
    queueLastWords(next, instanceId, found.player);
    next = destroyFollower(next, instanceId);
  }

  return next;
}

function enforceFieldLimits(state: GameState): GameState {
  let next = structuredClone(state);
  for (const pid of [0, 1] as PlayerId[]) {
    const p = next.players[pid];
    while (p.zones.field.length > p.fieldLimit) {
      const excess = p.zones.field.pop()!;
      const dest = destinationForDestroyedCard(excess.cardNo);
      resetCardInstanceState(excess);
      p.zones[dest].push(excess);
    }
    while (p.zones.exArea.length > p.exLimit) {
      const excess = p.zones.exArea.pop()!;
      const dest = destinationForDestroyedCard(excess.cardNo);
      resetCardInstanceState(excess);
      p.zones[dest].push(excess);
    }
  }
  return next;
}

function capPlayPoints(state: GameState): GameState {
  const next = structuredClone(state);
  for (const pid of [0, 1] as PlayerId[]) {
    const p = next.players[pid];
    if (p.pp > p.maxPp) p.pp = p.maxPp;
  }
  return next;
}

export { queueLastWords, queueFanfare } from "./trigger-queue";

/** Fanfare and field-entry setup when a follower/amulet enters the field. */
export function onFollowerEntersField(
  state: GameState,
  instanceId: string,
  player: PlayerId,
): void {
  const found = findInstance(state, instanceId);
  if (!found || found.zone !== "field") return;
  if (found.card.enteredFromHand === undefined) {
    found.card.enteredFromHand = false;
  }
  found.card.enteredFieldTurn = state.turnNumber;
  found.card.onFieldSinceTurnStart = false;
  queueFanfare(state, instanceId, player);
}

export function onCardEntersExArea(
  state: GameState,
  instanceId: string,
  player: PlayerId,
): void {
  onCardEntersExAreaTriggers(state, instanceId, player);
}

function resolveOneTrigger(state: GameState, trigger: PendingTrigger): GameState {
  let next = structuredClone(state);
  next.pendingTriggers = next.pendingTriggers.filter((t) => t.id !== trigger.id);
  next.resolutionContext = contextForTriggerResolution(
    next,
    trigger.sourceInstanceId,
    trigger.ability.effect,
  );
  next = resolveEffect(next, trigger.ability.effect, trigger.controller);
  if (shouldClearResolutionContext(next)) {
    next.resolutionContext = null;
  }
  return next;
}

export function runConfirmationTiming(state: GameState): GameState {
  if (state.phase === "gameOver") return state;

  let next = structuredClone(state);
  let loop = true;

  while (loop) {
    loop = false;

    if (next.pendingChoices && next.pendingChoices.type !== "mulligan") return next;

    next = capPlayPoints(next);
    next = resolveBane(next);
    next = destroyAtZeroDef(next);
    next = enforceFieldLimits(next);
    next = checkLosses(next);
    if (next.phase === "gameOver") return next;

    const activeTriggers = next.pendingTriggers.filter((t) => t.controller === next.activePlayer);
    const inactiveTriggers = next.pendingTriggers.filter((t) => t.controller !== next.activePlayer);

    if (activeTriggers.length > 1 && !next.pendingChoices) {
      next.pendingChoices = {
        type: "selectTrigger",
        player: next.activePlayer,
        options: activeTriggers.map((t) => ({
          triggerId: t.id,
          label: t.label,
        })),
      };
      return next;
    }

    if (activeTriggers.length === 1) {
      next = resolveOneTrigger(next, activeTriggers[0]);
      loop = true;
      continue;
    }

    if (inactiveTriggers.length > 1 && !next.pendingChoices) {
      const opp = next.activePlayer === 0 ? 1 : 0;
      next.pendingChoices = {
        type: "selectTrigger",
        player: opp,
        options: inactiveTriggers.map((t) => ({
          triggerId: t.id,
          label: t.label,
        })),
      };
      return next;
    }

    if (inactiveTriggers.length === 1) {
      next = resolveOneTrigger(next, inactiveTriggers[0]);
      loop = true;
    }
  }

  return next;
}
