import { GameState, PlayerId } from "../types";

export interface RevealedCard {
  owner: PlayerId;
  instanceId: string;
  cardNo: string;
}

/** Deck searches to hand reveal by default; cemetery returns do not. */
export function shouldRevealBeforeHand(
  to: "hand" | "exArea" | "field",
  fromZone: string,
  explicit?: boolean,
): boolean {
  if (explicit != null) return explicit;
  if (to !== "hand") return false;
  if (fromZone === "cemetery") return false;
  return true;
}

export function revealCard(
  state: GameState,
  owner: PlayerId,
  instanceId: string,
  cardNo: string,
): GameState {
  const next = structuredClone(state);
  const list = next.revealedCards ?? [];
  if (!list.some((r) => r.instanceId === instanceId)) {
    next.revealedCards = [...list, { owner, instanceId, cardNo }];
    next.eventLog.push({ type: "reveal", player: owner, data: { instanceId, cardNo } });
  }
  return next;
}

export function clearRevealedCards(state: GameState): GameState {
  if (!state.revealedCards?.length) return state;
  const next = structuredClone(state);
  next.revealedCards = [];
  return next;
}
