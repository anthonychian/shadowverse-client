import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  drawFromDeck,
  shuffleDeck,
  reset,
  mulliganFour,
  drawFourFromDeck,
  addToHandFromDeck,
  addToTopOfDeckFromDeck,
  addToBotOfDeckFromDeck,
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
  const [textInput, setTextInput] = useState();
  const reduxDeck = useSelector((state) => state.card.deck);
  const [partialDeck, setPartialDeck] = useState([]);
  const handleModalOpen = () => {
    if (reduxDeck.length > 0 && !ready) setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    if (reveal) {
      setReveal(false);
      setTextInput();
      setPartialDeck([]);
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
    console.log("SETTING CARD TO ", name, index);
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
    handleModalOpen();
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
    handleModalOpen();
    handleCardClose();
    dispatch(addToHandFromDeck({ card: name, index: index }));
  };

  const handleToHandFromRevealed = () => {
    handleModalOpen();
    handleCardClose();
    const cardIndex = partialDeck.indexOf(name);
    setPartialDeck(partialDeck.filter((_, i) => i !== cardIndex));
    dispatch(addToHandFromDeck({ card: name, index: index }));
  };

  const handleToTopOfDeck = () => {
    console.log("WHY IS THIS THE CARD", name, index);
    handleModalOpen();
    handleCardClose();
    // const cardIndex = partialDeck.indexOf(name);
    setPartialDeck(partialDeck.filter((_, i) => i !== index));
    dispatch(addToTopOfDeckFromDeck({ card: name, index: index }));
  };

  const handleToBotOfDeck = () => {
    handleModalOpen();
    handleCardClose();
    // const cardIndex = partialDeck.indexOf(name);
    setPartialDeck(partialDeck.filter((_, i) => i !== index));
    dispatch(addToBotOfDeckFromDeck({ card: name, index: index }));
  };

  const handleSubmit = () => {
    const num = Number(textInput);
    if (num < reduxDeck.length) {
      setPartialDeck(reduxDeck.slice(0, num));
      // console.log(reduxDeck.slice(0, num));
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
