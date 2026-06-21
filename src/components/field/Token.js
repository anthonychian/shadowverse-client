import React, { useState } from "react";
import token from "../../assets/logo/mimi.png";
import { allTokens } from "../../decks/AllTokens";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem, Modal, Box, Skeleton } from "@mui/material";
import { setCurrentCard, placeTokenOnField } from "../../redux/CardSlice";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import img from "../../assets/pin_bellringer_angel.png";
import { useUiModalOpen } from "../hooks/useUiChromeVisible";
import { ModalHideUiRow } from "../ui/HideUiButton";
import { useModalCardDrag, ModalDragGhost } from "./modalCardDrag";
import { fieldSlotCenter } from "./handDrag";
import { triggerCardReveal } from "./cardRevealBus";

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

export default function Token({ ready, setReady, setTokenReady, setHovering }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const modalOpen = useUiModalOpen(open);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [textInput, setTextInput] = useState("");
  const [filteredTokens, setFilteredTokens] = useState(allTokens);

  const reduxField = useSelector((state) => state.card.field);
  const reduxRoom = useSelector((state) => state.card.room);
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const automated = gameMode === "automated";

  // Drag a token straight out of this modal onto an empty field slot. Mirrors the
  // deck/cemetery modal drag — the modal hides while dragging and a ghost follows
  // the cursor; on release the token is placed (and revealed if in the front row).
  const tokenDrag = useModalCardDrag({
    targets: { field: true },
    field: reduxField,
    onDrop: (card, index, dest) => {
      if (automated) return;
      dispatch(placeTokenOnField({ card, index: dest.index }));
      if (dest.index < 5)
        triggerCardReveal(card, reduxRoom, dest.index, fieldSlotCenter(dest.index));
    },
  });

  const handleModalOpen = () => {
    if (!ready) setOpen(true);
  };
  const handleModalClose = () => setOpen(false);

  const handleContextMenu = (event, name) => {
    dispatch(setCurrentCard(name));
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

  const handleCardToField = () => {
    handleModalClose();
    handleClose();
    setReady(true);
    setTokenReady(true);
  };

  const handleTextInput = (text) => {
    setTextInput(text);

    const filtered = allTokens.filter((card) =>
      card.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredTokens(filtered);
  };

  return (
    <>
      <div
        onClick={handleModalOpen}
        style={{
          cursor: `url(${img}) 55 55, auto`,
        }}
      >
        <img height={"50px"} src={token} alt={"token"} />
        <div
          style={{
            width: "50px",
            color: "white",
          }}
        >
          Token
        </div>
      </div>
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          "& > .MuiBackdrop-root": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box sx={{ ...style, opacity: tokenDrag.isDragging ? 0 : 1 }}>
          <ModalHideUiRow />
          <input
            style={{
              padding: ".3em",
              marginTop: "1%",
              width: "30%",
              fontSize: "20px",
              fontFamily: "Noto Serif JP, serif",
            }}
            type="text"
            value={textInput}
            onChange={(event) => handleTextInput(event.target.value)}
            placeholder="Search for tokens..."
          />
          <CardMUI
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              minHeight: "250px",
              height: "500px",
              padding: "7%",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              overflowY: "scroll",
            }}
            variant="outlined"
          >
            {filteredTokens.map((card, idx) =>
              card ? (
                <div
                  key={`token-${idx}`}
                  onContextMenu={(e) => {
                    handleContextMenu(e, card);
                  }}
                  {...(automated ? {} : tokenDrag.dragProps(card, idx))}
                >
                  <Card ready={ready} name={card} setHovering={setHovering} />
                </div>
              ) : (
                <Skeleton
                  sx={{ bgcolor: "grey.900" }}
                  animation="wave"
                  variant="rounded"
                  width={160}
                  height={115}
                />
              )
            )}
          </CardMUI>
        </Box>
      </Modal>

      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY - 120, left: contextMenu.mouseX - 35 }
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
        <MenuItem onClick={handleCardToField}>Field</MenuItem>
      </Menu>

      <ModalDragGhost drag={tokenDrag} ready={ready} setHovering={setHovering} />
    </>
  );
}
