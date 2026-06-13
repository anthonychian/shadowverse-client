import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
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
  onInspect, onAdd, onRemove, isAtLimit, countOf, inspectedKey,
}) {
  return (
    <InfiniteScroll
      dataLength={visibleCount}
      next={onLoadMore}
      hasMore={hasMore}
      loader={<div style={{ width: "100%", height: 30 }} />}
      scrollThreshold={0.85}
      scrollableTarget={scrollTargetId}
      style={{
        display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "flex-start",
        alignItems: "flex-start", padding: "14px 14px 80px",
      }}
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
            maxed={isAtLimit ? isAtLimit(item.name) : false}
            selected={itemKey === inspectedKey}
            onInspect={onInspect}
            onAdd={onAdd}
            onRemove={onRemove}
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

function CardTile({ name, cardNo, cardKey, count, maxed, selected, onInspect, onAdd, onRemove }) {
  const [hover, setHover] = React.useState(false);
  // In the "show all printings" view a specific printing is requested by card
  // number; otherwise fall back to the name-keyed image used everywhere else.
  const fullSrc = cardNo ? `../textures/${cardNo}.png` : cardImage(name);
  const src = thumbSrc(fullSrc);
  const btnBase = {
    position: "absolute", bottom: 6, width: 28, height: 28, borderRadius: "50%",
    border: "none", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
    opacity: hover ? 1 : 0, pointerEvents: hover ? "auto" : "none",
    transition: "opacity .12s",
  };
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.06, zIndex: 5 }}
      transition={{ duration: 0.12 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onClick={() => onInspect(name, cardKey, cardNo)}
      onDoubleClick={() => { if (!maxed && onAdd) onAdd(name, cardNo); }}
      style={{
        position: "relative", width: W, height: H, cursor: "pointer", borderRadius: 8,
        outline: selected ? `3px solid ${COLORS.glow}` : "none",
        boxShadow: selected ? `0 0 16px ${COLORS.glow}` : "none",
      }}
    >
      <LazyLoadImage
        width={W} height={H} effect="opacity" src={src} alt={name}
        onError={(e) => {
          // Thumb missing -> fall back to the full-size image once.
          if (e.currentTarget.src.indexOf("/textures/thumbs/") !== -1) {
            e.currentTarget.src = fullSrc;
          }
        }}
        placeholder={
          <Skeleton sx={{ bgcolor: "grey", opacity: 0.4 }} animation="wave"
            variant="rounded" width={W} height={H} />
        }
        style={{ borderRadius: 8, filter: maxed ? "grayscale(85%) brightness(0.7)" : "none" }}
      />

      {count > 0 && <div style={countBadge}>{count}</div>}

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
    </motion.div>
  );
}

const countBadge = {
  position: "absolute", top: 6, left: 6, minWidth: 24, height: 24, padding: "0 5px",
  borderRadius: 6, background: "rgba(0,0,0,0.8)", color: "#fff", fontFamily: FONT,
  fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
  border: `1px solid ${COLORS.glow}`,
};
