import React, { useState } from "react";
import imageRamina from "../../assets/leaders/Ramina/Ramina.png";
import imageJeanne from "../../assets/leaders/Jeanne/Jeanne.png";
import imageForte from "../../assets/leaders/Forte/Forte.png";
import imageGalmieux from "../../assets/leaders/Galmieux/Galmieux.png";
import imageKuon from "../../assets/leaders/Kuon/Kuon.png";
import imageDaria from "../../assets/leaders/Daria/Daria.png";
import imagePompom from "../../assets/leaders/Pompom/Pompom.png";
import imageAlbert from "../../assets/leaders/Albert/Albert.png";
import imageAria from "../../assets/leaders/Aria/Aria.png";
import imageCC from "../../assets/leaders/CC/CC.png";
import imageExella from "../../assets/leaders/Exella/Exella.png";
import imageItsurugi from "../../assets/leaders/Itsurugi/Itsurugi.png";

import forte from "../../../src/assets/wallpapers/forte.png";
import luci from "../../../src/assets/wallpapers/luci.jpg";
import dshift from "../../../src/assets/wallpapers/dshift.png";
import alice from "../../../src/assets/wallpapers/alice.jpeg";
import pompom from "../../../src/assets/wallpapers/pompom.jpg";
import dark from "../../../src/assets/wallpapers/darkforest.jpg";

import {
  Box,
  Modal,
  Card,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Divider,
  List,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import { useDispatch } from "react-redux";
import { setLeader } from "../../redux/CardSlice";

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
  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setDrawerOpen(true);
  const handleClose = () => setOpen(false);

  const selectLeader = (e) => {
    const leader = e.target.alt;
    setSelectedOption(leader);
    dispatch(setLeader(leader));
  };

  const toggleDrawer = () => (event) => {
    setDrawerOpen(false);
  };

  return (
    <>
      <Drawer
        anchor={"left"}
        open={drawerOpen}
        PaperProps={{
          sx: {
            backgroundColor: "silver",
            color: "black",
          },
        }}
        // onClose={toggleDrawer(anchor, false)}
      >
        <Box
          // sx={{}}
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
          <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton>
                <ListItemIcon></ListItemIcon>
                <ListItemText primary={"Change Class"} />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />

          <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton>
                <ListItemIcon></ListItemIcon>
                <ListItemText primary={"Change Class"} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
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
        />
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
              <img width="100px" src={imageGalmieux} alt="Galmieux" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(luci);
              }}
            >
              <img width="100px" src={imageJeanne} alt="Jeanne" />
            </IconButton>

            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(luci);
              }}
            >
              <img width="100px" src={imageRamina} alt="Ramina" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(pompom);
              }}
            >
              <img width="100px" src={imageAlbert} alt="Albert" />
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
                setWallpaper(dshift);
              }}
            >
              <img width="100px" src={imageDaria} alt="Daria" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(dshift);
              }}
            >
              <img width="100px" src={imageKuon} alt="Kuon" />
            </IconButton>

            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(alice);
              }}
            >
              <img width="100px" src={imageCC} alt="CC" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(alice);
              }}
            >
              <img width="100px" src={imageAria} alt="Aria" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(dark);
              }}
            >
              <img width="100px" src={imageItsurugi} alt="Itsurugi" />
            </IconButton>
            <IconButton
              sx={{ color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={(e) => {
                selectLeader(e);
                setWallpaper(dark);
              }}
            >
              <img width="100px" src={imageExella} alt="Exella" />
            </IconButton>
          </Card>
        </Box>
      </Modal>
    </>
  );
}
