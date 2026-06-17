import { CardDefinition } from "../types";

/** Gameplay fields shared across all printings of the same card identity. */
export function pickSharedHandOverlay(overlay: Partial<CardDefinition>): Partial<CardDefinition> {
  const shared: Partial<CardDefinition> = {};
  if (overlay.abilities?.length) shared.abilities = overlay.abilities;
  if (overlay.keywords?.length) shared.keywords = overlay.keywords;
  if (overlay.evolveCost != null) shared.evolveCost = overlay.evolveCost;
  if (overlay.cost != null) shared.cost = overlay.cost;
  if (overlay.attack != null) shared.attack = overlay.attack;
  if (overlay.defense != null) shared.defense = overlay.defense;
  if (overlay.cardType) shared.cardType = overlay.cardType;
  if (overlay.traits?.length) shared.traits = overlay.traits;
  if (overlay.printingType) shared.printingType = overlay.printingType;
  return shared;
}

export function mergeSharedHandOverlays(
  ...overlays: (Partial<CardDefinition> | undefined)[]
): Partial<CardDefinition> {
  let merged: Partial<CardDefinition> = {};
  for (const overlay of overlays) {
    if (!overlay) continue;
    merged = { ...merged, ...pickSharedHandOverlay(overlay) };
  }
  return merged;
}

export function normalizeIdentityName(name: string): string {
  return name
    .replace(/\s+TOKEN$/i, "")
    .replace(/\s+Evolved$/i, "")
    .replace(/\s+ADVANCED$/i, "")
    .trim();
}

/** Base, evolved, and token printings of the same name are distinct identities. */
export function cardIdentityKey(card: {
  name: string;
  type?: string;
  printingType?: string;
  specialType?: string;
}): string {
  const role = card.printingType ?? card.type;
  const isToken =
    role === "token" || card.specialType === "token" || /\s+TOKEN$/i.test(card.name);
  // Explicit base printings must stay base even when scraped data wrongly marks specialType evolved.
  const isEvolved =
    role === "evolved" ||
    (role !== "base" &&
      role !== "token" &&
      (card.specialType === "evolved" || /\s+Evolved$/i.test(card.name)));
  const kind = isToken ? "token" : isEvolved ? "evolved" : "base";
  return `${normalizeIdentityName(card.name)}|${kind}`;
}

export function isCanonicalSlot(cardNo: string): boolean {
  return /^[A-Z0-9]+-(\d+|T\d+)EN$/i.test(cardNo);
}

function cardRichness(card: Partial<CardDefinition>): number {
  let score = 0;
  if (card.cardText) score += card.cardText.length;
  if (card.cost != null && card.cost > 0) score += 10;
  if (card.attack != null) score += 5;
  if (card.defense != null) score += 5;
  if (card.keywords?.length) score += card.keywords.length * 3;
  if (card.abilities?.length) score += 50;
  if (card.traits?.length) score += 2;
  return score;
}

/** Pick the richest card from a group (e.g. alternate printings of one identity). */
export function pickCanonicalInGroup(cards: CardDefinition[]): CardDefinition {
  return [...cards].sort((a, b) => {
    const diff = cardRichness(b) - cardRichness(a);
    if (diff !== 0) return diff;
    const aCanon = isCanonicalSlot(a.cardNo) ? 1 : 0;
    const bCanon = isCanonicalSlot(b.cardNo) ? 1 : 0;
    return bCanon - aCanon;
  })[0];
}

/** cardNo -> richest gameplay source cardNo (may be itself). */
export function buildReprintMap(cards: Record<string, CardDefinition>): Map<string, string> {
  const byIdentity = new Map<string, CardDefinition[]>();
  for (const card of Object.values(cards)) {
    const key = cardIdentityKey(card);
    if (!byIdentity.has(key)) byIdentity.set(key, []);
    byIdentity.get(key)!.push(card);
  }

  const map = new Map<string, string>();
  for (const group of byIdentity.values()) {
    const canonical = pickCanonicalInGroup(group);
    for (const card of group) {
      map.set(card.cardNo, canonical.cardNo);
    }
  }

  for (const card of Object.values(cards)) {
    const explicit = (card as CardDefinition & { reprintOf?: string }).reprintOf;
    if (explicit && cards[explicit]) {
      const sourceKind = cardIdentityKey(card).split("|")[1];
      const targetKind = cardIdentityKey(cards[explicit]).split("|")[1];
      if (sourceKind === targetKind) {
        map.set(card.cardNo, explicit);
      }
    }
  }

  return map;
}

export function mergePrintingWithGameplay(
  printing: CardDefinition,
  gameplay: CardDefinition,
  handOverlay?: Partial<CardDefinition>,
): CardDefinition {
  const overlay = handOverlay || {};
  const printingKind = cardIdentityKey(printing).split("|")[1];
  const gameplayKind = cardIdentityKey(gameplay).split("|")[1];
  const useGameplay =
    printingKind === gameplayKind &&
    (!printing.cardText || cardRichness(printing) + 5 < cardRichness(gameplay));

  const merged: CardDefinition = {
    ...printing,
    ...(useGameplay
      ? {
          cardType: printing.cardType || gameplay.cardType,
          specialType:
            printing.printingType === "base"
              ? printing.specialType
              : printing.specialType || gameplay.specialType,
          cost: printing.cost != null && printing.cost > 0 ? printing.cost : gameplay.cost,
          attack: printing.attack != null ? printing.attack : gameplay.attack,
          defense: printing.defense != null ? printing.defense : gameplay.defense,
          traits: printing.traits?.length ? printing.traits : gameplay.traits,
          keywords: printing.keywords?.length ? printing.keywords : gameplay.keywords,
          cardText: printing.cardText || gameplay.cardText,
          evolvesFrom: printing.evolvesFrom || gameplay.evolvesFrom,
          evolvesTo: printing.evolvesTo || gameplay.evolvesTo,
          abilities: printing.abilities?.length ? printing.abilities : gameplay.abilities,
        }
      : {}),
    cardNo: printing.cardNo,
    name: printing.name,
    class: printing.class || gameplay.class,
    ...overlay,
    abilities: overlay.abilities?.length
      ? overlay.abilities
      : printing.abilities?.length
        ? printing.abilities
        : useGameplay
          ? gameplay.abilities
          : printing.abilities,
    keywords: overlay.keywords?.length
      ? overlay.keywords
      : printing.keywords?.length
        ? printing.keywords
        : gameplay.keywords,
  };

  if (overlay.cost != null && overlay.cost > 0) merged.cost = overlay.cost;
  if (overlay.attack != null) merged.attack = overlay.attack;
  if (overlay.defense != null) merged.defense = overlay.defense;
  if (overlay.printingType) merged.printingType = overlay.printingType;

  return merged;
}
