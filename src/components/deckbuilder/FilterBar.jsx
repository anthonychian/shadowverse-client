import React, { useState } from "react";
import {
  TextField, Select, MenuItem, FormControl, InputLabel, ToggleButton,
  ToggleButtonGroup, Autocomplete, Chip, Button,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  CARD_TYPES, TRAITS, RARITIES, COST_BUCKETS, STAT_BUCKETS, hasActiveFilters,
} from "../../decks/cardDetails";
import {
  COLORS, FONT, SET_ORDER, SET_LABELS, CLASS_ORDER, CLASS_LABELS, CLASS_COLORS,
} from "./theme";
import { classIcon } from "./icons";

const fieldSx = {
  "& .MuiInputLabel-root": { color: COLORS.textDim, fontFamily: FONT },
  "& .MuiInputLabel-root.Mui-focused": { color: COLORS.glow },
  "& .MuiOutlinedInput-root": { color: COLORS.text, background: "rgba(255,255,255,0.06)", fontFamily: FONT },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.glow },
  "& .MuiSvgIcon-root": { color: COLORS.textDim },
};

// --- little reusable controls (chip + number pill) ---
const pillSx = (active, accent) => ({
  padding: "4px 12px", borderRadius: 999, fontSize: 12.5, fontFamily: FONT,
  cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
  display: "inline-flex", alignItems: "center", gap: 6, transition: "all .12s",
  border: `1px solid ${active ? accent || COLORS.glow : COLORS.border}`,
  background: active ? accent || COLORS.glow : "rgba(255,255,255,0.04)",
  color: active ? "#fff" : COLORS.textDim,
});
const Pill = ({ active, accent, onClick, children }) => (
  <span style={pillSx(active, accent)} onClick={onClick}>{children}</span>
);
const NumPill = ({ active, onClick, children }) => (
  <span
    onClick={onClick}
    style={{
      width: 30, height: 30, borderRadius: 7, fontSize: 13, fontFamily: FONT,
      cursor: "pointer", userSelect: "none", display: "inline-flex",
      alignItems: "center", justifyContent: "center", transition: "all .12s",
      border: `1px solid ${active ? COLORS.glow : COLORS.border}`,
      background: active ? COLORS.glow : "rgba(255,255,255,0.04)",
      color: active ? "#fff" : COLORS.textDim,
    }}
  >
    {children}
  </span>
);

const Row = ({ label, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <span style={{ width: 64, flexShrink: 0, color: COLORS.textDim, fontFamily: FONT, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" }}>
      {label}
    </span>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, flex: 1 }}>{children}</div>
  </div>
);

const toggleInArray = (arr, v, setter) =>
  setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function FilterBar({
  mainSelected, onToggleDeck,
  search, onSearch,
  set, onSet,
  klass, onClass,
  types, onTypes,
  traits, onTraits,
  rarities, onRarities,
  costs, onCosts,
  attacks, onAttacks,
  defenses, onDefenses,
  onClear,
}) {
  const filters = { types, traits, rarities, costs, attacks, defenses };
  const active = hasActiveFilters(filters);
  const [show, setShow] = useState(true);
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: show ? 13 : 0, padding: "14px 18px",
        background: COLORS.inset2, borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      {/* always-visible: deck toggle + search + set + filters toggle */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <ToggleButtonGroup
          size="small" exclusive value={mainSelected ? "main" : "evo"}
          onChange={(_, v) => v && onToggleDeck(v === "main")}
          sx={{
            "& .MuiToggleButton-root": { color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONT, textTransform: "none", padding: "4px 14px" },
            "& .MuiToggleButton-root.Mui-selected": { color: "#fff", background: COLORS.glow },
            "& .MuiToggleButton-root.Mui-selected:hover": { background: COLORS.glow },
          }}
        >
          <ToggleButton value="main">Main</ToggleButton>
          <ToggleButton value="evo">Evolve</ToggleButton>
        </ToggleButtonGroup>

        <TextField size="small" placeholder="Search cards…" value={search}
          onChange={(e) => onSearch(e.target.value)} sx={{ ...fieldSx, flex: "1 1 200px" }} />

        <div style={{ flex: 1 }} />

        <Button
          size="small" variant="outlined" onClick={() => setShow((s) => !s)}
          startIcon={<TuneIcon />} endIcon={show ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            color: COLORS.text, borderColor: active ? COLORS.glow : COLORS.border,
            fontFamily: FONT, textTransform: "none",
          }}
        >
          Filters{active ? <span style={{ marginLeft: 6, width: 7, height: 7, borderRadius: "50%", background: COLORS.gold }} /> : null}
        </Button>
      </div>

      {!show && active && (
        <div style={{ paddingTop: 8 }}>
          <Button size="small" onClick={onClear} sx={{ color: COLORS.gold, fontFamily: FONT, textTransform: "none" }}>
            Clear filters
          </Button>
        </div>
      )}

      {show && (
      <>
      {/* set + rarity + trait dropdowns */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ ...fieldSx, minWidth: 190 }}>
          <InputLabel>Set</InputLabel>
          <Select label="Set" value={set} onChange={(e) => onSet(e.target.value)}>
            <MenuItem value="all">All Sets</MenuItem>
            {SET_ORDER.map((s) => <MenuItem key={s} value={s}>{SET_LABELS[s]}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ ...fieldSx, minWidth: 160 }}>
          <InputLabel>Rarity</InputLabel>
          <Select multiple label="Rarity" value={rarities}
            onChange={(e) => onRarities(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
            renderValue={(sel) => sel.join(", ")}>
            {RARITIES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>

        <Autocomplete multiple size="small" options={TRAITS} value={traits}
          onChange={(_, v) => onTraits(v)} disableCloseOnSelect
          sx={{ ...fieldSx, width: 240 }}
          renderInput={(params) => <TextField {...params} label="Trait" placeholder="Trait…" />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip size="small" label={option} {...getTagProps({ index })} sx={{ color: "#fff", background: COLORS.glow }} />
            ))}
        />

        {active && (
          <Button size="small" onClick={onClear} sx={{ color: COLORS.gold, fontFamily: FONT, textTransform: "none" }}>
            Clear filters
          </Button>
        )}
      </div>

      <Row label="Class">
        <Pill active={klass === "all"} onClick={() => onClass("all")}>All</Pill>
        {CLASS_ORDER.map((c) => (
          <Pill key={c} active={klass === c} accent={CLASS_COLORS[c]}
            onClick={() => onClass(klass === c ? "all" : c)}>
            {classIcon(c) && <img src={classIcon(c)} alt="" style={{ height: 17 }} />}
            {CLASS_LABELS[c]}
          </Pill>
        ))}
      </Row>

      <Row label="Type">
        {CARD_TYPES.map((t) => (
          <Pill key={t} active={types.includes(t)} onClick={() => toggleInArray(types, t, onTypes)}>{t}</Pill>
        ))}
      </Row>

      <Row label="Cost">
        {COST_BUCKETS.map((c) => (
          <NumPill key={c} active={costs.includes(c)} onClick={() => toggleInArray(costs, c, onCosts)}>{c}</NumPill>
        ))}
      </Row>

      <Row label="Attack">
        {STAT_BUCKETS.map((a) => (
          <NumPill key={a} active={attacks.includes(a)} onClick={() => toggleInArray(attacks, a, onAttacks)}>{a}</NumPill>
        ))}
      </Row>

      <Row label="Defense">
        {STAT_BUCKETS.map((dv) => (
          <NumPill key={dv} active={defenses.includes(dv)} onClick={() => toggleInArray(defenses, dv, onDefenses)}>{dv}</NumPill>
        ))}
      </Row>
      </>
      )}
    </div>
  );
}
