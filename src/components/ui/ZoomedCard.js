import React, { useLayoutEffect, useRef, useState } from "react";
import CardInspector from "../deckbuilder/CardInspector";

// In-game hover preview. Fills the left region from the viewport's left edge up
// to (but not touching) the centerCanvas, styled exactly like the CreateDeck
// inspector: English name, class/type, cost & stats, traits and the translated
// (tokenized) effect text — so Japanese card art can be read in English on
// hover. Rendered absolutely inside the (position: relative) leftSideCanvas so
// it overlays PlayPoints only while a card is hovered.
// Small breathing room kept between the preview's right edge and the board.
const PREVIEW_BOARD_GAP = 32;

export default function ZoomedCard({ hovering, name, art }) {
  const rootRef = useRef(null);
  // The left column sits inset from the viewport edge and is separated from the
  // center board by the flex row's space-around gap. Measure both so the preview
  // can run flush to the viewport's left edge while stopping just short of the
  // centerCanvas, filling the left region without touching the board.
  const [offsets, setOffsets] = useState({ left: 0, right: 0 });

  useLayoutEffect(() => {
    if (!hovering || !name) {
      setOffsets({ left: 0, right: 0 });
      return undefined;
    }
    const measure = () => {
      const el = rootRef.current;
      const container = el && el.parentElement;
      const center = document.querySelector(".centerCanvas");
      if (!container || !center) return;
      const containerRect = container.getBoundingClientRect();
      const centerRect = center.getBoundingClientRect();
      setOffsets({
        // Negative left offset = extend left to the viewport's left edge.
        left: -containerRect.left,
        // Negative right offset = extend right, stopping just before the board.
        right: containerRect.right - (centerRect.left - PREVIEW_BOARD_GAP),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [hovering, name]);

  if (!hovering || !name) return null;
  const cardNo = art ? art[name] : undefined;
  return (
    <div
      ref={rootRef}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: offsets.left,
        right: offsets.right,
        // Above the fixed top-left menu/hide-UI buttons (zIndex 1000), so the
        // preview is never covered while hovering a card.
        zIndex: 1100,
        // Full-bleed container that covers the left region: no padding, border
        // or rounding, so the panel's background reaches the viewport's left
        // edge and the board-side edge instead of floating as an inset card.
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
      {/* Inset the content while the panel itself stays edge-to-edge. The
          centered column keeps the text, icons and description from hugging the
          left edge on wide screens. Cap the card art at ~half the screen height
          and auto-scale the effect text to fit — the preview must never need a
          scrollbar (the viewer is holding a hover and can't scroll). */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: "17px 19px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            maxWidth: 600,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardInspector
            name={name}
            cardNo={cardNo}
            readOnly
            imageMaxHeight="46vh"
            fitEffect
            gameStyle
            nameScale={1.1}
            effectScale={1.1}
            effectPadding="17px 19px"
          />
        </div>
      </div>
    </div>
  );
}
