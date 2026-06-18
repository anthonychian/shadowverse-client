import { getCardDef } from "../cards/registry";
import {
  buryDeckCards,
  canPlayCardFromZones,
  moveZoneCardTo,
  resolveEffect,
  resolveSpell,
} from "../effects/resolver";
import { applyMulligan, beginStartPhase } from "../phases/setup";
import {
  onFollowerEntersField,
  resolveChosenTrigger,
  runConfirmationTiming,
} from "../rules/confirmation";
import {
  contextForTriggerResolution,
  canAdvanceActivate,
  finishDeferredTriggers,
  isAdvanceAbility,
  shouldClearResolutionContext,
  shouldDeferTriggers,
  withChoiceContext,
} from "../rules/effect-utils";
import { clearRevealedCards, revealCard, shouldRevealBeforeHand } from "../state/reveal";
import {
  queueLastWords,
  queueOnBecomeEngaged,
  queueOnDiscardTriggers,
  queueOnCardPlayed,
  queueOnAllyEvolveTriggers,
  queueStartOfEndAbilities,
  queueStartOfOpponentEndAbilities,
} from "../rules/trigger-queue";
import { cardMatchesFilter } from "../state/conditions";
import { setEvolveDeckOrientation } from "../state/evolve-deck";
import { opponentsAbilitiesSilencedFor } from "../state/passives";
import { resetCardInstanceState } from "../state/card-reset";
import {
  clampDamageToFollower,
  findInstance,
  findMatchingEvolveCard,
  getAttackerStrikeDamage,
  getActivatedAbilities,
  getEffectivePlayCost,
  getEffectiveStats,
  computeEvolvePayment,
  getEvolveCost,
  resolveCardDefCost,
  getLegalAttackTargets,
  getPlayer,
  getStrikeAbilities,
  hasKeyword,
  isFieldFollower,
  isFollowerCard,
  canDeclareAttack,
  opponentOf,
  resolveCardNo,
} from "../state/queries";
import { destroyFollower, drawCard, moveCard, shuffleDeck } from "../state/zones";
import { ActionResult, Effect, GameAction, GameState, PlayerId } from "../types";

/** When a choose option is selected, optional costs are mandatory — skip the nested prompt. */
function effectForChosenOption(effect: Effect): Effect {
  if (effect.op === "optionalCost") {
    return { op: "sequence", steps: [effect.cost, effect.then] };
  }
  return effect;
}

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, state, error };
}

function hasPlayableQuickCards(state: GameState, player: PlayerId): boolean {
  const pp = state.players[player].pp;
  for (const card of state.players[player].zones.hand) {
    const def = getCardDef(card.cardNo);
    if (!def?.abilities?.some((a) => a.quick)) continue;
    const cost = getEffectivePlayCost(card, card.cardNo, state, player, "hand");
    if (pp >= cost && canPlayCardFromZones(state, player, card.cardNo)) return true;
  }
  return false;
}

function assertNotBlockedByOpponentQuickWindow(
  state: GameState,
  player: PlayerId,
  action: GameAction,
): ActionResult | null {
  if (action.type === "QUICK_PLAY" || action.type === "PASS_QUICK_WINDOW") return null;
  if (action.type === "CHOICE_RESPONSE" && state.pendingChoices?.player === player) {
    return null;
  }
  if (
    action.type === "END_MAIN" &&
    state.quickWindow === "endPhase" &&
    state.endPhaseQuickResolved
  ) {
    return null;
  }
  if (
    state.quickWindow != null &&
    state.quickWindowPlayer != null &&
    state.quickWindowPlayer !== player
  ) {
    return fail(state, "Opponent must resolve quick window first");
  }
  return null;
}

function proceedAfterEndMainQuick(state: GameState): GameState {
  let next = structuredClone(state);
  const player = next.activePlayer;
  next.quickWindow = null;
  next.quickWindowPlayer = null;
  next.phase = "end";

  const wards = getPlayer(next, player).zones.field.filter(
    (c) => hasKeyword(c, "ward", next) && !c.engaged,
  );
  if (wards.length > 0) {
    next.pendingChoices = {
      type: "wardEngage",
      player,
      candidates: wards.map((w) => ({
        instanceId: w.instanceId,
        cardNo: resolveCardNo(next, w),
        label: getCardDef(resolveCardNo(next, w))?.name || w.cardNo,
      })),
    };
    return next;
  }

  return beginEndPhaseDiscard(next);
}

function continueEndPhaseFlow(state: GameState): GameState {
  let next = structuredClone(state);
  if (next.endPhaseQuickResolved) {
    next.quickWindow = null;
    next.quickWindowPlayer = null;
  }
  if (next.pendingChoices || next.pendingTriggers.length > 0) return next;

  const player = next.activePlayer;
  const p = next.players[player];
  if (!p.flags.endStartAbilitiesQueued) {
    queueStartOfOpponentEndAbilities(next, player);
    queueStartOfEndAbilities(next, player);
    p.flags.endStartAbilitiesQueued = true;
    next = runConfirmationTiming(next);
    if (next.pendingChoices || next.pendingTriggers.length > 0) return next;
  }

  if (!next.endPhaseQuickResolved) {
    const opp = opponentOf(player);
    if (hasPlayableQuickCards(next, opp)) {
      next.quickWindow = "endPhase";
      next.quickWindowPlayer = opp;
      return next;
    }
    next.endPhaseQuickResolved = true;
  }

  return proceedAfterEndMainQuick(next);
}

function resolutionFields(ctx: GameState["resolutionContext"]) {
  return {
    buriedCosts: ctx?.buriedCosts,
    lastDiscardedCardNo: ctx?.lastDiscardedCardNo,
    lastTutoredInstanceId: ctx?.lastTutoredInstanceId,
    lastSummonedInstanceId: ctx?.lastSummonedInstanceId,
  };
}

function preserveResumeContext(
  next: GameState,
  sourceId: string | undefined,
  stack: Effect[],
  tail: Effect[],
): GameState {
  const prev = next.resolutionContext;
  const appended = prev?.resumeAfterChoice ?? [];
  next.resolutionContext = {
    sourceInstanceId: sourceId,
    effectStack: stack,
    resumeAfterChoice: appended.length > 0 ? appended : tail,
    ...resolutionFields(prev),
    deferTriggers: true,
  };
  return next;
}

function continueAfterChoice(state: GameState, player: PlayerId): GameState {
  if (state.pendingChoices) return state;
  let next = state;
  const sourceId = next.resolutionContext?.sourceInstanceId;
  const stack = next.resolutionContext?.effectStack ?? [];

  const hasResume = (next.resolutionContext?.resumeAfterChoice?.length ?? 0) > 0;
  if (!hasResume && !shouldDeferTriggers(next) && next.pendingTriggers.length > 0) {
    next = runConfirmationTiming(next);
    if (next.pendingChoices || next.pendingTriggers.length > 0) return next;
  }

  while (next.resolutionContext?.resumeAfterChoice?.length) {
    const [head, ...tail] = next.resolutionContext.resumeAfterChoice;
    const prev = next.resolutionContext;
    next.resolutionContext = {
      sourceInstanceId: sourceId,
      effectStack: stack,
      resumeAfterChoice: tail,
      ...resolutionFields(prev),
      deferTriggers: true,
    };
    next = resolveEffect(next, head, player, { deferConfirmation: true });
    if (next.pendingChoices) {
      return preserveResumeContext(next, sourceId, stack, tail);
    }
  }

  if (!next.pendingChoices && !(next.resolutionContext?.resumeAfterChoice?.length ?? 0)) {
    next = finishDeferredTriggers(next);
    if (shouldClearResolutionContext(next)) {
      next.resolutionContext = null;
    }
  }
  return next;
}

function finishEndPhase(state: GameState): GameState {
  let next = structuredClone(state);
  const player = next.activePlayer;
  const hand = next.players[player].zones.hand;
  if (hand.length > next.players[player].handLimit) {
    const excess = hand.length - next.players[player].handLimit;
    next.pendingChoices = {
      type: "discard",
      player,
      count: excess,
      candidates: hand.map((c) => ({
        instanceId: c.instanceId,
        cardNo: resolveCardNo(next, c),
        label: getCardDef(resolveCardNo(next, c))?.name || c.cardNo,
      })),
    };
    return next;
  }
  return endTurn(next);
}

function maybeContinueEndPhase(state: GameState): GameState {
  if (state.phase !== "end") return state;
  return continueEndPhaseFlow(state);
}

function isCombatAttackerOnField(state: GameState): boolean {
  if (!state.combat) return false;
  const found = findInstance(state, state.combat.attackerId);
  return Boolean(found && found.zone === "field");
}

function abortCombatIfAttackerGone(state: GameState): GameState {
  if (!state.combat || isCombatAttackerOnField(state)) return state;
  const next = structuredClone(state);
  next.combat = null;
  next.phase = "main";
  next.quickWindow = null;
  next.quickWindowPlayer = null;
  return next;
}

function continuePausedCombat(state: GameState): GameState {
  if (!state.combat || state.pendingChoices) return state;
  let next = abortCombatIfAttackerGone(state);
  if (!next.combat) return next;

  const combat = next.combat;
  if (combat.strikeAbilityIndex != null) {
    next = structuredClone(next);
    next.phase = "combat";
    next.combat = { ...combat, strikeAbilityIndex: combat.strikeAbilityIndex + 1 };
    return resolveCombat(next);
  }

  if (combat.phase === "declared") {
    next = structuredClone(next);
    next.phase = "combat";
    return resolveCombat(next);
  }

  return next;
}

function spellEffectFullyResolved(state: GameState): boolean {
  return (
    !state.pendingChoices &&
    (state.resolutionContext?.resumeAfterChoice?.length ?? 0) === 0 &&
    state.pendingTriggers.length === 0
  );
}

function maybeBuryResolvedSpells(state: GameState, player: PlayerId): GameState {
  if (!spellEffectFullyResolved(state)) return state;
  let next = state;
  for (const card of [...next.players[player].zones.resolutionZone]) {
    const def = getCardDef(resolveCardNo(next, card));
    if (def?.cardType !== "spell") continue;
    next = moveCard(next, card.instanceId, "cemetery", player);
  }
  return next;
}

function finishChoiceResolution(state: GameState, player: PlayerId): GameState {
  let next = state;
  if (!next.pendingChoices) {
    next = continueAfterChoice(next, player);
  }
  next = maybeBuryResolvedSpells(next, player);
  next = runConfirmationTiming(next);
  if (!next.pendingChoices) {
    next = continuePausedCombat(next);
  }
  if (next.phase === "end") {
    next = continueEndPhaseFlow(next);
  } else {
    next = maybeContinueEndPhase(next);
  }
  return next;
}

function sendSearchRemainder(
  state: GameState,
  player: PlayerId,
  instanceIds: string[],
  remainderTo: "cemetery" | "deckBottom",
): GameState {
  if (remainderTo === "deckBottom") {
    let next = structuredClone(state);
    const deck = next.players[player].zones.deck;
    for (const id of instanceIds) {
      const idx = deck.findIndex((c) => c.instanceId === id);
      if (idx < 0) continue;
      const [card] = deck.splice(idx, 1);
      deck.push(card);
    }
    return next;
  }
  return buryDeckCards(state, player, instanceIds);
}

function ok(state: GameState): ActionResult {
  return { ok: true, state };
}

function assertActivePlayer(state: GameState, player: PlayerId, error: string): ActionResult | null {
  if (state.activePlayer !== player) return fail(state, error);
  return null;
}

function assertPhase(state: GameState, phases: GameState["phase"][], error: string): ActionResult | null {
  if (!phases.includes(state.phase)) return fail(state, error);
  return null;
}

function handleChoiceResponse(state: GameState, player: PlayerId, payload: Record<string, unknown>): ActionResult {
  const choice = state.pendingChoices;
  if (!choice || choice.player !== player) return fail(state, "No pending choice");

  let next = structuredClone(state);
  next.pendingChoices = null;

  if (choice.type === "mulligan") {
    return ok(applyMulligan(next, player, Boolean(payload.redraw)));
  }

  if (choice.type === "selectTrigger") {
    const triggerId = String(payload.triggerId);
    const trigger = next.pendingTriggers.find((t) => t.id === triggerId);
    if (!trigger) return fail(state, "Invalid trigger");
    next = resolveChosenTrigger(next, trigger);
    next = finishChoiceResolution(next, player);
    next = maybeContinueEndPhase(next);
    return ok(next);
  }

  if (choice.type === "selectTarget") {
    const targetId = String(payload.targetId);
    const resume = next.resolutionContext?.resumeAfterChoice;
    const sourceId = next.resolutionContext?.sourceInstanceId ?? next.combat?.attackerId;
    next.resolutionContext = {
      sourceInstanceId: sourceId,
      effectStack: [choice.effect],
      forcedTargetId: targetId,
      resumeAfterChoice: resume,
    };
    next = resolveEffect(next, choice.effect, player);
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "chooseNumber") {
    const value = Number(payload.value);
    if (!Number.isInteger(value) || value < choice.min || value > choice.max) {
      return fail(state, `Choose a number from ${choice.min} to ${choice.max}`);
    }
    const resume = next.resolutionContext?.resumeAfterChoice;
    const sourceId = next.resolutionContext?.sourceInstanceId;
    next.resolutionContext = {
      sourceInstanceId: sourceId,
      effectStack: [choice.pendingEffect],
      chosenNumber: value,
      resumeAfterChoice: resume,
      buriedCosts: next.resolutionContext?.buriedCosts,
      lastDiscardedCardNo: next.resolutionContext?.lastDiscardedCardNo,
      lastTutoredInstanceId: next.resolutionContext?.lastTutoredInstanceId,
      lastSummonedInstanceId: next.resolutionContext?.lastSummonedInstanceId,
    };
    next = resolveEffect(next, choice.pendingEffect, player);
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "selectZoneCards") {
    const ids = (payload.instanceIds as string[]) || [];
    if (choice.fromZone === "opponentCemetery" && choice.action === "play") {
      if (ids.length !== 1) return fail(state, "Must select one card");
      const opp = opponentOf(player);
      const idx = next.players[opp].zones.cemetery.findIndex((c) => c.instanceId === ids[0]);
      if (idx < 0) return fail(state, "Invalid card");
      const [card] = next.players[opp].zones.cemetery.splice(idx, 1);
      card.controller = player;
      const def = getCardDef(card.cardNo);
      if (!def) return fail(state, "Unknown card");
      if (def.cardType === "spell") {
        next.players[player].zones.resolutionZone.push(card);
        next.resolutionContext = {
          sourceInstanceId: card.instanceId,
          effectStack: [],
        };
        next = resolveSpell(next, card.cardNo, player);
      } else if (def.cardType === "follower" || def.cardType === "amulet") {
        if (next.players[player].zones.field.length >= next.players[player].fieldLimit) {
          return fail(state, "Field full");
        }
        card.enteredFromCemetery = true;
        next.players[player].zones.field.push(card);
        if (def.cardType === "follower") {
          onFollowerEntersField(next, card.instanceId, player);
        }
      }
      return ok(finishChoiceResolution(next, player));
    }
    const minPick = choice.minCount ?? choice.count ?? 0;
    const maxPick = choice.maxCount ?? choice.count ?? ids.length;
    if (ids.length < minPick || ids.length > maxPick) {
      return fail(state, `Must select between ${minPick} and ${maxPick} card(s)`);
    }
    for (const id of ids) {
      if (choice.fromZone === "opponentCemetery") continue;
      if (choice.fromZone === "field" && choice.action === "bury") {
        const buried = findInstance(next, id);
        if (!buried || buried.zone !== "field") return fail(state, "Invalid card");
        queueLastWords(next, id, buried.player);
        next = destroyFollower(next, id);
        continue;
      }
      const zone = next.players[player].zones[choice.fromZone];
      const idx = zone.findIndex((c) => c.instanceId === id);
      if (idx < 0) return fail(state, "Invalid card");
      const [card] = zone.splice(idx, 1);
      if (choice.action === "banish") {
        resetCardInstanceState(card);
        next.players[player].zones.banish.push(card);
      } else {
        next.players[player].zones.cemetery.push(card);
        if (choice.action === "discard" && choice.fromZone === "hand") {
          next.resolutionContext = {
            ...next.resolutionContext,
            sourceInstanceId: next.resolutionContext?.sourceInstanceId,
            effectStack: next.resolutionContext?.effectStack ?? [],
            resumeAfterChoice: next.resolutionContext?.resumeAfterChoice,
            deferTriggers: next.resolutionContext?.deferTriggers,
            lastDiscardedCardNo: card.cardNo,
          };
        }
      }
    }
    if (choice.resumeActivate) {
      const { sourceInstanceId, zone: activateZone, abilityKey } = choice.resumeActivate;
      if (choice.fromZone === "cemetery" && choice.action === "banish") {
        const srcFound = findInstance(next, sourceInstanceId);
        const srcDef = srcFound ? getCardDef(resolveCardNo(next, srcFound.card)) : undefined;
        const srcAbility = srcDef?.abilities
          ?.map((a, idx) => ({ ability: a, key: `activated:${idx}` }))
          .find((entry) => entry.key === abilityKey)?.ability;
        if (srcAbility?.cost?.banishSelf && srcFound?.zone === "cemetery") {
          const cem = next.players[player].zones.cemetery;
          const selfIdx = cem.findIndex((c) => c.instanceId === sourceInstanceId);
          if (selfIdx >= 0) {
            const [self] = cem.splice(selfIdx, 1);
            resetCardInstanceState(self);
            next.players[player].zones.banish.push(self);
          }
        }
      }
      if (choice.fromZone === "exArea" && choice.action === "banish") {
        const ex = next.players[player].zones.exArea;
        const srcIdx = ex.findIndex((c) => c.instanceId === sourceInstanceId);
        if (srcIdx >= 0) {
          const [self] = ex.splice(srcIdx, 1);
          resetCardInstanceState(self);
          next.players[player].zones.banish.push(self);
        }
      }
      next = finishActivateAfterCost(next, player, sourceInstanceId, activateZone, abilityKey);
      return ok(finishChoiceResolution(next, player));
    }
    if (choice.fromZone === "deck") {
      next = shuffleDeck(next, player);
    }
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "selectDeckSummon") {
    const ids = (payload.instanceIds as string[]) || [];
    let totalCost = 0;
    const p = next.players[player];
    for (const id of ids) {
      if (!choice.topInstanceIds.includes(id)) return fail(state, "Invalid card");
      const option = choice.options.find((o) => o.instanceId === id);
      if (!option?.eligible) return fail(state, "Card does not match filter");
      totalCost += option.cost;
    }
    if (totalCost > choice.maxTotalCost) {
      return fail(state, `Total cost must be ${choice.maxTotalCost} or less`);
    }
    const slots = p.fieldLimit - p.zones.field.length;
    if (ids.length > slots) return fail(state, "Not enough field space");
    for (const id of ids) {
      const idx = p.zones.deck.findIndex((c) => c.instanceId === id);
      if (idx < 0) continue;
      const [card] = p.zones.deck.splice(idx, 1);
      if (p.zones.field.length >= p.fieldLimit) break;
      p.zones.field.push(card);
      onFollowerEntersField(next, card.instanceId, player);
    }
    const remaining = choice.topInstanceIds.filter((id) => !ids.includes(id));
    next = sendSearchRemainder(next, player, remaining, choice.remainderTo);
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "selectCemeterySummon") {
    const ids = (payload.instanceIds as string[]) || [];
    if (ids.length > choice.count) {
      return fail(state, `Select up to ${choice.count} card(s)`);
    }
    if (ids.length === 0) {
      return ok(finishChoiceResolution(next, player));
    }
    let totalCost = 0;
    const p = next.players[player];
    for (const id of ids) {
      const card = p.zones.cemetery.find((c) => c.instanceId === id);
      if (!card || !cardMatchesFilter(card.cardNo, choice.filter)) {
        return fail(state, "Invalid card");
      }
      totalCost += resolveCardDefCost(card.cardNo);
    }
    if (totalCost > choice.maxTotalCost) {
      return fail(state, `Total cost must be ${choice.maxTotalCost} or less`);
    }
    const slots = p.fieldLimit - p.zones.field.length;
    if (ids.length > slots) return fail(state, "Not enough field space");
    for (const id of ids) {
      const idx = p.zones.cemetery.findIndex((c) => c.instanceId === id);
      if (idx < 0) continue;
      const [card] = p.zones.cemetery.splice(idx, 1);
      card.enteredFromCemetery = true;
      card.enteredFromHand = false;
      p.zones.field.push(card);
      onFollowerEntersField(next, card.instanceId, player);
    }
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "putHandOnDeck") {
    if (choice.phase === "selectCard") {
      const instanceId = String(payload.instanceId);
      const found = findInstance(next, instanceId);
      if (!found || found.zone !== "hand" || found.player !== player) {
        return fail(state, "Invalid card");
      }
      if (!choice.position) {
        next.pendingChoices = {
          type: "putHandOnDeck",
          player,
          phase: "selectPosition",
          selectedInstanceId: instanceId,
          options: choice.options,
        };
        return ok(next);
      }
      next = putHandCardOnDeck(next, player, instanceId, choice.position);
      return ok(finishChoiceResolution(next, player));
    }
    const position = payload.position === "bottom" ? "bottom" : "top";
    if (!choice.selectedInstanceId) return fail(state, "No card selected");
    next = putHandCardOnDeck(next, player, choice.selectedInstanceId, position);
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "selectEvolveDeckCard") {
    if (payload.skip && choice.optional) {
      return ok(finishChoiceResolution(next, player));
    }
    const instanceId = String(payload.instanceId);
    const found = findInstance(next, instanceId);
    if (!found || found.zone !== "evolveDeck" || found.player !== player) {
      return fail(state, "Invalid evolve deck card");
    }
    if (choice.turnTo) {
      next = setEvolveDeckOrientation(next, [instanceId], choice.turnTo);
    }
    if (choice.pendingEffect) {
      next.resolutionContext = {
        ...next.resolutionContext,
        sourceInstanceId: next.resolutionContext?.sourceInstanceId,
        effectStack: next.resolutionContext?.effectStack ?? [],
        selectedEvolveDeckId: instanceId,
        resumeAfterChoice: next.resolutionContext?.resumeAfterChoice,
      };
      next = resolveEffect(next, choice.pendingEffect, player);
      return ok(next.pendingChoices ? next : finishChoiceResolution(next, player));
    }
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "selectZoneCard") {
    if (payload.skip && choice.optional) {
      return ok(finishChoiceResolution(next, player));
    }
    const instanceId = String(payload.instanceId);
    const found = findInstance(next, instanceId);
    if (!found || found.zone !== choice.fromZone || found.player !== player) {
      return fail(state, "Invalid card");
    }
    if (shouldRevealBeforeHand(choice.to, choice.fromZone, choice.reveal)) {
      next = revealCard(next, player, instanceId, found.card.cardNo);
    }
    next = moveZoneCardTo(next, player, instanceId, choice.fromZone, choice.to);
    if (choice.to === "exArea" && choice.playCostReduction) {
      const moved = findInstance(next, instanceId);
      if (moved) {
        moved.card.playCostReduction += choice.playCostReduction;
      }
    }
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "searchDeckTop") {
    const remainderTo = choice.remainderTo ?? "cemetery";
    if (payload.skip && choice.optional) {
      next = sendSearchRemainder(next, player, choice.topInstanceIds, remainderTo);
      return ok(finishChoiceResolution(next, player));
    }
    const instanceId = String(payload.instanceId);
    if (!choice.topInstanceIds.includes(instanceId)) {
      return fail(state, "Invalid card");
    }
    const option = choice.options.find((o) => o.instanceId === instanceId);
    if (!option?.eligible) return fail(state, "Card does not match filter");
    if (choice.to === "hand" && shouldRevealBeforeHand(choice.to, "deck", choice.reveal)) {
      next = revealCard(next, player, instanceId, option.cardNo);
    }
    next = moveZoneCardTo(next, player, instanceId, "deck", choice.to);
    if (choice.to === "exArea" && choice.playCostReduction) {
      const moved = findInstance(next, instanceId);
      if (moved) {
        moved.card.playCostReduction += choice.playCostReduction;
      }
    }
    const remaining = choice.topInstanceIds.filter((id) => id !== instanceId);
    next = sendSearchRemainder(next, player, remaining, remainderTo);
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "engageFollowersForCost") {
    const ids = (payload.instanceIds as string[]) || [];
    let totalCost = 0;
    for (const id of ids) {
      const opt = choice.options.find((o) => o.instanceId === id);
      if (!opt) return fail(state, "Invalid card");
      totalCost += opt.cost;
    }
    if (totalCost < choice.minTotalCost) {
      return fail(state, `Engaged followers must cost ${choice.minTotalCost} or more total`);
    }
    for (const id of ids) {
      const found = findInstance(next, id);
      if (found) {
        found.card.engaged = true;
        queueOnBecomeEngaged(next, id, player);
      }
    }
    const { sourceInstanceId, zone: activateZone, abilityKey } = choice.resumeActivate;
    next = finishActivateAfterCost(next, player, sourceInstanceId, activateZone, abilityKey);
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "dealDamageCompare") {
    if (choice.phase === "selectTargets") {
      const ids = (payload.instanceIds as string[]) || [];
      if (ids.length !== 2) return fail(state, "Select exactly 2 followers");
      for (const id of ids) {
        if (!choice.options.some((o) => o.instanceId === id)) return fail(state, "Invalid card");
      }
      next.pendingChoices = {
        type: "dealDamageCompare",
        player,
        phase: "selectPrimary",
        selectedIds: ids,
        options: choice.options.filter((o) => ids.includes(o.instanceId)),
      };
      return ok(next);
    }
    const damageTargetId = String(payload.instanceId);
    if (!choice.selectedIds.includes(damageTargetId)) return fail(state, "Invalid primary target");
    const attackSourceId = choice.selectedIds.find((id) => id !== damageTargetId)!;
    const sourceFound = findInstance(next, attackSourceId);
    const dmg = sourceFound ? getEffectiveStats(sourceFound.card, next).atk : 0;
    let dmgState = structuredClone(next);
    const targetFound = findInstance(dmgState, damageTargetId);
    if (targetFound) {
      const applied = clampDamageToFollower(dmgState, targetFound.card, targetFound.player, dmg);
      targetFound.card.modifiers.push({ atk: 0, def: -applied, sourceId: "effect" });
      const { def } = getEffectiveStats(targetFound.card, dmgState);
      if (def <= 0) {
        queueLastWords(dmgState, damageTargetId, targetFound.player);
        dmgState = destroyFollower(dmgState, damageTargetId);
      }
    }
    return ok(finishChoiceResolution(dmgState, player));
  }

  if (choice.type === "dealDamageSplit") {
    if (choice.phase === "selectTargets") {
      const ids = (payload.instanceIds as string[]) || [];
      if (ids.length === 0 || ids.length > choice.options.length) {
        return fail(state, "Invalid target selection");
      }
      for (const id of ids) {
        if (!choice.options.some((o) => o.instanceId === id)) return fail(state, "Invalid card");
      }
      if (ids.length === 1) {
        const primaryId = ids[0];
        let dmgState = structuredClone(next);
        const primaryAmt = choice.primaryAmount;
        const secondaryAmt = choice.secondaryAmount;
        const found = findInstance(dmgState, primaryId);
        if (found) {
          found.card.modifiers.push({ atk: 0, def: -primaryAmt, sourceId: "effect" });
          const { def } = getEffectiveStats(found.card, dmgState);
          if (def <= 0) {
            queueLastWords(dmgState, primaryId, found.player);
            dmgState = destroyFollower(dmgState, primaryId);
          }
        }
        next = dmgState;
        return ok(finishChoiceResolution(next, player));
      }
      next.pendingChoices = {
        type: "dealDamageSplit",
        player,
        primaryAmount: choice.primaryAmount,
        secondaryAmount: choice.secondaryAmount,
        selectedIds: ids,
        phase: "selectPrimary",
        options: choice.options.filter((o) => ids.includes(o.instanceId)),
      };
      return ok(next);
    }
    const primaryId = String(payload.instanceId);
    if (!choice.selectedIds.includes(primaryId)) return fail(state, "Invalid primary target");
    let dmgState = structuredClone(next);
    for (const id of choice.selectedIds) {
      const amount = id === primaryId ? choice.primaryAmount : choice.secondaryAmount;
      const found = findInstance(dmgState, id);
      if (!found) continue;
      found.card.modifiers.push({ atk: 0, def: -amount, sourceId: "effect" });
      const { def } = getEffectiveStats(found.card, dmgState);
      if (def <= 0) {
        queueLastWords(dmgState, id, found.player);
        dmgState = destroyFollower(dmgState, id);
      }
    }
    next = dmgState;
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "discard") {
    const ids = (payload.instanceIds as string[]) || [];
    if (ids.length !== choice.count) {
      return fail(state, `Must discard exactly ${choice.count} card(s)`);
    }
    const handIds = new Set(next.players[player].zones.hand.map((c) => c.instanceId));
    for (const id of ids) {
      if (!handIds.has(id)) return fail(state, "Card not in hand");
      next = moveCard(next, id, "cemetery", player);
      queueOnDiscardTriggers(next, player, next.activePlayer);
    }
    if (choice.duringEffect) {
      return ok(finishChoiceResolution(next, player));
    }
    return ok(beginEndPhaseDiscard(next));
  }

  if (choice.type === "discardVariable") {
    const ids = (payload.instanceIds as string[]) || [];
    if (ids.length < choice.min || ids.length > choice.max) {
      return fail(state, `Discard between ${choice.min} and ${choice.max} card(s)`);
    }
    const handIds = new Set(next.players[player].zones.hand.map((c) => c.instanceId));
    for (const id of ids) {
      if (!handIds.has(id)) return fail(state, "Card not in hand");
      next = moveCard(next, id, "cemetery", player);
    }
    const drawCount = ids.length + choice.drawBonus;
    for (let i = 0; i < drawCount; i++) {
      next = drawCard(next, player);
    }
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "wardEngage") {
    const ids = (payload.instanceIds as string[]) || [];
    for (const id of ids) {
      const found = findInstance(next, id);
      if (found) {
        found.card.engaged = true;
        queueOnBecomeEngaged(next, id, found.player);
      }
    }
    return ok(beginEndPhaseDiscard(next));
  }

  if (choice.type === "choose") {
    const index = Number(payload.optionIndex);
    const opt = choice.options.find((o) => o.index === index);
    if (!opt) return fail(state, "Invalid choice");
    if (opt.additionalPpCost) {
      if (next.players[player].pp < opt.additionalPpCost) {
        return fail(state, "Not enough PP");
      }
      next.players[player].pp -= opt.additionalPpCost;
    }
    next = resolveEffect(next, effectForChosenOption(opt.effect), player);
    return ok(finishChoiceResolution(next, player));
  }

  if (choice.type === "chooseMultiple") {
    const indices = (payload.optionIndices as number[]) || [];
    if (indices.length < choice.min || indices.length > choice.max) {
      return fail(state, `Choose between ${choice.min} and ${choice.max} option(s)`);
    }
    const unique = new Set(indices);
    if (unique.size !== indices.length) return fail(state, "Duplicate options");
    const effects = indices.flatMap((index) => {
      const opt = choice.options.find((o) => o.index === index);
      if (!opt) return [];
      if (opt.effect.op === "sequence") return opt.effect.steps;
      return [opt.effect];
    });
    next.resolutionContext = {
      sourceInstanceId: next.resolutionContext?.sourceInstanceId,
      effectStack: [],
      resumeAfterChoice: effects,
      deferTriggers: true,
    };
    return ok(finishChoiceResolution(next, player));
  }

  return ok(next);
}

function putHandCardOnDeck(
  state: GameState,
  player: PlayerId,
  instanceId: string,
  position: "top" | "bottom",
): GameState {
  const next = structuredClone(state);
  const hand = next.players[player].zones.hand;
  const idx = hand.findIndex((c) => c.instanceId === instanceId);
  if (idx < 0) return state;
  const [card] = hand.splice(idx, 1);
  if (position === "top") next.players[player].zones.deck.unshift(card);
  else next.players[player].zones.deck.push(card);
  return next;
}

function beginEndPhaseDiscard(state: GameState): GameState {
  return finishEndPhase(structuredClone(state));
}

function clearTurnPlayCostReduction(player: GameState["players"][PlayerId]): void {
  for (const zone of Object.values(player.zones)) {
    if (!Array.isArray(zone)) continue;
    for (const card of zone) {
      card.playCostReduction = 0;
    }
  }
}

function endTurn(state: GameState): GameState {
  let next = structuredClone(state);
  const player = next.activePlayer;

  for (const p of next.players) {
    p.flags.endStartAbilitiesQueued = false;
    for (const cards of [p.zones.field, p.zones.hand, p.zones.exArea, p.zones.cemetery]) {
      for (const card of cards) {
        card.modifiers = card.modifiers.filter((m) => !m.untilEndOfTurn);
        card.abilitiesActivatedThisTurn = [];
      }
    }
  }
  clearTurnPlayCostReduction(next.players[player]);

  const grantExtraTurn = next.players[player].flags.extraTurnPending;
  if (grantExtraTurn) {
    next.players[player].flags.extraTurnPending = false;
    next.turnNumber += 1;
    next.phase = "start";
    next.combat = null;
    next.quickWindow = null;
    next.endPhaseQuickResolved = undefined;
    next = beginStartPhase(next);
    next = runConfirmationTiming(next);
    return next;
  }

  next.activePlayer = opponentOf(player);
  next.turnNumber += 1;
  next.phase = "start";
  next.combat = null;
  next.quickWindow = null;
  next.endPhaseQuickResolved = undefined;
  next = beginStartPhase(next);
  next = runConfirmationTiming(next);
  return next;
}

function playCard(
  state: GameState,
  player: PlayerId,
  handInstanceId: string,
  targets?: string[],
  fromQuickWindow = false,
): ActionResult {
  const inQuickWindow = state.quickWindow !== null;

  if (inQuickWindow) {
    if (state.quickWindowPlayer !== player) return fail(state, "Not your quick window");
    if (!fromQuickWindow) return fail(state, "Use quick play during quick window");
  } else {
    const phaseErr = assertPhase(state, ["main"], "Cannot play card now");
    if (phaseErr) return phaseErr;
    const activeErr = assertActivePlayer(state, player, "Not your turn");
    if (activeErr) return activeErr;
  }

  const found = findInstance(state, handInstanceId);
  if (!found || found.player !== player) {
    return fail(state, "Card not found");
  }
  if (found.zone !== "hand" && found.zone !== "exArea") {
    return fail(state, "Card not in hand or EX area");
  }

  const def = getCardDef(found.card.cardNo);
  if (!def) return fail(state, "Unknown card");

  if (inQuickWindow && !def.abilities?.some((a) => a.quick)) {
    return fail(state, "Not a quick card");
  }

  if (def.cardType === "spell" && !canPlayCardFromZones(state, player, found.card.cardNo)) {
    return fail(state, "No valid targets");
  }

  let next = structuredClone(state);
  const p = next.players[player];
  const playCost = getEffectivePlayCost(found.card, found.card.cardNo, state, player, found.zone);
  if (p.pp < playCost) return fail(state, "Not enough PP");

  p.pp -= playCost;
  p.flags.cardsPlayedThisTurn += 1;
  const discountIdx = (p.flags.nextPlayDiscounts ?? []).findIndex(
    (d) => !d.filter || cardMatchesFilter(found.card.cardNo, d.filter),
  );
  if (discountIdx >= 0) {
    p.flags.nextPlayDiscounts!.splice(discountIdx, 1);
  }

  if (p.zones.field.length >= p.fieldLimit && def.cardType !== "spell") {
    return fail(state, "Field full");
  }

  next = moveCard(next, handInstanceId, "resolutionZone", player);
  const inResolution = findInstance(next, handInstanceId);
  if (inResolution && def.cardType !== "spell") {
    inResolution.card.enteredFromHand = found.zone === "hand";
  }

  if (def.cardType === "spell") {
    next.resolutionContext = {
      sourceInstanceId: handInstanceId,
      effectStack: [],
      resumeAfterChoice: next.resolutionContext?.resumeAfterChoice,
      buriedCosts: next.resolutionContext?.buriedCosts,
      lastDiscardedCardNo: next.resolutionContext?.lastDiscardedCardNo,
      deferTriggers: next.resolutionContext?.deferTriggers,
    };
    next = resolveSpell(next, found.card.cardNo, player);
    if (spellEffectFullyResolved(next)) {
      const res = findInstance(next, handInstanceId);
      if (res?.zone === "resolutionZone") {
        next = moveCard(next, handInstanceId, "cemetery", player);
      }
    }
  } else if (def.cardType === "follower" || def.cardType === "amulet") {
    next = moveCard(next, handInstanceId, "field", player);
  }

  queueOnCardPlayed(next, handInstanceId, player);
  next = runConfirmationTiming(next);
  return ok(next);
}

function attack(
  state: GameState,
  player: PlayerId,
  attackerId: string,
  targetId: string | "leader",
): ActionResult {
  const activeErr = assertActivePlayer(state, player, "Not your turn");
  if (activeErr) return activeErr;
  const phaseErr = assertPhase(state, ["main"], "Cannot attack now");
  if (phaseErr) return phaseErr;

  const attackerFound = findInstance(state, attackerId);
  if (!attackerFound || attackerFound.zone !== "field" || attackerFound.player !== player) {
    return fail(state, "Invalid attacker");
  }
  if (!isFieldFollower(state, attackerFound.card)) {
    return fail(state, "Only followers can attack");
  }
  const attacker = attackerFound.card;
  if (attacker.engaged) return fail(state, "Follower is engaged and cannot attack");
  if (!canDeclareAttack(state, attacker)) return fail(state, "Follower cannot attack enemies");

  const canAttack =
    attacker.onFieldSinceTurnStart ||
    attacker.evolvedThisTurn ||
    hasKeyword(attacker, "storm", state) ||
    hasKeyword(attacker, "rush", state);
  if (!canAttack) return fail(state, "Follower cannot attack");

  const legal = getLegalAttackTargets(state, attacker, player);
  const isLegal =
    targetId === "leader"
      ? legal.some((t) => t.type === "leader")
      : legal.some((t) => t.type === "follower" && t.instanceId === targetId);
  if (!isLegal) return fail(state, "Illegal attack target");

  let next = structuredClone(state);
  const attackerOnNext = findInstance(next, attackerId);
  if (!attackerOnNext) return fail(state, "Invalid attacker");
  attackerOnNext.card.engaged = true;
  queueOnBecomeEngaged(next, attackerId, player);
  next.combat = {
    attackerId,
    targetId,
    targetPlayer: opponentOf(player),
    phase: "declared",
  };
  next.phase = "combat";
  next.eventLog.push({ type: "attack", player, data: { attackerId, targetId } });
  next = resolveCombat(next);

  return ok(next);
}

function resolveCombatDamage(state: GameState): GameState {
  if (!state.combat) return state;
  let next = abortCombatIfAttackerGone(state);
  if (!next.combat) return next;
  next = structuredClone(next);
  const combat = next.combat!;
  const attackerFound = findInstance(next, combat.attackerId);
  if (!attackerFound || attackerFound.zone !== "field") {
    next.combat = null;
    next.phase = "main";
    next.quickWindow = null;
    next.quickWindowPlayer = null;
    return next;
  }

  const attackerAtk = getAttackerStrikeDamage(next, attackerFound.card, attackerFound.player);

  if (combat.targetId === "leader") {
    next.players[combat.targetPlayer].leaderDef -= attackerAtk;
    if (hasKeyword(attackerFound.card, "drain", next)) {
      next.players[attackerFound.player].leaderDef += attackerAtk;
    }
  } else {
    const targetFound = findInstance(next, combat.targetId);
    if (targetFound && targetFound.zone === "field") {
      const targetDef = getEffectiveStats(targetFound.card, next).def;
      if (targetDef > 0) {
        const { atk: targetAtk } = getEffectiveStats(targetFound.card, next);
        const dmgToTarget = clampDamageToFollower(
          next,
          targetFound.card,
          targetFound.player,
          attackerAtk,
        );
        targetFound.card.modifiers.push({ def: -dmgToTarget, sourceId: combat.attackerId });
        attackerFound.card.modifiers.push({ def: -targetAtk, sourceId: combat.targetId });

        if (hasKeyword(attackerFound.card, "drain", next)) {
          next.players[attackerFound.player].leaderDef += attackerAtk;
        }

        if (
          hasKeyword(attackerFound.card, "bane", next, attackerFound.player) ||
          hasKeyword(targetFound.card, "bane", next, targetFound.player)
        ) {
          attackerFound.card.foughtWithBane = true;
          targetFound.card.foughtWithBane = true;
          attackerFound.card.foughtWithInstanceId = targetFound.card.instanceId;
          targetFound.card.foughtWithInstanceId = attackerFound.card.instanceId;
        }
      }
    }
  }

  next.combat = null;
  next.phase = "main";
  next.quickWindow = null;
  next.quickWindowPlayer = null;
  return runConfirmationTiming(next);
}

function resolveCombat(state: GameState): GameState {
  if (!state.combat) return state;
  let next = abortCombatIfAttackerGone(state);
  if (!next.combat) return next;
  next = structuredClone(next);
  const combat = next.combat!;

  if (combat.phase === "quickWindow") {
    return next;
  }

  if (combat.phase === "damage") {
    return resolveCombatDamage(next);
  }

  const attackerFound = findInstance(next, combat.attackerId);
  if (!attackerFound || attackerFound.zone !== "field") {
    next.combat = null;
    next.phase = "main";
    next.quickWindow = null;
    next.quickWindowPlayer = null;
    return next;
  }

  // Strike resolves before quick window and combat damage (Comprehensive Rules §11).
  const strikeAbilities = getStrikeAbilities(next, attackerFound.card);
  const strikeStart = combat.strikeAbilityIndex ?? 0;
  for (let i = strikeStart; i < strikeAbilities.length; i++) {
    next.resolutionContext = { sourceInstanceId: combat.attackerId, effectStack: [strikeAbilities[i].effect] };
    next = resolveEffect(next, strikeAbilities[i].effect, attackerFound.player, {
      deferConfirmation: true,
    });
    next = runConfirmationTiming(next);
    if (
      next.pendingChoices ||
      next.pendingTriggers.length > 0 ||
      (next.resolutionContext?.resumeAfterChoice?.length ?? 0) > 0
    ) {
      next.combat = { ...combat, strikeAbilityIndex: i };
      next.phase = "main";
      next.quickWindow = null;
      next.quickWindowPlayer = null;
      return next;
    }
    next.resolutionContext = null;
    next = abortCombatIfAttackerGone(next);
    if (!next.combat) return next;
  }

  if (!isCombatAttackerOnField(next)) {
    next.combat = null;
    next.phase = "main";
    next.quickWindow = null;
    next.quickWindowPlayer = null;
    return next;
  }

  const attackerAfterStrike = findInstance(next, combat.attackerId);
  if (!attackerAfterStrike || attackerAfterStrike.zone !== "field") {
    next.combat = null;
    next.phase = "main";
    next.quickWindow = null;
    next.quickWindowPlayer = null;
    return next;
  }

  const defender = opponentOf(attackerAfterStrike.player);
  if (hasPlayableQuickCards(next, defender)) {
    next.combat = { ...combat, phase: "quickWindow", strikeAbilityIndex: undefined };
    next.quickWindow = "afterAttack";
    next.quickWindowPlayer = defender;
    next.phase = "main";
    return next;
  }

  next.combat = { ...combat, phase: "damage", strikeAbilityIndex: undefined };
  return resolveCombat(next);
}

function evolve(
  state: GameState,
  player: PlayerId,
  fieldInstanceId: string,
  evolveDeckInstanceId?: string,
  useSuperEvo?: boolean,
  useEvoPoint?: boolean,
): ActionResult {
  const activeErr = assertActivePlayer(state, player, "Not your turn");
  if (activeErr) return activeErr;

  const fieldFound = findInstance(state, fieldInstanceId);
  if (!fieldFound || fieldFound.zone !== "field") return fail(state, "Invalid field card");
  if (fieldFound.card.linkedEvoInstanceId) return fail(state, "Already evolved");

  const evoCard =
    (evolveDeckInstanceId
      ? findInstance(state, evolveDeckInstanceId)?.card
      : null) ?? findMatchingEvolveCard(state, player, fieldInstanceId);
  if (!evoCard) return fail(state, "Invalid evolve card");
  if (evoCard.evoSpent) return fail(state, "Evolve card already spent");
  const evoFound = findInstance(state, evoCard.instanceId);
  if (!evoFound || evoFound.zone !== "evolveDeck") return fail(state, "Invalid evolve card");
  const evolveDeckInstanceIdResolved = evoCard.instanceId;

  const baseDef = getCardDef(fieldFound.card.cardNo);
  const evoDef = getCardDef(evoFound.card.cardNo);
  if (!baseDef?.evolvesTo && baseDef?.cardNo !== evoDef?.evolvesFrom) {
    if (evoDef?.evolvesFrom !== baseDef?.cardNo) return fail(state, "Cards do not match");
  }

  const cost = getEvolveCost(evoFound.card.cardNo, fieldFound.card.cardNo);
  let next = structuredClone(state);
  const p = next.players[player];

  const payment = computeEvolvePayment(cost, p.pp, p.evoPoints, Boolean(useEvoPoint));
  if (!payment.ok) return fail(state, "Cannot pay evolve cost");
  p.evoPoints -= payment.epCost;
  p.pp -= payment.ppCost;

  next = moveCard(next, evolveDeckInstanceIdResolved, "resolutionZone", player);

  const fieldOnNext = findInstance(next, fieldInstanceId);
  if (!fieldOnNext || fieldOnNext.zone !== "field") return fail(state, "Invalid field card");

  fieldOnNext.card.linkedEvoInstanceId = evolveDeckInstanceIdResolved;
  fieldOnNext.card.evolvedThisTurn = true;
  // Evolving grants rush for this turn; keep leader-attack eligibility if already on board since turn start.
  fieldOnNext.card.onFieldSinceTurnStart = fieldFound.card.onFieldSinceTurnStart;

  if (useSuperEvo && next.players[player].superEvoPoints > 0) {
    const threshold = player === next.firstPlayer ? 7 : 6;
    if (next.players[player].turnsPassed >= threshold) {
      next.players[player].superEvoPoints -= 1;
      fieldOnNext.card.superEvolved = true;
      fieldOnNext.card.modifiers.push({ atk: 1, def: 1, sourceId: "superEvo" });
    }
  }

  next.players[player].flags.evolvedThisTurn = true;

  next.players[player].zones.evolveZone.push({
    fieldInstanceId,
    evolveInstanceId: evolveDeckInstanceIdResolved,
  });

  queueOnAllyEvolveTriggers(next, fieldInstanceId, player);

  const onEvolveAbs = evoDef?.abilities?.filter((a) => a.timing === "onEvolve") ?? [];
  const onSEAbs = fieldOnNext.card.superEvolved
    ? (evoDef?.abilities?.filter((a) => a.timing === "onSuperEvolve") ?? [])
    : [];

  if (fieldOnNext.card.superEvolved && onEvolveAbs.length > 0 && onSEAbs.length > 0) {
    next.pendingChoices = withChoiceContext(next, {
      type: "chooseMultiple",
      player,
      reasonLabel: "Choose the order of Evolve and Super Evolve effects",
      options: [
        { index: 0, label: "On Evolve", effect: onEvolveAbs[0].effect },
        { index: 1, label: "On Super Evolve", effect: onSEAbs[0].effect },
      ],
      min: 2,
      max: 2,
    });
    next.resolutionContext = {
      sourceInstanceId: fieldInstanceId,
      effectStack: [],
      resumeAfterChoice: [],
    };
    next = runConfirmationTiming(next);
    return ok(next);
  }

  const evolveEffects: Effect[] = [
    ...onEvolveAbs.map((a) => a.effect),
    ...onSEAbs.map((a) => a.effect),
  ];
  for (let i = 0; i < evolveEffects.length; i++) {
    next.resolutionContext = contextForTriggerResolution(next, fieldInstanceId, evolveEffects[i]);
    next = resolveEffect(next, evolveEffects[i], player);
    if (shouldClearResolutionContext(next)) {
      next.resolutionContext = null;
    }
    if (next.pendingChoices) {
      const tail = evolveEffects.slice(i + 1);
      if (tail.length > 0) {
        next.resolutionContext = {
          sourceInstanceId: fieldInstanceId,
          effectStack: [],
          resumeAfterChoice: [
            ...tail,
            ...(next.resolutionContext?.resumeAfterChoice ?? []),
          ],
        };
      }
      break;
    }
  }

  next = runConfirmationTiming(next);
  return ok(next);
}

function finishActivateAfterCost(
  state: GameState,
  player: PlayerId,
  sourceInstanceId: string,
  zone: "field" | "cemetery" | "exArea" | "hand",
  abilityKey: string,
): GameState {
  let next = structuredClone(state);
  const sourceOnNext = findInstance(next, sourceInstanceId);
  const def = sourceOnNext ? getCardDef(resolveCardNo(next, sourceOnNext.card)) : undefined;
  const ability = def?.abilities
    ?.map((a, idx) => ({ ability: a, key: `activated:${idx}` }))
    .find((entry) => entry.key === abilityKey)?.ability;
  if (!ability) return state;

  if (sourceOnNext) {
    if (zone === "field" && ability.cost?.engage) {
      sourceOnNext.card.engaged = true;
      queueOnBecomeEngaged(next, sourceInstanceId, player);
    }
    if (ability.oncePerTurn && !sourceOnNext.card.abilitiesActivatedThisTurn.includes(abilityKey)) {
      sourceOnNext.card.abilitiesActivatedThisTurn.push(abilityKey);
    }
  }

  next.resolutionContext = {
    sourceInstanceId,
    effectStack: [ability.effect],
  };
  next = resolveEffect(next, ability.effect, player);
  if (shouldClearResolutionContext(next)) {
    next.resolutionContext = null;
  }
  return next;
}

function resolveActivate(
  state: GameState,
  player: PlayerId,
  sourceInstanceId: string,
  zone: "field" | "cemetery" | "exArea" | "hand",
  useEvoPoint?: boolean,
): ActionResult {
  const found = findInstance(state, sourceInstanceId);
  if (!found || found.zone !== zone || found.player !== player) {
    return fail(state, "Invalid card");
  }
  if (found.card.abilitiesSilenced) {
    return fail(state, "Abilities silenced");
  }
  if (opponentsAbilitiesSilencedFor(state, player)) {
    return fail(state, "Abilities silenced");
  }

  const activated = getActivatedAbilities(state, found.card, player, zone);
  if (activated.length === 0) return fail(state, "No activated ability");

  if (zone === "field" && found.card.engaged && activated[0].ability.cost?.engage) {
    return fail(state, "Follower is engaged and cannot pay engage cost");
  }

  let next = structuredClone(state);
  const p = next.players[player];
  const { ability, key } = activated[0];
  const def = getCardDef(resolveCardNo(next, found.card));
  const advance = isAdvanceAbility(def, ability);
  if (advance && p.flags.evolvedThisTurn) {
    return fail(state, "Already evolved or advanced this turn");
  }
  if (advance && !canAdvanceActivate(next, player, ability.effect)) {
    return fail(state, "Advance conditions not met");
  }

  const activateCost = ability.cost?.pp ?? 0;
  const payment = computeEvolvePayment(activateCost, p.pp, p.evoPoints, Boolean(useEvoPoint));
  if (!payment.ok) return fail(state, "Cannot pay activate cost");
  p.evoPoints -= payment.epCost;
  p.pp -= payment.ppCost;
  if (advance) {
    p.flags.evolvedThisTurn = true;
  }

  if (ability.cost?.banishFromCemetery || (ability.cost?.banishSelf && zone === "cemetery")) {
    const filter = ability.cost?.banishFromCemetery;
    const count = ability.cost?.banishCount ?? (filter ? 1 : 0);
    const matches = filter
      ? p.zones.cemetery.filter(
          (c) =>
            c.instanceId !== sourceInstanceId && cardMatchesFilter(c.cardNo, filter),
        )
      : [];
    if (filter && matches.length < count) return fail(state, "Cannot pay activate cost");
    if (filter && matches.length >= count) {
      next.pendingChoices = {
        type: "selectZoneCards",
        player,
        fromZone: "cemetery",
        count,
        action: "banish",
        options: matches.map((c) => ({
          instanceId: c.instanceId,
          cardNo: c.cardNo,
          label: getCardDef(c.cardNo)?.name || c.cardNo,
        })),
        resumeActivate: { sourceInstanceId, zone, abilityKey: key },
      };
      return ok(next);
    }
    if (ability.cost?.banishSelf && zone === "cemetery") {
      const selfIdx = p.zones.cemetery.findIndex((c) => c.instanceId === sourceInstanceId);
      if (selfIdx < 0) return fail(state, "Cannot pay activate cost");
      const [self] = p.zones.cemetery.splice(selfIdx, 1);
      resetCardInstanceState(self);
      p.zones.banish.push(self);
    }
  }

  if (ability.cost?.banishFromExArea) {
    const filter = ability.cost.banishFromExArea;
    const total = ability.cost.banishCount ?? 1;
    const matches = p.zones.exArea.filter((c) => cardMatchesFilter(c.cardNo, filter));
    if (matches.length < total) return fail(state, "Cannot pay activate cost");
    const sourceInEx = matches.some((c) => c.instanceId === sourceInstanceId);
    const needFromEx = sourceInEx ? total - 1 : total;
    const pool = sourceInEx
      ? matches.filter((c) => c.instanceId !== sourceInstanceId)
      : matches;
    if (needFromEx > 0 && pool.length > needFromEx) {
      next.pendingChoices = {
        type: "selectZoneCards",
        player,
        fromZone: "exArea",
        count: needFromEx,
        action: "banish",
        options: pool.map((c) => ({
          instanceId: c.instanceId,
          cardNo: c.cardNo,
          label: getCardDef(c.cardNo)?.name || c.cardNo,
        })),
        resumeActivate: { sourceInstanceId, zone, abilityKey: key },
      };
      return ok(next);
    }
    const toBanish = sourceInEx
      ? [sourceInstanceId, ...pool.slice(0, needFromEx).map((c) => c.instanceId)]
      : pool.slice(0, needFromEx).map((c) => c.instanceId);
    for (const id of toBanish) {
      const idx = p.zones.exArea.findIndex((c) => c.instanceId === id);
      if (idx < 0) return fail(state, "Cannot pay activate cost");
      const [card] = p.zones.exArea.splice(idx, 1);
      resetCardInstanceState(card);
      p.zones.banish.push(card);
    }
  }

  if (ability.cost?.earthRite) {
    const need = ability.cost.earthRite.count ?? 1;
    const stackCard = p.zones.field.find((c) => {
      const def = getCardDef(resolveCardNo(next, c));
      return def?.keywords?.includes("stack") || def?.traits?.some((t) => /earth|sigil/i.test(t));
    });
    if (!stackCard || (stackCard.counters.stack ?? 0) < need) {
      return fail(state, "Cannot pay Earth Rite cost");
    }
    stackCard.counters.stack = (stackCard.counters.stack ?? 0) - need;
  }

  if (ability.cost?.engageFollowersMinTotalCost) {
    const minCost = ability.cost.engageFollowersMinTotalCost;
    const options = p.zones.field
      .filter((c) => isFieldFollower(next, c))
      .map((c) => ({
        instanceId: c.instanceId,
        cardNo: resolveCardNo(next, c),
        label: getCardDef(resolveCardNo(next, c))?.name || c.cardNo,
        cost: resolveCardDefCost(resolveCardNo(next, c)),
      }));
    const maxTotal = options.reduce((sum, o) => sum + o.cost, 0);
    if (maxTotal < minCost) return fail(state, "Cannot pay activate cost");
    next.pendingChoices = {
      type: "engageFollowersForCost",
      player,
      minTotalCost: minCost,
      options,
      resumeActivate: { sourceInstanceId, zone, abilityKey: key },
    };
    return ok(next);
  }

  if (ability.cost?.burySelf) {
    if (zone !== "field") return fail(state, "Cannot pay activate cost");
    queueLastWords(next, sourceInstanceId, player);
    next = destroyFollower(next, sourceInstanceId);
  }

  if (ability.cost?.buryFromField) {
    const filter = ability.cost.buryFromField;
    const count = ability.cost.buryFieldCount ?? 1;
    const matches = p.zones.field.filter((c) => {
      if (ability.cost?.excludeSelfFromBury && c.instanceId === sourceInstanceId) return false;
      return cardMatchesFilter(c.cardNo, filter);
    });
    if (matches.length < count) return fail(state, "Cannot pay activate cost");
    if (matches.length >= count) {
      next.pendingChoices = {
        type: "selectZoneCards",
        player,
        fromZone: "field",
        count,
        action: "bury",
        options: matches.map((c) => ({
          instanceId: c.instanceId,
          cardNo: c.cardNo,
          label: getCardDef(c.cardNo)?.name || c.cardNo,
        })),
        resumeActivate: { sourceInstanceId, zone, abilityKey: key },
      };
      return ok(next);
    }
    if (ability.cost?.engage) {
      const src = findInstance(next, sourceInstanceId);
      if (src) src.card.engaged = true;
    }
    for (const card of matches) {
      queueLastWords(next, card.instanceId, player);
      next = destroyFollower(next, card.instanceId);
    }
  }

  next = finishActivateAfterCost(next, player, sourceInstanceId, zone, key);
  next = runConfirmationTiming(next);
  return ok(next);
}

export function applyAction(
  state: GameState,
  player: PlayerId,
  action: GameAction,
): ActionResult {
  if (state.phase === "gameOver") return fail(state, "Game is over");

  let workingState =
    action.type !== "CHOICE_RESPONSE" ? clearRevealedCards(state) : state;

  if (
    workingState.pendingChoices &&
    action.type !== "CHOICE_RESPONSE" &&
    action.type !== "MULLIGAN"
  ) {
    return fail(workingState, "Must resolve pending choice first");
  }

  const quickBlock = assertNotBlockedByOpponentQuickWindow(workingState, player, action);
  if (quickBlock) return quickBlock;

  switch (action.type) {
    case "MULLIGAN":
      if (workingState.phase !== "mulligan") return fail(workingState, "Not mulligan phase");
      return ok(applyMulligan(workingState, player, action.redraw));

    case "CHOICE_RESPONSE":
      return handleChoiceResponse(workingState, player, action.payload);

    case "PLAY_CARD":
      return playCard(workingState, player, action.handInstanceId, action.targets);

    case "QUICK_PLAY":
      if (state.quickWindow === null) return fail(state, "No quick window");
      return playCard(state, player, action.handInstanceId, action.targets, true);

    case "PASS_QUICK_WINDOW": {
      if (state.quickWindow === null) return fail(state, "No quick window");
      if (state.quickWindowPlayer !== player) return fail(state, "Not your quick window");
      if (state.quickWindow === "afterAttack") {
        let next = structuredClone(state);
        next.quickWindow = null;
        next.quickWindowPlayer = null;
        if (next.combat) {
          next.combat = { ...next.combat, phase: "damage" };
          next = resolveCombat(next);
        }
        return ok(next);
      }
      if (state.quickWindow === "endPhase") {
        let next = structuredClone(state);
        next.endPhaseQuickResolved = true;
        next.quickWindow = null;
        next.quickWindowPlayer = null;
        next = continueEndPhaseFlow(next);
        return ok(next);
      }
      return fail(state, "Unknown quick window");
    }

    case "ATTACK":
      return attack(state, player, action.attackerId, action.targetId);

    case "EVOLVE":
      return evolve(
        state,
        player,
        action.fieldInstanceId,
        action.evolveDeckInstanceId,
        action.useSuperEvo,
        action.useEvoPoint,
      );

    case "END_MAIN": {
      const activeErr = assertActivePlayer(state, player, "Not your turn");
      if (activeErr) return activeErr;
      if (state.quickWindow === "endPhase" && !state.endPhaseQuickResolved) {
        return fail(state, "Opponent must resolve quick window first");
      }
      if (state.quickWindow === "afterAttack" || state.combat?.phase === "quickWindow") {
        return fail(state, "Resolve quick window first");
      }
      if (state.combat?.phase === "declared") {
        return ok(resolveCombat(state));
      }

      let next = structuredClone(state);
      next.phase = "end";
      next.endPhaseQuickResolved = false;
      next = continueEndPhaseFlow(next);
      return ok(next);
    }

    case "ACTIVATE": {
      const activeErr = assertActivePlayer(state, player, "Not your turn");
      if (activeErr) return activeErr;
      const phaseErr = assertPhase(state, ["main"], "Cannot activate now");
      if (phaseErr) return phaseErr;
      return resolveActivate(
        state,
        player,
        action.fieldInstanceId,
        "field",
        action.useEvoPoint,
      );
    }

    case "ACTIVATE_CEMETERY": {
      const activeErr = assertActivePlayer(state, player, "Not your turn");
      if (activeErr) return activeErr;
      const phaseErr = assertPhase(state, ["main"], "Cannot activate now");
      if (phaseErr) return phaseErr;
      return resolveActivate(state, player, action.cemeteryInstanceId, "cemetery");
    }

    case "ACTIVATE_EXAREA": {
      const activeErr = assertActivePlayer(state, player, "Not your turn");
      if (activeErr) return activeErr;
      const phaseErr = assertPhase(state, ["main"], "Cannot activate now");
      if (phaseErr) return phaseErr;
      return resolveActivate(state, player, action.exAreaInstanceId, "exArea");
    }

    case "ACTIVATE_HAND": {
      const activeErr = assertActivePlayer(state, player, "Not your turn");
      if (activeErr) return activeErr;
      const phaseErr = assertPhase(state, ["main"], "Cannot activate now");
      if (phaseErr) return phaseErr;
      return resolveActivate(state, player, action.handInstanceId, "hand", action.useEvoPoint);
    }

    case "CONCEDE": {
      const next = structuredClone(state);
      next.winner = opponentOf(player);
      next.phase = "gameOver";
      return ok(next);
    }

    default:
      return fail(state, "Unknown action");
  }
}

export function advanceCombatIfNeeded(state: GameState): GameState {
  return state;
}
