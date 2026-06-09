import { setEngineView, setInstanceMap, resetEngine } from "../redux/GameStateSlice";
import { syncFromEngine } from "../redux/CardSlice";
import { engineViewToRedux } from "./adapter";
import { store } from "../redux/store";

/**
 * Apply authoritative engine payload to Redux.
 * Accepts either a room broadcast `{ 0, 1, seq }` or a single `PlayerView`.
 */
export function applyEnginePayload(dispatch, payload, knownSlot = null) {
  if (!payload) return false;

  let view;
  let seq;

  if (payload.self != null && payload.state && payload[0] === undefined) {
    view = payload;
    seq = payload.seq ?? Date.now();
  } else {
    const hasBoth = payload[0] != null && payload[1] != null;
    const slot =
      knownSlot ??
      store.getState().gameState.playerSlot ??
      (hasBoth ? null : payload.slot != null ? payload.slot : null) ??
      (!hasBoth && payload[0] != null ? 0 : null) ??
      (!hasBoth && payload[1] != null ? 1 : null);
    if (slot == null) return false;
    view = payload[slot];
    seq = payload.seq;
    if (!view) return false;
  }

  const freshGame =
    view.state?.phase === "mulligan" && view.state?.turnNumber === 0 && seq === 1;
  if (freshGame) {
    dispatch(resetEngine());
  }

  dispatch(setEngineView({ view, seq, force: freshGame }));
  const mapped = engineViewToRedux(view, view.self);
  if (!mapped) return false;
  dispatch(syncFromEngine(mapped));
  dispatch(setInstanceMap(mapped.instanceMap));
  return true;
}
