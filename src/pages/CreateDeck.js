import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReplyIcon from "@mui/icons-material/Reply";
import CloseIcon from "@mui/icons-material/Close";
import StyleIcon from "@mui/icons-material/Style";
import useMediaQuery from "@mui/material/useMediaQuery";
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
  DialogTitle, Snackbar, SnackbarContent, IconButton, CircularProgress, Divider,
} from "@mui/material";
import { matchesFilters, hasActiveFilters, getCost, getDetails } from "../decks/cardDetails";
import cardPrintings from "../decks/cardPrintings.json";
import FilterBar from "../components/deckbuilder/FilterBar";
import CardGrid from "../components/deckbuilder/CardGrid";
import CardInspector from "../components/deckbuilder/CardInspector";
import DeckPanel from "../components/deckbuilder/DeckPanel";
import { COLORS, FONT, SET_CODE_ORDER, SET_CODE_LABELS, CLASS_LABELS } from "../components/deckbuilder/theme";
import { SERVER_URL } from "../sockets";

const CARD_PAGE_SIZE = 60;

// Non-deckable entries that exist as cards in the data but should never appear
// in the deck-builder pool (game-mechanic markers).
const HIDDEN_NAMES = new Set(["Evolution Point", "Super-Evolution Point"]);

// Card number (e.g. "BP05-P25EN") -> card name, for translating an external
// decklist (bushiroad decklog) into the names the builder works with. Built
// once from the static printings data. First printing wins for a given number.
const NAME_BY_CARD_NO = (() => {
  const m = {};
  for (const p of cardPrintings) {
    if (p.cardNo && !(p.cardNo in m)) m[p.cardNo] = p.name;
  }
  return m;
})();

// Reverse of CLASS_LABELS: decklog reports a deck's class as a display label
// (e.g. "Dragoncraft"); map it back to our internal class key (e.g. "dragon").
const CLASS_KEY_BY_LABEL = (() => {
  const m = {};
  for (const k in CLASS_LABELS) m[CLASS_LABELS[k]] = k;
  return m;
})();

// Pull a decklog share code out of a pasted code or full URL
// (https://decklog-en.bushiroad.com/view/26JXU -> "26JXU").
const extractDecklogCode = (raw) => {
  const s = String(raw || "").trim();
  const fromUrl = s.match(/\/view\/([A-Za-z0-9]+)/);
  if (fromUrl) return fromUrl[1].toUpperCase();
  const bare = s.match(/^[A-Za-z0-9]+$/);
  return bare ? s.toUpperCase() : "";
};

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
  const [cardName, setCardName] = useState(null); // inspected card (by name)
  // Which pool tile is highlighted. In the "show all printings" view several
  // tiles share a name, so the highlight is keyed by the tile (card number),
  // not the name — otherwise clicking one printing highlights them all.
  const [inspectedKey, setInspectedKey] = useState(null);
  // The specific printing being inspected, so the preview shows the same art as
  // the clicked tile (null = use the card's default name-keyed image).
  const [inspectedCardNo, setInspectedCardNo] = useState(null);
  // name -> the card number of the rarity/art the user picked for that card.
  // Builder-only and saved as an additive `art` field; the Game keeps using
  // names for everything, so this never affects gameplay or sync.
  const [artByName, setArtByName] = useState(new Map());
  const inspect = (name, key, cardNo) => {
    setCardName(name);
    setInspectedKey(key != null ? key : name);
    // When no explicit printing is given (e.g. inspecting from the deck list),
    // show the art previously chosen for this card, else its canonical printing
    // (so the rarity picker highlights the art currently in use).
    const no =
      cardNo != null ? cardNo : artByName.get(name) || canonicalNoByName.get(name) || null;
    setInspectedCardNo(no);
  };
  // Choose (or change) the rarity/art for the inspected card: updates the live
  // preview and the deck-list art, and is remembered when the deck is saved.
  const handleSelectPrinting = (no) => {
    setInspectedCardNo(no);
    if (cardName) setArtByName((m) => new Map(m).set(cardName, no));
  };

  // filters
  const [search, setSearch] = useState("");
  const [buttonFilterSet, setButtonFilterSet] = useState("all");
  const [buttonFilterClass, setButtonFilterClass] = useState("all");
  // When true (default) the pool shows each card once; when false it reveals
  // every printing (each set/rarity a card was released in).
  const [excludeDupes, setExcludeDupes] = useState(true);
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
  // decklog (bushiroad) import: paste a share code or full /view/<code> URL.
  const [decklogCode, setDecklogCode] = useState("");
  const [decklogLoading, setDecklogLoading] = useState(false);
  const [decklogError, setDecklogError] = useState("");

  // ---------- responsive / mobile ----------
  // On phone-sized screens the two side columns (card preview + deck) are hidden
  // and surfaced as modals instead, leaving the card pool full-width.
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileInspectOpen, setMobileInspectOpen] = useState(false);
  const [mobileDeckOpen, setMobileDeckOpen] = useState(false);

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

  // Per-card copy max (the "/ N" shown on in-deck pool cards). null = no fixed
  // copy cap for that card (Onion Patch / Carrot / Drive Point), so only a count
  // is shown. Mirrors the copy-limit predicates above.
  const mainCopyMax = (card) => {
    if (card === "Rapid Fire") return 6;
    if (card === "Shenlong" || card === "Curse Crafter") return 1;
    if (card === "Onion Patch") return null;
    return 3;
  };
  const evoCopyMax = (card) => {
    if (card === "Carrot" || card === "Drive Point") return null;
    return 3;
  };

  // Add wrappers that also remember which printing/art was chosen. They only set
  // a default art (the added tile's printing) when none is chosen yet, so adding
  // from the pool never clobbers an explicit rarity pick made in the inspector
  // (handleSelectPrinting always overrides).
  const addMain = (name, cardNo) => {
    if (cardNo) setArtByName((m) => (m.has(name) ? m : new Map(m).set(name, cardNo)));
    handleCardSelection(name);
  };
  const addEvo = (name, cardNo) => {
    if (cardNo) setArtByName((m) => (m.has(name) ? m : new Map(m).set(name, cardNo)));
    handleEvoCardSelection(name);
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
      if (d.art) setArtByName(new Map(Object.entries(d.art)));
    }
    if (id) {
      try {
        const decoded = JSON.parse(atob(id));
        if (decoded[0].deck?.length) handleFillDeckMap(decoded[0].deck);
        if (decoded[0].evoDeck?.length) handleFillEvoDeckMap(decoded[0].evoDeck);
        if (decoded[0].name) setName(decoded[0].name);
        if (decoded[0].class) setDeckClass(decoded[0].class);
        if (decoded[0].art) setArtByName(new Map(Object.entries(decoded[0].art)));
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
      // "main" = the numbered booster sets BP01–BP17 (the default view).
      case "main":
        return [].concat(set1, set2, set3, set4, set5, set6, set7, set8, set9,
          set10, set11, set12, set13, set14, set15, set16, set17);
      case "main evo":
        return [].concat(set1Evo, set2Evo, set3Evo, set4Evo, set5Evo, set6Evo,
          set7Evo, set8Evo, set9Evo, set10Evo, set11Evo, set12Evo, set13Evo,
          set14Evo, set15Evo, set16Evo, set17Evo);
      default: return allCards;
    }
  };

  // card NAME -> its printings (one per set/rarity it was released in), used to
  // expand the pool when "Exclude duplicates" is off. Tokens are excluded.
  const printingsByName = useMemo(() => {
    const m = new Map();
    for (const p of cardPrintings) {
      if (!m.has(p.name)) m.set(p.name, []);
      m.get(p.name).push(p);
    }
    return m;
  }, []);
  // card number -> printing, so the inspector can show the exact set/rarity of
  // the printing being viewed (these differ across reprints of the same card).
  const printingByNo = useMemo(() => {
    const m = new Map();
    for (const p of cardPrintings) m.set(p.cardNo, p);
    return m;
  }, []);
  // Set family of a printing: the card-number prefix with any sub-bundle letter
  // dropped (e.g. "GFB01a"/"CSD02b" -> "GFB01"/"CSD02").
  const setFamily = (code) => code.replace(/[a-z]+$/, "");
  // card NAME -> set families it has a printing in (drives the Set filter).
  const setsByName = useMemo(() => {
    const m = new Map();
    for (const p of cardPrintings) {
      if (!m.has(p.name)) m.set(p.name, new Set());
      m.get(p.name).add(setFamily(p.set));
    }
    return m;
  }, []);
  // Ordered Set-filter options for the families actually present in the data.
  const setOptions = useMemo(() => {
    const present = new Set();
    for (const p of cardPrintings) present.add(setFamily(p.set));
    const opts = SET_CODE_ORDER.filter((c) => present.has(c)).map((c) => ({ code: c, label: SET_CODE_LABELS[c] || c }));
    for (const c of [...present].sort()) if (!SET_CODE_ORDER.includes(c)) opts.push({ code: c, label: c });
    return opts;
  }, []);
  const inspectedPrinting = inspectedCardNo ? printingByNo.get(inspectedCardNo) : null;
  // Every printing of the inspected card, so its rarity/art can be chosen.
  const inspectedPrintings = cardName ? printingsByName.get(cardName) || [] : [];

  // In the dedup ("Duplicates hidden") view we show one tile per card. Pick a
  // single canonical printing per name — the one matching the name-keyed
  // cardData (its set + rarity) — and use it for the art so the displayed image
  // stays consistent with the set/rarity shown in the inspector. Falls back to
  // the first printing if none matches.
  const canonicalNoByName = useMemo(() => {
    const m = new Map();
    for (const [name, list] of printingsByName) {
      const d = getDetails(name) || {};
      const match = list.find((p) => p.cardSet === d.cardSet && p.rarity === d.rarity) || list[0];
      if (match) m.set(name, match.cardNo);
    }
    return m;
  }, [printingsByName]);

  // ---------- filtered pool (set ∩ class ∩ search ∩ detail filters) ----------
  // Each entry is { name, cardNo?, key }: `name` drives selection/limits (the
  // deck is keyed by name), `cardNo` (printings view only) picks which art to
  // show. Tokens are never listed in the deck builder.
  const displayed = useMemo(() => {
    const main = mainSelected;
    const base = main ? allCards : allCardsEvo;
    const classKey = buttonFilterClass === "all" ? (main ? "all" : "all evo") : main ? buttonFilterClass : buttonFilterClass + " evo";
    const classSet = new Set(getCardsFromName(classKey));
    let names = base.filter((n) => classSet.has(n) && !n.endsWith(" TOKEN") && !HIDDEN_NAMES.has(n));
    // Set filter: "all" = no constraint, "main" = the BP01–17 boosters,
    // otherwise a specific set family (card has a printing in that set).
    if (buttonFilterSet === "main") {
      const mainSet = new Set(getCardsFromName(main ? "main" : "main evo"));
      names = names.filter((n) => mainSet.has(n));
    } else if (buttonFilterSet !== "all") {
      names = names.filter((n) => {
        const f = setsByName.get(n);
        return !!f && f.has(buttonFilterSet);
      });
    }
    const q = search.trim().toLowerCase();
    if (q) names = names.filter((n) => n.toLowerCase().includes(q));
    // Rarity is applied per-mode below (per-name when deduping, per-printing
    // when showing all printings), so exclude it from the shared name filter.
    const nameFilters = { types, traits, rarities: [], costs, attacks, defenses };
    if (hasActiveFilters(nameFilters)) names = names.filter((n) => matchesFilters(n, nameFilters));

    // A printing belongs to the selected set ("all" = any, "main" = BP01–17,
    // otherwise the exact set family). Used so a reprinted card only surfaces
    // the printings that actually belong to the filtered set.
    const inSelectedSet = (p) => {
      if (buttonFilterSet === "all") return true;
      const f = setFamily(p.set);
      if (buttonFilterSet === "main") return /^BP(0[1-9]|1[0-7])$/.test(f);
      return f === buttonFilterSet;
    };

    // Stable display order: group by set (same order as the Set dropdown —
    // newest boosters first, then crossovers, special, gloryfinder, worlds
    // beyond, showdown/starter, promos), then by card number within each set.
    // Cards whose set isn't in SET_CODE_ORDER sort to the end.
    const setRank = (code) => {
      const i = SET_CODE_ORDER.indexOf(code);
      return i === -1 ? SET_CODE_ORDER.length : i;
    };
    const noOf = (it) => it.cardNo || canonicalNoByName.get(it.name) || "";
    const sortItems = (arr) =>
      arr.sort((a, b) => {
        const na = noOf(a);
        const nb = noOf(b);
        const ra = setRank(setFamily(na.split("-")[0] || ""));
        const rb = setRank(setFamily(nb.split("-")[0] || ""));
        if (ra !== rb) return ra - rb;
        return na.localeCompare(nb, undefined, { numeric: true });
      });

    if (excludeDupes) {
      const REGULAR = new Set(["Bronze", "Silver", "Gold", "Legendary"]);
      // Represent each card by a regular-rarity printing (so the default view
      // shows its Legendary/Gold/etc. art, never an alt-art Ultimate / Special /
      // Super Special / Super Legendary / Premium), taken from the selected set
      // when one is filtered. Falls back to alt-art only if no regular exists.
      const pickRep = (n) => {
        const all = printingsByName.get(n) || [];
        const list = buttonFilterSet === "all" ? all : all.filter(inSelectedSet);
        if (!list.length) return null;
        const regs = list.filter((p) => REGULAR.has(p.rarity));
        const pool = regs.length ? regs : list;
        const d = getDetails(n) || {};
        return (
          pool.find((p) => p.cardSet === d.cardSet && p.rarity === d.rarity) ||
          pool.find((p) => p.rarity === d.rarity) ||
          pool[0]
        );
      };
      const out = [];
      for (const n of names) {
        const rep = pickRep(n);
        // Filter on the rarity that's actually shown (the chosen printing).
        const rarity = rep ? rep.rarity : (getDetails(n) || {}).rarity;
        if (rarities.length && !rarities.includes(rarity)) continue;
        out.push({ name: n, key: n, cardNo: rep ? rep.cardNo : canonicalNoByName.get(n) });
      }
      return sortItems(out);
    }

    // Show every printing of each card that belongs to the selected set; the
    // rarity filter applies per printing.
    const items = [];
    for (const n of names) {
      const prs = (printingsByName.get(n) || []).filter(inSelectedSet);
      if (prs.length) {
        for (const p of prs) {
          if (rarities.length && !rarities.includes(p.rarity)) continue;
          items.push({ name: n, cardNo: p.cardNo, key: p.cardNo });
        }
      } else if (buttonFilterSet === "all" && !rarities.length) {
        items.push({ name: n, key: n });
      }
    }
    return sortItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainSelected, buttonFilterSet, buttonFilterClass, search, types, traits, rarities, costs, attacks, defenses, excludeDupes, printingsByName, canonicalNoByName, setsByName]);

  useEffect(() => setVisibleCount(CARD_PAGE_SIZE), [displayed]);

  // react-infinite-scroll-component only loads the next page in response to a
  // scroll event on the pool. Whenever the current page (visibleCount cards)
  // doesn't overflow the container, no scrollbar appears and the user can
  // never trigger loading the rest. Guarantee that, at any size, either every
  // card is shown or the pool overflows (giving a scrollbar that the infinite
  // scroll then uses for the remainder): keep loading pages until one of those
  // holds. A ResizeObserver re-checks on any height change of the pool — window
  // resize, browser zoom, collapsing the Filters panel, etc.
  useEffect(() => {
    const el = document.getElementById("poolScroll");
    if (!el) return;
    const fill = () => {
      if (displayed.length > visibleCount && el.scrollHeight <= el.clientHeight) {
        setVisibleCount((c) => c + CARD_PAGE_SIZE);
      }
    };
    fill();
    const ro = new ResizeObserver(fill);
    ro.observe(el);
    return () => ro.disconnect();
  }, [displayed, visibleCount]);

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
    if (deck.length > 0) { initedRef.current = true; inspect(byCost([...deckMap.keys()])[0]); }
    else if (evoDeck.length > 0) { initedRef.current = true; inspect(byCost([...evoDeckMap.keys()])[0]); }
    else if (!willLoadDeck && displayed.length > 0) { initedRef.current = true; inspect(displayed[0].name, displayed[0].key, displayed[0].cardNo); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, evoDeck, displayed, cardName, willLoadDeck]);

  // ---------- inspector ----------
  const inspectedIsEvo = cardName ? isEvoCard(cardName) : false;
  const inspectedCount = cardName
    ? inspectedIsEvo ? evoDeckMap.get(cardName) || 0 : deckMap.get(cardName) || 0
    : 0;
  const inspectedAtLimit = cardName ? (inspectedIsEvo ? evoAtLimit(cardName) : mainAtLimit(cardName)) : true;
  const navInspect = (dir) => {
    let idx = displayed.findIndex((it) => (it.key ?? it.name) === inspectedKey);
    if (idx === -1) idx = displayed.findIndex((it) => it.name === cardName);
    if (idx === -1) return;
    const ni = idx + dir;
    if (ni >= 0 && ni < displayed.length) inspect(displayed[ni].name, displayed[ni].key, displayed[ni].cardNo);
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

  // Replace the whole deck with imported cards. Builds fresh state objects
  // directly (rather than going through handleCardSelection, which reads stale
  // render-time deck lengths) so re-importing over a full deck works cleanly.
  // Still honours per-card copy caps and the 50/10 deck-size limits.
  const applyImportedDeck = (mainNames, evoNames) => {
    const build = (names, copyMaxOf, totalCap) => {
      const map = new Map();
      const arr = [];
      for (const c of names) {
        if (arr.length >= totalCap) break;
        const max = copyMaxOf(c);
        const cur = map.get(c) || 0;
        if (max != null && cur >= max) continue;
        map.set(c, cur + 1);
        arr.push(c);
      }
      return { map, arr };
    };
    const m = build(mainNames, mainCopyMax, 50);
    const e = build(evoNames, evoCopyMax, 10);
    setDeck(m.arr); setDeckMap(m.map);
    setEvoDeck(e.arr); setEvoDeckMap(e.map);
  };

  // Fetch a deck from bushiroad decklog (via the server proxy — decklog sends no
  // CORS headers, so the browser can't call it directly) and fill the builder.
  const handleDecklogImport = async () => {
    const code = extractDecklogCode(decklogCode);
    if (!code) { setDecklogError("Enter a decklog code or URL."); return; }
    setDecklogLoading(true); setDecklogError("");
    try {
      const base = SERVER_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/decklog/${code}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      const mainNames = [];
      const evoNames = [];
      const missing = [];
      for (const c of data.list || []) {
        const nm = NAME_BY_CARD_NO[c.card_number];
        if (!nm) { missing.push(c.card_number); continue; }
        const n = Math.max(1, c.num || 1);
        for (let i = 0; i < n; i++) (isEvoCard(nm) ? evoNames : mainNames).push(nm);
      }
      if (mainNames.length === 0 && evoNames.length === 0) {
        throw new Error("None of this deck's cards were recognised.");
      }
      applyImportedDeck(mainNames, evoNames);
      // Adopt decklog's class + title when we can, so the deck is ready to save.
      const cls = CLASS_KEY_BY_LABEL[data.deck_param2];
      if (cls) setDeckClass(cls);
      if (data.title && !name) setName(data.title);
      if (missing.length) {
        setDecklogError(
          `Imported, but ${missing.length} card(s) weren't recognised and were skipped.`,
        );
      } else {
        setOpenImport(false);
        setDecklogCode("");
      }
    } catch (e) {
      setDecklogError(e.message || "Failed to import from decklog.");
    } finally {
      setDecklogLoading(false);
    }
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
    // `art` (name -> chosen printing card number) is an additive field; the Game
    // ignores it and continues to read `deck`/`evoDeck` as name lists.
    const art = {};
    for (const [n, no] of artByName) if (deckMap.has(n) || evoDeckMap.has(n)) art[n] = no;
    dispatch(createDeck({ name, class: deckClass, deck, evoDeck, art }));
    navigate("/");
  };

  const clearFilters = () => {
    setTypes([]); setTraits([]); setRarities([]); setCosts([]); setAttacks([]); setDefenses([]);
  };

  // On mobile, tapping a card pops the preview modal open over the pool.
  const handleInspect = (n, key, cardNo) => {
    inspect(n, key, cardNo);
    if (isMobile) setMobileInspectOpen(true);
  };
  // Tapping a deck row (inside the deck modal) inspects that card; on mobile it
  // surfaces the preview modal on top of the deck modal.
  const handleDeckInspect = (n) => {
    inspect(n);
    if (isMobile) setMobileInspectOpen(true);
  };

  const inspectorEl = (
    <CardInspector
      name={cardName}
      cardNo={inspectedCardNo}
      rarity={inspectedPrinting ? inspectedPrinting.rarity : undefined}
      cardSet={inspectedPrinting ? inspectedPrinting.cardSet : undefined}
      printings={inspectedPrintings}
      selectedCardNo={inspectedCardNo}
      onSelectPrinting={handleSelectPrinting}
      count={inspectedCount}
      atLimit={inspectedAtLimit}
      isDouble={cardName ? isDoubleEvo(cardName) : false}
      onAdd={() => cardName && (inspectedIsEvo ? addEvo(cardName, inspectedCardNo) : addMain(cardName, inspectedCardNo))}
      onRemove={() => cardName && (inspectedIsEvo ? handleEvoCardRemove(cardName) : handleCardRemove(cardName))}
      onPrev={() => navInspect(-1)}
      onNext={() => navInspect(1)}
      onSwap={handleDoubleEvoClick}
      large={isMobile}
    />
  );

  const deckPanelEl = (
    <DeckPanel
      deckMap={deckMap} evoDeckMap={evoDeckMap}
      deckLen={deck.length} evoLen={evoDeck.length}
      artNoOf={(n) => artByName.get(n) || null}
      onInspect={handleDeckInspect}
      onAdd={handleCardSelection} onAddEvo={handleEvoCardSelection}
      onRemove={handleCardRemove} onRemoveEvo={handleEvoCardRemove}
      isAtLimit={mainAtLimit} isEvoAtLimit={evoAtLimit}
      copyMaxOf={mainCopyMax} evoCopyMaxOf={evoCopyMax} isMobile={isMobile}
      name={name} onNameChange={setName}
      deckClass={deckClass} onDeckClass={setDeckClass}
      canCreate={canCreate} onCreate={handleSubmit}
      onImport={() => setOpenImport(true)} onExport={handleOpenSnack}
    />
  );

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
        {/* On mobile the deck column is hidden; this button opens it as a modal. */}
        {isMobile && (
          <Button
            size="small" variant="outlined" onClick={() => setMobileDeckOpen(true)}
            startIcon={<StyleIcon />}
            sx={{ color: COLORS.text, borderColor: COLORS.border, fontFamily: FONT, textTransform: "none" }}
          >
            Deck ({deck.length})
          </Button>
        )}
      </div>

      {/* body — 3 columns on desktop; pool-only on mobile (sides become modals) */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 10, padding: isMobile ? "0 0 6px" : "0 12px 12px" }}>
        {/* LEFT — inspector (desktop only) */}
        {!isMobile && <aside style={col(420)}>{inspectorEl}</aside>}

        {/* CENTER — filters + pool */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: COLORS.panel, borderRadius: 12, overflow: "hidden" }}>
          <FilterBar
            mainSelected={mainSelected} onToggleDeck={setMainSelected}
            search={search} onSearch={setSearch}
            set={buttonFilterSet} onSet={setButtonFilterSet} setOptions={setOptions}
            klass={buttonFilterClass} onClass={setButtonFilterClass}
            types={types} onTypes={setTypes}
            traits={traits} onTraits={setTraits}
            rarities={rarities} onRarities={setRarities}
            costs={costs} onCosts={setCosts}
            attacks={attacks} onAttacks={setAttacks}
            defenses={defenses} onDefenses={setDefenses}
            excludeDupes={excludeDupes} onExcludeDupes={setExcludeDupes}
            onClear={clearFilters}
            isMobile={isMobile}
          />
          <div id="poolScroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", background: COLORS.inset }}>
            <CardGrid
              items={displayed}
              visibleCount={visibleCount}
              onLoadMore={() => setVisibleCount((c) => c + CARD_PAGE_SIZE)}
              hasMore={displayed.length > visibleCount}
              scrollTargetId="poolScroll"
              inspectedKey={inspectedKey}
              onInspect={handleInspect}
              onAdd={mainSelected ? addMain : addEvo}
              onRemove={mainSelected ? handleCardRemove : handleEvoCardRemove}
              isAtLimit={mainSelected ? mainAtLimit : evoAtLimit}
              countOf={mainSelected ? (n) => deckMap.get(n) || 0 : (n) => evoDeckMap.get(n) || 0}
              copyMaxOf={mainSelected ? mainCopyMax : evoCopyMax}
              isMobile={isMobile}
            />
          </div>
        </main>

        {/* RIGHT — deck (desktop only) */}
        {!isMobile && <aside style={col(340)}>{deckPanelEl}</aside>}
      </div>

      {/* mobile: card preview modal */}
      {isMobile && (
        <Dialog
          open={mobileInspectOpen}
          onClose={() => setMobileInspectOpen(false)}
          fullScreen
          PaperProps={{
            sx: {
              // Transparent so the dimmed pool behind shows through; only the
              // centered panel card is opaque.
              backgroundColor: "transparent",
              backgroundImage: "none",
              boxShadow: "none",
            },
          }}
        >
          <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
            <IconButton
              onClick={() => setMobileInspectOpen(false)}
              sx={{
                position: "absolute", top: 10, right: 10, zIndex: 3, color: COLORS.text,
                background: "rgba(0,0,0,0.45)", "&:hover": { background: "rgba(0,0,0,0.65)" },
              }}
            >
              <CloseIcon />
            </IconButton>
            <div style={{ height: "100%", display: "flex", padding: "18px 14px", boxSizing: "border-box" }}>
              {/* Fixed-height panel card (like the desktop left column): the card
                  image stays anchored at the top and the effect text scrolls
                  inside, so navigating between cards no longer shifts the layout. */}
              <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", background: "rgba(28, 31, 38, 0.97)", borderRadius: 16, padding: 16, boxSizing: "border-box", boxShadow: "0 12px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
                {inspectorEl}
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* mobile: deck modal (opened from the top bar) */}
      {isMobile && (
        <Dialog
          open={mobileDeckOpen}
          onClose={() => setMobileDeckOpen(false)}
          fullScreen
          PaperProps={{ sx: { background: COLORS.inset2, backgroundImage: "none" } }}
        >
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontFamily: FONT, color: COLORS.text, fontSize: 18, fontWeight: 700 }}>Deck</span>
              <IconButton onClick={() => setMobileDeckOpen(false)} sx={{ color: COLORS.text }}>
                <CloseIcon />
              </IconButton>
            </div>
            <div style={{ flex: 1, minHeight: 0, padding: "12px 30px" }}>
              {deckPanelEl}
            </div>
          </div>
        </Dialog>
      )}

      {/* import dialog */}
      <Dialog open={openImport} onClose={() => setOpenImport(false)} PaperProps={{ component: "form" }} fullWidth maxWidth="sm">
        <DialogTitle>Import Deck</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: 600 }}>From decklog</DialogContentText>
          <DialogContentText sx={{ fontSize: 13 }}>
            Paste a bushiroad decklog code or share URL (e.g. https://decklog-en.bushiroad.com/view/26JXU).
          </DialogContentText>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 6 }}>
            <TextField
              autoFocus margin="dense" fullWidth variant="standard" placeholder="decklog code or URL"
              value={decklogCode}
              onChange={(e) => { setDecklogCode(e.target.value); setDecklogError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleDecklogImport(); } }}
              disabled={decklogLoading}
            />
            <Button
              onClick={handleDecklogImport} disabled={decklogLoading || !decklogCode.trim()}
              variant="contained" sx={{ mt: 1, flexShrink: 0, whiteSpace: "nowrap" }}
              startIcon={decklogLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {decklogLoading ? "Loading…" : "Import"}
            </Button>
          </div>
          {decklogError && (
            <DialogContentText sx={{ color: COLORS.danger || "#e57373", fontSize: 13, mt: 1 }}>
              {decklogError}
            </DialogContentText>
          )}

          <Divider sx={{ my: 2 }} />

          <DialogContentText sx={{ fontWeight: 600 }}>Paste a decklist</DialogContentText>
          <DialogContentText sx={{ fontSize: 13 }}>Count + card name per line; a blank line separates main and evolve.</DialogContentText>
          <TextField required margin="dense" fullWidth multiline variant="standard"
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
