import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import imageRamina from "../../assets/leaders/Ramina.png";
import imageJeanne from "../../assets/leaders/Jeanne.png";
import imageForte from "../../assets/leaders/Forte.png";
import imageGalmieux from "../../assets/leaders/Galmieux.png";
import imageKuon from "../../assets/leaders/Kuon.png";
import imageDaria from "../../assets/leaders/Daria.png";
import imageDionne from "../../assets/leaders/Dionne.png";
import imageAlbert from "../../assets/leaders/Albert.png";
import imageAria from "../../assets/leaders/Aria.png";
import imageCC from "../../assets/leaders/CC.png";
import imageMono from "../../assets/leaders/Mono.png";
import imageAmy from "../../assets/leaders/Amy.png";
import imageMaru from "../../assets/leaders/Maru.png";
import imageRin from "../../assets/leaders/Rin.png";
import imageUzuki from "../../assets/leaders/Uzuki.png";
import imageMio from "../../assets/leaders/Mio.png";
import dragon from "../../assets/logo/dragon.png";

import defaultCardBack from "../../assets/cardbacks/default.png";
import fileneCardBack from "../../assets/cardbacks/filene.png";
import galmieuxCardBack from "../../assets/cardbacks/galmieux.png";
import ginsetsuCardBack from "../../assets/cardbacks/ginsetsu.jpg";
import kuonCardBack from "../../assets/cardbacks/kuon.png";
import ladicaCardBack from "../../assets/cardbacks/ladica.png";
import lishennaCardBack from "../../assets/cardbacks/lishenna.png";
import machina1CardBack from "../../assets/cardbacks/machina1.png";
import machina2CardBack from "../../assets/cardbacks/machina2.png";
import mistolinaCardBack from "../../assets/cardbacks/mistolina.png";
import monoCardBack from "../../assets/cardbacks/mono.png";
import naturaCardBack from "../../assets/cardbacks/natura.png";
import piercyeCardBack from "../../assets/cardbacks/piercye.png";
import ralmiaCardBack from "../../assets/cardbacks/ralmia.png";
import shikiCardBack from "../../assets/cardbacks/shiki.png";
import shutenCardBack from "../../assets/cardbacks/shuten.png";
import tetraCardBack from "../../assets/cardbacks/tetra.png";
import viridiaCardBack from "../../assets/cardbacks/viridia.png";
import wingsCardBack from "../../assets/cardbacks/wings.png";
import yokaiCardBack from "../../assets/cardbacks/yokai.png";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import ChatIcon from "@mui/icons-material/Chat";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ReplayIcon from "@mui/icons-material/Replay";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setLeader,
  setCardBack,
  reset,
  exitGame,
  setRematchStatus,
} from "../../redux/CardSlice";

export default function Selection({ setSelectedOption }) {
  // redux state
  const reduxChatLog = useSelector((state) => state.card.gameLog);
  const reduxEnemyRematchStatus = useSelector(
    (state) => state.card.enemyRematchStatus
  );
  const img = require("../../assets/pin_bellringer_angel.png");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openCardBack, setOpenCardBack] = useState(false);

  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const handleCardBackModalOpen = () => setOpenCardBack(true);
  const handleCardBackModalClose = () => setOpenCardBack(false);

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const [openDialog, setOpenDialog] = useState(false);

  const [rematchOpenDialog, setRematchOpenDialog] = useState(false);

  const [rematchNotify, setRematchNotify] = useState(false);

  const [acceptRematch, setAcceptRematch] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const selectLeader = (e) => {
    const leader = e.target.alt;
    setSelectedOption(leader);
    dispatch(setLeader(leader));
  };
  const selectCardBack = (e) => {
    const cardback = e.target.alt;
    dispatch(setCardBack(cardback));
  };

  const handleRematch = () => {
    if (acceptRematch && reduxEnemyRematchStatus) {
      dispatch(reset());
      setAcceptRematch(false);
      setRematchNotify(true);
    }
  };

  const exitToHome = () => {
    dispatch(exitGame());
    navigate("/");
  };

  const handleAcceptRematchUI = () => {
    setAcceptRematch(true);
    dispatch(setRematchStatus(true));
  };
  const handleDeclineRematchUI = () => {
    setAcceptRematch(false);
    handleCloseRematchDialog();
    dispatch(setRematchStatus(false));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenRematchDialog = () => {
    setRematchOpenDialog(true);
  };

  const handleCloseRematchDialog = () => {
    setRematchOpenDialog(false);
  };

  const descriptionElementRef = React.useRef(null);
  useEffect(() => {
    if (openDialog) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [openDialog]);

  useEffect(() => {
    if (reduxEnemyRematchStatus) setRematchOpenDialog(true);
    else setRematchOpenDialog(false);
  }, [reduxEnemyRematchStatus]);

  useEffect(() => {
    handleRematch();
  }, [acceptRematch]);

  useEffect(() => {
    handleRematch();
  }, [reduxEnemyRematchStatus]);

  return (
    <>
      <Drawer
        anchor={"left"}
        open={drawerOpen}
        PaperProps={{
          sx: {
            backgroundColor: "#131219",
            color: "white",
          },
        }}
        onClose={handleDrawerClose}
      >
        <Box
          sx={{ width: 270 }}
          role="presentation"
          onClick={handleDrawerClose}
          onKeyDown={handleDrawerClose}
        >
          <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton onClick={handleModalOpen}>
                <ListItemIcon>
                  <img src={dragon} height={30} alt={dragon} />
                </ListItemIcon>
                <ListItemText primary={"Change Class"} />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider />

          <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton onClick={handleCardBackModalOpen}>
                <ListItemIcon>
                  <img src={defaultCardBack} height={30} alt={"cardback"} />
                </ListItemIcon>
                <ListItemText primary={"Change Cardback"} />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider />

          <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton onClick={handleOpenDialog}>
                <ListItemIcon>
                  <ChatIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary={"Game Log"} />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />

          <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <SettingsIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary={"Settings"} />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />

          <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton onClick={handleOpenRematchDialog}>
                <ListItemIcon>
                  <ReplayIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary={"Rematch"} />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />

          <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton onClick={exitToHome}>
                <ListItemIcon>
                  <ExitToAppIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary={"Exit Game"} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Dialog
        fullScreen={fullScreen}
        open={rematchOpenDialog}
        onClose={handleCloseRematchDialog}
        aria-labelledby="responsive-dialog-title"
      >
        {/* has not sent or received a rematch request */}
        {!acceptRematch && !reduxEnemyRematchStatus && (
          <DialogTitle id="responsive-dialog-title">
            {"Rematch Request"}
          </DialogTitle>
        )}

        {/* has sent a rematch request */}
        {acceptRematch && !reduxEnemyRematchStatus && (
          <DialogTitle id="responsive-dialog-title">
            {"Sent Rematch Request"}
          </DialogTitle>
        )}

        {/* has received a rematch request */}
        {!acceptRematch && reduxEnemyRematchStatus && (
          <DialogTitle id="responsive-dialog-title">
            {"Rematch Request Received"}
          </DialogTitle>
        )}
        <DialogContent>
          {/* has not sent or received a rematch request */}
          {!acceptRematch && !reduxEnemyRematchStatus && (
            <DialogContentText>
              Send a Rematch Request to your Opponent?
            </DialogContentText>
          )}

          {/* has sent a rematch request */}
          {acceptRematch && !reduxEnemyRematchStatus && (
            <DialogContentText>
              Waiting for Opponent to accept Rematch Request...
            </DialogContentText>
          )}

          {/* has received a rematch request */}
          {!acceptRematch && reduxEnemyRematchStatus && (
            <DialogContentText>
              Opponent has asked for a Rematch
            </DialogContentText>
          )}

          {/* has sent a rematch request */}
          {acceptRematch && !reduxEnemyRematchStatus && (
            <motion.div
              transition={{ duration: 7, repeat: Infinity }}
              animate={{ rotateY: 360 }}
            >
              <img height={"160px"} src={img} alt={"bellringer"} />
            </motion.div>
          )}

          {/* has received a rematch request */}
          {!acceptRematch && reduxEnemyRematchStatus && (
            <motion.div
              transition={{ duration: 7, repeat: Infinity }}
              animate={{ rotateY: 360 }}
            >
              <img height={"160px"} src={img} alt={"bellringer"} />
            </motion.div>
          )}
        </DialogContent>

        <DialogActions>
          {/* has not sent or received a rematch request */}
          {!acceptRematch && !reduxEnemyRematchStatus && (
            <Button autoFocus onClick={handleCloseRematchDialog}>
              No
            </Button>
          )}
          {!acceptRematch && !reduxEnemyRematchStatus && (
            <Button onClick={handleAcceptRematchUI} autoFocus>
              Yes
            </Button>
          )}
          {/* has sent a rematch request */}
          {acceptRematch && !reduxEnemyRematchStatus && (
            <Button onClick={handleDeclineRematchUI} autoFocus>
              Cancel
            </Button>
          )}
          {/* has received a rematch request */}
          {!acceptRematch && reduxEnemyRematchStatus && (
            <Button autoFocus onClick={handleCloseRematchDialog}>
              No
            </Button>
          )}
          {!acceptRematch && reduxEnemyRematchStatus && (
            <Button autoFocus onClick={handleAcceptRematchUI}>
              Yes
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        scroll={"paper"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Game Log</DialogTitle>
        <DialogContent
          style={{
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {reduxChatLog.map((x) =>
              x[9] === "M" ? (
                <Typography
                  variant="body1"
                  style={{ color: "red", whiteSpace: "pre-line" }}
                >
                  {x}
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  style={{ color: "blue", whiteSpace: "pre-line" }}
                >
                  {x}
                </Typography>
              )
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <IconButton
        onClick={handleDrawerOpen}
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
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "relative",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 1)",
            boxShadow: 24,
            p: 4,
            width: "40%",
          }}
        >
          <Card
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
            variant="outlined"
          >
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageForte} alt="Forte" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageGalmieux} alt="Galmieux" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageJeanne} alt="Jeanne" />
            </IconButton>

            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageRamina} alt="Ramina" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageAlbert} alt="Albert" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageDionne} alt="Dionne" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageDaria} alt="Daria" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageKuon} alt="Kuon" />
            </IconButton>

            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageCC} alt="CC" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageAria} alt="Aria" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageAmy} alt="Amy" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageMono} alt="Mono" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageMaru} alt="Maruzensky" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageRin} alt="Rin" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageUzuki} alt="Uzuki" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectLeader(e);
              }}
            >
              <img width="100px" src={imageMio} alt="Mio" />
            </IconButton>
          </Card>
        </Box>
      </Modal>
      <Modal
        open={openCardBack}
        onClose={handleCardBackModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "relative",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 1)",
            boxShadow: 24,
            p: 4,
            width: "40%",
          }}
        >
          <Card
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
            variant="outlined"
          >
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={fileneCardBack} alt="Filene" />
            </IconButton>

            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={galmieuxCardBack} alt="Galmieux" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={ginsetsuCardBack} alt="Ginsetsu" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={kuonCardBack} alt="Kuon" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={ladicaCardBack} alt="Ladica" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={lishennaCardBack} alt="Lishenna" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={machina1CardBack} alt="Machina1" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={machina2CardBack} alt="Machina2" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={mistolinaCardBack} alt="Mistolina" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={monoCardBack} alt="Mono" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={naturaCardBack} alt="Natura" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={piercyeCardBack} alt="Piercye" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={ralmiaCardBack} alt="Ralmia" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={shikiCardBack} alt="Shikigami" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={shutenCardBack} alt="Shuten" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={tetraCardBack} alt="Tetra" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={viridiaCardBack} alt="Viridia" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={wingsCardBack} alt="Wings" />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => {
                selectCardBack(e);
              }}
            >
              <img width="100px" src={yokaiCardBack} alt="Yokai" />
            </IconButton>
          </Card>
        </Box>
      </Modal>
    </>
  );
}
