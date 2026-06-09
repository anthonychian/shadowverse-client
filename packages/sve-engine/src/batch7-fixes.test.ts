import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createPlayerView } from "./view/filterView";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { getEffectiveStats } from "./state/queries";

function passQuick(state: ReturnType<typeof applyAction>["state"], player: 0 | 1) {
  return applyAction(state, player, { type: "PASS_QUICK_WINDOW" }).state;
}

describe("batch 7 regression fixes", () => {
  beforeEach(() => resetIdCounter());

  it("dead to rights prompts for enemy follower target and applies -2/-2", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 2;
    const spell = createCardInstance("BP11-075EN", 0);
    state.players[0].zones.hand.push(spell);
    const enemy = createCardInstance("MVP-012", 1);
    state.players[1].zones.field.push(enemy);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("selectTarget");

    const resolved = applyAction(played.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { targetId: enemy.instanceId },
    });
    expect(resolved.ok).toBe(true);
    const onField = resolved.state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
    const buried = resolved.state.players[1].zones.cemetery.some((c) => c.instanceId === enemy.instanceId);
    expect(onField || buried).toBe(true);
    if (onField) {
      const stats = getEffectiveStats(onField, resolved.state);
      expect(stats.atk).toBeLessThanOrEqual(0);
      expect(stats.def).toBeLessThanOrEqual(0);
    }
  });

  it("dead to rights is not playable without enemy followers", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 2;
    const spell = createCardInstance("BP11-075EN", 0);
    state.players[0].zones.hand.push(spell);

    const view = createPlayerView(state, 0);
    expect(view.legalActions.some((a) => a === `PLAY:${spell.instanceId}`)).toBe(false);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
    expect(played.ok).toBe(false);
  });

  it("pauses combat for quick window after strikes before damage", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    const atk = createCardInstance("MVP-012", 0);
    atk.onFieldSinceTurnStart = true;
    const def = createCardInstance("MVP-012", 1);
    def.onFieldSinceTurnStart = true;
    def.engaged = true;
    state.players[0].zones.field.push(atk);
    state.players[1].zones.field.push(def);
    state.players[1].zones.hand.push(createCardInstance("BP17-T18EN", 1));
    state.players[1].pp = 1;
    state.players[1].maxPp = 1;

    const attacked = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: atk.instanceId,
      targetId: def.instanceId,
    });
    expect(attacked.ok).toBe(true);
    expect(attacked.state.quickWindow).toBe("afterAttack");
    expect(attacked.state.quickWindowPlayer).toBe(1);
    expect(attacked.state.combat?.phase).toBe("quickWindow");

    const defBefore = getEffectiveStats(def, attacked.state).def;
    const afterPass = passQuick(attacked.state, 1);
    const defAfter = afterPass.players[1].zones.field.find((c) => c.instanceId === def.instanceId);
    if (defAfter) {
      expect(getEffectiveStats(defAfter, afterPass).def).toBeLessThan(defBefore);
    }
  });

  it("offers end-phase quick window before ward engage", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    const ward = createCardInstance("MVP-002", 0);
    state.players[0].zones.field.push(ward);

    state.players[1].zones.hand.push(createCardInstance("BP17-T18EN", 1));
    state.players[1].pp = 1;
    state.players[1].maxPp = 1;

    const ended = applyAction(state, 0, { type: "END_MAIN" });
    expect(ended.ok).toBe(true);
    expect(ended.state.quickWindow).toBe("endPhase");
    expect(ended.state.quickWindowPlayer).toBe(1);
    expect(ended.state.pendingChoices).toBeNull();

    const afterPass = passQuick(ended.state, 1);
    expect(afterPass.pendingChoices?.type).toBe("wardEngage");
  });

  it("ward engage accepts multiple followers", () => {
    let state = createInitialGameState(0);
    state.phase = "end";
    state.activePlayer = 0;
    state.pendingChoices = null;
    const ward1 = createCardInstance("MVP-002", 0);
    const ward2 = createCardInstance("MVP-002", 0);
    state.players[0].zones.field.push(ward1, ward2);
    state.pendingChoices = {
      type: "wardEngage",
      player: 0,
      candidates: [
        { instanceId: ward1.instanceId, cardNo: "MVP-002", label: "Ward 1" },
        { instanceId: ward2.instanceId, cardNo: "MVP-002", label: "Ward 2" },
      ],
    };

    const engaged = applyAction(state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [ward1.instanceId, ward2.instanceId] },
    });
    expect(engaged.ok).toBe(true);
    expect(engaged.state.players[0].zones.field.every((c) => c.engaged)).toBe(true);
  });

  it("torchbearing guide does not draw until festive card is sequenced to ex area", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].zones.deck.push(createCardInstance("MVP-012", 0));

    const guide = createCardInstance("BP14-118EN", 0);
    const festive = createCardInstance("BP14-T01EN", 0);
    const other = createCardInstance("MVP-013", 0);
    state.players[0].zones.hand.push(guide, festive, other);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: guide.instanceId });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("choose");

    const pay = applyAction(played.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { optionIndex: 0 },
    });
    expect(pay.ok).toBe(true);
    expect(pay.state.pendingChoices?.type).toBe("selectZoneCard");
    expect(pay.state.players[0].zones.hand.length).toBe(2);
    expect(pay.state.players[0].zones.deck.length).toBe(1);

    const moved = applyAction(pay.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceId: festive.instanceId },
    });
    expect(moved.ok).toBe(true);
    expect(moved.state.players[0].zones.exArea.some((c) => c.instanceId === festive.instanceId)).toBe(
      true,
    );
    expect(moved.state.players[0].zones.hand.length).toBe(2);
    expect(moved.state.players[0].zones.deck.length).toBe(0);
  });
});
