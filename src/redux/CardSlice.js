import { createSlice } from "@reduxjs/toolkit";
import { dragonDeck } from "../decks/dragonDeck";

export const CardSlice = createSlice({
  name: "card",
  initialState: {
    deck: dragonDeck,
    hand: [],
    field: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    currentCard: {},
    cemetary: [],
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
    // FIX THIS
    placeToTopOfDeckFromHand: (state, action) => {
      const card = action.payload;
      state.hand = state.hand.filter((cardInHand) => card !== cardInHand);
      console.log(`Removed ${card} from hand`);
      state.deck = [card, ...state.deck];
      console.log(`Added ${card} to top of deck`);
    },
    // FIX THIS
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
    // test
    placeToFieldFromHand: (state, action) => {
      const card = action.payload.card;
      const cardIndex = state.hand.indexOf(card);
      const newIndex = action.payload.index;
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from hand`);
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      console.log(`Added ${card} to field`);
    },
    reorderCardsInHand: (state, action) => {
      state.hand = action.payload;
    },
    // HAVE NOT TESTED CEMETARY
    addToHandFromCemetary: (state, action) => {
      const card = action.payload;
      const cardIndex = state.cemetary.indexOf(card);
      state.cemetary = state.cemetary.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from cemetary`);
      state.hand = [...state.hand, card];
      console.log(`Added ${card} to hand`);
    },
    placeToCemetaryFromField: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newField = [
        ...state.field.slice(0, cardIndex),
        0,
        ...state.field.slice(cardIndex + 1),
      ];
      state.field = newField;
      console.log(`Removed ${card} from field`);
      state.cemetary = [card, ...state.cemetary];
      console.log(`Added ${card} to cemetary`);
    },
    placeToCemetaryFromHand: (state, action) => {
      const card = action.payload;
      const cardIndex = state.hand.indexOf(card);
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from hand`);
      state.cemetary = [card, ...state.cemetary];
      console.log(`Added ${card} to cemetary`);
    },
    placeToFieldFromCemetary: (state, action) => {
      const card = action.payload.card;
      const cardIndex = state.cemetary.indexOf(card);
      const newIndex = action.payload.index;
      state.cemetary = state.cemetary.filter((_, i) => i !== cardIndex);
      console.log("CEMETARY", state.cemetary);
      console.log(`Removed ${card} from cemetary`);
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      console.log(`Added ${card} to field`);
      console.log("FIELD", state.field);
    },
    reset: (state) => {
      state.hand = [];
      state.deck = dragonDeck;
      state.field = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.enemyField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.currentCard = {};
      state.cemetary = [];
    },
  },
});

export const {
  drawFromDeck,
  drawFourFromDeck,
  placeToFieldFromHand,
  placeToFieldFromCemetary,
  addToHandFromField,
  addToHandFromCemetary,
  placeToTopOfDeckFromHand,
  placeToBotOfDeckFromHand,
  placeToTopOfDeckFromField,
  placeToBotOfDeckFromField,
  placeToCemetaryFromField,
  placeToCemetaryFromHand,
  moveCardOnField,
  reorderCardsInHand,
  mulligan,
  mulliganFour,
  setCurrentCard,
  shuffleDeck,
  reset,
} = CardSlice.actions;
