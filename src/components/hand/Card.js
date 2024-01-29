import React, { useState } from "react";
import { cardImage } from "../../decks/getCards";
import { motion } from "framer-motion";
import { setCurrentCard } from "../../redux/CardSlice";
import { useDispatch } from "react-redux";
import cancel from "../../assets/logo/cancel.png";
import carrot from "../../assets/logo/carrot.png";
import img from "../../assets/pin_bellringer_angel.png";
export default function Card({
  name,
  setDragging,
  ready,
  setHovering,
  onField = false,
  evolvedUsed = false,
  cardBeneath,
}) {
  let numOfCarrots = 0;
  const [rotate, setRotate] = useState(false);
  const dispatch = useDispatch();
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

  const updateNumberOfCarrots = () => {
    if (name === "Carrot") {
      numOfCarrots = 1;
    } else if (Number(name?.slice(-1)) > 0) {
      numOfCarrots = Number(name.slice(-1));
    }
  };
  updateNumberOfCarrots();

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
      {Number(name?.slice(-1)) > 0 ? (
        <img
          style={{ opacity: 1 }}
          height={"100%"}
          src={cardImage(cardBeneath)}
          alt={name}
        />
      ) : (
        <img height={"100%"} src={cardImage(name)} alt={name} />
      )}
      {evolvedUsed && (
        <img
          src={cancel}
          alt={"cancel"}
          style={{
            position: "relative",
            height: "100px",
            width: "100px",
            opacity: 0.45,
            left: "7%",
            bottom: "90%",
            zIndex: 1,
          }}
        />
      )}

      {numOfCarrots > 0 && onField && (
        <div
          style={{
            width: "50px",
            position: "relative",
            left: "45%",
            bottom: "120%",
            fontFamily: "EB Garamond",
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "10px",
            border: "4px solid #0000",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={carrot}
            alt={"carrot"}
            style={{
              height: "20px",
              width: "20px",
            }}
          />
          <div style={{ fontSize: 15 }}>x {numOfCarrots} </div>
        </div>
      )}
    </motion.div>
  );
}
