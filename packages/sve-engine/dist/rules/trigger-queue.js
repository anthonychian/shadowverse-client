"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueLastWords = queueLastWords;
exports.queueFanfare = queueFanfare;
exports.queueStartOfEndAbilities = queueStartOfEndAbilities;
exports.onCardEntersExAreaTriggers = onCardEntersExAreaTriggers;
const registry_1 = require("../cards/registry");
const trigger_labels_1 = require("./trigger-labels");
const passives_1 = require("../state/passives");
const queries_1 = require("../state/queries");
const passives_2 = require("../state/passives");
function pushTrigger(state, instanceId, player, cardNo, ability, timing, idPrefix) {
    state.pendingTriggers.push({
        id: `${idPrefix}_${instanceId}_${state.pendingTriggers.length}`,
        controller: player,
        sourceInstanceId: instanceId,
        ability,
        timing,
        label: (0, trigger_labels_1.describeAbility)(cardNo, ability),
    });
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
