import { GameState, PlayerId } from "../types";
import { ScenarioAction } from "./scenario-types";
export type ChoiceHints = {
    /** Prefer resolving this trigger timing when multiple triggers are queued. */
    triggerTiming?: string;
    /** cardNo to pick from zone/hand/field choices. */
    selectCardNo?: string;
    /** Target cardNo or leader for selectTarget prompts. */
    targetCardNo?: string | "leader";
    /** choose option index */
    optionIndex?: number;
    /** instanceIds for engage cost */
    engageCardNos?: string[];
};
export declare function resolveChoicesWithHints(state: GameState, player: PlayerId, hints?: ChoiceHints, maxSteps?: number): GameState;
export declare function hintsFromAction(action: ScenarioAction): ChoiceHints;
