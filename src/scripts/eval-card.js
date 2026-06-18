#!/usr/bin/env node
/**
 * Generate LLM evaluation packets for card behavior verification.
 *
 * Usage:
 *   node src/scripts/eval-card.js BP13-077EN
 *   node src/scripts/eval-card.js BP13-077EN --scenario chris-necrocharge-ward
 *   node src/scripts/eval-card.js --set BP13 --inventory
 *   node src/scripts/eval-card.js --validate-scenarios
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const ENGINE_DIST = path.join(ROOT, "packages", "sve-engine", "dist");
const SCENARIOS_DIR = path.join(ROOT, "packages", "sve-engine", "scenarios");
const MANIFEST_PATH = path.join(ROOT, "packages", "sve-engine", "data", "card-manifest.json");
const REPORTS_DIR = path.join(ROOT, "eval-reports");
const SCRIPTS_DIR = path.join(__dirname);

function loadEngine() {
  const {
    getCardDef,
    runScenario,
    loadScenarioFile,
    findScenariosForCard,
    listAllScenarioFiles,
    runPlaySmoke,
  } = require(ENGINE_DIST);
  return { getCardDef, runScenario, loadScenarioFile, findScenariosForCard, listAllScenarioFiles, runPlaySmoke };
}

function loadExpansionCards() {
  const cards = {};
  for (const file of fs.readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith("-cards.json"))) {
    const list = JSON.parse(fs.readFileSync(path.join(SCRIPTS_DIR, file), "utf8"));
    for (const c of list) cards[c.cardNo] = c;
  }
  return cards;
}

function cardSetPrefix(cardNo) {
  const m = String(cardNo).match(/^([A-Z]+\d+)/);
  return m ? m[1] : "OTHER";
}

function officialText(cardNo, expansionCards) {
  const c = expansionCards[cardNo];
  if (!c) return "(not in expansion scrape)";
  return c.details?.effect || c.cardText || "(no text)";
}

function complexityTier(text) {
  if (!text || text === "(no text)") return "unknown";
  const t = text.toLowerCase();
  if (!/\[fanfare\]|\[lastwords\]|\[act\]|on evolve|strike|necrocharge|choose/i.test(t)) {
    return "keyword-only";
  }
  if (/\bchoose\b|\bor\b|if |instead/i.test(t)) return "complex";
  if (/\[fanfare\]|\[lastwords\]|\[act\]|on evolve/i.test(t)) return "simple";
  return "keyword-only";
}

function formatScenarioResult(result) {
  const lines = [];
  lines.push(`- **Success:** ${result.success}`);
  if (result.unresolvedChoice) lines.push(`- **Unresolved choice:** ${result.unresolvedChoice}`);
  lines.push("- **Action trace:**");
  for (const t of result.trace) {
    const label = JSON.stringify(t.action);
    lines.push(`  - [${t.ok ? "ok" : "FAIL"}] ${label}${t.error ? ` — ${t.error}` : ""}`);
  }
  lines.push("- **Assertions:**");
  for (const a of result.assertionResults) {
    lines.push(`  - [${a.pass ? "pass" : "FAIL"}] ${a.assertion.type}: ${a.message}`);
  }
  if (result.stateDiff && result.stateDiff !== "(no changes)") {
    lines.push("- **State diff:**");
    lines.push("```");
    lines.push(result.stateDiff);
    lines.push("```");
  }
  return lines.join("\n");
}

function buildEvalPacket(cardNo, options = {}) {
  const { getCardDef, runScenario, loadScenarioFile, findScenariosForCard, runPlaySmoke } = loadEngine();
  const expansionCards = loadExpansionCards();
  const def = getCardDef(cardNo);
  const text = officialText(cardNo, expansionCards);
  const tier = complexityTier(text);

  let scenarioPaths = findScenariosForCard(SCENARIOS_DIR, cardNo);
  if (options.scenarioId) {
    scenarioPaths = scenarioPaths.filter((p) => path.basename(p).includes(options.scenarioId));
  }

  const lines = [];
  lines.push(`# Card evaluation: ${def?.name ?? cardNo} (\`${cardNo}\`)`);
  lines.push("");
  lines.push("## Official card text");
  lines.push("");
  lines.push("```");
  lines.push(text);
  lines.push("```");
  lines.push("");
  lines.push("## Resolved definition");
  lines.push("");
  lines.push(`- **Class:** ${def?.class ?? "?"}`);
  lines.push(`- **Type:** ${def?.cardType ?? "?"} | **Cost:** ${def?.cost ?? "?"}`);
  if (def?.attack != null) lines.push(`- **Stats:** ${def.attack}/${def.defense}`);
  lines.push(`- **Keywords:** ${(def?.keywords ?? []).join(", ") || "(none)"}`);
  lines.push(`- **Traits:** ${(def?.traits ?? []).join(", ") || "(none)"}`);
  lines.push(`- **Complexity tier:** ${tier}`);
  lines.push(`- **Abilities:** ${def?.abilities?.length ? def.abilities.length + " defined" : "none (generic stub)"}`);
  lines.push("");
  if (def?.abilities?.length) {
    lines.push("```json");
    lines.push(JSON.stringify(def.abilities, null, 2));
    lines.push("```");
    lines.push("");
  }

  lines.push("## Play-smoke results");
  lines.push("");
  try {
    const smoke = runPlaySmoke(cardNo);
    for (const s of smoke) {
      lines.push(`- **${s.timing || "card"}:** \`${s.status}\`${s.error ? ` — ${s.error}` : ""}`);
    }
  } catch (e) {
    lines.push(`_Play-smoke unavailable: ${e.message}_`);
  }
  lines.push("");

  lines.push("## Scenario results");
  lines.push("");
  if (scenarioPaths.length === 0) {
    lines.push("_No scenarios linked. Add YAML under `packages/sve-engine/scenarios/cards/`._");
    if (tier !== "keyword-only") {
      lines.push("");
      lines.push("**Open question:** Card has effects but no scenario — behavior unverified.");
    }
  } else {
    for (const sp of scenarioPaths) {
      const scenario = loadScenarioFile(sp);
      const result = runScenario(scenario);
      lines.push(`### ${scenario.name} (\`${path.basename(sp)}\`)`);
      lines.push("");
      lines.push(formatScenarioResult(result));
      lines.push("");
    }
  }

  lines.push("## LLM evaluation rubric");
  lines.push("");
  lines.push("Compare official text to DSL + scenario outcomes:");
  lines.push("1. Are all timings present (fanfare, last words, evolve, activate, etc.)?");
  lines.push("2. Do costs, targets, and conditions match the text?");
  lines.push("3. Are optional branches and limits (once per turn, Necrocharge) correct?");
  lines.push("4. Do scenario assertions match what the card text describes?");
  lines.push("");
  lines.push("**Verdict:** `pass` | `fail` | `blocked` | `keyword-only`");
  lines.push("");
  lines.push("If `fail`, fix DSL in `packages/sve-engine/data/card-defs/sets/<SET>.json` or add engine primitive.");
  lines.push("Update `packages/sve-engine/data/card-manifest.json` with eval result.");

  return { markdown: lines.join("\n"), tier, def, scenarioPaths };
}

function printInventory(setPrefix) {
  const expansionCards = loadExpansionCards();
  const { getCardDef } = loadEngine();
  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : {};

  const rows = Object.keys(expansionCards)
    .filter((cn) => !setPrefix || cardSetPrefix(cn) === setPrefix)
    .sort()
    .map((cardNo) => {
      const text = officialText(cardNo, expansionCards);
      const def = getCardDef(cardNo);
      const m = manifest[cardNo] ?? {};
      return {
        cardNo,
        name: expansionCards[cardNo].name,
        tier: complexityTier(text),
        abilities: def?.abilities?.length ?? 0,
        dslStatus: m.dslStatus ?? (def?.abilities?.length ? "authored" : "missing"),
        evalStatus: m.evalStatus ?? "unverified",
      };
    });

  console.log(`\nInventory${setPrefix ? ` for ${setPrefix}` : ""}: ${rows.length} cards\n`);
  console.log("cardNo\t\ttier\t\tdsl\t\teval\tabilities\tname");
  for (const r of rows) {
    console.log(`${r.cardNo}\t${r.tier}\t${r.dslStatus}\t${r.evalStatus}\t${r.abilities}\t${r.name}`);
  }

  const byTier = {};
  for (const r of rows) byTier[r.tier] = (byTier[r.tier] ?? 0) + 1;
  console.log("\nBy complexity:", byTier);
}

function validateAllScenarios() {
  const { runScenario, loadScenarioFile, listAllScenarioFiles } = loadEngine();
  const files = listAllScenarioFiles(SCENARIOS_DIR);
  let pass = 0;
  let fail = 0;
  for (const f of files) {
    try {
      const scenario = loadScenarioFile(f);
      const result = runScenario(scenario);
      if (result.success) {
        pass++;
        console.log(`PASS ${path.basename(f)}`);
      } else {
        fail++;
        console.log(`FAIL ${path.basename(f)}`);
        for (const a of result.assertionResults.filter((x) => !x.pass)) {
          console.log(`  assertion: ${a.message}`);
        }
        for (const t of result.trace.filter((x) => !x.ok)) {
          console.log(`  action: ${t.error}`);
        }
      }
    } catch (e) {
      fail++;
      console.log(`ERROR ${path.basename(f)}: ${e.message}`);
    }
  }
  console.log(`\n${pass} passed, ${fail} failed (${files.length} total)`);
  process.exit(fail > 0 ? 1 : 0);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--validate-scenarios")) {
    validateAllScenarios();
    return;
  }
  if (args.includes("--inventory")) {
    const setIdx = args.indexOf("--set");
    const setPrefix = setIdx >= 0 ? args[setIdx + 1] : null;
    printInventory(setPrefix);
    return;
  }

  const cardNo = args.find((a) => !a.startsWith("--"));
  if (!cardNo) {
    console.error("Usage: node src/scripts/eval-card.js <cardNo> [--scenario id] [--out file]");
    console.error("       node src/scripts/eval-card.js --set BP01 --inventory");
    console.error("       node src/scripts/eval-card.js --validate-scenarios");
    process.exit(1);
  }

  const scenarioIdx = args.indexOf("--scenario");
  const scenarioId = scenarioIdx >= 0 ? args[scenarioIdx + 1] : undefined;
  const outIdx = args.indexOf("--out");
  const outFile = outIdx >= 0 ? args[outIdx + 1] : null;

  if (!fs.existsSync(path.join(ENGINE_DIST, "index.js"))) {
    console.error("Build engine first: npm run build:engine");
    process.exit(1);
  }

  const { markdown } = buildEvalPacket(cardNo, { scenarioId });
  if (outFile) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, markdown);
    console.log(`Wrote ${outFile}`);
  } else {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const defaultOut = path.join(REPORTS_DIR, `${cardNo}.md`);
    fs.writeFileSync(defaultOut, markdown);
    console.log(markdown);
    console.log(`\n---\nWrote ${defaultOut}`);
  }
}

main();
