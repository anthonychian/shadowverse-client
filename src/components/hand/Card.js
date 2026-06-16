import React, { useState, useEffect, useRef } from "react";
import { artImage, artThumb } from "../../decks/getCards";
import { motion, useDragControls } from "framer-motion";
import {
  modifyAtk,
  modifyDef,
  setCurrentCard,
  modifyCounter,
  setEngaged,
  placeToFieldFromHand,
  placeToCemeteryFromHand,
} from "../../redux/CardSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  fieldIndexAt,
  isOverCemetery,
  isOverHand,
  setDragHover,
} from "../field/handDrag";
import cancel from "../../assets/logo/cancel.png";
import carrot from "../../assets/logo/carrot.png";
import drive from "../../assets/logo/drive.png";
import img from "../../assets/pin_bellringer_angel.png";
import atkImg from "../../assets/logo/atk.png";
import defImg from "../../assets/logo/def.png";

import "../../css/Card.css";

// How far (px) a field card must be dragged before it starts moving. Below this
// the gesture is treated as a tap (engage), so tapping stays reliable and only a
// deliberate drag relocates the card.
const FIELD_DRAG_THRESHOLD = 10;

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
  constraintsRef,
  handDragging = false,
  onCardDragStart,
  onCardDragEnd,
  onFieldDrop,
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
  // Live field state, so a drag-drop only fills an empty zone (mirrors the
  // click-to-place flow, which also rejects occupied slots).
  const reduxField = useSelector((state) => state.card.field);

  useEffect(() => {
    setAtk(Number(atkVal));
    setDef(Number(defVal));
  }, [atkVal, defVal]);

  useEffect(() => {
    setCounter(Number(counterVal));
  }, [counterVal]);

  // Field drag-to-move uses a manual drag start (dragListener disabled) so we
  // can require a real drag distance before moving — small movements stay taps.
  const dragControls = useDragControls();
  const fieldDragStart = useRef(null);
  // Set true once a field drag crosses the threshold, so the trailing tap/click
  // that fires on release doesn't also engage the card. Reset on next press.
  const suppressTapRef = useRef(false);
  const fieldDraggable = onField && !opponentField && !ready;
  // An evolved field card (has a base card beneath). Cemetery/Hand drops are
  // base-card only, so evo cards can only be moved between field slots.
  const isEvoFieldCard = onField && !!cardBeneath && cardBeneath !== 0;

  const handleTap = () => {
    if (suppressTapRef.current) {
      suppressTapRef.current = false;
      return;
    }
    if (onField && !opponentField && !ready && !hoverInput) {
      dispatch(setEngaged(idx));
    }
  };

  const handleFieldPointerDown = (e) => {
    if (e.button !== 0) return; // left button only; leave right-click for menus
    fieldDragStart.current = { x: e.clientX, y: e.clientY };
    suppressTapRef.current = false;
  };
  const handleFieldPointerMove = (e) => {
    if (!fieldDragStart.current || suppressTapRef.current) return;
    // Only while the left button is held — pointermove also fires on plain
    // hover, which must never start a drag.
    if (e.buttons !== 1) {
      fieldDragStart.current = null;
      return;
    }
    const dx = e.clientX - fieldDragStart.current.x;
    const dy = e.clientY - fieldDragStart.current.y;
    if (Math.hypot(dx, dy) > FIELD_DRAG_THRESHOLD) {
      suppressTapRef.current = true;
      dragControls.start(e);
    }
  };
  const handleFieldPointerUp = () => {
    fieldDragStart.current = null;
  };
  // Base field cards can also go to the cemetery or back to hand; evo cards can
  // only be moved between slots.
  const fieldExtraTargets = !isEvoFieldCard;
  const handleFieldDragStart = () => {
    setDragHover({
      active: true,
      index: -1,
      cemetery: false,
      hand: false,
      showCemetery: fieldExtraTargets,
      showHand: fieldExtraTargets,
    });
  };
  const handleFieldDrag = (_event, info) => {
    const { x, y } = info.point;
    setDragHover({
      active: true,
      index: fieldIndexAt(x, y),
      cemetery: fieldExtraTargets && isOverCemetery(x, y),
      hand: fieldExtraTargets && isOverHand(x, y),
      showCemetery: fieldExtraTargets,
      showHand: fieldExtraTargets,
    });
  };
  const handleFieldDragEnd = (_event, info) => {
    setDragHover({
      active: false,
      index: -1,
      cemetery: false,
      hand: false,
      showCemetery: false,
      showHand: false,
    });
    if (!onFieldDrop) return;
    const { x, y } = info.point;
    let dest;
    if (fieldExtraTargets && isOverCemetery(x, y)) dest = { type: "cemetery" };
    else if (fieldExtraTargets && isOverHand(x, y)) dest = { type: "hand" };
    else dest = { type: "field", index: fieldIndexAt(x, y) };
    onFieldDrop(idx, dest);
  };

  // ---- drag a hand card onto a field zone or the cemetery ----
  // Dropping over an empty field zone plays the card there; dropping over the
  // cemetery pile discards it; anywhere else snaps it back to the hand
  // (dragSnapToOrigin). These mirror the right-click "Field"/"Cemetery" menu
  // actions and coexist with the click-to-place flow.
  const handleCardDragStart = () => {
    if (onCardDragStart) onCardDragStart();
    setDragHover({
      active: true,
      index: -1,
      cemetery: false,
      hand: false,
      showCemetery: true,
      showHand: false,
    });
  };
  const handleCardDrag = (_event, info) => {
    setDragHover({
      active: true,
      index: fieldIndexAt(info.point.x, info.point.y),
      cemetery: isOverCemetery(info.point.x, info.point.y),
      hand: false,
      showCemetery: true,
      showHand: false,
    });
  };
  const handleCardDragEnd = (_event, info) => {
    setDragHover({
      active: false,
      index: -1,
      cemetery: false,
      hand: false,
      showCemetery: false,
      showHand: false,
    });
    if (onCardDragEnd) onCardDragEnd();
    const { x, y } = info.point;
    if (isOverCemetery(x, y)) {
      dispatch(placeToCemeteryFromHand({ name: name, index: inHandIndex }));
      return;
    }
    const dropIndex = fieldIndexAt(x, y);
    if (dropIndex >= 0 && reduxField[dropIndex] === 0) {
      dispatch(
        placeToFieldFromHand({
          card: name,
          indexInHand: inHandIndex,
          index: dropIndex,
        })
      );
    }
  };

  // Drag props differ by where the card lives. Hand cards auto-drag (small
  // built-in threshold) and drop to a field zone or the cemetery. Field cards
  // use a manual drag start gated by FIELD_DRAG_THRESHOLD so a tap still
  // engages; they drop to another field slot to reposition.
  let dragProps = {};
  if (inHand && !ready) {
    dragProps = {
      drag: true,
      dragConstraints: constraintsRef,
      dragSnapToOrigin: true,
      dragElastic: 0.15,
      dragMomentum: false,
      whileDrag: { scale: 1.15, zIndex: 9999, cursor: "grabbing" },
      onDragStart: handleCardDragStart,
      onDrag: handleCardDrag,
      onDragEnd: handleCardDragEnd,
    };
  } else if (fieldDraggable) {
    dragProps = {
      drag: true,
      dragListener: false,
      dragControls: dragControls,
      dragSnapToOrigin: true,
      dragElastic: 0.1,
      dragMomentum: false,
      whileDrag: { scale: 1.08, zIndex: 9999, cursor: "grabbing" },
      onPointerDown: handleFieldPointerDown,
      onPointerMove: handleFieldPointerMove,
      onPointerUp: handleFieldPointerUp,
      onDragStart: handleFieldDragStart,
      onDrag: handleFieldDrag,
      onDragEnd: handleFieldDragEnd,
    };
  }

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
    // While any hand card is being dragged, don't let the pointer passing over
    // other cards lift them or hijack the zoom preview — the rest of the hand
    // should stay put.
    if (handDragging) return;
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
        {...dragProps}
        // Lift the whole card (and its overflowing keyword labels) above
        // neighbouring cards while hovered so the black boxes aren't clipped.
        style={{
          position: "relative",
          zIndex: kwHover ? 999 : "auto",
          cursor: `url(${img}) 55 55, auto`,
        }}
        animate={engaged ? { rotate: -90 } : { rotate: 0 }}
        initial={false}
        onHoverStart={() => handleHoverStart()}
        onHoverEnd={() => handleHoverEnd()}
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
