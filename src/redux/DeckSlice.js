import { createSlice } from "@reduxjs/toolkit";

export const DeckSlice = createSlice({
  name: "deck",
  initialState: {
    decks: [],
  },
  reducers: {
    createDeck: (state, action) => {
      state.decks = [...state.decks, action.payload];
    },
    deleteDeck: (state, action) => {
      const name = action.payload;
      state.decks = state.decks.filter((x) => x.name !== name);
    },
  },
});

export const { createDeck } = DeckSlice.actions;
