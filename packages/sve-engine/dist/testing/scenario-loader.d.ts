import { ScenarioDefinition } from "./scenario-types";
export declare function loadScenarioFile(filePath: string): ScenarioDefinition;
export declare function findScenariosForCard(scenariosDir: string, cardNo: string): string[];
export declare function listAllScenarioFiles(scenariosDir: string): string[];
