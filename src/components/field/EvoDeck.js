import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem, Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import {
  setCurrentEvo,
  restoreEvoCard,
  switchEvoCard,
  setViewingEvoDeck,
} from "../../redux/CardSlice";
import img from "../../assets/pin_bellringer_angel.png";

import defaultCardBack from "../../assets/cardbacks/default.png";
import fileneCardBack from "../../assets/cardbacks/filene.png";
import galmieuxCardBack from "../../assets/cardbacks/galmieux.png";
import ginsetsuCardBack from "../../assets/cardbacks/ginsetsu.jpg";
import kuonCardBack from "../../assets/cardbacks/kuon.png";
import ladicaCardBack from "../../assets/cardbacks/ladica.png";
import lishennaCardBack from "../../assets/cardbacks/lishenna.png";
import machina1CardBack from "../../assets/cardbacks/machina1.png";
import machina2CardBack from "../../assets/cardbacks/machina2.png";
import mistolinaCardBack from "../../assets/cardbacks/mistolina.png";
import monoCardBack from "../../assets/cardbacks/mono.png";
import naturaCardBack from "../../assets/cardbacks/natura.png";
import piercyeCardBack from "../../assets/cardbacks/piercye.png";
import ralmiaCardBack from "../../assets/cardbacks/ralmia.png";
import shikiCardBack from "../../assets/cardbacks/shiki.png";
import shutenCardBack from "../../assets/cardbacks/shuten.png";
import tetraCardBack from "../../assets/cardbacks/tetra.png";
import viridiaCardBack from "../../assets/cardbacks/viridia.png";
import wingsCardBack from "../../assets/cardbacks/wings.png";
import yokaiCardBack from "../../assets/cardbacks/yokai.png";

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
    dispatch(restoreEvoCard(name));
  };

  const handleSwitchSide = () => {
    handleClose();
    dispatch(switchEvoCard({ name: name, idx: idx }));
  };

  useEffect(() => {
    switch (reduxCardBack) {
      case "Filene":
        setCardback(fileneCardBack);
        break;
      case "Galmieux":
        setCardback(galmieuxCardBack);
        break;
      case "Ginsetsu":
        setCardback(ginsetsuCardBack);
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
      case "Machina1":
        setCardback(machina1CardBack);
        break;
      case "Machina2":
        setCardback(machina2CardBack);
        break;
      case "Mistolina":
        setCardback(mistolinaCardBack);
        break;
      case "Mono":
        setCardback(monoCardBack);
        break;
      case "Natura":
        setCardback(naturaCardBack);
        break;
      case "Piercye":
        setCardback(piercyeCardBack);
        break;
      case "Ralmia":
        setCardback(ralmiaCardBack);
        break;
      case "Shikigami":
        setCardback(shikiCardBack);
        break;
      case "Shuten":
        setCardback(shutenCardBack);
        break;
      case "Tetra":
        setCardback(tetraCardBack);
        break;
      case "Viridia":
        setCardback(viridiaCardBack);
        break;
      case "Wings":
        setCardback(wingsCardBack);
        break;
      case "Yokai":
        setCardback(yokaiCardBack);
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
        {showEvo && !evoStatus ? (
          <MenuItem onClick={handleFeed}>Feed</MenuItem>
        ) : !showEvo && !evoStatus ? (
          <MenuItem onClick={handleEvolve}>Evolve</MenuItem>
        ) : (
          <MenuItem onClick={handleFlipEvo}>Flip</MenuItem>
        )}
        {doubleSided && !evoStatus && (
          <MenuItem onClick={handleSwitchSide}>Switch Side</MenuItem>
        )}
      </Menu>
    </>
  );
}
