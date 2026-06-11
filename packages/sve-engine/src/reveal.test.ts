import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";

describe("reveal before adding to hand", () => {
  beforeEach(() => resetIdCounter());

  it("reveals deck search to opponent before adding to hand", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 2;

    const spell = createCardInstance("BP17-080EN", 0);
    const target = createCardInstance("BP17-040EN", 0);
    state.players[0].zones.deck.push(target);
    state.players[0].zones.hand.push(spell);

    const played = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: spell.instanceId,
    });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("choose");

    const chose = applyAction(played.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { optionIndex: 0 },
    });
    expect(chose.ok).toBe(true);
    expect(chose.state.pendingChoices?.type).toBe("selectZoneCard");

    const picked = applyAction(chose.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceId: target.instanceId },
    });
    expect(picked.ok).toBe(true);
    expect(picked.state.revealedCards?.some((r) => r.cardNo === "BP17-040EN")).toBe(true);
    expect(picked.state.eventLog.some((e) => e.type === "reveal")).toBe(true);
    expect(picked.state.players[0].zones.hand.some((c) => c.cardNo === "BP17-040EN")).toBe(true);
  });

  it("does not reveal when returning from cemetery to hand", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 2;

    const spell = createCardInstance("BP07-075EN", 0);
    const fromCemetery = createCardInstance("BP17-040EN", 0);
    state.players[0].zones.hand.push(spell);
    state.players[0].zones.cemetery.push(fromCemetery);

    const played = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: spell.instanceId,
    });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("choose");

    const chose = applyAction(played.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { optionIndex: 0 },
    });
    expect(chose.ok).toBe(true);
    expect(chose.state.pendingChoices?.type).toBe("selectZoneCard");

    const picked = applyAction(chose.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceId: fromCemetery.instanceId },
    });
    expect(picked.ok).toBe(true);
    expect(picked.state.revealedCards?.length ?? 0).toBe(0);
    expect(picked.state.eventLog.some((e) => e.type === "reveal")).toBe(false);
  });
});
