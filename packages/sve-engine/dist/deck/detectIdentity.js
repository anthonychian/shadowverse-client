"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COOL_EARRINGS_CARD_NO = exports.CRAFT_LEADERS = void 0;
exports.getCardUniverseFromCardNo = getCardUniverseFromCardNo;
exports.detectDeckIdentity = detectDeckIdentity;
const registry_1 = require("../cards/registry");
exports.CRAFT_LEADERS = {
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
const CRAFT_CLASSES = [
    "forest",
    "sword",
    "rune",
    "dragon",
    "abyss",
    "haven",
];
function isCraftClass(value) {
    return CRAFT_CLASSES.includes(value) || value === "neutral";
}
function getCardUniverseFromCardNo(cardNo) {
    const id = cardNo.toUpperCase();
    if (/^(ECP02|CP02)/.test(id))
        return "idolmaster";
    if (/^(CSD01|CP01|ECP01)/.test(id))
        return "umamusume";
    if (/^CSD03/.test(id))
        return "vanguard";
    return null;
}
function leaderForCraft(craft) {
    if (craft && craft !== "neutral" && exports.CRAFT_LEADERS[craft]) {
        return exports.CRAFT_LEADERS[craft];
    }
    return exports.CRAFT_LEADERS.dragon;
}
function detectDeckIdentity(cardNos) {
    const crafts = new Set();
    const universes = new Set();
    for (const cardNo of cardNos) {
        const def = (0, registry_1.getCardDef)(cardNo);
        const cardClass = def?.class;
        if (cardClass && isCraftClass(cardClass) && cardClass !== "neutral") {
            crafts.add(cardClass);
        }
        const universe = getCardUniverseFromCardNo(cardNo);
        if (universe)
            universes.add(universe);
    }
    if (crafts.size === 1) {
        const craft = [...crafts][0];
        return { craft, universe: null, leader: leaderForCraft(craft) };
    }
    if (universes.size === 1) {
        const universe = [...universes][0];
        return { craft: null, universe, leader: UNIVERSE_LEADERS[universe] };
    }
    if (crafts.size > 1) {
        const dominant = [...crafts].sort()[0];
        return { craft: dominant, universe: null, leader: leaderForCraft(dominant) };
    }
    return { craft: "neutral", universe: null, leader: exports.CRAFT_LEADERS.dragon };
}
exports.COOL_EARRINGS_CARD_NO = "CP02-T04EN";
