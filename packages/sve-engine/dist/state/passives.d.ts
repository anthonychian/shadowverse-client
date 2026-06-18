import { AbilityDefinition, CardInstance, GameState, Keyword, PlayerId } from "../types";
export declare function isBoxed(card: CardInstance, state: GameState): boolean;
export declare function getPassiveKeywords(state: GameState, card: CardInstance, player: PlayerId): Keyword[];
export declare function getAuraKeywords(state: GameState, card: CardInstance, player: PlayerId): Keyword[];
export declare function getMaxDamagePerHit(state: GameState, card: CardInstance, player: PlayerId): number | null;
export declare function hasNamedFollowerOnFieldByIdentity(state: GameState, player: PlayerId, identityName: string): boolean;
export declare function opponentsAbilitiesSilencedFor(state: GameState, player: PlayerId): boolean;
export declare function matchesExAreaEntryFilter(ability: AbilityDefinition, enteredCardNo: string): boolean;
