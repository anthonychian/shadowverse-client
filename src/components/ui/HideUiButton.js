import React from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { IconButton, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setUiChromeHidden } from "../../redux/GameStateSlice";

export default function HideUiButton({ sx = {}, size = "small" }) {
  const dispatch = useDispatch();
  const hidden = useSelector((s) => s.gameState.uiChromeHidden);
  const gameMode = useSelector((s) => s.gameState.gameMode);

  // The Hide UI control is hidden in the manual (sandbox) game; it's only
  // offered in the rules-enforced automated game.
  if (gameMode === "manual") return null;
  if (hidden) return null;

  return (
    <Tooltip title="Hide UI to view board and hand">
      <IconButton
        size={size}
        aria-label="Hide UI"
        onClick={() => dispatch(setUiChromeHidden(true))}
        sx={{
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.75)" },
          ...sx,
        }}
      >
        <VisibilityOffIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
}

export function ModalHideUiRow() {
  const gameMode = useSelector((s) => s.gameState.gameMode);

  // No Hide UI button in the manual (sandbox) game, so skip the row entirely
  // (avoids an empty padded strip at the top of modals).
  if (gameMode === "manual") return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
        padding: "4px 8px",
        boxSizing: "border-box",
      }}
    >
      <HideUiButton />
    </div>
  );
}
