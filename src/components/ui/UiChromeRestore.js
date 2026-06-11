import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setUiChromeHidden } from "../../redux/GameStateSlice";

export default function UiChromeRestore() {
  const dispatch = useDispatch();
  const hidden = useSelector((s) => s.gameState.uiChromeHidden);

  if (!hidden) return null;

  return (
    <Button
      variant="contained"
      size="small"
      startIcon={<VisibilityIcon />}
      onClick={() => dispatch(setUiChromeHidden(false))}
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 2000,
        fontWeight: 600,
      }}
    >
      Show UI
    </Button>
  );
}
