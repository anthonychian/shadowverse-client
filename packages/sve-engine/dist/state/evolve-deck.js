"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEvolveDeckFaceup = isEvolveDeckFaceup;
exports.isEvolveDeckFacedown = isEvolveDeckFacedown;
exports.filterEvolveDeckCards = filterEvolveDeckCards;
exports.countEvolveDeckFaceup = countEvolveDeckFaceup;
exports.setEvolveDeckOrientation = setEvolveDeckOrientation;
const registry_1 = require("../cards/registry");
const conditions_1 = require("./conditions");
const queries_1 = require("./queries");
function isEvolveDeckFaceup(card) {
    return Boolean(card.evoSpent);
}
function isEvolveDeckFacedown(card) {
    return !card.evoSpent;
}
function filterEvolveDeckCards(state, player, opts) {
    return (0, queries_1.getPlayer)(state, player).zones.evolveDeck.filter((c) => {
        if (opts?.face === "faceup" && !isEvolveDeckFaceup(c))
            return false;
        if (opts?.face === "facedown" && !isEvolveDeckFacedown(c))
            return false;
        if (opts?.filter && !(0, conditions_1.cardMatchesFilter)(c.cardNo, opts.filter))
            return false;
        const def = (0, registry_1.getCardDef)(c.cardNo);
        if (!def)
            return false;
        return true;
    });
}
function countEvolveDeckFaceup(state, player, filter) {
    return filterEvolveDeckCards(state, player, { filter, face: "faceup" }).length;
}
function setEvolveDeckOrientation(state, instanceIds, orientation) {
    const next = structuredClone(state);
    for (const pid of [0, 1]) {
        for (const card of next.players[pid].zones.evolveDeck) {
            if (!instanceIds.includes(card.instanceId))
                continue;
            card.evoSpent = orientation === "faceup";
        }
    }
    return next;
}
