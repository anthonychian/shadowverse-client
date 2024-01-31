import { createSlice } from "@reduxjs/toolkit";
import { dragonDeck } from "../decks/dragonDeck";
import { dragonDeckEvo } from "../decks/dragonDeckEvo";

import { socket } from "../sockets";

export const CardSlice = createSlice({
  name: "card",
  initialState: {
    deck: dragonDeck.toSorted(() => Math.random() - 0.5),
    evoDeck: dragonDeckEvo.map((card) => {
      return { card: card, status: false };
    }),
    hand: [],
    field: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    evoField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyEvoField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    currentCard: "",
    currentEvo: "",
    cemetery: [],
    enemyCemetery: [],
    enemyEvoDeck: [
      { card: "", status: false },
      { card: "", status: false },
      { card: "", status: false },
      { card: "", status: false },
      { card: "", status: false },
      { card: "", status: false },
      { card: "", status: false },
      { card: "", status: false },
      { card: "", status: false },
      { card: "", status: false },
    ],
    engagedField: [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    enemyEngagedField: [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    customValues: [
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
    ],
    enemyCustomValues: [
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
      { showAtk: false, atk: 0, showDef: false, def: 0 },
    ],
  },
  reducers: {
    drawFromDeck: (state) => {
      if (state.deck.length > 0 && state.hand.length < 10) {
        const card = state.deck[0];
        state.deck = state.deck.slice(1);
        console.log(`Removed ${card} from deck`);
        state.hand = [...state.hand, card];
        console.log(`Added ${card} to hand`);
      }
    },
    drawFourFromDeck: (state) => {
      for (let i = 0; i < 4; i++) {
        if (state.deck.length > 0 && state.hand.length < 10) {
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
    setEngaged: (state, action) => {
      let index = action.payload;
      const newEngaged = [
        ...state.engagedField.slice(0, index),
        !state.engagedField[index],
        ...state.engagedField.slice(index + 1),
      ];
      state.engagedField = newEngaged;
      socket.emit("send msg", { type: "engaged", data: state.engagedField });
    },
    clearEngagedAtIndex: (state, action) => {
      let index = action.payload;
      const newEngaged = [
        ...state.engagedField.slice(0, index),
        false,
        ...state.engagedField.slice(index + 1),
      ];
      state.engagedField = newEngaged;
      socket.emit("send msg", { type: "engaged", data: state.engagedField });
    },
    showAtk: (state, action) => {
      let index = action.payload;
      let item = state.customValues[index];
      item.showAtk = true;
      const newCustomValues = [
        ...state.customValues.slice(0, index),
        item,
        ...state.customValues.slice(index + 1),
      ];
      state.customValues = newCustomValues;
    },
    hideAtk: (state, action) => {
      let index = action.payload;
      let item = state.customValues[index];
      item.showAtk = false;
      item.atk = 0;
      const newCustomValues = [
        ...state.customValues.slice(0, index),
        item,
        ...state.customValues.slice(index + 1),
      ];
      state.customValues = newCustomValues;
      socket.emit("send msg", { type: "values", data: state.customValues });
    },
    modifyAtk: (state, action) => {
      let newValue = action.payload.value;
      let index = action.payload.index;
      let item = state.customValues[index];
      item.atk = newValue;
      item.showAtk = true;
      const newCustomValues = [
        ...state.customValues.slice(0, index),
        item,
        ...state.customValues.slice(index + 1),
      ];
      state.customValues = newCustomValues;
      socket.emit("send msg", { type: "values", data: state.customValues });
    },
    showDef: (state, action) => {
      let index = action.payload;
      let item = state.customValues[index];
      item.showDef = true;
      const newCustomValues = [
        ...state.customValues.slice(0, index),
        item,
        ...state.customValues.slice(index + 1),
      ];
      state.customValues = newCustomValues;
    },
    hideDef: (state, action) => {
      let index = action.payload;
      let item = state.customValues[index];
      item.showDef = false;
      item.def = 0;
      const newCustomValues = [
        ...state.customValues.slice(0, index),
        item,
        ...state.customValues.slice(index + 1),
      ];
      state.customValues = newCustomValues;
      socket.emit("send msg", { type: "values", data: state.customValues });
    },
    modifyDef: (state, action) => {
      let newValue = action.payload.value;
      let index = action.payload.index;
      let item = state.customValues[index];
      item.def = newValue;
      item.showDef = true;
      const newCustomValues = [
        ...state.customValues.slice(0, index),
        item,
        ...state.customValues.slice(index + 1),
      ];
      state.customValues = newCustomValues;
      socket.emit("send msg", { type: "values", data: state.customValues });
    },
    clearValuesAtIndex: (state, action) => {
      let index = action.payload;
      let item = state.customValues[index];
      item.atk = 0;
      item.def = 0;
      item.showAtk = false;
      item.showDef = false;
      const newCustomValues = [
        ...state.customValues.slice(0, index),
        item,
        ...state.customValues.slice(index + 1),
      ];
      state.customValues = newCustomValues;
      socket.emit("send msg", { type: "values", data: state.customValues });
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
      socket.emit("send msg", { type: "field", data: state.field });
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
      socket.emit("send msg", { type: "field", data: state.field });
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
      socket.emit("send msg", { type: "field", data: state.field });
    },
    addToHandFromDeck: (state, action) => {
      const card = action.payload;
      const cardIndex = state.deck.indexOf(card);
      state.deck = state.deck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from deck`);
      state.hand = [...state.hand, card];
      console.log(`Added ${card} to hand`);
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
      socket.emit("send msg", { type: "field", data: state.field });
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

      socket.emit("send msg", { type: "field", data: state.field });
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
      socket.emit("send msg", { type: "cemetery", data: state.cemetery });
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
      socket.emit("send msg", { type: "field", data: state.field });
      socket.emit("send msg", { type: "cemetery", data: state.cemetery });
    },
    placeToCemeteryFromHand: (state, action) => {
      const card = action.payload;
      const cardIndex = state.hand.indexOf(card);
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from hand`);
      state.cemetery = [card, ...state.cemetery];
      console.log(`Added ${card} to cemetery`);
      socket.emit("send msg", { type: "cemetery", data: state.cemetery });
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
      socket.emit("send msg", { type: "field", data: state.field });
      socket.emit("send msg", { type: "cemetery", data: state.cemetery });
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
      socket.emit("send msg", { type: "evoField", data: state.evoField });
      socket.emit("send msg", { type: "evoDeck", data: state.evoDeck });
    },
    feedCardOnField: (state, action) => {
      const card = action.payload.card;
      const newIndex = action.payload.index;
      const carrots = action.payload.carrots;
      let cardIndex;
      for (let i = 0; i < state.evoDeck.length; i++) {
        if (state.evoDeck[i].card === card) {
          cardIndex = i;
          break;
        }
      }
      state.evoDeck = state.evoDeck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from evolve deck`);

      if (carrots === 1) {
        const newField = [
          ...state.evoField.slice(0, newIndex),
          "Carrot-1",
          ...state.evoField.slice(newIndex + 1),
        ];
        state.evoField = newField;
        console.log("Added Carrot-1 to evolve field");
      } else {
        const numOfCarrots = Number(state.evoField[newIndex].slice(-1));
        console.log("numOfCarrots", numOfCarrots);
        const newField = [
          ...state.evoField.slice(0, newIndex),
          `Carrot-${numOfCarrots + 1}`,
          ...state.evoField.slice(newIndex + 1),
        ];
        state.evoField = newField;
        console.log(`Added Carrot-${numOfCarrots + 1} to evolve field`);
      }
      socket.emit("send msg", { type: "evoField", data: state.evoField });
      socket.emit("send msg", { type: "evoDeck", data: state.evoDeck });
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
      console.log(`Removed ${card} from evolve field`);
      if (card.slice(0, 6) === "Carrot") {
        const numOfCarrots = Number(card.slice(-1));
        for (let i = 0; i < numOfCarrots; i++)
          state.evoDeck = [...state.evoDeck, { card: "Carrot", status: true }];
      } else {
        state.evoDeck = [...state.evoDeck, { card: card, status: true }];
      }
      console.log(`Added ${card} to evolve deck`);
      socket.emit("send msg", { type: "evoField", data: state.evoField });
      socket.emit("send msg", { type: "evoDeck", data: state.evoDeck });
    },
    restoreEvoCard: (state, action) => {
      const card = action.payload;
      console.log(card);
      let cardIndex;
      for (let i = 0; i < state.evoDeck.length; i++) {
        if (
          state.evoDeck[i].card === card &&
          state.evoDeck[i].status === true
        ) {
          cardIndex = i;
          break;
        }
      }
      state.evoDeck = state.evoDeck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from evolve deck`);
      state.evoDeck = [...state.evoDeck, { card: card, status: false }];
      console.log(`Added ${card} to evolve deck`);
      socket.emit("send msg", { type: "evoDeck", data: state.evoDeck });
    },
    setEnemyField: (state, action) => {
      state.enemyField = action.payload;
    },
    setEnemyEvoField: (state, action) => {
      state.enemyEvoField = action.payload;
    },
    setEnemyEngaged: (state, action) => {
      state.enemyEngagedField = action.payload;
    },
    setEnemyCemetery: (state, action) => {
      state.enemyCemetery = action.payload;
    },
    setEnemyEvoDeck: (state, action) => {
      state.enemyEvoDeck = action.payload;
    },
    setEnemyCustomValues: (state, action) => {
      state.enemyCustomValues = action.payload;
    },
    reset: (state) => {
      state.hand = [];
      state.deck = dragonDeck.toSorted(() => Math.random() - 0.5);
      state.field = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.enemyField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.currentCard = "";
      state.currentEvo = "";
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
  addToHandFromDeck,
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
  backToEvolveDeck,
  restoreEvoCard,
  setEnemyField,
  setEnemyEvoField,
  setEnemyEngaged,
  setEngaged,
  clearEngagedAtIndex,
  setEnemyCemetery,
  setEnemyEvoDeck,
  setEnemyCustomValues,
  showAtk,
  showDef,
  modifyAtk,
  hideAtk,
  hideDef,
  modifyDef,
  clearValuesAtIndex,
  reset,
} = CardSlice.actions;
