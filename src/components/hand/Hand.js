import React, { useEffect, useState } from "react";
import Card from "./Card";
import { Reorder } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentCard,
  placeToTopOfDeckFromHand,
} from "../../redux/CardSlice";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export default function Hand({
  constraintsRef,
  setReady,
  setReadyToPlaceOnFieldFromHand,
}) {
  const reduxHand = useSelector((state) => state.card.hand);
  const [items, setItems] = useState(reduxHand);
  const dispatch = useDispatch();

  useEffect(() => {
    setItems(arrToObjArr(reduxHand));
  }, [reduxHand]);

  const arrToObjArr = (arr) => {
    return arr.map((x, idx) => ({ idx: idx, name: x }));
  };

  const [contextMenu, setContextMenu] = React.useState(null);
  const [name, setName] = useState("");

  const handleContextMenu = (event, name) => {
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
  const handleCardToField = (e) => {
    handleClose();
    setReady(true);
    setReadyToPlaceOnFieldFromHand(true);
    dispatch(setCurrentCard(name));
  };
  const handleCardToTopOfDeck = (e) => {
    handleClose();
    dispatch(placeToTopOfDeckFromHand(name));
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
        <MenuItem onClick={(event) => handleCardToField(event)}>Field</MenuItem>
        <MenuItem onClick={(event) => handleCardToTopOfDeck(event)}>
          Top of Deck
        </MenuItem>
        <MenuItem onClick={handleClose}>Graveyard</MenuItem>
      </Menu>
      <Reorder.Group
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: "160px",
          justifyContent: "center",
          // backgroundColor: "black",
        }}
        axis="x"
        values={items}
        onReorder={setItems}
      >
        {items.map((card) => (
          <Reorder.Item
            onContextMenu={(e) => handleContextMenu(e, card.name)}
            drag
            key={card.idx}
            value={card}
          >
            <Card name={card.name} constraintsRef={constraintsRef} />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </>
  );
}
