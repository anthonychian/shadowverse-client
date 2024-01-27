import React, { useState } from "react";
import { cardImage } from "../../decks/getCards";
import { motion } from "framer-motion";
import { setCurrentCard } from "../../redux/CardSlice";
import { useDispatch } from "react-redux";
import cancel from "../../assets/logo/cancel.png";

export default function Card({
  name,
  setDragging,
  constraintsRef,
  ready,
  setHovering,
  onField = false,
  evolvedUsed = false,
}) {
  const [rotate, setRotate] = useState(false);
  const dispatch = useDispatch();
  const cancel = require("../../assets/logo/cancel.png");
  const img = require("../../assets/pin_bellringer_angel.png");
  const handleTap = () => {
    if (onField && !ready) setRotate(!rotate);
  };

  const handleHoverStart = () => {
    if (!ready) {
      setHovering(true);
      dispatch(setCurrentCard(name));
    }
  };

  const handleHoverEnd = () => {
    setHovering(false);
  };

  return (
    <motion.div
      onTap={handleTap}
      whileTap={onField ? { transitionDuration: "3s" } : {}}
      animate={rotate ? { rotate: -90 } : { rotate: 0 }}
      style={{
        height: "160px",
      }}
      onHoverStart={() => handleHoverStart()}
      onHoverEnd={() => handleHoverEnd()}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      whileHover={
        !ready && {
          translateY: -25,
          scale: 1.3,
          cursor: `url(${img}) 55 55, auto`,
        }
      }
    >
      <img height={"100%"} src={cardImage(name)} alt={name} />
      {evolvedUsed && (
        <img
          src={cancel}
          alt={"cancel"}
          style={{
            position: "relative",
            height: "100px",
            color: "white",
            right: "50%",
            bottom: "20%",
            zIndex: 1,
          }}
        />
      )}
    </motion.div>
  );
}
