import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const MONO = "Share Tech Mono, monospace";

const formatElapsed = (ms) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export default function MatchTimer() {
  const matchStartEpoch = useSelector((state) => state.card.matchStartEpoch);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!matchStartEpoch) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [matchStartEpoch]);

  if (!matchStartEpoch) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "8px",
        left: "8px",
        zIndex: 1200,
        pointerEvents: "none",
        padding: "2px 8px",
        borderRadius: "6px",
        fontFamily: MONO,
        fontSize: "18px",
        color: "#e8f4ff",
        backgroundColor: "rgba(10, 14, 20, 0.85)",
        border: "1px solid rgba(72, 171, 224, 0.5)",
        boxShadow: "0 0 8px rgba(0, 0, 0, 0.5)",
        userSelect: "none",
      }}
    >
      {formatElapsed(now - matchStartEpoch)}
    </div>
  );
}