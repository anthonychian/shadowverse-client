import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { artImage } from "../../decks/getCards";
import { onCardReveal, REVEAL_MS } from "./cardRevealBus";

// When a card is played, show it large in the centre (flip + scale-up like the
// card preview), then have it dissolve into a swarm of glowing particles that
// stream to its field slot and gather there — at which point the real card
// (kept hidden until now) materialises. The slot `target` is in viewport coords;
// if missing we fall back to a generic move toward that side's board. Portaled
// to <body> so it floats over the scaled board uncliped.

const DUR = REVEAL_MS / 1000;
const PARTICLES = 22;

function RevealCard({ src, side, target }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1000;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  // Vector from screen centre to the slot (where particles converge).
  const dx = target ? target.x - vw / 2 : 0;
  const dy = target ? target.y - vh / 2 : (side === "player" ? 0.22 : -0.22) * vh;

  // Fixed per-reveal particle layout: each starts scattered over the card and
  // converges near the slot, staggered slightly.
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLES }, () => ({
        sx: (Math.random() - 0.5) * 150, // start spread over the card
        sy: (Math.random() - 0.5) * 210,
        ex: dx + (Math.random() - 0.5) * 55, // gather near the slot
        ey: dy + (Math.random() - 0.5) * 55,
        size: 4 + Math.random() * 7,
        delay: Math.random() * 0.12,
        hue: 198 + Math.random() * 34, // blue → cyan
      })),
    [dx, dy],
  );

  return (
    <div style={{ position: "fixed", left: "50%", top: "50%", width: 0, height: 0 }}>
      {/* Card: flips in at centre, holds, then dissolves. */}
      <div style={{ position: "absolute", transform: "translate(-50%, -50%)", perspective: 1200 }}>
        <motion.div
          style={{ transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, scale: 0.6, rotateY: 180 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.6, 1, 1, 0.7],
            rotateY: [180, 0, 0, 0],
            filter: ["brightness(1)", "brightness(1)", "brightness(1.4)", "brightness(2)"],
          }}
          transition={{ duration: DUR, times: [0, 0.18, 0.4, 0.55], ease: "easeOut" }}
        >
          <img
            src={src}
            alt="played card"
            style={{
              height: "42vh",
              width: "auto",
              borderRadius: 12,
              boxShadow: "0 16px 48px rgba(0,0,0,0.75)",
            }}
          />
        </motion.div>
      </div>

      {/* Particles: stream from the card to the slot and gather there. */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          style={{ position: "absolute", left: 0, top: 0 }}
          initial={{ x: p.sx, y: p.sy, opacity: 0, scale: 1 }}
          animate={{
            x: [p.sx, p.sx, p.ex],
            y: [p.sy, p.sy, p.ey],
            opacity: [0, 0.95, 0],
            scale: [1, 1, 0.35],
          }}
          transition={{ duration: DUR, times: [0, 0.4, 0.96], delay: p.delay, ease: "easeIn" }}
        >
          <div
            style={{
              position: "absolute",
              left: -p.size / 2,
              top: -p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, #ffffff 0%, hsla(${p.hue},100%,76%,0.95) 45%, hsla(${p.hue},100%,70%,0) 100%)`,
              boxShadow: `0 0 ${p.size * 1.6}px ${p.size * 0.6}px hsla(${p.hue},100%,72%,0.8)`,
            }}
          />
        </motion.div>
      ))}

      {/* Soft glow that swells at the slot as the particles gather. */}
      <motion.div
        style={{ position: "absolute", left: 0, top: 0 }}
        initial={{ x: dx, y: dy, opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 0, 0.85, 0], scale: [0.2, 0.4, 1.2, 1.7] }}
        transition={{ duration: DUR, times: [0, 0.7, 0.94, 1], ease: "easeOut" }}
      >
        <div
          style={{
            position: "absolute",
            left: -55,
            top: -55,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(180,220,255,0.5) 45%, rgba(180,220,255,0) 75%)",
          }}
        />
      </motion.div>
    </div>
  );
}

export default function PlayReveal() {
  const [items, setItems] = useState([]);
  const myArt = useSelector((s) => s.card.myArt);
  const enemyArt = useSelector((s) => s.card.enemyArt);
  const idRef = useRef(0);
  const timers = useRef([]);

  const push = useCallback(
    (evt) => {
      const id = ++idRef.current;
      const art = evt.side === "enemy" ? enemyArt : myArt;
      const src = artImage(evt.name, art);
      setItems((cur) => [...cur, { id, src, side: evt.side, target: evt.target }]);
      timers.current.push(
        setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== id)), REVEAL_MS + 250),
      );
    },
    [myArt, enemyArt],
  );

  useEffect(() => {
    const off = onCardReveal(push);
    return () => off();
  }, [push]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (items.length === 0) return null;
  return createPortal(
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99998 }}>
      {items.map((it) => (
        <RevealCard key={it.id} src={it.src} side={it.side} target={it.target} />
      ))}
    </div>,
    document.body,
  );
}
