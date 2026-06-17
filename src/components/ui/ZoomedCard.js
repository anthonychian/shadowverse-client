import React from "react";
import { artImage } from "../../decks/getCards";

export default function ZoomedCard({ hovering, name, scale = 1, art }) {
  return (
    <>
      {hovering && (
        <div
          style={{
            position: "fixed",
            top: "10%",
            left: 0,
            width: "20vw",
            height: "60%",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <img
            height={"100%"}
            src={artImage(name, art)}
            alt={name}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          />
        </div>
      )}
    </>
  );
}
