import React, { useState, useEffect } from "react";
import { artImage, artThumb } from "../../decks/getCards";
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
  keywords = [],
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
  // Keyword status badges show compact (inside the card) by default and expand
  // to large vertical labels beside the card on hover.
  const [kwHover, setKwHover] = useState(false);

  const reduxEnemyCardSelectedInHand = useSelector(
    (state) => state.card.enemyCardSelectedInHand
  );

  // Rarity/art choice: opponent's field cards use the synced enemy art, all
  // other cards (my hand, my field) use my own. Falls back to default art.
  const reduxMyArt = useSelector((state) => state.card.myArt);
  const reduxEnemyArt = useSelector((state) => state.card.enemyArt);
  const artMap = opponentField ? reduxEnemyArt : reduxMyArt;

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
    setKwHover(true);
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
    setKwHover(false);
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
        // Lift the whole card (and its overflowing keyword labels) above
        // neighbouring cards while hovered so the black boxes aren't clipped.
        style={{ position: "relative", zIndex: kwHover ? 999 : "auto" }}
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
            : "none"
        }
      >
        {keywords && keywords.length > 0 && kwHover && (
          // Hover: larger badge. Not engaged -> sits above the card's top edge,
          // spanning the card width. Engaged -> the card is rotated -90°, so we
          // counter-rotate +90° (text reads normally) and push it to the card's
          // visual top.
          <div
            style={
              engaged
                ? {
                    // Card is rotated -90°; its visual top edge is the card's
                    // height (161px), so size the (counter-rotated) bar to that
                    // and stretch the box to span it.
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 161,
                    transform:
                      "translate(-50%, -50%) rotate(90deg) translateY(-90px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 3,
                    zIndex: 20,
                    pointerEvents: "none",
                  }
                : {
                    position: "absolute",
                    bottom: "100%",
                    left: 0,
                    width: "100%",
                    marginBottom: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 3,
                    zIndex: 20,
                    pointerEvents: "none",
                  }
            }
          >
            {keywords.map((kw) => (
              <div
                key={kw}
                style={{
                  background: "#000",
                  color: "#fff",
                  fontFamily: "Noto Serif JP, serif",
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: 0.5,
                  padding: "5px 0",
                  textAlign: "center",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.9)",
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.7)",
                }}
              >
                {kw}
              </div>
            ))}
          </div>
        )}
        {keywords && keywords.length > 0 && !kwHover && (
          // Default + any engaged state: the original compact badge at the top
          // of the card (rotates with the card when engaged).
          <div
            style={{
              position: "absolute",
              top: 4,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            {keywords.map((kw) => (
              <div
                key={kw}
                style={{
                  background: "#000",
                  color: "#fff",
                  fontFamily: "Noto Serif JP, serif",
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: 0.5,
                  padding: "3px 7px",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.85)",
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.7)",
                }}
              >
                {kw}
              </div>
            ))}
          </div>
        )}
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
            src={artThumb(cardBeneath, artMap)}
            onError={(e) => {
              if (e.currentTarget.src.indexOf("/thumbs/") !== -1)
                e.currentTarget.src = artImage(cardBeneath, artMap);
            }}
            alt={name}
          />
        ) : (
          <img
            height={"100%"}
            src={artThumb(name, artMap)}
            onError={(e) => {
              if (e.currentTarget.src.indexOf("/thumbs/") !== -1)
                e.currentTarget.src = artImage(name, artMap);
            }}
            alt={name}
          />
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
