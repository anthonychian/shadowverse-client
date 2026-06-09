import { CardInstance, GameState, PlayerId, PlayerState } from "../types";
export declare function nextId(prefix?: string): string;
export declare function resetIdCounter(): void;
export declare function createCardInstance(cardNo: string, owner: PlayerId, controller?: PlayerId): CardInstance;
export declare function emptyPlayer(player: PlayerId): PlayerState;
export declare function createInitialGameState(firstPlayer?: PlayerId): GameState;
