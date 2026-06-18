#!/usr/bin/env node
/**
 * Audit canonical card DSL against official effect text.
 *
 * Usage:
 *   node src/scripts/audit-dsl-correctness.js
 *   node src/scripts/audit-dsl-correctness.js --identity "Arisa|base"
 *   node src/scripts/audit-dsl-correctness.js --summary
 */
const fs = require("fs");
const path = require("path");
const { runFullAudit, auditIdentity } = require("./dsl-audit-utils");
const { loadAllExpansionCards, loadSetDefs } = require("./card-dsl-utils");
const { buildIdentityIndex } = require("./identity-dsl");

const ROOT = path.join(__dirname, "..", "..");
const REPORT_DIR = path.join(ROOT, "audit-reports");
const REPORT_PATH = path.join(REPORT_DIR, "dsl-audit.json");

function main() {
  const identityFilter = (() => {
    const idx = process.argv.indexOf("--identity");
    return idx >= 0 ? process.argv[idx + 1] : null;
  })();
  const summaryOnly = process.argv.includes("--summary");

  if (identityFilter) {
    const expansion = loadAllExpansionCards();
    const cardByNo = Object.fromEntries(expansion.map((c) => [c.cardNo, c]));
    const setDefs = loadSetDefs();
    const identityIndex = buildIdentityIndex(cardByNo, setDefs);
    const canonNo = identityIndex.canonicalByIdentity.get(identityFilter);
    if (!canonNo) {
      console.error("Unknown identity:", identityFilter);
      process.exit(1);
    }
    const report = auditIdentity(
      identityFilter,
      canonNo,
      cardByNo[canonNo],
      setDefs[canonNo],
    );
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.pass ? 0 : 1);
  }

  const audit = runFullAudit();
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(audit, null, 2) + "\n");

  if (summaryOnly) {
    console.log(JSON.stringify({
      total: audit.total,
      passing: audit.passing,
      failing: audit.failing,
      byClass: audit.byClass,
    }, null, 2));
  } else {
    console.log(`DSL audit: ${audit.passing}/${audit.total} passing, ${audit.failing} failing`);
    console.log("By class:", audit.byClass);
    console.log("Top failures:");
    for (const r of audit.failingIdentities.slice(0, 15)) {
      console.log(
        `  ${r.canonNo} (${r.key}): ${r.failures.map((f) => f.class).join(", ")}`,
      );
    }
    console.log(`Wrote ${REPORT_PATH}`);
  }

  process.exit(audit.failing > 0 ? 1 : 0);
}

main();
