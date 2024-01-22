import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  placeToFieldFromHand,
  addToHandFromField,
} from "../../redux/CardSlice";
import { useDispatch, useSelector } from "react-redux";
import Card from "../hand/Card";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export default function Field({ ready, setReady }) {
  const dispatch = useDispatch();
  const reduxField = useSelector((state) => state.card.field);
  const reduxCurrentCard = useSelector((state) => state.card.currentCard);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("");

  const handleClick = (index) => {
    setReady(false);
    dispatch(
      placeToFieldFromHand({
        card: reduxCurrentCard,
        index: index,
      })
    );
  };

  const handleContextMenu = (event, index, name) => {
    console.log("INDEX", index);
    setIndex(index);
    setName(name);
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };
  const handleClose = () => {
    setContextMenu(null);
  };
  const handleCardToHand = () => {
    handleClose();
    dispatch(
      addToHandFromField({
        card: name,
        index: index,
      })
    );
  };

  return (
    <>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleCardToHand()}>Hand</MenuItem>
        <MenuItem onClick={handleClose}>Top of Deck</MenuItem>
        <MenuItem onClick={handleClose}>Graveyard</MenuItem>
      </Menu>
      <div
        style={{
          height: "80vh",
          backgroundColor: "rgba(0, 0, 0, 0.20)",
          // backgroundColor: "rgba(255, 0, 0, 0.15)",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {reduxField.map((x, idx) => (
          <>
            {ready && (
              <motion.div
                key={`enemy1-${idx}`}
                whileHover={{
                  backgroundColor: "rgba(255, 252, 160, 0.2)",
                }}
                // onClick={() => dispatch(placeToFieldFromHand())}
                style={{
                  height: "160px",
                  width: "115px",
                  backgroundColor: "rgba(0, 0, 0, 0.20)",
                  // backgroundColor: "rgba(255, 0, 0, 0.15)",
                }}
              >
                {/* <Card name={x} /> */}
              </motion.div>
            )}
            {!ready && (
              <motion.div
                key={`enemy2-${idx}`}
                style={{
                  height: "160px",
                  width: "115px",
                  backgroundColor: "rgba(0, 0, 0, 0.20)",
                }}
              >
                {/* <Card name={x} /> */}
              </motion.div>
            )}
          </>
        ))}
      </div>
      <div
        style={{
          height: "80vh",
          backgroundColor: "rgba(0, 0, 0, 0.20)",
          // backgroundColor: "rgba(0, 0, 255, 0.15)",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {reduxField.map((x, idx) => (
          <>
            {ready && (
              <motion.div
                onContextMenu={(e) =>
                  handleContextMenu(e, idx, reduxField[idx])
                }
                key={`player1-${idx}`}
                whileHover={{
                  backgroundColor: "rgba(255, 252, 160, 0.2)",
                }}
                style={{
                  height: "160px",
                  width: "115px",
                  backgroundColor: "rgba(0, 0, 255, 0.15)",
                }}
                onClick={() => handleClick(idx)}
              >
                {x !== 0 && (
                  <Card key={`card1-${idx}`} name={reduxField[idx]} />
                )}
              </motion.div>
            )}
            {!ready && (
              <motion.div
                onContextMenu={(e) =>
                  handleContextMenu(e, idx, reduxField[idx])
                }
                key={`player2-${idx}`}
                style={{
                  height: "160px",
                  width: "115px",
                  backgroundColor: "rgba(0, 0, 0, 0.20)",
                }}
              >
                {x !== 0 && (
                  <Card key={`card2-${idx}`} name={reduxField[idx]} />
                )}
              </motion.div>
            )}
          </>
        ))}
      </div>
    </>
  );
}
