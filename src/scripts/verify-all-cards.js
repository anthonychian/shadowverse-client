#!/usr/bin/env node
/**
 * Correctness verification loop: audit → fix → verify (no prune-all-noops by default).
 *
 * Usage:
 *   node src/scripts/verify-all-cards.js
 *   node src/scripts/verify-all-cards.js --max-iterations 5
 *   node src/scripts/verify-all-cards.js --audit-only
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { runFullAudit } = require("./dsl-audit-utils");

const ROOT = path.join(__dirname, "..", "..");
const REPORT_DIR = path.join(ROOT, "audit-reports");
const AUDIT_PATH = path.join(REPORT_DIR, "dsl-audit.json");
const PLAY_SMOKE_PATH = path.join(REPORT_DIR, "play-smoke.json");

const maxIterations = (() => {
  const idx = process.argv.indexOf("--max-iterations");
  return idx >= 0 ? parseInt(process.argv[idx + 1], 10) : 8;
})();
const auditOnly = process.argv.includes("--audit-only");
const withPrune = process.argv.includes("--with-prune");

function run(cmd, label) {
  console.log(`\n>> ${label}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function writeAuditReport() {
  const audit = runFullAudit();
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(AUDIT_PATH, JSON.stringify(audit, null, 2) + "\n");
  console.log(
    `Audit: ${audit.passing}/${audit.total} passing, failing=${audit.failing}`,
    audit.byClass,
  );
  return audit;
}

function runPlaySmokeReport() {
  if (!fs.existsSync(path.join(ROOT, "packages", "sve-engine", "dist", "index.js"))) {
    run("npm run build -w sve-engine", "build engine for play-smoke");
  }
  const deckCards = [
    "BP14-018EN", "BP14-025EN", "PR-173EN", "BP07-075EN", "BP12-SL22EN",
    "BP17-113EN", "BP12-082EN", "BP17-079EN", "BP07-SL13EN", "BP07-U05EN",
    "BP14-118EN", "BP11-018EN", "BP14-023EN", "BP14-019EN", "BP14-027EN",
    "BP14-026EN", "BP07-047EN", "BP07-103EN", "BP12-048EN", "BP12-049EN",
    "BP17-049EN", "BP17-033EN", "BP17-041EN", "BP07-035EN", "BP07-037EN",
    "BP12-035EN", "BP17-040EN", "BP17-048EN", "BP07-041EN", "BP17-044EN",
    "BP12-041EN", "BP17-119EN", "BP17-050EN", "BP17-042EN", "BP07-036EN",
    "BP12-036EN", "BP07-069EN", "BP07-070EN", "BP12-T03EN", "BP12-T04EN",
  ];
  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  const failingCanon = audit.failingIdentities
    .filter((r) => r.failures.some((f) => f.class === "missing_abilities"))
    .slice(0, 100)
    .map((r) => r.canonNo);
  const cardNos = [...new Set([...deckCards, ...failingCanon])];

  const runnerPath = path.join(ROOT, "src", "scripts", "_run-play-smoke-temp.js");
  fs.writeFileSync(
    runnerPath,
    `const { runPlaySmokeBatch } = require(${JSON.stringify(path.join(ROOT, "packages", "sve-engine", "dist", "index.js"))});
const cardNos = ${JSON.stringify(cardNos)};
const results = runPlaySmokeBatch(cardNos);
console.log(JSON.stringify(results));
`,
  );
  const out = execSync(`node "${runnerPath}"`, { cwd: ROOT, encoding: "utf8" });
  fs.unlinkSync(runnerPath);
  const results = JSON.parse(out.trim());
  fs.writeFileSync(PLAY_SMOKE_PATH, JSON.stringify(results, null, 2) + "\n");
  const noops = results.filter((r) => r.status === "play_noop");
  console.log(`Play-smoke: ${results.length} checks, ${noops.length} play_noop`);
  return results;
}

function main() {
  let prevFailing = Infinity;

  for (let i = 1; i <= maxIterations; i++) {
    console.log(`\n========== Verify iteration ${i}/${maxIterations} ==========`);

    if (!auditOnly) {
      run("node src/scripts/apply-hand-overrides.js", "apply hand overrides");
      run("node src/scripts/tag-vanguard-cards.js", "tag Vanguard deferrals");
      run("node src/scripts/fix-all-noops.js --all", "re-parse all canonical printings");
      if (withPrune) {
        run("node src/scripts/prune-all-noops.js", "prune-all-noops (optional)");
      }
      run("node src/scripts/apply-timing-stubs.js", "apply timing stubs");
    run("node src/scripts/fix-review-stubs.js", "fix-review-stubs");
    }

    const audit = writeAuditReport();
    if (audit.failing === 0) {
      console.log("Static audit clean.");
      break;
    }

    if (audit.failing >= prevFailing && i > 1) {
      console.log("No audit improvement this iteration.");
      break;
    }
    prevFailing = audit.failing;

    if (auditOnly) break;
  }

  run("npm run build -w sve-engine", "build engine");
  try {
    runPlaySmokeReport();
  } catch (e) {
    console.warn("Play-smoke report skipped:", e.message);
  }
  run("node src/scripts/sync-eval-status.js", "sync eval status");
  run("node src/scripts/generate-manifest.js", "generate manifest");

  try {
    run("npm run test -w sve-engine", "engine tests");
  } catch {
    console.error("Engine tests failed.");
    process.exit(1);
  }

  const final = runFullAudit();
  console.log(`\nFinal audit: ${final.passing}/${final.total} passing`);
  console.log("By class:", final.byClass);
}

main();
