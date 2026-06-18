"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDecks = loadDecks;
exports.applyMulligan = applyMulligan;
exports.beginStartPhase = beginStartPhase;
const detectIdentity_1 = require("../deck/detectIdentity");
const factory_1 = require("../state/factory");
const passives_1 = require("../state/passives");
const zones_1 = require("../state/zones");
const confirmation_1 = require("../rules/confirmation");
const trigger_queue_1 = require("../rules/trigger-queue");
function clearTurnScopedCardState(card) {
    card.abilitiesActivatedThisTurn = [];
    card.counters = {};
    card.modifiers = card.modifiers.filter((m) => !m.untilEndOfTurn);
    card.playCostReduction = 0;
    card.maneuveringUntilTurn = undefined;
    if (card.grantedOnCardPlayed?.length) {
        card.grantedOnCardPlayed = card.grantedOnCardPlayed.filter((g) => !g.untilEndOfTurn);
    }
}
function refreshFieldCard(card, state) {
    card.evolvedThisTurn = false;
    card.foughtWithBane = false;
    card.foughtWithInstanceId = undefined;
    clearTurnScopedCardState(card);
    if ((0, passives_1.isBoxed)(card, state)) {
        card.engaged = true;
        card.onFieldSinceTurnStart = false;
        return;
    }
    if (card.skipRefreshOnTurn != null && state.turnNumber === card.skipRefreshOnTurn) {
        card.skipRefreshOnTurn = undefined;
        card.engaged = true;
        card.onFieldSinceTurnStart = false;
        return;
    }
    card.boxedUntilTurn = undefined;
    card.engaged = false;
    card.onFieldSinceTurnStart = true;
}
function loadDecks(state, decks) {
    let next = structuredClone(state);
    for (const pid of [0, 1]) {
        const input = decks[pid];
        next.players[pid].zones.deck = input.mainDeck.map((cardNo) => (0, factory_1.createCardInstance)(cardNo, pid));
        next.players[pid].zones.evolveDeck = input.evolveDeck.map((cardNo) => (0, factory_1.createCardInstance)(cardNo, pid));
        next = (0, zones_1.shuffleDeck)(next, pid);
        if (input.universe === "idolmaster") {
            const p = next.players[pid];
            for (let i = 0; i < 5 && p.zones.exArea.length < p.exLimit; i++) {
                p.zones.exArea.push((0, factory_1.createCardInstance)(detectIdentity_1.COOL_EARRINGS_CARD_NO, pid, pid));
            }
        }
        for (let i = 0; i < 4; i++) {
            next = (0, zones_1.drawCard)(next, pid);
        }
    }
    next.phase = "mulligan";
    next.pendingChoices = { type: "mulligan", player: next.firstPlayer };
    next.eventLog.push({ type: "gamePrepared" });
    return next;
}
function applyMulligan(state, player, redraw) {
    let next = structuredClone(state);
    if (redraw) {
        const hand = next.players[player].zones.hand.splice(0);
        next.players[player].zones.deck.push(...hand);
        next = (0, zones_1.shuffleDeck)(next, player);
        for (let i = 0; i < 4; i++) {
            next = (0, zones_1.drawCard)(next, player);
        }
    }
    next.players[player].flags.mulliganDone = true;
    next.eventLog.push({ type: "mulligan", player, data: { redraw } });
    if (!next.players[0].flags.mulliganDone) {
        next.pendingChoices = { type: "mulligan", player: 0 };
        return next;
    }
    if (!next.players[1].flags.mulliganDone) {
        next.pendingChoices = { type: "mulligan", player: 1 };
        return next;
    }
    next.pendingChoices = null;
    next.turnNumber = 1;
    next.activePlayer = next.firstPlayer;
    return beginStartPhase(next);
}
function beginStartPhase(state) {
    let next = structuredClone(state);
    const player = next.activePlayer;
    const p = next.players[player];
    if (p.maxPp < 10)
        p.maxPp += 1;
    p.pp = p.maxPp;
    p.turnsPassed += 1;
    p.flags.evolvedThisTurn = false;
    p.flags.cardsPlayedThisTurn = 0;
    p.flags.leaderLostDefThisTurn = false;
    p.flags.leaderDefLostCountThisTurn = 0;
    p.flags.leaderDamageShields = 0;
    p.flags.nextPlayDiscounts = [];
    for (const card of p.zones.field) {
        refreshFieldCard(card, next);
    }
    for (const zone of ["hand", "exArea", "cemetery"]) {
        for (const card of p.zones[zone]) {
            clearTurnScopedCardState(card);
        }
    }
    const skipDraw = next.turnNumber === 1 && player === next.firstPlayer;
    if (!skipDraw) {
        next = (0, zones_1.drawCard)(next, player);
    }
    next.phase = "main";
    next.eventLog.push({ type: "startPhase", player });
    (0, trigger_queue_1.queueStartOfMainAbilities)(next, player);
    next = (0, confirmation_1.runConfirmationTiming)(next);
    return next;
}
