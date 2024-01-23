import React, { useState } from "react";
import { cardImage } from "../../decks/getCards";
import { motion } from "framer-motion";

export default function Card({ name, constraintsRef, onField = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setDragging] = useState(false);
  const img = require("../../assets/pin_bellringer_angel.png");
  const handleTap = () => {
    if (onField) setIsOpen(!isOpen);
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
