#!/usr/bin/env node

/**
 * Scrape a set's raw (Japanese) card data from the JP site
 * (shadowverse-evolve.com) via the cardlist AJAX endpoint:
 *   /cardlist/cardsearch_ex?expansion_name=<SET>&class[]=<JP class>&view=text&page=N
 *
 * The text view carries number / name / kind / trait / rarity / cost / attack /
 * defense and the effect body (text icons become [bracket] tokens, same
 * vocabulary as the EN scrape). Craft attribution comes from querying one JP
 * class at a time — the text view itself doesn't show the craft.
 *
 * Output: src/scripts/<SET>-jp.json (or --out <path>) with entries:
 *   { cardNo, jpName, class, classJP, cardType, trait, rarity,
 *     cost, attack, defense, jpEffect, img }
 *
 * This is the JP half of the JP-set pipeline; feed the output to a translation
 * / reprint-matching step to build the scrape-shaped <SET>-cards.json.
 *
 * Usage:
 *   node src/scripts/scrape-jp-set.js DSD01
 *   node src/scripts/scrape-jp-set.js SD07 --out ./SD07-jp.json
 */

const fs = require("fs");
const path = require("path");

const SET = process.argv[2];
if (!SET || SET.startsWith("--")) {
  console.error("Usage: node src/scripts/scrape-jp-set.js <SET> [--out <path>]");
  process.exit(1);
}
function optVal(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : null;
}
const OUT = optVal("--out") || path.join(__dirname, `${SET}-jp.json`);

const BASE = "https://shadowverse-evolve.com";
const UA = "Mozilla/5.0 (compatible; sve-client/1.0)";

// JP class checkbox value -> app class keys.
const CLASSES = [
  ["エルフ", "forest", "Forestcraft"],
  ["ロイヤル", "sword", "Swordcraft"],
  ["ウィッチ", "rune", "Runecraft"],
  ["ドラゴン", "dragon", "Dragoncraft"],
  ["ナイトメア", "abyss", "Abysscraft"],
  ["ビショップ", "haven", "Havencraft"],
  ["ニュートラル", "neutral", "Neutral"],
];

// JP texticon filename stem -> the bracket token used across *-cards.json.
const ICON_TOKEN = {
  icon_fanfare: "[fanfare]",
  icon_lastword: "[lastwords]",
  icon_evolve: "[evolve]",
  icon_act: "[act]",
  icon_stand: "[engage]",
  icon_power: "[attack]",
  icon_hp: "[defense]",
  icon_quick: "[quick]",
  icon_q: "[q]",
  icon_adv: "[adv]",
  icon_ride: "[ride]",
  icon_carrot: "[feed]",
  icon_elf: "[forestcraft]",
  icon_royal: "[swordcraft]",
  icon_witch: "[runecraft]",
  icon_dragon: "[dragoncraft]",
  icon_nightmare: "[abysscraft]",
  icon_bishop: "[havencraft]",
  icon_neutral: "[neutral]",
};
const unknownIcons = new Set();

const decode = (s) =>
  String(s || "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ");

function effectFromHtml(html) {
  let t = String(html || "");
  t = t.replace(/<img[^>]*texticon\/([a-z0-9_]+)\.png[^>]*>/gi, (m, stem) => {
    if (stem.startsWith("icon_cost")) return `[${stem.slice(5)}]`; // icon_cost01 -> [cost01]
    if (ICON_TOKEN[stem]) return ICON_TOKEN[stem];
    unknownIcons.add(stem);
    return `[${stem.replace(/^icon_/, "")}]`;
  });
  t = t.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
  t = decode(t);
  return t.replace(/\n+/g, " ").replace(/[ \t　]+/g, " ").trim();
}

function parseItems(html) {
  const items = [];
  const li = /<li class="ex-item">([\s\S]*?)<\/li>/g;
  let m;
  while ((m = li.exec(html))) {
    const body = m[1];
    const num = body.match(/<p class="number">([^<]+)<\/p>/);
    const ttl = body.match(/<p class="ttl">([^<]+)<\/p>/);
    const img = body.match(/<img src="([^"]+cardlist[^"]+)"/);
    const status = [...body.matchAll(/<span class="status-Item(?:[^"]*)">([\s\S]*?)<\/span>/g)]
      .map((s) => s[1].replace(/<span class="heading[^>]*>[^<]*<\/span>/g, "").replace(/<[^>]+>/g, "").trim());
    const detail = body.match(/<div class="detail">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/);

    // status items: kind, [trait], [rarity], コスト, [攻撃力, 体力]
    // Cost/attack/defense come from the labelled spans; the plain ones are kind/trait/rarity.
    const labelled = {};
    for (const s of [...body.matchAll(/<span class="status-Item status-Item-(Cost|Power|Hp)">(?:<span[^>]*>[^<]*<\/span>)?([^<]*)<\/span>/g)]) {
      labelled[s[1]] = s[2].trim();
    }
    const plain = [...body.matchAll(/<span class="status-Item">([\s\S]*?)<\/span>/g)].map((s) =>
      s[1].replace(/<[^>]+>/g, "").trim()
    );

    items.push({
      cardNo: num ? num[1].trim() : "",
      jpName: ttl ? decode(ttl[1].trim()) : "",
      statusPlain: plain.map(decode),
      cost: labelled.Cost || "-",
      attack: labelled.Power || "-",
      defense: labelled.Hp || "-",
      jpEffect: detail ? effectFromHtml(detail[1]) : "",
      img: img ? img[1] : "",
    });
  }
  return items;
}

async function fetchPage(params) {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/cardlist/cardsearch_ex?${qs}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "X-Requested-With": "XMLHttpRequest" },
  });
  if (res.status === 404) return ""; // past the last page
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchAll(extraParams) {
  const all = [];
  for (let page = 1; page < 100; page++) {
    const html = await fetchPage({ expansion_name: SET, view: "text", page, ...extraParams });
    const items = parseItems(html);
    if (!items.length) break;
    all.push(...items);
  }
  return all;
}

async function run() {
  const byNo = new Map();

  for (const [jp, short, full] of CLASSES) {
    const items = await fetchAll({ "class[]": jp });
    for (const it of items) {
      if (!it.cardNo || byNo.has(it.cardNo)) continue;
      byNo.set(it.cardNo, { ...it, class: short, classJP: jp, classFull: full });
    }
    if (items.length) console.log(`  ${jp} (${short}): ${items.length}`);
  }

  // Safety net: anything the per-class queries missed (shouldn't happen).
  const rest = await fetchAll({});
  for (const it of rest) {
    if (!it.cardNo || byNo.has(it.cardNo)) continue;
    byNo.set(it.cardNo, { ...it, class: "", classJP: "", classFull: "" });
    console.log(`  NOTE: ${it.cardNo} not matched by any class query`);
  }

  // Interpret the plain status items: kind, optional trait, optional rarity.
  const cards = [...byNo.values()].map((it) => {
    const plain = it.statusPlain.filter(Boolean);
    const kind = plain[0] || "";
    // Rarity strings on the JP site are short latin codes (LG/GR/SR/BR/SP/UR...).
    let rarity = "";
    let trait = "";
    for (const s of plain.slice(1)) {
      if (/^[A-Z]{1,3}$/.test(s)) rarity = s;
      else trait = s;
    }
    const { statusPlain, ...restIt } = it;
    return { ...restIt, kindJP: kind, trait, rarity };
  });

  cards.sort((a, b) => a.cardNo.localeCompare(b.cardNo, "en", { numeric: true }));
  fs.writeFileSync(OUT, JSON.stringify(cards, null, 2) + "\n");
  console.log(`${SET}: wrote ${cards.length} cards to ${OUT}`);
  if (unknownIcons.size) console.log(`  Unknown texticons: ${[...unknownIcons].join(", ")}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
