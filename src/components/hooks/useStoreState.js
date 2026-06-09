import { useEffect, useRef, useCallback } from "react";
import { store } from "../../redux/store";
import { socket, playerId, saveState } from "../../sockets";

const DEBOUNCE_MS = 1000;

const useStoreState = () => {
  const timerRef = useRef(null);

  const flushState = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const { card, gameState } = store.getState();
    if (!card.room || gameState.gameMode === "automated") return;
    // Durable per-tab save (survives reload + server restart) ...
    saveState(card.room, card);
    // ... and the server-side snapshot (lets the opponent / a fresh device pull it).
    socket.emit("store_state", { room: card.room, playerId, state: card });
  }, []);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const { card } = store.getState();
      if (!card.room) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushState, DEBOUNCE_MS);
    });

    window.addEventListener("beforeunload", flushState);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", flushState);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [flushState]);
};

export default useStoreState;
