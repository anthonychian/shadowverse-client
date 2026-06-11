import { createSlice } from "@reduxjs/toolkit";

export const GameStateSlice = createSlice({
  name: "gameState",
  initialState: {
    gameMode: "manual",
    engineView: null,
    playerSlot: null,
    pendingChoices: null,
    legalActions: [],
    enginePhase: null,
    engineWinner: null,
    instanceMap: {},
    selectedAttackerId: null,
    lastSeq: 0,
    uiChromeHidden: false,
  },
  reducers: {
    setGameMode: (state, action) => {
      state.gameMode = action.payload;
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("sve_game_mode", action.payload);
      }
    },
    setPlayerSlot: (state, action) => {
      state.playerSlot = action.payload;
    },
    setEngineView: (state, action) => {
      const { view, seq, force } = action.payload;
      const freshMulligan =
        view?.state?.phase === "mulligan" && view?.state?.turnNumber === 0;
      if (!force && !freshMulligan && seq != null && seq <= state.lastSeq) return;
      state.engineView = view;
      if (view?.self != null) state.playerSlot = view.self;
      state.pendingChoices = view?.state?.pendingChoices ?? null;
      state.legalActions = view?.legalActions ?? [];
      state.enginePhase = view?.state?.phase ?? null;
      state.engineWinner = view?.state?.winner ?? null;
      state.selectedAttackerId = null;
      if (seq != null) state.lastSeq = seq;
    },
    setInstanceMap: (state, action) => {
      state.instanceMap = action.payload;
    },
    setSelectedAttackerId: (state, action) => {
      state.selectedAttackerId = action.payload;
    },
    setUiChromeHidden: (state, action) => {
      state.uiChromeHidden = action.payload;
    },
    resetEngine: (state) => {
      state.engineView = null;
      state.pendingChoices = null;
      state.legalActions = [];
      state.enginePhase = null;
      state.engineWinner = null;
      state.instanceMap = {};
      state.selectedAttackerId = null;
      state.lastSeq = 0;
      state.uiChromeHidden = false;
    },
  },
});

export const {
  setGameMode,
  setPlayerSlot,
  setEngineView,
  setInstanceMap,
  setSelectedAttackerId,
  setUiChromeHidden,
  resetEngine,
} =
  GameStateSlice.actions;
