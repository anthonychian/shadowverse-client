import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReplyIcon from "@mui/icons-material/Reply";
import CloseIcon from "@mui/icons-material/Close";
import wallpaper3 from "../../src/assets/wallpapers/3.png";
import {
  allCards, set17, set16, set15, set14, setUMA2, set13, set12, setSEA, set11,
  setVG, set10, set9, set8, setIDOL, setIDOL2, set7, set6, set5, set4, set3,
  setUMA, set2, set1, forest, sword, rune, dragon, abyss, haven, neutral,
} from "../decks/AllCards";
import {
  allCardsEvo, set17Evo, set16Evo, set15Evo, set14Evo, setUMA2Evo, set13Evo,
  set12Evo, set11Evo, setVGEvo, set10Evo, set9Evo, set8Evo, setIDOLEvo,
  setIDOL2Evo, set7Evo, set6Evo, set5Evo, set4Evo, set3Evo, setUMAEvo, set2Evo,
  set1Evo, forestEvo, swordEvo, runeEvo, dragonEvo, abyssEvo, havenEvo, neutralEvo,
} from "../decks/AllCardsEvo";
import { useDispatch, useSelector } from "react-redux";
import { createDeck, deleteDeck } from "../redux/DeckSlice";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Snackbar, SnackbarContent, IconButton,
} from "@mui/material";
import { matchesFilters, hasActiveFilters, getCost } from "../decks/cardDetails";
import FilterBar from "../components/deckbuilder/FilterBar";
import CardGrid from "../components/deckbuilder/CardGrid";
import CardInspector from "../components/deckbuilder/CardInspector";
import DeckPanel from "../components/deckbuilder/DeckPanel";
import { COLORS, FONT } from "../components/deckbuilder/theme";

const CARD_PAGE_SIZE = 60;

export default function CreateDeck() {
  const location = useLocation();
  const reduxDecks = useSelector((state) => state.deck.decks);
  const deckName = location?.state?.deckName;
  const deckEdit = reduxDecks.filter((decks) => decks.name === deckName);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [deck, setDeck] = useState([]);
  const [evoDeck, setEvoDeck] = useState([]);
  const [deckMap, setDeckMap] = useState(new Map());
  const [evoDeckMap, setEvoDeckMap] = useState(new Map());
  const [mainSelected, setMainSelected] = useState(true);
  const [name, setName] = useState(deckName || "");
  const [deckClass, setDeckClass] = useState("");
  const [cardName, setCardName] = useState(null); // inspected card

  // filters
  const [search, setSearch] = useState("");
  const [buttonFilterSet, setButtonFilterSet] = useState("all");
  const [buttonFilterClass, setButtonFilterClass] = useState("all");
  const [types, setTypes] = useState([]);
  const [traits, setTraits] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [costs, setCosts] = useState([]);
  const [attacks, setAttacks] = useState([]);
  const [defenses, setDefenses] = useState([]);

  const [visibleCount, setVisibleCount] = useState(CARD_PAGE_SIZE);

  // dialogs / snackbar
  const [importTextFieldVal, setImportTextFieldVal] = useState("");
  const [openImport, setOpenImport] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);

  const evoNameSet = useMemo(() => new Set(allCardsEvo), []);
  const isEvoCard = (n) => evoNameSet.has(n);

  // ---------- double-sided evolved swap ----------
  const DOUBLE_EVO_PAIRS = {
    "Orchis, Resolute Puppet": "Orchis, Vengeful Puppet",
    "Orchis, Vengeful Puppet": "Orchis, Resolute Puppet",
    "Paula, Gentle Warmth": "Paula, Passionate Warmth",
    "Paula, Passionate Warmth": "Paula, Gentle Warmth",
    "Celia, Hope's Strategist": "Celia, Despair's Messenger",
    "Celia, Despair's Messenger": "Celia, Hope's Strategist",
    "Mysterian Whitewyrm": "Mysterian Blackwyrm",
    "Mysterian Blackwyrm": "Mysterian Whitewyrm",
    "Virtuous Lindworm": "Iniquitous Lindworm",
    "Iniquitous Lindworm": "Virtuous Lindworm",
    "Vania, Kind Queen": "Vania, Blood Queen",
    "Vania, Blood Queen": "Vania, Kind Queen",
    "Ceryneian Lighthind": "Ceryneian Darkhind",
    "Ceryneian Darkhind": "Ceryneian Lighthind",
  };
  const isDoubleEvo = (n) => !!DOUBLE_EVO_PAIRS[n];
  const handleDoubleEvoClick = () => {
    if (DOUBLE_EVO_PAIRS[cardName]) setCardName(DOUBLE_EVO_PAIRS[cardName]);
  };

  // ---------- deck mutation (limits preserved from the original) ----------
  const handleCardSelection = (card) => {
    if (deck.length < 50) {
      if (deckMap.has(card)) {
        if (deckMap.get(card) === 6 && card === "Rapid Fire") return;
        if (deckMap.get(card) === 1 && card === "Shenlong") return;
        if (deckMap.get(card) === 1 && card === "Curse Crafter") return;
        if (deckMap.get(card) === 3 && card !== "Onion Patch" && card !== "Rapid Fire") {
          return;
        } else {
          deckMap.set(card, deckMap.get(card) + 1);
        }
      } else {
        deckMap.set(card, 1);
      }
      setDeck((d) => [...d, card]);
    }
  };
  const handleCardRemove = (card) => {
    if (deck.length > 0 && deckMap.has(card)) {
      if (deckMap.get(card) === 1) deckMap.delete(card);
      else deckMap.set(card, deckMap.get(card) - 1);
      const cardIndex = deck.indexOf(card);
      setDeck(deck.filter((_, idx) => idx !== cardIndex));
    }
  };
  const handleEvoCardSelection = (card) => {
    if (evoDeck.length < 10) {
      if (evoDeckMap.has(card)) {
        if (evoDeckMap.get(card) === 3 && card !== "Carrot" && card !== "Drive Point") {
          return;
        } else {
          evoDeckMap.set(card, evoDeckMap.get(card) + 1);
        }
      } else {
        evoDeckMap.set(card, 1);
      }
      setEvoDeck((d) => [...d, card]);
    }
  };
  const handleEvoCardRemove = (card) => {
    if (evoDeck.length > 0 && evoDeckMap.has(card)) {
      if (evoDeckMap.get(card) === 1) evoDeckMap.delete(card);
      else evoDeckMap.set(card, evoDeckMap.get(card) - 1);
      const cardIndex = evoDeck.indexOf(card);
      setEvoDeck(evoDeck.filter((_, idx) => idx !== cardIndex));
    }
  };

  // copy-limit predicates (mirror the handlers) for greying / disabling UI
  const mainAtLimit = (card) => {
    const c = deckMap.get(card) || 0;
    if (deck.length >= 50) return true;
    if (card === "Rapid Fire") return c >= 6;
    if (card === "Shenlong" || card === "Curse Crafter") return c >= 1;
    if (card === "Onion Patch") return false;
    return c >= 3;
  };
  const evoAtLimit = (card) => {
    const c = evoDeckMap.get(card) || 0;
    if (evoDeck.length >= 10) return true;
    if (card === "Carrot" || card === "Drive Point") return false;
    return c >= 3;
  };

  const handleFillDeckMap = (cards) => cards.forEach((c) => handleCardSelection(c));
  const handleFillEvoDeckMap = (cards) => cards.forEach((c) => handleEvoCardSelection(c));

  // ---------- load existing deck (edit) or shared base64 deck ----------
  useEffect(() => {
    if (deckEdit.length > 0) {
      const d = deckEdit[0];
      if (d.deck?.length) handleFillDeckMap(d.deck);
      if (d.evoDeck?.length) handleFillEvoDeckMap(d.evoDeck);
      if (d.class) setDeckClass(d.class);
    }
    if (id) {
      try {
        const decoded = JSON.parse(atob(id));
        if (decoded[0].deck?.length) handleFillDeckMap(decoded[0].deck);
        if (decoded[0].evoDeck?.length) handleFillEvoDeckMap(decoded[0].evoDeck);
        if (decoded[0].name) setName(decoded[0].name);
        if (decoded[0].class) setDeckClass(decoded[0].class);
      } catch {
        navigate("/deck");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- set/class name lists (intersection like the original) ----------
  const getCardsFromName = (n) => {
    switch (n) {
      case "set 17": return set17; case "set 16": return set16; case "set 15": return set15;
      case "set 14": return set14; case "uma2": return setUMA2; case "set 13": return set13;
      case "set 12": return set12; case "sea": return setSEA; case "set 11": return set11;
      case "vg": return setVG; case "set 10": return set10; case "set 9": return set9;
      case "set 8": return set8; case "set 7": return set7; case "idol": return setIDOL;
      case "idol2": return setIDOL2; case "set 6": return set6; case "set 5": return set5;
      case "set 4": return set4; case "set 3": return set3; case "uma": return setUMA;
      case "set 2": return set2; case "set 1": return set1;
      case "set 17 evo": return set17Evo; case "set 16 evo": return set16Evo;
      case "set 15 evo": return set15Evo; case "set 14 evo": return set14Evo;
      case "uma2 evo": return setUMA2Evo; case "set 13 evo": return set13Evo;
      case "set 12 evo": return set12Evo; case "set 11 evo": return set11Evo;
      case "vg evo": return setVGEvo; case "set 10 evo": return set10Evo;
      case "set 9 evo": return set9Evo; case "set 8 evo": return set8Evo;
      case "set 7 evo": return set7Evo; case "idol evo": return setIDOLEvo;
      case "idol2 evo": return setIDOL2Evo; case "set 6 evo": return set6Evo;
      case "set 5 evo": return set5Evo; case "set 4 evo": return set4Evo;
      case "set 3 evo": return set3Evo; case "uma evo": return setUMAEvo;
      case "set 2 evo": return set2Evo; case "set 1 evo": return set1Evo;
      case "forest": return forest; case "forest evo": return forestEvo;
      case "sword": return sword; case "sword evo": return swordEvo;
      case "rune": return rune; case "rune evo": return runeEvo;
      case "dragon": return dragon; case "dragon evo": return dragonEvo;
      case "abyss": return abyss; case "abyss evo": return abyssEvo;
      case "haven": return haven; case "haven evo": return havenEvo;
      case "neutral": return neutral; case "neutral evo": return neutralEvo;
      case "all": return allCards; case "all evo": return allCardsEvo;
      default: return allCards;
    }
  };

  // ---------- filtered pool (set ∩ class ∩ search ∩ detail filters) ----------
  const displayed = useMemo(() => {
    const main = mainSelected;
    const base = main ? allCards : allCardsEvo;
    const setKey = buttonFilterSet === "all" ? (main ? "all" : "all evo") : main ? buttonFilterSet : buttonFilterSet + " evo";
    const classKey = buttonFilterClass === "all" ? (main ? "all" : "all evo") : main ? buttonFilterClass : buttonFilterClass + " evo";
    const baseSet = new Set(base);
    const classSet = new Set(getCardsFromName(classKey));
    let list = getCardsFromName(setKey).filter((n) => baseSet.has(n) && classSet.has(n));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((n) => n.toLowerCase().includes(q));
    const filters = { types, traits, rarities, costs, attacks, defenses };
    if (hasActiveFilters(filters)) list = list.filter((n) => matchesFilters(n, filters));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainSelected, buttonFilterSet, buttonFilterClass, search, types, traits, rarities, costs, attacks, defenses]);

  useEffect(() => setVisibleCount(CARD_PAGE_SIZE), [displayed]);

  // Show a card preview as soon as the page loads: the first card of an existing
  // deck if one is being loaded, otherwise the first card in the pool. Runs once.
  const initedRef = useRef(false);
  const willLoadDeck =
    (deckEdit.length > 0 &&
      ((deckEdit[0].deck && deckEdit[0].deck.length) ||
        (deckEdit[0].evoDeck && deckEdit[0].evoDeck.length))) ||
    !!id;
  useEffect(() => {
    if (initedRef.current) return;
    if (cardName) { initedRef.current = true; return; }
    const byCost = (arr) =>
      [...arr].sort((a, b) => {
        const ca = getCost(a), cb = getCost(b);
        const va = ca == null ? 99 : ca, vb = cb == null ? 99 : cb;
        return va !== vb ? va - vb : a.localeCompare(b);
      });
    if (deck.length > 0) { initedRef.current = true; setCardName(byCost([...deckMap.keys()])[0]); }
    else if (evoDeck.length > 0) { initedRef.current = true; setCardName(byCost([...evoDeckMap.keys()])[0]); }
    else if (!willLoadDeck && displayed.length > 0) { initedRef.current = true; setCardName(displayed[0]); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, evoDeck, displayed, cardName, willLoadDeck]);

  // ---------- inspector ----------
  const inspectedIsEvo = cardName ? isEvoCard(cardName) : false;
  const inspectedCount = cardName
    ? inspectedIsEvo ? evoDeckMap.get(cardName) || 0 : deckMap.get(cardName) || 0
    : 0;
  const inspectedAtLimit = cardName ? (inspectedIsEvo ? evoAtLimit(cardName) : mainAtLimit(cardName)) : true;
  const navInspect = (dir) => {
    const idx = displayed.indexOf(cardName);
    if (idx === -1) return;
    const ni = idx + dir;
    if (ni >= 0 && ni < displayed.length) setCardName(displayed[ni]);
  };

  // ---------- import / export ----------
  const handleDeckImport = () => {
    const val = (importTextFieldVal || "").split("\n\n");
    const parseBlock = (block) => {
      const out = [];
      for (const line of block.split("\n")) {
        const num = parseInt(line[0]);
        if (Number.isNaN(num)) continue;
        for (let i = 0; i < num; i++) out.push(line.slice(2));
      }
      return out;
    };
    if (val.length === 2) {
      handleFillDeckMap(parseBlock(val[0]));
      handleFillEvoDeckMap(parseBlock(val[1]));
    } else if (val.length === 1) {
      handleFillDeckMap(parseBlock(val[0]));
    }
    setOpenImport(false);
  };
  const handleClearImport = () => {
    setDeck([]); setDeckMap(new Map()); setEvoDeck([]); setEvoDeckMap(new Map());
    setImportTextFieldVal("");
  };
  const handleDeckImportFormat = () => {
    let s1 = ""; deckMap.forEach((v, k) => (s1 += `${v} ${k}\n`));
    let s2 = ""; evoDeckMap.forEach((v, k) => (s2 += `${v} ${k}\n`));
    s1 = s1.slice(0, -1); s2 = s2.slice(0, -1);
    return evoDeckMap.size > 0 ? s1 + "\n\n" + s2 : s1;
  };
  const handleOpenSnack = () => {
    navigator.clipboard.writeText(handleDeckImportFormat());
    setOpenSnack(true);
  };

  // ---------- save ----------
  // Class is now required: the lobby board labels each game by its host's deck
  // class, so a deck must declare one before it can be saved.
  const canCreate =
    deck.length >= 40 && name.trim().length > 0 && deckClass !== "";
  const handleSubmit = () => {
    if (!canCreate) return;
    dispatch(deleteDeck(deckName));
    dispatch(createDeck({ name, class: deckClass, deck, evoDeck }));
    navigate("/");
  };

  const clearFilters = () => {
    setTypes([]); setTraits([]); setRarities([]); setCosts([]); setAttacks([]); setDefenses([]);
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{
        height: "100vh", width: "100vw", display: "flex", flexDirection: "column",
        background: "url(" + wallpaper3 + ") center center fixed", backgroundSize: "cover",
        overflow: "hidden",
      }}
    >
      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", color: COLORS.text }}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 4 }} onClick={() => navigate("/")}>
          <ReplyIcon sx={{ fontSize: 30 }} />
          <span style={{ fontFamily: FONT, fontSize: 16 }}>Home</span>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* 3-column body */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 10, padding: "0 12px 12px" }}>
        {/* LEFT — inspector */}
        <aside style={col(420)}>
          <CardInspector
            name={cardName}
            count={inspectedCount}
            atLimit={inspectedAtLimit}
            isDouble={cardName ? isDoubleEvo(cardName) : false}
            onAdd={() => cardName && (inspectedIsEvo ? handleEvoCardSelection(cardName) : handleCardSelection(cardName))}
            onRemove={() => cardName && (inspectedIsEvo ? handleEvoCardRemove(cardName) : handleCardRemove(cardName))}
            onPrev={() => navInspect(-1)}
            onNext={() => navInspect(1)}
            onSwap={handleDoubleEvoClick}
          />
        </aside>

        {/* CENTER — filters + pool */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: COLORS.panel, borderRadius: 12, overflow: "hidden" }}>
          <FilterBar
            mainSelected={mainSelected} onToggleDeck={setMainSelected}
            search={search} onSearch={setSearch}
            set={buttonFilterSet} onSet={setButtonFilterSet}
            klass={buttonFilterClass} onClass={setButtonFilterClass}
            types={types} onTypes={setTypes}
            traits={traits} onTraits={setTraits}
            rarities={rarities} onRarities={setRarities}
            costs={costs} onCosts={setCosts}
            attacks={attacks} onAttacks={setAttacks}
            defenses={defenses} onDefenses={setDefenses}
            onClear={clearFilters}
          />
          <div id="poolScroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", background: COLORS.inset }}>
            <CardGrid
              names={displayed}
              visibleCount={visibleCount}
              onLoadMore={() => setVisibleCount((c) => c + CARD_PAGE_SIZE)}
              hasMore={displayed.length > visibleCount}
              scrollTargetId="poolScroll"
              inspectedName={cardName}
              onInspect={setCardName}
              onAdd={mainSelected ? handleCardSelection : handleEvoCardSelection}
              onRemove={mainSelected ? handleCardRemove : handleEvoCardRemove}
              isAtLimit={mainSelected ? mainAtLimit : evoAtLimit}
              countOf={mainSelected ? (n) => deckMap.get(n) || 0 : (n) => evoDeckMap.get(n) || 0}
            />
          </div>
        </main>

        {/* RIGHT — deck */}
        <aside style={col(340)}>
          <DeckPanel
            deckMap={deckMap} evoDeckMap={evoDeckMap}
            deckLen={deck.length} evoLen={evoDeck.length}
            onInspect={setCardName}
            onAdd={handleCardSelection} onRemove={handleCardRemove}
            onAddEvo={handleEvoCardSelection} onRemoveEvo={handleEvoCardRemove}
            isAtLimit={mainAtLimit} isEvoAtLimit={evoAtLimit}
            name={name} onNameChange={setName}
            deckClass={deckClass} onDeckClass={setDeckClass}
            canCreate={canCreate} onCreate={handleSubmit}
            onImport={() => setOpenImport(true)} onExport={handleOpenSnack}
          />
        </aside>
      </div>

      {/* import dialog */}
      <Dialog open={openImport} onClose={() => setOpenImport(false)} PaperProps={{ component: "form" }}>
        <DialogTitle>Import Deck</DialogTitle>
        <DialogContent>
          <DialogContentText>Paste a decklist (count + card name per line; blank line separates main and evolve).</DialogContentText>
          <TextField autoFocus required margin="dense" fullWidth multiline variant="standard"
            value={importTextFieldVal} onChange={(e) => setImportTextFieldVal(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeckImport}>Submit</Button>
          <Button onClick={handleClearImport}>Clear</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnack} anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000} onClose={() => setOpenSnack(false)}
        action={<IconButton size="small" color="inherit" onClick={() => setOpenSnack(false)}><CloseIcon fontSize="small" /></IconButton>}
      >
        <SnackbarContent sx={{ backgroundColor: COLORS.glow }} message="Copied decklist to clipboard" />
      </Snackbar>
    </div>
  );
}

const col = (w) => ({
  width: w, flexShrink: 0, background: COLORS.panel, borderRadius: 12,
  padding: 14, overflowY: "auto", display: "flex", flexDirection: "column",
});
