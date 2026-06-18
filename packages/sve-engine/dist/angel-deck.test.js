"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const registry_1 = require("./cards/registry");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
const filterView_1 = require("./view/filterView");
function mainWithCard(cardNo, player = 0) {
    const state = (0, factory_1.createInitialGameState)(0);
    state.phase = "main";
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[1].flags.mulliganDone = true;
    const card = (0, factory_1.createCardInstance)(cardNo, player, player);
    state.players[player].zones.hand.push(card);
    state.players[player].pp = 10;
    state.players[player].maxPp = 10;
    state.phase = "main";
    state.activePlayer = player;
    return { state, card };
}
(0, vitest_1.describe)("angel deck DSL", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("registers Fount of Angels as an amulet with fanfare search and bury act", () => {
        const def = (0, registry_1.getCardDef)("BP09-137EN");
        (0, vitest_1.expect)(def.cardType).toBe("amulet");
        (0, vitest_1.expect)(def.abilities?.some((a) => a.timing === "fanfare")).toBe(true);
        (0, vitest_1.expect)(def.abilities?.some((a) => a.timing === "activated")).toBe(true);
    });
    (0, vitest_1.it)("amulets on field are not legal attack targets", () => {
        const state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.pendingChoices = null;
        const amulet = (0, factory_1.createCardInstance)("BP09-137EN", 1, 1);
        const attacker = (0, factory_1.createCardInstance)("BP01-159EN", 0, 0);
        attacker.engaged = false;
        attacker.onFieldSinceTurnStart = true;
        state.players[1].zones.field.push(amulet);
        state.players[0].zones.field.push(attacker);
        state.phase = "main";
        state.activePlayer = 0;
        (0, vitest_1.expect)((0, queries_1.isFieldFollower)(state, amulet)).toBe(false);
        const targets = (0, queries_1.getLegalAttackTargets)(state, attacker, 0);
        (0, vitest_1.expect)(targets.some((t) => t.type === "follower")).toBe(false);
    });
    (0, vitest_1.it)("Planetary Fracture banishes field, EX, and top 10 of each deck", () => {
        const { state, card } = mainWithCard("BP13-107EN");
        state.players[0].pp = 8;
        state.players[0].zones.field.push((0, factory_1.createCardInstance)("BP01-159EN", 0, 0));
        state.players[1].zones.field.push((0, factory_1.createCardInstance)("BP10-115EN", 1, 1));
        state.players[0].zones.exArea.push((0, factory_1.createCardInstance)("BP14-T02EN", 0, 0));
        for (let i = 0; i < 12; i++) {
            state.players[0].zones.deck.push((0, factory_1.createCardInstance)("BP01-159EN", 0, 0));
            state.players[1].zones.deck.push((0, factory_1.createCardInstance)("BP10-115EN", 1, 1));
        }
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: card.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.players[0].zones.field).toHaveLength(0);
        (0, vitest_1.expect)(played.state.players[1].zones.field).toHaveLength(0);
        (0, vitest_1.expect)(played.state.players[0].zones.exArea).toHaveLength(0);
        (0, vitest_1.expect)(played.state.players[0].zones.banish.length).toBeGreaterThanOrEqual(11);
        (0, vitest_1.expect)(played.state.players[1].zones.banish.length).toBeGreaterThanOrEqual(11);
    });
    (0, vitest_1.it)("Angel's Blessing is a quick spell", () => {
        const def = (0, registry_1.getCardDef)("BP14-110EN");
        const spell = def.abilities?.find((a) => a.timing === "spell");
        (0, vitest_1.expect)(spell?.quick).toBe(true);
        (0, vitest_1.expect)(spell?.effect).toMatchObject({
            op: "sequence",
            steps: [{ op: "healLeader", amount: 2 }, { op: "draw", count: 2 }],
        });
    });
    (0, vitest_1.it)("Clash of Heroes is playable when both fields have followers", () => {
        const { state, card } = mainWithCard("BP06-112EN");
        state.players[0].zones.field.push((0, factory_1.createCardInstance)("BP01-159EN", 0, 0));
        state.players[1].zones.field.push((0, factory_1.createCardInstance)("BP10-115EN", 1, 1));
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions).toContain(`PLAY:${card.instanceId}`);
    });
});
