import { GameState } from "../types";
export declare function snapshotState(state: GameState): Record<string, string[]>;
export declare function formatStateDiff(before: GameState, after: GameState): string;
