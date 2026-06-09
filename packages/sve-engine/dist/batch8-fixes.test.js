"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const filterView_1 = require("./view/filterView");
const confirmation_1 = require("./rules/confirmation");
const resolver_1 = require("./effects/resolver");
const factory_1 = require("./state/factory");
const trigger_queue_1 = require("./rules/trigger-queue");
const setup_1 = require("./phases/setup");
const registry_1 = require("./cards/registry");
const queries_1 = require("./state/queries");
function resolveAllChoices(state, player) {
    let current = state;
    for (let step = 0; step < 30; step++) {
        if (!current.pendingChoices)
            break;
        if (current.pendingChoices.type === "selectTrigger") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { triggerId: current.pendingChoices.options[0].triggerId },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (current.pendingChoices.type === "selectTarget") {
            const enemy = current.players[1].zones.field.find((c) => current.pendingChoices?.type === "selectTarget"
                ? current.pendingChoices.candidates.some((x) => (typeof x === "string" ? x : x.instanceId) === c.instanceId)
                : false);
            (0, vitest_1.expect)(enemy).toBeTruthy();
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { targetId: enemy.instanceId },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (current.pendingChoices.type === "choose") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { optionIndex: 1 },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (current.pendingChoices.type === "chooseMultiple") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { optionIndices: [0, 1] },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (current.pendingChoices.type === "selectZoneCard") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceId: current.pendingChoices.options[0].instanceId },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        if (current.pendingChoices.type === "selectZoneCards") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: {
                    instanceIds: current.pendingChoices.options
                        .slice(0, current.pendingChoices.count)
                        .map((o) => o.instanceId),
                },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
            continue;
        }
        break;
    }
    return current;
}
(0, vitest_1.describe)("batch 8 regression fixes", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    (0, vitest_1.it)("masterful musician triggers twice when two glittering gold enter ex area", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const musician = (0, factory_1.createCardInstance)("BP14-027EN", 0);
        state.players[0].zones.field.push(musician);
        const enemyA = (0, factory_1.createCardInstance)("MVP-012", 1);
        const enemyB = (0, factory_1.createCardInstance)("MVP-012", 1);
        enemyA.onFieldSinceTurnStart = true;
        enemyB.onFieldSinceTurnStart = true;
        enemyA.engaged = true;
        enemyB.engaged = true;
        state.players[1].zones.field.push(enemyA, enemyB);
        const leaderDefBefore = state.players[1].leaderDef;
        state = (0, resolver_1.resolveEffect)(state, { op: "summon", tokenCardNo: "BP14-T02EN", count: 2, zone: "exArea" }, 0, { deferConfirmation: true });
        (0, vitest_1.expect)(state.pendingTriggers.length).toBe(2);
        state = (0, confirmation_1.runConfirmationTiming)(state);
        state = resolveAllChoices(state, 0);
        (0, vitest_1.expect)(state.pendingTriggers.length).toBe(0);
        (0, vitest_1.expect)(state.pendingChoices).toBeNull();
        (0, vitest_1.expect)(state.players[1].leaderDef).toBe(leaderDefBefore - 2);
    });
    (0, vitest_1.it)("ginne resumes second chosen effect after ex area triggers", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-012", 0));
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
        let current = resolveAllChoices(chose.state, 0);
        for (let step = 0; step < 24 && current.pendingChoices?.type === "putHandOnDeck"; step++) {
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
        current = resolveAllChoices(current, 0);
        (0, vitest_1.expect)(current.players[0].zones.exArea.length).toBeGreaterThanOrEqual(2);
        (0, vitest_1.expect)(current.players[0].zones.hand.length).toBe(1);
        (0, vitest_1.expect)(current.pendingChoices).toBeNull();
    });
    (0, vitest_1.it)("queues last words for each follower destroyed at zero defense", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const wielderA = (0, factory_1.createCardInstance)("PR-358EN", 0);
        const wielderB = (0, factory_1.createCardInstance)("PR-358EN", 0);
        wielderA.modifiers.push({ def: -2, sourceId: "test" });
        wielderB.modifiers.push({ def: -2, sourceId: "test" });
        state.players[0].zones.field.push(wielderA, wielderB);
        state = (0, confirmation_1.runConfirmationTiming)(state);
        (0, vitest_1.expect)(state.pendingTriggers.filter((t) => t.timing === "lastWords")).toHaveLength(2);
    });
    (0, vitest_1.it)("nicola enduring steward last words discounts ex area play cost", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        state.players[0].maxPp = 5;
        const nicola = (0, factory_1.createCardInstance)("BP17-079EN", 0);
        const m1 = (0, factory_1.createCardInstance)("BP12-T10EN", 0);
        const m2 = (0, factory_1.createCardInstance)("BP17-T17EN", 0);
        state.players[0].zones.hand.push(m1, m2);
        state.players[0].zones.cemetery.push(nicola);
        (0, trigger_queue_1.queueLastWords)(state, nicola.instanceId, 0);
        state = (0, confirmation_1.runConfirmationTiming)(state);
        (0, vitest_1.expect)(state.pendingChoices?.type).toBe("choose");
        const pay = (0, applyAction_1.applyAction)(state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { optionIndex: 0 },
        });
        (0, vitest_1.expect)(pay.ok).toBe(true);
        (0, vitest_1.expect)(pay.state.pendingChoices?.type).toBe("selectZoneCards");
        const paid = (0, applyAction_1.applyAction)(pay.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [m1.instanceId, m2.instanceId] },
        });
        (0, vitest_1.expect)(paid.ok).toBe(true);
        state = paid.state;
        const inEx = state.players[0].zones.exArea.find((c) => c.instanceId === nicola.instanceId);
        (0, vitest_1.expect)(inEx).toBeTruthy();
        (0, vitest_1.expect)(inEx?.persistentPlayCostReduction).toBe(1);
        (0, vitest_1.expect)(inEx?.playCostReduction).toBe(0);
        (0, vitest_1.expect)((0, queries_1.getEffectivePlayCost)(inEx, "BP17-079EN", state, 0, "exArea")).toBe(1);
        const nextTurn = (0, setup_1.beginStartPhase)(structuredClone(state));
        (0, vitest_1.expect)(nextTurn.players[0].zones.exArea[0]?.persistentPlayCostReduction).toBe(1);
        (0, vitest_1.expect)(nextTurn.players[0].zones.exArea[0]?.playCostReduction).toBe(0);
        (0, vitest_1.expect)((0, queries_1.getEffectivePlayCost)(inEx, "BP17-079EN", nextTurn, 0, "exArea")).toBe(1);
        const played = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: nicola.instanceId,
        });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.players[0].pp).toBe(4);
    });
    (0, vitest_1.it)("taketsumi advance requires festive or swordcraft cards in cemetery", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        const taketsumi = (0, factory_1.createCardInstance)("BP14-018EN", 0);
        taketsumi.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(taketsumi);
        (0, vitest_1.expect)((0, queries_1.getActivatedAbilities)(state, taketsumi, 0, "field")).toHaveLength(0);
        (0, vitest_1.expect)((0, filterView_1.createPlayerView)(state, 0).legalActions.some((a) => a.startsWith("ACTIVATE:"))).toBe(false);
        for (let i = 0; i < 5; i++) {
            state.players[0].zones.cemetery.push((0, factory_1.createCardInstance)("BP14-T01EN", 0));
        }
        (0, vitest_1.expect)((0, queries_1.getActivatedAbilities)(state, taketsumi, 0, "field")).toHaveLength(1);
        const activated = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE",
            fieldInstanceId: taketsumi.instanceId,
        });
        (0, vitest_1.expect)(activated.ok).toBe(true);
    });
    (0, vitest_1.it)("super evolve triggers onSuperEvolve effects", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.turnNumber = 8;
        state.players[0].turnsPassed = 7;
        state.players[0].pp = 5;
        state.players[0].superEvoPoints = 1;
        const base = (0, factory_1.createCardInstance)("BP17-077EN", 0);
        base.onFieldSinceTurnStart = true;
        const evo = (0, factory_1.createCardInstance)("BP17-078EN", 0);
        const machinaInCemetery = (0, factory_1.createCardInstance)("BP12-T10EN", 0);
        state.players[0].zones.field.push(base);
        state.players[0].zones.evolveDeck.push(evo);
        state.players[0].zones.cemetery.push(machinaInCemetery);
        const evolved = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: base.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useSuperEvo: true,
            useEvoPoint: false,
        });
        (0, vitest_1.expect)(evolved.ok).toBe(true);
        const resolved = resolveAllChoices(evolved.state, 0);
        (0, vitest_1.expect)(resolved.players[0].zones.exArea.some((c) => c.cardNo === "BP12-T10EN")).toBe(true);
        const tutored = resolved.players[0].zones.exArea.find((c) => c.cardNo === "BP12-T10EN");
        (0, vitest_1.expect)(tutored?.playCostReduction).toBe(3);
        (0, vitest_1.expect)(tutored?.persistentPlayCostReduction).toBe(0);
        const afterEndTurn = (0, applyAction_1.applyAction)(resolved, 0, { type: "END_MAIN" }).state;
        const tutoredNextTurn = afterEndTurn.players[0].zones.exArea.find((c) => c.cardNo === "BP12-T10EN");
        (0, vitest_1.expect)(tutoredNextTurn?.playCostReduction).toBe(0);
        (0, vitest_1.expect)((0, queries_1.getEffectivePlayCost)(tutoredNextTurn, "BP12-T10EN", afterEndTurn, 0, "exArea")).toBe((0, registry_1.getCardDef)("BP12-T10EN")?.cost ?? 0);
    });
    (0, vitest_1.it)("front desk frog auto-evolve links stats and triggers on evolve", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        const jiemon = (0, factory_1.createCardInstance)("BP14-022EN", 0);
        jiemon.onFieldSinceTurnStart = true;
        const frog = (0, factory_1.createCardInstance)("BP14-030EN", 0);
        const enemy = (0, factory_1.createCardInstance)("MVP-012", 1);
        enemy.onFieldSinceTurnStart = true;
        enemy.engaged = true;
        state.players[0].zones.field.push(jiemon);
        state.players[1].zones.field.push(enemy);
        state.players[0].zones.hand.push(frog);
        state.players[0].zones.evolveDeck.push((0, factory_1.createCardInstance)("BP14-031EN", 0));
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: frog.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        const fieldFrog = played.state.players[0].zones.field.find((c) => c.cardNo === "BP14-030EN");
        (0, vitest_1.expect)(fieldFrog?.linkedEvoInstanceId).toBeTruthy();
        (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(fieldFrog, played.state).atk).toBe(3);
        const resolved = resolveAllChoices(played.state, 0);
        (0, vitest_1.expect)(resolved.players[1].zones.field.length).toBe(0);
    });
    (0, vitest_1.it)("steeled hopes defers fanfare until all three deck summons finish", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 7;
        const aenea = (0, factory_1.createCardInstance)("PR-173EN", 0);
        const machina2 = (0, factory_1.createCardInstance)("BP12-T10EN", 0);
        const machina3 = (0, factory_1.createCardInstance)("BP17-T17EN", 0);
        state.players[0].zones.deck.push(aenea, machina2, machina3);
        const spell = (0, factory_1.createCardInstance)("BP17-080EN", 0);
        state.players[0].zones.hand.push(spell);
        let current = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
        (0, vitest_1.expect)(current.ok).toBe(true);
        current = (0, applyAction_1.applyAction)(current.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { optionIndex: 1 },
        });
        (0, vitest_1.expect)(current.ok).toBe(true);
        (0, vitest_1.expect)(current.state.pendingChoices?.type).toBe("selectZoneCard");
        const firstPick = (0, applyAction_1.applyAction)(current.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceId: aenea.instanceId },
        });
        (0, vitest_1.expect)(firstPick.ok).toBe(true);
        (0, vitest_1.expect)(firstPick.state.players[0].zones.field.length).toBe(1);
        (0, vitest_1.expect)(firstPick.state.pendingTriggers.some((t) => t.timing === "fanfare")).toBe(true);
        (0, vitest_1.expect)(firstPick.state.pendingChoices?.type).toBe("selectZoneCard");
        const finished = resolveAllChoices(firstPick.state, 0);
        (0, vitest_1.expect)(finished.players[0].zones.field.length).toBe(3);
        (0, vitest_1.expect)(finished.pendingTriggers.some((t) => t.timing === "fanfare")).toBe(false);
    });
    (0, vitest_1.it)("steeled hopes option 2 requires 6 additional PP and summons three followers", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 6;
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("BP12-T10EN", 0), (0, factory_1.createCardInstance)("BP17-T17EN", 0), (0, factory_1.createCardInstance)("PR-170EN", 0));
        const spell = (0, factory_1.createCardInstance)("BP17-080EN", 0);
        state.players[0].zones.hand.push(spell);
        const played = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("choose");
        if (played.state.pendingChoices?.type === "choose") {
            (0, vitest_1.expect)(played.state.pendingChoices.options.some((o) => o.additionalPpCost === 6)).toBe(false);
        }
        const spell2 = (0, factory_1.createCardInstance)("BP17-080EN", 0);
        state.players[0].pp = 7;
        state.players[0].zones.hand.push(spell2);
        const played2 = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: spell2.instanceId });
        (0, vitest_1.expect)(played2.ok).toBe(true);
        if (played2.state.pendingChoices?.type === "choose") {
            (0, vitest_1.expect)(played2.state.pendingChoices.options.some((o) => o.additionalPpCost === 6)).toBe(true);
        }
        const chose = (0, applyAction_1.applyAction)(played2.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { optionIndex: 1 },
        });
        (0, vitest_1.expect)(chose.ok).toBe(true);
        (0, vitest_1.expect)(chose.state.players[0].pp).toBe(0);
        const finished = resolveAllChoices(chose.state, 0);
        (0, vitest_1.expect)(finished.players[0].zones.field.length).toBe(3);
    });
    (0, vitest_1.it)("burying followers from field triggers their last words", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        const leaderBefore = state.players[0].leaderDef;
        const droid = (0, factory_1.createCardInstance)("BP12-T10EN", 0);
        droid.onFieldSinceTurnStart = true;
        const rebel = (0, factory_1.createCardInstance)("PR-173EN", 0);
        const allyA = (0, factory_1.createCardInstance)("BP17-T17EN", 0);
        const allyB = (0, factory_1.createCardInstance)("PR-170EN", 0);
        state.players[0].zones.field.push(droid, rebel, allyA, allyB);
        const activated = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE",
            fieldInstanceId: droid.instanceId,
        });
        (0, vitest_1.expect)(activated.ok).toBe(true);
        (0, vitest_1.expect)(activated.state.pendingChoices?.type).toBe("selectZoneCards");
        const buried = (0, applyAction_1.applyAction)(activated.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: {
                instanceIds: [rebel.instanceId, allyA.instanceId, allyB.instanceId],
            },
        });
        (0, vitest_1.expect)(buried.ok).toBe(true);
        (0, vitest_1.expect)(buried.state.players[0].leaderDef).toBe(leaderBefore + 2);
    });
    (0, vitest_1.it)("bane destroys damage-capped followers after combat", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const steward = (0, factory_1.createCardInstance)("BP17-079EN", 0);
        steward.onFieldSinceTurnStart = true;
        const ally = (0, factory_1.createCardInstance)("BP12-T10EN", 0);
        const aenea = (0, factory_1.createCardInstance)("BP17-077EN", 1);
        const capped = (0, factory_1.createCardInstance)("BP12-082EN", 1);
        capped.onFieldSinceTurnStart = true;
        capped.engaged = true;
        state.players[0].zones.field.push(ally, steward);
        state.players[1].zones.field.push(aenea, capped);
        const attack = (0, applyAction_1.applyAction)(state, 0, {
            type: "ATTACK",
            attackerId: steward.instanceId,
            targetId: capped.instanceId,
        });
        (0, vitest_1.expect)(attack.ok).toBe(true);
        const after = attack.state.quickWindow === "afterAttack"
            ? (0, applyAction_1.applyAction)(attack.state, 1, { type: "PASS_QUICK_WINDOW" }).state
            : attack.state;
        (0, vitest_1.expect)(after.players[1].zones.field.some((c) => c.instanceId === capped.instanceId)).toBe(false);
    });
});
