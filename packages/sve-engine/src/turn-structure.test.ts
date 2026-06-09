import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { loadDecks } from "./phases/setup";

const MVP_DECK = [
  "MVP-012", "MVP-012", "MVP-012",
  "MVP-006", "MVP-006",
  "MVP-013", "MVP-013",
  "MVP-009", "MVP-009",
  "MVP-010",
];

function setupGame() {
  resetIdCounter();
  let state = createInitialGameState(0);
  state = loadDecks(state, [
    { mainDeck: [...MVP_DECK, ...MVP_DECK, ...MVP_DECK, ...MVP_DECK], evolveDeck: ["MVP-014"] },
    { mainDeck: [...MVP_DECK, ...MVP_DECK, ...MVP_DECK, ...MVP_DECK], evolveDeck: ["MVP-014"] },
  ]);
  state = applyAction(state, 0, { type: "MULLIGAN", redraw: false }).state;
  state = applyAction(state, 1, { type: "MULLIGAN", redraw: false }).state;
  return state;
}

describe("turn structure", () => {
  beforeEach(() => resetIdCounter());

  it("first player starts with PP refilled on turn 1", () => {
    const state = setupGame();
    expect(state.phase).toBe("main");
    expect(state.players[0].maxPp).toBe(1);
    expect(state.players[0].pp).toBe(1);
  });

  it("first player does not draw on turn 1", () => {
    const state = setupGame();
    expect(state.players[0].zones.hand.length).toBe(4);
  });

  it("advances PP on turn 2 for first player", () => {
    let state = setupGame();
    state = applyAction(state, 0, { type: "END_MAIN" }).state;
    state = applyAction(state, 1, { type: "PASS_QUICK_WINDOW" }).state;
    expect(state.activePlayer).toBe(1);
    state = applyAction(state, 1, { type: "END_MAIN" }).state;
    state = applyAction(state, 0, { type: "PASS_QUICK_WINDOW" }).state;
    expect(state.players[0].maxPp).toBe(2);
    expect(state.players[0].pp).toBe(2);
  });

  it("prompts to discard down to hand limit at end of turn", () => {
    let state = setupGame();
    state.players[0].maxPp = 10;
    state.players[0].pp = 10;
    for (let i = 0; i < 5; i++) {
      state.players[0].zones.hand.push(createCardInstance("MVP-012", 0));
    }
    const toDiscard = state.players[0].zones.hand[0].instanceId;
    state = applyAction(state, 0, { type: "END_MAIN" }).state;
    state = applyAction(state, 1, { type: "PASS_QUICK_WINDOW" }).state;
    expect(state.pendingChoices?.type).toBe("discard");
    if (state.pendingChoices?.type !== "discard") throw new Error("expected discard prompt");
    expect(state.pendingChoices.count).toBe(2);
    state = applyAction(state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [toDiscard, state.players[0].zones.hand[1].instanceId] },
    }).state;
    expect(state.pendingChoices).toBeNull();
    expect(state.players[0].zones.hand.length).toBe(7);
    expect(state.activePlayer).toBe(1);
  });

  it("plays a card from the EX area", () => {
    resetIdCounter();
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 3;
    const exCard = createCardInstance("BP14-T01EN", 0);
    state.players[0].zones.exArea.push(exCard);
    const result = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: exCard.instanceId,
    });
    expect(result.ok).toBe(true);
    expect(result.state.players[0].zones.exArea.length).toBe(0);
    expect(
      result.state.players[0].zones.field.some((c) => c.instanceId === exCard.instanceId),
    ).toBe(true);
    expect(result.state.players[0].pp).toBeLessThan(3);
  });
});
