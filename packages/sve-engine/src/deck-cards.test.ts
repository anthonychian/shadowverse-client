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
  "BP12-T03EN",
  "BP12-T04EN",
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
