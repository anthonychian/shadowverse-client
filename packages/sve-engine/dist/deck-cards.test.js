"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const applyAction_1 = require("./actions/applyAction");
const registry_1 = require("./cards/registry");
const factory_1 = require("./state/factory");
const queries_1 = require("./state/queries");
const filterView_1 = require("./view/filterView");
const DECK_CARDS = [
    "BP14-018EN",
    "BP14-025EN",
    "PR-173EN",
    "BP07-075EN",
    "BP12-SL22EN",
    "BP17-113EN",
    "BP12-082EN",
    "BP17-079EN",
    "BP07-SL13EN",
    "BP07-U05EN",
    "BP14-118EN",
    "BP11-018EN",
    "BP14-023EN",
    "BP14-019EN",
    "BP14-027EN",
    "BP14-026EN",
    "BP07-047EN",
    "BP07-103EN",
    "BP12-048EN",
    "BP12-049EN",
    "BP17-049EN",
    "BP17-033EN",
    "BP17-041EN",
    "BP07-035EN",
    "BP07-037EN",
    "BP12-035EN",
    "BP17-040EN",
    "BP17-048EN",
    "BP07-041EN",
    "BP17-044EN",
    "BP12-041EN",
    "BP17-119EN",
    "BP17-050EN",
    "BP17-042EN",
    "BP07-036EN",
    "BP12-036EN",
    "BP07-069EN",
    "BP07-070EN",
    "BP12-T03EN",
    "BP12-T04EN",
];
const ROOT = path.join(__dirname, "..", "..", "..");
function runFullAudit() {
    const out = (0, child_process_1.execSync)(`node -e "console.log(JSON.stringify(require('./src/scripts/dsl-audit-utils').runFullAudit()))"`, { cwd: ROOT, encoding: "utf8" });
    return JSON.parse(out.trim());
}
(0, vitest_1.describe)("deck card DSL", () => {
    (0, vitest_1.beforeEach)(() => (0, factory_1.resetIdCounter)());
    for (const cardNo of DECK_CARDS) {
        (0, vitest_1.it)(`${cardNo} has abilities`, () => {
            const def = (0, registry_1.getCardDef)(cardNo);
            (0, vitest_1.expect)(def).toBeDefined();
            (0, vitest_1.expect)(def?.abilities?.length).toBeGreaterThan(0);
        });
    }
    (0, vitest_1.it)("Taketsumi fanfare is draw-discard-gold sequence", () => {
        const def = (0, registry_1.getCardDef)("BP14-018EN");
        const ff = def.abilities.find((a) => a.timing === "fanfare");
        (0, vitest_1.expect)(ff.effect.op).toBe("sequence");
        if (ff.effect.op === "sequence") {
            (0, vitest_1.expect)(ff.effect.steps).toHaveLength(3);
        }
    });
    (0, vitest_1.it)("Aenea Rebel fanfare tutors Machina", () => {
        const def = (0, registry_1.getCardDef)("PR-173EN");
        const ff = def.abilities.find((a) => a.timing === "fanfare");
        (0, vitest_1.expect)(ff.effect).toMatchObject({
            op: "tutorFromDeck",
            filter: { trait: "Machina", maxCost: 3 },
            to: "field",
        });
    });
    (0, vitest_1.it)("Mono, Garnet Rebel abilities apply to all printings", () => {
        const sl = (0, registry_1.getCardDef)("BP07-SL13EN");
        const regular = (0, registry_1.getCardDef)("BP07-069EN");
        (0, vitest_1.expect)(sl.abilities?.some((a) => a.timing === "activated")).toBe(true);
        (0, vitest_1.expect)(regular.abilities?.some((a) => a.timing === "activated")).toBe(true);
        (0, vitest_1.expect)(regular.evolvesTo).toBe("BP07-070EN");
        const slEvo = (0, registry_1.getCardDef)("BP07-U05EN");
        const regularEvo = (0, registry_1.getCardDef)("BP07-070EN");
        (0, vitest_1.expect)(slEvo.abilities?.some((a) => a.timing === "activated")).toBe(true);
        (0, vitest_1.expect)(regularEvo.abilities?.some((a) => a.timing === "activated")).toBe(true);
    });
    (0, vitest_1.it)("Mono, Garnet Rebel can evolve with 5 Machina followers on field", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.turnNumber = 2;
        state.pendingChoices = null;
        state.players[0].pp = 10;
        state.players[0].evoPoints = 3;
        const mono = (0, factory_1.createCardInstance)("BP07-069EN", 0);
        mono.onFieldSinceTurnStart = true;
        for (let i = 0; i < 4; i++) {
            const ally = (0, factory_1.createCardInstance)("BP17-077EN", 0);
            ally.onFieldSinceTurnStart = true;
            state.players[0].zones.field.push(ally);
        }
        state.players[0].zones.field.push(mono);
        state.players[0].zones.evolveDeck.push((0, factory_1.createCardInstance)("BP07-070EN", 0));
        (0, vitest_1.expect)((0, queries_1.canEvolveFollower)(state, 0, mono.instanceId)).toBe(true);
        const view = (0, filterView_1.createPlayerView)(state, 0);
        (0, vitest_1.expect)(view.legalActions.some((a) => a.startsWith("EVOLVE:"))).toBe(true);
    });
    function playHeroOfTheHunt(state) {
        const hero = state.players[0].zones.hand.find((c) => c.cardNo === "BP14-025EN");
        const enemy = state.players[1].zones.field[0];
        const taketsumi = state.players[0].zones.deck.find((c) => c.cardNo === "BP14-018EN");
        let current = (0, applyAction_1.applyAction)(state, 0, {
            type: "PLAY_CARD",
            handInstanceId: hero.instanceId,
        }).state;
        for (let step = 0; step < 10 && current.pendingChoices; step++) {
            if (current.pendingChoices.type === "selectTarget") {
                current = (0, applyAction_1.applyAction)(current, 0, {
                    type: "CHOICE_RESPONSE",
                    payload: { targetId: enemy.instanceId },
                }).state;
            }
            else if (current.pendingChoices.type === "selectZoneCard" && taketsumi) {
                current = (0, applyAction_1.applyAction)(current, 0, {
                    type: "CHOICE_RESPONSE",
                    payload: { instanceId: taketsumi.instanceId },
                }).state;
            }
            else {
                break;
            }
        }
        return current;
    }
    (0, vitest_1.it)("Hero of the Hunt does not tutor Taketsumi with only 4 Festive cards before it enters cemetery", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        for (const cardNo of ["BP14-030EN", "BP14-034EN", "BP14-026EN", "BP14-118EN"]) {
            state.players[0].zones.cemetery.push((0, factory_1.createCardInstance)(cardNo, 0));
        }
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("BP14-018EN", 0));
        state.players[1].zones.field.push((0, factory_1.createCardInstance)("MVP-002", 1));
        state.players[0].zones.hand.push((0, factory_1.createCardInstance)("BP14-025EN", 0));
        const after = playHeroOfTheHunt(state);
        (0, vitest_1.expect)(after.players[0].zones.field.some((c) => c.cardNo === "BP14-018EN")).toBe(false);
        (0, vitest_1.expect)(after.players[0].zones.cemetery.filter((c) => (0, registry_1.getCardDef)(c.cardNo)?.traits?.includes("Festive"))
            .length).toBe(5);
    });
    (0, vitest_1.it)("Hero of the Hunt tutors Taketsumi with 5 Festive cards already in cemetery", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].pp = 5;
        for (const cardNo of [
            "BP14-030EN",
            "BP14-034EN",
            "BP14-115EN",
            "BP14-118EN",
            "BP14-026EN",
        ]) {
            state.players[0].zones.cemetery.push((0, factory_1.createCardInstance)(cardNo, 0));
        }
        state.players[0].zones.deck.push((0, factory_1.createCardInstance)("BP14-018EN", 0));
        state.players[1].zones.field.push((0, factory_1.createCardInstance)("MVP-002", 1));
        state.players[0].zones.hand.push((0, factory_1.createCardInstance)("BP14-025EN", 0));
        const after = playHeroOfTheHunt(state);
        (0, vitest_1.expect)(after.players[0].zones.field.some((c) => c.cardNo === "BP14-018EN")).toBe(true);
    });
    (0, vitest_1.it)("Spartacus offers variable discard at start of end phase", () => {
        let state = (0, factory_1.createInitialGameState)(0);
        state.phase = "main";
        state.activePlayer = 0;
        state.pendingChoices = null;
        state.players[0].flags.mulliganDone = true;
        state.players[1].flags.mulliganDone = true;
        const spartacus = (0, factory_1.createCardInstance)("BP09-020EN", 0);
        spartacus.engaged = true;
        state.players[0].zones.field.push(spartacus);
        const handA = (0, factory_1.createCardInstance)("MVP-012", 0);
        const handB = (0, factory_1.createCardInstance)("MVP-013", 0);
        state.players[0].zones.hand.push(handA, handB);
        for (let i = 0; i < 5; i++) {
            state.players[0].zones.deck.push((0, factory_1.createCardInstance)("MVP-014", 0));
        }
        let ended = (0, applyAction_1.applyAction)(state, 0, { type: "END_MAIN" });
        (0, vitest_1.expect)(ended.ok).toBe(true);
        (0, vitest_1.expect)(ended.state.pendingChoices?.type).toBe("discardVariable");
        const deckBefore = ended.state.players[0].zones.deck.length;
        const confirmed = (0, applyAction_1.applyAction)(ended.state, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceIds: [handA.instanceId] },
        });
        (0, vitest_1.expect)(confirmed.ok).toBe(true);
        (0, vitest_1.expect)(confirmed.state.players[0].zones.hand.some((c) => c.instanceId === handA.instanceId)).toBe(false);
        (0, vitest_1.expect)(confirmed.state.players[0].zones.cemetery.some((c) => c.instanceId === handA.instanceId)).toBe(true);
        (0, vitest_1.expect)(confirmed.state.players[0].zones.hand.length).toBe(3);
        (0, vitest_1.expect)(confirmed.state.players[0].zones.deck.length).toBe(deckBefore - 2);
    });
    (0, vitest_1.it)("deck cards pass static DSL correctness audit (structure)", () => {
        const audit = runFullAudit();
        const byCanon = new Map(audit.results.map((r) => [r.canonNo, r]));
        const hardClasses = new Set(["missing_abilities", "timing_mismatch", "unimplemented_op"]);
        const failures = [];
        for (const cardNo of DECK_CARDS) {
            const r = byCanon.get(cardNo);
            const hard = (r?.failures || []).filter((f) => hardClasses.has(f.class));
            if (hard.length)
                failures.push(`${cardNo}: ${hard.map((f) => f.class).join(",")}`);
        }
        (0, vitest_1.expect)(failures).toEqual([]);
    });
});
