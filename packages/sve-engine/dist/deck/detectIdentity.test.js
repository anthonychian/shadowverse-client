"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const detectIdentity_1 = require("./detectIdentity");
const index_1 = require("../index");
(0, vitest_1.describe)("detectDeckIdentity", () => {
    (0, vitest_1.it)("maps single-craft rune deck to Kuon", () => {
        const id = (0, detectIdentity_1.detectDeckIdentity)(["BP17-041EN", "BP07-041EN"]);
        (0, vitest_1.expect)(id.craft).toBe("rune");
        (0, vitest_1.expect)(id.leader).toBe("Kuon");
    });
    (0, vitest_1.it)("maps single-craft sword deck to Albert", () => {
        const id = (0, detectIdentity_1.detectDeckIdentity)(["BP14-018EN", "BP14-022EN"]);
        (0, vitest_1.expect)(id.craft).toBe("sword");
        (0, vitest_1.expect)(id.leader).toBe("Albert");
    });
    (0, vitest_1.it)("detects idolmaster universe from card numbers", () => {
        (0, vitest_1.expect)((0, detectIdentity_1.getCardUniverseFromCardNo)("ECP02-012EN")).toBe("idolmaster");
        const id = (0, detectIdentity_1.detectDeckIdentity)(["ECP02-012EN", "ECP02-003EN"]);
        (0, vitest_1.expect)(id.universe).toBe("idolmaster");
        (0, vitest_1.expect)(id.leader).toBe("Rin");
    });
});
(0, vitest_1.describe)("idolmaster deck setup", () => {
    (0, vitest_1.it)("starts with 5 Cool Earrings in EX area", () => {
        let state = (0, index_1.createInitialGameState)(0);
        state = (0, index_1.loadDecks)(state, [
            {
                mainDeck: Array(50).fill("BP17-041EN"),
                evolveDeck: Array(10).fill("BP17-042EN"),
                universe: "idolmaster",
            },
            {
                mainDeck: Array(50).fill("BP14-018EN"),
                evolveDeck: Array(10).fill("BP14-023EN"),
            },
        ]);
        (0, vitest_1.expect)(state.players[0].zones.exArea).toHaveLength(5);
        (0, vitest_1.expect)(state.players[0].zones.exArea.every((c) => c.cardNo === "CP02-T04EN")).toBe(true);
        (0, vitest_1.expect)(state.players[1].zones.exArea).toHaveLength(0);
    });
});
