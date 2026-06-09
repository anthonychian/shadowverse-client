import { applyAction } from "../actions/applyAction";
import { GameState, PlayerId, PlayerView } from "../types";
export declare function createPlayerView(state: GameState, self: PlayerId): PlayerView;
export declare function tryAction(state: GameState, player: PlayerId, action: Parameters<typeof applyAction>[2]): import("../types").ActionResult;
