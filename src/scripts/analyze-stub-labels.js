#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../packages/sve-engine/data/card-manifest.json"), "utf8"),
);
const defs = {};
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (
      e.name.endsWith(".json") &&
      !["parsed-stubs.json", "deck-cards.json", "hand-authored-overrides.json"].includes(e.name)
    ) {
      Object.assign(defs, JSON.parse(fs.readFileSync(f, "utf8")));
    }
  }
}
walk(path.join(__dirname, "../../packages/sve-engine/data/card-defs"));

const expansion = {};
for (const file of fs.readdirSync(__dirname).filter((f) => f.endsWith("-cards.json"))) {
  for (const c of JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"))) {
    expansion[c.cardNo] = c;
  }
}

function collectNoops(obj, out) {
  if (!obj || typeof obj !== "object") return;
  if (obj.op === "noop" && obj.label) out.push(obj.label);
  for (const v of Object.values(obj)) {
    if (Array.isArray(v)) v.forEach((x) => collectNoops(x, out));
    else if (v && typeof v === "object") collectNoops(v, out);
  }
}

const labelCounts = {};
let stubAuto = 0;
let stubNoopOnly = 0;
let reviewCount = 0;

for (const [no, m] of Object.entries(manifest)) {
  if (m.dslStatus !== "review" && m.dslStatus !== "stub") continue;
  if (m.dslStatus === "review") reviewCount++;
  const d = defs[no];
  const labels = [];
  collectNoops(d?.abilities, labels);
  if (m.dslStatus === "stub") {
    if (!labels.length) stubAuto++;
    else stubNoopOnly++;
  }
  for (const l of labels) {
    const key = l.slice(0, 60).toLowerCase();
    labelCounts[key] = (labelCounts[key] || 0) + 1;
  }
}

const top = Object.entries(labelCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40);

console.log({ reviewCount, stubAuto, stubNoopOnly, uniqueNoopLabels: Object.keys(labelCounts).length });
console.log("\nTop noop labels:");
for (const [k, n] of top) console.log(n, k);
