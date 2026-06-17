"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const setup_1 = require("./phases/setup");
const filterView_1 = require("./view/filterView");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
function resolveAllChoices(state, player) {
    let current = state;
    for (let step = 0; step < 40; step++) {
        if (!current.pendingChoices)
            break;
        const choice = current.pendingChoices;
        if (choice.type === "selectTrigger") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { triggerId: choice.options[0].triggerId },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (choice.type === "selectTarget") {
            const target = choice.candidates[0]?.instanceId ??
                current.players[1].zones.field[0]?.instanceId ??
                "leader";
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { targetId: target },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (choice.type === "choose") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { optionIndex: choice.options[0].index },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (choice.type === "selectZoneCards") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: {
                    instanceIds: choice.options.slice(0, choice.count).map((o) => o.instanceId),
                },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (choice.type === "selectDeckSummon") {
            const eligible = choice.options.filter((o) => o.eligible);
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceIds: eligible.map((o) => o.instanceId) },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (choice.type === "searchDeckTop") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: choice.optional
                    ? { skip: true }
                    : { instanceId: (choice.options.find((o) => o.eligible) ?? choice.options[0]).instanceId },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        break;
    }
    return current;
}
(0, vitest_1.describe)("machina effect gaps", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("Device Diviner heals leader once per turn when a Machina card is played", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].maxPp = 10;
        const diviner = (0, factory_1.createCardInstance)("BP12-048EN", 0);
        diviner.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(diviner);
        const machinaA = (0, factory_1.createCardInstance)("BP17-077EN", 0);
        const machinaB = (0, factory_1.createCardInstance)("BP17-077EN", 0);
        state.players[0].zones.hand.push(machinaA, machinaB);
        const defBefore = state.players[0].leaderDef;
        const first = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: machinaA.instanceId });
        (0, vitest_1.expect)(first.ok).toBe(true);
        state = resolveAllChoices(first.state, 0);
        (0, vitest_1.expect)(state.players[0].leaderDef).toBe(defBefore + 1);
        const second = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: machinaB.instanceId });
        (0, vitest_1.expect)(second.ok).toBe(true);
        state = resolveAllChoices(second.state, 0);
        (0, vitest_1.expect)(state.players[0].leaderDef).toBe(defBefore + 1);
    });
    (0, vitest_1.it)("Belphomet Lord fanfare summons multiple Machina followers within total cost 6", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].maxPp = 10;
        const lord = (0, factory_1.createCardInstance)("BP07-037EN", 0);
        state.players[0].zones.hand.push(lord);
        const cheapA = (0, factory_1.createCardInstance)("BP17-T17EN", 0);
        const cheapB = (0, factory_1.createCardInstance)("BP17-T17EN", 0);
        state.players[0].zones.deck.unshift(cheapB, cheapA);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: lord.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("selectDeckSummon");
        state = resolveAllChoices(played.state, 0);
        const fieldNos = state.players[0].zones.field.map((c) => c.cardNo);
        (0, vitest_1.expect)(fieldNos).toContain("BP07-037EN");
        (0, vitest_1.expect)(fieldNos.filter((n) => n === "BP17-T17EN").length).toBe(2);
    });
    (0, vitest_1.it)("Belphomet Lord start of end buffs other Machina only", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.endStartAbilitiesQueued = false;
        const lord = (0, factory_1.createCardInstance)("BP07-037EN", 0);
        lord.onFieldSinceTurnStart = true;
        const ally = (0, factory_1.createCardInstance)("BP17-T17EN", 0);
        ally.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(lord, ally);
        const end = (0, applyAction_1.applyAction)(state, 0, { type: "END_MAIN" });
        (0, vitest_1.expect)(end.ok).toBe(true);
        state = resolveAllChoices(end.state, 0);
        const lordStats = (0, queries_1.getEffectiveStats)(state.players[0].zones.field.find((c) => c.cardNo === "BP07-037EN"), state);
        const allyStats = (0, queries_1.getEffectiveStats)(state.players[0].zones.field.find((c) => c.cardNo === "BP17-T17EN"), state);
        (0, vitest_1.expect)(lordStats.atk).toBe(5);
        (0, vitest_1.expect)(allyStats.atk).toBe(2);
        (0, vitest_1.expect)(allyStats.def).toBe(2);
    });
    (0, vitest_1.it)("Belphomet Ultimate Creator buries Machina 6+ and applies conditional branches", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].maxPp = 10;
        const sixCost = (0, factory_1.createCardInstance)("BP12-035EN", 0);
        sixCost.onFieldSinceTurnStart = true;
        const sevenCost = (0, factory_1.createCardInstance)("BP07-037EN", 0);
        sevenCost.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(sixCost, sevenCost);
        const enemy = (0, factory_1.createCardInstance)("BP17-T17EN", 1);
        enemy.onFieldSinceTurnStart = true;
        state.players[1].zones.field.push(enemy);
        const creator = (0, factory_1.createCardInstance)("BP17-040EN", 0);
        state.players[0].zones.hand.push(creator);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: creator.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        state = resolveAllChoices(played.state, 0);
        (0, vitest_1.expect)(state.players[0].zones.field.some((c) => c.cardNo === "BP12-T04EN")).toBe(true);
        (0, vitest_1.expect)(state.players[1].zones.field.some((c) => c.instanceId === enemy.instanceId)).toBe(false);
        const remainingMachina = state.players[0].zones.field.filter((c) => ["BP17-040EN", "BP12-T04EN"].includes(c.cardNo));
        (0, vitest_1.expect)(remainingMachina.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)("Delta Cannon in cemetery triggers with Tetra fanfare for order choice", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].maxPp = 5;
        const delta = (0, factory_1.createCardInstance)("BP07-041EN", 0);
        state.players[0].zones.cemetery.push(delta);
        const tetra = (0, factory_1.createCardInstance)("BP07-035EN", 0);
        state.players[0].zones.hand.push(tetra);
        const played = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: tetra.instanceId,
        });
        (0, vitest_1.expect)(played.ok).toBe(true);
        state = played.state;
        (0, vitest_1.expect)(state.pendingChoices?.type).toBe("selectTrigger");
        if (state.pendingChoices?.type !== "selectTrigger")
            throw new Error("expected selectTrigger");
        const labels = state.pendingChoices.options.map((o) => o.label);
        (0, vitest_1.expect)(labels.some((l) => l.includes("Fanfare"))).toBe(true);
        (0, vitest_1.expect)(labels.some((l) => l.includes("Delta Cannon"))).toBe(true);
    });
    (0, vitest_1.it)("Tetra Rebel Evo discounts Machina cards played from EX area by 1", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 0;
        state.players[0].maxPp = 10;
        const tetra = (0, factory_1.createCardInstance)("BP07-036EN", 0);
        tetra.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(tetra);
        const assembly = (0, factory_1.createCardInstance)("BP17-T18EN", 0);
        state.players[0].zones.exArea.push(assembly);
        (0, vitest_1.expect)((0, queries_1.getEffectivePlayCost)(assembly, "BP17-T18EN", state, 0, "exArea")).toBe(0);
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions).toContain(`PLAY:${assembly.instanceId}`);
        const played = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: assembly.instanceId,
        });
        (0, vitest_1.expect)(played.ok).toBe(true);
    });
    (0, vitest_1.it)("Tetra Rebel Evo damages an enemy follower up to 4 times per turn when playing Machina", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].maxPp = 10;
        const tetra = (0, factory_1.createCardInstance)("BP07-036EN", 0);
        tetra.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(tetra);
        const enemy = (0, factory_1.createCardInstance)("BP07-037EN", 1);
        enemy.onFieldSinceTurnStart = true;
        state.players[1].zones.field.push(enemy);
        const plays = Array.from({ length: 5 }, () => (0, factory_1.createCardInstance)("BP17-T18EN", 0));
        state.players[0].zones.exArea.push(...plays);
        let enemyDef = (0, queries_1.getEffectiveStats)(enemy, state).def;
        for (let i = 0; i < 4; i++) {
            const card = state.players[0].zones.exArea[0];
            const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: card.instanceId });
            (0, vitest_1.expect)(played.ok).toBe(true);
            state = resolveAllChoices(played.state, 0);
            const enemyOnField = state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
            (0, vitest_1.expect)(enemyOnField).toBeTruthy();
            const newDef = (0, queries_1.getEffectiveStats)(enemyOnField, state).def;
            (0, vitest_1.expect)(newDef).toBe(enemyDef - 1);
            enemyDef = newDef;
        }
        const fifth = state.players[0].zones.exArea[0];
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: fifth.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        state = resolveAllChoices(played.state, 0);
        const enemyOnField = state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
        (0, vitest_1.expect)(enemyOnField).toBeTruthy();
        (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(enemyOnField, state).def).toBe(enemyDef);
    });
    (0, vitest_1.it)("Tetra Rebel Evo onCardPlayed damage resets each turn", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 1;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].maxPp = 10;
        const tetra = (0, factory_1.createCardInstance)("BP07-036EN", 0);
        tetra.onFieldSinceTurnStart = true;
        tetra.counters["onCardPlayed:1"] = 4;
        state.players[0].zones.field.push(tetra);
        const enemy = (0, factory_1.createCardInstance)("BP07-037EN", 1);
        enemy.onFieldSinceTurnStart = true;
        state.players[1].zones.field.push(enemy);
        state = (0, setup_1.beginStartPhase)(state);
        const tetraOnField = state.players[0].zones.field.find((c) => c.cardNo === "BP07-036EN");
        (0, vitest_1.expect)(tetraOnField?.counters["onCardPlayed:1"]).toBeUndefined();
        const turnTwoPlay = (0, factory_1.createCardInstance)("BP17-T18EN", 0);
        state.players[0].zones.exArea.push(turnTwoPlay);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: turnTwoPlay.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        state = resolveAllChoices(played.state, 0);
        const enemyOnField = state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
        (0, vitest_1.expect)(enemyOnField).toBeTruthy();
        (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(enemyOnField, state).def).toBe(4);
    });
    (0, vitest_1.it)("Worldreaver hand activate banishes EX tokens, moves to EX, and summons a tentacle", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].maxPp = 10;
        const worldreaver = (0, factory_1.createCardInstance)("BP12-035EN", 0);
        state.players[0].zones.hand.push(worldreaver);
        state.players[0].zones.exArea.push((0, factory_1.createCardInstance)("BP17-T17EN", 0), (0, factory_1.createCardInstance)("BP17-T18EN", 0));
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions).toContain(`ACTIVATE_HAND:${worldreaver.instanceId}`);
        const activated = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE_HAND",
            handInstanceId: worldreaver.instanceId,
        });
        (0, vitest_1.expect)(activated.ok).toBe(true);
        state = resolveAllChoices(activated.state, 0);
        (0, vitest_1.expect)(state.players[0].zones.exArea.some((c) => c.cardNo === "BP12-035EN")).toBe(true);
        (0, vitest_1.expect)(state.players[0].zones.hand.some((c) => c.cardNo === "BP12-035EN")).toBe(false);
        (0, vitest_1.expect)(state.players[0].zones.exArea.length).toBe(1);
        (0, vitest_1.expect)(state.players[0].zones.field.some((c) => ["BP12-T03EN", "BP12-T04EN"].includes(c.cardNo))).toBe(true);
    });
});
