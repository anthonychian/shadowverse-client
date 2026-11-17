import { CardInstance } from "../types";
export declare function isTokenCard(cardNo: string): boolean;
export declare function isAdvancedCard(card: CardInstance): boolean;
export declare function destinationForDestroyedCard(card: CardInstance): "banish" | "cemetery" | "evolveDeck";
