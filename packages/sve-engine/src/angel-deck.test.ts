import { describe, expect, it, beforeEach } from "vitest";
import { applyAction } from "./actions/applyAction";
import { getCardDef } from "./cards/registry";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { getLegalAttackTargets, isFieldFollower } from "./state/queries";
import { createPlayerView } from "./view/filterView";

function mainWithCard(cardNo: string, player: 0 | 1 = 0) {
  const state = createInitialGameState(0);
  state.phase = "main";
  state.pendingChoices = null;
  state.players[0].flags.mulliganDone = true;
  state.players[1].flags.mulliganDone = true;
  const card = createCardInstance(cardNo, player, player);
  state.players[player].zones.hand.push(card);
  state.players[player].pp = 10;
  state.players[player].maxPp = 10;
  state.phase = "main";
  state.activePlayer = player;
  return { state, card };
}

describe("angel deck DSL", () => {
  beforeEach(() => resetIdCounter());

  it("registers Fount of Angels as an amulet with fanfare search and bury act", () => {
    const def = getCardDef("BP09-137EN")!;
    expect(def.cardType).toBe("amulet");
    expect(def.abilities?.some((a) => a.timing === "fanfare")).toBe(true);
    expect(def.abilities?.some((a) => a.timing === "activated")).toBe(true);
  });

  it("amulets on field are not legal attack targets", () => {
    const state = createInitialGameState(0);
    state.phase = "main";
    state.pendingChoices = null;
    const amulet = createCardInstance("BP09-137EN", 1, 1);
    const attacker = createCardInstance("BP01-159EN", 0, 0);
    attacker.engaged = false;
    attacker.onFieldSinceTurnStart = true;
    state.players[1].zones.field.push(amulet);
    state.players[0].zones.field.push(attacker);
    state.phase = "main";
    state.activePlayer = 0;

    expect(isFieldFollower(state, amulet)).toBe(false);
    const targets = getLegalAttackTargets(state, attacker, 0);
    expect(targets.some((t) => t.type === "follower")).toBe(false);
  });

  it("Planetary Fracture banishes field, EX, and top 10 of each deck", () => {
    const { state, card } = mainWithCard("BP13-107EN");
    state.players[0].pp = 8;
    state.players[0].zones.field.push(createCardInstance("BP01-159EN", 0, 0));
    state.players[1].zones.field.push(createCardInstance("BP10-115EN", 1, 1));
    state.players[0].zones.exArea.push(createCardInstance("BP14-T02EN", 0, 0));
    for (let i = 0; i < 12; i++) {
      state.players[0].zones.deck.push(createCardInstance("BP01-159EN", 0, 0));
      state.players[1].zones.deck.push(createCardInstance("BP10-115EN", 1, 1));
    }

    const played = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: card.instanceId });
    expect(played.ok).toBe(true);
    expect(played.state.players[0].zones.field).toHaveLength(0);
    expect(played.state.players[1].zones.field).toHaveLength(0);
    expect(played.state.players[0].zones.exArea).toHaveLength(0);
    expect(played.state.players[0].zones.banish.length).toBeGreaterThanOrEqual(11);
    expect(played.state.players[1].zones.banish.length).toBeGreaterThanOrEqual(11);
  });

  it("Angel's Blessing is a quick spell", () => {
    const def = getCardDef("BP14-110EN")!;
    const spell = def.abilities?.find((a) => a.timing === "spell");
    expect(spell?.quick).toBe(true);
    expect(spell?.effect).toMatchObject({
      op: "sequence",
      steps: [{ op: "healLeader", amount: 2 }, { op: "draw", count: 2 }],
    });
  });

  it("Clash of Heroes is playable when both fields have followers", () => {
    const { state, card } = mainWithCard("BP06-112EN");
    state.players[0].zones.field.push(createCardInstance("BP01-159EN", 0, 0));
    state.players[1].zones.field.push(createCardInstance("BP10-115EN", 1, 1));
    const view = createPlayerView(state, 0);
    expect(view.legalActions).toContain(`PLAY:${card.instanceId}`);
  });
});
