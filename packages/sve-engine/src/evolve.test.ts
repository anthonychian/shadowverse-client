import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { getEffectiveStats, hasKeyword } from "./state/queries";

describe("evolve", () => {
  beforeEach(() => resetIdCounter());

  function boardReadyToEvolve() {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 2;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].maxPp = 5;
    state.players[0].evoPoints = 2;
    const base = createCardInstance("MVP-013", 0);
    base.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(base);
    const evo = createCardInstance("MVP-014", 0);
    state.players[0].zones.evolveDeck.push(evo);
    return { state, base, evo };
  }

  it("links evolved card so combat uses evolved stats", () => {
    const { state, base, evo } = boardReadyToEvolve();
    state.players[0].zones.deck.push(createCardInstance("MVP-012", 0));
    const enemy = createCardInstance("MVP-023", 1);
    enemy.onFieldSinceTurnStart = true;
    enemy.engaged = true;
    state.players[1].zones.field.push(enemy);

    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: base.instanceId,
      evolveDeckInstanceId: evo.instanceId,
      useEvoPoint: false,
    });
    expect(evolved.ok).toBe(true);

    const fieldCard = evolved.state.players[0].zones.field[0];
    expect(fieldCard.linkedEvoInstanceId).toBe(evo.instanceId);
    const stats = getEffectiveStats(fieldCard, evolved.state);
    expect(stats.atk).toBe(3);
    expect(stats.def).toBe(3);

    const attack = applyAction(evolved.state, 0, {
      type: "ATTACK",
      attackerId: base.instanceId,
      targetId: enemy.instanceId,
    });
    expect(attack.ok).toBe(true);
    const after =
      attack.state.quickWindow === "afterAttack"
        ? applyAction(attack.state, 1, { type: "PASS_QUICK_WINDOW" }).state
        : attack.state;
    const damaged = after.players[1].zones.field[0];
    const enemyDef = getEffectiveStats(damaged, after).def;
    expect(enemyDef).toBe(2);
  });

  it("deducts PP for evolution", () => {
    const { state, base, evo } = boardReadyToEvolve();
    const result = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: base.instanceId,
      evolveDeckInstanceId: evo.instanceId,
      useEvoPoint: false,
    });
    expect(result.ok).toBe(true);
    expect(result.state.players[0].pp).toBe(4);
    expect(result.state.players[0].evoPoints).toBe(2);
  });

  it("can pay with an evolution point", () => {
    const { state, base, evo } = boardReadyToEvolve();
    state.players[0].pp = 0;
    const result = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: base.instanceId,
      evolveDeckInstanceId: evo.instanceId,
      useEvoPoint: true,
    });
    expect(result.ok).toBe(true);
    expect(result.state.players[0].pp).toBe(0);
    expect(result.state.players[0].evoPoints).toBe(1);
  });

  it("uses at most one evolution point per evolve", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    const base = createCardInstance("SDD02-006EN", 0);
    base.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(base);
    const evo = createCardInstance("SDD02-007EN", 0);
    state.players[0].zones.evolveDeck.push(evo);
    state.players[0].pp = 0;
    state.players[0].evoPoints = 3;

    const fail = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: base.instanceId,
      evolveDeckInstanceId: evo.instanceId,
      useEvoPoint: true,
    });
    expect(fail.ok).toBe(false);

    state.players[0].pp = 1;
    const ok = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: base.instanceId,
      evolveDeckInstanceId: evo.instanceId,
      useEvoPoint: true,
    });
    expect(ok.ok).toBe(true);
    expect(ok.state.players[0].pp).toBe(0);
    expect(ok.state.players[0].evoPoints).toBe(2);
  });

  it("evolved follower gains rush for the turn it evolves", () => {
    const { state, base, evo } = boardReadyToEvolve();
    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: base.instanceId,
      evolveDeckInstanceId: evo.instanceId,
      useEvoPoint: false,
    }).state;
    const attacker = evolved.players[0].zones.field[0];
    expect(attacker.evolvedThisTurn).toBe(true);
    expect(hasKeyword(attacker, "rush", evolved)).toBe(true);
  });
});
