"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const conditions_1 = require("./state/conditions");
const factory_1 = require("./state/factory");
(0, vitest_1.describe)("spellchain and combo cost modifiers", () => {
    (0, vitest_1.it)("evaluates spellchain condition from distinct spell names in cemetery", () => {
        const state = (0, factory_1.createInitialGameState)(0);
        for (let i = 0; i < 3; i++) {
            state.players[0].zones.cemetery.push((0, factory_1.createCardInstance)("BP14-035EN", 0));
        }
        (0, vitest_1.expect)((0, conditions_1.evalCondition)(state, 0, { type: "spellchain", count: 1 })).toBe(true);
        (0, vitest_1.expect)((0, conditions_1.evalCondition)(state, 0, { type: "spellchain", count: 2 })).toBe(false);
    });
});
