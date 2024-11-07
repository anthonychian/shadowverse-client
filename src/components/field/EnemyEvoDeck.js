import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import { setViewingEvoDeckOpponent } from "../../redux/CardSlice";

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

export default function EnemyEvoDeck({ setHovering, ready }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [cardback, setCardback] = useState();
  const reduxEnemyCardBack = useSelector((state) => state.card.enemyCardback);
  const reduxEnemyEvoDeck = useSelector((state) => state.card.enemyEvoDeck);

  const handleModalOpen = () => {
    setOpen(true);
    dispatch(setViewingEvoDeckOpponent(true));
  };
  const handleModalClose = () => {
    setOpen(false);
    dispatch(setViewingEvoDeckOpponent(false));
  };

  useEffect(() => {
    switch (reduxEnemyCardBack) {
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
  }, [reduxEnemyCardBack]);

  return (
    <>
      <div
        onClick={handleModalOpen}
        style={{
          height: "160px",
          width: "115px",
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
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              minHeight: "250px",
              padding: "3%",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
            variant="outlined"
          >
            {reduxEnemyEvoDeck.map((card, idx) => (
              <div style={{ width: "115px" }} key={`card-${idx}`}>
                {card.status && (
                  <Card
                    name={card.card}
                    ready={ready}
                    setHovering={setHovering}
                  />
                )}

                {!card.status && (
                  <img height={"160px"} src={cardback} alt={"cardback"} />
                )}
              </div>
            ))}
          </CardMUI>
        </Box>
      </Modal>
    </>
  );
}
