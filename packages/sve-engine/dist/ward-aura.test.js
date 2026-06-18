"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const registry_1 = require("./cards/registry");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
(0, vitest_1.describe)("ward aura", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("engaged ward follower blocks leader attacks", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        const attacker = (0, factory_1.createCardInstance)("MVP-013", 0);
        attacker.onFieldSinceTurnStart = true;
        const ward = (0, factory_1.createCardInstance)("BP17-083EN", 1);
        ward.onFieldSinceTurnStart = true;
        ward.engaged = true;
        state.players[0].zones.field.push(attacker);
        state.players[1].zones.field.push(ward);
        (0, vitest_1.expect)((0, queries_1.hasKeyword)(ward, "ward", state, 1)).toBe(true);
        const targets = (0, queries_1.getLegalAttackTargets)(state, attacker, 0);
        (0, vitest_1.expect)(targets.some((t) => t.type === "leader")).toBe(false);
        (0, vitest_1.expect)((0, registry_1.getCardDef)("BP17-083EN")?.keywords).toContain("ward");
    });
});
