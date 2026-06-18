import { describe, expect, it } from "vitest";
import { applyAction } from "./actions/applyAction";
import { getCardDef } from "./cards/registry";
import { runConfirmationTiming } from "./rules/confirmation";
import { queueLastWords } from "./rules/trigger-queue";
import { createInitialGameState } from "./state/factory";
import { createCardInstance } from "./state/factory";
import {
  canDeclareAttack,
  getEffectiveStats,
  getLegalAttackTargets,
  isFieldFollower,
  resolveCardDefCost,
} from "./state/queries";
import { destroyFollower } from "./state/zones";
import { createPlayerView } from "./view/filterView";

describe("abyss deck DSL", () => {
  it("registers Magitrain as an amulet with maneuver act and strike", () => {
    const def = getCardDef("BP11-T02EN")!;
    expect(def.cardType).toBe("amulet");
    expect(def.abilities?.some((a) => a.timing === "strike")).toBe(true);
    expect(def.abilities?.some((a) => a.timing === "activated")).toBe(true);
  });

  // Magitrain maneuver and Chris necrocharge: see scenarios/cards/*.yaml + scenario.test.ts

  it("evolved followers count as their base printed cost for engage costs", () => {
    expect(resolveCardDefCost("BP11-070EN")).toBe(5);
    expect(resolveCardDefCost("BP11-069EN")).toBe(5);
  });

  it("Magitrain maneuver can engage a single evolved 5-cost follower", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[1].flags.mulliganDone = true;
    state.players[0].pp = 5;

    const train = createCardInstance("BP11-T02EN", 0);
    const ices = createCardInstance("BP11-069EN", 0);
    const evoDeck = createCardInstance("BP11-070EN", 0);
    ices.linkedEvoInstanceId = evoDeck.instanceId;
    state.players[0].zones.field.push(train, ices);
    state.players[0].zones.deck.push(evoDeck);

    const activated = applyAction(state, 0, {
      type: "ACTIVATE",
      fieldInstanceId: train.instanceId,
    });
    expect(activated.ok).toBe(true);
    expect(activated.state.pendingChoices?.type).toBe("engageFollowersForCost");
    const choice = activated.state.pendingChoices!;
    if (choice.type !== "engageFollowersForCost") throw new Error("expected engage choice");
    expect(choice.options).toHaveLength(1);
    expect(choice.options[0].cost).toBe(5);

    const engaged = applyAction(activated.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [ices.instanceId] },
    });
    expect(engaged.ok).toBe(true);
    const onField = engaged.state.players[0].zones.field.find(
      (c) => c.instanceId === train.instanceId,
    )!;
    const icesOnField = engaged.state.players[0].zones.field.find(
      (c) => c.instanceId === ices.instanceId,
    )!;
    expect(isFieldFollower(engaged.state, onField)).toBe(true);
    expect(icesOnField.engaged).toBe(true);
  });

  it("Arcus cannot declare attacks", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;

    const arcus = createCardInstance("BP09-091EN", 0);
    arcus.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(arcus);

    expect(canDeclareAttack(state, arcus)).toBe(false);
    const view = createPlayerView(state, 0);
    expect(view.legalActions.some((a) => a.startsWith(`ATTACK:${arcus.instanceId}`))).toBe(
      false,
    );
  });

  it("Dead to Rights has cemetery act and quick spell", () => {
    const def = getCardDef("BP11-075EN")!;
    expect(def.abilities?.some((a) => a.activateFrom === "cemetery")).toBe(true);
    expect(def.abilities?.some((a) => a.timing === "spell" && a.quick)).toBe(true);
  });

  it("Wretch evolve requires entered from cemetery", () => {
    const def = getCardDef("BP11-076EN")!;
    const rule = def.abilities?.find((a) => a.timing === "evolve");
    expect(rule?.condition).toMatchObject({ type: "enteredFromCemetery" });
  });

  function resolveIllganeauChoices(
    state: ReturnType<typeof createInitialGameState>,
    cemeteryPickId: string,
    acceptSummon?: boolean,
  ) {
    let current = state;
    for (let step = 0; step < 12 && current.pendingChoices; step++) {
      const choice = current.pendingChoices;
      if (choice.type === "choose" && acceptSummon != null) {
        current = applyAction(current, 0, {
          type: "CHOICE_RESPONSE",
          payload: { optionIndex: acceptSummon ? 0 : 1 },
        }).state;
      } else if (choice.type === "selectZoneCard") {
        current = applyAction(current, 0, {
          type: "CHOICE_RESPONSE",
          payload: { instanceId: cemeteryPickId },
        }).state;
      } else {
        break;
      }
    }
    return current;
  }

  it("Illganeau fanfare does nothing without Necrocharge 10", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[0].pp = 5;

    const wretch = createCardInstance("BP11-076EN", 0);
    for (let i = 0; i < 4; i++) {
      state.players[0].zones.cemetery.push(createCardInstance("BP11-074EN", 0));
    }
    state.players[0].zones.cemetery.push(wretch);

    const illganeau = createCardInstance("BP11-071EN", 0);
    state.players[0].zones.exArea.push(illganeau);

    const played = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: illganeau.instanceId,
    });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices).toBeNull();
    expect(played.state.players[0].zones.cemetery.some((c) => c.instanceId === wretch.instanceId)).toBe(
      true,
    );
    expect(played.state.players[0].zones.hand.some((c) => c.instanceId === wretch.instanceId)).toBe(
      false,
    );
    expect(played.state.players[0].zones.field.some((c) => c.instanceId === illganeau.instanceId)).toBe(
      true,
    );
  });

  it("Illganeau Necrocharge optionally summons from cemetery and banishes itself", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[0].pp = 5;

    const wretch = createCardInstance("BP11-076EN", 0);
    for (let i = 0; i < 10; i++) {
      state.players[0].zones.cemetery.push(createCardInstance("BP11-074EN", 0));
    }
    state.players[0].zones.cemetery.push(wretch);

    const illganeau = createCardInstance("BP11-071EN", 0);
    state.players[0].zones.hand.push(illganeau);

    const played = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: illganeau.instanceId,
    });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("choose");

    const after = resolveIllganeauChoices(played.state, wretch.instanceId, true);
    expect(after.players[0].zones.field.some((c) => c.instanceId === wretch.instanceId)).toBe(
      true,
    );
    expect(after.players[0].zones.hand.some((c) => c.instanceId === wretch.instanceId)).toBe(
      false,
    );
    expect(after.players[0].zones.banish.some((c) => c.instanceId === illganeau.instanceId)).toBe(
      true,
    );
  });

  it("Wolfling's Struggle deals 1 damage and may discard to bury", () => {
    const def = getCardDef("BP14-T05EN")!;
    expect(def.abilities?.some((a) => a.timing === "spell")).toBe(true);

    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;

    const token = createCardInstance("BP14-T05EN", 0);
    state.players[0].zones.exArea.push(token);
    const enemy = createCardInstance("MVP-012", 1);
    enemy.onFieldSinceTurnStart = true;
    state.players[1].zones.field.push(enemy);
    const handCard = createCardInstance("MVP-013", 0);
    state.players[0].zones.hand.push(handCard);
    for (let i = 0; i < 3; i++) {
      state.players[0].zones.deck.push(createCardInstance("MVP-014", 0));
    }

    const defBefore = getEffectiveStats(enemy, state).def;
    let current = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: token.instanceId,
    }).state;

    for (let step = 0; step < 8 && current.pendingChoices; step++) {
      const choice = current.pendingChoices;
      if (choice.type === "selectTarget") {
        current = applyAction(current, 0, {
          type: "CHOICE_RESPONSE",
          payload: { targetId: enemy.instanceId },
        }).state;
      } else if (choice.type === "choose") {
        current = applyAction(current, 0, {
          type: "CHOICE_RESPONSE",
          payload: { optionIndex: 0 },
        }).state;
      } else if (choice.type === "selectZoneCards") {
        current = applyAction(current, 0, {
          type: "CHOICE_RESPONSE",
          payload: { instanceIds: [handCard.instanceId] },
        }).state;
      } else {
        break;
      }
    }

    const damaged = current.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
    expect(getEffectiveStats(damaged!, current).def).toBe(defBefore - 1);
    expect(current.players[0].zones.cemetery.some((c) => c.instanceId === handCard.instanceId)).toBe(
      true,
    );
    expect(current.players[0].zones.deck).toHaveLength(2);
  });

  it("registers Mimi and Coco token last words for Cerberus", () => {
    const mimi = getCardDef("BP16-T04EN")!;
    const coco = getCardDef("BP16-T05EN")!;
    expect(mimi.abilities?.find((a) => a.timing === "lastWords")?.effect).toMatchObject({
      op: "sequence",
      steps: [
        { op: "dealDamage", amount: 2 },
        { op: "mill", count: 1 },
      ],
    });
    expect(coco.abilities?.find((a) => a.timing === "lastWords")?.effect).toMatchObject({
      op: "sequence",
      steps: [{ op: "healLeader", amount: 2 }, { op: "mill", count: 1 }],
    });
  });

  it("Mimi last words deals 2 damage and buries", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const mimi = createCardInstance("BP16-T04EN", 0);
    state.players[0].zones.field.push(mimi);
    const enemy = createCardInstance("BP16-077EN", 1);
    enemy.onFieldSinceTurnStart = true;
    state.players[1].zones.field.push(enemy);
    for (let i = 0; i < 3; i++) {
      state.players[0].zones.deck.push(createCardInstance("MVP-014", 0));
    }

    const defBefore = getEffectiveStats(enemy, state).def;
    queueLastWords(state, mimi.instanceId, 0);
    state = runConfirmationTiming(state);

    if (state.pendingChoices?.type === "selectTarget") {
      state = applyAction(state, 0, {
        type: "CHOICE_RESPONSE",
        payload: { targetId: enemy.instanceId },
      }).state;
    }

    const damaged = state.players[1].zones.field.find((c) => c.instanceId === enemy.instanceId);
    expect(getEffectiveStats(damaged!, state).def).toBe(defBefore - 2);
    expect(state.players[0].zones.deck).toHaveLength(2);
    expect(state.players[0].zones.cemetery).toHaveLength(1);
  });

  it("Coco last words heals leader and buries", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].leaderDef = 15;

    const coco = createCardInstance("BP16-T05EN", 0);
    state.players[0].zones.field.push(coco);
    for (let i = 0; i < 3; i++) {
      state.players[0].zones.deck.push(createCardInstance("MVP-014", 0));
    }

    queueLastWords(state, coco.instanceId, 0);
    state = runConfirmationTiming(state);

    expect(state.players[0].leaderDef).toBe(17);
    expect(state.players[0].zones.deck).toHaveLength(2);
    expect(state.players[0].zones.cemetery).toHaveLength(1);
  });

  it("Mukan evolve prompts cemetery summon and summons selected Departed follower", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[0].pp = 5;
    state.players[0].evoPoints = 2;

    const mukan = createCardInstance("BP16-081EN", 0);
    mukan.onFieldSinceTurnStart = true;
    const evo = createCardInstance("BP16-082EN", 0);
    const illganeau = createCardInstance("BP11-071EN", 0);
    state.players[0].zones.field.push(mukan);
    state.players[0].zones.evolveDeck.push(evo);
    state.players[0].zones.cemetery.push(illganeau);

    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: mukan.instanceId,
      evolveDeckInstanceId: evo.instanceId,
    });
    expect(evolved.ok).toBe(true);
    expect(evolved.state.pendingChoices?.type).toBe("selectCemeterySummon");
    const cemeteryChoice = evolved.state.pendingChoices;
    if (cemeteryChoice?.type !== "selectCemeterySummon") throw new Error("expected cemetery summon");
    expect(cemeteryChoice.options.some((o) => o.instanceId === illganeau.instanceId)).toBe(true);

    const summoned = applyAction(evolved.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [illganeau.instanceId] },
    });
    expect(summoned.ok).toBe(true);
    expect(
      summoned.state.players[0].zones.field.some((c) => c.instanceId === illganeau.instanceId),
    ).toBe(true);
    expect(summoned.state.players[0].zones.cemetery.some((c) => c.instanceId === illganeau.instanceId)).toBe(
      false,
    );
  });

  it("Mukan super-evolve with SE first allows both cemetery summons", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[0].pp = 10;
    state.players[0].evoPoints = 2;
    state.players[0].superEvoPoints = 1;
    state.players[0].turnsPassed = 7;

    const mukan = createCardInstance("BP16-081EN", 0);
    mukan.onFieldSinceTurnStart = true;
    const evo = createCardInstance("BP16-082EN", 0);
    const illganeau = createCardInstance("BP11-071EN", 0);
    const wretch = createCardInstance("BP11-076EN", 0);
    state.players[0].zones.field.push(mukan);
    state.players[0].zones.evolveDeck.push(evo);
    state.players[0].zones.cemetery.push(illganeau, wretch);

    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: mukan.instanceId,
      evolveDeckInstanceId: evo.instanceId,
      useSuperEvo: true,
    });
    expect(evolved.ok).toBe(true);
    expect(evolved.state.pendingChoices?.type).toBe("chooseMultiple");

    const ordered = applyAction(evolved.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { optionIndices: [1, 0] },
    });
    expect(ordered.ok).toBe(true);
    expect(ordered.state.pendingChoices?.type).toBe("selectCemeterySummon");

    const firstSummon = applyAction(ordered.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [illganeau.instanceId] },
    });
    expect(firstSummon.ok).toBe(true);
    expect(firstSummon.state.pendingChoices?.type).toBe("selectCemeterySummon");

    const secondSummon = applyAction(firstSummon.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [wretch.instanceId] },
    });
    expect(secondSummon.ok).toBe(true);
    expect(
      secondSummon.state.players[0].zones.field.some((c) => c.instanceId === illganeau.instanceId),
    ).toBe(true);
    expect(
      secondSummon.state.players[0].zones.field.some((c) => c.instanceId === wretch.instanceId),
    ).toBe(true);
  });

  it("Mukan evolve cemetery summon can be skipped", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[0].pp = 5;
    state.players[0].evoPoints = 2;

    const mukan = createCardInstance("BP16-081EN", 0);
    mukan.onFieldSinceTurnStart = true;
    const evo = createCardInstance("BP16-082EN", 0);
    const illganeau = createCardInstance("BP11-071EN", 0);
    state.players[0].zones.field.push(mukan);
    state.players[0].zones.evolveDeck.push(evo);
    state.players[0].zones.cemetery.push(illganeau);

    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: mukan.instanceId,
      evolveDeckInstanceId: evo.instanceId,
    });
    expect(evolved.state.pendingChoices?.type).toBe("selectCemeterySummon");

    const skipped = applyAction(evolved.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [] },
    });
    expect(skipped.ok).toBe(true);
    expect(skipped.state.pendingChoices).toBeNull();
    expect(skipped.state.players[0].zones.field.some((c) => c.instanceId === illganeau.instanceId)).toBe(
      false,
    );
  });

  it("Greatpick Corpse resummons Mimi after her last words when LW is chosen first", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;

    const greatpick = createCardInstance("BP11-074EN", 0);
    const mimi = createCardInstance("BP16-T04EN", 0);
    const enemy = createCardInstance("MVP-012", 1);
    enemy.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(greatpick, mimi);
    state.players[1].zones.field.push(enemy);
    for (let i = 0; i < 3; i++) {
      state.players[0].zones.deck.push(createCardInstance("MVP-014", 0));
    }

    queueLastWords(state, mimi.instanceId, 0);
    state = destroyFollower(state, mimi.instanceId);
    state = runConfirmationTiming(state);
    expect(state.pendingChoices?.type).toBe("selectTrigger");

    const lwTrigger = state.pendingTriggers.find((t) => t.timing === "lastWords");
    expect(lwTrigger).toBeDefined();
    const picked = applyAction(state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { triggerId: lwTrigger!.id },
    });
    expect(picked.ok).toBe(true);

    let current = picked.state;
    if (current.pendingChoices?.type === "selectTarget") {
      const resolved = applyAction(current, 0, {
        type: "CHOICE_RESPONSE",
        payload: { targetId: enemy.instanceId },
      });
      expect(resolved.ok).toBe(true);
      current = resolved.state;
    }

    expect(current.players[0].zones.field.some((c) => c.cardNo === "BP16-T04EN")).toBe(true);
    expect(current.players[0].zones.banish.some((c) => c.cardNo === "BP16-T04EN")).toBe(true);
  });

  it("registers Bullet Bike and Arcane Personnel Carrier with bury-act abilities", () => {
    const bike = getCardDef("BP11-T04EN")!;
    const carrier = getCardDef("BP11-T05EN")!;
    expect(bike.cardType).toBe("amulet");
    expect(carrier.cardType).toBe("amulet");
    expect(bike.abilities?.[0]?.cost?.burySelf).toBe(true);
    expect(carrier.abilities?.[0]?.cost?.burySelf).toBe(true);
  });

  it("Bullet Bike act buries itself and gives Rush (+1 atk to Wasteland)", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[1].flags.mulliganDone = true;

    const bike = createCardInstance("BP11-T04EN", 0);
    const wasteland = createCardInstance("BP11-076EN", 0);
    state.players[0].zones.field.push(bike, wasteland);

    const activated = applyAction(state, 0, {
      type: "ACTIVATE",
      fieldInstanceId: bike.instanceId,
    });
    expect(activated.ok).toBe(true);
    expect(activated.state.pendingChoices?.type).toBe("selectTarget");
    expect(activated.state.players[0].zones.banish.some((c) => c.instanceId === bike.instanceId)).toBe(
      true,
    );

    const resolved = applyAction(activated.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { targetId: wasteland.instanceId },
    });
    expect(resolved.ok).toBe(true);
    const target = resolved.state.players[0].zones.field.find((c) => c.instanceId === wasteland.instanceId)!;
    expect(target.grantedKeywords).toContain("rush");
    expect(getEffectiveStats(target, resolved.state).atk).toBe(4);
  });

  it("Arcane Personnel Carrier act buries itself and gives Ward (+1 def to Wasteland)", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[1].flags.mulliganDone = true;

    const carrier = createCardInstance("BP11-T05EN", 0);
    const wasteland = createCardInstance("BP11-077EN", 0);
    state.players[0].zones.field.push(carrier, wasteland);

    const activated = applyAction(state, 0, {
      type: "ACTIVATE",
      fieldInstanceId: carrier.instanceId,
    });
    expect(activated.ok).toBe(true);
    expect(activated.state.pendingChoices?.type).toBe("selectTarget");
    expect(
      activated.state.players[0].zones.banish.some((c) => c.instanceId === carrier.instanceId),
    ).toBe(true);

    const resolved = applyAction(activated.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { targetId: wasteland.instanceId },
    });
    expect(resolved.ok).toBe(true);
    const target = resolved.state.players[0].zones.field.find((c) => c.instanceId === wasteland.instanceId)!;
    expect(target.grantedKeywords).toContain("ward");
    expect(getEffectiveStats(target, resolved.state).def).toBe(4);
  });
});
