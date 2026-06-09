import { getCardDef } from "../cards/registry";
import { normalizeIdentityName } from "../cards/reprints";
import { cardMatchesFilter, evalCondition } from "./conditions";
import { getPlayer, resolveCardNo } from "./queries";
import { AbilityDefinition, CardInstance, GameState, Keyword, PlayerId } from "../types";

export function isBoxed(card: CardInstance, state: GameState): boolean {
  return card.boxedUntilTurn != null && state.turnNumber < card.boxedUntilTurn;
}

function abilitiesFor(state: GameState | undefined, card: CardInstance): AbilityDefinition[] {
  return getCardDef(resolveCardNo(state, card))?.abilities ?? [];
}

export function getPassiveKeywords(
  state: GameState,
  card: CardInstance,
  player: PlayerId,
): Keyword[] {
  if (isBoxed(card, state)) return [];
  const keywords: Keyword[] = [];
  for (const ability of abilitiesFor(state, card)) {
    if (ability.timing !== "passive") continue;
    if (ability.condition && !evalCondition(state, player, ability.condition)) continue;
    const effect = ability.effect;
    if (effect.op === "passiveKeywords") {
      for (const kw of effect.keywords) {
        if ((kw === "aura" || kw === "intimidate") && card.engaged) continue;
        keywords.push(kw);
      }
    }
  }
  return keywords;
}

export function getAuraKeywords(
  state: GameState,
  card: CardInstance,
  player: PlayerId,
): Keyword[] {
  if (isBoxed(card, state)) return [];
  const keywords: Keyword[] = [];
  const field = getPlayer(state, player).zones.field;
  for (const source of field) {
    for (const ability of abilitiesFor(state, source)) {
      if (ability.timing !== "aura") continue;
      const effect = ability.effect;
      if (effect.op !== "auraGrantKeyword") continue;
      if (effect.excludeSelf && source.instanceId === card.instanceId) continue;
      if (effect.trait) {
        const def = getCardDef(resolveCardNo(state, card));
        if (!def?.traits?.includes(effect.trait)) continue;
      }
      keywords.push(effect.keyword);
    }
  }
  return keywords;
}

export function getMaxDamagePerHit(state: GameState, card: CardInstance, player: PlayerId): number | null {
  if (isBoxed(card, state)) return null;
  for (const ability of abilitiesFor(state, card)) {
    if (ability.timing !== "passive") continue;
    if (ability.condition && !evalCondition(state, player, ability.condition)) continue;
    const effect = ability.effect;
    if (effect.op === "damageCap") return effect.maxPerHit;
  }
  return null;
}

export function hasNamedFollowerOnFieldByIdentity(
  state: GameState,
  player: PlayerId,
  identityName: string,
): boolean {
  const target = normalizeIdentityName(identityName);
  return getPlayer(state, player).zones.field.some((c) => {
    const def = getCardDef(resolveCardNo(state, c));
    return def && normalizeIdentityName(def.name) === target;
  });
}

export function matchesExAreaEntryFilter(
  ability: AbilityDefinition,
  enteredCardNo: string,
): boolean {
  if (ability.timing !== "onExAreaEntry" || !ability.filter) return false;
  return cardMatchesFilter(enteredCardNo, ability.filter);
}
