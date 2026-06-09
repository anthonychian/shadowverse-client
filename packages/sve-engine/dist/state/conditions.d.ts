import { Condition, DeckFilter, GameState, PlayerId } from "../types";
export declare function cardMatchesFilter(cardNo: string, filter: DeckFilter): boolean;
export declare function evalCondition(state: GameState, player: PlayerId, condition: Condition): boolean;
