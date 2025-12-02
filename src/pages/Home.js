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
import donate from "../assets/buttons/donate_btn.webp";
import discord from "../assets/buttons/discord.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setDeck,
  setEvoDeck,
  setRoom,
  setActiveUsers,
} from "../redux/CardSlice";
import { deleteDeck } from "../redux/DeckSlice";
import { cardImage } from "../decks/getCards";
import { socket } from "../sockets";

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
  const [hoverCard, setHoverCard] = useState("");
  const [hover, setHover] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [deckIdx, setDeckIdx] = useState(0);

  const reduxDecks = useSelector((state) => state.deck.decks);
  const reduxActiveUsers = useSelector((state) => state.card.activeUsers);
  const numLeaders = 7;

  useEffect(() => {
    socket.on("start_game", () => {
      handleNavigateToGame();
    });

    socket.on("active_users", (data) => {
      dispatch(setActiveUsers(data));
    });
  }, [socket]);

  useEffect(() => {
    setLeaderImage(randomLeader());
  }, []);

  useEffect(() => {
    setShowSelected(new Array(reduxDecks.length).fill(false));
  }, [reduxDecks]);

  const handleStartHover = (key) => {
    setHover(true);
    setHoverCard(key);
  };
  const handleEndHover = () => {
    setHover(false);
    setHoverCard("");
  };

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

  const handleCreateRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (socket.id) {
        const roomNumber = parseInt(Math.random() * 10000000);
        setRoomNumber(roomNumber.toString());
        dispatch(setRoom(roomNumber.toString()));
        socket.emit("create_room", roomNumber.toString());
      }
    }
  };
  const handleJoinRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (roomNumber !== "") {
        setRoomNumber(roomNumber.toString());
        dispatch(setRoom(roomNumber.toString()));
        socket.emit("join_room", roomNumber.toString());
      }
    }
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
        : null
    );
    handleSelectDeck(deck, idx);
  };

  const handleRoomNumberInput = (event) => {
    setRoomNumber(event.target.value);
  };

  const handleNavigateToDeck = () => {
    navigate("/deck");
  };

  const handleEditDeck = () => {
    navigate("/deck", {
      state: { deckName: name },
    });
  };

  const handleNavigateToGame = () => {
    navigate("/game");
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

    dispatch(
      setEvoDeck(
        newDeck.evoDeck.map((card) => {
          return { card: card, status: false };
        })
      )
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
        height: "100vh",
        width: "100vw",
        background: "url(" + wallpaper + ") center center fixed",
        backgroundSize: "cover",
        display: "flex",
        // justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
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
                        src={cardImage(deck.deck[0])}
                        alt={"cardback"}
                      />
                    </div>
                    <div style={{ zIndex: 2 }}>
                      <img
                        height={"160px"}
                        src={cardImage(
                          deck.deck[Math.floor(deck.deck.length / 2)]
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
                        src={cardImage(deck.deck[deck.deck.length - 1])}
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
      {roomNumber !== "" && (
        <div
          style={{
            position: "absolute",
            top: "0%",
            left: "40%",
            height: "40px",
            // width: "40px",
            color: "white",
            fontSize: "50px",
            fontFamily: "Noto Serif JP, serif",
            borderRadius: "7px",
          }}
        >
          Joining Room: 1/2 players...
        </div>
      )}
      {reduxActiveUsers !== 0 && (
        <div
          style={{
            position: "absolute",
            top: "5%",
            right: "4%",
            // color: "white",
            fontSize: 30,
            // fontFamily: "Noto Serif JP, serif",
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
        {/* <video
          className="AnimatedLeaderImageHome"
          loop="true"
          autoplay="autoplay"
          muted
        >
          <source src={nemesis_mov} type="video/quicktime" />
          <source src={nemesis_webm} type="video/webm" />
        </video> */}

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
            {/* Hover card image */}
            {/* <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100vw",
              }}
            >
              {hover && (
                <div
                  style={{
                    width: "100vw",

                    display: "flex",
                    justifyContent: "center",
                    position: "absolute",
                    height: "100vh",
                  }}
                >
                  <div
                    style={{
                      width: "100vw",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "410px",
                        position: "relative",
                        left: "6%",
                        top: "46%",
                      }}
                    >
                      <img
                        className="cardHover"
                        src={cardImage(hoverCard)}
                        alt={hoverCard}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div> */}
            {Array.from(deckMap.entries()).map((entry, idx) => {
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
                      src={cardImage(key)}
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
            {Array.from(evoDeckMap.entries()).map((entry, idx) => {
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
                    src={cardImage(key)}
                    alt={key}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      height: "35px",
                      width: "35px",
                      color: "white",
                      fontSize: "25px",
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
