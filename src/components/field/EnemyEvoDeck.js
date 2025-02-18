import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import { setViewingEvoDeckOpponent } from "../../redux/CardSlice";

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

const img = require("../../assets/pin_bellringer_angel.png");

const style = {
  position: "relative",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "transparent",
  // boxShadow: 24,
  // p: 3,
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
