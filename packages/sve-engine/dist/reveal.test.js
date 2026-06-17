"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const factory_1 = require("./state/factory");
(0, vitest_1.describe)("reveal before adding to hand", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("reveals deck search to opponent before adding to hand", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 2;
        const spell = (0, factory_1.createCardInstance)("BP17-080EN", 0);
        const target = (0, factory_1.createCardInstance)("BP17-040EN", 0);
        state.players[0].zones.deck.push(target);
        state.players[0].zones.hand.push(spell);
        const played = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: spell.instanceId,
        });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("choose");
        const chose = (0, applyAction_1.applyAction)(played.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { optionIndex: 0 },
        });
        (0, vitest_1.expect)(chose.ok).toBe(true);
        (0, vitest_1.expect)(chose.state.pendingChoices?.type).toBe("selectZoneCard");
        const picked = (0, applyAction_1.applyAction)(chose.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceId: target.instanceId },
        });
        (0, vitest_1.expect)(picked.ok).toBe(true);
        (0, vitest_1.expect)(picked.state.revealedCards?.some((r) => r.cardNo === "BP17-040EN")).toBe(true);
        (0, vitest_1.expect)(picked.state.eventLog.some((e) => e.type === "reveal")).toBe(true);
        (0, vitest_1.expect)(picked.state.players[0].zones.hand.some((c) => c.cardNo === "BP17-040EN")).toBe(true);
    });
    (0, vitest_1.it)("does not reveal when returning from cemetery to hand", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 2;
        const spell = (0, factory_1.createCardInstance)("BP07-075EN", 0);
        const fromCemetery = (0, factory_1.createCardInstance)("BP17-040EN", 0);
        state.players[0].zones.hand.push(spell);
        state.players[0].zones.cemetery.push(fromCemetery);
        const played = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: spell.instanceId,
        });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("choose");
        const chose = (0, applyAction_1.applyAction)(played.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { optionIndex: 0 },
        });
        (0, vitest_1.expect)(chose.ok).toBe(true);
        (0, vitest_1.expect)(chose.state.pendingChoices?.type).toBe("selectZoneCard");
        const picked = (0, applyAction_1.applyAction)(chose.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceId: fromCemetery.instanceId },
        });
        (0, vitest_1.expect)(picked.ok).toBe(true);
        (0, vitest_1.expect)(picked.state.revealedCards?.length ?? 0).toBe(0);
        (0, vitest_1.expect)(picked.state.eventLog.some((e) => e.type === "reveal")).toBe(false);
    });
});
