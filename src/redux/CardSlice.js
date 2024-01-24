import { createSlice } from "@reduxjs/toolkit";
import { dragonDeck } from "../decks/dragonDeck";

export const CardSlice = createSlice({
  name: "card",
  initialState: {
    deck: dragonDeck,
    hand: [],
    grave: [],
    field: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    currentCard: {},
  },
  reducers: {
    drawFromDeck: (state) => {
      if (state.deck.length > 0 && state.hand.length < 8) {
        const card = state.deck[0];
        state.deck = state.deck.slice(1);
        console.log(`Removed ${card} from deck`);
        state.hand = [...state.hand, card];
        console.log(`Added ${card} to hand`);
      }
    },
    drawFourFromDeck: (state) => {
      for (let i = 0; i < 4; i++) {
        if (state.deck.length > 0 && state.hand.length < 8) {
          const card = state.deck[0];
          state.deck = state.deck.slice(1);
          console.log(`Removed ${card} from deck`);
          state.hand = [...state.hand, card];
          console.log(`Added ${card} to hand`);
        }
      }
    },
    mulligan: (state) => {
      if (state.hand.length > 0) {
        const card = state.hand[0];
        state.hand = state.hand.slice(1);
        console.log(`Removed ${card} from hand`);
        state.deck = [...state.deck, card];
        console.log(`Added ${card} to deck`);
      }
    },
    mulliganFour: (state) => {
      for (let i = 0; i < 4; i++) {
        if (state.hand.length > 0) {
          const card = state.hand[0];
          state.hand = state.hand.slice(1);
          console.log(`Removed ${card} from hand`);
          state.deck = [...state.deck, card];
          console.log(`Added ${card} to deck`);
        }
      }
    },
    setCurrentCard: (state, action) => {
      state.currentCard = action.payload;
    },
    shuffleDeck: (state) => {
      state.deck = state.deck.toSorted(() => Math.random() - 0.5);
    },
    placeToTopOfDeckFromHand: (state, action) => {
      const card = action.payload;
      state.hand = state.hand.filter((cardInHand) => card !== cardInHand);
      console.log(`Removed ${card} from hand`);
      state.deck = [card, ...state.deck];
      console.log(`Added ${card} to top of deck`);
    },
    placeToBotOfDeckFromHand: (state, action) => {
      const card = action.payload;
      state.hand = state.hand.filter((cardInHand) => card !== cardInHand);
      console.log(`Removed ${card} from hand`);
      state.deck = [...state.deck, card];
      console.log(`Added ${card} to bottom of deck`);
    },
    placeToTopOfDeckFromField: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newField = [
        ...state.field.slice(0, cardIndex),
        0,
        ...state.field.slice(cardIndex + 1),
      ];
      state.field = newField;
      console.log(`Removed ${card} from field`);
      state.deck = [card, ...state.deck];
      console.log(`Added ${card} to top of deck`);
    },
    placeToBotOfDeckFromField: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newField = [
        ...state.field.slice(0, cardIndex),
        0,
        ...state.field.slice(cardIndex + 1),
      ];
      state.field = newField;
      console.log(`Removed ${card} from field`);
      state.deck = [...state.deck, card];
      console.log(`Added ${card} to bot of deck`);
    },
    moveCardOnField: (state, action) => {
      const card = action.payload.card;
      const prevIndex = action.payload.prevIndex;
      const newIndex = action.payload.index;
      const field = [
        ...state.field.slice(0, prevIndex),
        0,
        ...state.field.slice(prevIndex + 1),
      ];
      state.field = field;
      console.log(`Removed ${card} from field`);
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      console.log(`Added ${card} to field`);
    },
    addToHandFromField: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newField = [
        ...state.field.slice(0, cardIndex),
        0,
        ...state.field.slice(cardIndex + 1),
      ];
      state.field = newField;
      console.log(`Removed ${card} from field`);
      state.hand = [...state.hand, card];
      console.log(`Added ${card} to hand`);
    },
    placeToFieldFromHand: (state, action) => {
      const idx = state.hand.indexOf(action.payload.card);
      if (idx === -1) {
        return [...state.hand];
      }
      state.hand = state.hand.filter((el, i) => i !== idx);
      console.log("Removed card from hand");

      const newField = [
        ...state.field.slice(0, action.payload.index),
        action.payload.card,
        ...state.field.slice(action.payload.index + 1),
      ];
      state.field = newField;
      console.log("Added card to field");
    },
    reorderCardsInHand: (state, action) => {
      state.hand = action.payload;
    },
    // HAVE NOT TESTED
    addToHandFromGrave: (state, action) => {
      state.grave = state.grave.filter((card) => action.payload !== card);
      console.log("Removed card from grave");
      state.hand = [...state.hand, action.payload];
      console.log("Added card to hand");
    },
    reset: (state) => {
      state.hand = [];
      state.deck = dragonDeck;
      state.grave = [];
      state.field = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.enemyField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.currentCard = {};
    },
  },
});

export const {
  drawFromDeck,
  drawFourFromDeck,
  placeToFieldFromHand,
  addToHandFromField,
  addToHandFromGrave,
  placeToTopOfDeckFromHand,
  placeToBotOfDeckFromHand,
  placeToTopOfDeckFromField,
  placeToBotOfDeckFromField,
  moveCardOnField,
  reorderCardsInHand,
  mulligan,
  mulliganFour,
  setCurrentCard,
  shuffleDeck,
  reset,
} = CardSlice.actions;
