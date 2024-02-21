import React from "react";
import dice from "../../assets/logo/dice.png";
import { useDispatch, useSelector } from "react-redux";
import { setShowDice } from "../../redux/CardSlice";

import img from "../../assets/pin_bellringer_angel.png";

export default function ShowDice() {
  const dispatch = useDispatch();
  const reduxShowDice = useSelector((state) => state.card.showDice);

  const handleToggle = () => {
    if (reduxShowDice) dispatch(setShowDice(false));
    else dispatch(setShowDice(true));
  };

  return (
    <>
      <div
        onClick={handleToggle}
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
