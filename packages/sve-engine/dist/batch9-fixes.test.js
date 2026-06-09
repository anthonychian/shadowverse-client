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
(0, vitest_1.describe)("batch 9 regression fixes", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("bane destroys the defender even when the bane attacker dies to combat damage", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const baneOneOne = (0, factory_1.createCardInstance)("BP17-079EN", 0);
        baneOneOne.modifiers.push({ atk: 0, def: 0, sourceId: "test" });
        const ally = (0, factory_1.createCardInstance)("BP12-T10EN", 0);
        state.players[0].zones.field.push(ally, baneOneOne);
        baneOneOne.onFieldSinceTurnStart = true;
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        enemy.onFieldSinceTurnStart = true;
        enemy.engaged = true;
        state.players[1].zones.field.push(enemy);
        (0, vitest_1.expect)((0, queries_1.hasKeyword)(baneOneOne, "bane", state, 0)).toBe(true);
        const attack = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: baneOneOne.instanceId,
            targetId: enemy.instanceId,
        });
        (0, vitest_1.expect)(attack.ok).toBe(true);
        const after = attack.state.quickWindow === "afterAttack" ? passQuick(attack.state, 1) : attack.state;
        (0, vitest_1.expect)(after.players[1].zones.field.length).toBe(0);
    });
    (0, vitest_1.it)("skips after-attack quick window when opponent has no playable quick cards", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const atk = (0, factory_1.createCardInstance)("MVP-013", 0);
        atk.onFieldSinceTurnStart = true;
        const def = (0, factory_1.createCardInstance)("MVP-012", 1);
        def.onFieldSinceTurnStart = true;
        def.engaged = true;
        state.players[0].zones.field.push(atk);
        state.players[1].zones.field.push(def);
        const attack = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: atk.instanceId,
            targetId: def.instanceId,
        });
        (0, vitest_1.expect)(attack.ok).toBe(true);
        (0, vitest_1.expect)(attack.state.quickWindow).toBeNull();
        (0, vitest_1.expect)(attack.state.combat).toBeNull();
    });
    (0, vitest_1.it)("start of end abilities resolve before the opponent end-phase quick window", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const leod = (0, factory_1.createCardInstance)("SDD02-006EN", 0);
        leod.onFieldSinceTurnStart = true;
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        enemy.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(leod);
        state.players[1].zones.field.push(enemy);
        state.players[1].zones.hand.push((0, factory_1.createCardInstance)("BP17-T18EN", 1));
        state.players[1].pp = 1;
        state.players[1].maxPp = 1;
        const enemyDefBefore = (0, queries_1.getEffectiveStats)(enemy, state).def;
        let ended = (0, applyAction_1.applyAction)(state, 0, { type: "END_MAIN" });
        (0, vitest_1.expect)(ended.ok).toBe(true);
        if (ended.state.pendingChoices?.type === "selectTarget") {
            ended = (0, applyAction_1.applyAction)(ended.state, 0, {
                type: "CHOICE_RESPONSE",
                payload: { targetId: enemy.instanceId },
            });
            (0, vitest_1.expect)(ended.ok).toBe(true);
        }
        (0, vitest_1.expect)(ended.state.quickWindow).toBe("endPhase");
        const damaged = ended.state.players[1].zones.field[0];
        (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(damaged, ended.state).def).toBeLessThan(enemyDefBefore);
    });
    (0, vitest_1.it)("super evolve prompts effect order when both on evolve and on super evolve exist", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.turnNumber = 8;
        state.players[0].turnsPassed = 7;
        state.players[0].pp = 5;
        state.players[0].superEvoPoints = 1;
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("BP17-083EN", 0));
        state.players[0].zones.cemetery.push((0, factory_1.createCardInstance)("BP12-T10EN", 0));
        const base = (0, factory_1.createCardInstance)("BP17-077EN", 0);
        base.onFieldSinceTurnStart = true;
        const evo = (0, factory_1.createCardInstance)("BP17-078EN", 0);
        state.players[0].zones.field.push(base);
        state.players[0].zones.evolveDeck.push(evo);
        const evolved = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: base.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useSuperEvo: true,
            useEvoPoint: false,
        });
        (0, vitest_1.expect)(evolved.ok).toBe(true);
        (0, vitest_1.expect)(evolved.state.pendingChoices?.type).toBe("chooseMultiple");
    });
    (0, vitest_1.it)("allows evolve while engaged", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].evoPoints = 2;
        const base = (0, factory_1.createCardInstance)("MVP-013", 0);
        base.onFieldSinceTurnStart = true;
        base.engaged = true;
        state.players[0].zones.field.push(base);
        state.players[0].zones.evolveDeck.push((0, factory_1.createCardInstance)("MVP-014", 0));
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions.includes(`EVOLVE:${base.instanceId}`)).toBe(true);
        const evolved = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: base.instanceId,
            useEvoPoint: false,
        });
        (0, vitest_1.expect)(evolved.ok).toBe(true);
        (0, vitest_1.expect)(evolved.state.players[0].zones.field[0].engaged).toBe(true);
    });
    (0, vitest_1.it)("allows non-engage activate while engaged", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const jiemon = (0, factory_1.createCardInstance)("BP11-018EN", 0);
        jiemon.onFieldSinceTurnStart = true;
        jiemon.engaged = true;
        state.players[0].zones.field.push(jiemon);
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        enemy.onFieldSinceTurnStart = true;
        enemy.engaged = true;
        state.players[1].zones.field.push(enemy);
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions.includes(`ACTIVATE:${jiemon.instanceId}`)).toBe(true);
        const activated = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE",
            fieldInstanceId: jiemon.instanceId,
        });
        (0, vitest_1.expect)(activated.ok).toBe(true);
        (0, vitest_1.expect)(activated.state.pendingChoices?.type).toBe("selectTarget");
        (0, vitest_1.expect)(activated.state.players[0].zones.field[0].engaged).toBe(true);
    });
    (0, vitest_1.it)("blocks engage-cost activate while already engaged", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const soot = (0, factory_1.createCardInstance)("BP14-019EN", 0);
        soot.onFieldSinceTurnStart = true;
        soot.engaged = true;
        state.players[0].zones.field.push(soot);
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        enemy.onFieldSinceTurnStart = true;
        enemy.engaged = true;
        state.players[1].zones.field.push(enemy);
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions.includes(`ACTIVATE:${soot.instanceId}`)).toBe(false);
        const activated = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE",
            fieldInstanceId: soot.instanceId,
        });
        (0, vitest_1.expect)(activated.ok).toBe(false);
    });
    (0, vitest_1.it)("plays glittering gold from ex area for 0 pp as a no-op spell", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 0;
        const gold = (0, factory_1.createCardInstance)("BP14-T02EN", 0);
        state.players[0].zones.exArea.push(gold);
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions.includes(`PLAY:${gold.instanceId}`)).toBe(true);
        const played = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: gold.instanceId,
        });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.players[0].zones.exArea.length).toBe(0);
        (0, vitest_1.expect)(played.state.players[0].zones.banish.some((c) => c.instanceId === gold.instanceId)).toBe(true);
        (0, vitest_1.expect)(played.state.players[0].pp).toBe(0);
    });
    (0, vitest_1.it)("only offers pass quick window when quick cards are playable", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.quickWindow = "endPhase";
        state.quickWindowPlayer = 1;
        state.pendingChoices = null;
        const view = (0, filterView_1.createPlayerView)(state, 1);
        (0, vitest_1.expect)(view.legalActions.includes("PASS_QUICK_WINDOW")).toBe(false);
        state.players[1].zones.hand.push((0, factory_1.createCardInstance)("BP17-T18EN", 1));
        state.players[1].pp = 1;
        const viewWithQuick = (0, filterView_1.createPlayerView)(state, 1);
        (0, vitest_1.expect)(viewWithQuick.legalActions.includes("PASS_QUICK_WINDOW")).toBe(true);
    });
});
