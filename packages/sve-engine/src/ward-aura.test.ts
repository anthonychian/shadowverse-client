import { beforeEach, describe, expect, it } from "vitest";
import { getCardDef } from "./cards/registry";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { getLegalAttackTargets, hasKeyword } from "./state/queries";

describe("ward aura", () => {
  beforeEach(() => resetIdCounter());

  it("engaged ward follower blocks leader attacks", () => {
    let state = createInitialGameState(0);
    const attacker = createCardInstance("MVP-013", 0);
    attacker.onFieldSinceTurnStart = true;
    const ward = createCardInstance("BP17-083EN", 1);
    ward.onFieldSinceTurnStart = true;
    ward.engaged = true;
    state.players[0].zones.field.push(attacker);
    state.players[1].zones.field.push(ward);
    expect(hasKeyword(ward, "ward", state, 1)).toBe(true);

    const targets = getLegalAttackTargets(state, attacker, 0);
    expect(targets.some((t) => t.type === "leader")).toBe(false);
    expect(getCardDef("BP17-083EN")?.keywords).toContain("ward");
  });
});
