import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUiModalOpen } from "../hooks/useUiChromeVisible";
import { ModalHideUiRow } from "../ui/HideUiButton";
import { artImage, artThumb } from "../../decks/getCards";
import { Menu, MenuItem, Modal, Box, Typography } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import {
  movePlayedToHand,
  movePlayedToField,
  movePlayedToTopOfDeck,
  movePlayedToBotOfDeck,
  movePlayedToCemetery,
  movePlayedToBanish,
  setCurrentCard,
  setCurrentCardIndex,
} from "../../redux/CardSlice";
import {
  registerPlayedZone,
  fieldSlotCenter,
  onDragHover,
  getBoardScale,
} from "./handDrag";
import { useModalCardDrag, ModalDragGhost } from "./modalCardDrag";
import {
  triggerHandReveal,
  triggerCardReveal,
  onPlayedHideChange,
  isPlayedHidden,
} from "./cardRevealBus";
import "../../css/Card.css";

const img = require("../../assets/pin_bellringer_angel.png");

export default function PlayedZone({
  setReadyFromPlayed,
  setReady,
  setHovering,
  ready,
}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const modalOpen = useUiModalOpen(open, { persistWhenChromeHidden: true });
  const [contextMenu, setContextMenu] = useState(null);
  const [cardIndex, setCardIndex] = useState(-1);

  const played = useSelector((state) => state.card.played) || [];
  const reduxField = useSelector((state) => state.card.field);
  const reduxMyArt = useSelector((state) => state.card.myArt);
  const reduxRoom = useSelector((state) => state.card.room);
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const automated = gameMode === "automated";
  const [dragActive, setDragActive] = useState(false);
  // Re-render when the played-pile reveal hides/reveals the top card, so the
  // card only appears once the centre-screen animation lands.
  const [, bumpPlayedHidden] = useState(0);
  useEffect(
    () => onPlayedHideChange(() => bumpPlayedHidden((n) => n + 1)),
    [],
  );

  useEffect(
    () =>
      onDragHover((state) =>
        setDragActive(!!state.active && !!state.showPlayed),
      ),
    [],
  );

  const handleModalOpen = () => {
    if (automated || ready || played.length === 0) return;
    setOpen(true);
  };
  const handleModalClose = () => {
    setOpen(false);
    setContextMenu(null);
  };

  const handleCardContext = (event, index) => {
    if (automated) return;
    event.preventDefault();
    const cardName = played[index];
    setCardIndex(index);
    dispatch(setCurrentCard(cardName));
    dispatch(setCurrentCardIndex(index));
    setContextMenu({ mouseX: event.clientX + 2, mouseY: event.clientY - 6 });
  };
  const handleClose = () => setContextMenu(null);

  const handleToHand = () => {
    const card = played[cardIndex];
    if (!card) return;
    dispatch(movePlayedToHand({ index: cardIndex }));
    triggerHandReveal(card, reduxRoom);
    handleModalClose();
  };
  const handleToField = () => {
    if (!played[cardIndex]) return;
    handleModalClose();
    setReady(true);
    setReadyFromPlayed(true);
  };
  const handleToTopOfDeck = () => {
    if (!played[cardIndex]) return;
    dispatch(movePlayedToTopOfDeck({ index: cardIndex }));
    handleModalClose();
  };
  const handleToBotOfDeck = () => {
    if (!played[cardIndex]) return;
    dispatch(movePlayedToBotOfDeck({ index: cardIndex }));
    handleModalClose();
  };
  const handleToCemetery = () => {
    if (!played[cardIndex]) return;
    dispatch(movePlayedToCemetery({ index: cardIndex }));
    handleModalClose();
  };
  const handleToBanish = () => {
    if (!played[cardIndex]) return;
    dispatch(movePlayedToBanish({ index: cardIndex }));
    handleModalClose();
  };

  const playedDrag = useModalCardDrag({
    targets: { field: true, hand: true, deck: true, cemetery: true },
    field: reduxField,
    onDrop: (card, index, dest) => {
      if (automated) return;
      if (dest.type === "deck") {
        if (dest.half === "top")
          dispatch(movePlayedToTopOfDeck({ index }));
        else dispatch(movePlayedToBotOfDeck({ index }));
      } else if (dest.type === "hand") {
        dispatch(movePlayedToHand({ index }));
        triggerHandReveal(card, reduxRoom);
      } else if (dest.type === "cemetery") {
        dispatch(movePlayedToCemetery({ index }));
      } else if (dest.type === "field") {
        dispatch(
          movePlayedToField({
            indexInPlayed: index,
            index: dest.index,
          }),
        );
        if (dest.index < 5)
          triggerCardReveal(
            card,
            reduxRoom,
            dest.index,
            fieldSlotCenter(dest.index),
          );
      }
    },
  });

  const canDragFromZone = played.length > 0 && !automated;
  const boardScale = getBoardScale() || 1;

  return (
    <>
      <div
        ref={(el) => registerPlayedZone(el)}
        // onClick={() => {
        //   if (playedDrag.movedRef.current) return;
        //   handleModalOpen();
        // }}
        {...(canDragFromZone ? playedDrag.dragProps(played[0], 0) : {})}
        className={"cardStyle"}
        style={{
          ...(canDragFromZone ? playedDrag.dragStyle : {}),
          borderRadius: "10px",
          border:
            dragActive || playedDrag.isDragging
              ? "4px solid #c9a227"
              : "none",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          cursor: canDragFromZone
            ? "grab"
            : automated
              ? "default"
              : `url(${img}) 55 55, auto`,
          opacity: playedDrag.isDragging ? 0.3 : 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {played.length > 0 && (
          <img
            className={"cardStyle"}
            src={artThumb(played[0], reduxMyArt)}
            style={{ visibility: isPlayedHidden() ? "hidden" : "visible" }}
            onError={(e) => {
              if (e.currentTarget.src.indexOf("/thumbs/") !== -1)
                e.currentTarget.src = artImage(played[0], reduxMyArt);
            }}
            alt={played[0]}
          />
        )}
        {dragActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 2,
              background: "rgba(0, 0, 0, 0.45)",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontFamily: "Noto Serif JP, serif",
                fontSize: 13 / boardScale,
                fontWeight: 700,
                letterSpacing: 0.5,
                textShadow: "0 1px 3px #000",
              }}
            >
              Spell
            </span>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="played-modal-title"
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
            width: "40%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: playedDrag.isDragging ? 0 : 1,
          }}
        >
          <ModalHideUiRow />
          <Typography
            sx={{
              color: "white",
              fontFamily: "Noto Serif JP, serif",
              fontSize: "20px",
              margin: "0 0 0.6em 0",
            }}
            id="played-modal-title"
            variant="h6"
            component="h2"
          >
            Played (shared)
          </Typography>
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
            {played.map((card, index) => (
              <div
                key={`played-${index}`}
                onContextMenu={(e) => handleCardContext(e, index)}
                {...(automated ? {} : playedDrag.dragProps(card, index))}
                style={{
                  position: "relative",
                  ...(automated ? {} : playedDrag.dragStyle),
                }}
              >
                <Card ready={ready} name={card} setHovering={setHovering} />
              </div>
            ))}
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
        {!automated && <MenuItem onClick={handleToHand}>Hand</MenuItem>}
        {!automated && <MenuItem onClick={handleToField}>Field</MenuItem>}
        {!automated && (
          <MenuItem onClick={handleToTopOfDeck}>Top of Deck</MenuItem>
        )}
        {!automated && (
          <MenuItem onClick={handleToBotOfDeck}>Bot of Deck</MenuItem>
        )}
        {!automated && (
          <MenuItem onClick={handleToCemetery}>Cemetery</MenuItem>
        )}
        {!automated && <MenuItem onClick={handleToBanish}>Banish</MenuItem>}
      </Menu>

      <ModalDragGhost drag={playedDrag} ready={ready} setHovering={setHovering} />
    </>
  );
}
