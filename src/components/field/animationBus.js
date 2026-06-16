import { socket } from "../../sockets";

// Lightweight pub/sub for the on-board game animations (shuffle / draw / evolve).
// These effects are purely cosmetic and carry no game state, so they ride their
// own channel instead of the Redux-synced "send msg" field updates. The trigger
// (a deck click, an evolve, ...) and the overlay that draws the effect live in
// different components, hence a tiny shared bus rather than prop threading.
const listeners = new Set();
let nextId = 0;

// Subscribe to animation events. Returns an unsubscribe function.
export const onGameAnimation = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

// Play an animation on this client. `side` is "player" (your half of the board,
// bottom) or "enemy" (the opponent's half, top). `kind` is "draw" | "shuffle" |
// "evolve". A unique id is attached so the overlay can key concurrent effects.
export const playGameAnimation = (anim) => {
  const evt = { id: ++nextId, ...anim };
  listeners.forEach((cb) => cb(evt));
};

// Play the animation on your own board AND tell the opponent to play it on
// theirs, so both players see the same effect. The opponent's Field listens for
// the "animate" message and replays it with side: "enemy" (see handleUpdate).
export const triggerGameAnimation = (kind, room) => {
  playGameAnimation({ kind, side: "player" });
  if (room) socket.emit("send msg", { type: "animate", data: kind, room });
};
