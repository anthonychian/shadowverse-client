const BASE_URL = "https://en.shadowverse-evolve.com";
const detailUrl = (cardNo) => `${BASE_URL}/cards/?cardno=${cardNo}&view=text`;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const CLASS_MAP = {
  forestcraft: "forest",
  swordcraft: "sword",
  runecraft: "rune",
  dragoncraft: "dragon",
  abysscraft: "abyss",
  shadowcraft: "abyss",
  bloodcraft: "abyss",
  havencraft: "haven",
  portalcraft: "portal",
  neutral: "neutral",
};

const KEYWORD_ICON_MAP = {
  icon_fanfare: "fanfare",
  icon_lastwords: "lastWords",
  icon_evolve: "evolve",
  icon_quick: "quick",
  icon_ward: "ward",
  icon_storm: "storm",
  icon_rush: "rush",
  icon_assail: "assail",
  icon_intimidate: "intimidate",
  icon_drain: "drain",
  icon_bane: "bane",
  icon_aura: "aura",
  icon_on_evolve: "onEvolve",
  icon_on_super_evolve: "onSuperEvolve",
  icon_strike: "strike",
  icon_advanced: "advanced",
  icon_stack: "stack",
  icon_serve: "serve",
};

function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .trim();
}

async function getHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parseDlField(html, label) {
  const re = new RegExp(`<dt>${label}<\\/dt><dd>([\\s\\S]*?)<\\/dd>`, "i");
  const m = html.match(re);
  if (!m) return "";
  return decodeEntities(m[1].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim());
}

function parseStats(html) {
  const cost = parseInt(
    (html.match(/status-Item-Cost[\s\S]*?heading-Cost[^<]*<\/span>(\d+)/) || [])[1],
    10,
  );
  const attack = parseInt(
    (html.match(/status-Item-Power[\s\S]*?heading-Power[^<]*<\/span>(\d+)/) || [])[1],
    10,
  );
  const defense = parseInt(
    (html.match(/status-Item-Hp[\s\S]*?heading-Hp[^<]*<\/span>(\d+)/) || [])[1],
    10,
  );
  return {
    cost: Number.isFinite(cost) ? cost : null,
    attack: Number.isFinite(attack) ? attack : null,
    defense: Number.isFinite(defense) ? defense : null,
  };
}

function parseCardText(html) {
  const detailMatch = html.match(/<div class="detail">([\s\S]*?)<\/div>/i);
  if (!detailMatch) return { text: "", keywords: [] };
  const block = detailMatch[1];
  const keywords = [];
  for (const [icon, keyword] of Object.entries(KEYWORD_ICON_MAP)) {
    if (block.includes(icon)) keywords.push(keyword);
  }
  const text = decodeEntities(
    block
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<img[^>]*alt="\[([^\]]+)\]"[^>]*>/gi, "[$1] ")
      .replace(/<img[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
  return { text, keywords: [...new Set(keywords)] };
}

function parseRelatedCards(html) {
  const relationBlock = html.match(
    /<div class="cardlist-Detail_Relation">([\s\S]*?)<\/div>\s*<div class="cardlist-Under">/i,
  );
  if (!relationBlock) return [];
  const links = relationBlock[1].match(/cardno=([A-Z0-9-]+)/gi) || [];
  return [...new Set(links.map((l) => l.replace(/^cardno=/i, "")))];
}

function normalizeCardType(raw) {
  const ct = (raw || "").toLowerCase();
  if (ct.includes("leader")) return "leader";
  if (ct.includes("spell")) return "spell";
  if (ct.includes("amulet")) return "amulet";
  if (ct.includes("follower")) return "follower";
  return "follower";
}

async function fetchDetail(cardNo) {
  const html = await getHtml(detailUrl(cardNo));
  const name = decodeEntities((html.match(/<h1 class="ttl[^"]*">([^<]+)</) || [])[1]);
  const cls = decodeEntities((html.match(/<dt>Class<\/dt><dd>([^<]+)</) || [])[1]);
  const cardTypeRaw = decodeEntities((html.match(/<dt>Card Type<\/dt><dd>([^<]+)</) || [])[1]);
  const traitRaw = parseDlField(html, "Trait");
  const rarity = parseDlField(html, "Rarity");
  const format = parseDlField(html, "Format");
  const stats = parseStats(html);
  const { text, keywords } = parseCardText(html);
  const relatedCardNos = parseRelatedCards(html);
  const traits = traitRaw
    ? traitRaw
        .split("/")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  return {
    name,
    cls,
    cardType: cardTypeRaw,
    cardTypeNormalized: normalizeCardType(cardTypeRaw),
    traits,
    rarity,
    format,
    ...stats,
    cardText: text,
    keywords,
    relatedCardNos,
  };
}

/** Strip suffixes so alternate printings of the same card share an identity key. */
function normalizeIdentityName(name) {
  if (!name) return "";
  return name
    .replace(/\s+TOKEN$/i, "")
    .replace(/\s+Evolved$/i, "")
    .replace(/\s+ADVANCED$/i, "")
    .trim();
}

function cardIdentityKey(card) {
  const isToken =
    card.type === "token" || card.specialType === "token" || /\s+TOKEN$/i.test(card.name);
  const role = card.printingType ?? card.type;
  const isEvolved =
    role === "evolved" ||
    (role !== "base" &&
      role !== "token" &&
      (card.specialType === "evolved" || /\s+Evolved$/i.test(card.name)));
  const kind = isToken ? "token" : isEvolved ? "evolved" : "base";
  return `${normalizeIdentityName(card.name)}|${kind}`;
}

/** Plain numbered slots (001, T01) — not promo / alt-art suffixes. */
function isCanonicalSlot(cardNo, expansion) {
  if (expansion && cardNo.startsWith(`${expansion}-`)) {
    return new RegExp(`^${expansion}-(\\d+|T\\d+)EN$`, "i").test(cardNo);
  }
  return /^[A-Z0-9]+-(\d+|T\d+)EN$/i.test(cardNo);
}

function isAltArtSlot(cardNo) {
  return /-(P\d+|SL\d+|U\d+|SP\d|PR-|SDD)/i.test(cardNo);
}

function cardRichness(card) {
  if (!card) return 0;
  let score = 0;
  if (card.cardText) score += card.cardText.length;
  if (card.cost != null) score += 10;
  if (card.attack != null) score += 5;
  if (card.defense != null) score += 5;
  if (card.keywords?.length) score += card.keywords.length * 3;
  if (card.abilities?.length) score += 50;
  if (card.traits?.length) score += 2;
  return score;
}

function pickCanonicalInGroup(cards, expansion) {
  return [...cards].sort((a, b) => {
    const diff = cardRichness(b) - cardRichness(a);
    if (diff !== 0) return diff;
    const aCanon = isCanonicalSlot(a.cardNo, expansion) ? 1 : 0;
    const bCanon = isCanonicalSlot(b.cardNo, expansion) ? 1 : 0;
    return bCanon - aCanon;
  })[0];
}

/** Copy gameplay fields from the richest printing; keep this card's number, name, and art. */
function inheritGameplayFields(canonical, alt) {
  return {
    ...canonical,
    cardNo: alt.cardNo,
    name: alt.name,
    type: alt.type ?? canonical.type,
    specialType: alt.specialType ?? canonical.specialType,
    imgSrc: alt.imgSrc || canonical.imgSrc,
    reprintOf: canonical.cardNo,
    relatedCardNos: [
      ...new Set([...(alt.relatedCardNos || []), ...(canonical.relatedCardNos || []), canonical.cardNo]),
    ],
  };
}

/**
 * For each identity group, pick a canonical printing and fill gaps on alt-art / promo copies.
 */
function applyReprintInheritance(cards, expansion) {
  const byIdentity = new Map();
  for (const card of cards) {
    const key = cardIdentityKey(card);
    if (!byIdentity.has(key)) byIdentity.set(key, []);
    byIdentity.get(key).push(card);
  }

  const canonicalByCardNo = new Map();
  for (const group of byIdentity.values()) {
    const canonical = pickCanonicalInGroup(group, expansion);
    for (const card of group) {
      canonicalByCardNo.set(card.cardNo, canonical.cardNo);
    }
  }

  return cards.map((card) => {
    const canonicalNo = canonicalByCardNo.get(card.cardNo);
    if (!canonicalNo || canonicalNo === card.cardNo) {
      const { reprintOf, ...rest } = card;
      if (reprintOf) {
        const source = cards.find((c) => c.cardNo === reprintOf);
        if (source && cardIdentityKey(card) !== cardIdentityKey(source)) {
          return { ...rest };
        }
      }
      return { ...card };
    }
    const canonical = cards.find((c) => c.cardNo === canonicalNo);
    if (!canonical) return { ...card };
    if (cardIdentityKey(card) !== cardIdentityKey(canonical)) {
      const { reprintOf, ...rest } = card;
      return { ...rest };
    }
    if (cardRichness(card) + 5 >= cardRichness(canonical)) {
      return { ...card, reprintOf: canonicalNo };
    }
    return inheritGameplayFields(canonical, card);
  });
}

module.exports = {
  fetchDetail,
  normalizeCardType,
  CLASS_MAP,
  decodeEntities,
  normalizeIdentityName,
  cardIdentityKey,
  isCanonicalSlot,
  isAltArtSlot,
  cardRichness,
  pickCanonicalInGroup,
  inheritGameplayFields,
  applyReprintInheritance,
};
