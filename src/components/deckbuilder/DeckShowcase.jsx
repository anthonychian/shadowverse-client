import React from "react";
import DeckArtGrid, { SectionHeading } from "./DeckArtGrid";
import { ManaCurve, Breakdown } from "./DeckPanel";
import { COLORS, FONT, CLASS_LABELS, CLASS_COLORS } from "./theme";
import { classIcon } from "./icons";

// The one read-only deck view, used by the deck page at /decks/:id — which is
// both what Home's Preview opens and what a share link points at, so the two
// can't drift apart.
//
// Laid out the way deck sites lay this out: identity header, a full-width strip
// of stats (cost curve + type breakdown), then the main and evolve decks as art
// grids underneath. Stats across the top rather than down one side keeps the
// card grids at full page width, which is what lets a whole deck — main and
// evolve both — land on one screen instead of forcing a scroll between them.
//
// Callers supply their own `actions`: Share/Edit for the deck's owner,
// Save/Copy link for a visitor.

// Cards per row. Fixed count, fluid width — a row holds the same number of
// cards at any window size, and the main and evolve decks share the grid.
// 6 across the ~1200px column puts a card near 190px wide. Click one to see it
// full size.
export const COLUMNS_DESKTOP = 6;
export const COLUMNS_MOBILE = 3;

const panel = {
  background: "rgba(10, 14, 20, 0.75)",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: 14,
  boxSizing: "border-box",
};

export default function DeckShowcase({
  deck,
  deckMap,
  evoDeckMap,
  deckClass,
  ownerName,
  onInspect,
  actions,
  isMobile,
  // Full-resolution card art instead of thumbnails (see DeckArtGrid).
  fullArt = false,
}) {
  const accent = CLASS_COLORS[deckClass] || COLORS.glow;
  const mainLen = deck?.deck ? deck.deck.length : 0;
  const evoLen = deck?.evoDeck ? deck.evoDeck.length : 0;
  const columns = isMobile ? COLUMNS_MOBILE : COLUMNS_DESKTOP;

  return (
    <div style={{ width: "100%", fontFamily: FONT, color: COLORS.text, boxSizing: "border-box" }}>
      {/* deck identity */}
      <div
        style={{
          ...panel,
          marginBottom: 12,
          display: "flex",
          gap: 18,
          alignItems: "center",
          flexWrap: "wrap",
          borderLeft: `4px solid ${accent}`,
        }}
      >
        {classIcon(deckClass) && (
          <img src={classIcon(deckClass)} alt="" style={{ height: 36, flexShrink: 0 }} />
        )}
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 21 : 25,
              fontWeight: 700,
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            {deck?.name || "Untitled deck"}
          </h1>
          <div style={{ marginTop: 6, color: COLORS.textDim, fontSize: 14 }}>
            <span style={{ color: accent, fontWeight: 700 }}>
              {CLASS_LABELS[deckClass] || "Deck"}
            </span>
            {"  •  "}
            {mainLen} cards + {evoLen} evo
            {ownerName ? `  •  shared by ${ownerName}` : ""}
          </div>
        </div>
        {actions}
      </div>

      {/* Stats strip: the builder's own cost curve and type breakdown, side by
          side. No panel chrome of its own — each already draws an inset panel,
          and wrapping a second bordered box around them was what left the odd
          gaps. Their built-in 12px bottom margin spaces the strip from the
          cards below, and flex-start keeps the shorter of the two from being
          stretched to match the taller. */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <ManaCurve map={deckMap} />
        </div>
        <div style={{ flex: "1 1 300px", minWidth: 0 }}>
          <Breakdown
            deckMap={deckMap}
            evoDeckMap={evoDeckMap}
            deckLen={mainLen}
            evoLen={evoLen}
          />
        </div>
      </div>

      {/* cards, full width */}
      <div style={panel}>
        <SectionHeading title="Main Deck" count={mainLen} max={50} />
        <DeckArtGrid
          map={deckMap}
          art={deck?.art}
          onInspect={onInspect}
          columns={columns}
          fullArt={fullArt}
        />
        <div style={{ height: 14 }} />
        <SectionHeading title="Evolve Deck" count={evoLen} max={10} />
        <DeckArtGrid
          map={evoDeckMap}
          art={deck?.art}
          onInspect={onInspect}
          columns={columns}
          fullArt={fullArt}
        />
      </div>
    </div>
  );
}
