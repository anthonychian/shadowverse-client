"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const factory_1 = require("./state/factory");
const resolver_1 = require("./effects/resolver");
const confirmation_1 = require("./rules/confirmation");
(0, vitest_1.describe)("confirmation timing", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("fanfare draw increases hand size", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.players[0].zones.deck = [(0, factory_1.createCardInstance)("MVP-012", 0)];
        const fanfare = (0, factory_1.createCardInstance)("MVP-006", 0);
        state.players[0].zones.field.push(fanfare);
        const handBefore = state.players[0].zones.hand.length;
        (0, confirmation_1.queueFanfare)(state, fanfare.instanceId, 0);
        state = (0, confirmation_1.runConfirmationTiming)(state);
        (0, vitest_1.expect)(state.players[0].zones.hand.length).toBe(handBefore + 1);
    });
    (0, vitest_1.it)("deck-out loss applies after rules handling even when other events follow", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].zones.deck = [];
        state = (0, resolver_1.resolveEffect)(state, { op: "draw", count: 1 }, 0);
        state.eventLog.push({ type: "startPhase", player: 0 });
        state = (0, confirmation_1.runConfirmationTiming)(state);
        (0, vitest_1.expect)(state.phase).toBe("gameOver");
        (0, vitest_1.expect)(state.winner).toBe(1);
    });
    (0, vitest_1.it)("fulfills owed draws during rules handling when cards are added to deck", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].zones.deck = [];
        state.players[0].flags.owedDraws = 1;
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 0));
        state = (0, confirmation_1.runConfirmationTiming)(state);
        (0, vitest_1.expect)(state.phase).not.toBe("gameOver");
        (0, vitest_1.expect)(state.players[0].flags.owedDraws).toBe(0);
        (0, vitest_1.expect)(state.players[0].zones.hand.length).toBe(1);
    });
    (0, vitest_1.it)("turn-start draw with empty deck loses after rules handling", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[1].zones.deck = [];
        const ended = (0, applyAction_1.applyAction)(state, 0, { type: "END_MAIN" });
        (0, vitest_1.expect)(ended.ok).toBe(true);
        let current = ended.state;
        if (current.quickWindow === "endPhase") {
            const passed = (0, applyAction_1.applyAction)(current, 1, { type: "PASS_QUICK_WINDOW" });
            (0, vitest_1.expect)(passed.ok).toBe(true);
            current = passed.state;
        }
        (0, vitest_1.expect)(current.phase).toBe("gameOver");
        (0, vitest_1.expect)(current.winner).toBe(0);
    });
    (0, vitest_1.it)("destroys follower at zero defense", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        const follower = (0, factory_1.createCardInstance)("MVP-012", 0);
        follower.modifiers.push({ def: -2, sourceId: "test" });
        state.players[0].zones.field.push(follower);
        state = (0, confirmation_1.runConfirmationTiming)(state);
        (0, vitest_1.expect)(state.players[0].zones.field.length).toBe(0);
        (0, vitest_1.expect)(state.players[0].zones.cemetery.length).toBe(1);
    });
});
