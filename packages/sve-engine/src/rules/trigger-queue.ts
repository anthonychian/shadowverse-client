import { getCardDef } from "../cards/registry";
import { describeAbility } from "./trigger-labels";
import { cardMatchesFilter, evalCondition } from "../state/conditions";
import { isBoxed } from "../state/passives";
import { findInstance, getPlayer, resolveCardDefCost, resolveCardNo } from "../state/queries";
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
  leftTokenCardNo?: string,
): void {
  const found = findInstance(state, instanceId);
  if (found?.card.abilitiesSilenced) return;
  state.pendingTriggers.push({
    id: `${idPrefix}_${instanceId}_${state.pendingTriggers.length}`,
    controller: player,
    sourceInstanceId: instanceId,
    ability,
    timing,
    label: ability.label ?? describeAbility(cardNo, ability),
    abilityKey,
    forcedTargetId,
    leftTokenCardNo,
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
      if (ability.timing === "onCardPlayed") {
        if (ability.filter && !cardMatchesFilter(playedNo, ability.filter)) continue;
        const key = `onCardPlayed:${idx}`;
        if (!canFireOnCardPlayedTrigger(fieldCard, key, ability)) continue;
        pushTrigger(state, fieldCard.instanceId, player, cardNo, ability, "onCardPlayed", "ocp", key);
        continue;
      }
      if (ability.timing === "passive" && ability.effect.op === "grantOnCardPlayed") {
        const grant = ability.effect;
        if (grant.filter && !cardMatchesFilter(playedNo, grant.filter)) continue;
        const key = `passiveGrantOnCardPlayed:${idx}`;
        if (!canFireOnCardPlayedTrigger(fieldCard, key, grant)) continue;
        if (ability.condition && !evalCondition(state, player, ability.condition)) continue;
        pushTrigger(
          state,
          fieldCard.instanceId,
          player,
          cardNo,
          {
            timing: "onCardPlayed",
            effect: grant.effect,
            label: grant.label,
            oncePerTurn: grant.oncePerTurn,
            maxPerTurn: grant.maxPerTurn,
          },
          "onCardPlayed",
          "pgocp",
          key,
        );
      }
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

export function queueStartOfMainAbilities(state: GameState, player: PlayerId): void {
  for (const card of [...getPlayer(state, player).zones.field]) {
    if (isBoxed(card, state)) continue;
    const def = getCardDef(resolveCardNo(state, card));
    for (const ability of def?.abilities ?? []) {
      if (ability.timing !== "startOfMain") continue;
      pushTrigger(state, card.instanceId, player, card.cardNo, ability, "startOfMain", "som");
    }
  }
}

export function queueStartOfOpponentEndAbilities(state: GameState, endingPlayer: PlayerId): void {
  for (const pid of [0, 1] as PlayerId[]) {
    if (pid === endingPlayer) continue;
    for (const card of [...getPlayer(state, pid).zones.field]) {
      if (isBoxed(card, state)) continue;
      const def = getCardDef(resolveCardNo(state, card));
      for (const ability of def?.abilities ?? []) {
        if (ability.timing !== "startOfOpponentEnd") continue;
        pushTrigger(state, card.instanceId, pid, card.cardNo, ability, "startOfOpponentEnd", "sooe");
      }
    }
  }
}

export function queueOnBecomeEngaged(state: GameState, instanceId: string, player: PlayerId): void {
  const engaged = findInstance(state, instanceId);
  if (!engaged || engaged.zone !== "field") return;
  for (const fieldCard of getPlayer(state, player).zones.field) {
    if (fieldCard.instanceId !== instanceId || isBoxed(fieldCard, state)) continue;
    const cardNo = resolveCardNo(state, fieldCard);
    const def = getCardDef(cardNo);
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
      if (ability.timing !== "onBecomeEngaged") continue;
      pushTrigger(
        state,
        fieldCard.instanceId,
        player,
        cardNo,
        ability,
        "onBecomeEngaged",
        "obe",
        `obe:${idx}`,
      );
    }
  }
}

export function queueOnDiscardTriggers(
  state: GameState,
  discardingPlayer: PlayerId,
  activePlayer: PlayerId,
): void {
  if (state.activePlayer !== activePlayer) return;
  for (const fieldCard of getPlayer(state, activePlayer).zones.field) {
    if (isBoxed(fieldCard, state)) continue;
    const cardNo = resolveCardNo(state, fieldCard);
    const def = getCardDef(cardNo);
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
      if (ability.timing !== "onDiscard") continue;
      pushTrigger(
        state,
        fieldCard.instanceId,
        activePlayer,
        cardNo,
        ability,
        "onDiscard",
        "od",
        `od:${idx}`,
      );
    }
  }
}

export function queueOnEnemyFollowerLeaveField(
  state: GameState,
  leftInstanceId: string,
  leftController: PlayerId,
  activePlayer: PlayerId,
): void {
  if (leftController === activePlayer) return;
  const left = findInstance(state, leftInstanceId);
  if (!left) return;
  const leftNo = resolveCardNo(state, left.card);
  const leftDef = getCardDef(leftNo);
  if (leftDef?.cardType !== "follower") return;

  for (const fieldCard of getPlayer(state, activePlayer).zones.field) {
    if (isBoxed(fieldCard, state)) continue;
    const cardNo = resolveCardNo(state, fieldCard);
    const def = getCardDef(cardNo);
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
      if (ability.timing !== "onEnemyFollowerLeaveField") continue;
      pushTrigger(
        state,
        fieldCard.instanceId,
        activePlayer,
        cardNo,
        ability,
        "onEnemyFollowerLeaveField",
        "oefl",
        `oefl:${idx}`,
        leftInstanceId,
      );
    }
  }
}

export function queueOnTokenLeaveField(
  state: GameState,
  leftInstanceId: string,
  tokenController: PlayerId,
  tokenCardNo: string,
): void {
  const tokenDef = getCardDef(tokenCardNo);
  if (tokenDef?.printingType !== "token" && tokenDef?.specialType !== "token") return;
  const cost = resolveCardDefCost(tokenCardNo);
  if (cost !== 1) return;

  for (const fieldCard of getPlayer(state, tokenController).zones.field) {
    if (isBoxed(fieldCard, state)) continue;
    const cardNo = resolveCardNo(state, fieldCard);
    const def = getCardDef(cardNo);
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
      if (ability.timing !== "onTokenLeaveField") continue;
      if (ability.oncePerTurn) {
        const key = `otlf:${idx}`;
        if (fieldCard.abilitiesActivatedThisTurn.includes(key)) continue;
      }
      pushTrigger(
        state,
        fieldCard.instanceId,
        tokenController,
        cardNo,
        ability,
        "onTokenLeaveField",
        "otlf",
        `otlf:${idx}`,
        undefined,
        tokenCardNo,
      );
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

export function queueOnLeaveField(state: GameState, instanceId: string, player: PlayerId): void {
  const found = findInstance(state, instanceId);
  if (!found) return;
  if (isBoxed(found.card, state)) return;
  const cardNo = resolveCardNo(state, found.card);
  const def = getCardDef(cardNo);
  for (const [idx, ability] of (def?.abilities ?? []).entries()) {
    if (ability.timing !== "onLeaveField") continue;
    pushTrigger(
      state,
      instanceId,
      player,
      cardNo,
      ability,
      "onLeaveField",
      "olf",
      `olf:${idx}`,
    );
  }
}

export function queueOnDamagedAbilities(
  state: GameState,
  instanceId: string,
  player: PlayerId,
): void {
  const found = findInstance(state, instanceId);
  if (!found || found.zone !== "field") return;
  if (isBoxed(found.card, state)) return;
  if (found.card.abilitiesSilenced) return;
  const cardNo = resolveCardNo(state, found.card);
  const def = getCardDef(cardNo);
  for (const [idx, ability] of (def?.abilities ?? []).entries()) {
    if (ability.timing !== "onDamaged") continue;
    if (ability.oncePerTurn) {
      const key = `odmg:${idx}`;
      if (found.card.abilitiesActivatedThisTurn.includes(key)) continue;
    }
    pushTrigger(
      state,
      instanceId,
      player,
      cardNo,
      ability,
      "onDamaged",
      "odmg",
      `odmg:${idx}`,
    );
  }
  for (const [gIdx, grant] of (found.card.grantedOnDamaged ?? []).entries()) {
    if (grant.oncePerTurn) {
      const key = `godmg:${gIdx}`;
      if (found.card.abilitiesActivatedThisTurn.includes(key)) continue;
    }
    pushTrigger(
      state,
      instanceId,
      player,
      cardNo,
      {
        timing: "onDamaged",
        effect: grant.effect,
        label: grant.label,
        oncePerTurn: grant.oncePerTurn,
      },
      "onDamaged",
      "godmg",
      `godmg:${gIdx}`,
    );
  }
}

export function queueOnAbilityDamaged(
  state: GameState,
  instanceId: string,
  player: PlayerId,
): void {
  const found = findInstance(state, instanceId);
  if (!found || found.zone !== "field") return;
  if (isBoxed(found.card, state)) return;
  if (found.card.abilitiesSilenced) return;
  const cardNo = resolveCardNo(state, found.card);
  const def = getCardDef(cardNo);
  for (const [idx, ability] of (def?.abilities ?? []).entries()) {
    if (ability.timing !== "onAbilityDamaged") continue;
    if (ability.oncePerTurn) {
      const key = `oadmg:${idx}`;
      if (found.card.abilitiesActivatedThisTurn.includes(key)) continue;
    }
    pushTrigger(
      state,
      instanceId,
      player,
      cardNo,
      ability,
      "onAbilityDamaged",
      "oadmg",
      `oadmg:${idx}`,
    );
  }
}

export function queueOnAllyEvolveTriggers(
  state: GameState,
  evolvedInstanceId: string,
  player: PlayerId,
): void {
  const evolved = findInstance(state, evolvedInstanceId);
  if (!evolved || evolved.zone !== "field") return;
  const evolvedNo = resolveCardNo(state, evolved.card);
  for (const fieldCard of getPlayer(state, player).zones.field) {
    if (fieldCard.instanceId === evolvedInstanceId || isBoxed(fieldCard, state)) continue;
    const cardNo = resolveCardNo(state, fieldCard);
    const def = getCardDef(cardNo);
    for (const [idx, ability] of (def?.abilities ?? []).entries()) {
      if (ability.timing !== "onAllyEvolve") continue;
      if (ability.filter && !cardMatchesFilter(evolvedNo, ability.filter)) continue;
      if (ability.oncePerTurn) {
        const key = `oae:${idx}`;
        if (fieldCard.abilitiesActivatedThisTurn.includes(key)) continue;
      }
      pushTrigger(
        state,
        fieldCard.instanceId,
        player,
        cardNo,
        ability,
        "onAllyEvolve",
        "oae",
        `oae:${idx}`,
        evolvedInstanceId,
      );
    }
  }
}
