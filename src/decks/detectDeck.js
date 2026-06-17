import {
  forest,
  sword,
  rune,
  dragon,
  abyss,
  haven,
  neutral,
  setUMA,
  setUMA2,
  setIDOL,
  setIDOL2,
  setVG,
} from "./AllCards";
import {
  forestEvo,
  swordEvo,
  runeEvo,
  dragonEvo,
  abyssEvo,
  havenEvo,
  neutralEvo,
  setUMAEvo,
  setUMA2Evo,
  setIDOLEvo,
  setIDOL2Evo,
  setVGEvo,
} from "./AllCardsEvo";

const CRAFT_LEADERS = {
  sword: "Albert",
  dragon: "Forte",
  abyss: "Icy",
  rune: "Kuon",
  forest: "Sekka",
  haven: "Rola",
};

const UNIVERSE_LEADERS = {
  umamusume: "Maruzensky",
  idolmaster: "Rin",
  vanguard: "Albert",
};

function buildNameSet(lists) {
  const set = new Set();
  for (const list of lists) {
    for (const name of list) set.add(name);
  }
  return set;
}

const nameToCraft = new Map();
for (const [craft, list] of [
  ["forest", forest],
  ["sword", sword],
  ["rune", rune],
  ["dragon", dragon],
  ["abyss", abyss],
  ["haven", haven],
  ["neutral", neutral],
]) {
  for (const name of list) nameToCraft.set(name, craft);
}
for (const [craft, list] of [
  ["forest", forestEvo],
  ["sword", swordEvo],
  ["rune", runeEvo],
  ["dragon", dragonEvo],
  ["abyss", abyssEvo],
  ["haven", havenEvo],
  ["neutral", neutralEvo],
]) {
  for (const name of list) nameToCraft.set(name, craft);
}

const universeSets = {
  umamusume: buildNameSet([setUMA, setUMA2, setUMAEvo, setUMA2Evo]),
  idolmaster: buildNameSet([setIDOL, setIDOL2, setIDOLEvo, setIDOL2Evo]),
  vanguard: buildNameSet([setVG, setVGEvo]),
};

function leaderForCraft(craft) {
  return CRAFT_LEADERS[craft] ?? CRAFT_LEADERS.dragon;
}

function detectUniverse(cardNames) {
  for (const [universe, allowed] of Object.entries(universeSets)) {
    if (cardNames.every((name) => nameToCraft.get(name) === "neutral" || allowed.has(name))) {
      const hasUniverseCard = cardNames.some((name) => allowed.has(name));
      if (hasUniverseCard) return universe;
    }
  }
  return null;
}

/**
 * Detect deck craft / universe and the leader portrait to display.
 * @param {string[]} mainDeck
 * @param {string[]} evoDeck
 */
export function detectDeckIdentity(mainDeck = [], evoDeck = []) {
  const allCards = [...mainDeck, ...evoDeck];
  const crafts = new Set();

  for (const name of allCards) {
    const craft = nameToCraft.get(name);
    if (craft && craft !== "neutral") crafts.add(craft);
  }

  if (crafts.size === 1) {
    const craft = [...crafts][0];
    return {
      craft,
      universe: null,
      leader: leaderForCraft(craft),
    };
  }

  const universe = detectUniverse(allCards);
  if (universe) {
    return {
      craft: crafts.size === 1 ? [...crafts][0] : null,
      universe,
      leader: UNIVERSE_LEADERS[universe],
    };
  }

  if (crafts.size > 1) {
    const dominant = [...crafts].sort()[0];
    return {
      craft: dominant,
      universe: null,
      leader: leaderForCraft(dominant),
    };
  }

  return {
    craft: "neutral",
    universe: null,
    leader: CRAFT_LEADERS.dragon,
  };
}
