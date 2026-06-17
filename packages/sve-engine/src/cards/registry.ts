import * as fs from "fs";
import * as path from "path";
import { CardDefinition } from "../types";
import { MVP_CARD_DEFS } from "./mvp-cards";
import {
  buildReprintMap,
  cardIdentityKey,
  mergePrintingWithGameplay,
  mergeSharedHandOverlays,
  normalizeIdentityName,
  pickCanonicalInGroup,
  pickSharedHandOverlay,
} from "./reprints";

let scrapedCards: Record<string, CardDefinition> = {};
const cardsPath = path.join(__dirname, "..", "..", "data", "cards.json");
const cardDefsDir = path.join(__dirname, "..", "..", "data", "card-defs");
if (fs.existsSync(cardsPath)) {
  scrapedCards = JSON.parse(fs.readFileSync(cardsPath, "utf8"));
}
const handAuthored: Record<string, Partial<CardDefinition>> = {};
if (fs.existsSync(cardDefsDir)) {
  for (const file of fs.readdirSync(cardDefsDir).filter((f) => f.endsWith(".json"))) {
    const chunk = JSON.parse(fs.readFileSync(path.join(cardDefsDir, file), "utf8"));
    Object.assign(handAuthored, chunk);
  }
}

const registry = new Map<string, CardDefinition>();

function toCardDef(raw: Record<string, unknown>): CardDefinition {
  return {
    cardNo: String(raw.cardNo),
    name: String(raw.name),
    class: String(raw.class || "neutral"),
    cardType: (raw.cardType as CardDefinition["cardType"]) || "follower",
    printingType: raw.type as CardDefinition["printingType"],
    specialType:
      raw.type === "base" ? undefined : (raw.specialType as CardDefinition["specialType"]),
    cost: raw.cost != null ? Number(raw.cost) : 0,
    attack: raw.attack != null ? Number(raw.attack) : undefined,
    defense: raw.defense != null ? Number(raw.defense) : undefined,
    traits: (raw.traits as string[]) || [],
    keywords: (raw.keywords as CardDefinition["keywords"]) || [],
    cardText: String(raw.cardText || ""),
    evolvesFrom: raw.evolvesFrom as string | undefined,
    evolvesTo: raw.evolvesTo as string | undefined,
    abilities: raw.abilities as CardDefinition["abilities"],
  };
}

const reprintMap = buildReprintMap(scrapedCards as Record<string, CardDefinition>);

function identityKeyForHandEntry(cardNo: string, overlay: Partial<CardDefinition>): string {
  const raw = scrapedCards[cardNo] as CardDefinition | undefined;
  const name = String(overlay.name ?? raw?.name ?? cardNo);
  return cardIdentityKey({
    name,
    printingType: overlay.printingType ?? raw?.printingType ?? (raw as { type?: string })?.type,
    specialType: overlay.specialType ?? raw?.specialType,
    type: overlay.printingType ?? (raw as { type?: string })?.type,
  });
}

const handAuthoredByIdentity = new Map<string, Partial<CardDefinition>>();
for (const [cardNo, overlay] of Object.entries(handAuthored)) {
  const key = identityKeyForHandEntry(cardNo, overlay);
  const prev = handAuthoredByIdentity.get(key);
  handAuthoredByIdentity.set(
    key,
    mergeSharedHandOverlays(prev, pickSharedHandOverlay(overlay)),
  );
}

function handOverlayForPrinting(
  cardNo: string,
  printing: CardDefinition,
): Partial<CardDefinition> {
  const handForPrinting = handAuthored[cardNo];
  const handByIdentity = handAuthoredByIdentity.get(cardIdentityKey(printing));
  const shared = mergeSharedHandOverlays(handForPrinting, handByIdentity);
  return {
    ...shared,
    evolvesFrom: handForPrinting?.evolvesFrom ?? printing.evolvesFrom,
    evolvesTo: handForPrinting?.evolvesTo ?? printing.evolvesTo,
  };
}

function registerCardDef(cardNo: string, def: CardDefinition): void {
  registry.set(cardNo, def);
}

for (const raw of Object.values(scrapedCards)) {
  const cardNo = String((raw as CardDefinition).cardNo);
  const printing = toCardDef(raw as unknown as Record<string, unknown>);
  const gameplayNo = reprintMap.get(cardNo) ?? cardNo;
  const gameplaySource =
    gameplayNo !== cardNo && scrapedCards[gameplayNo]
      ? toCardDef(scrapedCards[gameplayNo] as unknown as Record<string, unknown>)
      : printing;
  registerCardDef(
    cardNo,
    mergePrintingWithGameplay(
      printing,
      gameplaySource,
      handOverlayForPrinting(cardNo, printing) as Partial<CardDefinition>,
    ),
  );
}

for (const def of MVP_CARD_DEFS) {
  const extra = handAuthored[def.cardNo] || {};
  registerCardDef(def.cardNo, { ...def, ...extra, abilities: extra.abilities || def.abilities });
}

for (const [cardNo, overlay] of Object.entries(handAuthored)) {
  if (registry.has(cardNo)) continue;
  const gameplayNo = reprintMap.get(cardNo) ?? cardNo;
  const base = registry.get(gameplayNo);
  if (base) {
    const stub = { ...base, cardNo, name: base.name };
    registerCardDef(
      cardNo,
      mergePrintingWithGameplay(
        stub,
        base,
        handOverlayForPrinting(cardNo, stub) as Partial<CardDefinition>,
      ),
    );
    continue;
  }
  const stub = genericStub(cardNo);
  const shared = mergeSharedHandOverlays(
    handAuthoredByIdentity.get(identityKeyForHandEntry(cardNo, overlay)),
    pickSharedHandOverlay(overlay),
  );
  registerCardDef(cardNo, mergePrintingWithGameplay(stub, stub, shared as Partial<CardDefinition>));
}

const OFFICIAL_CARD_NO = /^[A-Z0-9]+-[A-Z0-9]+EN$/i;

function genericStub(cardNo: string): CardDefinition {
  const raw = scrapedCards[cardNo] as unknown as Record<string, unknown> | undefined;
  const scrapedName = raw?.name != null ? String(raw.name) : cardNo;
  const isEvolved =
    scrapedName.includes("Evolved") || String(raw?.type || "") === "evolved";
  const rawType = String(raw?.cardType || raw?.type || "");
  const cardType: CardDefinition["cardType"] =
    rawType === "spell" || rawType === "amulet" ? rawType : "follower";
  return {
    cardNo,
    name: scrapedName,
    class: String(raw?.class || "neutral"),
    cardType,
    cost: raw?.cost != null ? Number(raw.cost) : isEvolved ? 0 : 2,
    attack: raw?.attack != null ? Number(raw.attack) : isEvolved ? 3 : 2,
    defense: raw?.defense != null ? Number(raw.defense) : isEvolved ? 3 : 2,
    traits: (raw?.traits as string[]) || [],
    keywords: (raw?.keywords as CardDefinition["keywords"]) || [],
    cardText: String(raw?.cardText || ""),
  };
}

export function getCardDef(cardNo: string): CardDefinition | undefined {
  const existing = registry.get(cardNo);
  if (existing) return existing;

  const gameplayNo = reprintMap.get(cardNo);
  if (gameplayNo && gameplayNo !== cardNo) {
    const gameplay = registry.get(gameplayNo);
    if (gameplay) {
      const stub = genericStub(cardNo);
      const overlay = handOverlayForPrinting(cardNo, stub);
      return mergePrintingWithGameplay(stub, gameplay, overlay);
    }
  }

  if (OFFICIAL_CARD_NO.test(cardNo)) return genericStub(cardNo);
  return undefined;
}

export function getGameplayCardNo(cardNo: string): string {
  return reprintMap.get(cardNo) ?? cardNo;
}

/** Resolve any printing of a card or token by normalized identity name. */
export function resolveCardNoByIdentity(identityName: string): string | undefined {
  const target = normalizeIdentityName(identityName).toLowerCase();
  const candidates: CardDefinition[] = [];
  for (const raw of Object.values(scrapedCards)) {
    const card = raw as CardDefinition;
    if (normalizeIdentityName(card.name).toLowerCase() === target) {
      candidates.push(card);
    }
  }
  if (candidates.length === 0) return undefined;
  return pickCanonicalInGroup(candidates).cardNo;
}

export function getAllCardDefs(): CardDefinition[] {
  return [...registry.values()];
}

export function registerCard(def: CardDefinition): void {
  registerCardDef(def.cardNo, def);
}

export function getCardByName(name: string): CardDefinition | undefined {
  const cardNo = resolveCardNoByIdentity(name);
  return cardNo ? getCardDef(cardNo) : undefined;
}
