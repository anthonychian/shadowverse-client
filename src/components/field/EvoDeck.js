import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem, Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import {
  setCurrentEvo,
  restoreEvoCard,
  setViewingEvoDeck,
} from "../../redux/CardSlice";
import img from "../../assets/pin_bellringer_angel.png";
import defaultCardBack from "../../assets/cardbacks/default.png";
import chloeCardBack from "../../assets/cardbacks/chloe.jpg";
import erikaCardBack from "../../assets/cardbacks/erika.jpg";
import fileneCardBack from "../../assets/cardbacks/filene.jfif";
import galmieuxCardBack from "../../assets/cardbacks/galmieux.jpg";
import ginsetsuCardBack from "../../assets/cardbacks/ginsetsu.jpg";
import isabelleCardBack from "../../assets/cardbacks/isabelle.jpg";
import israfilCardBack from "../../assets/cardbacks/israfil.jpg";
import kyoriCardBack from "../../assets/cardbacks/kyori.jpg";
import monoCardBack from "../../assets/cardbacks/mono.jpg";
import technolordCardBack from "../../assets/cardbacks/technolord.jpg";
import tetraCardBack from "../../assets/cardbacks/tetra.jpg";
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
  const [evoStatus, setEvoStatus] = useState(false);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [name, setName] = useState("");
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

  const handleContextMenu = (event, card) => {
    setShowEvo(card.card === "Carrot");
    setEvoStatus(card.status);
    setName(card.card);
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

  useEffect(() => {
    switch (reduxCardBack) {
      case "Chloe":
        setCardback(chloeCardBack);
        break;
      case "Erika":
        setCardback(erikaCardBack);
        break;
      case "Filene":
        setCardback(fileneCardBack);
        break;
      case "Galmieux":
        setCardback(galmieuxCardBack);
        break;
      case "Ginsetsu":
        setCardback(ginsetsuCardBack);
        break;
      case "Isabelle":
        setCardback(isabelleCardBack);
        break;
      case "Israfil":
        setCardback(israfilCardBack);
        break;
      case "Kyori":
        setCardback(kyoriCardBack);
        break;
      case "Mono":
        setCardback(monoCardBack);
        break;
      case "Technolord":
        setCardback(technolordCardBack);
        break;
      case "Tetra":
        setCardback(tetraCardBack);
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
                  handleContextMenu(e, card);
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
      </Menu>
    </>
  );
}
