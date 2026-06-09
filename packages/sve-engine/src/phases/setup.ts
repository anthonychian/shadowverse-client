import { createCardInstance } from "../state/factory";
import { isBoxed } from "../state/passives";
import { drawCard, shuffleDeck } from "../state/zones";
import { CardInstance, GameState, PlayerId } from "../types";

function clearTurnScopedCardState(card: CardInstance): void {
  card.playCostReduction = 0;
  card.abilitiesActivatedThisTurn = [];
  card.modifiers = card.modifiers.filter((m) => !m.untilEndOfTurn);
}

function refreshFieldCard(card: CardInstance, state: GameState): void {
  card.evolvedThisTurn = false;
  card.foughtWithBane = false;
  card.foughtWithInstanceId = undefined;
  clearTurnScopedCardState(card);
  if (isBoxed(card, state)) {
    card.engaged = true;
    card.onFieldSinceTurnStart = false;
    return;
  }
  card.boxedUntilTurn = undefined;
  card.engaged = false;
  card.onFieldSinceTurnStart = true;
}

export interface DeckInput {
  mainDeck: string[];
  evolveDeck: string[];
  leaderCardNo?: string;
}

export function loadDecks(
  state: GameState,
  decks: [DeckInput, DeckInput],
): GameState {
  let next = structuredClone(state);
  for (const pid of [0, 1] as PlayerId[]) {
    const input = decks[pid];
    next.players[pid].zones.deck = input.mainDeck.map((cardNo) =>
      createCardInstance(cardNo, pid),
    );
    next.players[pid].zones.evolveDeck = input.evolveDeck.map((cardNo) =>
      createCardInstance(cardNo, pid),
    );
    next = shuffleDeck(next, pid);
    for (let i = 0; i < 4; i++) {
      next = drawCard(next, pid);
    }
  }
  next.phase = "mulligan";
  next.pendingChoices = { type: "mulligan", player: next.firstPlayer };
  next.eventLog.push({ type: "gamePrepared" });
  return next;
}

export function applyMulligan(
  state: GameState,
  player: PlayerId,
  redraw: boolean,
): GameState {
  let next = structuredClone(state);
  if (redraw) {
    const hand = next.players[player].zones.hand.splice(0);
    next.players[player].zones.deck.push(...hand);
    next = shuffleDeck(next, player);
    for (let i = 0; i < 4; i++) {
      next = drawCard(next, player);
    }
  }
  next.players[player].flags.mulliganDone = true;
  next.eventLog.push({ type: "mulligan", player, data: { redraw } });

  if (!next.players[0].flags.mulliganDone) {
    next.pendingChoices = { type: "mulligan", player: 0 };
    return next;
  }
  if (!next.players[1].flags.mulliganDone) {
    next.pendingChoices = { type: "mulligan", player: 1 };
    return next;
  }

  next.pendingChoices = null;
  next.turnNumber = 1;
  next.activePlayer = next.firstPlayer;
  return beginStartPhase(next);
}

export function beginStartPhase(state: GameState): GameState {
  let next = structuredClone(state);
  const player = next.activePlayer;
  const p = next.players[player];

  if (p.maxPp < 10) p.maxPp += 1;
  p.pp = p.maxPp;
  p.turnsPassed += 1;
  p.flags.evolvedThisTurn = false;
  p.flags.cardsPlayedThisTurn = 0;
  p.flags.leaderLostDefThisTurn = false;

  for (const card of p.zones.field) {
    refreshFieldCard(card, next);
  }
  for (const zone of ["hand", "exArea", "cemetery"] as const) {
    for (const card of p.zones[zone]) {
      clearTurnScopedCardState(card);
    }
  }

  const skipDraw =
    next.turnNumber === 1 && player === next.firstPlayer;
  if (!skipDraw) {
    next = drawCard(next, player);
  }

  next.phase = "main";
  next.eventLog.push({ type: "startPhase", player });
  return next;
}
