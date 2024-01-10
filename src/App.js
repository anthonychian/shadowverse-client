import { Canvas } from "@react-three/fiber";
import {
  CameraControls,
  PerspectiveCamera,
  Environment,
  Select,
} from "@react-three/drei";
import React from "react";
import "./App.css";
import Gameboard from "./components/Gameboard";
import Card from "./components/Card";
import Selection from "./components/Selection";
import Leader from "./components/Leader";
import Scoreboard from "./components/Scoreboard";
import Voicelines from "./components/Voicelines";
import PlayPoints from "./components/PlayPoints";

function App() {
  let wallpaper = require("../src/assets//leaders/Cernunnos/Wallpaper.png");
  // let wallpaper = require("../src/assets/board.jpg");

  return (
    <div
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      className={"canvas"}
      style={{
        background: "url(" + wallpaper + ") no-repeat center center fixed",
        backgroundSize: "cover",
      }}
    >
      {/* <Leader name={"Forte"} /> */}

      <PlayPoints name={"Exella"} />

      <Canvas flat>
        {/* <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} /> */}
        {/* <ambientLight intensity={0.1} /> */}
        <directionalLight color="red" position={[0, 0, 5]} />
        {/* <Gameboard /> */}

        <Card idx={1} cardName="Bellringer Angel" />
        <Card idx={2} cardName="Dragon Oracle" />
        <Card idx={3} cardName="Dragon Warrior" />
        <Card idx={4} cardName="Shenlong" />
        <Card idx={5} cardName="Aiela, Dragon Knight" />
        {/* <Card pos={6}/> */}
        {/* <Environment preset="dawn" background blur={1} /> */}
        <PerspectiveCamera makeDefault position={[0, 0, 7.5]} />
      </Canvas>
      <Voicelines name={"Exella"} />
      <Scoreboard name={"Exella"} />
    </div>
  );
}

export default App;
