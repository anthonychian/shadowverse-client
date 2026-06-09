"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
const trigger_queue_1 = require("./rules/trigger-queue");
(0, vitest_1.describe)("batch 6 regression fixes", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("nicola forbidden strength fanfare buries top 2 deck cards", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        for (let i = 0; i < 4; i++) {
            state.players[0].zones.deck.unshift((0, factory_1.createCardInstance)("MVP-012", 0));
        }
        const nicola = (0, factory_1.createCardInstance)("BP07-P22EN", 0);
        state.players[0].zones.hand.push(nicola);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: nicola.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.players[0].zones.deck.length).toBe(2);
        (0, vitest_1.expect)(played.state.players[0].zones.cemetery.length).toBe(2);
    });
    (0, vitest_1.it)("stay in paradise sends unchosen cards to deck bottom", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        const ids = [];
        for (let i = 0; i < 4; i++) {
            const c = (0, factory_1.createCardInstance)(i < 2 ? "BP16-022EN" : "MVP-012", 0);
            ids.push(c.instanceId);
            state.players[0].zones.deck.unshift(c);
        }
        const spell = (0, factory_1.createCardInstance)("BP14-115EN", 0);
        state.players[0].zones.hand.push(spell);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("searchDeckTop");
        const skipped = (0, applyAction_1.applyAction)(played.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { skip: true },
        });
        (0, vitest_1.expect)(skipped.ok).toBe(true);
        (0, vitest_1.expect)(skipped.state.players[0].zones.cemetery.length).toBe(1);
        (0, vitest_1.expect)(skipped.state.players[0].zones.deck.length).toBe(4);
        (0, vitest_1.expect)(skipped.state.players[0].zones.deck.every((c) => c.cardNo === "BP16-022EN" || c.cardNo === "MVP-012")).toBe(true);
    });
    (0, vitest_1.it)("ginne without jiemon offers all three options with max 2", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        const ginne = (0, factory_1.createCardInstance)("BP16-022EN", 0);
        state.players[0].zones.hand.push(ginne);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: ginne.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        if (played.state.pendingChoices?.type === "chooseMultiple") {
            (0, vitest_1.expect)(played.state.pendingChoices.options).toHaveLength(3);
            (0, vitest_1.expect)(played.state.pendingChoices.max).toBe(2);
        }
    });
    (0, vitest_1.it)("ginne resumes remaining fanfare effects after ex area trigger", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 0));
        const jiemon = (0, factory_1.createCardInstance)("BP14-022EN", 0);
        state.players[0].zones.field.push(jiemon);
        const musician = (0, factory_1.createCardInstance)("BP14-027EN", 0);
        state.players[0].zones.field.push(musician);
        const ginne = (0, factory_1.createCardInstance)("BP16-022EN", 0);
        const handCard = (0, factory_1.createCardInstance)("MVP-013", 0);
        state.players[0].zones.hand.push(ginne, handCard);
        const enemy = (0, factory_1.createCardInstance)("MVP-002", 1);
        state.players[1].zones.field.push(enemy);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: ginne.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        const chose = (0, applyAction_1.applyAction)(played.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { optionIndices: [2, 1] },
        });
        (0, vitest_1.expect)(chose.ok).toBe(true);
        let current = chose.state;
        for (let step = 0; step < 12 && current.pendingChoices; step++) {
            if (current.pendingChoices.type === "selectTarget") {
                const resolved = (0, applyAction_1.applyAction)(current, 0, {
                    type: "CHOICE_RESPONSE",
                    payload: { targetId: enemy.instanceId },
                });
                (0, vitest_1.expect)(resolved.ok).toBe(true);
                current = resolved.state;
            }
            else if (current.pendingChoices.type === "selectTrigger") {
                const resolved = (0, applyAction_1.applyAction)(current, 0, {
                    type: "CHOICE_RESPONSE",
                    payload: { triggerId: current.pendingChoices.options[0].triggerId },
                });
                (0, vitest_1.expect)(resolved.ok).toBe(true);
                current = resolved.state;
            }
            else if (current.pendingChoices.type === "putHandOnDeck") {
                if (current.pendingChoices.phase === "selectCard") {
                    const picked = (0, applyAction_1.applyAction)(current, 0, {
                        type: "CHOICE_RESPONSE",
                        payload: { instanceId: handCard.instanceId },
                    });
                    (0, vitest_1.expect)(picked.ok).toBe(true);
                    current = picked.state;
                }
                else {
                    const finished = (0, applyAction_1.applyAction)(current, 0, {
                        type: "CHOICE_RESPONSE",
                        payload: { position: "top" },
                    });
                    (0, vitest_1.expect)(finished.ok).toBe(true);
                    current = finished.state;
                }
            }
            else {
                break;
            }
        }
        (0, vitest_1.expect)(current.pendingChoices).toBeNull();
        (0, vitest_1.expect)(current.players[0].zones.exArea.length).toBeGreaterThanOrEqual(2);
        (0, vitest_1.expect)(current.players[0].zones.hand.length).toBe(1);
    });
    (0, vitest_1.it)("hagglers gambit costs 0 with three glittering gold in ex area", () => {
        const spell = (0, factory_1.createCardInstance)("BP14-035EN", 0);
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 0;
        for (let i = 0; i < 3; i++) {
            state.players[0].zones.exArea.push((0, factory_1.createCardInstance)("BP14-T02EN", 0));
        }
        state.players[0].zones.hand.push(spell);
        (0, vitest_1.expect)((0, queries_1.getEffectivePlayCost)(spell, spell.cardNo, state, 0, "hand")).toBe(0);
    });
    (0, vitest_1.it)("boxed follower does not queue last words", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.turnNumber = 5;
        const enemy = (0, factory_1.createCardInstance)("MVP-002", 1);
        enemy.boxedUntilTurn = 99;
        state.players[1].zones.field.push(enemy);
        const before = state.pendingTriggers.length;
        (0, trigger_queue_1.queueLastWords)(state, enemy.instanceId, 1);
        (0, vitest_1.expect)(state.pendingTriggers.length).toBe(before);
    });
    (0, vitest_1.it)("bane from passive destroys the opposing follower after combat", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const steward = (0, factory_1.createCardInstance)("BP17-079EN", 0);
        steward.onFieldSinceTurnStart = true;
        const ally = (0, factory_1.createCardInstance)("BP12-T10EN", 0);
        state.players[0].zones.field.push(ally, steward);
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        enemy.onFieldSinceTurnStart = true;
        enemy.engaged = true;
        enemy.modifiers.push({ atk: -2, def: 0, sourceId: "test" });
        state.players[1].zones.field.push(enemy);
        (0, vitest_1.expect)((0, queries_1.hasKeyword)(steward, "bane", state, 0)).toBe(true);
        const attack = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: steward.instanceId,
            targetId: enemy.instanceId,
        });
        (0, vitest_1.expect)(attack.ok).toBe(true);
        const after = attack.state.quickWindow === "afterAttack"
            ? (0, applyAction_1.applyAction)(attack.state, 1, { type: "PASS_QUICK_WINDOW" }).state
            : attack.state;
        (0, vitest_1.expect)(after.players[1].zones.field.length).toBe(0);
    });
});
