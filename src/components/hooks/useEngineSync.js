import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../sockets";
import { applyEnginePayload } from "../../engine/sync";
import { setGameMode } from "../../redux/GameStateSlice";

export function useEngineSync() {
  const dispatch = useDispatch();
  const gameMode = useSelector((s) => s.gameState.gameMode);
  const playerSlot = useSelector((s) => s.gameState.playerSlot);

  const applyView = useCallback(
    (payload) => {
      applyEnginePayload(dispatch, payload, playerSlot);
    },
    [dispatch, playerSlot],
  );

  useEffect(() => {
    dispatch(setGameMode("manual"));
  }, [dispatch]);

  useEffect(() => {
    if (gameMode !== "automated") return;

    const onBroadcast = (views) => applyView(views);
    const onPlayerView = (view) => applyView(view);
    const onJoined = ({ slot, automated, serverMode }) => {
      if (!automated) return;
      if (serverMode !== "authoritative") {
        console.warn(
          "Connected server does not support Rules Enforced mode. Run: npm run server",
        );
      }
    };
    const onError = ({ error }) => {
      console.error("Engine action rejected:", error);
      window.alert(`Action failed: ${error}`);
    };

    socket.on("engine_state", onBroadcast);
    socket.on("engine_state_player", onPlayerView);
    socket.on("joined", onJoined);
    socket.on("engine_error", onError);
    socket.emit("request_engine_state");

    return () => {
      socket.off("engine_state", onBroadcast);
      socket.off("engine_state_player", onPlayerView);
      socket.off("joined", onJoined);
      socket.off("engine_error", onError);
    };
  }, [gameMode, applyView]);

  const sendAction = useCallback((action) => {
    const actionId = crypto.randomUUID();
    socket.emit("engine_action", { actionId, action });
    return actionId;
  }, []);

  return { sendAction, applyView };
}
