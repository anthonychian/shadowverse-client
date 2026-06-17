import { CardInstance } from "../types";

/** Reset mutable instance state when a card leaves play (cemetery/banish). */
export function resetCardInstanceState(card: CardInstance): void {
  card.modifiers = [];
  card.grantedKeywords = [];
  card.grantedLastWords = [];
  card.grantedOnCardPlayed = [];
  card.playCostReduction = 0;
  card.persistentPlayCostReduction = 0;
  card.abilitiesActivatedThisTurn = [];
  card.engaged = false;
  card.linkedEvoInstanceId = undefined;
  card.evolvedThisTurn = false;
  card.superEvolved = false;
  card.enteredFromHand = undefined;
  card.boxedUntilTurn = undefined;
  card.skipRefreshOnTurn = undefined;
  card.foughtWithBane = false;
  card.foughtWithInstanceId = undefined;
  card.onFieldSinceTurnStart = false;
  card.counters = {};
}
