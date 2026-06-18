import { GameState, PendingTrigger, PlayerId } from "../types";
export { queueLastWords, queueFanfare, queueOnLeaveField } from "./trigger-queue";
/** Fanfare and field-entry setup when a follower/amulet enters the field. */
export declare function onFollowerEntersField(state: GameState, instanceId: string, player: PlayerId): void;
export declare function onCardEntersExArea(state: GameState, instanceId: string, player: PlayerId): void;
/** Resolve a trigger chosen via selectTrigger (shared with applyAction). */
export declare function resolveChosenTrigger(state: GameState, trigger: PendingTrigger): GameState;
export declare function runConfirmationTiming(state: GameState): GameState;
