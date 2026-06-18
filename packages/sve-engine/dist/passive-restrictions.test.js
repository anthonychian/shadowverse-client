"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
(0, vitest_1.describe)("passive attack restrictions", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("ward forces attacks onto engaged ward followers", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        const attacker = (0, factory_1.createCardInstance)("MVP-013", 0);
        attacker.onFieldSinceTurnStart = true;
        const ward = (0, factory_1.createCardInstance)("MVP-002", 1);
        ward.onFieldSinceTurnStart = true;
        ward.engaged = true;
        const other = (0, factory_1.createCardInstance)("MVP-012", 1);
        other.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(attacker);
        state.players[1].zones.field.push(ward, other);
        const targets = (0, queries_1.getLegalAttackTargets)(state, attacker, 0);
        (0, vitest_1.expect)(targets.some((t) => t.type === "follower" && t.instanceId === ward.instanceId)).toBe(true);
        (0, vitest_1.expect)(targets.some((t) => t.type === "follower" && t.instanceId === other.instanceId)).toBe(false);
    });
});
