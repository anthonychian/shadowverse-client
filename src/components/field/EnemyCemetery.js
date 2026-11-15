import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { artImage, artThumb } from "../../decks/getCards";
import { countCardTypes } from "../../decks/cardDetails";
import { Modal, Box, Button } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import { setViewingCemeteryOpponent } from "../../redux/CardSlice";
import { registerEnemyCemetery } from "./handDrag";
import {
  deckModalCards,
  deckModalCount,
  deckModalTitle,
  deckModalToolbar,
  ghostButtonSx,
  useDeckModalBoxStyle,
} from "./deckModalStyles";
import "../../css/Card.css";
import { useUiModalOpen } from "../hooks/useUiChromeVisible";
import { ModalHideUiRow } from "../ui/HideUiButton";

const img = require("../../assets/pin_bellringer_angel.png");

export default function EnemyCemetery({ setHovering, ready }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const modalOpen = useUiModalOpen(open);
  const modalBoxStyle = useDeckModalBoxStyle(modalOpen);
  const [cemeterySelected, setCemeterySelected] = useState(true);
  const [banishSelected, setBanishSelected] = useState(false);

  const reduxEnemyCemetery = useSelector((state) => state.card.enemyCemetery);
  const reduxEnemyArt = useSelector((state) => state.card.enemyArt);
  const reduxEnemyBanish = useSelector((state) => state.card.enemyBanish);

  const cemeteryTypeCounts = countCardTypes(reduxEnemyCemetery);
  const banishTypeCounts = countCardTypes(reduxEnemyBanish);
  const activeTypeCounts = cemeterySelected
    ? cemeteryTypeCounts
    : banishTypeCounts;

  const handleModalOpen = () => {
    if (
      (reduxEnemyCemetery.length > 0 || reduxEnemyBanish.length > 0) &&
      !ready
    ) {
      setOpen(true);
      dispatch(setViewingCemeteryOpponent(true));
    }
  };
  const handleModalClose = () => {
    setOpen(false);
    dispatch(setViewingCemeteryOpponent(false));
  };
  const handleCemeterySelected = () => {
    setCemeterySelected(true);
    setBanishSelected(false);
  };
  const handleBanishSelected = () => {
    setCemeterySelected(false);
    setBanishSelected(true);
  };

  return (
    <>
      <div
        ref={(el) => registerEnemyCemetery(el)}
        onClick={handleModalOpen}
        style={{
          // height: "160px",
          // width: "115px",
          borderRadius: "10px",
          border: "4px solid #1a20d6c8",
          cursor: `url(${img}) 55 55, auto`,
          position: "relative",
        }}
        className={"cardStyle"}
      >
        {reduxEnemyCemetery && reduxEnemyCemetery.length > 0 && (
          <img
            // height={"160px"}
            className={"cardStyle"}
            src={artThumb(reduxEnemyCemetery[0], reduxEnemyArt)}
            onError={(e) => {
              if (e.currentTarget.src.indexOf("/thumbs/") !== -1)
                e.currentTarget.src = artImage(reduxEnemyCemetery[0], reduxEnemyArt);
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
            right: "30%",
            color: "rgba(255, 255, 255, 1)",
            fontSize: "30px",
            fontFamily: "Noto Serif JP, serif",
          }}
        >
          {reduxEnemyCemetery.length || 0}
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
        <Box sx={modalBoxStyle}>
          <ModalHideUiRow />
          <div style={deckModalToolbar}>
            <span style={deckModalTitle}>
              {cemeterySelected ? "CEMETERY" : "BANISH"}
            </span>
            <Button
              onClick={
                cemeterySelected ? handleBanishSelected : handleCemeterySelected
              }
              sx={ghostButtonSx}
            >
              {cemeterySelected ? "Banish" : "Cemetery"}
            </Button>
            <span style={deckModalCount}>
              {activeTypeCounts.Follower} FOLLOWERS
            </span>
            <span style={deckModalCount}>
              {activeTypeCounts.Spell} SPELLS
            </span>
            <span style={deckModalCount}>
              {activeTypeCounts.Amulet} AMULETS
            </span>
          </div>
          <CardMUI sx={deckModalCards} variant="outlined">
            {cemeterySelected &&
              reduxEnemyCemetery.map((card, idx) => (
                <div key={`card-${idx}`}>
                  <Card ready={ready} name={card} setHovering={setHovering} />
                </div>
              ))}
            {banishSelected &&
              reduxEnemyBanish.map((card, idx) => (
                <div key={`card-${idx}`} style={{ width: "115px" }}>
                  <Card
                    ready={ready}
                    name={card}
                    evolvedUsed={true}
                    setHovering={setHovering}
                  />
                </div>
              ))}
          </CardMUI>
        </Box>
      </Modal>
    </>
  );
}
