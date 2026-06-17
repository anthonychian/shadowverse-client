import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { getCardDef } from "./cards/registry";
import { beginStartPhase } from "./phases/setup";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import {
  getActivatedAbilities,
  getEffectivePlayCost,
  hasKeyword,
  isBoxed,
} from "./state/queries";

describe("boxed and activate limits", () => {
  beforeEach(() => resetIdCounter());

  it("boxed follower loses keywords and cannot activate", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 5;
    state.pendingChoices = null;

    const naht = createCardInstance("BP11-018EN", 0);
    state.players[0].zones.field.push(naht);
    state.players[0].pp = 5;

    const enemy = createCardInstance("MVP-002", 1);
    state.players[1].zones.field.push(enemy);

    const boxedStart = applyAction(state, 0, {
      type: "ACTIVATE",
      fieldInstanceId: naht.instanceId,
    });
    expect(boxedStart.ok).toBe(true);
    expect(boxedStart.state.pendingChoices?.type).toBe("selectTarget");
    const boxed = applyAction(boxedStart.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { targetId: enemy.instanceId },
    });
    expect(boxed.ok).toBe(true);
    const enemyOnBoard = boxed.state.players[1].zones.field.find(
      (c) => c.instanceId === enemy.instanceId,
    )!;
    expect(isBoxed(enemyOnBoard, boxed.state)).toBe(true);
    expect(hasKeyword(enemyOnBoard, "ward", boxed.state, 1)).toBe(false);
    expect(getActivatedAbilities(boxed.state, enemyOnBoard, 1, "field")).toHaveLength(0);
  });

  it("once per turn activate is blocked after first use", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 2;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].maxPp = 5;

    const mono = createCardInstance("BP07-SL13EN", 0);
    for (let i = 0; i < 4; i++) {
      state.players[0].zones.field.push(createCardInstance("BP17-083EN", 0));
    }
    state.players[0].zones.field.push(mono);
    state.players[0].zones.cemetery.push(
      createCardInstance("BP17-083EN", 0),
      createCardInstance("BP17-083EN", 0),
    );

    const firstStart = applyAction(state, 0, { type: "ACTIVATE", fieldInstanceId: mono.instanceId });
    expect(firstStart.ok).toBe(true);
    expect(firstStart.state.pendingChoices?.type).toBe("selectZoneCards");
    const cemeteryIds = state.players[0].zones.cemetery.map((c) => c.instanceId);
    const first = applyAction(firstStart.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: cemeteryIds },
    });
    expect(first.ok).toBe(true);
    expect(getActivatedAbilities(first.state, mono, 0, "field")).toHaveLength(0);

    const second = applyAction(first.state, 0, { type: "ACTIVATE", fieldInstanceId: mono.instanceId });
    expect(second.ok).toBe(false);
  });

  it("play cost reduction applies from EX area", () => {
    const card = createCardInstance("BP11-P07EN", 0);
    card.playCostReduction = 1;
    const cost = getEffectivePlayCost(card, card.cardNo);
    const base = getCardDef("BP11-P07EN")?.cost ?? 0;
    expect(cost).toBe(Math.max(0, base - 1));
  });

  it("assembly droid activates when 3 Machina followers are on field", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 2;
    state.pendingChoices = null;
    state.players[0].pp = 5;

    const droids = Array.from({ length: 3 }, () => createCardInstance("BP12-T10EN", 0));
    for (const droid of droids) {
      droid.onFieldSinceTurnStart = true;
      state.players[0].zones.field.push(droid);
    }
    const enemy = createCardInstance("MVP-012", 1);
    state.players[1].zones.field.push(enemy);

    expect(getActivatedAbilities(state, droids[0], 0, "field").length).toBe(1);

    const buryPrompt = applyAction(state, 0, {
      type: "ACTIVATE",
      fieldInstanceId: droids[0].instanceId,
    });
    expect(buryPrompt.ok).toBe(true);
    expect(buryPrompt.state.pendingChoices?.type).toBe("selectZoneCards");
    const buried = applyAction(buryPrompt.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: droids.map((d) => d.instanceId) },
    });
    expect(buried.ok).toBe(true);
    expect(buried.state.pendingChoices?.type).toBe("selectTarget");
    const result = applyAction(buried.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { targetId: enemy.instanceId },
    });
    expect(result.ok).toBe(true);
    expect(result.state.players[0].zones.field.length).toBe(0);
  });

  it("boxed follower does not refresh on controller start phase", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.turnNumber = 6;
    state.activePlayer = 1;

    const enemy = createCardInstance("MVP-002", 1);
    enemy.boxedUntilTurn = 7;
    enemy.engaged = true;
    enemy.onFieldSinceTurnStart = false;
    state.players[1].zones.field.push(enemy);

    state = beginStartPhase(state);
    const onField = state.players[1].zones.field[0];
    expect(isBoxed(onField, state)).toBe(true);
    expect(onField.engaged).toBe(true);
    expect(onField.onFieldSinceTurnStart).toBe(false);
  });
});
