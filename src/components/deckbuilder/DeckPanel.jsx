import React from "react";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { cardImage, toThumb } from "../../decks/getCards";
import { getCost, primaryType } from "../../decks/cardDetails";
import { COLORS, FONT, CLASS_ORDER, CLASS_LABELS, CLASS_COLORS, displayName } from "./theme";
import { classIcon } from "./icons";

const sortedEntries = (map) =>
  [...map.entries()].sort((a, b) => {
    const ca = getCost(a[0]); const cb = getCost(b[0]);
    const va = ca == null ? 99 : ca; const vb = cb == null ? 99 : cb;
    if (va !== vb) return va - vb;
    return a[0].localeCompare(b[0]);
  });

// A deck entry shown as a card thumbnail (Deck Log style): full art with a
// bottom bar matching the pool cards — white-circle magnifier (inspect),
// "count / max", and white-circle trash (remove a copy).
const DeckCard = ({ name, count, copyMax, artNo, onInspect, onAdd, onRemove }) => (
  <div
    onClick={() => onAdd && onAdd(name)}
    title={displayName(name)}
    style={{
      position: "relative", borderRadius: 6, overflow: "hidden", cursor: "pointer",
      aspectRatio: "124 / 173", background: COLORS.inset,
    }}
  >
    <img
      src={artNo ? `../textures/thumbs/${artNo}.png` : toThumb(cardImage(name))}
      loading="lazy" decoding="async"
      onError={(e) => {
        // Fall back to the full chosen-art image, then the default art.
        if (artNo && e.currentTarget.src.indexOf("/thumbs/") !== -1) {
          e.currentTarget.src = `../textures/${artNo}.png`;
        } else if (e.currentTarget.src.indexOf("/textures/") !== -1 && artNo) {
          e.currentTarget.src = cardImage(name);
        }
      }}
      alt={name}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
    <div style={deckBar}>
      <button
        onClick={(e) => { e.stopPropagation(); onInspect(name); }}
        title="Inspect card" style={deckBarBtn}
      >
        <SearchIcon sx={{ fontSize: 32 }} />
      </button>
      <span style={deckBarCount}>{copyMax == null ? count : `${count} / ${copyMax}`}</span>
      <button
        onClick={(e) => { e.stopPropagation(); if (onRemove) onRemove(name); }}
        title="Remove from deck" style={deckBarBtn}
      >
        <DeleteOutlineIcon sx={{ fontSize: 32 }} />
      </button>
    </div>
  </div>
);

const deckBar = {
  position: "absolute", left: 0, right: 0, bottom: 0,
  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px",
  borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
  background: "linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.78) 60%, rgba(0,0,0,0))",
};
const deckBarBtn = {
  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
  background: "rgba(255,255,255,0.95)", color: "#1b1f27",
  border: "none", padding: 0, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.55)",
};
const deckBarCount = {
  color: "#fff", fontFamily: FONT, fontSize: 18, fontWeight: 700, whiteSpace: "nowrap",
  textShadow: "0 1px 3px rgba(0,0,0,0.95)",
};
const deckGrid = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 6,
};

// Cost (mana) curve, styled after Deck Log: a "Cost" heading, a row of count
// pills (always shown, including 0) above salmon bars rising from a common
// baseline, with the 0–8+ axis below.
const CURVE_BAR = "#ed8a8a";
const ManaCurve = ({ map }) => {
  const buckets = Array(9).fill(0); // 0..7, 8+
  for (const [name, count] of map.entries()) {
    const c = getCost(name);
    if (c == null) continue;
    buckets[Math.min(c, 8)] += count;
  }
  const max = Math.max(1, ...buckets);
  return (
    <div style={{ background: COLORS.inset, borderRadius: 10, padding: "8px 8px 6px", marginBottom: 12 }}>
      <div style={{ textAlign: "center", color: COLORS.text, fontFamily: FONT, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        Cost
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {buckets.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <span style={costPill}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 54 }}>
        {buckets.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: "72%", margin: "0 auto", height: `${(v / max) * 100}%`, minHeight: v ? 3 : 0, background: CURVE_BAR, borderRadius: "3px 3px 0 0" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {buckets.map((v, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", color: COLORS.textDim, fontSize: 10, fontFamily: FONT }}>
            {i === 8 ? "8+" : i}
          </div>
        ))}
      </div>
    </div>
  );
};

const costPill = {
  minWidth: 16, padding: "1px 6px", borderRadius: 999, fontSize: 11, fontWeight: 700,
  fontFamily: FONT, lineHeight: 1.4, textAlign: "center", color: "#fff",
  background: "rgba(0,0,0,0.6)", border: `1px solid ${COLORS.border}`,
};

// One "｜ Label ：value" line in the deck breakdown (gold tick + label + count).
const StatLine = ({ label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
    <span style={{ width: 3, height: 13, background: COLORS.gold, borderRadius: 2, flexShrink: 0 }} />
    <span style={{ color: COLORS.textDim, fontFamily: FONT, fontSize: 13 }}>{label}</span>
    <span style={{ color: COLORS.textDim, fontFamily: FONT, fontSize: 13 }}>：</span>
    <span style={{ color: COLORS.text, fontFamily: FONT, fontSize: 13, fontWeight: 700 }}>{value}</span>
  </div>
);

const pcsStyle = {
  color: COLORS.text, fontFamily: FONT, fontSize: 19, fontWeight: 700,
  whiteSpace: "nowrap", alignSelf: "center",
};

// Deck Log-style breakdown: main-deck card types (Follower/Spell/Amulet) with a
// "n / 50 pcs" total, a divider, then the evolve deck (Evolved/Advanced) with a
// "n / 10 pcs" total. Advanced evolve cards carry a " ADVANCED" name suffix.
const Breakdown = ({ deckMap, evoDeckMap, deckLen, evoLen }) => {
  const main = { Follower: 0, Spell: 0, Amulet: 0 };
  for (const [name, c] of deckMap.entries()) {
    const t = primaryType(name);
    if (main[t] != null) main[t] += c;
  }
  let evolved = 0, advanced = 0;
  for (const [name, c] of evoDeckMap.entries()) {
    if (/ ADVANCED$/.test(name)) advanced += c;
    else evolved += c;
  }
  return (
    <div style={{ background: COLORS.inset, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <StatLine label="Follower" value={main.Follower} />
          <StatLine label="Spell" value={main.Spell} />
          <StatLine label="Amulet" value={main.Amulet} />
        </div>
        <div style={pcsStyle}>{deckLen} / 50 pcs</div>
      </div>
      <div style={{ borderTop: `1px solid ${COLORS.border}`, margin: "8px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <StatLine label="Evolved" value={evolved} />
          <StatLine label="Advanced" value={advanced} />
        </div>
        <div style={pcsStyle}>{evoLen} / 10 pcs</div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, count, max }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 4px" }}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 4, height: 16, background: COLORS.glow, borderRadius: 2 }} />
      <span style={{ color: COLORS.text, fontFamily: FONT, fontSize: 15, fontWeight: 700 }}>{title}</span>
    </span>
    <span style={{ color: count >= max ? COLORS.gold : COLORS.textDim, fontFamily: FONT, fontSize: 13 }}>
      {count}/{max}
    </span>
  </div>
);

export default function DeckPanel({
  deckMap, evoDeckMap, deckLen, evoLen,
  artNoOf,
  onInspect, onAdd, onAddEvo, onRemove, onRemoveEvo, copyMaxOf, evoCopyMaxOf,
  name, onNameChange, deckClass, onDeckClass, canCreate, onCreate, onImport, onExport,
}) {
  const inputSx = {
    "& .MuiInputLabel-root": { color: COLORS.textDim, fontFamily: FONT },
    "& .MuiOutlinedInput-root": { color: COLORS.text, background: "rgba(255,255,255,0.06)", fontFamily: FONT },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border },
    "& .MuiSvgIcon-root": { color: COLORS.textDim },
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
      {/* scrollable deck contents (deck name + class scroll along with it) */}
      <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <TextField
          size="small" placeholder="Deck name…" value={name} onChange={(e) => onNameChange(e.target.value)}
          sx={inputSx}
        />
        <FormControl size="small" sx={inputSx}>
          <InputLabel>Deck Class</InputLabel>
          <Select label="Deck Class" value={deckClass} onChange={(e) => onDeckClass(e.target.value)}
            renderValue={(v) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                {classIcon(v) ? (
                  <img src={classIcon(v)} alt="" style={{ height: 18 }} />
                ) : (
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: CLASS_COLORS[v] || "#888" }} />
                )}
                {CLASS_LABELS[v] || "Choose a class"}
              </span>
            )}
          >
            {CLASS_ORDER.map((c) => (
              <MenuItem key={c} value={c}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {classIcon(c) && <img src={classIcon(c)} alt="" style={{ height: 18 }} />}
                  {CLASS_LABELS[c]}
                </span>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ManaCurve map={deckMap} />
        <Breakdown deckMap={deckMap} evoDeckMap={evoDeckMap} deckLen={deckLen} evoLen={evoLen} />

        <SectionHeader title="Main Deck" count={deckLen} max={50} />
        {deckLen === 0 && <Empty>Add cards to your main deck</Empty>}
        <div style={deckGrid}>
          {sortedEntries(deckMap).map(([n, c]) => (
            <DeckCard key={n} name={n} count={c} copyMax={copyMaxOf ? copyMaxOf(n) : 3}
              artNo={artNoOf ? artNoOf(n) : null} onInspect={onInspect} onAdd={onAdd} onRemove={onRemove} />
          ))}
        </div>

        <div style={{ height: 8 }} />
        <SectionHeader title="Evolve Deck" count={evoLen} max={10} />
        {evoLen === 0 && <Empty>Add cards to your evolve deck</Empty>}
        <div style={deckGrid}>
          {sortedEntries(evoDeckMap).map(([n, c]) => (
            <DeckCard key={n} name={n} count={c} copyMax={evoCopyMaxOf ? evoCopyMaxOf(n) : 3}
              artNo={artNoOf ? artNoOf(n) : null} onInspect={onInspect} onAdd={onAddEvo} onRemove={onRemoveEvo} />
          ))}
        </div>
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <Button fullWidth variant="outlined" onClick={onImport}
          sx={{ color: COLORS.text, borderColor: COLORS.border, fontFamily: FONT, textTransform: "none" }}>
          Import
        </Button>
        <Button fullWidth variant="outlined" onClick={onExport}
          sx={{ color: COLORS.text, borderColor: COLORS.border, fontFamily: FONT, textTransform: "none" }}>
          Export
        </Button>
      </div>
      <Button
        fullWidth variant="contained" disabled={!canCreate} onClick={onCreate}
        sx={{
          fontFamily: FONT, fontWeight: 700, textTransform: "none",
          background: canCreate ? COLORS.glow : "rgba(255,255,255,0.1)",
          "&.Mui-disabled": { color: "rgba(255,255,255,0.4)" },
        }}
      >
        {canCreate
          ? "Save Deck"
          : deckLen < 40
            ? `Need ${Math.max(0, 40 - deckLen)} more cards`
            : !name.trim()
              ? "Enter a deck name"
              : !deckClass
                ? "Select a deck class"
                : "Save Deck"}
      </Button>
    </div>
  );
}

const Empty = ({ children }) => (
  <div style={{ color: COLORS.textDim, fontFamily: FONT, fontSize: 12, padding: "8px 4px", fontStyle: "italic" }}>
    {children}
  </div>
);
