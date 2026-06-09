import { destinationForDestroyedCard } from "../cards/tokens";
import { onCardEntersExArea, onFollowerEntersField } from "../rules/confirmation";
import { resetCardInstanceState } from "./card-reset";
import { CardInstance, GameState, PlayerId } from "../types";
import { findInstance } from "./queries";

export function moveCard(
  state: GameState,
  instanceId: string,
  toZone: keyof GameState["players"][0]["zones"],
  toPlayer: PlayerId,
): GameState {
  const found = findInstance(state, instanceId);
  if (!found) return state;
  const next = structuredClone(state);
  const fromZones = next.players[found.player].zones;
  const fromList = fromZones[found.zone as keyof typeof fromZones] as CardInstance[];
  const idx = fromList.findIndex((c) => c.instanceId === instanceId);
  if (idx < 0) return state;
  const [card] = fromList.splice(idx, 1);

  let actualZone = toZone;
  if (toZone === "cemetery") {
    actualZone = destinationForDestroyedCard(card.cardNo);
  }

  card.controller = toPlayer;
  const toList = next.players[toPlayer].zones[actualZone] as CardInstance[];
  toList.push(card);

  if (actualZone === "cemetery" || actualZone === "banish") {
    resetCardInstanceState(card);
  } else if (toZone === "field") {
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
  const dest = destinationForDestroyedCard(card.cardNo);
  resetCardInstanceState(card);
  p.zones[dest].push(card);
  return { state: next, card, player: found.player };
}

export function destroyFollower(state: GameState, instanceId: string): GameState {
  const removed = removeFromField(state, instanceId);
  if (!removed) return state;
  let next = removed.state;
  const link = next.players[removed.player].zones.evolveZone.find(
    (l) => l.fieldInstanceId === instanceId,
  );
  if (link) {
    const evoIdx = next.players[removed.player].zones.resolutionZone.findIndex(
      (c) => c.instanceId === link.evolveInstanceId,
    );
    if (evoIdx >= 0) {
      const [evoCard] = next.players[removed.player].zones.resolutionZone.splice(evoIdx, 1);
      resetCardInstanceState(evoCard);
      next.players[removed.player].zones.evolveDeck.push(evoCard);
    } else {
      next = moveCard(next, link.evolveInstanceId, "evolveDeck", removed.player);
      const evoInDeck = next.players[removed.player].zones.evolveDeck.find(
        (c) => c.instanceId === link.evolveInstanceId,
      );
      if (evoInDeck) resetCardInstanceState(evoInDeck);
    }
    next.players[removed.player].zones.evolveZone = next.players[
      removed.player
    ].zones.evolveZone.filter((l) => l.fieldInstanceId !== instanceId);
  }
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
