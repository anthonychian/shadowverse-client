"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlayerView = createPlayerView;
exports.tryAction = tryAction;
const applyAction_1 = require("../actions/applyAction");
const registry_1 = require("../cards/registry");
const resolver_1 = require("../effects/resolver");
const effect_utils_1 = require("../rules/effect-utils");
const queries_1 = require("../state/queries");
function createPlayerView(state, self) {
    const opponent = (0, queries_1.opponentOf)(self);
    const view = structuredClone(state);
    view.players[opponent].zones.hand = view.players[opponent].zones.hand.map((c) => ({
        ...c,
        cardNo: "HIDDEN",
    }));
    view.players[self].zones.evolveDeck = view.players[self].zones.evolveDeck;
    view.players[opponent].zones.evolveDeck = view.players[opponent].zones.evolveDeck.map((c) => ({
        ...c,
        cardNo: "HIDDEN",
    }));
    view.players[opponent].zones.deck = view.players[opponent].zones.deck.map((c) => ({
        ...c,
        cardNo: "HIDDEN",
    }));
    const legalActions = [];
    const blockedByOpponentQuick = state.quickWindow != null && state.quickWindowPlayer !== self;
    if (state.phase === "main" &&
        state.activePlayer === self &&
        !state.pendingChoices &&
        !blockedByOpponentQuick) {
        legalActions.push("END_MAIN");
        const pp = state.players[self].pp;
        const p = state.players[self];
        for (const card of p.zones.hand) {
            const cost = (0, queries_1.getEffectivePlayCost)(card, card.cardNo, state, self, "hand");
            if (pp >= cost && (0, resolver_1.canPlayCardFromZones)(state, self, card.cardNo)) {
                legalActions.push(`PLAY:${card.instanceId}`);
            }
            const handActivated = (0, queries_1.getActivatedAbilities)(state, card, self, "hand");
            if (handActivated.length > 0) {
                const activateCost = handActivated[0].ability.cost?.pp ?? 0;
                const ppPay = (0, queries_1.computeEvolvePayment)(activateCost, pp, p.evoPoints, false);
                if (ppPay.ok)
                    legalActions.push(`ACTIVATE_HAND:${card.instanceId}`);
            }
        }
        for (const card of p.zones.exArea) {
            const cost = (0, queries_1.getEffectivePlayCost)(card, card.cardNo, state, self, "exArea");
            if (pp >= cost && (0, resolver_1.canPlayCardFromZones)(state, self, card.cardNo)) {
                legalActions.push(`PLAY:${card.instanceId}`);
            }
        }
        for (const card of p.zones.field) {
            if ((0, queries_1.isFieldFollower)(state, card) && !card.engaged && !(0, queries_1.isBoxed)(card, state)) {
                const canAttack = (0, queries_1.canDeclareAttack)(state, card) &&
                    (card.onFieldSinceTurnStart ||
                        card.evolvedThisTurn ||
                        (0, queries_1.hasKeyword)(card, "storm", state) ||
                        (0, queries_1.hasKeyword)(card, "rush", state));
                if (canAttack) {
                    legalActions.push(`ATTACK:${card.instanceId}`);
                    for (const target of (0, queries_1.getLegalAttackTargets)(state, card, self)) {
                        if (target.type === "leader") {
                            legalActions.push(`ATTACK_LEADER:${card.instanceId}`);
                        }
                        else {
                            legalActions.push(`ATTACK_TARGET:${card.instanceId}:${target.instanceId}`);
                        }
                    }
                }
            }
            const activated = (0, queries_1.getActivatedAbilities)(state, card, self, "field");
            if (activated.length > 0) {
                const def = (0, registry_1.getCardDef)((0, queries_1.resolveCardNo)(state, card));
                const { ability } = activated[0];
                const cost = ability.cost?.pp ?? 0;
                const advance = (0, effect_utils_1.isAdvanceAbility)(def, ability);
                const ppPay = (0, queries_1.computeEvolvePayment)(cost, pp, p.evoPoints, false);
                const epPay = (0, queries_1.computeEvolvePayment)(cost, pp, p.evoPoints, true);
                if (ppPay.ok)
                    legalActions.push(`ACTIVATE:${card.instanceId}`);
                if (advance && epPay.ok && epPay.epCost > 0) {
                    legalActions.push(`ACTIVATE_EP:${card.instanceId}`);
                }
            }
            if (!(0, queries_1.isFieldFollower)(state, card))
                continue;
            // Evolve is allowed even while engaged (e.g. after activating).
            if (!(0, queries_1.isBoxed)(card, state) &&
                !card.linkedEvoInstanceId &&
                (0, queries_1.canEvolveFollower)(state, self, card.instanceId)) {
                const evoMatch = (0, queries_1.findMatchingEvolveCard)(state, self, card.instanceId);
                if (evoMatch) {
                    const cost = (0, queries_1.getEvolveCost)(evoMatch.cardNo, card.cardNo);
                    const canSuper = (0, queries_1.canSuperEvolveNow)(state, self);
                    const ppPay = (0, queries_1.computeEvolvePayment)(cost, pp, p.evoPoints, false);
                    const epPay = (0, queries_1.computeEvolvePayment)(cost, pp, p.evoPoints, true);
                    if (ppPay.ok) {
                        legalActions.push(`EVOLVE:${card.instanceId}`);
                        if (canSuper)
                            legalActions.push(`SUPER_EVOLVE:${card.instanceId}`);
                    }
                    if (epPay.ok && epPay.epCost > 0) {
                        legalActions.push(`EVOLVE_EP:${card.instanceId}`);
                        if (canSuper)
                            legalActions.push(`SUPER_EVOLVE_EP:${card.instanceId}`);
                    }
                }
            }
        }
        for (const card of p.zones.cemetery) {
            if ((0, queries_1.getActivatedAbilities)(state, card, self, "cemetery").length > 0) {
                legalActions.push(`ACTIVATE_CEMETERY:${card.instanceId}`);
            }
        }
        for (const card of p.zones.exArea) {
            if ((0, queries_1.getActivatedAbilities)(state, card, self, "exArea").length > 0) {
                legalActions.push(`ACTIVATE_EXAREA:${card.instanceId}`);
            }
        }
    }
    if (state.quickWindow &&
        state.quickWindowPlayer === self &&
        !state.pendingChoices &&
        state.pendingTriggers.length === 0) {
        const pp = state.players[self].pp;
        const quickZones = [
            ...state.players[self].zones.hand.map((card) => ({ card, fromZone: "hand" })),
            ...state.players[self].zones.exArea.map((card) => ({ card, fromZone: "exArea" })),
        ];
        for (const { card, fromZone } of quickZones) {
            const def = (0, registry_1.getCardDef)(card.cardNo);
            if (!def?.abilities?.some((a) => a.quick))
                continue;
            const cost = (0, queries_1.getEffectivePlayCost)(card, card.cardNo, state, self, fromZone);
            if (pp >= cost && (0, resolver_1.canPlayCardFromZones)(state, self, card.cardNo)) {
                legalActions.push(`QUICK_PLAY:${card.instanceId}`);
            }
        }
        legalActions.push("PASS_QUICK_WINDOW");
    }
    if (state.pendingChoices?.player === self) {
        legalActions.push("CHOICE_REQUIRED");
    }
    const exPlayCosts = {};
    for (const card of state.players[self].zones.exArea) {
        exPlayCosts[card.instanceId] = (0, queries_1.getEffectivePlayCost)(card, card.cardNo, state, self, "exArea");
    }
    const opponentExPlayCosts = {};
    for (const card of state.players[opponent].zones.exArea) {
        opponentExPlayCosts[card.instanceId] = (0, queries_1.getEffectivePlayCost)(card, card.cardNo, state, opponent, "exArea");
    }
    return {
        self,
        state: view,
        opponentHandCount: state.players[opponent].zones.hand.length,
        opponentDeckCount: state.players[opponent].zones.deck.length,
        opponentEvoDeckCount: state.players[opponent].zones.evolveDeck.length,
        legalActions,
        exPlayCosts,
        opponentExPlayCosts,
    };
}
function tryAction(state, player, action) {
    return (0, applyAction_1.applyAction)(state, player, action);
}
