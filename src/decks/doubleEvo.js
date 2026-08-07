import cardData from "./cardData.json";

// Dual-sided evolve cards: one physical card whose front/back are two different
// evolved forms. Maps each side to its counterpart. Shared by the deck builder
// (preview swap), the in-game evolve deck ("Switch Side") and the field context
// menu (switching an already-evolved card between sides).
export const DOUBLE_EVO_PAIRS = {
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

// The other side of a dual-sided evolve card, or undefined if `name` isn't one.
// The catalog also lists these cards as "<name> Evolved" (their own printing
// entries, e.g. "Vania, Kind Queen Evolved"), and decks can hold either form —
// so the lookup tolerates the suffix. The result is always the plain name:
// the B-sides only exist in the catalog (textures/art) in plain form.
export const doubleEvoOtherSide = (name) => {
  if (typeof name !== "string") return undefined;
  return (
    DOUBLE_EVO_PAIRS[name] || DOUBLE_EVO_PAIRS[name.replace(/\s+Evolved$/, "")]
  );
};

export const isDoubleEvo = (name) => !!doubleEvoOtherSide(name);

// The scraped catalog (cardData.json) only carries these cards' A-sides, under
// "<name> Evolved" keys — the EN card list doesn't index the back faces. The
// B-side details below are transcribed from the official card pages
// (en.shadowverse-evolve.com/cards/?cardno=...), token references omitted to
// match the house style of the scraped entries.
const B_SIDE_DETAILS = {
  "Orchis, Vengeful Puppet": {
    class: "forest",
    type: "evolved",
    cardType: "Follower / Evolved",
    trait: "Puppetry / Cutthroat",
    rarity: "Legendary",
    cost: "-",
    attack: "4",
    defense: "4",
    effect:
      "On Evolve - Summon 4 Puppet tokens. While this card is on your field, each Puppet on your field has Assail. Whenever a Puppet you control leaves the field, select an enemy leader or enemy follower on the field and deal it 2 damage.",
    cardSet: 'Booster Set #8 "Alterchaotica"',
  },
  "Paula, Passionate Warmth": {
    class: "forest",
    type: "evolved",
    cardType: "Follower / Evolved",
    trait: "Pixie",
    rarity: "Gold",
    cost: "-",
    attack: "3",
    defense: "3",
    effect:
      "On Evolve - Select up to 2 other cards on your field and put them into their owners' EX areas. Strike, Combo (3) - Select an enemy follower on the field and deal it 3 damage.",
    cardSet: 'Booster Set #9 "Duet of Dawn and Dusk"',
  },
  "Celia, Despair's Messenger": {
    class: "sword",
    type: "evolved",
    cardType: "Follower / Evolved",
    trait: "Commander / Cutthroat",
    rarity: "Legendary",
    cost: "-",
    attack: "4",
    defense: "4",
    effect: "Storm. On Evolve - Summon a Steelclad Knight and Knight token.",
    cardSet: 'Booster Set #9 "Duet of Dawn and Dusk"',
  },
  "Mysterian Blackwyrm": {
    class: "rune",
    type: "evolved",
    cardType: "Follower / Evolved",
    trait: "Academic / Cutthroat",
    rarity: "Gold",
    cost: "-",
    attack: "5",
    defense: "5",
    effect: "Assail. On Evolve - Deal 3 damage to each enemy leader.",
    cardSet: 'Booster Set #9 "Duet of Dawn and Dusk"',
  },
  "Iniquitous Lindworm": {
    class: "dragon",
    type: "evolved",
    cardType: "Follower / Evolved",
    trait: "Wyrmkin / Cutthroat",
    rarity: "Gold",
    cost: "-",
    attack: "10",
    defense: "10",
    effect: "Storm. This follower ignores Ward.",
    cardSet: 'Booster Set #9 "Duet of Dawn and Dusk"',
  },
  "Vania, Blood Queen": {
    class: "abyss",
    type: "evolved",
    cardType: "Follower / Evolved",
    trait: "Vampire / Princess / Cutthroat",
    rarity: "Legendary",
    cost: "-",
    attack: "6",
    defense: "6",
    effect:
      "Storm. While this card is on your field, any Forest Bat you play costs 1 less. Whenever a Forest Bat is put onto your field, select an enemy follower on the field and deal it 3 damage.",
    cardSet: 'Booster Set #9 "Duet of Dawn and Dusk"',
  },
  "Ceryneian Darkhind": {
    class: "haven",
    type: "evolved",
    cardType: "Follower / Evolved",
    trait: "Faith / Beast / Cutthroat",
    rarity: "Gold",
    cost: "-",
    attack: "5",
    defense: "5",
    effect:
      "Bane. On Evolve - Bury an amulet: Select an enemy leader or enemy follower on the field and deal it 4 damage.",
    cardSet: 'Booster Set #9 "Duet of Dawn and Dusk"',
  },
};

// Details for a dual-sided card under any of its in-game names, or null. The
// plain A-side names ("Vania, Kind Queen") alias to the scraped "<name>
// Evolved" entry; the B-sides come from the table above. cardDetails.getDetails
// falls back to this, so stats/effects resolve wherever cards are looked up
// (evolve stat seeding, hover panels, deck-builder filters).
export const doubleEvoDetails = (name) => {
  if (!doubleEvoOtherSide(name)) return null;
  const plain = name.replace(/\s+Evolved$/, "");
  return B_SIDE_DETAILS[plain] || cardData[plain + " Evolved"] || null;
};
