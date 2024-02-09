import React, { useState } from "react";
import { socket } from "../../sockets";
import { useDispatch, useSelector } from "react-redux";
import {
  drawFromDeck,
  shuffleDeck,
  mulliganFour,
  drawFourFromDeck,
  addToHandFromDeck,
  addToTopOfDeckFromDeck,
  addToBotOfDeckFromDeck,
  addToCemeteryFromDeck,
  addToBanishFromDeck,
  setViewingDeck,
  setViewingTopCards,
} from "../../redux/CardSlice";
import { Menu, MenuItem, Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import cardback from "../../assets/cardbacks/sleeve_5010011.png";

const img = require("../../assets/pin_bellringer_angel.png");

const style = {
  position: "relative",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "transparent",
  boxShadow: 24,
  p: 3,
  width: "55%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

export default function Deck({ ready, setHovering }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [index, setIndex] = useState(0);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [cardContextMenu, setCardContextMenu] = React.useState(null);
  const [reveal, setReveal] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [partialDeck, setPartialDeck] = useState([]);

  const reduxDeck = useSelector((state) => state.card.deck);
  const reduxRoom = useSelector((state) => state.card.room);

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
  const handleClose = () => {
    setContextMenu(null);
  };
  const handleCardClose = () => {
    setCardContextMenu(null);
  };

  const handleViewDeck = () => {
    handleClose();
    handleModalOpen();
  };
  const handleRevealDeck = () => {
    handleClose();
    setReveal(true);
    handleModalRevealOpen();
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
      dispatch(addToBanishFromDeck({ card: partialDeck[i], index: i }));
    setPartialDeck([]);
  };

  const handleCemeteryAll = () => {
    const length = partialDeck.length;
    for (let i = 0; i < length; i++)
      dispatch(addToCemeteryFromDeck({ card: partialDeck[i], index: i }));
    setPartialDeck([]);
  };

  const handleBotDeckAll = () => {
    const length = partialDeck.length;
    for (let i = 0; i < length; i++)
      dispatch(addToBotOfDeckFromDeck({ card: partialDeck[i], index: 0 }));
    setPartialDeck([]);
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
    if (num < reduxDeck.length) {
      setPartialDeck(reduxDeck.slice(0, num));
    } else {
      setPartialDeck(reduxDeck);
    }
  };

  // const handleReset = () => {
  //   handleClose();
  //   dispatch(reset());
  // };

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
        <MenuItem onClick={() => handleViewDeck()}>View Deck</MenuItem>
        <MenuItem onClick={() => handleRevealDeck()}>Look At Top</MenuItem>
        <MenuItem onClick={() => handleDraw()}>Draw Four</MenuItem>
        <MenuItem onClick={() => handleMulligan()}>Mulligan Four</MenuItem>
        {/* <MenuItem onClick={(event) => handleReset(event)}>Reset</MenuItem> */}
      </Menu>

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
        {reveal && (
          <MenuItem onClick={() => handleToHandFromRevealed()}>Hand</MenuItem>
        )}
        {reveal && (
          <MenuItem onClick={() => handleToTopOfDeck()}>Top of Deck</MenuItem>
        )}
        {reveal && (
          <MenuItem onClick={() => handleToBotOfDeck()}>Bot of Deck</MenuItem>
        )}
        {reveal && <MenuItem onClick={() => handleToBanish()}>Banish</MenuItem>}
      </Menu>

      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
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
              padding: "3%",
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
