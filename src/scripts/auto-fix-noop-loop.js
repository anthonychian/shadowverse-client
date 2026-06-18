#!/usr/bin/env node
/**
 * Unattended noop burn-down loop — minimal manual input required.
 *
 * Each iteration:
 *   1. Re-run pattern matchers on noop labels (auto-resolve-noop-labels)
 *   2. Re-parse noop-bearing canonical cards (fix-all-noops)
 *   3. Re-apply pattern matchers (catches newly exposed inner noops)
 *   4. Audit + noop label report
 *
 * Stops when noop_inner count plateaus or hits --target.
 *
 * Usage:
 *   npm run auto:fix-noops
 *   node src/scripts/auto-fix-noop-loop.js --max-iterations 15 --target 500
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { runFullAudit } = require("./dsl-audit-utils");
const { buildFrequencyReport } = require("./noop-label-utils");

const ROOT = path.join(__dirname, "..", "..");
const REPORT_DIR = path.join(ROOT, "audit-reports");

const maxIterations = (() => {
  const idx = process.argv.indexOf("--max-iterations");
  return idx >= 0 ? parseInt(process.argv[idx + 1], 10) : 12;
})();
const target = (() => {
  const idx = process.argv.indexOf("--target");
  return idx >= 0 ? parseInt(process.argv[idx + 1], 10) : 0;
})();

function run(cmd, label) {
  console.log(`\n>> ${label}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function noopInnerCount() {
  const audit = runFullAudit();
  return audit.byClass?.noop_inner ?? audit.failing;
}

function writeProgress(iter, noopCount, report) {
  const progress = {
    iteration: iter,
    noopInner: noopCount,
    parseFailNodes: report.parseFailNodes,
    timingStubNodes: report.timingStubNodes,
    topBuckets: Object.fromEntries(
      Object.entries(report.bucketSummary)
        .slice(0, 10)
        .map(([k, v]) => [k, v.nodeCount]),
    ),
    at: new Date().toISOString(),
  };
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORT_DIR, "auto-fix-progress.json"),
    JSON.stringify(progress, null, 2) + "\n",
  );
}

function main() {
  let prev = Infinity;
  let plateau = 0;

  console.log(`Auto-fix noop loop (max ${maxIterations} iterations, target ${target || "none"})`);

  for (let i = 1; i <= maxIterations; i++) {
    console.log(`\n========== Auto-fix iteration ${i}/${maxIterations} ==========`);

    run("node src/scripts/apply-hand-overrides.js", "hand overrides");
    run("node src/scripts/auto-resolve-noop-labels.js", "auto-resolve noop labels");
    run("node src/scripts/fix-all-noops.js", "re-parse noop-bearing cards");
    run("node src/scripts/auto-resolve-noop-labels.js", "auto-resolve (2nd pass)");
    run("node src/scripts/apply-timing-stubs.js", "apply timing stubs (structure)");

    const noopCount = noopInnerCount();
    run("node src/scripts/report-noop-labels.js", "noop label report");
    const report = buildFrequencyReport();
    writeProgress(i, noopCount, report);

    console.log(`\nnoop_inner: ${noopCount} (was ${prev === Infinity ? "?" : prev})`);

    if (target > 0 && noopCount <= target) {
      console.log(`Target ${target} reached.`);
      break;
    }
    if (noopCount === 0) {
      console.log("All noop_inner cleared.");
      break;
    }
    if (noopCount >= prev) {
      plateau++;
      if (plateau >= 2) {
        console.log("Plateau — expand stub-patterns.js using audit-reports/noop-label-report.md");
        break;
      }
    } else {
      plateau = 0;
    }
    prev = noopCount;
  }

  run("node src/scripts/apply-timing-stubs.js", "final timing stubs before tests");

  try {
    run("npm run test -w sve-engine", "engine tests");
  } catch {
    console.warn("Tests failed — review before merging.");
    process.exit(1);
  }
}

main();
