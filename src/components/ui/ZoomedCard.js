import React, { useState, useRef, useEffect } from "react";
import { cardImage } from "../../decks/getCards";
import { cardEffect } from "../../decks/getEffect";
import { cardIcon } from "../../decks/getIcon";

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
            
            if (word.includes("[fanfare]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Fanfare")} // Replace with your image path or URL
                  alt="fanfare"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[evolve]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Evolve")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[act]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Act")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[attack]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Attack")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[feed]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Carrot")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[defense]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Defense")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[engage]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Engage")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[lastwords]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Lastwords")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[q]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Q")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[quick]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Quick")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost00]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost00")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost01]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost01")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost02]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost02")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost03]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost03")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost04]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost04")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost05]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost05")} // Replace with your image path or URL
                  alt="test"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost06]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost06")} // Replace with your image path or URL
                  alt="cost 6"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost07]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost07")} // Replace with your image path or URL
                  alt="cost 7"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost08]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost08")} // Replace with your image path or URL
                  alt="cost 8"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost09]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost09")} // Replace with your image path or URL
                  alt="cost 9"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost10]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("Cost10")} // Replace with your image path or URL
                  alt="cost 10"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }
            if (word.includes("[cost0X]")) {
              return (
                <img
                  key={idx}
                  src={cardIcon("CostX")} // Replace with your image path or URL
                  alt="costX"
                  style={{
                    height: "15px", // Adjust size as needed
                    verticalAlign: "text-bottom",
                  }}
                />
              );
            }

            return <span key={idx}> {word} </span>;  
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
