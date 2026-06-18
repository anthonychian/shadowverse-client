import { getCardDef } from "../cards/registry";
import { normalizeIdentityName } from "../cards/reprints";
import { Condition, DeckFilter, GameState, PlayerId } from "../types";
import { countEvolveDeckFaceup } from "./evolve-deck";
import { hasNamedFollowerOnFieldByIdentity } from "./passives";
import {
  findInstance,
  getPlayer,
  isOverflowActive,
  isSanguineActive,
  opponentOf,
  resolveCardDefCost,
  resolveCardNo,
} from "./queries";

export function cardMatchesFilter(cardNo: string, filter: DeckFilter): boolean {
  const def = getCardDef(cardNo);
  if (!def) return false;
  if (filter.identityName) {
    if (normalizeIdentityName(def.name) !== normalizeIdentityName(filter.identityName)) return false;
  } else if (filter.cardNo) {
    const ref = getCardDef(filter.cardNo);
    if (ref) {
      if (normalizeIdentityName(def.name) !== normalizeIdentityName(ref.name)) return false;
    } else if (cardNo !== filter.cardNo) {
      return false;
    }
  }
  if (filter.trait && !def.traits?.includes(filter.trait)) return false;
  if (filter.traitsAny?.length) {
    const hasTrait = filter.traitsAny.some((t) => def.traits?.includes(t));
    if (!hasTrait) return false;
  }
  if (filter.cardClass && def.class !== filter.cardClass) return false;
  const cost = resolveCardDefCost(cardNo);
  if (filter.maxCost != null && cost > filter.maxCost) return false;
  if (filter.minCost != null && cost < filter.minCost) return false;
  if (filter.cardType && def.cardType !== filter.cardType) return false;
  if (filter.identityNameContains) {
    const needle = filter.identityNameContains.toLowerCase();
    if (!normalizeIdentityName(def.name).toLowerCase().includes(needle)) return false;
  }
  if (filter.excludeIdentityName) {
    const excluded = normalizeIdentityName(filter.excludeIdentityName);
    if (normalizeIdentityName(def.name) === excluded) return false;
  }
  return true;
}

function countFieldFollowersWithTraitAny(
  state: GameState,
  player: PlayerId,
  traits: string[],
): number {
  return getPlayer(state, player).zones.field.filter((c) => {
    const def = getCardDef(resolveCardNo(state, c));
    if (def?.cardType !== "follower") return false;
    return traits.some((t) => def.traits?.includes(t));
  }).length;
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

function countCemeteryTraitBeforeSourceEnters(
  state: GameState,
  player: PlayerId,
  trait: string,
): number {
  const sourceId = state.resolutionContext?.sourceInstanceId;
  return getPlayer(state, player).zones.cemetery.filter((c) => {
    if (sourceId && c.instanceId === sourceId) return false;
    return getCardDef(resolveCardNo(state, c))?.traits?.includes(trait);
  }).length;
}

function countCemeteryClassBeforeSourceEnters(
  state: GameState,
  player: PlayerId,
  cardClass: string,
): number {
  const sourceId = state.resolutionContext?.sourceInstanceId;
  return getPlayer(state, player).zones.cemetery.filter((c) => {
    if (sourceId && c.instanceId === sourceId) return false;
    return getCardDef(resolveCardNo(state, c))?.class === cardClass;
  }).length;
}

export function evalCondition(state: GameState, player: PlayerId, condition: Condition): boolean {
  switch (condition.type) {
    case "always":
      return true;
    case "overflow":
      return isOverflowActive(state, player);
    case "sanguine":
      return isSanguineActive(state, player);
    case "inExArea":
      return evalCondition(state, player, { type: "sourceInExArea" });
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
    case "enteredFromCemetery": {
      const sourceId = state.resolutionContext?.sourceInstanceId;
      if (!sourceId) return false;
      const found = findInstance(state, sourceId);
      return found?.card.enteredFromCemetery === true;
    }
    case "namedCardNotOnFieldByName": {
      const target = normalizeIdentityName(condition.identityName);
      return !getPlayer(state, player).zones.field.some((c) => {
        const def = getCardDef(resolveCardNo(state, c));
        return def && normalizeIdentityName(def.name) === target;
      });
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
    case "ownCemeteryTraitMinBeforeSourceEnters":
      return (
        countCemeteryTraitBeforeSourceEnters(state, player, condition.trait) >= condition.count
      );
    case "ownDeckTraitMin":
      return countTraitInZone(state, player, "deck", condition.trait) >= condition.count;
    case "fieldTraitMin":
      return countTraitInZone(state, player, "field", condition.trait) >= condition.count;
    case "fieldFollowerTraitAnyMin":
      return countFieldFollowersWithTraitAny(state, player, condition.traits) >= condition.count;
    case "handTraitMin":
      return countTraitInZone(state, player, "hand", condition.trait) >= condition.count;
    case "ownCemeteryClassMin":
      return getPlayer(state, player).zones.cemetery.filter(
        (c) => getCardDef(c.cardNo)?.class === condition.cardClass,
      ).length >= condition.count;
    case "ownCemeteryClassMinBeforeSourceEnters":
      return (
        countCemeteryClassBeforeSourceEnters(state, player, condition.cardClass) >= condition.count
      );
    case "ownDeckClassMin":
      return getPlayer(state, player).zones.deck.filter(
        (c) => getCardDef(c.cardNo)?.class === condition.cardClass,
      ).length >= condition.count;
    case "fieldFollowerMinCost": {
      let matches = 0;
      for (const card of getPlayer(state, player).zones.field) {
        const def = getCardDef(resolveCardNo(state, card));
        if (!def?.traits?.includes(condition.trait)) continue;
        if (resolveCardDefCost(card.cardNo) >= condition.minCost) matches += 1;
      }
      return matches >= condition.count;
    }
    case "buriedExactCost":
      return (state.resolutionContext?.buriedCosts ?? []).some((c) => c === condition.cost);
    case "buriedAtLeastCost":
      return (state.resolutionContext?.buriedCosts ?? []).some((c) => c >= condition.cost);
    case "discardedCardType": {
      const cardNo = state.resolutionContext?.lastDiscardedCardNo;
      if (!cardNo) return false;
      return getCardDef(cardNo)?.cardType === condition.cardType;
    }
    case "handMin":
      return getPlayer(state, player).zones.hand.length >= condition.count;
    case "ownCemeteryMin":
    case "necrocharge":
      return getPlayer(state, player).zones.cemetery.length >= condition.count;
    case "ownDeckMax":
      return getPlayer(state, player).zones.deck.length <= condition.count;
    case "fieldTraitMax":
      return countTraitInZone(state, player, "field", condition.trait) <= condition.count;
    case "earthRite": {
      const need = condition.count ?? 1;
      const stackCard = getPlayer(state, player).zones.field.find((c) => {
        const def = getCardDef(resolveCardNo(state, c));
        return def?.keywords?.includes("stack") || def?.traits?.some((t) => /earth|sigil/i.test(t));
      });
      return stackCard != null && (stackCard.counters.stack ?? 0) >= need;
    }
    case "ppMin":
      return getPlayer(state, player).pp >= condition.count;
    case "sourceInExArea": {
      const sourceId = state.resolutionContext?.sourceInstanceId;
      if (!sourceId) return false;
      const found = findInstance(state, sourceId);
      return found?.zone === "exArea";
    }
    case "leaderDefenseMax":
      return getPlayer(state, player).leaderDef <= condition.max;
    case "cardsPlayedMin":
      return getPlayer(state, player).flags.cardsPlayedThisTurn >= condition.count;
    case "leaderDefLostMin":
      return getPlayer(state, player).flags.leaderDefLostCountThisTurn >= condition.count;
    case "enteredByAbility": {
      const sourceId = state.resolutionContext?.sourceInstanceId;
      if (!sourceId) return false;
      const found = findInstance(state, sourceId);
      return found?.card.enteredFromHand === false;
    }
    case "amuletOnField":
      return getPlayer(state, player).zones.field.some((c) => {
        const def = getCardDef(resolveCardNo(state, c));
        return def?.cardType === "amulet";
      });
    case "spellchain": {
      const names = new Set<string>();
      for (const c of getPlayer(state, player).zones.cemetery) {
        const def = getCardDef(resolveCardNo(state, c));
        if (def?.cardType === "spell") {
          names.add(normalizeIdentityName(def.name));
        }
      }
      return names.size >= condition.count;
    }
    case "totalFieldFollowerCount": {
      let total = 0;
      for (const pid of [0, 1] as PlayerId[]) {
        total += getPlayer(state, pid).zones.field.filter((c) => {
          const def = getCardDef(resolveCardNo(state, c));
          return def?.cardType === "follower";
        }).length;
      }
      return total >= (condition.min ?? 0);
    }
    case "hasCounter": {
      const sourceId = state.resolutionContext?.sourceInstanceId;
      if (!sourceId) return false;
      const found = findInstance(state, sourceId);
      if (!found) return false;
      return (found.card.counters[condition.name] ?? 0) >= (condition.min ?? 1);
    }
    case "evolveDeckFaceupMin": {
      return countEvolveDeckFaceup(state, player, condition.filter) >= condition.count;
    }
    case "cemeteryClassSpellNamesMin": {
      const names = new Set<string>();
      for (const c of getPlayer(state, player).zones.cemetery) {
        const def = getCardDef(resolveCardNo(state, c));
        if (def?.cardType === "spell" && def.class === condition.cardClass) {
          names.add(normalizeIdentityName(def.name));
        }
      }
      return names.size >= condition.count;
    }
    case "identityNameOnField": {
      const needle = condition.identityNameContains.toLowerCase();
      return getPlayer(state, player).zones.field.some((c) => {
        const def = getCardDef(resolveCardNo(state, c));
        return def?.name.toLowerCase().includes(needle);
      });
    }
    case "enemyFieldMin": {
      const enemy = opponentOf(player);
      return getPlayer(state, enemy).zones.field.length >= condition.count;
    }
    default:
      return false;
  }
}
