import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import {
  onDragHover,
  getFieldGridRect,
  getCemeteryRect,
  getHandRect,
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
  useEffect(() => onDragHover(setDrag), []);

  if (!drag.active) return null;
  const r = getFieldGridRect();
  if (!r) return null;

  const cellW = r.width / 5;
  const cellH = r.height / 2;
  const cem = getCemeteryRect();
  const hand = getHandRect();

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

  return createPortal(
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99999 }}>
      {cem && drag.showCemetery && <div style={zoneStyle(cem, drag.cemetery)} />}
      {hand && drag.showHand && <div style={zoneStyle(hand, drag.hand)} />}
      {Array.from({ length: 10 }).map((_, idx) => {
        const col = idx % 5;
        const row = idx < 5 ? 0 : 1;
        const occupied = field[idx] !== 0;
        const isHover = idx === drag.index;
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
                ? occupied
                  ? "3px solid rgba(255, 90, 90, 0.9)"
                  : "3px solid rgba(120, 230, 140, 0.95)"
                : "2px dashed rgba(255, 255, 255, 0.35)",
              background:
                isHover && !occupied ? "rgba(120, 230, 140, 0.18)" : "transparent",
              boxShadow:
                isHover && !occupied ? "0 0 18px rgba(120, 230, 140, 0.6)" : "none",
              transition: "border-color 80ms, background 80ms, box-shadow 80ms",
            }}
          />
        );
      })}
    </div>,
    document.body
  );
}
