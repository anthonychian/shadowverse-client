import React, { useEffect, useState } from "react";
import Card from "./Card";
import { useDispatch, useSelector } from "react-redux";
import {
  placeToTopOfDeckFromHand,
  placeToBotOfDeckFromHand,
  setCurrentCard,
  setCurrentCardIndex,
  placeToCemeteryFromHand,
} from "../../redux/CardSlice";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useEngineSync } from "../hooks/useEngineSync";

export default function Hand({
  constraintsRef,
  setReady,
  setReadyToPlaceOnFieldFromHand,
  ready,
  setHovering,
}) {
  const reduxHand = useSelector((state) => state.card.hand);
  const handInstanceIds = useSelector((state) => state.card.handInstanceIds);
  const leaderActive = useSelector((state) => state.card.leaderActive);
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const legalActions = useSelector((state) => state.gameState.legalActions);
  const pendingChoices = useSelector((state) => state.gameState.pendingChoices);
  const automated = gameMode === "automated";
  const [items, setItems] = useState(reduxHand);
  const dispatch = useDispatch();
  const { sendAction } = useEngineSync();

  useEffect(() => {
    setItems(arrToObjArr(reduxHand));
  }, [reduxHand]);

  const arrToObjArr = (arr) => {
    return arr.map((x, idx) => ({ idx: idx, name: x }));
  };

  const [contextMenu, setContextMenu] = React.useState(null);
  const [name, setName] = useState("");
  const [cardIndex, setCardIndex] = useState(-1);

  const handleContextMenu = (event, name, index) => {
    setName(name);
    setCardIndex(index);
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
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
    dispatch(setCurrentCardIndex(cardIndex));
  };
  const handleCardToCemetery = () => {
    handleClose();
    console.log(name);
    dispatch(placeToCemeteryFromHand({ name: name, index: cardIndex }));
  };
  const handleCardToTopOfDeck = () => {
    handleClose();
    dispatch(placeToTopOfDeckFromHand({ name: name, index: cardIndex }));
  };
  const handleCardToBotOfDeck = () => {
    handleClose();
    dispatch(placeToBotOfDeckFromHand({ name: name, index: cardIndex }));
  };

  const getPlayMode = (index) => {
    if (!automated || pendingChoices) return null;
    const instanceId = handInstanceIds[index];
    if (!instanceId) return null;
    if (legalActions.includes(`QUICK_PLAY:${instanceId}`)) return "quick";
    if (leaderActive && legalActions.includes(`PLAY:${instanceId}`)) return "play";
    return null;
  };

  const canActivateHand = (index) => {
    const instanceId = handInstanceIds[index];
    if (!automated || !leaderActive || pendingChoices || !instanceId) return false;
    return legalActions.includes(`ACTIVATE_HAND:${instanceId}`);
  };

  const handleAutomatedPlay = (index) => {
    const instanceId = handInstanceIds[index];
    const mode = getPlayMode(index);
    if (!instanceId || !mode) return;
    if (mode === "quick") {
      sendAction({ type: "QUICK_PLAY", handInstanceId: instanceId });
    } else {
      sendAction({ type: "PLAY_CARD", handInstanceId: instanceId });
    }
  };

  const handleAutomatedActivateHand = (index) => {
    const instanceId = handInstanceIds[index ?? cardIndex];
    if (!instanceId || !canActivateHand(index ?? cardIndex)) return;
    sendAction({ type: "ACTIVATE_HAND", handInstanceId: instanceId });
    handleClose();
  };

  const handleAutomatedHandClick = (index) => {
    const playMode = getPlayMode(index);
    if (playMode) {
      handleAutomatedPlay(index);
      return;
    }
    if (canActivateHand(index)) {
      handleAutomatedActivateHand(index);
    }
  };

  const getAutomatedHandStyle = (index) => {
    const playMode = getPlayMode(index);
    const activate = canActivateHand(index);
    if (!playMode && !activate) return {};
    const style = { borderRadius: "8px", cursor: "pointer" };
    if (playMode) {
      style.outline = "3px solid #4caf50";
    } else if (activate) {
      style.outline = "3px solid #ff9800";
    }
    return style;
  };

  const getAutomatedHandTitle = (index) => {
    const playMode = getPlayMode(index);
    const activate = canActivateHand(index);
    if (playMode && activate) return "Click to play; right-click for Activate";
    if (playMode) return "Click to play";
    if (activate) return "Click to activate";
    return undefined;
  };

  const handleHandContextMenu = (event, name, index) => {
    if (automated) {
      if (!leaderActive || pendingChoices) return;
      const instanceId = handInstanceIds[index];
      if (!instanceId || (!getPlayMode(index) && !canActivateHand(index))) return;
      setName(name);
      setCardIndex(index);
      event.preventDefault();
      setContextMenu({
        mouseX: event.clientX + 2,
        mouseY: event.clientY - 6,
      });
      return;
    }
    if (!ready) handleContextMenu(event, name, index);
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
        {automated ? (
          <>
            {getPlayMode(cardIndex) === "quick" && (
              <MenuItem
                onClick={() => {
                  handleAutomatedPlay(cardIndex);
                  handleClose();
                }}
              >
                Quick Play
              </MenuItem>
            )}
            {leaderActive &&
              handInstanceIds[cardIndex] &&
              legalActions.includes(`PLAY:${handInstanceIds[cardIndex]}`) && (
                <MenuItem
                  onClick={() => {
                    handleAutomatedPlay(cardIndex);
                    handleClose();
                  }}
                >
                  Play
                </MenuItem>
              )}
            {canActivateHand(cardIndex) && (
              <MenuItem onClick={() => handleAutomatedActivateHand(cardIndex)}>
                Activate
              </MenuItem>
            )}
          </>
        ) : (
          <>
            <MenuItem onClick={handleCardToField}>Field</MenuItem>
            <MenuItem onClick={handleCardToCemetery}>Cemetery</MenuItem>
            <MenuItem onClick={handleCardToTopOfDeck}>Top of Deck</MenuItem>
            <MenuItem onClick={handleCardToBotOfDeck}>Bot of Deck</MenuItem>
          </>
        )}
      </Menu>
      <div
        style={{
          zIndex: 100,
          display: "flex",
          // height: "20em",
          width: "50vw",
          alignItems: "start",
          justifyContent: "center",
          // justifyContent: "flex-start",
          overflowX: reduxHand.length > 9 ? "scroll" : "visible",
          overflowY: reduxHand.length > 9 ? "clip" : "visible",
        }}
      >
        {items.map((card, index) => (
          <div
            onContextMenu={(e) => handleHandContextMenu(e, card.name, index)}
            onClick={() => {
              if (automated) handleAutomatedHandClick(index);
            }}
            key={card.idx}
            value={card}
            style={automated ? getAutomatedHandStyle(index) : undefined}
            title={automated ? getAutomatedHandTitle(index) : undefined}
          >
            <Card
              name={card.name}
              inHandIndex={index}
              handLength={items.length}
              constraintsRef={constraintsRef}
              setHovering={setHovering}
              ready={ready}
              inHand={true}
            />
          </div>
        ))}
      </div>
    </>
  );
}
