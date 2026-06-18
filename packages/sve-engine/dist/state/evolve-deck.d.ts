import type { CardInstance, DeckFilter, GameState, PlayerId } from "../types";
export declare function isEvolveDeckFaceup(card: CardInstance): boolean;
export declare function isEvolveDeckFacedown(card: CardInstance): boolean;
export declare function filterEvolveDeckCards(state: GameState, player: PlayerId, opts?: {
    filter?: DeckFilter;
    face?: "faceup" | "facedown";
}): CardInstance[];
export declare function countEvolveDeckFaceup(state: GameState, player: PlayerId, filter?: DeckFilter): number;
export declare function setEvolveDeckOrientation(state: GameState, instanceIds: string[], orientation: "faceup" | "facedown"): GameState;
