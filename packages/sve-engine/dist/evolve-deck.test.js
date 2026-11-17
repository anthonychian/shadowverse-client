"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const factory_1 = require("./state/factory");
const resolver_1 = require("./effects/resolver");
const evolve_deck_1 = require("./state/evolve-deck");
const zones_1 = require("./state/zones");
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
    (0, vitest_1.it)("returns a destroyed Advanced follower to the evolve deck", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.pendingChoices = null;
        state.players[0].zones.evolveDeck.push((0, factory_1.createCardInstance)("BP14-019EN", 0));
        state = (0, resolver_1.resolveEffect)(state, { op: "summonFromEvolveDeck", filter: { cardNo: "BP14-019EN" } }, 0);
        (0, vitest_1.expect)(state.players[0].zones.field).toHaveLength(1);
        const advanced = state.players[0].zones.field[0];
        (0, vitest_1.expect)(advanced.advancedFromEvolveDeck).toBe(true);
        const destroyed = (0, zones_1.destroyFollower)(state, advanced.instanceId);
        (0, vitest_1.expect)(destroyed.players[0].zones.cemetery).toHaveLength(0);
        (0, vitest_1.expect)(destroyed.players[0].zones.evolveDeck).toHaveLength(1);
        (0, vitest_1.expect)(destroyed.players[0].zones.evolveDeck[0].instanceId).toBe(advanced.instanceId);
        (0, vitest_1.expect)(destroyed.players[0].zones.evolveDeck[0].evoSpent).toBe(true);
    });
    (0, vitest_1.it)("routes field-to-cemetery moves for Advanced followers to the evolve deck", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        const advanced = (0, factory_1.createCardInstance)("BP10-004EN", 0);
        advanced.advancedFromEvolveDeck = true;
        state.players[0].zones.field.push(advanced);
        const moved = (0, zones_1.moveCard)(state, advanced.instanceId, "cemetery", 0);
        (0, vitest_1.expect)(moved.players[0].zones.cemetery).toHaveLength(0);
        (0, vitest_1.expect)(moved.players[0].zones.evolveDeck.some((c) => c.instanceId === advanced.instanceId)).toBe(true);
    });
});
