#!/usr/bin/env node
/**
 * Generate noop label frequency report for parser prioritization.
 *
 * Usage:
 *   node src/scripts/report-noop-labels.js
 *   node src/scripts/report-noop-labels.js --json-only
 */
const fs = require("fs");
const path = require("path");
const { buildFrequencyReport, formatReportMarkdown } = require("./noop-label-utils");

const ROOT = path.join(__dirname, "..", "..");
const REPORT_DIR = path.join(ROOT, "audit-reports");
const JSON_PATH = path.join(REPORT_DIR, "noop-label-report.json");
const MD_PATH = path.join(REPORT_DIR, "noop-label-report.md");

function main() {
  const jsonOnly = process.argv.includes("--json-only");
  const report = buildFrequencyReport();

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(MD_PATH, formatReportMarkdown(report) + "\n");

  if (jsonOnly) {
    console.log(JSON.stringify({
      identityCount: report.identityCount,
      parseFailNodes: report.parseFailNodes,
      timingStubNodes: report.timingStubNodes,
      buckets: Object.fromEntries(
        Object.entries(report.bucketSummary).map(([k, v]) => [k, v.nodeCount]),
      ),
    }, null, 2));
  } else {
    console.log(`Wrote ${JSON_PATH}`);
    console.log(`Wrote ${MD_PATH}`);
    console.log(
      `Identities: ${report.identityCount}, parse-fail nodes: ${report.parseFailNodes}, timing stubs: ${report.timingStubNodes}`,
    );
    console.log("Top buckets:");
    for (const [bucket, data] of Object.entries(report.bucketSummary).slice(0, 8)) {
      console.log(`  ${bucket}: ${data.nodeCount} nodes`);
    }
  }
}

main();
