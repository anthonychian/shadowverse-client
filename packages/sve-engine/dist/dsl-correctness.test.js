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
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const vitest_1 = require("vitest");
const ROOT = path.join(__dirname, "..", "..", "..");
const DECK_CARD_NOS = [
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
function runFullAudit() {
    const out = (0, child_process_1.execSync)(`node -e "console.log(JSON.stringify(require('./src/scripts/dsl-audit-utils').runFullAudit()))"`, { cwd: ROOT, encoding: "utf8" });
    return JSON.parse(out.trim());
}
(0, vitest_1.describe)("DSL correctness", () => {
    (0, vitest_1.it)("canonical non-Vanguard identities have no missing_abilities or timing_mismatch", () => {
        const audit = runFullAudit();
        const hardClasses = new Set(["missing_abilities", "timing_mismatch"]);
        const failures = audit.failingIdentities.filter((r) => r.failures.some((f) => hardClasses.has(f.class)));
        (0, vitest_1.expect)(failures, `missing/timing failures (${failures.length}): ${failures
            .slice(0, 15)
            .map((r) => `${r.canonNo}[${r.failures.map((f) => f.class).join(",")}]`)
            .join("; ")}`).toEqual([]);
    });
    (0, vitest_1.it)("deck regression cards pass static DSL audit", () => {
        const audit = runFullAudit();
        const byCanon = new Map(audit.results.map((r) => [r.canonNo, r]));
        const hardClasses = new Set(["missing_abilities", "timing_mismatch", "unimplemented_op"]);
        const deckFailures = [];
        for (const cardNo of DECK_CARD_NOS) {
            const r = byCanon.get(cardNo);
            const hard = (r?.failures || []).filter((f) => hardClasses.has(f.class));
            if (hard.length) {
                deckFailures.push(`${cardNo}: ${hard.map((f) => f.class).join(", ")}`);
            }
        }
        (0, vitest_1.expect)(deckFailures, deckFailures.join("; ")).toEqual([]);
    });
    (0, vitest_1.it)("audit summary tracks noop_inner separately (warn threshold)", () => {
        const audit = runFullAudit();
        const noopCount = audit.byClass?.noop_inner ?? 0;
        (0, vitest_1.expect)(audit.total).toBeGreaterThan(0);
        if (noopCount > 500) {
            console.warn(`noop_inner count high: ${noopCount} — continue fix loop`);
        }
    });
});
