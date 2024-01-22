import React from "react";
import {
  drawFromDeck,
  reset,
  shuffleDeck,
  drawFourFromDeck,
  mulligan,
} from "../../redux/CardSlice";
import { useDispatch } from "react-redux";
import Button from "@mui/material/Button";

export default function CardActions() {
  const dispatch = useDispatch();
  return (
    <div
      style={{
        paddingTop: "90%",
        height: "30%",
        width: "70%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-evenly",
      }}
    >
      <Button
        style={{ fontSize: "70%", width: "130px" }}
        onClick={() => dispatch(shuffleDeck())}
        variant="contained"
      >
        Shuffle Deck
      </Button>
      <Button
        style={{ fontSize: "70%", width: "130px" }}
        onClick={() => dispatch(drawFromDeck())}
        variant="contained"
      >
        Draw
      </Button>
      <Button
        style={{ fontSize: "70%", width: "130px" }}
        onClick={() => dispatch(drawFourFromDeck())}
        variant="contained"
      >
        Draw 4
      </Button>
      <Button
        style={{ fontSize: "70%", width: "130px" }}
        onClick={() => dispatch(mulligan())}
        variant="contained"
      >
        Mulligan
      </Button>
      <Button
        style={{ fontSize: "70%", width: "130px" }}
        onClick={() => dispatch(reset())}
        variant="contained"
      >
        Reset
      </Button>
    </div>
  );
}
