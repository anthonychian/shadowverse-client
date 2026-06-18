/**
 * Comprehensive Shadowverse Evolve card-text → DSL ability parser.
 * Used by parse-effects-to-dsl.js to auto-stub card definitions.
 */
const { normalizeIdentityName } = require("./scrape-utils");
const { matchNoopPattern } = require("./noop-patterns");
const { lessonActivateCost, parseLessonPrefix, parseMultiplierDamage, parseVariableDamageAmount } = require("./dsl-builders");

/** @typedef {{ cardNoToName: Record<string,string>, nameToCardNo: Record<string,string> }} TokenMap */

const CLASS_ALIASES = {
  forestcraft: "forest",
  swordcraft: "sword",
  runecraft: "rune",
  dragoncraft: "dragon",
  shadowcraft: "abyss",
  bloodcraft: "abyss",
  abysscraft: "abyss",
  havencraft: "haven",
  portalcraft: "portal",
  neutral: "neutral",
};

const TIMING_MARKERS = [
  { re: /\[fanfare\]/gi, timing: "fanfare" },
  { re: /\[lastwords\]/gi, timing: "lastWords" },
  { re: /\[onSuperEvolve\]/gi, timing: "onSuperEvolve" },
  { re: /\[onEvolve\]/gi, timing: "onEvolve" },
  { re: /\[strike\]/gi, timing: "strike" },
  { re: /\[quick\]/gi, timing: "quick", flag: true },
];

const CONFIDENCE_RANK = { auto: 0, "keyword-only": 1, review: 2, manual: 3 };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function parseKeywords(text) {
  const kw = [];
  if (!text) return kw;
  if (/\bStorm\b/i.test(text) && !/\bGive (?:it|this follower|them) Storm\b/i.test(text)) kw.push("storm");
  if (/\bWard\b/i.test(text) && !/\bGive (?:it|them) Ward\b/i.test(text)) kw.push("ward");
  if (/\bRush\b/i.test(text) && !/\bGive (?:it|them) Rush\b/i.test(text)) kw.push("rush");
  if (/\bAssail\b/i.test(text) && !/\bGive (?:it|them) Assail\b/i.test(text)) kw.push("assail");
  if (/\bAura\b/i.test(text) && !/\bGive (?:it|this follower|them) Aura\b/i.test(text)) kw.push("aura");
  if (/\bBane\b/i.test(text)) kw.push("bane");
  if (/\bDrain\b/i.test(text)) kw.push("drain");
  if (/\[evolve\]/i.test(text)) kw.push("evolve");
  if (/\bStrike\b/i.test(text) || /\[strike\]/i.test(text) || /Strike\s*[-:]/i.test(text)) kw.push("strike");
  if (/\bIntimidate\b/i.test(text)) kw.push("intimidate");
  if (/\[adv\]/i.test(text) || /\bADVANCED\b/i.test(text)) kw.push("advanced");
  if (/\bStack\b/i.test(text) && !/\bAdd \d+ to a Stack\b/i.test(text)) kw.push("stack");
  if (/\[fanfare\]/i.test(text)) kw.push("fanfare");
  if (/\[lastwords?\]/i.test(text) || /\[last words\]/i.test(text)) kw.push("lastWords");
  if (/\[quick\]/i.test(text)) kw.push("quick");
  return [...new Set(kw)];
}

/**
 * @param {Array<{ cardNo: string, name: string, type?: string }>} expansionCardsArray
 * @returns {TokenMap}
 */
function buildTokenMap(expansionCardsArray) {
  const cardNoToName = {};
  const nameToCardNo = {};

  const isCanonical = (cardNo) => /^[A-Z0-9]+-(?:\d+|T\d+)EN$/i.test(cardNo);

  for (const card of expansionCardsArray || []) {
    const isToken = card.type === "token" || /\s+TOKEN$/i.test(card.name || "");
    if (!isToken) continue;
    const displayName = normalizeIdentityName(card.name || "");
    cardNoToName[card.cardNo] = displayName;
    const prev = nameToCardNo[displayName];
    if (!prev || (isCanonical(card.cardNo) && !isCanonical(prev))) {
      nameToCardNo[displayName] = card.cardNo;
    }
  }
  return { cardNoToName, nameToCardNo };
}

/**
 * @param {object} card scraped card row
 * @param {TokenMap} tokenMap
 * @returns {{ keywords: string[], abilities: object[], confidence: string }}
 */
function parseCardToDsl(card, tokenMap) {
  const raw = card.cardText || card.details?.effect || "";
  const keywords = parseKeywords(raw);

  if (!raw.trim()) {
    return {
      keywords,
      abilities: [],
      confidence: keywords.length ? "keyword-only" : "auto",
    };
  }

  const normalized = normalizeCardText(raw);
  const segments = splitIntoSegments(normalized, card);
  const abilities = [];
  let confidence = "auto";

  if (segments.length === 0) {
    if (isSubstantiveText(normalized)) {
      const fallback = parseSegmentBody(normalized, tokenMap, { timing: inferDefaultTiming(card) });
      if (!isNoopEffect(fallback.effect)) {
        abilities.push(buildAbility(fallback, { timing: inferDefaultTiming(card) }));
        confidence = fallback.confidence;
      } else if (isSubstantiveText(normalized)) {
        abilities.push({
          timing: inferDefaultTiming(card),
          effect: { op: "noop", label: normalized.slice(0, 120) },
        });
        confidence = "manual";
      }
    }
  } else {
    for (const seg of segments) {
      const parsed = parseSegmentBody(seg.text, tokenMap, seg);
      if (!isNoopEffect(parsed.effect)) {
        abilities.push(buildAbility(parsed, seg));
      } else if (isSubstantiveText(seg.text)) {
        abilities.push(buildAbility(parsed, seg));
      }
      confidence = maxConfidence(confidence, parsed.confidence);
    }
  }

  if (abilities.length === 0 && keywords.length > 0) {
    confidence = "keyword-only";
  } else if (abilities.length === 0 && isSubstantiveText(normalized)) {
    abilities.push({
      timing: inferDefaultTiming(card),
      effect: { op: "noop", label: normalized.slice(0, 120) },
    });
    confidence = "manual";
  }

  if (abilities.length > 0 && !abilities.some((a) => effectHasNoop(a.effect))) {
    if (confidence === "manual") confidence = "review";
  } else if (abilities.some((a) => effectHasNoop(a.effect))) {
    confidence = "manual";
  }

  const pruned = abilities
    .map((a) => {
      const effect = pruneNoopEffect(a.effect);
      if (!effect) return null;
      return { ...a, effect };
    })
    .filter(Boolean);

  return { keywords: [...new Set(keywords)], abilities: pruned, confidence };
}

module.exports = {
  parseKeywords,
  buildTokenMap,
  parseCardToDsl,
  normalizeCardText,
  splitIntoSegments,
  pruneNoopEffect,
};

// ---------------------------------------------------------------------------
// Normalization & segmentation
// ---------------------------------------------------------------------------

function normalizeCardText(text) {
  let t = String(text).replace(/\r\n/g, " ").replace(/\n/g, " ").trim();
  t = t.replace(
    /\[evolve\]\s*\[cost\d+\]:\s*Evolve this(?: follower)?\.?\s*/gi,
    "",
  );
  t = t.replace(/\[evolve\]:\s*Evolve this(?: follower)?\.?\s*/gi, "");
  t = t.replace(/\[feed\]\s*\[cost\d+\]:\s*Race this follower\.?\s*/gi, "");
  t = t.replace(/\[ride\]\s*\[cost\d+\]:\s*Give this follower Drive\.?\s*/gi, "");
  t = t.replace(/\bTwin Drive\.?\s*/gi, "");
  t = t.replace(/\bOn Race\s*[-–:]\s*/gi, "");
  t = t.replace(/\bSingle Drive\.?\s*/gi, "");
  t = t.replace(/\bChoose one of the following\.?\s*/gi, "Choose one. ");
  t = t.replace(/\bEvolve this follower\.?\s*/gi, "");
  t = t.replace(/\bDuring your turn,?\s*/gi, "");
  t = t.replace(/\b(?:Activate )?only once per turn\.?\s*/gi, "");
  t = t.replace(/\bOnce per turn,?\s*/gi, "");
  t = t.replace(/\[last\s*words\]/gi, "[lastwords]");
  t = t.replace(/On Super-?Evolve\s*[-–:,]?\s*/gi, "[onSuperEvolve] ");
  t = t.replace(/On Evolve\s*[-–:,]?\s*/gi, "[onEvolve] ");
  t = t.replace(/\bStrike\s*[-–:]\s*/gi, "[strike] ");
  t = t.replace(
    /\[attack\]\s*\+\s*(\d+)\s*\/\s*\[defense\]\s*\+\s*(\d+)/gi,
    "+$1/+$2",
  );
  t = t.replace(/\[attack\]\s*\+\s*(\d+)/gi, "[atk]+$1");
  t = t.replace(/\[defense\]\s*\+\s*(\d+)/gi, "[def]+$1");
  t = t.replace(/\[atk\]\+(\d+)\s*\/\s*\[def\]\+(\d+)/gi, "+$1/+$2");
  t = t.replace(
    /\[(forestcraft|swordcraft|runecraft|dragoncraft|shadowcraft|havencraft|portalcraft|neutral)\]/gi,
    (_, c) => `[${c.toLowerCase()}]`,
  );
  t = t.replace(/\bSC\s*\(/gi, "Spellchain (");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

const IGNORABLE_SUFFIXES = [
  /^Put the rest on the bottom of your deck in any order\.?\s*/i,
  /^Put the remaining cards on the bottom of your deck in any order\.?\s*/i,
  /^Put the rest on the bottom in any order\.?\s*/i,
  /^Put any number of them on the top of your deck in any order\.?\s*/i,
  /^Put the remaining cards on the bottom in any order\.?\s*/i,
  /^Bury the rest\.?\s*/i,
  /^Shuffle your deck\.?\s*/i,
  /^then shuffle your deck\.?\s*/i,
  /^They cost \d+ to play this turn\.?\s*/i,
  /^It costs \d+ less to play this turn\.?\s*/i,
  /^\(When this card is put onto the field from the cemetery[^)]*\)\.?\s*/i,
];

function stripIgnorableClauses(text) {
  let t = String(text).trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const re of IGNORABLE_SUFFIXES) {
      if (re.test(t)) {
        t = t.replace(re, "").trim();
        changed = true;
      }
    }
  }
  return t;
}

function effectHasNoop(effect) {
  if (!effect) return false;
  if (effect.op === "noop") return true;
  if (effect.op === "sequence") return effect.steps?.some(effectHasNoop);
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    return effect.options?.some((o) => effectHasNoop(o.effect));
  }
  if (effect.op === "if") return effectHasNoop(effect.then) || effectHasNoop(effect.else);
  if (effect.op === "optionalCost") return effectHasNoop(effect.then);
  return false;
}

function inferDefaultTiming(card) {
  const cardType = (card.details?.cardType || card.cardType || "").toLowerCase();
  if (cardType.includes("spell")) return "spell";
  if (cardType.includes("amulet")) return "fanfare";
  return "fanfare";
}

function isSubstantiveText(text) {
  const stripped = String(text)
    .replace(/\b(Ward|Storm|Rush|Assail|Aura|Bane|Drain|Intimidate|Stack)\b\.?/gi, "")
    .replace(/\[evolve\]\s*\[cost\d+\]:[^.]*\.?/gi, "")
    .replace(/\[evolve\]:\s*Evolve this[^.]*\.?/gi, "")
    .replace(/\[quick\]/gi, "")
    .replace(/This follower can't attack[^.]*\.?/gi, "")
    .replace(/\(Followers with Rush[^)]*\)/gi, "")
    .replace(/You can put up to \d+ of this card into your (?:evolve )?deck\.?/gi, "")
    .trim();
  return stripped.length > 8;
}

function isNoopEffect(effect) {
  if (!effect) return true;
  if (effect.op === "noop") return !isWorthKeepingNoop(effect.label);
  if (effect.op === "sequence" && effect.steps?.every((s) => isNoopEffect(s))) return true;
  return false;
}

const JUNK_NOOP_PATTERNS = [
  /^\.?$/,
  /^leader$/i,
  /^choose one$/i,
  /^choose one of the following$/i,
  /^select an enemy follower on the field$/i,
  /^select an enemy leader or enemy follower on the field$/i,
  /^select a card on your field$/i,
  /^for 0 play points$/i,
  /^leader and enemy follower on the field$/i,
  /^put the rest on the bottom of your deck in any order$/i,
  /^put the remaining cards on the bottom of your deck in any order$/i,
  /^bury the rest$/i,
  /^shuffle your deck$/i,
  /^then shuffle your deck$/i,
  /^play cost reduction condition$/i,
  /^evolve deck limit$/i,
  /^evolve cost reduction this turn$/i,
  /^activate twice per turn$/i,
  /^this ability can be activated$/i,
  /^\[ride\]/i,
  /^\[feed\]/i,
  /^on drive/i,
  /^on race/i,
  /^single drive$/i,
  /^during your turn,?\s*$/i,
  /^once on each of your turns,?\s*$/i,
  /^choose up to \d+$/i,
  /^you can put up to \d+ of this card into your evolve deck/i,
  /^this card can't be played from your ex area/i,
  /^this card can't be activated/i,
  /^opponents can't attack your other followers or leader while this follower is engaged/i,
  /^doesn't refresh during the next start phase/i,
  /^can't attack enemies/i,
  /^can't attack leaders/i,
  /^skip refresh next turn$/i,
  /^evolve deck select$/i,
  /^activate overflow$/i,
  /^activate cardsplayedmin$/i,
  /^put rest on deck bottom$/i,
  /^select an enemy leader$/i,
  /^\(followers with storm/i,
  /^cannot deal damage this turn$/i,
  /^def-as-attack aura$/i,
  /^banish ex area at end phase$/i,
];

function isWorthKeepingNoop(label) {
  if (!label) return false;
  const l = String(label).trim();
  if (l.length < 8) return false;
  if (/^keyword/i.test(l)) return false;
  return true;
}

function pruneNoopEffect(effect) {
  if (!effect) return null;
  if (effect.op === "noop") {
    return isWorthKeepingNoop(effect.label) ? effect : null;
  }
  if (effect.op === "sequence") {
    const steps = (effect.steps || []).map(pruneNoopEffect).filter(Boolean);
    if (!steps.length) return null;
    if (steps.length === 1) return steps[0];
    return { ...effect, steps };
  }
  if (effect.op === "choose" || effect.op === "chooseMultiple") {
    const options = (effect.options || [])
      .map((o) => {
        const pruned = pruneNoopEffect(o.effect);
        if (!pruned) return null;
        return { ...o, effect: pruned };
      })
      .filter(Boolean);
    if (!options.length) return null;
    return { ...effect, options };
  }
  if (effect.op === "if") {
    const then = pruneNoopEffect(effect.then);
    const els = effect.else ? pruneNoopEffect(effect.else) : undefined;
    if (!then && !els) return null;
    return { ...effect, then: then || { op: "noop", label: "empty" }, else: els };
  }
  if (effect.op === "optionalCost") {
    const then = pruneNoopEffect(effect.then);
    if (!then) return null;
    return { ...effect, then };
  }
  return effect;
}

/**
 * @returns {Array<{ timing: string, text: string, quick?: boolean, cost?: object, condition?: object, oncePerTurn?: boolean }>}
 */
function splitIntoSegments(normalized, card) {
  const segments = [];
  const actRe =
    /\[act\](?:\[cost(\d+)\])?(?:,\s*\[engage\])?(?:,\s*([^:]+?))?:\s*/gi;
  const passiveRe =
    /\b(Whenever|While|At the start of (?:each opponent's main phase|each player's main phase|your (?:turn|end phase|main phase))|When this card (?:is discarded|leaves the field)|When (?:you|another|one of your))/gi;

  /** @type {Array<{ index: number, len: number, seg: object }>} */
  const markers = [];

  for (const { re, timing, flag } of TIMING_MARKERS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(normalized))) {
      markers.push({
        index: m.index,
        len: m[0].length,
        seg: { timing, quick: flag || false, text: "" },
      });
    }
  }

  actRe.lastIndex = 0;
  let actM;
  while ((actM = actRe.exec(normalized))) {
    const pp = actM[1] != null ? parseInt(actM[1], 10) : 0;
    const extraCost = (actM[2] || "").trim();
    const cost = { pp };
    if (/\[engage\]/i.test(actM[0]) || /engage/i.test(extraCost)) cost.engage = true;
    if (/burySelf|put this card into its owner's cemetery/i.test(extraCost)) cost.burySelf = true;
    if (/banish/i.test(extraCost)) cost.banishSelf = /this card/i.test(extraCost);
    const lessonM = extraCost.match(/Lesson\s*\((\d+)\)/i);
    if (lessonM) Object.assign(cost, lessonActivateCost(parseInt(lessonM[1], 10)));
    markers.push({
      index: actM.index,
      len: actM[0].length,
      seg: { timing: "activated", cost, text: "", oncePerTurn: /once per turn/i.test(normalized) },
    });
  }

  passiveRe.lastIndex = 0;
  let pM;
  while ((pM = passiveRe.exec(normalized))) {
    const snippet = normalized.slice(pM.index, pM.index + 80);
    let timing = "passive";
    if (/^While\b/i.test(pM[1]) && /\bhave\b|\bcost\b|\bcan't\b/i.test(snippet)) {
      timing = "aura";
    } else if (/your end phase/i.test(pM[0])) {
      timing = "startOfEnd";
    } else if (/opponent's main phase/i.test(pM[0])) {
      timing = "startOfOpponentEnd";
    } else if (/this card is discarded/i.test(pM[0])) {
      timing = "onDiscard";
    } else if (/this card leaves the field|when this leaves the field/i.test(snippet)) {
      timing = "onLeaveField";
    } else if (/this takes ability damage/i.test(snippet)) {
      timing = "onAbilityDamaged";
    } else if (/this follower takes damage/i.test(snippet)) {
      timing = "onDamaged";
    } else if (/enemy follower is put from the field into the cemetery|enemy follower is destroyed/i.test(snippet)) {
      timing = "onEnemyFollowerLeaveField";
    } else if (/is put onto your field/i.test(snippet) && /whenever|when a/i.test(snippet)) {
      timing = "onAllyFollowerEnter";
    } else if (/follower on your field evolves/i.test(snippet)) {
      timing = "onAllyEvolve";
    } else if (/your main phase/i.test(pM[0])) {
      timing = "startOfMain";
    }
    markers.push({
      index: pM.index,
      len: 0,
      seg: { timing, text: "" },
    });
  }

  markers.sort((a, b) => a.index - b.index || b.len - a.len);

  // Deduplicate overlapping markers at same index (prefer longer act match)
  const deduped = [];
  for (const mk of markers) {
    const overlap = deduped.find((d) => Math.abs(d.index - mk.index) < 3);
    if (!overlap) deduped.push(mk);
    else if (mk.len > overlap.len) {
      const idx = deduped.indexOf(overlap);
      deduped[idx] = mk;
    }
  }
  deduped.sort((a, b) => a.index - b.index);

  for (let i = 0; i < deduped.length; i++) {
    const start = deduped[i].index + deduped[i].len;
    const end = i + 1 < deduped.length ? deduped[i + 1].index : normalized.length;
    let body = normalized.slice(start, end).trim();
    body = body.replace(/\.\s*$/, "").trim();
    if (!body) continue;
    segments.push({ ...deduped[i].seg, text: body });
  }

  // Untagged remainder before first marker → default timing
  if (deduped.length > 0 && deduped[0].index > 0) {
    const prefix = normalized.slice(0, deduped[0].index).trim();
    const cleaned = stripStandaloneKeywords(prefix);
    if (isSubstantiveText(cleaned)) {
      segments.unshift({ timing: inferDefaultTiming(card), text: cleaned });
    }
  }

  if (segments.length === 0 && isSubstantiveText(stripStandaloneKeywords(normalized))) {
    segments.push({ timing: inferDefaultTiming(card), text: stripStandaloneKeywords(normalized) });
  }

  return segments;
}

function stripStandaloneKeywords(text) {
  return String(text)
    .replace(/^(?:Ward|Storm|Rush|Assail|Aura|Bane|Drain|Intimidate|Stack)\.\s*/gi, "")
    .trim();
}

// ---------------------------------------------------------------------------
// Segment parsing
// ---------------------------------------------------------------------------

function buildAbility(parsed, seg) {
  const ability = {
    timing: seg.timing === "quick" ? "spell" : seg.timing,
    effect: parsed.effect,
  };
  if (seg.quick || seg.timing === "quick") ability.quick = true;
  if (seg.cost && Object.keys(seg.cost).length) ability.cost = seg.cost;
  if (parsed.condition) ability.condition = parsed.condition;
  if (seg.oncePerTurn) ability.oncePerTurn = true;
  if (parsed.label) ability.label = parsed.label;
  return ability;
}

function parseSegmentBody(text, tokenMap, seg) {
  let remaining = stripIgnorableClauses(stripStandaloneKeywords(text.trim()));
  let confidence = "auto";
  /** @type {object[]} */
  const effects = [];

  const compound = tryParseCompoundEffect(remaining, tokenMap, seg);
  if (compound && !isNoopEffect(compound.effect)) {
    return {
      effects: [compound.effect],
      effect: compound.effect,
      confidence: compound.confidence || "auto",
    };
  }

  const lesson = parseLessonPrefix(remaining);
  if (lesson) {
    const inner = parseSegmentBody(lesson.rest, tokenMap, seg);
    return {
      effects: [inner.effect],
      effect: {
        op: "optionalCost",
        label: `Lesson (${lesson.count})`,
        cost: { op: "banishFromExArea", filter: { trait: "Magical Item" }, count: lesson.count },
        then: inner.effect,
      },
      confidence: maxConfidence("review", inner.confidence),
    };
  }

  const ppLesson = remaining.match(/^\[cost0?(\d+)\],?\s*Lesson\s*\((\d+)\):\s*(.+)$/i);
  if (ppLesson) {
    const inner = parseSegmentBody(ppLesson[3], tokenMap, seg);
    const pp = parseInt(ppLesson[1], 10);
    const lessonCount = parseInt(ppLesson[2], 10);
    return {
      effects: [inner.effect],
      effect: {
        op: "optionalCost",
        label: `[cost${String(pp).padStart(2, "0")}], Lesson (${lessonCount})`,
        cost: {
          op: "sequence",
          steps: [
            { op: "spendPp", amount: pp },
            { op: "banishFromExArea", filter: { trait: "Magical Item" }, count: lessonCount },
          ],
        },
        then: inner.effect,
      },
      confidence: maxConfidence("review", inner.confidence),
    };
  }

  // Cost prefixes: "discard a spell:", "Return X to hand:"
  const costPrefix = remaining.match(/^([^:]+):\s*(.+)$/i);
  if (
    costPrefix &&
    /discard|return|banish|bury|engage|put/i.test(costPrefix[1]) &&
    !/^Earth Rite$/i.test(costPrefix[1].trim())
  ) {
    const costParsed = parseCostPrefix(costPrefix[1], tokenMap);
    const inner = parseSegmentBody(costPrefix[2], tokenMap, seg);
    if (costParsed) {
      return {
        effects: [inner.effect],
        effect: costParsed.wrap(inner.effect),
        confidence: maxConfidence("review", inner.confidence),
        condition: inner.condition,
      };
    }
    remaining = costPrefix[2];
  }

  let condition = parseLeadingCondition(remaining);
  if (condition) {
    remaining = condition.rest;
    confidence = "review";
  } else {
    condition = null;
  }

  // Earth Rite wrapper applies to whole segment body
  const earthRite = /^Earth Rite:\s*/i.test(remaining);
  if (earthRite) remaining = remaining.replace(/^Earth Rite:\s*/i, "");

  // Choose-one blocks
  const choose = tryParseChoose(remaining, tokenMap);
  if (choose) {
    effects.push(choose.effect);
    remaining = choose.rest;
    confidence = maxConfidence(confidence, "review");
  }

  // Iteratively apply phrase patterns
  let guard = 0;
  while (remaining.trim() && guard++ < 40) {
    remaining = stripIgnorableClauses(remaining);
    if (!remaining.trim()) break;
    const before = remaining;
    const hit = parsePhrase(remaining, tokenMap, seg);
    if (hit) {
      effects.push(hit.effect);
      remaining = hit.rest.trim().replace(/^\.\s*/, "");
      confidence = maxConfidence(confidence, hit.confidence || "auto");
      if (remaining.startsWith("and then ")) remaining = remaining.slice(9);
      if (remaining.startsWith("then ")) remaining = remaining.slice(5);
      if (remaining.startsWith(", then ")) remaining = remaining.slice(7);
      continue;
    }
    break;
  }

  if (remaining.trim() && effects.length === 0) {
    const sentences = splitSentences(remaining);
    for (const sentence of sentences) {
      const hit = parsePhrase(sentence, tokenMap, seg);
      if (hit) {
        effects.push(hit.effect);
        confidence = maxConfidence(confidence, hit.confidence || "auto");
      } else if (isSubstantiveText(sentence)) {
        effects.push({ op: "noop", label: sentence.slice(0, 120) });
        confidence = "manual";
      }
    }
    remaining = "";
  } else if (remaining.trim() && effects.length > 0) {
    remaining = stripIgnorableClauses(remaining);
    let tailGuard = 0;
    while (remaining.trim() && tailGuard++ < 40) {
      remaining = remaining.replace(/^\.?\s*/, "").trim();
      if (!remaining.trim()) break;

      const altCond = parseLeadingCondition(remaining);
      if (altCond) {
        const inner = parseSegmentBody(altCond.rest, tokenMap, seg);
        effects.push({
          op: "if",
          condition: altCond.condition,
          then: inner.effect,
        });
        confidence = maxConfidence(confidence, inner.confidence);
        remaining = "";
        continue;
      }

      const hit = parsePhrase(remaining, tokenMap, seg);
      if (hit) {
        effects.push(hit.effect);
        remaining = hit.rest.trim().replace(/^\.\s*/, "");
        if (remaining.startsWith("and then ")) remaining = remaining.slice(9);
        if (remaining.startsWith("then ")) remaining = remaining.slice(5);
        if (remaining.startsWith(", then ")) remaining = remaining.slice(7);
        confidence = maxConfidence(confidence, hit.confidence || "auto");
        continue;
      }

      const noopHit = matchNoopPattern(remaining, {
        tokenMap,
        parseInner: (inner) => parseSegmentBody(inner, tokenMap, seg),
      });
      if (noopHit) {
        effects.push(noopHit.effect);
        remaining = noopHit.rest.trim().replace(/^\.\s*/, "");
        confidence = maxConfidence(confidence, noopHit.confidence || "review");
        continue;
      }

      const sentences = splitSentences(remaining);
      let parsedTail = 0;
      for (const sentence of sentences) {
        const sHit =
          parsePhrase(sentence, tokenMap, seg) ||
          matchNoopPattern(sentence, {
            tokenMap,
            parseInner: (inner) => parseSegmentBody(inner, tokenMap, seg),
          });
        if (sHit) {
          effects.push(sHit.effect);
          parsedTail++;
          confidence = maxConfidence(confidence, sHit.confidence || "auto");
        }
      }
      if (parsedTail > 0) {
        remaining = "";
        continue;
      }

      if (remaining.trim() && isSubstantiveText(remaining)) {
        effects.push({ op: "noop", label: remaining.trim().slice(0, 120) });
        confidence = "manual";
      }
      break;
    }
  }

  let effect = collapseEffects(effects);

  if (earthRite) {
    effect = {
      op: "optionalCost",
      label: "Earth Rite",
      cost: { op: "noop" },
      then: effect,
    };
    confidence = maxConfidence(confidence, "review");
  }

  if (condition?.condition) {
    effect = {
      op: "if",
      condition: condition.condition,
      then: effect,
    };
    confidence = maxConfidence(confidence, "review");
  }

  // Passive / aura wrappers
  if (seg.timing === "passive") {
    const passive = buildPassiveEffect(remaining || text, effect, tokenMap);
    if (passive) {
      effect = passive.effect;
      confidence = maxConfidence(confidence, passive.confidence);
    }
  } else if (seg.timing === "aura") {
    const aura = buildAuraEffect(text, effect);
    effect = aura.effect || aura;
    confidence = maxConfidence(confidence, aura.confidence || "review");
  }

  return { effects: effects.length ? [effect] : effect.op === "noop" ? [effect] : [], effect, confidence, condition: condition?.condition, label: seg.label };
}

function collapseEffects(effects) {
  if (!effects.length) return { op: "noop" };
  if (effects.length === 1) return effects[0];
  return { op: "sequence", steps: effects };
}

function splitSentences(text) {
  return String(text)
    .split(/\.\s+(?=[A-Z([])/)
    .map((s) => s.replace(/\.\s*$/, "").trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

function parseCostPrefix(prefix, tokenMap) {
  if (/discard a spell/i.test(prefix)) {
    return {
      wrap: (then) => ({
        op: "optionalCost",
        label: "Discard a spell",
        cost: { op: "discard", count: 1 },
        then,
      }),
    };
  }
  if (/return another card on your field to its owner'?s hand/i.test(prefix)) {
    return {
      wrap: (then) => ({
        op: "sequence",
        steps: [
          { op: "returnToHand", targets: { type: "selfFollower", count: 1, excludeSelf: true } },
          then,
        ],
      }),
    };
  }
  return null;
}

function parseLeadingCondition(text) {
  const spellchain = text.match(/^Spellchain\s*\((\d+)\):\s*/i);
  if (spellchain) {
    return {
      condition: { type: "spellchain", count: parseInt(spellchain[1], 10) },
      rest: text.slice(spellchain[0].length),
    };
  }
  const necro = text.match(/^Necrocharge\s*\((\d+)\):\s*/i);
  if (necro) {
    return {
      condition: { type: "necrocharge", count: parseInt(necro[1], 10) },
      rest: text.slice(necro[0].length),
    };
  }
  const combo = text.match(/^Combo\s*\((\d+)\):\s*/i);
  if (combo) {
    return {
      condition: { type: "combo", count: parseInt(combo[1], 10) },
      rest: text.slice(combo[0].length),
    };
  }
  if (/^Overflow is active for you:\s*/i.test(text)) {
    return {
      condition: { type: "overflow" },
      rest: text.replace(/^Overflow is active for you:\s*/i, ""),
    };
  }
  if (/^If Overflow is active for you,\s*/i.test(text)) {
    return {
      condition: { type: "overflow" },
      rest: text.replace(/^If Overflow is active for you,\s*/i, ""),
    };
  }
  const ppMin = text.match(/^If you have at least (\d+) play points,?\s*/i);
  if (ppMin) {
    return {
      condition: { type: "ppMin", count: parseInt(ppMin[1], 10) },
      rest: text.slice(ppMin[0].length),
    };
  }
  const exArea = text.match(/^If this card is in your EX area,?\s*/i);
  if (exArea) {
    return {
      condition: { type: "inExArea" },
      rest: text.slice(exArea[0].length),
    };
  }
  if (/^If Sanguine is active for you,\s*/i.test(text)) {
    return {
      condition: { type: "sanguine" },
      rest: text.replace(/^If Sanguine is active for you,\s*/i, ""),
    };
  }
  if (/^While Sanguine is active for you,\s*/i.test(text)) {
    return {
      condition: { type: "sanguine" },
      rest: text.replace(/^While Sanguine is active for you,\s*/i, ""),
    };
  }
  const oppCem = text.match(/^If there are at least (\d+) cards in opponents'? cemeteries,?\s*/i);
  if (oppCem) {
    return {
      condition: { type: "opponentCemeteryMin", count: parseInt(oppCem[1], 10) },
      rest: text.slice(oppCem[0].length),
    };
  }
  const fieldTrait = text.match(/^If there are at least (\d+) (.+?) cards on your field,?\s*/i);
  if (fieldTrait) {
    return {
      condition: {
        type: "fieldTraitMin",
        trait: fieldTrait[2].trim(),
        count: parseInt(fieldTrait[1], 10),
      },
      rest: text.slice(fieldTrait[0].length),
    };
  }
  if (/^If there is an amulet on your field,?\s*/i.test(text)) {
    return {
      condition: { type: "amuletOnField" },
      rest: text.replace(/^If there is an amulet on your field,?\s*/i, ""),
    };
  }
  return null;
}

function tryParseCompoundEffect(text, tokenMap, seg) {
  const selectBuffDraw = text.match(
    /^Select a follower on your field\.?\s+Give (?:it|them) \+(\d+)\/\+(\d+)(?:\s+and\s+(.+?))?\.?$/i,
  );
  if (selectBuffDraw) {
    const steps = [
      {
        op: "buff",
        atk: parseInt(selectBuffDraw[1], 10),
        def: parseInt(selectBuffDraw[2], 10),
        targets: { type: "selfFollower", count: 1 },
      },
    ];
    if (selectBuffDraw[3]) {
      const extra = parsePhrase(selectBuffDraw[3].trim(), tokenMap, seg);
      if (extra) steps.push(extra.effect);
    }
    return {
      effect: steps.length === 1 ? steps[0] : { op: "sequence", steps },
      confidence: "auto",
    };
  }

  const selectEnemyThen = text.match(
    /^Select an enemy follower on the field\.?\s+(.+)$/i,
  );
  if (selectEnemyThen) {
    const inner = parseSegmentBody(selectEnemyThen[1], tokenMap, seg);
    if (!isNoopEffect(inner.effect)) {
      return { effect: inner.effect, confidence: inner.confidence };
    }
  }

  const selectEnemyAmulet = text.match(
    /^Select an enemy amulet on the field and (destroy|banish) it/i,
  );
  if (selectEnemyAmulet) {
    const op = selectEnemyAmulet[1].toLowerCase() === "banish" ? "banish" : "destroy";
    return {
      effect: {
        op,
        targets: { type: "enemyFieldCard", count: 1, filter: { cardType: "amulet" } },
      },
      confidence: "review",
    };
  }

  const dealItAndSelfLeader = text.match(
    /^Deal (\d+) damage to it and (\d+) damage to your leader/i,
  );
  if (dealItAndSelfLeader) {
    return {
      effect: {
        op: "sequence",
        steps: [
          {
            op: "dealDamage",
            amount: parseInt(dealItAndSelfLeader[1], 10),
            targets: { type: "enemyFollower", count: 1 },
          },
          {
            op: "dealDamage",
            amount: parseInt(dealItAndSelfLeader[2], 10),
            targets: { type: "selfLeader" },
          },
        ],
      },
      confidence: "review",
    };
  }

  const selectSelfThen = text.match(/^Select a follower on your field\.?\s+(.+)$/i);
  if (selectSelfThen) {
    const inner = parseSegmentBody(selectSelfThen[1], tokenMap, seg);
    if (!isNoopEffect(inner.effect)) {
      return { effect: inner.effect, confidence: inner.confidence };
    }
  }

  return null;
}

function parseInlineConditionPrefix(text) {
  const m = text.match(/^If Overflow is active for you,\s*/i);
  if (m) return { condition: { type: "overflow" }, rest: text.slice(m[0].length) };
  const s = text.match(/^If Sanguine is active for you,\s*/i);
  if (s) return { condition: { type: "sanguine" }, rest: text.slice(s[0].length) };
  return null;
}

// ---------------------------------------------------------------------------
// Choose parsers
// ---------------------------------------------------------------------------

function tryParseChoose(text, tokenMap) {
  if (!/choose (?:one|up to \d+)/i.test(text)) return null;

  let optionStart = text.indexOf("(1)");
  if (optionStart < 0) {
    const effectOption = text.search(
      /\(\d+\)\s*(?:Select|Summon|Draw|Deal|Put|Destroy|Give|Look|Heal|Recover|Bury|Banish|Increase|Return|Choose|Search)/i,
    );
    optionStart = effectOption;
  }
  if (optionStart < 0) return null;

  const header = text.slice(0, optionStart);
  if (!/choose/i.test(header)) return null;

  const upgrade = header.match(/Necrocharge\s*\((\d+)\):\s*Choose up to (\d+) instead/i);
  const optionBlock = text.slice(optionStart);
  const options = parseChooseOptions(optionBlock, tokenMap);
  if (!options.length) return null;

  const baseChoose = {
    op: "choose",
    min: 1,
    max: 1,
    options,
  };

  let effect = baseChoose;
  if (upgrade) {
    effect = {
      op: "if",
      condition: { type: "necrocharge", count: parseInt(upgrade[1], 10) },
      then: {
        op: "chooseMultiple",
        min: 1,
        max: parseInt(upgrade[2], 10),
        options,
      },
      else: baseChoose,
    };
  }

  return { effect, rest: "" };
}

function parseChooseOptions(optionBlock, tokenMap) {
  const markers = [...optionBlock.matchAll(/\((\d+)\)/g)];
  if (!markers.length) return [];

  const options = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index + markers[i][0].length;
    const end = i + 1 < markers.length ? markers[i + 1].index : optionBlock.length;
    const label = optionBlock.slice(start, end).trim().replace(/\.\s*$/, "");
    if (!label) continue;
    const costBury = label.match(/^\[cost0?(\d+)\],?\s*bury this:\s*(.+)$/i);
    let parsed;
    if (costBury) {
      const inner = parseSegmentBody(costBury[2], tokenMap, { timing: "fanfare" });
      parsed = {
        effect: {
          op: "optionalCost",
          cost: {
            op: "sequence",
            steps: [
              { op: "spendPp", amount: parseInt(costBury[1], 10) },
              { op: "burySelf" },
            ],
          },
          then: inner.effect,
        },
        confidence: "review",
      };
    } else {
      parsed = parseSegmentBody(label, tokenMap, { timing: "fanfare" });
    }
    options.push({
      label: `(${markers[i][1]}) ${label.slice(0, 60)}`,
      effect: parsed.effect,
    });
  }
  return options;
}

// ---------------------------------------------------------------------------
// Phrase patterns (ordered most-specific first)
// ---------------------------------------------------------------------------

function parsePhrase(text, tokenMap, seg) {
  const parsers = [
    parseDealDamageAllEnemies,
    parseDealDamageEachLeader,
    parseDealDamageSelfLeader,
    parseDealDamageSplit,
    parseSelectDealDamage,
    parseSelectDestroy,
    parseSelectBanish,
    parseDamageEqualAttack,
    parseDealDamageLeader,
    parseDraw,
    parseDiscard,
    parseHealLeader,
    parseMill,
    parseBuryTopCard,
    parseMillOpponent,
    parseSummon,
    parsePutTokenExArea,
    parseMoveSelfToExArea,
    parseBuffFieldTrait,
    parseBuffSelf,
    parseBuffOther,
    parseGrantOnNextPlay,
    parseOptionalTokenFieldOrEx,
    parseSelectDebuff,
    parseSelectEngageMultiple,
    parseGiveItBuff,
    parseGrantKeyword,
    parseSearchDeck,
    parseSearchDeckChoose,
    parseLookAtDeckReveal,
    parseTutorCemetery,
    parseEngageDestroy,
    parseEngage,
    parseDestroy,
    parseDestroyEachOther,
    parseBanish,
    parseReturnToHand,
    parseTransform,
    parseRecoverPp,
    parseSpendPp,
    parsePlayCostReduction,
    parseRefresh,
    parseOnRaceDriveBuff,
    parseClash,
    parseMoveToExArea,
    parseBuryFieldFollowers,
    parseAddStack,
    parseReviveToField,
    parseBox,
    parseCannotAttack,
    parseCannotAttackLeaders,
    parseDiscardToExArea,
    parseEvolveSelf,
    parseBanishFromDeck,
    parseIncreaseMaxPp,
    parseBanishExArea,
    parseSpellchainRecover,
  ];

  for (const fn of parsers) {
    const hit = fn(text, tokenMap, seg);
    if (hit) return hit;
  }

  const noop = matchNoopPattern(text, {
    tokenMap,
    seg,
    parseInner: (inner) => parseSegmentBody(inner, tokenMap, seg),
  });
  if (noop) return noop;

  return null;
}

function parseDealDamageAllEnemies(text) {
  const m = text.match(
    /^Deal (\d+) damage to each (enemy follower|enemy|follower)(?:s)?(?: on the field)?/i,
  );
  if (!m) return null;
  const allFollowers = /^Deal (\d+) damage to each follower on the field/i.test(text);
  if (allFollowers) {
    const m2 = text.match(/^Deal (\d+) damage to each follower on the field/i);
    return {
      effect: { op: "dealDamageAllEnemies", amount: parseInt(m2[1], 10), followersOnly: true },
      rest: text.slice(m2[0].length).trim(),
      confidence: "auto",
    };
  }
  const followersOnly = /enemy follower/i.test(m[2]);
  return {
    effect: { op: "dealDamageAllEnemies", amount: parseInt(m[1], 10), followersOnly },
    rest: text.slice(m[0].length).replace(/^ on the field/i, "").trim(),
    confidence: "auto",
  };
}

function parseDealDamageSplit(text) {
  const m = text.match(
    /^Select (?:an enemy follower|up to (\d+) enemy followers) on the field and deal (\d+) damage divided between them/i,
  );
  if (!m) return null;
  const maxTargets = m[1] ? parseInt(m[1], 10) : 1;
  return {
    effect: {
      op: "dealDamageSplit",
      primaryAmount: parseInt(m[2], 10),
      secondaryAmount: 0,
      maxTargets,
      targets: { type: "enemyFollower", count: maxTargets },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseSelectDealDamage(text) {
  const patterns = [
    /^Select (?:an enemy leader or enemy follower|an enemy follower|another follower|a follower|an enemy leader) on the field and deal (?:it |them )?(\d+) damage/i,
    /^Select up to (\d+) enemy followers on the field and deal (?:them )?(\d+) damage(?: to each)?/i,
    /^Select an enemy follower that costs (\d+) play points or less on the field and deal it (\d+) damage/i,
    /^Select an enemy follower on the field and deal it damage equal to this follower's attack/i,
    /^Select an enemy follower on the field and deal it X damage\.? X equals this follower's attack/i,
    /^Select an enemy follower on the field and deal it damage equal to its attack/i,
    /^Select an enemy follower on the field and deal it X damage\.? X equals the selected follower's attack/i,
    /^Select an enemy follower on the field and deal it X damage\.? X equals (.+)$/i,
    /^Select up to (\d+) enemy followers on the field and deal (?:them )?X damage\.? X equals (.+)$/i,
    /^Select an enemy follower on the field and deal it (\d+) damage/i,
    /^Select an enemy follower on the field$/i,
    /^Deal (\d+) damage to (?:the )?selected enemy/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    if (/^Select an enemy follower on the field$/i.test(m[0])) {
      return {
        effect: {
          op: "dealDamage",
          amount: 1,
          targets: { type: "enemyFollower", count: 1 },
        },
        rest: "",
        confidence: "review",
      };
    }
    if (/damage equal to its attack|X equals the selected follower's attack/i.test(m[0])) {
      return {
        effect: {
          op: "dealDamage",
          amount: { op: "targetAttack" },
          targets: { type: "enemyFollower", count: 1 },
        },
        rest: text.slice(m[0].length).trim(),
        confidence: "review",
      };
    }
    const xVar = m[0].match(/X equals (.+)$/i);
    if (xVar) {
      const varAmt = parseVariableDamageAmount(xVar[1].trim());
      if (varAmt) {
        let targets = { type: "enemyFollower", count: 1 };
        if (/up to (\d+)/i.test(m[0])) {
          targets = { type: "enemyFollower", count: parseInt(m[1], 10) };
        }
        return {
          effect: { op: "dealDamage", amount: varAmt, targets },
          rest: text.slice(m[0].length).trim(),
          confidence: "review",
        };
      }
    }
    if (/damage equal to|X equals this follower's attack/i.test(m[0])) {
      return {
        effect: {
          op: "dealDamage",
          amount: { op: "selfAttack" },
          targets: { type: "enemyFollower", count: 1 },
        },
        rest: text.slice(m[0].length).trim(),
        confidence: "review",
      };
    }
    const multDmg = parseMultiplierDamage(m[0] + " " + text);
    if (multDmg) {
      return {
        effect: {
          op: "dealDamage",
          amount: multDmg.amount,
          targets: { type: "enemyFollower", count: 1 },
        },
        rest: text.slice(m[0].length).trim(),
        confidence: multDmg.confidence,
      };
    }
    const amount = parseInt(m[m.length - 1], 10);
    let targets = { type: "enemyFollower", count: 1 };
    if (/enemy leader or/i.test(m[0])) targets = { type: "enemyFieldCard", count: 1 };
    else if (/enemy leader/i.test(m[0]) && !/or enemy follower/i.test(m[0])) {
      targets = { type: "enemyLeader" };
    } else if (/another follower|a follower/i.test(m[0]) && !/enemy/i.test(m[0])) {
      targets = { type: "anyFollower", count: 1 };
    } else if (m[1] && /up to/i.test(m[0])) {
      targets = { type: "enemyFollower", count: parseInt(m[1], 10) };
    }
    return {
      effect: { op: "dealDamage", amount, targets },
      rest: text.slice(m[0].length).trim(),
      confidence: /X equals|enemy leader or/i.test(text) ? "manual" : "review",
    };
  }

  const comboAlt = text.match(/^(?:Deal )?(\d+) damage instead\.?/i);
  if (comboAlt) {
    return {
      effect: {
        op: "dealDamage",
        amount: parseInt(comboAlt[1], 10),
        targets: { type: "enemyFollower", count: 1 },
      },
      rest: text.slice(comboAlt[0].length).trim(),
      confidence: "review",
    };
  }
  return null;
}

function parseDealDamageEachLeader(text) {
  const m = text.match(/^Deal (\d+) damage to each leader/i);
  if (!m) return null;
  return {
    effect: {
      op: "sequence",
      steps: [
        { op: "dealDamage", amount: parseInt(m[1], 10), targets: { type: "enemyLeader" } },
        { op: "dealDamage", amount: parseInt(m[1], 10), targets: { type: "selfLeader" } },
      ],
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseDealDamageSelfLeader(text) {
  const m = text.match(/^Deal (\d+) damage to your leader/i);
  if (!m) return null;
  return {
    effect: {
      op: "dealDamage",
      amount: parseInt(m[1], 10),
      targets: { type: "selfLeader" },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "auto",
  };
}

function parseGrantOnNextPlay(text) {
  const m = text.match(
    /^The next time you put a follower onto your field this turn by playing it, give it \+(\d+)\/\+(\d+)/i,
  );
  if (!m) return null;
  return {
    effect: {
      op: "grantOnCardPlayed",
      filter: { cardType: "follower" },
      untilEndOfTurn: true,
      effect: {
        op: "buff",
        atk: parseInt(m[1], 10),
        def: parseInt(m[2], 10),
        targets: { type: "self" },
      },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseGiveItBuff(text) {
  const m = text.match(/^Give (?:it|them) \+(\d+)\/\+(\d+)(?:\s+and\s+(.+))?\.?$/i);
  if (!m) return null;
  const steps = [
    {
      op: "buff",
      atk: parseInt(m[1], 10),
      def: parseInt(m[2], 10),
      targets: { type: "selfFollower", count: 1 },
    },
  ];
  let rest = "";
  if (m[3]) {
    const extra = parsePhrase(m[3].trim(), {}, {});
    if (extra) {
      steps.push(extra.effect);
      rest = extra.rest;
    }
  }
  return {
    effect: steps.length === 1 ? steps[0] : { op: "sequence", steps },
    rest,
    confidence: "review",
  };
}

function parseSelectDebuff(text) {
  const m =
    text.match(/^Select an enemy follower on the field and give it \[atk\]-(\d+)(?:\/\[def\]-(\d+))?/i) ||
    text.match(/^Select an enemy follower on the field and give it \[attack\]-(\d+)/i);
  if (!m) return null;
  const atk = -parseInt(m[1], 10);
  const def = m[2] ? -parseInt(m[2], 10) : atk;
  return {
    effect: {
      op: "buff",
      atk,
      def,
      targets: { type: "enemyFollower", count: 1 },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseOptionalTokenFieldOrEx(text, tokenMap) {
  const m = text.match(
    /^You may put (?:a |an )?(.+?) tokens? onto your field or into your EX area/i,
  );
  if (!m) return null;
  const tok = resolveToken(m[1], tokenMap);
  return {
    effect: {
      op: "choose",
      min: 0,
      max: 1,
      options: [
        {
          label: "field",
          effect: { op: "summon", ...tok, count: 1, zone: "field" },
        },
        {
          label: "EX area",
          effect: { op: "summon", ...tok, count: 1, zone: "exArea" },
        },
      ],
    },
    rest: text.slice(m[0].length).trim(),
    confidence: tok.tokenCardNo ? "review" : "manual",
  };
}

function parseSelectEngageMultiple(text) {
  const m = text.match(/^Select up to (\d+) enemy followers on the field and engage them/i);
  if (!m) return null;
  return {
    effect: {
      op: "engage",
      targets: { type: "enemyFollower", count: parseInt(m[1], 10) },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseDestroyEachOther(text) {
  const m = text.match(/^Destroy each other follower on the field/i);
  if (!m) return null;
  return {
    effect: {
      op: "destroy",
      targets: { type: "anyFollower", count: 99 },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseSelectDestroy(text) {
  const m = text.match(
    /^Select (?:up to (\d+) )?enemy followers? on the field and destroy them/i,
  );
  if (!m) return null;
  return {
    effect: {
      op: "destroy",
      targets: { type: "enemyFollower", count: m[1] ? parseInt(m[1], 10) : 1 },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseSelectBanish(text) {
  const m = text.match(
    /^Select (?:an enemy follower with (\d+) defense or less|an enemy follower that costs (\d+) play points or less|an enemy follower) on the field and banish it/i,
  );
  if (!m) return null;
  return {
    effect: {
      op: "banish",
      targets: {
        type: "enemyFollower",
        count: 1,
        ...(m[1] ? { maxDef: parseInt(m[1], 10) } : {}),
        ...(m[2] ? { maxCost: parseInt(m[2], 10) } : {}),
      },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseDamageEqualAttack(text) {
  const m = text.match(/^Deal damage equal to this follower's attack/i);
  if (!m) return null;
  return {
    effect: {
      op: "dealDamage",
      amount: { op: "selfAttack" },
      targets: { type: "enemyFollower", count: 1 },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseBuryTopCard(text) {
  const m = text.match(/^Bury the top card of your deck/i);
  if (!m) return null;
  return {
    effect: { op: "mill", count: 1 },
    rest: text.slice(m[0].length).trim(),
    confidence: "auto",
  };
}

function parseMoveSelfToExArea(text) {
  const m = text.match(/^Put this card into its owner's EX area/i);
  if (!m) return null;
  return {
    effect: { op: "moveSourceToExArea" },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parsePlayCostReduction(text) {
  const m = text.match(/^It costs (\d+) less to play this turn/i);
  if (!m) return null;
  return {
    effect: { op: "playCostReduction", amount: parseInt(m[1], 10) },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseRefresh(text) {
  const m = text.match(/^Refresh this follower/i);
  if (!m) return null;
  return {
    effect: { op: "refresh", targets: { type: "self" } },
    rest: text.slice(m[0].length).trim(),
    confidence: "auto",
  };
}

function parseOnRaceDriveBuff(text) {
  const m = text.match(/^On (?:Race|Drive)\s*[-:]\s*Give this follower \+(\d+)\/\+(\d+)/i);
  if (!m) return null;
  return {
    effect: {
      op: "buff",
      atk: parseInt(m[1], 10),
      def: parseInt(m[2], 10),
      targets: { type: "self" },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseLookAtDeckReveal(text) {
  const patterns = [
    /^Look at the top card of your deck\.?$/i,
    /^Reveal the top card of your deck\.?$/i,
    /^Look at the top card of your deck\. If it's a spell, you may reveal it and add it to your hand/i,
    /^Reveal the top card of your deck\. If it's a spell, you may add it to your hand/i,
    /^Look at the top (\d+) cards? of your deck\. You may reveal a (.+?) from among them and add it to your hand/i,
    /^Look at the top (\d+) cards? of your deck/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    if (/top card/i.test(m[0]) && /spell/i.test(m[0])) {
      return {
        effect: {
          op: "searchDeckChoose",
          filter: { cardType: "spell" },
          lookAt: 1,
          to: "hand",
          optional: true,
          remainderTo: "deckBottom",
          reveal: true,
        },
        rest: text.slice(m[0].length).trim(),
        confidence: "review",
      };
    }
    if (/^Look at the top card of your deck|^Reveal the top card of your deck/i.test(m[0])) {
      return {
        effect: {
          op: "searchDeckChoose",
          lookAt: 1,
          to: "hand",
          optional: true,
          remainderTo: "deckBottom",
          reveal: /reveal/i.test(m[0]),
        },
        rest: text.slice(m[0].length).trim(),
        confidence: "review",
      };
    }
    const lookAt = m[1] ? parseInt(m[1], 10) : 1;
    const filter = m[2] ? parseDeckFilter(m[2]) : {};
    return {
      effect: {
        op: "searchDeckChoose",
        filter,
        lookAt,
        to: /onto your field/i.test(m[0]) ? "field" : "hand",
        optional: true,
        remainderTo: "deckBottom",
        reveal: true,
      },
      rest: text.slice(m[0].length).trim(),
      confidence: "review",
    };
  }
  return null;
}

function parseDealDamageLeader(text) {
  const m = text.match(/^Deal (\d+) damage to (?:that follower's leader|its leader|the enemy leader)/i);
  if (!m) return null;
  return {
    effect: {
      op: "dealDamage",
      amount: parseInt(m[1], 10),
      targets: { type: "enemyLeader" },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseDraw(text) {
  const m = text.match(/^Draw (\d+|a) cards?(?:\.|,|$)/i) || text.match(/^Draw a card/i);
  if (!m) return null;
  const count = m[1] === "a" || !m[1] ? 1 : parseInt(m[1], 10);
  return {
    effect: { op: "draw", count },
    rest: text.slice(m[0].length).replace(/^,\s*then\s*/i, "").trim(),
    confidence: "auto",
  };
}

function parseDiscard(text) {
  const m =
    text.match(/^Discard (\d+|a) cards?(?:\.|,|$)/i) ||
    text.match(/^Discard a card/i) ||
    text.match(/^(?:, )?then discard (?:a card|(\d+) cards?)/i);
  if (!m) return null;
  const count = !m[1] || m[1] === "a" ? 1 : parseInt(m[1], 10);
  return {
    effect: { op: "discard", count },
    rest: text.slice(m[0].length).trim(),
    confidence: "auto",
  };
}

function parseHealLeader(text) {
  const m =
    text.match(/^Heal your leader(?: for | by | )(\d+)/i) ||
    text.match(/^Give your leader \[def\]\+(\d+)/i) ||
    text.match(/^Give your leader \[defense\]\+(\d+)/i);
  if (!m) return null;
  return {
    effect: { op: "healLeader", amount: parseInt(m[1], 10) },
    rest: text.slice(m[0].length).trim(),
    confidence: "auto",
  };
}

function parseMill(text) {
  const m =
    text.match(/^Bury the top (\d+) cards? of your deck/i) ||
    text.match(/^Put the top (\d+) cards? of your deck into your cemetery/i) ||
    text.match(/^Put the top card of your deck into your (?:cemetery|EX area)/i);
  if (!m) return null;
  if (/EX area/i.test(m[0])) {
    return {
      effect: { op: "moveToExArea", targets: { type: "self" } },
      rest: text.slice(m[0].length).trim(),
      confidence: "review",
    };
  }
  const count = m[1] ? parseInt(m[1], 10) : 1;
  return {
    effect: { op: "mill", count },
    rest: text.slice(m[0].length).trim(),
    confidence: "auto",
  };
}

function parseMillOpponent(text) {
  const m = text.match(/^Bury the top (\d+) cards? of (?:each opponent's|your opponent's) deck/i);
  if (!m) return null;
  return {
    effect: { op: "millOpponent", count: parseInt(m[1], 10) },
    rest: text.slice(m[0].length).trim(),
    confidence: "auto",
  };
}

function resolveToken(nameRaw, tokenMap) {
  const aliases = {
    "magical item": "Cool Earrings",
    "assembly droid": "Assembly Droid",
  };
  let cleaned = normalizeIdentityName(
    String(nameRaw)
      .replace(/\s+tokens?$/i, "")
      .replace(/^(?:a|an)\s+/i, "")
      .trim(),
  );
  const aliasKey = cleaned.toLowerCase();
  if (aliases[aliasKey]) cleaned = normalizeIdentityName(aliases[aliasKey]);
  const cardNo = tokenMap?.nameToCardNo?.[cleaned];
  if (cardNo) return { tokenCardNo: cardNo, tokenName: cleaned };
  return { tokenName: cleaned };
}

function parseSummon(text, tokenMap) {
  const multi = text.match(/^Summon (?:a |an )?(.+?) tokens?\.?$/i);
  if (multi && /,| and /i.test(multi[1])) {
    const names = multi[1].split(/,\s*(?:and\s+)?| and /i).map((n) => n.trim());
    const steps = names.map((n) => {
      const tok = resolveToken(n, tokenMap);
      return { op: "summon", ...tok, count: 1, zone: "field" };
    });
    return {
      effect: steps.length === 1 ? steps[0] : { op: "sequence", steps },
      rest: "",
      confidence: "review",
    };
  }

  const patterns = [
    /^Summon (?:a|an|(\d+)) ([^.]+?) tokens?(?:\s+on (?:that follower's|the) field)?/i,
    /^Summon (?:a|an|(\d+)) ([^.]+?)(?:\s+and put|\.|,|$)/i,
    /^Destroy it and summon (?:a|an|(\d+)) ([^.]+?) tokens?/i,
    /^Combo \(\d+\): Destroy it and summon (?:a|an|(\d+)) ([^.]+?) tokens?/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const count = m[1] ? parseInt(m[1], 10) : 1;
    const tok = resolveToken(m[2], tokenMap);
    const zone = /EX area/i.test(text) ? "exArea" : "field";
    return {
      effect: { op: "summon", ...tok, count, zone },
      rest: text.slice(m[0].length).trim(),
      confidence: tok.tokenCardNo ? "auto" : "review",
    };
  }
  return null;
}

function parsePutTokenExArea(text, tokenMap) {
  const m = text.match(/^Put (?:(\d+)|a) ([^.]+?) tokens? into your EX area/i);
  if (!m) return null;
  const count = m[1] ? parseInt(m[1], 10) : 1;
  const tok = resolveToken(m[2], tokenMap);
  return {
    effect: { op: "summon", ...tok, count, zone: "exArea" },
    rest: text.slice(m[0].length).trim(),
    confidence: tok.tokenCardNo ? "auto" : "review",
  };
}

function parseStatBuff(m) {
  const plus = m[0].match(/\+(\d+)\/\+(\d+)/);
  if (plus) return { atk: parseInt(plus[1], 10), def: parseInt(plus[2], 10) };
  const atk = m[0].match(/\[atk\]\+(\d+)|\[attack\]\+(\d+)|\+(\d+) atk/i);
  const def = m[0].match(/\[def\]\+(\d+)|\[defense\]\+(\d+)|\+(\d+) def/i);
  return {
    atk: atk ? parseInt(atk[1] || atk[2] || atk[3], 10) : undefined,
    def: def ? parseInt(def[1] || def[2] || def[3], 10) : undefined,
  };
}

function parseTraitOrClass(fragment) {
  const classM = fragment.match(/\[(forestcraft|swordcraft|runecraft|dragoncraft|shadowcraft|havencraft|portalcraft|neutral)\]/i);
  if (classM) return { cardClass: CLASS_ALIASES[classM[1].toLowerCase()] || classM[1].toLowerCase() };
  const traitM = fragment.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
  if (traitM && !/other|each|your|field|follower/i.test(traitM[1])) return { trait: traitM[1] };
  return null;
}

function parseBuffFieldTrait(text) {
  const patterns = [
    /^Give (?:each )?(?:other )?(?:\[?\w+\]? )?(\w+(?:\s+\w+)?|\[[^\]]+\]) followers?(?: on your field and in your EX area| on your field)? (?:\+(\d+)\/\+(\d+)|\[atk\]\+(\d+)\/\[def\]\+(\d+))/i,
    /^Give (?:each )?(?:other )?(\w+(?:\s+\w+)?) followers?(?: on your field and in your EX area| on your field)? (?:\+(\d+)\/\+(\d+)|\[atk\]\+(\d+)(?:\/\[def\]\+(\d+))?)/i,
    /^Give (?:each )?\[([^\]]+)\] followers?(?: on your field)? (?:\+(\d+)\/\+(\d+)|\[atk\]\+(\d+)\/\[def\]\+(\d+))/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const filter = parseTraitOrClass(m[1]) || { trait: m[1].replace(/^\[|\]$/g, "") };
    const atk = parseInt(m[2] || m[4] || m[5], 10);
    const def = parseInt(m[3] || m[6] || m[4], 10) || atk;
    const excludeSelf = /other/i.test(m[0]);
    const op = filter.cardClass
      ? { op: "buffFieldTrait", cardClass: filter.cardClass, atk, def, excludeSelf }
      : { op: "buffFieldTrait", trait: filter.trait, atk, def, excludeSelf };
    return {
      effect: op,
      rest: text.slice(m[0].length).trim(),
      confidence: "review",
    };
  }
  return null;
}

function parseBuffSelf(text) {
  const m =
    text.match(/^Give this follower (\+(\d+)\/\+(\d+)|\[atk\]\+(\d+)|\[def\]\+(\d+)|\[attack\]\+X)/i) ||
    text.match(/^Give this follower \[attack\]\+X/i);
  if (!m) return null;
  if (/\+X|\[attack\]\+X/i.test(m[0])) {
    return {
      effect: { op: "buff", targets: { type: "self" }, label: "variable atk buff" },
      rest: text.slice(m[0].length).trim(),
      confidence: "manual",
    };
  }
  const stats =
    m[2] && m[3]
      ? { atk: parseInt(m[2], 10), def: parseInt(m[3], 10) }
      : { atk: m[4] ? parseInt(m[4], 10) : undefined, def: m[5] ? parseInt(m[5], 10) : undefined };
  return {
    effect: { op: "buff", ...stats, targets: { type: "self" } },
    rest: text.slice(m[0].length).trim(),
    confidence: /X equals/i.test(text) ? "manual" : "auto",
  };
}

function parseBuffOther(text) {
  const selectBuff = text.match(
    /^Select (?:another follower|a follower|a (.+?) follower) on your field and give (?:it |them )?(?:\+(\d+)\/\+(\d+)|\[atk\]\+(\d+)|Assail|Storm|Ward|Rush|Aura)/i,
  );
  if (selectBuff) {
    if (/Assail|Storm|Ward|Rush|Aura/i.test(selectBuff[0]) && !selectBuff[1]) {
      const kw = selectBuff[0].match(/Assail|Storm|Ward|Rush|Aura/i)[0].toLowerCase();
      return {
        effect: {
          op: "grantKeyword",
          keyword: kw,
          targets: { type: "selfFollower", count: 1, excludeSelf: /another/i.test(selectBuff[0]) },
        },
        rest: text.slice(selectBuff[0].length).trim(),
        confidence: "review",
      };
    }
    const atk = parseInt(selectBuff[1] || selectBuff[3], 10);
    const def = parseInt(selectBuff[2], 10) || atk;
    return {
      effect: {
        op: "buff",
        atk,
        def: def || undefined,
        targets: { type: "selfFollower", count: 1, excludeSelf: /another/i.test(selectBuff[0]) },
      },
      rest: text.slice(selectBuff[0].length).trim(),
      confidence: "review",
    };
  }

  const m = text.match(
    /^Give (?:each other follower|another follower|a follower|each follower)(?: on your field)? (?:\+(\d+)\/\+(\d+)|\[atk\]\+(\d+)|Assail|Storm|Ward|Rush)/i,
  );
  if (!m) return null;
  if (/Assail|Storm|Ward|Rush/i.test(m[0]) && !m[2]) {
    const kw = m[0].match(/Assail|Storm|Ward|Rush/i)[0].toLowerCase();
    const targets = /another follower|a follower/i.test(m[0])
      ? { type: "selfFollower", count: 1, excludeSelf: true }
      : { type: "selfFollower", count: 99, excludeSelf: true };
    return {
      effect: { op: "grantKeyword", keyword: kw === "assail" ? "assail" : kw, targets },
      rest: text.slice(m[0].length).trim(),
      confidence: "review",
    };
  }
  const stats = { atk: parseInt(m[2] || m[4], 10), def: parseInt(m[3], 10) };
  const targets = /another follower|a follower/i.test(m[0])
    ? { type: "selfFollower", count: 1, excludeSelf: true }
    : { type: "selfFollower", count: 99, excludeSelf: true };
  return {
    effect: { op: "buff", ...stats, targets },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseGrantKeyword(text) {
  const m = text.match(
    /^Give (?:this follower|it|them|each (?:other )?follower(?: on your field)?) (Storm|Ward|Rush|Assail|Aura|Bane|Drain)/i,
  );
  if (!m) return null;
  const keyword = m[1].toLowerCase();
  const targets =
    /this follower/i.test(m[0]) || /^Give it/i.test(m[0])
      ? { type: "self" }
      : { type: "selfFollower", count: 99, excludeSelf: /other/i.test(m[0]) };
  return {
    effect: { op: "grantKeyword", keyword, targets },
    rest: text.slice(m[0].length).trim(),
    confidence: "auto",
  };
}

function parseDeckFilter(fragment) {
  const classM = fragment.match(/\[(forestcraft|swordcraft|runecraft|dragoncraft|shadowcraft|havencraft|portalcraft|neutral)\]/i);
  if (classM) return { cardClass: CLASS_ALIASES[classM[1].toLowerCase()] };
  if (/follower with \[evolve\]/i.test(fragment)) return { cardType: "follower" };
  if (/\bspell\b/i.test(fragment)) return { cardType: "spell" };
  if (/\bfollower\b/i.test(fragment)) return { cardType: "follower" };
  const nameM = fragment.match(/(?:for )?(?:a |an )?([A-Z][^.]+?) card/i);
  if (nameM) return { identityName: normalizeIdentityName(nameM[1]) };
  const traitM = fragment.match(/(?:for )?a (\w+(?:\s+\w+)?) (?:follower|card)/i);
  if (traitM) return { trait: traitM[1] };
  return {};
}

function parseSearchDeck(text) {
  const m = text.match(
    /^Search your deck for (?:a |an )?(.+?), reveal it, and add it to your hand/i,
  );
  if (!m) return null;
  const filter = parseDeckFilter(m[1]);
  return {
    effect: { op: "tutorFromDeck", filter, to: "hand", reveal: true },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseSearchDeckChoose(text) {
  const patterns = [
    /^Look at the top (\d+) cards? of your deck\. You may (?:put|reveal) (?:a |an )?(.+?) (?:from among them )?(?:onto your field|and add it to your hand)/i,
    /^Look at the top (\d+) cards? of your deck\. You may put a follower that costs (\d+) play points from among them onto your field/i,
    /^Search your deck for up to (\d+) (.+?), put them into your EX area/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    if (/EX area/i.test(m[0])) {
      return {
        effect: {
          op: "searchDeckChoose",
          filter: parseDeckFilter(m[2]),
          lookAt: 40,
          to: "exArea",
          optional: false,
          remainderTo: "deckBottom",
        },
        rest: text.slice(m[0].length).trim(),
        confidence: "review",
      };
    }
    const lookAt = parseInt(m[1], 10);
    const filter = parseDeckFilter(m[2]);
    if (m[3]) filter.maxCost = parseInt(m[3], 10);
    const to = /onto your field/i.test(m[0]) ? "field" : "hand";
    return {
      effect: {
        op: "searchDeckChoose",
        filter,
        lookAt,
        to,
        optional: true,
        remainderTo: "deckBottom",
        reveal: to === "hand",
      },
      rest: text.slice(m[0].length).trim(),
      confidence: "review",
    };
  }
  return null;
}

function parseTutorCemetery(text) {
  const patterns = [
    /^Select a follower that costs (\d+) play points or less in your cemetery and put it onto your field/i,
    /^Select (?:a |an )?(.+?) in your cemetery and (?:add it to your hand|play it|put it onto your field)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const filter =
      m[1] && /^\d+$/.test(m[1])
        ? { cardType: "follower", maxCost: parseInt(m[1], 10) }
        : parseDeckFilter(m[1]);
    const to = /onto your field|play it/i.test(m[0]) ? "field" : "hand";
    return {
      effect: { op: "tutorFromCemetery", filter, to, reveal: true },
      rest: text.slice(m[0].length).trim(),
      confidence: "review",
    };
  }
  return null;
}

function parseEngageDestroy(text) {
  const m = text.match(/^Select an engaged enemy follower and destroy it/i);
  if (!m) return null;
  return {
    effect: {
      op: "destroy",
      targets: { type: "enemyFollower", count: 1, engaged: true },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseEngage(text) {
  const m = text.match(/^Select (?:an enemy follower|a (.+?) follower)(?: on the field)? and engage it/i);
  if (!m) return null;
  return {
    effect: {
      op: "engage",
      targets: { type: "enemyFollower", count: 1 },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseDestroy(text) {
  const m =
    text.match(/^Select (?:an enemy follower|another card|a card|a follower)(?: on (?:the|your) field)?(?: with (\d+) defense or less)? and destroy it/i) ||
    text.match(/^Destroy (?:it|them)/i);
  if (!m) return null;
  const maxCost = m[1] ? undefined : undefined;
  const targets = /enemy follower/i.test(m[0])
    ? { type: "enemyFollower", count: 1, maxCost: m[1] ? undefined : undefined }
    : { type: "anyFollower", count: 1 };
  if (m[1]) targets.maxCost = undefined; // defense filter handled via label
  const effect = { op: "destroy", targets };
  if (/defense or less/i.test(m[0])) {
    return {
      effect,
      rest: text.slice(m[0].length).trim(),
      confidence: "review",
    };
  }
  return {
    effect,
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseBanish(text) {
  const m = text.match(
    /^Select (?:an enemy follower|a (.+?) follower in your EX area)(?: with (\d+) defense or less on the field)? and banish it/i,
  );
  if (!m) return null;
  return {
    effect: {
      op: "banish",
      targets: { type: "enemyFollower", count: 1 },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseReturnToHand(text) {
  const m = text.match(
    /^Return (?:another card|this card|a card|it|them)(?: on your field)? to (?:its|their) owner'?s hand/i,
  );
  if (!m) return null;
  const targets = /this card/i.test(m[0])
    ? { type: "self" }
    : /another card/i.test(m[0])
      ? { type: "selfFollower", count: 1, excludeSelf: true }
      : { type: "anyFollower", count: 1 };
  return {
    effect: { op: "returnToHand", targets },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseTransform(text, tokenMap) {
  const m = text.match(
    /^Select (?:any number of |up to (\d+) )?(\w+(?:\s+\w+)?) followers?(?: in your EX area)? and transform them into ([^.]+?) tokens?/i,
  );
  if (!m) return null;
  const tok = resolveToken(m[3], tokenMap);
  const count = m[1] ? parseInt(m[1], 10) : undefined;
  const filter = { trait: m[2] };
  return {
    effect: {
      op: "transform",
      ...tok,
      targets: { type: "selfFollower", count: count || 99, filter },
      ...(count ? { count } : {}),
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "manual",
  };
}

function parseRecoverPp(text) {
  const m = text.match(/^Recover (\d+|X) play points?/i);
  if (m) {
    const amount = m[1] === "X" ? 1 : parseInt(m[1], 10);
    const effect = { op: "recoverPp", amount };
    if (m[1] === "X") effect.label = "X = variable";
    return {
      effect,
      rest: text.slice(m[0].length).trim(),
      confidence: m[1] === "X" ? "manual" : "auto",
    };
  }
  const varM = text.match(/^Recover play points equal to (.+)$/i);
  if (varM) {
    const varAmt = parseVariableDamageAmount(varM[1].trim());
    if (varAmt) {
      return {
        effect: { op: "recoverPp", amount: 1, label: `variable: ${varM[1].slice(0, 60)}` },
        rest: "",
        confidence: "manual",
      };
    }
  }
  return null;
}

function parseSpendPp(text) {
  const m = text.match(/^Spend (\d+) play points?/i);
  if (!m) return null;
  return {
    effect: { op: "spendPp", amount: parseInt(m[1], 10) },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseClash(text) {
  const m = text.match(/^Clash\.?/i);
  if (!m) return null;
  return { effect: { op: "clash" }, rest: text.slice(m[0].length).trim(), confidence: "review" };
}

function parseMoveToExArea(text) {
  const m = text.match(/^Put the top card of your deck into your EX area/i);
  if (!m) return null;
  return {
    effect: { op: "moveToExArea", targets: { type: "self" } },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseBuryFieldFollowers(text) {
  const m = text.match(/^Select (?:an enemy follower|a follower) with (\d+) defense or less on the field and banish it/i);
  if (m) {
    return {
      effect: {
        op: "buryFieldFollowers",
        filter: undefined,
        excludeSelf: false,
      },
      rest: text.slice(m[0].length).trim(),
      confidence: "review",
    };
  }
  return null;
}

function parseAddStack(text) {
  const m = text.match(/^Add (\d+) to a Stack on your field/i);
  if (!m) return null;
  return {
    effect: { op: "addStack", amount: parseInt(m[1], 10) },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseReviveToField(text) {
  const m = text.match(/^Put (?:it|them) onto your field(?: and give it Rush)?/i);
  if (!m) return null;
  return {
    effect: { op: "reviveToField", engaged: false },
    rest: text.slice(m[0].length).trim(),
    confidence: "manual",
  };
}

function parseBox(text, tokenMap) {
  const m = text.match(/^Select (?:a |an )?(.+?) in your EX area\. Put it onto your field/i);
  if (!m) return null;
  const tok = resolveToken(m[1], tokenMap);
  return {
    effect: {
      op: "box",
      targets: { type: "selfFollower", count: 1, filter: tok.tokenName ? { identityName: tok.tokenName } : undefined },
    },
    rest: text.slice(m[0].length).trim(),
    confidence: "manual",
  };
}

function parseCannotAttack(text) {
  const m = text.match(/^It cannot deal damage this turn/i);
  if (!m) return null;
  return {
    effect: { op: "noop", label: "cannot deal damage this turn" },
    rest: text.slice(m[0].length).trim(),
    confidence: "manual",
  };
}

function parseCannotAttackLeaders(text) {
  const m = text.match(
    /^For the rest of this turn, (?:it|they) can't attack enemy leaders/i,
  );
  if (!m) return null;
  return {
    effect: { op: "cannotAttack", label: "cannot attack enemy leaders" },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseDiscardToExArea(text) {
  const m = text.match(/^(?:When this card is discarded,\s*)?you may put it into your EX area/i);
  if (!m) return null;
  return {
    effect: { op: "moveSourceToExArea" },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseEvolveSelf(text) {
  const m = text.match(/^evolve this(?: follower)?\.?$/i);
  if (!m) return null;
  return {
    effect: { op: "autoEvolveIf", condition: { type: "always" }, triggerOnEvolve: true },
    rest: "",
    confidence: "review",
  };
}

function parseBanishFromDeck(text) {
  const m = text.match(/^Search your deck for up to (\d+) cards and banish them/i);
  if (!m) return null;
  return {
    effect: { op: "banishFromDeck", maxCount: parseInt(m[1], 10) },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseIncreaseMaxPp(text) {
  const m = text.match(/^Increase your max(?:imum)? play points by (\d+)/i);
  if (!m) return null;
  return {
    effect: { op: "increaseMaxPp", amount: parseInt(m[1], 10) },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

function parseBanishExArea(text) {
  const m = text.match(/^At the start of your end phase, banish (?:each card|all cards) in your EX area/i);
  if (!m) return null;
  return {
    effect: { op: "noop", label: "banish EX area at end phase" },
    rest: text.slice(m[0].length).trim(),
    confidence: "manual",
  };
}

function parseSpellchainRecover(text) {
  const m = text.match(/^Spellchain \(\d+\): Recover (\d+) play point/i);
  if (!m) return null;
  return {
    effect: { op: "recoverPp", amount: parseInt(m[1], 10) },
    rest: text.slice(m[0].length).trim(),
    confidence: "review",
  };
}

// ---------------------------------------------------------------------------
// Passive / aura builders
// ---------------------------------------------------------------------------

function buildPassiveEffect(triggerText, innerEffect, tokenMap) {
  let body = innerEffect;
  if (!body || body.op === "noop") {
    const tail = triggerText.match(/,\s*(.+)$/);
    if (tail) {
      const parsed = parseSegmentBody(tail[1], tokenMap, { timing: "fanfare" });
      if (parsed.effect && parsed.effect.op !== "noop") body = parsed.effect;
    }
  }

  const attackPassive = triggerText.match(
    /^Whenever one of your (\w+(?:\s+\w+)?) followers attacks,\s*(.+)$/i,
  );
  if (attackPassive) {
    const inner = parseSegmentBody(attackPassive[2], tokenMap, { timing: "strike" });
    return {
      effect: {
        op: "grantOnCardPlayed",
        filter: { trait: attackPassive[1] },
        effect: inner.effect,
        label: triggerText.slice(0, 100),
      },
      confidence: "manual",
    };
  }

  const evolvePassive = triggerText.match(/^Whenever one of your followers evolves,\s*(.+)$/i);
  if (evolvePassive) {
    const inner = parseSegmentBody(evolvePassive[1], tokenMap, { timing: "onEvolve" });
    return {
      effect: {
        op: "grantOnCardPlayed",
        effect: inner.effect,
        label: triggerText.slice(0, 100),
      },
      confidence: "manual",
    };
  }

  const whenever = triggerText.match(
    /^Whenever (?:you play a spell|another follower is put onto your field|a (.+?) follower is put onto your field|you play a (.+?) card)/i,
  );
  if (!whenever) {
    return { effect: body, confidence: "manual" };
  }

  let filter = {};
  if (/play a spell/i.test(whenever[0])) filter = { cardType: "spell" };
  else if (whenever[1]) filter = { trait: whenever[1] };
  else if (whenever[2]) filter = parseDeckFilter(whenever[2]);

  const label = triggerText.slice(0, 80);
  return {
    effect: {
      op: "grantOnCardPlayed",
      filter,
      effect: body,
      untilEndOfTurn: /this turn/i.test(triggerText),
      label,
    },
    confidence: "review",
  };
}

function buildAuraEffect(triggerText, innerEffect) {
  const m = triggerText.match(/^While this card is on your field, your (.+?) (?:followers?|tokens?) have (\w+)/i);
  if (m) {
    const trait = m[1];
    const keyword = m[2].toLowerCase();
    return {
      effect: {
        op: "auraGrantKeyword",
        keyword: keyword === "assail" ? "assail" : keyword,
        trait,
        excludeSelf: false,
      },
      confidence: "review",
    };
  }
  if (innerEffect && innerEffect.op !== "noop") return { effect: innerEffect, confidence: "review" };
  return { effect: { op: "noop", label: triggerText.slice(0, 120) }, confidence: "manual" };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function maxConfidence(a, b) {
  return (CONFIDENCE_RANK[a] ?? 0) >= (CONFIDENCE_RANK[b] ?? 0) ? a : b;
}
