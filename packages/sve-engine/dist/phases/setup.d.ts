import { GameState, PlayerId, UniverseId } from "../types";
export interface DeckInput {
    mainDeck: string[];
    evolveDeck: string[];
    leaderCardNo?: string;
    universe?: UniverseId | null;
}
export declare function loadDecks(state: GameState, decks: [DeckInput, DeckInput]): GameState;
export declare function applyMulligan(state: GameState, player: PlayerId, redraw: boolean): GameState;
export declare function beginStartPhase(state: GameState): GameState;
