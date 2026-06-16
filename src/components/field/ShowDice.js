import React from "react";
import dice from "../../assets/logo/dice.png";
import { useDispatch } from "react-redux";
import { setDice } from "../../redux/CardSlice";
import { playDiceRoll } from "./diceBus";

import img from "../../assets/pin_bellringer_angel.png";

export default function ShowDice() {
  const dispatch = useDispatch();

  // Roll 1-6: log + broadcast the result to the opponent (setDice), and play the
  // toss animation locally. The opponent replays the same toss off the synced
  // value, so both players see the same throw and the same result.
  const handleRoll = () => {
    const value = 1 + Math.floor(Math.random() * 6);
    dispatch(setDice({ show: true, roll: value }));
    playDiceRoll(value);
  };

  return (
    <>
      <div
        onClick={handleRoll}
        style={{
          cursor: `url(${img}) 55 55, auto`,
        }}
      >
        <img height={"50px"} src={dice} alt={"dice"} />
        <div
          style={{
            width: "50px",
            color: "white",
          }}
        >
          Dice
        </div>
      </div>
    </>
  );
}
