"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const registry_1 = require("./cards/registry");
const reprints_1 = require("./cards/reprints");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
(0, vitest_1.describe)("batch 4 regression fixes", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("treats type base as base identity even with specialType evolved", () => {
        const jiemon = (0, registry_1.getCardDef)("BP14-022EN");
        (0, vitest_1.expect)(jiemon).toBeDefined();
        (0, vitest_1.expect)((0, reprints_1.cardIdentityKey)(jiemon)).toBe("Jiemon, Thief Lord|base");
        (0, vitest_1.expect)((0, queries_1.resolveCardDefCost)("BP14-022EN")).toBe(4);
    });
    (0, vitest_1.it)("unevolved promo keeps non-zero play cost", () => {
        const mono = (0, registry_1.getCardDef)("BP07-SL13EN");
        (0, vitest_1.expect)(mono?.cost).toBe(2);
        (0, vitest_1.expect)((0, queries_1.getEffectivePlayCost)((0, factory_1.createCardInstance)("BP07-SL13EN", 0), "BP07-SL13EN")).toBe(2);
    });
    (0, vitest_1.it)("aura blocks effect targeting while reserved", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        const leod = (0, factory_1.createCardInstance)("SDD02-006EN", 1);
        leod.engaged = false;
        state.players[1].zones.field.push(leod);
        const attacker = (0, factory_1.createCardInstance)("BP17-SL20EN", 0);
        attacker.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(attacker);
        for (let i = 0; i < 2; i++) {
            state.players[0].zones.field.push((0, factory_1.createCardInstance)("BP17-083EN", 0));
        }
        const attack = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: attacker.instanceId,
            targetId: leod.instanceId,
        });
        (0, vitest_1.expect)(attack.ok).toBe(false);
        (0, vitest_1.expect)((0, queries_1.hasKeyword)(leod, "aura", state, 1)).toBe(true);
    });
    (0, vitest_1.it)("mono activate prompts to choose cemetery banish when more than two match", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        const mono = (0, factory_1.createCardInstance)("BP07-SL13EN", 0);
        for (let i = 0; i < 4; i++) {
            state.players[0].zones.field.push((0, factory_1.createCardInstance)("BP17-083EN", 0));
        }
        state.players[0].zones.field.push(mono);
        for (let i = 0; i < 3; i++) {
            state.players[0].zones.cemetery.push((0, factory_1.createCardInstance)("BP17-083EN", 0));
        }
        const first = (0, applyAction_1.applyAction)(state, 0, { type: "ACTIVATE", fieldInstanceId: mono.instanceId });
        (0, vitest_1.expect)(first.ok).toBe(true);
        (0, vitest_1.expect)(first.state.pendingChoices?.type).toBe("selectZoneCards");
        if (first.state.pendingChoices?.type === "selectZoneCards") {
            (0, vitest_1.expect)(first.state.pendingChoices.count).toBe(2);
        }
    });
    (0, vitest_1.it)("strike target choice resumes combat instead of locking phase", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const attacker = (0, factory_1.createCardInstance)("BP17-SL20EN", 0);
        attacker.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(attacker);
        for (let i = 0; i < 2; i++) {
            state.players[0].zones.field.push((0, factory_1.createCardInstance)("BP17-083EN", 0));
        }
        const targetA = (0, factory_1.createCardInstance)("MVP-012", 1);
        const targetB = (0, factory_1.createCardInstance)("MVP-012", 1);
        targetA.engaged = true;
        targetB.engaged = true;
        state.players[1].zones.field.push(targetA, targetB);
        state.players[1].zones.hand.push((0, factory_1.createCardInstance)("BP17-T18EN", 1));
        state.players[1].pp = 1;
        state.players[1].maxPp = 1;
        const declared = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: attacker.instanceId,
            targetId: targetB.instanceId,
        });
        (0, vitest_1.expect)(declared.ok).toBe(true);
        (0, vitest_1.expect)(declared.state.pendingChoices?.type).toBe("selectTarget");
        (0, vitest_1.expect)(declared.state.phase).toBe("main");
        const resolved = (0, applyAction_1.applyAction)(declared.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { targetId: targetA.instanceId },
        });
        (0, vitest_1.expect)(resolved.ok).toBe(true);
        (0, vitest_1.expect)(resolved.state.phase).toBe("main");
        (0, vitest_1.expect)(resolved.state.quickWindow).toBe("afterAttack");
        const afterPass = (0, applyAction_1.applyAction)(resolved.state, 1, { type: "PASS_QUICK_WINDOW" });
        (0, vitest_1.expect)(afterPass.ok).toBe(true);
        (0, vitest_1.expect)(afterPass.state.combat).toBeNull();
    });
});
