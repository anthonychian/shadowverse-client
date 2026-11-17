import { beforeEach, describe, expect, it } from "vitest";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { resolveEffect } from "./effects/resolver";
import { countEvolveDeckFaceup } from "./state/evolve-deck";
import { destroyFollower, moveCard } from "./state/zones";

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

  it("returns a destroyed Advanced follower to the evolve deck", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.pendingChoices = null;
    state.players[0].zones.evolveDeck.push(createCardInstance("BP14-019EN", 0));

    state = resolveEffect(
      state,
      { op: "summonFromEvolveDeck", filter: { cardNo: "BP14-019EN" } },
      0,
    );
    expect(state.players[0].zones.field).toHaveLength(1);
    const advanced = state.players[0].zones.field[0];
    expect(advanced.advancedFromEvolveDeck).toBe(true);

    const destroyed = destroyFollower(state, advanced.instanceId);
    expect(destroyed.players[0].zones.cemetery).toHaveLength(0);
    expect(destroyed.players[0].zones.evolveDeck).toHaveLength(1);
    expect(destroyed.players[0].zones.evolveDeck[0].instanceId).toBe(advanced.instanceId);
    expect(destroyed.players[0].zones.evolveDeck[0].evoSpent).toBe(true);
  });

  it("routes field-to-cemetery moves for Advanced followers to the evolve deck", () => {
    let state = createInitialGameState(0);
    const advanced = createCardInstance("BP10-004EN", 0);
    advanced.advancedFromEvolveDeck = true;
    state.players[0].zones.field.push(advanced);

    const moved = moveCard(state, advanced.instanceId, "cemetery", 0);
    expect(moved.players[0].zones.cemetery).toHaveLength(0);
    expect(
      moved.players[0].zones.evolveDeck.some((c) => c.instanceId === advanced.instanceId),
    ).toBe(true);
  });
});
