import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import {
  onDragHover,
  getFieldGridRect,
  getCemeteryRect,
  getHandRect,
  getDeckRect,
} from "./handDrag";

// Drop-target hints shown while a hand card is being dragged: outlines the 10
// field zones and highlights the one under the cursor (green when free, red when
// already occupied). Positioned with viewport coordinates (getBoundingClientRect
// of the field grid), so it must be portaled to <body>: rendering it inside the
// board subtree would put it under the board's CSS `transform`, which turns
// `position: fixed` into "relative to the board" and throws the alignment off.
export default function FieldDropHints() {
  const [drag, setDrag] = useState({ active: false, index: -1 });
  const field = useSelector((s) => s.card.field);
  const evoField = useSelector((s) => s.card.evoField);
  useEffect(() => onDragHover(setDrag), []);

  if (!drag.active) return null;
  const r = getFieldGridRect();
  if (!r) return null;

  const cellW = r.width / 5;
  const cellH = r.height / 2;
  const cem = getCemeteryRect();
  const hand = getHandRect();
  const deck = getDeckRect();

  // Outlined drop zone; highlights green when it's the one under the cursor.
  const zoneStyle = (rect, hovered) => ({
    position: "fixed",
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    boxSizing: "border-box",
    borderRadius: 10,
    border: hovered
      ? "3px solid rgba(120, 230, 140, 0.95)"
      : "2px dashed rgba(255, 255, 255, 0.35)",
    background: hovered ? "rgba(120, 230, 140, 0.18)" : "transparent",
    boxShadow: hovered ? "0 0 18px rgba(120, 230, 140, 0.6)" : "none",
    transition: "border-color 80ms, background 80ms, box-shadow 80ms",
  });

  // The deck pile split into top/bottom halves. `half` is "top" | "bottom"; the
  // matching half highlights green when the cursor is over it, and each carries a
  // label so it's obvious which end the card will go to.
  const deckHalfStyle = (rect, half, hovered) => ({
    position: "fixed",
    left: rect.left,
    top: half === "top" ? rect.top : rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height / 2,
    boxSizing: "border-box",
    borderRadius: half === "top" ? "10px 10px 0 0" : "0 0 10px 10px",
    border: hovered
      ? "3px solid rgba(120, 230, 140, 0.95)"
      : "2px dashed rgba(255, 255, 255, 0.5)",
    background: hovered ? "rgba(120, 230, 140, 0.3)" : "rgba(0, 0, 0, 0.45)",
    boxShadow: hovered ? "0 0 18px rgba(120, 230, 140, 0.6)" : "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontFamily: "Noto Serif JP, serif",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.5,
    textShadow: "0 1px 3px #000",
    transition: "border-color 80ms, background 80ms, box-shadow 80ms",
  });

  return createPortal(
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99999 }}>
      {cem && drag.showCemetery && <div style={zoneStyle(cem, drag.cemetery)} />}
      {hand && drag.showHand && <div style={zoneStyle(hand, drag.hand)} />}
      {deck && drag.showDeck && (
        <>
          <div style={deckHalfStyle(deck, "top", drag.deck === "top")}>Top</div>
          <div style={deckHalfStyle(deck, "bottom", drag.deck === "bottom")}>
            Bottom
          </div>
        </>
      )}
      {Array.from({ length: 10 }).map((_, idx) => {
        const col = idx % 5;
        const row = idx < 5 ? 0 : 1;
        const occupied = field[idx] !== 0;
        const isHover = idx === drag.index;
        // For an evolve drag the valid target is the opposite of a play: a
        // follower that's on the field and not already evolved. Otherwise (hand
        // play / field move) an empty zone is the valid target.
        const valid = drag.evolve
          ? occupied && evoField && evoField[idx] === 0
          : !occupied;
        return (
          <div
            key={idx}
            style={{
              position: "fixed",
              left: r.left + col * cellW + 6,
              top: r.top + row * cellH + 6,
              width: cellW - 12,
              height: cellH - 12,
              boxSizing: "border-box",
              borderRadius: 10,
              border: isHover
                ? valid
                  ? "3px solid rgba(120, 230, 140, 0.95)"
                  : "3px solid rgba(255, 90, 90, 0.9)"
                : "2px dashed rgba(255, 255, 255, 0.35)",
              background:
                isHover && valid ? "rgba(120, 230, 140, 0.18)" : "transparent",
              boxShadow:
                isHover && valid ? "0 0 18px rgba(120, 230, 140, 0.6)" : "none",
              transition: "border-color 80ms, background 80ms, box-shadow 80ms",
            }}
          />
        );
      })}
    </div>,
    document.body
  );
}
