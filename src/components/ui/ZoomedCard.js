import React from "react";
import { artImage } from "../../decks/getCards";

export default function ZoomedCard({ hovering, name, scale = 1, art }) {
  return (
    <>
      {hovering && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            height: "60%",
            zIndex: 100,
            // Scaled here on the element itself (not via a wrapped ancestor) so
            // it stays positioned relative to the viewport while matching the
            // rest of the UI's scale.
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <img height={"100%"} src={artImage(name, art)} alt={name} />
        </div>
      )}
    </>
  );
}
