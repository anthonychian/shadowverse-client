"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardDef = getCardDef;
exports.getGameplayCardNo = getGameplayCardNo;
exports.resolveCardNoByIdentity = resolveCardNoByIdentity;
exports.getAllCardDefs = getAllCardDefs;
exports.registerCard = registerCard;
exports.getCardByName = getCardByName;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mvp_cards_1 = require("./mvp-cards");
const reprints_1 = require("./reprints");
let scrapedCards = {};
const cardsPath = path.join(__dirname, "..", "..", "data", "cards.json");
const cardDefsDir = path.join(__dirname, "..", "..", "data", "card-defs");
if (fs.existsSync(cardsPath)) {
    scrapedCards = JSON.parse(fs.readFileSync(cardsPath, "utf8"));
}
const handAuthored = {};
if (fs.existsSync(cardDefsDir)) {
    for (const file of fs.readdirSync(cardDefsDir).filter((f) => f.endsWith(".json"))) {
        const chunk = JSON.parse(fs.readFileSync(path.join(cardDefsDir, file), "utf8"));
        Object.assign(handAuthored, chunk);
    }
}
const registry = new Map();
function toCardDef(raw) {
    return {
        cardNo: String(raw.cardNo),
        name: String(raw.name),
        class: String(raw.class || "neutral"),
        cardType: raw.cardType || "follower",
        printingType: raw.type,
        specialType: raw.type === "base" ? undefined : raw.specialType,
        cost: raw.cost != null ? Number(raw.cost) : 0,
        attack: raw.attack != null ? Number(raw.attack) : undefined,
        defense: raw.defense != null ? Number(raw.defense) : undefined,
        traits: raw.traits || [],
        keywords: raw.keywords || [],
        cardText: String(raw.cardText || ""),
        evolvesFrom: raw.evolvesFrom,
        evolvesTo: raw.evolvesTo,
        abilities: raw.abilities,
    };
}
const reprintMap = (0, reprints_1.buildReprintMap)(scrapedCards);
function identityKeyForHandEntry(cardNo, overlay) {
    const raw = scrapedCards[cardNo];
    const name = String(overlay.name ?? raw?.name ?? cardNo);
    return (0, reprints_1.cardIdentityKey)({
        name,
        printingType: overlay.printingType ?? raw?.printingType ?? raw?.type,
        specialType: overlay.specialType ?? raw?.specialType,
        type: overlay.printingType ?? raw?.type,
    });
}
const handAuthoredByIdentity = new Map();
for (const [cardNo, overlay] of Object.entries(handAuthored)) {
    const key = identityKeyForHandEntry(cardNo, overlay);
    const prev = handAuthoredByIdentity.get(key);
    handAuthoredByIdentity.set(key, (0, reprints_1.mergeSharedHandOverlays)(prev, (0, reprints_1.pickSharedHandOverlay)(overlay)));
}
function handOverlayForPrinting(cardNo, printing) {
    const handForPrinting = handAuthored[cardNo];
    const handByIdentity = handAuthoredByIdentity.get((0, reprints_1.cardIdentityKey)(printing));
    const shared = (0, reprints_1.mergeSharedHandOverlays)(handForPrinting, handByIdentity);
    return {
        ...shared,
        evolvesFrom: handForPrinting?.evolvesFrom ?? printing.evolvesFrom,
        evolvesTo: handForPrinting?.evolvesTo ?? printing.evolvesTo,
    };
}
function registerCardDef(cardNo, def) {
    registry.set(cardNo, def);
}
for (const raw of Object.values(scrapedCards)) {
    const cardNo = String(raw.cardNo);
    const printing = toCardDef(raw);
    const gameplayNo = reprintMap.get(cardNo) ?? cardNo;
    const gameplaySource = gameplayNo !== cardNo && scrapedCards[gameplayNo]
        ? toCardDef(scrapedCards[gameplayNo])
        : printing;
    registerCardDef(cardNo, (0, reprints_1.mergePrintingWithGameplay)(printing, gameplaySource, handOverlayForPrinting(cardNo, printing)));
}
for (const def of mvp_cards_1.MVP_CARD_DEFS) {
    const extra = handAuthored[def.cardNo] || {};
    registerCardDef(def.cardNo, { ...def, ...extra, abilities: extra.abilities || def.abilities });
}
for (const [cardNo, overlay] of Object.entries(handAuthored)) {
    if (registry.has(cardNo))
        continue;
    const gameplayNo = reprintMap.get(cardNo) ?? cardNo;
    const base = registry.get(gameplayNo);
    if (base) {
        const stub = { ...base, cardNo, name: base.name };
        registerCardDef(cardNo, (0, reprints_1.mergePrintingWithGameplay)(stub, base, handOverlayForPrinting(cardNo, stub)));
        continue;
    }
    const stub = genericStub(cardNo);
    const shared = (0, reprints_1.mergeSharedHandOverlays)(handAuthoredByIdentity.get(identityKeyForHandEntry(cardNo, overlay)), (0, reprints_1.pickSharedHandOverlay)(overlay));
    registerCardDef(cardNo, (0, reprints_1.mergePrintingWithGameplay)(stub, stub, shared));
}
const OFFICIAL_CARD_NO = /^[A-Z0-9]+-[A-Z0-9]+EN$/i;
function genericStub(cardNo) {
    const raw = scrapedCards[cardNo];
    const scrapedName = raw?.name != null ? String(raw.name) : cardNo;
    const isEvolved = scrapedName.includes("Evolved") || String(raw?.type || "") === "evolved";
    const rawType = String(raw?.cardType || raw?.type || "");
    const cardType = rawType === "spell" || rawType === "amulet" ? rawType : "follower";
    return {
        cardNo,
        name: scrapedName,
        class: String(raw?.class || "neutral"),
        cardType,
        cost: raw?.cost != null ? Number(raw.cost) : isEvolved ? 0 : 2,
        attack: raw?.attack != null ? Number(raw.attack) : isEvolved ? 3 : 2,
        defense: raw?.defense != null ? Number(raw.defense) : isEvolved ? 3 : 2,
        traits: raw?.traits || [],
        keywords: raw?.keywords || [],
        cardText: String(raw?.cardText || ""),
    };
}
function getCardDef(cardNo) {
    const existing = registry.get(cardNo);
    if (existing)
        return existing;
    const gameplayNo = reprintMap.get(cardNo);
    if (gameplayNo && gameplayNo !== cardNo) {
        const gameplay = registry.get(gameplayNo);
        if (gameplay) {
            const stub = genericStub(cardNo);
            const overlay = handOverlayForPrinting(cardNo, stub);
            return (0, reprints_1.mergePrintingWithGameplay)(stub, gameplay, overlay);
        }
    }
    if (OFFICIAL_CARD_NO.test(cardNo))
        return genericStub(cardNo);
    return undefined;
}
function getGameplayCardNo(cardNo) {
    return reprintMap.get(cardNo) ?? cardNo;
}
/** Resolve any printing of a card or token by normalized identity name. */
function resolveCardNoByIdentity(identityName) {
    const target = (0, reprints_1.normalizeIdentityName)(identityName).toLowerCase();
    const candidates = [];
    for (const raw of Object.values(scrapedCards)) {
        const card = raw;
        if ((0, reprints_1.normalizeIdentityName)(card.name).toLowerCase() === target) {
            candidates.push(card);
        }
    }
    if (candidates.length === 0)
        return undefined;
    return (0, reprints_1.pickCanonicalInGroup)(candidates).cardNo;
}
function getAllCardDefs() {
    return [...registry.values()];
}
function registerCard(def) {
    registerCardDef(def.cardNo, def);
}
function getCardByName(name) {
    const cardNo = resolveCardNoByIdentity(name);
    return cardNo ? getCardDef(cardNo) : undefined;
}
