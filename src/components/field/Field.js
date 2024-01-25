import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  placeToFieldFromHand,
  addToHandFromField,
  placeToTopOfDeckFromField,
  placeToBotOfDeckFromField,
  moveCardOnField,
  placeToCemetaryFromField,
  placeToFieldFromCemetary,
} from "../../redux/CardSlice";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem } from "@mui/material";
import Card from "../hand/Card";
import Deck from "./Deck";
import Cemetary from "./Cemetary";
const img = require("../../assets/pin_bellringer_angel.png");

export default function Field({
  dragging,
  ready,
  setReady,
  setHovering,
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
  const [readyFromCemetary, setReadyFromCemetary] = useState(false);

  const handleClick = (name, indexClicked) => {
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
      if (readyFromCemetary) {
        setReadyFromCemetary(false);
        dispatch(
          placeToFieldFromCemetary({
            card: name,
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
  const handleCardToHandFromField = () => {
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
  const handleCardToBotDeck = () => {
    handleClose();
    dispatch(
      placeToBotOfDeckFromField({
        card: name,
        index: index,
      })
    );
  };

  const handleCardToCemetaryFromField = () => {
    handleClose();
    dispatch(
      placeToCemetaryFromField({
        card: name,
        index: index,
      })
    );
  };
  // const handleCardToFieldFromCementary = () => {
  //   handleClose();
  //   setReady(true);
  //   setReadyFromCemetary(true);
  // };

  // const handleCardToHandFromCemetary = () => {
  //   handleClose();
  //   dispatch(
  //     addToHandFromCemetary({
  //       card: name,
  //     })
  //   );
  // };

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
        <MenuItem onClick={() => handleCardToHandFromField()}>Hand</MenuItem>
        <MenuItem onClick={() => handleCardToCemetaryFromField()}>
          Cemetary
        </MenuItem>
        <MenuItem onClick={() => handleMoveOnField()}>Move</MenuItem>
        <MenuItem onClick={() => handleCardToTopDeck()}>Top of Deck</MenuItem>
        <MenuItem onClick={() => handleCardToBotDeck()}>Bot of Deck</MenuItem>
        {/* <MenuItem onClick={handleClose}>Graveyard</MenuItem> */}
      </Menu>

      {/* Enemy Field (1-5) & Ex Area (6-10) */}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: "330px",
        }}
      >
        {/* Enemy Deck and Cemetary */}

        <div
          style={{
            height: "40vh",
            width: "175px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <Deck ready={ready} />
          <div
            style={{
              height: "160px",
              width: "115px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              cursor: `url(${img}) 55 55, auto`,
            }}
          />
        </div>

        <div
          style={{
            height: "40vh",
            minHeight: "330px",
            minWidth: "600px",
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            // backgroundColor: "rgba(0, 0, 255, 0.15)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            justifyItems: "center",
            zIndex: 10,
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
      </div>

      {/* Player Field (1-5) & Ex Area (6-10) */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: "330px",
        }}
      >
        <div
          style={{
            height: "40vh",
            minHeight: "330px",
            minWidth: "600px",
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            // backgroundColor: "rgba(0, 0, 255, 0.15)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            justifyItems: "center",
            zIndex: 10,
          }}
        >
          {reduxField.map((card, idx) => (
            <>
              {ready && (
                <motion.div
                  onContextMenu={(e) => {
                    if (card !== 0 && !ready) handleContextMenu(e, idx, card);
                  }}
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
                  onClick={() => handleClick(reduxCurrentCard, idx)}
                >
                  {card !== 0 && (
                    <Card
                      onField={true}
                      key={`card1-${idx}`}
                      name={card}
                      setHovering={setHovering}
                    />
                  )}
                </motion.div>
              )}
              {!ready && (
                <motion.div
                  onContextMenu={(e) => {
                    if (card !== 0) handleContextMenu(e, idx, card);
                  }}
                  key={`player2-${idx}`}
                  style={{
                    height: "160px",
                    width: "115px",
                    // backgroundColor: "rgba(0, 0, 0, 0.20)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {card !== 0 && (
                    <Card
                      onField={true}
                      key={`card2-${idx}`}
                      name={card}
                      setHovering={setHovering}
                    />
                  )}
                </motion.div>
              )}
            </>
          ))}
        </div>

        {/* Deck and Cementary */}
        <div
          style={{
            height: "40vh",
            width: "175px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <Cemetary
            setReadyFromCemetary={setReadyFromCemetary}
            setReady={setReady}
            setHovering={setHovering}
            ready={ready}
          />
          <Deck ready={ready} />
        </div>
      </div>
    </>
  );
}
