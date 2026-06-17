import { getCardDef } from "../cards/registry";
import { UniverseId } from "../types";

export type CraftClass =
  | "forest"
  | "sword"
  | "rune"
  | "dragon"
  | "abyss"
  | "haven"
  | "neutral";

export type { UniverseId };

export interface DeckIdentity {
  craft: CraftClass | null;
  universe: UniverseId | null;
  leader: string;
}

export const CRAFT_LEADERS: Record<Exclude<CraftClass, "neutral">, string> = {
  sword: "Albert",
  dragon: "Forte",
  abyss: "Icy",
  rune: "Kuon",
  forest: "Sekka",
  haven: "Rola",
};

const UNIVERSE_LEADERS: Record<UniverseId, string> = {
  umamusume: "Maruzensky",
  idolmaster: "Rin",
  vanguard: "Albert",
};

const CRAFT_CLASSES: CraftClass[] = [
  "forest",
  "sword",
  "rune",
  "dragon",
  "abyss",
  "haven",
];

function isCraftClass(value: string): value is CraftClass {
  return (CRAFT_CLASSES as string[]).includes(value) || value === "neutral";
}

export function getCardUniverseFromCardNo(cardNo: string): UniverseId | null {
  const id = cardNo.toUpperCase();
  if (/^(ECP02|CP02)/.test(id)) return "idolmaster";
  if (/^(CSD01|CP01|ECP01)/.test(id)) return "umamusume";
  if (/^CSD03/.test(id)) return "vanguard";
  return null;
}

function leaderForCraft(craft: CraftClass | null): string {
  if (craft && craft !== "neutral" && CRAFT_LEADERS[craft]) {
    return CRAFT_LEADERS[craft];
  }
  return CRAFT_LEADERS.dragon;
}

export function detectDeckIdentity(cardNos: string[]): DeckIdentity {
  const crafts = new Set<CraftClass>();
  const universes = new Set<UniverseId>();

  for (const cardNo of cardNos) {
    const def = getCardDef(cardNo);
    const cardClass = def?.class;
    if (cardClass && isCraftClass(cardClass) && cardClass !== "neutral") {
      crafts.add(cardClass);
    }
    const universe = getCardUniverseFromCardNo(cardNo);
    if (universe) universes.add(universe);
  }

  if (crafts.size === 1) {
    const craft = [...crafts][0];
    return { craft, universe: null, leader: leaderForCraft(craft) };
  }

  if (universes.size === 1) {
    const universe = [...universes][0];
    return { craft: null, universe, leader: UNIVERSE_LEADERS[universe] };
  }

  if (crafts.size > 1) {
    const dominant = [...crafts].sort()[0];
    return { craft: dominant, universe: null, leader: leaderForCraft(dominant) };
  }

  return { craft: "neutral", universe: null, leader: CRAFT_LEADERS.dragon };
}

export const COOL_EARRINGS_CARD_NO = "CP02-T04EN";
