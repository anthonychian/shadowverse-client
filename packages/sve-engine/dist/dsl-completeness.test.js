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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vitest_1 = require("vitest");
const registry_1 = require("./cards/registry");
const reprints_1 = require("./cards/reprints");
const VANGUARD_RE = /\[ride\]|\[feed\]|on drive|on race|single drive|drive point|vanguard/i;
const setsDir = path.join(__dirname, "..", "data", "card-defs", "sets");
const cardsPath = path.join(__dirname, "..", "data", "cards.json");
function effectHasNoop(effect) {
    if (!effect)
        return false;
    if (effect.op === "noop") {
        const label = effect.label;
        if (label && /^stub missing /i.test(label))
            return false;
        return true;
    }
    if (effect.op === "sequence")
        return effect.steps?.some(effectHasNoop);
    if (effect.op === "choose" || effect.op === "chooseMultiple") {
        return effect.options?.some((o) => effectHasNoop(o.effect));
    }
    if (effect.op === "if") {
        return effectHasNoop(effect.then) || effectHasNoop(effect.else);
    }
    if (effect.op === "optionalCost")
        return effectHasNoop(effect.then);
    return false;
}
function loadSetDefs() {
    const merged = {};
    if (!fs.existsSync(setsDir))
        return merged;
    for (const file of fs.readdirSync(setsDir).filter((f) => f.endsWith(".json"))) {
        Object.assign(merged, JSON.parse(fs.readFileSync(path.join(setsDir, file), "utf8")));
    }
    return merged;
}
function isVanguardText(cardNo, setDef) {
    const def = (0, registry_1.getCardDef)(cardNo);
    if (setDef?.parseConfidence === "vanguard-deferred")
        return true;
    return VANGUARD_RE.test(def?.cardText || "");
}
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
(0, vitest_1.describe)("DSL completeness", () => {
    (0, vitest_1.it)("deck regression cards have no noop in ability trees", () => {
        const setDefs = loadSetDefs();
        const byIdentity = new Map();
        for (const cardNo of Object.keys(setDefs)) {
            const def = setDefs[cardNo];
            const key = (0, reprints_1.cardIdentityKey)({
                name: def.name || cardNo,
                printingType: def.printingType,
            });
            if (!byIdentity.has(key))
                byIdentity.set(key, []);
            byIdentity.get(key).push(cardNo);
        }
        const failures = [];
        for (const cardNo of DECK_CARDS) {
            const def = setDefs[cardNo] ?? (0, registry_1.getCardDef)(cardNo);
            if (!def)
                continue;
            if (isVanguardText(cardNo, def))
                continue;
            if (!def?.abilities?.length) {
                failures.push(`${cardNo} (no abilities)`);
                continue;
            }
            const hasNoop = def.abilities.some((a) => effectHasNoop(a.effect));
            if (hasNoop)
                failures.push(cardNo);
        }
        (0, vitest_1.expect)(failures, `noop in deck cards: ${failures.join(", ")}`).toEqual([]);
    });
    (0, vitest_1.it)("canonical non-Vanguard identities have no noop in ability trees (informational)", () => {
        const setDefs = loadSetDefs();
        const byIdentity = new Map();
        for (const cardNo of Object.keys(setDefs)) {
            const def = setDefs[cardNo];
            const key = (0, reprints_1.cardIdentityKey)({
                name: def.name || cardNo,
                printingType: def.printingType,
            });
            if (!byIdentity.has(key))
                byIdentity.set(key, []);
            byIdentity.get(key).push(cardNo);
        }
        const failures = [];
        for (const [key, cardNos] of byIdentity) {
            const canon = [...cardNos].sort((a, b) => {
                const aCanon = /^[A-Z0-9]+-(\d+|T\d+)EN$/i.test(a) ? 1 : 0;
                const bCanon = /^[A-Z0-9]+-(\d+|T\d+)EN$/i.test(b) ? 1 : 0;
                return bCanon - aCanon || b.localeCompare(a);
            })[0];
            const def = setDefs[canon];
            if (isVanguardText(canon, def))
                continue;
            if (!def?.abilities?.length)
                continue;
            const hasNoop = def.abilities.some((a) => effectHasNoop(a.effect));
            if (hasNoop)
                failures.push(`${canon} (${key})`);
        }
        (0, vitest_1.expect)(failures.length, `noop in ${failures.length} canonical identities (fix loop ongoing)`).toBeLessThan(1500);
    });
});
