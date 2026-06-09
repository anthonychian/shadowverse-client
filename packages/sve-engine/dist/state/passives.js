"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBoxed = isBoxed;
exports.getPassiveKeywords = getPassiveKeywords;
exports.getAuraKeywords = getAuraKeywords;
exports.getMaxDamagePerHit = getMaxDamagePerHit;
exports.hasNamedFollowerOnFieldByIdentity = hasNamedFollowerOnFieldByIdentity;
exports.matchesExAreaEntryFilter = matchesExAreaEntryFilter;
const registry_1 = require("../cards/registry");
const reprints_1 = require("../cards/reprints");
const conditions_1 = require("./conditions");
const queries_1 = require("./queries");
function isBoxed(card, state) {
    return card.boxedUntilTurn != null && state.turnNumber < card.boxedUntilTurn;
}
function abilitiesFor(state, card) {
    return (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, card))?.abilities ?? [];
}
function getPassiveKeywords(state, card, player) {
    if (isBoxed(card, state))
        return [];
    const keywords = [];
    for (const ability of abilitiesFor(state, card)) {
        if (ability.timing !== "passive")
            continue;
        if (ability.condition && !(0, conditions_1.evalCondition)(state, player, ability.condition))
            continue;
        const effect = ability.effect;
        if (effect.op === "passiveKeywords") {
            for (const kw of effect.keywords) {
                if ((kw === "aura" || kw === "intimidate") && card.engaged)
                    continue;
                keywords.push(kw);
            }
        }
    }
    return keywords;
}
function getAuraKeywords(state, card, player) {
    if (isBoxed(card, state))
        return [];
    const keywords = [];
    const field = (0, queries_1.getPlayer)(state, player).zones.field;
    for (const source of field) {
        for (const ability of abilitiesFor(state, source)) {
            if (ability.timing !== "aura")
                continue;
            const effect = ability.effect;
            if (effect.op !== "auraGrantKeyword")
                continue;
            if (effect.excludeSelf && source.instanceId === card.instanceId)
                continue;
            if (effect.trait) {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, card));
                if (!def?.traits?.includes(effect.trait))
                    continue;
            }
            keywords.push(effect.keyword);
        }
    }
    return keywords;
}
function getMaxDamagePerHit(state, card, player) {
    if (isBoxed(card, state))
        return null;
    for (const ability of abilitiesFor(state, card)) {
        if (ability.timing !== "passive")
            continue;
        if (ability.condition && !(0, conditions_1.evalCondition)(state, player, ability.condition))
            continue;
        const effect = ability.effect;
        if (effect.op === "damageCap")
            return effect.maxPerHit;
    }
    return null;
}
function hasNamedFollowerOnFieldByIdentity(state, player, identityName) {
    const target = (0, reprints_1.normalizeIdentityName)(identityName);
    return (0, queries_1.getPlayer)(state, player).zones.field.some((c) => {
        const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
        return def && (0, reprints_1.normalizeIdentityName)(def.name) === target;
    });
}
function matchesExAreaEntryFilter(ability, enteredCardNo) {
    if (ability.timing !== "onExAreaEntry" || !ability.filter)
        return false;
    return (0, conditions_1.cardMatchesFilter)(enteredCardNo, ability.filter);
}
