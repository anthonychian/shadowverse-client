import { describe, it, expect } from "vitest";
import { detectDeckIdentity, getCardUniverseFromCardNo } from "./detectIdentity";
import { createInitialGameState, loadDecks } from "../index";

describe("detectDeckIdentity", () => {
  it("maps single-craft rune deck to Kuon", () => {
    const id = detectDeckIdentity(["BP17-041EN", "BP07-041EN"]);
    expect(id.craft).toBe("rune");
    expect(id.leader).toBe("Kuon");
  });

  it("maps single-craft sword deck to Albert", () => {
    const id = detectDeckIdentity(["BP14-018EN", "BP14-022EN"]);
    expect(id.craft).toBe("sword");
    expect(id.leader).toBe("Albert");
  });

  it("detects idolmaster universe from card numbers", () => {
    expect(getCardUniverseFromCardNo("ECP02-012EN")).toBe("idolmaster");
    const id = detectDeckIdentity(["ECP02-012EN", "ECP02-003EN"]);
    expect(id.universe).toBe("idolmaster");
    expect(id.leader).toBe("Rin");
  });
});

describe("idolmaster deck setup", () => {
  it("starts with 5 Cool Earrings in EX area", () => {
    let state = createInitialGameState(0);
    state = loadDecks(state, [
      {
        mainDeck: Array(50).fill("BP17-041EN"),
        evolveDeck: Array(10).fill("BP17-042EN"),
        universe: "idolmaster",
      },
      {
        mainDeck: Array(50).fill("BP14-018EN"),
        evolveDeck: Array(10).fill("BP14-023EN"),
      },
    ]);
    expect(state.players[0].zones.exArea).toHaveLength(5);
    expect(state.players[0].zones.exArea.every((c) => c.cardNo === "CP02-T04EN")).toBe(
      true,
    );
    expect(state.players[1].zones.exArea).toHaveLength(0);
  });
});
