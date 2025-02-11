import React, { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import wallpaper1 from "../../src/assets/wallpapers/1.png";
import wallpaper2 from "../../src/assets/wallpapers/2.png";
import wallpaper3 from "../../src/assets/wallpapers/3.png";
import wallpaper4 from "../../src/assets/wallpapers/4.png";
import galmieux from "../../src/assets/wallpapers/Galmieux.png";
import jeanne from "../../src/assets/wallpapers/Jeanne.png";
import kuon from "../../src/assets/wallpapers/Kuon.png";
import korwa from "../../src/assets/wallpapers/Korwa.png";
import tsubaki from "../../src/assets/wallpapers/Tsubaki.png";
import grimnir from "../../src/assets/wallpapers/Grimnir.png";
import buttonImage from "../../src/assets/buttons/variant1.png";
import shadowverse from "../../src/assets/wallpapers/SVElogo.png";
import cardback from "../assets/cardbacks/default.png";
import donate from "../assets/buttons/donate_btn.webp";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDeck, setEvoDeck, setRoom } from "../redux/CardSlice";
import { deleteDeck } from "../redux/DeckSlice";
import { cardImage } from "../decks/getCards";
import { socket } from "../sockets";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import { Menu, MenuItem, Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import "../css/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedDeck, setSelectedDeck] = useState({});
  const [deckMap] = useState(new Map());
  const [evoDeckMap] = useState(new Map());
  const reduxDecks = useSelector((state) => state.deck.decks);
  const [showSelected, setShowSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState(null);
  const [leaderImage, setLeaderImage] = useState(null);
  const [leaderNum, setLeaderNum] = useState(0);
  const [mainDeckSelected, setMainDeckSelected] = useState(true);
  const [evoDeckSelected, setEvoDeckSelected] = useState(false);
  const [hoverCard, setHoverCard] = useState("");
  const [hover, setHover] = useState(false);

  const [activeUsers, setActiveUsers] = useState(0);

  const [openSnack, setOpenSnack] = useState(false);

  useEffect(() => {
    socket.on("start_game", () => {
      handleNavigateToGame();
    });

    socket.on("active_users", (data) => {
      setActiveUsers(data);
    });
  }, [socket]);

  useEffect(() => {
    setWallpaper(randomWallpaper());
    setLeaderImage(randomLeader());
  }, []);

  useEffect(() => {
    setShowSelected(new Array(reduxDecks.length).fill(false));
  }, [reduxDecks]);

  const handleMainDeckSelected = () => {
    setMainDeckSelected(true);
    setEvoDeckSelected(false);
  };

  const handleStartHover = (key) => {
    setHover(true);
    setHoverCard(key);
  };
  const handleEndHover = () => {
    setHover(false);
    setHoverCard("");
  };

  const handleEvoDeckSelected = () => {
    setMainDeckSelected(false);
    setEvoDeckSelected(true);
  };

  const handleModalOpen = () => {
    handleClose();
    if (selectedDeck.deck.length > 0) setOpen(true);
  };
  const handleModalClose = () => setOpen(false);

  const handleCreateRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (socket.id) {
        const roomNumber = parseInt(Math.random() * 10000000);
        setRoomNumber(roomNumber.toString());
        dispatch(setRoom(roomNumber.toString()));
        socket.emit("create_room", roomNumber.toString());
        // console.log(roomNumber);
        // handleNavigateToGame();
      }
    }
  };
  const handleJoinRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (roomNumber !== "") {
        setRoomNumber(roomNumber.toString());
        dispatch(setRoom(roomNumber.toString()));
        socket.emit("join_room", roomNumber.toString());
        // handleNavigateToGame();
      }
    }
  };

  // const handleShareDeck = () => {
  //   handleClose();
  //   handleOpenSnack();
  //   if (selectedDeck.deck.length > 0)
  //     navigator.clipboard.writeText(selectedDeck.url);
  // };

  const handleDeleteDeck = () => {
    handleClose();
    dispatch(deleteDeck(name));
  };

  const handleClose = () => {
    setContextMenu(null);
  };
  const handleContextMenu = (event, deck, idx) => {
    setName(deck.name);
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
      if (deckMap.get(card) === 3) {
        return;
      } else {
        deckMap.set(card, deckMap.get(card) + 1);
      }
    } else {
      deckMap.set(card, 1);
    }
    setDeck((deck) => [...deck, card]);
  };
  const handleEvoCardSelection = (card) => {
    if (evoDeckMap.has(card)) {
      if (evoDeckMap.get(card) === 3 && card !== "Carrot") {
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

  const randomWallpaper = () => {
    const num = Math.floor(Math.random() * (4 - 1 + 1) + 1);
    switch (num) {
      case 1:
        return wallpaper1;
      case 2:
        return wallpaper2;
      case 3:
        return wallpaper3;
      case 4:
        return wallpaper4;
      default:
        return wallpaper3;
    }
  };

  const randomLeader = () => {
    const num = Math.floor(Math.random() * 6 + 1);
    setLeaderNum(num);
    switch (num) {
      case 1:
        return galmieux;
      case 2:
        return kuon;
      case 3:
        return korwa;
      case 4:
        return jeanne;
      case 5:
        return tsubaki;
      case 6:
        return grimnir;
      default:
        return galmieux;
    }
  };

  const handleOpenSnack = () => {
    setOpenSnack(true);
  };

  const handleCloseSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

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
        background: "url(" + wallpaper3 + ") center center fixed",
        backgroundSize: "cover",
        display: "flex",
        // justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
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
      <div align="center">
        <script
          type="text/javascript"
          src="https://www.freevisitorcounters.com/auth.php?id=03cba67bcd9273ea58c8bd1ac26e8b31e2a75922"
        ></script>
        <script
          type="text/javascript"
          src="https://www.freevisitorcounters.com/en/home/counter/1299974/t/0"
        ></script>
      </div>
      {activeUsers !== 0 && (
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
          {activeUsers} users online
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "1%",
          height: "10px",
          // width: "40px",
          color: "white",

          fontFamily: "Noto Serif JP, serif",
          borderRadius: "7px",
        }}
      >
        <a
          href="https://ko-fi.com/anthonychian"
          target="_blank"
          rel="noreferrer noopener"
        >
          <img height={"40px"} src={donate} alt={"donate"} />
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
        <MenuItem onClick={handleDeleteDeck}>Delete</MenuItem>
      </Menu>
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
            backgroundColor: "transparent",
            boxShadow: 24,
            p: 3,
            width: "40%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            outline: "none",
          }}
        >
          <CardMUI
            sx={{
              backgroundColor: "rgba(0, 0, 0, 1)",
              minHeight: "250px",
              padding: "2em",
              // height: "400px",
              maxHeight: "750px",
              overflowY: "auto",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "3px",
            }}
            variant="outlined"
          >
            {/* Hover card image */}
            <div
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
            </div>
            {Array.from(deckMap.entries()).map((entry, idx) => {
              const [key, value] = entry;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => handleStartHover(key)}
                  onMouseLeave={() => handleEndHover()}
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
                      // style={{ aspectRatio: 110 / 150, maxHeight: "120px" }}
                      // width={"110px"}
                      // height={"150px"}
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
                  onMouseEnter={() => handleStartHover(key)}
                  onMouseLeave={() => handleEndHover()}
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
