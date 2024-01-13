import React from "react";
import { cardImage } from "../../decks/getCards";

export default function Card({ name }) {
  return <img height={"120px"} src={cardImage(name)} alt={name} />;
}
