import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem, Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import {
  setCurrentEvo,
  flipEvoCard,
  switchEvoCard,
  setViewingEvoDeck,
} from "../../redux/CardSlice";
import img from "../../assets/pin_bellringer_angel.png";

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
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export default function EvoDeck({
  setHovering,
  setReadyToEvo,
  setReadyToFeed,
  setReady,
  ready,
}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [showEvo, setShowEvo] = useState(true);
  const [doubleSided, setDoubleSided] = useState(true);
  const [evoStatus, setEvoStatus] = useState(false);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [name, setName] = useState("");
  const [idx, setIdx] = useState(0);
  const [cardback, setCardback] = useState();
  const reduxEvoDeck = useSelector((state) => state.card.evoDeck);
  const reduxCardBack = useSelector((state) => state.card.cardback);
  const handleModalOpen = () => {
    setOpen(true);
    dispatch(setViewingEvoDeck(true));
  };
  const handleModalClose = () => {
    setOpen(false);
    dispatch(setViewingEvoDeck(false));
  };

  const handleContextMenu = (event, card, idx) => {
    setShowEvo(card.card === "Carrot");
    setDoubleSided(
      card.card === "Orchis, Resolute Puppet" ||
        card.card === "Orchis, Vengeful Puppet"
    );
    setEvoStatus(card.status);
    setName(card.card);
    setIdx(idx);
    console.log(idx);
    dispatch(setCurrentEvo(card.card));
    // console.log("set current evo to", card.card);
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

  const handleEvolve = () => {
    handleModalClose();
    handleClose();
    setReady(true);
    setReadyToEvo(true);
  };

  const handleFeed = () => {
    handleModalClose();
    handleClose();
    setReady(true);
    setReadyToFeed(true);
  };

  const handleFlipEvo = () => {
    handleClose();
    dispatch(flipEvoCard({ name: name, idx: idx, status: evoStatus }));
  };

  const handleSwitchSide = () => {
    handleClose();
    dispatch(switchEvoCard({ name: name, idx: idx }));
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
        onClick={handleModalOpen}
        style={{
          height: "160px",
          width: "115px",
          //   backgroundColor: "rgba(255, 255, 255, 0.1)",
          cursor: `url(${img}) 55 55, auto`,
        }}
      >
        <img height={"160px"} src={cardback} alt={"cardback"} />
      </div>

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
          <CardMUI
            sx={{
              //   backgroundColor: "rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              //   backgroundColor: "black",
              minHeight: "250px",
              padding: "3%",
              width: "90%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
            variant="outlined"
          >
            {reduxEvoDeck.map((card, idx) => (
              <div
                style={{ width: "115px" }}
                key={`card-${idx}`}
                onContextMenu={(e) => {
                  handleContextMenu(e, card, idx);
                }}
              >
                <Card
                  name={card.card}
                  evolvedUsed={card.status}
                  ready={ready}
                  setHovering={setHovering}
                />
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
            ? { top: contextMenu.mouseY - 100, left: contextMenu.mouseX - 40 }
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
        {showEvo && !evoStatus && (
          <MenuItem onClick={handleFeed}>Feed</MenuItem>
        )}
        {!showEvo && !evoStatus && (
          <MenuItem onClick={handleEvolve}>Evolve</MenuItem>
        )}
        {!doubleSided && <MenuItem onClick={handleFlipEvo}>Flip</MenuItem>}
        {doubleSided && !evoStatus && (
          <MenuItem onClick={handleSwitchSide}>Switch Side</MenuItem>
        )}
      </Menu>
    </>
  );
}
