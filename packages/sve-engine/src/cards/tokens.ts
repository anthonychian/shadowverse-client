import { CardInstance } from "../types";
import { getCardDef } from "./registry";

export function isTokenCard(cardNo: string): boolean {
  const def = getCardDef(cardNo);
  if (!def) return /\bTOKEN\b/i.test(cardNo);
  return (
    def.printingType === "token" ||
    def.specialType === "token" ||
    /\bTOKEN\b/i.test(def.name)
  );
}

export function isAdvancedCard(card: CardInstance): boolean {
  if (card.advancedFromEvolveDeck) return true;
  const def = getCardDef(card.cardNo);
  return def?.specialType === "advanced" || /\sADVANCED$/i.test(def?.name ?? "");
}

export function destinationForDestroyedCard(
  card: CardInstance,
): "banish" | "cemetery" | "evolveDeck" {
  if (isAdvancedCard(card)) return "evolveDeck";
  return isTokenCard(card.cardNo) ? "banish" : "cemetery";
}
