import { GameState, PlayerId } from "../types";
export interface RevealedCard {
    owner: PlayerId;
    instanceId: string;
    cardNo: string;
}
/** Deck searches to hand reveal by default; cemetery returns do not. */
export declare function shouldRevealBeforeHand(to: "hand" | "exArea" | "field", fromZone: string, explicit?: boolean): boolean;
export declare function revealCard(state: GameState, owner: PlayerId, instanceId: string, cardNo: string): GameState;
export declare function clearRevealedCards(state: GameState): GameState;
