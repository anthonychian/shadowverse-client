"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const filterView_1 = require("./view/filterView");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
function passQuick(state, player) {
    return (0, applyAction_1.applyAction)(state, player, { type: "PASS_QUICK_WINDOW" }).state;
}
(0, vitest_1.describe)("batch 7 regression fixes", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("dead to rights prompts for enemy follower target and applies -2/-2", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 2;
        const spell = (0, factory_1.createCardInstance)("BP11-075EN", 0);
        state.players[0].zones.hand.push(spell);
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        state.players[1].zones.field.push(enemy);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("selectTarget");
        const resolved = (0, applyAction_1.applyAction)(played.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { targetId: enemy.instanceId },
        });
        (0, vitest_1.expect)(resolved.ok).toBe(true);
        const onField = resolved.state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
        const buried = resolved.state.players[1].zones.cemetery.some((c) => c.instanceId === enemy.instanceId);
        (0, vitest_1.expect)(onField || buried).toBe(true);
        if (onField) {
            const stats = (0, queries_1.getEffectiveStats)(onField, resolved.state);
            (0, vitest_1.expect)(stats.atk).toBeLessThanOrEqual(0);
            (0, vitest_1.expect)(stats.def).toBeLessThanOrEqual(0);
        }
    });
    (0, vitest_1.it)("dead to rights is not playable without enemy followers", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 2;
        const spell = (0, factory_1.createCardInstance)("BP11-075EN", 0);
        state.players[0].zones.hand.push(spell);
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions.some((a) => a === `PLAY:${spell.instanceId}`)).toBe(false);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(false);
    });
    (0, vitest_1.it)("pauses combat for quick window after strikes before damage", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const atk = (0, factory_1.createCardInstance)("MVP-012", 0);
        atk.onFieldSinceTurnStart = true;
        const def = (0, factory_1.createCardInstance)("MVP-012", 1);
        def.onFieldSinceTurnStart = true;
        def.engaged = true;
        state.players[0].zones.field.push(atk);
        state.players[1].zones.field.push(def);
        state.players[1].zones.hand.push((0, factory_1.createCardInstance)("BP17-T18EN", 1));
        state.players[1].pp = 1;
        state.players[1].maxPp = 1;
        const attacked = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: atk.instanceId,
            targetId: def.instanceId,
        });
        (0, vitest_1.expect)(attacked.ok).toBe(true);
        (0, vitest_1.expect)(attacked.state.quickWindow).toBe("afterAttack");
        (0, vitest_1.expect)(attacked.state.quickWindowPlayer).toBe(1);
        (0, vitest_1.expect)(attacked.state.combat?.phase).toBe("quickWindow");
        const defBefore = (0, queries_1.getEffectiveStats)(def, attacked.state).def;
        const afterPass = passQuick(attacked.state, 1);
        const defAfter = afterPass.players[1].zones.field.find((c) => c.instanceId === def.instanceId);
        if (defAfter) {
            (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(defAfter, afterPass).def).toBeLessThan(defBefore);
        }
    });
    (0, vitest_1.it)("offers end-phase quick window before ward engage", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const ward = (0, factory_1.createCardInstance)("MVP-002", 0);
        state.players[0].zones.field.push(ward);
        state.players[1].zones.hand.push((0, factory_1.createCardInstance)("BP17-T18EN", 1));
        state.players[1].pp = 1;
        state.players[1].maxPp = 1;
        const ended = (0, applyAction_1.applyAction)(state, 0, { type: "END_MAIN" });
        (0, vitest_1.expect)(ended.ok).toBe(true);
        (0, vitest_1.expect)(ended.state.quickWindow).toBe("endPhase");
        (0, vitest_1.expect)(ended.state.quickWindowPlayer).toBe(1);
        (0, vitest_1.expect)(ended.state.pendingChoices).toBeNull();
        const afterPass = passQuick(ended.state, 1);
        (0, vitest_1.expect)(afterPass.pendingChoices?.type).toBe("wardEngage");
    });
    (0, vitest_1.it)("ward engage accepts multiple followers", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "end";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const ward1 = (0, factory_1.createCardInstance)("MVP-002", 0);
        const ward2 = (0, factory_1.createCardInstance)("MVP-002", 0);
        state.players[0].zones.field.push(ward1, ward2);
        state.pendingChoices = {
            type: "wardEngage",
            player: 0,
            candidates: [
                { instanceId: ward1.instanceId, cardNo: "MVP-002", label: "Ward 1" },
                { instanceId: ward2.instanceId, cardNo: "MVP-002", label: "Ward 2" },
            ],
        };
        const engaged = (0, applyAction_1.applyAction)(state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [ward1.instanceId, ward2.instanceId] },
        });
        (0, vitest_1.expect)(engaged.ok).toBe(true);
        (0, vitest_1.expect)(engaged.state.players[0].zones.field.every((c) => c.engaged)).toBe(true);
    });
    (0, vitest_1.it)("torchbearing guide does not draw until festive card is sequenced to ex area", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 0));
        const guide = (0, factory_1.createCardInstance)("BP14-118EN", 0);
        const festive = (0, factory_1.createCardInstance)("BP14-T01EN", 0);
        const other = (0, factory_1.createCardInstance)("MVP-013", 0);
        state.players[0].zones.hand.push(guide, festive, other);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: guide.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("choose");
        const pay = (0, applyAction_1.applyAction)(played.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { optionIndex: 0 },
        });
        (0, vitest_1.expect)(pay.ok).toBe(true);
        (0, vitest_1.expect)(pay.state.pendingChoices?.type).toBe("selectZoneCard");
        (0, vitest_1.expect)(pay.state.players[0].zones.hand.length).toBe(2);
        (0, vitest_1.expect)(pay.state.players[0].zones.deck.length).toBe(1);
        const moved = (0, applyAction_1.applyAction)(pay.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceId: festive.instanceId },
        });
        (0, vitest_1.expect)(moved.ok).toBe(true);
        (0, vitest_1.expect)(moved.state.players[0].zones.exArea.some((c) => c.instanceId === festive.instanceId)).toBe(true);
        (0, vitest_1.expect)(moved.state.players[0].zones.hand.length).toBe(2);
        (0, vitest_1.expect)(moved.state.players[0].zones.deck.length).toBe(0);
    });
});
