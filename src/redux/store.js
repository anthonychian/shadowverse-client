import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { CardSlice } from "./CardSlice";
import { DeckSlice } from "./DeckSlice";

import storage from "redux-persist/lib/storage";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const persistConfig = {
  key: "root",
  storage: storage,
  blacklist: ["card"],
};
const rootReducer = combineReducers({
  card: CardSlice.reducer,
  deck: DeckSlice.reducer,
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
