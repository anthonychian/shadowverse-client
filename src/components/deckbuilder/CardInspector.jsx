import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { cardImage } from "../../decks/getCards";
import { getDetails } from "../../decks/cardDetails";
import EffectText from "./EffectText";
import { COLORS, FONT, CLASS_LABELS, displayName } from "./theme";
import { classIcon, ATTACK_ICON, DEFENSE_ICON, costIcon } from "./icons";
import Skeleton from "@mui/material/Skeleton";
import ArrowBackIosNew from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

// Scales its child down (uniformly) so it always fits the parent's height —
// never a scrollbar. Used for the in-game hover preview, where the player can't
// scroll because they're holding a hover over a card. Re-measures on resize and
// whenever `deps` change (i.e. a different card is hovered).
function FitScale({ children, deps = [] }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      inner.style.transform = "none";
      const avail = outer.clientHeight;
      const natural = inner.scrollHeight;
      const s = natural > 0 ? Math.min(1, avail / natural) : 1;
      inner.style.transform = `scale(${s})`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return (
    <div ref={outerRef} style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <div ref={innerRef} style={{ transformOrigin: "top left", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}

const Badge = ({ children, color, scale = 1 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4 * scale,
      padding: `${2 * scale}px ${9 * scale}px`,
      borderRadius: 999,
      fontSize: 12 * scale,
      fontFamily: FONT,
      background: color || "rgba(255,255,255,0.12)",
      color: COLORS.text,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const statBanner = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "8px 18px", background: COLORS.inset, borderRadius: 10, minHeight: 52,
};
const statItem = { display: "inline-flex", alignItems: "center", gap: 8 };
const statVal = { color: COLORS.text, fontFamily: FONT, fontSize: 23, fontWeight: 700, lineHeight: 1 };
const statLabel = { color: COLORS.textDim, fontFamily: FONT, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 };
const costFallback = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 34, height: 34, borderRadius: "50%", background: COLORS.glow,
  color: "#fff", fontFamily: FONT, fontSize: 18, fontWeight: 700,
};

export default function CardInspector({
  name,
  cardNo,
  rarity,
  cardSet,
  printings = [],
  selectedCardNo,
  onSelectPrinting,
  count = 0,
  atLimit = false,
  isDouble = false,
  onAdd,
  onRemove,
  onPrev,
  onNext,
  onSwap,
  large = false,
  // `fill` (roomy desktop preview dialog): make the card art the dominant,
  // largest element and let the description take only the leftover space.
  fill = false,
  // Optional override for the `fill`-mode card-art max height (any CSS length,
  // e.g. "70vh"). Lets a large preview (e.g. the in-game hover) keep the art big.
  imageMaxHeight,
  // Optional override for the default-mode card-art max width (any CSS length,
  // e.g. "100%"). Lets the art fill a wider column instead of the 360px cap.
  imageMaxWidth,
  // When true, the effect text auto-scales to fit its box height (never scrolls).
  // For previews the viewer can't scroll (e.g. while hovering a card in-game).
  fitEffect = false,
  readOnly = false,
  // In-game hover preview: restyle the chrome into Shadowverse-like floating
  // pieces — a blue gradient name banner and translucent dark, cut-corner stat
  // and effect panels — instead of the deck-builder's flat opaque blocks. Font,
  // icons and card-art size are unchanged; only panel shape and transparency are.
  gameStyle = false,
}) {
  // In `fitEffect` previews (e.g. the in-game hover) the height is fixed, so on
  // smaller screens shrink the chrome — name, traits, stats, icons, badges — to
  // keep the (vh-capped) art and the description as large as possible. metaScale
  // is 1 on tall screens and scales down with viewport height below ~900px.
  const [vpH, setVpH] = useState(typeof window !== "undefined" ? window.innerHeight : 1080);
  useEffect(() => {
    if (!fitEffect) return;
    const onResize = () => setVpH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fitEffect]);
  const metaScale = fitEffect ? Math.max(0.6, Math.min(1, vpH / 900)) : 1;

  // In the fullscreen mobile preview there's plenty of room, so scale the image,
  // text and stepper up; the desktop column keeps the compact sizes. In `fill`
  // mode (roomy desktop preview dialog) the text/icons are scaled DOWN so the
  // card art stays the largest, screen-scaled element.
  const imgMax = large ? 380 : 360;
  const gap = (fill ? 8 : large ? 10 : 12) * metaScale;
  const nameSize = (fill ? 18 : large ? 22 : 19) * metaScale;
  const metaSize = (fill ? 12 : large ? 14 : 13) * metaScale;
  // The description keeps its base size — FitScale shrinks it only if needed —
  // so it stays prioritized over the chrome on small screens.
  const effectSize = fill ? 12.5 : large ? 13 : 14;
  const statValSize = (fill ? 18 : large ? 20 : 23) * metaScale;
  const stepSize = large ? 52 : 44;
  const countSize = large ? 26 : 22;

  // gameStyle chrome: solid dark inset panels for the stat/effect areas, sitting
  // inside the single (non-transparent) preview container — the Shadowverse
  // description-box look, not separate floating pieces. The name stays plain
  // text (no header bar), as before.
  const gamePanel = gameStyle
    ? {
        background: "rgba(0,0,0,0.4)",
        border: "1px solid rgba(120,150,190,0.22)",
        borderRadius: 8,
      }
    : null;

  // Card-art box: the same size caps as before, but expressed so the box keeps
  // the card's aspect ratio and therefore reserves its space *before* the image
  // loads. That lets a skeleton fill it and the art cross-fade in — no blank
  // gap / layout shift while the (full-size) image downloads. Each mode drives
  // off whichever dimension binds: height on the portrait mobile/preview crops,
  // width on the desktop column.
  const artBox = fill
    ? { height: imageMaxHeight || "min(58vh, 620px)", maxWidth: "100%" }
    : large
    ? { height: "32vh", maxWidth: imgMax }
    : imageMaxHeight
    ? { height: imageMaxHeight, maxWidth: imageMaxWidth || "100%" }
    : { width: "100%", maxWidth: imageMaxWidth || imgMax };

  if (!name) {
    return (
      <div style={emptyStyle}>
        <div style={{ color: COLORS.textDim, fontFamily: FONT, textAlign: "center" }}>
          Select a card to inspect it here.
        </div>
      </div>
    );
  }

  const d = getDetails(name) || {};
  // Rarity and set differ per printing; prefer the inspected printing's values
  // (passed in) over the name-keyed defaults.
  const effRarity = rarity != null ? rarity : d.rarity;
  const effCardSet = cardSet != null ? cardSet : d.cardSet;
  const isFollower = (d.cardType || "").toLowerCase().startsWith("follower");
  const hasCost = d.cost && d.cost !== "-";
  const costNum = parseInt(d.cost, 10);
  const hasAtk = isFollower && d.attack && d.attack !== "-";
  const hasDef = isFollower && d.defense && d.defense !== "-";

  // Rarity / art picker: one option per printing. When the same rarity exists in
  // more than one set, append the set code so the options stay distinguishable.
  const rarityCounts = {};
  printings.forEach((p) => { rarityCounts[p.rarity] = (rarityCounts[p.rarity] || 0) + 1; });
  const labelFor = (p) =>
    rarityCounts[p.rarity] > 1 ? `${p.rarity || "—"} · ${p.set}` : p.rarity || "—";
  const showPicker = printings.length > 1 && typeof onSelectPrinting === "function";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: fill ? "auto" : "100%", gap }}>
      {/* Card image with navigation. In large mode a side gutter keeps the
          arrows off the card art. */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: 0 }}>
        {/* Nav arrows are desktop-only — the mobile (large) preview has none. */}
        {!readOnly && !large && <ArrowBackIosNew onClick={onPrev} sx={arrowSx("left", large)} />}
        <CardArt
          src={cardNo ? `../textures/${cardNo}.png` : cardImage(name)}
          alt={name}
          boxStyle={artBox}
        />
        {!readOnly && !large && <ArrowForwardIos onClick={onNext} sx={arrowSx("right", large)} />}
        {isDouble && !readOnly && (
          <SwapHorizIcon
            onClick={onSwap}
            sx={{
              position: "absolute", top: 8, right: 8, color: "white",
              background: "rgba(0,0,0,0.55)", borderRadius: "50%", p: "3px",
              fontSize: 30, cursor: "pointer", "&:hover": { background: COLORS.glow },
            }}
          />
        )}
      </div>

      {/* Name */}
      <div style={{ fontFamily: FONT, color: COLORS.text, fontSize: nameSize, fontWeight: 700, lineHeight: 1.2 }}>
        {displayName(name)}
      </div>

      {/* class · type · rarity */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {d.class && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: COLORS.text, fontFamily: FONT, fontSize: metaSize }}>
            {classIcon(d.class) && <img src={classIcon(d.class)} alt={d.class} style={{ height: (fill ? 18 : 22) * metaScale }} />}
            {CLASS_LABELS[d.class] || d.class}
          </span>
        )}
        {d.cardType && <Badge scale={metaScale}>{d.cardType}</Badge>}
        {/* Only show the rarity badge when the Rarity/Art picker isn't shown —
            otherwise the selected rarity would appear twice. */}
        {!showPicker && effRarity && effRarity !== "-" && <Badge scale={metaScale} color="rgba(243,196,75,0.85)">{effRarity}</Badge>}
      </div>

      {/* rarity / art picker — choose which printing's art this card uses */}
      {showPicker && (
        <div>
          <div style={{ color: COLORS.textDim, fontFamily: FONT, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
            Rarity / Art
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {printings.map((p) => {
              const active = p.cardNo === selectedCardNo;
              return (
                <span
                  key={p.cardNo}
                  onClick={() => onSelectPrinting(p.cardNo)}
                  title={`${p.rarity || "—"} — ${p.cardSet || p.set}`}
                  style={{
                    cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
                    padding: "3px 10px", borderRadius: 999, fontSize: 12, fontFamily: FONT,
                    border: `1px solid ${active ? COLORS.glow : COLORS.border}`,
                    background: active ? COLORS.glow : "rgba(255,255,255,0.04)",
                    color: active ? "#fff" : COLORS.textDim,
                  }}
                >
                  {labelFor(p)}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* cost / attack / defense banner */}
      {(hasCost || hasAtk || hasDef) && (
        <div style={{ ...statBanner, ...gamePanel, minHeight: (fill ? 40 : large ? 44 : 52) * metaScale, padding: fill ? "4px 14px" : large ? "6px 16px" : "8px 18px" }}>
          {hasCost && (
            <span style={statItem}>
              {costIcon(costNum) ? (
                <img src={costIcon(costNum)} alt="cost" style={{ height: (fill ? 24 : large ? 28 : 36) * metaScale }} />
              ) : (
                <span style={{ ...costFallback, width: (fill ? 26 : large ? 28 : 34) * metaScale, height: (fill ? 26 : large ? 28 : 34) * metaScale, fontSize: (fill ? 15 : large ? 16 : 18) * metaScale }}>{d.cost}</span>
              )}
              <span style={{ ...statLabel, fontSize: 12 * metaScale }}>Cost</span>
            </span>
          )}
          {(hasAtk || hasDef) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 18 * metaScale }}>
              {hasAtk && (
                <span style={statItem}>
                  <img src={ATTACK_ICON} alt="attack" style={{ height: (fill ? 20 : large ? 22 : 27) * metaScale }} />
                  <span style={{ ...statVal, fontSize: statValSize }}>{d.attack}</span>
                </span>
              )}
              {hasDef && (
                <span style={statItem}>
                  <img src={DEFENSE_ICON} alt="defense" style={{ height: (fill ? 20 : large ? 22 : 27) * metaScale }} />
                  <span style={{ ...statVal, fontSize: statValSize }}>{d.defense}</span>
                </span>
              )}
            </span>
          )}
        </div>
      )}

      {d.trait && d.trait !== "-" && (
        <div style={{ fontFamily: FONT, color: COLORS.textDim, fontSize: metaSize }}>
          Trait: <span style={{ color: COLORS.text }}>{d.trait}</span>
        </div>
      )}

      {/* Effect text */}
      {d.effect && (
        <div
          style={{
            fontFamily: FONT, color: COLORS.text, fontSize: effectSize, lineHeight: 1.45,
            background: COLORS.inset, borderRadius: 8, padding: gameStyle ? "12px 14px" : "10px 12px",
            ...gamePanel,
            // In `fill` mode the box grows to its natural height (no inner
            // scrollbar) so any overflow falls to the dialog, which scrolls only
            // when it's too small to fit everything. `fitEffect` clips and the
            // text auto-scales to fit. Elsewhere it scrolls itself.
            overflowY: fitEffect ? "hidden" : fill ? "visible" : "auto",
            flex: fill ? "0 0 auto" : "1 1 auto",
            // Description box stays large in the mobile preview — never small.
            minHeight: fitEffect ? 0 : fill ? 0 : large ? "30vh" : 0,
          }}
        >
          {fitEffect ? (
            <FitScale deps={[name, d.effect]}>
              <EffectText text={d.effect} />
            </FitScale>
          ) : (
            <EffectText text={d.effect} tooltips />
          )}
        </div>
      )}

      {effCardSet && (
        <div style={{ fontFamily: FONT, color: COLORS.textDim, fontSize: (large ? 13 : 11) * metaScale }}>{effCardSet}</div>
      )}

      {/* Copy stepper (hidden in read-only preview) */}
      {!readOnly && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: large ? 20 : 14, paddingTop: 4 }}>
          <StepBtn size={stepSize} onClick={onRemove} disabled={count <= 0}><RemoveIcon sx={{ fontSize: large ? 30 : 24 }} /></StepBtn>
          <div style={{ fontFamily: FONT, color: COLORS.text, fontSize: countSize, minWidth: large ? 92 : 70, textAlign: "center" }}>
            {count} <span style={{ fontSize: large ? 16 : 13, color: COLORS.textDim }}>in deck</span>
          </div>
          <StepBtn size={stepSize} onClick={onAdd} disabled={atLimit} accent><AddIcon sx={{ fontSize: large ? 30 : 24 }} /></StepBtn>
        </div>
      )}
    </div>
  );
}

// Card art with a skeleton placeholder. The wrapper holds the card aspect ratio
// (459:641) and the size caps, so it reserves the art's footprint immediately;
// a shimmering skeleton fills it and the image cross-fades in once decoded —
// no blank gap or layout shift while the full-size texture downloads.
const CARD_ASPECT = "459 / 641";
function CardArt({ src, alt, boxStyle }) {
  const [loaded, setLoaded] = useState(false);
  // A new card (src change) starts loading again — reset so the skeleton shows.
  useEffect(() => { setLoaded(false); }, [src]);
  return (
    <div
      style={{
        position: "relative", aspectRatio: CARD_ASPECT, overflow: "hidden",
        borderRadius: 10, boxShadow: "0 6px 24px rgba(0,0,0,0.6)", ...boxStyle,
      }}
    >
      {!loaded && (
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            borderRadius: "10px", bgcolor: "rgba(255,255,255,0.07)",
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        // Already-cached images can fire load before React attaches onLoad; if it
        // reports complete on mount, treat it as loaded.
        ref={(el) => { if (el && el.complete && el.naturalWidth > 0) setLoaded(true); }}
        decoding="async"
        style={{
          width: "100%", height: "100%", objectFit: "contain", display: "block",
          opacity: loaded ? 1 : 0, transition: "opacity .25s ease",
        }}
      />
    </div>
  );
}

const StepBtn = ({ children, onClick, disabled, accent, size = 44 }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    style={{
      width: size, height: size, borderRadius: "50%", border: "none",
      cursor: disabled ? "default" : "pointer",
      background: disabled ? "rgba(255,255,255,0.08)" : accent ? COLORS.glow : "rgba(255,255,255,0.18)",
      color: disabled ? "rgba(255,255,255,0.3)" : "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.15s",
    }}
  >
    {children}
  </button>
);

const arrowSx = (side, large = false) => ({
  position: "absolute",
  [side]: large ? 6 : -6,
  top: "50%",
  transform: "translateY(-50%)",
  color: "white",
  opacity: 0.5,
  cursor: "pointer",
  fontSize: large ? 36 : 30,
  zIndex: 2,
  "&:hover": { opacity: 1 },
});

const emptyStyle = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  height: "100%", minHeight: 360, border: `2px dashed ${COLORS.border}`, borderRadius: 12,
};
