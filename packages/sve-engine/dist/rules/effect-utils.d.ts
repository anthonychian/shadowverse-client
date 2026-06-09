import { AbilityDefinition, CardDefinition, ChoicePrompt, Effect, GameState, PlayerId, ResolutionContext } from "../types";
export declare function effectContainsOp(effect: Effect, op: Effect["op"]): boolean;
export declare function isAdvanceAbility(def: CardDefinition | undefined, ability: AbilityDefinition): boolean;
/** Advance activated effects gate on nested if/else deck or cemetery conditions. */
export declare function canAdvanceActivate(state: GameState, player: PlayerId, effect: Effect): boolean;
export declare function shouldClearResolutionContext(state: GameState): boolean;
export declare function contextForTriggerResolution(state: GameState, sourceInstanceId: string, effect: Effect): ResolutionContext;
export declare function getChoiceContext(state: GameState): {
    sourceCardNo?: string;
    sourceLabel?: string;
};
export declare function withChoiceContext<T extends ChoicePrompt>(state: GameState, choice: T): T;
