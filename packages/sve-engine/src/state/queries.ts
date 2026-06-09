import { getCardDef, getGameplayCardNo } from "../cards/registry";
import { cardIdentityKey } from "../cards/reprints";
import { cardMatchesFilter, evalCondition } from "./conditions";
import {
  getAuraKeywords,
  getMaxDamagePerHit,
  getPassiveKeywords,
  isBoxed,
} from "./passives";
import { canAdvanceActivate, isAdvanceAbility } from "../rules/effect-utils";
import { AbilityDefinition, CardInstance, GameState, Keyword, PlayerId } from "../types";

export function getPlayer(state: GameState, player: PlayerId) {
  return state.players[player];
}

export function findInstance(state: GameState, instanceId: string): { card: CardInstance; player: PlayerId; zone: string } | null {
  for (const pid of [0, 1] as PlayerId[]) {
    const zones = state.players[pid].zones;
    for (const [zoneName, cards] of Object.entries(zones)) {
      if (zoneName === "evolveZone") continue;
      const list = cards as CardInstance[];
      const card = list.find((c) => c.instanceId === instanceId);
      if (card) return { card, player: pid, zone: zoneName };
    }
  }
  return null;
}

/** Base printing to use for play cost / unevolved stats (evolved printings in hand count as base). */
export function getBaseCardNoForInstance(cardNo: string, linkedEvoInstanceId?: string): string {
  if (linkedEvoInstanceId) return cardNo;
  const def = getCardDef(cardNo);
  if (!def) return cardNo;
  if (def.evolvesTo) return cardNo;
  const kind = cardIdentityKey(def).split("|")[1];
  if (kind === "evolved" && def.evolvesFrom) return def.evolvesFrom;
  return cardNo;
}

function parseEvolveCostFromText(cardText: string): number | null {
  const match = cardText.match(/\[evolve\]\s*\[cost(\d+)\]/i);
  if (match) return Number(match[1]);
  return null;
}

export function computeEvolvePayment(
  cost: number,
  pp: number,
  evoPoints: number,
  useEvoPoint: boolean,
): { ok: boolean; ppCost: number; epCost: number } {
  if (cost <= 0) return { ok: true, ppCost: 0, epCost: 0 };
  if (!useEvoPoint) {
    return { ok: pp >= cost, ppCost: cost, epCost: 0 };
  }
  const epCost = Math.min(1, evoPoints, cost);
  if (epCost <= 0) return { ok: false, ppCost: cost, epCost: 0 };
  const ppCost = cost - epCost;
  return { ok: pp >= ppCost, ppCost, epCost };
}

export function canSuperEvolveNow(state: GameState, player: PlayerId): boolean {
  const p = state.players[player];
  if (p.superEvoPoints <= 0) return false;
  const threshold = player === state.firstPlayer ? 7 : 6;
  return p.turnsPassed >= threshold;
}

/** When evolved, the evolve card's definition applies for stats/keywords/abilities. */
export function resolveCardNo(state: GameState | undefined, card: CardInstance): string {
  if (state && card.linkedEvoInstanceId) {
    const evo = findInstance(state, card.linkedEvoInstanceId);
    if (evo) return evo.card.cardNo;
  }
  const def = getCardDef(card.cardNo);
  if (def?.evolvesFrom && !def.evolvesTo) {
    return card.cardNo;
  }
  return getBaseCardNoForInstance(card.cardNo, card.linkedEvoInstanceId);
}

export { isBoxed } from "./passives";

/** Printed play cost; evolved promos with cost 0 inherit from their base form. */
export function resolveCardDefCost(cardNo: string): number {
  const def = getCardDef(cardNo);
  if (!def) return 0;
  if (def.cost > 0) return def.cost;
  if (def.evolvesFrom) {
    const from = getCardDef(def.evolvesFrom);
    if (from && from.cost > 0) return from.cost;
  }
  return def.cost;
}

export function getExAreaPlayCostReduction(
  state: GameState,
  player: PlayerId,
  cardNo: string,
): number {
  const def = getCardDef(cardNo);
  let reduction = 0;
  for (const ability of def?.abilities ?? []) {
    if (ability.timing !== "passive") continue;
    if (ability.condition && !evalCondition(state, player, ability.condition)) continue;
    if (ability.effect.op === "exAreaPlayCostReduction") {
      reduction += ability.effect.amount;
    }
  }
  return reduction;
}

export function getPassivePlayCostReduction(
  state: GameState,
  player: PlayerId,
  cardNo: string,
): number {
  const def = getCardDef(cardNo);
  let reduction = 0;
  for (const ability of def?.abilities ?? []) {
    if (ability.timing !== "passive") continue;
    if (ability.condition && !evalCondition(state, player, ability.condition)) continue;
    if (ability.effect.op === "playCostReduction") {
      reduction += ability.effect.amount;
    }
  }
  return reduction;
}

export function getEffectivePlayCost(
  card: CardInstance,
  cardNo: string,
  state?: GameState,
  player?: PlayerId,
  fromZone?: string,
): number {
  const playNo = getBaseCardNoForInstance(cardNo, card.linkedEvoInstanceId);
  let base = resolveCardDefCost(playNo);
  if (state && player != null) {
    base = Math.max(0, base - getPassivePlayCostReduction(state, player, playNo));
    if (fromZone === "exArea") {
      base = Math.max(0, base - getExAreaPlayCostReduction(state, player, cardNo));
    }
  }
  const instanceReduction =
    (card.playCostReduction ?? 0) + (card.persistentPlayCostReduction ?? 0);
  return Math.max(0, base - instanceReduction);
}

export function getEffectiveStats(card: CardInstance, state?: GameState) {
  const statsNo = state ? resolveCardNo(state, card) : getBaseCardNoForInstance(card.cardNo);
  const cardDef = getCardDef(statsNo);
  let atk = cardDef?.attack ?? 0;
  let def = cardDef?.defense ?? 0;
  for (const m of card.modifiers) {
    atk += m.atk ?? 0;
    def += m.def ?? 0;
  }
  return { atk, def, cost: cardDef?.cost ?? 0 };
}

/** PP cost to evolve (separate from a card's play cost). */
export function getEvolveCost(evoCardNo: string, baseCardNo?: string): number {
  const base = baseCardNo ? getCardDef(getBaseCardNoForInstance(baseCardNo)) : null;
  if (base?.evolveCost != null) return base.evolveCost;
  const parsed = base?.cardText ? parseEvolveCostFromText(base.cardText) : null;
  if (parsed != null) return parsed;
  return 2;
}

export function hasKeyword(
  card: CardInstance,
  keyword: Keyword,
  state?: GameState,
  player?: PlayerId,
): boolean {
  if (state && isBoxed(card, state)) return false;
  if (card.grantedKeywords?.includes(keyword)) return true;
  const def = getCardDef(resolveCardNo(state, card));
  if (def?.keywords.includes(keyword)) {
    // Aura and intimidate apply only while the follower is reserved (not engaged).
    if (keyword === "aura" || keyword === "intimidate") {
      return !card.engaged;
    }
    return true;
  }
  if (state) {
    const pid = player ?? card.controller;
    if (getPassiveKeywords(state, card, pid).includes(keyword)) return true;
    if (getAuraKeywords(state, card, pid).includes(keyword)) return true;
  }
  // Evolved followers gain Rush for the turn they are evolved.
  if (keyword === "rush" && card.evolvedThisTurn) return true;
  return false;
}

export function clampDamageToFollower(
  state: GameState,
  card: CardInstance,
  player: PlayerId,
  amount: number,
): number {
  const cap = state ? getMaxDamagePerHit(state, card, player) : null;
  if (cap != null && amount > cap) return cap;
  return amount;
}

export function canEvolveFollower(state: GameState, player: PlayerId, fieldInstanceId: string): boolean {
  const fieldFound = findInstance(state, fieldInstanceId);
  if (!fieldFound || fieldFound.zone !== "field" || fieldFound.player !== player) return false;
  if (getPlayer(state, player).flags.evolvedThisTurn) return false;
  if (fieldFound.card.linkedEvoInstanceId) return false;
  if (isBoxed(fieldFound.card, state)) return false;
  if (!findMatchingEvolveCard(state, player, fieldInstanceId)) return false;
  const baseNo = getBaseCardNoForInstance(
    fieldFound.card.cardNo,
    fieldFound.card.linkedEvoInstanceId,
  );
  const def = getCardDef(baseNo);
  const evolveRules = (def?.abilities ?? []).filter((a) => a.timing === "evolve");
  return evolveRules.every((a) => !a.condition || evalCondition(state, player, a.condition));
}

export function getActivatedAbilities(
  state: GameState,
  card: CardInstance,
  player: PlayerId,
  zone: "field" | "cemetery" | "exArea",
): { ability: AbilityDefinition; key: string }[] {
  if (zone === "field" && isBoxed(card, state)) return [];
  const def = getCardDef(resolveCardNo(state, card));
  const results: { ability: AbilityDefinition; key: string }[] = [];
  for (const [idx, a] of (def?.abilities ?? []).entries()) {
    if (a.timing !== "activated") continue;
    const from = a.activateFrom ?? "field";
    if (from !== zone) continue;
    const key = `activated:${idx}`;
    if (a.oncePerTurn && card.abilitiesActivatedThisTurn.includes(key)) continue;
    if (a.condition && !evalCondition(state, player, a.condition)) continue;
    if (isAdvanceAbility(def, a) && getPlayer(state, player).flags.evolvedThisTurn) continue;
    if (isAdvanceAbility(def, a) && !canAdvanceActivate(state, player, a.effect)) continue;
    const ppCost = a.cost?.pp ?? 0;
    const p = getPlayer(state, player);
    const canPayPp = computeEvolvePayment(ppCost, p.pp, p.evoPoints, false).ok;
    const canPayEp = computeEvolvePayment(ppCost, p.pp, p.evoPoints, true).ok;
    if (!canPayPp && !canPayEp) continue;
    if (a.cost?.banishFromCemetery) {
      const need = a.cost.banishCount ?? 1;
      const have = getPlayer(state, player).zones.cemetery.filter((c) =>
        cardMatchesFilter(c.cardNo, a.cost!.banishFromCemetery!),
      ).length;
      if (have < need) continue;
    }
    if (a.cost?.banishFromExArea) {
      const need = a.cost.banishCount ?? 1;
      const have = getPlayer(state, player).zones.exArea.filter((c) =>
        cardMatchesFilter(c.cardNo, a.cost!.banishFromExArea!),
      ).length;
      if (have < need) continue;
    }
    if (a.cost?.buryFromField) {
      const need = a.cost.buryFieldCount ?? 1;
      const have = getPlayer(state, player).zones.field.filter((c) =>
        cardMatchesFilter(c.cardNo, a.cost!.buryFromField!),
      ).length;
      if (have < need) continue;
    }
    if (zone === "field" && a.cost?.engage && card.engaged) continue;
    results.push({ ability: a, key });
  }
  return results;
}

export function evolveCardsMatch(fieldCardNo: string, evoCardNo: string): boolean {
  const baseDef = getCardDef(fieldCardNo);
  const evoDef = getCardDef(evoCardNo);
  if (baseDef?.evolvesTo === evoCardNo) return true;
  if (evoDef?.evolvesFrom === fieldCardNo) return true;
  if (baseDef?.evolvesTo && getGameplayCardNo(evoCardNo) === getGameplayCardNo(baseDef.evolvesTo)) {
    return true;
  }
  if (evoDef?.evolvesFrom && getGameplayCardNo(fieldCardNo) === getGameplayCardNo(evoDef.evolvesFrom)) {
    return true;
  }
  return false;
}

export function findMatchingEvolveCard(
  state: GameState,
  player: PlayerId,
  fieldInstanceId: string,
): CardInstance | null {
  const fieldFound = findInstance(state, fieldInstanceId);
  if (!fieldFound || fieldFound.zone !== "field") return null;
  if (fieldFound.card.linkedEvoInstanceId) return null;
  return (
    state.players[player].zones.evolveDeck.find((evo) =>
      evolveCardsMatch(fieldFound.card.cardNo, evo.cardNo),
    ) ?? null
  );
}

export function getStrikeAbilities(state: GameState, card: CardInstance) {
  if (isBoxed(card, state)) return [];
  const def = getCardDef(resolveCardNo(state, card));
  return def?.abilities?.filter((a) => a.timing === "strike") ?? [];
}

export function opponentOf(player: PlayerId): PlayerId {
  return player === 0 ? 1 : 0;
}

export function isOverflowActive(state: GameState, player: PlayerId): boolean {
  return state.players[player].maxPp >= 7;
}

export function canAttackLeader(state: GameState, attacker: CardInstance, player: PlayerId): boolean {
  if (attacker.onFieldSinceTurnStart) return true;
  if (hasKeyword(attacker, "storm", state)) return true;
  return false;
}

export function getWardTargets(state: GameState, defender: PlayerId): CardInstance[] {
  return state.players[defender].zones.field.filter(
    (c) => hasKeyword(c, "ward", state) && c.engaged,
  );
}

export function getLegalAttackTargets(
  state: GameState,
  attacker: CardInstance,
  player: PlayerId,
): Array<{ type: "leader"; player: PlayerId } | { type: "follower"; instanceId: string }> {
  const enemy = opponentOf(player);
  const targets: Array<{ type: "leader"; player: PlayerId } | { type: "follower"; instanceId: string }> = [];
  const wards = getWardTargets(state, enemy);

  if (wards.length > 0) {
    for (const w of wards) {
      if (!hasKeyword(w, "intimidate", state)) {
        targets.push({ type: "follower", instanceId: w.instanceId });
      }
    }
    return targets;
  }

  for (const f of state.players[enemy].zones.field) {
    if (hasKeyword(f, "intimidate", state)) continue;
    // Reserved (not engaged) followers require Assail to be attacked.
    if (!f.engaged && !hasKeyword(attacker, "assail", state)) continue;
    targets.push({ type: "follower", instanceId: f.instanceId });
  }

  if (canAttackLeader(state, attacker, player)) {
    targets.push({ type: "leader", player: enemy });
  }

  return targets;
}
