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

export function destinationForDestroyedCard(cardNo: string): "banish" | "cemetery" {
  return isTokenCard(cardNo) ? "banish" : "cemetery";
}
