import { createSlice } from "@reduxjs/toolkit";

// Two deck lists, one active at a time:
// - `decks`: the guest list, persisted to localStorage (the pre-login
//   behavior, unchanged).
// - `cloudDecks`: the logged-in user's list, mirrored to Supabase by the
//   AuthProvider. `null` means logged out; an array (even empty) means cloud
//   mode is active and createDeck/deleteDeck write to it instead of `decks`.
// The two never merge — logging out returns you to your untouched local list.
export const DeckSlice = createSlice({
  name: "deck",
  initialState: {
    decks: [],
    cloudDecks: null,
  },
  reducers: {
    createDeck: (state, action) => {
      if (state.cloudDecks !== null)
        state.cloudDecks = [...state.cloudDecks, action.payload];
      else state.decks = [...state.decks, action.payload];
    },
    deleteDeck: (state, action) => {
      const name = action.payload;
      if (state.cloudDecks !== null)
        state.cloudDecks = state.cloudDecks.filter((x) => x.name !== name);
      else state.decks = state.decks.filter((x) => x.name !== name);
    },
    setCloudDecks: (state, action) => {
      state.cloudDecks = action.payload;
    },
  },
});

export const { createDeck, deleteDeck, setCloudDecks } = DeckSlice.actions;

// The list the UI should show: cloud when logged in, local otherwise.
export const selectDecks = (state) =>
  state.deck.cloudDecks !== null ? state.deck.cloudDecks : state.deck.decks;
