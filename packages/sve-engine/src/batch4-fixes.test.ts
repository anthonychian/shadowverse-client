import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { getCardDef } from "./cards/registry";
import { cardIdentityKey } from "./cards/reprints";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import {
  getEffectivePlayCost,
  hasKeyword,
  resolveCardDefCost,
} from "./state/queries";

describe("batch 4 regression fixes", () => {
  beforeEach(() => resetIdCounter());

  it("treats type base as base identity even with specialType evolved", () => {
    const jiemon = getCardDef("BP14-022EN");
    expect(jiemon).toBeDefined();
    expect(cardIdentityKey(jiemon!)).toBe("Jiemon, Thief Lord|base");
    expect(resolveCardDefCost("BP14-022EN")).toBe(4);
  });

  it("unevolved promo keeps non-zero play cost", () => {
    const mono = getCardDef("BP07-SL13EN");
    expect(mono?.cost).toBe(2);
    expect(getEffectivePlayCost(createCardInstance("BP07-SL13EN", 0), "BP07-SL13EN")).toBe(2);
  });

  it("aura blocks effect targeting while reserved", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;

    const leod = createCardInstance("SDD02-006EN", 1);
    leod.engaged = false;
    state.players[1].zones.field.push(leod);

    const attacker = createCardInstance("BP17-SL20EN", 0);
    attacker.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(attacker);
    for (let i = 0; i < 2; i++) {
      state.players[0].zones.field.push(createCardInstance("BP17-083EN", 0));
    }

    const attack = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: attacker.instanceId,
      targetId: leod.instanceId,
    });
    expect(attack.ok).toBe(false);
    expect(hasKeyword(leod, "aura", state, 1)).toBe(true);
  });

  it("mono activate prompts to choose cemetery banish when more than two match", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;

    const mono = createCardInstance("BP07-SL13EN", 0);
    for (let i = 0; i < 4; i++) {
      state.players[0].zones.field.push(createCardInstance("BP17-083EN", 0));
    }
    state.players[0].zones.field.push(mono);
    for (let i = 0; i < 3; i++) {
      state.players[0].zones.cemetery.push(createCardInstance("BP17-083EN", 0));
    }

    const first = applyAction(state, 0, { type: "ACTIVATE", fieldInstanceId: mono.instanceId });
    expect(first.ok).toBe(true);
    expect(first.state.pendingChoices?.type).toBe("selectZoneCards");
    if (first.state.pendingChoices?.type === "selectZoneCards") {
      expect(first.state.pendingChoices.count).toBe(2);
    }
  });

  it("strike target choice resumes combat instead of locking phase", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const attacker = createCardInstance("BP17-SL20EN", 0);
    attacker.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(attacker);
    for (let i = 0; i < 2; i++) {
      state.players[0].zones.field.push(createCardInstance("BP17-083EN", 0));
    }

    const targetA = createCardInstance("MVP-012", 1);
    const targetB = createCardInstance("MVP-012", 1);
    targetA.engaged = true;
    targetB.engaged = true;
    state.players[1].zones.field.push(targetA, targetB);
    state.players[1].zones.hand.push(createCardInstance("BP17-T18EN", 1));
    state.players[1].pp = 1;
    state.players[1].maxPp = 1;

    const declared = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: attacker.instanceId,
      targetId: targetB.instanceId,
    });
    expect(declared.ok).toBe(true);
    expect(declared.state.pendingChoices?.type).toBe("selectTarget");
    expect(declared.state.phase).toBe("main");

    const resolved = applyAction(declared.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { targetId: targetA.instanceId },
    });
    expect(resolved.ok).toBe(true);
    expect(resolved.state.phase).toBe("main");
    expect(resolved.state.quickWindow).toBe("afterAttack");
    const afterPass = applyAction(resolved.state, 1, { type: "PASS_QUICK_WINDOW" });
    expect(afterPass.ok).toBe(true);
    expect(afterPass.state.combat).toBeNull();
  });
});
