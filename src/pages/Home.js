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
import buttonImage from "../../src/assets/buttons/variant1.png";
import shadowverse from "../../src/assets/wallpapers/SVElogo.png";
import shadowverse2 from "../../src/assets/wallpapers/logo.png";
import cardback from "../assets/cardbacks/sleeve_5010011.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDeck, setEvoDeck, setRoom } from "../redux/CardSlice";
import { deleteDeck } from "../redux/DeckSlice";

import { cardImage } from "../decks/getCards";
import { socket } from "../sockets";
// import { Menu, MenuItem, Modal, Box } from "@mui/material";
import {
  Menu,
  MenuItem,
  Modal,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import CardMUI from "@mui/material/Card";
import "../css/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedDeck, setSelectedDeck] = useState({});
  const reduxDecks = useSelector((state) => state.deck.decks);
  const [showSelected, setShowSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState(null);
  const [leaderImage, setLeaderImage] = useState(null);
  const [mainDeckSelected, setMainDeckSelected] = useState(true);
  const [evoDeckSelected, setEvoDeckSelected] = useState(false);

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
        dispatch(setRoom(roomNumber.toString()));
        socket.emit("join_room", roomNumber.toString());
        handleNavigateToGame();
      }
    }
  };
  const handleJoinRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (roomNumber !== "") {
        dispatch(setRoom(roomNumber));
        socket.emit("join_room", roomNumber);
        handleNavigateToGame();
      }
    }
  };

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
  const handleNavigateToGame = () => {
    dispatch(setDeck(selectedDeck.deck.toSorted(() => Math.random() - 0.5)));

    dispatch(
      setEvoDeck(
        selectedDeck.evoDeck.map((card) => {
          return { card: card, status: false };
        })
      )
    );
    navigate("/game");
  };
  const handleSelectDeck = (deck, idx) => {
    setSelectedDeck(deck);
    let res = [];
    for (let i = 0; i < reduxDecks.length; i++) {
      if (i === idx) res.push(true);
      else res.push(false);
    }
    setShowSelected(res);
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
    const num = Math.floor(Math.random() * (5 - 1 + 1) + 1);
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
      default:
        return galmieux;
    }
  };

  return (
    <div
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      style={{
        minHeight: "100vh",
        background: "url(" + wallpaper + ") center center fixed",
        backgroundSize: "cover",
        display: "flex",
        // justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
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

      <div className="LeaderContainerHome">
        <img className="LeaderImageHome" src={leaderImage} alt={"leader"} />
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
            width: "55%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            outline: "none",
          }}
        >
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
            >
              <FormControlLabel
                checked={mainDeckSelected}
                onChange={handleMainDeckSelected}
                sx={{ fontFamily: "Noto Serif JP, serif", color: "white" }}
                value={mainDeckSelected}
                control={<Radio />}
                label="Main Deck"
              />
              <FormControlLabel
                checked={evoDeckSelected}
                onChange={handleEvoDeckSelected}
                sx={{ fontFamily: "Noto Serif JP, serif", color: "white" }}
                value={evoDeckSelected}
                control={<Radio />}
                label="Evolve Deck"
              />
            </RadioGroup>
          </FormControl>
          <CardMUI
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              minHeight: "250px",
              padding: "3%",
              height: "400px",
              overflowY: "scroll",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
            variant="outlined"
          >
            {mainDeckSelected &&
              selectedDeck.deck?.length > 0 &&
              selectedDeck.deck.map((card, idx) => (
                <div key={`card-${idx}`}>
                  <img height={"160px"} src={cardImage(card)} alt={card} />
                </div>
              ))}
            {evoDeckSelected &&
              selectedDeck.evoDeck?.length > 0 &&
              selectedDeck.evoDeck.map((card, idx) => (
                <div key={`card-${idx}`}>
                  <img height={"160px"} src={cardImage(card)} alt={card} />
                </div>
              ))}
          </CardMUI>
        </Box>
      </Modal>
    </div>
  );
}
