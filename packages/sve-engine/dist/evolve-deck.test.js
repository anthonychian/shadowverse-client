"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const factory_1 = require("./state/factory");
const resolver_1 = require("./effects/resolver");
const evolve_deck_1 = require("./state/evolve-deck");
(0, vitest_1.describe)("evolve deck primitives", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("turnEvolveDeck flips facedown cards faceup", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        const evo = (0, factory_1.createCardInstance)("MVP-014", 0);
        evo.evoSpent = false;
        state.players[0].zones.evolveDeck.push(evo);
        state = (0, resolver_1.resolveEffect)(state, {
            op: "turnEvolveDeck",
            orientation: "faceup",
            count: 1,
        }, 0);
        (0, vitest_1.expect)(state.players[0].zones.evolveDeck[0].evoSpent).toBe(true);
        (0, vitest_1.expect)((0, evolve_deck_1.countEvolveDeckFaceup)(state, 0)).toBe(1);
    });
    (0, vitest_1.it)("recoverPp uses evolve deck faceup count", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.players[0].pp = 0;
        state.players[0].maxPp = 10;
        for (let i = 0; i < 2; i++) {
            const evo = (0, factory_1.createCardInstance)("MVP-014", 0);
            evo.evoSpent = true;
            state.players[0].zones.evolveDeck.push(evo);
        }
        state = (0, resolver_1.resolveEffect)(state, {
            op: "recoverPp",
            amount: { op: "evolveDeckFaceupCount" },
        }, 0);
        (0, vitest_1.expect)(state.players[0].pp).toBe(2);
    });
});
