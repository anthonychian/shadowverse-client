import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import cardback from "../../assets/cardbacks/sleeve_5010011.png";

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
  const [open, setOpen] = useState(false);
  const reduxEnemyEvoDeck = useSelector((state) => state.card.enemyEvoDeck);

  const handleModalOpen = () => {
    setOpen(true);
  };
  const handleModalClose = () => setOpen(false);

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
