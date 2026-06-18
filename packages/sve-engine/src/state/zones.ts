import { destinationForDestroyedCard } from "../cards/tokens";
import { onCardEntersExArea, onFollowerEntersField } from "../rules/confirmation";
import {
  queueOnEnemyFollowerLeaveField,
  queueOnLeaveField,
  queueOnTokenLeaveField,
} from "../rules/trigger-queue";
import { resetCardInstanceState, resetFieldInstanceState } from "./card-reset";
import { getCardDef } from "../cards/registry";
import { CardInstance, GameState, PlayerId } from "../types";
import { findInstance, resolveCardNo } from "./queries";

export function moveCard(
  state: GameState,
  instanceId: string,
  toZone: keyof GameState["players"][0]["zones"],
  toPlayer: PlayerId,
): GameState {
  const found = findInstance(state, instanceId);
  if (!found) return state;
  let next =
    found.zone === "field" && toZone !== "field"
      ? returnEvolveCardToDeck(state, instanceId, true)
      : structuredClone(state);
  const foundAfter = findInstance(next, instanceId);
  if (!foundAfter) return next;
  const fromZones = next.players[foundAfter.player].zones;
  const fromList = fromZones[foundAfter.zone as keyof typeof fromZones] as CardInstance[];
  const idx = fromList.findIndex((c) => c.instanceId === instanceId);
  if (idx < 0) return state;
  const [card] = fromList.splice(idx, 1);

  let actualZone = toZone;
  if (toZone === "cemetery") {
    actualZone = destinationForDestroyedCard(card.cardNo);
  }

  const leftField = foundAfter.zone === "field" && toZone !== "field";
  if (leftField) {
    queueOnLeaveField(next, instanceId, foundAfter.player);
  }
  if (leftField && actualZone !== "cemetery" && actualZone !== "banish") {
    resetFieldInstanceState(card);
  }

  card.controller = toPlayer;
  const toList = next.players[toPlayer].zones[actualZone] as CardInstance[];
  toList.push(card);

  if (actualZone === "cemetery" || actualZone === "banish") {
    resetCardInstanceState(card);
  } else if (toZone === "field") {
    if (foundAfter.zone === "cemetery") {
      card.enteredFromCemetery = true;
      card.enteredFromHand = false;
    }
    onFollowerEntersField(next, card.instanceId, toPlayer);
  } else if (toZone === "exArea") {
    onCardEntersExArea(next, card.instanceId, toPlayer);
  }
  return next;
}

export function removeFromField(
  state: GameState,
  instanceId: string,
): { state: GameState; card: CardInstance; player: PlayerId } | null {
  const found = findInstance(state, instanceId);
  if (!found || found.zone !== "field") return null;
  const next = structuredClone(state);
  const p = next.players[found.player];
  const idx = p.zones.field.findIndex((c) => c.instanceId === instanceId);
  if (idx < 0) return null;
  const [card] = p.zones.field.splice(idx, 1);
  const cardNo = resolveCardNo(next, card);
  const dest = destinationForDestroyedCard(cardNo);

  if (dest === "cemetery" || dest === "banish") {
    queueOnEnemyFollowerLeaveField(next, instanceId, found.player, next.activePlayer);
    const def = getCardDef(cardNo);
    if (def?.printingType === "token" || def?.specialType === "token") {
      queueOnTokenLeaveField(next, instanceId, found.player, cardNo);
    }
  }

  resetCardInstanceState(card);
  p.zones[dest].push(card);
  return { state: next, card, player: found.player };
}

export function returnEvolveCardToDeck(
  state: GameState,
  fieldInstanceId: string,
  spent: boolean,
): GameState {
  const found = findInstance(state, fieldInstanceId);
  if (!found || found.zone !== "field") return state;

  const player = found.player;
  const link = state.players[player].zones.evolveZone.find(
    (l) => l.fieldInstanceId === fieldInstanceId,
  );
  const evoId = link?.evolveInstanceId ?? found.card.linkedEvoInstanceId;
  if (!evoId) return state;

  const next = structuredClone(state);
  const p = next.players[player];

  p.zones.evolveZone = p.zones.evolveZone.filter(
    (l) => l.fieldInstanceId !== fieldInstanceId,
  );

  const fieldCard = p.zones.field.find((c) => c.instanceId === fieldInstanceId);
  if (fieldCard) fieldCard.linkedEvoInstanceId = undefined;

  let evoCard: CardInstance | undefined;
  const resolveIdx = p.zones.resolutionZone.findIndex((c) => c.instanceId === evoId);
  if (resolveIdx >= 0) {
    [evoCard] = p.zones.resolutionZone.splice(resolveIdx, 1);
  } else {
    const evoFound = findInstance(next, evoId);
    if (evoFound && evoFound.zone !== "evolveDeck") {
      const list = p.zones[evoFound.zone as keyof typeof p.zones] as CardInstance[];
      const evoIdx = list.findIndex((c) => c.instanceId === evoId);
      if (evoIdx >= 0) [evoCard] = list.splice(evoIdx, 1);
    }
  }
  if (!evoCard) return next;

  resetCardInstanceState(evoCard);
  evoCard.evoSpent = spent;
  p.zones.evolveDeck.push(evoCard);
  return next;
}

export function destroyFollower(state: GameState, instanceId: string): GameState {
  let next = returnEvolveCardToDeck(state, instanceId, true);
  const removed = removeFromField(next, instanceId);
  if (!removed) return state;
  return removed.state;
}

export function putFieldCardOnDeckBottom(
  state: GameState,
  instanceId: string,
  player: PlayerId,
): GameState {
  const next = structuredClone(state);
  const found = findInstance(next, instanceId);
  if (!found || found.zone !== "field" || found.player !== player) return state;
  queueOnLeaveField(next, instanceId, player);
  const p = next.players[player];
  const idx = p.zones.field.findIndex((c) => c.instanceId === instanceId);
  if (idx < 0) return state;
  const [card] = p.zones.field.splice(idx, 1);
  resetCardInstanceState(card);
  p.zones.deck.push(card);
  return next;
}

export function putFieldCardOnDeckTop(
  state: GameState,
  instanceId: string,
  player: PlayerId,
): GameState {
  const next = structuredClone(state);
  const found = findInstance(next, instanceId);
  if (!found || found.zone !== "field") return state;
  const owner = found.player;
  queueOnLeaveField(next, instanceId, owner);
  const p = next.players[owner];
  const idx = p.zones.field.findIndex((c) => c.instanceId === instanceId);
  if (idx < 0) return state;
  const [card] = p.zones.field.splice(idx, 1);
  resetCardInstanceState(card);
  p.zones.deck.unshift(card);
  return next;
}

export function drawCard(state: GameState, player: PlayerId): GameState {
  const next = structuredClone(state);
  const deck = next.players[player].zones.deck;
  if (deck.length === 0) {
    next.players[player].flags.owedDraws += 1;
    next.eventLog.push({ type: "deckOut", player });
    return next;
  }
  const [card] = deck.splice(0, 1);
  next.players[player].zones.hand.push(card);
  next.eventLog.push({ type: "draw", player });
  return next;
}

export function shuffleDeck(state: GameState, player: PlayerId): GameState {
  const next = structuredClone(state);
  const deck = next.players[player].zones.deck;
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return next;
}
