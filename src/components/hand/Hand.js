import React from "react";
import Card from "./Card";
import { useSelector } from "react-redux";

export default function Hand() {
  const reduxHand = useSelector((state) => state.card.hand);
  return (
    <div style={{ height: "30vh", zIndex: "1" }}>
      {reduxHand &&
        reduxHand.length > 0 &&
        reduxHand.map((card) => <Card name={card} />)}
    </div>
  );
}
