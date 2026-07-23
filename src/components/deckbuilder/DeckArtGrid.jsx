import React from "react";
import { artThumb, artImage, cardImage } from "../../decks/getCards";
import { getCost } from "../../decks/cardDetails";
import { COLORS, FONT, displayName } from "./theme";

// Full-art deck grid: the look of Home's Preview modal (big card art with a
// copy-count badge in the corner) laid out as a responsive grid rather than a
// fixed-height flex row, so it works as page content at any width.
//
// `fullArt` picks the 459x641 textures over the 186x260 thumbnails. On is right
// for Home's Preview, where the art is local and already cached and the cards
// are the largest. Off is right for the public share page: a 50-card deck loads
// in a quarter of the bytes, which matters when a stranger opens the link.
// Either way, clicking a card inspects it at full size.

const sortedEntries = (map) =>
  [...map.entries()].sort((a, b) => {
    const ca = getCost(a[0]);
    const cb = getCost(b[0]);
    const va = ca == null ? 99 : ca;
    const vb = cb == null ? 99 : cb;
    if (va !== vb) return va - vb;
    return a[0].localeCompare(b[0]);
  });

const badge = {
  position: "absolute",
  right: 4,
  bottom: 4,
  minWidth: 30,
  height: 30,
  padding: "0 6px",
  boxSizing: "border-box",
  background: "rgba(0, 0, 0, 0.72)",
  color: "#fff",
  fontFamily: FONT,
  fontSize: 19,
  fontWeight: 700,
  borderRadius: 7,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

export const SectionHeading = ({ title, count, max }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      margin: "0 0 10px",
    }}
  >
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <span style={{ width: 5, height: 19, background: COLORS.glow, borderRadius: 3 }} />
      <span style={{ color: COLORS.text, fontFamily: FONT, fontSize: 19, fontWeight: 700 }}>
        {title}
      </span>
    </span>
    {count != null && (
      <span style={{ color: COLORS.textDim, fontFamily: FONT, fontSize: 14 }}>
        {count}
        {max != null ? ` / ${max}` : ""}
      </span>
    )}
  </div>
);

export default function DeckArtGrid({
  map,
  art,
  onInspect,
  columns = 6,
  fullArt = false,
}) {
  return (
    // Deck Log's layout: a fixed number of columns packed from the left, so a
    // short last row stays left-aligned under the row above rather than
    // drifting to the middle, and the main and evolve decks line up on the same
    // column grid. The count is fixed and the width fluid, so a row always holds
    // the same number of cards whatever the window size.
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 8,
      }}
    >
      {sortedEntries(map).map(([name, count]) => (
        <div
          key={name}
          onClick={() => onInspect && onInspect(name)}
          title={displayName(name)}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "110 / 150",
            cursor: onInspect ? "pointer" : "default",
            borderRadius: 6,
            overflow: "hidden",
            background: COLORS.inset,
            // Same drop shadow the in-game cards carry.
            boxShadow: "0 1px 4px rgba(0,0,0,0.7)",
          }}
        >
          <img
            src={fullArt ? artImage(name, art) : artThumb(name, art)}
            alt={name}
            loading="lazy"
            decoding="async"
            // Same fallback ladder as DeckPanel: a chosen printing without a
            // thumbnail falls back to its full art, then the default art.
            onError={(e) => {
              const chosen = art && art[name];
              if (chosen && e.currentTarget.src.indexOf("/thumbs/") !== -1) {
                e.currentTarget.src = `../textures/${chosen}.png`;
              } else if (chosen) {
                e.currentTarget.src = cardImage(name);
              }
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <span style={badge}>{count}</span>
        </div>
      ))}
    </div>
  );
}
