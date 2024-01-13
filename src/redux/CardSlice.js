import { createSlice } from "@reduxjs/toolkit";
import { dragonDeck } from "../decks/dragonDeck";

export const CardSlice = createSlice({
  name: "card",
  initialState: {
    deck: dragonDeck,
    hand: [],
    grave: [],
    field: [],
  },
  reducers: {
    drawFromDeck: (state, action) => {
      if (state.deck.length > 0) {
        state.hand = [...state.hand, state.deck[0]];
        console.log("Added card to hand");
        state.deck = state.deck.slice(1);
        console.log("Removed card from deck");
      }
    },
    drawFourFromDeck: (state, action) => {
      for (let i = 0; i < 4; i++) {
        if (state.deck.length > 0) {
          state.hand = [...state.hand, state.deck[0]];
          console.log("Added card to hand");
          state.deck = state.deck.slice(1);
          console.log("Removed card from deck");
        }
      }
    },
    mulligan: (state, action) => {
      for (let i = 0; i < 4; i++) {
        if (state.hand.length > 0) {
          state.deck = [...state.deck, state.hand[0]];
          console.log("Added card to deck");
          state.hand = state.hand.slice(1);
          console.log("Removed card from hand");
        }
      }
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
    placeToFieldFromHand: (state, action) => {
      state.hand = state.hand.filter((card) => action.payload !== card);
      console.log("Removed card from hand");
      state.field = [...state.field, action.payload];
      console.log("Placed card on field");
    },
    reset: (state, action) => {
      state.hand = [];
      state.deck = dragonDeck;
      state.field = [];
      state.grave = [];
    },
  },
});

export const {
  drawFromDeck,
  drawFourFromDeck,
  mulligan,
  shuffleDeck,
  placeToTopOfDeck,
  addToHandFromGrave,
  placeToFieldFromHand,
  reset,
} = CardSlice.actions;
