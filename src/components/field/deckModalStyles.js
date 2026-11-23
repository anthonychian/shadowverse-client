import { useLayoutEffect, useState } from "react";
import { getEnemyFieldGridRect } from "./handDrag";

// Dark-glass treatment shared with the Home page (see Home.css): deep navy
// translucent fill, cyan accent border + glow, and a blur behind it.
export const glassPanel = {
  background:
    "linear-gradient(180deg, rgba(18, 53, 87, 0.92) 0%, rgba(10, 14, 20, 0.95) 100%)",
  border: "1px solid rgba(72, 171, 224, 0.5)",
  boxShadow: "0 12px 40px rgba(10, 175, 230, 0.28)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

// Compact toolbar buttons, themed like the Home page's glass controls.
export const primaryButtonSx = {
  fontFamily: "Noto Serif JP, serif",
  fontSize: 13,
  fontWeight: "bold",
  textTransform: "none",
  color: "#eafaff",
  background:
    "linear-gradient(135deg, rgba(18, 110, 178, 0.92) 0%, rgba(72, 171, 224, 0.88) 100%)",
  border: "1px solid rgba(140, 220, 255, 0.55)",
  borderRadius: "8px",
  minWidth: 0,
  padding: "4px 14px",
  lineHeight: 1.3,
  boxShadow: "0 4px 14px rgba(10, 120, 180, 0.35)",
  "&:hover": {
    background:
      "linear-gradient(135deg, rgba(28, 132, 205, 0.95) 0%, rgba(96, 192, 242, 0.92) 100%)",
    boxShadow: "0 0 16px rgba(72, 171, 224, 0.5)",
  },
};

export const ghostButtonSx = {
  fontFamily: "Noto Serif JP, serif",
  fontSize: 13,
  textTransform: "none",
  color: "#daf6ff",
  background: "rgba(10, 14, 20, 0.75)",
  border: "1px solid rgba(72, 171, 224, 0.5)",
  borderRadius: "8px",
  minWidth: 0,
  padding: "4px 12px",
  lineHeight: 1.3,
  "&:hover": {
    background: "rgba(72, 171, 224, 0.16)",
    boxShadow: "0 0 14px rgba(72, 171, 224, 0.4)",
  },
};

export const traitButtonSx = {
  ...ghostButtonSx,
  maxWidth: 220,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

// Header bar shared by the deck drawers (Look At Top / View Deck / Cemetery).
export const deckModalToolbar = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5em",
  width: "100%",
  padding: "0.6em 0.25em 0.55em",
  borderBottom: "1px solid rgba(72, 171, 224, 0.28)",
  boxSizing: "border-box",
};

export const deckModalTitle = {
  fontFamily: "Share Tech Mono, monospace",
  fontSize: 13,
  letterSpacing: "0.12em",
  color: "#8cdcff",
  marginRight: "0.25em",
};

export const deckModalCount = {
  fontFamily: "Share Tech Mono, monospace",
  fontSize: 12,
  letterSpacing: "0.08em",
  color: "#daf6ff",
  background: "rgba(10, 14, 20, 0.6)",
  border: "1px solid rgba(72, 171, 224, 0.4)",
  borderRadius: 6,
  padding: "3px 8px",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

// Card area shared by the deck drawers: transparent over the glass panel,
// growing with the cards up to three rows (3 * 161px card + 2 * 8px gap +
// vertical padding), then scrolling. The +6px buffer keeps a full three rows
// from overflowing on sub-pixel rounding (and the outlined Card's border), so
// the scrollbar only appears once a fourth row starts.
export const deckModalCards = {
  flex: "1 1 auto",
  minHeight: 0,
  maxHeight: "calc(489px + 2.2em)",
  width: "100%",
  padding: "0.6em 0.25em",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: "0.5em",
  justifyContent: "center",
  alignContent: "safe center",
  alignItems: "center",
  overflowY: "auto",
  // Keep overflow-y:auto from computing overflow-x:auto (which can add a
  // horizontal scrollbar and steal vertical room from the three-row fit).
  overflowX: "hidden",
  backgroundColor: "transparent",
  backgroundImage: "none",
  border: "none",
  boxShadow: "none",
};

// Top-anchored drawer shared by the deck drawers: flush with the top edge and
// at least as tall as the measured opponent EX centre, growing to show up to
// three card rows before the card area scrolls. Only the bottom corners are
// rounded. Measured from the live (CSS-scaled) board so it stays correct at
// every resolution.
//
// No viewport max-height here on purpose: capping the drawer (e.g. 90vh) makes
// the flex card area shrink below three rows on shorter windows, so a scrollbar
// appeared with only a few cards. The card area's own max-height already caps
// the drawer at three rows; if the window is shorter than that, the Modal's
// scroll root takes over instead of the card area scrolling early.
export function useDeckModalBoxStyle(modalOpen) {
  const [box, setBox] = useState({ left: null, width: null, height: null });

  useLayoutEffect(() => {
    if (!modalOpen) return undefined;
    const measure = () => {
      const rect = getEnemyFieldGridRect();
      if (!rect) {
        setBox({
          left: null,
          width: null,
          height: Math.round(window.innerHeight * 0.32),
        });
        return;
      }
      setBox({
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        // The opponent's EX area is the top row of their 5x2 field grid.
        height: Math.round(rect.top + rect.height * 0.25),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [modalOpen]);

  return {
    position: "absolute",
    top: 0,
    left: box.left ?? "50%",
    transform: box.left == null ? "translateX(-50%)" : "none",
    width: box.width ? `${box.width}px` : "min(1100px, 96vw)",
    minHeight: box.height ? `${box.height}px` : "32vh",
    display: "flex",
    flexDirection: "column",
    borderRadius: "0 0 16px 16px",
    overflow: "hidden",
    boxSizing: "border-box",
    padding: "0 0.75em 0.6em",
    ...glassPanel,
  };
}
