import { beforeEach, describe, expect, it } from "vitest";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { resolveEffect } from "./effects/resolver";
import { countEvolveDeckFaceup } from "./state/evolve-deck";

describe("evolve deck primitives", () => {
  beforeEach(() => resetIdCounter());

  it("turnEvolveDeck flips facedown cards faceup", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    const evo = createCardInstance("MVP-014", 0);
    evo.evoSpent = false;
    state.players[0].zones.evolveDeck.push(evo);
    state = resolveEffect(
      state,
      {
        op: "turnEvolveDeck",
        orientation: "faceup",
        count: 1,
      },
      0,
    );
    expect(state.players[0].zones.evolveDeck[0].evoSpent).toBe(true);
    expect(countEvolveDeckFaceup(state, 0)).toBe(1);
  });

  it("recoverPp uses evolve deck faceup count", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.players[0].pp = 0;
    state.players[0].maxPp = 10;
    for (let i = 0; i < 2; i++) {
      const evo = createCardInstance("MVP-014", 0);
      evo.evoSpent = true;
      state.players[0].zones.evolveDeck.push(evo);
    }
    state = resolveEffect(
      state,
      {
        op: "recoverPp",
        amount: { op: "evolveDeckFaceupCount" },
      },
      0,
    );
    expect(state.players[0].pp).toBe(2);
  });
});
