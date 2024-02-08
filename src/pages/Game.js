import React, { useRef, useState } from "react";
import "../css/Game.css";
import Selection from "../components/ui/Selection";
import PlayerUI from "../components/ui/PlayerUI";
import EnemyUI from "../components/ui/EnemyUI";
import Voicelines from "../components/ui/Voicelines";
import PlayPoints from "../components/ui/PlayPoints";
import Hand from "../components/hand/Hand";
import Field from "../components/field/Field";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import ZoomedCard from "../components/ui/ZoomedCard";
import initialWallpaper from "../../src/assets/wallpapers/forte.png";

export default function Game() {
  const [wallpaper, setWallpaper] = useState(initialWallpaper);
  const [selectedOption, setSelectedOption] = useState("Galmieux");
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
        minWidth: "100vw",
        background: "url(" + wallpaper + ") center center fixed",
        // background: "url(" + wallpaper + ") ",
        backgroundSize: "cover",
      }}
    >
      <Selection
        setSelectedOption={setSelectedOption}
        setWallpaper={setWallpaper}
      />
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
        <EnemyUI />
        <PlayerUI name={selectedOption} />
        {/* <Leader name={selectedOption} /> */}
        <Voicelines name={selectedOption} />
      </div>
    </div>
  );
}
