import React, { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import wallpaper from "../../src/assets/wallpapers/3.png";
import html2canvas from "html2canvas";

import galmieux from "../../src/assets/wallpapers/Galmieux.png";
import viridia from "../../src/assets/wallpapers/viridia.png";
import piercye from "../../src/assets/wallpapers/piercye.png";
import kuon from "../../src/assets/wallpapers/Kuon.png";
import korwa from "../../src/assets/wallpapers/Korwa.png";
import tsubaki from "../../src/assets/wallpapers/Tsubaki.png";
import grimnir from "../../src/assets/wallpapers/Grimnir.png";

import buttonImage from "../../src/assets/buttons/variant1.png";
import shadowverse from "../../src/assets/wallpapers/SVElogo.png";
import cardback from "../assets/cardbacks/default.png";
import discord from "../assets/buttons/discord.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setDeck,
  setEvoDeck,
  setRoom,
  setActiveUsers,
  setDeckClass,
  setMyArt,
} from "../redux/CardSlice";
import { deleteDeck } from "../redux/DeckSlice";
import { cardImage, artImage, artThumb } from "../decks/getCards";
import useMediaQuery from "@mui/material/useMediaQuery";
import { computeDeckClass, getCost } from "../decks/cardDetails";
import {
  socket,
  saveRoom,
  getSavedRoom,
  clearSavedRoom,
  clearSavedState,
  getDisplayName,
  saveDisplayName,
} from "../sockets";
import ActiveGamesBoard from "../components/ui/ActiveGamesBoard";

import ArrowBackIosNew from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";
import CardMUI from "@mui/material/Card";
import {
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from "@mui/material";

import "../css/Home.css";

// Names of the leaders shown on the Home screen, keyed by `leaderNum` (see
// randomLeader). Used as the default lobby display name so an un-named player is
// labelled after the leader currently on their Home page rather than "Anonymous".
const LEADER_NAMES = {
  1: "Galmieux",
  2: "Kuon",
  3: "Korwa",
  4: "Viridia",
  5: "Tsubaki",
  6: "Grimnir",
  7: "Piercye",
};

// Order deck entries by play-point cost (then name), matching the deck builder's
// DeckPanel so the Home preview reads the same way.
const sortedEntries = (map) =>
  [...map.entries()].sort((a, b) => {
    const ca = getCost(a[0]);
    const cb = getCost(b[0]);
    const va = ca == null ? 99 : ca;
    const vb = cb == null ? 99 : cb;
    if (va !== vb) return va - vb;
    return a[0].localeCompare(b[0]);
  });

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedDeck, setSelectedDeck] = useState({});
  const [deckMap] = useState(new Map());
  const [evoDeckMap] = useState(new Map());

  const [showSelected, setShowSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [openDialogue, setOpenDialogue] = useState(false);
  const [leaderImage, setLeaderImage] = useState(null);
  const [leaderNum, setLeaderNum] = useState(0);
  const [openSnack, setOpenSnack] = useState(false);
  const [deckIdx, setDeckIdx] = useState(0);

  // Lobby board state. `rooms` is the live list of joinable public games pushed
  // by the server; `myRoom` is the room this tab is currently hosting (shown in
  // its own section with a public/private toggle), or null if none.
  const [rooms, setRooms] = useState([]);
  const [myRoom, setMyRoom] = useState(null);
  const [displayName, setDisplayName] = useState(getDisplayName());
  // A room this player was in and can rejoin (private to them — see the lobby
  // effect). null when there's nothing to reconnect to.
  const [reconnectRoom, setReconnectRoom] = useState(null);

  // Phone layout: a single scrollable column instead of the desktop's
  // absolutely-positioned panels. The announcements board collapses behind a
  // toggle and the Discord/DingDongDB links are hidden to save space.
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showAnnounce, setShowAnnounce] = useState(false);

  const reduxDecks = useSelector((state) => state.deck.decks);
  const reduxActiveUsers = useSelector((state) => state.card.activeUsers);
  const numLeaders = 7;

  // Announcements board — add new entries to the top of this list.
  // Each entry: { date, title, body }
  const announcements = [
    {
      date: "2026-06-11",
      title: "Lobby Board added",
      body: "Join, host, or reconnect to games from the new active games board.",
    },
    {
      date: "2026-06-11",
      title: "New deck builder",
      body: "The deck builder has been redesigned with a new layout and full card metadata.",
    },
    {
      date: "2026-06-11",
      title: "Automatic reconnection after desync",
      body: "Games now self-heal from desyncs and automatically reconnect you to keep play in sync.",
    },
    {
      date: "2026-05-30",
      title: "Card list updated to BP17",
      body: "The deck builder now includes all cards up to and including BP17.",
    },
    {
      date: "2026-05-30",
      title: "Announcements board added",
      body: "This board will show the latest set updates, new features, and other news.",
    },
  ];

  useEffect(() => {
    const onStartGame = () => handleNavigateToGame();
    const onActiveUsers = (data) => dispatch(setActiveUsers(data));
    socket.on("start_game", onStartGame);
    socket.on("active_users", onActiveUsers);
    // Remove these on unmount; otherwise each return trip to Home stacks another
    // start_game handler (firing navigate multiple times) and leaves a stale one
    // alive that could yank the host into a game while they're off another page.
    return () => {
      socket.off("start_game", onStartGame);
      socket.off("active_users", onActiveUsers);
    };
  }, [socket]);

  // Subscribe to the lobby so the active-games board updates live. Request the
  // current snapshot on mount (also covers reconnects, since the listener stays
  // registered). Leave the lobby channel on unmount (e.g. navigating to a game).
  useEffect(() => {
    socket.on("rooms_update", (data) => {
      setRooms(Array.isArray(data) ? data : []);
      // The lobby changed (someone created/joined/left/disconnected). Re-probe
      // our saved room so a stale Reconnect card clears the moment the last
      // player leaves it (room drops to 0 connected). Without this the probe
      // would only run once on mount and the button would linger.
      const saved = getSavedRoom();
      if (saved) socket.emit("check_room", { room: saved });
    });

    // Reconnect probe: if this tab remembers a room, ask the server (privately)
    // whether it's still rejoinable. Offer a Reconnect card only when the room
    // is alive (an opponent is there) and this socket isn't already a member of
    // it — i.e. a game we dropped out of, not our own open lobby room. A dead
    // room (0 connected) is forgotten so the stale entry doesn't linger.
    socket.on("room_status", ({ room, connected, isMember }) => {
      if (room !== getSavedRoom()) return;
      if (!isMember && connected >= 1 && connected < 2) {
        setReconnectRoom(room);
      } else {
        setReconnectRoom(null);
        if (connected === 0) {
          clearSavedRoom();
          clearSavedState(room);
        }
      }
    });

    socket.emit("lobby_join");
    socket.emit("request_rooms");
    const saved = getSavedRoom();
    if (saved) socket.emit("check_room", { room: saved });

    return () => {
      socket.emit("lobby_leave");
      socket.off("rooms_update");
      socket.off("room_status");
    };
  }, [socket]);

  useEffect(() => {
    setLeaderImage(randomLeader());
  }, []);

  useEffect(() => {
    setShowSelected(new Array(reduxDecks.length).fill(false));
  }, [reduxDecks]);

  // const handleStartHover = (key) => {
  //   setHover(true);
  //   setHoverCard(key);
  // };
  // const handleEndHover = () => {
  //   setHover(false);
  //   setHoverCard("");
  // };

  const handleModalOpen = () => {
    handleClose();
    if (selectedDeck.deck.length > 0) setOpen(true);
  };
  const handleModalClose = () => setOpen(false);

  const handleOpenDialogue = () => {
    setOpenDialogue(true);
    handleClose();
  };
  const handleCloseDialogue = () => {
    setOpenDialogue(false);
  };

  // A deck's class: its declared class (required in the builder) or, for legacy
  // decks, computed from contents.
  const deckClassOf = (d) =>
    (d && (d.class || computeDeckClass(d.deck))) || "";

  const handleCreateRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (socket.id) {
        const roomId = parseInt(Math.random() * 10000000).toString();
        // Hosting a fresh game abandons any game we could have reconnected to.
        const prev = getSavedRoom();
        if (prev && prev !== roomId) clearSavedState(prev);
        setReconnectRoom(null);
        setRoomNumber(roomId);
        dispatch(setRoom(roomId));
        saveRoom(roomId);
        // New rooms default to public so they appear on everyone's board; the
        // host can flip to private from the board afterwards.
        const room = {
          roomId,
          hostName: displayName || LEADER_NAMES[leaderNum] || "Challenger",
          // Prefer the deck's declared class (now required in the builder); fall
          // back to computing it from the card contents for legacy decks.
          deckClass: deckClassOf(selectedDeck),
          isPrivate: false,
        };
        // Stash the class so the game can auto-pick a matching leader on load.
        dispatch(setDeckClass(room.deckClass));
        setMyRoom(room);
        socket.emit("create_room", room);
      }
    }
  };
  const handleJoinRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (roomNumber !== "") {
        setRoomNumber(roomNumber.toString());
        dispatch(setRoom(roomNumber.toString()));
        dispatch(setDeckClass(deckClassOf(selectedDeck)));
        saveRoom(roomNumber.toString());
        socket.emit("join_room", roomNumber.toString());
      }
    }
  };

  // Join an open game straight from the board. Mirrors handleJoinRoom but takes
  // the target room id directly. Requires a selected deck (same guard as the
  // manual join/create flows) — without it there's nothing to play.
  const handleJoinPublicRoom = (roomId) => {
    if (Object.keys(selectedDeck).length === 0) return;
    setRoomNumber(roomId);
    dispatch(setRoom(roomId));
    dispatch(setDeckClass(deckClassOf(selectedDeck)));
    saveRoom(roomId);
    socket.emit("join_room", roomId);
  };

  // Rejoin a game we previously dropped out of. The room/state are still in
  // sessionStorage, so navigating to /game lets Field.js run its normal rejoin +
  // state-resync handshake on mount.
  const handleReconnect = (roomId) => {
    dispatch(setRoom(roomId));
    saveRoom(roomId);
    navigate("/game");
  };

  const handleTogglePrivacy = (isPrivate) => {
    if (!myRoom) return;
    setMyRoom({ ...myRoom, isPrivate });
    socket.emit("set_room_privacy", { roomId: myRoom.roomId, isPrivate });
  };

  // Close the room we're hosting: tell the server to drop it (which de-registers
  // it from everyone's board) and clear our local state so the slot is gone.
  const handleCloseRoom = () => {
    if (!myRoom) return;
    socket.emit("leave_room", myRoom.roomId);
    clearSavedState(myRoom.roomId);
    clearSavedRoom();
    setMyRoom(null);
    setRoomNumber("");
    dispatch(setRoom(""));
  };

  const handleDisplayNameChange = (event) => {
    const value = event.target.value;
    setDisplayName(value);
    saveDisplayName(value);
  };

  const handleDeleteDeck = () => {
    handleClose();
    handleCloseDialogue();
    dispatch(deleteDeck(name));
  };

  const handleClose = () => {
    setContextMenu(null);
  };
  const handleContextMenu = (event, deck, idx) => {
    setName(deck.name);
    setDeckIdx(idx);
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
    handleSelectDeck(deck, idx);
  };

  const handleRoomNumberInput = (event) => {
    setRoomNumber(event.target.value);
  };

  const handleNavigateToDeck = () => {
    // Leaving matchmaking for the builder — close any room we're hosting so it
    // doesn't linger on everyone's board as an unjoinable ghost.
    handleCloseRoom();
    navigate("/deck");
  };

  const handleEditDeck = () => {
    handleCloseRoom();
    navigate("/deck", {
      state: { deckName: name },
    });
  };

  const handleNavigateToGame = () => {
    // Mark this as a fresh game start (vs. a reconnect) so the game auto-selects
    // a leader for the deck's class on load.
    navigate("/game", { state: { fresh: true } });
  };

  const handleCardSelection = (card) => {
    if (deckMap.has(card)) {
      if (deckMap.get(card) === 1 && card === "Shenlong") return;
      else if (deckMap.get(card) === 1 && card === "Curse Crafter") return;
      else if (
        deckMap.get(card) === 3 &&
        card !== "Onion Patch" &&
        card !== "Rapid Fire"
      )
        return;
      else {
        deckMap.set(card, deckMap.get(card) + 1);
      }
    } else {
      deckMap.set(card, 1);
    }
    setDeck((deck) => [...deck, card]);
  };
  const handleEvoCardSelection = (card) => {
    if (evoDeckMap.has(card)) {
      if (
        evoDeckMap.get(card) === 3 &&
        card !== "Carrot" &&
        card !== "Drive Point"
      ) {
        return;
      } else {
        evoDeckMap.set(card, evoDeckMap.get(card) + 1);
      }
    } else {
      evoDeckMap.set(card, 1);
    }
    setEvoDeck((deck) => [...deck, card]);
  };
  const handleSelectDeck = (deck, idx) => {
    deckMap.clear();
    evoDeckMap.clear();
    for (let i = 0; i < deck.deck.length; i++) {
      handleCardSelection(deck.deck[i]);
    }
    for (let i = 0; i < deck.evoDeck.length; i++) {
      handleEvoCardSelection(deck.evoDeck[i]);
    }
    const newDeck = deck;
    setSelectedDeck(newDeck);
    let res = [];
    for (let i = 0; i < reduxDecks.length; i++) {
      if (i === idx) res.push(true);
      else res.push(false);
    }
    setShowSelected(res);

    dispatch(setDeck(newDeck.deck.toSorted(() => Math.random() - 0.5)));
    // Carry the deck's rarity/art choices into the game so cards render with the
    // chosen printing (synced to the opponent via full-state). Game-safe: only
    // affects which texture is shown, never card identity.
    dispatch(setMyArt(newDeck.art || {}));

    dispatch(
      setEvoDeck(
        newDeck.evoDeck.map((card) => {
          return { card: card, status: false };
        }),
      ),
    );
  };

  const randomLeader = () => {
    const num = Math.floor(Math.random() * numLeaders + 1);
    setLeaderNum(num);
    switch (num) {
      case 1:
        return galmieux;
      case 2:
        return kuon;
      case 3:
        return korwa;
      case 4:
        return viridia;
      case 5:
        return tsubaki;
      case 6:
        return grimnir;
      case 7:
        return piercye;
      default:
        return galmieux;
    }
  };

  const handleCloseSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  const handleBackClick = () => {
    if (deckIdx - 1 < 0) return;
    else {
      handleSelectDeck(reduxDecks[deckIdx - 1], deckIdx - 1);
      setDeckIdx(deckIdx - 1);
    }
  };

  const handleForwardClick = () => {
    if (deckIdx >= reduxDecks.length - 1) return;
    else {
      handleSelectDeck(reduxDecks[deckIdx + 1], deckIdx + 1);
      setDeckIdx(deckIdx + 1);
    }
  };

  // const deckToImage = () => {
  //   var element = document.getElementById("deckPreview");
  //   html2canvas(element).then(function (canvas) {
  //     canvas.toBlob(function (blob) {
  //       window.saveAs(blob, "preview.png");
  //     });
  //   });
  // };

  const deckToImage = () => {
    const element = document.getElementById("deckPreview");

    if (!element) {
      console.error("deckPreview element not found");
      return;
    }

    html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: "rgba(31, 31, 31)",
    })
      .then((canvas) => {
        const image = canvas.toDataURL("image/png");
        const newTab = window.open();
        newTab.document.body.innerHTML = `<img src="${image}" style="width: 100%; height: 100%;" />`;
        newTab.document.title = `deck-${Date.now()}.png`;
      })
      .catch((err) => console.error(err));
  };

  // const deckToImageSaved = () => {
  //   const element = document.getElementById("deckPreview");

  //   if (!element) {
  //     console.error("deckPreview element not found");
  //     return;
  //   }

  //   html2canvas(element, {
  //     allowTaint: true,
  //     useCORS: true,
  //     backgroundColor: "#1f1f1f",
  //   })
  //     .then((canvas) => {
  //       const link = document.createElement("a");
  //       link.href = canvas.toDataURL("image/png");
  //       link.download = `deck-${Date.now()}.png`;
  //       link.click();
  //     })
  //     .catch((err) => console.error(err));
  // };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnack}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      style={{
        height: isMobile ? "auto" : "100vh",
        minHeight: "100vh",
        width: "100vw",
        background: "url(" + wallpaper + ") center center fixed",
        backgroundSize: "cover",
        display: "flex",
        // justifyContent: "center",
        alignItems: isMobile ? "stretch" : "center",
        flexDirection: isMobile ? "column" : "row",
        overflowY: isMobile ? "auto" : "hidden",
      }}
    >
      <Dialog
        open={openDialogue}
        onClose={handleCloseDialogue}
        PaperProps={{
          component: "form",
        }}
      >
        <DialogTitle>Delete Deck</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this deck?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogue}>No</Button>
          <Button onClick={handleDeleteDeck} type="submit">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnack}
        autoHideDuration={6000}
        onClose={handleCloseSnack}
        message="Copied link to clipboard"
        action={action}
      />
      {!isMobile && (
      <>
      <div
        style={{
          height: "100vh",
          width: "45%",
          // backgroundColor: "rgba(0, 0, 0, 0.60)",
          borderRadius: "10px",
          border: "4px solid #0000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          overflow: "hidden",
        }}
      >
        <div>
          <img height={250} src={shadowverse} alt={"shadowverse"} />
          {/* <img style={{ marginTop: "5em" }} height={150} src={ga} alt={"ga"} /> */}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50%",
            width: "40%",
          }}
        >
          <Stack spacing={5} direction="column">
            <Button
              onClick={handleCreateRoom}
              sx={{
                position: "relative",
                fontFamily: "Noto Serif JP,serif",
                textTransform: "none",
                fontWeight: "bold",
                backgroundColor: "transparent",
                color: "black",
                width: "350px",
                height: "75px",
                borderRadius: "50px",
                "&:hover": { boxShadow: "0 0 30px 15px #48abe0" },
              }}
              // variant="contained"
            >
              <img height={90} src={buttonImage} alt={"button"} />
              <div
                style={{
                  position: "absolute",
                  fontSize: "35px",
                }}
              >
                PLAY
              </div>
            </Button>
            <Button
              onClick={handleJoinRoom}
              sx={{
                position: "relative",
                fontFamily: "Noto Serif JP,serif",
                textTransform: "none",
                fontWeight: "bold",
                backgroundColor: "transparent",
                color: "black",
                height: "50px",
                width: "240px",
                borderRadius: "50px",
                "&:hover": { boxShadow: "0 0 30px 15px #48abe0" },
              }}
            >
              <img height={60} src={buttonImage} alt={"button"} />
              <div style={{ position: "absolute", fontSize: "20px" }}>
                JOIN ROOM
              </div>
            </Button>
            <input
              style={{
                padding: ".3em",
                marginLeft: "1em",
                fontSize: "15px",
                width: "50%",
                fontFamily: "Noto Serif JP, serif",
              }}
              type="text"
              value={roomNumber}
              onChange={handleRoomNumberInput}
              placeholder="Room Code..."
            />
          </Stack>
        </div>

        <div
          style={{
            display: "flex",
            // backgroundColor: "red",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: "50%",
            width: "100%",
          }}
        >
          <div
            style={{
              // backgroundColor: "yellow",
              display: "flex",
              flexDirection: "row",
              overflowX: "auto",
              alignItems: "center",
              paddingLeft: "1em",
              paddingRight: "3em",
              // height: "50%",
              width: "80%",
              gap: "1em",
              justifyContent: reduxDecks.length > 2 ? "start" : "center",
            }}
          >
            {reduxDecks.length > 0 &&
              reduxDecks.map((deck, idx) => (
                <div
                  key={idx}
                  onContextMenu={(e) => {
                    handleContextMenu(e, deck, idx);
                  }}
                  onClick={() => handleSelectDeck(deck, idx)}
                  style={{
                    cursor: "pointer",
                    height: "160px",
                    width: "115px",
                    borderRadius: "10px",
                    border: "50px solid #0000",
                    backgroundColor: showSelected[idx]
                      ? "rgba(170, 170, 170, 0.50)"
                      : "transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        transform: "rotate(-25deg)",
                        position: "absolute",
                        right: "20%",
                        zIndex: 1,
                      }}
                    >
                      <img
                        height={"160px"}
                        src={artImage(deck.deck[0], deck.art)}
                        alt={"cardback"}
                      />
                    </div>
                    <div style={{ zIndex: 2 }}>
                      <img
                        height={"160px"}
                        src={artImage(
                          deck.deck[Math.floor(deck.deck.length / 2)],
                          deck.art,
                        )}
                        alt={"cardback"}
                      />
                    </div>
                    <div
                      style={{
                        transform: "rotate(25deg)",
                        position: "absolute",
                        left: "20%",
                        zIndex: 3,
                      }}
                    >
                      <img
                        height={"160px"}
                        src={artImage(deck.deck[deck.deck.length - 1], deck.art)}
                        alt={"cardback"}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      bottom: 35,
                      zIndex: 10,
                      height: "35px",
                      width: "120px",
                      backgroundColor: "#131219",
                      // color: "black",
                      color: "white",
                      fontSize: "17px",
                      // borderRadius: "10px",
                      // border: "4px solid #0000",
                      fontFamily: "Noto Serif JP,serif",
                      display: "inline-block",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                      verticalAlign: "bottom",
                    }}
                  >
                    {deck.name}
                  </div>
                </div>
              ))}
          </div>
          <div
            style={{
              // backgroundColor: "red",
              height: "300px",
              width: "200px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              onClick={handleNavigateToDeck}
              sx={{
                // backgroundColor: "green",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2,
                height: "90px",
                width: "80px",
                "&:hover": { boxShadow: "0 0 40px 17px #48abe0" },
              }}
            >
              <img height={"130px"} src={cardback} alt={"cardback"} />
              <div
                style={{
                  height: "35px",
                  width: "100px",
                  color: "white",
                  fontSize: "17px",
                  border: "4px solid #0000",
                  // backgroundColor: "#131219",
                  fontFamily: "Noto Serif JP,serif",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                NEW DECK
              </div>
            </Button>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "3%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "380px",
          maxWidth: "32vw",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: "0.5em",
        }}
      >
        <input
          style={{
            padding: ".5em .8em",
            fontSize: "14px",
            width: "100%",
            boxSizing: "border-box",
            textAlign: "center",
            color: "#daf6ff",
            backgroundColor: "rgba(10, 14, 20, 0.75)",
            border: "1px solid rgba(72, 171, 224, 0.5)",
            borderRadius: "8px",
            outline: "none",
            fontFamily: "Noto Serif JP, serif",
          }}
          type="text"
          maxLength={20}
          value={displayName}
          onChange={handleDisplayNameChange}
          placeholder={LEADER_NAMES[leaderNum] || "Display name..."}
        />
        <ActiveGamesBoard
          rooms={rooms}
          myRoom={myRoom}
          reconnectRoom={reconnectRoom}
          onJoin={handleJoinPublicRoom}
          onReconnect={handleReconnect}
          onTogglePrivacy={handleTogglePrivacy}
          onCloseRoom={handleCloseRoom}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "0",
          width: "320px",
          maxHeight: "85%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "1em",
          zIndex: 2,
        }}
      >
        {reduxActiveUsers !== 0 && (
          <div
            style={{
              alignSelf: "flex-start",
              fontSize: 30,
              fontFamily: "Share Tech Mono, monospace",
              color: " #daf6ff",
              textShadow:
                "0 0 20px rgba(10, 175, 230, 1),  0 0 20px rgba(10, 175, 230, 0)",
              background:
                "radial-gradient(ellipse at center,  #0a2e38  0%, #000000 70%)",
            }}
          >
            {reduxActiveUsers} users online
          </div>
        )}
        <div
          style={{
            width: "100%",
            maxHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(10, 14, 20, 0.75)",
            border: "1px solid rgba(72, 171, 224, 0.5)",
            borderRight: "none",
            borderRadius: "10px 0 0 10px",
            boxShadow: "0 0 20px rgba(10, 175, 230, 0.25)",
            overflow: "hidden",
          }}
        >
        <div
          style={{
            overflowY: "auto",
            padding: "0.5em 1em 1em",
            maxHeight: "270px",
          }}
        >
          {announcements.map((item, idx) => (
            <div
              key={idx}
              style={{
                paddingTop: "0.75em",
                paddingBottom: "0.75em",
                borderBottom:
                  idx < announcements.length - 1
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "0.5em",
                }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: "15px",
                    fontFamily: "Noto Serif JP, serif",
                    fontWeight: "bold",
                  }}
                >
                  {item.title}
                </span>
                <span
                  style={{
                    color: "#7da7bd",
                    fontSize: "12px",
                    fontFamily: "Share Tech Mono, monospace",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.date}
                </span>
              </div>
              <div
                style={{
                  color: "#c9d6dd",
                  fontSize: "13px",
                  fontFamily: "Noto Serif JP, serif",
                  marginTop: "0.25em",
                  lineHeight: "1.35",
                }}
              >
                {item.body}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "4em",
          right: "2em",
          height: "10px",
          // width: "40px",
          color: "white",

          fontFamily: "Noto Serif JP, serif",
          borderRadius: "7px",
        }}
      >
        <a
          href="https://discord.gg/shadowverse-evolve-tcg-community-928746294384677004"
          target="_blank"
          rel="noreferrer noopener"
          style={{ position: "absolute", right: 0, zIndex: 2 }}
        >
          <img height={"40px"} src={discord} alt={"discord"} />
        </a>
      </div>
      <div className="LeaderContainerHome">
        <img
          className="LeaderImageHome"
          src={leaderImage}
          alt={"leader"}
          style={leaderNum === 6 ? { paddingTop: "100px" } : {}}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "3.8em",
          right: "6em",
          height: "10px",
          // width: "40px",
          color: "white",

          fontFamily: "Noto Serif JP, serif",
          borderRadius: "7px",
        }}
      >
        <a
          href="https://dingdongdb.me/builder"
          target="_blank"
          rel="noreferrer noopener"
          style={{ position: "absolute", right: 10, zIndex: 2 }}
        >
          <Chip color="primary" label="DingDongDB" clickable />
        </a>
      </div>
      </>
      )}

      {isMobile && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: "100%",
            maxWidth: 460,
            margin: "0 auto",
            padding: "18px 14px 36px",
            boxSizing: "border-box",
          }}
        >
          {/* Player Name */}
          {reduxActiveUsers !== 0 && (
            <div
              style={{
                fontSize: 14,
                fontFamily: "Share Tech Mono, monospace",
                color: "#daf6ff",
                textShadow: "0 0 12px rgba(10, 175, 230, 0.8)",
              }}
            >
              {reduxActiveUsers} users online
            </div>
          )}
          <input
            style={{
              padding: ".6em .8em",
              fontSize: 15,
              width: "100%",
              boxSizing: "border-box",
              textAlign: "center",
              color: "#daf6ff",
              backgroundColor: "rgba(10, 14, 20, 0.75)",
              border: "1px solid rgba(72, 171, 224, 0.5)",
              borderRadius: 8,
              outline: "none",
              fontFamily: "Noto Serif JP, serif",
            }}
            type="text"
            maxLength={20}
            value={displayName}
            onChange={handleDisplayNameChange}
            placeholder={LEADER_NAMES[leaderNum] || "Display name..."}
          />

          {/* Active Games */}
          <div style={{ width: "100%" }}>
            <ActiveGamesBoard
              rooms={rooms}
              myRoom={myRoom}
              reconnectRoom={reconnectRoom}
              onJoin={handleJoinPublicRoom}
              onReconnect={handleReconnect}
              onTogglePrivacy={handleTogglePrivacy}
              onCloseRoom={handleCloseRoom}
            />
          </div>

          {/* PLAY */}
          <Button
            onClick={handleCreateRoom}
            sx={{
              position: "relative",
              fontFamily: "Noto Serif JP,serif",
              textTransform: "none",
              fontWeight: "bold",
              color: "black",
              width: "100%",
              maxWidth: 300,
              height: 70,
              borderRadius: "50px",
              "&:hover": { boxShadow: "0 0 30px 10px #48abe0" },
            }}
          >
            <img height={82} src={buttonImage} alt="button" style={{ maxWidth: "100%" }} />
            <div style={{ position: "absolute", fontSize: 30 }}>PLAY</div>
          </Button>

          {/* JOIN ROOM */}
          <Button
            onClick={handleJoinRoom}
            sx={{
              position: "relative",
              fontFamily: "Noto Serif JP,serif",
              textTransform: "none",
              fontWeight: "bold",
              color: "black",
              height: 50,
              width: 220,
              borderRadius: "50px",
              "&:hover": { boxShadow: "0 0 30px 10px #48abe0" },
            }}
          >
            <img height={58} src={buttonImage} alt="button" />
            <div style={{ position: "absolute", fontSize: 18 }}>JOIN ROOM</div>
          </Button>

          {/* Room Code */}
          <input
            style={{
              padding: ".5em",
              fontSize: 15,
              width: "70%",
              textAlign: "center",
              fontFamily: "Noto Serif JP, serif",
              borderRadius: 6,
              border: "1px solid rgba(72, 171, 224, 0.5)",
            }}
            type="text"
            value={roomNumber}
            onChange={handleRoomNumberInput}
            placeholder="Room Code..."
          />

          {/* decks: New Deck + saved decks (horizontal scroll) */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              overflowX: "auto",
              gap: 10,
              padding: "4px 2px",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flexShrink: 0, width: 92 }}>
              <Button
                onClick={handleNavigateToDeck}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 0,
                  width: "100%",
                  p: 0.5,
                  "&:hover": { boxShadow: "0 0 24px 8px #48abe0" },
                }}
              >
                <img height={120} src={cardback} alt="cardback" />
                <div style={{ color: "white", fontSize: 13, fontFamily: "Noto Serif JP,serif" }}>NEW DECK</div>
              </Button>
            </div>
            {reduxDecks.map((deck, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectDeck(deck, idx)}
                onContextMenu={(e) => handleContextMenu(e, deck, idx)}
                style={{
                  flexShrink: 0,
                  width: 92,
                  cursor: "pointer",
                  borderRadius: 8,
                  padding: 4,
                  boxSizing: "border-box",
                  background: showSelected[idx] ? "rgba(72, 171, 224, 0.30)" : "transparent",
                  border: showSelected[idx]
                    ? "1px solid rgba(72, 171, 224, 0.7)"
                    : "1px solid transparent",
                }}
              >
                <img
                  src={artThumb(deck.deck[Math.floor(deck.deck.length / 2)], deck.art)}
                  alt={deck.name}
                  loading="lazy"
                  style={{ width: "100%", borderRadius: 6, display: "block" }}
                />
                <div
                  style={{
                    marginTop: 4,
                    color: "white",
                    fontSize: 12,
                    fontFamily: "Noto Serif JP,serif",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    background: "#131219",
                    borderRadius: 4,
                    padding: "2px 4px",
                  }}
                >
                  {deck.name}
                </div>
              </div>
            ))}
          </div>

          {/* announcements (collapsible) */}
          <div style={{ width: "100%" }}>
            <Button
              fullWidth
              onClick={() => setShowAnnounce((s) => !s)}
              endIcon={<span style={{ fontSize: 13 }}>{showAnnounce ? "▲" : "▼"}</span>}
              sx={{
                fontFamily: "Share Tech Mono, monospace",
                textTransform: "none",
                letterSpacing: "0.08em",
                color: "#daf6ff",
                backgroundColor: "rgba(10, 14, 20, 0.75)",
                border: "1px solid rgba(72, 171, 224, 0.5)",
                borderRadius: "10px",
                justifyContent: "space-between",
                px: 2,
                py: 1,
              }}
            >
              ANNOUNCEMENTS
            </Button>
            {showAnnounce && (
              <div
                style={{
                  marginTop: 8,
                  backgroundColor: "rgba(10, 14, 20, 0.75)",
                  border: "1px solid rgba(72, 171, 224, 0.5)",
                  borderRadius: 10,
                  padding: "0.25em 1em 1em",
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {announcements.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      paddingTop: "0.75em",
                      paddingBottom: "0.75em",
                      borderBottom:
                        idx < announcements.length - 1
                          ? "1px solid rgba(255, 255, 255, 0.1)"
                          : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5em" }}>
                      <span style={{ color: "#ffffff", fontSize: 15, fontFamily: "Noto Serif JP, serif", fontWeight: "bold" }}>
                        {item.title}
                      </span>
                      <span style={{ color: "#7da7bd", fontSize: 12, fontFamily: "Share Tech Mono, monospace", whiteSpace: "nowrap" }}>
                        {item.date}
                      </span>
                    </div>
                    <div style={{ color: "#c9d6dd", fontSize: 13, fontFamily: "Noto Serif JP, serif", marginTop: "0.25em", lineHeight: 1.35 }}>
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY - 150, left: contextMenu.mouseX - 35 }
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
        <MenuItem onClick={handleModalOpen}>Preview</MenuItem>
        <MenuItem onClick={handleEditDeck}>Edit</MenuItem>
        {/* <MenuItem onClick={handleShareDeck}>Share</MenuItem> */}
        <MenuItem onClick={handleOpenDialogue}>Delete</MenuItem>
      </Menu>
      <Modal
        sx={{ backgroundColor: "rgba(31, 31, 31)" }}
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          id="deckPreview"
          sx={{
            position: "relative",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(31, 31, 31)",

            boxShadow: 24,
            // p: 3,
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            outline: "none",
          }}
        >
          <CloseIcon
            sx={{
              position: "absolute",
              right: "1%",
              top: "0%",
              zIndex: 10,
              cursor: "pointer",
              height: "90px",
              width: "90px",
              color: "white",
              opacity: "0%",
              "&:hover": {
                opacity: "50%",
              },
            }}
            onClick={handleModalClose}
            fontSize="small"
          />

          <ArrowBackIosNew
            style={{}}
            sx={{
              position: "absolute",
              right: "93%",
              bottom: "50%",
              zIndex: 10,
              cursor: "pointer",
              height: "170px",
              width: "170px",
              color: "white",
              opacity: "0%",
              "&:hover": {
                opacity: "70%",
              },
            }}
            onClick={handleBackClick}
          />
          <ArrowForwardIosIcon
            style={{}}
            sx={{
              position: "absolute",
              right: "1%",
              bottom: "50%",
              zIndex: 10,
              cursor: "pointer",
              height: "170px",
              width: "170px",
              color: "white",
              opacity: "0%",
              "&:hover": {
                opacity: "70%",
              },
            }}
            onClick={handleForwardClick}
          />

          <CameraAltIcon
            style={{}}
            sx={{
              position: "absolute",
              right: "1%",
              top: "90%",
              zIndex: 10,
              cursor: "pointer",
              height: "90px",
              width: "90px",
              color: "white",
              opacity: "0%",
              "&:hover": {
                opacity: "50%",
              },
            }}
            onClick={deckToImage}
          />

          <CardMUI
            sx={{
              backgroundColor: "rgba(31, 31, 31)",
              // backgroundColor: "transparent",
              minHeight: "250px",
              padding: "2em",

              // height: "400px",
              // maxHeight: "750px",
              overflowY: "auto",

              height: "90%",
              width: "90%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              // justifyContent: "start",
              alignItems: "center",
              paddingLeft: "10%",
              gap: "3px",
            }}
            variant="outlined"
          >
            {sortedEntries(deckMap).map((entry, idx) => {
              const [key, value] = entry;
              return (
                <div
                  key={idx}
                  // onMouseEnter={() => handleStartHover(key)}
                  // onMouseLeave={() => handleEndHover()}
                  style={{
                    position: "relative",
                    display: "flex",
                    // justifyContent: "end",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      key={idx}
                      className="cardSizeInPreview"
                      // style={{ aspectRatio: 110 / 150, height: "30vh" }}
                      // width={"110px"}
                      height={"350px"}
                      src={artImage(key, selectedDeck.art)}
                      alt={key}
                    />
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        height: "60px",
                        width: "60px",
                        color: "white",
                        fontSize: "40px",
                        fontFamily: "Noto Serif JP, serif",
                        borderRadius: "7px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                </div>
              );
            })}
            <div
              style={{
                aspectRatio: 110 / 150,
                maxHeight: "30px",
                width: "100%",
              }}
            ></div>
            {sortedEntries(evoDeckMap).map((entry, idx) => {
              const [key, value] = entry;
              return (
                <div
                  key={idx * 2}
                  // onMouseEnter={() => handleStartHover(key)}
                  // onMouseLeave={() => handleEndHover()}
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <img
                    key={idx * 2}
                    className="cardSizeInPreview"
                    // style={{ aspectRatio: 110 / 150, maxHeight: "120px" }}
                    // width={"110px"}
                    // height={"150px"}
                    src={artImage(key, selectedDeck.art)}
                    alt={key}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      height: "60px",
                      width: "60px",
                      color: "white",
                      fontSize: "40px",
                      fontFamily: "Noto Serif JP, serif",
                      borderRadius: "7px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {value}
                  </div>
                </div>
              );
            })}
          </CardMUI>
        </Box>
      </Modal>
    </div>
  );
}
