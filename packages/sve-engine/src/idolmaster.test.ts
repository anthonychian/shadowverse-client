import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { getCardDef } from "./cards/registry";
import { createCardInstance, createInitialGameState, loadDecks, resetIdCounter } from "./index";

describe("idolmaster DSL", () => {
  beforeEach(() => resetIdCounter());

  it("registers Lesson fanfare on Rin Shibuya [Cinderella Girl]", () => {
    const def = getCardDef("ECP02-012EN")!;
    const ff = def.abilities!.find((a) => a.timing === "fanfare")!;
    expect(ff.effect).toMatchObject({
      op: "optionalCost",
      label: "Lesson (2)",
      cost: {
        op: "banishFromExArea",
        filter: { trait: "Magical Item" },
        count: 2,
      },
    });
  });

  it("Anastasia fanfare uses optional PP + Lesson cost", () => {
    const def = getCardDef("ECP02-001EN")!;
    const ff = def.abilities!.find((a) => a.timing === "fanfare")!;
    if (ff.effect.op !== "optionalCost") throw new Error("expected optionalCost");
    expect(ff.effect.label).toBe("[cost01], Lesson (1)");
    if (ff.effect.cost.op !== "sequence") throw new Error("expected sequence cost");
    expect(ff.effect.then).toMatchObject({
      op: "selectFromHand",
      playCostReduction: 2,
    });
  });

  it("Kako [Lady Luck] Evolved rolls a die on evolve", () => {
    const def = getCardDef("ECP02-066EN")!;
    const evo = def.abilities!.find((a) => a.timing === "onEvolve")!;
    expect(evo.effect).toMatchObject({ op: "rollDie", sides: 6 });
  });

  it("Karen Hojo [Cinderella Girl] last words summons Cool Earrings to EX", () => {
    const def = getCardDef("ECP02-016EN")!;
    const lw = def.abilities!.find((a) => a.timing === "lastWords")!;
    expect(lw.effect).toMatchObject({
      op: "summon",
      tokenCardNo: "CP02-T04EN",
      zone: "exArea",
    });
  });

  it("Cool Earrings is a Magical Item for Lesson costs", () => {
    const token = getCardDef("CP02-T04EN")!;
    expect(token.traits).toContain("Magical Item");
  });

  it("Ranko fanfare prompts to destroy a chosen enemy follower", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;

    const ranko = createCardInstance("ECP02-047EN", 0);
    const enemyA = createCardInstance("MVP-012", 1);
    const enemyB = createCardInstance("MVP-013", 1);
    enemyA.onFieldSinceTurnStart = true;
    enemyB.onFieldSinceTurnStart = true;
    state.players[1].zones.field.push(enemyA, enemyB);
    state.players[0].zones.hand.push(ranko);

    const played = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: ranko.instanceId,
    });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("selectTarget");
    if (played.state.pendingChoices?.type !== "selectTarget") return;
    expect(played.state.pendingChoices.candidates).toHaveLength(2);

    const destroyed = applyAction(played.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { targetId: enemyB.instanceId },
    });
    expect(destroyed.ok).toBe(true);
    expect(destroyed.state.players[1].zones.field.some((c) => c.instanceId === enemyA.instanceId)).toBe(
      true,
    );
    expect(destroyed.state.players[1].zones.field.some((c) => c.instanceId === enemyB.instanceId)).toBe(
      false,
    );
  });

  it("idolmaster universe starts with Magical Items in EX", () => {
    let state = createInitialGameState(0);
    state = loadDecks(state, [
      {
        mainDeck: Array(40).fill("ECP02-012EN"),
        evolveDeck: Array(10).fill("ECP02-002EN"),
        universe: "idolmaster",
      },
      { mainDeck: Array(40).fill("MVP-012"), evolveDeck: [] },
    ]);
    expect(state.players[0].zones.exArea).toHaveLength(5);
    expect(state.players[0].zones.exArea.every((c) => c.cardNo === "CP02-T04EN")).toBe(true);
  });
});
