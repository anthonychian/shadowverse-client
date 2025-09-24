import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import wallpaper3 from "../../src/assets/wallpapers/3.png";
import ReplyIcon from "@mui/icons-material/Reply";
import CloseIcon from "@mui/icons-material/Close";
import {
  LazyLoadImage,
  LazyLoadComponent,
} from "react-lazy-load-image-component";
import swap from "../assets/logo/swap_icon.png";

import {
  allCards,
  setVG,
  set11,
  set10,
  set9,
  set8,
  setIDOL,
  set7,
  set6,
  set5,
  set4,
  set3,
  setUMA,
  set2,
  set1,
  forest,
  sword,
  rune,
  dragon,
  abyss,
  haven,
  neutral,
} from "../decks/AllCards";
import {
  allCardsEvo,
  set11Evo,
  setVGEvo,
  set10Evo,
  set9Evo,
  set8Evo,
  setIDOLEvo,
  set7Evo,
  set6Evo,
  set5Evo,
  set4Evo,
  set3Evo,
  setUMAEvo,
  set2Evo,
  set1Evo,
  forestEvo,
  swordEvo,
  runeEvo,
  dragonEvo,
  abyssEvo,
  havenEvo,
  neutralEvo,
} from "../decks/AllCardsEvo";
import { cardImage } from "../decks/getCards";
import CardMUI from "@mui/material/Card";
import img from "../assets/pin_bellringer_angel.png";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { createDeck, deleteDeck } from "../redux/DeckSlice";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Modal,
  Box,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  SnackbarContent,
  IconButton,
} from "@mui/material";

export default function CreateDeck() {
  const location = useLocation();
  const reduxDecks = useSelector((state) => state.deck.decks);
  const deckName = location?.state?.deckName;
  const deckEdit = reduxDecks.filter((decks) => decks.name === deckName);

  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deck, setDeck] = useState([]);
  const [evoDeck, setEvoDeck] = useState([]);
  const [deckMap, setDeckMap] = useState(new Map());
  const [evoDeckMap, setEvoDeckMap] = useState(new Map());
  const [mainDeckSelected, setMainDeckSelected] = useState(true);
  const [evoDeckSelected, setEvoDeckSelected] = useState(false);
  const [name, setName] = useState("");
  const [cardName, setCardName] = useState("");
  const [importTextFieldVal, setImportTextFieldVal] = useState();
  const [open, setOpen] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [filteredAllCards, setFilteredAllCards] = useState(allCards);
  const [filteredAllCardsEvo, setFilteredAllCardsEvo] = useState(allCardsEvo);
  const [buttonFilterSet, setButtonFilterSet] = useState("all");
  const [buttonFilterClass, setButtonFilterClass] = useState("all");
  const [buttonFilterSetEvo, setButtonFilterSetEvo] = useState("all evo");
  const [buttonFilterClassEvo, setButtonFilterClassEvo] = useState("all evo");
  const [openSnack, setOpenSnack] = useState(false);

  const [imageStyle, setImageStyle] = useState({ opacity: 0 });

  // const [cardSet, setCardSet] = useState("all");

  const handleChange = (event) => {
    setButtonFilterSet(event.target.value);
    setButtonFilterSetEvo(event.target.value + " evo");
  };
  const handleChangeClass = (event) => {
    setButtonFilterClass(event.target.value);
    setButtonFilterClassEvo(event.target.value + " evo");
  };

  const handleImageLoad = () => {
    setImageStyle({}); // Reset opacity to make the image visible
  };

  useEffect(() => {
    const filtered = handleSelectButtonFilter();
    const filteredEvo = handleSelectButtonFilterEvo();
    setFilteredAllCards(filtered);
    setFilteredAllCardsEvo(filteredEvo);
    handleTextInput(textInput);
  }, [buttonFilterSet, buttonFilterClass, mainDeckSelected]);

  useEffect(() => {
    if (deckEdit.length > 0) {
      if (deckEdit[0].deck.length > 0) {
        handleFillDeckMap(deckEdit[0].deck);
      }
      if (deckEdit[0].evoDeck.length > 0) {
        handleFillEvoDeckMap(deckEdit[0].evoDeck);
      }
    }
    if (id) {
      try {
        let decodedObject = JSON.parse(atob(id));

        if (decodedObject[0].deck.length > 0) {
          handleFillDeckMap(decodedObject[0].deck);
        }
        if (decodedObject[0].evoDeck.length > 0) {
          handleFillEvoDeckMap(decodedObject[0].evoDeck);
        }
      } catch {
        navigate("/deck");
      }
    }
  }, []);

  const isDoubleEvo = (cardName) => {
    return (
      cardName === "Orchis, Resolute Puppet" ||
      cardName === "Orchis, Vengeful Puppet" ||
      cardName === "Paula, Gentle Warmth" ||
      cardName === "Paula, Passionate Warmth" ||
      cardName === "Celia, Hope's Strategist" ||
      cardName === "Celia, Despair's Messenger" ||
      cardName === "Mysterian Whitewyrm" ||
      cardName === "Mysterian Blackwyrm" ||
      cardName === "Virtuous Lindworm" ||
      cardName === "Iniquitous Lindworm" ||
      cardName === "Vania, Kind Queen" ||
      cardName === "Vania, Blood Queen" ||
      cardName === "Ceryneian Lighthind" ||
      cardName === "Ceryneian Darkhind"
    );
  };

  const handleDoubleEvoClick = () => {
    if (cardName === "Orchis, Resolute Puppet") {
      setCardName("Orchis, Vengeful Puppet");
    } else if (cardName === "Orchis, Vengeful Puppet") {
      setCardName("Orchis, Resolute Puppet");
    }
    if (cardName === "Paula, Gentle Warmth") {
      setCardName("Paula, Passionate Warmth");
    } else if (cardName === "Paula, Passionate Warmth") {
      setCardName("Paula, Gentle Warmth");
    }
    if (cardName === "Celia, Hope's Strategist") {
      setCardName("Celia, Despair's Messenger");
    } else if (cardName === "Celia, Despair's Messenger") {
      setCardName("Celia, Hope's Strategist");
    }
    if (cardName === "Mysterian Whitewyrm") {
      setCardName("Mysterian Blackwyrm");
    } else if (cardName === "Mysterian Blackwyrm") {
      setCardName("Mysterian Whitewyrm");
    }
    if (cardName === "Virtuous Lindworm") {
      setCardName("Iniquitous Lindworm");
    } else if (cardName === "Iniquitous Lindworm") {
      setCardName("Virtuous Lindworm");
    }
    if (cardName === "Vania, Kind Queen") {
      setCardName("Vania, Blood Queen");
    } else if (cardName === "Vania, Blood Queen") {
      setCardName("Vania, Kind Queen");
    }
    if (cardName === "Ceryneian Lighthind") {
      setCardName("Ceryneian Darkhind");
    } else if (cardName === "Ceryneian Darkhind") {
      setCardName("Ceryneian Lighthind");
    }
  };

  const handleFillDeckMap = (deck) => {
    for (let i = 0; i < deck.length; i++) {
      handleCardSelection(deck[i]);
    }
  };
  const handleFillEvoDeckMap = (deck) => {
    for (let i = 0; i < deck.length; i++) {
      handleEvoCardSelection(deck[i]);
    }
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleDeckImport = () => {
    // setImportTextFieldVal(event.target.value);
    // const val = event.target.value.split("\n");
    // setImportTextFieldVal(event.target.value);

    const val = importTextFieldVal.split("\n\n");
    if (val.length === 2) {
      const val1 = val[0].split("\n");
      const val2 = val[1].split("\n");
      let arr1 = [];
      for (const card of val1) {
        let num = parseInt(card[0]);
        for (let i = 0; i < num; i++) {
          arr1.push(card.slice(2));
        }
      }
      handleFillDeckMap(arr1);
      let arr2 = [];
      for (const card of val2) {
        let num = parseInt(card[0]);
        for (let i = 0; i < num; i++) {
          arr2.push(card.slice(2));
        }
      }
      handleFillEvoDeckMap(arr2);
    } else if (val.length === 1) {
      const val1 = val[0].split("\n");
      let arr1 = [];
      for (const card of val1) {
        let num = parseInt(card[0]);
        for (let i = 0; i < num; i++) {
          arr1.push(card.slice(2));
        }
      }
      handleFillDeckMap(arr1);
    }

    // let arr = [];
    // for (const card of val) {
    //   let num = parseInt(card[0]);
    //   for (let i = 0; i < num; i++) {
    //     arr.push(card.slice(2));
    //   }
    // }

    // if (mainDeckSelected) {
    //   handleFillDeckMap(arr);
    // } else {
    //   handleFillEvoDeckMap(arr);
    // }
  };
  const handleClearImport = () => {
    setDeck([]);
    setDeckMap(new Map());
    setEvoDeck([]);
    setEvoDeckMap(new Map());
    handleDecklistInput("");
  };

  const handleDeckImportFormat = () => {
    // let formattedDeck;

    // if (mainDeckSelected) {
    //   let str = "";
    //   deckMap.forEach((value, key) => {
    //     str += `${value} ${key}\n`;
    //   });
    //   formattedDeck = str;
    // } else {
    //   let str = "";
    //   evoDeckMap.forEach((value, key) => {
    //     str += `${value} ${key}\n`;
    //   });
    //   formattedDeck = str;
    // }
    // formattedDeck = formattedDeck.slice(0, -1);
    // return formattedDeck;
    let formattedDeck1;
    let formattedDeck2;

    let str1 = "";
    deckMap.forEach((value, key) => {
      str1 += `${value} ${key}\n`;
    });
    formattedDeck1 = str1;
    formattedDeck1 = formattedDeck1.slice(0, -1);

    let str2 = "";
    evoDeckMap.forEach((value, key) => {
      str2 += `${value} ${key}\n`;
    });
    formattedDeck2 = str2;
    formattedDeck2 = formattedDeck2.slice(0, -1);
    if (evoDeckMap.size > 0) return formattedDeck1 + "\n\n" + formattedDeck2;
    else return formattedDeck1;
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClickOpenImport = () => {
    setOpenImport(true);
  };
  const handleClickOpenExport = () => {
    setOpenImport(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleCloseImport = () => {
    setOpenImport(false);
  };

  const handleSubmit = () => {
    const encodedObject = JSON.stringify(deckEdit);
    const encoded = btoa(encodedObject);
    dispatch(deleteDeck(deckName));

    dispatch(
      createDeck({
        name,
        deck,
        evoDeck,
        // url,
      })
    );

    navigate("/");
  };

  const handleModalOpen = (name) => {
    setCardName(name);
    setOpenModal(true);
  };
  const handleModalClose = () => setOpenModal(false);

  const handleTextInput = (text) => {
    setTextInput(text);
    if (mainDeckSelected) {
      const filtered = handleSelectButtonFilter();
      const filteredCards = filtered.filter((card) =>
        card.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAllCards(filteredCards);
    } else {
      const filteredEvo = handleSelectButtonFilterEvo();
      const filteredCards = filteredEvo.filter((card) =>
        card.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAllCardsEvo(filteredCards);
    }
  };

  const handleDecklistInput = (text) => {
    setImportTextFieldVal(text);
  };

  const getCardsFromName = (name) => {
    switch (name) {
      case "set 11":
        return set11;
      case "vg":
        return setVG;
      case "set 10":
        return set10;
      case "set 9":
        return set9;
      case "set 8":
        return set8;
      case "set 7":
        return set7;
      case "idol":
        return setIDOL;
      case "set 6":
        return set6;
      case "set 5":
        return set5;
      case "set 4":
        return set4;
      case "set 3":
        return set3;
      case "uma":
        return setUMA;
      case "set 2":
        return set2;
      case "set 1":
        return set1;
      case "set 11 evo":
        return set11Evo;
      case "vg evo":
        return setVGEvo;
      case "set 10 evo":
        return set10Evo;
      case "set 9 evo":
        return set9Evo;
      case "set 8 evo":
        return set8Evo;
      case "set 7 evo":
        return set7Evo;
      case "idol evo":
        return setIDOLEvo;
      case "set 6 evo":
        return set6Evo;
      case "set 5 evo":
        return set5Evo;
      case "set 4 evo":
        return set4Evo;
      case "set 3 evo":
        return set3Evo;
      case "uma evo":
        return setUMAEvo;
      case "set 2 evo":
        return set2Evo;
      case "set 1 evo":
        return set1Evo;
      case "forest":
        return forest;
      case "forest evo":
        return forestEvo;
      case "sword":
        return sword;
      case "sword evo":
        return swordEvo;
      case "rune":
        return rune;
      case "rune evo":
        return runeEvo;
      case "dragon":
        return dragon;
      case "dragon evo":
        return dragonEvo;
      case "abyss":
        return abyss;
      case "abyss evo":
        return abyssEvo;
      case "haven":
        return haven;
      case "haven evo":
        return havenEvo;
      case "neutral":
        return neutral;
      case "neutral evo":
        return neutralEvo;
      case "all":
        return allCards;
      case "all evo":
        return allCardsEvo;
      default:
        return allCards;
    }
  };

  const handleSelectButtonFilter = () => {
    const setCards = getCardsFromName(buttonFilterSet);
    const classCards = getCardsFromName(buttonFilterClass);
    const merged = setCards.filter(
      (setCard) => classCards.indexOf(setCard) > -1
    );
    return merged;
  };
  const handleSelectButtonFilterEvo = () => {
    const setCards = getCardsFromName(buttonFilterSetEvo);
    const classCards = getCardsFromName(buttonFilterClassEvo);
    const merged = setCards.filter(
      (setCard) => classCards.indexOf(setCard) > -1
    );
    return merged;
  };

  const handleCardSelection = (card) => {
    if (deck.length < 50) {
      if (deckMap.has(card)) {
        if (deckMap.get(card) === 6 && card === "Rapid Fire") return;
        if (deckMap.get(card) === 1 && card === "Shenlong") return;
        if (deckMap.get(card) === 1 && card === "Curse Crafter") return;
        if (deckMap.get(card) === 3 && card !== "Onion Patch" && card !== "Rapid Fire") {
          return;
        } else {
          deckMap.set(card, deckMap.get(card) + 1);
        }
      } else {
        deckMap.set(card, 1);
      }
      setDeck((deck) => [...deck, card]);
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

  const handleOpenSnack = () => {
    let deck = handleDeckImportFormat();
    setOpenSnack(true);
    navigator.clipboard.writeText(deck);
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
      onContextMenu={(e) => e.preventDefault()}
      style={{
        height: "100vh",
        width: "100vw",
        background: "url(" + wallpaper3 + ") center center fixed",
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
          paddingBottom: "1%",
          width: "80vw",
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
                  fontFamily: "Noto Serif JP, serif",
                }}
              >
                Main Deck
              </div>
              <div
                style={{
                  color: deck.length < 40 ? "white" : "gold",
                  fontSize: "17px",
                  fontFamily: "Noto Serif JP, serif",
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
                  color: deck.length < 10 ? "white" : "gold",
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
            key="radio-group"
          >
            <FormControlLabel
              key="deck-1"
              checked={mainDeckSelected}
              onChange={handleMainDeckSelected}
              sx={{ fontFamily: "Noto Serif JP, serif", color: "white" }}
              value={mainDeckSelected}
              control={<Radio />}
              label="Main Deck"
            />
            <FormControlLabel
              key="deck-2"
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
              minHeight: "200px",
              width: "60%",
              padding: "1em",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              flexWrap: "wrap",
              gap: "3px",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
            }}
          >
            {deck.length > 0 &&
              Array.from(deckMap.entries()).map((entry, idx) => {
                const [key, value] = entry;
                return (
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "end",
                    }}
                    onClick={() => handleCardRemove(key)}
                  >
                    <img
                      key={idx}
                      width={"110px"}
                      height={"150px"}
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
          </div>
        )}

        {/* EVOLVE DECK */}
        {evoDeckSelected && (
          <div
            style={{
              height: "100%",
              minHeight: "200px",
              width: "60%",
              padding: "1em",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              flexWrap: "wrap",
              gap: "3px",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
            }}
          >
            {evoDeck.length > 0 &&
              Array.from(evoDeckMap.entries()).map((entry, idx) => {
                const [key, value] = entry;
                return (
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "end",
                    }}
                    onClick={() => handleEvoCardRemove(key)}
                  >
                    <img
                      key={idx}
                      width={"110px"}
                      height={"150px"}
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
          </div>
        )}
        {deck.length > 39 && evoDeck && (
          // <div style={{ paddingTop: "1em" }}>
          <Button
            style={{
              backgroundColor: "white",
              // marginTop: "0em",
              color: "black",
              textTransform: "none",
              fontFamily: "Noto Serif JP, serif",
              fontWeight: "bold",

              // border: "3px solid gold",
              // backgroundColor: "#131219",
              // color: "gold",
            }}
            variant="contained"
            onClick={handleClickOpen}
          >
            Create Deck
          </Button>
          // </div>
        )}
      </div>

      <input
        style={{
          padding: ".3em",
          marginTop: "1%",
          width: "30%",
          fontSize: "20px",
          fontFamily: "Noto Serif JP, serif",
        }}
        type="text"
        value={textInput}
        onChange={(event) => handleTextInput(event.target.value)}
        placeholder="Search for cards..."
      />

      <div
        style={{
          backgroundColor: "rgba(50, 50, 50, 0.60)",
          marginTop: "1em",
          padding: "1em",
        }}
      >
        <div
          style={{
            // backgroundColor: "rgba(50, 50, 50, 0.60)",
            // marginTop: "1em",
            padding: "1em",
            // height: "200px",
            width: "80vw",
            display: "flex",
            alignItems: "center",
            gap: "1em",
            justifyContent: "space-evenly",
            flexWrap: "wrap",
            columns: "100px",
          }}
        >
          <Box sx={{ width: 300, backgroundColor: "white" }}>
            <FormControl fullWidth variant="filled">
              <InputLabel id="demo-simple-select-label">Card Set</InputLabel>
              <Select
                sx={{ backgroundColor: "white" }}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={buttonFilterSet}
                label="Card Set"
                onChange={handleChange}
              >
                <MenuItem value={"all"}>All</MenuItem>
                <MenuItem value={"set 11"}>Bullet of Fate</MenuItem>
                <MenuItem value={"vg"}>Cardfight!! Vanguard</MenuItem>
                <MenuItem value={"set 10"}>Gods of the Arcana</MenuItem>
                <MenuItem value={"set 9"}>Duet of Dawn and Dusk</MenuItem>
                <MenuItem value={"set 8"}>Alterchaotica</MenuItem>
                <MenuItem value={"set 7"}>Verdant Steel</MenuItem>
                <MenuItem value={"idol"}>iM@S CG</MenuItem>
                <MenuItem value={"set 6"}>Paragons of the Colosseum</MenuItem>
                <MenuItem value={"set 5"}>Omens Eternal</MenuItem>
                <MenuItem value={"set 4"}>Cosmic Mythos</MenuItem>
                <MenuItem value={"set 3"}>Flame of Lævateinn</MenuItem>
                <MenuItem value={"uma"}>Umamusume</MenuItem>
                <MenuItem value={"set 2"}>Reign of Bahamut</MenuItem>
                <MenuItem value={"set 1"}>Advent of Genesis</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </div>

        <div
          style={{
            // backgroundColor: "rgba(50, 50, 50, 0.60)",
            // marginTop: "1em",
            padding: "1em",
            gap: "1em",
            // height: "200px",
            width: "80vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ width: 300, backgroundColor: "white" }}>
            <FormControl fullWidth variant="filled">
              <InputLabel id="demo-simple-select-label">Class</InputLabel>
              <Select
                sx={{ backgroundColor: "white" }}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={buttonFilterClass}
                label="Class"
                onChange={handleChangeClass}
              >
                <MenuItem value={"all"}>All</MenuItem>
                <MenuItem value={"forest"}>Forestcraft</MenuItem>
                <MenuItem value={"sword"}>Swordcraft</MenuItem>
                <MenuItem value={"rune"}>Runecraft</MenuItem>
                <MenuItem value={"dragon"}>Dragoncraft</MenuItem>
                <MenuItem value={"abyss"}>Abysscraft</MenuItem>
                <MenuItem value={"haven"}>Havencraft</MenuItem>
                <MenuItem value={"neutral"}>Neutral</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </div>
      </div>

      <InfiniteScroll
        dataLength={allCards.length} //This is important field to render the next data
        style={{
          width: "80vw",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5em",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "3%",
          paddingBottom: "10%",
          overflow: "visible",
        }}
      >
        {mainDeckSelected &&
          filteredAllCards.map((name, idx) => (
            <motion.div
              key={idx}
              whileTap={
                deckMap.get(name) === 3 ||
                (deckMap.get(name) === 1 && name === "Shenlong") ||
                (deckMap.get(name) === 1 && name === "Curse Crafter") ||
                (deckMap.get(name) === 6 && name === "Rapid Fire")
                  ? {}
                  : { opacity: 0.3 }
              }
              onTap={() => handleCardSelection(name)}
              onContextMenu={() => handleModalOpen(name)}
              whileHover={{
                translateY: -25,
                scale: 1.3,
                cursor: `url(${img}) 55 55, auto`,
                // boxShadow: 100,
                boxShadow:
                  "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 1.0)",
              }}
            >
              <LazyLoadImage
                width={"224px"}
                height={"312px"}
                onLoad={handleImageLoad}
                placeholder={
                  <Skeleton
                    sx={{ bgcolor: "grey", opacity: ".5" }}
                    animation="wave"
                    variant="rounded"
                    width={224}
                    height={312}
                  />
                }
                src={cardImage(name)}
                alt={name}
                style={
                  deckMap.get(name) === 3 ||
                  (deckMap.get(name) === 1 && name === "Shenlong") ||
                  (deckMap.get(name) === 1 && name === "Curse Crafter") ||
                  (deckMap.get(name) === 6 && name === "Rapid Fire")
                    ? { filter: "grayscale(100%)" }
                    : { imageStyle }
                }
              />
            </motion.div>
          ))}
        {evoDeckSelected &&
          filteredAllCardsEvo.map((name, idx) => (
            <motion.div
              key={idx}
              onTap={() => handleEvoCardSelection(name)}
              whileTap={
                (evoDeckMap.get(name) === 3 &&
                  name !== "Carrot" &&
                  name !== "Drive Point") ||
                evoDeckMap.get(name) === 10
                  ? {}
                  : { opacity: 0.3 }
              }
              onContextMenu={() => handleModalOpen(name)}
              whileHover={{
                translateY: -25,
                scale: 1.3,
                cursor: `url(${img}) 55 55, auto`,
                boxShadow:
                  "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 1.0)",
              }}
            >
              <LazyLoadImage
                width={"224px"}
                height={"312px"}
                onLoad={handleImageLoad}
                placeholder={
                  <Skeleton
                    sx={{ bgcolor: "grey", opacity: ".5" }}
                    animation="wave"
                    variant="rounded"
                    width={224}
                    height={312}
                  />
                }
                src={cardImage(name)}
                alt={name}
                style={
                  (evoDeckMap.get(name) === 3 &&
                    name !== "Carrot" &&
                    name !== "Drive Point") ||
                  evoDeckMap.get(name) === 10
                    ? { filter: "grayscale(100%)" }
                    : { imageStyle }
                }
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
      <Dialog
        open={openImport}
        onClose={handleCloseImport}
        PaperProps={{
          component: "form",
          //   onSubmit: (event) => {
          //     event.preventDefault();
          //     console.log(event.currentTarget);
          //     handleClose();
          //   },
        }}
      >
        <DialogTitle>Import Deck</DialogTitle>
        <DialogContent>
          {/* {mainDeckSelected ? (
            <DialogContentText>
              Enter the contents for this deck. This will create the main deck
              for you.
            </DialogContentText>
          ) : (
            <DialogContentText>
              Enter the contents for this deck. This will create the evolve deck
              for you.
            </DialogContentText>
          )} */}

          <DialogContentText>
            Enter the contents for this deck. This will create the deck for you.
          </DialogContentText>

          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="deck"
            value={importTextFieldVal}
            // defaultValue={handleDeckImportFormat()}
            multiline="true"
            fullWidth
            variant="standard"
            // onChange={handleDeckImport}
            onChange={(event) => handleDecklistInput(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeckImport}>Submit</Button>
          <Button onClick={handleClearImport}>Clear</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnack}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
        // message="Copied decklist to clipboard"
        action={action}
      >
        <SnackbarContent
          sx={{ backgroundColor: "#1976d2" }}
          message="Copied decklist to clipboard"
        />
      </Snackbar>
      <Modal
        open={openModal}
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
            // p: 3,
            width: "0",
            border: "none",
          }}
        >
          <CardMUI
            sx={{
              backgroundColor: "transparent",
              // width: "100%",
              // height: "80vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "none",
              overflow: "visible",
            }}
            variant="outlined"
          >
            {/* <img height={"100%"} src={cardImage(cardName)} alt={cardName} /> */}
            <motion.div
              initial={{ scale: 1.0, rotateY: 180 }}
              transition={{ duration: 0.8 }}
              animate={{ scale: 4.5, rotateY: 0 }}
            >
              <img height={"160px"} src={cardImage(cardName)} alt={cardName} />
              {/* Double Sided Evo */}
              {isDoubleEvo(cardName) && (
                <div
                  style={{
                    position: "absolute",
                    top: "-5%",
                    left: "80%",
                  }}
                >
                  <img
                    height={"30px"}
                    src={swap}
                    alt="swap"
                    onClick={handleDoubleEvoClick}
                    style={{ cursor: `url(${img}) 55 55, auto` }}
                  />
                </div>
              )}
            </motion.div>
          </CardMUI>
        </Box>
      </Modal>
      <div
        style={{
          // backgroundColor: "black",
          color: "white",
          height: "40px",
          minWidth: "150px",
          position: "absolute",
          fontSize: "18px ",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: ".5em",
          top: 10,
          left: 10,
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        {/* <ArrowBackIcon sx={{ fontSize: "50px" }} /> */}
        <ReplyIcon sx={{ fontSize: "40px" }} />
        {/* <KeyboardBackspaceIcon sx={{ fontSize: "50px" }} /> */}
        Back to Home
      </div>
      <div
        style={{
          // backgroundColor: "black",
          color: "white",
          height: "10px",
          minWidth: "150px",
          position: "absolute",
          fontSize: "18px ",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: ".5em",
          top: 30,
          right: 0,
          cursor: "pointer",
        }}
      >
        <Button
          style={{
            backgroundColor: "white",
            // marginTop: "0em",
            color: "black",
            textTransform: "none",
            fontFamily: "Noto Serif JP, serif",
            fontWeight: "bold",

            // border: "3px solid gold",
            // backgroundColor: "#131219",
            // color: "gold",
          }}
          variant="contained"
          onClick={handleClickOpenImport}
        >
          Import
        </Button>
      </div>
      <div
        style={{
          // backgroundColor: "black",
          color: "white",
          height: "10px",
          minWidth: "150px",
          position: "absolute",
          fontSize: "18px ",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: ".5em",
          top: 80,
          right: 0,
          cursor: "pointer",
        }}
      >
        <Button
          style={{
            backgroundColor: "white",
            // marginTop: "0em",
            color: "black",
            textTransform: "none",
            fontFamily: "Noto Serif JP, serif",
            fontWeight: "bold",

            // border: "3px solid gold",
            // backgroundColor: "#131219",
            // color: "gold",
          }}
          variant="contained"
          onClick={handleOpenSnack}
        >
          Export
        </Button>
      </div>
    </div>
  );
}
