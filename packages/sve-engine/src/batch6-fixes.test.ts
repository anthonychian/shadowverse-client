import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { getEffectivePlayCost, hasKeyword } from "./state/queries";
import { queueLastWords } from "./rules/trigger-queue";

describe("batch 6 regression fixes", () => {
  beforeEach(() => resetIdCounter());

  it("nicola forbidden strength fanfare buries top 2 deck cards", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    for (let i = 0; i < 4; i++) {
      state.players[0].zones.deck.unshift(createCardInstance("MVP-012", 0));
    }
    const nicola = createCardInstance("BP07-P22EN", 0);
    state.players[0].zones.hand.push(nicola);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: nicola.instanceId });
    expect(played.ok).toBe(true);
    expect(played.state.players[0].zones.deck.length).toBe(2);
    expect(played.state.players[0].zones.cemetery.length).toBe(2);
  });

  it("stay in paradise sends unchosen cards to deck bottom", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) {
      const c = createCardInstance(i < 2 ? "BP16-022EN" : "MVP-012", 0);
      ids.push(c.instanceId);
      state.players[0].zones.deck.unshift(c);
    }
    const spell = createCardInstance("BP14-115EN", 0);
    state.players[0].zones.hand.push(spell);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("searchDeckTop");

    const skipped = applyAction(played.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { skip: true },
    });
    expect(skipped.ok).toBe(true);
    expect(skipped.state.players[0].zones.cemetery.length).toBe(1);
    expect(skipped.state.players[0].zones.deck.length).toBe(4);
    expect(
      skipped.state.players[0].zones.deck.every(
        (c) => c.cardNo === "BP16-022EN" || c.cardNo === "MVP-012",
      ),
    ).toBe(true);
  });

  it("ginne without jiemon offers all three options with max 2", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    const ginne = createCardInstance("BP16-022EN", 0);
    state.players[0].zones.hand.push(ginne);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: ginne.instanceId });
    expect(played.ok).toBe(true);
    if (played.state.pendingChoices?.type === "chooseMultiple") {
      expect(played.state.pendingChoices.options).toHaveLength(3);
      expect(played.state.pendingChoices.max).toBe(2);
    }
  });

  it("ginne resumes remaining fanfare effects after ex area trigger", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].zones.deck.push(createCardInstance("MVP-012", 0));

    const jiemon = createCardInstance("BP14-022EN", 0);
    state.players[0].zones.field.push(jiemon);
    const musician = createCardInstance("BP14-027EN", 0);
    state.players[0].zones.field.push(musician);

    const ginne = createCardInstance("BP16-022EN", 0);
    const handCard = createCardInstance("MVP-013", 0);
    state.players[0].zones.hand.push(ginne, handCard);

    const enemy = createCardInstance("MVP-002", 1);
    state.players[1].zones.field.push(enemy);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: ginne.instanceId });
    expect(played.ok).toBe(true);

    const chose = applyAction(played.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { optionIndices: [2, 1] },
    });
    expect(chose.ok).toBe(true);

    let current = chose.state;
    for (let step = 0; step < 12 && current.pendingChoices; step++) {
      if (current.pendingChoices.type === "selectTarget") {
        const resolved = applyAction(current, 0, {
          type: "CHOICE_RESPONSE",
          payload: { targetId: enemy.instanceId },
        });
        expect(resolved.ok).toBe(true);
        current = resolved.state;
      } else if (current.pendingChoices.type === "selectTrigger") {
        const resolved = applyAction(current, 0, {
          type: "CHOICE_RESPONSE",
          payload: { triggerId: current.pendingChoices.options[0].triggerId },
        });
        expect(resolved.ok).toBe(true);
        current = resolved.state;
      } else if (current.pendingChoices.type === "putHandOnDeck") {
        if (current.pendingChoices.phase === "selectCard") {
          const picked = applyAction(current, 0, {
            type: "CHOICE_RESPONSE",
            payload: { instanceId: handCard.instanceId },
          });
          expect(picked.ok).toBe(true);
          current = picked.state;
        } else {
          const finished = applyAction(current, 0, {
            type: "CHOICE_RESPONSE",
            payload: { position: "top" },
          });
          expect(finished.ok).toBe(true);
          current = finished.state;
        }
      } else {
        break;
      }
    }

    expect(current.pendingChoices).toBeNull();
    expect(current.players[0].zones.exArea.length).toBeGreaterThanOrEqual(2);
    expect(current.players[0].zones.hand.length).toBe(1);
  });

  it("hagglers gambit costs 0 with three glittering gold in ex area", () => {
    const spell = createCardInstance("BP14-035EN", 0);
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 0;
    for (let i = 0; i < 3; i++) {
      state.players[0].zones.exArea.push(createCardInstance("BP14-T02EN", 0));
    }
    state.players[0].zones.hand.push(spell);
    expect(getEffectivePlayCost(spell, spell.cardNo, state, 0, "hand")).toBe(0);
  });

  it("boxed follower does not queue last words", () => {
    let state = createInitialGameState(0);
    state.turnNumber = 5;
    const enemy = createCardInstance("MVP-002", 1);
    enemy.boxedUntilTurn = 99;
    state.players[1].zones.field.push(enemy);
    const before = state.pendingTriggers.length;
    queueLastWords(state, enemy.instanceId, 1);
    expect(state.pendingTriggers.length).toBe(before);
  });

  it("bane from passive destroys the opposing follower after combat", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const steward = createCardInstance("BP17-079EN", 0);
    steward.onFieldSinceTurnStart = true;
    const ally = createCardInstance("BP12-T10EN", 0);
    state.players[0].zones.field.push(ally, steward);

    const enemy = createCardInstance("MVP-012", 1);
    enemy.onFieldSinceTurnStart = true;
    enemy.engaged = true;
    enemy.modifiers.push({ atk: -2, def: 0, sourceId: "test" });
    state.players[1].zones.field.push(enemy);

    expect(hasKeyword(steward, "bane", state, 0)).toBe(true);

    const attack = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: steward.instanceId,
      targetId: enemy.instanceId,
    });
    expect(attack.ok).toBe(true);
    const after =
      attack.state.quickWindow === "afterAttack"
        ? applyAction(attack.state, 1, { type: "PASS_QUICK_WINDOW" }).state
        : attack.state;
    expect(after.players[1].zones.field.length).toBe(0);
  });
});
