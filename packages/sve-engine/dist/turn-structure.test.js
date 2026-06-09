"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const factory_1 = require("./state/factory");
const setup_1 = require("./phases/setup");
const MVP_DECK = [
    "MVP-012", "MVP-012", "MVP-012",
    "MVP-006", "MVP-006",
    "MVP-013", "MVP-013",
    "MVP-009", "MVP-009",
    "MVP-010",
];
function setupGame() {
    (0, factory_1.resetIdCounter)();
    let state = (0, factory_1.createInitialGameState)(0);
    state = (0, setup_1.loadDecks)(state, [
        { mainDeck: [...MVP_DECK, ...MVP_DECK, ...MVP_DECK, ...MVP_DECK], evolveDeck: ["MVP-014"] },
        { mainDeck: [...MVP_DECK, ...MVP_DECK, ...MVP_DECK, ...MVP_DECK], evolveDeck: ["MVP-014"] },
    ]);
    state = (0, applyAction_1.applyAction)(state, 0, { type: "MULLIGAN", redraw: false }).state;
    state = (0, applyAction_1.applyAction)(state, 1, { type: "MULLIGAN", redraw: false }).state;
    return state;
}
(0, vitest_1.describe)("turn structure", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("first player starts with PP refilled on turn 1", () => {
        const state = setupGame();
        (0, vitest_1.expect)(state.phase).toBe("main");
        (0, vitest_1.expect)(state.players[0].maxPp).toBe(1);
        (0, vitest_1.expect)(state.players[0].pp).toBe(1);
    });
    (0, vitest_1.it)("first player does not draw on turn 1", () => {
        const state = setupGame();
        (0, vitest_1.expect)(state.players[0].zones.hand.length).toBe(4);
    });
    (0, vitest_1.it)("advances PP on turn 2 for first player", () => {
        let state = setupGame();
        state = (0, applyAction_1.applyAction)(state, 0, { type: "END_MAIN" }).state;
        state = (0, applyAction_1.applyAction)(state, 1, { type: "PASS_QUICK_WINDOW" }).state;
        (0, vitest_1.expect)(state.activePlayer).toBe(1);
        state = (0, applyAction_1.applyAction)(state, 1, { type: "END_MAIN" }).state;
        state = (0, applyAction_1.applyAction)(state, 0, { type: "PASS_QUICK_WINDOW" }).state;
        (0, vitest_1.expect)(state.players[0].maxPp).toBe(2);
        (0, vitest_1.expect)(state.players[0].pp).toBe(2);
    });
    (0, vitest_1.it)("prompts to discard down to hand limit at end of turn", () => {
        let state = setupGame();
        state.players[0].maxPp = 10;
        state.players[0].pp = 10;
        for (let i = 0; i < 5; i++) {
            state.players[0].zones.hand.push((0, factory_1.createCardInstance)("MVP-012", 0));
        }
        const toDiscard = state.players[0].zones.hand[0].instanceId;
        state = (0, applyAction_1.applyAction)(state, 0, { type: "END_MAIN" }).state;
        state = (0, applyAction_1.applyAction)(state, 1, { type: "PASS_QUICK_WINDOW" }).state;
        (0, vitest_1.expect)(state.pendingChoices?.type).toBe("discard");
        if (state.pendingChoices?.type !== "discard")
            throw new Error("expected discard prompt");
        (0, vitest_1.expect)(state.pendingChoices.count).toBe(2);
        state = (0, applyAction_1.applyAction)(state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [toDiscard, state.players[0].zones.hand[1].instanceId] },
        }).state;
        (0, vitest_1.expect)(state.pendingChoices).toBeNull();
        (0, vitest_1.expect)(state.players[0].zones.hand.length).toBe(7);
        (0, vitest_1.expect)(state.activePlayer).toBe(1);
    });
    (0, vitest_1.it)("plays a card from the EX area", () => {
        (0, factory_1.resetIdCounter)();
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 3;
        const exCard = (0, factory_1.createCardInstance)("BP14-T01EN", 0);
        state.players[0].zones.exArea.push(exCard);
        const result = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: exCard.instanceId,
        });
        (0, vitest_1.expect)(result.ok).toBe(true);
        (0, vitest_1.expect)(result.state.players[0].zones.exArea.length).toBe(0);
        (0, vitest_1.expect)(result.state.players[0].zones.field.some((c) => c.instanceId === exCard.instanceId)).toBe(true);
        (0, vitest_1.expect)(result.state.players[0].pp).toBeLessThan(3);
    });
});
