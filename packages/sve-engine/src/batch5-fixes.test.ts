import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { createPlayerView } from "./view/filterView";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";

describe("batch 5 regression fixes", () => {
  beforeEach(() => resetIdCounter());

  it("taketsumi fanfare summons glittering gold after discard choice", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].zones.deck.push(createCardInstance("MVP-012", 0));

    const taketsumi = createCardInstance("BP14-018EN", 0);
    const filler = createCardInstance("MVP-012", 0);
    state.players[0].zones.hand.push(taketsumi, filler);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: taketsumi.instanceId });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("selectZoneCards");

    const discarded = applyAction(played.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [filler.instanceId] },
    });
    expect(discarded.ok).toBe(true);
    expect(discarded.state.pendingChoices).toBeNull();
    expect(
      discarded.state.players[0].zones.exArea.some((c) => c.cardNo === "BP14-T02EN"),
    ).toBe(true);
  });

  it("only one evolve or advance per turn", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 2;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].evoPoints = 3;

    const first = createCardInstance("MVP-013", 0);
    first.onFieldSinceTurnStart = true;
    const second = createCardInstance("MVP-013", 0);
    second.onFieldSinceTurnStart = true;
    state.players[0].zones.field.push(first, second);
    state.players[0].zones.evolveDeck.push(
      createCardInstance("MVP-014", 0),
      createCardInstance("MVP-014", 0),
    );

    const evolved = applyAction(state, 0, {
      type: "EVOLVE",
      fieldInstanceId: first.instanceId,
      useEvoPoint: false,
    });
    expect(evolved.ok).toBe(true);
    expect(evolved.state.players[0].flags.evolvedThisTurn).toBe(true);

    const view = createPlayerView(evolved.state, 0);
    expect(view.legalActions).not.toContain(`EVOLVE:${second.instanceId}`);
    expect(view.legalActions).not.toContain(`EVOLVE_EP:${second.instanceId}`);
  });

  it("mono cemetery banish prompts when exactly two machina match", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;

    const mono = createCardInstance("BP07-SL13EN", 0);
    for (let i = 0; i < 4; i++) {
      state.players[0].zones.field.push(createCardInstance("BP17-083EN", 0));
    }
    state.players[0].zones.field.push(mono);
    for (let i = 0; i < 2; i++) {
      state.players[0].zones.cemetery.push(createCardInstance("BP17-083EN", 0));
    }

    const first = applyAction(state, 0, { type: "ACTIVATE", fieldInstanceId: mono.instanceId });
    expect(first.ok).toBe(true);
    expect(first.state.pendingChoices?.type).toBe("selectZoneCards");
  });

  it("ginne draw and put hand on deck does not loop", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    state.players[0].zones.deck.push(createCardInstance("MVP-012", 0));

    const jiemon = createCardInstance("BP14-022EN", 0);
    state.players[0].zones.field.push(jiemon);

    const ginne = createCardInstance("BP16-022EN", 0);
    const handCard = createCardInstance("MVP-013", 0);
    state.players[0].zones.hand.push(ginne, handCard);

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: ginne.instanceId });
    expect(played.ok).toBe(true);
    expect(played.state.pendingChoices?.type).toBe("chooseMultiple");

    const chose = applyAction(played.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { optionIndices: [1] },
    });
    expect(chose.ok).toBe(true);
    expect(chose.state.pendingChoices?.type).toBe("putHandOnDeck");

    const picked = applyAction(chose.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceId: handCard.instanceId },
    });
    expect(picked.ok).toBe(true);
    expect(picked.state.pendingChoices?.type).toBe("putHandOnDeck");
    if (picked.state.pendingChoices?.type === "putHandOnDeck") {
      expect(picked.state.pendingChoices.phase).toBe("selectPosition");
    }

    const finished = applyAction(picked.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { position: "top" },
    });
    expect(finished.ok).toBe(true);
    expect(finished.state.pendingChoices).toBeNull();
  });
});
