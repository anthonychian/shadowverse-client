import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { CardSlice } from "./CardSlice";
import { DeckSlice } from "./DeckSlice";

import AsyncStorage from "@react-native-async-storage/async-storage";

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
  storage: AsyncStorage,
  blacklist: ["card"],
};
const rootReducer = combineReducers({
  card: CardSlice.reducer,
  deck: DeckSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;

export const persistor = persistStore(store);
