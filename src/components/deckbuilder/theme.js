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
};

// Human-readable set names, keyed by the filter value used in CreateDeck.
export const SET_LABELS = {
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
  "set 17", "set 16", "set 15", "set 14", "uma2", "set 13", "set 12", "sea",
  "set 11", "vg", "set 10", "set 9", "set 8", "set 7", "idol", "idol2",
  "set 6", "set 5", "set 4", "set 3", "uma", "set 2", "set 1",
];

export const CLASS_ORDER = ["forest", "sword", "rune", "dragon", "abyss", "haven", "neutral"];
