import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createPlayerView } from "./view/filterView";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { getEffectiveStats, hasKeyword } from "./state/queries";

function passQuick(state: ReturnType<typeof applyAction>["state"], player: 0 | 1) {
  return applyAction(state, player, { type: "PASS_QUICK_WINDOW" }).state;
}

describe("batch 9 regression fixes", () => {
  beforeEach(() => resetIdCounter());

  it("bane destroys the defender even when the bane attacker dies to combat damage", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const baneOneOne = createCardInstance("BP17-079EN", 0);
    baneOneOne.modifiers.push({ atk: 0, def: 0, sourceId: "test" });
    const ally = createCardInstance("BP12-T10EN", 0);
    state.players[0].zones.field.push(ally, baneOneOne);
    baneOneOne.onFieldSinceTurnStart = true;

    const enemy = createCardInstance("MVP-012", 1);
    enemy.onFieldSinceTurnStart = true;
    enemy.engaged = true;
    state.players[1].zones.field.push(enemy);

    expect(hasKeyword(baneOneOne, "bane", state, 0)).toBe(true);

    const attack = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: baneOneOne.instanceId,
      targetId: enemy.instanceId,
    });
    expect(attack.ok).toBe(true);
    const after =
      attack.state.quickWindow === "afterAttack" ? passQuick(attack.state, 1) : attack.state;
    expect(after.players[1].zones.field.length).toBe(0);
  });

  it("skips after-attack quick window when opponent has no playable quick cards", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const atk = createCardInstance("MVP-013", 0);
    atk.onFieldSinceTurnStart = true;
    const def = createCardInstance("MVP-012", 1);
    def.onFieldSinceTurnStart = true;
    def.engaged = true;
    state.players[0].zones.field.push(atk);
    state.players[1].zones.field.push(def);

    const attack = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: atk.instanceId,
      targetId: def.instanceId,
    });
    expect(attack.ok).toBe(true);
    expect(attack.state.quickWindow).toBeNull();
    expect(attack.state.combat).toBeNull();
  });

  it("start of end abilities resolve before the opponent end-phase quick window", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const leod = createCardInstance("SDD02-006EN", 0);
    leod.onFieldSinceTurnStart = true;
    const enemy = createCardInstance("MVP-012", 1);
    enemy.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(leod);
    state.players[1].zones.field.push(enemy);
    state.players[1].zones.hand.push(createCardInstance("BP17-T18EN", 1));
    state.players[1].pp = 1;
    state.players[1].maxPp = 1;

    const enemyDefBefore = getEffectiveStats(enemy, state).def;
    let ended = applyAction(state, 0, { type: "END_MAIN" });
    expect(ended.ok).toBe(true);
    if (ended.state.pendingChoices?.type === "selectTarget") {
      ended = applyAction(ended.state, 0, {
        type: "CHOICE_RESPONSE",
        payload: { targetId: enemy.instanceId },
      });
      expect(ended.ok).toBe(true);
    }
    expect(ended.state.quickWindow).toBe("endPhase");
    const damaged = ended.state.players[1].zones.field[0];
    expect(getEffectiveStats(damaged, ended.state).def).toBeLessThan(enemyDefBefore);
  });

  it("super evolve prompts effect order when both on evolve and on super evolve exist", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.turnNumber = 8;
    state.players[0].turnsPassed = 7;
    state.players[0].pp = 5;
    state.players[0].superEvoPoints = 1;
    state.players[0].zones.deck.push(createCardInstance("BP17-083EN", 0));
    state.players[0].zones.cemetery.push(createCardInstance("BP12-T10EN", 0));

    const base = createCardInstance("BP17-077EN", 0);
    base.onFieldSinceTurnStart = true;
    const evo = createCardInstance("BP17-078EN", 0);
    state.players[0].zones.field.push(base);
    state.players[0].zones.evolveDeck.push(evo);

    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: base.instanceId,
      evolveDeckInstanceId: evo.instanceId,
      useSuperEvo: true,
      useEvoPoint: false,
    });
    expect(evolved.ok).toBe(true);
    expect(evolved.state.pendingChoices?.type).toBe("chooseMultiple");
  });

  it("allows evolve while engaged", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 2;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].evoPoints = 2;

    const base = createCardInstance("MVP-013", 0);
    base.onFieldSinceTurnStart = true;
    base.engaged = true;
    state.players[0].zones.field.push(base);
    state.players[0].zones.evolveDeck.push(createCardInstance("MVP-014", 0));

    const view = createPlayerView(state, 0);
    expect(view.legalActions.includes(`EVOLVE:${base.instanceId}`)).toBe(true);

    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: base.instanceId,
      useEvoPoint: false,
    });
    expect(evolved.ok).toBe(true);
    expect(evolved.state.players[0].zones.field[0].engaged).toBe(true);
  });

  it("allows non-engage activate while engaged", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const jiemon = createCardInstance("BP11-018EN", 0);
    jiemon.onFieldSinceTurnStart = true;
    jiemon.engaged = true;
    state.players[0].zones.field.push(jiemon);

    const enemy = createCardInstance("MVP-012", 1);
    enemy.onFieldSinceTurnStart = true;
    enemy.engaged = true;
    state.players[1].zones.field.push(enemy);

    const view = createPlayerView(state, 0);
    expect(view.legalActions.includes(`ACTIVATE:${jiemon.instanceId}`)).toBe(true);

    const activated = applyAction(state, 0, {
      type: "ACTIVATE",
      fieldInstanceId: jiemon.instanceId,
    });
    expect(activated.ok).toBe(true);
    expect(activated.state.pendingChoices?.type).toBe("selectTarget");
    expect(activated.state.players[0].zones.field[0].engaged).toBe(true);
  });

  it("blocks engage-cost activate while already engaged", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const soot = createCardInstance("BP14-019EN", 0);
    soot.onFieldSinceTurnStart = true;
    soot.engaged = true;
    state.players[0].zones.field.push(soot);

    const enemy = createCardInstance("MVP-012", 1);
    enemy.onFieldSinceTurnStart = true;
    enemy.engaged = true;
    state.players[1].zones.field.push(enemy);

    const view = createPlayerView(state, 0);
    expect(view.legalActions.includes(`ACTIVATE:${soot.instanceId}`)).toBe(false);

    const activated = applyAction(state, 0, {
      type: "ACTIVATE",
      fieldInstanceId: soot.instanceId,
    });
    expect(activated.ok).toBe(false);
  });

  it("plays glittering gold from ex area for 0 pp as a no-op spell", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 0;

    const gold = createCardInstance("BP14-T02EN", 0);
    state.players[0].zones.exArea.push(gold);

    const view = createPlayerView(state, 0);
    expect(view.legalActions.includes(`PLAY:${gold.instanceId}`)).toBe(true);

    const played = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: gold.instanceId,
    });
    expect(played.ok).toBe(true);
    expect(played.state.players[0].zones.exArea.length).toBe(0);
    expect(played.state.players[0].zones.banish.some((c) => c.instanceId === gold.instanceId)).toBe(
      true,
    );
    expect(played.state.players[0].pp).toBe(0);
  });

  it("offers quick play from EX area during quick window", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.quickWindow = "endPhase";
    state.quickWindowPlayer = 1;
    state.pendingChoices = null;
    state.players[1].pp = 1;

    const quickSpell = createCardInstance("BP17-T18EN", 1);
    state.players[1].zones.exArea.push(quickSpell);

    const view = createPlayerView(state, 1);
    expect(view.legalActions).toContain(`QUICK_PLAY:${quickSpell.instanceId}`);
    expect(view.legalActions).toContain("PASS_QUICK_WINDOW");

    const played = applyAction(state, 1, {
      type: "QUICK_PLAY",
      handInstanceId: quickSpell.instanceId,
    });
    expect(played.ok).toBe(true);
    expect(played.state.players[1].zones.exArea.some((c) => c.instanceId === quickSpell.instanceId)).toBe(
      false,
    );
    expect(played.state.quickWindow).toBe("endPhase");
    expect(played.state.quickWindowPlayer).toBe(1);

    const afterPlayView = createPlayerView(played.state, 1);
    expect(afterPlayView.legalActions).toContain("PASS_QUICK_WINDOW");
    expect(afterPlayView.legalActions.some((a) => a.startsWith("QUICK_PLAY:"))).toBe(false);

    const passed = applyAction(played.state, 1, { type: "PASS_QUICK_WINDOW" });
    expect(passed.ok).toBe(true);
    expect(passed.state.quickWindow).toBeNull();
  });

  it("always offers end quick phase while in quick window", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.quickWindow = "endPhase";
    state.quickWindowPlayer = 1;
    state.pendingChoices = null;

    const view = createPlayerView(state, 1);
    expect(view.legalActions).toContain("PASS_QUICK_WINDOW");

    state.players[1].zones.hand.push(createCardInstance("BP17-T18EN", 1));
    state.players[1].pp = 1;
    const viewWithQuick = createPlayerView(state, 1);
    expect(viewWithQuick.legalActions).toContain("PASS_QUICK_WINDOW");
    expect(viewWithQuick.legalActions.some((a) => a.startsWith("QUICK_PLAY:"))).toBe(true);
  });

  it("clears end-phase quick window immediately when opponent passes", () => {
    let state = createInitialGameState(0);
    state.phase = "end";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.quickWindow = "endPhase";
    state.quickWindowPlayer = 1;
    state.endPhaseQuickResolved = false;
    state.players[0].flags.endStartAbilitiesQueued = true;

    const passed = applyAction(state, 1, { type: "PASS_QUICK_WINDOW" });
    expect(passed.ok).toBe(true);
    expect(passed.state.quickWindow).toBeNull();
  });

  it("does not block END_MAIN after the opponent end-phase quick window was resolved", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 3;
    state.pendingChoices = null;
    state.quickWindow = "endPhase";
    state.quickWindowPlayer = 1;
    state.endPhaseQuickResolved = true;
    state.players[0].flags.endStartAbilitiesQueued = false;

    const ended = applyAction(state, 0, { type: "END_MAIN" });
    expect(ended.ok).toBe(true);
    expect(ended.state.quickWindow).toBeNull();
  });
});
