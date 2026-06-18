import { describe, expect, it } from "vitest";
import { runPlaySmoke, runPlaySmokeBatch } from "./testing/play-smoke-runner";

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

describe("play smoke", () => {
  it("deck cards do not play_noop on actionable timings", () => {
    const results = runPlaySmokeBatch(DECK_CARDS);
    const noops = results.filter(
      (r) => r.status === "play_noop" && r.timing !== "passive",
    );
    const unresolved = results.filter((r) => r.status === "unresolved");

    expect(
      noops.map((r) => `${r.cardNo}:${r.timing}`),
      `play_noop: ${noops.map((r) => `${r.cardNo}(${r.timing})`).join(", ")}`,
    ).toEqual([]);

    if (unresolved.length) {
      console.warn(
        "unresolved choices:",
        unresolved.map((r) => `${r.cardNo}:${r.error}`).join(", "),
      );
    }
  });

  it("BP12-041EN Sorcery in Solidarity produces state change", () => {
    const results = runPlaySmoke("BP12-041EN");
    const fanfare = results.find((r) => r.timing === "fanfare" || r.timing === "spell");
    expect(fanfare?.status).not.toBe("play_noop");
  });
});
