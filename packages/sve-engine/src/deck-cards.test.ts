import { describe, it, expect } from "vitest";
import { getCardDef } from "./cards/registry";

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
];

describe("deck card DSL", () => {
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
});
