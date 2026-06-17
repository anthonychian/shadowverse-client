import { CardDefinition } from "../types";
/** Gameplay fields shared across all printings of the same card identity. */
export declare function pickSharedHandOverlay(overlay: Partial<CardDefinition>): Partial<CardDefinition>;
export declare function mergeSharedHandOverlays(...overlays: (Partial<CardDefinition> | undefined)[]): Partial<CardDefinition>;
export declare function normalizeIdentityName(name: string): string;
/** Base, evolved, and token printings of the same name are distinct identities. */
export declare function cardIdentityKey(card: {
    name: string;
    type?: string;
    printingType?: string;
    specialType?: string;
}): string;
export declare function isCanonicalSlot(cardNo: string): boolean;
/** Pick the richest card from a group (e.g. alternate printings of one identity). */
export declare function pickCanonicalInGroup(cards: CardDefinition[]): CardDefinition;
/** cardNo -> richest gameplay source cardNo (may be itself). */
export declare function buildReprintMap(cards: Record<string, CardDefinition>): Map<string, string>;
export declare function mergePrintingWithGameplay(printing: CardDefinition, gameplay: CardDefinition, handOverlay?: Partial<CardDefinition>): CardDefinition;
