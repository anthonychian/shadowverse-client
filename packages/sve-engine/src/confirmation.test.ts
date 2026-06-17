import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { resolveEffect } from "./effects/resolver";
import { queueFanfare, runConfirmationTiming } from "./rules/confirmation";

describe("confirmation timing", () => {
  beforeEach(() => resetIdCounter());

  it("fanfare draw increases hand size", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.players[0].zones.deck = [createCardInstance("MVP-012", 0)];
    const fanfare = createCardInstance("MVP-006", 0);
    state.players[0].zones.field.push(fanfare);
    const handBefore = state.players[0].zones.hand.length;
    queueFanfare(state, fanfare.instanceId, 0);
    state = runConfirmationTiming(state);
    expect(state.players[0].zones.hand.length).toBe(handBefore + 1);
  });

  it("deck-out loss applies after rules handling even when other events follow", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].zones.deck = [];
    state = resolveEffect(state, { op: "draw", count: 1 }, 0);
    state.eventLog.push({ type: "startPhase", player: 0 });
    state = runConfirmationTiming(state);
    expect(state.phase).toBe("gameOver");
    expect(state.winner).toBe(1);
  });

  it("fulfills owed draws during rules handling when cards are added to deck", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].zones.deck = [];
    state.players[0].flags.owedDraws = 1;
    state.players[0].zones.deck.push(createCardInstance("MVP-012", 0));
    state = runConfirmationTiming(state);
    expect(state.phase).not.toBe("gameOver");
    expect(state.players[0].flags.owedDraws).toBe(0);
    expect(state.players[0].zones.hand.length).toBe(1);
  });

  it("turn-start draw with empty deck loses after rules handling", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 2;
    state.pendingChoices = null;
    state.players[1].zones.deck = [];
    const ended = applyAction(state, 0, { type: "END_MAIN" });
    expect(ended.ok).toBe(true);
    let current = ended.state;
    if (current.quickWindow === "endPhase") {
      const passed = applyAction(current, 1, { type: "PASS_QUICK_WINDOW" });
      expect(passed.ok).toBe(true);
      current = passed.state;
    }
    expect(current.phase).toBe("gameOver");
    expect(current.winner).toBe(0);
  });

  it("destroys follower at zero defense", () => {
    let state = createInitialGameState(0);
    const follower = createCardInstance("MVP-012", 0);
    follower.modifiers.push({ def: -2, sourceId: "test" });
    state.players[0].zones.field.push(follower);
    state = runConfirmationTiming(state);
    expect(state.players[0].zones.field.length).toBe(0);
    expect(state.players[0].zones.cemetery.length).toBe(1);
  });
});
