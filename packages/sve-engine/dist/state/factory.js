"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextId = nextId;
exports.resetIdCounter = resetIdCounter;
exports.createCardInstance = createCardInstance;
exports.emptyPlayer = emptyPlayer;
exports.createInitialGameState = createInitialGameState;
let idCounter = 0;
function nextId(prefix = "c") {
    idCounter += 1;
    return `${prefix}_${idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}
function resetIdCounter() {
    idCounter = 0;
}
function createCardInstance(cardNo, owner, controller) {
    return {
        instanceId: nextId(),
        cardNo,
        owner,
        controller: controller ?? owner,
        engaged: false,
        modifiers: [],
        counters: {},
        enteredFieldTurn: 0,
        evolvedThisTurn: false,
        superEvolved: false,
        onFieldSinceTurnStart: false,
        foughtWithBane: false,
        grantedKeywords: [],
        playCostReduction: 0,
        abilitiesActivatedThisTurn: [],
        grantedLastWords: [],
    };
}
function emptyPlayer(player) {
    return {
        leaderDef: 20,
        pp: 0,
        maxPp: 0,
        evoPoints: player === 1 ? 3 : 0,
        superEvoPoints: 1,
        turnsPassed: 0,
        handLimit: 7,
        fieldLimit: 5,
        exLimit: 5,
        zones: {
            deck: [],
            hand: [],
            field: [],
            exArea: [],
            evolveDeck: [],
            evolveZone: [],
            cemetery: [],
            banish: [],
            raceZone: [],
            driveZone: [],
            triggerZone: [],
            resolutionZone: [],
        },
        flags: {
            evolvedThisTurn: false,
            cardsPlayedThisTurn: 0,
            mulliganDone: false,
            leaderLostDefThisTurn: false,
            owedDraws: 0,
        },
    };
}
function createInitialGameState(firstPlayer = 0) {
    return {
        players: [emptyPlayer(0), emptyPlayer(1)],
        activePlayer: firstPlayer,
        turnNumber: 0,
        phase: "mulligan",
        firstPlayer,
        winner: null,
        pendingTriggers: [],
        pendingChoices: { type: "mulligan", player: firstPlayer },
        combat: null,
        quickWindow: null,
        eventLog: [],
        resolutionContext: null,
    };
}
