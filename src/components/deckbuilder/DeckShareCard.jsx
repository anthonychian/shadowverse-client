import React from "react";
import { cardImage, artThumb, artImage } from "../../decks/getCards";

import { getCost, primaryType } from "../../decks/cardDetails";
import { CLASS_LABELS, CLASS_COLORS } from "./theme";
import { classIcon } from "./icons";

// The social preview card: what a shared deck looks like when its link is
// unfurled in Discord/Twitter. This is rendered off-screen at a fixed size and
// screenshotted (see src/lib/deckImage.js) — it is never shown in the app, so
// it deliberately ignores the viewport and uses only inline styles and
// same-origin images, both of which html2canvas needs to capture cleanly.
//
// Layout follows the convention other Shadowverse deck sites use: a header with
// the deck's key card, name, class and card-type breakdown, then the main and
// evolve decks as art grids with copy-count badges.

export const SHARE_CARD_WIDTH = 1200;

const PAD = 40;
const COLUMNS = 8;
const GAP = 12;
const CARD_W = Math.floor((SHARE_CARD_WIDTH - PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS);
const CARD_H = Math.round((CARD_W * 173) / 124);

// Card art is referenced app-wide as "../textures/…", which resolves relative
// to the current route. The capture runs off-screen where that's fragile, so
// pin every image to an absolute path.
const abs = (src) => (src && src.startsWith("../") ? src.slice(2) : src);

// name -> copies, in the deck's stored order collapsed to unique cards.
const countsOf = (names = []) => {
  const map = new Map();
  for (const n of names) map.set(n, (map.get(n) || 0) + 1);
  return map;
};

// Cheapest first, matching how the deck reads everywhere else in the app.
const byCost = (entries) =>
  [...entries].sort((a, b) => {
    const ca = getCost(a[0]);
    const cb = getCost(b[0]);
    const va = ca == null ? 99 : ca;
    const vb = cb == null ? 99 : cb;
    if (va !== vb) return va - vb;
    return a[0].localeCompare(b[0]);
  });

// The deck's most expensive card, used as the header's hero art — a decent
// stand-in for "what this deck is about" without asking the user to pick one.
const keyCard = (names = []) => {
  let best = null;
  let bestCost = -1;
  for (const n of names) {
    const c = getCost(n);
    const v = c == null ? -1 : c;
    if (v > bestCost) {
      bestCost = v;
      best = n;
    }
  }
  return best;
};

const Grid = ({ entries, art }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${COLUMNS}, ${CARD_W}px)`,
      gap: GAP,
    }}
  >
    {entries.map(([name, count]) => (
      <div
        key={name}
        style={{
          position: "relative",
          width: CARD_W,
          height: CARD_H,
          borderRadius: 6,
          overflow: "hidden",
          background: "rgba(0, 0, 0, 0.55)",
        }}
      >
        <img
          src={abs(artThumb(name, art))}
          alt=""
          // Same ladder as DeckPanel: a chosen printing without a thumbnail on
          // disk falls back to its full art, then to the card's default art.
          onError={(e) => {
            const chosen = art && art[name];
            if (chosen && e.currentTarget.src.indexOf("/thumbs/") !== -1) {
              e.currentTarget.src = `/textures/${chosen}.png`;
            } else if (chosen) {
              e.currentTarget.src = abs(cardImage(name));
            }
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            minWidth: 26,
            padding: "1px 6px",
            borderRadius: 5,
            background: "rgba(0, 0, 0, 0.82)",
            color: "#ffffff",
            font: "700 15px/1.4 Arial, Helvetica, sans-serif",
            textAlign: "center",
          }}
        >
          x{count}
        </div>
      </div>
    ))}
  </div>
);

const SectionTitle = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      margin: "26px 0 12px",
    }}
  >
    <span style={{ width: 5, height: 22, background: "#48abe0", borderRadius: 3 }} />
    <span style={{ color: "#ffffff", font: "700 26px/1 Arial, Helvetica, sans-serif" }}>
      {children}
    </span>
  </div>
);

export default function DeckShareCard({ deck, ownerName, url }) {
  const main = byCost(countsOf(deck?.deck).entries());
  const evo = byCost(countsOf(deck?.evoDeck).entries());
  const art = deck?.art || {};
  const cls = deck?.class || "";
  const accent = CLASS_COLORS[cls] || "#48abe0";

  const mainLen = deck?.deck?.length || 0;
  const evoLen = deck?.evoDeck?.length || 0;

  const types = { Follower: 0, Spell: 0, Amulet: 0 };
  for (const [name, count] of main) {
    const t = primaryType(name);
    if (types[t] != null) types[t] += count;
  }
  const breakdown = ["Follower", "Spell", "Amulet"]
    .filter((t) => types[t] > 0)
    .map((t) => `${types[t]} ${t}${types[t] === 1 ? "" : "s"}`)
    .join("  •  ");

  const hero = keyCard(deck?.deck);
  const heroSrc = hero ? abs(artImage(hero, art)) : null;
  const clsIcon = abs(classIcon(cls));

  return (
    <div
      style={{
        width: SHARE_CARD_WIDTH,
        padding: PAD,
        boxSizing: "border-box",
        background: "#0d1017",
        // Deliberately no gradient. html2canvas 1.4.1 parses gradients itself
        // and throws on shapes it doesn't understand — and a throw here means
        // the share silently ends up with no og:image at all. A flat panel plus
        // the class-coloured rule below carries the same idea with no risk.
        borderTop: `6px solid ${accent}`,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* header: hero art + deck identity */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
        {heroSrc && (
          <img
            src={heroSrc}
            alt=""
            style={{
              width: 150,
              height: Math.round((150 * 173) / 124),
              objectFit: "cover",
              borderRadius: 8,
              display: "block",
              border: `2px solid ${accent}66`,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 6 }}>
          <div
            style={{
              color: "#ffffff",
              font: "700 52px/1.15 Arial, Helvetica, sans-serif",
              // Long deck names wrap to a second line rather than overflowing.
              wordBreak: "break-word",
            }}
          >
            {deck?.name || "Untitled deck"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 14,
              color: accent,
              font: "700 27px/1 Arial, Helvetica, sans-serif",
            }}
          >
            {clsIcon && (
              <img src={clsIcon} alt="" style={{ height: 30, display: "block" }} />
            )}
            <span>{CLASS_LABELS[cls] || "Deck"}</span>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>•</span>
            <span style={{ color: "rgba(255,255,255,0.82)" }}>
              {mainLen} cards + {evoLen} evo
            </span>
          </div>
          {breakdown && (
            <div
              style={{
                marginTop: 12,
                color: "rgba(255,255,255,0.6)",
                font: "400 23px/1 Arial, Helvetica, sans-serif",
              }}
            >
              {breakdown}
            </div>
          )}
          {ownerName && (
            <div
              style={{
                marginTop: 12,
                color: "rgba(255,255,255,0.45)",
                font: "400 21px/1 Arial, Helvetica, sans-serif",
              }}
            >
              shared by {ownerName}
            </div>
          )}
        </div>
      </div>

      {main.length > 0 && (
        <>
          <SectionTitle>Main Deck ({mainLen})</SectionTitle>
          <Grid entries={main} art={art} />
        </>
      )}

      {evo.length > 0 && (
        <>
          <SectionTitle>Evo Deck ({evoLen})</SectionTitle>
          <Grid entries={evo} art={art} />
        </>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 30,
          paddingTop: 18,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.4)",
          font: "400 20px/1 Arial, Helvetica, sans-serif",
        }}
      >
        <span>{url}</span>
        <span>Shadowverse Evolve Simulator</span>
      </div>
    </div>
  );
}
