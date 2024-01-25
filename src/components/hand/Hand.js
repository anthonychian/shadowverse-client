import React, { useEffect, useState } from "react";
import Card from "./Card";
import { Reorder } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  placeToTopOfDeckFromHand,
  placeToBotOfDeckFromHand,
  reorderCardsInHand,
  setCurrentCard,
  placeToCemetaryFromHand,
} from "../../redux/CardSlice";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export default function Hand({
  constraintsRef,
  setReady,
  setReadyToPlaceOnFieldFromHand,
  ready,
  setDragging,
  setHovering,
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
  const objArrToArr = (obj) => {
    let res = [];
    obj.map((card) => res.push(card.name));
    return res;
  };

  const [contextMenu, setContextMenu] = React.useState(null);
  const [name, setName] = useState("");

  const handleContextMenu = (event, name) => {
    dispatch(reorderCardsInHand(objArrToArr(items)));
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
  const handleCardToField = () => {
    handleClose();
    setReady(true);
    setReadyToPlaceOnFieldFromHand(true);
    dispatch(setCurrentCard(name));
  };
  const handleCardToCemetary = () => {
    handleClose();
    console.log(name);
    dispatch(placeToCemetaryFromHand(name));
  };
  const handleCardToTopOfDeck = () => {
    handleClose();
    dispatch(placeToTopOfDeckFromHand(name));
  };
  const handleCardToBotOfDeck = () => {
    handleClose();
    dispatch(placeToBotOfDeckFromHand(name));
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
        <MenuItem onClick={handleCardToField}>Field</MenuItem>
        <MenuItem onClick={handleCardToCemetary}>Cemetary</MenuItem>
        <MenuItem onClick={handleCardToTopOfDeck}>Top of Deck</MenuItem>
        <MenuItem onClick={handleCardToBotOfDeck}>Bot of Deck</MenuItem>
      </Menu>
      <Reorder.Group
        style={{
          display: "flex",
          alignItems: "center",
          height: "20vh",
          minHeight: "200px",
          justifyContent: "center",
          // backgroundColor: "black",
        }}
        axis="x"
        values={items}
        onReorder={setItems}
      >
        {items.map((card) => (
          <Reorder.Item
            onContextMenu={(e) => {
              if (!ready) handleContextMenu(e, card.name);
            }}
            drag
            key={card.idx}
            value={card}
          >
            <Card
              name={card.name}
              constraintsRef={constraintsRef}
              setDragging={setDragging}
              setHovering={setHovering}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </>
  );
}
