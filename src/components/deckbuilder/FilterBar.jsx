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
  COLORS, FONT, CLASS_ORDER, CLASS_LABELS, CLASS_COLORS,
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

// --- little reusable controls (chip + number pill). `m` = compact (mobile). ---
const pillSx = (active, accent, m) => ({
  padding: m ? "3px 9px" : "4px 12px", borderRadius: 999, fontSize: m ? 11 : 12.5, fontFamily: FONT,
  cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
  display: "inline-flex", alignItems: "center", gap: m ? 4 : 6, transition: "all .12s",
  border: `1px solid ${active ? accent || COLORS.glow : COLORS.border}`,
  background: active ? accent || COLORS.glow : "rgba(255,255,255,0.04)",
  color: active ? "#fff" : COLORS.textDim,
});
const Pill = ({ active, accent, onClick, compact, children }) => (
  <span style={pillSx(active, accent, compact)} onClick={onClick}>{children}</span>
);
const NumPill = ({ active, onClick, compact, children }) => (
  <span
    onClick={onClick}
    style={{
      width: compact ? 22 : 30, height: compact ? 22 : 30, borderRadius: compact ? 6 : 7,
      fontSize: compact ? 11 : 13, fontFamily: FONT,
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

const Row = ({ label, compact, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: compact ? 8 : 14 }}>
    <span style={{ width: compact ? 40 : 64, flexShrink: 0, color: COLORS.textDim, fontFamily: FONT, fontSize: compact ? 9 : 11, letterSpacing: compact ? 0.4 : 0.8, textTransform: "uppercase" }}>
      {label}
    </span>
    <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 5 : 7, flex: 1 }}>{children}</div>
  </div>
);

const toggleInArray = (arr, v, setter) =>
  setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function FilterBar({
  mainSelected, onToggleDeck,
  search, onSearch,
  set, onSet, setOptions = [],
  klass, onClass,
  types, onTypes,
  traits, onTraits,
  rarities, onRarities,
  costs, onCosts,
  attacks, onAttacks,
  defenses, onDefenses,
  excludeDupes, onExcludeDupes,
  onClear, isMobile,
}) {
  const m = !!isMobile;
  const filters = { types, traits, rarities, costs, attacks, defenses };
  const active = hasActiveFilters(filters);
  // Filters start collapsed on mobile (tap Filters to expand), open on desktop.
  const [show, setShow] = useState(() => !isMobile);
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: show ? (m ? 8 : 13) : 0,
        padding: m ? "8px 10px" : "14px 18px",
        background: COLORS.inset2, borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      {/* always-visible: deck toggle + search + filters toggle. On mobile this
          stays on one row (no wrap); the Filters button is icon-only. */}
      <div style={{ display: "flex", gap: m ? 6 : 12, alignItems: "center", flexWrap: m ? "nowrap" : "wrap" }}>
        <ToggleButtonGroup
          size="small" exclusive value={mainSelected ? "main" : "evo"}
          onChange={(_, v) => v && onToggleDeck(v === "main")}
          sx={{
            flexShrink: 0,
            "& .MuiToggleButton-root": { color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONT, textTransform: "none", padding: m ? "2px 8px" : "4px 14px", fontSize: m ? 11 : 14 },
            "& .MuiToggleButton-root.Mui-selected": { color: "#fff", background: COLORS.glow },
            "& .MuiToggleButton-root.Mui-selected:hover": { background: COLORS.glow },
          }}
        >
          <ToggleButton value="main">Main</ToggleButton>
          <ToggleButton value="evo">Evolve</ToggleButton>
        </ToggleButtonGroup>

        <TextField size="small" placeholder="Search cards…" value={search}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ ...fieldSx, flex: m ? "1 1 40px" : "1 1 200px", minWidth: 0, "& .MuiInputBase-input": { fontSize: m ? 13 : undefined } }} />

        {!m && <div style={{ flex: 1 }} />}

        <Button
          size="small" variant="outlined" onClick={() => setShow((s) => !s)}
          startIcon={m ? undefined : <TuneIcon />}
          endIcon={m ? undefined : (show ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
          sx={{
            color: COLORS.text, borderColor: active ? COLORS.glow : COLORS.border,
            fontFamily: FONT, textTransform: "none", flexShrink: 0,
            ...(m ? { minWidth: 0, padding: "4px 8px" } : {}),
          }}
        >
          {m
            ? <TuneIcon sx={{ fontSize: 19 }} />
            : <>Filters{active ? <span style={{ marginLeft: 6, width: 7, height: 7, borderRadius: "50%", background: COLORS.gold }} /> : null}</>}
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
      <div style={{ display: "flex", gap: m ? 8 : 12, alignItems: "center", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ ...fieldSx, ...(m ? { flex: "1 1 120px", minWidth: 0 } : { minWidth: 190 }) }}>
          <InputLabel>Set</InputLabel>
          <Select label="Set" value={set} onChange={(e) => onSet(e.target.value)}
            MenuProps={{ PaperProps: { style: { maxHeight: 420 } } }}>
            <MenuItem value="all">All Sets</MenuItem>
            {setOptions.map((s) => <MenuItem key={s.code} value={s.code}>{s.label}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ ...fieldSx, ...(m ? { flex: "1 1 110px", minWidth: 0 } : { minWidth: 160 }) }}>
          <InputLabel>Rarity</InputLabel>
          <Select multiple label="Rarity" value={rarities}
            onChange={(e) => onRarities(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
            renderValue={(sel) => sel.join(", ")}>
            {RARITIES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>

        <Autocomplete multiple size="small" options={TRAITS} value={traits}
          onChange={(_, v) => onTraits(v)} disableCloseOnSelect
          sx={{ ...fieldSx, ...(m ? { flex: "1 1 100%" } : { width: 240 }) }}
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

      <Row label="Class" compact={m}>
        <Pill compact={m} active={klass === "all"} onClick={() => onClass("all")}>All</Pill>
        {CLASS_ORDER.map((c) => (
          <Pill key={c} compact={m} active={klass === c} accent={CLASS_COLORS[c]}
            onClick={() => onClass(klass === c ? "all" : c)}>
            {/* mobile: show only the class icon to save space; desktop: icon + name */}
            {classIcon(c) && <img src={classIcon(c)} alt={CLASS_LABELS[c]} title={CLASS_LABELS[c]} style={{ height: m ? 20 : 17 }} />}
            {(!m || !classIcon(c)) && CLASS_LABELS[c]}
          </Pill>
        ))}
      </Row>

      <Row label="Type" compact={m}>
        {CARD_TYPES.map((t) => (
          <Pill key={t} compact={m} active={types.includes(t)} onClick={() => toggleInArray(types, t, onTypes)}>{t}</Pill>
        ))}
      </Row>

      <Row label="Display" compact={m}>
        <Pill compact={m} active={excludeDupes} onClick={() => onExcludeDupes(!excludeDupes)}>Duplicates</Pill>
      </Row>

      <Row label="Cost" compact={m}>
        {COST_BUCKETS.map((c) => (
          <NumPill key={c} compact={m} active={costs.includes(c)} onClick={() => toggleInArray(costs, c, onCosts)}>{c}</NumPill>
        ))}
      </Row>

      <Row label="Attack" compact={m}>
        {STAT_BUCKETS.map((a) => (
          <NumPill key={a} compact={m} active={attacks.includes(a)} onClick={() => toggleInArray(attacks, a, onAttacks)}>{a}</NumPill>
        ))}
      </Row>

      <Row label="Defense" compact={m}>
        {STAT_BUCKETS.map((dv) => (
          <NumPill key={dv} compact={m} active={defenses.includes(dv)} onClick={() => toggleInArray(defenses, dv, onDefenses)}>{dv}</NumPill>
        ))}
      </Row>
      </>
      )}
    </div>
  );
}
