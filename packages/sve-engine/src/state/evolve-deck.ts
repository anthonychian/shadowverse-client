import type { CardInstance, DeckFilter, GameState, PlayerId } from "../types";
import { getCardDef } from "../cards/registry";
import { cardMatchesFilter } from "./conditions";
import { getPlayer } from "./queries";

export function isEvolveDeckFaceup(card: CardInstance): boolean {
  return Boolean(card.evoSpent);
}

export function isEvolveDeckFacedown(card: CardInstance): boolean {
  return !card.evoSpent;
}

export function filterEvolveDeckCards(
  state: GameState,
  player: PlayerId,
  opts?: { filter?: DeckFilter; face?: "faceup" | "facedown" },
): CardInstance[] {
  return getPlayer(state, player).zones.evolveDeck.filter((c) => {
    if (opts?.face === "faceup" && !isEvolveDeckFaceup(c)) return false;
    if (opts?.face === "facedown" && !isEvolveDeckFacedown(c)) return false;
    if (opts?.filter && !cardMatchesFilter(c.cardNo, opts.filter)) return false;
    const def = getCardDef(c.cardNo);
    if (!def) return false;
    return true;
  });
}

export function countEvolveDeckFaceup(
  state: GameState,
  player: PlayerId,
  filter?: DeckFilter,
): number {
  return filterEvolveDeckCards(state, player, { filter, face: "faceup" }).length;
}

export function setEvolveDeckOrientation(
  state: GameState,
  instanceIds: string[],
  orientation: "faceup" | "facedown",
): GameState {
  const next = structuredClone(state);
  for (const pid of [0, 1] as PlayerId[]) {
    for (const card of next.players[pid].zones.evolveDeck) {
      if (!instanceIds.includes(card.instanceId)) continue;
      card.evoSpent = orientation === "faceup";
    }
  }
  return next;
}
