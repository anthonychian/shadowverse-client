"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const registry_1 = require("./cards/registry");
const setup_1 = require("./phases/setup");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
(0, vitest_1.describe)("boxed and activate limits", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("boxed follower loses keywords and cannot activate", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 5;
        state.pendingChoices = null;
        const naht = (0, factory_1.createCardInstance)("BP11-018EN", 0);
        state.players[0].zones.field.push(naht);
        state.players[0].pp = 5;
        const enemy = (0, factory_1.createCardInstance)("MVP-002", 1);
        state.players[1].zones.field.push(enemy);
        const boxedStart = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE",
            fieldInstanceId: naht.instanceId,
        });
        (0, vitest_1.expect)(boxedStart.ok).toBe(true);
        (0, vitest_1.expect)(boxedStart.state.pendingChoices?.type).toBe("selectTarget");
        const boxed = (0, applyAction_1.applyAction)(boxedStart.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { targetId: enemy.instanceId },
        });
        (0, vitest_1.expect)(boxed.ok).toBe(true);
        const enemyOnBoard = boxed.state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
        (0, vitest_1.expect)((0, queries_1.isBoxed)(enemyOnBoard, boxed.state)).toBe(true);
        (0, vitest_1.expect)((0, queries_1.hasKeyword)(enemyOnBoard, "ward", boxed.state, 1)).toBe(false);
        (0, vitest_1.expect)((0, queries_1.getActivatedAbilities)(boxed.state, enemyOnBoard, 1, "field")).toHaveLength(0);
    });
    (0, vitest_1.it)("once per turn activate is blocked after first use", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].maxPp = 5;
        const mono = (0, factory_1.createCardInstance)("BP07-SL13EN", 0);
        for (let i = 0; i < 4; i++) {
            state.players[0].zones.field.push((0, factory_1.createCardInstance)("BP17-083EN", 0));
        }
        state.players[0].zones.field.push(mono);
        state.players[0].zones.cemetery.push((0, factory_1.createCardInstance)("BP17-083EN", 0), (0, factory_1.createCardInstance)("BP17-083EN", 0));
        const firstStart = (0, applyAction_1.applyAction)(state, 0, { type: "ACTIVATE", fieldInstanceId: mono.instanceId });
        (0, vitest_1.expect)(firstStart.ok).toBe(true);
        (0, vitest_1.expect)(firstStart.state.pendingChoices?.type).toBe("selectZoneCards");
        const cemeteryIds = state.players[0].zones.cemetery.map((c) => c.instanceId);
        const first = (0, applyAction_1.applyAction)(firstStart.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: cemeteryIds },
        });
        (0, vitest_1.expect)(first.ok).toBe(true);
        (0, vitest_1.expect)((0, queries_1.getActivatedAbilities)(first.state, mono, 0, "field")).toHaveLength(0);
        const second = (0, applyAction_1.applyAction)(first.state, 0, { type: "ACTIVATE", fieldInstanceId: mono.instanceId });
        (0, vitest_1.expect)(second.ok).toBe(false);
    });
    (0, vitest_1.it)("play cost reduction applies from EX area", () => {
        const card = (0, factory_1.createCardInstance)("BP11-P07EN", 0);
        card.playCostReduction = 1;
        const cost = (0, queries_1.getEffectivePlayCost)(card, card.cardNo);
        const base = (0, registry_1.getCardDef)("BP11-P07EN")?.cost ?? 0;
        (0, vitest_1.expect)(cost).toBe(Math.max(0, base - 1));
    });
    (0, vitest_1.it)("assembly droid activates when 3 Machina followers are on field", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        const droids = Array.from({ length: 3 }, () => (0, factory_1.createCardInstance)("BP12-T10EN", 0));
        for (const droid of droids) {
            droid.onFieldSinceTurnStart = true;
            state.players[0].zones.field.push(droid);
        }
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        state.players[1].zones.field.push(enemy);
        (0, vitest_1.expect)((0, queries_1.getActivatedAbilities)(state, droids[0], 0, "field").length).toBe(1);
        const buryPrompt = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE",
            fieldInstanceId: droids[0].instanceId,
        });
        (0, vitest_1.expect)(buryPrompt.ok).toBe(true);
        (0, vitest_1.expect)(buryPrompt.state.pendingChoices?.type).toBe("selectZoneCards");
        const buried = (0, applyAction_1.applyAction)(buryPrompt.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: droids.map((d) => d.instanceId) },
        });
        (0, vitest_1.expect)(buried.ok).toBe(true);
        (0, vitest_1.expect)(buried.state.pendingChoices?.type).toBe("selectTarget");
        const result = (0, applyAction_1.applyAction)(buried.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { targetId: enemy.instanceId },
        });
        (0, vitest_1.expect)(result.ok).toBe(true);
        (0, vitest_1.expect)(result.state.players[0].zones.field.length).toBe(0);
    });
    (0, vitest_1.it)("boxed follower does not refresh on controller start phase", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.turnNumber = 6;
        state.activePlayer = 1;
        const enemy = (0, factory_1.createCardInstance)("MVP-002", 1);
        enemy.boxedUntilTurn = 7;
        enemy.engaged = true;
        enemy.onFieldSinceTurnStart = false;
        state.players[1].zones.field.push(enemy);
        state = (0, setup_1.beginStartPhase)(state);
        const onField = state.players[1].zones.field[0];
        (0, vitest_1.expect)((0, queries_1.isBoxed)(onField, state)).toBe(true);
        (0, vitest_1.expect)(onField.engaged).toBe(true);
        (0, vitest_1.expect)(onField.onFieldSinceTurnStart).toBe(false);
    });
});
