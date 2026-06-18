import { GameState } from "../types";
import { ScenarioDefinition, ScenarioResult, ScenarioSetup } from "./scenario-types";
export declare function buildStateFromSetup(setup: ScenarioSetup): GameState;
export declare function runScenario(scenario: ScenarioDefinition): ScenarioResult;
