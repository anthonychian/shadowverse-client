"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueOnCardPlayed = queueOnCardPlayed;
exports.queueLastWords = queueLastWords;
exports.queueFanfare = queueFanfare;
exports.queueStartOfMainAbilities = queueStartOfMainAbilities;
exports.queueStartOfOpponentEndAbilities = queueStartOfOpponentEndAbilities;
exports.queueOnBecomeEngaged = queueOnBecomeEngaged;
exports.queueOnDiscardTriggers = queueOnDiscardTriggers;
exports.queueOnEnemyFollowerLeaveField = queueOnEnemyFollowerLeaveField;
exports.queueOnTokenLeaveField = queueOnTokenLeaveField;
exports.queueStartOfEndAbilities = queueStartOfEndAbilities;
exports.queueAllyFollowerEnterTriggers = queueAllyFollowerEnterTriggers;
exports.queueCemeteryOnAllyFollowerEnter = queueCemeteryOnAllyFollowerEnter;
exports.onCardEntersExAreaTriggers = onCardEntersExAreaTriggers;
exports.queueOnLeaveField = queueOnLeaveField;
exports.queueOnDamagedAbilities = queueOnDamagedAbilities;
exports.queueOnAbilityDamaged = queueOnAbilityDamaged;
exports.queueOnAllyEvolveTriggers = queueOnAllyEvolveTriggers;
const registry_1 = require("../cards/registry");
const trigger_labels_1 = require("./trigger-labels");
const conditions_1 = require("../state/conditions");
const passives_1 = require("../state/passives");
const queries_1 = require("../state/queries");
const passives_2 = require("../state/passives");
function pushTrigger(state, instanceId, player, cardNo, ability, timing, idPrefix, abilityKey, forcedTargetId, leftTokenCardNo) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (found?.card.abilitiesSilenced)
        return;
    state.pendingTriggers.push({
        id: `${idPrefix}_${instanceId}_${state.pendingTriggers.length}`,
        controller: player,
        sourceInstanceId: instanceId,
        ability,
        timing,
        label: ability.label ?? (0, trigger_labels_1.describeAbility)(cardNo, ability),
        abilityKey,
        forcedTargetId,
        leftTokenCardNo,
    });
}
function canFireOnCardPlayedTrigger(fieldCard, key, opts) {
    if (opts.oncePerTurn && fieldCard.abilitiesActivatedThisTurn.includes(key))
        return false;
    if (opts.maxPerTurn != null && (fieldCard.counters[key] ?? 0) >= opts.maxPerTurn)
        return false;
    return true;
}
function queueOnCardPlayed(state, playedInstanceId, player) {
    const played = (0, queries_1.findInstance)(state, playedInstanceId);
    if (!played)
        return;
    const playedNo = (0, queries_1.resolveCardNo)(state, played.card);
    for (const fieldCard of (0, queries_1.getPlayer)(state, player).zones.field) {
        if ((0, passives_1.isBoxed)(fieldCard, state))
            continue;
        const cardNo = (0, queries_1.resolveCardNo)(state, fieldCard);
        const def = (0, registry_1.getCardDef)(cardNo);
        for (const [idx, ability] of (def?.abilities ?? []).entries()) {
            if (ability.timing === "onCardPlayed") {
                if (ability.filter && !(0, conditions_1.cardMatchesFilter)(playedNo, ability.filter))
                    continue;
                const key = `onCardPlayed:${idx}`;
                if (!canFireOnCardPlayedTrigger(fieldCard, key, ability))
                    continue;
                pushTrigger(state, fieldCard.instanceId, player, cardNo, ability, "onCardPlayed", "ocp", key);
                continue;
            }
            if (ability.timing === "passive" && ability.effect.op === "grantOnCardPlayed") {
                const grant = ability.effect;
                if (grant.filter && !(0, conditions_1.cardMatchesFilter)(playedNo, grant.filter))
                    continue;
                const key = `passiveGrantOnCardPlayed:${idx}`;
                if (!canFireOnCardPlayedTrigger(fieldCard, key, grant))
                    continue;
                if (ability.condition && !(0, conditions_1.evalCondition)(state, player, ability.condition))
                    continue;
                pushTrigger(state, fieldCard.instanceId, player, cardNo, {
                    timing: "onCardPlayed",
                    effect: grant.effect,
                    label: grant.label,
                    oncePerTurn: grant.oncePerTurn,
                    maxPerTurn: grant.maxPerTurn,
                }, "onCardPlayed", "pgocp", key);
            }
        }
        for (const [gIdx, granted] of (fieldCard.grantedOnCardPlayed ?? []).entries()) {
            if (granted.filter && !(0, conditions_1.cardMatchesFilter)(playedNo, granted.filter))
                continue;
            const key = `grantedOnCardPlayed:${gIdx}`;
            if (!canFireOnCardPlayedTrigger(fieldCard, key, granted))
                continue;
            const pseudoAbility = {
                timing: "onCardPlayed",
                effect: granted.effect,
                label: granted.label,
                oncePerTurn: granted.oncePerTurn,
                maxPerTurn: granted.maxPerTurn,
            };
            pushTrigger(state, fieldCard.instanceId, player, cardNo, pseudoAbility, "onCardPlayed", "gocp", key);
        }
    }
}
function queueLastWords(state, instanceId, player) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found)
        return;
    if ((0, passives_1.isBoxed)(found.card, state))
        return;
    const cardNo = found.card.cardNo;
    const def = (0, registry_1.getCardDef)(cardNo);
    for (const ability of def?.abilities ?? []) {
        if (ability.timing === "lastWords") {
            pushTrigger(state, instanceId, player, cardNo, ability, "lastWords", "lw");
        }
    }
    for (const effect of found.card.grantedLastWords ?? []) {
        pushTrigger(state, instanceId, player, cardNo, {
            timing: "lastWords",
            effect,
            label: `${(0, registry_1.getCardDef)(cardNo)?.name ?? cardNo} — Last Words: banish this card`,
        }, "lastWords", "glw");
    }
}
function queueFanfare(state, instanceId, player) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found || (0, passives_1.isBoxed)(found.card, state))
        return;
    const def = (0, registry_1.getCardDef)(found.card.cardNo);
    for (const ability of def?.abilities ?? []) {
        if (ability.timing === "fanfare") {
            pushTrigger(state, instanceId, player, found.card.cardNo, ability, "fanfare", "ff");
        }
    }
}
function queueStartOfMainAbilities(state, player) {
    for (const card of [...(0, queries_1.getPlayer)(state, player).zones.field]) {
        if ((0, passives_1.isBoxed)(card, state))
            continue;
        const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, card));
        for (const ability of def?.abilities ?? []) {
            if (ability.timing !== "startOfMain")
                continue;
            pushTrigger(state, card.instanceId, player, card.cardNo, ability, "startOfMain", "som");
        }
    }
}
function queueStartOfOpponentEndAbilities(state, endingPlayer) {
    for (const pid of [0, 1]) {
        if (pid === endingPlayer)
            continue;
        for (const card of [...(0, queries_1.getPlayer)(state, pid).zones.field]) {
            if ((0, passives_1.isBoxed)(card, state))
                continue;
            const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, card));
            for (const ability of def?.abilities ?? []) {
                if (ability.timing !== "startOfOpponentEnd")
                    continue;
                pushTrigger(state, card.instanceId, pid, card.cardNo, ability, "startOfOpponentEnd", "sooe");
            }
        }
    }
}
function queueOnBecomeEngaged(state, instanceId, player) {
    const engaged = (0, queries_1.findInstance)(state, instanceId);
    if (!engaged || engaged.zone !== "field")
        return;
    for (const fieldCard of (0, queries_1.getPlayer)(state, player).zones.field) {
        if (fieldCard.instanceId !== instanceId || (0, passives_1.isBoxed)(fieldCard, state))
            continue;
        const cardNo = (0, queries_1.resolveCardNo)(state, fieldCard);
        const def = (0, registry_1.getCardDef)(cardNo);
        for (const [idx, ability] of (def?.abilities ?? []).entries()) {
            if (ability.timing !== "onBecomeEngaged")
                continue;
            pushTrigger(state, fieldCard.instanceId, player, cardNo, ability, "onBecomeEngaged", "obe", `obe:${idx}`);
        }
    }
}
function queueOnDiscardTriggers(state, discardingPlayer, activePlayer) {
    if (state.activePlayer !== activePlayer)
        return;
    for (const fieldCard of (0, queries_1.getPlayer)(state, activePlayer).zones.field) {
        if ((0, passives_1.isBoxed)(fieldCard, state))
            continue;
        const cardNo = (0, queries_1.resolveCardNo)(state, fieldCard);
        const def = (0, registry_1.getCardDef)(cardNo);
        for (const [idx, ability] of (def?.abilities ?? []).entries()) {
            if (ability.timing !== "onDiscard")
                continue;
            pushTrigger(state, fieldCard.instanceId, activePlayer, cardNo, ability, "onDiscard", "od", `od:${idx}`);
        }
    }
}
function queueOnEnemyFollowerLeaveField(state, leftInstanceId, leftController, activePlayer) {
    if (leftController === activePlayer)
        return;
    const left = (0, queries_1.findInstance)(state, leftInstanceId);
    if (!left)
        return;
    const leftNo = (0, queries_1.resolveCardNo)(state, left.card);
    const leftDef = (0, registry_1.getCardDef)(leftNo);
    if (leftDef?.cardType !== "follower")
        return;
    for (const fieldCard of (0, queries_1.getPlayer)(state, activePlayer).zones.field) {
        if ((0, passives_1.isBoxed)(fieldCard, state))
            continue;
        const cardNo = (0, queries_1.resolveCardNo)(state, fieldCard);
        const def = (0, registry_1.getCardDef)(cardNo);
        for (const [idx, ability] of (def?.abilities ?? []).entries()) {
            if (ability.timing !== "onEnemyFollowerLeaveField")
                continue;
            pushTrigger(state, fieldCard.instanceId, activePlayer, cardNo, ability, "onEnemyFollowerLeaveField", "oefl", `oefl:${idx}`, leftInstanceId);
        }
    }
}
function queueOnTokenLeaveField(state, leftInstanceId, tokenController, tokenCardNo) {
    const tokenDef = (0, registry_1.getCardDef)(tokenCardNo);
    if (tokenDef?.printingType !== "token" && tokenDef?.specialType !== "token")
        return;
    const cost = (0, queries_1.resolveCardDefCost)(tokenCardNo);
    if (cost !== 1)
        return;
    for (const fieldCard of (0, queries_1.getPlayer)(state, tokenController).zones.field) {
        if ((0, passives_1.isBoxed)(fieldCard, state))
            continue;
        const cardNo = (0, queries_1.resolveCardNo)(state, fieldCard);
        const def = (0, registry_1.getCardDef)(cardNo);
        for (const [idx, ability] of (def?.abilities ?? []).entries()) {
            if (ability.timing !== "onTokenLeaveField")
                continue;
            if (ability.oncePerTurn) {
                const key = `otlf:${idx}`;
                if (fieldCard.abilitiesActivatedThisTurn.includes(key))
                    continue;
            }
            pushTrigger(state, fieldCard.instanceId, tokenController, cardNo, ability, "onTokenLeaveField", "otlf", `otlf:${idx}`, undefined, tokenCardNo);
        }
    }
}
function queueStartOfEndAbilities(state, player) {
    for (const card of [...(0, queries_1.getPlayer)(state, player).zones.field]) {
        if ((0, passives_1.isBoxed)(card, state))
            continue;
        const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, card));
        for (const ability of def?.abilities ?? []) {
            if (ability.timing !== "startOfEnd")
                continue;
            pushTrigger(state, card.instanceId, player, card.cardNo, ability, "startOfEnd", "soe");
        }
    }
}
function queueAllyFollowerEnterTriggers(state, enteredInstanceId, player) {
    const entered = (0, queries_1.findInstance)(state, enteredInstanceId);
    if (!entered || entered.zone !== "field")
        return;
    const enteredNo = (0, queries_1.resolveCardNo)(state, entered.card);
    for (const fieldCard of (0, queries_1.getPlayer)(state, player).zones.field) {
        if (fieldCard.instanceId === enteredInstanceId || (0, passives_1.isBoxed)(fieldCard, state))
            continue;
        const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, fieldCard));
        for (const [idx, ability] of (def?.abilities ?? []).entries()) {
            if (ability.timing !== "onAllyFollowerEnter")
                continue;
            if (ability.activateFrom === "cemetery")
                continue;
            if (ability.filter && !(0, conditions_1.cardMatchesFilter)(enteredNo, ability.filter))
                continue;
            pushTrigger(state, fieldCard.instanceId, player, fieldCard.cardNo, ability, "onAllyFollowerEnter", "afe", `afe:${idx}`, enteredInstanceId);
        }
    }
}
/** Cemetery cards that react when an ally follower enters (e.g. Delta Cannon + Tetra). */
function queueCemeteryOnAllyFollowerEnter(state, enteredInstanceId, player) {
    const entered = (0, queries_1.findInstance)(state, enteredInstanceId);
    if (!entered || entered.zone !== "field")
        return;
    const enteredNo = (0, queries_1.resolveCardNo)(state, entered.card);
    const enteredDef = (0, registry_1.getCardDef)(enteredNo);
    if (enteredDef?.cardType !== "follower")
        return;
    for (const cemCard of (0, queries_1.getPlayer)(state, player).zones.cemetery) {
        const cardNo = (0, queries_1.resolveCardNo)(state, cemCard);
        const def = (0, registry_1.getCardDef)(cardNo);
        for (const [idx, ability] of (def?.abilities ?? []).entries()) {
            if (ability.timing !== "onAllyFollowerEnter")
                continue;
            if (ability.activateFrom !== "cemetery")
                continue;
            if (ability.filter && !(0, conditions_1.cardMatchesFilter)(enteredNo, ability.filter))
                continue;
            pushTrigger(state, cemCard.instanceId, player, cardNo, ability, "onAllyFollowerEnter", "cafe", `cafe:${idx}`, enteredInstanceId);
        }
    }
}
function onCardEntersExAreaTriggers(state, instanceId, player) {
    const entered = (0, queries_1.findInstance)(state, instanceId);
    if (!entered || entered.zone !== "exArea")
        return;
    const enteredNo = (0, queries_1.resolveCardNo)(state, entered.card);
    for (const fieldCard of (0, queries_1.getPlayer)(state, player).zones.field) {
        if ((0, passives_1.isBoxed)(fieldCard, state))
            continue;
        const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, fieldCard));
        for (const ability of def?.abilities ?? []) {
            if (!(0, passives_2.matchesExAreaEntryFilter)(ability, enteredNo))
                continue;
            pushTrigger(state, fieldCard.instanceId, player, fieldCard.cardNo, ability, "onExAreaEntry", `ex_${instanceId}`);
        }
    }
}
function queueOnLeaveField(state, instanceId, player) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found)
        return;
    if ((0, passives_1.isBoxed)(found.card, state))
        return;
    const cardNo = (0, queries_1.resolveCardNo)(state, found.card);
    const def = (0, registry_1.getCardDef)(cardNo);
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
        if (ability.timing !== "onLeaveField")
            continue;
        pushTrigger(state, instanceId, player, cardNo, ability, "onLeaveField", "olf", `olf:${idx}`);
    }
}
function queueOnDamagedAbilities(state, instanceId, player) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found || found.zone !== "field")
        return;
    if ((0, passives_1.isBoxed)(found.card, state))
        return;
    if (found.card.abilitiesSilenced)
        return;
    const cardNo = (0, queries_1.resolveCardNo)(state, found.card);
    const def = (0, registry_1.getCardDef)(cardNo);
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
        if (ability.timing !== "onDamaged")
            continue;
        if (ability.oncePerTurn) {
            const key = `odmg:${idx}`;
            if (found.card.abilitiesActivatedThisTurn.includes(key))
                continue;
        }
        pushTrigger(state, instanceId, player, cardNo, ability, "onDamaged", "odmg", `odmg:${idx}`);
    }
    for (const [gIdx, grant] of (found.card.grantedOnDamaged ?? []).entries()) {
        if (grant.oncePerTurn) {
            const key = `godmg:${gIdx}`;
            if (found.card.abilitiesActivatedThisTurn.includes(key))
                continue;
        }
        pushTrigger(state, instanceId, player, cardNo, {
            timing: "onDamaged",
            effect: grant.effect,
            label: grant.label,
            oncePerTurn: grant.oncePerTurn,
        }, "onDamaged", "godmg", `godmg:${gIdx}`);
    }
}
function queueOnAbilityDamaged(state, instanceId, player) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found || found.zone !== "field")
        return;
    if ((0, passives_1.isBoxed)(found.card, state))
        return;
    if (found.card.abilitiesSilenced)
        return;
    const cardNo = (0, queries_1.resolveCardNo)(state, found.card);
    const def = (0, registry_1.getCardDef)(cardNo);
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
        if (ability.timing !== "onAbilityDamaged")
            continue;
        if (ability.oncePerTurn) {
            const key = `oadmg:${idx}`;
            if (found.card.abilitiesActivatedThisTurn.includes(key))
                continue;
        }
        pushTrigger(state, instanceId, player, cardNo, ability, "onAbilityDamaged", "oadmg", `oadmg:${idx}`);
    }
}
function queueOnAllyEvolveTriggers(state, evolvedInstanceId, player) {
    const evolved = (0, queries_1.findInstance)(state, evolvedInstanceId);
    if (!evolved || evolved.zone !== "field")
        return;
    const evolvedNo = (0, queries_1.resolveCardNo)(state, evolved.card);
    for (const fieldCard of (0, queries_1.getPlayer)(state, player).zones.field) {
        if (fieldCard.instanceId === evolvedInstanceId || (0, passives_1.isBoxed)(fieldCard, state))
            continue;
        const cardNo = (0, queries_1.resolveCardNo)(state, fieldCard);
        const def = (0, registry_1.getCardDef)(cardNo);
        for (const [idx, ability] of (def?.abilities ?? []).entries()) {
            if (ability.timing !== "onAllyEvolve")
                continue;
            if (ability.filter && !(0, conditions_1.cardMatchesFilter)(evolvedNo, ability.filter))
                continue;
            if (ability.oncePerTurn) {
                const key = `oae:${idx}`;
                if (fieldCard.abilitiesActivatedThisTurn.includes(key))
                    continue;
            }
            pushTrigger(state, fieldCard.instanceId, player, cardNo, ability, "onAllyEvolve", "oae", `oae:${idx}`, evolvedInstanceId);
        }
    }
}
