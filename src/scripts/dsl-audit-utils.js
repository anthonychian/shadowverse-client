/**
 * Shared helpers for DSL correctness auditing (text vs DSL structure).
 */
const fs = require("fs");
const path = require("path");
const { buildIdentityIndex, cardIdentityKey } = require("./identity-dsl");
const {
  VANGUARD_RE,
  loadAllExpansionCards,
  loadSetDefs,
  effectHasNoopInTree,
  isVanguardCard,
} = require("./card-dsl-utils");

const ROOT = path.join(__dirname, "..", "..");
const BLOCKERS_PATH = path.join(ROOT, "packages", "sve-engine", "data", "engine-blockers.json");

const TEXT_TO_TIMING = [
  { re: /\[fanfare\]/i, timing: "fanfare" },
  { re: /\[lastwords?\]/i, timing: "lastWords" },
  { re: /\[act\]/i, timing: "activated" },
  { re: /on evolve/i, timing: "onEvolve" },
  { re: /\[strike\]/i, timing: "strike" },
  { re: /on super-?evolve/i, timing: "onSuperEvolve" },
];

const KEYWORD_ONLY_RE =
  /^(?:ward|storm|rush|bane|drain|ambush|intimidate|barrier|aura|stack)\.?$/i;

function officialText(card) {
  return card?.details?.effect || card?.cardText || "";
}

function complexityTier(text) {
  if (!text || text === "(no text)") return "unknown";
  if (isKeywordOnlyText(text)) return "keyword-only";
  const t = text.toLowerCase();
  if (!/\[fanfare\]|\[lastwords?\]|\[act\]|on evolve|strike|necrocharge|choose/i.test(t)) {
    return "keyword-only";
  }
  if (/\bchoose\b|\bor\b|if |instead/i.test(t)) return "complex";
  if (/\[fanfare\]|\[lastwords?\]|\[act\]|on evolve/i.test(t)) return "simple";
  return "keyword-only";
}

function isKeywordOnlyText(text) {
  const stripped = String(text || "")
    .replace(/\[evolve\]\s*\[cost\d+\]:[^\n]*/gi, "")
    .replace(/\[ride\][^\n]*/gi, "")
    .replace(/\[feed\][^\n]*/gi, "")
    .trim();
  if (!stripped) return true;
  const parts = stripped.split(/\.\s+/).filter(Boolean);
  return parts.length > 0 && parts.every((p) => KEYWORD_ONLY_RE.test(p.trim()));
}

function textSectionForPrinting(text, printingType, cardName) {
  const t = String(text || "");
  const isEvolved =
    printingType === "evolved" ||
    (printingType !== "base" && printingType !== "token" && /\s+Evolved$/i.test(cardName || ""));
  const evolveIdx = t.search(/\[evolve\]/i);
  if (isEvolved) {
    if (evolveIdx >= 0) return t.slice(evolveIdx);
    return t;
  }
  if (evolveIdx >= 0) return t.slice(0, evolveIdx);
  return t;
}

function extractTextTimings(text, printingType, cardName, cardType) {
  const section = textSectionForPrinting(text, printingType, cardName);
  const timings = new Set();
  if (/\[fanfare\]/i.test(section)) timings.add("fanfare");
  if (/\[lastwords?\]/i.test(section)) timings.add("lastWords");
  if (/\[act\]/i.test(section)) timings.add("activated");
  if (/on evolve/i.test(section)) timings.add("onEvolve");
  if (/\[strike\]/i.test(section)) timings.add("strike");
  if (/on super-?evolve/i.test(section)) timings.add("onSuperEvolve");
  const isSpell = cardType === "spell" || cardType === "Spell";
  if (
    isSpell &&
    !/\[fanfare\]/i.test(section) &&
    !/\[lastwords?\]/i.test(section) &&
    section.trim().length > 10
  ) {
    timings.add("spell");
  }
  return [...timings];
}

function abilityTimings(def) {
  const timings = new Set();
  for (const a of def?.abilities || []) {
    if (a.timing === "spell") timings.add("spell");
    else if (a.timing) timings.add(a.timing);
  }
  return [...timings];
}

function effectIsEffectivelyEmpty(effect) {
  if (!effect) return true;
  if (effect.op === "noop") return true;
  if (effect.op === "sequence") {
    const steps = effect.steps || [];
    return steps.length === 0 || steps.every(effectIsEffectivelyEmpty);
  }
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    return (effect.options || []).every((o) => effectIsEffectivelyEmpty(o.effect));
  }
  if (effect.op === "if") {
    return effectIsEffectivelyEmpty(effect.then) && effectIsEffectivelyEmpty(effect.else);
  }
  if (effect.op === "optionalCost") return effectIsEffectivelyEmpty(effect.then);
  if (effect.op === "passiveKeywords" && !(effect.keywords?.length)) return true;
  return false;
}

function hasNoopInner(def) {
  if (!def?.abilities?.length) return false;
  if (def.abilities.every((a) => effectIsEffectivelyEmpty(a.effect))) return true;
  return def.abilities.some((a) => effectHasNoopInTree(a.effect));
}

function loadBlockerOps() {
  const ops = new Set();
  if (!fs.existsSync(BLOCKERS_PATH)) return ops;
  const data = JSON.parse(fs.readFileSync(BLOCKERS_PATH, "utf8"));
  for (const p of data.primitives || []) {
    if (p.status !== "implemented") ops.add(p.id);
  }
  for (const v of data.vanguard?.cardNos || []) {
    ops.add(`vanguard:${v}`);
  }
  return ops;
}

function collectOps(effect, out = new Set()) {
  if (!effect) return out;
  if (effect.op) out.add(effect.op);
  if (effect.op === "sequence") effect.steps?.forEach((s) => collectOps(s, out));
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    effect.options?.forEach((o) => collectOps(o.effect, out));
  }
  if (effect.op === "if") {
    collectOps(effect.then, out);
    collectOps(effect.else, out);
  }
  if (effect.op === "optionalCost") {
    collectOps(effect.cost, out);
    collectOps(effect.then, out);
  }
  return out;
}

function auditIdentity(key, canonNo, card, setDef) {
  const text = officialText(card);
  const tier = complexityTier(text);
  const failures = [];
  const printingType = setDef?.printingType || card?.printingType || "base";
  const cardType = setDef?.cardType || card?.type || card?.cardType;

  if (setDef?.parseConfidence === "vanguard-deferred" || (card && isVanguardCard(card))) {
    return { key, canonNo, name: setDef?.name || card?.name, tier, failures, exempt: true };
  }

  const abilities = setDef?.abilities || [];
  const textTimings = extractTextTimings(text, printingType, setDef?.name || card?.name, cardType);
  const dslTimings = abilityTimings(setDef);

  if (tier !== "keyword-only" && !isKeywordOnlyText(text) && abilities.length === 0) {
    failures.push({ class: "missing_abilities", detail: "substantive text but no abilities" });
  }

  if (isKeywordOnlyText(text) && tier !== "keyword-only" && tier !== "unknown" && abilities.length === 0) {
    failures.push({ class: "keyword_only_misclassified", detail: `tier=${tier}` });
  } else if (isKeywordOnlyText(text) && abilities.length === 0 && (tier === "keyword-only" || tier === "unknown")) {
    // keyword-only with no abilities is acceptable
  }

  for (const tt of textTimings) {
    if (tt === "spell") {
      const hasSpell = abilities.some((a) => a.timing === "spell");
      const isFollower = card?.type === "follower" || setDef?.cardType === "follower";
      if (!hasSpell && !isFollower && abilities.length === 0) {
        failures.push({ class: "timing_mismatch", detail: `text implies spell, DSL missing spell timing` });
      }
    } else if (!dslTimings.includes(tt)) {
      failures.push({ class: "timing_mismatch", detail: `text has ${tt}, DSL missing timing:${tt}` });
    }
  }

  if (abilities.length > 0 && hasNoopInner(setDef)) {
    failures.push({ class: "noop_inner", detail: "ability tree contains noop or empty effect" });
  }

  const blockedOps = loadBlockerOps();
  for (const a of abilities) {
    for (const op of collectOps(a.effect)) {
      if (blockedOps.has(op)) {
        failures.push({ class: "unimplemented_op", detail: `uses blocked op: ${op}` });
      }
    }
  }

  return {
    key,
    canonNo,
    name: setDef?.name || card?.name,
    tier,
    textTimings,
    dslTimings,
    abilityCount: abilities.length,
    failures,
    exempt: false,
    pass: failures.length === 0,
  };
}

function runFullAudit() {
  const expansion = loadAllExpansionCards();
  const cardByNo = Object.fromEntries(expansion.map((c) => [c.cardNo, c]));
  const setDefs = loadSetDefs();
  const identityIndex = buildIdentityIndex(cardByNo, setDefs);

  const results = [];
  const byClass = {};

  for (const [key, canonNo] of identityIndex.canonicalByIdentity.entries()) {
    const card = cardByNo[canonNo];
    const setDef = setDefs[canonNo];
    const report = auditIdentity(key, canonNo, card, setDef);
    if (report.exempt) continue;
    results.push(report);
    for (const f of report.failures) {
      byClass[f.class] = (byClass[f.class] || 0) + 1;
    }
  }

  results.sort((a, b) => b.failures.length - a.failures.length);

  const failing = results.filter((r) => !r.pass);
  return {
    generatedAt: new Date().toISOString(),
    total: results.length,
    passing: results.filter((r) => r.pass).length,
    failing: failing.length,
    byClass,
    results,
    failingIdentities: failing.map((r) => ({
      key: r.key,
      canonNo: r.canonNo,
      name: r.name,
      failures: r.failures,
    })),
  };
}

module.exports = {
  officialText,
  complexityTier,
  isKeywordOnlyText,
  extractTextTimings,
  abilityTimings,
  effectIsEffectivelyEmpty,
  hasNoopInner,
  auditIdentity,
  runFullAudit,
  TEXT_TO_TIMING,
  ensureTimingStubs,
};

function ensureTimingStubs(card, setDef, abilities) {
  const text = officialText(card);
  const printingType = setDef?.printingType || card?.printingType || "base";
  const cardType = setDef?.cardType || card?.type || card?.cardType;
  const needed = extractTextTimings(text, printingType, setDef?.name || card?.name, cardType);
  const out = [...(abilities || [])];
  const existing = new Set(out.map((a) => a.timing));
  for (const timing of needed) {
    if (existing.has(timing)) continue;
    out.push({
      timing,
      effect: { op: "noop", label: `stub missing ${timing} timing` },
    });
    existing.add(timing);
  }
  return out;
}
