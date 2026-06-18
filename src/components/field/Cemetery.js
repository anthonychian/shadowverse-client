import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEngineSync } from "../hooks/useEngineSync";
import { useUiModalOpen } from "../hooks/useUiChromeVisible";
import { ModalHideUiRow } from "../ui/HideUiButton";
import { artImage, artThumb } from "../../decks/getCards";
import {
  Menu,
  MenuItem,
  Modal,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import {
  addToHandFromCemetery,
  addToHandFromBanish,
  addToBanishFromCemetery,
  placeToFieldFromCemetery,
  placeToFieldFromBanish,
  placeToTopOfDeckFromCemetery,
  placeToBotOfDeckFromCemetery,
  setCurrentCard,
  setCurrentCardIndex,
  setViewingCemetery,
} from "../../redux/CardSlice";
import { registerCemetery, fieldSlotCenter } from "./handDrag";
import { useModalCardDrag, ModalDragGhost } from "./modalCardDrag";
// import cardback from "../../assets/cardbacks/default.png";
import { triggerHandReveal, triggerCardReveal } from "./cardRevealBus";
import "../../css/Card.css";

const img = require("../../assets/pin_bellringer_angel.png");

export default function Cemetery({
  setHovering,
  setReadyFromCemetery,
  setReadyFromBanish,
  setReady,
  ready,
}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const modalOpen = useUiModalOpen(open, { persistWhenChromeHidden: true });
  const [name, setName] = useState("");
  const [contextMenu, setContextMenu] = React.useState(null);
  const [cemeterySelected, setCemeterySelected] = useState(true);
  const [banishSelected, setBanishSelected] = useState(false);
  const [cardIndex, setCardIndex] = useState(-1);

  const reduxCemetery = useSelector((state) => state.card.cemetery);
  const cemeteryInstanceIds = useSelector((state) => state.card.cemeteryInstanceIds);
  const reduxMyArt = useSelector((state) => state.card.myArt);
  const reduxBanish = useSelector((state) => state.card.banish);
  const reduxField = useSelector((state) => state.card.field);
  const reduxRoom = useSelector((state) => state.card.room);
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const legalActions = useSelector((state) => state.gameState.legalActions);
  const leaderActive = useSelector((state) => state.card.leaderActive);
  const pendingChoices = useSelector((state) => state.gameState.pendingChoices);
  const automated = gameMode === "automated";
  const { sendAction } = useEngineSync();

  const handleModalOpen = () => {
    if ((reduxCemetery.length > 0 || reduxBanish.length > 0) && !ready) {
      setOpen(true);
      dispatch(setViewingCemetery(true));
    }
  };
  const handleModalClose = () => {
    setOpen(false);
    dispatch(setViewingCemetery(false));
  };

  const handleContextMenu = (event, name, index) => {
    setName(name);
    setCardIndex(index);
    dispatch(setCurrentCard(name));
    dispatch(setCurrentCardIndex(index));
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

  const handleToTopOfDeckFromCemetery = () => {
    handleClose();
    dispatch(placeToTopOfDeckFromCemetery({ name: name, index: cardIndex }));
  };
  const handleToBotOfDeckFromCemetery = () => {
    handleClose();
    dispatch(placeToBotOfDeckFromCemetery({ name: name, index: cardIndex }));
  };

  const handleCardToFieldFromCemetery = () => {
    handleModalClose();
    handleClose();
    setReady(true);
    setReadyFromCemetery(true);
  };

  const handleCardToBanishFromCemetery = () => {
    handleClose();
    dispatch(addToBanishFromCemetery({ name: name, index: cardIndex }));
  };

  const handleAutomatedActivateFromCemetery = () => {
    if (!automated || cardIndex < 0) return;
    const instanceId = cemeteryInstanceIds[cardIndex];
    if (!instanceId || !legalActions.includes(`ACTIVATE_CEMETERY:${instanceId}`)) return;
    sendAction({ type: "ACTIVATE_CEMETERY", cemeteryInstanceId: instanceId });
    handleClose();
    handleModalClose();
  };

  const canActivateFromCemetery =
    automated &&
    leaderActive &&
    !pendingChoices &&
    cardIndex >= 0 &&
    cemeteryInstanceIds[cardIndex] &&
    legalActions.includes(`ACTIVATE_CEMETERY:${cemeteryInstanceIds[cardIndex]}`);

  const handleCardToHandFromCemetery = () => {
    handleModalClose();
    handleClose();
    dispatch(addToHandFromCemetery({ name: name, index: cardIndex }));
    triggerHandReveal(name, reduxRoom);
  };

  const handleCardToFieldFromBanish = () => {
    handleModalClose();
    handleClose();
    setReady(true);
    setReadyFromBanish(true);
  };

  const handleCardToHandFromBanish = () => {
    handleModalClose();
    handleClose();
    dispatch(addToHandFromBanish({ name: name, index: cardIndex }));
    triggerHandReveal(name, reduxRoom);
  };

  const handleCemeterySelected = () => {
    setCemeterySelected(true);
    setBanishSelected(false);
  };
  const handleBanishSelected = () => {
    setCemeterySelected(false);
    setBanishSelected(true);
  };

  // ---- drag a cemetery/banish card onto the field or back to hand ----
  // The modal hides while dragging and reappears on release. Which source pile a
  // card came from depends on the active radio (cemetery vs banish).
  const cemeteryDrag = useModalCardDrag({
    // Deck (top/bottom) is only a valid target for cemetery cards — there's no
    // banish→deck action — so it's gated on the active radio.
    targets: { field: true, hand: true, deck: cemeterySelected },
    field: reduxField,
    onDrop: (card, index, dest) => {
      if (automated) return;
      if (dest.type === "deck") {
        if (!cemeterySelected) return;
        if (dest.half === "top")
          dispatch(placeToTopOfDeckFromCemetery({ name: card, index }));
        else dispatch(placeToBotOfDeckFromCemetery({ name: card, index }));
      } else if (dest.type === "hand") {
        if (cemeterySelected)
          dispatch(addToHandFromCemetery({ name: card, index }));
        else dispatch(addToHandFromBanish({ name: card, index }));
        triggerHandReveal(card, reduxRoom);
      } else {
        if (cemeterySelected)
          dispatch(
            placeToFieldFromCemetery({
              card,
              indexInHand: index,
              index: dest.index,
            }),
          );
        else
          dispatch(
            placeToFieldFromBanish({
              card,
              indexInHand: index,
              index: dest.index,
            }),
          );
        // Reveal only when summoned to the field row (0-4), not the EX area.
        if (dest.index < 5)
          triggerCardReveal(card, reduxRoom, dest.index, fieldSlotCenter(dest.index));
      }
    },
  });

  return (
    <>
      <div
        ref={(el) => registerCemetery(el)}
        onClick={handleModalOpen}
        style={{
          // height: "160px",
          // width: "115px",
          // backgroundColor: "#131219",
          borderRadius: "10px",
          // border: "4px solid #0000",
          border: "4px solid #1a20d6c8",
          cursor: `url(${img}) 55 55, auto`,
          position: "relative",
        }}
        className={"cardStyle"}
      >
        {reduxCemetery && reduxCemetery.length > 0 && (
          <img
            className={"cardStyle"}
            src={artThumb(reduxCemetery[0], reduxMyArt)}
            onError={(e) => {
              if (e.currentTarget.src.indexOf("/thumbs/") !== -1)
                e.currentTarget.src = artImage(reduxCemetery[0], reduxMyArt);
            }}
            alt={"cardback"}
          />
        )}
        <div
          style={{
            width: "50px",
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            top: "70%",
            right: "27%",
            color: "rgba(255, 255, 255, 1)",
            fontSize: "30px",
            fontFamily: "Noto Serif JP, serif",
          }}
        >
          {reduxCemetery.length || 0}
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
        <Box
          sx={{
            position: "relative",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "transparent",
            // boxShadow: 24,
            // p: 3,
            width: "40%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            // Hidden with opacity (not visibility/display) while dragging so the
            // dragged card's wrapper keeps its pointer capture.
            opacity: cemeteryDrag.isDragging ? 0 : 1,
          }}
        >
          <ModalHideUiRow />
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
            >
              <FormControlLabel
                checked={cemeterySelected}
                onChange={handleCemeterySelected}
                sx={{ fontFamily: "Noto Serif JP, serif", color: "white" }}
                value={cemeterySelected}
                control={<Radio />}
                label="Cemetery"
              />
              <FormControlLabel
                checked={banishSelected}
                onChange={handleBanishSelected}
                sx={{ fontFamily: "Noto Serif JP, serif", color: "white" }}
                value={banishSelected}
                control={<Radio />}
                label="Banish"
              />
            </RadioGroup>
          </FormControl>
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
            {cemeterySelected &&
              reduxCemetery.map((card, index) => (
                <div
                  key={`card-${index}`}
                  onContextMenu={(e) => {
                    handleContextMenu(e, card, index);
                  }}
                  {...(automated ? {} : cemeteryDrag.dragProps(card, index))}
                >
                  <Card
                    //   key={`card-${idx}`}
                    ready={ready}
                    name={card}
                    setHovering={setHovering}
                  />
                </div>
              ))}
            {banishSelected &&
              reduxBanish.map((card, index) => (
                //<div key={`card-${idx}`} style={{ width: "115px" }}>
                <div
                  key={`card-${index}`}
                  onContextMenu={(e) => {
                    handleContextMenu(e, card, index);
                  }}
                  {...(automated ? {} : cemeteryDrag.dragProps(card, index))}
                  style={{
                    width: "115px",
                    ...(automated ? {} : cemeteryDrag.dragStyle),
                  }}
                >
                  <Card
                    evolvedUsed={true}
                    ready={ready}
                    name={card}
                    setHovering={setHovering}
                  />
                </div>
              ))}
          </CardMUI>
        </Box>
      </Modal>

      {(reduxCemetery.length > 0 || reduxBanish.length > 0) && (
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
          {cemeterySelected && canActivateFromCemetery && (
            <MenuItem onClick={handleAutomatedActivateFromCemetery}>Activate</MenuItem>
          )}
          {cemeterySelected && !automated && (
            <MenuItem onClick={handleCardToHandFromCemetery}>Hand</MenuItem>
          )}
          {cemeterySelected && !automated && (
            <MenuItem onClick={handleCardToFieldFromCemetery}>Field</MenuItem>
          )}
          {cemeterySelected && !automated && (
            <MenuItem onClick={handleToTopOfDeckFromCemetery}>
              Top of Deck
            </MenuItem>
          )}
          {cemeterySelected && !automated && (
            <MenuItem onClick={handleToBotOfDeckFromCemetery}>
              Bot of Deck
            </MenuItem>
          )}
          {cemeterySelected && !automated && (
            <MenuItem onClick={handleCardToBanishFromCemetery}>Banish</MenuItem>
          )}
          {banishSelected && !automated && (
            <MenuItem onClick={handleCardToHandFromBanish}>Hand</MenuItem>
          )}
          {banishSelected && !automated && (
            <MenuItem onClick={handleCardToFieldFromBanish}>Field</MenuItem>
          )}
        </Menu>
      )}

      <ModalDragGhost drag={cemeteryDrag} ready={ready} setHovering={setHovering} />
    </>
  );
}
