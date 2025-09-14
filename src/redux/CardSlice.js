import { createSlice } from "@reduxjs/toolkit";
import { socket } from "../sockets";

export const CardSlice = createSlice({
  name: "card",
  initialState: {
    deck: [],
    evoDeck: [],
    initialDeck: [],
    initialEvoDeck: [],
    cardback: "",
    enemyCardback: "",
    hand: [],
    enemyHand: [],
    showDice: false,
    showEnemyHand: false,
    cardSelectedInHand: -1,
    enemyCardSelectedInHand: -1,
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
    rematchStatus: false,
    enemyRematchStatus: false,
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
    auraField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyAuraField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    baneField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyBaneField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    wardField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyWardField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    currentCard: "",
    currentCardIndex: -1,
    currentEvo: "",
    room: "",
    enemyOnlineStatus: true,
    activeUsers: 0,
    gameLog: [],
    chatLog: [],
    lastChatMessage: "",
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
    customStatus: [
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
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
    setRoom: (state, action) => {
      state.room = action.payload;
    },
    setDeck: (state, action) => {
      state.deck = action.payload;
      state.initialDeck = action.payload;
    },
    setPlayPoints: (state, action) => {
      state.playPoints = action.payload;
      socket.emit("send msg", {
        type: "playPoints",
        data: state.playPoints,
        room: state.room,
      });
    },
    setCardBack: (state, action) => {
      state.cardback = action.payload;
      socket.emit("send msg", {
        type: "cardback",
        data: state.cardback,
        room: state.room,
      });
    },
    setEnemyCardBack: (state, action) => {
      state.enemyCardback = action.payload;
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
    setRematchStatus: (state, action) => {
      state.rematchStatus = action.payload;
      socket.emit("send msg", {
        type: "rematch",
        data: state.rematchStatus,
        room: state.room,
      });
    },
    setEnemyRematchStatus: (state, action) => {
      state.enemyRematchStatus = action.payload;
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Rolled a dice and got ${action.payload.roll}`,
        },
      ];
      socket.emit("send msg", {
        type: "dice",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyDice: (state, action) => {
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.enemyDice = action.payload;
      if (state.enemyDice.show) {
        state.gameLog = [
          ...state.gameLog,
          {
            text: `[${date}] (Player 2): Rolled a dice and got ${action.payload.roll}`,
          },
        ];
      }
    },
    setCardSelectedInHand: (state, action) => {
      state.cardSelectedInHand = action.payload;
      const logIndex = (action.payload - state.enemyHand.length) * -1;
      socket.emit("send msg", {
        type: "cardSelected",
        data: action.payload,
        room: state.room,
      });
      if (action.payload !== -1) {
        const date = new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        });

        state.gameLog = [
          ...state.gameLog,
          {
            text: `[${date}] (Me): Selected card #${logIndex} in opponent's hand`,
          },
        ];
        socket.emit("send msg", {
          type: "log",
          data: {
            text: `Selected card #${logIndex} in your hand`,
          },
          room: state.room,
        });
      }
    },
    setEnemyCardSelectedInHand: (state, action) => {
      state.enemyCardSelectedInHand = action.payload;
    },
    setCardSelectedOnField: (state, action) => {
      state.cardSelectedOnField = action.payload;
      // const logIndex = (action.payload - state.enemyHand.length) * -1;
      socket.emit("send msg", {
        type: "cardSelectedField",
        data: action.payload,
        room: state.room,
      });
    },
    setEnemyCardSelectedOnField: (state, action) => {
      state.enemyCardSelectedOnField = action.payload;
    },
    setArrow: (state, action) => {
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
      state.initialEvoDeck = action.payload;
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
    setEnemyLog: (state, action) => {
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (action.payload.card) {
        state.gameLog = [
          ...state.gameLog,
          {
            text: `[${date}] (Player 2): ${action.payload.text}`,
            card: action.payload.card,
          },
        ];
      } else {
        state.gameLog = [
          ...state.gameLog,
          {
            text: `[${date}] (Player 2): ${action.payload.text}`,
          },
        ];
      }
    },
    setChat: (state, action) => {
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.chatLog = [...state.chatLog, `[${date}] (Me): ${action.payload}`];
      socket.emit("send msg", {
        type: "chat",
        data: `${action.payload}`,
        room: state.room,
      });
    },
    setEnemyChat: (state, action) => {
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.chatLog = [
        ...state.chatLog,
        `[${date}] (Player 2): ${action.payload}`,
      ];
    },
    setEnemyOnlineStatus: (state, action) => {
      state.enemyOnlineStatus = action.payload;
      console.log("Enemy online status:", action.payload);
    },
    setLastChatMessage: (state, action) => {
      state.lastChatMessage = action.payload;
      console.log("Enemy online status:", action.payload);
    },
    setViewingCardsLog: (state, action) => {
      let number = action.payload.number;
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Looked at top ${number} cards of deck`,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: {
          text: `Looked at top ${number} cards of deck`,
        },
        room: state.room,
      });
    },
    setViewingDeckLog: (state, action) => {
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Viewed deck`,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: {
          text: `Viewed deck`,
        },
        room: state.room,
      });
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
      // const date = new Date().toLocaleTimeString("it-IT", {
      //   hour: "2-digit",
      //   minute: "2-digit",
      // });

      // state.gameLog = [
      //   ...state.gameLog,
      //   {
      //     text: `[${date}] (Me): Set ${state.field[index]} counter to ${newValue}`,
      //   },
      // ];
      // socket.emit("send msg", {
      //   type: "log",
      //   data: { text: `Set ${state.field[index]} counter to ${newValue}` },
      //   room: state.room,
      // });
      socket.emit("send msg", {
        type: "counter",
        data: state.counterField,
        room: state.room,
      });
    },
    addAura: (state, action) => {
      let value = action.payload.value;
      let index = action.payload.index;
      const newField = [
        ...state.auraField.slice(0, index),
        value,
        ...state.auraField.slice(index + 1),
      ];
      state.auraField = newField;

      socket.emit("send msg", {
        type: "aura",
        data: state.auraField,
        room: state.room,
      });
    },
    addBane: (state, action) => {
      let value = action.payload.value;
      let index = action.payload.index;
      const newField = [
        ...state.baneField.slice(0, index),
        value,
        ...state.baneField.slice(index + 1),
      ];
      state.baneField = newField;

      socket.emit("send msg", {
        type: "bane",
        data: state.baneField,
        room: state.room,
      });
    },
    addWard: (state, action) => {
      let value = action.payload.value;
      let index = action.payload.index;
      const newField = [
        ...state.wardField.slice(0, index),
        value,
        ...state.wardField.slice(index + 1),
      ];
      state.wardField = newField;

      socket.emit("send msg", {
        type: "ward",
        data: state.wardField,
        room: state.room,
      });
    },
    drawFromDeck: (state) => {
      if (state.deck.length > 0) {
        const card = state.deck[0];
        state.deck = state.deck.slice(1);
        state.hand = [...state.hand, card];
        const date = new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        });

        state.gameLog = [
          ...state.gameLog,
          {
            text: `[${date}] (Me): (Draw) Added ${card} to hand`,
            card,
          },
        ];
        socket.emit("send msg", {
          type: "log",
          data: { text: `Draw 1 card` },
          room: state.room,
        });
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
      if (state.deck.length > 3) {
        for (let i = 0; i < 4; i++) {
          const card = state.deck[0];
          state.deck = state.deck.slice(1);
          state.hand = [...state.hand, card];
          const date = new Date().toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          });

          state.gameLog = [
            ...state.gameLog,
            {
              text: `[${date}] (Me): (Draw) Added ${card} to hand`,
              card,
            },
          ];
        }
        socket.emit("send msg", {
          type: "log",
          data: { text: `Draw 4 cards` },
          room: state.room,
        });
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
            state.deck = [...state.deck, card];
            const date = new Date().toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            });

            state.gameLog = [
              ...state.gameLog,
              {
                text: `[${date}] (Me): (Mulligan) Added ${card} to deck`,
                card,
              },
            ];
          }
        }
        socket.emit("send msg", {
          type: "log",
          data: { text: `Mulligan 4 cards` },
          room: state.room,
        });
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
    moveStatusAtIndex: (state, action) => {
      const prevIndex = action.payload.prevIndex;
      const index = action.payload.index;
      const prevStatus = state.customStatus[prevIndex];
      const prevAura = state.auraField[prevIndex];
      const prevBane = state.baneField[prevIndex];
      const prevWard = state.wardField[prevIndex];

      const newCustomStatus = [
        ...state.customStatus.slice(0, index),
        prevStatus,
        ...state.customStatus.slice(index + 1),
      ];
      state.customStatus = newCustomStatus;

      const newAuraField = [
        ...state.auraField.slice(0, index),
        prevAura,
        ...state.auraField.slice(index + 1),
      ];
      state.auraField = newAuraField;
      const newBaneField = [
        ...state.baneField.slice(0, index),
        prevBane,
        ...state.baneField.slice(index + 1),
      ];
      state.baneField = newBaneField;
      const newWardField = [
        ...state.wardField.slice(0, index),
        prevWard,
        ...state.wardField.slice(index + 1),
      ];
      state.wardField = newWardField;
    },
    clearStatusAtIndex: (state, action) => {
      let index = action.payload;
      const newCustomStatus = [
        ...state.customStatus.slice(0, index),
        false,
        ...state.customStatus.slice(index + 1),
      ];
      state.customStatus = newCustomStatus;
      const newAuraField = [
        ...state.auraField.slice(0, index),
        0,
        ...state.auraField.slice(index + 1),
      ];
      state.auraField = newAuraField;
      const newBaneField = [
        ...state.baneField.slice(0, index),
        0,
        ...state.baneField.slice(index + 1),
      ];
      state.baneField = newBaneField;
      const newWardField = [
        ...state.wardField.slice(0, index),
        0,
        ...state.wardField.slice(index + 1),
      ];
      state.wardField = newWardField;
      socket.emit("send msg", {
        type: "aura",
        data: state.auraField,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "bane",
        data: state.baneField,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "ward",
        data: state.wardField,
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
    showStatus: (state, action) => {
      let index = action.payload;
      const newCustomStatus = [
        ...state.customStatus.slice(0, index),
        true,
        ...state.customStatus.slice(index + 1),
      ];
      state.customStatus = newCustomStatus;
    },
    hideStatus: (state, action) => {
      let index = action.payload;
      const newCustomStatus = [
        ...state.customStatus.slice(0, index),
        false,
        ...state.customStatus.slice(index + 1),
      ];
      state.customStatus = newCustomStatus;
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to field`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to field`, card },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
    },
    setCurrentCard: (state, action) => {
      state.currentCard = action.payload;
    },
    setCurrentCardIndex: (state, action) => {
      state.currentCardIndex = action.payload;
    },
    setCurrentEvo: (state, action) => {
      state.currentCard = action.payload;
    },
    shuffleDeck: (state) => {
      function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
      }
      state.deck = shuffleDeck(state.deck);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Shuffled deck`,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Shuffled deck` },
        room: state.room,
      });
    },
    placeToTopOfDeckFromHand: (state, action) => {
      const card = action.payload.name;
      const cardIndex = action.payload.index;
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.deck = [card, ...state.deck];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to top of deck from hand`,
          card,
        },
      ];

      socket.emit("send msg", {
        type: "log",
        data: { text: `Added 1 card to top of deck from hand` },
        room: state.room,
      });
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
      const card = action.payload.name;
      const cardIndex = action.payload.index;
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.deck = [...state.deck, card];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to bot of deck from hand`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added 1 card to bot of deck from hand` },
        room: state.room,
      });
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
    placeToTopOfDeckFromCemetery: (state, action) => {
      const card = action.payload.name;
      const cardIndex = action.payload.index;
      state.cemetery = state.cemetery.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.deck = [card, ...state.deck];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to top of deck from cemetery`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to top of deck from cemetery`, card },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "cemetery",
        data: state.cemetery,
        room: state.room,
      });
    },
    placeToBotOfDeckFromCemetery: (state, action) => {
      const card = action.payload.name;
      const cardIndex = action.payload.index;
      state.cemetery = state.cemetery.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.deck = [...state.deck, card];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to bot of deck from cemetery`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to bot of deck from cemetery`, card },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "cemetery",
        data: state.cemetery,
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.deck = [card, ...state.deck];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to top of deck from field`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to top of deck from field`, card },
        room: state.room,
      });
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.deck = [...state.deck, card];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to bot of deck from field`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to bot of deck from field`, card },
        room: state.room,
      });
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to field`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to field`, card },
        room: state.room,
      });
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Removed ${card} from field`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Removed ${card} from field`, card },
        room: state.room,
      });
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
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Moved ${card} on field`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Moved ${card} on field`, card },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
    },
    moveEvoAndBaseOnField: (state, action) => {
      // console.log(action.payload.card);
      // console.log(action.payload.evoCard);
      // base
      const card = state.field[action.payload.prevIndex];
      const prevIndex = action.payload.prevIndex;
      const newIndex = action.payload.index;
      const field = [
        ...state.field.slice(0, prevIndex),
        0,
        ...state.field.slice(prevIndex + 1),
      ];
      state.field = field;
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;
      // evo
      const evoCard = action.payload.evoCard;
      const evoField = [
        ...state.evoField.slice(0, prevIndex),
        0,
        ...state.evoField.slice(prevIndex + 1),
      ];
      state.evoField = evoField;
      const newEvoField = [
        ...state.evoField.slice(0, newIndex),
        evoCard,
        ...state.evoField.slice(newIndex + 1),
      ];
      state.evoField = newEvoField;
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Moved ${evoCard} on field`,
          card: evoCard,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Moved ${evoCard} on field`, card: evoCard },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "evoField",
        data: state.evoField,
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
        const date = new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        });

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

        state.gameLog = [
          ...state.gameLog,
          {
            text: `[${date}] (Me): Transfered ${card} to enemy field`,
            card,
          },
        ];
        socket.emit("send msg", {
          type: "log",
          data: { text: `Transfered ${card} to your field`, card },
          room: state.room,
        });
        socket.emit("send msg", {
          type: "field",
          data: state.field,
          room: state.room,
        });
        socket.emit("send msg", {
          type: "transfer",
          data: state.enemyField,
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to field from deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to field from deck`, card },
        room: state.room,
      });
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
      state.deck = [card, ...state.deck];
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Moved ${card} to top of deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Moved 1 card to top of deck` },
        room: state.room,
      });
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
      state.deck = [...state.deck, card];
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Moved ${card} to bot of deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Moved 1 card to bot of deck` },
        room: state.room,
      });
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.cemetery = [card, ...state.cemetery];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to cemetery from deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to cemetery from deck`, card },
        room: state.room,
      });
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
      state.cemetery = [card, ...state.cemetery];
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Milled ${card} to cemetery`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Milled ${card} to cemetery`, card },
        room: state.room,
      });
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.banish = [card, ...state.banish];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Banished ${card} from deck`,
          card,
        },
      ];

      socket.emit("send msg", {
        type: "log",
        data: { text: `Banished ${card} from deck`, card },
        room: state.room,
      });
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.hand = [...state.hand, card];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to hand from deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to hand from deck`, card },
        room: state.room,
      });
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
    addToHandFromDeckWithoutRevealing: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newDeck = state.deck.filter((_, i) => i !== cardIndex);
      state.deck = newDeck;
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.hand = [...state.hand, card];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to hand from deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added 1 card to hand from deck`, card: "Card" },
        room: state.room,
      });
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.hand = [...state.hand, card];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to hand from field`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to hand from field`, card },
        room: state.room,
      });
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
      const cardIndex = action.payload.indexInHand;
      const newIndex = action.payload.index;
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to field from hand`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to field from hand`, card },
        room: state.room,
      });
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
    addToHandFromCemetery: (state, action) => {
      const card = action.payload.name;
      const cardIndex = action.payload.index;
      state.cemetery = state.cemetery.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.hand = [...state.hand, card];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to hand from cemetery`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to hand from cemetery`, card },
        room: state.room,
      });
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
      const card = action.payload.name;
      const cardIndex = action.payload.index;
      state.cemetery = state.cemetery.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.banish = [card, ...state.banish];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Banished ${card} from cemetery`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Banished ${card} from cemetery`, card },
        room: state.room,
      });
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
      const card = action.payload.name;
      const cardIndex = action.payload.index;
      state.banish = state.banish.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.hand = [...state.hand, card];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to hand from banished`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to hand from banished`, card },
        room: state.room,
      });
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.cemetery = [card, ...state.cemetery];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to cemetery from field`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to cemetery from field`, card },
        room: state.room,
      });
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
    shuffleCards: (state, action) => {
      function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
      }
      state.hand = shuffleDeck(state.hand);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Shuffled cards in hand`,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Shuffled cards in hand` },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "hand",
        data: state.hand,
        room: state.room,
      });
    },
    placeToCemeteryFromHand: (state, action) => {
      const card = action.payload.name;
      const cardIndex = action.payload.index;
      state.hand = state.hand.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Discarded ${card} (#${
            cardIndex + 1
          }) from hand`,
          card,
        },
      ];
      state.cemetery = [card, ...state.cemetery];

      socket.emit("send msg", {
        type: "log",
        data: { text: `Discarded ${card} (#${cardIndex + 1}) from hand`, card },
        room: state.room,
      });

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
    placeToFieldFromDeck: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.deckIndex;
      const newIndex = action.payload.index;
      state.deck = state.deck.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to field from deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to field from deck`, card },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
    },
    placeToFieldFromCemetery: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.indexInHand;
      const newIndex = action.payload.index;
      state.cemetery = state.cemetery.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to field from cemetery`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to field from cemetery`, card },
        room: state.room,
      });
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
      const cardIndex = action.payload.indexInHand;
      const newIndex = action.payload.index;
      state.banish = state.banish.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to field from banished`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to field from banished`, card },
        room: state.room,
      });
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
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.banish = [card, ...state.banish];

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Banished ${card} from field`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Banished ${card} from field`, card },
        room: state.room,
      });
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
      const cardIndex = action.payload.indexInEvolveDeck;
      state.evoDeck = state.evoDeck.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newField = [
        ...state.evoField.slice(0, newIndex),
        card,
        ...state.evoField.slice(newIndex + 1),
      ];
      state.evoField = newField;

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Evolved to ${card}`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Evolved to ${card}`, card },
        room: state.room,
      });
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
      // const card = action.payload.card;
      const newIndex = action.payload.index;
      const carrots = action.payload.carrots;
      const cardIndex = action.payload.indexInEvolveDeck;

      state.evoDeck = state.evoDeck.filter((_, i) => i !== cardIndex);
      if (carrots === 1) {
        const newField = [
          ...state.evoField.slice(0, newIndex),
          "Carrot-1",
          ...state.evoField.slice(newIndex + 1),
        ];
        state.evoField = newField;
      } else {
        const numOfCarrots = Number(state.evoField[newIndex].slice(-1));
        console.log("numOfCarrots", numOfCarrots);
        const newField = [
          ...state.evoField.slice(0, newIndex),
          `Carrot-${numOfCarrots + 1}`,
          ...state.evoField.slice(newIndex + 1),
        ];
        state.evoField = newField;
      }
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Fed ${state.field[newIndex]} 1 Carrot`,
          // card: card,
          card: state.field[newIndex],
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: {
          text: `Fed ${state.field[newIndex]} 1 Carrot`,
          card: state.field[newIndex],
        },
        room: state.room,
      });
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
    rideCardOnField: (state, action) => {
      const newIndex = action.payload.index;
      const cardIndex = action.payload.indexInEvolveDeck;

      state.evoDeck = state.evoDeck.filter((_, i) => i !== cardIndex);

      const newField = [
        ...state.evoField.slice(0, newIndex),
        "Drive Point",
        ...state.evoField.slice(newIndex + 1),
      ];
      state.evoField = newField;

      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Ride ${state.field[newIndex]}`,
          card: state.field[newIndex],
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: {
          text: `Ride ${state.field[newIndex]}`,
          card: state.field[newIndex],
        },
        room: state.room,
      });
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
    advancedToField: (state, action) => {
      const card = action.payload.card;
      const newIndex = action.payload.index;
      const cardIndex = action.payload.indexInEvolveDeck;
      state.evoDeck = state.evoDeck.filter((_, i) => i !== cardIndex);
      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newField = [
        ...state.field.slice(0, newIndex),
        card,
        ...state.field.slice(newIndex + 1),
      ];
      state.field = newField;

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Added ${card} to field from evolve deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Added ${card} to field from evolve deck`, card },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "field",
        data: state.field,
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

      if (card.slice(0, 6) === "Carrot") {
        const numOfCarrots = Number(card.slice(-1));
        for (let i = 0; i < numOfCarrots; i++)
          state.evoDeck = [...state.evoDeck, { card: "Carrot", status: true }];
      } else {
        state.evoDeck = [...state.evoDeck, { card: card, status: true }];
      }

      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Returned ${card} to evolve deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Returned ${card} to evolve deck`, card },
        room: state.room,
      });
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
    advancedBackToEvolveDeck: (state, action) => {
      const card = action.payload.card;
      const cardIndex = action.payload.index;
      const newField = [
        ...state.field.slice(0, cardIndex),
        0,
        ...state.field.slice(cardIndex + 1),
      ];
      state.field = newField;

      state.evoDeck = [...state.evoDeck, { card: card, status: true }];

      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Returned ${card} to evolve deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Returned ${card} to evolve deck`, card },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "field",
        data: state.field,
        room: state.room,
      });
      socket.emit("send msg", {
        type: "evoDeck",
        data: state.evoDeck,
        room: state.room,
      });
    },
    flipEvoCard: (state, action) => {
      const card = action.payload.name;
      const idx = action.payload.idx;
      const status = action.payload.status;

      state.evoDeck = state.evoDeck.filter((_, i) => i !== idx);

      state.evoDeck = [
        ...state.evoDeck.slice(0, idx),
        {
          card: card,
          status: !status,
        },
        ...state.evoDeck.slice(idx),
      ];

      const date = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      state.gameLog = [
        ...state.gameLog,
        {
          text: `[${date}] (Me): Flipped ${card} in evolve deck`,
          card,
        },
      ];
      socket.emit("send msg", {
        type: "log",
        data: { text: `Flipped ${card} in evolve deck`, card },
        room: state.room,
      });
      socket.emit("send msg", {
        type: "evoDeck",
        data: state.evoDeck,
        room: state.room,
      });
    },
    switchEvoCard: (state, action) => {
      const card = action.payload.name;
      const idx = action.payload.idx;
      let newCard;
      if (card === "Orchis, Resolute Puppet")
        newCard = "Orchis, Vengeful Puppet";
      else if (card === "Orchis, Vengeful Puppet")
        newCard = "Orchis, Resolute Puppet";
      else if (card === "Paula, Gentle Warmth")
        newCard = "Paula, Passionate Warmth";
      else if (card === "Paula, Passionate Warmth")
        newCard = "Paula, Gentle Warmth";
      else if (card === "Celia, Hope's Strategist")
        newCard = "Celia, Despair's Messenger";
      else if (card === "Celia, Despair's Messenger")
        newCard = "Celia, Hope's Strategist";
      else if (card === "Mysterian Whitewyrm") newCard = "Mysterian Blackwyrm";
      else if (card === "Mysterian Blackwyrm") newCard = "Mysterian Whitewyrm";
      else if (card === "Virtuous Lindworm") newCard = "Iniquitous Lindworm";
      else if (card === "Iniquitous Lindworm") newCard = "Virtuous Lindworm";
      else if (card === "Vania, Kind Queen") newCard = "Vania, Blood Queen";
      else if (card === "Vania, Blood Queen") newCard = "Vania, Kind Queen";
      else if (card === "Ceryneian Lighthind") newCard = "Ceryneian Darkhind";
      else if (card === "Ceryneian Darkhind") newCard = "Ceryneian Lighthind";

      state.evoDeck[idx].card = newCard;
    },
    createLessonTokens: (state) => {
      let cardsInEX = false;

      for (let i = 6; i < 10; i++) {
        if (state.field[i] !== 0) {
          cardsInEX = true;
          break;
        }
      }
      if (!cardsInEX) {
        let card;
        let chance = Math.random();
        if (chance < 0.2 && chance > 0.1) card = "Enchanted Slippers TOKEN";
        else if (chance <= 0.1) card = "Enchanted Dress TOKEN";
        else card = "Cool Earrings TOKEN";

        const newField = [
          ...state.field.slice(0, 5),
          card,
          card,
          card,
          card,
          card,
        ];

        state.field = newField;
        const date = new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        });
        for (let i = 0; i < 5; i++) {
          state.gameLog = [
            ...state.gameLog,
            {
              text: `[${date}] (Me): Added ${card} to field`,
              card,
            },
          ];
          socket.emit("send msg", {
            type: "log",
            data: { text: `Added ${card} to field`, card },
            room: state.room,
          });
        }
        socket.emit("send msg", {
          type: "field",
          data: state.field,
          room: state.room,
        });
      }
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
    setEnemyAura: (state, action) => {
      state.enemyAuraField = action.payload;
    },
    setEnemyBane: (state, action) => {
      state.enemyBaneField = action.payload;
    },
    setEnemyWard: (state, action) => {
      state.enemyWardField = action.payload;
    },
    setEnemyLeaderActive: (state, action) => {
      state.enemyLeaderActive = action.payload;
    },
    setLeaderActive: (state, action) => {
      state.leaderActive = action.payload;
    },
    exitGame: (state) => {
      state.room = "";
      state.enemyOnlineStatus = true;
      state.gameLog = [];
      state.chatLog = [];
      state.lastChatMessage = "";
      state.deck = [];
      state.evoDeck = [];
      state.hand = [];
      state.enemyHand = [];
      state.cardSelectedInHand = -1;
      state.enemyCardSelectedInHand = -1;
      state.cardSelectedOnField = -1;
      state.enemyCardSelectedOnField = -1;
      state.showDice = false;
      state.enemyDice = { show: false, roll: 1 };
      state.showEnemyHand = false;
      state.showEnemyCard = false;
      state.enemyCard = "";
      state.enemyDeckSize = 0;
      state.enemyLeader = "";
      state.leaderActive = false;
      state.enemyLeaderActive = false;
      state.cardback = "";
      state.enemyCardback = "";
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
      state.rematchStatus = false;
      state.enemyRematchStatus = false;
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
    reset: (state) => {
      state.deck = state.initialDeck;
      state.deck = state.deck.toSorted(() => Math.random() - 0.5);
      state.evoDeck = state.initialEvoDeck;
      state.hand = [];
      state.enemyHand = [];
      state.showDice = false;
      state.enemyDice = { show: false, roll: 1 };
      state.showEnemyHand = false;
      state.showEnemyCard = false;
      state.enemyCard = "";
      state.cardSelectedInHand = -1;
      state.enemyCardSelectedInHand = -1;
      state.cardSelectedOnField = -1;
      state.enemyCardSelectedOnField = -1;
      state.enemyDeckSize = 0;
      state.leaderActive = false;
      state.enemyLeaderActive = false;
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
      state.rematchStatus = false;
      state.enemyRematchStatus = false;
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
  placeToFieldFromDeck,
  placeToFieldFromCemetery,
  placeToFieldFromBanish,
  addToHandFromDeck,
  addToHandFromDeckWithoutRevealing,
  addToHandFromField,
  addToHandFromCemetery,
  addToBanishFromCemetery,
  addToHandFromBanish,
  placeToTopOfDeckFromHand,
  placeToBotOfDeckFromHand,
  placeToTopOfDeckFromCemetery,
  placeToBotOfDeckFromCemetery,
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
  moveEvoAndBaseOnField,
  transferToOpponentField,
  mulliganFour,
  setCurrentCard,
  setCurrentCardIndex,
  setCurrentEvo,
  shuffleDeck,
  evolveCardOnField,
  feedCardOnField,
  rideCardOnField,
  advancedToField,
  backToEvolveDeck,
  advancedBackToEvolveDeck,
  flipEvoCard,
  switchEvoCard,
  setField,
  setEnemyField,
  setEnemyEvoField,
  setEnemyEngaged,
  setEngaged,
  clearEngagedAtIndex,
  moveEngagedAtIndex,
  clearCountersAtIndex,
  moveCountersAtIndex,
  clearStatusAtIndex,
  moveStatusAtIndex,
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
  setActiveUsers,
  setEnemyHand,
  setEnemyDeckSize,
  setEnemyEvoPoints,
  setEnemyPlayPoints,
  setEnemyHealth,
  setEnemyLog,
  setChat,
  setEnemyOnlineStatus,
  setLastChatMessage,
  setEnemyChat,
  setViewingCardsLog,
  setViewingDeckLog,
  setEvoPoints,
  setPlayPoints,
  setHealth,
  setLeader,
  setCardBack,
  setEnemyCardBack,
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
  setEnemyAura,
  setEnemyBane,
  setEnemyWard,
  setCardSelectedInHand,
  setEnemyCardSelectedInHand,
  setCardSelectedOnField,
  setEnemyCardSelectedOnField,
  modifyCounter,
  addAura,
  addBane,
  addWard,
  showStatus,
  hideStatus,
  setShowEnemyCard,
  setEnemyCard,
  setDice,
  setShowDice,
  setEnemyDice,
  setEnemyLeaderActive,
  setLeaderActive,
  duplicateCardOnField,
  reset,
  exitGame,
  setRematchStatus,
  setEnemyRematchStatus,
  createLessonTokens,
  shuffleCards,
} = CardSlice.actions;
