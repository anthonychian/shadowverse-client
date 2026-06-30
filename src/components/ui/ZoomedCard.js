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
        zIndex: 50,
        // One solid (non-transparent) container holding the whole preview — the
        // card, the name header and the text panels all sit inside it, like the
        // in-game description box, rather than floating as separate pieces.
        background:
          "linear-gradient(180deg, rgba(30,36,47,0.99) 0%, rgba(18,22,30,0.99) 100%)",
        border: "1px solid rgba(120,150,190,0.35)",
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        pointerEvents: "none",
        boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
        // The Game's .canvas container sets text-align:center, which the preview
        // would otherwise inherit. Force left so the text matches CreateDeck.
        textAlign: "left",
      }}
    >
      {/* Cap the card art at ~half the screen height and auto-scale the effect
          text to fit — the preview must never need a scrollbar (the viewer is
          holding a hover and can't scroll). */}
      <CardInspector name={name} cardNo={cardNo} readOnly imageMaxHeight="50vh" fitEffect gameStyle />
    </div>
  );
}
