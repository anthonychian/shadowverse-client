import React from "react";
import icons from "../../decks/icons.json";

// Card images are referenced app-wide as "../textures/<file>" (see getCards.js),
// so keyword icons live under the same base.
const TEXTURES_BASE = "../textures/";

// [keyword] tokens that introduce a distinct ability. Each such ability starts
// on its own line so multi-ability cards read cleanly. Cost/stat/class tokens
// (e.g. "[cost02]", "[attack]", "[runecraft]") are intentionally excluded —
// those appear inline within a sentence and must not force a line break.
const ABILITY_KEYS = new Set([
  "[fanfare]", "[lastwords]", "[act]", "[evolve]", "[engage]",
  "[feed]", "[adv]", "[ride]",
]);

// An ability keyword only starts a new line when it follows the end of the
// previous sentence. This keeps a keyword that's part of an ongoing clause on
// the same line: an activate cost ("[act] [cost02], [engage], ...": comma) or
// a granted keyword ("...gains [evolve] and [feed]": no terminator).
const SENTENCE_END = new Set([".", "!", "?"]);

const isToken = (part) => /^\[[^\]]+\]$/.test(part);

// Renders card effect text, swapping inline [keyword] tokens (e.g. "[fanfare]",
// "[cost02]") for their icon from the manifest. Unknown tokens stay as text.
// A line break is inserted before each ability keyword that follows effect text
// so distinct abilities sit on their own lines — but consecutive keyword tokens
// (e.g. "[act][engage]") stay together because the break only fires when the
// keyword follows regular text, not another token.
export default function EffectText({ text, iconSize = 17, style }) {
  if (!text) return null;
  const parts = text.split(/(\[[^\]]+\])/g);
  const out = [];
  let lastNonSpace = null; // last non-whitespace char rendered so far

  parts.forEach((part, i) => {
    if (part === "") return;

    if (isToken(part)) {
      const key = part.toLowerCase();
      // Start a new line before an ability keyword that begins a new sentence.
      if (ABILITY_KEYS.has(key) && SENTENCE_END.has(lastNonSpace)) {
        out.push(<br key={`br${i}`} />);
      }
      const file = icons[part] || icons[key];
      out.push(
        file ? (
          <img
            key={i}
            src={TEXTURES_BASE + file}
            alt={part}
            title={part}
            style={{ height: iconSize, verticalAlign: "text-bottom", margin: "0 1px" }}
          />
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      );
      lastNonSpace = "]";
    } else {
      out.push(<React.Fragment key={i}>{part}</React.Fragment>);
      const trimmed = part.replace(/\s+$/, "");
      if (trimmed.length) lastNonSpace = trimmed[trimmed.length - 1];
    }
  });

  return <span style={style}>{out}</span>;
}
