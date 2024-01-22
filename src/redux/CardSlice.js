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
      if (state.deck.length > 0) {
        state.hand = [...state.hand, state.deck[0]];
        console.log("Added card to hand");
        state.deck = state.deck.slice(1);
        console.log("Removed card from deck");
      }
    },
    drawFourFromDeck: (state) => {
      for (let i = 0; i < 4; i++) {
        if (state.deck.length > 0) {
          state.hand = [...state.hand, state.deck[0]];
          console.log("Added card to hand");
          state.deck = state.deck.slice(1);
          console.log("Removed card from deck");
        }
      }
    },
    mulligan: (state) => {
      for (let i = 0; i < 4; i++) {
        if (state.hand.length > 0) {
          state.deck = [...state.deck, state.hand[0]];
          console.log("Added card to deck");
          state.hand = state.hand.slice(1);
          console.log("Removed card from hand");
        }
      }
    },
    setCurrentCard: (state, action) => {
      state.currentCard = action.payload;
    },
    shuffleDeck: (state) => {
      state.deck = state.deck.toSorted(() => Math.random() - 0.5);
    },
    placeToTopOfDeck: (state, action) => {
      state.deck = [...state.deck, action.payload];
      state.hand = state.hand.filter((card) => action.payload !== card);
    },
    addToHandFromGrave: (state, action) => {
      state.grave = state.grave.filter((card) => action.payload !== card);
      console.log("Removed card from grave");
      state.hand = [...state.hand, action.payload];
      console.log("Added card to hand");
    },
    addToHandFromField: (state, action) => {
      state.hand = [...state.hand, action.payload.card];
      console.log("hand AFTER", state.hand);
      const newField = [
        ...state.field.slice(0, action.payload.index),
        0,
        ...state.field.slice(action.payload.index + 1),
      ];
      state.field = newField;

      console.log("field AFTER", state.field);
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
      // console.log("AFTER", state.field);
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
  mulligan,
  setCurrentCard,
  shuffleDeck,
  placeToTopOfDeck,
  addToHandFromField,
  addToHandFromGrave,
  placeToFieldFromHand,
  reset,
} = CardSlice.actions;
