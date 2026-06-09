import { GameState, PlayerId } from "../types";
export declare function queueLastWords(state: GameState, instanceId: string, player: PlayerId): void;
export declare function queueFanfare(state: GameState, instanceId: string, player: PlayerId): void;
export declare function queueStartOfEndAbilities(state: GameState, player: PlayerId): void;
export declare function onCardEntersExAreaTriggers(state: GameState, instanceId: string, player: PlayerId): void;
