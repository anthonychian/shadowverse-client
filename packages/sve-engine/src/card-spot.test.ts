import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { getCardDef } from "./cards/registry";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { resolveEffect } from "./effects/resolver";

const MVP_CARDS = [
  "MVP-001", "MVP-002", "MVP-006", "MVP-007", "MVP-009",
  "MVP-010", "MVP-013", "MVP-014", "MVP-020", "MVP-021",
];

describe("MVP card definitions", () => {
  beforeEach(() => resetIdCounter());

  for (const cardNo of MVP_CARDS) {
    it(`${cardNo} is registered`, () => {
      expect(getCardDef(cardNo)).toBeDefined();
    });
  }

  it("Fanfare Scholar draws on fanfare", () => {
    let state = createInitialGameState(0);
    state.players[0].zones.deck = [createCardInstance("MVP-012", 0)];
    const before = state.players[0].zones.hand.length;
    state = resolveEffect(state, { op: "draw", count: 1 }, 0);
    expect(state.players[0].zones.hand.length).toBe(before + 1);
  });

  it("Healing Prayer heals leader", () => {
    let state = createInitialGameState(0);
    state.players[0].leaderDef = 15;
    state = resolveEffect(state, { op: "healLeader", amount: 2 }, 0);
    expect(state.players[0].leaderDef).toBe(17);
  });

  it("Token Summoner adds token to field", () => {
    let state = createInitialGameState(0);
    state = resolveEffect(
      state,
      { op: "summon", tokenCardNo: "MVP-020", count: 1, zone: "field" },
      0,
    );
    expect(state.players[0].zones.field.length).toBe(1);
    expect(state.players[0].zones.field[0].cardNo).toBe("MVP-020");
  });
});
