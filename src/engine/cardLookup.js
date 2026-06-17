import mvpCards from "./mvp-cards.json";
import cardStats from "./card-stats.json";
import { allCards } from "../decks/AllCards";
import { allCardsEvo } from "../decks/AllCardsEvo";
import { getCardNoFromName } from "../decks/getCards";

const byCardNo = new Map();
const byName = new Map();
let fullIndexBuilt = false;

function register(card) {
  if (!card?.cardNo) return;
  byCardNo.set(card.cardNo, card);
  if (card.name) byName.set(card.name, card);
}

for (const card of mvpCards) {
  register(card);
}

for (const [cardNo, stats] of Object.entries(cardStats)) {
  if (!stats) continue;
  register({
    cardNo,
    name: stats.name || cardNo,
    cost: stats.cost,
    attack: stats.attack,
    defense: stats.defense,
    keywords: stats.keywords,
    cardType: stats.cardType,
    reprintOf: stats.reprintOf,
  });
}

function resolveGameplayCardNo(cardNo) {
  const direct = cardStats[cardNo];
  if (direct?.reprintOf && cardStats[direct.reprintOf]) {
    return direct.reprintOf;
  }
  return cardNo;
}

function ensureNameRegistered(name) {
  if (!name || byName.has(name)) return;
  const cardNo = getCardNoFromName(name);
  if (cardNo) register({ cardNo, name });
}

function ensureFullIndex() {
  if (fullIndexBuilt) return;
  fullIndexBuilt = true;
  for (const name of new Set([...allCards, ...allCardsEvo])) {
    ensureNameRegistered(name);
  }
}

function mergeStats(cardNo, card) {
  const gameplayNo = resolveGameplayCardNo(cardNo);
  const stats = cardStats[cardNo] || cardStats[gameplayNo];
  if (!stats) return card;
  const gameplayStats = gameplayNo !== cardNo ? cardStats[gameplayNo] : null;
  return {
    ...card,
    name: card.name || stats.name || gameplayStats?.name || cardNo,
    cost: stats.cost ?? gameplayStats?.cost ?? card.cost,
    attack: stats.attack ?? gameplayStats?.attack ?? card.attack,
    defense: stats.defense ?? gameplayStats?.defense ?? card.defense,
    keywords: stats.keywords?.length
      ? stats.keywords
      : gameplayStats?.keywords?.length
        ? gameplayStats.keywords
        : card.keywords,
    cardType: stats.cardType ?? gameplayStats?.cardType ?? card.cardType,
  };
}

export function getCardDefClient(cardNo) {
  const existing = byCardNo.get(cardNo);
  if (existing) return mergeStats(cardNo, existing);
  const gameplayNo = resolveGameplayCardNo(cardNo);
  const gameplay = byCardNo.get(gameplayNo);
  if (gameplay) {
    return mergeStats(cardNo, { ...gameplay, cardNo, name: cardStats[cardNo]?.name || gameplay.name });
  }
  const stats = cardStats[cardNo] || cardStats[gameplayNo];
  if (!stats) return undefined;
  const name = stats.name || getNameByCardNoClient(cardNo) || cardNo;
  return mergeStats(cardNo, { cardNo, name, ...stats });
}

function statValue(...values) {
  for (const v of values) {
    if (v != null && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
}

export function getCardStatsClient(cardNo) {
  const def = getCardDefClient(cardNo);
  const gameplayNo = resolveGameplayCardNo(cardNo);
  const stats = cardStats[cardNo] || cardStats[gameplayNo] || {};
  return {
    attack: statValue(def?.attack, stats.attack),
    defense: statValue(def?.defense, stats.defense),
    keywords: def?.keywords ?? stats.keywords ?? [],
  };
}

export function getCardByNameClient(name) {
  ensureNameRegistered(name);
  return byName.get(name);
}

export function getNameByCardNoClient(cardNo) {
  if (byCardNo.has(cardNo)) return byCardNo.get(cardNo).name;
  if (cardStats[cardNo]?.name) return cardStats[cardNo].name;
  const gameplayNo = resolveGameplayCardNo(cardNo);
  if (gameplayNo !== cardNo && cardStats[gameplayNo]?.name) {
    return cardStats[gameplayNo].name;
  }
  ensureFullIndex();
  return byCardNo.get(cardNo)?.name ?? null;
}
