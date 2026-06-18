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
const path = __importStar(require("path"));
const queries_1 = require("../state/queries");
const scenario_loader_1 = require("./scenario-loader");
const scenario_runner_1 = require("./scenario-runner");
const scenariosDir = path.join(__dirname, "..", "..", "scenarios");
(0, vitest_1.describe)("scenario harness", () => {
    (0, vitest_1.it)("runs Chris necrocharge scenario from YAML", () => {
        const scenario = (0, scenario_loader_1.loadScenarioFile)(path.join(scenariosDir, "cards", "BP13-077EN-chris-necrocharge.yaml"));
        const result = (0, scenario_runner_1.runScenario)(scenario);
        (0, vitest_1.expect)(result.success).toBe(true);
        (0, vitest_1.expect)(result.unresolvedChoice).toBeNull();
        for (const ar of result.assertionResults) {
            (0, vitest_1.expect)(ar.pass, ar.message).toBe(true);
        }
    });
    (0, vitest_1.it)("runs Magitrain maneuver scenario from YAML", () => {
        const scenario = (0, scenario_loader_1.loadScenarioFile)(path.join(scenariosDir, "cards", "BP11-T02EN-magitrain-maneuver.yaml"));
        const result = (0, scenario_runner_1.runScenario)(scenario);
        (0, vitest_1.expect)(result.trace.every((t) => t.ok)).toBe(true);
        const train = result.finalState.players[0].zones.field.find((c) => c.cardNo === "BP11-T02EN");
        (0, vitest_1.expect)((0, queries_1.isFieldFollower)(result.finalState, train)).toBe(true);
    });
});
