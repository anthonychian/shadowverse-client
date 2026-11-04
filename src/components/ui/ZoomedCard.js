import React from "react";
import CardInspector from "../deckbuilder/CardInspector";

// In-game hover preview. Fills the whole left column (the space otherwise used
// by PlayPoints), styled exactly like the CreateDeck inspector: English name,
// class/type, cost & stats, traits and the translated (tokenized) effect text —
// so Japanese card art can be read in English on hover. Rendered absolutely
// inside the (position: relative) leftSideCanvas so it overlays PlayPoints only
// while a card is hovered.
export default function ZoomedCard({ hovering, name, art }) {
  if (!hovering || !name) return null;
  const cardNo = art ? art[name] : undefined;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // Above the fixed top-left menu/hide-UI buttons (zIndex 1000), so the
        // preview is never covered while hovering a card.
        zIndex: 1100,
        // Full-bleed container that covers the entire left column: no padding,
        // border or rounding, so the panel's background reaches every edge of
        // leftSideCanvas instead of floating as an inset card.
        background:
          "linear-gradient(180deg, rgba(30,36,47,0.99) 0%, rgba(18,22,30,0.99) 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        pointerEvents: "none",
        // The Game's .canvas container sets text-align:center, which the preview
        // would otherwise inherit. Force left so the text matches CreateDeck.
        textAlign: "left",
      }}
    >
      {/* Inset the content while the panel itself stays edge-to-edge. Cap the
          card art at ~half the screen height and auto-scale the effect text to
          fit — the preview must never need a scrollbar (the viewer is holding a
          hover and can't scroll). */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: 14,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardInspector name={name} cardNo={cardNo} readOnly imageMaxHeight="50vh" fitEffect gameStyle />
      </div>
    </div>
  );
}
