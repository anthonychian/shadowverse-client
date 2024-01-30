import React from "react";
import { cardImage } from "../../decks/getCards";

export default function ZoomedCard({ hovering, name }) {
  return (
    <>
      {hovering && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            height: "60%",
            zIndex: 100,
          }}
        >
          <img height={"100%"} src={cardImage(name)} alt={name} />
        </div>
      )}
    </>
  );
}
