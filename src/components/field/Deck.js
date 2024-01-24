import React, { useState } from "react";
import { useSprings, animated, to as interpolate } from "@react-spring/web";
import { useSelector, useDispatch } from "react-redux";
import "./Deck.css";
import {
  drawFromDeck,
  shuffleDeck,
  reset,
  mulliganFour,
  drawFourFromDeck,
} from "../../redux/CardSlice";
import cardback from "../../assets/cardbacks/sleeve_5010011.png";
// import {} from "../../redux/CardSlice";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const img = require("../../assets/pin_bellringer_angel.png");
// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});
const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) =>
  `perspective(1500px) rotateX(30deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(${s})`;

function DeckOfCards() {
  const reduxDeck = useSelector((state) => state.card.deck);
  const dispatch = useDispatch();
  // const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
  const [props, api] = useSprings(reduxDeck.length, (i) => ({
    ...to(i),
    from: from(i),
  })); // Create a bunch of springs using the helpers above

  return (
    <>
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div className={"deck"} key={i} style={{ x, y }}>
          <animated.div
            onClick={() => dispatch(drawFromDeck())}
            style={{
              transform: interpolate([rot, scale], trans),
              backgroundImage: `url(${cardback})`,
              cursor: `url(${img}) 55 55, auto`,
            }}
          />
        </animated.div>
      ))}
    </>
  );
}

export default function Deck() {
  const [contextMenu, setContextMenu] = React.useState(null);
  const dispatch = useDispatch();

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
    <div
      onContextMenu={(e) => {
        handleContextMenu(e);
      }}
      style={{
        backgroundColor: "white",
        position: "absolute",
        top: "75%",
        right: "20%",
      }}
    >
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleShuffle()}>Shuffle</MenuItem>
        <MenuItem onClick={() => handleDraw()}>Draw Four</MenuItem>
        <MenuItem onClick={() => handleMulligan()}>Mulligan Four</MenuItem>
        <MenuItem onClick={(event) => handleReset(event)}>Reset</MenuItem>
      </Menu>
      <DeckOfCards />
    </div>
  );
}
