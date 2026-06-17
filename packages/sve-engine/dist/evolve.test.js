"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
(0, vitest_1.describe)("evolve", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    function boardReadyToEvolve() {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].maxPp = 5;
        state.players[0].evoPoints = 2;
        const base = (0, factory_1.createCardInstance)("MVP-013", 0);
        base.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(base);
        const evo = (0, factory_1.createCardInstance)("MVP-014", 0);
        state.players[0].zones.evolveDeck.push(evo);
        return { state, base, evo };
    }
    (0, vitest_1.it)("links evolved card so combat uses evolved stats", () => {
        const { state, base, evo } = boardReadyToEvolve();
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 0));
        const enemy = (0, factory_1.createCardInstance)("MVP-023", 1);
        enemy.onFieldSinceTurnStart = true;
        enemy.engaged = true;
        state.players[1].zones.field.push(enemy);
        const evolved = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: base.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useEvoPoint: false,
        });
        (0, vitest_1.expect)(evolved.ok).toBe(true);
        const fieldCard = evolved.state.players[0].zones.field[0];
        (0, vitest_1.expect)(fieldCard.linkedEvoInstanceId).toBe(evo.instanceId);
        const stats = (0, queries_1.getEffectiveStats)(fieldCard, evolved.state);
        (0, vitest_1.expect)(stats.atk).toBe(3);
        (0, vitest_1.expect)(stats.def).toBe(3);
        const attack = (0, applyAction_1.applyAction)(evolved.state, 0, {
            type: "ATTACK",
            attackerId: base.instanceId,
            targetId: enemy.instanceId,
        });
        (0, vitest_1.expect)(attack.ok).toBe(true);
        const after = attack.state.quickWindow === "afterAttack"
            ? (0, applyAction_1.applyAction)(attack.state, 1, { type: "PASS_QUICK_WINDOW" }).state
            : attack.state;
        const damaged = after.players[1].zones.field[0];
        const enemyDef = (0, queries_1.getEffectiveStats)(damaged, after).def;
        (0, vitest_1.expect)(enemyDef).toBe(2);
    });
    (0, vitest_1.it)("deducts PP for evolution", () => {
        const { state, base, evo } = boardReadyToEvolve();
        const result = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: base.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useEvoPoint: false,
        });
        (0, vitest_1.expect)(result.ok).toBe(true);
        (0, vitest_1.expect)(result.state.players[0].pp).toBe(4);
        (0, vitest_1.expect)(result.state.players[0].evoPoints).toBe(2);
    });
    (0, vitest_1.it)("can pay with an evolution point", () => {
        const { state, base, evo } = boardReadyToEvolve();
        state.players[0].pp = 0;
        const result = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: base.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useEvoPoint: true,
        });
        (0, vitest_1.expect)(result.ok).toBe(true);
        (0, vitest_1.expect)(result.state.players[0].pp).toBe(0);
        (0, vitest_1.expect)(result.state.players[0].evoPoints).toBe(1);
    });
    (0, vitest_1.it)("uses at most one evolution point per evolve", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const base = (0, factory_1.createCardInstance)("SDD02-006EN", 0);
        base.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(base);
        const evo = (0, factory_1.createCardInstance)("SDD02-007EN", 0);
        state.players[0].zones.evolveDeck.push(evo);
        state.players[0].pp = 0;
        state.players[0].evoPoints = 3;
        const fail = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: base.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useEvoPoint: true,
        });
        (0, vitest_1.expect)(fail.ok).toBe(false);
        state.players[0].pp = 1;
        const ok = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: base.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useEvoPoint: true,
        });
        (0, vitest_1.expect)(ok.ok).toBe(true);
        (0, vitest_1.expect)(ok.state.players[0].pp).toBe(0);
        (0, vitest_1.expect)(ok.state.players[0].evoPoints).toBe(2);
    });
    (0, vitest_1.it)("evolved follower gains rush for the turn it evolves", () => {
        const { state, base, evo } = boardReadyToEvolve();
        const evolved = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: base.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useEvoPoint: false,
        }).state;
        const attacker = evolved.players[0].zones.field[0];
        (0, vitest_1.expect)(attacker.evolvedThisTurn).toBe(true);
        (0, vitest_1.expect)((0, queries_1.hasKeyword)(attacker, "rush", evolved)).toBe(true);
    });
    (0, vitest_1.it)("evolved rush follower on board since turn start can attack the enemy leader", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].evoPoints = 2;
        const leod = (0, factory_1.createCardInstance)("SDD02-006EN", 0);
        leod.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(leod);
        const evo = (0, factory_1.createCardInstance)("SDD02-007EN", 0);
        state.players[0].zones.evolveDeck.push(evo);
        let current = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: leod.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useEvoPoint: false,
        }).state;
        if (current.pendingChoices?.type === "choose") {
            current = (0, applyAction_1.applyAction)(current, 0, {
                type: "CHOICE_RESPONSE",
                payload: { optionIndex: 0 },
            }).state;
        }
        (0, vitest_1.expect)(current.players[0].zones.field[0].onFieldSinceTurnStart).toBe(true);
        const attack = (0, applyAction_1.applyAction)(current, 0, {
            type: "ATTACK",
            attackerId: leod.instanceId,
            targetId: "leader",
        });
        (0, vitest_1.expect)(attack.ok).toBe(true);
        (0, vitest_1.expect)(attack.state.players[1].leaderDef).toBeLessThan(20);
    });
    (0, vitest_1.it)("evolved rush follower played this turn cannot attack the enemy leader", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].evoPoints = 2;
        const leod = (0, factory_1.createCardInstance)("SDD02-006EN", 0);
        leod.onFieldSinceTurnStart = false;
        state.players[0].zones.field.push(leod);
        const evo = (0, factory_1.createCardInstance)("SDD02-007EN", 0);
        state.players[0].zones.evolveDeck.push(evo);
        let current = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: leod.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useEvoPoint: false,
        }).state;
        if (current.pendingChoices?.type === "choose") {
            current = (0, applyAction_1.applyAction)(current, 0, {
                type: "CHOICE_RESPONSE",
                payload: { optionIndex: 0 },
            }).state;
        }
        const attack = (0, applyAction_1.applyAction)(current, 0, {
            type: "ATTACK",
            attackerId: leod.instanceId,
            targetId: "leader",
        });
        (0, vitest_1.expect)(attack.ok).toBe(false);
    });
});
