"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const registry_1 = require("./cards/registry");
const factory_1 = require("./state/factory");
function resolveFanfareChoices(state, player, discardId) {
    let current = state;
    for (let step = 0; step < 15; step++) {
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
        if (choice.type === "choose") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { optionIndex: 0 },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (choice.type === "selectZoneCards") {
            const id = discardId ?? choice.options[0].instanceId;
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceIds: [id] },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        break;
    }
    return current;
}
(0, vitest_1.describe)("Stone Merchant", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("has fanfare discard-draw DSL for Swordcraft cards", () => {
        const def = (0, registry_1.getCardDef)("BP17-033EN");
        const ff = def.abilities.find((a) => a.timing === "fanfare");
        (0, vitest_1.expect)(ff.effect.op).toBe("optionalCost");
        if (ff.effect.op === "optionalCost") {
            (0, vitest_1.expect)(ff.effect.cost).toMatchObject({
                op: "discardFromHand",
                filter: { cardClass: "sword" },
            });
        }
    });
    (0, vitest_1.it)("fanfare draws 2 when a Swordcraft spell is discarded", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].maxPp = 10;
        const merchant = (0, factory_1.createCardInstance)("BP17-033EN", 0);
        const spell = (0, factory_1.createCardInstance)("BP14-034EN", 0);
        state.players[0].zones.hand.push(merchant, spell);
        for (let i = 0; i < 5; i++) {
            state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 0));
        }
        const handBefore = state.players[0].zones.hand.length;
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: merchant.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        state = resolveFanfareChoices(played.state, 0, spell.instanceId);
        (0, vitest_1.expect)(state.players[0].zones.hand.length).toBe(handBefore - 2 + 2);
        (0, vitest_1.expect)(state.players[0].zones.cemetery.some((c) => c.instanceId === spell.instanceId)).toBe(true);
    });
    (0, vitest_1.it)("fanfare draws 1 when a Swordcraft follower is discarded", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].maxPp = 10;
        const merchant = (0, factory_1.createCardInstance)("BP17-033EN", 0);
        const follower = (0, factory_1.createCardInstance)("BP14-018EN", 0);
        state.players[0].zones.hand.push(merchant, follower);
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 0));
        const handBefore = state.players[0].zones.hand.length;
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: merchant.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        state = resolveFanfareChoices(played.state, 0, follower.instanceId);
        (0, vitest_1.expect)(state.players[0].zones.hand.length).toBe(handBefore - 2 + 1);
        (0, vitest_1.expect)(state.players[0].zones.cemetery.some((c) => c.instanceId === follower.instanceId)).toBe(true);
    });
});
