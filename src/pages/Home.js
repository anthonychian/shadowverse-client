import React, { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import initialWallpaper from "../../src/assets/wallpapers/forteEvo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDeck, setEvoDeck, setRoom } from "../redux/CardSlice";
import { deleteDeck } from "../redux/DeckSlice";

import { cardImage } from "../decks/getCards";
import { socket } from "../sockets";
import { Menu, MenuItem, Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";

const style = {
  position: "relative",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "transparent",
  boxShadow: 24,
  p: 3,
  width: "55%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedDeck, setSelectedDeck] = useState({});
  const reduxDecks = useSelector((state) => state.deck.decks);
  const [showSelected, setShowSelected] = useState([]);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const handleModalOpen = () => {
    handleClose();
    if (selectedDeck.deck.length > 0) setOpen(true);
  };
  const handleModalClose = () => setOpen(false);

  const handleCreateRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (socket.id) {
        dispatch(setRoom(socket.id));
        socket.emit("join_room", socket.id);
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

  useEffect(() => {
    setShowSelected(new Array(reduxDecks.length).fill(false));
  }, [reduxDecks]);

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

  return (
    <div
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      style={{
        minHeight: "100vh",
        background: "url(" + initialWallpaper + ") center center fixed",
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          height: "70vh",
          width: "40%",
          backgroundColor: "rgba(0, 0, 0, 0.60)",
          borderRadius: "10px",
          border: "4px solid #0000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "30%",
            width: "40%",
          }}
        >
          <Stack spacing={2} direction="column">
            <Button
              onClick={handleNavigateToDeck}
              style={{ backgroundColor: "white", color: "black" }}
              variant="contained"
            >
              Create Deck
            </Button>
            <Button
              onClick={handleCreateRoom}
              style={{ backgroundColor: "white", color: "black" }}
              variant="contained"
            >
              Create Room
            </Button>
            <Button
              onClick={handleJoinRoom}
              style={{ backgroundColor: "white", color: "black" }}
              variant="contained"
            >
              Join Room
            </Button>
            <input
              type="text"
              value={roomNumber}
              onChange={handleRoomNumberInput}
              placeholder="Room Code..."
            />
          </Stack>
        </div>

        <div
          style={{
            // backgroundColor: "yellow",
            display: "flex",
            flexDirection: "row",
            overflowX: "auto",
            alignItems: "center",
            height: "50%",
            width: "80%",
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
                  height: "160px",
                  width: "115px",
                  borderRadius: "10px",
                  border: "50px solid #0000",
                  backgroundColor: showSelected[idx]
                    ? "rgba(170, 170, 170, 0.50)"
                    : "transparent",
                }}
              >
                {/* <img height={"160px"} src={cardback} alt={"cardback"} /> */}
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
                    backgroundColor: "white",
                    color: "black",
                    fontSize: "17px",
                    borderRadius: "10px",
                    border: "4px solid #0000",
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
        <MenuItem onClick={handleModalOpen}>View</MenuItem>
        <MenuItem onClick={handleDeleteDeck}>Delete</MenuItem>
      </Menu>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <CardMUI
            sx={{
              //   backgroundColor: "rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              //   backgroundColor: "black",
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
            {selectedDeck.deck?.length > 0 &&
              selectedDeck.deck.map((card, idx) => (
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
