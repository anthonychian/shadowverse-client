import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { beginStartPhase } from "./phases/setup";
import { getEffectiveStats } from "./state/queries";

function boardWith(attacker: string, defender: string, active: 0 | 1 = 0) {
  resetIdCounter();
  let state = createInitialGameState(0);
  state.phase = "main";
  state.activePlayer = active;
  state.turnNumber = 2;
  state.pendingChoices = null;
  const atk = createCardInstance(attacker, active);
  atk.onFieldSinceTurnStart = true;
  const def = createCardInstance(defender, active === 0 ? 1 : 0);
  def.onFieldSinceTurnStart = true;
  def.engaged = true;
    state.players[active].zones.field.push(atk);
  const defPlayer = active === 0 ? 1 : 0;
  state.players[defPlayer].zones.field.push(def);
  state.players[active].pp = 10;
  state.players[active].maxPp = 10;
  return { state, atk, def };
}

describe("combat", () => {
  beforeEach(() => resetIdCounter());

  it("ward forces attack onto engaged ward follower", () => {
    const { state, atk } = boardWith("MVP-012", "MVP-002");
    const ward = state.players[1].zones.field[0];
    ward.engaged = true;
    const result = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: atk.instanceId,
      targetId: "leader",
    });
    expect(result.ok).toBe(false);
  });

  it("storm follower can attack on same turn", () => {
    resetIdCounter();
    let state = createInitialGameState(0);
    state.phase = "main";
    state.turnNumber = 2;
    state.pendingChoices = null;
    state.players[0].turnsPassed = 1;
    const storm = createCardInstance("MVP-001", 0);
    storm.onFieldSinceTurnStart = false;
    state.players[0].zones.field.push(storm);
    const enemy = createCardInstance("MVP-012", 1);
    enemy.engaged = true;
    state.players[1].zones.field.push(enemy);
    const result = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: storm.instanceId,
      targetId: enemy.instanceId,
    });
    expect(result.ok).toBe(true);
  });

  it("deals combat damage between followers", () => {
    const { state, atk, def } = boardWith("MVP-012", "MVP-012");
    let next = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: atk.instanceId,
      targetId: def.instanceId,
    }).state;
    next = applyAction(next, 1, { type: "PASS_QUICK_WINDOW" }).state;
    next = applyAction(next, 0, { type: "END_MAIN" }).state;
    next = applyAction(next, 1, { type: "PASS_QUICK_WINDOW" }).state;
    const atkOnField = next.players[0].zones.field.find((c) => c.instanceId === atk.instanceId);
    const atkInCemetery = next.players[0].zones.cemetery.find((c) => c.instanceId === atk.instanceId);
    if (atkOnField) {
      expect(getEffectiveStats(atkOnField, next).def).toBeLessThanOrEqual(0);
    } else {
      expect(atkInCemetery).toBeTruthy();
    }
  });

  it("attacking engages the follower (no longer reserved)", () => {
    const { state, atk } = boardWith("MVP-012", "MVP-012");
    const result = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: atk.instanceId,
      targetId: "leader",
    });
    expect(result.ok).toBe(true);
    const attacker = result.state.players[0].zones.field.find((c) => c.instanceId === atk.instanceId);
    expect(attacker?.engaged).toBe(true);
  });

  it("cannot attack reserved enemy follower without assail", () => {
    const { state, atk, def } = boardWith("MVP-012", "MVP-012");
    def.engaged = false;
    const result = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: atk.instanceId,
      targetId: def.instanceId,
    });
    expect(result.ok).toBe(false);
  });

  it("assail follower can attack reserved enemy follower", () => {
    resetIdCounter();
    let state = createInitialGameState(0);
    state.phase = "main";
    state.turnNumber = 2;
    state.pendingChoices = null;
    const assail = createCardInstance("MVP-016", 0);
    assail.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(assail);
    const enemy = createCardInstance("MVP-012", 1);
    enemy.onFieldSinceTurnStart = true;
    enemy.engaged = false;
    state.players[1].zones.field.push(enemy);
    const result = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: assail.instanceId,
      targetId: enemy.instanceId,
    });
    expect(result.ok).toBe(true);
  });

  it("strike resolves before combat damage (Disciple of Usurpation)", () => {
    resetIdCounter();
    let state = createInitialGameState(0);
    state.phase = "main";
    state.turnNumber = 2;
    state.pendingChoices = null;
    const disciple = createCardInstance("BP05-025EN", 0);
    disciple.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(disciple);
    for (let i = 0; i < 10; i++) {
      state.players[1].zones.cemetery.push(createCardInstance("MVP-012", 1));
    }
    state.players[1].zones.deck.push(createCardInstance("MVP-012", 1));
    const leaderDefBefore = state.players[1].leaderDef;
    const result = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: disciple.instanceId,
      targetId: "leader",
    });
    expect(result.ok).toBe(true);
    expect(result.state.players[1].zones.cemetery.length).toBe(11);
    const attackerCard = result.state.players[0].zones.field[0];
    const atk = getEffectiveStats(attackerCard, result.state).atk;
    const after =
      result.state.quickWindow === "afterAttack"
        ? applyAction(result.state, 1, { type: "PASS_QUICK_WINDOW" }).state
        : result.state;
    expect(after.players[1].leaderDef).toBe(leaderDefBefore - atk);
  });
});
