#!/usr/bin/env node
/**
 * Sync evalStatus in card-manifest.json from audit + play-smoke reports.
 */
const fs = require("fs");
const path = require("path");
const { runFullAudit } = require("./dsl-audit-utils");

const ROOT = path.join(__dirname, "..", "..");
const MANIFEST_PATH = path.join(ROOT, "packages", "sve-engine", "data", "card-manifest.json");
const AUDIT_PATH = path.join(ROOT, "audit-reports", "dsl-audit.json");
const PLAY_SMOKE_PATH = path.join(ROOT, "audit-reports", "play-smoke.json");
const SCENARIOS_DIR = path.join(ROOT, "packages", "sve-engine", "scenarios", "cards");
const BLOCKERS_PATH = path.join(ROOT, "packages", "sve-engine", "data", "engine-blockers.json");

function loadPlaySmoke() {
  if (!fs.existsSync(PLAY_SMOKE_PATH)) return {};
  const rows = JSON.parse(fs.readFileSync(PLAY_SMOKE_PATH, "utf8"));
  const byCard = {};
  for (const r of rows) {
    if (!byCard[r.cardNo]) byCard[r.cardNo] = [];
    byCard[r.cardNo].push(r);
  }
  return byCard;
}

function scenarioIdsForCard(cardNo) {
  if (!fs.existsSync(SCENARIOS_DIR)) return [];
  return fs
    .readdirSync(SCENARIOS_DIR)
    .filter((f) => f.includes(cardNo) && (f.endsWith(".yaml") || f.endsWith(".yml")))
    .map((f) => f.replace(/\.(yaml|yml)$/, ""));
}

function loadBlockerCardNos() {
  if (!fs.existsSync(BLOCKERS_PATH)) return new Set();
  const data = JSON.parse(fs.readFileSync(BLOCKERS_PATH, "utf8"));
  return new Set(data.vanguard?.cardNos || []);
}

function deriveEvalStatus(canonNo, auditRow, playSmokeRows, manifestEntry) {
  if (manifestEntry?.blockers?.length) return "blocked";
  if (auditRow?.exempt) return "keyword-only";

  if (!auditRow) return manifestEntry?.evalStatus || "unverified";

  const failures = auditRow?.failures || [];
  const hardFail = failures.some((f) =>
    ["missing_abilities", "timing_mismatch", "unimplemented_op"].includes(f.class),
  );
  if (hardFail) {
    if (failures.some((f) => f.class === "unimplemented_op")) return "blocked";
    return "fail";
  }

  if (failures.some((f) => f.class === "noop_inner")) return "fail";

  if (auditRow?.tier === "keyword-only" && auditRow?.abilityCount === 0) {
    return "keyword-only";
  }

  const smoke = playSmokeRows || [];
  if (smoke.some((r) => r.status === "play_noop")) return "fail";
  if (smoke.some((r) => r.status === "unresolved")) return "fail";

  return "pass";
}

function main() {
  const audit = fs.existsSync(AUDIT_PATH)
    ? JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"))
    : runFullAudit();
  if (!fs.existsSync(AUDIT_PATH)) {
    fs.mkdirSync(path.dirname(AUDIT_PATH), { recursive: true });
    fs.writeFileSync(AUDIT_PATH, JSON.stringify(audit, null, 2) + "\n");
  }

  const playSmoke = loadPlaySmoke();
  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : {};

  const auditByCanon = new Map(audit.results.map((r) => [r.canonNo, r]));
  let updated = 0;

  for (const [canonNo, row] of auditByCanon) {
    const existing = manifest[canonNo] || {};
    const evalStatus = deriveEvalStatus(canonNo, row, playSmoke[canonNo], existing);
    const scenarioIds = scenarioIdsForCard(canonNo);
    const next = {
      ...existing,
      evalStatus,
      scenarioIds: scenarioIds.length ? scenarioIds : existing.scenarioIds || [],
    };
    if (JSON.stringify(next) !== JSON.stringify(existing)) updated++;
    manifest[canonNo] = next;
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  const counts = {};
  for (const m of Object.values(manifest)) {
    const s = m.evalStatus || "unverified";
    counts[s] = (counts[s] || 0) + 1;
  }
  console.log(`Synced manifest: ${updated} entries updated`);
  console.log("evalStatus counts:", counts);
}

main();
