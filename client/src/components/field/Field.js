import React, { useState, useEffect } from "react";
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
  backToEvolveDeck,
  setEnemyField,
  setEnemyEvoField,
  setEnemyEngaged,
  setEnemyCemetery,
  setEnemyEvoDeck,
} from "../../redux/CardSlice";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem } from "@mui/material";
import Card from "../hand/Card";
import Deck from "./Deck";
import Cemetery from "./Cemetery";
import EnemyCemetery from "./EnemyCemetery";
import cardback from "../../assets/cardbacks/sleeve_5010011.png";
import EvoDeck from "./EvoDeck";
import EnemyEvoDeck from "./EnemyEvoDeck";
import img from "../../assets/pin_bellringer_angel.png";
import "../../css/AnimatedBorder.css";

import { socket } from "../../sockets";

export default function Field({
  dragging,
  ready,
  setReady,
  setHovering,
  readyToPlaceOnFieldFromHand,
  setReadyToPlaceOnFieldFromHand,
}) {
  const dispatch = useDispatch();
  const reduxField = useSelector((state) => state.card.field);
  const reduxCurrentCard = useSelector((state) => state.card.currentCard);
  const reduxEvoField = useSelector((state) => state.card.evoField);
  // const reduxEvoDeck = useSelector((state) => state.card.evoDeck);
  const reduxEnemyField = useSelector((state) => state.card.enemyField);
  const reduxEnemyEvoField = useSelector((state) => state.card.enemyEvoField);
  const reduxEnemyEngaged = useSelector(
    (state) => state.card.enemyEngagedField
  );
  const [contextMenu, setContextMenu] = React.useState(null);
  const [contextEvoMenu, setContextEvoMenu] = React.useState(null);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("");
  const [readyToMoveOnField, setReadyToMoveOnField] = useState(false);
  const [readyFromCemetery, setReadyFromCemetery] = useState(false);
  const [readyToEvo, setReadyToEvo] = useState(false);
  const [readyToFeed, setReadyToFeed] = useState(false);

  useEffect(() => {
    socket.on("receive msg", (data) => {
      if (data.type === "field") dispatch(setEnemyField(data.data));
      else if (data.type === "evoField") dispatch(setEnemyEvoField(data.data));
      else if (data.type === "engaged") dispatch(setEnemyEngaged(data.data));
      else if (data.type === "cemetery") dispatch(setEnemyCemetery(data.data));
      else if (data.type === "evoDeck") dispatch(setEnemyEvoDeck(data.data));
    });
  }, [socket]);

  const cardPos = (idx) => {
    if (idx < 5) return idx + 5;
    else return idx - 5;
  };

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
            carrots: 1,
          })
        );
      }
    } else if (
      readyToFeed &&
      reduxField[indexClicked] !== 0 &&
      reduxEvoField[indexClicked].slice(0, 6) === "Carrot"
    ) {
      dispatch(
        feedCardOnField({
          card: name,
          index: indexClicked,
          carrots: 2,
        })
      );
    } else {
      console.log("there is already a card here");
      setReadyToEvo(false);
      setReadyToFeed(false);
      setReadyFromCemetery(false);
      setReadyToPlaceOnFieldFromHand(false);
      setReadyToMoveOnField(false);
    }
    setReady(false);
    // sendMsg();
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
    setIndex(index);
    setName(name);
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

  const handleReturnToEvolveDeck = () => {
    handleEvoClose();
    dispatch(
      backToEvolveDeck({
        card: name,
        index: index,
      })
    );
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

      {/* Enemy */}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: "330px",
          alignItems: "end",
        }}
      >
        {/* Enemy Deck and Cemetery */}

        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            width: "175px",
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "black",
            // backgroundColor: "#131219",
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
          <EnemyCemetery setHovering={setHovering} ready={ready} />
        </div>

        {/* Enemy Field (1-5) & Ex Area (6-10) */}
        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            minWidth: "600px",
            width: "100%",
            // backgroundColor: "black",
            // backgroundColor: "#131219",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
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
                // backgroundColor: "rgba(255, 255, 255, 0.1)",
                backgroundColor: "#131219",
                borderRadius: "10px",
                // border: "4px solid #0000",
                // border: "4px solid #1a20d6c8",
                border: "4px solid #555559",
                // backgroundColor: "rgba(0, 0, 0, 0.20)",
                // backgroundColor: "rgba(255, 0, 0, 0.15)",
              }}
            >
              {reduxEnemyField[cardPos(idx)] !== 0 &&
                reduxEnemyEvoField[cardPos(idx)] === 0 && (
                  <Card
                    engaged={reduxEnemyEngaged[cardPos(idx)]}
                    onField={true}
                    key={`enemy-card-${cardPos(idx)}`}
                    name={reduxEnemyField[cardPos(idx)]}
                    setHovering={setHovering}
                    ready={ready}
                  />
                )}
              {reduxEnemyEvoField[cardPos(idx)] !== 0 && (
                <Card
                  engaged={reduxEnemyEngaged[cardPos(idx)]}
                  onField={true}
                  key={`enemy-evo-${cardPos(idx)}`}
                  name={reduxEnemyEvoField[cardPos(idx)]}
                  setHovering={setHovering}
                  ready={ready}
                  cardBeneath={reduxEnemyField[cardPos(idx)]}
                />
              )}
            </motion.div>
          ))}
        </div>
        {/* Enemy Evolve Deck */}
        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            width: "175px",
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "black",
            // backgroundColor: "#131219",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",

            cursor: `url(${img}) 55 55, auto`,
          }}
        >
          <EnemyEvoDeck setHovering={setHovering} ready={ready} />
          {/* <div
            style={{
              height: "160px",
              width: "115px",
              cursor: `url(${img}) 55 55, auto`,
            }}
          >
            <img height={"160px"} src={cardback} alt={"cardback"} />
          </div> */}
        </div>
      </div>

      {/* Player */}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: "330px",
          cursor: ready && `url(${img}) 55 55, auto`,
        }}
      >
        {/* Player Evolve Deck */}
        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            width: "175px",
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "black",
            // backgroundColor: "#131219",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",

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
        {/* Player Field (1-5) & Ex Area (6-10) */}
        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            minWidth: "600px",
            width: "100%",
            // backgroundColor: "black",
            // backgroundColor: "#131219",
            backgroundColor: "rgba(0, 0, 0, 0.60)",
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
                  style={{
                    height: "160px",
                    width: "115px",
                    // backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backgroundColor: "#131219",
                    borderRadius: "10px",
                  }}
                  className={
                    reduxField[idx] !== 0 &&
                    reduxEvoField[idx] === 0 &&
                    (readyToEvo || readyToFeed)
                      ? "box"
                      : reduxField[idx] === 0 && !readyToEvo && !readyToFeed
                      ? "box"
                      : "none"
                  }
                >
                  {reduxField[idx] !== 0 && reduxEvoField[idx] === 0 && (
                    <Card
                      idx={idx}
                      onField={true}
                      key={`card1-${idx}`}
                      name={card}
                      setHovering={setHovering}
                      ready={ready}
                    />
                  )}
                  {reduxEvoField[idx] !== 0 && (
                    <Card
                      idx={idx}
                      onField={true}
                      key={`evo1-${idx}`}
                      name={reduxEvoField[idx]}
                      setHovering={setHovering}
                      ready={ready}
                      cardBeneath={reduxField[idx]}
                    />
                  )}
                </motion.div>
              )}
              {!ready && (
                <motion.div
                  onContextMenu={(e) => {
                    if (reduxField[idx] !== 0 && reduxEvoField[idx] === 0)
                      handleContextMenu(e, idx, reduxField[idx]);
                    else handleEvoContextMenu(e, idx, reduxEvoField[idx]);
                  }}
                  key={`player2-${idx}`}
                  style={{
                    height: "160px",
                    width: "115px",
                    // backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    backgroundColor: "#131219",
                    // border: "4px solid #0000",
                    border: "4px solid #555559",
                  }}
                >
                  {reduxField[idx] !== 0 && reduxEvoField[idx] === 0 && (
                    <Card
                      idx={idx}
                      onField={true}
                      key={`card2-${idx}`}
                      name={reduxField[idx]}
                      setHovering={setHovering}
                      ready={ready}
                    />
                  )}
                  {reduxEvoField[idx] !== 0 && (
                    <Card
                      idx={idx}
                      onField={true}
                      key={`evo2-${idx}`}
                      name={reduxEvoField[idx]}
                      setHovering={setHovering}
                      ready={ready}
                      cardBeneath={reduxField[idx]}
                    />
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Player Deck and Cementery */}
        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            width: "175px",
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "black",
            // backgroundColor: "#131219",
            zIndex: 1,
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
          <Deck setHovering={setHovering} ready={ready} />
        </div>
      </div>
    </>
  );
}
