"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIdentityName = normalizeIdentityName;
exports.cardIdentityKey = cardIdentityKey;
exports.isCanonicalSlot = isCanonicalSlot;
exports.buildReprintMap = buildReprintMap;
exports.mergePrintingWithGameplay = mergePrintingWithGameplay;
function normalizeIdentityName(name) {
    return name
        .replace(/\s+TOKEN$/i, "")
        .replace(/\s+Evolved$/i, "")
        .replace(/\s+ADVANCED$/i, "")
        .trim();
}
/** Base, evolved, and token printings of the same name are distinct identities. */
function cardIdentityKey(card) {
    const role = card.printingType ?? card.type;
    const isToken = role === "token" || card.specialType === "token" || /\s+TOKEN$/i.test(card.name);
    // Explicit base printings must stay base even when scraped data wrongly marks specialType evolved.
    const isEvolved = role === "evolved" ||
        (role !== "base" &&
            role !== "token" &&
            (card.specialType === "evolved" || /\s+Evolved$/i.test(card.name)));
    const kind = isToken ? "token" : isEvolved ? "evolved" : "base";
    return `${normalizeIdentityName(card.name)}|${kind}`;
}
function isCanonicalSlot(cardNo) {
    return /^[A-Z0-9]+-(\d+|T\d+)EN$/i.test(cardNo);
}
function cardRichness(card) {
    let score = 0;
    if (card.cardText)
        score += card.cardText.length;
    if (card.cost != null && card.cost > 0)
        score += 10;
    if (card.attack != null)
        score += 5;
    if (card.defense != null)
        score += 5;
    if (card.keywords?.length)
        score += card.keywords.length * 3;
    if (card.abilities?.length)
        score += 50;
    if (card.traits?.length)
        score += 2;
    return score;
}
function pickCanonicalInGroup(cards) {
    return [...cards].sort((a, b) => {
        const diff = cardRichness(b) - cardRichness(a);
        if (diff !== 0)
            return diff;
        const aCanon = isCanonicalSlot(a.cardNo) ? 1 : 0;
        const bCanon = isCanonicalSlot(b.cardNo) ? 1 : 0;
        return bCanon - aCanon;
    })[0];
}
/** cardNo -> richest gameplay source cardNo (may be itself). */
function buildReprintMap(cards) {
    const byIdentity = new Map();
    for (const card of Object.values(cards)) {
        const key = cardIdentityKey(card);
        if (!byIdentity.has(key))
            byIdentity.set(key, []);
        byIdentity.get(key).push(card);
    }
    const map = new Map();
    for (const group of byIdentity.values()) {
        const canonical = pickCanonicalInGroup(group);
        for (const card of group) {
            map.set(card.cardNo, canonical.cardNo);
        }
    }
    for (const card of Object.values(cards)) {
        const explicit = card.reprintOf;
        if (explicit && cards[explicit]) {
            const sourceKind = cardIdentityKey(card).split("|")[1];
            const targetKind = cardIdentityKey(cards[explicit]).split("|")[1];
            if (sourceKind === targetKind) {
                map.set(card.cardNo, explicit);
            }
        }
    }
    return map;
}
function mergePrintingWithGameplay(printing, gameplay, handOverlay) {
    const overlay = handOverlay || {};
    const printingKind = cardIdentityKey(printing).split("|")[1];
    const gameplayKind = cardIdentityKey(gameplay).split("|")[1];
    const useGameplay = printingKind === gameplayKind &&
        (!printing.cardText || cardRichness(printing) + 5 < cardRichness(gameplay));
    const merged = {
        ...printing,
        ...(useGameplay
            ? {
                cardType: printing.cardType || gameplay.cardType,
                specialType: printing.printingType === "base"
                    ? printing.specialType
                    : printing.specialType || gameplay.specialType,
                cost: printing.cost != null && printing.cost > 0 ? printing.cost : gameplay.cost,
                attack: printing.attack != null ? printing.attack : gameplay.attack,
                defense: printing.defense != null ? printing.defense : gameplay.defense,
                traits: printing.traits?.length ? printing.traits : gameplay.traits,
                keywords: printing.keywords?.length ? printing.keywords : gameplay.keywords,
                cardText: printing.cardText || gameplay.cardText,
                evolvesFrom: printing.evolvesFrom || gameplay.evolvesFrom,
                evolvesTo: printing.evolvesTo || gameplay.evolvesTo,
                abilities: printing.abilities?.length ? printing.abilities : gameplay.abilities,
            }
            : {}),
        cardNo: printing.cardNo,
        name: printing.name,
        class: printing.class || gameplay.class,
        ...overlay,
        abilities: overlay.abilities?.length
            ? overlay.abilities
            : printing.abilities?.length
                ? printing.abilities
                : useGameplay
                    ? gameplay.abilities
                    : printing.abilities,
        keywords: overlay.keywords?.length
            ? overlay.keywords
            : printing.keywords?.length
                ? printing.keywords
                : gameplay.keywords,
    };
    if (overlay.cost != null && overlay.cost > 0)
        merged.cost = overlay.cost;
    if (overlay.attack != null)
        merged.attack = overlay.attack;
    if (overlay.defense != null)
        merged.defense = overlay.defense;
    if (overlay.printingType)
        merged.printingType = overlay.printingType;
    return merged;
}
