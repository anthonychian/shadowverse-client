import { CardDefinition } from "../types";
export declare function normalizeIdentityName(name: string): string;
/** Base, evolved, and token printings of the same name are distinct identities. */
export declare function cardIdentityKey(card: {
    name: string;
    type?: string;
    printingType?: string;
    specialType?: string;
}): string;
export declare function isCanonicalSlot(cardNo: string): boolean;
/** cardNo -> richest gameplay source cardNo (may be itself). */
export declare function buildReprintMap(cards: Record<string, CardDefinition>): Map<string, string>;
export declare function mergePrintingWithGameplay(printing: CardDefinition, gameplay: CardDefinition, handOverlay?: Partial<CardDefinition>): CardDefinition;
