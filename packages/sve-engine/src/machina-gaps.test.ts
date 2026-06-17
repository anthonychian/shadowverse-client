import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { beginStartPhase } from "./phases/setup";
import { createPlayerView } from "./view/filterView";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { getEffectivePlayCost, getEffectiveStats } from "./state/queries";

function resolveAllChoices(state: ReturnType<typeof applyAction>["state"], player: 0 | 1) {
  let current = state;
  for (let step = 0; step < 40; step++) {
    if (!current.pendingChoices) break;
    const choice = current.pendingChoices;
    if (choice.type === "selectTrigger") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { triggerId: choice.options[0].triggerId },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (choice.type === "selectTarget") {
      const target =
        choice.candidates[0]?.instanceId ??
        current.players[1].zones.field[0]?.instanceId ??
        "leader";
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { targetId: target },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (choice.type === "choose") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { optionIndex: choice.options[0].index },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (choice.type === "selectZoneCards") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: {
          instanceIds: choice.options.slice(0, choice.count).map((o) => o.instanceId),
        },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (choice.type === "selectDeckSummon") {
      const eligible = choice.options.filter((o) => o.eligible);
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { instanceIds: eligible.map((o) => o.instanceId) },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (choice.type === "searchDeckTop") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: choice.optional
          ? { skip: true }
          : { instanceId: (choice.options.find((o) => o.eligible) ?? choice.options[0]).instanceId },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    break;
  }
  return current;
}

describe("machina effect gaps", () => {
  beforeEach(() => resetIdCounter());

  it("Device Diviner heals leader once per turn when a Machina card is played", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].maxPp = 10;

    const diviner = createCardInstance("BP12-048EN", 0);
    diviner.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(diviner);

    const machinaA = createCardInstance("BP17-077EN", 0);
    const machinaB = createCardInstance("BP17-077EN", 0);
    state.players[0].zones.hand.push(machinaA, machinaB);

    const defBefore = state.players[0].leaderDef;
    const first = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: machinaA.instanceId });
    expect(first.ok).toBe(true);
    state = resolveAllChoices(first.state, 0);
    expect(state.players[0].leaderDef).toBe(defBefore + 1);

    const second = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: machinaB.instanceId });
    expect(second.ok).toBe(true);
    state = resolveAllChoices(second.state, 0);
    expect(state.players[0].leaderDef).toBe(defBefore + 1);
  });

  it("Belphomet Lord fanfare summons multiple Machina followers within total cost 6", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].maxPp = 10;

    const lord = createCardInstance("BP07-037EN", 0);
    state.players[0].zones.hand.push(lord);
    const cheapA = createCardInstance("BP17-T17EN", 0);
    const cheapB = createCardInstance("BP17-T17EN", 0);
    state.players[0].zones.deck.unshift(cheapB, cheapA);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: lord.instanceId });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("selectDeckSummon");

    state = resolveAllChoices(played.state, 0);
    const fieldNos = state.players[0].zones.field.map((c) => c.cardNo);
    expect(fieldNos).toContain("BP07-037EN");
    expect(fieldNos.filter((n) => n === "BP17-T17EN").length).toBe(2);
  });

  it("Belphomet Lord start of end buffs other Machina only", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.endStartAbilitiesQueued = false;

    const lord = createCardInstance("BP07-037EN", 0);
    lord.onFieldSinceTurnStart = true;
    const ally = createCardInstance("BP17-T17EN", 0);
    ally.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(lord, ally);

    const end = applyAction(state, 0, { type: "END_MAIN" });
    expect(end.ok).toBe(true);
    state = resolveAllChoices(end.state, 0);

    const lordStats = getEffectiveStats(
      state.players[0].zones.field.find((c) => c.cardNo === "BP07-037EN")!,
      state,
    );
    const allyStats = getEffectiveStats(
      state.players[0].zones.field.find((c) => c.cardNo === "BP17-T17EN")!,
      state,
    );
    expect(lordStats.atk).toBe(5);
    expect(allyStats.atk).toBe(2);
    expect(allyStats.def).toBe(2);
  });

  it("Belphomet Ultimate Creator buries Machina 6+ and applies conditional branches", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].maxPp = 10;

    const sixCost = createCardInstance("BP12-035EN", 0);
    sixCost.onFieldSinceTurnStart = true;
    const sevenCost = createCardInstance("BP07-037EN", 0);
    sevenCost.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(sixCost, sevenCost);

    const enemy = createCardInstance("BP17-T17EN", 1);
    enemy.onFieldSinceTurnStart = true;
    state.players[1].zones.field.push(enemy);

    const creator = createCardInstance("BP17-040EN", 0);
    state.players[0].zones.hand.push(creator);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: creator.instanceId });
    expect(played.ok).toBe(true);
    state = resolveAllChoices(played.state, 0);

    expect(state.players[0].zones.field.some((c) => c.cardNo === "BP12-T04EN")).toBe(true);
    expect(state.players[1].zones.field.some((c) => c.instanceId === enemy.instanceId)).toBe(false);
    const remainingMachina = state.players[0].zones.field.filter((c) =>
      ["BP17-040EN", "BP12-T04EN"].includes(c.cardNo),
    );
    expect(remainingMachina.length).toBeGreaterThan(0);
  });

  it("Delta Cannon in cemetery triggers with Tetra fanfare for order choice", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].maxPp = 5;

    const delta = createCardInstance("BP07-041EN", 0);
    state.players[0].zones.cemetery.push(delta);

    const tetra = createCardInstance("BP07-035EN", 0);
    state.players[0].zones.hand.push(tetra);

    const played = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: tetra.instanceId,
    });
    expect(played.ok).toBe(true);
    state = played.state;

    expect(state.pendingChoices?.type).toBe("selectTrigger");
    if (state.pendingChoices?.type !== "selectTrigger") throw new Error("expected selectTrigger");
    const labels = state.pendingChoices.options.map((o) => o.label);
    expect(labels.some((l: string) => l.includes("Fanfare"))).toBe(true);
    expect(labels.some((l: string) => l.includes("Delta Cannon"))).toBe(true);
  });

  it("Tetra Rebel Evo discounts Machina cards played from EX area by 1", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 0;
    state.players[0].maxPp = 10;

    const tetra = createCardInstance("BP07-036EN", 0);
    tetra.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(tetra);

    const assembly = createCardInstance("BP17-T18EN", 0);
    state.players[0].zones.exArea.push(assembly);

    expect(getEffectivePlayCost(assembly, "BP17-T18EN", state, 0, "exArea")).toBe(0);

    const view = createPlayerView(state, 0);
    expect(view.legalActions).toContain(`PLAY:${assembly.instanceId}`);

    const played = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: assembly.instanceId,
    });
    expect(played.ok).toBe(true);
  });

  it("Tetra Rebel Evo damages an enemy follower up to 4 times per turn when playing Machina", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].maxPp = 10;

    const tetra = createCardInstance("BP07-036EN", 0);
    tetra.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(tetra);

    const enemy = createCardInstance("BP07-037EN", 1);
    enemy.onFieldSinceTurnStart = true;
    state.players[1].zones.field.push(enemy);

    const plays = Array.from({ length: 5 }, () => createCardInstance("BP17-T18EN", 0));
    state.players[0].zones.exArea.push(...plays);

    let enemyDef = getEffectiveStats(enemy, state).def;
    for (let i = 0; i < 4; i++) {
      const card = state.players[0].zones.exArea[0];
      const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: card.instanceId });
      expect(played.ok).toBe(true);
      state = resolveAllChoices(played.state, 0);
      const enemyOnField = state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
      expect(enemyOnField).toBeTruthy();
      const newDef = getEffectiveStats(enemyOnField!, state).def;
      expect(newDef).toBe(enemyDef - 1);
      enemyDef = newDef;
    }

    const fifth = state.players[0].zones.exArea[0];
    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: fifth.instanceId });
    expect(played.ok).toBe(true);
    state = resolveAllChoices(played.state, 0);
    const enemyOnField = state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
    expect(enemyOnField).toBeTruthy();
    expect(getEffectiveStats(enemyOnField!, state).def).toBe(enemyDef);
  });

  it("Tetra Rebel Evo onCardPlayed damage resets each turn", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 1;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].maxPp = 10;

    const tetra = createCardInstance("BP07-036EN", 0);
    tetra.onFieldSinceTurnStart = true;
    tetra.counters["onCardPlayed:1"] = 4;
    state.players[0].zones.field.push(tetra);

    const enemy = createCardInstance("BP07-037EN", 1);
    enemy.onFieldSinceTurnStart = true;
    state.players[1].zones.field.push(enemy);

    state = beginStartPhase(state);
    const tetraOnField = state.players[0].zones.field.find((c) => c.cardNo === "BP07-036EN");
    expect(tetraOnField?.counters["onCardPlayed:1"]).toBeUndefined();

    const turnTwoPlay = createCardInstance("BP17-T18EN", 0);
    state.players[0].zones.exArea.push(turnTwoPlay);
    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: turnTwoPlay.instanceId });
    expect(played.ok).toBe(true);
    state = resolveAllChoices(played.state, 0);
    const enemyOnField = state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
    expect(enemyOnField).toBeTruthy();
    expect(getEffectiveStats(enemyOnField!, state).def).toBe(4);
  });

  it("Worldreaver hand activate banishes EX tokens, moves to EX, and summons a tentacle", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].maxPp = 10;

    const worldreaver = createCardInstance("BP12-035EN", 0);
    state.players[0].zones.hand.push(worldreaver);
    state.players[0].zones.exArea.push(
      createCardInstance("BP17-T17EN", 0),
      createCardInstance("BP17-T18EN", 0),
    );

    const view = createPlayerView(state, 0);
    expect(view.legalActions).toContain(`ACTIVATE_HAND:${worldreaver.instanceId}`);

    const activated = applyAction(state, 0, {
      type: "ACTIVATE_HAND",
      handInstanceId: worldreaver.instanceId,
    });
    expect(activated.ok).toBe(true);
    state = resolveAllChoices(activated.state, 0);

    expect(state.players[0].zones.exArea.some((c) => c.cardNo === "BP12-035EN")).toBe(true);
    expect(state.players[0].zones.hand.some((c) => c.cardNo === "BP12-035EN")).toBe(false);
    expect(state.players[0].zones.exArea.length).toBe(1);
    expect(
      state.players[0].zones.field.some((c) =>
        ["BP12-T03EN", "BP12-T04EN"].includes(c.cardNo),
      ),
    ).toBe(true);
  });
});
