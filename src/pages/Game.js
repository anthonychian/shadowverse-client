import React, { useRef, useState, useEffect } from "react";
import "../css/Game.css";
import Selection from "../components/ui/Selection";
import PlayerUI from "../components/ui/PlayerUI";
import EnemyUI from "../components/ui/EnemyUI";
import ChatUI from "../components/ui/ChatUI";
import PlayPoints from "../components/ui/PlayPoints";
import Hand from "../components/hand/Hand";
import Field from "../components/field/Field";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import ZoomedCard from "../components/ui/ZoomedCard";
import initialWallpaper from "../../src/assets/wallpapers/3.png";

export default function Game(callback) {
  const [wallpaper, setWallpaper] = useState(initialWallpaper);
  const [selectedOption, setSelectedOption] = useState("Galmieux");
  const reduxLeader = useSelector((state) => state.card.leader);

  useEffect(() => {
    if (reduxLeader) setSelectedOption(reduxLeader);
  }, [reduxLeader]);
  const constraintsRef = useRef(null);
  const [ready, setReady] = useState(false);
  // const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [readyToPlaceOnFieldFromHand, setReadyToPlaceOnFieldFromHand] =
    useState(false);
  const reduxCurrentCard = useSelector((state) => state.card.currentCard);

  // The board reports the scale it computed; the side panels (HP, leader, play
  // points, chat) shrink by the same factor so everything matches. Capped at 1
  // so they only ever scale down, never grow past their designed size.
  const [boardScale, setBoardScale] = useState(1);
  const sideScale = Math.min(boardScale, 1);
  const leftScaleStyle = {
    transform: `scale(${sideScale})`,
    transformOrigin: "center left",
  };
  const rightScaleStyle = {
    transform: `scale(${sideScale})`,
    transformOrigin: "center right",
  };

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
        // setWallpaper={setWallpaper}
      />
      {/* Left side  */}
      <div className={"leftSideCanvas"}>
        {/* ZoomedCard is position:absolute against the viewport, so it must NOT
            be wrapped in a transform (that would reparent its containing block
            and collapse it). It scales itself via the scale prop instead. */}
        <ZoomedCard
          name={reduxCurrentCard}
          hovering={hovering}
          scale={sideScale}
        />
        <div style={leftScaleStyle}>
          <PlayPoints name={selectedOption} />
        </div>
      </div>

      {/* Center Field */}
      <motion.div
        onContextMenu={(e) => e.nativeEvent.preventDefault()}
        className={"centerCanvas"}
        style={{
          // background: "linear-gradient(to top, #09203f 0%, #537895 100%)"
          background:
            "radial-gradient(circle, rgba(60,105,134,1) 0%, rgba(18,53,87,1) 70%, rgba(18,41,87,1) 84%, rgba(11,26,55,1) 100%)",
        }}
        ref={constraintsRef}
      >
        {/* Board area: fills the height above the hand and centers the board
            vertically, so on tall screens it sits in the middle instead of
            stuck at the top. The hand below stays pinned to the bottom. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Field
            // dragging={dragging}
            ready={ready}
            setReady={setReady}
            setHovering={setHovering}
            readyToPlaceOnFieldFromHand={readyToPlaceOnFieldFromHand}
            setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
            onScaleChange={setBoardScale}
          />
        </div>
        {/* Scale the hand by the same factor as the board so the player's
            cards always match the on-field cards at every resolution. Anchor
            the scale to the bottom so the hand stays locked to the bottom edge
            instead of floating up by the scaled-away height. */}
        <div
          style={{
            transform: `scale(${boardScale})`,
            transformOrigin: "bottom center",
          }}
        >
          <Hand
            // setDragging={setDragging}
            setHovering={setHovering}
            constraintsRef={constraintsRef}
            ready={ready}
            setReady={setReady}
            setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
          />
        </div>
      </motion.div>

      {/* Right side */}
      <div className={"rightSideCanvas"}>
        <div style={rightScaleStyle}>
          <EnemyUI />
        </div>

        <div style={rightScaleStyle}>
          <PlayerUI name={selectedOption} />
        </div>
        <div style={rightScaleStyle}>
          <ChatUI scale={sideScale} />
        </div>
      </div>
    </div>
  );
}
