import React, { useState } from "react";
import { useSelector } from "react-redux";
import { cardImage } from "../../decks/getCards";
import { Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";

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

export default function EnemyCemetery({ setHovering, ready }) {
  const [open, setOpen] = useState(false);
  const reduxEnemyCemetery = useSelector((state) => state.card.enemyCemetery);
  const handleModalOpen = () => {
    if (reduxEnemyCemetery.length > 0 && !ready) setOpen(true);
  };
  const handleModalClose = () => setOpen(false);

  return (
    <>
      <div
        onClick={handleModalOpen}
        style={{
          height: "160px",
          width: "115px",
          borderRadius: "10px",
          border: "4px solid #1a20d6c8",
          cursor: `url(${img}) 55 55, auto`,
        }}
      >
        {reduxEnemyCemetery && reduxEnemyCemetery.length > 0 && (
          <img
            height={"160px"}
            src={cardImage(reduxEnemyCemetery[0])}
            alt={"cardback"}
          />
        )}
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
            {reduxEnemyCemetery.map((card, idx) => (
              <div key={`card-${idx}`}>
                <Card ready={ready} name={card} setHovering={setHovering} />
              </div>
            ))}
          </CardMUI>
        </Box>
      </Modal>
    </>
  );
}
