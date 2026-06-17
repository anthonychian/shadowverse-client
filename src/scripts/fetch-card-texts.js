#!/usr/bin/env node
const ids = process.argv.slice(2);
if (!ids.length) {
  console.error("Usage: node fetch-card-texts.js BP07-047EN ...");
  process.exit(1);
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function decodeEntities(s) {
  return (s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function fetchDetail(cardNo) {
  const url = `https://en.shadowverse-evolve.com/cards/?cardno=${cardNo}&view=text`;
  const res = await globalThis.fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const name = decodeEntities((html.match(/<h1 class="ttl[^"]*">([^<]+)</) || [])[1]);
  const detailMatch = html.match(/<div class="detail">([\s\S]*?)<\/div>/i);
  const text = detailMatch
    ? decodeEntities(
        detailMatch[1]
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<img[^>]*alt="\[([^\]]+)\]"[^>]*>/gi, "[$1] ")
          .replace(/<img[^>]*>/gi, "")
          .replace(/<[^>]+>/g, "")
          .replace(/\s+\n/g, "\n")
          .trim(),
      )
    : "";
  const cost = parseInt((html.match(/heading-Cost[^<]*<\/span>(\d+)/) || [])[1], 10);
  const attack = parseInt((html.match(/heading-Power[^<]*<\/span>(\d+)/) || [])[1], 10);
  const defense = parseInt((html.match(/heading-Hp[^<]*<\/span>(\d+)/) || [])[1], 10);
  return { cardNo, name, cost, attack, defense, cardText: text };
}

(async () => {
  for (const id of ids) {
    try {
      const c = await fetchDetail(id);
      console.log(JSON.stringify(c, null, 2));
    } catch (e) {
      console.log(JSON.stringify({ cardNo: id, error: e.message }));
    }
  }
})();
