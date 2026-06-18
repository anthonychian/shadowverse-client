#!/usr/bin/env node
/**
 * One-pass card DSL completion loop (noop-focused legacy).
 * Prefer: node src/scripts/verify-all-cards.js for correctness verification.
 * Usage: node src/scripts/complete-all-cards.js [--max-iterations 20] [--with-prune]
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getCanonicalNoopReport, loadSetDefs, SETS_DIR, effectHasNoopInTree } = require("./card-dsl-utils");
const { buildIdentityIndex, cardIdentityKey } = require("./identity-dsl");

const ROOT = path.join(__dirname, "..", "..");
const maxIterations = (() => {
  const idx = process.argv.indexOf("--max-iterations");
  return idx >= 0 ? parseInt(process.argv[idx + 1], 10) : 25;
})();

function run(cmd, label) {
  console.log(`\n>> ${label}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function loadExpansionCards() {
  const cards = [];
  for (const file of fs.readdirSync(__dirname).filter((f) => f.endsWith("-cards.json"))) {
    cards.push(...JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8")));
  }
  return cards;
}

function promoteReviewCards() {
  const expansion = loadExpansionCards();
  const cardByNo = Object.fromEntries(expansion.map((c) => [c.cardNo, c]));
  const setDefs = loadSetDefs();
  const identityIndex = buildIdentityIndex(cardByNo, setDefs);
  let promoted = 0;

  const bySet = {};
  for (const [cardNo, def] of Object.entries(setDefs)) {
    const set = cardNo.replace(/-.*$/, "");
    if (!bySet[set]) bySet[set] = {};
    bySet[set][cardNo] = def;
  }

  for (const [cardNo, def] of Object.entries(setDefs)) {
    const key = cardIdentityKey(def.name || cardByNo[cardNo]?.name, def.printingType || "base");
    const canon = identityIndex.canonicalByIdentity.get(key);
    if (canon !== cardNo) continue;
    if (def.parseConfidence !== "review") continue;
    const hasNoop = (def.abilities || []).some((a) => effectHasNoopInTree(a.effect));
    if (hasNoop) continue;
    bySet[cardNo.replace(/-.*$/, "")][cardNo].parseConfidence = "auto";
    promoted++;
  }

  if (promoted > 0) {
    for (const [set, defs] of Object.entries(bySet)) {
      fs.writeFileSync(
        path.join(SETS_DIR, `${set}.json`),
        JSON.stringify(defs, null, 2) + "\n",
      );
    }
  }
  console.log(`Promoted ${promoted} review cards to auto confidence`);
  return promoted;
}

function main() {
  let prevNoop = Infinity;
  let plateau = 0;

  for (let i = 1; i <= maxIterations; i++) {
    console.log(`\n========== Completion iteration ${i}/${maxIterations} ==========`);
    const before = getCanonicalNoopReport();
    console.log(
      `Before: ${before.canonicalWithNoop} identities, ${before.totalNoop} noop nodes`,
    );
    if (before.incomplete.length) {
      console.log(
        "Top incomplete:",
        before.incomplete
          .slice(0, 5)
          .map((x) => `${x.canonNo} (${x.noopCount})`)
          .join(", "),
      );
    }

    if (before.canonicalWithNoop === 0) {
      console.log("All non-Vanguard canonical identities are noop-free.");
      break;
    }

    run("node src/scripts/apply-hand-overrides.js", "apply hand overrides");
    run("node src/scripts/tag-vanguard-cards.js", "tag Vanguard deferrals");
    run("node src/scripts/fix-all-noops.js", "fix-all-noops");
    if (process.argv.includes("--with-prune")) {
      run("node src/scripts/prune-all-noops.js", "prune-all-noops (optional)");
    }
    run("node src/scripts/fix-review-stubs.js", "fix-review-stubs");
    promoteReviewCards();
    run("node src/scripts/generate-manifest.js", "generate-manifest");

    const after = getCanonicalNoopReport();
    console.log(
      `After: ${after.canonicalWithNoop} identities, ${after.totalNoop} noop nodes`,
    );

    if (after.totalNoop >= prevNoop) {
      plateau++;
      if (plateau >= 3) {
        console.log("Plateau reached after 3 iterations without noop reduction.");
        break;
      }
    } else {
      plateau = 0;
    }
    prevNoop = after.totalNoop;
  }

  run("npm run build -w sve-engine", "build engine");
  try {
    run("npm run test -w sve-engine", "engine tests");
  } catch {
    console.error("Engine tests failed — fix before declaring complete.");
    process.exit(1);
  }

  const final = getCanonicalNoopReport();
  if (final.canonicalWithNoop > 0) {
    console.error(
      `\nIncomplete: ${final.canonicalWithNoop} canonical identities still have noop.`,
    );
    process.exit(1);
  }
  console.log("\nCard DSL completion pass succeeded.");
}

main();
