import { getCardDef } from "../cards/registry";
import { describeAbility } from "./trigger-labels";
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
): void {
  state.pendingTriggers.push({
    id: `${idPrefix}_${instanceId}_${state.pendingTriggers.length}`,
    controller: player,
    sourceInstanceId: instanceId,
    ability,
    timing,
    label: describeAbility(cardNo, ability),
  });
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
