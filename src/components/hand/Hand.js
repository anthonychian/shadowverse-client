import React, { useEffect, useState } from "react";
import Card from "./Card";
import { Reorder } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  placeToTopOfDeckFromHand,
  placeToBotOfDeckFromHand,
  reorderCardsInHand,
  setCurrentCard,
  placeToCemeteryFromHand,
  setEnemyArrow,
} from "../../redux/CardSlice";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { socket } from "../../sockets";

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
  const reduxRoom = useSelector((state) => state.card.room);
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
    dispatch(setEnemyArrow({ idx: -1, show: false }));
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
  const handleCardToCemetery = () => {
    handleClose();
    console.log(name);
    dispatch(placeToCemeteryFromHand(name));
  };
  const handleCardToTopOfDeck = () => {
    handleClose();
    dispatch(placeToTopOfDeckFromHand(name));
  };
  const handleCardToBotOfDeck = () => {
    handleClose();
    dispatch(placeToBotOfDeckFromHand(name));
  };
  const handleShowHand = () => {
    handleClose();
    socket.emit("send msg", {
      type: "showHand",
      data: true,
      room: reduxRoom,
    });
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
        <MenuItem onClick={handleCardToCemetery}>Cemetery</MenuItem>
        <MenuItem onClick={handleCardToTopOfDeck}>Top of Deck</MenuItem>
        <MenuItem onClick={handleCardToBotOfDeck}>Bot of Deck</MenuItem>
        <MenuItem onClick={handleShowHand}>Show Hand</MenuItem>
      </Menu>
      <Reorder.Group
        style={{
          zIndex: 100,
          display: "flex",
          // height: "20vh",
          minHeight: "160px",
          alignItems: "center",
          justifyContent: "center",
          // bottom: "-5%",
          // position: "absolute",
        }}
        axis="x"
        values={items}
        onReorder={setItems}
      >
        {items.map((card, index) => (
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
              inHandIndex={index}
              handLength={items.length}
              constraintsRef={constraintsRef}
              setDragging={setDragging}
              setHovering={setHovering}
              ready={ready}
              inHand={true}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </>
  );
}
