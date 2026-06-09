import { getCardDef } from "../cards/registry";
import { evalCondition } from "../state/conditions";
import { findInstance, resolveCardNo } from "../state/queries";
import {
  AbilityDefinition,
  CardDefinition,
  ChoicePrompt,
  Effect,
  GameState,
  PlayerId,
  ResolutionContext,
} from "../types";

export function effectContainsOp(effect: Effect, op: Effect["op"]): boolean {
  if (effect.op === op) return true;
  if (effect.op === "sequence") {
    return effect.steps.some((step) => effectContainsOp(step, op));
  }
  if (effect.op === "if") {
    return (
      effectContainsOp(effect.then, op) ||
      (effect.else != null && effectContainsOp(effect.else, op))
    );
  }
  if (effect.op === "optionalCost") {
    return effectContainsOp(effect.cost, op) || effectContainsOp(effect.then, op);
  }
  return false;
}

export function isAdvanceAbility(
  def: CardDefinition | undefined,
  ability: AbilityDefinition,
): boolean {
  if (!def?.keywords?.includes("advanced")) return false;
  return effectContainsOp(ability.effect, "summonFromEvolveDeck");
}

/** Advance activated effects gate on nested if/else deck or cemetery conditions. */
export function canAdvanceActivate(state: GameState, player: PlayerId, effect: Effect): boolean {
  if (effect.op !== "if") return true;
  if (evalCondition(state, player, effect.condition)) return true;
  if (effect.else?.op === "if" && evalCondition(state, player, effect.else.condition)) return true;
  return false;
}

export function shouldDeferTriggers(state: GameState): boolean {
  return (state.resolutionContext?.resumeAfterChoice?.length ?? 0) > 0;
}

export function finishDeferredTriggers(state: GameState): GameState {
  if (!state.resolutionContext?.deferTriggers) return state;
  if (state.pendingChoices) return state;
  if ((state.resolutionContext.resumeAfterChoice?.length ?? 0) > 0) return state;
  const next = structuredClone(state);
  next.resolutionContext = { ...next.resolutionContext!, deferTriggers: false };
  return next;
}

export function shouldClearResolutionContext(state: GameState): boolean {
  if (state.pendingChoices) return false;
  if ((state.resolutionContext?.resumeAfterChoice?.length ?? 0) > 0) return false;
  if (state.resolutionContext?.deferTriggers) return false;
  return true;
}

export function contextForTriggerResolution(
  state: GameState,
  sourceInstanceId: string,
  effect: Effect,
): ResolutionContext {
  const prev = state.resolutionContext;
  return {
    sourceInstanceId,
    effectStack: [effect],
    resumeAfterChoice: prev?.resumeAfterChoice,
    deferTriggers: prev?.deferTriggers,
  };
}

export function getChoiceContext(state: GameState): {
  sourceCardNo?: string;
  sourceLabel?: string;
} {
  const sourceId = state.resolutionContext?.sourceInstanceId;
  if (!sourceId) return {};
  const found = findInstance(state, sourceId);
  if (!found) return {};
  const cardNo = resolveCardNo(state, found.card);
  const def = getCardDef(cardNo);
  return {
    sourceCardNo: cardNo,
    sourceLabel: def?.name ?? cardNo,
  };
}

export function withChoiceContext<T extends ChoicePrompt>(
  state: GameState,
  choice: T,
): T {
  const ctx = getChoiceContext(state);
  if (!ctx.sourceLabel) return choice;
  return { ...choice, ...ctx };
}
