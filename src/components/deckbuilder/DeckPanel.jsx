import React from "react";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { cardImage } from "../../decks/getCards";
import { getCost } from "../../decks/cardDetails";
import { COLORS, FONT, CLASS_ORDER, CLASS_LABELS, CLASS_COLORS } from "./theme";

const sortedEntries = (map) =>
  [...map.entries()].sort((a, b) => {
    const ca = getCost(a[0]); const cb = getCost(b[0]);
    const va = ca == null ? 99 : ca; const vb = cb == null ? 99 : cb;
    if (va !== vb) return va - vb;
    return a[0].localeCompare(b[0]);
  });

const DeckRow = ({ name, count, onInspect, onAdd, onRemove, addDisabled }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: 8, padding: "3px 6px",
      borderRadius: 6, background: COLORS.row, cursor: "pointer",
    }}
    onClick={() => onInspect(name)}
    onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.rowHover)}
    onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.row)}
  >
    <img src={cardImage(name)} alt={name} width={34} height={48} style={{ borderRadius: 3, flexShrink: 0 }} />
    <span style={{ color: COLORS.glow, fontFamily: FONT, fontSize: 14, width: 22, textAlign: "center" }}>{count}</span>
    <span
      style={{
        flex: 1, color: COLORS.text, fontFamily: FONT, fontSize: 13,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}
      title={name}
    >
      {name}
    </span>
    <RowBtn onClick={(e) => { e.stopPropagation(); onRemove(name); }}><RemoveIcon sx={{ fontSize: 16 }} /></RowBtn>
    <RowBtn disabled={addDisabled} onClick={(e) => { e.stopPropagation(); if (!addDisabled) onAdd(name); }}>
      <AddIcon sx={{ fontSize: 16 }} />
    </RowBtn>
  </div>
);

const RowBtn = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick} disabled={disabled}
    style={{
      width: 24, height: 24, borderRadius: 5, border: "none", flexShrink: 0,
      background: disabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.16)",
      color: disabled ? "rgba(255,255,255,0.3)" : "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: disabled ? "default" : "pointer",
    }}
  >
    {children}
  </button>
);

const ManaCurve = ({ map }) => {
  const buckets = Array(9).fill(0); // 0..7, 8+
  for (const [name, count] of map.entries()) {
    const c = getCost(name);
    if (c == null) continue;
    buckets[Math.min(c, 8)] += count;
  }
  const max = Math.max(1, ...buckets);
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-end", gap: 4, height: 78,
        padding: "8px 6px 6px", marginBottom: 14,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      {buckets.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ color: COLORS.textDim, fontSize: 10, fontFamily: FONT }}>{v || ""}</div>
          <div style={{ width: "100%", height: `${(v / max) * 46}px`, background: COLORS.glow, borderRadius: 2, opacity: v ? 0.85 : 0.15 }} />
          <div style={{ color: COLORS.textDim, fontSize: 10, fontFamily: FONT }}>{i === 8 ? "8+" : i}</div>
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({ title, count, max }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "2px 4px" }}>
    <span style={{ color: COLORS.text, fontFamily: FONT, fontSize: 15, fontWeight: 700 }}>{title}</span>
    <span style={{ color: count >= max ? COLORS.gold : COLORS.textDim, fontFamily: FONT, fontSize: 13 }}>
      {count}/{max}
    </span>
  </div>
);

export default function DeckPanel({
  deckMap, evoDeckMap, deckLen, evoLen,
  onInspect, onAdd, onRemove, onAddEvo, onRemoveEvo,
  isAtLimit, isEvoAtLimit,
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
      <TextField
        size="small" placeholder="Deck name…" value={name} onChange={(e) => onNameChange(e.target.value)}
        sx={inputSx}
      />
      <FormControl size="small" sx={inputSx}>
        <InputLabel>Deck Class</InputLabel>
        <Select label="Deck Class" value={deckClass} onChange={(e) => onDeckClass(e.target.value)}
          renderValue={(v) => (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: CLASS_COLORS[v] || "#888" }} />
              {CLASS_LABELS[v] || "Choose a class"}
            </span>
          )}
        >
          {CLASS_ORDER.map((c) => (
            <MenuItem key={c} value={c}>{CLASS_LABELS[c]}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* scrollable deck contents */}
      <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        <SectionHeader title="Main Deck" count={deckLen} max={50} />
        <ManaCurve map={deckMap} />
        {deckLen === 0 && <Empty>Add cards to your main deck</Empty>}
        {sortedEntries(deckMap).map(([n, c]) => (
          <DeckRow key={n} name={n} count={c} onInspect={onInspect} onAdd={onAdd}
            onRemove={onRemove} addDisabled={isAtLimit(n)} />
        ))}

        <div style={{ height: 8 }} />
        <SectionHeader title="Evolve Deck" count={evoLen} max={10} />
        {evoLen === 0 && <Empty>Add cards to your evolve deck</Empty>}
        {sortedEntries(evoDeckMap).map(([n, c]) => (
          <DeckRow key={n} name={n} count={c} onInspect={onInspect} onAdd={onAddEvo}
            onRemove={onRemoveEvo} addDisabled={isEvoAtLimit(n)} />
        ))}
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
        {canCreate ? "Save Deck" : `Need ${Math.max(0, 40 - deckLen)} more cards`}
      </Button>
    </div>
  );
}

const Empty = ({ children }) => (
  <div style={{ color: COLORS.textDim, fontFamily: FONT, fontSize: 12, padding: "8px 4px", fontStyle: "italic" }}>
    {children}
  </div>
);
