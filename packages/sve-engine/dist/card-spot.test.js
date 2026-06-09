"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const registry_1 = require("./cards/registry");
const factory_1 = require("./state/factory");
const resolver_1 = require("./effects/resolver");
const MVP_CARDS = [
    "MVP-001", "MVP-002", "MVP-006", "MVP-007", "MVP-009",
    "MVP-010", "MVP-013", "MVP-014", "MVP-020", "MVP-021",
];
(0, vitest_1.describe)("MVP card definitions", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    for (const cardNo of MVP_CARDS) {
        (0, vitest_1.it)(`${cardNo} is registered`, () => {
            (0, vitest_1.expect)((0, registry_1.getCardDef)(cardNo)).toBeDefined();
        });
    }
    (0, vitest_1.it)("Fanfare Scholar draws on fanfare", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.players[0].zones.deck = [(0, factory_1.createCardInstance)("MVP-012", 0)];
        const before = state.players[0].zones.hand.length;
        state = (0, resolver_1.resolveEffect)(state, { op: "draw", count: 1 }, 0);
        (0, vitest_1.expect)(state.players[0].zones.hand.length).toBe(before + 1);
    });
    (0, vitest_1.it)("Healing Prayer heals leader", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.players[0].leaderDef = 15;
        state = (0, resolver_1.resolveEffect)(state, { op: "healLeader", amount: 2 }, 0);
        (0, vitest_1.expect)(state.players[0].leaderDef).toBe(17);
    });
    (0, vitest_1.it)("Token Summoner adds token to field", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state = (0, resolver_1.resolveEffect)(state, { op: "summon", tokenCardNo: "MVP-020", count: 1, zone: "field" }, 0);
        (0, vitest_1.expect)(state.players[0].zones.field.length).toBe(1);
        (0, vitest_1.expect)(state.players[0].zones.field[0].cardNo).toBe("MVP-020");
    });
});
