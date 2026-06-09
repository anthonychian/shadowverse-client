"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const filterView_1 = require("./view/filterView");
const factory_1 = require("./state/factory");
(0, vitest_1.describe)("batch 5 regression fixes", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("taketsumi fanfare summons glittering gold after discard choice", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 0));
        const taketsumi = (0, factory_1.createCardInstance)("BP14-018EN", 0);
        const filler = (0, factory_1.createCardInstance)("MVP-012", 0);
        state.players[0].zones.hand.push(taketsumi, filler);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: taketsumi.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("selectZoneCards");
        const discarded = (0, applyAction_1.applyAction)(played.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [filler.instanceId] },
        });
        (0, vitest_1.expect)(discarded.ok).toBe(true);
        (0, vitest_1.expect)(discarded.state.pendingChoices).toBeNull();
        (0, vitest_1.expect)(discarded.state.players[0].zones.exArea.some((c) => c.cardNo === "BP14-T02EN")).toBe(true);
    });
    (0, vitest_1.it)("only one evolve or advance per turn", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].evoPoints = 3;
        const first = (0, factory_1.createCardInstance)("MVP-013", 0);
        first.onFieldSinceTurnStart = true;
        const second = (0, factory_1.createCardInstance)("MVP-013", 0);
        second.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(first, second);
        state.players[0].zones.evolveDeck.push((0, factory_1.createCardInstance)("MVP-014", 0), (0, factory_1.createCardInstance)("MVP-014", 0));
        const evolved = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: first.instanceId,
            useEvoPoint: false,
        });
        (0, vitest_1.expect)(evolved.ok).toBe(true);
        (0, vitest_1.expect)(evolved.state.players[0].flags.evolvedThisTurn).toBe(true);
        const view = (0, filterView_1.createPlayerView)(evolved.state, 0);
        (0, vitest_1.expect)(view.legalActions).not.toContain(`EVOLVE:${second.instanceId}`);
        (0, vitest_1.expect)(view.legalActions).not.toContain(`EVOLVE_EP:${second.instanceId}`);
    });
    (0, vitest_1.it)("mono cemetery banish prompts when exactly two machina match", () => {
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
        for (let i = 0; i < 2; i++) {
            state.players[0].zones.cemetery.push((0, factory_1.createCardInstance)("BP17-083EN", 0));
        }
        const first = (0, applyAction_1.applyAction)(state, 0, { type: "ACTIVATE", fieldInstanceId: mono.instanceId });
        (0, vitest_1.expect)(first.ok).toBe(true);
        (0, vitest_1.expect)(first.state.pendingChoices?.type).toBe("selectZoneCards");
    });
    (0, vitest_1.it)("ginne draw and put hand on deck does not loop", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 0));
        const jiemon = (0, factory_1.createCardInstance)("BP14-022EN", 0);
        state.players[0].zones.field.push(jiemon);
        const ginne = (0, factory_1.createCardInstance)("BP16-022EN", 0);
        const handCard = (0, factory_1.createCardInstance)("MVP-013", 0);
        state.players[0].zones.hand.push(ginne, handCard);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: ginne.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("chooseMultiple");
        const chose = (0, applyAction_1.applyAction)(played.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { optionIndices: [1] },
        });
        (0, vitest_1.expect)(chose.ok).toBe(true);
        (0, vitest_1.expect)(chose.state.pendingChoices?.type).toBe("putHandOnDeck");
        const picked = (0, applyAction_1.applyAction)(chose.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceId: handCard.instanceId },
        });
        (0, vitest_1.expect)(picked.ok).toBe(true);
        (0, vitest_1.expect)(picked.state.pendingChoices?.type).toBe("putHandOnDeck");
        if (picked.state.pendingChoices?.type === "putHandOnDeck") {
            (0, vitest_1.expect)(picked.state.pendingChoices.phase).toBe("selectPosition");
        }
        const finished = (0, applyAction_1.applyAction)(picked.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { position: "top" },
        });
        (0, vitest_1.expect)(finished.ok).toBe(true);
        (0, vitest_1.expect)(finished.state.pendingChoices).toBeNull();
    });
});
