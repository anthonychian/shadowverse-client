"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardMatchesFilter = cardMatchesFilter;
exports.evalCondition = evalCondition;
const registry_1 = require("../cards/registry");
const reprints_1 = require("../cards/reprints");
const evolve_deck_1 = require("./evolve-deck");
const passives_1 = require("./passives");
const queries_1 = require("./queries");
function cardMatchesFilter(cardNo, filter) {
    const def = (0, registry_1.getCardDef)(cardNo);
    if (!def)
        return false;
    if (filter.identityName) {
        if ((0, reprints_1.normalizeIdentityName)(def.name) !== (0, reprints_1.normalizeIdentityName)(filter.identityName))
            return false;
    }
    else if (filter.cardNo) {
        const ref = (0, registry_1.getCardDef)(filter.cardNo);
        if (ref) {
            if ((0, reprints_1.normalizeIdentityName)(def.name) !== (0, reprints_1.normalizeIdentityName)(ref.name))
                return false;
        }
        else if (cardNo !== filter.cardNo) {
            return false;
        }
    }
    if (filter.trait && !def.traits?.includes(filter.trait))
        return false;
    if (filter.traitsAny?.length) {
        const hasTrait = filter.traitsAny.some((t) => def.traits?.includes(t));
        if (!hasTrait)
            return false;
    }
    if (filter.cardClass && def.class !== filter.cardClass)
        return false;
    const cost = (0, queries_1.resolveCardDefCost)(cardNo);
    if (filter.maxCost != null && cost > filter.maxCost)
        return false;
    if (filter.minCost != null && cost < filter.minCost)
        return false;
    if (filter.cardType && def.cardType !== filter.cardType)
        return false;
    if (filter.identityNameContains) {
        const needle = filter.identityNameContains.toLowerCase();
        if (!(0, reprints_1.normalizeIdentityName)(def.name).toLowerCase().includes(needle))
            return false;
    }
    if (filter.excludeIdentityName) {
        const excluded = (0, reprints_1.normalizeIdentityName)(filter.excludeIdentityName);
        if ((0, reprints_1.normalizeIdentityName)(def.name) === excluded)
            return false;
    }
    return true;
}
function countFieldFollowersWithTraitAny(state, player, traits) {
    return (0, queries_1.getPlayer)(state, player).zones.field.filter((c) => {
        const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
        if (def?.cardType !== "follower")
            return false;
        return traits.some((t) => def.traits?.includes(t));
    }).length;
}
function countTraitInZone(state, player, zone, trait) {
    return (0, queries_1.getPlayer)(state, player).zones[zone].filter((c) => (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c))?.traits?.includes(trait)).length;
}
function countCemeteryTraitBeforeSourceEnters(state, player, trait) {
    const sourceId = state.resolutionContext?.sourceInstanceId;
    return (0, queries_1.getPlayer)(state, player).zones.cemetery.filter((c) => {
        if (sourceId && c.instanceId === sourceId)
            return false;
        return (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c))?.traits?.includes(trait);
    }).length;
}
function countCemeteryClassBeforeSourceEnters(state, player, cardClass) {
    const sourceId = state.resolutionContext?.sourceInstanceId;
    return (0, queries_1.getPlayer)(state, player).zones.cemetery.filter((c) => {
        if (sourceId && c.instanceId === sourceId)
            return false;
        return (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c))?.class === cardClass;
    }).length;
}
function evalCondition(state, player, condition) {
    switch (condition.type) {
        case "always":
            return true;
        case "overflow":
            return (0, queries_1.isOverflowActive)(state, player);
        case "sanguine":
            return (0, queries_1.isSanguineActive)(state, player);
        case "inExArea":
            return evalCondition(state, player, { type: "sourceInExArea" });
        case "combo":
            return (0, queries_1.getPlayer)(state, player).flags.cardsPlayedThisTurn >= condition.count;
        case "namedFollowerOnField":
            return (0, queries_1.getPlayer)(state, player).zones.field.some((c) => c.cardNo === condition.cardNo);
        case "namedFollowerOnFieldByName":
            return (0, passives_1.hasNamedFollowerOnFieldByIdentity)(state, player, condition.identityName);
        case "notEnteredFromHand": {
            const sourceId = state.resolutionContext?.sourceInstanceId;
            if (!sourceId)
                return false;
            const found = (0, queries_1.findInstance)(state, sourceId);
            return found?.card.enteredFromHand === false;
        }
        case "enteredFromCemetery": {
            const sourceId = state.resolutionContext?.sourceInstanceId;
            if (!sourceId)
                return false;
            const found = (0, queries_1.findInstance)(state, sourceId);
            return found?.card.enteredFromCemetery === true;
        }
        case "namedCardNotOnFieldByName": {
            const target = (0, reprints_1.normalizeIdentityName)(condition.identityName);
            return !(0, queries_1.getPlayer)(state, player).zones.field.some((c) => {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
                return def && (0, reprints_1.normalizeIdentityName)(def.name) === target;
            });
        }
        case "opponentCemeteryMin": {
            const opp = (0, queries_1.opponentOf)(player);
            return (0, queries_1.getPlayer)(state, opp).zones.cemetery.length >= condition.count;
        }
        case "exAreaTraitMin":
            return countTraitInZone(state, player, "exArea", condition.trait) >= condition.count;
        case "exAreaNamedMin": {
            const target = (0, reprints_1.normalizeIdentityName)(condition.identityName);
            const count = (0, queries_1.getPlayer)(state, player).zones.exArea.filter((c) => {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
                return def && (0, reprints_1.normalizeIdentityName)(def.name) === target;
            }).length;
            return count >= condition.count;
        }
        case "ownCemeteryTraitMin":
            return countTraitInZone(state, player, "cemetery", condition.trait) >= condition.count;
        case "ownCemeteryTraitMinBeforeSourceEnters":
            return (countCemeteryTraitBeforeSourceEnters(state, player, condition.trait) >= condition.count);
        case "ownDeckTraitMin":
            return countTraitInZone(state, player, "deck", condition.trait) >= condition.count;
        case "fieldTraitMin":
            return countTraitInZone(state, player, "field", condition.trait) >= condition.count;
        case "fieldFollowerTraitAnyMin":
            return countFieldFollowersWithTraitAny(state, player, condition.traits) >= condition.count;
        case "handTraitMin":
            return countTraitInZone(state, player, "hand", condition.trait) >= condition.count;
        case "ownCemeteryClassMin":
            return (0, queries_1.getPlayer)(state, player).zones.cemetery.filter((c) => (0, registry_1.getCardDef)(c.cardNo)?.class === condition.cardClass).length >= condition.count;
        case "ownCemeteryClassMinBeforeSourceEnters":
            return (countCemeteryClassBeforeSourceEnters(state, player, condition.cardClass) >= condition.count);
        case "ownDeckClassMin":
            return (0, queries_1.getPlayer)(state, player).zones.deck.filter((c) => (0, registry_1.getCardDef)(c.cardNo)?.class === condition.cardClass).length >= condition.count;
        case "fieldFollowerMinCost": {
            let matches = 0;
            for (const card of (0, queries_1.getPlayer)(state, player).zones.field) {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, card));
                if (!def?.traits?.includes(condition.trait))
                    continue;
                if ((0, queries_1.resolveCardDefCost)(card.cardNo) >= condition.minCost)
                    matches += 1;
            }
            return matches >= condition.count;
        }
        case "buriedExactCost":
            return (state.resolutionContext?.buriedCosts ?? []).some((c) => c === condition.cost);
        case "buriedAtLeastCost":
            return (state.resolutionContext?.buriedCosts ?? []).some((c) => c >= condition.cost);
        case "discardedCardType": {
            const cardNo = state.resolutionContext?.lastDiscardedCardNo;
            if (!cardNo)
                return false;
            return (0, registry_1.getCardDef)(cardNo)?.cardType === condition.cardType;
        }
        case "handMin":
            return (0, queries_1.getPlayer)(state, player).zones.hand.length >= condition.count;
        case "ownCemeteryMin":
        case "necrocharge":
            return (0, queries_1.getPlayer)(state, player).zones.cemetery.length >= condition.count;
        case "ownDeckMax":
            return (0, queries_1.getPlayer)(state, player).zones.deck.length <= condition.count;
        case "fieldTraitMax":
            return countTraitInZone(state, player, "field", condition.trait) <= condition.count;
        case "earthRite": {
            const need = condition.count ?? 1;
            const stackCard = (0, queries_1.getPlayer)(state, player).zones.field.find((c) => {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
                return def?.keywords?.includes("stack") || def?.traits?.some((t) => /earth|sigil/i.test(t));
            });
            return stackCard != null && (stackCard.counters.stack ?? 0) >= need;
        }
        case "ppMin":
            return (0, queries_1.getPlayer)(state, player).pp >= condition.count;
        case "sourceInExArea": {
            const sourceId = state.resolutionContext?.sourceInstanceId;
            if (!sourceId)
                return false;
            const found = (0, queries_1.findInstance)(state, sourceId);
            return found?.zone === "exArea";
        }
        case "leaderDefenseMax":
            return (0, queries_1.getPlayer)(state, player).leaderDef <= condition.max;
        case "cardsPlayedMin":
            return (0, queries_1.getPlayer)(state, player).flags.cardsPlayedThisTurn >= condition.count;
        case "leaderDefLostMin":
            return (0, queries_1.getPlayer)(state, player).flags.leaderDefLostCountThisTurn >= condition.count;
        case "enteredByAbility": {
            const sourceId = state.resolutionContext?.sourceInstanceId;
            if (!sourceId)
                return false;
            const found = (0, queries_1.findInstance)(state, sourceId);
            return found?.card.enteredFromHand === false;
        }
        case "amuletOnField":
            return (0, queries_1.getPlayer)(state, player).zones.field.some((c) => {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
                return def?.cardType === "amulet";
            });
        case "spellchain": {
            const names = new Set();
            for (const c of (0, queries_1.getPlayer)(state, player).zones.cemetery) {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
                if (def?.cardType === "spell") {
                    names.add((0, reprints_1.normalizeIdentityName)(def.name));
                }
            }
            return names.size >= condition.count;
        }
        case "totalFieldFollowerCount": {
            let total = 0;
            for (const pid of [0, 1]) {
                total += (0, queries_1.getPlayer)(state, pid).zones.field.filter((c) => {
                    const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
                    return def?.cardType === "follower";
                }).length;
            }
            return total >= (condition.min ?? 0);
        }
        case "hasCounter": {
            const sourceId = state.resolutionContext?.sourceInstanceId;
            if (!sourceId)
                return false;
            const found = (0, queries_1.findInstance)(state, sourceId);
            if (!found)
                return false;
            return (found.card.counters[condition.name] ?? 0) >= (condition.min ?? 1);
        }
        case "evolveDeckFaceupMin": {
            return (0, evolve_deck_1.countEvolveDeckFaceup)(state, player, condition.filter) >= condition.count;
        }
        case "cemeteryClassSpellNamesMin": {
            const names = new Set();
            for (const c of (0, queries_1.getPlayer)(state, player).zones.cemetery) {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
                if (def?.cardType === "spell" && def.class === condition.cardClass) {
                    names.add((0, reprints_1.normalizeIdentityName)(def.name));
                }
            }
            return names.size >= condition.count;
        }
        case "identityNameOnField": {
            const needle = condition.identityNameContains.toLowerCase();
            return (0, queries_1.getPlayer)(state, player).zones.field.some((c) => {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, c));
                return def?.name.toLowerCase().includes(needle);
            });
        }
        case "enemyFieldMin": {
            const enemy = (0, queries_1.opponentOf)(player);
            return (0, queries_1.getPlayer)(state, enemy).zones.field.length >= condition.count;
        }
        default:
            return false;
    }
}
