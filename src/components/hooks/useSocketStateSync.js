import { useEffect } from "react";
import { store } from "../../redux/store";
import { socket } from "../../sockets";

const useSocketStateSync = () => {
  useEffect(() => {
    socket.on("send_full_state", ({ requesterId }) => {
      console.log("[useSocketStateSync] received request from", requesterId);
      const currentState = store.getState().card;
      console.log("[useSocketStateSync] sending state, keys:", Object.keys(currentState).length);

      socket.emit("send_full_state", {
        requesterId,
        fullState: currentState,
      });
    });

    return () => {
      socket.off("send_full_state");
    };
  }, []);
};

export default useSocketStateSync;
