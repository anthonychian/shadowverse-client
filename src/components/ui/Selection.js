import React, { useState } from "react";
import Home from "./Home";
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
  bgcolor: "green",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  width: "90%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export default function Selection() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [selectedOption, setSelectedOption] = useState("Forte");

  function selectLeader(e) {
    setSelectedOption(e.target.alt);
  }

  return (
    <div style={{ backgroundColor: "transparent" }}>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: "white",
          position: "fixed",
          left: "5%",
          zIndex: "10",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <MenuIcon
          sx={{ color: "white", width: "50px", height: "50px" }}
        ></MenuIcon>
      </IconButton>
      {/* 'rgb(0, 0, 0, 0)' */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Card sx={{ backgroundColor: "pink" }} variant="outlined">
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => selectLeader(e)}
            >
              <img width="100px" src={imageForte} alt="Forte" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => selectLeader(e)}
            >
              <img width="100px" src={imageMizuchi} alt="Mizuchi" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => selectLeader(e)}
            >
              <img width="100px" src={imageCernunnos} alt="imageCernunnos" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => selectLeader(e)}
            >
              <img width="100px" src={imagePompom} alt="Pompom" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => selectLeader(e)}
            >
              <img width="100px" src={imageDaria} alt="Daria" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => selectLeader(e)}
            >
              <img width="100px" src={imageAlbert} alt="Albert" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => selectLeader(e)}
            >
              <img width="100px" src={imageAria} alt="Aria" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => selectLeader(e)}
            >
              <img width="100px" src={imageExella} alt="Exella" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => selectLeader(e)}
            >
              <img width="100px" src={imageRola} alt="Rola" />
            </IconButton>
          </Card>
        </Box>
      </Modal>
      <Home name={selectedOption} />
    </div>
  );
}
