import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Loader } from "@react-three/drei";
import "./index.css";
import { Provider } from "react-redux";
import { persistor, store } from "../src/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider } from "./auth/AuthProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PersistGate>
    </Provider>
    <Loader />
  </>
);
