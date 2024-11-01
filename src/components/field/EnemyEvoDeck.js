import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import { setViewingEvoDeckOpponent } from "../../redux/CardSlice";
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
