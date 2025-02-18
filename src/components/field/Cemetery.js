import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cardImage } from "../../decks/getCards";
import { socket } from "../../sockets";
import {
  Menu,
  MenuItem,
  Modal,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import {
  addToHandFromCemetery,
  addToHandFromBanish,
  addToBanishFromCemetery,
  setCurrentCard,
  setViewingCemetery,
} from "../../redux/CardSlice";
// import cardback from "../../assets/cardbacks/default.png";

const img = require("../../assets/pin_bellringer_angel.png");

export default function Cemetery({
  setHovering,
  setReadyFromCemetery,
  setReadyFromBanish,
  setReady,
  ready,
}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contextMenu, setContextMenu] = React.useState(null);
  const [cemeterySelected, setCemeterySelected] = useState(true);
  const [banishSelected, setBanishSelected] = useState(false);

  const reduxCemetery = useSelector((state) => state.card.cemetery);
  const reduxBanish = useSelector((state) => state.card.banish);
  const reduxRoom = useSelector((state) => state.card.room);

  const handleModalOpen = () => {
    if ((reduxCemetery.length > 0 || reduxBanish.length > 0) && !ready) {
      setOpen(true);
      dispatch(setViewingCemetery(true));
    }
  };
  const handleModalClose = () => {
    setOpen(false);
    dispatch(setViewingCemetery(false));
  };

  const handleContextMenu = (event, name) => {
    setName(name);
    dispatch(setCurrentCard(name));
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

  const handleCardToFieldFromCemetery = () => {
    handleModalClose();
    handleClose();
    setReady(true);
    setReadyFromCemetery(true);
  };

  const handleCardToBanishFromCemetery = () => {
    handleClose();
    dispatch(addToBanishFromCemetery(name));
  };

  const handleCardToHandFromCemetery = () => {
    handleModalClose();
    handleClose();
    dispatch(addToHandFromCemetery(name));
    socket.emit("send msg", {
      type: "showCard",
      data: true,
      room: reduxRoom,
    });
    socket.emit("send msg", {
      type: "cardRevealed",
      data: name,
      room: reduxRoom,
    });
  };

  const handleCardToFieldFromBanish = () => {
    handleModalClose();
    handleClose();
    setReady(true);
    setReadyFromBanish(true);
  };

  const handleCardToHandFromBanish = () => {
    handleModalClose();
    handleClose();
    dispatch(addToHandFromBanish(name));
    socket.emit("send msg", {
      type: "showCard",
      data: true,
      room: reduxRoom,
    });
    socket.emit("send msg", {
      type: "cardRevealed",
      data: name,
      room: reduxRoom,
    });
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
          // backgroundColor: "#131219",
          borderRadius: "10px",
          // border: "4px solid #0000",
          border: "4px solid #1a20d6c8",
          cursor: `url(${img}) 55 55, auto`,
          position: "relative",
        }}
      >
        {reduxCemetery && reduxCemetery.length > 0 && (
          <img
            height={"160px"}
            src={cardImage(reduxCemetery[0])}
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
          {reduxCemetery.length || 0}
        </div>
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
        <Box
          sx={{
            position: "relative",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "transparent",
            // boxShadow: 24,
            // p: 3,
            width: "40%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
              padding: "7%",
              height: "500px",
              overflowY: "scroll",
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
              reduxCemetery.map((card, idx) => (
                <div
                  key={`card-${idx}`}
                  onContextMenu={(e) => {
                    handleContextMenu(e, card);
                  }}
                >
                  <Card
                    //   key={`card-${idx}`}
                    ready={ready}
                    name={card}
                    setHovering={setHovering}
                  />
                </div>
              ))}
            {banishSelected &&
              reduxBanish.map((card, idx) => (
                //<div key={`card-${idx}`} style={{ width: "115px" }}>
                <div
                  key={`card-${idx}`}
                  style={{ width: "115px" }}
                  onContextMenu={(e) => {
                    handleContextMenu(e, card);
                  }}
                >
                  <Card
                    evolvedUsed={true}
                    ready={ready}
                    name={card}
                    setHovering={setHovering}
                  />
                </div>
              ))}
          </CardMUI>
        </Box>
      </Modal>

      {(reduxCemetery.length > 0 || reduxBanish.length > 0) && (
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY - 120, left: contextMenu.mouseX - 35 }
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
          {cemeterySelected && (
            <MenuItem onClick={handleCardToHandFromCemetery}>Hand</MenuItem>
          )}
          {cemeterySelected && (
            <MenuItem onClick={handleCardToFieldFromCemetery}>Field</MenuItem>
          )}
          {cemeterySelected && (
            <MenuItem onClick={handleCardToBanishFromCemetery}>Banish</MenuItem>
          )}
          {banishSelected && (
            <MenuItem onClick={handleCardToHandFromBanish}>Hand</MenuItem>
          )}
          {banishSelected && (
            <MenuItem onClick={handleCardToFieldFromBanish}>Field</MenuItem>
          )}
        </Menu>
      )}
    </>
  );
}
