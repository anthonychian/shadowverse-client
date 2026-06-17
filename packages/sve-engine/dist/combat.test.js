"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
function boardWith(attacker, defender, active = 0) {
    (0, factory_1.resetIdCounter)();
    let state = (0, factory_1.createInitialGameState)(0);
    state.phase = "main";
    state.activePlayer = active;
    state.turnNumber = 2;
    state.pendingChoices = null;
    const atk = (0, factory_1.createCardInstance)(attacker, active);
    atk.onFieldSinceTurnStart = true;
    const def = (0, factory_1.createCardInstance)(defender, active === 0 ? 1 : 0);
    def.onFieldSinceTurnStart = true;
    def.engaged = true;
    state.players[active].zones.field.push(atk);
    const defPlayer = active === 0 ? 1 : 0;
    state.players[defPlayer].zones.field.push(def);
    state.players[active].pp = 10;
    state.players[active].maxPp = 10;
    return { state, atk, def };
}
(0, vitest_1.describe)("combat", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("ward forces attack onto engaged ward follower", () => {
        const { state, atk } = boardWith("MVP-012", "MVP-002");
        const ward = state.players[1].zones.field[0];
        ward.engaged = true;
        const result = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: atk.instanceId,
            targetId: "leader",
        });
        (0, vitest_1.expect)(result.ok).toBe(false);
    });
    (0, vitest_1.it)("storm follower can attack on same turn", () => {
        (0, factory_1.resetIdCounter)();
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[0].turnsPassed = 1;
        const storm = (0, factory_1.createCardInstance)("MVP-001", 0);
        storm.onFieldSinceTurnStart = false;
        state.players[0].zones.field.push(storm);
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        enemy.engaged = true;
        state.players[1].zones.field.push(enemy);
        const result = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: storm.instanceId,
            targetId: enemy.instanceId,
        });
        (0, vitest_1.expect)(result.ok).toBe(true);
    });
    (0, vitest_1.it)("deals combat damage between followers", () => {
        const { state, atk, def } = boardWith("MVP-012", "MVP-012");
        let next = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: atk.instanceId,
            targetId: def.instanceId,
        }).state;
        next = (0, applyAction_1.applyAction)(next, 1, { type: "PASS_QUICK_WINDOW" }).state;
        next = (0, applyAction_1.applyAction)(next, 0, { type: "END_MAIN" }).state;
        next = (0, applyAction_1.applyAction)(next, 1, { type: "PASS_QUICK_WINDOW" }).state;
        const atkOnField = next.players[0].zones.field.find((c) => c.instanceId === atk.instanceId);
        const atkInCemetery = next.players[0].zones.cemetery.find((c) => c.instanceId === atk.instanceId);
        if (atkOnField) {
            (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(atkOnField, next).def).toBeLessThanOrEqual(0);
        }
        else {
            (0, vitest_1.expect)(atkInCemetery).toBeTruthy();
        }
    });
    (0, vitest_1.it)("attacking engages the follower (no longer reserved)", () => {
        const { state, atk } = boardWith("MVP-012", "MVP-012");
        const result = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: atk.instanceId,
            targetId: "leader",
        });
        (0, vitest_1.expect)(result.ok).toBe(true);
        const attacker = result.state.players[0].zones.field.find((c) => c.instanceId === atk.instanceId);
        (0, vitest_1.expect)(attacker?.engaged).toBe(true);
    });
    (0, vitest_1.it)("cannot attack reserved enemy follower without assail", () => {
        const { state, atk, def } = boardWith("MVP-012", "MVP-012");
        def.engaged = false;
        const result = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: atk.instanceId,
            targetId: def.instanceId,
        });
        (0, vitest_1.expect)(result.ok).toBe(false);
    });
    (0, vitest_1.it)("assail follower can attack reserved enemy follower", () => {
        (0, factory_1.resetIdCounter)();
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.turnNumber = 2;
        state.pendingChoices = null;
        const assail = (0, factory_1.createCardInstance)("MVP-016", 0);
        assail.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(assail);
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        enemy.onFieldSinceTurnStart = true;
        enemy.engaged = false;
        state.players[1].zones.field.push(enemy);
        const result = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: assail.instanceId,
            targetId: enemy.instanceId,
        });
        (0, vitest_1.expect)(result.ok).toBe(true);
    });
    (0, vitest_1.it)("cancels combat when strike last words kill the attacker before combat damage", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.turnNumber = 2;
        const mono = (0, factory_1.createCardInstance)("BP17-SL20EN", 0);
        mono.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(mono);
        state.players[0].zones.field.push((0, factory_1.createCardInstance)("BP17-083EN", 0));
        state.players[0].zones.field.push((0, factory_1.createCardInstance)("BP17-083EN", 0));
        const soot = (0, factory_1.createCardInstance)("BP14-T01EN", 1);
        soot.onFieldSinceTurnStart = true;
        soot.engaged = true;
        const other = (0, factory_1.createCardInstance)("MVP-012", 1);
        other.onFieldSinceTurnStart = true;
        other.engaged = true;
        state.players[1].zones.field.push(soot, other);
        const otherDefBefore = (0, queries_1.getEffectiveStats)(other, state).def;
        let current = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: mono.instanceId,
            targetId: soot.instanceId,
        }).state;
        (0, vitest_1.expect)(current.pendingChoices?.type).toBe("selectTarget");
        current = (0, applyAction_1.applyAction)(current, 0, {
            type: "CHOICE_RESPONSE",
            payload: { targetId: soot.instanceId },
        }).state;
        (0, vitest_1.expect)(current.pendingChoices?.type).toBe("selectTarget");
        current = (0, applyAction_1.applyAction)(current, 1, {
            type: "CHOICE_RESPONSE",
            payload: { targetId: mono.instanceId },
        }).state;
        (0, vitest_1.expect)(current.combat).toBeNull();
        (0, vitest_1.expect)(current.quickWindow).toBeNull();
        (0, vitest_1.expect)(current.players[0].zones.field.some((c) => c.instanceId === mono.instanceId)).toBe(false);
        const otherAfter = current.players[1].zones.field.find((c) => c.instanceId === other.instanceId);
        (0, vitest_1.expect)(otherAfter).toBeTruthy();
        (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(otherAfter, current).def).toBe(otherDefBefore);
    });
    (0, vitest_1.it)("strike resolves before combat damage (Disciple of Usurpation)", () => {
        (0, factory_1.resetIdCounter)();
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.turnNumber = 2;
        state.pendingChoices = null;
        const disciple = (0, factory_1.createCardInstance)("BP05-025EN", 0);
        disciple.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(disciple);
        for (let i = 0; i < 10; i++) {
            state.players[1].zones.cemetery.push((0, factory_1.createCardInstance)("MVP-012", 1));
        }
        state.players[1].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 1));
        const leaderDefBefore = state.players[1].leaderDef;
        const result = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: disciple.instanceId,
            targetId: "leader",
        });
        (0, vitest_1.expect)(result.ok).toBe(true);
        (0, vitest_1.expect)(result.state.players[1].zones.cemetery.length).toBe(11);
        const attackerCard = result.state.players[0].zones.field[0];
        const atk = (0, queries_1.getEffectiveStats)(attackerCard, result.state).atk;
        const after = result.state.quickWindow === "afterAttack"
            ? (0, applyAction_1.applyAction)(result.state, 1, { type: "PASS_QUICK_WINDOW" }).state
            : result.state;
        (0, vitest_1.expect)(after.players[1].leaderDef).toBe(leaderDefBefore - atk);
    });
});
