import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { cardImage } from "../../decks/getCards";
import { COLORS, FONT } from "./theme";

const W = 124;
const H = 173;

// The card LIST uses downscaled thumbnails (public/textures/thumbs/) to keep the
// pool light; the inspector/deck still load the full-size originals. Rewrite a
// "../textures/X.png" path to its thumb; if a thumb is ever missing the <img>
// onError swaps back to the full image.
const thumbSrc = (src) =>
  src && src.includes("/textures/") && !src.includes("/textures/thumbs/")
    ? src.replace("/textures/", "/textures/thumbs/")
    : src;

export default function CardGrid({
  items, visibleCount, onLoadMore, hasMore, scrollTargetId,
  onInspect, onAdd, onRemove, isAtLimit, countOf, copyMaxOf, inspectedKey, isMobile,
}) {
  return (
    <InfiniteScroll
      dataLength={visibleCount}
      next={onLoadMore}
      hasMore={hasMore}
      loader={<div style={{ width: "100%", height: 30 }} />}
      scrollThreshold={0.85}
      scrollableTarget={scrollTargetId}
      style={
        isMobile
          ? {
              // Mobile: same 3-column grid + padding as the deck view, so cards
              // are large and well-spaced (fewer accidental taps on neighbours).
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
              alignItems: "start", padding: "12px 30px 80px",
            }
          : {
              display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "flex-start",
              alignItems: "flex-start", padding: "14px 14px 80px",
            }
      }
    >
      {items.slice(0, visibleCount).map((item, idx) => {
        const itemKey = item.key || item.name;
        return (
          <CardTile
            key={itemKey + "@" + idx}
            name={item.name}
            cardNo={item.cardNo}
            cardKey={itemKey}
            count={countOf ? countOf(item.name) : 0}
            copyMax={copyMaxOf ? copyMaxOf(item.name) : 3}
            maxed={isAtLimit ? isAtLimit(item.name) : false}
            selected={itemKey === inspectedKey}
            onInspect={onInspect}
            onAdd={onAdd}
            onRemove={onRemove}
            isMobile={isMobile}
          />
        );
      })}
      {items.length === 0 && (
        <div style={{ color: COLORS.textDim, fontFamily: FONT, padding: 40 }}>
          No cards match these filters.
        </div>
      )}
    </InfiniteScroll>
  );
}

function CardTile({ name, cardNo, cardKey, count, copyMax, maxed, selected, onInspect, onAdd, onRemove, isMobile }) {
  const [hover, setHover] = React.useState(false);
  // In the "show all printings" view a specific printing is requested by card
  // number; otherwise fall back to the name-keyed image used everywhere else.
  const fullSrc = cardNo ? `../textures/${cardNo}.png` : cardImage(name);
  const src = thumbSrc(fullSrc);
  // Desktop hover buttons fade in on hover; mobile has no hover, so it uses
  // always-on icons (magnifier + trash) shown only once the card is in the deck.
  const btnBase = {
    position: "absolute", bottom: 6, width: 28, height: 28, borderRadius: "50%",
    border: "none", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
    opacity: hover ? 1 : 0, pointerEvents: hover ? "auto" : "none",
    transition: "opacity .12s",
  };
  // On mobile, tapping the card body adds a copy (the icons handle inspect /
  // remove and stop propagation so they don't also add). On desktop, a tap
  // inspects and hover reveals the add/remove buttons.
  const handleBodyClick = () => {
    if (isMobile) { if (!maxed && onAdd) onAdd(name, cardNo); }
    else onInspect(name, cardKey, cardNo);
  };
  // Desktop tiles are a fixed size; mobile tiles fill their grid cell and keep
  // the card aspect ratio so the pool matches the deck view's responsive grid.
  const tileSize = isMobile
    ? { width: "100%", aspectRatio: `${W} / ${H}` }
    : { width: W, height: H };
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.06, zIndex: 5 }}
      transition={{ duration: 0.12 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onClick={handleBodyClick}
      onDoubleClick={() => { if (!isMobile && !maxed && onAdd) onAdd(name, cardNo); }}
      style={{
        position: "relative", ...tileSize, cursor: "pointer", borderRadius: 8,
        // The blue selection highlight is desktop-only; on mobile a tap adds a
        // card rather than "selecting" it, so the outline would be misleading.
        outline: selected && !isMobile ? `3px solid ${COLORS.glow}` : "none",
        boxShadow: selected && !isMobile ? `0 0 16px ${COLORS.glow}` : "none",
      }}
    >
      <LazyLoadImage
        width={W} height={H} effect="opacity" src={src} alt={name}
        // Decode off the main thread so scrolling stays smooth, and start loading
        // a bit before the tile scrolls into view so cards are ready in time.
        decoding="async" loading="lazy" threshold={300}
        wrapperProps={isMobile ? { style: { display: "block", width: "100%", height: "100%" } } : undefined}
        onError={(e) => {
          // Thumb missing -> fall back to the full-size image once.
          if (e.currentTarget.src.indexOf("/textures/thumbs/") !== -1) {
            e.currentTarget.src = fullSrc;
          }
        }}
        placeholder={
          // Static placeholder (no animated shimmer): dozens of animated skeletons
          // on screen at once is a real scroll-jank cost on phones.
          <span style={{ display: "block", width: isMobile ? "100%" : W, height: isMobile ? "100%" : H, borderRadius: 8, background: "rgba(255,255,255,0.06)" }} />
        }
        style={{
          borderRadius: 8, filter: maxed ? "grayscale(85%) brightness(0.7)" : "none",
          ...(isMobile ? { width: "100%", height: "100%", objectFit: "cover", display: "block" } : {}),
        }}
      />

      {/* The top-left count badge is desktop-only; on mobile the in-deck bar
          below shows the "count / max" instead. */}
      {count > 0 && !isMobile && <div style={countBadge}>{count}</div>}

      {isMobile ? (
        // Only an in-deck card (count >= 1) shows controls: a bottom bar with a
        // magnifier (opens the preview modal), the copy count ("n / max"), and a
        // trash (removes a copy). The buttons stop propagation so the card-body
        // tap (which adds) doesn't also fire.
        count > 0 && (
          <div style={mobileBar}>
            <button
              onClick={(e) => { e.stopPropagation(); onInspect(name, cardKey, cardNo); }}
              title="Inspect card"
              style={mobileBarBtn}
            >
              <SearchIcon sx={{ fontSize: 32 }} />
            </button>
            <span style={mobileBarCount}>
              {copyMax == null ? count : `${count} / ${copyMax}`}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); if (onRemove) onRemove(name); }}
              title="Remove from deck"
              style={mobileBarBtn}
            >
              <DeleteOutlineIcon sx={{ fontSize: 32 }} />
            </button>
          </div>
        )
      ) : (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); if (count > 0 && onRemove) onRemove(name); }}
            disabled={count === 0}
            title="Remove from deck"
            style={{
              ...btnBase, left: 6,
              background: count === 0 ? "rgba(255,255,255,0.15)" : COLORS.danger,
              color: count === 0 ? "rgba(255,255,255,0.4)" : "#fff",
              cursor: count === 0 ? "default" : "pointer",
            }}
          >
            <RemoveIcon fontSize="small" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); if (!maxed) onAdd(name, cardNo); }}
            disabled={maxed}
            title={maxed ? "At copy limit" : "Add to deck"}
            style={{
              ...btnBase, right: 6,
              background: maxed ? "rgba(255,255,255,0.15)" : COLORS.glow,
              color: maxed ? "rgba(255,255,255,0.4)" : "#fff",
              cursor: maxed ? "default" : "pointer",
            }}
          >
            <AddIcon fontSize="small" />
          </button>
        </>
      )}
    </motion.div>
  );
}

// In-deck control bar shown across the bottom of a mobile pool card: large
// white magnifier + "count / max" + large white trash on a dark gradient.
const mobileBar = {
  position: "absolute", left: 0, right: 0, bottom: 0,
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "8px 12px",
  borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  background: "linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.78) 60%, rgba(0,0,0,0))",
};
const mobileBarBtn = {
  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
  background: "rgba(255,255,255,0.95)", color: "#1b1f27",
  border: "none", padding: 0, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.55)",
};
const mobileBarCount = {
  color: "#fff", fontFamily: FONT, fontSize: 18, fontWeight: 700, whiteSpace: "nowrap",
  textShadow: "0 1px 3px rgba(0,0,0,0.95)",
};

const countBadge = {
  position: "absolute", top: 6, left: 6, minWidth: 24, height: 24, padding: "0 5px",
  borderRadius: 6, background: "rgba(0,0,0,0.8)", color: "#fff", fontFamily: FONT,
  fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
  border: `1px solid ${COLORS.glow}`,
};
