import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import initialWallpaper from "../../src/assets/wallpapers/forteEvo.png";
import { allCards } from "../decks/AllCards";
import { allCardsEvo } from "../decks/AllCardsEvo";
import { cardImage } from "../decks/getCards";
import img from "../assets/pin_bellringer_angel.png";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { createDeck } from "../redux/DeckSlice";
import { useNavigate } from "react-router-dom";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function CreateDeck() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deck, setDeck] = useState([]);
  const [evoDeck, setEvoDeck] = useState([]);
  const [deckMap] = useState(new Map());
  const [evoDeckMap] = useState(new Map());
  const [mainDeckSelected, setMainDeckSelected] = useState(true);
  const [evoDeckSelected, setEvoDeckSelected] = useState(false);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [filteredAllCards, setFilteredAllCards] = useState(allCards);
  const [filteredAllCardsEvo, setFilteredAllCardsEvo] = useState(allCardsEvo);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    dispatch(
      createDeck({
        name: name,
        deck: deck,
        evoDeck: evoDeck,
      })
    );
    navigate("/");
  };

  const handleTextInput = (event) => {
    const text = event.target.value;
    setTextInput(text);
    if (mainDeckSelected) {
      const filteredCards = allCards.filter((card) =>
        card.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAllCards(filteredCards);
    } else {
      const filteredCards = allCardsEvo.filter((card) =>
        card.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAllCardsEvo(filteredCards);
    }
  };

  const handleCardSelection = (card) => {
    if (deck.length < 50) {
      if (deckMap.has(card)) {
        if (deckMap.get(card) === 2 && card === "Shenlong") return;
        if (deckMap.get(card) === 3) {
          return;
        } else {
          deckMap.set(card, deckMap.get(card) + 1);
        }
      } else {
        deckMap.set(card, 1);
      }
      if (deckMap.get(card) === 4) {
        return;
      } else if (deckMap.get(card) === 1 && card === "Shenlong") {
        return;
      } else {
        setDeck((deck) => [...deck, card]);
      }
    }
  };
  const handleCardRemove = (card) => {
    if (deck.length > 0) {
      if (deckMap.has(card)) {
        if (deckMap.get(card) === 1) {
          deckMap.delete(card);
        } else {
          deckMap.set(card, deckMap.get(card) - 1);
        }
        let cardIndex = deck.indexOf(card);
        let newDeck = deck.filter((_, idx) => idx !== cardIndex);
        setDeck(newDeck);
      }
    }
  };
  const handleEvoCardRemove = (card) => {
    if (evoDeck.length > 0) {
      if (evoDeckMap.has(card)) {
        if (evoDeckMap.get(card) === 1) {
          evoDeckMap.delete(card);
        } else {
          evoDeckMap.set(card, evoDeckMap.get(card) - 1);
        }
        let cardIndex = evoDeck.indexOf(card);
        let newDeck = evoDeck.filter((_, idx) => idx !== cardIndex);
        setEvoDeck(newDeck);
      }
    }
  };
  const handleEvoCardSelection = (card) => {
    if (evoDeck.length < 10) {
      if (evoDeckMap.has(card)) {
        if (evoDeckMap.get(card) === 3 && card !== "Carrot") {
          return;
        } else {
          evoDeckMap.set(card, evoDeckMap.get(card) + 1);
        }
      } else {
        evoDeckMap.set(card, 1);
      }
      if (evoDeckMap.get(card) === 4 && card !== "Carrot") {
        return;
      } else {
        setEvoDeck((deck) => [...deck, card]);
      }
    }
  };

  const handleMainDeckSelected = () => {
    setMainDeckSelected(true);
    setEvoDeckSelected(false);
  };
  const handleEvoDeckSelected = () => {
    setMainDeckSelected(false);
    setEvoDeckSelected(true);
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{
        height: "100vh",
        width: "100vw",
        background: "url(" + initialWallpaper + ") center center fixed",
        backgroundSize: "cover",
        display: "flex",
        flexDirection: "column",
        // flexWrap: "wrap",
        // justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
      }}
    >
      <div
        style={{
          marginTop: "1%",
          paddingBottom: "1%",
          minHeight: "550px",
          width: "80%",
          backgroundColor: "rgba(50, 50, 50, 0.60)",
          borderRadius: "10px",
          border: "4px solid #0000",
          display: "flex",
          flexDirection: "column",
          gap: "1em",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {mainDeckSelected && (
          <div
            style={{
              height: "10%",
              width: "40%",
              // backgroundColor: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              padding: "2em",
            }}
          >
            <div>
              <div
                style={{
                  color: "white",
                  fontSize: "32px",
                  fontFamily: "Noto Serif JP,serif",
                }}
              >
                Main Deck
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: "17px",
                  fontFamily: "Noto Serif JP,serif",
                  textAlign: "center",
                }}
              >
                {deck.length}/50 Cards
              </div>
            </div>
          </div>
        )}
        {evoDeckSelected && (
          <div
            style={{
              height: "10%",
              width: "40%",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              padding: "2em",
            }}
          >
            <div>
              <div
                style={{
                  color: "white",
                  fontSize: "32px",
                  fontFamily: "Noto Serif JP,serif",
                }}
              >
                Evolve Deck
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: "17px",
                  fontFamily: "Noto Serif JP,serif",
                  textAlign: "center",
                }}
              >
                {evoDeck.length}/10 Cards
              </div>
            </div>
          </div>
        )}
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

        {/* MAIN DECK */}
        {mainDeckSelected && (
          <div
            style={{
              height: "100%",
              width: "60%",
              padding: "1em",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
            }}
          >
            {deck.length > 0 &&
              deck.map((name, idx) => (
                <img
                  key={idx}
                  width={"110px"}
                  height={"150px"}
                  src={cardImage(name)}
                  alt={name}
                />
              ))}
          </div>
        )}

        {/* EVOLVE DECK */}
        {evoDeckSelected && (
          <div
            style={{
              height: "70%",
              width: "60%",
              padding: "1em",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
            }}
          >
            {evoDeck.length > 0 &&
              evoDeck.map((name, idx) => (
                <img
                  key={idx}
                  width={"110px"}
                  height={"150px"}
                  src={cardImage(name)}
                  alt={name}
                />
              ))}
          </div>
        )}
        {deck.length > 39 && evoDeck && (
          <Button
            style={{
              backgroundColor: "white",
              color: "black",
            }}
            variant="contained"
            onClick={handleClickOpen}
          >
            Create Deck
          </Button>
        )}
      </div>

      <input
        style={{
          marginTop: "1%",
          width: "30%",
          fontSize: "20px",
          fontFamily: "Noto Serif JP, serif",
        }}
        type="text"
        value={textInput}
        onChange={handleTextInput}
        placeholder="Search for cards..."
      />
      <InfiniteScroll
        dataLength={allCards.length} //This is important field to render the next data
        //   next={fetchData}
        style={{
          //   backgroundColor: "yellow",
          width: "80vw",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5em",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "5%",
          paddingBottom: "10%",
        }}
      >
        {mainDeckSelected &&
          filteredAllCards.map((name, idx) => (
            <motion.div
              key={idx}
              onTap={() => handleCardSelection(name)}
              onContextMenu={() => handleCardRemove(name)}
              whileHover={{
                translateY: -25,
                scale: 1.3,
                cursor: `url(${img}) 55 55, auto`,
                boxShadow:
                  "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 1.0)",
              }}
            >
              <img
                width={"224px"}
                height={"312px"}
                src={cardImage(name)}
                alt={name}
              />
            </motion.div>
          ))}
        {evoDeckSelected &&
          filteredAllCardsEvo.map((name, idx) => (
            <motion.div
              key={idx}
              onTap={() => handleEvoCardSelection(name)}
              onContextMenu={() => handleEvoCardRemove(name)}
              whileHover={{
                translateY: -25,
                scale: 1.3,
                cursor: `url(${img}) 55 55, auto`,
                boxShadow:
                  "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 1.0)",
              }}
            >
              <img
                // key={idx}
                width={"224px"}
                height={"312px"}
                src={cardImage(name)}
                alt={name}
              />
            </motion.div>
          ))}
      </InfiniteScroll>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          //   onSubmit: (event) => {
          //     event.preventDefault();
          //     console.log(event.currentTarget);
          //     handleClose();
          //   },
        }}
      >
        <DialogTitle>Create Deck</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a name for this deck. This deck will be available to select
            in the home page.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="deck"
            label="Deck name"
            fullWidth
            variant="standard"
            onChange={handleNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} type="submit">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
