import React from "react";
import { useDispatch } from "react-redux";
import {
  drawFromDeck,
  shuffleDeck,
  reset,
  mulliganFour,
  drawFourFromDeck,
} from "../../redux/CardSlice";
import cardback from "../../assets/cardbacks/sleeve_5010011.png";
import { Menu, MenuItem } from "@mui/material";

const img = require("../../assets/pin_bellringer_angel.png");

export default function Deck({ ready }) {
  const dispatch = useDispatch();

  const [contextMenu, setContextMenu] = React.useState(null);
  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };
  const handleClose = () => {
    setContextMenu(null);
  };

  const handleShuffle = () => {
    handleClose();
    dispatch(shuffleDeck());
  };

  const handleMulligan = () => {
    handleClose();
    dispatch(mulliganFour());
  };

  const handleDraw = () => {
    handleClose();
    dispatch(drawFourFromDeck());
  };

  const handleReset = () => {
    handleClose();
    dispatch(reset());
  };

  return (
    <>
      <div
        onContextMenu={(e) => {
          if (!ready) handleContextMenu(e);
        }}
        onClick={() => {
          if (!ready) dispatch(drawFromDeck());
        }}
        style={{
          // position: "absolute",
          // top: "58%",
          // right: "25%",
          cursor: `url(${img}) 55 55, auto`,
        }}
      >
        <img height={"160px"} src={cardback} alt={"cardback"} />
      </div>

      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY - 220, left: contextMenu.mouseX - 65 }
            : undefined
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={() => handleShuffle()}>Shuffle</MenuItem>
        <MenuItem onClick={() => handleDraw()}>Draw Four</MenuItem>
        <MenuItem onClick={() => handleMulligan()}>Mulligan Four</MenuItem>
        <MenuItem onClick={(event) => handleReset(event)}>Reset</MenuItem>
      </Menu>
    </>
  );
}
