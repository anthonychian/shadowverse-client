import { describe, expect, it } from "vitest";
import * as path from "path";
import { isFieldFollower } from "../state/queries";
import { loadScenarioFile } from "./scenario-loader";
import { runScenario } from "./scenario-runner";

const scenariosDir = path.join(__dirname, "..", "..", "scenarios");

describe("scenario harness", () => {
  it("runs Chris necrocharge scenario from YAML", () => {
    const scenario = loadScenarioFile(
      path.join(scenariosDir, "cards", "BP13-077EN-chris-necrocharge.yaml"),
    );
    const result = runScenario(scenario);
    expect(result.success).toBe(true);
    expect(result.unresolvedChoice).toBeNull();
    for (const ar of result.assertionResults) {
      expect(ar.pass, ar.message).toBe(true);
    }
  });

  it("runs Magitrain maneuver scenario from YAML", () => {
    const scenario = loadScenarioFile(
      path.join(scenariosDir, "cards", "BP11-T02EN-magitrain-maneuver.yaml"),
    );
    const result = runScenario(scenario);
    expect(result.trace.every((t) => t.ok)).toBe(true);
    const train = result.finalState.players[0].zones.field.find(
      (c) => c.cardNo === "BP11-T02EN",
    )!;
    expect(isFieldFollower(result.finalState, train)).toBe(true);
  });
});
