import { socket } from "../../sockets";
import { handCenter, cemeteryCenter, fieldSlotCenter, getBoardScale } from "./handDrag";

// On-board card height in px (matches .cardStyle: 161px) before the board scale.
const CARD_PX = 161;

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

// Play the reveal locally. `kind` is "field" (played to a slot — particles, and
// the slot stays hidden until the reveal lands), "hand" (added to hand), "mill"
// (top of deck sinks into the cemetery) or "banish" (a field card disintegrates
// in place at its slot `source`). `source`/`size` are used by "banish".
export const playCardReveal = ({ name, side, index, target, source, size, kind = "field" }) => {
  if (!name || name === 0) return;
  if (kind === "field") hideSlot(side, index);
  revealListeners.forEach((cb) =>
    cb({ id: ++nextId, name, side, target, source, size, kind }),
  );
};

// Reveal on your own screen AND tell the opponent to reveal it on theirs. Each
// side computes its own slot target; only the card name + field index travel.
export const triggerCardReveal = (name, room, index, target) => {
  if (!name || name === 0) return;
  playCardReveal({ name, side: "player", index, target });
  if (room) socket.emit("send msg", { type: "cardPlayed", data: { name, index }, room });
};

// "Added to hand" reveal: shows the card centre-screen, then flies it toward the
// hand (yours at the bottom, the opponent's at the top). Each side targets its
// own hand; only the card name travels.
export const triggerHandReveal = (name, room) => {
  if (!name || name === 0) return;
  playCardReveal({ name, side: "player", kind: "hand", target: handCenter() });
  if (room) socket.emit("send msg", { type: "cardToHand", data: { name }, room });
};

// Mill reveal: the top card flips up centre-screen, then sinks into the cemetery
// pile while fading to a graveyard grey. Each side targets its own cemetery;
// only the card name travels.
export const triggerMillReveal = (name, room) => {
  if (!name || name === 0) return;
  playCardReveal({ name, side: "player", kind: "mill", target: cemeteryCenter() });
  if (room) socket.emit("send msg", { type: "cardMilled", data: { name }, room });
};

// Equip reveal: the equipment card flips up centre-screen, then shrinks and
// darts onto the follower it's being attached to, landing in a golden flash.
// Unlike a play reveal the slot is NOT hidden — the follower stays visible
// underneath the whole time. Each side computes its own slot target; only the
// equipment name + follower field index travel.
export const triggerEquipReveal = (name, room, index) => {
  if (!name || name === 0) return;
  playCardReveal({
    name,
    side: "player",
    kind: "equip",
    target: fieldSlotCenter(index),
  });
  if (room)
    socket.emit("send msg", { type: "cardEquipped", data: { name, index }, room });
};

// Banish reveal: a card on the field disintegrates in place — it breaks into a
// swarm of motes that scatter and fade at its slot. `index` is the field slot
// (0-9). Each side computes its own slot; only the card name + field index travel.
export const triggerBanishReveal = (name, room, index) => {
  if (!name || name === 0) return;
  playCardReveal({
    name,
    side: "player",
    kind: "banish",
    source: fieldSlotCenter(index),
    size: CARD_PX * getBoardScale(),
  });
  if (room)
    socket.emit("send msg", { type: "cardBanished", data: { name, index }, room });
};