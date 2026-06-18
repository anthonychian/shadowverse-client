"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStateFromSetup = buildStateFromSetup;
exports.runScenario = runScenario;
const applyAction_1 = require("../actions/applyAction");
const registry_1 = require("../cards/registry");
const queries_1 = require("../state/queries");
const confirmation_1 = require("../rules/confirmation");
const factory_1 = require("../state/factory");
const choice_resolver_1 = require("./choice-resolver");
const state_diff_1 = require("./state-diff");
const ZONE_NAMES = [
    "deck",
    "hand",
    "field",
    "cemetery",
    "exArea",
    "banish",
    "evolveDeck",
];
function findHandInstanceId(state, player, cardNo) {
    const card = state.players[player].zones.hand.find((c) => c.cardNo === cardNo);
    return card?.instanceId ?? null;
}
function findFieldInstanceId(state, player, cardNo) {
    const card = state.players[player].zones.field.find((c) => c.cardNo === cardNo);
    return card?.instanceId ?? null;
}
function buildStateFromSetup(setup) {
    (0, factory_1.resetIdCounter)();
    const state = (0, factory_1.createInitialGameState)(setup.activePlayer ?? 0);
    state.phase = setup.phase ?? "main";
    state.turnNumber = setup.turnNumber ?? 1;
    state.pendingChoices = null;
    state.pendingTriggers = [];
    for (const p of [0, 1]) {
        state.players[p].flags.mulliganDone = setup.mulliganDone !== false;
        if (setup.pp)
            state.players[p].pp = setup.pp[p];
        if (setup.leaderDef)
            state.players[p].leaderDef = setup.leaderDef[p];
        for (const zone of ZONE_NAMES) {
            const key = zone;
            const perPlayer = setup[key];
            if (!perPlayer)
                continue;
            const cardNos = perPlayer[p] ?? [];
            state.players[p].zones[zone] = cardNos.map((cardNo) => (0, factory_1.createCardInstance)(cardNo, p));
        }
    }
    if (setup.activePlayer != null) {
        state.activePlayer = setup.activePlayer;
    }
    return state;
}
function runAssertion(state, assertion) {
    switch (assertion.type) {
        case "zoneContains": {
            const list = state.players[assertion.player].zones[assertion.zone];
            const matches = list.filter((c) => c.cardNo === assertion.cardNo);
            const need = assertion.count ?? 1;
            if (matches.length < need) {
                return {
                    assertion,
                    pass: false,
                    message: `Expected ${need}× ${assertion.cardNo} in ${assertion.zone}, found ${matches.length}`,
                };
            }
            if (assertion.grantedKeywords) {
                const card = matches[0];
                for (const kw of assertion.grantedKeywords) {
                    if (!card.grantedKeywords.includes(kw)) {
                        return {
                            assertion,
                            pass: false,
                            message: `Expected ${assertion.cardNo} to have granted keyword ${kw}`,
                        };
                    }
                }
            }
            return { assertion, pass: true, message: "ok" };
        }
        case "notGranted": {
            const player = assertion.player ?? 0;
            const all = [
                ...state.players[player].zones.field,
                ...state.players[player].zones.hand,
            ];
            const card = all.find((c) => c.cardNo === assertion.cardNo);
            if (card?.grantedKeywords.includes(assertion.keyword)) {
                return {
                    assertion,
                    pass: false,
                    message: `${assertion.cardNo} should not have granted ${assertion.keyword}`,
                };
            }
            return { assertion, pass: true, message: "ok" };
        }
        case "leaderDef": {
            const def = state.players[assertion.player].leaderDef;
            return {
                assertion,
                pass: def === assertion.equals,
                message: def === assertion.equals ? "ok" : `leaderDef ${def} !== ${assertion.equals}`,
            };
        }
        case "zoneLength": {
            const len = state.players[assertion.player].zones[assertion.zone].length;
            return {
                assertion,
                pass: len === assertion.equals,
                message: len === assertion.equals ? "ok" : `zone length ${len} !== ${assertion.equals}`,
            };
        }
        case "noPendingChoices": {
            return {
                assertion,
                pass: state.pendingChoices === null,
                message: state.pendingChoices
                    ? `still pending: ${state.pendingChoices.type}`
                    : "ok",
            };
        }
        case "ppEquals": {
            const pp = state.players[assertion.player].pp;
            return {
                assertion,
                pass: pp === assertion.equals,
                message: pp === assertion.equals ? "ok" : `pp ${pp} !== ${assertion.equals}`,
            };
        }
        case "cardStat": {
            const list = state.players[assertion.player].zones[assertion.zone];
            const card = list.find((c) => c.cardNo === assertion.cardNo);
            if (!card) {
                return { assertion, pass: false, message: `${assertion.cardNo} not in ${assertion.zone}` };
            }
            const stats = (0, queries_1.getEffectiveStats)(card, state);
            const val = assertion.stat === "attack" ? stats.atk : stats.def;
            return {
                assertion,
                pass: val === assertion.equals,
                message: val === assertion.equals ? "ok" : `${assertion.stat} ${val} !== ${assertion.equals}`,
            };
        }
        case "hasKeyword": {
            const list = state.players[assertion.player].zones[assertion.zone];
            const card = list.find((c) => c.cardNo === assertion.cardNo);
            if (!card) {
                return { assertion, pass: false, message: `${assertion.cardNo} not in ${assertion.zone}` };
            }
            const has = card.grantedKeywords.includes(assertion.keyword) ||
                ((0, registry_1.getCardDef)(card.cardNo)?.keywords || []).includes(assertion.keyword);
            return {
                assertion,
                pass: has,
                message: has ? "ok" : `missing keyword ${assertion.keyword}`,
            };
        }
        case "cemeteryCount": {
            const len = state.players[assertion.player].zones.cemetery.length;
            return {
                assertion,
                pass: len === assertion.equals,
                message: len === assertion.equals ? "ok" : `cemetery ${len} !== ${assertion.equals}`,
            };
        }
        case "actionOk": {
            return { assertion, pass: assertion.equals, message: "checked in trace" };
        }
        default:
            return { assertion, pass: false, message: "unknown assertion type" };
    }
}
function executeAction(state, player, action) {
    if ("play" in action) {
        const id = findHandInstanceId(state, player, action.play);
        if (!id)
            return { state, ok: false, error: `card ${action.play} not in hand` };
        const result = (0, applyAction_1.applyAction)(state, player, { type: "PLAY_CARD", handInstanceId: id });
        if (!result.ok)
            return { state, ok: false, error: result.error };
        let next = (0, confirmation_1.runConfirmationTiming)(result.state);
        next = (0, choice_resolver_1.resolveChoicesWithHints)(next, player, (0, choice_resolver_1.hintsFromAction)(action));
        return { state: next, ok: true };
    }
    if ("activate" in action) {
        const id = findFieldInstanceId(state, player, action.activate);
        if (!id)
            return { state, ok: false, error: `card ${action.activate} not on field` };
        const result = (0, applyAction_1.applyAction)(state, player, { type: "ACTIVATE", fieldInstanceId: id });
        if (!result.ok)
            return { state, ok: false, error: result.error };
        let next = (0, choice_resolver_1.resolveChoicesWithHints)(result.state, player, (0, choice_resolver_1.hintsFromAction)(action));
        next = (0, confirmation_1.runConfirmationTiming)(next);
        return { state: next, ok: true };
    }
    if ("evolve" in action) {
        const id = findFieldInstanceId(state, player, action.evolve);
        if (!id)
            return { state, ok: false, error: `card ${action.evolve} not on field` };
        const result = (0, applyAction_1.applyAction)(state, player, { type: "EVOLVE", fieldInstanceId: id });
        if (!result.ok)
            return { state, ok: false, error: result.error };
        let next = (0, confirmation_1.runConfirmationTiming)(result.state);
        next = (0, choice_resolver_1.resolveChoicesWithHints)(next, player, (0, choice_resolver_1.hintsFromAction)(action));
        return { state: next, ok: true };
    }
    if ("attack" in action) {
        const attackerId = findFieldInstanceId(state, player, action.attack.attacker);
        if (!attackerId)
            return { state, ok: false, error: "attacker not on field" };
        const targetId = action.attack.target;
        const result = (0, applyAction_1.applyAction)(state, player, {
            type: "ATTACK",
            attackerId: attackerId,
            targetId: targetId,
        });
        if (!result.ok)
            return { state, ok: false, error: result.error };
        return { state: result.state, ok: true };
    }
    if ("endMain" in action) {
        const result = (0, applyAction_1.applyAction)(state, player, { type: "END_MAIN" });
        return { state: result.state, ok: result.ok, error: result.error };
    }
    if ("resolveTrigger" in action) {
        const next = (0, choice_resolver_1.resolveChoicesWithHints)(state, player, {
            triggerTiming: action.resolveTrigger,
        });
        return { state: (0, confirmation_1.runConfirmationTiming)(next), ok: true };
    }
    if ("selectZone" in action) {
        const next = (0, choice_resolver_1.resolveChoicesWithHints)(state, player, {
            selectCardNo: action.selectZone.cardNo,
        });
        return { state: (0, confirmation_1.runConfirmationTiming)(next), ok: true };
    }
    if ("selectTarget" in action) {
        const next = (0, choice_resolver_1.resolveChoicesWithHints)(state, player, {
            targetCardNo: action.selectTarget,
        });
        return { state: next, ok: true };
    }
    if ("chooseOption" in action) {
        const next = (0, choice_resolver_1.resolveChoicesWithHints)(state, player, {
            optionIndex: action.chooseOption,
        });
        return { state: next, ok: true };
    }
    if ("engageFollowers" in action) {
        const next = (0, choice_resolver_1.resolveChoicesWithHints)(state, player, {
            engageCardNos: action.engageFollowers,
        });
        return { state: (0, confirmation_1.runConfirmationTiming)(next), ok: true };
    }
    if ("autoResolve" in action) {
        const next = (0, choice_resolver_1.resolveChoicesWithHints)(state, player);
        return { state: (0, confirmation_1.runConfirmationTiming)(next), ok: true };
    }
    return { state, ok: false, error: "unknown action" };
}
function runScenario(scenario) {
    (0, factory_1.resetIdCounter)();
    let state = buildStateFromSetup(scenario.setup);
    const before = structuredClone(state);
    const trace = [];
    const player = scenario.setup.activePlayer ?? 0;
    for (let i = 0; i < scenario.actions.length; i++) {
        const action = scenario.actions[i];
        const result = executeAction(state, player, action);
        trace.push({
            index: i,
            action,
            ok: result.ok,
            error: result.error,
            pendingChoiceType: state.pendingChoices?.type,
        });
        state = result.state;
        if (!result.ok)
            break;
    }
    const assertionResults = (scenario.assertions ?? []).map((a) => runAssertion(state, a));
    const allPass = assertionResults.every((r) => r.pass) && trace.every((t) => t.ok);
    return {
        scenario,
        success: allPass && !state.pendingChoices,
        finalState: state,
        trace,
        assertionResults,
        unresolvedChoice: state.pendingChoices?.type ?? null,
        stateDiff: (0, state_diff_1.formatStateDiff)(before, state),
    };
}
