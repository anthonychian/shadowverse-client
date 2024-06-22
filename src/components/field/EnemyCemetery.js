import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cardImage } from "../../decks/getCards";
import {
  Modal,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import { setViewingCemeteryOpponent } from "../../redux/CardSlice";

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
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

export default function EnemyCemetery({ setHovering, ready }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [cemeterySelected, setCemeterySelected] = useState(true);
  const [banishSelected, setBanishSelected] = useState(false);

  const reduxEnemyCemetery = useSelector((state) => state.card.enemyCemetery);
  const reduxEnemyBanish = useSelector((state) => state.card.enemyBanish);

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
        sx={{
          "& > .MuiBackdrop-root": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box sx={style}>
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
