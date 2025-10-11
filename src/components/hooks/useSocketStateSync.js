import { useEffect } from "react";
import store from "../../redux/store";
import { socket } from "../../sockets";

const useSocketStateSync = () => {
  useEffect(() => {
    socket.on("send_full_state", ({ requesterId }) => {
      const currentState = store.getState().card;

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
