import React, { useState, useEffect } from "react";
import { cardImage } from "../../decks/getCards";
import { motion } from "framer-motion";
import {
  modifyAtk,
  modifyDef,
  setCurrentCard,
  modifyCounter,
  setEngaged,
} from "../../redux/CardSlice";
import { useDispatch, useSelector } from "react-redux";
import cancel from "../../assets/logo/cancel.png";
import carrot from "../../assets/logo/carrot.png";
import drive from "../../assets/logo/drive.png";
import img from "../../assets/pin_bellringer_angel.png";
import atkImg from "../../assets/logo/atk.png";
import defImg from "../../assets/logo/def.png";

import "../../css/Card.css";

export default function Card({
  name,
  idx,
  // setDragging,
  ready,
  setHovering,
  onField = false,
  evolvedUsed = false,
  opponentField = false,
  cardBeneath,
  engaged,
  showAtk,
  showDef,
  atkVal,
  defVal,
  counterVal,
  aura,
  bane,
  ward,
  handLength,
  inHand = false,
  inHandIndex = -1,
}) {
  let numOfCarrots = 0;
  const dispatch = useDispatch();
  const [atk, setAtk] = useState(0);
  const [def, setDef] = useState(0);
  const [counter, setCounter] = useState(0);
  const [hoverInput, setHoverInput] = useState(false);

  const reduxEnemyCardSelectedInHand = useSelector(
    (state) => state.card.enemyCardSelectedInHand
  );

  const reduxCardSelectedOnField = useSelector(
    (state) => state.card.cardSelectedOnField
  );
  const reduxEnemyCardSelectedOnField = useSelector(
    (state) => state.card.enemyCardSelectedOnField
  );

  useEffect(() => {
    setAtk(Number(atkVal));
    setDef(Number(defVal));
  }, [atkVal, defVal]);

  useEffect(() => {
    setCounter(Number(counterVal));
  }, [counterVal]);

  const handleTap = () => {
    if (onField && !opponentField && !ready && !hoverInput) {
      dispatch(setEngaged(idx));
    }
  };

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

  const handleCounterInput = (event) => {
    const num = event.target.value;
    if (Number(num) === 0) setHoverInput(false);
    setCounter(Number(num));
    dispatch(
      modifyCounter({
        value: num,
        index: idx,
      })
    );
  };

  const handleHoverStart = () => {
    if (!ready) {
      setHovering(true);
      if (name.slice(0, 6) === "Carrot" || name === "Drive Point") {
        dispatch(setCurrentCard(cardBeneath));
      } else {
        dispatch(setCurrentCard(name));
      }
    }
  };

  const cardPos = (idx) => {
    if (idx === -1) return -1;
    else if (idx < 5) return idx + 5;
    else return idx - 5;
  };

  const handleHoverEnd = () => {
    setHovering(false);
  };

  const handleStartHoverInput = () => {
    setHoverInput(true);
  };

  const handleEndHoverInput = () => {
    setHoverInput(false);
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
        onTap={handleTap}
        // style={{
        //   height: "160px",
        //   position: "relative",
        // }}
        animate={engaged ? { rotate: -90 } : { rotate: 0 }}
        initial={false}
        onHoverStart={() => handleHoverStart()}
        onHoverEnd={() => handleHoverEnd()}
        whileHover={
          !ready && {
            // boxShadow:
            //   "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 1.0)",
            translateY: inHand ? -80 : -25,
            scale: inHand ? 1.5 : 1.3,
            cursor: `url(${img}) 55 55, auto`,
            overlay: "auto",
            // display: "inline-block",
          }
        }
        className={
          cardPos(reduxCardSelectedOnField) === idx && opponentField
            ? "box2"
            : reduxEnemyCardSelectedOnField === idx && !opponentField
            ? "box2"
            : inHand &&
              (reduxEnemyCardSelectedInHand - handLength + 1) * -1 ===
                inHandIndex
            ? "box2"
            : aura === 1
            ? "aura"
            : bane === 1
            ? "bane"
            : ward === 1
            ? "ward"
            : "none"
        }
      >
        {counterVal > 0 && (
          <>
            <input
              disabled={opponentField ? true : false}
              value={counter}
              onChange={handleCounterInput}
              type="number"
              min={0}
              className={"counterInput"}
              onMouseEnter={handleStartHoverInput}
              onMouseLeave={handleEndHoverInput}
            />
            <div
              style={{
                position: "absolute",
                top: "25%",
                right: "30%",
                borderRadius: "50px",
                color: "white",
                fontSize: "30px",
                fontFamily: "Noto Serif JP, serif",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                height: "50px",
                width: "50px",
              }}
            >
              {counter}
            </div>
          </>
        )}
        {(numOfCarrots > 0 && name !== "Carrot") ||
        (name === "Drive Point" && onField) ? (
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
          <>
            <input
              disabled={opponentField ? true : false}
              value={atk}
              onChange={handleAtkInput}
              type="number"
              min={0}
              max={99}
              className={"atkInputNum"}
              onMouseEnter={handleStartHoverInput}
              onMouseLeave={handleEndHoverInput}
            />
            <div
              style={{
                position: "absolute",
                top: "75%",
                right: atk > 9 ? "50%" : "60%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img height={"40px"} src={atkImg} alt="atk" />
              <span
                style={{
                  color: "white",
                  fontSize: "25px",
                  textShadow: "-1px 1px 0 #000",
                  position: "relative",
                  top: "50%",
                  right: "50%",
                }}
              >
                {atk}
              </span>
            </div>
          </>
        )}
        {showDef && (
          <>
            <input
              disabled={opponentField ? true : false}
              value={def}
              onChange={handleDefInput}
              type="number"
              min={0}
              className={"defInputNum"}
              onMouseEnter={handleStartHoverInput}
              onMouseLeave={handleEndHoverInput}
            />
            <div
              style={{
                position: "absolute",
                top: "75%",
                left: "70%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img height={"40px"} src={defImg} alt="atk" />
              <span
                style={{
                  color: "white",
                  fontSize: "25px",
                  textShadow: "-1px 1px 0 #000",
                  position: "relative",
                  top: "50%",
                  right: "50%",
                }}
              >
                {def}
              </span>
            </div>
          </>
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
        {name === "Drive Point" && onField && (
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
              src={drive}
              alt={"drive"}
              style={{
                height: "20px",
                width: "20px",
              }}
            />
            <div style={{ fontSize: 15 }}></div>
          </div>
        )}
      </motion.div>
    </>
  );
}
