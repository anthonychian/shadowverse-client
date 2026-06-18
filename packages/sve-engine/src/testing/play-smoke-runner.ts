import { applyAction } from "../actions/applyAction";
import { getCardDef } from "../cards/registry";
import { runConfirmationTiming } from "../rules/confirmation";
import { createCardInstance, createInitialGameState, resetIdCounter } from "../state/factory";
import { GameState, PlayerId, Effect } from "../types";
import { hintsFromAction, resolveChoicesWithHints } from "./choice-resolver";
import { snapshotState } from "./state-diff";

export type PlaySmokeStatus =
  | "play_ok"
  | "play_noop"
  | "play_blocked"
  | "unresolved"
  | "skipped";

export type PlaySmokeResult = {
  cardNo: string;
  name: string;
  status: PlaySmokeStatus;
  timing?: string;
  error?: string;
  stateDiff?: string;
  hasCondition?: boolean;
};

const DUMMY_FOLLOWER = "BP07-001EN";

function findHandInstanceId(state: GameState, player: PlayerId, cardNo: string): string | null {
  const card = state.players[player].zones.hand.find((c) => c.cardNo === cardNo);
  return card?.instanceId ?? null;
}

function findFieldInstanceId(state: GameState, player: PlayerId, cardNo: string): string | null {
  const card = state.players[player].zones.field.find((c) => c.cardNo === cardNo);
  return card?.instanceId ?? null;
}

function buildMinimalBoard(cardNo: string, timing: string): GameState {
  resetIdCounter();
  const def = getCardDef(cardNo);
  const cost = def?.cost ?? 1;
  const state = createInitialGameState(0);
  state.phase = "main";
  state.turnNumber = 1;
  state.players[0].flags.mulliganDone = true;
  state.players[1].flags.mulliganDone = true;
  state.players[0].pp = Math.max(cost + 5, 10);
  state.players[1].pp = 10;
  state.players[1].leaderDef = 20;

  state.players[0].zones.deck = Array.from({ length: 10 }, () =>
    createCardInstance("BP07-002EN", 0),
  );
  state.players[1].zones.deck = Array.from({ length: 10 }, () =>
    createCardInstance("BP07-002EN", 1),
  );

  if (timing === "onEvolve" || timing === "activated") {
    state.players[0].zones.hand = [createCardInstance(cardNo, 0)];
    state.players[0].zones.field = [
      createCardInstance(DUMMY_FOLLOWER, 0),
      createCardInstance(cardNo, 0),
    ];
    state.players[1].zones.field = [createCardInstance(DUMMY_FOLLOWER, 1)];
    state.players[0].evoPoints = 2;
    state.players[0].superEvoPoints = 1;
  } else {
    state.players[0].zones.hand = [createCardInstance(cardNo, 0)];
    state.players[1].zones.field = [createCardInstance(DUMMY_FOLLOWER, 1)];
  }

  return state;
}

function stateChanged(before: GameState, after: GameState): boolean {
  const a = snapshotState(before);
  const b = snapshotState(after);
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (JSON.stringify(a[key] ?? []) !== JSON.stringify(b[key] ?? [])) return true;
  }
  if (after.pendingTriggers.length !== before.pendingTriggers.length) return true;
  return false;
}

function tryPlay(state: GameState, cardNo: string): { state: GameState; ok: boolean; error?: string } {
  const id = findHandInstanceId(state, 0, cardNo);
  if (!id) return { state, ok: false, error: "not in hand" };
  const result = applyAction(state, 0, { type: "PLAY_CARD", handInstanceId: id });
  if (!result.ok) return { state, ok: false, error: result.error };
  let next = runConfirmationTiming(result.state);
  next = resolveChoicesWithHints(next, 0, hintsFromAction({ autoResolve: true }));
  next = runConfirmationTiming(next);
  return { state: next, ok: true };
}

function tryActivate(state: GameState, cardNo: string): { state: GameState; ok: boolean; error?: string } {
  const id = findFieldInstanceId(state, 0, cardNo);
  if (!id) return { state, ok: false, error: "not on field" };
  const result = applyAction(state, 0, { type: "ACTIVATE", fieldInstanceId: id });
  if (!result.ok) return { state, ok: false, error: result.error };
  let next = resolveChoicesWithHints(result.state, 0, hintsFromAction({ autoResolve: true }));
  next = runConfirmationTiming(next);
  return { state: next, ok: true };
}

function tryEvolve(state: GameState, cardNo: string): { state: GameState; ok: boolean; error?: string } {
  const id = findFieldInstanceId(state, 0, cardNo);
  if (!id) return { state, ok: false, error: "not on field" };
  const result = applyAction(state, 0, { type: "EVOLVE", fieldInstanceId: id });
  if (!result.ok) return { state, ok: false, error: result.error };
  let next = runConfirmationTiming(result.state);
  next = resolveChoicesWithHints(next, 0, hintsFromAction({ autoResolve: true }));
  next = runConfirmationTiming(next);
  return { state: next, ok: true };
}

function smokeAbility(
  cardNo: string,
  ability: { timing: string; condition?: unknown; effect?: Effect },
): PlaySmokeResult {
  const def = getCardDef(cardNo);
  const name = def?.name ?? cardNo;
  const timing = ability.timing;

  if (timing === "passive" || timing === "aura" || timing === "lastWords" || timing === "strike") {
    return { cardNo, name, status: "skipped", timing };
  }

  const hasCondition = Boolean(ability.condition);
  const before = buildMinimalBoard(cardNo, timing);
  const beforeClone = structuredClone(before);

  let result: { state: GameState; ok: boolean; error?: string };
  if (timing === "activated") {
    result = tryActivate(before, cardNo);
  } else if (timing === "onEvolve") {
    result = tryEvolve(before, cardNo);
  } else {
    result = tryPlay(before, cardNo);
  }

  if (!result.ok) {
    return {
      cardNo,
      name,
      status: hasCondition ? "play_blocked" : "play_blocked",
      timing,
      error: result.error,
      hasCondition,
    };
  }

  if (result.state.pendingChoices) {
    return {
      cardNo,
      name,
      status: "unresolved",
      timing,
      error: result.state.pendingChoices.type,
      hasCondition,
    };
  }

  const changed = stateChanged(beforeClone, result.state);
  return {
    cardNo,
    name,
    status: changed ? "play_ok" : "play_noop",
    timing,
    hasCondition,
  };
}

export function runPlaySmoke(cardNo: string): PlaySmokeResult[] {
  const def = getCardDef(cardNo);
  if (!def?.abilities?.length) {
    return [
      {
        cardNo,
        name: def?.name ?? cardNo,
        status: "skipped",
        error: "no abilities",
      },
    ];
  }

  const actionable = def.abilities.filter(
    (a) =>
      a.timing === "fanfare" ||
      a.timing === "spell" ||
      a.timing === "activated" ||
      a.timing === "onEvolve",
  );

  if (!actionable.length) {
    return [{ cardNo, name: def.name ?? cardNo, status: "skipped" }];
  }

  return actionable.map((a) => smokeAbility(cardNo, a));
}

export function runPlaySmokeBatch(cardNos: string[]): PlaySmokeResult[] {
  const results: PlaySmokeResult[] = [];
  for (const cardNo of cardNos) {
    results.push(...runPlaySmoke(cardNo));
  }
  return results;
}
