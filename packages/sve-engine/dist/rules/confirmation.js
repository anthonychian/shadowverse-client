"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueOnLeaveField = exports.queueFanfare = exports.queueLastWords = void 0;
exports.onFollowerEntersField = onFollowerEntersField;
exports.onCardEntersExArea = onCardEntersExArea;
exports.resolveChosenTrigger = resolveChosenTrigger;
exports.runConfirmationTiming = runConfirmationTiming;
const registry_1 = require("../cards/registry");
const tokens_1 = require("../cards/tokens");
const card_reset_1 = require("../state/card-reset");
const resolver_1 = require("../effects/resolver");
const effect_utils_1 = require("./effect-utils");
const trigger_queue_1 = require("./trigger-queue");
const queries_1 = require("../state/queries");
const conditions_1 = require("../state/conditions");
const zones_1 = require("../state/zones");
function checkLosses(state) {
    let next = structuredClone(state);
    for (const pid of [0, 1]) {
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
            next = (0, zones_1.drawCard)(next, pid);
            next.players[pid].flags.owedDraws -= 1;
        }
    }
    return next;
}
function destroyAtZeroDef(state) {
    let next = state;
    let changed = true;
    while (changed) {
        changed = false;
        for (const pid of [0, 1]) {
            for (const card of [...(0, queries_1.getPlayer)(next, pid).zones.field]) {
                const { def } = (0, queries_1.getEffectiveStats)(card, next);
                if (def <= 0) {
                    (0, trigger_queue_1.queueLastWords)(next, card.instanceId, pid);
                    next = (0, zones_1.destroyFollower)(next, card.instanceId);
                    changed = true;
                }
            }
        }
    }
    return next;
}
function resolveBane(state) {
    let next = structuredClone(state);
    const toDestroy = new Set();
    for (const pid of [0, 1]) {
        for (const card of next.players[pid].zones.field) {
            if (!card.foughtWithBane || !card.foughtWithInstanceId)
                continue;
            const opponent = (0, queries_1.findInstance)(next, card.foughtWithInstanceId);
            if (!opponent || opponent.zone !== "field")
                continue;
            const cardHasBane = (0, queries_1.hasKeyword)(card, "bane", next, pid);
            const oppHasBane = (0, queries_1.hasKeyword)(opponent.card, "bane", next, opponent.player);
            if (cardHasBane && !oppHasBane) {
                toDestroy.add(card.foughtWithInstanceId);
            }
            else if (oppHasBane && !cardHasBane) {
                toDestroy.add(card.instanceId);
            }
            else if (cardHasBane && oppHasBane) {
                toDestroy.add(card.instanceId);
                toDestroy.add(card.foughtWithInstanceId);
            }
        }
    }
    for (const instanceId of toDestroy) {
        const found = (0, queries_1.findInstance)(next, instanceId);
        if (!found || found.zone !== "field")
            continue;
        (0, trigger_queue_1.queueLastWords)(next, instanceId, found.player);
        next = (0, zones_1.destroyFollower)(next, instanceId);
    }
    return next;
}
function enforceFieldLimits(state) {
    let next = structuredClone(state);
    for (const pid of [0, 1]) {
        const p = next.players[pid];
        while (p.zones.field.length > p.fieldLimit) {
            const excess = p.zones.field.pop();
            const dest = (0, tokens_1.destinationForDestroyedCard)(excess.cardNo);
            (0, card_reset_1.resetCardInstanceState)(excess);
            p.zones[dest].push(excess);
        }
        while (p.zones.exArea.length > p.exLimit) {
            const excess = p.zones.exArea.pop();
            const dest = (0, tokens_1.destinationForDestroyedCard)(excess.cardNo);
            (0, card_reset_1.resetCardInstanceState)(excess);
            p.zones[dest].push(excess);
        }
    }
    return next;
}
function capPlayPoints(state) {
    const next = structuredClone(state);
    for (const pid of [0, 1]) {
        const p = next.players[pid];
        if (p.pp > p.maxPp)
            p.pp = p.maxPp;
    }
    return next;
}
var trigger_queue_2 = require("./trigger-queue");
Object.defineProperty(exports, "queueLastWords", { enumerable: true, get: function () { return trigger_queue_2.queueLastWords; } });
Object.defineProperty(exports, "queueFanfare", { enumerable: true, get: function () { return trigger_queue_2.queueFanfare; } });
Object.defineProperty(exports, "queueOnLeaveField", { enumerable: true, get: function () { return trigger_queue_2.queueOnLeaveField; } });
function installPassiveGrants(state, instanceId, player) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found || found.zone !== "field")
        return;
    const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, found.card));
    for (const ability of def?.abilities ?? []) {
        if (ability.timing !== "passive")
            continue;
        if (ability.condition && !(0, conditions_1.evalCondition)(state, player, ability.condition))
            continue;
        const effect = ability.effect;
        if (effect.op === "grantOnCardPlayed") {
            if (!found.card.grantedOnCardPlayed)
                found.card.grantedOnCardPlayed = [];
            found.card.grantedOnCardPlayed.push({
                filter: effect.filter,
                effect: effect.effect,
                untilEndOfTurn: effect.untilEndOfTurn,
                oncePerTurn: effect.oncePerTurn,
                maxPerTurn: effect.maxPerTurn,
                label: effect.label,
            });
        }
        if (effect.op === "grantOnDamaged") {
            if (!found.card.grantedOnDamaged)
                found.card.grantedOnDamaged = [];
            found.card.grantedOnDamaged.push({
                effect: effect.effect,
                oncePerTurn: effect.oncePerTurn,
                label: effect.label,
            });
        }
        if (effect.op === "grantIgnoresWard") {
            found.card.ignoresWard = true;
        }
    }
}
/** Fanfare and field-entry setup when a follower/amulet enters the field. */
function onFollowerEntersField(state, instanceId, player) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found || found.zone !== "field")
        return;
    if (found.card.enteredFromHand === undefined) {
        found.card.enteredFromHand = false;
    }
    found.card.enteredFieldTurn = state.turnNumber;
    found.card.onFieldSinceTurnStart = false;
    installPassiveGrants(state, instanceId, player);
    (0, trigger_queue_1.queueFanfare)(state, instanceId, player);
    (0, trigger_queue_1.queueAllyFollowerEnterTriggers)(state, instanceId, player);
    (0, trigger_queue_1.queueCemeteryOnAllyFollowerEnter)(state, instanceId, player);
}
function onCardEntersExArea(state, instanceId, player) {
    (0, trigger_queue_1.onCardEntersExAreaTriggers)(state, instanceId, player);
}
function markOnCardPlayedTriggerUsed(state, trigger) {
    if (!trigger.abilityKey)
        return;
    const found = (0, queries_1.findInstance)(state, trigger.sourceInstanceId);
    if (!found)
        return;
    const { ability, abilityKey } = trigger;
    const trackOnce = trigger.timing === "onCardPlayed" ||
        trigger.timing === "onTokenLeaveField";
    if (ability.oncePerTurn && trackOnce && !found.card.abilitiesActivatedThisTurn.includes(abilityKey)) {
        found.card.abilitiesActivatedThisTurn.push(abilityKey);
    }
    if (ability.maxPerTurn != null) {
        found.card.counters[abilityKey] = (found.card.counters[abilityKey] ?? 0) + 1;
    }
}
function resolveOneTrigger(state, trigger) {
    let next = structuredClone(state);
    if (trigger.ability.condition && !(0, conditions_1.evalCondition)(next, trigger.controller, trigger.ability.condition)) {
        next.pendingTriggers = next.pendingTriggers.filter((t) => t.id !== trigger.id);
        return next;
    }
    const ppCost = trigger.ability.cost?.pp ?? 0;
    if (ppCost > 0) {
        const p = next.players[trigger.controller];
        if (p.pp < ppCost) {
            next.pendingTriggers = next.pendingTriggers.filter((t) => t.id !== trigger.id);
            return next;
        }
        p.pp -= ppCost;
    }
    next.pendingTriggers = next.pendingTriggers.filter((t) => t.id !== trigger.id);
    next.resolutionContext = {
        ...(0, effect_utils_1.contextForTriggerResolution)(next, trigger.sourceInstanceId, trigger.ability.effect),
        forcedTargetId: trigger.forcedTargetId,
        leftTokenCardNo: trigger.leftTokenCardNo,
    };
    next = (0, resolver_1.resolveEffect)(next, trigger.ability.effect, trigger.controller);
    markOnCardPlayedTriggerUsed(next, trigger);
    if ((0, effect_utils_1.shouldClearResolutionContext)(next)) {
        next.resolutionContext = null;
    }
    return next;
}
/** Resolve a trigger chosen via selectTrigger (shared with applyAction). */
function resolveChosenTrigger(state, trigger) {
    return resolveOneTrigger(state, trigger);
}
function runConfirmationTiming(state) {
    if (state.phase === "gameOver")
        return state;
    let next = structuredClone(state);
    let loop = true;
    while (loop) {
        loop = false;
        if (next.pendingChoices && next.pendingChoices.type !== "mulligan")
            return next;
        next = capPlayPoints(next);
        next = resolveBane(next);
        next = destroyAtZeroDef(next);
        next = enforceFieldLimits(next);
        next = checkLosses(next);
        if (next.phase === "gameOver")
            return next;
        if ((0, effect_utils_1.shouldDeferTriggers)(next))
            return next;
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
