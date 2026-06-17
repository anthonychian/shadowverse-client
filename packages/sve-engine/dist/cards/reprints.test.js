"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const reprints_1 = require("./reprints");
(0, vitest_1.describe)("reprints", () => {
    (0, vitest_1.it)("groups alternate printings by identity name", () => {
        (0, vitest_1.expect)((0, reprints_1.normalizeIdentityName)("Dead to Rights")).toBe("Dead to Rights");
        (0, vitest_1.expect)((0, reprints_1.normalizeIdentityName)("Nicola, Forbidden Strength Evolved")).toBe("Nicola, Forbidden Strength");
    });
    (0, vitest_1.it)("maps promo printing to canonical gameplay source", () => {
        const cards = {
            "BP11-075EN": {
                cardNo: "BP11-075EN",
                name: "Dead to Rights",
                class: "abyss",
                cardType: "spell",
                cost: 1,
                traits: [],
                keywords: ["quick"],
                cardText: "Quick. Deal damage.",
            },
            "SDD05-012EN": {
                cardNo: "SDD05-012EN",
                name: "Dead to Rights",
                class: "abyss",
                cardType: "spell",
                cost: 0,
                traits: [],
                keywords: [],
                cardText: "",
            },
        };
        const map = (0, reprints_1.buildReprintMap)(cards);
        (0, vitest_1.expect)(map.get("SDD05-012EN")).toBe("BP11-075EN");
    });
    (0, vitest_1.it)("inherits gameplay fields onto thin promo stubs", () => {
        const printing = {
            cardNo: "SDD05-012EN",
            name: "Dead to Rights",
            class: "abyss",
            cardType: "spell",
            cost: 0,
            traits: [],
            keywords: [],
            cardText: "",
        };
        const gameplay = {
            cardNo: "BP11-075EN",
            name: "Dead to Rights",
            class: "abyss",
            cardType: "spell",
            cost: 1,
            traits: ["Demon"],
            keywords: ["quick"],
            cardText: "Quick. Deal damage.",
            abilities: [{ timing: "spell", effect: { op: "draw", count: 1 } }],
        };
        const merged = (0, reprints_1.mergePrintingWithGameplay)(printing, gameplay, {
            abilities: [{ timing: "spell", effect: { op: "draw", count: 1 } }],
        });
        (0, vitest_1.expect)(merged.cardNo).toBe("SDD05-012EN");
        (0, vitest_1.expect)(merged.cost).toBe(1);
        (0, vitest_1.expect)(merged.cardText).toContain("Quick");
        (0, vitest_1.expect)(merged.abilities?.length).toBe(1);
    });
    (0, vitest_1.it)("shares hand-authored abilities across printings of the same identity", () => {
        const cards = {
            "BP07-SL13EN": {
                cardNo: "BP07-SL13EN",
                name: "Mono, Garnet Rebel",
                class: "abyss",
                cardType: "follower",
                printingType: "base",
                cost: 2,
                attack: 3,
                defense: 2,
                traits: ["Machina"],
                keywords: ["evolve"],
                cardText: "Promo text.",
            },
            "BP07-069EN": {
                cardNo: "BP07-069EN",
                name: "Mono, Garnet Rebel",
                class: "abyss",
                cardType: "follower",
                printingType: "base",
                cost: 2,
                attack: 3,
                defense: 2,
                traits: ["Machina"],
                keywords: ["evolve"],
                cardText: "Regular text with more detail about the card effect.",
            },
        };
        const map = (0, reprints_1.buildReprintMap)(cards);
        (0, vitest_1.expect)(map.get("BP07-069EN")).toBeTruthy();
        (0, vitest_1.expect)(map.get("BP07-SL13EN")).toBeTruthy();
    });
});
