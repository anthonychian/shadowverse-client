import React from "react";
import icons from "../../decks/icons.json";

// Card images are referenced app-wide as "../textures/<file>" (see getCards.js),
// so keyword icons live under the same base.
const TEXTURES_BASE = "../textures/";

// [keyword] tokens that introduce a distinct ability. A new line begins before
// one of these when it follows the end of a sentence. Cost/stat/class tokens
// (e.g. "[cost02]", "[attack]", "[runecraft]") are excluded — those appear
// inline within a sentence and must not force a break.
const ABILITY_TOKENS = "fanfare|lastwords|act|evolve|engage|feed|adv|ride";

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
// own line. Unknown tokens stay as text.
export default function EffectText({ text, iconSize = 17, style }) {
  if (!text) return null;
  const parts = withLineBreaks(text).split(/(\n|\[[^\]]+\])/g);
  return (
    <span style={style}>
      {parts.map((part, i) => {
        if (part === "") return null;
        if (part === "\n") return <br key={i} />;
        const file = icons[part] || icons[part.toLowerCase()];
        if (file) {
          return (
            <img
              key={i}
              src={TEXTURES_BASE + file}
              alt={part}
              title={part}
              style={{ height: iconSize, verticalAlign: "text-bottom", margin: "0 1px" }}
            />
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
