import { createSlice } from "@reduxjs/toolkit";
import { socket } from "../sockets";

export const CardSlice = createSlice({
  name: "card",
  initialState: {
    deck: [],
    evoDeck: [],
    hand: [],
    enemyHand: [],
    showDice: false,
    showEnemyHand: false,
    enemyArrow: { idx: -1, show: false },
    leaderActive: false,
    enemyLeaderActive: false,
    enemyViewingHand: false,
    enemyViewingDeck: false,
    enemyViewingTopCards: false,
    enemyViewingCemetery: false,
    enemyViewingEvoDeck: false,
    enemyViewingCemeteryOpponent: false,
    enemyViewingEvoDeckOpponent: false,
    enemyDeckSize: 0,
    enemyLeader: "",
    enemyDice: { show: false, roll: 1 },
    leader: "",
    evoPoints: 0,
    enemyEvoPoints: 0,
    playPoints: { available: 0, max: 0 },
    enemyPlayPoints: { available: 0, max: 0 },
    playerHealth: 20,
    enemyHealth: 20,
    field: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    evoField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyEvoField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    counterField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyCounterField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    currentCard: "",
    currentEvo: "",
    room: "",
    cemetery: [],
    enemyCemetery: [],
    banish: [],
    enemyBanish: [],
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
    setRoom: (state, action) => {
      state.room = action.payload;
    },
    setDeck: (state, action) => {
      state.deck = action.payload;
    },
    setPlayPoints: (state, action) => {
      state.playPoints = action.payload;
      socket.emit("send msg", {
        type: "playPoints",
        data: state.playPoints,
        room: state.room,
      });
    },
    setLeader: (state, action) => {
      state.leader = action.payload;
      socket.emit("send msg", {
        type: "leader",
        data: state.leader,
        room: state.room,
      });
    },
    setHealth: (state, action) => {
      state.playerHealth = action.payload;
      socket.emit("send msg", {
        type: "health",
        data: state.playerHealth,
        room: state.room,
      });
    },
    setEvoPoints: (state, action) => {
      state.evoPoints = action.payload;
      socket.emit("send msg", {
        type: "evoPoints",
        data: state.evoPoints,
        room: state.room,
      });
    },
    setShowEnemyHand: (state, action) => {
      state.showEnemyHand = action.payload;
      socket.emit("send msg", {
        type: "viewingHand",
        data: action.payload,
        room: state.room,
      });
    },
    setShowDice: (state, action) => {
      state.showDice = action.payload;
    },
    setDice: (state, action) => {
      socket.emit("send msg", {
        type: "dice",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyDice: (state, action) => {
      state.enemyDice = action.payload;
    },
    setArrow: (state, action) => {
      // console.log(action.payload);
      socket.emit("send msg", {
        type: "arrow",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyArrow: (state, action) => {
      state.enemyArrow = action.payload;
    },
    setShowEnemyCard: (state, action) => {
      state.showEnemyCard = action.payload;
    },
    setEnemyCard: (state, action) => {
      state.enemyCard = action.payload;
    },
    setViewingDeck: (state, action) => {
      socket.emit("send msg", {
        type: "viewingDeck",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyViewingDeck: (state, action) => {
      state.enemyViewingDeck = action.payload;
    },
    setEnemyViewingHand: (state, action) => {
      state.enemyViewingHand = action.payload;
    },
    setViewingTopCards: (state, action) => {
      socket.emit("send msg", {
        type: "viewingTopCards",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyViewingTopCards: (state, action) => {
      state.enemyViewingTopCards = action.payload;
    },
    setViewingCemetery: (state, action) => {
      socket.emit("send msg", {
        type: "viewingCemetery",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyViewingCemetery: (state, action) => {
      state.enemyViewingCemetery = action.payload;
    },
    setViewingEvoDeck: (state, action) => {
      socket.emit("send msg", {
        type: "viewingEvoDeck",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyViewingEvoDeck: (state, action) => {
      state.enemyViewingEvoDeck = action.payload;
    },
    setViewingCemeteryOpponent: (state, action) => {
      socket.emit("send msg", {
        type: "viewingCemeteryOpponent",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyViewingCemeteryOpponent: (state, action) => {
      state.enemyViewingCemeteryOpponent = action.payload;
    },
    setViewingEvoDeckOpponent: (state, action) => {
      socket.emit("send msg", {
        type: "viewingEvoDeckOpponent",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyViewingEvoDeckOpponent: (state, action) => {
      state.enemyViewingEvoDeckOpponent = action.payload;
    },
    setEvoDeck: (state, action) => {
      state.evoDeck = action.payload;
    },
    setEnemyHand: (state, action) => {
      state.enemyHand = action.payload;
    },
    setEnemyDeckSize: (state, action) => {
      state.enemyDeckSize = action.payload;
    },
    setEnemyEvoPoints: (state, action) => {
      state.enemyEvoPoints = action.payload;
    },
    setEnemyPlayPoints: (state, action) => {
      state.enemyPlayPoints = action.payload;
    },
    setEnemyHealth: (state, action) => {
      state.enemyHealth = action.payload;
    },
    modifyCounter: (state, action) => {
      let newValue = action.payload.value;
      let index = action.payload.index;
      const newCounters = [
        ...state.counterField.slice(0, index),
        newValue,
        ...state.counterField.slice(index + 1),
      ];
      state.counterField = newCounters;
      console.log(`Set counters to ${newValue}`);
      socket.emit("send msg", {
        type: "counter",
        data: state.counterField,
        room: state.room,
      });
    },
    drawFromDeck: (state) => {
      if (state.deck.length > 0 && state.hand.length < 10) {
        const card = state.deck[0];
        state.deck = state.deck.slice(1);
        console.log(`Removed ${card} from deck`);
        state.hand = [...state.hand, card];
        console.log(`Added ${card} to hand`);
        socket.emit("send msg", {
          type: "hand",
          data: state.hand,
          room: state.room,
        });
        socket.emit("send msg", {
          type: "deckSize",
          data: state.deck.length,
          room: state.room,
        });
      }
    },
    drawFourFromDeck: (state) => {
      if (state.deck.length > 0 && state.hand.length < 10) {
        for (let i = 0; i < 4; i++) {
          if (state.deck.length > 0 && state.hand.length < 10) {
            const card = state.deck[0];
            state.deck = state.deck.slice(1);
            console.log(`Removed ${card} from deck`);
            state.hand = [...state.hand, card];
            console.log(`Added ${card} to hand`);
          }
        }
        socket.emit("send msg", {
          type: "hand",
          data: state.hand,
          room: state.room,
        });
        socket.emit("send msg", {
          type: "deckSize",
          data: state.deck.length,
          room: state.room,
        });
      }
    },
    mulligan: (state) => {
      if (state.hand.length > 0) {
        const card = state.hand[0];
        state.hand = state.hand.slice(1);
        console.log(`Removed ${card} from hand`);
        state.deck = [...state.deck, card];
        console.log(`Added ${card} to deck`);
        socket.emit("send msg", {
          type: "hand",
          data: state.hand,
          room: state.room,
        });
        socket.emit("send msg", {
          type: "deckSize",
          data: state.deck.length,
          room: state.room,
        });
      }
    },
    mulliganFour: (state) => {
      if (state.hand.length > 0) {
        for (let i = 0; i < 4; i++) {
          if (state.hand.length > 0) {
            const card = state.hand[0];
            state.hand = state.hand.slice(1);
            console.log(`Removed ${card} from hand`);
            state.deck = [...state.deck, card];
            console.log(`Added ${card} to deck`);
          }
        }
        socket.emit("send msg", {
          type: "hand",
          data: state.hand,
          room: state.room,
        });
        socket.emit("send msg", {
          type: "deckSize",
          data: state.deck.length,
          room: state.room,
        });
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
      socket.emit("send msg", {
        type: "engaged",
        data: state.engagedField,
        room: state.room,
      });
    },
    clearEngagedAtIndex: (state, action) => {
      let index = action.payload;
      const newEngaged = [
        ...state.engagedField.slice(0, index),
        false,
        ...state.engagedField.slice(index + 1),
      ];
      state.engagedField = newEngaged;
      socket.emit("send msg", {
        type: "engaged",
        data: state.engagedField,
        room: state.room,
      });
    },
    moveEngagedAtIndex: (state, action) => {
      const prevIndex = action.payload.prevIndex;
      const index = action.payload.index;
      const prevItem = state.engagedField[prevIndex];
      const newEngaged = [
        ...state.engagedField.slice(0, index),
        prevItem,
        ...state.engagedField.slice(index + 1),
      ];
      state.engagedField = newEngaged;
      socket.emit("send msg", {
        type: "engaged",
        data: state.engagedField,
        room: state.room,
      });
    },
    clearCountersAtIndex: (state, action) => {
      let index = action.payload;
      const newCounters = [
        ...state.counterField.slice(0, index),
        0,
        ...state.counterField.slice(index + 1),
      ];
      state.counterField = newCounters;
      socket.emit("send msg", {
        type: "counter",
        data: state.counterField,
        room: state.room,
      });
    },
    moveCountersAtIndex: (state, action) => {
      const prevIndex = action.payload.prevIndex;
      const index = action.payload.index;
      const prevItem = state.counterField[prevIndex];
      const newCounters = [
        ...state.counterField.slice(0, index),
        prevItem,
        ...state.counterField.slice(index + 1),
      ];
      state.counterField = newCounters;
      socket.emit("send msg", {
        type: "counter",
        data: state.counterField,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "values",
        data: state.customValues,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "values",
        data: state.customValues,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "values",
        data: state.customValues,
        room: state.room,
      });
    },
    modifyDef: (state, action) => {
      const newValue = action.payload.value;
      const index = action.payload.index;
      let item = state.customValues[index];
      item.def = newValue;
      item.showDef = true;
      const newCustomValues = [
        ...state.customValues.slice(0, index),
        item,
        ...state.customValues.slice(index + 1),
      ];
      state.customValues = newCustomValues;
      socket.emit("send msg", {
        type: "values",
        data: state.customValues,
        room: state.room,
      });
    },
    clearValuesAtIndex: (state, action) => {
      const index = action.payload;
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
      socket.emit("send msg", {
        type: "values",
        data: state.customValues,
        room: state.room,
      });
    },
    moveValuesAtIndex: (state, action) => {
      const prevIndex = action.payload.prevIndex;
      const index = action.payload.index;
      const prevItem = state.customValues[prevIndex];
      const newCustomValues = [
        ...state.customValues.slice(0, index),
        prevItem,
        ...state.customValues.slice(index + 1),
      ];
      state.customValues = newCustomValues;
      socket.emit("send msg", {
        type: "values",
        data: state.customValues,
        room: state.room,
      });
    },
    duplicateCardOnField: (state, action) => {
      const card = action.payload.card;
      const newIndex = action.payload.index;

      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      console.log(`Added ${card} to field`);
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "hand",
        data: state.hand,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
    },
    placeToBotOfDeckFromHand: (state, action) => {
      const card = action.payload;
      const cardIndex = state.hand.indexOf(card);
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from hand`);
      state.deck = [...state.deck, card];
      console.log(`Added ${card} to bottom of deck`);
      socket.emit("send msg", {
        type: "hand",
        data: state.hand,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
    },
    placeTokenOnField: (state, action) => {
      const card = action.payload.card;
      const newIndex = action.payload.index;
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      console.log(`Added ${card} to field`);
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
    },
    removeTokenOnField: (state, action) => {
      const card = action.payload.card;
      const prevIndex = action.payload.index;
      const field = [
        ...state.field.slice(0, prevIndex),
        0,
        ...state.field.slice(prevIndex + 1),
      ];
      state.field = field;
      console.log(`Removed ${card} from field`);
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
    },
    transferToOpponentField: (state, action) => {
      if (
        state.enemyField[0] === 0 ||
        state.enemyField[1] === 0 ||
        state.enemyField[2] === 0 ||
        state.enemyField[3] === 0 ||
        state.enemyField[4] === 0
      ) {
        const card = action.payload.card;
        const prevIndex = action.payload.prevIndex;
        const field = [
          ...state.field.slice(0, prevIndex),
          0,
          ...state.field.slice(prevIndex + 1),
        ];
        state.field = field;

        console.log(`Removed ${card} from field`);

        let index;
        for (let i = 0; i < 5; i++) {
          if (state.enemyField[i] === 0) {
            index = i;
            break;
          }
        }
        const newField = [
          ...state.enemyField.slice(0, index),
          card,
          ...state.enemyField.slice(index + 1),
        ];
        state.enemyField = newField;
        console.log(`Added ${card} to enemy field`);

        socket.emit("send msg", {
          type: "field",
          data: state.field,
          // data: state.field,
          room: state.room,
        });
        socket.emit("send msg", {
          type: "transfer",
          data: state.enemyField,
          // data: card,
          room: state.room,
        });
      } else {
        console.log("there are no open slots to transfer");
      }
    },

    addToFieldFromDeck: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.cardIndex;
      const newIndex = action.payload.index;
      state.deck = state.deck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from deck`);
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      console.log(`Added ${card} to field`);

      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
    },
    addToTopOfDeckFromDeck: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      state.deck = state.deck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from deck`);
      state.deck = [card, ...state.deck];
      console.log(`Added ${card} to top of deck`);
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
    },
    addToBotOfDeckFromDeck: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      state.deck = state.deck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from deck`);
      state.deck = [...state.deck, card];
      console.log(`Added ${card} to bot of deck`);
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
    },
    addToCemeteryFromDeck: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      state.deck = state.deck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from deck`);
      state.cemetery = [card, ...state.cemetery];
      console.log(`Added ${card} to cemetery`);
      socket.emit("send msg", {
        type: "cemetery",
        data: state.cemetery,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
    },
    addToCemeteryFromTopOfDeck: (state) => {
      const card = state.deck[0];
      state.deck = state.deck.slice(1);
      console.log(`Removed ${card} from deck`);
      state.cemetery = [card, ...state.cemetery];
      console.log(`Added ${card} to cemetery`);
      socket.emit("send msg", {
        type: "cemetery",
        data: state.cemetery,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
    },
    addToBanishFromDeck: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      state.deck = state.deck.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from deck`);
      state.banish = [card, ...state.banish];
      console.log(`Added ${card} to banished`);
      socket.emit("send msg", {
        type: "banish",
        data: state.banish,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
    },
    addToHandFromDeck: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newDeck = state.deck.filter((_, i) => i !== cardIndex);
      state.deck = newDeck;
      console.log(`Removed ${card} from deck`);
      state.hand = [...state.hand, card];
      console.log(`Added ${card} to hand`);
      socket.emit("send msg", {
        type: "hand",
        data: state.hand,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "deckSize",
        data: state.deck.length,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "hand",
        data: state.hand,
        room: state.room,
      });
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

      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "hand",
        data: state.hand,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "cemetery",
        data: state.cemetery,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "hand",
        data: state.hand,
        room: state.room,
      });
    },
    addToBanishFromCemetery: (state, action) => {
      const card = action.payload;
      const cardIndex = state.cemetery.indexOf(card);
      state.cemetery = state.cemetery.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from cemetery`);
      state.banish = [card, ...state.banish];
      console.log(`Added ${card} to banished`);
      socket.emit("send msg", {
        type: "cemetery",
        data: state.cemetery,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "banish",
        data: state.banish,
        room: state.room,
      });
    },
    addToHandFromBanish: (state, action) => {
      const card = action.payload;
      const cardIndex = state.banish.indexOf(card);
      state.banish = state.banish.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from banish`);
      state.hand = [...state.hand, card];
      console.log(`Added ${card} to hand`);
      socket.emit("send msg", {
        type: "banish",
        data: state.banish,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "hand",
        data: state.hand,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "cemetery",
        data: state.cemetery,
        room: state.room,
      });
    },
    placeToCemeteryFromHand: (state, action) => {
      const card = action.payload;
      const cardIndex = state.hand.indexOf(card);
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from hand`);
      state.cemetery = [card, ...state.cemetery];
      console.log(`Added ${card} to cemetery`);
      socket.emit("send msg", {
        type: "cemetery",
        data: state.cemetery,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "hand",
        data: state.hand,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "cemetery",
        data: state.cemetery,
        room: state.room,
      });
    },
    placeToFieldFromBanish: (state, action) => {
      const card = action.payload.card;
      const cardIndex = state.banish.indexOf(card);
      const newIndex = action.payload.index;
      state.banish = state.banish.filter((_, i) => i !== cardIndex);
      console.log(`Removed ${card} from banish`);
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      console.log(`Added ${card} to field`);
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "banish",
        data: state.banish,
        room: state.room,
      });
    },
    placeToBanishFromField: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newField = [
        ...state.field.slice(0, cardIndex),
        0,
        ...state.field.slice(cardIndex + 1),
      ];
      state.field = newField;
      console.log(`Removed ${card} from field`);
      state.banish = [card, ...state.banish];
      console.log(`Added ${card} to banished`);
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "banish",
        data: state.banish,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "evoField",
        data: state.evoField,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "evoDeck",
        data: state.evoDeck,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "evoField",
        data: state.evoField,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "evoDeck",
        data: state.evoDeck,
        room: state.room,
      });
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
      socket.emit("send msg", {
        type: "evoField",
        data: state.evoField,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "evoDeck",
        data: state.evoDeck,
        room: state.room,
      });
    },
    restoreEvoCard: (state, action) => {
      const card = action.payload;
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
      socket.emit("send msg", {
        type: "evoDeck",
        data: state.evoDeck,
        room: state.room,
      });
    },
    setField: (state, action) => {
      state.field = action.payload;
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
    setEnemyBanish: (state, action) => {
      state.enemyBanish = action.payload;
    },
    setEnemyEvoDeck: (state, action) => {
      state.enemyEvoDeck = action.payload;
    },
    setEnemyCustomValues: (state, action) => {
      state.enemyCustomValues = action.payload;
    },
    setEnemyLeader: (state, action) => {
      state.enemyLeader = action.payload;
    },
    setEnemyCounter: (state, action) => {
      state.enemyCounterField = action.payload;
    },
    setEnemyLeaderActive: (state, action) => {
      state.enemyLeaderActive = action.payload;
    },
    setLeaderActive: (state, action) => {
      state.leaderActive = action.payload;
    },
    reset: (state) => {
      state.deck = [];
      state.evoDeck = [];
      state.hand = [];
      state.enemyHand = [];
      state.showDice = false;
      state.enemyDice = { show: false, roll: 1 };
      state.showEnemyHand = false;
      state.showEnemyCard = false;
      state.enemyCard = "";
      state.enemyDeckSize = 0;
      state.enemyLeader = "";
      state.leader = "";
      state.evoPoints = 0;
      state.enemyEvoPoints = 0;
      state.playPoints = { available: 0, max: 0 };
      state.enemyPlayPoints = { available: 0, max: 0 };
      state.playerHealth = 20;
      state.enemyHealth = 20;
      state.field = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.evoField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.enemyField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.enemyEvoField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.counterField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.enemyCounterField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.currentCard = "";
      state.currentEvo = "";
      state.room = "";
      state.banish = [];
      state.enemyBanish = [];
      state.cemetery = [];
      state.enemyCemetery = [];
      state.enemyArrow = { idx: -1, show: false };
      state.enemyEvoDeck = [
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
      ];
      state.engagedField = [
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
      ];
      state.enemyEngagedField = [
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
      ];
      state.customValues = [
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
      ];
      state.enemyCustomValues = [
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
      ];
    },
  },
});

export const {
  drawFromDeck,
  drawFourFromDeck,
  placeToFieldFromHand,
  placeToFieldFromCemetery,
  placeToFieldFromBanish,
  addToHandFromDeck,
  addToHandFromField,
  addToHandFromCemetery,
  addToBanishFromCemetery,
  addToHandFromBanish,
  placeToTopOfDeckFromHand,
  placeToBotOfDeckFromHand,
  placeToTopOfDeckFromField,
  placeToBotOfDeckFromField,
  placeToCemeteryFromField,
  placeToCemeteryFromHand,
  placeTokenOnField,
  placeToBanishFromField,
  addToTopOfDeckFromDeck,
  addToBotOfDeckFromDeck,
  addToCemeteryFromDeck,
  addToCemeteryFromTopOfDeck,
  addToBanishFromDeck,
  removeTokenOnField,
  moveCardOnField,
  transferToOpponentField,
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
  setField,
  setEnemyField,
  setEnemyEvoField,
  setEnemyEngaged,
  setEngaged,
  clearEngagedAtIndex,
  moveEngagedAtIndex,
  clearCountersAtIndex,
  moveCountersAtIndex,
  setEnemyCemetery,
  setEnemyBanish,
  setEnemyEvoDeck,
  setEnemyCustomValues,
  showAtk,
  showDef,
  modifyAtk,
  hideAtk,
  hideDef,
  modifyDef,
  clearValuesAtIndex,
  moveValuesAtIndex,
  setDeck,
  setEvoDeck,
  setRoom,
  setEnemyHand,
  setEnemyDeckSize,
  setEnemyEvoPoints,
  setEnemyPlayPoints,
  setEnemyHealth,
  setEvoPoints,
  setPlayPoints,
  setHealth,
  setLeader,
  setEnemyLeader,
  setShowEnemyHand,
  setArrow,
  setEnemyArrow,
  setViewingDeck,
  setViewingTopCards,
  setViewingCemetery,
  setViewingEvoDeck,
  setViewingCemeteryOpponent,
  setViewingEvoDeckOpponent,
  setEnemyViewingDeck,
  setEnemyViewingHand,
  setEnemyViewingCemetery,
  setEnemyViewingEvoDeck,
  setEnemyViewingCemeteryOpponent,
  setEnemyViewingEvoDeckOpponent,
  setEnemyViewingTopCards,
  setEnemyCounter,
  modifyCounter,
  setShowEnemyCard,
  setEnemyCard,
  setDice,
  setShowDice,
  setEnemyDice,
  setEnemyLeaderActive,
  setLeaderActive,
  duplicateCardOnField,
  reset,
} = CardSlice.actions;
