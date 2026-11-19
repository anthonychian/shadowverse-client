import React, { useState, useEffect, useRef } from "react";

import { motion } from "framer-motion";
import imageSiLong from "../../assets/leaders/SiLong.png";
import imageForte from "../../assets/leaders/Forte.png";
import imageGalmieux from "../../assets/leaders/Galmieux.png";
import imageLishenna from "../../assets/leaders/Lishenna.png";
import imageCeridwen from "../../assets/leaders/Ceridwen.png";
import imageKuon from "../../assets/leaders/Kuon.png";
import imageDaria from "../../assets/leaders/Daria.png";
import imageBunny from "../../assets/leaders/Bunny.png";
import imageAlbert from "../../assets/leaders/Albert.png";
import imageSekka from "../../assets/leaders/Sekka.png";
import imageCC from "../../assets/leaders/CC.png";
import imageIcy from "../../assets/leaders/Icy.png";
import imageAnisage from "../../assets/leaders/Anisage.png";
import imageMono from "../../assets/leaders/Mono.png";
import imageVania from "../../assets/leaders/Vania.png";
import imageRola from "../../assets/leaders/Rola.png";
import imageJeanne from "../../assets/leaders/Jeanne.png";
import imageManhattenCafe from "../../assets/leaders/ManhattenCafe.png";
import imageMaru from "../../assets/leaders/Maru.png";
import imageRin from "../../assets/leaders/Rin.png";
import imageUzuki from "../../assets/leaders/Uzuki.png";
import imageMio from "../../assets/leaders/Mio.png";
import imageVanguard from "../../assets/leaders/Vanguard.png";

import dragon from "../../assets/logo/dragon.png";
import defaultCardBack from "../../assets/cardbacks/default.png";
import aeneaCardBack from "../../assets/cardbacks/aenea.png";
import dionneCardBack from "../../assets/cardbacks/dionne.png";
import dragonCardBack from "../../assets/cardbacks/dragon.png";
import fileneCardBack from "../../assets/cardbacks/filene.png";
import galmieuxCardBack from "../../assets/cardbacks/galmieux.png";
import jeanneCardBack from "../../assets/cardbacks/jeanne.png";
import kuonCardBack from "../../assets/cardbacks/kuon.png";
import ladicaCardBack from "../../assets/cardbacks/ladica.png";
import lishennaCardBack from "../../assets/cardbacks/lishenna.png";
import lishenna2CardBack from "../../assets/cardbacks/lishenna2.png";
import mistolinaCardBack from "../../assets/cardbacks/mistolina.png";
import monoCardBack from "../../assets/cardbacks/mono.png";
import orchisCardBack from "../../assets/cardbacks/orchis.png";
import piercyeCardBack from "../../assets/cardbacks/piercye.png";
import rosequeenCardBack from "../../assets/cardbacks/rosequeen.png";
import shikiCardBack from "../../assets/cardbacks/shiki.png";
import shutenCardBack from "../../assets/cardbacks/shuten.png";
import tidalgunnerCardBack from "../../assets/cardbacks/tidalgunner.png";
import viridiaCardBack from "../../assets/cardbacks/viridia.png";
import wilbertCardBack from "../../assets/cardbacks/wilbert.png";
import { SVGDB_LEADER_PORTRAIT } from "./leaderIds";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { socket, clearSavedRoom, clearSavedState } from "../../sockets";

import {
  Box,
  Modal,
  Card,
  ButtonBase,
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
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ReplayIcon from "@mui/icons-material/Replay";
import FlagIcon from "@mui/icons-material/Flag";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { Stack } from "@mui/material";
import { useEngineSync } from "../hooks/useEngineSync";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setLeader,
  setCardBack,
  reset,
  swapDeck,
  exitGame,
  setRematchStatus,
} from "../../redux/CardSlice";
import { selectDecks } from "../../redux/DeckSlice";
import { computeDeckClass } from "../../decks/cardDetails";
import { classIcon } from "../deckbuilder/icons";
import { randomLeaderForClass } from "../../decks/classLeaders";
import { setChatExpanded } from "../../redux/GameStateSlice";
import StyleIcon from "@mui/icons-material/Style";
import HideUiButton, { ModalHideUiRow } from "./HideUiButton";
import {
  deckModalCards,
  deckModalCount,
  deckModalTitle,
  deckModalToolbar,
  ghostButtonSx,
  useDeckModalBoxStyle,
} from "../field/deckModalStyles";
import {
  artThumb,
  cardImageSrc,
  cardNoImage,
  deckCoverName,
} from "../../decks/getCards";

export default function Selection({ setSelectedOption, setHovering, setPreviewDeck }) {
  // redux state
  const reduxEnemyRematchStatus = useSelector(
    (state) => state.card.enemyRematchStatus,
  );
  const img = require("../../assets/pin_bellringer_angel.png");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openCardBack, setOpenCardBack] = useState(false);
  const [openSwapDeck, setOpenSwapDeck] = useState(false);
  const swapDeckModalStyle = useDeckModalBoxStyle(openSwapDeck);

  // The player's saved decks (cloud when logged in, local otherwise) — the pool
  // to swap into mid-room.
  const savedDecks = useSelector(selectDecks) ?? [];

  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const handleSwapDeckOpen = () => setOpenSwapDeck(true);
  const handleSwapDeckClose = () => setOpenSwapDeck(false);

  const handleDeckPreviewStart = (deck) => {
    setHovering?.(false);
    setPreviewDeck?.(deck);
  };
  const handleDeckPreviewEnd = () => setPreviewDeck?.(null);

  useEffect(() => {
    if (!openSwapDeck) setPreviewDeck?.(null);
  }, [openSwapDeck, setPreviewDeck]);

  // Load a different saved deck without leaving the room: swapDeck re-seeds my
  // draw pile + evolve deck and resets only my side to a fresh start (the
  // opponent keeps their board). Then match a leader to the new deck's class.
  const handleSwapDeck = (savedDeck) => {
    if (!savedDeck || !Array.isArray(savedDeck.deck)) return;
    const deckClass = savedDeck.class || computeDeckClass(savedDeck.deck) || "";
    dispatch(
      swapDeck({
        deck: savedDeck.deck,
        evoDeck: savedDeck.evoDeck || [],
        art: savedDeck.art || {},
        deckClass,
        favoriteTokens: savedDeck.favoriteTokens || [],
      }),
    );
    const leader = randomLeaderForClass(deckClass);
    if (leader) {
      setSelectedOption(leader);
      dispatch(setLeader(leader));
    }
    setOpenSwapDeck(false);
    handleDrawerClose();
  };

  const handleCardBackModalOpen = () => setOpenCardBack(true);
  const handleCardBackModalClose = () => setOpenCardBack(false);

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const [rematchOpenDialog, setRematchOpenDialog] = useState(false);

  // const [rematchNotify, setRematchNotify] = useState(false);
  const reduxRoom = useSelector((state) => state.card.room);
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const chatExpanded = useSelector((state) => state.gameState.chatExpanded);
  const legalActions = useSelector((state) => state.gameState.legalActions) ?? [];
  const leaderActive = useSelector((state) => state.card.leaderActive);
  const { sendAction } = useEngineSync();

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

  const rematchHandledRef = useRef(false);

  const exitToHome = () => {
    dispatch(exitGame());
    // Free our slot in the room but KEEP the saved room/state in sessionStorage.
    // The opponent may still be there, so the Home board offers a private
    // Reconnect back into this game; the saved state makes that rejoin instant.
    // (If the room dies, Home's reconnect probe clears the stale entry.)
    socket.emit("leave_room", reduxRoom.toString());
    navigate("/");
  };

  // const reconnectToRoom = () => {
  //   socket.emit("leave_room", reduxRoom.toString());
  //   socket.emit("join_room", reduxRoom.toString());
  // };

  const handleAcceptRematchUI = () => {
    setAcceptRematch(true);
    dispatch(setRematchStatus(true));
  };
  const handleDeclineRematchUI = () => {
    setAcceptRematch(false);
    handleCloseRematchDialog();
    dispatch(setRematchStatus(false));
  };

  const handleOpenRematchDialog = () => {
    setRematchOpenDialog(true);
  };

  const handleCloseRematchDialog = () => {
    setRematchOpenDialog(false);
  };

  useEffect(() => {
    if (reduxEnemyRematchStatus) setRematchOpenDialog(true);
    else setRematchOpenDialog(false);
  }, [reduxEnemyRematchStatus]);

  useEffect(() => {
    if (!acceptRematch || !reduxEnemyRematchStatus) {
      rematchHandledRef.current = false;
      return;
    }
    if (rematchHandledRef.current) return;
    rematchHandledRef.current = true;
    dispatch(reset());
    setAcceptRematch(false);
  }, [acceptRematch, reduxEnemyRematchStatus]);

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
              <ListItemButton
                onClick={(e) => {
                  // The drawer's container closes on any click; keep it open
                  // for this toggle so the result can be seen immediately (and
                  // toggled right back if it's not what the player wanted).
                  e.stopPropagation();
                  dispatch(setChatExpanded(!chatExpanded));
                }}
              >
                <ListItemIcon>
                  {chatExpanded ? (
                    <CloseFullscreenIcon sx={{ color: "white" }} />
                  ) : (
                    <OpenInFullIcon sx={{ color: "white" }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    chatExpanded ? "Standard Log View" : "Expanded Log View"
                  }
                />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />

          {/* <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton onClick={handleZoomOutClick}>
                <ListItemIcon>
                  <SettingsIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary={"Resize"} />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider /> */}

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

          {gameMode !== "automated" && (
            <>
              <List>
                <ListItem key={"swapdeck"} disablePadding>
                  <ListItemButton onClick={handleSwapDeckOpen}>
                    <ListItemIcon>
                      <StyleIcon sx={{ color: "white" }} />
                    </ListItemIcon>
                    <ListItemText primary={"Swap Deck"} />
                  </ListItemButton>
                </ListItem>
              </List>
              <Divider />
            </>
          )}

          {gameMode === "automated" && (
            <>
              <List>
                <ListItem key={"concede"} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      sendAction({ type: "CONCEDE" });
                      handleDrawerClose();
                    }}
                  >
                    <ListItemIcon>
                      <FlagIcon sx={{ color: "white" }} />
                    </ListItemIcon>
                    <ListItemText primary={"Concede"} />
                  </ListItemButton>
                </ListItem>
              </List>
              <Divider />
            </>
          )}

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

          <Divider />

          {/* <List>
            <ListItem key={"text"} disablePadding>
              <ListItemButton onClick={reconnectToRoom}>
                <ListItemIcon>
                  <SensorsIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary={"Reconnect"} />
              </ListItemButton>
            </ListItem>
          </List> */}
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

      <Modal
        open={openSwapDeck}
        onClose={handleSwapDeckClose}
        aria-labelledby="swap-deck-title"
        sx={{ "& > .MuiBackdrop-root": { backgroundColor: "transparent" } }}
      >
        <Box sx={swapDeckModalStyle}>
          <ModalHideUiRow />
          <div style={deckModalToolbar}>
            <span id="swap-deck-title" style={deckModalTitle}>
              SWAP DECK
            </span>
            <span style={deckModalCount}>{savedDecks.length} SAVED</span>
            <Button
              onClick={handleSwapDeckClose}
              sx={{ ...ghostButtonSx, marginLeft: "auto" }}
            >
              Close
            </Button>
          </div>
          <Card
            variant="outlined"
            sx={{
              ...deckModalCards,
              gap: "0.9em",
              alignContent: "flex-start",
            }}
          >
            {savedDecks.length === 0 ? (
              <div
                style={{
                  color: "rgba(218, 246, 255, 0.7)",
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: 13,
                  textAlign: "center",
                  padding: "2em 0",
                }}
              >
                No saved decks found.
              </div>
            ) : (
              savedDecks.map((d, i) => {
                const coverName = deckCoverName(d);
                const chosenArt = d.art?.[coverName];
                const deckClass = d.class || computeDeckClass(d.deck) || "";
                const classIconSrc = classIcon(deckClass);
                return (
                  <ButtonBase
                    key={`${d.name}-${i}`}
                    onClick={() => handleSwapDeck(d)}
                    onMouseEnter={() => handleDeckPreviewStart(d)}
                    onMouseLeave={handleDeckPreviewEnd}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      width: 112,
                      padding: "8px 6px",
                      borderRadius: "10px",
                      color: "#eafaff",
                      fontFamily: "Noto Serif JP, serif",
                      textTransform: "none",
                      border: "1px solid rgba(72, 171, 224, 0.4)",
                      background: "rgba(10, 14, 20, 0.65)",
                      transition:
                        "border-color 0.12s ease, box-shadow 0.12s ease, background 0.12s ease",
                      "&:hover": {
                        borderColor: "#8cdcff",
                        background: "rgba(72, 171, 224, 0.16)",
                        boxShadow: "0 0 16px rgba(72, 171, 224, 0.45)",
                      },
                    }}
                  >
                    <img
                      src={artThumb(coverName, d.art)}
                      alt={`${d.name || "Unnamed deck"} cover`}
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset.fallback === "full") return;
                        if (chosenArt && img.src.includes("/thumbs/")) {
                          img.dataset.fallback = "full";
                          img.src = cardNoImage(chosenArt);
                        } else {
                          img.dataset.fallback = "full";
                          img.src = cardImageSrc(coverName);
                        }
                      }}
                      style={{
                        width: 88,
                        height: 123,
                        objectFit: "cover",
                        borderRadius: 6,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.7)",
                      }}
                    />
                    <span
                      style={{
                        maxWidth: 100,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: 13,
                        lineHeight: 1.3,
                      }}
                    >
                      {d.name || "Unnamed deck"}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "Share Tech Mono, monospace",
                        fontSize: 11,
                        letterSpacing: "0.06em",
                        color: "#8cdcff",
                        opacity: 0.85,
                      }}
                    >
                      {classIconSrc && (
                        <img
                          src={classIconSrc}
                          alt=""
                          style={{
                            width: 13,
                            height: 13,
                            objectFit: "contain",
                          }}
                        />
                      )}
                      <span>{deckClass.toUpperCase() || "—"}</span>
                    </span>
                  </ButtonBase>
                );
              })
            )}
          </Card>
        </Box>
      </Modal>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          position: "fixed",
          left: "1%",
          top: "1%",
          zIndex: 1000,
        }}
      >
        <HideUiButton size="medium" />
        <IconButton
          aria-label="open menu"
          onClick={handleDrawerOpen}
          sx={{
            color: "#eaf6ff",
            width: 52,
            height: 52,
            borderRadius: "14px",
            backgroundColor: "rgba(10, 14, 20, 0.92)",
            backdropFilter: "blur(6px)",
            transition: "background-color 120ms ease, transform 120ms ease",
            "&:hover": {
              backgroundColor: "rgba(72, 171, 224, 0.18)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <MenuIcon sx={{ width: 30, height: 30 }} />
        </IconButton>
        {gameMode === "automated" && leaderActive && legalActions.includes("END_MAIN") && (
          <Button
            variant="contained"
            size="large"
            onClick={() => sendAction({ type: "END_MAIN" })}
            sx={{ fontSize: "1.05rem", px: 3, py: 1.25, fontWeight: 600 }}
          >
            End Turn
          </Button>
        )}
      </Stack>
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
              <img width="100px" src={imageSiLong} alt="SiLong" />
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
              <img
                width="100px"
                src={SVGDB_LEADER_PORTRAIT.Lumiore}
                alt="Lumiore"
              />
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
              <img width="100px" src={imageBunny} alt="Bunny" />
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
              <img width="100px" src={imageLishenna} alt="Lishenna" />
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
              <img width="100px" src={imageCeridwen} alt="Ceridwen" />
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
              <img width="100px" src={imageSekka} alt="Sekka" />
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
              <img
                width="100px"
                src={SVGDB_LEADER_PORTRAIT.Piercye}
                alt="Piercye"
              />
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
              <img width="100px" src={imageIcy} alt="Icy" />
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
              <img width="100px" src={imageAnisage} alt="Anisage" />
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
              <img width="100px" src={SVGDB_LEADER_PORTRAIT.Amy} alt="Amy" />
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
              <img width="100px" src={imageVania} alt="Vania" />
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
              <img width="100px" src={imageRola} alt="Rola" />
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
              <img
                width="100px"
                src={imageManhattenCafe}
                alt="Manhatten Cafe"
              />
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
              <img width="100px" src={imageVanguard} alt="Vanguard" />
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
              <img
                width="100px"
                src={SVGDB_LEADER_PORTRAIT.Pecorine}
                alt="Pecorine"
              />
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
              <img
                width="100px"
                src={SVGDB_LEADER_PORTRAIT.Karyl}
                alt="Karyl"
              />
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
              <img width="100px" src={aeneaCardBack} alt="Aenea" />
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
              <img width="100px" src={dionneCardBack} alt="Dionne" />
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
              <img width="100px" src={dragonCardBack} alt="Dragon" />
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
              <img width="100px" src={jeanneCardBack} alt="Jeanne" />
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
              <img width="100px" src={lishenna2CardBack} alt="Lishenna2" />
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
              <img width="100px" src={orchisCardBack} alt="Orchis" />
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
              <img width="100px" src={rosequeenCardBack} alt="RoseQueen" />
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
              <img width="100px" src={tidalgunnerCardBack} alt="TidalGunner" />
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
              <img width="100px" src={wilbertCardBack} alt="Wilbert" />
            </IconButton>
          </Card>
        </Box>
      </Modal>
    </>
  );
}
