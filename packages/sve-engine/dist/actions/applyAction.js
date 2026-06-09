"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyAction = applyAction;
exports.advanceCombatIfNeeded = advanceCombatIfNeeded;
const registry_1 = require("../cards/registry");
const resolver_1 = require("../effects/resolver");
const setup_1 = require("../phases/setup");
const confirmation_1 = require("../rules/confirmation");
const effect_utils_1 = require("../rules/effect-utils");
const trigger_queue_1 = require("../rules/trigger-queue");
const conditions_1 = require("../state/conditions");
const card_reset_1 = require("../state/card-reset");
const queries_1 = require("../state/queries");
const zones_1 = require("../state/zones");
function fail(state, error) {
    return { ok: false, state, error };
}
function hasPlayableQuickCards(state, player) {
    const pp = state.players[player].pp;
    for (const card of state.players[player].zones.hand) {
        const def = (0, registry_1.getCardDef)(card.cardNo);
        if (!def?.abilities?.some((a) => a.quick))
            continue;
        const cost = (0, queries_1.getEffectivePlayCost)(card, card.cardNo, state, player, "hand");
        if (pp >= cost && (0, resolver_1.canPlayCardFromZones)(state, player, card.cardNo))
            return true;
    }
    return false;
}
function proceedAfterEndMainQuick(state) {
    let next = structuredClone(state);
    const player = next.activePlayer;
    next.quickWindow = null;
    next.quickWindowPlayer = null;
    next.phase = "end";
    const wards = (0, queries_1.getPlayer)(next, player).zones.field.filter((c) => (0, queries_1.hasKeyword)(c, "ward", next) && !c.engaged);
    if (wards.length > 0) {
        next.pendingChoices = {
            type: "wardEngage",
            player,
            candidates: wards.map((w) => ({
                instanceId: w.instanceId,
                cardNo: (0, queries_1.resolveCardNo)(next, w),
                label: (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(next, w))?.name || w.cardNo,
            })),
        };
        return next;
    }
    return beginEndPhaseDiscard(next);
}
function continueEndPhaseFlow(state) {
    let next = structuredClone(state);
    if (next.pendingChoices || next.pendingTriggers.length > 0)
        return next;
    const player = next.activePlayer;
    const p = next.players[player];
    if (!p.flags.endStartAbilitiesQueued) {
        (0, trigger_queue_1.queueStartOfEndAbilities)(next, player);
        p.flags.endStartAbilitiesQueued = true;
        next = (0, confirmation_1.runConfirmationTiming)(next);
        if (next.pendingChoices || next.pendingTriggers.length > 0)
            return next;
    }
    if (!next.endPhaseQuickResolved) {
        const opp = (0, queries_1.opponentOf)(player);
        if (hasPlayableQuickCards(next, opp)) {
            next.quickWindow = "endPhase";
            next.quickWindowPlayer = opp;
            return next;
        }
        next.endPhaseQuickResolved = true;
    }
    return proceedAfterEndMainQuick(next);
}
function preserveResumeContext(next, sourceId, stack, tail) {
    const appended = next.resolutionContext?.resumeAfterChoice ?? [];
    next.resolutionContext = {
        sourceInstanceId: sourceId,
        effectStack: stack,
        resumeAfterChoice: appended.length > 0 ? appended : tail,
    };
    return next;
}
function continueAfterChoice(state, player) {
    if (state.pendingChoices)
        return state;
    let next = state;
    const sourceId = next.resolutionContext?.sourceInstanceId;
    const stack = next.resolutionContext?.effectStack ?? [];
    if (next.pendingTriggers.length > 0) {
        next = (0, confirmation_1.runConfirmationTiming)(next);
        if (next.pendingChoices || next.pendingTriggers.length > 0)
            return next;
    }
    while (next.resolutionContext?.resumeAfterChoice?.length) {
        const [head, ...tail] = next.resolutionContext.resumeAfterChoice;
        next.resolutionContext = {
            sourceInstanceId: sourceId,
            effectStack: stack,
            resumeAfterChoice: tail,
        };
        next = (0, resolver_1.resolveEffect)(next, head, player, { deferConfirmation: true });
        next = (0, confirmation_1.runConfirmationTiming)(next);
        if (next.pendingChoices || next.pendingTriggers.length > 0) {
            return preserveResumeContext(next, sourceId, stack, tail);
        }
    }
    if (!next.pendingChoices) {
        next.resolutionContext = null;
    }
    return next;
}
function finishEndPhase(state) {
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
                cardNo: (0, queries_1.resolveCardNo)(next, c),
                label: (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(next, c))?.name || c.cardNo,
            })),
        };
        return next;
    }
    return endTurn(next);
}
function maybeContinueEndPhase(state) {
    if (state.phase !== "end")
        return state;
    return continueEndPhaseFlow(state);
}
function finishChoiceResolution(state, player) {
    let next = state;
    if (!next.pendingChoices) {
        next = continueAfterChoice(next, player);
    }
    next = (0, confirmation_1.runConfirmationTiming)(next);
    if (next.phase === "end") {
        next = continueEndPhaseFlow(next);
    }
    else {
        next = maybeContinueEndPhase(next);
    }
    return next;
}
function sendSearchRemainder(state, player, instanceIds, remainderTo) {
    if (remainderTo === "deckBottom") {
        let next = structuredClone(state);
        const deck = next.players[player].zones.deck;
        for (const id of instanceIds) {
            const idx = deck.findIndex((c) => c.instanceId === id);
            if (idx < 0)
                continue;
            const [card] = deck.splice(idx, 1);
            deck.push(card);
        }
        return next;
    }
    return (0, resolver_1.buryDeckCards)(state, player, instanceIds);
}
function ok(state) {
    return { ok: true, state };
}
function assertActivePlayer(state, player, error) {
    if (state.activePlayer !== player)
        return fail(state, error);
    return null;
}
function assertPhase(state, phases, error) {
    if (!phases.includes(state.phase))
        return fail(state, error);
    return null;
}
function handleChoiceResponse(state, player, payload) {
    const choice = state.pendingChoices;
    if (!choice || choice.player !== player)
        return fail(state, "No pending choice");
    let next = structuredClone(state);
    next.pendingChoices = null;
    if (choice.type === "mulligan") {
        return ok((0, setup_1.applyMulligan)(next, player, Boolean(payload.redraw)));
    }
    if (choice.type === "selectTrigger") {
        const triggerId = String(payload.triggerId);
        const trigger = next.pendingTriggers.find((t) => t.id === triggerId);
        if (!trigger)
            return fail(state, "Invalid trigger");
        next.pendingTriggers = next.pendingTriggers.filter((t) => t.id !== triggerId);
        next.resolutionContext = (0, effect_utils_1.contextForTriggerResolution)(next, trigger.sourceInstanceId, trigger.ability.effect);
        next = (0, resolver_1.resolveEffect)(next, trigger.ability.effect, trigger.controller);
        if ((0, effect_utils_1.shouldClearResolutionContext)(next)) {
            next.resolutionContext = null;
        }
        next = finishChoiceResolution(next, player);
        next = maybeContinueEndPhase(next);
        return ok(next);
    }
    if (choice.type === "selectTarget") {
        const targetId = String(payload.targetId);
        const combatPaused = next.combat != null;
        const strikeIndex = next.combat?.strikeAbilityIndex;
        const resume = next.resolutionContext?.resumeAfterChoice;
        const sourceId = next.resolutionContext?.sourceInstanceId ?? next.combat?.attackerId;
        next.resolutionContext = {
            sourceInstanceId: sourceId,
            effectStack: [choice.effect],
            forcedTargetId: targetId,
            resumeAfterChoice: resume,
        };
        next = (0, resolver_1.resolveEffect)(next, choice.effect, player);
        next = finishChoiceResolution(next, player);
        if (combatPaused && next.combat && strikeIndex != null && !next.pendingChoices) {
            next.phase = "combat";
            next.combat = { ...next.combat, strikeAbilityIndex: strikeIndex + 1 };
            next = resolveCombat(next);
        }
        return ok(next);
    }
    if (choice.type === "selectZoneCards") {
        const ids = payload.instanceIds || [];
        if (ids.length !== choice.count) {
            return fail(state, `Must select exactly ${choice.count} card(s)`);
        }
        for (const id of ids) {
            if (choice.fromZone === "field" && choice.action === "bury") {
                const buried = (0, queries_1.findInstance)(next, id);
                if (!buried || buried.zone !== "field")
                    return fail(state, "Invalid card");
                (0, trigger_queue_1.queueLastWords)(next, id, buried.player);
                next = (0, zones_1.destroyFollower)(next, id);
                continue;
            }
            const zone = next.players[player].zones[choice.fromZone];
            const idx = zone.findIndex((c) => c.instanceId === id);
            if (idx < 0)
                return fail(state, "Invalid card");
            const [card] = zone.splice(idx, 1);
            if (choice.action === "banish") {
                (0, card_reset_1.resetCardInstanceState)(card);
                next.players[player].zones.banish.push(card);
            }
            else {
                next.players[player].zones.cemetery.push(card);
            }
        }
        if (choice.resumeActivate) {
            const { sourceInstanceId, zone: activateZone, abilityKey } = choice.resumeActivate;
            if (choice.fromZone === "exArea" && choice.action === "banish") {
                const ex = next.players[player].zones.exArea;
                const srcIdx = ex.findIndex((c) => c.instanceId === sourceInstanceId);
                if (srcIdx >= 0) {
                    const [self] = ex.splice(srcIdx, 1);
                    (0, card_reset_1.resetCardInstanceState)(self);
                    next.players[player].zones.banish.push(self);
                }
            }
            next = finishActivateAfterCost(next, player, sourceInstanceId, activateZone, abilityKey);
            return ok(finishChoiceResolution(next, player));
        }
        return ok(finishChoiceResolution(next, player));
    }
    if (choice.type === "selectCemeterySummon") {
        const ids = payload.instanceIds || [];
        if (ids.length === 0 || ids.length > choice.count) {
            return fail(state, `Select up to ${choice.count} card(s)`);
        }
        let totalCost = 0;
        const p = next.players[player];
        for (const id of ids) {
            const card = p.zones.cemetery.find((c) => c.instanceId === id);
            if (!card || !(0, conditions_1.cardMatchesFilter)(card.cardNo, choice.filter)) {
                return fail(state, "Invalid card");
            }
            totalCost += (0, queries_1.resolveCardDefCost)(card.cardNo);
        }
        if (totalCost > choice.maxTotalCost) {
            return fail(state, `Total cost must be ${choice.maxTotalCost} or less`);
        }
        const slots = p.fieldLimit - p.zones.field.length;
        if (ids.length > slots)
            return fail(state, "Not enough field space");
        for (const id of ids) {
            const idx = p.zones.cemetery.findIndex((c) => c.instanceId === id);
            if (idx < 0)
                continue;
            const [card] = p.zones.cemetery.splice(idx, 1);
            p.zones.field.push(card);
            (0, confirmation_1.onFollowerEntersField)(next, card.instanceId, player);
        }
        return ok(finishChoiceResolution(next, player));
    }
    if (choice.type === "putHandOnDeck") {
        if (choice.phase === "selectCard") {
            const instanceId = String(payload.instanceId);
            const found = (0, queries_1.findInstance)(next, instanceId);
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
        if (!choice.selectedInstanceId)
            return fail(state, "No card selected");
        next = putHandCardOnDeck(next, player, choice.selectedInstanceId, position);
        return ok(finishChoiceResolution(next, player));
    }
    if (choice.type === "selectZoneCard") {
        if (payload.skip && choice.optional) {
            return ok(finishChoiceResolution(next, player));
        }
        const instanceId = String(payload.instanceId);
        const found = (0, queries_1.findInstance)(next, instanceId);
        if (!found || found.zone !== choice.fromZone || found.player !== player) {
            return fail(state, "Invalid card");
        }
        next = (0, resolver_1.moveZoneCardTo)(next, player, instanceId, choice.fromZone, choice.to);
        if (choice.to === "exArea" && choice.playCostReduction) {
            const moved = (0, queries_1.findInstance)(next, instanceId);
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
        if (!option?.eligible)
            return fail(state, "Card does not match filter");
        next = (0, resolver_1.moveZoneCardTo)(next, player, instanceId, "deck", choice.to);
        if (choice.to === "exArea" && choice.playCostReduction) {
            const moved = (0, queries_1.findInstance)(next, instanceId);
            if (moved) {
                moved.card.playCostReduction += choice.playCostReduction;
            }
        }
        const remaining = choice.topInstanceIds.filter((id) => id !== instanceId);
        next = sendSearchRemainder(next, player, remaining, remainderTo);
        return ok(finishChoiceResolution(next, player));
    }
    if (choice.type === "discard") {
        const ids = payload.instanceIds || [];
        if (ids.length !== choice.count) {
            return fail(state, `Must discard exactly ${choice.count} card(s)`);
        }
        const handIds = new Set(next.players[player].zones.hand.map((c) => c.instanceId));
        for (const id of ids) {
            if (!handIds.has(id))
                return fail(state, "Card not in hand");
            next = (0, zones_1.moveCard)(next, id, "cemetery", player);
        }
        return ok(beginEndPhaseDiscard(next));
    }
    if (choice.type === "wardEngage") {
        const ids = payload.instanceIds || [];
        for (const id of ids) {
            const found = (0, queries_1.findInstance)(next, id);
            if (found)
                found.card.engaged = true;
        }
        return ok(beginEndPhaseDiscard(next));
    }
    if (choice.type === "choose") {
        const index = Number(payload.optionIndex);
        const opt = choice.options.find((o) => o.index === index);
        if (!opt)
            return fail(state, "Invalid choice");
        if (opt.additionalPpCost) {
            if (next.players[player].pp < opt.additionalPpCost) {
                return fail(state, "Not enough PP");
            }
            next.players[player].pp -= opt.additionalPpCost;
        }
        next = (0, resolver_1.resolveEffect)(next, opt.effect, player);
        return ok(finishChoiceResolution(next, player));
    }
    if (choice.type === "chooseMultiple") {
        const indices = payload.optionIndices || [];
        if (indices.length < choice.min || indices.length > choice.max) {
            return fail(state, `Choose between ${choice.min} and ${choice.max} option(s)`);
        }
        const unique = new Set(indices);
        if (unique.size !== indices.length)
            return fail(state, "Duplicate options");
        const effects = indices.flatMap((index) => {
            const opt = choice.options.find((o) => o.index === index);
            if (!opt)
                return [];
            if (opt.effect.op === "sequence")
                return opt.effect.steps;
            return [opt.effect];
        });
        next.resolutionContext = {
            sourceInstanceId: next.resolutionContext?.sourceInstanceId,
            effectStack: [],
            resumeAfterChoice: effects,
        };
        return ok(finishChoiceResolution(next, player));
    }
    return ok(next);
}
function putHandCardOnDeck(state, player, instanceId, position) {
    const next = structuredClone(state);
    const hand = next.players[player].zones.hand;
    const idx = hand.findIndex((c) => c.instanceId === instanceId);
    if (idx < 0)
        return state;
    const [card] = hand.splice(idx, 1);
    if (position === "top")
        next.players[player].zones.deck.unshift(card);
    else
        next.players[player].zones.deck.push(card);
    return next;
}
function beginEndPhaseDiscard(state) {
    return finishEndPhase(structuredClone(state));
}
function endTurn(state) {
    let next = structuredClone(state);
    const player = next.activePlayer;
    for (const p of next.players) {
        p.flags.endStartAbilitiesQueued = false;
        for (const cards of [p.zones.field, p.zones.hand, p.zones.exArea, p.zones.cemetery]) {
            for (const card of cards) {
                card.modifiers = card.modifiers.filter((m) => !m.untilEndOfTurn);
                card.playCostReduction = 0;
                card.abilitiesActivatedThisTurn = [];
            }
        }
    }
    next.activePlayer = (0, queries_1.opponentOf)(player);
    next.turnNumber += 1;
    next.phase = "start";
    next.combat = null;
    next.quickWindow = null;
    next.endPhaseQuickResolved = undefined;
    next = (0, setup_1.beginStartPhase)(next);
    next = (0, confirmation_1.runConfirmationTiming)(next);
    return next;
}
function playCard(state, player, handInstanceId, targets, fromQuickWindow = false) {
    const inQuickWindow = state.quickWindow !== null;
    if (inQuickWindow) {
        if (state.quickWindowPlayer !== player)
            return fail(state, "Not your quick window");
        if (!fromQuickWindow)
            return fail(state, "Use quick play during quick window");
    }
    else {
        const phaseErr = assertPhase(state, ["main"], "Cannot play card now");
        if (phaseErr)
            return phaseErr;
        const activeErr = assertActivePlayer(state, player, "Not your turn");
        if (activeErr)
            return activeErr;
    }
    const found = (0, queries_1.findInstance)(state, handInstanceId);
    if (!found || found.player !== player) {
        return fail(state, "Card not found");
    }
    if (found.zone !== "hand" && found.zone !== "exArea") {
        return fail(state, "Card not in hand or EX area");
    }
    const def = (0, registry_1.getCardDef)(found.card.cardNo);
    if (!def)
        return fail(state, "Unknown card");
    if (inQuickWindow && !def.abilities?.some((a) => a.quick)) {
        return fail(state, "Not a quick card");
    }
    if (def.cardType === "spell" && !(0, resolver_1.canPlayCardFromZones)(state, player, found.card.cardNo)) {
        return fail(state, "No valid targets");
    }
    let next = structuredClone(state);
    const p = next.players[player];
    const playCost = (0, queries_1.getEffectivePlayCost)(found.card, found.card.cardNo, state, player, found.zone);
    if (p.pp < playCost)
        return fail(state, "Not enough PP");
    p.pp -= playCost;
    p.flags.cardsPlayedThisTurn += 1;
    if (p.zones.field.length >= p.fieldLimit && def.cardType !== "spell") {
        return fail(state, "Field full");
    }
    next = (0, zones_1.moveCard)(next, handInstanceId, "resolutionZone", player);
    const inResolution = (0, queries_1.findInstance)(next, handInstanceId);
    if (inResolution && def.cardType !== "spell") {
        inResolution.card.enteredFromHand = found.zone === "hand";
    }
    if (def.cardType === "spell") {
        next = (0, resolver_1.resolveSpell)(next, found.card.cardNo, player);
        const res = (0, queries_1.findInstance)(next, handInstanceId);
        if (res) {
            next = (0, zones_1.moveCard)(next, handInstanceId, "cemetery", player);
        }
    }
    else if (def.cardType === "follower" || def.cardType === "amulet") {
        next = (0, zones_1.moveCard)(next, handInstanceId, "field", player);
    }
    next = (0, confirmation_1.runConfirmationTiming)(next);
    return ok(next);
}
function attack(state, player, attackerId, targetId) {
    const activeErr = assertActivePlayer(state, player, "Not your turn");
    if (activeErr)
        return activeErr;
    const phaseErr = assertPhase(state, ["main"], "Cannot attack now");
    if (phaseErr)
        return phaseErr;
    const attackerFound = (0, queries_1.findInstance)(state, attackerId);
    if (!attackerFound || attackerFound.zone !== "field" || attackerFound.player !== player) {
        return fail(state, "Invalid attacker");
    }
    const attacker = attackerFound.card;
    if (attacker.engaged)
        return fail(state, "Follower is engaged and cannot attack");
    const canAttack = attacker.onFieldSinceTurnStart ||
        attacker.evolvedThisTurn ||
        (0, queries_1.hasKeyword)(attacker, "storm", state) ||
        (0, queries_1.hasKeyword)(attacker, "rush", state);
    if (!canAttack)
        return fail(state, "Follower cannot attack");
    const legal = (0, queries_1.getLegalAttackTargets)(state, attacker, player);
    const isLegal = targetId === "leader"
        ? legal.some((t) => t.type === "leader")
        : legal.some((t) => t.type === "follower" && t.instanceId === targetId);
    if (!isLegal)
        return fail(state, "Illegal attack target");
    let next = structuredClone(state);
    const attackerOnNext = (0, queries_1.findInstance)(next, attackerId);
    if (!attackerOnNext)
        return fail(state, "Invalid attacker");
    attackerOnNext.card.engaged = true;
    next.combat = {
        attackerId,
        targetId,
        targetPlayer: (0, queries_1.opponentOf)(player),
        phase: "declared",
    };
    next.phase = "combat";
    next.eventLog.push({ type: "attack", player, data: { attackerId, targetId } });
    next = resolveCombat(next);
    return ok(next);
}
function resolveCombatDamage(state) {
    if (!state.combat)
        return state;
    let next = structuredClone(state);
    const combat = next.combat;
    const attackerFound = (0, queries_1.findInstance)(next, combat.attackerId);
    if (!attackerFound) {
        next.combat = null;
        next.phase = "main";
        next.quickWindow = null;
        next.quickWindowPlayer = null;
        return next;
    }
    const { atk: attackerAtk } = (0, queries_1.getEffectiveStats)(attackerFound.card, next);
    if (combat.targetId === "leader") {
        next.players[combat.targetPlayer].leaderDef -= attackerAtk;
        if ((0, queries_1.hasKeyword)(attackerFound.card, "drain", next)) {
            next.players[attackerFound.player].leaderDef += attackerAtk;
        }
    }
    else {
        const targetFound = (0, queries_1.findInstance)(next, combat.targetId);
        if (targetFound && targetFound.zone === "field") {
            const targetDef = (0, queries_1.getEffectiveStats)(targetFound.card, next).def;
            if (targetDef > 0) {
                const { atk: targetAtk } = (0, queries_1.getEffectiveStats)(targetFound.card, next);
                const dmgToTarget = (0, queries_1.clampDamageToFollower)(next, targetFound.card, targetFound.player, attackerAtk);
                targetFound.card.modifiers.push({ def: -dmgToTarget, sourceId: combat.attackerId });
                attackerFound.card.modifiers.push({ def: -targetAtk, sourceId: combat.targetId });
                if ((0, queries_1.hasKeyword)(attackerFound.card, "drain", next)) {
                    next.players[attackerFound.player].leaderDef += attackerAtk;
                }
                if ((0, queries_1.hasKeyword)(attackerFound.card, "bane", next, attackerFound.player) ||
                    (0, queries_1.hasKeyword)(targetFound.card, "bane", next, targetFound.player)) {
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
    return (0, confirmation_1.runConfirmationTiming)(next);
}
function resolveCombat(state) {
    if (!state.combat)
        return state;
    let next = structuredClone(state);
    const combat = next.combat;
    if (combat.phase === "quickWindow") {
        return next;
    }
    if (combat.phase === "damage") {
        return resolveCombatDamage(next);
    }
    const attackerFound = (0, queries_1.findInstance)(next, combat.attackerId);
    if (!attackerFound) {
        next.combat = null;
        next.phase = "main";
        next.quickWindow = null;
        next.quickWindowPlayer = null;
        return next;
    }
    // Strike resolves before quick window and combat damage (Comprehensive Rules §11).
    const strikeAbilities = (0, queries_1.getStrikeAbilities)(next, attackerFound.card);
    const strikeStart = combat.strikeAbilityIndex ?? 0;
    for (let i = strikeStart; i < strikeAbilities.length; i++) {
        next.resolutionContext = { sourceInstanceId: combat.attackerId, effectStack: [strikeAbilities[i].effect] };
        next = (0, resolver_1.resolveEffect)(next, strikeAbilities[i].effect, attackerFound.player);
        next = (0, confirmation_1.runConfirmationTiming)(next);
        if (next.pendingChoices ||
            next.pendingTriggers.length > 0 ||
            (next.resolutionContext?.resumeAfterChoice?.length ?? 0) > 0) {
            next.combat = { ...combat, strikeAbilityIndex: i };
            next.phase = "main";
            next.quickWindow = null;
            next.quickWindowPlayer = null;
            return next;
        }
        next.resolutionContext = null;
    }
    const attackerAfterStrike = (0, queries_1.findInstance)(next, combat.attackerId);
    if (!attackerAfterStrike) {
        next.combat = null;
        next.phase = "main";
        next.quickWindow = null;
        next.quickWindowPlayer = null;
        return next;
    }
    const defender = (0, queries_1.opponentOf)(attackerFound.player);
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
function evolve(state, player, fieldInstanceId, evolveDeckInstanceId, useSuperEvo, useEvoPoint) {
    const activeErr = assertActivePlayer(state, player, "Not your turn");
    if (activeErr)
        return activeErr;
    const fieldFound = (0, queries_1.findInstance)(state, fieldInstanceId);
    if (!fieldFound || fieldFound.zone !== "field")
        return fail(state, "Invalid field card");
    if (fieldFound.card.linkedEvoInstanceId)
        return fail(state, "Already evolved");
    const evoCard = (evolveDeckInstanceId
        ? (0, queries_1.findInstance)(state, evolveDeckInstanceId)?.card
        : null) ?? (0, queries_1.findMatchingEvolveCard)(state, player, fieldInstanceId);
    if (!evoCard)
        return fail(state, "Invalid evolve card");
    const evoFound = (0, queries_1.findInstance)(state, evoCard.instanceId);
    if (!evoFound || evoFound.zone !== "evolveDeck")
        return fail(state, "Invalid evolve card");
    const evolveDeckInstanceIdResolved = evoCard.instanceId;
    const baseDef = (0, registry_1.getCardDef)(fieldFound.card.cardNo);
    const evoDef = (0, registry_1.getCardDef)(evoFound.card.cardNo);
    if (!baseDef?.evolvesTo && baseDef?.cardNo !== evoDef?.evolvesFrom) {
        if (evoDef?.evolvesFrom !== baseDef?.cardNo)
            return fail(state, "Cards do not match");
    }
    const cost = (0, queries_1.getEvolveCost)(evoFound.card.cardNo, fieldFound.card.cardNo);
    let next = structuredClone(state);
    const p = next.players[player];
    const payment = (0, queries_1.computeEvolvePayment)(cost, p.pp, p.evoPoints, Boolean(useEvoPoint));
    if (!payment.ok)
        return fail(state, "Cannot pay evolve cost");
    p.evoPoints -= payment.epCost;
    p.pp -= payment.ppCost;
    next = (0, zones_1.moveCard)(next, evolveDeckInstanceIdResolved, "resolutionZone", player);
    const fieldOnNext = (0, queries_1.findInstance)(next, fieldInstanceId);
    if (!fieldOnNext || fieldOnNext.zone !== "field")
        return fail(state, "Invalid field card");
    fieldOnNext.card.linkedEvoInstanceId = evolveDeckInstanceIdResolved;
    fieldOnNext.card.evolvedThisTurn = true;
    fieldOnNext.card.onFieldSinceTurnStart = false;
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
    const onEvolveAbs = evoDef?.abilities?.filter((a) => a.timing === "onEvolve") ?? [];
    const onSEAbs = fieldOnNext.card.superEvolved
        ? (evoDef?.abilities?.filter((a) => a.timing === "onSuperEvolve") ?? [])
        : [];
    if (fieldOnNext.card.superEvolved && onEvolveAbs.length > 0 && onSEAbs.length > 0) {
        next.pendingChoices = (0, effect_utils_1.withChoiceContext)(next, {
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
        next = (0, confirmation_1.runConfirmationTiming)(next);
        return ok(next);
    }
    const evolveEffects = [
        ...onEvolveAbs.map((a) => a.effect),
        ...onSEAbs.map((a) => a.effect),
    ];
    for (let i = 0; i < evolveEffects.length; i++) {
        next.resolutionContext = (0, effect_utils_1.contextForTriggerResolution)(next, fieldInstanceId, evolveEffects[i]);
        next = (0, resolver_1.resolveEffect)(next, evolveEffects[i], player);
        if ((0, effect_utils_1.shouldClearResolutionContext)(next)) {
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
    next = (0, confirmation_1.runConfirmationTiming)(next);
    return ok(next);
}
function finishActivateAfterCost(state, player, sourceInstanceId, zone, abilityKey) {
    let next = structuredClone(state);
    const sourceOnNext = (0, queries_1.findInstance)(next, sourceInstanceId);
    const def = sourceOnNext ? (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(next, sourceOnNext.card)) : undefined;
    const ability = def?.abilities
        ?.map((a, idx) => ({ ability: a, key: `activated:${idx}` }))
        .find((entry) => entry.key === abilityKey)?.ability;
    if (!ability)
        return state;
    if (sourceOnNext) {
        if (zone === "field" && ability.cost?.engage) {
            sourceOnNext.card.engaged = true;
        }
        if (ability.oncePerTurn && !sourceOnNext.card.abilitiesActivatedThisTurn.includes(abilityKey)) {
            sourceOnNext.card.abilitiesActivatedThisTurn.push(abilityKey);
        }
    }
    next.resolutionContext = {
        sourceInstanceId,
        effectStack: [ability.effect],
    };
    next = (0, resolver_1.resolveEffect)(next, ability.effect, player);
    if ((0, effect_utils_1.shouldClearResolutionContext)(next)) {
        next.resolutionContext = null;
    }
    return next;
}
function resolveActivate(state, player, sourceInstanceId, zone, useEvoPoint) {
    const found = (0, queries_1.findInstance)(state, sourceInstanceId);
    if (!found || found.zone !== zone || found.player !== player) {
        return fail(state, "Invalid card");
    }
    if (zone === "field" && found.card.engaged) {
        return fail(state, "Follower is engaged and cannot activate");
    }
    const activated = (0, queries_1.getActivatedAbilities)(state, found.card, player, zone);
    if (activated.length === 0)
        return fail(state, "No activated ability");
    let next = structuredClone(state);
    const p = next.players[player];
    const { ability, key } = activated[0];
    const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(next, found.card));
    const advance = (0, effect_utils_1.isAdvanceAbility)(def, ability);
    if (advance && p.flags.evolvedThisTurn) {
        return fail(state, "Already evolved or advanced this turn");
    }
    if (advance && !(0, effect_utils_1.canAdvanceActivate)(next, player, ability.effect)) {
        return fail(state, "Advance conditions not met");
    }
    const activateCost = ability.cost?.pp ?? 0;
    const payment = (0, queries_1.computeEvolvePayment)(activateCost, p.pp, p.evoPoints, Boolean(useEvoPoint));
    if (!payment.ok)
        return fail(state, "Cannot pay activate cost");
    p.evoPoints -= payment.epCost;
    p.pp -= payment.ppCost;
    if (advance) {
        p.flags.evolvedThisTurn = true;
    }
    if (ability.cost?.banishFromCemetery) {
        const filter = ability.cost.banishFromCemetery;
        const count = ability.cost.banishCount ?? 1;
        const matches = p.zones.cemetery.filter((c) => (0, conditions_1.cardMatchesFilter)(c.cardNo, filter));
        if (matches.length < count)
            return fail(state, "Cannot pay activate cost");
        if (matches.length >= count) {
            next.pendingChoices = {
                type: "selectZoneCards",
                player,
                fromZone: "cemetery",
                count,
                action: "banish",
                options: matches.map((c) => ({
                    instanceId: c.instanceId,
                    cardNo: c.cardNo,
                    label: (0, registry_1.getCardDef)(c.cardNo)?.name || c.cardNo,
                })),
                resumeActivate: { sourceInstanceId, zone, abilityKey: key },
            };
            return ok(next);
        }
        for (let i = 0; i < count; i++) {
            const idx = p.zones.cemetery.findIndex((c) => (0, conditions_1.cardMatchesFilter)(c.cardNo, filter));
            if (idx < 0)
                return fail(state, "Cannot pay activate cost");
            const [card] = p.zones.cemetery.splice(idx, 1);
            (0, card_reset_1.resetCardInstanceState)(card);
            p.zones.banish.push(card);
        }
    }
    if (ability.cost?.banishFromExArea) {
        const filter = ability.cost.banishFromExArea;
        const total = ability.cost.banishCount ?? 1;
        const matches = p.zones.exArea.filter((c) => (0, conditions_1.cardMatchesFilter)(c.cardNo, filter));
        if (matches.length < total)
            return fail(state, "Cannot pay activate cost");
        const othersNeeded = total - 1;
        const others = matches.filter((c) => c.instanceId !== sourceInstanceId);
        if (othersNeeded > 0 && others.length > othersNeeded) {
            next.pendingChoices = {
                type: "selectZoneCards",
                player,
                fromZone: "exArea",
                count: othersNeeded,
                action: "banish",
                options: others.map((c) => ({
                    instanceId: c.instanceId,
                    cardNo: c.cardNo,
                    label: (0, registry_1.getCardDef)(c.cardNo)?.name || c.cardNo,
                })),
                resumeActivate: { sourceInstanceId, zone, abilityKey: key },
            };
            return ok(next);
        }
        const toBanish = [
            sourceInstanceId,
            ...others.slice(0, othersNeeded).map((c) => c.instanceId),
        ];
        for (const id of toBanish) {
            const idx = p.zones.exArea.findIndex((c) => c.instanceId === id);
            if (idx < 0)
                return fail(state, "Cannot pay activate cost");
            const [card] = p.zones.exArea.splice(idx, 1);
            (0, card_reset_1.resetCardInstanceState)(card);
            p.zones.banish.push(card);
        }
    }
    if (ability.cost?.buryFromField) {
        const filter = ability.cost.buryFromField;
        const count = ability.cost.buryFieldCount ?? 1;
        const matches = p.zones.field.filter((c) => (0, conditions_1.cardMatchesFilter)(c.cardNo, filter));
        if (matches.length < count)
            return fail(state, "Cannot pay activate cost");
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
                    label: (0, registry_1.getCardDef)(c.cardNo)?.name || c.cardNo,
                })),
                resumeActivate: { sourceInstanceId, zone, abilityKey: key },
            };
            return ok(next);
        }
        if (ability.cost?.engage) {
            const src = (0, queries_1.findInstance)(next, sourceInstanceId);
            if (src)
                src.card.engaged = true;
        }
        for (const card of matches) {
            (0, trigger_queue_1.queueLastWords)(next, card.instanceId, player);
            next = (0, zones_1.destroyFollower)(next, card.instanceId);
        }
    }
    next = finishActivateAfterCost(next, player, sourceInstanceId, zone, key);
    next = (0, confirmation_1.runConfirmationTiming)(next);
    return ok(next);
}
function applyAction(state, player, action) {
    if (state.phase === "gameOver")
        return fail(state, "Game is over");
    if (state.pendingChoices &&
        action.type !== "CHOICE_RESPONSE" &&
        action.type !== "MULLIGAN") {
        return fail(state, "Must resolve pending choice first");
    }
    switch (action.type) {
        case "MULLIGAN":
            if (state.phase !== "mulligan")
                return fail(state, "Not mulligan phase");
            return ok((0, setup_1.applyMulligan)(state, player, action.redraw));
        case "CHOICE_RESPONSE":
            return handleChoiceResponse(state, player, action.payload);
        case "PLAY_CARD":
            return playCard(state, player, action.handInstanceId, action.targets);
        case "QUICK_PLAY":
            if (state.quickWindow === null)
                return fail(state, "No quick window");
            return playCard(state, player, action.handInstanceId, action.targets, true);
        case "PASS_QUICK_WINDOW": {
            if (state.quickWindow === null)
                return fail(state, "No quick window");
            if (state.quickWindowPlayer !== player)
                return fail(state, "Not your quick window");
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
                next = continueEndPhaseFlow(next);
                return ok(next);
            }
            return fail(state, "Unknown quick window");
        }
        case "ATTACK":
            return attack(state, player, action.attackerId, action.targetId);
        case "EVOLVE":
            return evolve(state, player, action.fieldInstanceId, action.evolveDeckInstanceId, action.useSuperEvo, action.useEvoPoint);
        case "END_MAIN": {
            const activeErr = assertActivePlayer(state, player, "Not your turn");
            if (activeErr)
                return activeErr;
            if (state.quickWindow === "endPhase") {
                return fail(state, "Opponent must resolve quick window first");
            }
            if (state.combat?.phase === "quickWindow") {
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
            if (activeErr)
                return activeErr;
            const phaseErr = assertPhase(state, ["main"], "Cannot activate now");
            if (phaseErr)
                return phaseErr;
            return resolveActivate(state, player, action.fieldInstanceId, "field", action.useEvoPoint);
        }
        case "ACTIVATE_CEMETERY": {
            const activeErr = assertActivePlayer(state, player, "Not your turn");
            if (activeErr)
                return activeErr;
            const phaseErr = assertPhase(state, ["main"], "Cannot activate now");
            if (phaseErr)
                return phaseErr;
            return resolveActivate(state, player, action.cemeteryInstanceId, "cemetery");
        }
        case "ACTIVATE_EXAREA": {
            const activeErr = assertActivePlayer(state, player, "Not your turn");
            if (activeErr)
                return activeErr;
            const phaseErr = assertPhase(state, ["main"], "Cannot activate now");
            if (phaseErr)
                return phaseErr;
            return resolveActivate(state, player, action.exAreaInstanceId, "exArea");
        }
        case "CONCEDE": {
            const next = structuredClone(state);
            next.winner = (0, queries_1.opponentOf)(player);
            next.phase = "gameOver";
            return ok(next);
        }
        default:
            return fail(state, "Unknown action");
    }
}
function advanceCombatIfNeeded(state) {
    return state;
}
