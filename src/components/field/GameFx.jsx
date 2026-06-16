import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { onGameAnimation } from "./animationBus";

// The animated stand-in cards match the real card footprint (.cardStyle in
// Card.css) so the effects line up with the board at any scale.
const CARD_W = 115;
const CARD_H = 161;

// How long each effect stays mounted (ms) — a touch longer than the motion
// itself so the final, faded-out frame is never cut off before unmount.
const LIFETIME = { draw: 900, shuffle: 1100, evolve: 1200 };

// A stylized face-down card used by the draw and shuffle effects. Kept generic
// (not a specific cardback) so it reads the same on both sides without having to
// resolve each player's chosen cardback art here.
const cardBackStyle = {
  position: "absolute",
  width: CARD_W,
  height: CARD_H,
  left: "50%",
  top: "50%",
  marginLeft: -CARD_W / 2,
  marginTop: -CARD_H / 2,
  borderRadius: 8,
  background: "linear-gradient(145deg, #2b3550 0%, #161d2e 55%, #0c1019 100%)",
  border: "2px solid rgba(214, 188, 122, 0.85)",
  boxShadow: "0 0 14px rgba(120, 170, 255, 0.55), inset 0 0 10px rgba(0,0,0,0.6)",
};

const overlayBase = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  overflow: "visible",
};

// Subscribe to the bus and keep a self-pruning list of events matching this
// layer's predicate. Each event removes itself once its motion has finished.
function useGameAnimations(predicate) {
  const [items, setItems] = useState([]);
  const predRef = useRef(predicate);
  predRef.current = predicate;
  useEffect(() => {
    const timers = [];
    const off = onGameAnimation((evt) => {
      if (!predRef.current(evt)) return;
      setItems((cur) => [...cur, evt]);
      timers.push(
        setTimeout(() => {
          setItems((cur) => cur.filter((i) => i.id !== evt.id));
        }, (LIFETIME[evt.kind] || 1000) + 50),
      );
    });
    return () => {
      off();
      timers.forEach(clearTimeout);
    };
  }, []);
  return items;
}

// Draw: a card lifts off the deck and drifts toward that player's hand (down for
// you, up for the opponent), fading as it goes.
function DrawCard({ side }) {
  const toward = side === "player" ? 1 : -1;
  const dx = side === "player" ? -70 : 70;
  const dy = side === "player" ? 80 : -80;
  return (
    <motion.div
      style={cardBackStyle}
      initial={{ opacity: 0, scale: 0.55, x: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.55, 1.05, 1, 0.9],
        x: [0, 0, dx * 0.5, dx],
        y: [0, -18 * toward, dy * 0.5, dy],
        rotate: [0, 0, dx < 0 ? -8 : 8, dx < 0 ? -12 : 12],
      }}
      transition={{ duration: 0.8, times: [0, 0.22, 0.6, 1], ease: "easeOut" }}
    />
  );
}

// Shuffle: three cards fan out from the deck and riffle back together.
function ShuffleStack() {
  return (
    <>
      {[-1, 0, 1].map((d, i) => (
        <motion.div
          key={i}
          style={cardBackStyle}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 1, 0],
            x: [0, d * 62, d * -22, d * 40, 0],
            y: [0, i % 2 ? -10 : 10, 6, -4, 0],
            rotate: [0, d * 14, d * -7, d * 9, 0],
          }}
          transition={{
            duration: 1.0,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

// Evolve: the signature golden burst — a flash, an expanding ring, and a spray
// of rising sparks — centered on the evolving player's field.
const SPARK_ANGLES = [10, 70, 130, 190, 250, 310];
function EvoBurst() {
  return (
    <>
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 240,
          height: 240,
          marginLeft: -120,
          marginTop: -120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,236,170,0.95) 0%, rgba(255,153,51,0.6) 40%, rgba(255,120,30,0) 72%)",
        }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: [0.2, 1.3, 1.7], opacity: [0, 0.95, 0] }}
        transition={{ duration: 1.0, ease: "easeOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 150,
          height: 150,
          marginLeft: -75,
          marginTop: -75,
          borderRadius: "50%",
          border: "5px solid rgba(255, 213, 128, 0.9)",
          boxShadow: "0 0 22px rgba(255, 180, 80, 0.85)",
        }}
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: [0.2, 2.4], opacity: [0.9, 0] }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      />
      {SPARK_ANGLES.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const dist = 95;
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 9,
              height: 9,
              marginLeft: -4.5,
              marginTop: -4.5,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, #fff3c4 0%, #ffb347 70%, rgba(255,140,40,0) 100%)",
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 1, 0],
              x: [0, Math.cos(rad) * dist],
              y: [0, Math.sin(rad) * dist - 30],
              scale: [0.6, 1.2, 0.4],
            }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        );
      })}
    </>
  );
}

// Draw / shuffle overlay — mounted inside a deck pile (player or enemy), it
// centers its effects on that pile.
export function DeckFx({ side }) {
  const items = useGameAnimations(
    (e) => e.side === side && (e.kind === "draw" || e.kind === "shuffle"),
  );
  return (
    <div style={{ ...overlayBase, zIndex: 60 }}>
      {items.map((it) =>
        it.kind === "draw" ? (
          <DrawCard key={it.id} side={side} />
        ) : (
          <ShuffleStack key={it.id} />
        ),
      )}
    </div>
  );
}

// Evolve overlay — mounted once over the whole board. The burst is centered on
// the acting player's field (top for the opponent, bottom for you), using the
// same board-relative coordinates the field labels are tuned against.
export function EvoLayer() {
  const items = useGameAnimations((e) => e.kind === "evolve");
  return (
    <div style={{ ...overlayBase, zIndex: 70 }}>
      {items.map((it) => (
        <div
          key={it.id}
          style={{
            position: "absolute",
            left: "50%",
            top: it.side === "player" ? "74%" : "26%",
            width: 0,
            height: 0,
          }}
        >
          <EvoBurst />
        </div>
      ))}
    </div>
  );
}
