import * as fs from "fs";
import * as path from "path";
import { CardDefinition } from "../types";
import { MVP_CARD_DEFS } from "./mvp-cards";
import { buildReprintMap, mergePrintingWithGameplay } from "./reprints";

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
  const handForPrinting = handAuthored[cardNo];
  const handForGameplay = gameplayNo !== cardNo ? handAuthored[gameplayNo] : undefined;
  const handOverlay = {
    ...(handForGameplay || {}),
    ...(handForPrinting || {}),
    abilities: handForPrinting?.abilities || handForGameplay?.abilities,
    keywords: handForPrinting?.keywords || handForGameplay?.keywords,
    evolvesFrom: handForPrinting?.evolvesFrom || handForGameplay?.evolvesFrom,
    evolvesTo: handForPrinting?.evolvesTo || handForGameplay?.evolvesTo,
  };
  registerCardDef(
    cardNo,
    mergePrintingWithGameplay(printing, gameplaySource, handOverlay as Partial<CardDefinition>),
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
  if (!base) continue;
  registerCardDef(cardNo, mergePrintingWithGameplay({ ...base, cardNo, name: base.name }, base, overlay));
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
      return mergePrintingWithGameplay(stub, gameplay, handAuthored[cardNo] || handAuthored[gameplayNo]);
    }
  }

  if (OFFICIAL_CARD_NO.test(cardNo)) return genericStub(cardNo);
  return undefined;
}

export function getGameplayCardNo(cardNo: string): string {
  return reprintMap.get(cardNo) ?? cardNo;
}

export function getAllCardDefs(): CardDefinition[] {
  return [...registry.values()];
}

export function registerCard(def: CardDefinition): void {
  registerCardDef(def.cardNo, def);
}

export function getCardByName(name: string): CardDefinition | undefined {
  return [...registry.values()].find((c) => c.name === name);
}
