import { useEffect } from "react";
import { store } from "../../redux/store";
import { socket } from "../../sockets";

// Periodically announce liveness through the normal *sequenced* message channel.
// The message is a no-op for the opponent (Field.js's handleUpdate ignores the
// "heartbeat" type), but because the server stamps it with this sender's running
// sequence number, the opponent's gap detector sees the seq advance. That closes
// the one desync that wouldn't otherwise self-heal: a *lost final message*
// followed by no further action — without a heartbeat there'd be no later packet
// to reveal the gap until the next real move or a reconnect. With it, the gap is
// detected (and a full-state resync triggered) within one heartbeat interval.
const HEARTBEAT_MS = 3000;

const useHeartbeat = () => {
  useEffect(() => {
    const id = setInterval(() => {
      const { card } = store.getState();
      if (card.room) {
        socket.emit("send msg", { type: "heartbeat", room: card.room });
      }
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, []);
};

export default useHeartbeat;
