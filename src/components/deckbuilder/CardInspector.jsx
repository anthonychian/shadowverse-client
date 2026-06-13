import React from "react";
import { cardImage } from "../../decks/getCards";
import { getDetails } from "../../decks/cardDetails";
import EffectText from "./EffectText";
import { COLORS, FONT, CLASS_LABELS, displayName } from "./theme";
import { classIcon, ATTACK_ICON, DEFENSE_ICON, costIcon } from "./icons";
import ArrowBackIosNew from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const Badge = ({ children, color }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 9px",
      borderRadius: 999,
      fontSize: 12,
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
  count = 0,
  atLimit = false,
  isDouble = false,
  onAdd,
  onRemove,
  onPrev,
  onNext,
  onSwap,
}) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
      {/* Card image with navigation */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <ArrowBackIosNew onClick={onPrev} sx={arrowSx("left")} />
        <img
          src={cardNo ? `../textures/${cardNo}.png` : cardImage(name)}
          alt={name}
          style={{ width: "100%", maxWidth: 360, borderRadius: 10, boxShadow: "0 6px 24px rgba(0,0,0,0.6)" }}
        />
        <ArrowForwardIos onClick={onNext} sx={arrowSx("right")} />
        {isDouble && (
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
      <div style={{ fontFamily: FONT, color: COLORS.text, fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>
        {displayName(name)}
      </div>

      {/* class · type · rarity */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {d.class && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: COLORS.text, fontFamily: FONT, fontSize: 13 }}>
            {classIcon(d.class) && <img src={classIcon(d.class)} alt={d.class} style={{ height: 22 }} />}
            {CLASS_LABELS[d.class] || d.class}
          </span>
        )}
        {d.cardType && <Badge>{d.cardType}</Badge>}
        {effRarity && effRarity !== "-" && <Badge color="rgba(243,196,75,0.85)">{effRarity}</Badge>}
      </div>

      {/* cost / attack / defense banner */}
      {(hasCost || hasAtk || hasDef) && (
        <div style={statBanner}>
          {hasCost && (
            <span style={statItem}>
              {costIcon(costNum) ? (
                <img src={costIcon(costNum)} alt="cost" style={{ height: 36 }} />
              ) : (
                <span style={costFallback}>{d.cost}</span>
              )}
              <span style={statLabel}>Cost</span>
            </span>
          )}
          {(hasAtk || hasDef) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>
              {hasAtk && (
                <span style={statItem}>
                  <img src={ATTACK_ICON} alt="attack" style={{ height: 27 }} />
                  <span style={statVal}>{d.attack}</span>
                </span>
              )}
              {hasDef && (
                <span style={statItem}>
                  <img src={DEFENSE_ICON} alt="defense" style={{ height: 27 }} />
                  <span style={statVal}>{d.defense}</span>
                </span>
              )}
            </span>
          )}
        </div>
      )}

      {d.trait && d.trait !== "-" && (
        <div style={{ fontFamily: FONT, color: COLORS.textDim, fontSize: 13 }}>
          Trait: <span style={{ color: COLORS.text }}>{d.trait}</span>
        </div>
      )}

      {/* Effect text */}
      {d.effect && (
        <div
          style={{
            fontFamily: FONT, color: COLORS.text, fontSize: 14, lineHeight: 1.5,
            background: COLORS.inset, borderRadius: 8, padding: "10px 12px",
            overflowY: "auto", flex: "1 1 auto", minHeight: 0,
          }}
        >
          <EffectText text={d.effect} />
        </div>
      )}

      {effCardSet && (
        <div style={{ fontFamily: FONT, color: COLORS.textDim, fontSize: 11 }}>{effCardSet}</div>
      )}

      {/* Copy stepper */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, paddingTop: 4 }}>
        <StepBtn onClick={onRemove} disabled={count <= 0}><RemoveIcon /></StepBtn>
        <div style={{ fontFamily: FONT, color: COLORS.text, fontSize: 22, minWidth: 70, textAlign: "center" }}>
          {count} <span style={{ fontSize: 13, color: COLORS.textDim }}>in deck</span>
        </div>
        <StepBtn onClick={onAdd} disabled={atLimit} accent><AddIcon /></StepBtn>
      </div>
    </div>
  );
}

const StepBtn = ({ children, onClick, disabled, accent }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    style={{
      width: 44, height: 44, borderRadius: "50%", border: "none",
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

const arrowSx = (side) => ({
  position: "absolute",
  [side]: -6,
  top: "50%",
  transform: "translateY(-50%)",
  color: "white",
  opacity: 0.5,
  cursor: "pointer",
  fontSize: 30,
  zIndex: 2,
  "&:hover": { opacity: 1 },
});

const emptyStyle = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  height: "100%", minHeight: 360, border: `2px dashed ${COLORS.border}`, borderRadius: 12,
};
