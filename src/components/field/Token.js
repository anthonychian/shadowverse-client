import React, { useState } from "react";
import token from "../../assets/logo/mimi.png";
import { allTokens } from "../../decks/AllTokens";
import { useDispatch } from "react-redux";
import { Menu, MenuItem, Modal, Box, Skeleton } from "@mui/material";
import { setCurrentCard } from "../../redux/CardSlice";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";

const style = {
  position: "relative",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "transparent",
  boxShadow: 24,
  p: 3,
  width: "40%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export default function Token({ ready, setReady, setTokenReady, setHovering }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [contextMenu, setContextMenu] = React.useState(null);

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

  return (
    <>
      <div onClick={handleModalOpen}>
        <img height={"50px"} src={token} alt={"token"} />
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
            {allTokens.map((card, idx) =>
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
                <Skeleton variant="rectangular" width={160} height={115} />
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
