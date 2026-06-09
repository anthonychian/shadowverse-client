"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBoxed = void 0;
exports.getPlayer = getPlayer;
exports.findInstance = findInstance;
exports.getBaseCardNoForInstance = getBaseCardNoForInstance;
exports.computeEvolvePayment = computeEvolvePayment;
exports.canSuperEvolveNow = canSuperEvolveNow;
exports.resolveCardNo = resolveCardNo;
exports.resolveCardDefCost = resolveCardDefCost;
exports.getExAreaPlayCostReduction = getExAreaPlayCostReduction;
exports.getPassivePlayCostReduction = getPassivePlayCostReduction;
exports.getEffectivePlayCost = getEffectivePlayCost;
exports.getEffectiveStats = getEffectiveStats;
exports.getEvolveCost = getEvolveCost;
exports.hasKeyword = hasKeyword;
exports.clampDamageToFollower = clampDamageToFollower;
exports.canEvolveFollower = canEvolveFollower;
exports.getActivatedAbilities = getActivatedAbilities;
exports.evolveCardsMatch = evolveCardsMatch;
exports.findMatchingEvolveCard = findMatchingEvolveCard;
exports.getStrikeAbilities = getStrikeAbilities;
exports.opponentOf = opponentOf;
exports.isOverflowActive = isOverflowActive;
exports.canAttackLeader = canAttackLeader;
exports.getWardTargets = getWardTargets;
exports.getLegalAttackTargets = getLegalAttackTargets;
const registry_1 = require("../cards/registry");
const reprints_1 = require("../cards/reprints");
const conditions_1 = require("./conditions");
const passives_1 = require("./passives");
const effect_utils_1 = require("../rules/effect-utils");
function getPlayer(state, player) {
    return state.players[player];
}
function findInstance(state, instanceId) {
    for (const pid of [0, 1]) {
        const zones = state.players[pid].zones;
        for (const [zoneName, cards] of Object.entries(zones)) {
            if (zoneName === "evolveZone")
                continue;
            const list = cards;
            const card = list.find((c) => c.instanceId === instanceId);
            if (card)
                return { card, player: pid, zone: zoneName };
        }
    }
    return null;
}
/** Base printing to use for play cost / unevolved stats (evolved printings in hand count as base). */
function getBaseCardNoForInstance(cardNo, linkedEvoInstanceId) {
    if (linkedEvoInstanceId)
        return cardNo;
    const def = (0, registry_1.getCardDef)(cardNo);
    if (!def)
        return cardNo;
    if (def.evolvesTo)
        return cardNo;
    const kind = (0, reprints_1.cardIdentityKey)(def).split("|")[1];
    if (kind === "evolved" && def.evolvesFrom)
        return def.evolvesFrom;
    return cardNo;
}
function parseEvolveCostFromText(cardText) {
    const match = cardText.match(/\[evolve\]\s*\[cost(\d+)\]/i);
    if (match)
        return Number(match[1]);
    return null;
}
function computeEvolvePayment(cost, pp, evoPoints, useEvoPoint) {
    if (cost <= 0)
        return { ok: true, ppCost: 0, epCost: 0 };
    if (!useEvoPoint) {
        return { ok: pp >= cost, ppCost: cost, epCost: 0 };
    }
    const epCost = Math.min(1, evoPoints, cost);
    if (epCost <= 0)
        return { ok: false, ppCost: cost, epCost: 0 };
    const ppCost = cost - epCost;
    return { ok: pp >= ppCost, ppCost, epCost };
}
function canSuperEvolveNow(state, player) {
    const p = state.players[player];
    if (p.superEvoPoints <= 0)
        return false;
    const threshold = player === state.firstPlayer ? 7 : 6;
    return p.turnsPassed >= threshold;
}
/** When evolved, the evolve card's definition applies for stats/keywords/abilities. */
function resolveCardNo(state, card) {
    if (state && card.linkedEvoInstanceId) {
        const evo = findInstance(state, card.linkedEvoInstanceId);
        if (evo)
            return evo.card.cardNo;
    }
    const def = (0, registry_1.getCardDef)(card.cardNo);
    if (def?.evolvesFrom && !def.evolvesTo) {
        return card.cardNo;
    }
    return getBaseCardNoForInstance(card.cardNo, card.linkedEvoInstanceId);
}
var passives_2 = require("./passives");
Object.defineProperty(exports, "isBoxed", { enumerable: true, get: function () { return passives_2.isBoxed; } });
/** Printed play cost; evolved promos with cost 0 inherit from their base form. */
function resolveCardDefCost(cardNo) {
    const def = (0, registry_1.getCardDef)(cardNo);
    if (!def)
        return 0;
    if (def.cost > 0)
        return def.cost;
    if (def.evolvesFrom) {
        const from = (0, registry_1.getCardDef)(def.evolvesFrom);
        if (from && from.cost > 0)
            return from.cost;
    }
    return def.cost;
}
function getExAreaPlayCostReduction(state, player, cardNo) {
    const def = (0, registry_1.getCardDef)(cardNo);
    let reduction = 0;
    for (const ability of def?.abilities ?? []) {
        if (ability.timing !== "passive")
            continue;
        if (ability.condition && !(0, conditions_1.evalCondition)(state, player, ability.condition))
            continue;
        if (ability.effect.op === "exAreaPlayCostReduction") {
            reduction += ability.effect.amount;
        }
    }
    return reduction;
}
function getPassivePlayCostReduction(state, player, cardNo) {
    const def = (0, registry_1.getCardDef)(cardNo);
    let reduction = 0;
    for (const ability of def?.abilities ?? []) {
        if (ability.timing !== "passive")
            continue;
        if (ability.condition && !(0, conditions_1.evalCondition)(state, player, ability.condition))
            continue;
        if (ability.effect.op === "playCostReduction") {
            reduction += ability.effect.amount;
        }
    }
    return reduction;
}
function getEffectivePlayCost(card, cardNo, state, player, fromZone) {
    const playNo = getBaseCardNoForInstance(cardNo, card.linkedEvoInstanceId);
    let base = resolveCardDefCost(playNo);
    if (state && player != null) {
        base = Math.max(0, base - getPassivePlayCostReduction(state, player, playNo));
        if (fromZone === "exArea") {
            base = Math.max(0, base - getExAreaPlayCostReduction(state, player, cardNo));
        }
    }
    return Math.max(0, base - (card.playCostReduction ?? 0));
}
function getEffectiveStats(card, state) {
    const statsNo = state ? resolveCardNo(state, card) : getBaseCardNoForInstance(card.cardNo);
    const cardDef = (0, registry_1.getCardDef)(statsNo);
    let atk = cardDef?.attack ?? 0;
    let def = cardDef?.defense ?? 0;
    for (const m of card.modifiers) {
        atk += m.atk ?? 0;
        def += m.def ?? 0;
    }
    return { atk, def, cost: cardDef?.cost ?? 0 };
}
/** PP cost to evolve (separate from a card's play cost). */
function getEvolveCost(evoCardNo, baseCardNo) {
    const base = baseCardNo ? (0, registry_1.getCardDef)(getBaseCardNoForInstance(baseCardNo)) : null;
    if (base?.evolveCost != null)
        return base.evolveCost;
    const parsed = base?.cardText ? parseEvolveCostFromText(base.cardText) : null;
    if (parsed != null)
        return parsed;
    return 2;
}
function hasKeyword(card, keyword, state, player) {
    if (state && (0, passives_1.isBoxed)(card, state))
        return false;
    if (card.grantedKeywords?.includes(keyword))
        return true;
    const def = (0, registry_1.getCardDef)(resolveCardNo(state, card));
    if (def?.keywords.includes(keyword)) {
        // Aura and intimidate apply only while the follower is reserved (not engaged).
        if (keyword === "aura" || keyword === "intimidate") {
            return !card.engaged;
        }
        return true;
    }
    if (state) {
        const pid = player ?? card.controller;
        if ((0, passives_1.getPassiveKeywords)(state, card, pid).includes(keyword))
            return true;
        if ((0, passives_1.getAuraKeywords)(state, card, pid).includes(keyword))
            return true;
    }
    // Evolved followers gain Rush for the turn they are evolved.
    if (keyword === "rush" && card.evolvedThisTurn)
        return true;
    return false;
}
function clampDamageToFollower(state, card, player, amount) {
    const cap = state ? (0, passives_1.getMaxDamagePerHit)(state, card, player) : null;
    if (cap != null && amount > cap)
        return cap;
    return amount;
}
function canEvolveFollower(state, player, fieldInstanceId) {
    const fieldFound = findInstance(state, fieldInstanceId);
    if (!fieldFound || fieldFound.zone !== "field" || fieldFound.player !== player)
        return false;
    if (getPlayer(state, player).flags.evolvedThisTurn)
        return false;
    if (fieldFound.card.linkedEvoInstanceId)
        return false;
    if ((0, passives_1.isBoxed)(fieldFound.card, state))
        return false;
    if (!findMatchingEvolveCard(state, player, fieldInstanceId))
        return false;
    const baseNo = getBaseCardNoForInstance(fieldFound.card.cardNo, fieldFound.card.linkedEvoInstanceId);
    const def = (0, registry_1.getCardDef)(baseNo);
    const evolveRules = (def?.abilities ?? []).filter((a) => a.timing === "evolve");
    return evolveRules.every((a) => !a.condition || (0, conditions_1.evalCondition)(state, player, a.condition));
}
function getActivatedAbilities(state, card, player, zone) {
    if (zone === "field" && (0, passives_1.isBoxed)(card, state))
        return [];
    const def = (0, registry_1.getCardDef)(resolveCardNo(state, card));
    const results = [];
    for (const [idx, a] of (def?.abilities ?? []).entries()) {
        if (a.timing !== "activated")
            continue;
        const from = a.activateFrom ?? "field";
        if (from !== zone)
            continue;
        const key = `activated:${idx}`;
        if (a.oncePerTurn && card.abilitiesActivatedThisTurn.includes(key))
            continue;
        if (a.condition && !(0, conditions_1.evalCondition)(state, player, a.condition))
            continue;
        if ((0, effect_utils_1.isAdvanceAbility)(def, a) && getPlayer(state, player).flags.evolvedThisTurn)
            continue;
        if ((0, effect_utils_1.isAdvanceAbility)(def, a) && !(0, effect_utils_1.canAdvanceActivate)(state, player, a.effect))
            continue;
        const ppCost = a.cost?.pp ?? 0;
        const p = getPlayer(state, player);
        const canPayPp = computeEvolvePayment(ppCost, p.pp, p.evoPoints, false).ok;
        const canPayEp = computeEvolvePayment(ppCost, p.pp, p.evoPoints, true).ok;
        if (!canPayPp && !canPayEp)
            continue;
        if (a.cost?.banishFromCemetery) {
            const need = a.cost.banishCount ?? 1;
            const have = getPlayer(state, player).zones.cemetery.filter((c) => (0, conditions_1.cardMatchesFilter)(c.cardNo, a.cost.banishFromCemetery)).length;
            if (have < need)
                continue;
        }
        if (a.cost?.banishFromExArea) {
            const need = a.cost.banishCount ?? 1;
            const have = getPlayer(state, player).zones.exArea.filter((c) => (0, conditions_1.cardMatchesFilter)(c.cardNo, a.cost.banishFromExArea)).length;
            if (have < need)
                continue;
        }
        if (a.cost?.buryFromField) {
            const need = a.cost.buryFieldCount ?? 1;
            const have = getPlayer(state, player).zones.field.filter((c) => (0, conditions_1.cardMatchesFilter)(c.cardNo, a.cost.buryFromField)).length;
            if (have < need)
                continue;
        }
        results.push({ ability: a, key });
    }
    return results;
}
function evolveCardsMatch(fieldCardNo, evoCardNo) {
    const baseDef = (0, registry_1.getCardDef)(fieldCardNo);
    const evoDef = (0, registry_1.getCardDef)(evoCardNo);
    if (baseDef?.evolvesTo === evoCardNo)
        return true;
    if (evoDef?.evolvesFrom === fieldCardNo)
        return true;
    if (baseDef?.evolvesTo && (0, registry_1.getGameplayCardNo)(evoCardNo) === (0, registry_1.getGameplayCardNo)(baseDef.evolvesTo)) {
        return true;
    }
    if (evoDef?.evolvesFrom && (0, registry_1.getGameplayCardNo)(fieldCardNo) === (0, registry_1.getGameplayCardNo)(evoDef.evolvesFrom)) {
        return true;
    }
    return false;
}
function findMatchingEvolveCard(state, player, fieldInstanceId) {
    const fieldFound = findInstance(state, fieldInstanceId);
    if (!fieldFound || fieldFound.zone !== "field")
        return null;
    if (fieldFound.card.linkedEvoInstanceId)
        return null;
    return (state.players[player].zones.evolveDeck.find((evo) => evolveCardsMatch(fieldFound.card.cardNo, evo.cardNo)) ?? null);
}
function getStrikeAbilities(state, card) {
    if ((0, passives_1.isBoxed)(card, state))
        return [];
    const def = (0, registry_1.getCardDef)(resolveCardNo(state, card));
    return def?.abilities?.filter((a) => a.timing === "strike") ?? [];
}
function opponentOf(player) {
    return player === 0 ? 1 : 0;
}
function isOverflowActive(state, player) {
    return state.players[player].maxPp >= 7;
}
function canAttackLeader(state, attacker, player) {
    if (attacker.onFieldSinceTurnStart)
        return true;
    if (hasKeyword(attacker, "storm", state))
        return true;
    return false;
}
function getWardTargets(state, defender) {
    return state.players[defender].zones.field.filter((c) => hasKeyword(c, "ward", state) && c.engaged);
}
function getLegalAttackTargets(state, attacker, player) {
    const enemy = opponentOf(player);
    const targets = [];
    const wards = getWardTargets(state, enemy);
    if (wards.length > 0) {
        for (const w of wards) {
            if (!hasKeyword(w, "intimidate", state)) {
                targets.push({ type: "follower", instanceId: w.instanceId });
            }
        }
        return targets;
    }
    for (const f of state.players[enemy].zones.field) {
        if (hasKeyword(f, "intimidate", state))
            continue;
        // Reserved (not engaged) followers require Assail to be attacked.
        if (!f.engaged && !hasKeyword(attacker, "assail", state))
            continue;
        targets.push({ type: "follower", instanceId: f.instanceId });
    }
    if (canAttackLeader(state, attacker, player)) {
        targets.push({ type: "leader", player: enemy });
    }
    return targets;
}
