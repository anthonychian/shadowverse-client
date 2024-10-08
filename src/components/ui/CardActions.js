import React from "react";
import {
  drawFromDeck,
  reset,
  shuffleDeck,
  drawFourFromDeck,
  mulliganFour,
} from "../../redux/CardSlice";
import { useDispatch } from "react-redux";
import Button from "@mui/material/Button";

export default function CardActions() {
  const dispatch = useDispatch();
  return (
    <div
      style={{
        paddingTop: "110%",
        height: "10%",
        width: "70%",
        display: "flex",
        // gap: 10,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-evenly",
      }}
    >
      <Button
        style={{ fontSize: 12, width: "130px" }}
        onClick={() => dispatch(shuffleDeck())}
        variant="contained"
      >
        Shuffle Deck
      </Button>
      <Button
        style={{ fontSize: 12, width: "130px" }}
        onClick={() => dispatch(drawFourFromDeck())}
        variant="contained"
      >
        Draw 4
      </Button>
      <Button
        style={{ fontSize: 12, width: "130px" }}
        onClick={() => dispatch(mulliganFour())}
        variant="contained"
      >
        Mulligan 4
      </Button>
    </div>
  );
}
