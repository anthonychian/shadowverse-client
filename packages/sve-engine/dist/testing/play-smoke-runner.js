"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPlaySmoke = runPlaySmoke;
exports.runPlaySmokeBatch = runPlaySmokeBatch;
const applyAction_1 = require("../actions/applyAction");
const registry_1 = require("../cards/registry");
const confirmation_1 = require("../rules/confirmation");
const factory_1 = require("../state/factory");
const choice_resolver_1 = require("./choice-resolver");
const state_diff_1 = require("./state-diff");
const DUMMY_FOLLOWER = "BP07-001EN";
function findHandInstanceId(state, player, cardNo) {
    const card = state.players[player].zones.hand.find((c) => c.cardNo === cardNo);
    return card?.instanceId ?? null;
}
function findFieldInstanceId(state, player, cardNo) {
    const card = state.players[player].zones.field.find((c) => c.cardNo === cardNo);
    return card?.instanceId ?? null;
}
function buildMinimalBoard(cardNo, timing) {
    (0, factory_1.resetIdCounter)();
    const def = (0, registry_1.getCardDef)(cardNo);
    const cost = def?.cost ?? 1;
    const state = (0, factory_1.createInitialGameState)(0);
    state.phase = "main";
    state.turnNumber = 1;
    state.players[0].flags.mulliganDone = true;
    state.players[1].flags.mulliganDone = true;
    state.players[0].pp = Math.max(cost + 5, 10);
    state.players[1].pp = 10;
    state.players[1].leaderDef = 20;
    state.players[0].zones.deck = Array.from({ length: 10 }, () => (0, factory_1.createCardInstance)("BP07-002EN", 0));
    state.players[1].zones.deck = Array.from({ length: 10 }, () => (0, factory_1.createCardInstance)("BP07-002EN", 1));
    if (timing === "onEvolve" || timing === "activated") {
        state.players[0].zones.hand = [(0, factory_1.createCardInstance)(cardNo, 0)];
        state.players[0].zones.field = [
            (0, factory_1.createCardInstance)(DUMMY_FOLLOWER, 0),
            (0, factory_1.createCardInstance)(cardNo, 0),
        ];
        state.players[1].zones.field = [(0, factory_1.createCardInstance)(DUMMY_FOLLOWER, 1)];
        state.players[0].evoPoints = 2;
        state.players[0].superEvoPoints = 1;
    }
    else {
        state.players[0].zones.hand = [(0, factory_1.createCardInstance)(cardNo, 0)];
        state.players[1].zones.field = [(0, factory_1.createCardInstance)(DUMMY_FOLLOWER, 1)];
    }
    return state;
}
function stateChanged(before, after) {
    const a = (0, state_diff_1.snapshotState)(before);
    const b = (0, state_diff_1.snapshotState)(after);
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
        if (JSON.stringify(a[key] ?? []) !== JSON.stringify(b[key] ?? []))
            return true;
    }
    if (after.pendingTriggers.length !== before.pendingTriggers.length)
        return true;
    return false;
}
function tryPlay(state, cardNo) {
    const id = findHandInstanceId(state, 0, cardNo);
    if (!id)
        return { state, ok: false, error: "not in hand" };
    const result = (0, applyAction_1.applyAction)(state, 0, { type: "PLAY_CARD", handInstanceId: id });
    if (!result.ok)
        return { state, ok: false, error: result.error };
    let next = (0, confirmation_1.runConfirmationTiming)(result.state);
    next = (0, choice_resolver_1.resolveChoicesWithHints)(next, 0, (0, choice_resolver_1.hintsFromAction)({ autoResolve: true }));
    next = (0, confirmation_1.runConfirmationTiming)(next);
    return { state: next, ok: true };
}
function tryActivate(state, cardNo) {
    const id = findFieldInstanceId(state, 0, cardNo);
    if (!id)
        return { state, ok: false, error: "not on field" };
    const result = (0, applyAction_1.applyAction)(state, 0, { type: "ACTIVATE", fieldInstanceId: id });
    if (!result.ok)
        return { state, ok: false, error: result.error };
    let next = (0, choice_resolver_1.resolveChoicesWithHints)(result.state, 0, (0, choice_resolver_1.hintsFromAction)({ autoResolve: true }));
    next = (0, confirmation_1.runConfirmationTiming)(next);
    return { state: next, ok: true };
}
function tryEvolve(state, cardNo) {
    const id = findFieldInstanceId(state, 0, cardNo);
    if (!id)
        return { state, ok: false, error: "not on field" };
    const result = (0, applyAction_1.applyAction)(state, 0, { type: "EVOLVE", fieldInstanceId: id });
    if (!result.ok)
        return { state, ok: false, error: result.error };
    let next = (0, confirmation_1.runConfirmationTiming)(result.state);
    next = (0, choice_resolver_1.resolveChoicesWithHints)(next, 0, (0, choice_resolver_1.hintsFromAction)({ autoResolve: true }));
    next = (0, confirmation_1.runConfirmationTiming)(next);
    return { state: next, ok: true };
}
function smokeAbility(cardNo, ability) {
    const def = (0, registry_1.getCardDef)(cardNo);
    const name = def?.name ?? cardNo;
    const timing = ability.timing;
    if (timing === "passive" || timing === "aura" || timing === "lastWords" || timing === "strike") {
        return { cardNo, name, status: "skipped", timing };
    }
    const hasCondition = Boolean(ability.condition);
    const before = buildMinimalBoard(cardNo, timing);
    const beforeClone = structuredClone(before);
    let result;
    if (timing === "activated") {
        result = tryActivate(before, cardNo);
    }
    else if (timing === "onEvolve") {
        result = tryEvolve(before, cardNo);
    }
    else {
        result = tryPlay(before, cardNo);
    }
    if (!result.ok) {
        return {
            cardNo,
            name,
            status: hasCondition ? "play_blocked" : "play_blocked",
            timing,
            error: result.error,
            hasCondition,
        };
    }
    if (result.state.pendingChoices) {
        return {
            cardNo,
            name,
            status: "unresolved",
            timing,
            error: result.state.pendingChoices.type,
            hasCondition,
        };
    }
    const changed = stateChanged(beforeClone, result.state);
    return {
        cardNo,
        name,
        status: changed ? "play_ok" : "play_noop",
        timing,
        hasCondition,
    };
}
function runPlaySmoke(cardNo) {
    const def = (0, registry_1.getCardDef)(cardNo);
    if (!def?.abilities?.length) {
        return [
            {
                cardNo,
                name: def?.name ?? cardNo,
                status: "skipped",
                error: "no abilities",
            },
        ];
    }
    const actionable = def.abilities.filter((a) => a.timing === "fanfare" ||
        a.timing === "spell" ||
        a.timing === "activated" ||
        a.timing === "onEvolve");
    if (!actionable.length) {
        return [{ cardNo, name: def.name ?? cardNo, status: "skipped" }];
    }
    return actionable.map((a) => smokeAbility(cardNo, a));
}
function runPlaySmokeBatch(cardNos) {
    const results = [];
    for (const cardNo of cardNos) {
        results.push(...runPlaySmoke(cardNo));
    }
    return results;
}
