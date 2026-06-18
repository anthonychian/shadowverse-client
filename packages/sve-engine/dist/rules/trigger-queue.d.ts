import { GameState, PlayerId } from "../types";
export declare function queueOnCardPlayed(state: GameState, playedInstanceId: string, player: PlayerId): void;
export declare function queueLastWords(state: GameState, instanceId: string, player: PlayerId): void;
export declare function queueFanfare(state: GameState, instanceId: string, player: PlayerId): void;
export declare function queueStartOfMainAbilities(state: GameState, player: PlayerId): void;
export declare function queueStartOfOpponentEndAbilities(state: GameState, endingPlayer: PlayerId): void;
export declare function queueOnBecomeEngaged(state: GameState, instanceId: string, player: PlayerId): void;
export declare function queueOnDiscardTriggers(state: GameState, discardingPlayer: PlayerId, activePlayer: PlayerId): void;
export declare function queueOnEnemyFollowerLeaveField(state: GameState, leftInstanceId: string, leftController: PlayerId, activePlayer: PlayerId): void;
export declare function queueOnTokenLeaveField(state: GameState, leftInstanceId: string, tokenController: PlayerId, tokenCardNo: string): void;
export declare function queueStartOfEndAbilities(state: GameState, player: PlayerId): void;
export declare function queueAllyFollowerEnterTriggers(state: GameState, enteredInstanceId: string, player: PlayerId): void;
/** Cemetery cards that react when an ally follower enters (e.g. Delta Cannon + Tetra). */
export declare function queueCemeteryOnAllyFollowerEnter(state: GameState, enteredInstanceId: string, player: PlayerId): void;
export declare function onCardEntersExAreaTriggers(state: GameState, instanceId: string, player: PlayerId): void;
export declare function queueOnLeaveField(state: GameState, instanceId: string, player: PlayerId): void;
export declare function queueOnDamagedAbilities(state: GameState, instanceId: string, player: PlayerId): void;
export declare function queueOnAbilityDamaged(state: GameState, instanceId: string, player: PlayerId): void;
export declare function queueOnAllyEvolveTriggers(state: GameState, evolvedInstanceId: string, player: PlayerId): void;
