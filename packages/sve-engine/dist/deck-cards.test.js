"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const registry_1 = require("./cards/registry");
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
];
(0, vitest_1.describe)("deck card DSL", () => {
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
});
