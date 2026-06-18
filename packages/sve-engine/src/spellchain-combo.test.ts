import { describe, expect, it } from "vitest";
import { evalCondition } from "./state/conditions";
import { createCardInstance, createInitialGameState } from "./state/factory";

describe("spellchain and combo cost modifiers", () => {
  it("evaluates spellchain condition from distinct spell names in cemetery", () => {
    const state = createInitialGameState(0);
    for (let i = 0; i < 3; i++) {
      state.players[0].zones.cemetery.push(createCardInstance("BP14-035EN", 0));
    }
    expect(evalCondition(state, 0, { type: "spellchain", count: 1 })).toBe(true);
    expect(evalCondition(state, 0, { type: "spellchain", count: 2 })).toBe(false);
  });
});
