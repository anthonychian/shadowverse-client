import { createSlice } from "@reduxjs/toolkit";
import { dragonDeck } from "../decks/dragonDeck";
import { dragonDeckEvo } from "../decks/dragonDeckEvo";

export const CardSlice = createSlice({
  name: "card",
  initialState: {
    deck: dragonDeck,
    evoDeck: dragonDeckEvo.map((card) => {
      return { card: card, status: false };
    }),
    hand: [],
    field: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    currentCard: "",
    currentEvo: "",
    cemetery: [],
    evoField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    setCurrentEvo: (state, action) => {
      state.currentCard = action.payload;
    },
    shuffleDeck: (state) => {
      state.deck = state.deck.toSorted(() => Math.random() - 0.5);
    },
    placeToTopOfDeckFromHand: (state, action) => {
      const card = action.payload;
      const cardIndex = state.hand.indexOf(card);
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from hand`);
      state.deck = [card, ...state.deck];
      console.log(`Added ${card} to top of deck`);
    },
    placeToBotOfDeckFromHand: (state, action) => {
      const card = action.payload;
      const cardIndex = state.hand.indexOf(card);
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
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
    addToHandFromCemetery: (state, action) => {
      const card = action.payload;
      const cardIndex = state.cemetery.indexOf(card);
      state.cemetery = state.cemetery.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from cemetery`);
      state.hand = [...state.hand, card];
      console.log(`Added ${card} to hand`);
    },
    placeToCemeteryFromField: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newField = [
        ...state.field.slice(0, cardIndex),
        0,
        ...state.field.slice(cardIndex + 1),
      ];
      state.field = newField;
      console.log(`Removed ${card} from field`);
      state.cemetery = [card, ...state.cemetery];
      console.log(`Added ${card} to cemetery`);
    },
    placeToCemeteryFromHand: (state, action) => {
      const card = action.payload;
      const cardIndex = state.hand.indexOf(card);
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from hand`);
      state.cemetery = [card, ...state.cemetery];
      console.log(`Added ${card} to cemetery`);
    },
    placeToFieldFromCemetery: (state, action) => {
      const card = action.payload.card;
      const cardIndex = state.cemetery.indexOf(card);
      const newIndex = action.payload.index;
      state.cemetery = state.cemetery.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from cemetery`);
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      console.log(`Added ${card} to field`);
    },
    evolveCardOnField: (state, action) => {
      const card = action.payload.card;
      const newIndex = action.payload.index;
      let cardIndex;
      for (let i = 0; i < state.evoDeck.length; i++) {
        if (state.evoDeck[i].card === card) {
          cardIndex = i;
          break;
        }
      }
      state.evoDeck = state.evoDeck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from evolve deck`);
      const newField = [
        ...state.evoField.slice(0, newIndex),
        card,
        ...state.evoField.slice(newIndex + 1),
      ];
      state.evoField = newField;
      console.log(`Added ${card} to evolve field`);
    },
    feedCardOnField: (state, action) => {
      const card = action.payload.card;
      const newIndex = action.payload.index;
      let cardIndex;
      for (let i = 0; i < state.evoDeck.length; i++) {
        if (state.evoDeck[i].card === card) {
          cardIndex = i;
          break;
        }
      }
      state.evoDeck = state.evoDeck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from evolve deck`);
      const newField = [
        ...state.evoField.slice(0, newIndex),
        card,
        ...state.evoField.slice(newIndex + 1),
      ];
      state.evoField = newField;
      console.log(`Added ${card} to evolve field`);
    },
    backToEvolveDeck: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newField = [
        ...state.evoField.slice(0, cardIndex),
        0,
        ...state.evoField.slice(cardIndex + 1),
      ];
      state.evoField = newField;
      console.log(`Removed ${card} to from evolve field`);
      state.evoDeck = [...state.evoDeck, { card: card, status: true }];
      console.log(`Added ${card} to hand`);
    },
    reset: (state) => {
      state.hand = [];
      state.deck = dragonDeck;
      state.field = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.enemyField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.currentCard = {};
      state.cemetery = [];
      state.evoDeck = dragonDeckEvo.map((card) => {
        return { card: card, status: false };
      });
      state.evoField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    },
  },
});

export const {
  drawFromDeck,
  drawFourFromDeck,
  placeToFieldFromHand,
  placeToFieldFromCemetery,
  addToHandFromField,
  addToHandFromCemetery,
  placeToTopOfDeckFromHand,
  placeToBotOfDeckFromHand,
  placeToTopOfDeckFromField,
  placeToBotOfDeckFromField,
  placeToCemeteryFromField,
  placeToCemeteryFromHand,
  moveCardOnField,
  reorderCardsInHand,
  mulligan,
  mulliganFour,
  setCurrentCard,
  setCurrentEvo,
  shuffleDeck,
  evolveCardOnField,
  feedCardOnField,
  reset,
} = CardSlice.actions;
