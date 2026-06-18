import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { describe, expect, it } from "vitest";

const ROOT = path.join(__dirname, "..", "..", "..");
const DECK_CARD_NOS = [
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

function runFullAudit() {
  const out = execSync(
    `node -e "console.log(JSON.stringify(require('./src/scripts/dsl-audit-utils').runFullAudit()))"`,
    { cwd: ROOT, encoding: "utf8" },
  );
  return JSON.parse(out.trim());
}

describe("DSL correctness", () => {
  it("canonical non-Vanguard identities have no missing_abilities or timing_mismatch", () => {
    const audit = runFullAudit();
    const hardClasses = new Set(["missing_abilities", "timing_mismatch"]);
    const failures = audit.failingIdentities.filter((r: { failures: { class: string }[] }) =>
      r.failures.some((f: { class: string }) => hardClasses.has(f.class)),
    );

    expect(
      failures,
      `missing/timing failures (${failures.length}): ${failures
        .slice(0, 15)
        .map((r: { canonNo: string; failures: { class: string }[] }) =>
          `${r.canonNo}[${r.failures.map((f: { class: string }) => f.class).join(",")}]`,
        )
        .join("; ")}`,
    ).toEqual([]);
  });

  it("deck regression cards pass static DSL audit", () => {
    const audit = runFullAudit();
    const byCanon = new Map(
      audit.results.map((r: { canonNo: string }) => [r.canonNo, r]),
    );
    const hardClasses = new Set(["missing_abilities", "timing_mismatch", "unimplemented_op"]);
    const deckFailures: string[] = [];
    for (const cardNo of DECK_CARD_NOS) {
      const r = byCanon.get(cardNo) as { failures?: { class: string }[] } | undefined;
      const hard = (r?.failures || []).filter((f: { class: string }) => hardClasses.has(f.class));
      if (hard.length) {
        deckFailures.push(`${cardNo}: ${hard.map((f: { class: string }) => f.class).join(", ")}`);
      }
    }
    expect(deckFailures, deckFailures.join("; ")).toEqual([]);
  });

  it("audit summary tracks noop_inner separately (warn threshold)", () => {
    const audit = runFullAudit();
    const noopCount = audit.byClass?.noop_inner ?? 0;
    expect(audit.total).toBeGreaterThan(0);
    if (noopCount > 500) {
      console.warn(`noop_inner count high: ${noopCount} — continue fix loop`);
    }
  });
});
