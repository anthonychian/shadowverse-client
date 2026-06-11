"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const registry_1 = require("./cards/registry");
const index_1 = require("./index");
(0, vitest_1.describe)("idolmaster DSL", () => {
    (0, vitest_1.beforeEach)(() => (0, index_1.resetIdCounter)());
    (0, vitest_1.it)("registers Lesson fanfare on Rin Shibuya [Cinderella Girl]", () => {
        const def = (0, registry_1.getCardDef)("ECP02-012EN");
        const ff = def.abilities.find((a) => a.timing === "fanfare");
        (0, vitest_1.expect)(ff.effect).toMatchObject({
            op: "optionalCost",
            label: "Lesson (2)",
            cost: {
                op: "banishFromExArea",
                filter: { trait: "Magical Item" },
                count: 2,
            },
        });
    });
    (0, vitest_1.it)("Anastasia fanfare uses optional PP + Lesson cost", () => {
        const def = (0, registry_1.getCardDef)("ECP02-001EN");
        const ff = def.abilities.find((a) => a.timing === "fanfare");
        if (ff.effect.op !== "optionalCost")
            throw new Error("expected optionalCost");
        (0, vitest_1.expect)(ff.effect.label).toBe("[cost01], Lesson (1)");
        if (ff.effect.cost.op !== "sequence")
            throw new Error("expected sequence cost");
        (0, vitest_1.expect)(ff.effect.then).toMatchObject({
            op: "selectFromHand",
            playCostReduction: 2,
        });
    });
    (0, vitest_1.it)("Kako [Lady Luck] Evolved rolls a die on evolve", () => {
        const def = (0, registry_1.getCardDef)("ECP02-066EN");
        const evo = def.abilities.find((a) => a.timing === "onEvolve");
        (0, vitest_1.expect)(evo.effect).toMatchObject({ op: "rollDie", sides: 6 });
    });
    (0, vitest_1.it)("Karen Hojo [Cinderella Girl] last words summons Cool Earrings to EX", () => {
        const def = (0, registry_1.getCardDef)("ECP02-016EN");
        const lw = def.abilities.find((a) => a.timing === "lastWords");
        (0, vitest_1.expect)(lw.effect).toMatchObject({
            op: "summon",
            tokenCardNo: "CP02-T04EN",
            zone: "exArea",
        });
    });
    (0, vitest_1.it)("Cool Earrings is a Magical Item for Lesson costs", () => {
        const token = (0, registry_1.getCardDef)("CP02-T04EN");
        (0, vitest_1.expect)(token.traits).toContain("Magical Item");
    });
    (0, vitest_1.it)("Ranko fanfare prompts to destroy a chosen enemy follower", () => {
        let state = (0, index_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        const ranko = (0, index_1.createCardInstance)("ECP02-047EN", 0);
        const enemyA = (0, index_1.createCardInstance)("MVP-012", 1);
        const enemyB = (0, index_1.createCardInstance)("MVP-013", 1);
        enemyA.onFieldSinceTurnStart = true;
        enemyB.onFieldSinceTurnStart = true;
        state.players[1].zones.field.push(enemyA, enemyB);
        state.players[0].zones.hand.push(ranko);
        const played = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: ranko.instanceId,
        });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("selectTarget");
        if (played.state.pendingChoices?.type !== "selectTarget")
            return;
        (0, vitest_1.expect)(played.state.pendingChoices.candidates).toHaveLength(2);
        const destroyed = (0, applyAction_1.applyAction)(played.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { targetId: enemyB.instanceId },
        });
        (0, vitest_1.expect)(destroyed.ok).toBe(true);
        (0, vitest_1.expect)(destroyed.state.players[1].zones.field.some((c) => c.instanceId === enemyA.instanceId)).toBe(true);
        (0, vitest_1.expect)(destroyed.state.players[1].zones.field.some((c) => c.instanceId === enemyB.instanceId)).toBe(false);
    });
    (0, vitest_1.it)("idolmaster universe starts with Magical Items in EX", () => {
        let state = (0, index_1.createInitialGameState)(0);
        state = (0, index_1.loadDecks)(state, [
            {
                mainDeck: Array(40).fill("ECP02-012EN"),
                evolveDeck: Array(10).fill("ECP02-002EN"),
                universe: "idolmaster",
            },
            { mainDeck: Array(40).fill("MVP-012"), evolveDeck: [] },
        ]);
        (0, vitest_1.expect)(state.players[0].zones.exArea).toHaveLength(5);
        (0, vitest_1.expect)(state.players[0].zones.exArea.every((c) => c.cardNo === "CP02-T04EN")).toBe(true);
    });
});
