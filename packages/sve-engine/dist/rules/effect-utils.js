"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.effectContainsOp = effectContainsOp;
exports.isAdvanceAbility = isAdvanceAbility;
exports.canAdvanceActivate = canAdvanceActivate;
exports.shouldDeferTriggers = shouldDeferTriggers;
exports.finishDeferredTriggers = finishDeferredTriggers;
exports.shouldClearResolutionContext = shouldClearResolutionContext;
exports.contextForTriggerResolution = contextForTriggerResolution;
exports.getChoiceContext = getChoiceContext;
exports.withChoiceContext = withChoiceContext;
const registry_1 = require("../cards/registry");
const conditions_1 = require("../state/conditions");
const queries_1 = require("../state/queries");
function effectContainsOp(effect, op) {
    if (effect.op === op)
        return true;
    if (effect.op === "sequence") {
        return effect.steps.some((step) => effectContainsOp(step, op));
    }
    if (effect.op === "if") {
        return (effectContainsOp(effect.then, op) ||
            (effect.else != null && effectContainsOp(effect.else, op)));
    }
    if (effect.op === "optionalCost") {
        return effectContainsOp(effect.cost, op) || effectContainsOp(effect.then, op);
    }
    return false;
}
function isAdvanceAbility(def, ability) {
    if (!def?.keywords?.includes("advanced"))
        return false;
    return effectContainsOp(ability.effect, "summonFromEvolveDeck");
}
/** Advance activated effects gate on nested if/else deck or cemetery conditions. */
function canAdvanceActivate(state, player, effect) {
    if (effect.op !== "if")
        return true;
    if ((0, conditions_1.evalCondition)(state, player, effect.condition))
        return true;
    if (effect.else?.op === "if" && (0, conditions_1.evalCondition)(state, player, effect.else.condition))
        return true;
    return false;
}
function shouldDeferTriggers(state) {
    return (state.resolutionContext?.resumeAfterChoice?.length ?? 0) > 0;
}
function finishDeferredTriggers(state) {
    if (!state.resolutionContext?.deferTriggers)
        return state;
    if (state.pendingChoices)
        return state;
    if ((state.resolutionContext.resumeAfterChoice?.length ?? 0) > 0)
        return state;
    const next = structuredClone(state);
    next.resolutionContext = { ...next.resolutionContext, deferTriggers: false };
    return next;
}
function shouldClearResolutionContext(state) {
    if (state.pendingChoices)
        return false;
    if ((state.resolutionContext?.resumeAfterChoice?.length ?? 0) > 0)
        return false;
    if (state.resolutionContext?.deferTriggers)
        return false;
    return true;
}
function contextForTriggerResolution(state, sourceInstanceId, effect) {
    const prev = state.resolutionContext;
    return {
        sourceInstanceId,
        effectStack: [effect],
        resumeAfterChoice: prev?.resumeAfterChoice,
        deferTriggers: prev?.deferTriggers,
    };
}
function getChoiceContext(state) {
    const sourceId = state.resolutionContext?.sourceInstanceId;
    if (!sourceId)
        return {};
    const found = (0, queries_1.findInstance)(state, sourceId);
    if (!found)
        return {};
    const cardNo = (0, queries_1.resolveCardNo)(state, found.card);
    const def = (0, registry_1.getCardDef)(cardNo);
    return {
        sourceCardNo: cardNo,
        sourceLabel: def?.name ?? cardNo,
    };
}
function withChoiceContext(state, choice) {
    const ctx = getChoiceContext(state);
    if (!ctx.sourceLabel)
        return choice;
    return { ...choice, ...ctx };
}
