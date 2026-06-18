"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveCard = moveCard;
exports.removeFromField = removeFromField;
exports.returnEvolveCardToDeck = returnEvolveCardToDeck;
exports.destroyFollower = destroyFollower;
exports.putFieldCardOnDeckBottom = putFieldCardOnDeckBottom;
exports.putFieldCardOnDeckTop = putFieldCardOnDeckTop;
exports.drawCard = drawCard;
exports.shuffleDeck = shuffleDeck;
const tokens_1 = require("../cards/tokens");
const confirmation_1 = require("../rules/confirmation");
const trigger_queue_1 = require("../rules/trigger-queue");
const card_reset_1 = require("./card-reset");
const registry_1 = require("../cards/registry");
const queries_1 = require("./queries");
function moveCard(state, instanceId, toZone, toPlayer) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found)
        return state;
    let next = found.zone === "field" && toZone !== "field"
        ? returnEvolveCardToDeck(state, instanceId, true)
        : structuredClone(state);
    const foundAfter = (0, queries_1.findInstance)(next, instanceId);
    if (!foundAfter)
        return next;
    const fromZones = next.players[foundAfter.player].zones;
    const fromList = fromZones[foundAfter.zone];
    const idx = fromList.findIndex((c) => c.instanceId === instanceId);
    if (idx < 0)
        return state;
    const [card] = fromList.splice(idx, 1);
    let actualZone = toZone;
    if (toZone === "cemetery") {
        actualZone = (0, tokens_1.destinationForDestroyedCard)(card.cardNo);
    }
    const leftField = foundAfter.zone === "field" && toZone !== "field";
    if (leftField) {
        (0, trigger_queue_1.queueOnLeaveField)(next, instanceId, foundAfter.player);
    }
    if (leftField && actualZone !== "cemetery" && actualZone !== "banish") {
        (0, card_reset_1.resetFieldInstanceState)(card);
    }
    card.controller = toPlayer;
    const toList = next.players[toPlayer].zones[actualZone];
    toList.push(card);
    if (actualZone === "cemetery" || actualZone === "banish") {
        (0, card_reset_1.resetCardInstanceState)(card);
    }
    else if (toZone === "field") {
        if (foundAfter.zone === "cemetery") {
            card.enteredFromCemetery = true;
            card.enteredFromHand = false;
        }
        (0, confirmation_1.onFollowerEntersField)(next, card.instanceId, toPlayer);
    }
    else if (toZone === "exArea") {
        (0, confirmation_1.onCardEntersExArea)(next, card.instanceId, toPlayer);
    }
    return next;
}
function removeFromField(state, instanceId) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found || found.zone !== "field")
        return null;
    const next = structuredClone(state);
    const p = next.players[found.player];
    const idx = p.zones.field.findIndex((c) => c.instanceId === instanceId);
    if (idx < 0)
        return null;
    const [card] = p.zones.field.splice(idx, 1);
    const cardNo = (0, queries_1.resolveCardNo)(next, card);
    const dest = (0, tokens_1.destinationForDestroyedCard)(cardNo);
    if (dest === "cemetery" || dest === "banish") {
        (0, trigger_queue_1.queueOnEnemyFollowerLeaveField)(next, instanceId, found.player, next.activePlayer);
        const def = (0, registry_1.getCardDef)(cardNo);
        if (def?.printingType === "token" || def?.specialType === "token") {
            (0, trigger_queue_1.queueOnTokenLeaveField)(next, instanceId, found.player, cardNo);
        }
    }
    (0, card_reset_1.resetCardInstanceState)(card);
    p.zones[dest].push(card);
    return { state: next, card, player: found.player };
}
function returnEvolveCardToDeck(state, fieldInstanceId, spent) {
    const found = (0, queries_1.findInstance)(state, fieldInstanceId);
    if (!found || found.zone !== "field")
        return state;
    const player = found.player;
    const link = state.players[player].zones.evolveZone.find((l) => l.fieldInstanceId === fieldInstanceId);
    const evoId = link?.evolveInstanceId ?? found.card.linkedEvoInstanceId;
    if (!evoId)
        return state;
    const next = structuredClone(state);
    const p = next.players[player];
    p.zones.evolveZone = p.zones.evolveZone.filter((l) => l.fieldInstanceId !== fieldInstanceId);
    const fieldCard = p.zones.field.find((c) => c.instanceId === fieldInstanceId);
    if (fieldCard)
        fieldCard.linkedEvoInstanceId = undefined;
    let evoCard;
    const resolveIdx = p.zones.resolutionZone.findIndex((c) => c.instanceId === evoId);
    if (resolveIdx >= 0) {
        [evoCard] = p.zones.resolutionZone.splice(resolveIdx, 1);
    }
    else {
        const evoFound = (0, queries_1.findInstance)(next, evoId);
        if (evoFound && evoFound.zone !== "evolveDeck") {
            const list = p.zones[evoFound.zone];
            const evoIdx = list.findIndex((c) => c.instanceId === evoId);
            if (evoIdx >= 0)
                [evoCard] = list.splice(evoIdx, 1);
        }
    }
    if (!evoCard)
        return next;
    (0, card_reset_1.resetCardInstanceState)(evoCard);
    evoCard.evoSpent = spent;
    p.zones.evolveDeck.push(evoCard);
    return next;
}
function destroyFollower(state, instanceId) {
    let next = returnEvolveCardToDeck(state, instanceId, true);
    const removed = removeFromField(next, instanceId);
    if (!removed)
        return state;
    return removed.state;
}
function putFieldCardOnDeckBottom(state, instanceId, player) {
    const next = structuredClone(state);
    const found = (0, queries_1.findInstance)(next, instanceId);
    if (!found || found.zone !== "field" || found.player !== player)
        return state;
    (0, trigger_queue_1.queueOnLeaveField)(next, instanceId, player);
    const p = next.players[player];
    const idx = p.zones.field.findIndex((c) => c.instanceId === instanceId);
    if (idx < 0)
        return state;
    const [card] = p.zones.field.splice(idx, 1);
    (0, card_reset_1.resetCardInstanceState)(card);
    p.zones.deck.push(card);
    return next;
}
function putFieldCardOnDeckTop(state, instanceId, player) {
    const next = structuredClone(state);
    const found = (0, queries_1.findInstance)(next, instanceId);
    if (!found || found.zone !== "field")
        return state;
    const owner = found.player;
    (0, trigger_queue_1.queueOnLeaveField)(next, instanceId, owner);
    const p = next.players[owner];
    const idx = p.zones.field.findIndex((c) => c.instanceId === instanceId);
    if (idx < 0)
        return state;
    const [card] = p.zones.field.splice(idx, 1);
    (0, card_reset_1.resetCardInstanceState)(card);
    p.zones.deck.unshift(card);
    return next;
}
function drawCard(state, player) {
    const next = structuredClone(state);
    const deck = next.players[player].zones.deck;
    if (deck.length === 0) {
        next.players[player].flags.owedDraws += 1;
        next.eventLog.push({ type: "deckOut", player });
        return next;
    }
    const [card] = deck.splice(0, 1);
    next.players[player].zones.hand.push(card);
    next.eventLog.push({ type: "draw", player });
    return next;
}
function shuffleDeck(state, player) {
    const next = structuredClone(state);
    const deck = next.players[player].zones.deck;
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return next;
}
