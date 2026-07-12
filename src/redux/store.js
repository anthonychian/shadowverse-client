import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { CardSlice } from "./CardSlice";
import { DeckSlice } from "./DeckSlice";
import { GameStateSlice } from "./GameStateSlice";

import storage from "redux-persist/lib/storage";

import {
  persistReducer,
  persistStore,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import renamedCards from "../decks/renamedCards.json";

// Official EN releases sometimes rename cards we first imported under
// community translations (e.g. most of BP18). Saved decks reference cards by
// name, so rewrite any renamed card when a persisted deck is rehydrated; the
// `art` printing map is keyed by name too. Card numbers are unaffected.
const renameCard = (n) => renamedCards[n] || n;
const migrateRenamedCards = createTransform(
  null,
  (outbound) => ({
    ...outbound,
    decks: (outbound.decks || []).map((d) => ({
      ...d,
      deck: (d.deck || []).map(renameCard),
      evoDeck: (d.evoDeck || []).map(renameCard),
      art: d.art
        ? Object.fromEntries(
            Object.entries(d.art).map(([n, no]) => [renameCard(n), no])
          )
        : d.art,
    })),
  }),
  { whitelist: ["deck"] }
);

const persistConfig = {
  key: "root",
  storage: storage,
  blacklist: ["card", "gameState"],
  transforms: [migrateRenamedCards],
};
const rootReducer = combineReducers({
  card: CardSlice.reducer,
  deck: DeckSlice.reducer,
  gameState: GameStateSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Dev/test affordance: expose the store on window when running on localhost so
// end-to-end tests (Playwright) can read the exact rehydrated state the UI
// renders from. No-op in production builds served from any other host.
if (
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
) {
  window.__REDUX_STORE__ = store;
}
