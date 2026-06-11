import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createPlayerView } from "./view/filterView";
import { runConfirmationTiming } from "./rules/confirmation";
import { resolveEffect } from "./effects/resolver";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { queueLastWords } from "./rules/trigger-queue";
import { beginStartPhase } from "./phases/setup";
import { getCardDef } from "./cards/registry";
import { getActivatedAbilities, getEffectivePlayCost, getEffectiveStats } from "./state/queries";

function resolveAllChoices(state: ReturnType<typeof applyAction>["state"], player: 0 | 1) {
  let current = state;
  for (let step = 0; step < 30; step++) {
    if (!current.pendingChoices) break;
    if (current.pendingChoices.type === "selectTrigger") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { triggerId: current.pendingChoices.options[0].triggerId },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (current.pendingChoices.type === "selectTarget") {
      const enemy = current.players[1].zones.field.find((c) =>
        current.pendingChoices?.type === "selectTarget"
          ? current.pendingChoices.candidates.some(
              (x) => (typeof x === "string" ? x : x.instanceId) === c.instanceId,
            )
          : false,
      );
      expect(enemy).toBeTruthy();
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { targetId: enemy!.instanceId },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (current.pendingChoices.type === "choose") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { optionIndex: 1 },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (current.pendingChoices.type === "chooseMultiple") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { optionIndices: [0, 1] },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (current.pendingChoices.type === "selectZoneCard") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: { instanceId: current.pendingChoices.options[0].instanceId },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    if (current.pendingChoices.type === "selectZoneCards") {
      const resolved = applyAction(current, player, {
        type: "CHOICE_RESPONSE",
        payload: {
          instanceIds: current.pendingChoices.options
            .slice(0, current.pendingChoices.count)
            .map((o) => o.instanceId),
        },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
      continue;
    }
    break;
  }
  return current;
}

describe("batch 8 regression fixes", () => {
  beforeEach(() => resetIdCounter());

  it("masterful musician triggers twice when two glittering gold enter ex area", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const musician = createCardInstance("BP14-027EN", 0);
    state.players[0].zones.field.push(musician);
    const enemyA = createCardInstance("MVP-012", 1);
    const enemyB = createCardInstance("MVP-012", 1);
    enemyA.onFieldSinceTurnStart = true;
    enemyB.onFieldSinceTurnStart = true;
    enemyA.engaged = true;
    enemyB.engaged = true;
    state.players[1].zones.field.push(enemyA, enemyB);
    const leaderDefBefore = state.players[1].leaderDef;

    state = resolveEffect(
      state,
      { op: "summon", tokenCardNo: "BP14-T02EN", count: 2, zone: "exArea" },
      0,
      { deferConfirmation: true },
    );
    expect(state.pendingTriggers.length).toBe(2);
    state = runConfirmationTiming(state);

    state = resolveAllChoices(state, 0);
    expect(state.pendingTriggers.length).toBe(0);
    expect(state.pendingChoices).toBeNull();
    expect(state.players[1].leaderDef).toBe(leaderDefBefore - 2);
  });

  it("ginne resumes second chosen effect after ex area triggers", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].zones.deck.push(createCardInstance("MVP-012", 0));

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

    let current = resolveAllChoices(chose.state, 0);
    for (let step = 0; step < 24 && current.pendingChoices?.type === "putHandOnDeck"; step++) {
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
    }
    current = resolveAllChoices(current, 0);

    expect(current.players[0].zones.exArea.length).toBeGreaterThanOrEqual(2);
    expect(current.players[0].zones.hand.length).toBe(1);
    expect(current.pendingChoices).toBeNull();
  });

  it("queues last words for each follower destroyed at zero defense", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const wielderA = createCardInstance("PR-358EN", 0);
    const wielderB = createCardInstance("PR-358EN", 0);
    wielderA.modifiers.push({ def: -2, sourceId: "test" });
    wielderB.modifiers.push({ def: -2, sourceId: "test" });
    state.players[0].zones.field.push(wielderA, wielderB);

    state = runConfirmationTiming(state);
    expect(state.pendingTriggers.filter((t) => t.timing === "lastWords")).toHaveLength(2);
  });

  it("nicola enduring steward last words discounts ex area play cost", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].maxPp = 5;

    const nicola = createCardInstance("BP17-079EN", 0);
    const m1 = createCardInstance("BP12-T10EN", 0);
    const m2 = createCardInstance("BP17-T17EN", 0);
    state.players[0].zones.hand.push(m1, m2);
    state.players[0].zones.cemetery.push(nicola);

    queueLastWords(state, nicola.instanceId, 0);
    state = runConfirmationTiming(state);
    expect(state.pendingChoices?.type).toBe("choose");

    const pay = applyAction(state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { optionIndex: 0 },
    });
    expect(pay.ok).toBe(true);
    expect(pay.state.pendingChoices?.type).toBe("selectZoneCards");

    const paid = applyAction(pay.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [m1.instanceId, m2.instanceId] },
    });
    expect(paid.ok).toBe(true);
    state = paid.state;

    const inEx = state.players[0].zones.exArea.find((c) => c.instanceId === nicola.instanceId);
    expect(inEx).toBeTruthy();
    expect(inEx?.persistentPlayCostReduction).toBe(1);
    expect(inEx?.playCostReduction).toBe(0);
    expect(getEffectivePlayCost(inEx!, "BP17-079EN", state, 0, "exArea")).toBe(1);

    const nextTurn = beginStartPhase(structuredClone(state));
    expect(nextTurn.players[0].zones.exArea[0]?.persistentPlayCostReduction).toBe(1);
    expect(nextTurn.players[0].zones.exArea[0]?.playCostReduction).toBe(0);
    expect(getEffectivePlayCost(inEx!, "BP17-079EN", nextTurn, 0, "exArea")).toBe(1);

    const played = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: nicola.instanceId,
    });
    expect(played.ok).toBe(true);
    expect(played.state.players[0].pp).toBe(4);
  });

  it("taketsumi advance requires festive or swordcraft cards in cemetery", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 10;

    const taketsumi = createCardInstance("BP14-018EN", 0);
    taketsumi.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(taketsumi);

    expect(getActivatedAbilities(state, taketsumi, 0, "field")).toHaveLength(0);
    expect(createPlayerView(state, 0).legalActions.some((a) => a.startsWith("ACTIVATE:"))).toBe(
      false,
    );

    for (let i = 0; i < 5; i++) {
      state.players[0].zones.cemetery.push(createCardInstance("BP14-T01EN", 0));
    }
    expect(getActivatedAbilities(state, taketsumi, 0, "field")).toHaveLength(1);

    const activated = applyAction(state, 0, {
      type: "ACTIVATE",
      fieldInstanceId: taketsumi.instanceId,
    });
    expect(activated.ok).toBe(true);
  });

  it("super evolve triggers onSuperEvolve effects", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.turnNumber = 8;
    state.players[0].turnsPassed = 7;
    state.players[0].pp = 5;
    state.players[0].superEvoPoints = 1;

    const base = createCardInstance("BP17-077EN", 0);
    base.onFieldSinceTurnStart = true;
    const evo = createCardInstance("BP17-078EN", 0);
    const machinaInCemetery = createCardInstance("BP12-T10EN", 0);
    state.players[0].zones.field.push(base);
    state.players[0].zones.evolveDeck.push(evo);
    state.players[0].zones.cemetery.push(machinaInCemetery);

    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: base.instanceId,
      evolveDeckInstanceId: evo.instanceId,
      useSuperEvo: true,
      useEvoPoint: false,
    });
    expect(evolved.ok).toBe(true);
    const resolved = resolveAllChoices(evolved.state, 0);
    expect(resolved.players[0].zones.exArea.some((c) => c.cardNo === "BP12-T10EN")).toBe(true);
    const tutored = resolved.players[0].zones.exArea.find((c) => c.cardNo === "BP12-T10EN");
    expect(tutored?.playCostReduction).toBe(3);
    expect(tutored?.persistentPlayCostReduction).toBe(0);

    const afterEndTurn = applyAction(resolved, 0, { type: "END_MAIN" }).state;
    const tutoredNextTurn = afterEndTurn.players[0].zones.exArea.find(
      (c) => c.cardNo === "BP12-T10EN",
    );
    expect(tutoredNextTurn?.playCostReduction).toBe(0);
    expect(getEffectivePlayCost(tutoredNextTurn!, "BP12-T10EN", afterEndTurn, 0, "exArea")).toBe(
      getCardDef("BP12-T10EN")?.cost ?? 0,
    );
  });

  it("front desk frog auto-evolve links stats and triggers on evolve", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;

    const jiemon = createCardInstance("BP14-022EN", 0);
    jiemon.onFieldSinceTurnStart = true;
    const frog = createCardInstance("BP14-030EN", 0);
    const enemy = createCardInstance("MVP-012", 1);
    enemy.onFieldSinceTurnStart = true;
    enemy.engaged = true;
    state.players[0].zones.field.push(jiemon);
    state.players[1].zones.field.push(enemy);
    state.players[0].zones.hand.push(frog);
    state.players[0].zones.evolveDeck.push(createCardInstance("BP14-031EN", 0));

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: frog.instanceId });
    expect(played.ok).toBe(true);

    const fieldFrog = played.state.players[0].zones.field.find((c) => c.cardNo === "BP14-030EN");
    expect(fieldFrog?.linkedEvoInstanceId).toBeTruthy();
    expect(getEffectiveStats(fieldFrog!, played.state).atk).toBe(3);

    const resolved = resolveAllChoices(played.state, 0);
    expect(resolved.players[1].zones.field.length).toBe(0);
  });

  it("steeled hopes defers fanfare until all three deck summons finish", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 7;

    const aenea = createCardInstance("PR-173EN", 0);
    const machina2 = createCardInstance("BP12-T10EN", 0);
    const machina3 = createCardInstance("BP17-T17EN", 0);
    state.players[0].zones.deck.push(aenea, machina2, machina3);

    const spell = createCardInstance("BP17-080EN", 0);
    state.players[0].zones.hand.push(spell);

    let current = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
    expect(current.ok).toBe(true);
    current = applyAction(current.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { optionIndex: 1 },
    });
    expect(current.ok).toBe(true);
    expect(current.state.pendingChoices?.type).toBe("selectZoneCard");

    const firstPick = applyAction(current.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceId: aenea.instanceId },
    });
    expect(firstPick.ok).toBe(true);
    expect(firstPick.state.players[0].zones.field.length).toBe(1);
    expect(firstPick.state.pendingTriggers.some((t) => t.timing === "fanfare")).toBe(true);
    expect(firstPick.state.pendingChoices?.type).toBe("selectZoneCard");

    const finished = resolveAllChoices(firstPick.state, 0);
    expect(finished.players[0].zones.field.length).toBe(3);
    expect(finished.pendingTriggers.some((t) => t.timing === "fanfare")).toBe(false);
  });

  it("steeled hopes option 2 requires 6 additional PP and summons three followers", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 6;
    state.players[0].zones.deck.push(
      createCardInstance("BP12-T10EN", 0),
      createCardInstance("BP17-T17EN", 0),
      createCardInstance("PR-170EN", 0),
    );
    const spell = createCardInstance("BP17-080EN", 0);
    state.players[0].zones.hand.push(spell);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: spell.instanceId });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("choose");
    if (played.state.pendingChoices?.type === "choose") {
      expect(played.state.pendingChoices.options.some((o) => o.additionalPpCost === 6)).toBe(
        false,
      );
    }

    const spell2 = createCardInstance("BP17-080EN", 0);
    state.players[0].pp = 7;
    state.players[0].zones.hand.push(spell2);
    const played2 = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: spell2.instanceId });
    expect(played2.ok).toBe(true);
    if (played2.state.pendingChoices?.type === "choose") {
      expect(played2.state.pendingChoices.options.some((o) => o.additionalPpCost === 6)).toBe(true);
    }

    const chose = applyAction(played2.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { optionIndex: 1 },
    });
    expect(chose.ok).toBe(true);
    expect(chose.state.players[0].pp).toBe(0);
    const finished = resolveAllChoices(chose.state, 0);
    expect(finished.players[0].zones.field.length).toBe(3);
  });

  it("burying followers from field triggers their last words", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    const leaderBefore = state.players[0].leaderDef;

    const droid = createCardInstance("BP12-T10EN", 0);
    droid.onFieldSinceTurnStart = true;
    const rebel = createCardInstance("PR-173EN", 0);
    const allyA = createCardInstance("BP17-T17EN", 0);
    const allyB = createCardInstance("PR-170EN", 0);
    state.players[0].zones.field.push(droid, rebel, allyA, allyB);

    const activated = applyAction(state, 0, {
      type: "ACTIVATE",
      fieldInstanceId: droid.instanceId,
    });
    expect(activated.ok).toBe(true);
    expect(activated.state.pendingChoices?.type).toBe("selectZoneCards");

    const buried = applyAction(activated.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: {
        instanceIds: [rebel.instanceId, allyA.instanceId, allyB.instanceId],
      },
    });
    expect(buried.ok).toBe(true);
    expect(buried.state.players[0].leaderDef).toBe(leaderBefore + 2);
  });

  it("bane destroys damage-capped followers after combat", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const steward = createCardInstance("BP17-079EN", 0);
    steward.onFieldSinceTurnStart = true;
    const ally = createCardInstance("BP12-T10EN", 0);
    const aenea = createCardInstance("BP17-077EN", 1);
    const capped = createCardInstance("BP12-082EN", 1);
    capped.onFieldSinceTurnStart = true;
    capped.engaged = true;
    state.players[0].zones.field.push(ally, steward);
    state.players[1].zones.field.push(aenea, capped);

    const attack = applyAction(state, 0, {
      type: "ATTACK",
      attackerId: steward.instanceId,
      targetId: capped.instanceId,
    });
    expect(attack.ok).toBe(true);
    const after =
      attack.state.quickWindow === "afterAttack"
        ? applyAction(attack.state, 1, { type: "PASS_QUICK_WINDOW" }).state
        : attack.state;
    expect(after.players[1].zones.field.some((c) => c.instanceId === capped.instanceId)).toBe(
      false,
    );
  });

  it("jiemon evolved search puts unselected cards on deck bottom not cemetery", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 2;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].evoPoints = 2;

    const festive1 = createCardInstance("BP14-030EN", 0);
    const festive2 = createCardInstance("BP14-034EN", 0);
    const festive3 = createCardInstance("BP14-035EN", 0);
    const nonFestive = createCardInstance("MVP-012", 0);
    const festive4 = createCardInstance("BP14-118EN", 0);
    state.players[0].zones.deck.push(festive1, festive2, nonFestive, festive3, festive4);

    state.players[0].zones.exArea.push(
      createCardInstance("BP14-T02EN", 0),
      createCardInstance("BP14-T02EN", 0),
    );

    const jiemonBase = createCardInstance("BP14-022EN", 0);
    jiemonBase.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(jiemonBase);
    state.players[0].zones.evolveDeck.push(createCardInstance("BP14-023EN", 0));

    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: jiemonBase.instanceId,
      useEvoPoint: false,
    });
    expect(evolved.ok).toBe(true);
    expect(evolved.state.pendingChoices?.type).toBe("searchDeckTop");

    const cemeteryBefore = evolved.state.players[0].zones.cemetery.length;

    const picked = applyAction(evolved.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceId: festive1.instanceId },
    });
    expect(picked.ok).toBe(true);
    expect(picked.state.players[0].zones.exArea.some((c) => c.instanceId === festive1.instanceId)).toBe(
      true,
    );
    expect(picked.state.players[0].zones.cemetery.length).toBe(cemeteryBefore);
    expect(picked.state.players[0].zones.deck.length).toBe(4);

    const deckIds = picked.state.players[0].zones.deck.map((c) => c.instanceId);
    expect(deckIds).toEqual(
      expect.arrayContaining([
        festive2.instanceId,
        nonFestive.instanceId,
        festive3.instanceId,
        festive4.instanceId,
      ]),
    );
  });
});
