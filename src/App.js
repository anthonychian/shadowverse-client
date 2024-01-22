import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
// import {
//   CameraControls,
//   Environment,
//   Select,
// } from "@react-three/drei";
import React, { useRef, useState } from "react";
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
import Field from "./components/field/Field";
import CardActions from "./components/ui/CardActions";
import { motion } from "framer-motion";

function App() {
  let wallpaper = require("../src/assets//leaders/Cernunnos/Wallpaper.png");
  // let wallpaper = require("../src/assets/board.jpg");
  let leader = "Exella";
  const constraintsRef = useRef(null);
  const [ready, setReady] = useState(false);
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
      <motion.div
        onContextMenu={(e) => e.nativeEvent.preventDefault()}
        className={"fieldHand"}
        ref={constraintsRef}
      >
        <Field ready={ready} setReady={setReady} />
        <Hand
          constraintsRef={constraintsRef}
          ready={ready}
          setReady={setReady}
        />
      </motion.div>
      <div className={"scoreDeckEmotes"}>
        <Scoreboard name={leader} />
        {/* <CardDeck /> */}
        {/* <Deck /> */}
        <Leader name={leader} />
        <CardActions />
        <Voicelines name={leader} />
      </div>
    </div>
  );
}

export default App;

{
  /* <Canvas flat>
          <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} />
          <ambientLight intensity={0.1} />
          <directionalLight color="red" position={[0, 0, 5]} />
          <Gameboard />
          <Environment preset="dawn" background blur={1} />
          <PerspectiveCamera makeDefault position={[0, 0, 7.5]} />
        </Canvas> */
}
{
  /* <Field constraintsRef={constraintsRef} /> */
}
