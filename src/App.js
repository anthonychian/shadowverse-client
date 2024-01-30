import React, { useRef, useState } from "react";
import "./App.css";
import Selection from "./components/ui/Selection";
import Leader from "./components/ui/Leader";
import Scoreboard from "./components/ui/Scoreboard";
import Voicelines from "./components/ui/Voicelines";
import PlayPoints from "./components/ui/PlayPoints";
import Hand from "./components/hand/Hand";
import Field from "./components/field/Field";
// import CardActions from "./components/ui/CardActions";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import ZoomedCard from "./components/ui/ZoomedCard";
import initialWallpaper from "../src/assets/wallpapers/forteEvo.png";

function App() {
  const [wallpaper, setWallpaper] = useState(initialWallpaper);
  const [selectedOption, setSelectedOption] = useState("Exella");
  const constraintsRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [readyToPlaceOnFieldFromHand, setReadyToPlaceOnFieldFromHand] =
    useState(false);
  const reduxCurrentCard = useSelector((state) => state.card.currentCard);

  return (
    <div
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      className={"canvas"}
      style={{
        minHeight: "100vh",
        background: "url(" + wallpaper + ") center center fixed",
        // background: "url(" + wallpaper + ") no-repeat center center fixed",
        backgroundSize: "cover",
      }}
    >
      {/* Left side  */}
      <div className={"leftSideCanvas"}>
        <ZoomedCard name={reduxCurrentCard} hovering={hovering} />
        <PlayPoints name={selectedOption} />
      </div>

      {/* Center Field */}
      <motion.div
        onContextMenu={(e) => e.nativeEvent.preventDefault()}
        className={"centerCanvas"}
        ref={constraintsRef}
      >
        <Field
          dragging={dragging}
          ready={ready}
          setReady={setReady}
          setHovering={setHovering}
          readyToPlaceOnFieldFromHand={readyToPlaceOnFieldFromHand}
          setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
        />
        <Hand
          setDragging={setDragging}
          setHovering={setHovering}
          constraintsRef={constraintsRef}
          ready={ready}
          setReady={setReady}
          setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
        />
      </motion.div>

      {/* Right side */}
      <div className={"rightSideCanvas"}>
        <Scoreboard name={selectedOption} />
        <Selection
          setSelectedOption={setSelectedOption}
          setWallpaper={setWallpaper}
        />
        <Leader name={selectedOption} />
        <Voicelines name={selectedOption} />
      </div>
    </div>
  );
}

export default App;
