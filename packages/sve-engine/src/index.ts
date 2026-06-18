export * from "./types";
export { getCardDef, getAllCardDefs, registerCard, getCardByName } from "./cards/registry";
export { MVP_CARD_DEFS } from "./cards/mvp-cards";
export { createInitialGameState, createCardInstance, resetIdCounter } from "./state/factory";
export { loadDecks, applyMulligan, beginStartPhase } from "./phases/setup";
export {
  detectDeckIdentity,
  getCardUniverseFromCardNo,
  CRAFT_LEADERS,
  COOL_EARRINGS_CARD_NO,
} from "./deck/detectIdentity";
export type { DeckIdentity, CraftClass, UniverseId as DeckUniverseId } from "./deck/detectIdentity";
export { applyAction, advanceCombatIfNeeded } from "./actions/applyAction";
export { runConfirmationTiming } from "./rules/confirmation";
export { resolveEffect, resolveSpell } from "./effects/resolver";
export { createPlayerView, tryAction } from "./view/filterView";
export {
  findInstance,
  getLegalAttackTargets,
  hasKeyword,
  getEffectiveStats,
  getEffectivePlayCost,
  getEvolveCost,
  resolveCardDefCost,
  isFieldFollower,
} from "./state/queries";
export * from "./testing";
