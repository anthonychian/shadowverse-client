import { CardInstance, GameState, PlayerId } from "../types";
export declare function moveCard(state: GameState, instanceId: string, toZone: keyof GameState["players"][0]["zones"], toPlayer: PlayerId): GameState;
export declare function removeFromField(state: GameState, instanceId: string): {
    state: GameState;
    card: CardInstance;
    player: PlayerId;
} | null;
export declare function returnEvolveCardToDeck(state: GameState, fieldInstanceId: string, spent: boolean): GameState;
export declare function destroyFollower(state: GameState, instanceId: string): GameState;
export declare function putFieldCardOnDeckBottom(state: GameState, instanceId: string, player: PlayerId): GameState;
export declare function putFieldCardOnDeckTop(state: GameState, instanceId: string, player: PlayerId): GameState;
export declare function drawCard(state: GameState, player: PlayerId): GameState;
export declare function shuffleDeck(state: GameState, player: PlayerId): GameState;
