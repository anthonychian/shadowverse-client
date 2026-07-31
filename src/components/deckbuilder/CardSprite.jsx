import React from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import atlasIndex from "../../decks/atlasIndex.json";

// Pool card art served from sprite sheets instead of one request per card.
//
// The pool is the only view that browses card art densely and in a fixed order,
// which is what makes an atlas pay: scrolling walks a run of adjacent cards, so
// a sheet is nearly all useful once fetched. Sparse views (the deck list's ~25
// unique cards, the inspector's single card) would pull a whole 36-card sheet
// to show one tile, so they keep using individual images.
//
// Sheets are named after the set family they hold ("BP01-0"), and a card's cell
// is its position within that sheet's list — so the index carries no per-card
// coordinates. See src/scripts/build-card-atlases.js.

// Tiles render at whatever size the caller asks for, so the source tile
// dimensions in the index aren't needed here — only the grid shape is.
const [COLS, ROWS] = atlasIndex.grid;

// cardNo -> { sheet, cell }, built once.
const position = (() => {
  const m = new Map();
  for (const [sheet, cards] of Object.entries(atlasIndex.sheets)) {
    cards.forEach((no, cell) => m.set(no, { sheet, cell }));
  }
  return m;
})();

export const hasSprite = (cardNo) => !!cardNo && position.has(cardNo);

// Public so a caller can warm the sheet a card lives on.
export const atlasUrlFor = (cardNo) => {
  const p = position.get(cardNo);
  return p ? `/atlases/${p.sheet}.png` : null;
};

/**
 * One pool tile drawn out of a sprite sheet.
 *
 * Scaling works by sizing the *background* to the whole sheet at the tile's
 * display size — background-size: (cols x width) (rows x height) — so the
 * browser scales the sheet once and each tile lands on an exact multiple.
 * `width`/`height` are the rendered tile size, which need not match the
 * source tile size.
 */
export default function CardSprite({
  cardNo,
  width,
  height,
  alt,
  style,
  threshold = 300,
  placeholderColor = "rgba(255,255,255,0.06)",
}) {
  const p = position.get(cardNo);
  if (!p) return null;

  const col = p.cell % COLS;
  const row = Math.floor(p.cell / COLS);
  const url = `/atlases/${p.sheet}.png`;

  // Percentage-free positioning: shift by whole tiles at the rendered size.
  // Numeric width/height are px; a string (e.g. "100%") means the tile is
  // fluid, and background-size has to follow it in the same unit.
  const fluid = typeof width !== "number";
  const bgSize = fluid
    ? `${COLS * 100}% ${ROWS * 100}%`
    : `${COLS * width}px ${ROWS * height}px`;
  const bgPos = fluid
    ? // With a percentage background-size the offset is also a percentage of
      // the *difference* between element and image size, which for an N-tile
      // sheet works out to col/(cols-1) — the standard CSS sprite identity.
      `${COLS > 1 ? (col / (COLS - 1)) * 100 : 0}% ${ROWS > 1 ? (row / (ROWS - 1)) * 100 : 0}%`
    : `-${col * width}px -${row * height}px`;

  return (
    <LazyLoadComponent
      threshold={threshold}
      placeholder={
        <span
          style={{
            display: "block",
            width: fluid ? "100%" : width,
            height: fluid ? "100%" : height,
            borderRadius: 8,
            background: placeholderColor,
          }}
        />
      }
    >
      <div
        role="img"
        aria-label={alt}
        style={{
          width: fluid ? "100%" : width,
          height: fluid ? "100%" : height,
          backgroundImage: `url(${url})`,
          backgroundSize: bgSize,
          backgroundPosition: bgPos,
          backgroundRepeat: "no-repeat",
          borderRadius: 8,
          ...style,
        }}
      />
    </LazyLoadComponent>
  );
}
