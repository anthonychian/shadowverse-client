import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  placeToFieldFromHand,
  addToHandFromField,
  placeToTopOfDeckFromField,
  placeToBotOfDeckFromField,
  moveCardOnField,
  placeToCemeteryFromField,
  placeToFieldFromCemetery,
  evolveCardOnField,
  feedCardOnField,
} from "../../redux/CardSlice";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem } from "@mui/material";
import Card from "../hand/Card";
import Deck from "./Deck";
import Cemetery from "./Cemetery";
import cardback from "../../assets/cardbacks/sleeve_5010011.png";
import EvoDeck from "./EvoDeck";
import img from "../../assets/pin_bellringer_angel.png";
import "../../css/AnimatedBorder.css";

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
  const reduxEvoField = useSelector((state) => state.card.evoField);
  const reduxEvoDeck = useSelector((state) => state.card.evoDeck);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [contextEvoMenu, setContextEvoMenu] = React.useState(null);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("");
  const [readyToMoveOnField, setReadyToMoveOnField] = useState(false);
  const [readyFromCemetery, setReadyFromCemetery] = useState(false);
  const [readyToEvo, setReadyToEvo] = useState(false);
  const [readyToFeed, setReadyToFeed] = useState(false);

  // useEffect(() => {
  //   console.log("READY TO EVO", readyToEvo);
  //   console.log("READY TO FEED", readyToFeed);
  // }, [readyToEvo, readyToFeed]);

  const handleClick = (name, indexClicked) => {
    if (reduxField[indexClicked] === 0 && !readyToEvo && !readyToFeed) {
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
      if (readyFromCemetery) {
        setReadyFromCemetery(false);
        dispatch(
          placeToFieldFromCemetery({
            card: name,
            index: indexClicked,
          })
        );
      }
    } else if (
      (readyToFeed || readyToEvo) &&
      reduxField[indexClicked] !== 0 &&
      reduxEvoField[indexClicked] === 0
    ) {
      console.log("SUCCESS");
      if (readyToEvo) {
        setReadyToEvo(false);
        dispatch(
          evolveCardOnField({
            card: name,
            index: indexClicked,
          })
        );
      }
      if (readyToFeed) {
        setReadyToFeed(false);
        dispatch(
          feedCardOnField({
            card: name,
            index: indexClicked,
          })
        );
      }
    } else {
      console.log("there is already a card here");
      setReadyToEvo(false);
      setReadyToFeed(false);
    }
    setReady(false);
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
  const handleEvoContextMenu = (event, index, name) => {
    // setIndex(index);
    // setName(name);
    event.preventDefault();
    setContextEvoMenu(
      contextEvoMenu === null
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
  const handleEvoClose = () => {
    setContextEvoMenu(null);
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

  const handleCardToCemeteryFromField = () => {
    handleClose();
    dispatch(
      placeToCemeteryFromField({
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
        <MenuItem onClick={() => handleCardToHandFromField()}>Hand</MenuItem>
        <MenuItem onClick={() => handleCardToCemeteryFromField()}>
          Cemetery
        </MenuItem>
        <MenuItem onClick={() => handleMoveOnField()}>Move</MenuItem>
        <MenuItem onClick={() => handleCardToTopDeck()}>Top of Deck</MenuItem>
        <MenuItem onClick={() => handleCardToBotDeck()}>Bot of Deck</MenuItem>
        {/* <MenuItem onClick={handleClose}>Graveyard</MenuItem> */}
      </Menu>
      <Menu
        open={contextEvoMenu !== null}
        onClose={handleEvoClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextEvoMenu !== null
            ? { top: contextEvoMenu.mouseY, left: contextEvoMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleReturnToEvolveDeck()}>Return</MenuItem>
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
        {/* Enemy Deck and Cemetery */}

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
          <div
            style={{
              cursor: `url(${img}) 55 55, auto`,
            }}
          >
            <img height={"160px"} src={cardback} alt={"cardback"} />
          </div>
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
            <motion.div
              key={`enemy1-${idx}`}
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
          cursor: ready && `url(${img}) 55 55, auto`,
        }}
      >
        <div
          style={{
            height: "40vh",
            width: "175px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",
            borderRadius: "10px",
            border: "2.5px solid #0000",
            cursor: `url(${img}) 55 55, auto`,
          }}
        >
          <EvoDeck
            setReadyToEvo={setReadyToEvo}
            setReadyToFeed={setReadyToFeed}
            setReady={setReady}
            setHovering={setHovering}
            ready={ready}
          />
        </div>

        <div
          style={{
            height: "40vh",
            minHeight: "330px",
            minWidth: "600px",
            width: "100%",
            backgroundColor: "black",
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            // backgroundColor: "rgba(0, 0, 255, 0.15)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            justifyItems: "center",
            zIndex: 10,
          }}
        >
          {reduxField.map((card, idx) => (
            <div key={`card-${idx}`}>
              {ready && (
                <motion.div
                  onClick={() => {
                    handleClick(reduxCurrentCard, idx);
                  }}
                  key={`player1-${idx}`}
                  whileHover={
                    {
                      // backgroundColor: "rgba(255, 252, 160, 0.3)",
                    }
                  }
                  style={{
                    height: "160px",
                    width: "115px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                  className={
                    (reduxField[idx] !== 0 &&
                      reduxEvoField[idx] === 0 &&
                      (readyToEvo || readyToFeed)) ||
                    (reduxField[idx] === 0 &&
                      !readyToEvo &&
                      !readyToFeed &&
                      "box")
                  }
                >
                  {card !== 0 && reduxEvoField[idx] === 0 && (
                    <Card
                      onField={true}
                      key={`card1-${idx}`}
                      name={card}
                      setHovering={setHovering}
                      ready={ready}
                    />
                  )}
                  {reduxEvoField[idx] !== 0 && (
                    <Card
                      onField={true}
                      key={`evo1-${idx}`}
                      name={reduxEvoField[idx]}
                      setHovering={setHovering}
                      ready={ready}
                    />
                  )}
                </motion.div>
              )}
              {!ready && (
                <motion.div
                  onContextMenu={(e) => {
                    if (card !== 0 && reduxEvoField[idx] === 0)
                      handleContextMenu(e, idx, card);
                    else handleEvoContextMenu(e, idx, card);
                  }}
                  key={`player2-${idx}`}
                  style={{
                    height: "160px",
                    width: "115px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {card !== 0 && reduxEvoField[idx] === 0 && (
                    <Card
                      onField={true}
                      key={`card2-${idx}`}
                      name={card}
                      setHovering={setHovering}
                      ready={ready}
                    />
                  )}
                  {reduxEvoField[idx] !== 0 && (
                    <Card
                      onField={true}
                      key={`evo2-${idx}`}
                      name={reduxEvoField[idx]}
                      setHovering={setHovering}
                      ready={ready}
                    />
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Deck and Cementery */}
        <div
          style={{
            height: "40vh",
            width: "175px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",
            cursor: `url(${img}) 55 55, auto`,
          }}
        >
          <Cemetery
            setReadyFromCemetery={setReadyFromCemetery}
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
