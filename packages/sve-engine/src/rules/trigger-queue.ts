import { getCardDef } from "../cards/registry";
import { describeAbility } from "./trigger-labels";
import { cardMatchesFilter } from "../state/conditions";
import { isBoxed } from "../state/passives";
import { findInstance, getPlayer, resolveCardNo } from "../state/queries";
import { matchesExAreaEntryFilter } from "../state/passives";
import { AbilityDefinition, GameState, PlayerId, TriggerTiming } from "../types";

function pushTrigger(
  state: GameState,
  instanceId: string,
  player: PlayerId,
  cardNo: string,
  ability: AbilityDefinition,
  timing: TriggerTiming,
  idPrefix: string,
  abilityKey?: string,
  forcedTargetId?: string,
): void {
  state.pendingTriggers.push({
    id: `${idPrefix}_${instanceId}_${state.pendingTriggers.length}`,
    controller: player,
    sourceInstanceId: instanceId,
    ability,
    timing,
    label: ability.label ?? describeAbility(cardNo, ability),
    abilityKey,
    forcedTargetId,
  });
}

function canFireOnCardPlayedTrigger(
  fieldCard: { abilitiesActivatedThisTurn: string[]; counters: Record<string, number> },
  key: string,
  opts: { oncePerTurn?: boolean; maxPerTurn?: number },
): boolean {
  if (opts.oncePerTurn && fieldCard.abilitiesActivatedThisTurn.includes(key)) return false;
  if (opts.maxPerTurn != null && (fieldCard.counters[key] ?? 0) >= opts.maxPerTurn) return false;
  return true;
}

export function queueOnCardPlayed(
  state: GameState,
  playedInstanceId: string,
  player: PlayerId,
): void {
  const played = findInstance(state, playedInstanceId);
  if (!played) return;
  const playedNo = resolveCardNo(state, played.card);

  for (const fieldCard of getPlayer(state, player).zones.field) {
    if (isBoxed(fieldCard, state)) continue;
    const cardNo = resolveCardNo(state, fieldCard);
    const def = getCardDef(cardNo);

    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
      if (ability.timing !== "onCardPlayed") continue;
      if (ability.filter && !cardMatchesFilter(playedNo, ability.filter)) continue;
      const key = `onCardPlayed:${idx}`;
      if (!canFireOnCardPlayedTrigger(fieldCard, key, ability)) continue;
      pushTrigger(state, fieldCard.instanceId, player, cardNo, ability, "onCardPlayed", "ocp", key);
    }

    for (const [gIdx, granted] of (fieldCard.grantedOnCardPlayed ?? []).entries()) {
      if (granted.filter && !cardMatchesFilter(playedNo, granted.filter)) continue;
      const key = `grantedOnCardPlayed:${gIdx}`;
      if (!canFireOnCardPlayedTrigger(fieldCard, key, granted)) continue;
      const pseudoAbility: AbilityDefinition = {
        timing: "onCardPlayed",
        effect: granted.effect,
        label: granted.label,
        oncePerTurn: granted.oncePerTurn,
        maxPerTurn: granted.maxPerTurn,
      };
      pushTrigger(
        state,
        fieldCard.instanceId,
        player,
        cardNo,
        pseudoAbility,
        "onCardPlayed",
        "gocp",
        key,
      );
    }
  }
}

export function queueLastWords(state: GameState, instanceId: string, player: PlayerId): void {
  const found = findInstance(state, instanceId);
  if (!found) return;
  if (isBoxed(found.card, state)) return;
  const cardNo = found.card.cardNo;
  const def = getCardDef(cardNo);
  for (const ability of def?.abilities ?? []) {
    if (ability.timing === "lastWords") {
      pushTrigger(state, instanceId, player, cardNo, ability, "lastWords", "lw");
    }
  }
  for (const effect of found.card.grantedLastWords ?? []) {
    pushTrigger(
      state,
      instanceId,
      player,
      cardNo,
      {
        timing: "lastWords",
        effect,
        label: `${getCardDef(cardNo)?.name ?? cardNo} — Last Words: banish this card`,
      },
      "lastWords",
      "glw",
    );
  }
}

export function queueFanfare(state: GameState, instanceId: string, player: PlayerId): void {
  const found = findInstance(state, instanceId);
  if (!found || isBoxed(found.card, state)) return;
  const def = getCardDef(found.card.cardNo);
  for (const ability of def?.abilities ?? []) {
    if (ability.timing === "fanfare") {
      pushTrigger(state, instanceId, player, found.card.cardNo, ability, "fanfare", "ff");
    }
  }
}

export function queueStartOfEndAbilities(state: GameState, player: PlayerId): void {
  for (const card of [...getPlayer(state, player).zones.field]) {
    if (isBoxed(card, state)) continue;
    const def = getCardDef(resolveCardNo(state, card));
    for (const ability of def?.abilities ?? []) {
      if (ability.timing !== "startOfEnd") continue;
      pushTrigger(state, card.instanceId, player, card.cardNo, ability, "startOfEnd", "soe");
    }
  }
}

export function queueAllyFollowerEnterTriggers(
  state: GameState,
  enteredInstanceId: string,
  player: PlayerId,
): void {
  const entered = findInstance(state, enteredInstanceId);
  if (!entered || entered.zone !== "field") return;
  const enteredNo = resolveCardNo(state, entered.card);
  for (const fieldCard of getPlayer(state, player).zones.field) {
    if (fieldCard.instanceId === enteredInstanceId || isBoxed(fieldCard, state)) continue;
    const def = getCardDef(resolveCardNo(state, fieldCard));
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
      if (ability.timing !== "onAllyFollowerEnter") continue;
      if (ability.activateFrom === "cemetery") continue;
      if (ability.filter && !cardMatchesFilter(enteredNo, ability.filter)) continue;
      pushTrigger(
        state,
        fieldCard.instanceId,
        player,
        fieldCard.cardNo,
        ability,
        "onAllyFollowerEnter",
        "afe",
        `afe:${idx}`,
        enteredInstanceId,
      );
    }
  }
}

/** Cemetery cards that react when an ally follower enters (e.g. Delta Cannon + Tetra). */
export function queueCemeteryOnAllyFollowerEnter(
  state: GameState,
  enteredInstanceId: string,
  player: PlayerId,
): void {
  const entered = findInstance(state, enteredInstanceId);
  if (!entered || entered.zone !== "field") return;
  const enteredNo = resolveCardNo(state, entered.card);
  const enteredDef = getCardDef(enteredNo);
  if (enteredDef?.cardType !== "follower") return;

  for (const cemCard of getPlayer(state, player).zones.cemetery) {
    const cardNo = resolveCardNo(state, cemCard);
    const def = getCardDef(cardNo);
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
      if (ability.timing !== "onAllyFollowerEnter") continue;
      if (ability.activateFrom !== "cemetery") continue;
      if (ability.filter && !cardMatchesFilter(enteredNo, ability.filter)) continue;
      pushTrigger(
        state,
        cemCard.instanceId,
        player,
        cardNo,
        ability,
        "onAllyFollowerEnter",
        "cafe",
        `cafe:${idx}`,
        enteredInstanceId,
      );
    }
  }
}

export function onCardEntersExAreaTriggers(
  state: GameState,
  instanceId: string,
  player: PlayerId,
): void {
  const entered = findInstance(state, instanceId);
  if (!entered || entered.zone !== "exArea") return;
  const enteredNo = resolveCardNo(state, entered.card);
  for (const fieldCard of getPlayer(state, player).zones.field) {
    if (isBoxed(fieldCard, state)) continue;
    const def = getCardDef(resolveCardNo(state, fieldCard));
    for (const ability of def?.abilities ?? []) {
      if (!matchesExAreaEntryFilter(ability, enteredNo)) continue;
      pushTrigger(
        state,
        fieldCard.instanceId,
        player,
        fieldCard.cardNo,
        ability,
        "onExAreaEntry",
        `ex_${instanceId}`,
      );
    }
  }
}
