import React, { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import initialWallpaper from "../../src/assets/wallpapers/forteEvo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDeck, setEvoDeck } from "../redux/CardSlice";
import cardback from "../assets/cardbacks/sleeve_5010011.png";

export default function Home() {
  const dispatch = useDispatch();
  const [selectedDeck, setSelectedDeck] = useState({});
  const navigate = useNavigate();
  const reduxDecks = useSelector((state) => state.deck.decks);
  const [showSelected, setShowSelected] = useState([]);

  useEffect(() => {
    setShowSelected(new Array(reduxDecks.length).fill(false));
  }, [reduxDecks]);

  const handleNavigateToDeck = () => {
    navigate("/deck");
  };
  const handleNavigateToGame = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      dispatch(setDeck(selectedDeck.deck));

      dispatch(
        setEvoDeck(
          selectedDeck.evoDeck.map((card) => {
            return { card: card, status: false };
          })
        )
      );
      navigate("/game");
    }
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
              onClick={handleNavigateToGame}
              style={{ backgroundColor: "white", color: "black" }}
              variant="contained"
            >
              Join with Room Code
            </Button>
          </Stack>
        </div>

        <div
          style={{
            // backgroundColor: "yellow",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
            width: "80%",
          }}
        >
          {reduxDecks.length > 0 &&
            reduxDecks.map((deck, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectDeck(deck, idx)}
                style={{
                  //   position: "relative",
                  height: "160px",
                  width: "115px",
                  borderRadius: "10px",
                  border: "50px solid #0000",
                  backgroundColor: showSelected[idx]
                    ? "rgba(170, 170, 170, 0.50)"
                    : "transparent",
                }}
              >
                <img height={"160px"} src={cardback} alt={"cardback"} />
                <div
                  style={{
                    // position: "absolute",
                    // top: 60,
                    height: "35px",
                    width: "120px",
                    backgroundColor: "black",
                    color: "white",
                    fontSize: "17px",
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
    </div>
  );
}
