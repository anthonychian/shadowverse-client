import React from "react";
import Card from "../hand/Card";

import { useSelector } from "react-redux";

export default function Deck() {
  const reduxDeck = useSelector((state) => state.card.deck);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        height: "40vh",
        width: "100%",
      }}
    >
      {reduxDeck &&
        reduxDeck.length > 0 &&
        reduxDeck.map((card) => <Card name={card} />)}
    </div>
  );
}
