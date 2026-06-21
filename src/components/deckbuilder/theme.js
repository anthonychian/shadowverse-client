// Shared visual constants for the deck builder, lifted from the palette already
// used across the app (CreateDeck/Home) so the redesign stays consistent.

export const FONT = "Noto Serif JP, serif";

export const COLORS = {
  panel: "rgba(40, 44, 52, 0.72)", // column / card panels
  inset: "rgba(0, 0, 0, 0.55)", // recessed areas (deck list, grid bg)
  inset2: "rgba(10, 14, 20, 0.9)",
  row: "rgba(255, 255, 255, 0.05)",
  rowHover: "rgba(72, 171, 224, 0.18)",
  border: "rgba(72, 171, 224, 0.35)",
  glow: "#48abe0",
  gold: "#f3c44b",
  text: "#ffffff",
  textDim: "rgba(255, 255, 255, 0.6)",
  danger: "#e0556b",
};

export const CLASS_LABELS = {
  forest: "Forestcraft",
  sword: "Swordcraft",
  rune: "Runecraft",
  dragon: "Dragoncraft",
  abyss: "Abysscraft",
  haven: "Havencraft",
  neutral: "Neutral",
  idolmaster: "THE IDOLM@STER CINDERELLA GIRLS",
  umamusume: "Umamusume: Pretty Derby",
  vanguard: "Cardfight!! Vanguard",
  priconne: "Princess Connect! Re:Dive",
};

// Class accent colors for chips / borders.
export const CLASS_COLORS = {
  forest: "#5bbf63",
  sword: "#e6b422",
  rune: "#4a90d9",
  dragon: "#e08a2e",
  abyss: "#b8455a",
  haven: "#e8dca0",
  neutral: "#9aa0a6",
  idolmaster: "#8f9fe8",
  umamusume: "#e8913a",
  vanguard: "#e02020",
  priconne: "#f06ba8",
};

// Human-readable set names, keyed by the filter value used in CreateDeck.
export const SET_LABELS = {
  main: "Main Sets (BP01–18)",
  "set 20": "Omens and Heirs",
  "set 19": "Eightfold Retribution",
  "set 18": "Neometropolis",
  "set 17": "Convergent Destinies",
  "set 16": "New World Genesis",
  "set 15": "Trial of the Omens",
  "set 14": "Banquet of Dreams",
  uma2: "Umamusume: Pretty Derby EX",
  "set 13": "Dominion of Darkness",
  "set 12": "Worldreaver's Descent",
  sea: "Seaside Memories",
  "set 11": "Bullet of Fate",
  vg: "Cardfight!! Vanguard",
  "set 10": "Gods of the Arcana",
  "set 9": "Duet of Dawn and Dusk",
  "set 8": "Alterchaotica",
  "set 7": "Verdant Steel",
  idol: "iDOLM@STER Cinderella Girls",
  idol2: "iDOLM@STER Cinderella Girls EX",
  "set 6": "Paragons of the Colosseum",
  "set 5": "Omens Eternal",
  "set 4": "Cosmic Mythos",
  "set 3": "Flame of Lævateinn",
  uma: "Umamusume: Pretty Derby",
  "set 2": "Reign of Bahamut",
  "set 1": "Advent of Genesis",
};

// Ordered list of sets for the dropdown (newest first, matching the old UI).
export const SET_ORDER = [
  "main",
  "set 17", "set 16", "set 15", "set 14", "uma2", "set 13", "set 12", "sea",
  "set 11", "vg", "set 10", "set 9", "set 8", "set 7", "idol", "idol2",
  "set 6", "set 5", "set 4", "set 3", "uma", "set 2", "set 1",
];

// The deck-builder Set filter is keyed by the real set-family code (the card
// number prefix, e.g. "BP01"; sub-bundles like "GFB01a" collapse to "GFB01").
// Order = newest boosters first, then crossovers, special, gloryfinder, worlds
// beyond, showdown/starter decks, then promos.
export const SET_CODE_ORDER = [
  "BP20", "BP19", "BP18", "BP17", "BP16", "BP15", "BP14", "BP13", "BP12", "BP11", "BP10", "BP09",
  "BP08", "BP07", "BP06", "BP05", "BP04", "BP03", "BP02", "BP01",
  "ECP02", "ECP01", "CP04", "CP03", "CP02", "CP01", "SP01",
  "GFB01", "GFD02", "GFD01", "SS02", "SS01",
  "SDD06", "SDD05", "SDD04", "SDD03", "SDD02", "SDD01",
  "SD06", "SD05", "SD04", "SD03", "SD02", "SD01",
  "CSD03", "CSD02", "CSD01", "PR",
];

// Card names carry an " ADVANCED" suffix so the Game can register Advanced
// evolve cards (it matches name.slice(-8) === "ADVANCED"). That suffix is an
// internal marker, not part of the printed card name, so strip it for display.
export const displayName = (n) => (n || "").replace(/ ADVANCED$/, "");

export const SET_CODE_LABELS = {
  BP20: "Omens and Heirs",
  BP19: "Eightfold Retribution",
  BP18: "Neometropolis",
  BP17: "Convergent Destinies", BP16: "New World Genesis", BP15: "Trial of the Omens",
  BP14: "Banquet of Dreams", BP13: "Dominion of Darkness", BP12: "Worldreaver's Descent",
  BP11: "Bullet of Fate", BP10: "Gods of the Arcana", BP09: "Duet of Dawn and Dusk",
  BP08: "Alterchaotica", BP07: "Verdant Steel", BP06: "Paragons of the Colosseum",
  BP05: "Omens Eternal", BP04: "Cosmic Mythos", BP03: "Flame of Lævateinn",
  BP02: "Reign of Bahamut", BP01: "Advent of Genesis",
  ECP02: "iDOLM@STER CG EX", ECP01: "Umamusume: Pretty Derby EX",
  CP04: "Princess Connect! Re:Dive",
  CP03: "Cardfight!! Vanguard", CP02: "iDOLM@STER Cinderella Girls", CP01: "Umamusume: Pretty Derby",
  SP01: "Seaside Memories",
  GFB01: "Gloryfinder Bundle #1", GFD02: "Gloryfinder: Treacherous Ambitions",
  GFD01: "Gloryfinder: Luxheart Legends",
  SS02: "Worlds Beyond: Dragoncraft", SS01: "Worlds Beyond: Swordcraft",
  SDD01: "Showdown: Forestcraft", SDD02: "Showdown: Swordcraft", SDD03: "Showdown: Runecraft",
  SDD04: "Showdown: Dragoncraft", SDD05: "Showdown: Abysscraft", SDD06: "Showdown: Havencraft",
  SD01: "Starter: Regal Fairy Princess", SD02: "Starter: Blade of Resentment",
  SD03: "Starter: Mysteries of Conjuration", SD04: "Starter: Wrath of the Greatwyrm",
  SD05: "Starter: Waltz of the Undying Night", SD06: "Starter: Maculate Ablution",
  CSD03: "Crossover Starter: Knight/Apocalypse", CSD02: "Crossover Starter: Cute/Cool/Passion",
  CSD01: "Crossover Starter: Umamusume", PR: "Promo Cards",
};

export const CLASS_ORDER = [
  "forest", "sword", "rune", "dragon", "abyss", "haven", "neutral", "priconne",
];
