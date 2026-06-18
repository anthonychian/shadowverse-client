import { beforeEach, describe, expect, it } from "vitest";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { getLegalAttackTargets } from "./state/queries";

describe("passive attack restrictions", () => {
  beforeEach(() => resetIdCounter());

  it("ward forces attacks onto engaged ward followers", () => {
    let state = createInitialGameState(0);
    const attacker = createCardInstance("MVP-013", 0);
    attacker.onFieldSinceTurnStart = true;
    const ward = createCardInstance("MVP-002", 1);
    ward.onFieldSinceTurnStart = true;
    ward.engaged = true;
    const other = createCardInstance("MVP-012", 1);
    other.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(attacker);
    state.players[1].zones.field.push(ward, other);

    const targets = getLegalAttackTargets(state, attacker, 0);
    expect(targets.some((t) => t.type === "follower" && t.instanceId === ward.instanceId)).toBe(
      true,
    );
    expect(targets.some((t) => t.type === "follower" && t.instanceId === other.instanceId)).toBe(
      false,
    );
  });
});
