import React from "react";
import { cardImage } from "../../decks/getCards";
import { motion } from "framer-motion"

export default function Card({ name }) {
  return (
    <motion.div
      whileHover={{ scale: 2.0 }}
      whileTap={{
        scale: 0.8,
        rotate: -90,
        borderRadius: "100%"
      }}
    >
      <img height={"200px"} src={cardImage(name)} alt={name} />
    </motion.div>
  )
  
}
