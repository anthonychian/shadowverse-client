import React from "react";
import icons from "../../decks/icons.json";

// Card images are referenced app-wide as "../textures/<file>" (see getCards.js),
// so keyword icons live under the same base.
const TEXTURES_BASE = "../textures/";

// Renders card effect text, swapping inline [keyword] tokens (e.g. "[fanfare]",
// "[cost02]") for their icon from the manifest. Unknown tokens stay as text.
export default function EffectText({ text, iconSize = 17, style }) {
  if (!text) return null;
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <span style={style}>
      {parts.map((part, i) => {
        const file = icons[part] || icons[part.toLowerCase()];
        if (file) {
          return (
            <img
              key={i}
              src={TEXTURES_BASE + file}
              alt={part}
              title={part}
              style={{
                height: iconSize,
                verticalAlign: "text-bottom",
                margin: "0 1px",
              }}
            />
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
