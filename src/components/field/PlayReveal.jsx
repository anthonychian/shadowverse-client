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

function RevealCard({ src, side, target, source, size, kind }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1000;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  // Vector from screen centre to the destination (slot, or the hand).
  const dx = target ? target.x - vw / 2 : 0;
  const dy = target ? target.y - vh / 2 : (side === "player" ? 0.22 : -0.22) * vh;

  // Banish disintegration: motes scattered over the card that drift up/outward
  // and fade, anchored at the card's slot. Computed before any early return so
  // the hook order stays stable; only used by the "banish" branch.
  const bH = size || 0.18 * vh;
  const bW = (bH * 115) / 161;
  const ash = useMemo(
    () =>
      Array.from({ length: 30 }, () => {
        const sx = (Math.random() - 0.5) * bW; // start spread over the card
        const sy = (Math.random() - 0.5) * bH;
        return {
          sx,
          sy,
          ex: sx + (Math.random() - 0.5) * 70, // drift outward
          ey: sy - (30 + Math.random() * 90), // and upward, like rising ash
          size: 3 + Math.random() * 6,
          delay: Math.random() * 0.3,
          hue: 268 + Math.random() * 34, // violet → magenta (the "void")
        };
      }),
    [bW, bH],
  );

  // Fixed per-reveal particle layout (field reveals only): each starts scattered
  // over the card and converges near the slot, staggered slightly. Computed
  // before any early return so the hook order stays stable.
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

  // Banish: the card disintegrates in place at its slot — it holds a beat, then
  // brightens and dissolves while a swarm of violet motes streams off it and
  // rises into the void.
  if (kind === "banish") {
    const sx = source ? source.x - vw / 2 : 0;
    const sy = source ? source.y - vh / 2 : 0;
    return (
      <div style={{ position: "fixed", left: "50%", top: "50%", width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: `translate(${sx}px, ${sy}px)` }}>
          {/* Centre the card on the slot; framer animates only scale/opacity. */}
          <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [1, 1, 1.05, 1.1],
                filter: [
                  "grayscale(0.2) brightness(1)",
                  "grayscale(0.2) brightness(1)",
                  "grayscale(0.7) brightness(1.4)",
                  "grayscale(1) brightness(2)",
                ],
              }}
              transition={{ duration: DUR, times: [0, 0.15, 0.5, 0.9], ease: "easeIn" }}
            >
              <img
                src={src}
                alt="banished card"
                style={{
                  height: bH,
                  width: "auto",
                  borderRadius: 8,
                  boxShadow: "0 0 26px 6px hsla(285,90%,65%,0.5)",
                }}
              />
            </motion.div>
          </div>

          {/* Motes streaming off the card as it disintegrates. */}
          {ash.map((p, i) => (
            <motion.div
              key={i}
              style={{ position: "absolute", left: 0, top: 0 }}
              initial={{ x: p.sx, y: p.sy, opacity: 0, scale: 1 }}
              animate={{ x: p.ex, y: p.ey, opacity: [0, 0.95, 0], scale: 0.3 }}
              transition={{ duration: DUR, delay: p.delay, ease: "easeOut" }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -p.size / 2,
                  top: -p.size / 2,
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, #ffffff 0%, hsla(${p.hue},100%,78%,0.95) 45%, hsla(${p.hue},100%,68%,0) 100%)`,
                  boxShadow: `0 0 ${p.size * 1.6}px ${p.size * 0.6}px hsla(${p.hue},100%,70%,0.8)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Mill: no particles — the card flips up, holds briefly, then shrinks and
  // sinks into the cemetery pile while desaturating to a graveyard grey.
  if (kind === "mill") {
    return (
      <div style={{ position: "fixed", left: "50%", top: "50%", width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", perspective: 1200 }}>
          <motion.div
            style={{ transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.6, rotateY: 180, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1, 1, 0.22],
              rotateY: [180, 0, 0, 0],
              x: [0, 0, 0, dx],
              y: [0, 0, 0, dy],
              filter: [
                "grayscale(0) brightness(1)",
                "grayscale(0) brightness(1)",
                "grayscale(0.5) brightness(0.85)",
                "grayscale(1) brightness(0.5)",
              ],
            }}
            transition={{ duration: DUR, times: [0, 0.22, 0.5, 1], ease: "easeInOut" }}
          >
            <img
              src={src}
              alt="milled card"
              style={{
                height: "42vh",
                width: "auto",
                borderRadius: 12,
                boxShadow: "0 16px 48px rgba(0,0,0,0.75)",
              }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // "Added to hand": no particles — the card itself flips in, then shrinks and
  // flies toward the hand (down to yours, up to the opponent's) and fades.
  if (kind === "hand") {
    return (
      <div style={{ position: "fixed", left: "50%", top: "50%", width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", perspective: 1200 }}>
          <motion.div
            style={{ transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.6, rotateY: 180, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1, 1, 0.28],
              rotateY: [180, 0, 0, 0],
              x: [0, 0, 0, dx],
              y: [0, 0, 0, dy],
            }}
            transition={{ duration: DUR, times: [0, 0.22, 0.5, 1], ease: "easeInOut" }}
          >
            <img
              src={src}
              alt="card to hand"
              style={{
                height: "42vh",
                width: "auto",
                borderRadius: 12,
                boxShadow: "0 16px 48px rgba(0,0,0,0.75)",
              }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

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
      setItems((cur) => [
        ...cur,
        {
          id,
          src,
          side: evt.side,
          target: evt.target,
          source: evt.source,
          size: evt.size,
          kind: evt.kind,
        },
      ]);
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
        <RevealCard
          key={it.id}
          src={it.src}
          side={it.side}
          target={it.target}
          source={it.source}
          size={it.size}
          kind={it.kind}
        />
      ))}
    </div>,
    document.body,
  );
}
