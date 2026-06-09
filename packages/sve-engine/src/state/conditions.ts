import { getCardDef } from "../cards/registry";
import { normalizeIdentityName } from "../cards/reprints";
import { Condition, DeckFilter, GameState, PlayerId } from "../types";
import { hasNamedFollowerOnFieldByIdentity } from "./passives";
import {
  findInstance,
  getPlayer,
  isOverflowActive,
  opponentOf,
  resolveCardDefCost,
  resolveCardNo,
} from "./queries";

export function cardMatchesFilter(cardNo: string, filter: DeckFilter): boolean {
  const def = getCardDef(cardNo);
  if (!def) return false;
  if (filter.cardNo && cardNo !== filter.cardNo) return false;
  if (filter.trait && !def.traits?.includes(filter.trait)) return false;
  if (filter.cardClass && def.class !== filter.cardClass) return false;
  const cost = resolveCardDefCost(cardNo);
  if (filter.maxCost != null && cost > filter.maxCost) return false;
  if (filter.minCost != null && cost < filter.minCost) return false;
  if (filter.cardType && def.cardType !== filter.cardType) return false;
  return true;
}

function countTraitInZone(
  state: GameState,
  player: PlayerId,
  zone: "exArea" | "cemetery" | "field" | "hand" | "deck",
  trait: string,
): number {
  return getPlayer(state, player).zones[zone].filter((c) =>
    getCardDef(resolveCardNo(state, c))?.traits?.includes(trait),
  ).length;
}

export function evalCondition(state: GameState, player: PlayerId, condition: Condition): boolean {
  switch (condition.type) {
    case "always":
      return true;
    case "overflow":
      return isOverflowActive(state, player);
    case "combo":
      return getPlayer(state, player).flags.cardsPlayedThisTurn >= condition.count;
    case "namedFollowerOnField":
      return getPlayer(state, player).zones.field.some((c) => c.cardNo === condition.cardNo);
    case "namedFollowerOnFieldByName":
      return hasNamedFollowerOnFieldByIdentity(state, player, condition.identityName);
    case "notEnteredFromHand": {
      const sourceId = state.resolutionContext?.sourceInstanceId;
      if (!sourceId) return false;
      const found = findInstance(state, sourceId);
      return found?.card.enteredFromHand === false;
    }
    case "opponentCemeteryMin": {
      const opp = opponentOf(player);
      return getPlayer(state, opp).zones.cemetery.length >= condition.count;
    }
    case "exAreaTraitMin":
      return countTraitInZone(state, player, "exArea", condition.trait) >= condition.count;
    case "exAreaNamedMin": {
      const target = normalizeIdentityName(condition.identityName);
      const count = getPlayer(state, player).zones.exArea.filter((c) => {
        const def = getCardDef(resolveCardNo(state, c));
        return def && normalizeIdentityName(def.name) === target;
      }).length;
      return count >= condition.count;
    }
    case "ownCemeteryTraitMin":
      return countTraitInZone(state, player, "cemetery", condition.trait) >= condition.count;
    case "ownDeckTraitMin":
      return countTraitInZone(state, player, "deck", condition.trait) >= condition.count;
    case "fieldTraitMin":
      return countTraitInZone(state, player, "field", condition.trait) >= condition.count;
    case "handTraitMin":
      return countTraitInZone(state, player, "hand", condition.trait) >= condition.count;
    case "ownCemeteryClassMin":
      return getPlayer(state, player).zones.cemetery.filter(
        (c) => getCardDef(c.cardNo)?.class === condition.cardClass,
      ).length >= condition.count;
    case "ownDeckClassMin":
      return getPlayer(state, player).zones.deck.filter(
        (c) => getCardDef(c.cardNo)?.class === condition.cardClass,
      ).length >= condition.count;
    default:
      return false;
  }
}
