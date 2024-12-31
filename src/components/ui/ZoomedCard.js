import React, { useState, useRef, useEffect } from "react";
import { cardImage } from "../../decks/getCards";
import { cardEffect } from "../../decks/getEffect";

export default function ZoomedCard({ hovering, name }) {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);  

  
  useEffect(() => {
    if (imageRef.current) {
      const { width, height } = imageRef.current;
      setImageDimensions({ width, height });
    }
  }, [name]);  

  const renderTextWithStyle = (text) => {
    
    return text.split("\n").map((line, index) => {
      const parts = line.split(" ");  
      return (
        <span key={index}>
          {parts.map((word, idx) => {
            if (word.includes("[evolve]")) {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "grey",
                    padding: "2px 2px",
                    borderRadius: "3px",
                    color: "gold", 
                    marginRight: "5px", 
                  }}
                >
                  {word}
                </span>
              );
            }
            if (word.includes("[cost")) {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "green",
                    padding: "2px 2px",
                    borderRadius: "3px",
                    color: "white",  
                    marginRight: "5px",  
                  }}
                >
                  {word}
                </span>
              );
            }
            if (word.includes("[lastwords]")) {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "purple",
                    padding: "2px 2px",
                    borderRadius: "3px",
                    color: "white", 
                    marginRight: "5px", 
                  }}
                >
                  {word}
                </span>
              );
            }
            if (word.includes("[fanfare]")) {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "orange",
                    padding: "2px 2px",
                    borderRadius: "3px",
                    color: "white", 
                    marginRight: "5px",  
                  }}
                >
                  {word}
                </span>
              );
            }
            if (word.includes("[defense]")) {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "red",
                    padding: "2px 2px",
                    borderRadius: "3px",
                    color: "white", 
                    marginRight: "5px",  
                  }}
                >
                  {word}
                </span>
              );
            }
            if (word.includes("[attack]")) {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "blue",
                    padding: "2px 2px",
                    borderRadius: "3px",
                    color: "black",  
                    marginRight: "5px", 
                  }}
                >
                  {word}
                </span>
              );
            }
            if (word.includes("[act]")) {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "#419c86",
                    padding: "2px 2px",
                    borderRadius: "3px",
                    color: "black",  
                    marginRight: "5px",
                  }}
                >
                  {word}
                </span>
              );
            }
            if (word.includes("[engage]")) {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "grey",
                    padding: "2px 2px",
                    borderRadius: "3px",
                    color: "white",  
                    marginRight: "5px",  
                  }}
                >
                  {word}
                </span>
              );
            }
            if (word.includes("[quick]") || word.includes("[q]")) {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "#b3a527",
                    padding: "2px 2px",
                    borderRadius: "3px",
                    color: "black",  
                    marginRight: "5px",  
                  }}
                >
                  {word}
                </span>
              );
            }
            return `${word} `;  
          })}
          <br />
        </span>
      );
    });
  };

  return (
    <>
      {hovering && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            height: "60%",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <img
            ref={imageRef}
            height={"85%"}
            src={cardImage(name)}
            alt={name}
            style={{
              objectFit: "contain", 
              width: "auto", 
              maxWidth: "100%",
              minHeight: "85%",
            }}
          />
          <div
            style={{
              padding: "10px",
              backgroundColor: "rgba(0, 0, 0, 0.95)", 
              color: "#fff", 
              borderRadius: "5px",
              fontSize: "14px",
              lineHeight: "1.5",
              fontFamily: "Avenir",
              textAlign: "left",
              marginTop: "10px", 
              width: imageDimensions.width, 
              maxHeight: imageDimensions.height * 0.4, 
            }}
          >
            <span> {cardEffect(name)
                ? renderTextWithStyle(cardEffect(name))  
                : "No description available for this card."}</span>
          </div>
        </div>
      )}
    </>
  );
}
