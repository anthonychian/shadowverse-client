import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  drawFromDeck,
  shuffleDeck,
  reset,
  mulliganFour,
  drawFourFromDeck,
  addToHandFromDeck,
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
  justifyContent: "center",
  alignItems: "center",
};

export default function Deck({ ready, setHovering }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contextMenu, setContextMenu] = React.useState(null);
  const [cardContextMenu, setCardContextMenu] = React.useState(null);
  const reduxDeck = useSelector((state) => state.card.deck);

  const handleModalOpen = () => {
    if (reduxDeck.length > 0 && !ready) setOpen(true);
  };
  const handleModalClose = () => setOpen(false);

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
  const handleCardContextMenu = (event, name) => {
    setName(name);
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
    dispatch(addToHandFromDeck(name));
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
        <MenuItem onClick={() => handleViewDeck()}>View Deck</MenuItem>
        <MenuItem onClick={() => handleDraw()}>Draw Four</MenuItem>
        <MenuItem onClick={() => handleMulligan()}>Mulligan Four</MenuItem>
        <MenuItem onClick={(event) => handleReset(event)}>Reset</MenuItem>
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
        <MenuItem onClick={() => handleAddFromDeckToHand()}>Hand</MenuItem>
      </Menu>

      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <CardMUI
            sx={{
              //   backgroundColor: "rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              //   backgroundColor: "black",
              minHeight: "250px",
              padding: "3%",
              height: "400px",
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
            {reduxDeck.map((card, idx) => (
              <div
                key={`card-${idx}`}
                onContextMenu={(e) => {
                  handleCardContextMenu(e, card);
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
