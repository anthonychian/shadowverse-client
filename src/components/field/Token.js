import React, { useState } from "react";
import token from "../../assets/logo/mimi.png";
import { allTokens } from "../../decks/AllTokens";
import { useDispatch } from "react-redux";
import { Menu, MenuItem, Modal, Box, Skeleton } from "@mui/material";
import { setCurrentCard } from "../../redux/CardSlice";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import img from "../../assets/pin_bellringer_angel.png";

const style = {
  position: "relative",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "transparent",
  width: "40%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};

export default function Token({ ready, setReady, setTokenReady, setHovering }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [textInput, setTextInput] = useState("");
  const [filteredTokens, setFilteredTokens] = useState(allTokens);

  const handleModalOpen = () => {
    if (!ready) setOpen(true);
  };
  const handleModalClose = () => setOpen(false);

  const handleContextMenu = (event, name) => {
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

  const handleCardToField = () => {
    handleModalClose();
    handleClose();
    setReady(true);
    setTokenReady(true);
  };

  const handleTextInput = (text) => {
    setTextInput(text);

    const filtered = allTokens.filter((card) =>
      card.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredTokens(filtered);
  };

  return (
    <>
      <div
        onClick={handleModalOpen}
        style={{
          cursor: `url(${img}) 55 55, auto`,
        }}
      >
        <img height={"50px"} src={token} alt={"token"} />
        <div
          style={{
            width: "50px",
            color: "white",
          }}
        >
          Token
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
        <Box sx={style}>
          <input
            style={{
              padding: ".3em",
              marginTop: "1%",
              width: "30%",
              fontSize: "20px",
              fontFamily: "Noto Serif JP, serif",
            }}
            type="text"
            value={textInput}
            onChange={(event) => handleTextInput(event.target.value)}
            placeholder="Search for tokens..."
          />
          <CardMUI
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              minHeight: "250px",
              height: "500px",
              padding: "7%",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              overflowY: "scroll",
            }}
            variant="outlined"
          >
            {filteredTokens.map((card, idx) =>
              card ? (
                <div
                  key={`token-${idx}`}
                  onContextMenu={(e) => {
                    handleContextMenu(e, card);
                  }}
                >
                  <Card ready={ready} name={card} setHovering={setHovering} />
                </div>
              ) : (
                <Skeleton
                  sx={{ bgcolor: "grey.900" }}
                  animation="wave"
                  variant="rounded"
                  width={160}
                  height={115}
                />
              )
            )}
          </CardMUI>
        </Box>
      </Modal>

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
        <MenuItem onClick={handleCardToField}>Field</MenuItem>
      </Menu>
    </>
  );
}
