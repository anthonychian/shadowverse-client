import React from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { IconButton, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setUiChromeHidden } from "../../redux/GameStateSlice";

export default function HideUiButton({ sx = {}, size = "small" }) {
  const dispatch = useDispatch();
  const hidden = useSelector((s) => s.gameState.uiChromeHidden);

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
