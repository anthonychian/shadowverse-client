import React, { useRef, useState } from "react";
import "./App.css";
import Selection from "./components/ui/Selection";
import Leader from "./components/ui/Leader";
import Scoreboard from "./components/ui/Scoreboard";
import Voicelines from "./components/ui/Voicelines";
import PlayPoints from "./components/ui/PlayPoints";
import Hand from "./components/hand/Hand";
import Field from "./components/field/Field";
import CardActions from "./components/ui/CardActions";
import { motion } from "framer-motion";

function App() {
  let wallpaper = require("../src/assets/wallpapers/forteEvo.png");
  const [selectedOption, setSelectedOption] = useState("Exella");
  const constraintsRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [readyToPlaceOnFieldFromHand, setReadyToPlaceOnFieldFromHand] =
    useState(false);
  return (
    <div
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      className={"canvas"}
      style={{
        background: "url(" + wallpaper + ") center center fixed",
        // background: "url(" + wallpaper + ") no-repeat center center fixed",
        backgroundSize: "cover",
      }}
    >
      <PlayPoints name={selectedOption} />
      <motion.div
        onContextMenu={(e) => e.nativeEvent.preventDefault()}
        className={"fieldHand"}
        ref={constraintsRef}
      >
        <Field
          ready={ready}
          setReady={setReady}
          readyToPlaceOnFieldFromHand={readyToPlaceOnFieldFromHand}
          setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
        />
        <Hand
          constraintsRef={constraintsRef}
          setReady={setReady}
          setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
        />
      </motion.div>
      <div className={"scoreDeckEmotes"}>
        <Scoreboard name={selectedOption} />
        <Selection setSelectedOption={setSelectedOption} />

        <Leader name={selectedOption} />
        <CardActions />
        <Voicelines name={selectedOption} />
      </div>
    </div>
  );
}

export default App;
