import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setEnemyDice } from "../../redux/CardSlice";
import { onDiceRoll } from "./diceBus";

// A modern dice toss shown to both players: the die tumbles in from the side,
// settles in the centre showing the rolled value, then fades. The result is
// authoritative from the roller (it generates the value and broadcasts it), so
// both clients animate the same face. Rendered in a body portal so it floats
// over the whole screen regardless of the scaled board's transforms.

const DIE = 96; // px
const LIFETIME = 2000; // ms the toss stays on screen

// Pip positions in a 3x3 grid (indices 0..8) per die value.
const PIP_LAYOUT = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DiceFace({ value }) {
  const pips = PIP_LAYOUT[value] || [4];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        width: "100%",
        height: "100%",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {pips.includes(i) && (
            <div
              style={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                background: "#1b1b1f",
                boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.45)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function DieToss({ value }) {
  return (
    <motion.div
      style={{
        position: "fixed",
        left: "50%",
        top: "45%",
        width: DIE,
        height: DIE,
        marginLeft: -DIE / 2,
        marginTop: -DIE / 2,
        borderRadius: 18,
        background: "linear-gradient(145deg, #ffffff 0%, #dde2ea 100%)",
        boxShadow: "0 16px 34px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.06)",
      }}
      initial={{ x: "-42vw", y: -130, rotate: 0, scale: 0.5, opacity: 0 }}
      animate={{
        x: ["-42vw", "-12vw", "0vw", "0vw", "0vw"],
        y: [-130, -45, 0, 0, 0],
        rotate: [0, 720, 1080, 1080, 1080],
        scale: [0.5, 1.12, 1, 1, 0.92],
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration: LIFETIME / 1000,
        times: [0, 0.35, 0.55, 0.82, 1],
        ease: "easeOut",
      }}
    >
      <DiceFace value={value} />
    </motion.div>
  );
}

export default function DiceRoll() {
  const [items, setItems] = useState([]);
  const dispatch = useDispatch();
  const enemyDice = useSelector((s) => s.card.enemyDice);
  const idRef = useRef(0);
  const timersRef = useRef([]);

  // Add a toss; schedule its own removal via a ref-held timer so re-renders
  // never clear it (timers are only flushed on unmount).
  const pushRoll = useCallback((value) => {
    const id = ++idRef.current;
    setItems((cur) => [...cur, { id, value }]);
    timersRef.current.push(
      setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== id)), LIFETIME + 120),
    );
  }, []);

  // Local rolls (this player pressed the dice button).
  useEffect(() => {
    const off = onDiceRoll((evt) => pushRoll(evt.value));
    return () => off();
  }, [pushRoll]);

  // Remote rolls (opponent) arrive via the synced enemyDice state. Play the
  // toss, then reset show to false so an identical follow-up roll re-triggers.
  useEffect(() => {
    if (!enemyDice || !enemyDice.show) return;
    pushRoll(enemyDice.roll);
    dispatch(setEnemyDice({ show: false, roll: enemyDice.roll }));
  }, [enemyDice, dispatch, pushRoll]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  if (items.length === 0) return null;
  return createPortal(
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100000 }}>
      {items.map((it) => (
        <DieToss key={it.id} value={it.value} />
      ))}
    </div>,
    document.body,
  );
}
