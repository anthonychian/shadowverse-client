import { ActionResult, GameAction, GameState, PlayerId } from "../types";
export declare function applyAction(state: GameState, player: PlayerId, action: GameAction): ActionResult;
export declare function advanceCombatIfNeeded(state: GameState): GameState;
