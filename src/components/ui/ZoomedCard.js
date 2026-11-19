import React, { useLayoutEffect, useRef, useState } from "react";
import CardInspector from "../deckbuilder/CardInspector";
import { compareCardsByCost, computeDeckClass } from "../../decks/cardDetails";
import { artThumb, cardImageSrc, cardNoImage } from "../../decks/getCards";
import { displayName } from "../deckbuilder/theme";

// In-game hover preview. Fills the left region from the viewport's left edge up
// to (but not touching) the centerCanvas, styled exactly like the CreateDeck
// inspector: English name, class/type, cost & stats, traits and the translated
// (tokenized) effect text — so Japanese card art can be read in English on
// hover. Rendered absolutely inside the (position: relative) leftSideCanvas so
// it overlays PlayPoints only while a card is hovered.
// Small breathing room kept between the preview's right edge and the board.
const PREVIEW_BOARD_GAP = 32;

const GRID_GAP = 4;
const MIN_CARD_WIDTH = 34;
const MAX_COLUMNS = 12;
const CARD_ASPECT = 150 / 110;
const SECTION_LABEL_HEIGHT = 20;
const SECTION_GAP = 8;

const countEntries = (names = []) => {
  const counts = new Map();
  for (const name of names) counts.set(name, (counts.get(name) || 0) + 1);
  return [...counts.entries()].sort((a, b) => compareCardsByCost(a[0], b[0]));
};

const fitColumns = (mainCount, evoCount, width, height) => {
  const preferredMax = Math.floor(
    (width + GRID_GAP) / (MIN_CARD_WIDTH + GRID_GAP),
  );
  const maxColumns = Math.max(
    2,
    Math.min(
      MAX_COLUMNS,
      Math.max(
        preferredMax,
        Math.ceil((mainCount + evoCount) / 2),
      ),
    ),
  );
  if (!mainCount && !evoCount) return maxColumns;
  for (let columns = 2; columns <= maxColumns; columns += 1) {
    const cardWidth = (width - (columns - 1) * GRID_GAP) / columns;
    const rows = Math.ceil(mainCount / columns) + Math.ceil(evoCount / columns);
    const sections = evoCount ? 2 : 1;
    const totalHeight =
      rows * (cardWidth * CARD_ASPECT + GRID_GAP) +
      sections * SECTION_LABEL_HEIGHT +
      (sections - 1) * SECTION_GAP;
    if (totalHeight <= height) return columns;
  }
  return maxColumns;
};

function DeckPreview({ deck, art }) {
  const areaRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return undefined;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const main = countEntries(deck.deck);
  const evo = countEntries(deck.evoDeck);
  const columns = fitColumns(
    main.length,
    evo.length,
    size.width || 360,
    size.height || 700,
  );
  const deckArt = deck.art || art;
  const deckClass = deck.class || computeDeckClass(deck.deck) || "";

  const sectionLabel = (title, count) => (
    <div
      style={{
        height: SECTION_LABEL_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "Share Tech Mono, monospace",
        fontSize: 11,
        letterSpacing: "0.1em",
        color: "#8cdcff",
      }}
    >
      {title}
      <span style={{ color: "rgba(218, 246, 255, 0.6)" }}>{count}</span>
    </div>
  );

  const cardGrid = (entries) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: GRID_GAP,
      }}
    >
      {entries.map(([name, count]) => (
        <div
          key={name}
          title={displayName(name)}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "110 / 150",
            borderRadius: 4,
            overflow: "hidden",
            background: "rgba(0, 0, 0, 0.55)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.7)",
          }}
        >
          <img
            src={artThumb(name, deckArt)}
            alt=""
            draggable={false}
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallback) return;
              img.dataset.fallback = "1";
              const chosen = deckArt && deckArt[name];
              img.src =
                chosen && img.src.includes("/thumbs/")
                  ? cardNoImage(chosen)
                  : cardImageSrc(name);
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: 2,
              bottom: 2,
              minWidth: 16,
              height: 16,
              padding: "0 3px",
              boxSizing: "border-box",
              borderRadius: 4,
              background: "rgba(0, 0, 0, 0.78)",
              color: "#fff",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: 11,
              lineHeight: "16px",
              textAlign: "center",
            }}
          >
            {count}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflow: "hidden",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "Noto Serif JP, serif",
            fontSize: 17,
            color: "#eafaff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {deck.name || "Unnamed deck"}
        </div>
        <div
          style={{
            marginTop: 2,
            fontFamily: "Share Tech Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "rgba(218, 246, 255, 0.7)",
          }}
        >
          {deckClass.toUpperCase() || "—"} · {(deck.deck || []).length} MAIN ·{" "}
          {(deck.evoDeck || []).length} EVO
        </div>
      </div>
      <div ref={areaRef} style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {sectionLabel("MAIN DECK", main.length)}
        {cardGrid(main)}
        {evo.length > 0 && (
          <div style={{ marginTop: SECTION_GAP }}>
            {sectionLabel("EVOLVE DECK", evo.length)}
            {cardGrid(evo)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ZoomedCard({ hovering, name, art, deck }) {
  const rootRef = useRef(null);
  // The left column sits inset from the viewport edge and is separated from the
  // center board by the flex row's space-around gap. Measure both so the preview
  // can run flush to the viewport's left edge while stopping just short of the
  // centerCanvas, filling the left region without touching the board.
  const [offsets, setOffsets] = useState({ left: 0, right: 0 });

  const visible = !!deck || (hovering && !!name);

  useLayoutEffect(() => {
    if (!visible) {
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
  }, [visible, name, deck]);

  if (!visible) return null;
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
      {deck ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: "12px 14px",
            boxSizing: "border-box",
          }}
        >
          <DeckPreview deck={deck} art={art} />
        </div>
      ) : (
        /* Inset the content while the panel itself stays edge-to-edge. The
           centered column keeps the text, icons and description from hugging the
           left edge on wide screens. Cap the card art at ~half the screen height
           and auto-scale the effect text to fit — the preview must never need a
           scrollbar (the viewer is holding a hover and can't scroll). */
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
      )}
    </div>
  );
}
