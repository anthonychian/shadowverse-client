import React, { useState } from "react";
import { cardImage } from "../../decks/getCards";
import { motion } from "framer-motion";
import { setCurrentCard } from "../../redux/CardSlice";
import { useDispatch } from "react-redux";

export default function Card({
  name,
  setDragging,
  constraintsRef,
  onField = false,
  setHovering,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const img = require("../../assets/pin_bellringer_angel.png");
  const handleTap = () => {
    if (onField) setIsOpen(!isOpen);
  };

  const handleHoverStart = () => {
    setHovering(true);
    dispatch(setCurrentCard(name));
  };

  const handleHoverEnd = () => {
    setHovering(false);
  };

  return (
    <motion.div
      onTap={handleTap}
      whileTap={{
        transitionDuration: "3s",
      }}
      animate={isOpen ? { rotate: -90 } : { rotate: 0 }}
      style={{
        height: "160px",
      }}
      onHoverStart={() => handleHoverStart()}
      onHoverEnd={() => handleHoverEnd()}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      whileHover={{
        translateY: -25,
        scale: 1.3,
        cursor: `url(${img}) 55 55, auto`,
      }}
    >
      <img height={"100%"} src={cardImage(name)} alt={name} />
    </motion.div>
  );
}
