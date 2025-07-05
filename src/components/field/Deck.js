import React, { useState, useEffect } from "react";
import { socket } from "../../sockets";
import { useDispatch, useSelector } from "react-redux";
import {
  drawFromDeck,
  shuffleDeck,
  mulliganFour,
  drawFourFromDeck,
  shuffleCards,
  addToHandFromDeck,
  addToHandFromDeckWithoutRevealing,
  addToTopOfDeckFromDeck,
  addToBotOfDeckFromDeck,
  addToCemeteryFromDeck,
  addToCemeteryFromTopOfDeck,
  addToBanishFromDeck,
  setViewingDeck,
  setViewingTopCards,
  setViewingCardsLog,
  setViewingDeckLog,
} from "../../redux/CardSlice";
import { Menu, MenuItem, Modal, Box, Popover } from "@mui/material";

import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";

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
import "../../css/Card.css";

const img = require("../../assets/pin_bellringer_angel.png");

const style = {
  position: "relative",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "transparent",
  width: "40%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};

export default function Deck({
  ready,
  setHovering,
  setReadyFromDeck,
  setReady,
  setDeckIndex,
}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [index, setIndex] = useState(0);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [cardContextMenu, setCardContextMenu] = React.useState(null);
  const [reveal, setReveal] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [partialDeck, setPartialDeck] = useState([]);

  const [cardback, setCardback] = useState();
  const reduxCardBack = useSelector((state) => state.card.cardback);

  const reduxDeck = useSelector((state) => state.card.deck);
  const reduxRoom = useSelector((state) => state.card.room);

  // popover
  const [anchorEl, setAnchorEl] = React.useState(null);
  const popoverOpen = Boolean(anchorEl);
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.target);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleModalOpen = () => {
    if (reduxDeck.length > 0 && !ready) {
      setOpen(true);
      dispatch(setViewingDeck(true));
    }
  };

  const handleModalRevealOpen = () => {
    if (reduxDeck.length > 0 && !ready) {
      setOpen(true);
      dispatch(setViewingTopCards(true));
    }
  };

  const handleModalClose = () => {
    setOpen(false);
    if (reveal) {
      setReveal(false);
      setTextInput("");
      setPartialDeck([]);
      dispatch(setViewingTopCards(false));
    } else {
      dispatch(setViewingDeck(false));
      // dispatch(shuffleDeck());
    }
  };

  const handleTextInput = (text) => {
    setTextInput(text);
  };

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
  const handleCardContextMenu = (event, name, index) => {
    setName(name);
    setIndex(index);
    setDeckIndex(index);
    // console.log(index);
    event.preventDefault();
    setCardContextMenu(
      cardContextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };

  const handleCardClose = () => {
    setCardContextMenu(null);
  };

  const handleViewDeck = () => {
    handlePopoverClose();
    handleModalOpen();
    dispatch(setViewingDeckLog());
  };
  const handleRevealDeck = () => {
    setReveal(true);
    handlePopoverClose();
    handleModalRevealOpen();
  };

  const handleShuffle = () => {
    // handlePopoverClose();
    dispatch(shuffleDeck());
  };

  const handleMulligan = () => {
    // handlePopoverClose();
    dispatch(mulliganFour());
  };

  const handleDraw = () => {
    dispatch(drawFromDeck());
  };

  const handleDrawFour = () => {
    // handlePopoverClose();
    dispatch(drawFourFromDeck());
  };

  const handleShuffleHand = () => {
    dispatch(shuffleCards());
  };

  const handleShowHand = () => {
    socket.emit("send msg", {
      type: "showHand",
      data: true,
      room: reduxRoom,
    });
  };

  const handleAddFromDeckToHand = () => {
    handleCardClose();
    handleModalClose();
    dispatch(addToHandFromDeck({ card: name, index: index }));
    socket.emit("send msg", {
      type: "showCard",
      data: true,
      room: reduxRoom,
    });
    socket.emit("send msg", {
      type: "cardRevealed",
      data: name,
      room: reduxRoom,
    });
  };
  const handleAddFromDeckToHandWithoutRevealing = () => {
    handleCardClose();
    handleModalClose();
    dispatch(addToHandFromDeckWithoutRevealing({ card: name, index: index }));
    socket.emit("send msg", {
      type: "showCard",
      data: true,
      room: reduxRoom,
    });
    socket.emit("send msg", {
      type: "cardRevealed",
      data: "Card",
      room: reduxRoom,
    });
  };

  const handleCardToFieldFromDeck = () => {
    handleCardClose();
    handleModalClose();
    setReady(true);
    setReadyFromDeck(true);
  };

  const handleToHandFromRevealed = () => {
    handleCardClose();
    setPartialDeck(partialDeck.filter((_, i) => i !== index));
    dispatch(addToHandFromDeck({ card: name, index: index }));
    socket.emit("send msg", {
      type: "showCard",
      data: true,
      room: reduxRoom,
    });
    socket.emit("send msg", {
      type: "cardRevealed",
      data: name,
      room: reduxRoom,
    });
  };

  const handleToBanish = () => {
    handleCardClose();
    setPartialDeck(partialDeck.filter((_, i) => i !== index));
    dispatch(addToBanishFromDeck({ card: name, index: index }));
  };

  const handleBanishAll = () => {
    const length = partialDeck.length;
    for (let i = 0; i < length; i++)
      dispatch(addToBanishFromDeck({ card: partialDeck[i], index: 0 }));
    setPartialDeck([]);
  };

  const handleCemeteryAll = () => {
    const length = partialDeck.length;
    console.log("length", length);
    for (let i = 0; i < length; i++)
      dispatch(addToCemeteryFromDeck({ card: partialDeck[i], index: 0 }));
    setPartialDeck([]);
  };

  const handleBotDeckAll = () => {
    const length = partialDeck.length;
    for (let i = 0; i < length; i++)
      dispatch(addToBotOfDeckFromDeck({ card: partialDeck[i], index: 0 }));
    setPartialDeck([]);
  };

  const handleMill = () => {
    dispatch(addToCemeteryFromTopOfDeck());
  };

  const handleToTopOfDeck = () => {
    handleCardClose();
    let deck = partialDeck.filter((_, i) => i !== index);
    setPartialDeck([name, ...deck]);
    dispatch(addToTopOfDeckFromDeck({ card: name, index: index }));
  };

  const handleToBotOfDeck = () => {
    handleCardClose();
    let deck = partialDeck.filter((_, i) => i !== index);
    if (partialDeck.length === reduxDeck.length)
      setPartialDeck([...deck, name]);
    else setPartialDeck([...deck]);
    dispatch(addToBotOfDeckFromDeck({ card: name, index: index }));
  };

  const handleSubmit = () => {
    const num = Number(textInput);
    dispatch(setViewingCardsLog({ number: num }));

    if (num < reduxDeck.length) {
      setPartialDeck(reduxDeck.slice(0, num));
    } else {
      setPartialDeck(reduxDeck);
    }
  };

  useEffect(() => {
    switch (reduxCardBack) {
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
  }, [reduxCardBack]);

  return (
    <>
      <div
        onMouseEnter={(event) => handlePopoverOpen(event)}
        onClick={() => {
          if (!ready) dispatch(drawFromDeck());
        }}
        style={{
          cursor: `url(${img}) 55 55, auto`,
        }}
      >
        <img className={"cardStyle"} src={cardback} alt={"cardback"} />
      </div>

      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
        }}
        open={popoverOpen}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        disableRestoreFocus
      >
        <Menu
          open={popoverOpen}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          onMouseLeave={() => handlePopoverClose()}
        >
          <div onMouseLeave={() => handlePopoverClose()}>
            <MenuItem onClick={() => handleDraw()}>Draw</MenuItem>
            <MenuItem onClick={() => handleMill()}>Mill</MenuItem>
            <MenuItem onClick={() => handleShuffle()}>Shuffle Deck</MenuItem>
            <MenuItem onClick={() => handleViewDeck()}>View Deck</MenuItem>
            <MenuItem onClick={() => handleRevealDeck()}>Look At Top</MenuItem>
            <MenuItem onClick={() => handleShowHand()}>Show Hand</MenuItem>
            <MenuItem onClick={() => handleDrawFour()}>Draw Four</MenuItem>
            <MenuItem onClick={() => handleMulligan()}>Mulligan Four</MenuItem>
            <MenuItem onClick={() => handleShuffleHand()}>
              Shuffle Hand
            </MenuItem>
            {/* <MenuItem onClick={(event) => handleReset(event)}>Reset</MenuItem> */}
          </div>
        </Menu>
      </Popover>
      <Menu
        open={cardContextMenu !== null}
        onClose={handleCardClose}
        anchorReference="anchorPosition"
        anchorPosition={
          cardContextMenu !== null
            ? {
                top: cardContextMenu.mouseY - 100,
                left: cardContextMenu.mouseX - 45,
              }
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
        {!reveal && (
          <MenuItem onClick={() => handleAddFromDeckToHand()}>Hand</MenuItem>
        )}
        {!reveal && (
          <MenuItem onClick={() => handleCardToFieldFromDeck()}>Field</MenuItem>
        )}
        {reveal && (
          <MenuItem onClick={() => handleToHandFromRevealed()}>Hand</MenuItem>
        )}
        {reveal && (
          <MenuItem onClick={() => handleToTopOfDeck()}>Top of Deck</MenuItem>
        )}
        {reveal && (
          <MenuItem onClick={() => handleToBotOfDeck()}>Bot of Deck</MenuItem>
        )}
        <MenuItem onClick={() => handleToBanish()}>Banish</MenuItem>
        {!reveal && (
          <MenuItem onClick={() => handleAddFromDeckToHandWithoutRevealing()}>
            Hand (No Reveal)
          </MenuItem>
        )}
      </Menu>

      <Modal
        open={open}
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
          {reveal && (
            <div
              style={{
                padding: "1em",
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: ".5em",
              }}
            >
              <input
                style={{
                  width: "15%",
                  fontSize: "18px",
                  fontFamily: "Noto Serif JP, serif",
                }}
                type="number"
                min={0}
                value={textInput}
                onChange={(event) => handleTextInput(event.target.value)}
                placeholder="# of Cards"
              />
              <button
                onClick={handleSubmit}
                style={{
                  fontFamily: "Noto Serif JP, serif",
                  height: "30px",
                  width: "80px",
                }}
              >
                Submit
              </button>
              {partialDeck.length > 0 && (
                <button
                  onClick={handleBotDeckAll}
                  style={{
                    fontFamily: "Noto Serif JP, serif",
                    height: "30px",
                    width: "120px",
                  }}
                >
                  Bot Deck All
                </button>
              )}

              {partialDeck.length > 0 && (
                <button
                  onClick={handleCemeteryAll}
                  style={{
                    fontFamily: "Noto Serif JP, serif",
                    height: "30px",
                    width: "120px",
                  }}
                >
                  Cemetery All
                </button>
              )}
              {partialDeck.length > 0 && (
                <button
                  onClick={handleBanishAll}
                  style={{
                    fontFamily: "Noto Serif JP, serif",
                    height: "30px",
                    width: "120px",
                  }}
                >
                  Banish All
                </button>
              )}
            </div>
          )}
          <CardMUI
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              minHeight: "250px",
              padding: "7%",
              height: "500px",
              overflowY: "scroll",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
            variant="outlined"
          >
            {!reveal &&
              reduxDeck.map((card, idx) => (
                <div
                  key={`card-${idx}`}
                  onContextMenu={(e) => {
                    handleCardContextMenu(e, card, idx);
                  }}
                >
                  <Card ready={ready} name={card} setHovering={setHovering} />
                </div>
              ))}
            {reveal &&
              partialDeck.map((card, idx) => (
                <div
                  key={`card-${idx}`}
                  onContextMenu={(e) => {
                    handleCardContextMenu(e, card, idx);
                  }}
                >
                  <Card ready={ready} name={card} setHovering={setHovering} />
                </div>
              ))}
          </CardMUI>
        </Box>
      </Modal>
    </>
  );
}
