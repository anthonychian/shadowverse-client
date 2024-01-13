import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
// import {
//   CameraControls,
//   Environment,
//   Select,
// } from "@react-three/drei";
import React from "react";
import "./App.css";
import Gameboard from "./components/field/Gameboard";
import Card from "./components/field/Card";
// import Selection from "./components/ui/Selection";
import Leader from "./components/ui/Leader";
import Scoreboard from "./components/ui/Scoreboard";
import Voicelines from "./components/ui/Voicelines";
import PlayPoints from "./components/ui/PlayPoints";
import Hand from "./components/hand/Hand";
import Deck from "./components/field/Deck";
// import CardDeck from "./components/deck/Deck";
import CardActions from "./components/ui/CardActions";

function App() {
  let wallpaper = require("../src/assets//leaders/Cernunnos/Wallpaper.png");
  // let wallpaper = require("../src/assets/board.jpg");
  let leader = "Exella";

  return (
    <div
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      className={"canvas"}
      style={{
        background: "url(" + wallpaper + ") no-repeat center center fixed",
        backgroundSize: "cover",
      }}
    >
      <PlayPoints name={leader} />
      <div
        onContextMenu={(e) => e.nativeEvent.preventDefault()}
        className={"fieldHand"}
      >
        <Canvas flat>
          {/* <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} /> */}
          {/* <ambientLight intensity={0.1} /> */}
          {/* <directionalLight color="red" position={[0, 0, 5]} /> */}
          <Gameboard />

          <Card idx={1} cardName="Bellringer Angel" />
          <Card idx={2} cardName="Dragon Oracle" />
          <Card idx={3} cardName="Dragon Warrior" />
          <Card idx={4} cardName="Shenlong" />
          <Card idx={5} cardName="Aiela, Dragon Knight" />

          {/* <Environment preset="dawn" background blur={1} /> */}
          <PerspectiveCamera makeDefault position={[0, 0, 7.5]} />
        </Canvas>
        <Leader name={leader} />
        <Hand />
      </div>
      <div className={"scoreDeckEmotes"}>
        <Scoreboard name={leader} />
        {/* <CardDeck /> */}
        <Deck />
        <CardActions />
        <Voicelines name={leader} />
      </div>
    </div>
  );
}

export default App;
