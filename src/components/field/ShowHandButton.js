import React from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useDispatch, useSelector } from "react-redux";
import { setShowHand } from "../../redux/CardSlice";
import img from "../../assets/pin_bellringer_angel.png";

export default function ShowHandButton() {
  const dispatch = useDispatch();
  const showHand = useSelector((state) => state.card.showHand);
  const gameMode = useSelector((state) => state.gameState.gameMode);

  if (gameMode === "automated") return null;

  const Icon = showHand ? VisibilityOffOutlinedIcon : VisibilityOutlinedIcon;
  const label = showHand ? "Hide Hand" : "Show Hand";

  return (
    <div
      role="button"
      aria-label={label}
      onClick={() => dispatch(setShowHand(!showHand))}
      style={{
        cursor: `url(${img}) 55 55, auto`,
      }}
    >
      <Icon
        sx={{
          color: "white",
          fontSize: 50,
          filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))",
        }}
      />
      <div
        style={{
          width: "50px",
          color: "white",
        }}
      >
        {label}
      </div>
    </div>
  );
}
