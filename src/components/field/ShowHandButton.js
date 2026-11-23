import React, { useState } from "react";
import { keyframes } from "@emotion/react";
import { Button } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useDispatch, useSelector } from "react-redux";
import { setShowHand } from "../../redux/CardSlice";
import img from "../../assets/pin_bellringer_angel.png";

const BORDER = "rgba(72, 171, 224, 0.5)";
const PANEL_BG = "rgba(10, 14, 20, 0.92)";
const GLOW = "0 0 22px rgba(10, 175, 230, 0.28)";
const ACCENT = "#48abe0";

const handVisiblePulse = keyframes`
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 3px rgba(140, 220, 255, 0.65));
  }
  50% {
    transform: scale(1.12);
    filter: drop-shadow(0 0 12px rgba(140, 220, 255, 1));
  }
`;

export default function ShowHandButton() {
  const dispatch = useDispatch();
  const showHand = useSelector((state) => state.card.showHand);
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const [hovered, setHovered] = useState(false);

  if (gameMode === "automated") return null;

  const Icon = showHand ? VisibilityOffOutlinedIcon : VisibilityOutlinedIcon;
  const label = showHand ? "Hide Hand" : "Show Hand";

  return (
    <Button
      variant="outlined"
      aria-label={label}
      aria-pressed={showHand}
      onClick={() => dispatch(setShowHand(!showHand))}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        minWidth: 0,
        px: 1.25,
        py: 0.75,
        borderRadius: "10px",
        border: `1px solid ${BORDER}`,
        backgroundColor: PANEL_BG,
        backdropFilter: "blur(6px)",
        boxShadow: GLOW,
        color: "#eaf6ff",
        fontFamily: "Noto Serif JP, serif",
        textTransform: "none",
        cursor: `url(${img}) 55 55, auto`,
        flexDirection: "row-reverse",
        transition: "background-color 150ms ease, border-color 150ms ease",
        "&:hover": {
          border: `1px solid ${ACCENT}`,
          backgroundColor: "rgba(72, 171, 224, 0.18)",
        },
      }}
    >
      <Icon
        sx={{
          color: showHand ? "#8cdcff" : "#eaf6ff",
          fontSize: 22,
          filter: showHand ? "none" : "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))",
          animation: showHand
            ? `${handVisiblePulse} 1.5s ease-in-out infinite`
            : "none",
          transformOrigin: "center",
          transition: "color 150ms ease, filter 150ms ease",
        }}
      />
      <span
        style={{
          maxWidth: hovered ? 90 : 0,
          marginRight: hovered ? 6 : 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          fontSize: 12,
          color: showHand ? "#8cdcff" : "#eaf6ff",
          transition: "max-width 150ms ease, margin-right 150ms ease",
        }}
      >
        {label}
      </span>
    </Button>
  );
}
