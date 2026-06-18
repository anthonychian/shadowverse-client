/**
 * Collect, normalize, and bucket noop labels from canonical DSL.
 */
const { buildIdentityIndex } = require("./identity-dsl");
const { loadAllExpansionCards, loadSetDefs, effectHasNoopInTree } = require("./card-dsl-utils");
const { runFullAudit } = require("./dsl-audit-utils");

const TIMING_STUB_RE = /^stub missing /i;

function normalizeLabel(label) {
  return String(label || "")
    .toLowerCase()
    .replace(/\d+/g, "N")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function bucketLabel(label) {
  const l = String(label || "").toLowerCase();
  if (TIMING_STUB_RE.test(l)) return "timing_stub";
  if (/^\(/.test(l) || /^tokens put into/i.test(l)) return "reminder_text";
  if (/\bdraw\b/.test(l)) return "draw";
  if (/\bdeal\b.*\bdamage\b|\bdamage\b/.test(l)) return "damage";
  if (/\bheal\b|\[defense\]\+|\[defense\]-|\bleader.*def/i.test(l)) return "heal_buff_leader";
  if (/\bsearch your deck\b|\btutor\b|\blook at the top\b/i.test(l)) return "search_tutor";
  if (/\bsummon\b|\bput\b.*\bonto your field\b/i.test(l)) return "summon";
  if (/\bdestroy\b|\bbanish\b|\bbury\b/i.test(l)) return "destroy_banish";
  if (/\bgive\b.*\+|buff|\[attack\]\+|\[defense\]\+/i.test(l)) return "buff";
  if (/\bdiscard\b/i.test(l)) return "discard";
  if (/\bmill\b|\bbury the top\b/i.test(l)) return "mill";
  if (/\bevolve\b/i.test(l)) return "evolve";
  if (/\bchoose\b|\bor\b.*\bor\b/i.test(l)) return "choose";
  if (/^if |^when |^whenever |^while |^at the start of/i.test(l)) return "passive_trigger";
  if (/\bselect\b/i.test(l)) return "select_target";
  if (/\bnecrocharge\b|\bearth rite\b|\bcombo\b/i.test(l)) return "condition_cost";
  if (/^activate /i.test(l)) return "parser_meta";
  return "unknown";
}

function walkNoops(effect, out) {
  if (!effect) return;
  if (effect.op === "noop") {
    out.push({ label: effect.label || "", normalized: normalizeLabel(effect.label) });
    return;
  }
  if (effect.op === "sequence") effect.steps?.forEach((s) => walkNoops(s, out));
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    effect.options?.forEach((o) => walkNoops(o.effect, out));
  }
  if (effect.op === "if") {
    walkNoops(effect.then, out);
    walkNoops(effect.else, out);
  }
  if (effect.op === "optionalCost") walkNoops(effect.then, out);
}

function collectCanonicalNoops() {
  const expansion = loadAllExpansionCards();
  const cardByNo = Object.fromEntries(expansion.map((c) => [c.cardNo, c]));
  const setDefs = loadSetDefs();
  const identityIndex = buildIdentityIndex(cardByNo, setDefs);
  const audit = runFullAudit();
  const auditByCanon = new Map(audit.results.map((r) => [r.canonNo, r]));

  const entries = [];

  for (const [key, canonNo] of identityIndex.canonicalByIdentity.entries()) {
    const def = setDefs[canonNo];
    if (!def?.abilities?.length) continue;
    if (!effectHasNoopInTree({ op: "sequence", steps: def.abilities.map((a) => a.effect) })) {
      continue;
    }
    const auditRow = auditByCanon.get(canonNo);
    if (auditRow?.exempt) continue;

    const noops = [];
    for (const ab of def.abilities) walkNoops(ab.effect, noops);

    entries.push({
      key,
      canonNo,
      name: def.name || cardByNo[canonNo]?.name || canonNo,
      tier: auditRow?.tier || "unknown",
      noopCount: noops.length,
      noops: noops.map((n) => ({
        label: n.label,
        normalized: n.normalized,
        bucket: bucketLabel(n.label),
        isTimingStub: TIMING_STUB_RE.test(n.label || ""),
      })),
    });
  }

  return { entries, audit };
}

function buildFrequencyReport() {
  const { entries, audit } = collectCanonicalNoops();

  const byNormalized = new Map();
  const byBucket = {};
  let timingStubNodes = 0;
  let parseFailNodes = 0;

  for (const entry of entries) {
    for (const n of entry.noops) {
      if (n.isTimingStub) {
        timingStubNodes++;
        continue;
      }
      parseFailNodes++;
      byBucket[n.bucket] = byBucket[n.bucket] || { count: 0, labels: new Map() };
      byBucket[n.bucket].count++;
      const prev = byNormalized.get(n.normalized) || {
        normalized: n.normalized,
        bucket: n.bucket,
        count: 0,
        sampleLabel: n.label,
        cards: [],
      };
      prev.count++;
      if (prev.cards.length < 8 && !prev.cards.includes(entry.canonNo)) {
        prev.cards.push(entry.canonNo);
      }
      byNormalized.set(n.normalized, prev);
      const bucketLabels = byBucket[n.bucket].labels;
      const bl = bucketLabels.get(n.normalized) || { ...prev, count: 0 };
      bl.count++;
      bucketLabels.set(n.normalized, bl);
    }
  }

  const topLabels = [...byNormalized.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 100);

  const bucketSummary = Object.fromEntries(
    Object.entries(byBucket)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([bucket, data]) => [
        bucket,
        {
          nodeCount: data.count,
          uniqueLabels: data.labels.size,
          topLabels: [...data.labels.values()]
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((l) => ({
              count: l.count,
              sample: l.sampleLabel?.slice(0, 120),
              cards: l.cards,
            })),
        },
      ]),
  );

  return {
    generatedAt: new Date().toISOString(),
    auditSummary: {
      total: audit.total,
      passing: audit.passing,
      failing: audit.failing,
      byClass: audit.byClass,
    },
    identityCount: entries.length,
    timingStubNodes,
    parseFailNodes,
    bucketSummary,
    topLabels: topLabels.map((l) => ({
      count: l.count,
      bucket: l.bucket,
      normalized: l.normalized,
      sample: l.sampleLabel?.slice(0, 150),
      cards: l.cards,
    })),
    entries,
  };
}

function formatReportMarkdown(report) {
  const lines = [];
  lines.push("# Noop label frequency report");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Audit snapshot");
  lines.push(`- Identities with noop_inner: **${report.identityCount}**`);
  lines.push(`- Parse-fail noop nodes: **${report.parseFailNodes}**`);
  lines.push(`- Timing-stub noop nodes: **${report.timingStubNodes}**`);
  lines.push(`- Audit: ${report.auditSummary.passing}/${report.auditSummary.total} passing`);
  lines.push("");
  lines.push("## Buckets (parse-fail nodes)");
  lines.push("");
  lines.push("| Bucket | Nodes | Unique labels |");
  lines.push("|--------|-------|---------------|");
  for (const [bucket, data] of Object.entries(report.bucketSummary)) {
    lines.push(`| ${bucket} | ${data.nodeCount} | ${data.uniqueLabels} |`);
  }
  lines.push("");
  lines.push("## Top 30 labels");
  lines.push("");
  for (const row of report.topLabels.slice(0, 30)) {
    lines.push(`### ${row.count}× — \`${row.bucket}\``);
    lines.push(`> ${row.sample}`);
    lines.push(`- Cards: ${row.cards.join(", ")}`);
    lines.push("");
  }
  lines.push("## Automation notes");
  lines.push("");
  lines.push("- Run `npm run auto:fix-noops` to re-apply pattern matchers to noop labels (unattended).");
  lines.push("- High-count buckets (`damage`, `draw`, `search_tutor`) → extend `stub-patterns.js`.");
  lines.push("- `timing_stub` nodes need implemented `[act]` effects or audit refinement.");
  lines.push("- `choose` / `unknown` → hand overrides or parser compound rules.");
  return lines.join("\n");
}

module.exports = {
  TIMING_STUB_RE,
  normalizeLabel,
  bucketLabel,
  walkNoops,
  collectCanonicalNoops,
  buildFrequencyReport,
  formatReportMarkdown,
};
