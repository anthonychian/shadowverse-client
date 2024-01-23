import React, { useState } from "react";
import { motion, Variants } from "framer-motion";

import {
  placeToFieldFromHand,
  addToHandFromField,
  placeToTopOfDeckFromField,
  moveCardOnField,
} from "../../redux/CardSlice";
import { useDispatch, useSelector } from "react-redux";
import Card from "../hand/Card";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// import img from "../../assets/pin_bellringer_angel.png";

export default function Field({
  ready,
  setReady,
  readyToPlaceOnFieldFromHand,
  setReadyToPlaceOnFieldFromHand,
}) {
  // const img = require("../../assets/pin_bellringer_angel.png");
  const dispatch = useDispatch();
  const reduxField = useSelector((state) => state.card.field);
  const reduxCurrentCard = useSelector((state) => state.card.currentCard);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("");
  const [readyToMoveOnField, setReadyToMoveOnField] = useState(false);

  const handleClick = (indexClicked) => {
    if (reduxField[indexClicked] === 0) {
      setReady(false);
      if (readyToPlaceOnFieldFromHand) {
        setReadyToPlaceOnFieldFromHand(false);
        dispatch(
          placeToFieldFromHand({
            card: reduxCurrentCard,
            index: indexClicked,
          })
        );
      }
      if (readyToMoveOnField) {
        setReadyToMoveOnField(false);
        dispatch(
          moveCardOnField({
            card: name,
            prevIndex: index,
            index: indexClicked,
          })
        );
      }
    } else console.log("there is already a card here");
  };

  const handleContextMenu = (event, index, name) => {
    setIndex(index);
    setName(name);
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
  const handleCardToHand = () => {
    handleClose();
    dispatch(
      addToHandFromField({
        card: name,
        index: index,
      })
    );
  };
  const handleCardToTopDeck = () => {
    handleClose();
    dispatch(
      placeToTopOfDeckFromField({
        card: name,
        index: index,
      })
    );
  };

  const handleMoveOnField = () => {
    handleClose();
    setReady(true);
    setReadyToMoveOnField(true);
  };

  return (
    <>
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
        <MenuItem onClick={() => handleCardToHand()}>Hand</MenuItem>
        <MenuItem onClick={() => handleMoveOnField()}>Move</MenuItem>
        <MenuItem onClick={() => handleCardToTopDeck()}>Top of Deck</MenuItem>
        <MenuItem onClick={handleClose}>Graveyard</MenuItem>
      </Menu>
      <div
        style={{
          height: "30vh",
          minHeight: "375px",
          minWidth: "600px",
          // cursor: `url(${img}), auto`,
          backgroundColor: "rgba(0, 0, 0, 0.60)",
          // backgroundColor: "rgba(255, 0, 0, 0.15)",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {reduxField.map((x, idx) => (
          <>
            {ready && (
              <motion.div
                key={`enemy1-${idx}`}
                whileHover={
                  {
                    // backgroundColor: "rgba(255, 252, 160, 0.2)",
                  }
                }
                // onClick={() => dispatch(placeToFieldFromHand())}
                style={{
                  height: "160px",
                  width: "115px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  // backgroundColor: "rgba(0, 0, 0, 0.20)",
                  // backgroundColor: "rgba(255, 0, 0, 0.15)",
                }}
              >
                {/* <Card name={x} /> */}
              </motion.div>
            )}
            {!ready && (
              <motion.div
                key={`enemy2-${idx}`}
                style={{
                  height: "160px",
                  width: "115px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  // backgroundColor: "rgba(0, 0, 0, 0.20)",
                }}
              >
                {/* <Card name={x} /> */}
              </motion.div>
            )}
          </>
        ))}
      </div>
      <div
        style={{
          height: "30vh",
          minHeight: "375px",
          minWidth: "600px",
          // cursor: `url(${img}), auto`,
          backgroundColor: "rgba(0, 0, 0, 0.60)",
          // backgroundColor: "rgba(0, 0, 255, 0.15)",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {reduxField.map((x, idx) => (
          <>
            {ready && (
              <motion.div
                onContextMenu={(e) =>
                  handleContextMenu(e, idx, reduxField[idx])
                }
                key={`player1-${idx}`}
                whileHover={{
                  backgroundColor: "rgba(255, 252, 160, 0.3)",
                }}
                style={{
                  height: "160px",
                  width: "115px",
                  // backgroundColor: "rgba(0, 0, 0, 0.20)",
                  backgroundColor: "rgba(0, 0, 255, 0.20)",
                }}
                onClick={() => handleClick(idx)}
              >
                {x !== 0 && (
                  <Card
                    onField={true}
                    key={`card1-${idx}`}
                    name={reduxField[idx]}
                  />
                )}
              </motion.div>
            )}
            {!ready && (
              <motion.div
                onContextMenu={(e) =>
                  handleContextMenu(e, idx, reduxField[idx])
                }
                key={`player2-${idx}`}
                style={{
                  height: "160px",
                  width: "115px",
                  // backgroundColor: "rgba(0, 0, 0, 0.20)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                {x !== 0 && (
                  <Card
                    onField={true}
                    key={`card2-${idx}`}
                    name={reduxField[idx]}
                  />
                )}
              </motion.div>
            )}
          </>
        ))}
      </div>
    </>
  );
}
