import React, { useState, useEffect } from "react";
import { cardImage } from "../../decks/getCards";
import { motion } from "framer-motion";
import { modifyAtk, modifyDef, setCurrentCard } from "../../redux/CardSlice";
import { useDispatch } from "react-redux";
import cancel from "../../assets/logo/cancel.png";
import carrot from "../../assets/logo/carrot.png";
import img from "../../assets/pin_bellringer_angel.png";
import "../../css/Card.css";

export default function Card({
  name,
  idx,
  setDragging,
  ready,
  setHovering,
  onField = false,
  evolvedUsed = false,
  cardBeneath,
  engaged,
  showAtk,
  showDef,
  atkVal,
  defVal,
  onEnemyField = false,
}) {
  let numOfCarrots = 0;
  const [rotate, setRotate] = useState(false);
  const dispatch = useDispatch();
  const [atk, setAtk] = useState(0);
  const [def, setDef] = useState(0);

  useEffect(() => {
    if (rotate !== engaged) setRotate(engaged);
  }, [engaged]);

  useEffect(() => {
    setAtk(Number(atkVal));
    setDef(Number(defVal));
  }, [atkVal, defVal]);

  const handleAtkInput = (event) => {
    setAtk(Number(event.target.value));
    dispatch(
      modifyAtk({
        value: event.target.value,
        index: idx,
      })
    );
  };
  const handleDefInput = (event) => {
    setDef(Number(event.target.value));
    dispatch(
      modifyDef({
        value: event.target.value,
        index: idx,
      })
    );
  };

  // const handleTap = () => {
  //   if (onField && !ready) {
  //     setRotate(!rotate);
  //     dispatch(setEngaged(idx));
  //   }
  // };

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
    if (name !== 0) {
      if (name === "Carrot") {
        numOfCarrots = 1;
      } else if (Number(name?.slice(-1)) > 0) {
        numOfCarrots = Number(name.slice(-1));
      }
    }
  };
  updateNumberOfCarrots();

  return (
    <>
      <motion.div
        // onTap={handleTap}
        whileTap={onField ? {} : { transitionDuration: "5s" }}
        animate={rotate ? { rotate: -90 } : { rotate: 0 }}
        style={{
          height: "160px",
          position: "relative",
          // rotate: rotate ? -90 : 0,
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
        {numOfCarrots > 0 && name !== "Carrot" ? (
          <img
            style={{ opacity: 1 }}
            height={"100%"}
            src={cardImage(cardBeneath)}
            alt={name}
          />
        ) : (
          <img height={"100%"} src={cardImage(name)} alt={name} />
        )}
        {showAtk && (
          <input
            value={atk}
            onChange={handleAtkInput}
            type="number"
            min={0}
            className={"atkInputNum"}
          />
        )}
        {showDef && (
          <input
            value={def}
            onChange={handleDefInput}
            type="number"
            min={0}
            className={"defInputNum"}
          />
        )}
        {evolvedUsed && (
          <img
            src={cancel}
            alt={"cancel"}
            style={{
              position: "relative",
              height: "100px",
              width: "100px",
              opacity: 0.65,
              left: "7%",
              bottom: "90%",
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
    </>
  );
}
