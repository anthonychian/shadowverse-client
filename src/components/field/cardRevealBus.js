import { socket } from "../../sockets";

// Pub/sub for the "card played" reveal. When a card is played to the field it's
// shown large in the centre, flies to its slot, and only *then* becomes visible
// on the board — for both players. To do that the played card is kept hidden on
// the field until the reveal lands; this module owns both the reveal events and
// the set of hidden slots, and Field re-renders off them.

// How long the played card stays hidden (≈ when the reveal reaches the slot).
export const REVEAL_MS = 1100;

const revealListeners = new Set();
const hideListeners = new Set();
let nextId = 0;

// Field indices currently hidden mid-reveal, per board.
const hiddenMine = new Set();
const hiddenEnemy = new Set();

const notifyHide = () => hideListeners.forEach((cb) => cb());

const hideSlot = (side, index) => {
  if (typeof index !== "number" || index < 0) return;
  const set = side === "enemy" ? hiddenEnemy : hiddenMine;
  set.add(index);
  notifyHide();
  setTimeout(() => {
    set.delete(index);
    notifyHide();
  }, REVEAL_MS);
};

export const onCardReveal = (cb) => {
  revealListeners.add(cb);
  return () => revealListeners.delete(cb);
};
export const onHideChange = (cb) => {
  hideListeners.add(cb);
  return () => hideListeners.delete(cb);
};
export const isHidden = (side, index) =>
  (side === "enemy" ? hiddenEnemy : hiddenMine).has(index);

// Play the reveal locally: hide the slot until it lands, and emit the reveal
// (with the slot's viewport position so the card flies there).
export const playCardReveal = ({ name, side, index, target }) => {
  if (!name || name === 0) return;
  hideSlot(side, index);
  revealListeners.forEach((cb) => cb({ id: ++nextId, name, side, target }));
};

// Reveal on your own screen AND tell the opponent to reveal it on theirs. Each
// side computes its own slot target; only the card name + field index travel.
export const triggerCardReveal = (name, room, index, target) => {
  if (!name || name === 0) return;
  playCardReveal({ name, side: "player", index, target });
  if (room) socket.emit("send msg", { type: "cardPlayed", data: { name, index }, room });
};
