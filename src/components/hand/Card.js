import React, { useState } from "react";
import { cardImage } from "../../decks/getCards";
import { motion } from "framer-motion";

export default function Card({ name, constraintsRef }) {
  const [isDragging, setDragging] = useState(false);

  return (
    <motion.div
      style={{
        height: "160px",
      }}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      whileHover={{ translateY: -25, scale: 1.3, cursor: "grabbing" }}
    >
      <img
        style={{ pointerEvents: "none" }}
        height={"100%"}
        src={cardImage(name)}
        alt={name}
      />
    </motion.div>
  );
}
