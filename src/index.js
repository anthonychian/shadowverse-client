import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Loader } from "@react-three/drei";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <App />
    <Loader />
  </>
);
