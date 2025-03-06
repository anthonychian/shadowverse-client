import React, { useState, useEffect } from "react";
import {
  placeToFieldFromHand,
  addToHandFromField,
  placeToTopOfDeckFromField,
  placeToBotOfDeckFromField,
  moveCardOnField,
  moveEvoAndBaseOnField,
  transferToOpponentField,
  placeToCemeteryFromField,
  placeToFieldFromDeck,
  placeToFieldFromCemetery,
  placeToFieldFromBanish,
  placeTokenOnField,
  placeToBanishFromField,
  removeTokenOnField,
  evolveCardOnField,
  feedCardOnField,
  backToEvolveDeck,
  setEnemyField,
  setEnemyEvoField,
  setEnemyEngaged,
  setEnemyCemetery,
  setEnemyEvoDeck,
  setEnemyCustomValues,
  showAtk,
  showDef,
  hideAtk,
  hideDef,
  modifyCounter,
  addAura,
  addBane,
  addWard,
  showStatus,
  hideStatus,
  duplicateCardOnField,
  clearValuesAtIndex,
  moveValuesAtIndex,
  moveCountersAtIndex,
  moveEngagedAtIndex,
  clearStatusAtIndex,
  moveStatusAtIndex,
  clearCountersAtIndex,
  clearEngagedAtIndex,
  setEnemyHand,
  setShowEnemyHand,
  setShowEnemyCard,
  setEnemyCard,
  setEnemyDeckSize,
  setEnemyEvoPoints,
  setEnemyPlayPoints,
  setEnemyHealth,
  setEnemyLeader,
  setEnemyCounter,
  setEnemyAura,
  setEnemyBanish,
  setEnemyViewingDeck,
  setEnemyViewingHand,
  setEnemyViewingCemetery,
  setEnemyViewingEvoDeck,
  setEnemyViewingCemeteryOpponent,
  setEnemyViewingEvoDeckOpponent,
  setEnemyViewingTopCards,
  setEnemyRematchStatus,
  // setArrow,
  // setEnemyArrow,
  setEnemyDice,
  setEnemyLog,
  setEnemyChat,
  setLastChatMessage,
  setEnemyLeaderActive,
  setField,
  setEnemyCardBack,
  setCardSelectedInHand,
  setEnemyCardSelectedInHand,
  setCardSelectedOnField,
  setEnemyCardSelectedOnField,
} from "../../redux/CardSlice";
import { cardImage } from "../../decks/getCards";
import { motion } from "framer-motion";
import CardMUI from "@mui/material/Card";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem, Modal, Box, Typography, Tooltip } from "@mui/material";
import Card from "../hand/Card";
import Deck from "./Deck";
import Cemetery from "./Cemetery";
import EnemyCemetery from "./EnemyCemetery";
// import cardback from "../../assets/cardbacks/default.png";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EvoDeck from "./EvoDeck";
import EnemyEvoDeck from "./EnemyEvoDeck";
import img from "../../assets/pin_bellringer_angel.png";
import "../../css/AnimatedBorder.css";
import { useNavigate } from "react-router-dom";
import { socket } from "../../sockets";
import Token from "./Token";
import Lesson from "./Lesson";
// import { PerfectArrow } from "./PerfectArrow";
import ShowDice from "./ShowDice";

import defaultCardBack from "../../assets/cardbacks/default.png";
import aeneaCardBack from "../../assets/cardbacks/aenea.png";
import dionneCardBack from "../../assets/cardbacks/dionne.png";
import dragonCardBack from "../../assets/cardbacks/dragon.png";
import fileneCardBack from "../../assets/cardbacks/filene.png";
import galmieuxCardBack from "../../assets/cardbacks/galmieux.png";
import jeanneCardBack from "../../assets/cardbacks/jeanne.png";
import kuonCardBack from "../../assets/cardbacks/kuon.png";
import ladicaCardBack from "../../assets/cardbacks/ladica.png";
import lishennaCardBack from "../../assets/cardbacks/lishenna.png";
import lishenna2CardBack from "../../assets/cardbacks/lishenna2.png";
import mistolinaCardBack from "../../assets/cardbacks/mistolina.png";
import monoCardBack from "../../assets/cardbacks/mono.png";
import orchisCardBack from "../../assets/cardbacks/orchis.png";
import piercyeCardBack from "../../assets/cardbacks/piercye.png";
import rosequeenCardBack from "../../assets/cardbacks/rosequeen.png";
import shikiCardBack from "../../assets/cardbacks/shiki.png";
import shutenCardBack from "../../assets/cardbacks/shuten.png";
import tidalgunnerCardBack from "../../assets/cardbacks/tidalgunner.png";
import viridiaCardBack from "../../assets/cardbacks/viridia.png";
import wilbertCardBack from "../../assets/cardbacks/wilbert.png";

const style = {
  position: "relative",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "transparent",
  boxShadow: 24,
  p: 3,
  width: "55%",
};

export default function Field({
  ready,
  setReady,
  setHovering,
  readyToPlaceOnFieldFromHand,
  setReadyToPlaceOnFieldFromHand,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // redux state
  const reduxRoom = useSelector((state) => state.card.room);
  const reduxField = useSelector((state) => state.card.field);
  const reduxCurrentCard = useSelector((state) => state.card.currentCard);
  const reduxCurrentCardIndex = useSelector(
    (state) => state.card.currentCardIndex
  );
  const reduxEvoField = useSelector((state) => state.card.evoField);
  const reduxEngaged = useSelector((state) => state.card.engagedField);
  const reduxCustomStatus = useSelector((state) => state.card.customStatus);
  const reduxCustomValues = useSelector((state) => state.card.customValues);
  const reduxEnemyCustomValues = useSelector(
    (state) => state.card.enemyCustomValues
  );
  const reduxEnemyField = useSelector((state) => state.card.enemyField);
  const reduxEnemyEvoField = useSelector((state) => state.card.enemyEvoField);
  const reduxEnemyEngaged = useSelector(
    (state) => state.card.enemyEngagedField
  );
  const reduxCurrentDeck = useSelector((state) => state.card.deck);
  const reduxCurrentRoom = useSelector((state) => state.card.room);
  const reduxEnemyHand = useSelector((state) => state.card.enemyHand);
  const reduxEnemyDeckSize = useSelector((state) => state.card.enemyDeckSize);
  const reduxShowEnemyHand = useSelector((state) => state.card.showEnemyHand);
  const reduxShowEnemyCard = useSelector((state) => state.card.showEnemyCard);
  const reduxEnemyCard = useSelector((state) => state.card.enemyCard);
  const reduxCounterField = useSelector((state) => state.card.counterField);
  const reduxEnemyCounterField = useSelector(
    (state) => state.card.enemyCounterField
  );
  const reduxAuraField = useSelector((state) => state.card.auraField);
  const reduxEnemyAuraField = useSelector((state) => state.card.enemyAuraField);
  const reduxBaneField = useSelector((state) => state.card.baneField);
  const reduxEnemyBaneField = useSelector((state) => state.card.enemyBaneField);
  const reduxWardField = useSelector((state) => state.card.wardField);
  const reduxEnemyWardField = useSelector((state) => state.card.enemyWardField);
  const reduxEnemyCardBack = useSelector((state) => state.card.enemyCardback);
  const reduxCardSelectedInHand = useSelector(
    (state) => state.card.cardSelectedInHand
  );
  const reduxCardSelectedOnField = useSelector(
    (state) => state.card.cardSelectedOnField
  );

  // useState
  const [cardback, setCardback] = useState();
  const [contextMenu, setContextMenu] = useState(null);
  const [contextEvoMenu, setContextEvoMenu] = useState(null);
  const [index, setIndex] = useState(0);
  const [deckIndex, setDeckIndex] = useState(0);
  const [name, setName] = useState("");
  const [readyToMoveOnField, setReadyToMoveOnField] = useState(false);
  const [readyToMoveEvoOnField, setReadyToMoveEvoOnField] = useState(false);
  const [readyToDuplicateOnField, setReadyToDuplicateOnField] = useState(false);
  const [readyFromDeck, setReadyFromDeck] = useState(false);
  const [readyFromCemetery, setReadyFromCemetery] = useState(false);
  const [readyFromBanish, setReadyFromBanish] = useState(false);
  const [readyToEvo, setReadyToEvo] = useState(false);
  const [readyToFeed, setReadyToFeed] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    socket.on("receive msg", (data) => {
      if (data.type === "field") dispatch(setEnemyField(data.data));
      else if (data.type === "evoField") dispatch(setEnemyEvoField(data.data));
      else if (data.type === "engaged") dispatch(setEnemyEngaged(data.data));
      else if (data.type === "cemetery") dispatch(setEnemyCemetery(data.data));
      else if (data.type === "evoDeck") dispatch(setEnemyEvoDeck(data.data));
      else if (data.type === "values")
        dispatch(setEnemyCustomValues(data.data));
      else if (data.type === "hand") dispatch(setEnemyHand(data.data));
      else if (data.type === "deckSize") dispatch(setEnemyDeckSize(data.data));
      else if (data.type === "evoPoints")
        dispatch(setEnemyEvoPoints(data.data));
      else if (data.type === "playPoints")
        dispatch(setEnemyPlayPoints(data.data));
      else if (data.type === "health") dispatch(setEnemyHealth(data.data));
      else if (data.type === "leader") dispatch(setEnemyLeader(data.data));
      else if (data.type === "showHand") dispatch(setShowEnemyHand(data.data));
      else if (data.type === "showCard") dispatch(setShowEnemyCard(data.data));
      else if (data.type === "cardRevealed") dispatch(setEnemyCard(data.data));
      else if (data.type === "transfer") dispatch(setField(data.data));
      else if (data.type === "counter") dispatch(setEnemyCounter(data.data));
      else if (data.type === "aura") dispatch(setEnemyAura(data.data));
      else if (data.type === "banish") dispatch(setEnemyBanish(data.data));
      else if (data.type === "viewingHand")
        dispatch(setEnemyViewingHand(data.data));
      else if (data.type === "viewingDeck")
        dispatch(setEnemyViewingDeck(data.data));
      else if (data.type === "viewingTopCards")
        dispatch(setEnemyViewingTopCards(data.data));
      else if (data.type === "viewingCemetery")
        dispatch(setEnemyViewingCemetery(data.data));
      else if (data.type === "viewingEvoDeck")
        dispatch(setEnemyViewingEvoDeck(data.data));
      else if (data.type === "viewingCemeteryOpponent")
        dispatch(setEnemyViewingCemeteryOpponent(data.data));
      else if (data.type === "viewingEvoDeckOpponent")
        dispatch(setEnemyViewingEvoDeckOpponent(data.data));
      // else if (data.type === "arrow") dispatch(setEnemyArrow(data.data));
      else if (data.type === "dice") dispatch(setEnemyDice(data.data));
      else if (data.type === "leaderActive")
        dispatch(setEnemyLeaderActive(data.data));
      else if (data.type === "log") dispatch(setEnemyLog(data.data));
      else if (data.type === "cardback") dispatch(setEnemyCardBack(data.data));
      else if (data.type === "rematch")
        dispatch(setEnemyRematchStatus(data.data));
      else if (data.type === "cardSelected")
        dispatch(setEnemyCardSelectedInHand(data.data));
      else if (data.type === "cardSelectedField")
        dispatch(setEnemyCardSelectedOnField(data.data));
      else if (data.type === "chat") {
        dispatch(setEnemyChat(data.data));
        dispatch(setLastChatMessage(data.data));
      }
    });
    return () => {
      socket.off("receive msg");
    };
  }, [socket]);

  useEffect(() => {
    if (reduxCurrentRoom.length === 0) {
      navigate("/");
    }
  }, [reduxCurrentRoom]);

  useEffect(() => {
    dispatch(setCardSelectedInHand(-1));
  }, [reduxEnemyHand]);

  useEffect(() => {
    dispatch(setCardSelectedOnField(-1));
  }, [reduxEnemyField]);

  const handleModalClose = () => {
    dispatch(setShowEnemyHand(false));
  };

  const handleShowCardModalClose = () => {
    dispatch(setShowEnemyCard(false));
  };

  const cardPos = (idx) => {
    if (idx === -1) return -1;
    else if (idx < 5) return idx + 5;
    else return idx - 5;
  };

  const isToken = (name) => {
    return name.slice(-5) === "TOKEN";
  };

  const handleClick = (name, indexClicked) => {
    if (reduxField[indexClicked] === 0 && !readyToEvo && !readyToFeed) {
      if (readyToPlaceOnFieldFromHand) {
        setReadyToPlaceOnFieldFromHand(false);
        dispatch(
          placeToFieldFromHand({
            card: reduxCurrentCard,
            indexInHand: reduxCurrentCardIndex,
            index: indexClicked,
          })
        );
      }
      if (tokenReady) {
        setTokenReady(false);
        dispatch(
          placeTokenOnField({
            card: name,
            index: indexClicked,
          })
        );
        // dispatch(clearValuesAtIndex(index));
        // dispatch(clearEngagedAtIndex(index));
        // dispatch(clearCountersAtIndex(index));
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
        dispatch(
          moveValuesAtIndex({
            prevIndex: index,
            index: indexClicked,
          })
        );
        dispatch(
          moveCountersAtIndex({
            prevIndex: index,
            index: indexClicked,
          })
        );
        dispatch(
          moveEngagedAtIndex({
            prevIndex: index,
            index: indexClicked,
          })
        );
        dispatch(
          moveStatusAtIndex({
            prevIndex: index,
            index: indexClicked,
          })
        );
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
      }
      if (readyToMoveEvoOnField) {
        setReadyToMoveEvoOnField(false);
        dispatch(
          moveEvoAndBaseOnField({
            card: name,
            evoCard: name,
            prevIndex: index,
            index: indexClicked,
          })
        );
        dispatch(
          moveValuesAtIndex({
            prevIndex: index,
            index: indexClicked,
          })
        );
        dispatch(
          moveCountersAtIndex({
            prevIndex: index,
            index: indexClicked,
          })
        );
        dispatch(
          moveEngagedAtIndex({
            prevIndex: index,
            index: indexClicked,
          })
        );
        dispatch(
          moveStatusAtIndex({
            prevIndex: index,
            index: indexClicked,
          })
        );
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
      }
      if (readyToDuplicateOnField) {
        setReadyToDuplicateOnField(false);
        dispatch(
          duplicateCardOnField({
            card: name,
            index: indexClicked,
          })
        );
        dispatch(
          moveValuesAtIndex({
            prevIndex: index,
            index: indexClicked,
          })
        );
        // dispatch(clearValuesAtIndex(indexClicked));
        dispatch(clearEngagedAtIndex(indexClicked));
        dispatch(clearCountersAtIndex(indexClicked));
      }
      if (readyFromDeck) {
        setReadyFromDeck(false);
        console.log("name", name);
        console.log("indexClicked", indexClicked);
        dispatch(
          placeToFieldFromDeck({
            card: name,
            index: indexClicked,
            deckIndex: deckIndex,
          })
        );
      }
      if (readyFromCemetery) {
        setReadyFromCemetery(false);
        dispatch(
          placeToFieldFromCemetery({
            card: name,
            indexInHand: reduxCurrentCardIndex,
            index: indexClicked,
          })
        );
      }
      if (readyFromBanish) {
        setReadyFromBanish(false);
        dispatch(
          placeToFieldFromBanish({
            card: name,
            indexInHand: reduxCurrentCardIndex,
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
      setReadyFromBanish(false);
      setReadyToPlaceOnFieldFromHand(false);
      setReadyToMoveOnField(false);
      setReadyToMoveEvoOnField(false);
      setTokenReady(false);
    }
    setReady(false);
  };

  const cancelClick = () => {
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
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };
  const handleCardToTopDeck = () => {
    handleClose();
    dispatch(
      placeToTopOfDeckFromField({
        card: name,
        index: index,
      })
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };
  const handleCardToBotDeck = () => {
    handleClose();
    dispatch(
      placeToBotOfDeckFromField({
        card: name,
        index: index,
      })
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };
  const handleRemoveTokenFromField = () => {
    handleClose();
    dispatch(
      removeTokenOnField({
        card: name,
        index: index,
      })
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };
  const handleDuplicateToken = () => {
    handleClose();
    setReady(true);
    setReadyToDuplicateOnField(true);
  };

  const handleCardToCemetery = () => {
    handleClose();
    dispatch(
      placeToCemeteryFromField({
        card: name,
        index: index,
      })
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };
  const handleCardToBanish = () => {
    handleClose();
    dispatch(
      placeToBanishFromField({
        card: name,
        index: index,
      })
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };

  const handleShowAtkDef = () => {
    handleClose();
    handleEvoClose();
    dispatch(showAtk(index));
    dispatch(showDef(index));
  };

  const handleHideAtkDef = () => {
    handleClose();
    handleEvoClose();
    dispatch(hideAtk(index));
    dispatch(hideDef(index));
  };

  const handleShowStatus = () => {
    // handleClose();
    // handleEvoClose();
    dispatch(showStatus(index));
  };

  const handleHideStatus = () => {
    // handleClose();
    // handleEvoClose();
    dispatch(hideStatus(index));
  };

  const handleAddCounter = () => {
    handleClose();
    handleEvoClose();
    dispatch(
      modifyCounter({
        value: 1,
        index: index,
      })
    );
  };

  const handleAddAura = () => {
    handleClose();
    handleEvoClose();
    dispatch(
      addAura({
        value: 1,
        index: index,
      })
    );
  };
  const handleRemoveAura = () => {
    handleClose();
    handleEvoClose();
    dispatch(
      addAura({
        value: 0,
        index: index,
      })
    );
    dispatch(hideStatus(index));
  };
  const handleAddBane = () => {
    handleClose();
    handleEvoClose();
    dispatch(
      addBane({
        value: 1,
        index: index,
      })
    );
  };
  const handleRemoveBane = () => {
    handleClose();
    handleEvoClose();
    dispatch(
      addBane({
        value: 0,
        index: index,
      })
    );
    dispatch(hideStatus(index));
  };
  const handleAddWard = () => {
    handleClose();
    handleEvoClose();
    dispatch(
      addWard({
        value: 1,
        index: index,
      })
    );
  };
  const handleRemoveWard = () => {
    handleClose();
    handleEvoClose();
    dispatch(
      addWard({
        value: 0,
        index: index,
      })
    );
    dispatch(hideStatus(index));
  };

  const handleMoveOnField = () => {
    handleClose();
    setReady(true);
    setReadyToMoveOnField(true);
  };
  const handleMoveEvoOnField = () => {
    handleEvoClose();
    setReady(true);
    setReadyToMoveEvoOnField(true);
  };

  const handleTransfer = () => {
    handleClose();
    dispatch(
      transferToOpponentField({
        card: name,
        prevIndex: index,
      })
    );
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

  const handleSelectEnemyCardInHand = (idx) => {
    if (idx === reduxCardSelectedInHand) dispatch(setCardSelectedInHand(-1));
    else dispatch(setCardSelectedInHand(idx));
  };

  const handleSelectEnemyCardOnField = (idx) => {
    if (idx === reduxCardSelectedOnField) dispatch(setCardSelectedOnField(-1));
    else dispatch(setCardSelectedOnField(idx));
  };

  useEffect(() => {
    switch (reduxEnemyCardBack) {
      case "Aenea":
        setCardback(aeneaCardBack);
        break;
      case "Dionne":
        setCardback(dionneCardBack);
        break;
      case "Dragon":
        setCardback(dragonCardBack);
        break;
      case "Filene":
        setCardback(fileneCardBack);
        break;
      case "Galmieux":
        setCardback(galmieuxCardBack);
        break;
      case "Jeanne":
        setCardback(jeanneCardBack);
        break;
      case "Kuon":
        setCardback(kuonCardBack);
        break;
      case "Ladica":
        setCardback(ladicaCardBack);
        break;
      case "Lishenna":
        setCardback(lishennaCardBack);
        break;
      case "Lishenna2":
        setCardback(lishenna2CardBack);
        break;
      case "Mistolina":
        setCardback(mistolinaCardBack);
        break;
      case "Mono":
        setCardback(monoCardBack);
        break;
      case "Orchis":
        setCardback(orchisCardBack);
        break;
      case "Piercye":
        setCardback(piercyeCardBack);
        break;
      case "RoseQueen":
        setCardback(rosequeenCardBack);
        break;
      case "Shikigami":
        setCardback(shikiCardBack);
        break;
      case "Shuten":
        setCardback(shutenCardBack);
        break;
      case "TidalGunner":
        setCardback(tidalgunnerCardBack);
        break;
      case "Viridia":
        setCardback(viridiaCardBack);
        break;
      case "Wilbert":
        setCardback(wilbertCardBack);
        break;
      default:
        setCardback(defaultCardBack);
    }
  }, [reduxEnemyCardBack]);

  return (
    <>
      <Tooltip title="Copy" placement="top">
        <div
          style={{
            backgroundColor: "black",
            color: "white",
            height: "40px",
            minWidth: "150px",
            position: "absolute",
            fontSize: "20px ",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: ".5em",
            bottom: 3,
            left: 0,
            // pointerEvents: "auto",
            cursor: "pointer",
          }}
          onClick={() => {
            navigator.clipboard.writeText(reduxCurrentRoom);
          }}
        >
          <div>{reduxCurrentRoom}</div>

          <ContentCopyIcon sx={{ fontSize: "20px" }} />
        </div>
      </Tooltip>
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
        {isToken(name) && (
          <MenuItem onClick={handleRemoveTokenFromField}>Remove</MenuItem>
        )}
        {isToken(name) && (
          <MenuItem onClick={handleDuplicateToken}>Duplicate</MenuItem>
        )}
        {!isToken(name) && (
          <MenuItem onClick={handleCardToHandFromField}>Hand</MenuItem>
        )}
        {!isToken(name) && (
          <MenuItem onClick={handleCardToCemetery}>Cemetery</MenuItem>
        )}

        {!reduxCustomValues[index].showAtk && (
          <MenuItem onClick={handleShowAtkDef}>Modify Atk/Def</MenuItem>
        )}
        {reduxCustomValues[index].showAtk && (
          <MenuItem onClick={handleHideAtkDef}>Hide Atk/Def</MenuItem>
        )}
        {!reduxCustomStatus[index] && (
          <MenuItem onClick={handleShowStatus}>Add Status</MenuItem>
        )}
        {reduxCustomStatus[index] && (
          <MenuItem onClick={handleHideStatus}>Hide Status</MenuItem>
        )}
        {reduxCounterField[index] < 1 && reduxCustomStatus[index] && (
          <MenuItem onClick={handleAddCounter}>Add Counter</MenuItem>
        )}
        {reduxAuraField[index] === 0 &&
          reduxBaneField[index] === 0 &&
          reduxWardField[index] === 0 &&
          reduxCustomStatus[index] && (
            <MenuItem onClick={handleAddAura}>Add Aura</MenuItem>
          )}
        {reduxAuraField[index] === 0 &&
          reduxBaneField[index] === 0 &&
          reduxWardField[index] === 0 &&
          reduxCustomStatus[index] && (
            <MenuItem onClick={handleAddBane}>Add Bane</MenuItem>
          )}
        {reduxAuraField[index] === 0 &&
          reduxBaneField[index] === 0 &&
          reduxWardField[index] === 0 &&
          reduxCustomStatus[index] && (
            <MenuItem onClick={handleAddWard}>Add Ward</MenuItem>
          )}
        {reduxAuraField[index] === 1 && reduxCustomStatus[index] && (
          <MenuItem onClick={handleRemoveAura}>Remove Aura</MenuItem>
        )}
        {reduxBaneField[index] === 1 && reduxCustomStatus[index] && (
          <MenuItem onClick={handleRemoveBane}>Remove Bane</MenuItem>
        )}
        {reduxWardField[index] === 1 && reduxCustomStatus[index] && (
          <MenuItem onClick={handleRemoveWard}>Remove Ward</MenuItem>
        )}
        <MenuItem onClick={handleMoveOnField}>Move</MenuItem>
        <MenuItem onClick={handleTransfer}>Transfer</MenuItem>
        {!isToken(name) && (
          <MenuItem onClick={handleCardToBanish}>Banish</MenuItem>
        )}
        {!isToken(name) && (
          <MenuItem onClick={handleCardToTopDeck}>Top of Deck</MenuItem>
        )}
        {!isToken(name) && (
          <MenuItem onClick={handleCardToBotDeck}>Bot of Deck</MenuItem>
        )}
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
        <MenuItem onClick={handleMoveEvoOnField}>Move</MenuItem>
        {!reduxCustomValues[index].showAtk && (
          <MenuItem onClick={handleShowAtkDef}>Modify Atk/Def</MenuItem>
        )}
        {reduxCustomValues[index].showAtk && (
          <MenuItem onClick={handleHideAtkDef}>Hide Atk/Def</MenuItem>
        )}
        {reduxCounterField[index] < 1 && (
          <MenuItem onClick={handleAddCounter}>Add Counter</MenuItem>
        )}
      </Menu>

      {/* Show Enemy Hand Modal */}

      <Modal
        open={reduxShowEnemyHand}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          "& > .MuiBackdrop-root": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box sx={style}>
          <Typography
            sx={{
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "Noto Serif JP, serif",
              fontSize: "20px",
            }}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Viewing Opponent's Hand
          </Typography>
          <CardMUI
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              minHeight: "250px",
              padding: "3%",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
            variant="outlined"
          >
            {reduxEnemyHand.map((card, idx) => (
              <div key={`card-${idx}`}>
                <Card name={card} setHovering={setHovering} />
              </div>
            ))}
          </CardMUI>
        </Box>
      </Modal>

      {/* Show Enemy Card Modal */}

      <Modal
        open={reduxShowEnemyCard}
        onClose={handleShowCardModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          "& > .MuiBackdrop-root": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "transparent",
            boxShadow: 24,
            // p: 3,
            width: 0,
            border: "none",
          }}
        >
          <CardMUI
            sx={{
              backgroundColor: "transparent",
              width: "100%",
              // height: "80vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "none",
              overflow: "visible",
            }}
            variant="outlined"
          >
            <motion.div
              initial={{ scale: 1.0, rotateY: 180 }}
              transition={{ duration: 0.8 }}
              animate={{ scale: 4.5, rotateY: 0 }}
              // variants={{
              //   start: {
              //     scale: 4.5,
              //     rotateY: [0, 360],
              //     transition: {
              //       duration: 0.8,
              //       ease: "linear",
              //     },
              //   },
              // }}
              // animate={["start"]}
            >
              <img
                height={"160px"}
                src={cardImage(reduxEnemyCard)}
                alt={reduxEnemyCard}
              />
            </motion.div>
            {/* <motion.div
              initial={{ scale: 1.0, rotateY: 180 }}
              transition={{ duration: 0.8 }}
              animate={{ scale: 4.5, rotateY: 0 }}
            >
              <img
                height={"160px"}
                src={cardImage(reduxEnemyCard)}
                alt={reduxEnemyCard}
              />
            </motion.div> */}
          </CardMUI>
        </Box>
      </Modal>

      {/* Enemy */}
      <div
        style={{
          // backgroundColor: "yellow",
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: "130px",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: "2em",
          // marginTop: "-2em",
          // zIndex: 100,
        }}
      >
        {reduxEnemyHand.map((_, idx) => (
          <img
            style={
              reduxCardSelectedInHand === idx
                ? {
                    filter:
                      "sepia() saturate(4) hue-rotate(315deg) brightness(100%) opacity(5)",
                    cursor: `url(${img}) 55 55, auto`,
                  }
                : { cursor: `url(${img}) 55 55, auto` }
            }
            key={idx}
            height={"160px"}
            src={cardback}
            alt={"cardback"}
            onClick={() => handleSelectEnemyCardInHand(idx)}
          />
        ))}
      </div>

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
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            // background: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
            // style={{
            //   cursor: `url(${img}) 55 55, auto`,
            // }}
            >
              <img height={"160px"} src={cardback} alt={"cardback"} />
            </div>
            {/* {showOpponentDeckSize && ( */}
            <div
              style={{
                width: "50px",
                position: "absolute",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                top: "5%",
                right: "30%",
                color: "rgba(255, 255, 255, 1)",
                fontSize: "30px",
                fontFamily: "Noto Serif JP, serif",
              }}
            >
              {reduxEnemyDeckSize}
            </div>
            {/* )} */}
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
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            // background: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            justifyItems: "center",
            // zIndex: 0,
          }}
        >
          {/* <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              top: "35%",
              width: "50px",
              pointerEvents: "none",
            }}
          >
            Field
          </span>
          <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              top: "18%",
              width: "100px",
              pointerEvents: "none",
            }}
          >
            EX Area
          </span> */}
          {reduxField.map((x, idx) => (
            <motion.div
              key={`enemy1-${idx}`}
              style={{
                height: "160px",
                width: "115px",
                // backgroundColor: "#131219",
                // borderRadius: "10px",
                // border: "4px solid #555559",
              }}
              onClick={() => handleSelectEnemyCardOnField(cardPos(idx))}
            >
              {/* {reduxEnemyArrow.show &&
                reduxEnemyArrow.idx === idx &&
                (reduxEnemyField[idx] !== 0 ||
                  reduxEnemyEvoField[idx] !== 0) && (
                  <PerfectArrow
                    pos={initialArrowPos}
                    idx={reduxEnemyArrow.idx}
                    distance={{ x: reduxEnemyArrow.x, y: reduxEnemyArrow.y }}
                    onEnemyField={true}
                  />
                )} */}

              {reduxEnemyField[cardPos(idx)] !== 0 &&
                reduxEnemyEvoField[cardPos(idx)] === 0 && (
                  <Card
                    atkVal={reduxEnemyCustomValues[cardPos(idx)].atk}
                    defVal={reduxEnemyCustomValues[cardPos(idx)].def}
                    showAtk={reduxEnemyCustomValues[cardPos(idx)].showAtk}
                    showDef={reduxEnemyCustomValues[cardPos(idx)].showDef}
                    engaged={reduxEnemyEngaged[cardPos(idx)]}
                    counterVal={reduxEnemyCounterField[cardPos(idx)]}
                    aura={reduxEnemyAuraField[cardPos(idx)]}
                    bane={reduxEnemyBaneField[cardPos(idx)]}
                    ward={reduxEnemyWardField[cardPos(idx)]}
                    opponentField={true}
                    onField={true}
                    idx={idx}
                    key={`enemy-card-${cardPos(idx)}`}
                    name={reduxEnemyField[cardPos(idx)]}
                    setHovering={setHovering}
                    ready={ready}
                  />
                )}
              {reduxEnemyEvoField[cardPos(idx)] !== 0 && (
                <Card
                  atkVal={reduxEnemyCustomValues[cardPos(idx)].atk}
                  defVal={reduxEnemyCustomValues[cardPos(idx)].def}
                  showAtk={reduxEnemyCustomValues[cardPos(idx)].showAtk}
                  showDef={reduxEnemyCustomValues[cardPos(idx)].showDef}
                  engaged={reduxEnemyEngaged[cardPos(idx)]}
                  counterVal={reduxEnemyCounterField[cardPos(idx)]}
                  aura={reduxEnemyAuraField[cardPos(idx)]}
                  bane={reduxEnemyBaneField[cardPos(idx)]}
                  ward={reduxEnemyWardField[cardPos(idx)]}
                  opponentField={true}
                  onField={true}
                  idx={idx}
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
            // background: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",

            // cursor: `url(${img}) 55 55, auto`,
          }}
        >
          <EnemyEvoDeck setHovering={setHovering} ready={ready} />
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
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <EvoDeck
            setReadyToEvo={setReadyToEvo}
            setReadyToFeed={setReadyToFeed}
            setReady={setReady}
            setHovering={setHovering}
            ready={ready}
          />
          <ShowDice />
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Token
              setReady={setReady}
              setHovering={setHovering}
              ready={ready}
              setTokenReady={setTokenReady}
            />
            {/* <Lesson /> */}
          </div>
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
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            // padding: "2em",
            // background: "linear-gradient(to top, #09203f 0%, #537895 100%)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            justifyItems: "center",
            // zIndex: 0,
          }}
        >
          <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              bottom: "45%",
              width: "50px",
              pointerEvents: "none",
            }}
          >
            Field
          </span>
          <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              bottom: "28%",
              width: "100px",
              pointerEvents: "none",
            }}
          >
            EX Area
          </span>
          {reduxField.map((card, idx) => (
            <div key={`card-${idx}`}>
              {ready && (
                <motion.div
                  onClick={() => {
                    handleClick(reduxCurrentCard, idx);
                  }}
                  onContextMenu={() => {
                    cancelClick();
                  }}
                  key={`player1-${idx}`}
                  style={{
                    height: "160px",
                    width: "115px",
                    // backgroundColor: "rgba(255, 255, 255, 0.1)",
                    // backgroundColor: "#131219",
                    // borderRadius: "10px",
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
                      showAtk={reduxCustomValues[idx].showAtk}
                      showDef={reduxCustomValues[idx].showDef}
                      atkVal={reduxCustomValues[idx].atk}
                      defVal={reduxCustomValues[idx].def}
                      engaged={reduxEngaged[idx]}
                      counterVal={reduxCounterField[idx]}
                      aura={reduxAuraField[idx]}
                      bane={reduxBaneField[idx]}
                      ward={reduxWardField[idx]}
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
                      showAtk={reduxCustomValues[idx].showAtk}
                      showDef={reduxCustomValues[idx].showDef}
                      atkVal={reduxCustomValues[idx].atk}
                      defVal={reduxCustomValues[idx].def}
                      engaged={reduxEngaged[idx]}
                      counterVal={reduxCounterField[idx]}
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
                <div
                  onContextMenu={(e) => {
                    if (reduxField[idx] !== 0 && reduxEvoField[idx] === 0)
                      handleContextMenu(e, idx, reduxField[idx]);
                    else if (reduxField[idx] !== 0)
                      handleEvoContextMenu(e, idx, reduxEvoField[idx]);
                  }}
                  // onMouseDown={(event) => handleShowArrow(event, idx)}
                  // onMouseUp={(event) => handleHideArrow(event, idx)}
                  // onMouseMove={(event) => handleMouseMove(event, idx)}
                  key={`player2-${idx}`}
                  style={{
                    height: "160px",
                    width: "115px",
                  }}
                >
                  {/* {showArrow[idx] &&
                    (reduxField[idx] !== 0 || reduxEvoField[idx] !== 0) && (
                      <PerfectArrow
                        pos={initialArrowPos}
                        idx={idx}
                        distance={distance}
                      />
                    )} */}
                  {reduxField[idx] !== 0 && reduxEvoField[idx] === 0 && (
                    <Card
                      showAtk={reduxCustomValues[idx].showAtk}
                      showDef={reduxCustomValues[idx].showDef}
                      atkVal={reduxCustomValues[idx].atk}
                      defVal={reduxCustomValues[idx].def}
                      engaged={reduxEngaged[idx]}
                      counterVal={reduxCounterField[idx]}
                      aura={reduxAuraField[idx]}
                      bane={reduxBaneField[idx]}
                      ward={reduxWardField[idx]}
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
                      showAtk={reduxCustomValues[idx].showAtk}
                      showDef={reduxCustomValues[idx].showDef}
                      atkVal={reduxCustomValues[idx].atk}
                      defVal={reduxCustomValues[idx].def}
                      engaged={reduxEngaged[idx]}
                      counterVal={reduxCounterField[idx]}
                      aura={reduxAuraField[idx]}
                      bane={reduxBaneField[idx]}
                      ward={reduxWardField[idx]}
                      idx={idx}
                      onField={true}
                      key={`evo2-${idx}`}
                      name={reduxEvoField[idx]}
                      setHovering={setHovering}
                      ready={ready}
                      cardBeneath={reduxField[idx]}
                    />
                  )}
                </div>
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
            zIndex: 0,
            // background: "linear-gradient(to top, #09203f 0%, #537895 100%)",
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",
            // cursor: `url(${img}) 55 55, auto`,
          }}
        >
          <Cemetery
            setReadyFromCemetery={setReadyFromCemetery}
            setReadyFromBanish={setReadyFromBanish}
            setReady={setReady}
            setHovering={setHovering}
            ready={ready}
          />
          <div style={{ zIndex: -1, position: "relative" }}>
            <Deck
              setHovering={setHovering}
              ready={ready}
              setReadyFromDeck={setReadyFromDeck}
              setReady={setReady}
              setDeckIndex={setDeckIndex}
            />
            {/* {showOpponentDeckSize && ( */}
            <div
              style={{
                position: "absolute",
                width: "50px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                top: "65%",
                right: "30%",
                color: "rgba(255, 255, 255, 1)",
                fontSize: "30px",
                fontFamily: "Noto Serif JP, serif",
              }}
            >
              {reduxCurrentDeck.length || 0}
            </div>
            {/* )} */}
          </div>
        </div>
      </div>
    </>
  );
}
