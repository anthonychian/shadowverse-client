import { useEffect, useRef, useCallback } from "react";
import { store } from "../../redux/store";
import { socket, playerId } from "../../sockets";

const DEBOUNCE_MS = 1000;

const useStoreState = () => {
  const timerRef = useRef(null);

  const flushState = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const { card } = store.getState();
    if (!card.room) return;
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
