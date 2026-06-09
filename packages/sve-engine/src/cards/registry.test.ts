import { describe, expect, it } from "vitest";
import { getCardDef } from "./registry";

describe("registry reprint resolution", () => {
  it("SDD05 promo reprint inherits Dead to Rights gameplay", () => {
    const def = getCardDef("SDD05-012EN");
    expect(def).toBeDefined();
    expect(def?.cardText).toContain("quick");
    expect(def?.abilities?.length).toBeGreaterThan(0);
  });

  it("keeps promo card number on the resolved definition", () => {
    const def = getCardDef("SDD05-012EN");
    expect(def?.cardNo).toBe("SDD05-012EN");
  });
});
