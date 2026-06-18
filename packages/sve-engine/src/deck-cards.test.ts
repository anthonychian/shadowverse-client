import { describe, it, expect, beforeEach } from "vitest";
import { execSync } from "child_process";
import * as path from "path";
import { applyAction } from "./actions/applyAction";
import { getCardDef } from "./cards/registry";
import { createCardInstance, createInitialGameState, resetIdCounter } from "./state/factory";
import { canEvolveFollower } from "./state/queries";
import { createPlayerView } from "./view/filterView";

const DECK_CARDS = [
  "BP14-018EN",
  "BP14-025EN",
  "PR-173EN",
  "BP07-075EN",
  "BP12-SL22EN",
  "BP17-113EN",
  "BP12-082EN",
  "BP17-079EN",
  "BP07-SL13EN",
  "BP07-U05EN",
  "BP14-118EN",
  "BP11-018EN",
  "BP14-023EN",
  "BP14-019EN",
  "BP14-027EN",
  "BP14-026EN",
  "BP07-047EN",
  "BP07-103EN",
  "BP12-048EN",
  "BP12-049EN",
  "BP17-049EN",
  "BP17-033EN",
  "BP17-041EN",
  "BP07-035EN",
  "BP07-037EN",
  "BP12-035EN",
  "BP17-040EN",
  "BP17-048EN",
  "BP07-041EN",
  "BP17-044EN",
  "BP12-041EN",
  "BP17-119EN",
  "BP17-050EN",
  "BP17-042EN",
  "BP07-036EN",
  "BP12-036EN",
  "BP07-069EN",
  "BP07-070EN",
  "BP12-T03EN",
  "BP12-T04EN",
];

const ROOT = path.join(__dirname, "..", "..", "..");

function runFullAudit() {
  const out = execSync(
    `node -e "console.log(JSON.stringify(require('./src/scripts/dsl-audit-utils').runFullAudit()))"`,
    { cwd: ROOT, encoding: "utf8" },
  );
  return JSON.parse(out.trim());
}

describe("deck card DSL", () => {
  beforeEach(() => resetIdCounter());

  for (const cardNo of DECK_CARDS) {
    it(`${cardNo} has abilities`, () => {
      const def = getCardDef(cardNo);
      expect(def).toBeDefined();
      expect(def?.abilities?.length).toBeGreaterThan(0);
    });
  }

  it("Taketsumi fanfare is draw-discard-gold sequence", () => {
    const def = getCardDef("BP14-018EN")!;
    const ff = def.abilities!.find((a) => a.timing === "fanfare")!;
    expect(ff.effect.op).toBe("sequence");
    if (ff.effect.op === "sequence") {
      expect(ff.effect.steps).toHaveLength(3);
    }
  });

  it("Aenea Rebel fanfare tutors Machina", () => {
    const def = getCardDef("PR-173EN")!;
    const ff = def.abilities!.find((a) => a.timing === "fanfare")!;
    expect(ff.effect).toMatchObject({
      op: "tutorFromDeck",
      filter: { trait: "Machina", maxCost: 3 },
      to: "field",
    });
  });

  it("Mono, Garnet Rebel abilities apply to all printings", () => {
    const sl = getCardDef("BP07-SL13EN")!;
    const regular = getCardDef("BP07-069EN")!;
    expect(sl.abilities?.some((a) => a.timing === "activated")).toBe(true);
    expect(regular.abilities?.some((a) => a.timing === "activated")).toBe(true);
    expect(regular.evolvesTo).toBe("BP07-070EN");
    const slEvo = getCardDef("BP07-U05EN")!;
    const regularEvo = getCardDef("BP07-070EN")!;
    expect(slEvo.abilities?.some((a) => a.timing === "activated")).toBe(true);
    expect(regularEvo.abilities?.some((a) => a.timing === "activated")).toBe(true);
  });

  it("Mono, Garnet Rebel can evolve with 5 Machina followers on field", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.turnNumber = 2;
    state.pendingChoices = null;
    state.players[0].pp = 10;
    state.players[0].evoPoints = 3;

    const mono = createCardInstance("BP07-069EN", 0);
    mono.onFieldSinceTurnStart = true;
    for (let i = 0; i < 4; i++) {
      const ally = createCardInstance("BP17-077EN", 0);
      ally.onFieldSinceTurnStart = true;
      state.players[0].zones.field.push(ally);
    }
    state.players[0].zones.field.push(mono);
    state.players[0].zones.evolveDeck.push(createCardInstance("BP07-070EN", 0));

    expect(canEvolveFollower(state, 0, mono.instanceId)).toBe(true);
    const view = createPlayerView(state, 0);
    expect(view.legalActions.some((a) => a.startsWith("EVOLVE:"))).toBe(true);
  });

  function playHeroOfTheHunt(state: ReturnType<typeof createInitialGameState>) {
    const hero = state.players[0].zones.hand.find((c) => c.cardNo === "BP14-025EN");
    const enemy = state.players[1].zones.field[0];
    const taketsumi = state.players[0].zones.deck.find((c) => c.cardNo === "BP14-018EN");
    let current = applyAction(state, 0, {
      type: "PLAY_CARD",
      handInstanceId: hero!.instanceId,
    }).state;
    for (let step = 0; step < 10 && current.pendingChoices; step++) {
      if (current.pendingChoices.type === "selectTarget") {
        current = applyAction(current, 0, {
          type: "CHOICE_RESPONSE",
          payload: { targetId: enemy.instanceId },
        }).state;
      } else if (current.pendingChoices.type === "selectZoneCard" && taketsumi) {
        current = applyAction(current, 0, {
          type: "CHOICE_RESPONSE",
          payload: { instanceId: taketsumi.instanceId },
        }).state;
      } else {
        break;
      }
    }
    return current;
  }

  it("Hero of the Hunt does not tutor Taketsumi with only 4 Festive cards before it enters cemetery", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    for (const cardNo of ["BP14-030EN", "BP14-034EN", "BP14-026EN", "BP14-118EN"]) {
      state.players[0].zones.cemetery.push(createCardInstance(cardNo, 0));
    }
    state.players[0].zones.deck.push(createCardInstance("BP14-018EN", 0));
    state.players[1].zones.field.push(createCardInstance("MVP-002", 1));
    state.players[0].zones.hand.push(createCardInstance("BP14-025EN", 0));

    const after = playHeroOfTheHunt(state);
    expect(after.players[0].zones.field.some((c) => c.cardNo === "BP14-018EN")).toBe(false);
    expect(
      after.players[0].zones.cemetery.filter((c) => getCardDef(c.cardNo)?.traits?.includes("Festive"))
        .length,
    ).toBe(5);
  });

  it("Hero of the Hunt tutors Taketsumi with 5 Festive cards already in cemetery", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].pp = 5;
    for (const cardNo of [
      "BP14-030EN",
      "BP14-034EN",
      "BP14-115EN",
      "BP14-118EN",
      "BP14-026EN",
    ]) {
      state.players[0].zones.cemetery.push(createCardInstance(cardNo, 0));
    }
    state.players[0].zones.deck.push(createCardInstance("BP14-018EN", 0));
    state.players[1].zones.field.push(createCardInstance("MVP-002", 1));
    state.players[0].zones.hand.push(createCardInstance("BP14-025EN", 0));

    const after = playHeroOfTheHunt(state);
    expect(after.players[0].zones.field.some((c) => c.cardNo === "BP14-018EN")).toBe(true);
  });

  it("Spartacus offers variable discard at start of end phase", () => {
    let state = createInitialGameState(0);
    state.phase = "main";
    state.activePlayer = 0;
    state.pendingChoices = null;
    state.players[0].flags.mulliganDone = true;
    state.players[1].flags.mulliganDone = true;

    const spartacus = createCardInstance("BP09-020EN", 0);
    spartacus.engaged = true;
    state.players[0].zones.field.push(spartacus);
    const handA = createCardInstance("MVP-012", 0);
    const handB = createCardInstance("MVP-013", 0);
    state.players[0].zones.hand.push(handA, handB);
    for (let i = 0; i < 5; i++) {
      state.players[0].zones.deck.push(createCardInstance("MVP-014", 0));
    }

    let ended = applyAction(state, 0, { type: "END_MAIN" });
    expect(ended.ok).toBe(true);
    expect(ended.state.pendingChoices?.type).toBe("discardVariable");

    const deckBefore = ended.state.players[0].zones.deck.length;
    const confirmed = applyAction(ended.state, 0, {
      type: "CHOICE_RESPONSE",
      payload: { instanceIds: [handA.instanceId] },
    });
    expect(confirmed.ok).toBe(true);
    expect(confirmed.state.players[0].zones.hand.some((c) => c.instanceId === handA.instanceId)).toBe(
      false,
    );
    expect(confirmed.state.players[0].zones.cemetery.some((c) => c.instanceId === handA.instanceId)).toBe(
      true,
    );
    expect(confirmed.state.players[0].zones.hand.length).toBe(3);
    expect(confirmed.state.players[0].zones.deck.length).toBe(deckBefore - 2);
  });

  it("deck cards pass static DSL correctness audit (structure)", () => {
    const audit = runFullAudit();
    const byCanon = new Map(audit.results.map((r: { canonNo: string }) => [r.canonNo, r]));
    const hardClasses = new Set(["missing_abilities", "timing_mismatch", "unimplemented_op"]);
    const failures: string[] = [];
    for (const cardNo of DECK_CARDS) {
      const r = byCanon.get(cardNo) as { failures?: { class: string }[] } | undefined;
      const hard = (r?.failures || []).filter((f: { class: string }) => hardClasses.has(f.class));
      if (hard.length) failures.push(`${cardNo}: ${hard.map((f: { class: string }) => f.class).join(",")}`);
    }
    expect(failures).toEqual([]);
  });
});
