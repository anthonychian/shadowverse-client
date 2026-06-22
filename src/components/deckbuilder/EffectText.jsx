import React from "react";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import icons from "../../decks/icons.json";
import keywords from "../../decks/keywords.json";
import { COLORS, FONT } from "./theme";

// Card images are referenced app-wide as "../textures/<file>" (see getCards.js),
// so keyword icons live under the same base.
const TEXTURES_BASE = "../textures/";

// A large, dark panel with a gold keyword header — matching the Shadowverse:
// Evolve site's dark/gold look and the deck builder's own palette (theme.js).
const KeywordTooltip = styled(({ className, ...props }) => (
  <Tooltip
    arrow
    // Non-interactive + no leave delay: the tooltip hides the moment the cursor
    // leaves the keyword/icon (no buffer to mouse onto the tooltip), so moving
    // between adjacent keywords swaps tooltips cleanly instead of lingering.
    disableInteractive
    enterDelay={0}
    leaveDelay={0}
    enterTouchDelay={0}
    leaveTouchDelay={4000}
    {...props}
    classes={{ popper: className }}
  />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 420,
    backgroundColor: "rgba(16, 20, 26, 0.98)",
    color: COLORS.text,
    fontFamily: FONT,
    fontSize: 15,
    lineHeight: 1.65,
    padding: "14px 18px",
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 10px 32px rgba(0, 0, 0, 0.6)",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "rgba(16, 20, 26, 0.98)",
    "&::before": { border: `1px solid ${COLORS.border}` },
  },
}));

// Icon tokens whose glyph stands in for a defined keyword, so the icon itself
// can carry that keyword's tooltip (the word never appears as plain text).
const TOKEN_KEYWORD = {
  "[fanfare]": "Fanfare",
  "[lastwords]": "Last Words",
  "[act]": "Activated Abilities",
  "[engage]": "Engage",
  "[evolve]": "Evolve",
  "[quick]": "Quick",
};

// Plain-text keyword matcher, built from the manifest. Longest names first so
// multi-word keywords ("Earth Rite", "Last Words") win over any substring, and
// "(X)" forms ("Combo (2)") match on their base name. Case-sensitive: keyword
// abilities are always capitalized on cards, which avoids false positives on
// ordinary words. \b boundaries keep "Evolve" from matching inside "Evolved".
const KEYWORD_NAMES = Object.keys(keywords).sort((a, b) => b.length - a.length);
const KEYWORD_RE = new RegExp(
  "\\b(" + KEYWORD_NAMES.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b"
);

// The tooltip body: the keyword name as a gold header above its definition.
function gloss(name) {
  return (
    <>
      <span
        style={{
          display: "block",
          fontWeight: 700,
          fontSize: 17,
          color: COLORS.gold,
          marginBottom: 7,
          letterSpacing: 0.3,
        }}
      >
        {name}
      </span>
      {keywords[name]}
    </>
  );
}

// A keyword word styled to read as hoverable (dotted gold underline + help
// cursor), wrapped in a tooltip carrying its definition.
function KeywordSpan({ name }) {
  return (
    <KeywordTooltip title={gloss(name)}>
      <span
        style={{
          textDecoration: "underline dotted",
          textDecorationColor: COLORS.gold,
          textUnderlineOffset: 2,
          cursor: "help",
        }}
      >
        {name}
      </span>
    </KeywordTooltip>
  );
}

// Split a plain text run on keyword occurrences, wrapping each match in a
// KeywordSpan and leaving the rest as text. Returns the original string when
// tooltips are off or there's nothing to match.
function withKeywordTooltips(text, keyBase) {
  const re = new RegExp(KEYWORD_RE.source, "g");
  const out = [];
  let last = 0;
  let m;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<KeywordSpan key={`${keyBase}-kw${n++}`} name={m[1]} />);
    last = m.index + m[1].length;
  }
  if (out.length === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// [keyword] tokens that introduce a distinct ability. A new line begins before
// one of these when it follows the end of a sentence. Cost/stat/class tokens
// (e.g. "[cost02]", "[attack]", "[runecraft]") are excluded — those appear
// inline within a sentence and must not force a break.
const ABILITY_TOKENS = "fanfare|lastwords|act|evolve|engage|feed|adv|ride|Union Burst|quick";

// Plain-text ability lead-ins that begin a new ability line (the card splits
// here even though there's no bracketed icon). High-confidence triggers and
// keyword abilities only — generic sentence starters ("If", "Deal", "Put",
// "X equals", ...) are intentionally excluded so the sentences that merely
// continue an ability stay on the same line. Bare keyword abilities
// ("Ward.", "Bane.", "Assail.", ...) are also excluded so a run of them stays
// grouped on one line, as on the card; only keyword abilities that carry a
// description (a ":" or " (cost)") get their own line.
const LEAD = [
  "Once per turn", "Once per match",
  "At the start of", "At the end of", "At the beginning of",
  "Whenever", "Each time", "The first time",
  "On Evolve", "On Super-Evolve",
  "While ", "During ",
  "Strike:", "Clash:",
  "Combo \\(", "Enhance \\(", "Accelerate \\(", "Crystallize \\(",
  "Spellboost:", "Earth Rite:", "Necromancy \\(",
  "Vengeance:", "Resonance:", "Awakening:", "Necrocharge \\(", "Spellchain \\(",
].join("|");

// Match zero-or-more whitespace after the sentence end so a break is inserted
// even when the source jams the next ability right against the period.
const TOKEN_BREAK = new RegExp("([.!?])\\s*(\\[(?:" + ABILITY_TOKENS + ")\\])", "gi");
const LEAD_BREAK = new RegExp("([.!?])\\s*(" + LEAD + ")", "g");

// Turn the run-on effect string into one with explicit "\n" between abilities:
// section separators ("----"), bracketed ability keywords starting a new
// sentence, and plain-text ability lead-ins starting a new sentence.
function withLineBreaks(text) {
  return text
    .replace(/\s*-{3,}\s*/g, "\n")
    .replace(TOKEN_BREAK, "$1\n$2")
    .replace(LEAD_BREAK, "$1\n$2")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/^\n+|\n+$/g, "");
}

// Renders card effect text, swapping inline [keyword] tokens (e.g. "[fanfare]",
// "[cost02]") for their icon from the manifest, and placing each ability on its
// own line. Unknown tokens stay as text. When `tooltips` is set, defined keyword
// abilities (both icon tokens and plain-text words) gain a hover definition.
export default function EffectText({ text, iconSize = 17, style, tooltips = false }) {
  if (!text) return null;
  const parts = withLineBreaks(text).split(/(\n|\[[^\]]+\])/g);
  return (
    <span style={style}>
      {parts.map((part, i) => {
        if (part === "") return null;
        if (part === "\n") return <br key={i} />;
        const file = icons[part] || icons[part.toLowerCase()];
        if (file) {
          const kw = tooltips ? TOKEN_KEYWORD[part] : undefined;
          const img = (
            <img
              key={i}
              src={TEXTURES_BASE + file}
              alt={part}
              title={kw ? undefined : part}
              style={{ height: iconSize, verticalAlign: "text-bottom", margin: "0 1px" }}
            />
          );
          if (kw) {
            return (
              <KeywordTooltip key={i} title={gloss(kw)}>
                {img}
              </KeywordTooltip>
            );
          }
          return img;
        }
        if (tooltips) {
          return <React.Fragment key={i}>{withKeywordTooltips(part, i)}</React.Fragment>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
