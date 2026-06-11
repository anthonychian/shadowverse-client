import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { getCardDef } from "./cards/registry";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";

function resolveFanfareChoices(
  state: ReturnType<typeof applyAction>["state"],
  player: 0 | 1,
  discardId?: string,
) {
  let current = state;
  for (let step = 0; step < 15; step++) {
    if (!current.pendingChoices) break;
    const choice = current.pendingChoices;
    if (choice.type === "selectTrigger") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { triggerId: choice.options[0].triggerId },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (choice.type === "choose") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { optionIndex: 0 },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (choice.type === "selectZoneCards") {
      const id = discardId ?? choice.options[0].instanceId;
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { instanceIds: [id] },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    break;
  }
  return current;
}

describe("Stone Merchant", () => {
  beforeEach(() => resetIdCounter());

  it("has fanfare discard-draw DSL for Swordcraft cards", () => {
    const def = getCardDef("BP17-033EN")!;
    const ff = def.abilities!.find((a) => a.timing === "fanfare")!;
    expect(ff.effect.op).toBe("optionalCost");
    if (ff.effect.op === "optionalCost") {
      expect(ff.effect.cost).toMatchObject({
        op: "discardFromHand",
        filter: { cardClass: "sword" },
      });
    }
  });

  it("fanfare draws 2 when a Swordcraft spell is discarded", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].maxPp = 10;

    const merchant = createCardInstance("BP17-033EN", 0);
    const spell = createCardInstance("BP14-034EN", 0);
    state.players[0].zones.hand.push(merchant, spell);
    for (let i = 0; i < 5; i++) {
      state.players[0].zones.deck.push(createCardInstance("MVP-012", 0));
    }

    const handBefore = state.players[0].zones.hand.length;
    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: merchant.instanceId });
    expect(played.ok).toBe(true);
    state = resolveFanfareChoices(played.state, 0, spell.instanceId);

    expect(state.players[0].zones.hand.length).toBe(handBefore - 2 + 2);
    expect(state.players[0].zones.cemetery.some((c) => c.instanceId === spell.instanceId)).toBe(true);
  });

  it("fanfare draws 1 when a Swordcraft follower is discarded", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].maxPp = 10;

    const merchant = createCardInstance("BP17-033EN", 0);
    const follower = createCardInstance("BP14-018EN", 0);
    state.players[0].zones.hand.push(merchant, follower);
    state.players[0].zones.deck.push(createCardInstance("MVP-012", 0));

    const handBefore = state.players[0].zones.hand.length;
    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: merchant.instanceId });
    expect(played.ok).toBe(true);
    state = resolveFanfareChoices(played.state, 0, follower.instanceId);

    expect(state.players[0].zones.hand.length).toBe(handBefore - 2 + 1);
    expect(state.players[0].zones.cemetery.some((c) => c.instanceId === follower.instanceId)).toBe(true);
  });
});
