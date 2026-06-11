import { UniverseId } from "../types";
export type CraftClass = "forest" | "sword" | "rune" | "dragon" | "abyss" | "haven" | "neutral";
export type { UniverseId };
export interface DeckIdentity {
    craft: CraftClass | null;
    universe: UniverseId | null;
    leader: string;
}
export declare const CRAFT_LEADERS: Record<Exclude<CraftClass, "neutral">, string>;
export declare function getCardUniverseFromCardNo(cardNo: string): UniverseId | null;
export declare function detectDeckIdentity(cardNos: string[]): DeckIdentity;
export declare const COOL_EARRINGS_CARD_NO = "CP02-T04EN";
