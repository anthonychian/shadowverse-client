"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenCard = isTokenCard;
exports.isAdvancedCard = isAdvancedCard;
exports.destinationForDestroyedCard = destinationForDestroyedCard;
const registry_1 = require("./registry");
function isTokenCard(cardNo) {
    const def = (0, registry_1.getCardDef)(cardNo);
    if (!def)
        return /\bTOKEN\b/i.test(cardNo);
    return (def.printingType === "token" ||
        def.specialType === "token" ||
        /\bTOKEN\b/i.test(def.name));
}
function isAdvancedCard(card) {
    if (card.advancedFromEvolveDeck)
        return true;
    const def = (0, registry_1.getCardDef)(card.cardNo);
    return def?.specialType === "advanced" || /\sADVANCED$/i.test(def?.name ?? "");
}
function destinationForDestroyedCard(card) {
    if (isAdvancedCard(card))
        return "evolveDeck";
    return isTokenCard(card.cardNo) ? "banish" : "cemetery";
}
