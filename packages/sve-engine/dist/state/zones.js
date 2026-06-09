"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveCard = moveCard;
exports.removeFromField = removeFromField;
exports.destroyFollower = destroyFollower;
exports.drawCard = drawCard;
exports.shuffleDeck = shuffleDeck;
const tokens_1 = require("../cards/tokens");
const confirmation_1 = require("../rules/confirmation");
const card_reset_1 = require("./card-reset");
const queries_1 = require("./queries");
function moveCard(state, instanceId, toZone, toPlayer) {
    const found = (0, queries_1.findInstance)(state, instanceId);
    if (!found)
        return state;
    const next = structuredClone(state);
    const fromZones = next.players[found.player].zones;
    const fromList = fromZones[found.zone];
    const idx = fromList.findIndex((c) => c.instanceId === instanceId);
    if (idx < 0)
        return state;
    const [card] = fromList.splice(idx, 1);
    let actualZone = toZone;
    if (toZone === "cemetery") {
        actualZone = (0, tokens_1.destinationForDestroyedCard)(card.cardNo);
    }
    card.controller = toPlayer;
    const toList = next.players[toPlayer].zones[actualZone];
    toList.push(card);
    if (actualZone === "cemetery" || actualZone === "banish") {
        (0, card_reset_1.resetCardInstanceState)(card);
    }
    else if (toZone === "field") {
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
    const dest = (0, tokens_1.destinationForDestroyedCard)(card.cardNo);
    (0, card_reset_1.resetCardInstanceState)(card);
    p.zones[dest].push(card);
    return { state: next, card, player: found.player };
}
function destroyFollower(state, instanceId) {
    const removed = removeFromField(state, instanceId);
    if (!removed)
        return state;
    let next = removed.state;
    const link = next.players[removed.player].zones.evolveZone.find((l) => l.fieldInstanceId === instanceId);
    if (link) {
        const evoIdx = next.players[removed.player].zones.resolutionZone.findIndex((c) => c.instanceId === link.evolveInstanceId);
        if (evoIdx >= 0) {
            const [evoCard] = next.players[removed.player].zones.resolutionZone.splice(evoIdx, 1);
            (0, card_reset_1.resetCardInstanceState)(evoCard);
            next.players[removed.player].zones.evolveDeck.push(evoCard);
        }
        else {
            next = moveCard(next, link.evolveInstanceId, "evolveDeck", removed.player);
            const evoInDeck = next.players[removed.player].zones.evolveDeck.find((c) => c.instanceId === link.evolveInstanceId);
            if (evoInDeck)
                (0, card_reset_1.resetCardInstanceState)(evoInDeck);
        }
        next.players[removed.player].zones.evolveZone = next.players[removed.player].zones.evolveZone.filter((l) => l.fieldInstanceId !== instanceId);
    }
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
