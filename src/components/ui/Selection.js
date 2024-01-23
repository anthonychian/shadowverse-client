import React, { useState } from "react";
import imageCernunnos from "../../assets/leaders/Cernunnos/Cernunnos.png";
import imageMizuchi from "../../assets/leaders/Mizuchi/Mizuchi.png";
import imageForte from "../../assets/leaders/Forte/Forte.png";
import imagePompom from "../../assets/leaders/Pompom/Pompom.png";
import imageDaria from "../../assets/leaders/Daria/Daria.png";
import imageAlbert from "../../assets/leaders/Albert/Albert.png";
import imageAria from "../../assets/leaders/Aria/Aria.png";
import imageExella from "../../assets/leaders/Exella/Exella.png";
import imageRola from "../../assets/leaders/Rola/Rola.png";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Card from "@mui/material/Card";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

const style = {
  position: "relative",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  // bgcolor: "black",
  backgroundColor: "rgba(0, 0, 0, 1)",
  // border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  width: "55%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export default function Selection({ setWallpaper, setSelectedOption }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const forte = require("../../../src/assets/wallpapers/forteEvo.png");
  const luci = require("../../../src/assets/wallpapers/luci.jpg");
  const daria = require("../../../src/assets/wallpapers/daria.png");
  const luna = require("../../../src/assets/wallpapers/luna.jpg");
  const pompom = require("../../../src/assets/wallpapers/pompom.jpg");

  function selectLeader(e) {
    setSelectedOption(e.target.alt);
  }

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: "white",
          position: "fixed",
          left: "1%",
          top: "1%",
          zIndex: "10",
          backgroundColor: "rgba(0, 0, 0, 1)",
        }}
      >
        <MenuIcon
          sx={{
            color: "white",
            width: "50px",
            height: "50px",
          }}
        ></MenuIcon>
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Card
            sx={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            variant="outlined"
          >
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(forte);
              }}
            >
              <img width="100px" src={imageForte} alt="Forte" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(forte);
              }}
            >
              <img width="100px" src={imageMizuchi} alt="Mizuchi" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(luna);
              }}
            >
              <img width="100px" src={imageCernunnos} alt="imageCernunnos" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(pompom);
              }}
            >
              <img width="100px" src={imagePompom} alt="Pompom" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(daria);
              }}
            >
              <img width="100px" src={imageDaria} alt="Daria" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(luci);
              }}
            >
              <img width="100px" src={imageAlbert} alt="Albert" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(luna);
              }}
            >
              <img width="100px" src={imageAria} alt="Aria" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(luna);
              }}
            >
              <img width="100px" src={imageExella} alt="Exella" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(forte);
              }}
            >
              <img width="100px" src={imageRola} alt="Rola" />
            </IconButton>
          </Card>
        </Box>
      </Modal>
    </>
  );
}
