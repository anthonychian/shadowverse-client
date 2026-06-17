"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const registry_1 = require("./registry");
(0, vitest_1.describe)("registry reprint resolution", () => {
    (0, vitest_1.it)("SDD05 promo reprint inherits Dead to Rights gameplay", () => {
        const def = (0, registry_1.getCardDef)("SDD05-012EN");
        (0, vitest_1.expect)(def).toBeDefined();
        (0, vitest_1.expect)(def?.cardText).toContain("quick");
        (0, vitest_1.expect)(def?.abilities?.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)("keeps promo card number on the resolved definition", () => {
        const def = (0, registry_1.getCardDef)("SDD05-012EN");
        (0, vitest_1.expect)(def?.cardNo).toBe("SDD05-012EN");
    });
});
