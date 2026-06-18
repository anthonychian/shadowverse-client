"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applyAction_1 = require("./actions/applyAction");
const registry_1 = require("./cards/registry");
const confirmation_1 = require("./rules/confirmation");
const trigger_queue_1 = require("./rules/trigger-queue");
const factory_1 = require("./state/factory");
const factory_2 = require("./state/factory");
const queries_1 = require("./state/queries");
const zones_1 = require("./state/zones");
const filterView_1 = require("./view/filterView");
(0, vitest_1.describe)("abyss deck DSL", () => {
    (0, vitest_1.it)("registers Magitrain as an amulet with maneuver act and strike", () => {
        const def = (0, registry_1.getCardDef)("BP11-T02EN");
        (0, vitest_1.expect)(def.cardType).toBe("amulet");
        (0, vitest_1.expect)(def.abilities?.some((a) => a.timing === "strike")).toBe(true);
        (0, vitest_1.expect)(def.abilities?.some((a) => a.timing === "activated")).toBe(true);
    });
    // Magitrain maneuver and Chris necrocharge: see scenarios/cards/*.yaml + scenario.test.ts
    (0, vitest_1.it)("evolved followers count as their base printed cost for engage costs", () => {
        (0, vitest_1.expect)((0, queries_1.resolveCardDefCost)("BP11-070EN")).toBe(5);
        (0, vitest_1.expect)((0, queries_1.resolveCardDefCost)("BP11-069EN")).toBe(5);
    });
    (0, vitest_1.it)("Magitrain maneuver can engage a single evolved 5-cost follower", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        state.players[1].flags.mulliganDone = true;
        state.players[0].pp = 5;
        const train = (0, factory_2.createCardInstance)("BP11-T02EN", 0);
        const ices = (0, factory_2.createCardInstance)("BP11-069EN", 0);
        const evoDeck = (0, factory_2.createCardInstance)("BP11-070EN", 0);
        ices.linkedEvoInstanceId = evoDeck.instanceId;
        state.players[0].zones.field.push(train, ices);
        state.players[0].zones.deck.push(evoDeck);
        const activated = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE",
            fieldInstanceId: train.instanceId,
        });
        (0, vitest_1.expect)(activated.ok).toBe(true);
        (0, vitest_1.expect)(activated.state.pendingChoices?.type).toBe("engageFollowersForCost");
        const choice = activated.state.pendingChoices;
        if (choice.type !== "engageFollowersForCost")
            throw new Error("expected engage choice");
        (0, vitest_1.expect)(choice.options).toHaveLength(1);
        (0, vitest_1.expect)(choice.options[0].cost).toBe(5);
        const engaged = (0, applyAction_1.applyAction)(activated.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [ices.instanceId] },
        });
        (0, vitest_1.expect)(engaged.ok).toBe(true);
        const onField = engaged.state.players[0].zones.field.find((c) => c.instanceId === train.instanceId);
        const icesOnField = engaged.state.players[0].zones.field.find((c) => c.instanceId === ices.instanceId);
        (0, vitest_1.expect)((0, queries_1.isFieldFollower)(engaged.state, onField)).toBe(true);
        (0, vitest_1.expect)(icesOnField.engaged).toBe(true);
    });
    (0, vitest_1.it)("Arcus cannot declare attacks", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        const arcus = (0, factory_2.createCardInstance)("BP09-091EN", 0);
        arcus.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(arcus);
        (0, vitest_1.expect)((0, queries_1.canDeclareAttack)(state, arcus)).toBe(false);
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions.some((a) => a.startsWith(`ATTACK:${arcus.instanceId}`))).toBe(false);
    });
    (0, vitest_1.it)("Dead to Rights has cemetery act and quick spell", () => {
        const def = (0, registry_1.getCardDef)("BP11-075EN");
        (0, vitest_1.expect)(def.abilities?.some((a) => a.activateFrom === "cemetery")).toBe(true);
        (0, vitest_1.expect)(def.abilities?.some((a) => a.timing === "spell" && a.quick)).toBe(true);
    });
    (0, vitest_1.it)("Wretch evolve requires entered from cemetery", () => {
        const def = (0, registry_1.getCardDef)("BP11-076EN");
        const rule = def.abilities?.find((a) => a.timing === "evolve");
        (0, vitest_1.expect)(rule?.condition).toMatchObject({ type: "enteredFromCemetery" });
    });
    function resolveIllganeauChoices(state, cemeteryPickId, acceptSummon) {
        let current = state;
        for (let step = 0; step < 12 && current.pendingChoices; step++) {
            const choice = current.pendingChoices;
            if (choice.type === "choose" && acceptSummon != null) {
                current = (0, applyAction_1.applyAction)(current, 0, {
                    type: "CHOICE_RESPONSE",
                    payload: { optionIndex: acceptSummon ? 0 : 1 },
                }).state;
            }
            else if (choice.type === "selectZoneCard") {
                current = (0, applyAction_1.applyAction)(current, 0, {
                    type: "CHOICE_RESPONSE",
                    payload: { instanceId: cemeteryPickId },
                }).state;
            }
            else {
                break;
            }
        }
        return current;
    }
    (0, vitest_1.it)("Illganeau fanfare does nothing without Necrocharge 10", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        state.players[0].pp = 5;
        const wretch = (0, factory_2.createCardInstance)("BP11-076EN", 0);
        for (let i = 0; i < 4; i++) {
            state.players[0].zones.cemetery.push((0, factory_2.createCardInstance)("BP11-074EN", 0));
        }
        state.players[0].zones.cemetery.push(wretch);
        const illganeau = (0, factory_2.createCardInstance)("BP11-071EN", 0);
        state.players[0].zones.exArea.push(illganeau);
        const played = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: illganeau.instanceId,
        });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices).toBeNull();
        (0, vitest_1.expect)(played.state.players[0].zones.cemetery.some((c) => c.instanceId === wretch.instanceId)).toBe(true);
        (0, vitest_1.expect)(played.state.players[0].zones.hand.some((c) => c.instanceId === wretch.instanceId)).toBe(false);
        (0, vitest_1.expect)(played.state.players[0].zones.field.some((c) => c.instanceId === illganeau.instanceId)).toBe(true);
    });
    (0, vitest_1.it)("Illganeau Necrocharge optionally summons from cemetery and banishes itself", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        state.players[0].pp = 5;
        const wretch = (0, factory_2.createCardInstance)("BP11-076EN", 0);
        for (let i = 0; i < 10; i++) {
            state.players[0].zones.cemetery.push((0, factory_2.createCardInstance)("BP11-074EN", 0));
        }
        state.players[0].zones.cemetery.push(wretch);
        const illganeau = (0, factory_2.createCardInstance)("BP11-071EN", 0);
        state.players[0].zones.hand.push(illganeau);
        const played = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: illganeau.instanceId,
        });
        (0, vitest_1.expect)(played.ok).toBe(true);
        (0, vitest_1.expect)(played.state.pendingChoices?.type).toBe("choose");
        const after = resolveIllganeauChoices(played.state, wretch.instanceId, true);
        (0, vitest_1.expect)(after.players[0].zones.field.some((c) => c.instanceId === wretch.instanceId)).toBe(true);
        (0, vitest_1.expect)(after.players[0].zones.hand.some((c) => c.instanceId === wretch.instanceId)).toBe(false);
        (0, vitest_1.expect)(after.players[0].zones.banish.some((c) => c.instanceId === illganeau.instanceId)).toBe(true);
    });
    (0, vitest_1.it)("Wolfling's Struggle deals 1 damage and may discard to bury", () => {
        const def = (0, registry_1.getCardDef)("BP14-T05EN");
        (0, vitest_1.expect)(def.abilities?.some((a) => a.timing === "spell")).toBe(true);
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        const token = (0, factory_2.createCardInstance)("BP14-T05EN", 0);
        state.players[0].zones.exArea.push(token);
        const enemy = (0, factory_2.createCardInstance)("MVP-012", 1);
        enemy.onFieldSinceTurnStart = true;
        state.players[1].zones.field.push(enemy);
        const handCard = (0, factory_2.createCardInstance)("MVP-013", 0);
        state.players[0].zones.hand.push(handCard);
        for (let i = 0; i < 3; i++) {
            state.players[0].zones.deck.push((0, factory_2.createCardInstance)("MVP-014", 0));
        }
        const defBefore = (0, queries_1.getEffectiveStats)(enemy, state).def;
        let current = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: token.instanceId,
        }).state;
        for (let step = 0; step < 8 && current.pendingChoices; step++) {
            const choice = current.pendingChoices;
            if (choice.type === "selectTarget") {
                current = (0, applyAction_1.applyAction)(current, 0, {
                    type: "CHOICE_RESPONSE",
                    payload: { targetId: enemy.instanceId },
                }).state;
            }
            else if (choice.type === "choose") {
                current = (0, applyAction_1.applyAction)(current, 0, {
                    type: "CHOICE_RESPONSE",
                    payload: { optionIndex: 0 },
                }).state;
            }
            else if (choice.type === "selectZoneCards") {
                current = (0, applyAction_1.applyAction)(current, 0, {
                    type: "CHOICE_RESPONSE",
                    payload: { instanceIds: [handCard.instanceId] },
                }).state;
            }
            else {
                break;
            }
        }
        const damaged = current.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
        (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(damaged, current).def).toBe(defBefore - 1);
        (0, vitest_1.expect)(current.players[0].zones.cemetery.some((c) => c.instanceId === handCard.instanceId)).toBe(true);
        (0, vitest_1.expect)(current.players[0].zones.deck).toHaveLength(2);
    });
    (0, vitest_1.it)("registers Mimi and Coco token last words for Cerberus", () => {
        const mimi = (0, registry_1.getCardDef)("BP16-T04EN");
        const coco = (0, registry_1.getCardDef)("BP16-T05EN");
        (0, vitest_1.expect)(mimi.abilities?.find((a) => a.timing === "lastWords")?.effect).toMatchObject({
            op: "sequence",
            steps: [
                { op: "dealDamage", amount: 2 },
                { op: "mill", count: 1 },
            ],
        });
        (0, vitest_1.expect)(coco.abilities?.find((a) => a.timing === "lastWords")?.effect).toMatchObject({
            op: "sequence",
            steps: [{ op: "healLeader", amount: 2 }, { op: "mill", count: 1 }],
        });
    });
    (0, vitest_1.it)("Mimi last words deals 2 damage and buries", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const mimi = (0, factory_2.createCardInstance)("BP16-T04EN", 0);
        state.players[0].zones.field.push(mimi);
        const enemy = (0, factory_2.createCardInstance)("BP16-077EN", 1);
        enemy.onFieldSinceTurnStart = true;
        state.players[1].zones.field.push(enemy);
        for (let i = 0; i < 3; i++) {
            state.players[0].zones.deck.push((0, factory_2.createCardInstance)("MVP-014", 0));
        }
        const defBefore = (0, queries_1.getEffectiveStats)(enemy, state).def;
        (0, trigger_queue_1.queueLastWords)(state, mimi.instanceId, 0);
        state = (0, confirmation_1.runConfirmationTiming)(state);
        if (state.pendingChoices?.type === "selectTarget") {
            state = (0, applyAction_1.applyAction)(state, 0, {
                type: "CHOICE_RESPONSE",
                payload: { targetId: enemy.instanceId },
            }).state;
        }
        const damaged = state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
        (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(damaged, state).def).toBe(defBefore - 2);
        (0, vitest_1.expect)(state.players[0].zones.deck).toHaveLength(2);
        (0, vitest_1.expect)(state.players[0].zones.cemetery).toHaveLength(1);
    });
    (0, vitest_1.it)("Coco last words heals leader and buries", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].leaderDef = 15;
        const coco = (0, factory_2.createCardInstance)("BP16-T05EN", 0);
        state.players[0].zones.field.push(coco);
        for (let i = 0; i < 3; i++) {
            state.players[0].zones.deck.push((0, factory_2.createCardInstance)("MVP-014", 0));
        }
        (0, trigger_queue_1.queueLastWords)(state, coco.instanceId, 0);
        state = (0, confirmation_1.runConfirmationTiming)(state);
        (0, vitest_1.expect)(state.players[0].leaderDef).toBe(17);
        (0, vitest_1.expect)(state.players[0].zones.deck).toHaveLength(2);
        (0, vitest_1.expect)(state.players[0].zones.cemetery).toHaveLength(1);
    });
    (0, vitest_1.it)("Mukan evolve prompts cemetery summon and summons selected Departed follower", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        state.players[0].pp = 5;
        state.players[0].evoPoints = 2;
        const mukan = (0, factory_2.createCardInstance)("BP16-081EN", 0);
        mukan.onFieldSinceTurnStart = true;
        const evo = (0, factory_2.createCardInstance)("BP16-082EN", 0);
        const illganeau = (0, factory_2.createCardInstance)("BP11-071EN", 0);
        state.players[0].zones.field.push(mukan);
        state.players[0].zones.evolveDeck.push(evo);
        state.players[0].zones.cemetery.push(illganeau);
        const evolved = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: mukan.instanceId,
            evolveDeckInstanceId: evo.instanceId,
        });
        (0, vitest_1.expect)(evolved.ok).toBe(true);
        (0, vitest_1.expect)(evolved.state.pendingChoices?.type).toBe("selectCemeterySummon");
        const cemeteryChoice = evolved.state.pendingChoices;
        if (cemeteryChoice?.type !== "selectCemeterySummon")
            throw new Error("expected cemetery summon");
        (0, vitest_1.expect)(cemeteryChoice.options.some((o) => o.instanceId === illganeau.instanceId)).toBe(true);
        const summoned = (0, applyAction_1.applyAction)(evolved.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [illganeau.instanceId] },
        });
        (0, vitest_1.expect)(summoned.ok).toBe(true);
        (0, vitest_1.expect)(summoned.state.players[0].zones.field.some((c) => c.instanceId === illganeau.instanceId)).toBe(true);
        (0, vitest_1.expect)(summoned.state.players[0].zones.cemetery.some((c) => c.instanceId === illganeau.instanceId)).toBe(false);
    });
    (0, vitest_1.it)("Mukan super-evolve with SE first allows both cemetery summons", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        state.players[0].pp = 10;
        state.players[0].evoPoints = 2;
        state.players[0].superEvoPoints = 1;
        state.players[0].turnsPassed = 7;
        const mukan = (0, factory_2.createCardInstance)("BP16-081EN", 0);
        mukan.onFieldSinceTurnStart = true;
        const evo = (0, factory_2.createCardInstance)("BP16-082EN", 0);
        const illganeau = (0, factory_2.createCardInstance)("BP11-071EN", 0);
        const wretch = (0, factory_2.createCardInstance)("BP11-076EN", 0);
        state.players[0].zones.field.push(mukan);
        state.players[0].zones.evolveDeck.push(evo);
        state.players[0].zones.cemetery.push(illganeau, wretch);
        const evolved = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: mukan.instanceId,
            evolveDeckInstanceId: evo.instanceId,
            useSuperEvo: true,
        });
        (0, vitest_1.expect)(evolved.ok).toBe(true);
        (0, vitest_1.expect)(evolved.state.pendingChoices?.type).toBe("chooseMultiple");
        const ordered = (0, applyAction_1.applyAction)(evolved.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { optionIndices: [1, 0] },
        });
        (0, vitest_1.expect)(ordered.ok).toBe(true);
        (0, vitest_1.expect)(ordered.state.pendingChoices?.type).toBe("selectCemeterySummon");
        const firstSummon = (0, applyAction_1.applyAction)(ordered.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [illganeau.instanceId] },
        });
        (0, vitest_1.expect)(firstSummon.ok).toBe(true);
        (0, vitest_1.expect)(firstSummon.state.pendingChoices?.type).toBe("selectCemeterySummon");
        const secondSummon = (0, applyAction_1.applyAction)(firstSummon.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [wretch.instanceId] },
        });
        (0, vitest_1.expect)(secondSummon.ok).toBe(true);
        (0, vitest_1.expect)(secondSummon.state.players[0].zones.field.some((c) => c.instanceId === illganeau.instanceId)).toBe(true);
        (0, vitest_1.expect)(secondSummon.state.players[0].zones.field.some((c) => c.instanceId === wretch.instanceId)).toBe(true);
    });
    (0, vitest_1.it)("Mukan evolve cemetery summon can be skipped", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        state.players[0].pp = 5;
        state.players[0].evoPoints = 2;
        const mukan = (0, factory_2.createCardInstance)("BP16-081EN", 0);
        mukan.onFieldSinceTurnStart = true;
        const evo = (0, factory_2.createCardInstance)("BP16-082EN", 0);
        const illganeau = (0, factory_2.createCardInstance)("BP11-071EN", 0);
        state.players[0].zones.field.push(mukan);
        state.players[0].zones.evolveDeck.push(evo);
        state.players[0].zones.cemetery.push(illganeau);
        const evolved = (0, applyAction_1.applyAction)(state, 0, {
            type: "EVOLVE",
            fieldInstanceId: mukan.instanceId,
            evolveDeckInstanceId: evo.instanceId,
        });
        (0, vitest_1.expect)(evolved.state.pendingChoices?.type).toBe("selectCemeterySummon");
        const skipped = (0, applyAction_1.applyAction)(evolved.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [] },
        });
        (0, vitest_1.expect)(skipped.ok).toBe(true);
        (0, vitest_1.expect)(skipped.state.pendingChoices).toBeNull();
        (0, vitest_1.expect)(skipped.state.players[0].zones.field.some((c) => c.instanceId === illganeau.instanceId)).toBe(false);
    });
    (0, vitest_1.it)("Greatpick Corpse resummons Mimi after her last words when LW is chosen first", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        const greatpick = (0, factory_2.createCardInstance)("BP11-074EN", 0);
        const mimi = (0, factory_2.createCardInstance)("BP16-T04EN", 0);
        const enemy = (0, factory_2.createCardInstance)("MVP-012", 1);
        enemy.onFieldSinceTurnStart = true;
        state.players[0].zones.field.push(greatpick, mimi);
        state.players[1].zones.field.push(enemy);
        for (let i = 0; i < 3; i++) {
            state.players[0].zones.deck.push((0, factory_2.createCardInstance)("MVP-014", 0));
        }
        (0, trigger_queue_1.queueLastWords)(state, mimi.instanceId, 0);
        state = (0, zones_1.destroyFollower)(state, mimi.instanceId);
        state = (0, confirmation_1.runConfirmationTiming)(state);
        (0, vitest_1.expect)(state.pendingChoices?.type).toBe("selectTrigger");
        const lwTrigger = state.pendingTriggers.find((t) => t.timing === "lastWords");
        (0, vitest_1.expect)(lwTrigger).toBeDefined();
        const picked = (0, applyAction_1.applyAction)(state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { triggerId: lwTrigger.id },
        });
        (0, vitest_1.expect)(picked.ok).toBe(true);
        let current = picked.state;
        if (current.pendingChoices?.type === "selectTarget") {
            const resolved = (0, applyAction_1.applyAction)(current, 0, {
                type: "CHOICE_RESPONSE",
                payload: { targetId: enemy.instanceId },
            });
            (0, vitest_1.expect)(resolved.ok).toBe(true);
            current = resolved.state;
        }
        (0, vitest_1.expect)(current.players[0].zones.field.some((c) => c.cardNo === "BP16-T04EN")).toBe(true);
        (0, vitest_1.expect)(current.players[0].zones.banish.some((c) => c.cardNo === "BP16-T04EN")).toBe(true);
    });
    (0, vitest_1.it)("registers Bullet Bike and Arcane Personnel Carrier with bury-act abilities", () => {
        const bike = (0, registry_1.getCardDef)("BP11-T04EN");
        const carrier = (0, registry_1.getCardDef)("BP11-T05EN");
        (0, vitest_1.expect)(bike.cardType).toBe("amulet");
        (0, vitest_1.expect)(carrier.cardType).toBe("amulet");
        (0, vitest_1.expect)(bike.abilities?.[0]?.cost?.burySelf).toBe(true);
        (0, vitest_1.expect)(carrier.abilities?.[0]?.cost?.burySelf).toBe(true);
    });
    (0, vitest_1.it)("Bullet Bike act buries itself and gives Rush (+1 atk to Wasteland)", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        state.players[1].flags.mulliganDone = true;
        const bike = (0, factory_2.createCardInstance)("BP11-T04EN", 0);
        const wasteland = (0, factory_2.createCardInstance)("BP11-076EN", 0);
        state.players[0].zones.field.push(bike, wasteland);
        const activated = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE",
            fieldInstanceId: bike.instanceId,
        });
        (0, vitest_1.expect)(activated.ok).toBe(true);
        (0, vitest_1.expect)(activated.state.pendingChoices?.type).toBe("selectTarget");
        (0, vitest_1.expect)(activated.state.players[0].zones.banish.some((c) => c.instanceId === bike.instanceId)).toBe(true);
        const resolved = (0, applyAction_1.applyAction)(activated.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { targetId: wasteland.instanceId },
        });
        (0, vitest_1.expect)(resolved.ok).toBe(true);
        const target = resolved.state.players[0].zones.field.find((c) => c.instanceId === wasteland.instanceId);
        (0, vitest_1.expect)(target.grantedKeywords).toContain("rush");
        (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(target, resolved.state).atk).toBe(4);
    });
    (0, vitest_1.it)("Arcane Personnel Carrier act buries itself and gives Ward (+1 def to Wasteland)", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        state.players[1].flags.mulliganDone = true;
        const carrier = (0, factory_2.createCardInstance)("BP11-T05EN", 0);
        const wasteland = (0, factory_2.createCardInstance)("BP11-077EN", 0);
        state.players[0].zones.field.push(carrier, wasteland);
        const activated = (0, applyAction_1.applyAction)(state, 0, {
            type: "ACTIVATE",
            fieldInstanceId: carrier.instanceId,
        });
        (0, vitest_1.expect)(activated.ok).toBe(true);
        (0, vitest_1.expect)(activated.state.pendingChoices?.type).toBe("selectTarget");
        (0, vitest_1.expect)(activated.state.players[0].zones.banish.some((c) => c.instanceId === carrier.instanceId)).toBe(true);
        const resolved = (0, applyAction_1.applyAction)(activated.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { targetId: wasteland.instanceId },
        });
        (0, vitest_1.expect)(resolved.ok).toBe(true);
        const target = resolved.state.players[0].zones.field.find((c) => c.instanceId === wasteland.instanceId);
        (0, vitest_1.expect)(target.grantedKeywords).toContain("ward");
        (0, vitest_1.expect)((0, queries_1.getEffectiveStats)(target, resolved.state).def).toBe(4);
    });
});
