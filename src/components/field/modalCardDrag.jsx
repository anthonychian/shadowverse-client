import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Card from "../hand/Card";
import {
  fieldIndexAt,
  isOverHand,
  isOverCemetery,
  deckHalfAt,
  setDragHover,
} from "./handDrag";

// Shared "drag a card out of a modal onto the board" behaviour, used by the deck
// (Look At Top / View Deck) and cemetery modals. The card list lives inside a
// scrolling modal; pressing and dragging a card hides the modal (the caller sets
// opacity:0 while `isDragging`) and floats a ghost that follows the cursor, with
// the shared FieldDropHints overlay highlighting the allowed drop zones (field
// slots / hand / cemetery). On release the resolved target is handed to
// `onDrop(card, index, dest)`.
//
// We take explicit pointer capture on the card's wrapper so every
// pointermove/up is delivered to it for the whole gesture — even after the modal
// is visually hidden (opacity:0 keeps the node rendered, so capture survives).

// How far (px) a card must move before the drag activates (and the modal hides).
// Below this it's treated as a stray click and the modal stays put.
const DRAG_THRESHOLD = 8;

const CLEARED_HOVER = {
  active: false,
  index: -1,
  cemetery: false,
  hand: false,
  deck: null,
  showCemetery: false,
  showHand: false,
  showDeck: false,
};

// Cursor + native-drag suppression applied to each draggable wrapper. Exposed
// separately (as `dragStyle`) so callers with their own wrapper style can merge
// it instead of having it overwritten by the spread.
const DRAG_STYLE = { cursor: "grab", touchAction: "none", userSelect: "none" };

/**
 * @param {object} opts
 * @param {{field?: boolean, hand?: boolean, cemetery?: boolean, deck?: boolean}} opts.targets
 *        which drop zones this modal allows. `deck` adds the split top/bottom-of-
 *        deck pile (dest `{type: "deck", half: "top"|"bottom"}`).
 * @param {Array} [opts.field] the player's field array, so occupied slots reject
 *        a drop (mirrors the click-to-place flow). Omit for evolve, where the
 *        drop must land ON a follower — the caller validates in onDrop instead.
 * @param {boolean} [opts.evolve] marks the drag as an evolve so FieldDropHints
 *        flips its highlight (a follower slot becomes the valid/green target).
 * @param {boolean|((card: any) => boolean)} [opts.equip] marks the drag as an
 *        equipment attach (green target = top-row follower with nothing
 *        attached). Pass a function to decide per dragged card.
 * @param {(card: any, index: number, dest: {type: string, index?: number}) => void} opts.onDrop
 */
export function useModalCardDrag({
  targets,
  field,
  evolve = false,
  equip = false,
  onDrop,
}) {
  const [dragCard, setDragCard] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  // The in-flight gesture (which card, where it started, whether it has crossed
  // the threshold) and the live drop target, kept in refs so pointerup resolves
  // them without a re-render race.
  const gestureRef = useRef(null);
  const destRef = useRef(null);

  const resolveDest = (x, y) => {
    if (targets.hand && isOverHand(x, y)) return { type: "hand" };
    if (targets.cemetery && isOverCemetery(x, y)) return { type: "cemetery" };
    if (targets.deck) {
      const half = deckHalfAt(x, y);
      if (half) return { type: "deck", half };
    }
    if (targets.field) {
      const fi = fieldIndexAt(x, y);
      if (fi >= 0) return { type: "field", index: fi };
    }
    return null;
  };

  const handlePointerDown = (e, card, index) => {
    if (e.button !== 0) return; // left button only; right-click opens the menu
    gestureRef.current = {
      card,
      index,
      startX: e.clientX,
      startY: e.clientY,
      active: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    const g = gestureRef.current;
    if (!g) return;
    const x = e.clientX;
    const y = e.clientY;
    if (!g.active) {
      if (Math.hypot(x - g.startX, y - g.startY) < DRAG_THRESHOLD) return;
      g.active = true;
      setDragCard({ name: g.card, index: g.index });
    }
    setDragPos({ x, y });
    const dest = resolveDest(x, y);
    destRef.current = dest;
    setDragHover({
      active: true,
      index: dest && dest.type === "field" ? dest.index : -1,
      cemetery: !!dest && dest.type === "cemetery",
      hand: !!dest && dest.type === "hand",
      deck: dest && dest.type === "deck" ? dest.half : null,
      evolve,
      equip: typeof equip === "function" ? !!equip(g.card) : !!equip,
      showCemetery: !!targets.cemetery,
      showHand: !!targets.hand,
      showDeck: !!targets.deck,
    });
  };

  const endGesture = (e, commit) => {
    const g = gestureRef.current;
    gestureRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setDragHover(CLEARED_HOVER);
    const dest = destRef.current;
    destRef.current = null;
    setDragCard(null);
    if (!commit || !g || !g.active || !dest) return;
    // Never drop onto an occupied field slot (mirrors the click-to-place flow).
    if (dest.type === "field" && field && field[dest.index] !== 0) return;
    onDrop(g.card, g.index, dest);
  };

  // Spread onto each draggable card wrapper in the modal. (Keep the wrapper's own
  // onContextMenu alongside it — this doesn't set one.)
  const dragProps = (card, index) => ({
    onPointerDown: (e) => handlePointerDown(e, card, index),
    onPointerMove: handlePointerMove,
    onPointerUp: (e) => endGesture(e, true),
    onPointerCancel: (e) => endGesture(e, false),
    // Kill the browser's native image/selection drag so it can't preempt the
    // pointer-driven drag (notably in Firefox).
    draggable: false,
    onDragStart: (e) => e.preventDefault(),
    style: DRAG_STYLE,
  });

  return {
    dragCard,
    dragPos,
    dragProps,
    dragStyle: DRAG_STYLE,
    isDragging: !!dragCard,
  };
}

// Floating ghost of the card currently being dragged out of a modal. Portaled to
// <body> so it floats above the (opacity-hidden) modal and isn't clipped by the
// card grid's overflow:scroll. Pass the object returned by useModalCardDrag.
export function ModalDragGhost({ drag, ready, setHovering }) {
  if (!drag.dragCard) return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        left: drag.dragPos.x,
        top: drag.dragPos.y,
        width: 115,
        height: 161,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 100000,
        opacity: 0.9,
      }}
    >
      <Card ready={ready} name={drag.dragCard.name} setHovering={setHovering} />
    </div>,
    document.body,
  );
}
