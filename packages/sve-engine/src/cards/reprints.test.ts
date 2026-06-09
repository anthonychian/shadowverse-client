import { describe, expect, it } from "vitest";
import { buildReprintMap, mergePrintingWithGameplay, normalizeIdentityName } from "./reprints";
import { CardDefinition } from "../types";

describe("reprints", () => {
  it("groups alternate printings by identity name", () => {
    expect(normalizeIdentityName("Dead to Rights")).toBe("Dead to Rights");
    expect(normalizeIdentityName("Nicola, Forbidden Strength Evolved")).toBe(
      "Nicola, Forbidden Strength",
    );
  });

  it("maps promo printing to canonical gameplay source", () => {
    const cards: Record<string, CardDefinition> = {
      "BP11-075EN": {
        cardNo: "BP11-075EN",
        name: "Dead to Rights",
        class: "abyss",
        cardType: "spell",
        cost: 1,
        traits: [],
        keywords: ["quick"],
        cardText: "Quick. Deal damage.",
      },
      "SDD05-012EN": {
        cardNo: "SDD05-012EN",
        name: "Dead to Rights",
        class: "abyss",
        cardType: "spell",
        cost: 0,
        traits: [],
        keywords: [],
        cardText: "",
      },
    };
    const map = buildReprintMap(cards);
    expect(map.get("SDD05-012EN")).toBe("BP11-075EN");
  });

  it("inherits gameplay fields onto thin promo stubs", () => {
    const printing: CardDefinition = {
      cardNo: "SDD05-012EN",
      name: "Dead to Rights",
      class: "abyss",
      cardType: "spell",
      cost: 0,
      traits: [],
      keywords: [],
      cardText: "",
    };
    const gameplay: CardDefinition = {
      cardNo: "BP11-075EN",
      name: "Dead to Rights",
      class: "abyss",
      cardType: "spell",
      cost: 1,
      traits: ["Demon"],
      keywords: ["quick"],
      cardText: "Quick. Deal damage.",
      abilities: [{ timing: "spell", effect: { op: "draw", count: 1 } }],
    };
    const merged = mergePrintingWithGameplay(printing, gameplay, {
      abilities: [{ timing: "spell", effect: { op: "draw", count: 1 } }],
    });
    expect(merged.cardNo).toBe("SDD05-012EN");
    expect(merged.cost).toBe(1);
    expect(merged.cardText).toContain("Quick");
    expect(merged.abilities?.length).toBe(1);
  });
});
