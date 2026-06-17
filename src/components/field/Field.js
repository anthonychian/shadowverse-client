import React, { useState, useEffect, useRef, useCallback } from "react";
import { unstable_batchedUpdates } from "react-dom";
import {
  placeToFieldFromHand,
  addToHandFromField,
  placeToTopOfDeckFromField,
  placeToBotOfDeckFromField,
  moveCardOnField,
  moveEvoAndBaseOnField,
  transferToOpponentField,
  placeToCemeteryFromField,
  placeToFieldFromDeck,
  placeToFieldFromCemetery,
  placeToFieldFromBanish,
  placeTokenOnField,
  placeToBanishFromField,
  removeTokenOnField,
  evolveCardOnField,
  advancedToField,
  feedCardOnField,
  rideCardOnField,
  backToEvolveDeck,
  advancedBackToEvolveDeck,
  setEnemyField,
  setEnemyEvoField,
  setEnemyEngaged,
  setEnemyCemetery,
  setEnemyEvoDeck,
  setEnemyCustomValues,
  showAtk,
  showDef,
  hideAtk,
  hideDef,
  modifyCounter,
  showStatus,
  hideStatus,
  duplicateCardOnField,
  clearValuesAtIndex,
  moveValuesAtIndex,
  moveCountersAtIndex,
  moveEngagedAtIndex,
  clearStatusAtIndex,
  moveStatusAtIndex,
  clearCountersAtIndex,
  clearEngagedAtIndex,
  setEnemyHand,
  setShowEnemyHand,
  setShowEnemyCard,
  setEnemyCard,
  setEnemyDeckSize,
  setEnemyEvoPoints,
  setEnemyPlayPoints,
  setEnemyHealth,
  setEnemyLeader,
  setEnemyCounter,
  setEnemyAura,
  setEnemyBane,
  setEnemyWard,
  toggleKeyword,
  setEnemyKeyword,
  setEnemyBanish,
  setEnemyViewingDeck,
  setEnemyViewingHand,
  setEnemyViewingCemetery,
  setEnemyViewingEvoDeck,
  setEnemyViewingCemeteryOpponent,
  setEnemyViewingEvoDeckOpponent,
  setEnemyViewingTopCards,
  setEnemyRematchStatus,
  setEnemyDice,
  setEnemyLog,
  setEnemyChat,
  setEnemyOnlineStatus,
  setLastChatMessage,
  setEnemyLeaderActive,
  setEnemySuperEvoActive,
  setField,
  setEnemyCardBack,
  setCardSelectedInHand,
  setEnemyCardSelectedInHand,
  setCardSelectedOnField,
  setEnemyCardSelectedOnField,
  setRoom,
  setSelfOnlineStatus,
  restoreOwnState,
} from "../../redux/CardSlice";
import { artImage } from "../../decks/getCards";
import { motion } from "framer-motion";
import CardMUI from "@mui/material/Card";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem, Modal, Box, Typography, Tooltip } from "@mui/material";
import Card from "../hand/Card";
import Deck from "./Deck";
import Cemetery from "./Cemetery";
import EnemyCemetery from "./EnemyCemetery";
// import cardback from "../../assets/cardbacks/default.png";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EvoDeck from "./EvoDeck";
import EnemyEvoDeck from "./EnemyEvoDeck";
import img from "../../assets/pin_bellringer_angel.png";
import "../../css/AnimatedBorder.css";
import { useNavigate } from "react-router-dom";
import { socket, playerId, getSavedRoom, getSavedState } from "../../sockets";
import useSocketStateSync from "../hooks/useSocketStateSync";
import useReceiveFullState from "../hooks/useReceiveFullState";
import useStoreState from "../hooks/useStoreState";
import useHeartbeat from "../hooks/useHeartbeat";
import { useEngineSync } from "../hooks/useEngineSync";
import { useUiChromeVisible, useUiModalOpen } from "../hooks/useUiChromeVisible";
import HideUiButton, { ModalHideUiRow } from "../ui/HideUiButton";
import { setSelectedAttackerId } from "../../redux/GameStateSlice";
import { getNameByCardNoClient } from "../../engine/cardLookup";

import Token from "./Token";
import ShowDice from "./ShowDice";
import { playGameAnimation, triggerGameAnimation } from "./animationBus";
import { DeckFx, EvoLayer } from "./GameFx";
import {
  registerFieldGrid,
  registerEnemyFieldGrid,
  registerEnemyHand,
  fieldSlotCenter,
  enemyFieldSlotCenter,
  enemyHandCenter,
} from "./handDrag";
import FieldDropHints from "./FieldDropHints";
import DiceRoll from "./DiceRoll";
import PlayReveal from "./PlayReveal";
import {
  triggerCardReveal,
  triggerHandReveal,
  playCardReveal,
  onHideChange,
  isHidden,
} from "./cardRevealBus";

import defaultCardBack from "../../assets/cardbacks/default.png";
import aeneaCardBack from "../../assets/cardbacks/aenea.png";
import dionneCardBack from "../../assets/cardbacks/dionne.png";
import dragonCardBack from "../../assets/cardbacks/dragon.png";
import fileneCardBack from "../../assets/cardbacks/filene.png";
import galmieuxCardBack from "../../assets/cardbacks/galmieux.png";
import jeanneCardBack from "../../assets/cardbacks/jeanne.png";
import kuonCardBack from "../../assets/cardbacks/kuon.png";
import ladicaCardBack from "../../assets/cardbacks/ladica.png";
import lishennaCardBack from "../../assets/cardbacks/lishenna.png";
import lishenna2CardBack from "../../assets/cardbacks/lishenna2.png";
import mistolinaCardBack from "../../assets/cardbacks/mistolina.png";
import monoCardBack from "../../assets/cardbacks/mono.png";
import orchisCardBack from "../../assets/cardbacks/orchis.png";
import piercyeCardBack from "../../assets/cardbacks/piercye.png";
import rosequeenCardBack from "../../assets/cardbacks/rosequeen.png";
import shikiCardBack from "../../assets/cardbacks/shiki.png";
import shutenCardBack from "../../assets/cardbacks/shuten.png";
import tidalgunnerCardBack from "../../assets/cardbacks/tidalgunner.png";
import viridiaCardBack from "../../assets/cardbacks/viridia.png";
import wilbertCardBack from "../../assets/cardbacks/wilbert.png";

const style = {
  position: "relative",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "transparent",
  boxShadow: 24,
  p: 3,
  width: "55%",
};

// Responsive board-scaling constants (see the scaling effect in Field).
const BASE_WIDTH = 1100; // design width of the board in px (kept compact so cards render large; field still wide enough for engaged-card spacing)
const TOP_RESERVE = 200; // vertical space kept above the field for the opponent's hand
const BOTTOM_RESERVE = 210; // vertical space kept below the field for the player's hand
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.3;

// Keyword statuses offered by "Add Status", shown as black boxes on the card.
const KEYWORDS = ["Aura", "Ward", "Bane", "Storm", "Rush", "Intimidate"];

export default function Field({
  ready,
  setReady,
  setHovering,
  readyToPlaceOnFieldFromHand,
  setReadyToPlaceOnFieldFromHand,
  onScaleChange,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // redux state
  const reduxRoom = useSelector((state) => state.card.room);
  const reduxField = useSelector((state) => state.card.field);
  const reduxCurrentCard = useSelector((state) => state.card.currentCard);
  const reduxCurrentCardIndex = useSelector(
    (state) => state.card.currentCardIndex,
  );
  const reduxEvoField = useSelector((state) => state.card.evoField);
  const reduxEngaged = useSelector((state) => state.card.engagedField);
  const reduxCustomStatus = useSelector((state) => state.card.customStatus);
  const reduxCustomValues = useSelector((state) => state.card.customValues);
  const reduxEnemyCustomValues = useSelector(
    (state) => state.card.enemyCustomValues,
  );
  const reduxEnemyField = useSelector((state) => state.card.enemyField);
  const reduxEnemyEvoField = useSelector((state) => state.card.enemyEvoField);
  const reduxEnemyEngaged = useSelector(
    (state) => state.card.enemyEngagedField,
  );
  const reduxCurrentDeck = useSelector((state) => state.card.deck);
  const reduxCurrentRoom = useSelector((state) => state.card.room);
  const reduxEnemyHand = useSelector((state) => state.card.enemyHand);
  const reduxEnemyDeckSize = useSelector((state) => state.card.enemyDeckSize);
  const reduxShowEnemyHand = useSelector((state) => state.card.showEnemyHand);
  const reduxShowEnemyCard = useSelector((state) => state.card.showEnemyCard);
  const reduxEnemyCard = useSelector((state) => state.card.enemyCard);
  const reduxEnemyArt = useSelector((state) => state.card.enemyArt);
  const reduxCounterField = useSelector((state) => state.card.counterField);
  const reduxExPlayCostField = useSelector((state) => state.card.exPlayCostField);
  const reduxEnemyExPlayCostField = useSelector(
    (state) => state.card.enemyExPlayCostField,
  );
  const reduxEnemyCounterField = useSelector(
    (state) => state.card.enemyCounterField,
  );
  const reduxAuraField = useSelector((state) => state.card.auraField);
  const reduxEnemyAuraField = useSelector((state) => state.card.enemyAuraField);
  const reduxBaneField = useSelector((state) => state.card.baneField);
  const reduxEnemyBaneField = useSelector((state) => state.card.enemyBaneField);
  const reduxWardField = useSelector((state) => state.card.wardField);
  const reduxEnemyWardField = useSelector((state) => state.card.enemyWardField);
  const reduxKeywordField = useSelector((state) => state.card.keywordField);
  const reduxEnemyKeywordField = useSelector(
    (state) => state.card.enemyKeywordField,
  );
  const reduxEnemyCardBack = useSelector((state) => state.card.enemyCardback);
  const reduxCardSelectedInHand = useSelector(
    (state) => state.card.cardSelectedInHand,
  );
  const reduxCardSelectedOnField = useSelector(
    (state) => state.card.cardSelectedOnField,
  );
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const automated = gameMode === "automated";
  const fieldInstanceIds = useSelector((state) => state.card.fieldInstanceIds);
  const enemyFieldInstanceIds = useSelector((state) => state.card.enemyFieldInstanceIds);
  const legalActions = useSelector((state) => state.gameState.legalActions);
  const selectedAttackerId = useSelector((state) => state.gameState.selectedAttackerId);
  const leaderActive = useSelector((state) => state.card.leaderActive);
  const pendingChoices = useSelector((state) => state.gameState.pendingChoices);
  const engineView = useSelector((state) => state.gameState.engineView);
  const playerSlot = useSelector((state) => state.gameState.playerSlot);
  const { sendAction } = useEngineSync();
  const chromeVisible = useUiChromeVisible();
  const enemyHandModalOpen = useUiModalOpen(reduxShowEnemyHand);
  const enemyCardModalOpen = useUiModalOpen(reduxShowEnemyCard);

  // useState
  const [cardback, setCardback] = useState();
  const [contextMenu, setContextMenu] = useState(null);
  const [contextEvoMenu, setContextEvoMenu] = useState(null);
  const [index, setIndex] = useState(0);
  const [deckIndex, setDeckIndex] = useState(0);
  const [name, setName] = useState("");
  const [readyToMoveOnField, setReadyToMoveOnField] = useState(false);
  const [readyToMoveEvoOnField, setReadyToMoveEvoOnField] = useState(false);
  const [readyToDuplicateOnField, setReadyToDuplicateOnField] = useState(false);
  const [readyFromDeck, setReadyFromDeck] = useState(false);
  const [readyFromCemetery, setReadyFromCemetery] = useState(false);
  const [readyFromBanish, setReadyFromBanish] = useState(false);
  const [readyToEvo, setReadyToEvo] = useState(false);
  const [readyToAdvanced, setReadyToAdvanced] = useState(false);
  const [readyToFeed, setReadyToFeed] = useState(false);
  const [readyToRide, setReadyToRide] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);
  const [automatedFieldMenu, setAutomatedFieldMenu] = useState(null);

  // --- Responsive board scaling -------------------------------------------
  // The board is authored at a fixed "design size" (BASE_WIDTH x its natural
  // height) with many pixel-tuned overlays (atk/def, counters, deck counts).
  // Instead of re-tuning every nested value per breakpoint, we scale the whole
  // board uniformly to fit the available width and the viewport height. Because
  // every card and overlay scales together, alignment is preserved exactly at
  // any laptop / monitor / iPad resolution.
  const boardWrapperRef = useRef(null);
  const boardRef = useRef(null);
  const [boardScale, setBoardScale] = useState(1);

  // Re-render when the set of mid-reveal (hidden) field slots changes, so a
  // played card pops into view exactly when its reveal animation lands.
  const [, bumpHidden] = useState(0);
  useEffect(() => onHideChange(() => bumpHidden((n) => n + 1)), []);

  useEffect(() => {
    const wrapper = boardWrapperRef.current;
    const board = boardRef.current;
    if (!wrapper || !board) return;

    const update = () => {
      const availWidth = wrapper.clientWidth;
      const availHeight = window.innerHeight - TOP_RESERVE - BOTTOM_RESERVE;
      const naturalHeight = board.offsetHeight; // field rows, unaffected by the transform
      if (!availWidth || !naturalHeight) return;
      const fit = Math.min(availWidth / BASE_WIDTH, availHeight / naturalHeight);
      const scale = Math.max(MIN_SCALE, Math.min(fit, MAX_SCALE));
      setBoardScale(scale);
      // Report the scale up so sibling UI (HP, leader, play points, chat) can
      // shrink by the same factor and stay visually consistent with the board.
      if (onScaleChange) onScaleChange(scale);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    ro.observe(board);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [onScaleChange]);

  useSocketStateSync();
  useReceiveFullState();
  useStoreState();
  useHeartbeat();

  useEffect(() => {
    const handleReconnect = () => {
      if (!reduxRoom) return;
      console.log("Reconnected with socket id:", socket.id);
      if (automated) {
        socket.emit("request_engine_state");
        return;
      }
      socket.emit("rejoin_room", reduxRoom);
      socket.emit("request_stored_state", { room: reduxRoom, playerId });
    };

    if (socket.connected) {
      handleReconnect();
    }

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [reduxRoom, automated]);

  // Per-sender sequence tracking for gap detection: { [senderId]: lastSeq }
  const lastSeqBySenderRef = useRef({});
  // Throttle full-state resync requests so a burst of gaps can't storm.
  const lastResyncRef = useRef(0);

  const requestResync = useCallback(() => {
    if (!reduxRoom) return;
    const now = Date.now();
    if (now - lastResyncRef.current < 1500) return;
    lastResyncRef.current = now;
    console.log("[resync] requesting full state from opponent");
    socket.emit("request_state", { room: reduxRoom });
  }, [reduxRoom]);

  // Process a single update (batched with others)
  const handleUpdate = useCallback(
    (update) => {
      switch (update.type) {
        case "field":
          dispatch(setEnemyField(update.data));
          break;
        case "evoField":
          dispatch(setEnemyEvoField(update.data));
          break;
        case "engaged":
          dispatch(setEnemyEngaged(update.data));
          break;
        case "cemetery":
          dispatch(setEnemyCemetery(update.data));
          break;
        case "evoDeck":
          dispatch(setEnemyEvoDeck(update.data));
          break;
        case "values":
          dispatch(setEnemyCustomValues(update.data));
          break;
        case "hand":
          dispatch(setEnemyHand(update.data));
          break;
        case "deckSize":
          dispatch(setEnemyDeckSize(update.data));
          break;
        case "evoPoints":
          dispatch(setEnemyEvoPoints(update.data));
          break;
        case "playPoints":
          dispatch(setEnemyPlayPoints(update.data));
          break;
        case "health":
          dispatch(setEnemyHealth(update.data));
          break;
        case "leader":
          dispatch(setEnemyLeader(update.data));
          break;
        case "showHand":
          dispatch(setShowEnemyHand(update.data));
          break;
        case "showCard":
          dispatch(setShowEnemyCard(update.data));
          break;
        case "cardRevealed":
          dispatch(setEnemyCard(update.data));
          break;
        case "transfer":
          dispatch(setField(update.data));
          break;
        case "counter":
          dispatch(setEnemyCounter(update.data));
          break;
        case "aura":
          dispatch(setEnemyAura(update.data));
          break;
        case "bane":
          dispatch(setEnemyBane(update.data));
          break;
        case "ward":
          dispatch(setEnemyWard(update.data));
          break;
        case "keyword":
          dispatch(setEnemyKeyword(update.data));
          break;
        case "banish":
          dispatch(setEnemyBanish(update.data));
          break;
        case "viewingHand":
          dispatch(setEnemyViewingHand(update.data));
          break;
        case "viewingDeck":
          dispatch(setEnemyViewingDeck(update.data));
          break;
        case "viewingTopCards":
          dispatch(setEnemyViewingTopCards(update.data));
          break;
        case "viewingCemetery":
          dispatch(setEnemyViewingCemetery(update.data));
          break;
        case "viewingEvoDeck":
          dispatch(setEnemyViewingEvoDeck(update.data));
          break;
        case "viewingCemeteryOpponent":
          dispatch(setEnemyViewingCemeteryOpponent(update.data));
          break;
        case "viewingEvoDeckOpponent":
          dispatch(setEnemyViewingEvoDeckOpponent(update.data));
          break;
        case "dice":
          dispatch(setEnemyDice(update.data));
          break;
        case "leaderActive":
          dispatch(setEnemyLeaderActive(update.data));
          break;
        case "superEvoActive":
          dispatch(setEnemySuperEvoActive(update.data));
          break;
        case "log":
          dispatch(setEnemyLog(update.data));
          break;
        case "cardback":
          dispatch(setEnemyCardBack(update.data));
          break;
        case "rematch":
          dispatch(setEnemyRematchStatus(update.data));
          break;
        case "cardSelected":
          dispatch(setEnemyCardSelectedInHand(update.data));
          break;
        case "cardSelectedField":
          dispatch(setEnemyCardSelectedOnField(update.data));
          break;
        case "chat":
          dispatch(setEnemyChat(update.data));
          dispatch(setLastChatMessage(update.data));
          break;
        case "animate":
          // Cosmetic-only effect the opponent played (draw / shuffle / evolve).
          // Replay it on their half of our board so both players see it.
          playGameAnimation({ kind: update.data, side: "enemy" });
          break;
        case "cardToHand":
          // Opponent added a card to hand — reveal it centre-screen and fly it
          // up to their hand (the top hand on our screen).
          playCardReveal({
            name: (update.data || {}).name,
            side: "enemy",
            kind: "hand",
            target: enemyHandCenter(),
          });
          break;
        case "cardPlayed": {
          // Opponent played a card to the field — reveal it centre-screen and
          // fly it onto its slot on their (top) board; the card stays hidden
          // there until the reveal lands. Their field index maps to our enemy
          // grid cell via cardPos.
          const { name: playedName, index: playedIndex } = update.data || {};
          // Map their field index to our enemy-grid cell (same as cardPos).
          const cell = playedIndex < 5 ? playedIndex + 5 : playedIndex - 5;
          playCardReveal({
            name: playedName,
            side: "enemy",
            index: playedIndex,
            target: enemyFieldSlotCenter(cell),
          });
          break;
        }
        case "full_state_sync":
          // Handle full state synchronization (used on reconnection)
          // This bypasses the queue and directly updates all state
          const fullState = update.data;
          if (fullState) {
            unstable_batchedUpdates(() => {
              if (fullState.enemyField !== undefined)
                dispatch(setEnemyField(fullState.enemyField));
              if (fullState.enemyEvoField !== undefined)
                dispatch(setEnemyEvoField(fullState.enemyEvoField));
              if (fullState.enemyHand !== undefined)
                dispatch(setEnemyHand(fullState.enemyHand));
              if (fullState.enemyLeader !== undefined)
                dispatch(setEnemyLeader(fullState.enemyLeader));
              if (fullState.enemyHealth !== undefined)
                dispatch(setEnemyHealth(fullState.enemyHealth));
              if (fullState.enemyPlayPoints !== undefined)
                dispatch(setEnemyPlayPoints(fullState.enemyPlayPoints));
              if (fullState.enemyEvoPoints !== undefined)
                dispatch(setEnemyEvoPoints(fullState.enemyEvoPoints));
              if (fullState.enemyDeckSize !== undefined)
                dispatch(setEnemyDeckSize(fullState.enemyDeckSize));
              if (fullState.enemyCemetery !== undefined)
                dispatch(setEnemyCemetery(fullState.enemyCemetery));
              if (fullState.enemyCardBack !== undefined)
                dispatch(setEnemyCardBack(fullState.enemyCardBack));
              if (fullState.enemyCounter !== undefined)
                dispatch(setEnemyCounter(fullState.enemyCounter));
              if (fullState.enemyAura !== undefined)
                dispatch(setEnemyAura(fullState.enemyAura));
              if (fullState.enemyBane !== undefined)
                dispatch(setEnemyBane(fullState.enemyBane));
              if (fullState.enemyWard !== undefined)
                dispatch(setEnemyWard(fullState.enemyWard));
              if (fullState.enemyKeyword !== undefined)
                dispatch(setEnemyKeyword(fullState.enemyKeyword));
              if (fullState.enemyBanish !== undefined)
                dispatch(setEnemyBanish(fullState.enemyBanish));
              if (fullState.enemyCustomValues !== undefined)
                dispatch(setEnemyCustomValues(fullState.enemyCustomValues));
              if (fullState.enemyDice !== undefined)
                dispatch(setEnemyDice(fullState.enemyDice));
              if (fullState.enemyLeaderActive !== undefined)
                dispatch(setEnemyLeaderActive(fullState.enemyLeaderActive));
              if (fullState.enemySuperEvoActive !== undefined)
                dispatch(setEnemySuperEvoActive(fullState.enemySuperEvoActive));
              if (fullState.enemyLog !== undefined)
                dispatch(setEnemyLog(fullState.enemyLog));
            });
          }
          break;
        case "heartbeat":
          // Liveness ping (see useHeartbeat). Carries no state — its only job is
          // to advance the sender's sequence number so the gap detector in
          // handleMessage can spot a lost prior message. Nothing to apply here.
          break;
        default:
          console.warn("Unknown update type:", update.type);
      }
    },
    [dispatch],
  );

  // Apply a single message (which may carry one update or a batch of updates).
  // Every update carries the full new value of a field (last-write-wins), so
  // applying the newest message is always safe — the only risk is a *missing*
  // field update, which gap detection in handleMessage repairs via resync.
  const applyMessage = useCallback(
    (message) => {
      if (message.updates && Array.isArray(message.updates)) {
        unstable_batchedUpdates(() => {
          message.updates.forEach((update) => handleUpdate(update));
        });
      } else {
        unstable_batchedUpdates(() => handleUpdate(message));
      }
    },
    [handleUpdate],
  );

  useEffect(() => {
    const handleMessage = (data) => {
      const sender = data._from;
      const seq = data._seq;

      // Legacy / untagged message (no sequence info) — just apply it.
      if (sender === undefined || seq === undefined) {
        applyMessage(data);
        return;
      }

      const seen = lastSeqBySenderRef.current;
      const last = seen[sender];

      if (last === undefined) {
        // First message from this opponent this session. If it doesn't start
        // at 1, or another opponent id was already tracked (opponent
        // reconnected with a new socket id), we may have missed earlier
        // updates — pull a full state to be safe.
        const sawOtherSender = Object.keys(seen).length > 0;
        seen[sender] = seq;
        applyMessage(data);
        if (seq > 1 || sawOtherSender) requestResync();
        return;
      }

      if (seq === last) {
        // Exact duplicate (e.g. a replayed packet) — ignore.
        return;
      }

      if (seq < last) {
        // Sequence went backwards => the server/socket counter reset
        // (server restart or socket reuse). Re-baseline and resync.
        seen[sender] = seq;
        applyMessage(data);
        requestResync();
        return;
      }

      if (seq > last + 1) {
        // Gap: one or more updates were lost. Apply the newest value, then
        // resync to repair any field whose only update fell in the gap.
        seen[sender] = seq;
        applyMessage(data);
        requestResync();
        return;
      }

      // In order (seq === last + 1).
      seen[sender] = seq;
      applyMessage(data);
    };

    socket.on("receive msg", handleMessage);
    socket.on("online", () => dispatch(setEnemyOnlineStatus(true)));
    socket.on("offline", () => dispatch(setEnemyOnlineStatus(false)));

    return () => {
      socket.off("receive msg", handleMessage);
      socket.off("online");
      socket.off("offline");
    };
  }, [dispatch, applyMessage, requestResync]);

  useEffect(() => {
    if (reduxCurrentRoom.length === 0) {
      // The `card` slice isn't persisted, so a hard reload lands here with an
      // empty room. If we remembered a room (i.e. the player didn't explicitly
      // leave), restore it and let the reconnect effect rejoin + pull state,
      // instead of bouncing back to the home screen.
      const saved = getSavedRoom();
      if (saved) {
        dispatch(setRoom(saved));
        // Restore the player's OWN board immediately from this tab's saved
        // snapshot, before any server round-trip. This is what makes the board
        // survive a reload even if the server restarted and lost its copy. The
        // reconnect effect still rejoins + pulls the opponent's live state.
        const savedState = getSavedState(saved);
        if (savedState) dispatch(restoreOwnState(savedState));
      } else {
        navigate("/");
      }
    }
  }, [reduxCurrentRoom, navigate, dispatch]);

  // Track this client's own connection so the UI can show a disconnected
  // indicator (the WifiOff icon) while we're offline / reconnecting.
  useEffect(() => {
    const onConnect = () => dispatch(setSelfOnlineStatus(true));
    const onDisconnect = () => dispatch(setSelfOnlineStatus(false));
    dispatch(setSelfOnlineStatus(socket.connected));
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setCardSelectedInHand(-1));
  }, [reduxEnemyHand, dispatch]);

  useEffect(() => {
    dispatch(setCardSelectedOnField(-1));
  }, [reduxEnemyField, dispatch]);

  const handleModalClose = () => {
    dispatch(setShowEnemyHand(false));
  };

  const handleShowCardModalClose = () => {
    dispatch(setShowEnemyCard(false));
  };

  const cardPos = (idx) => {
    if (idx === -1) return -1;
    else if (idx < 5) return idx + 5;
    else return idx - 5;
  };

  const isToken = (name) => {
    return name.slice(-5) === "TOKEN";
  };
  const isAdvanced = (name) => {
    return name.slice(-8) === "ADVANCED";
  };

  const handleClick = (name, indexClicked) => {
    // The card placed onto an empty slot this click (any source), so the
    // "played" reveal fires once at the end — but only for the field itself
    // (top row, indices 0-4), never the EX area (bottom row, 5-9).
    let playedCard = null;
    if (reduxField[indexClicked] === 0 && !readyToEvo && !readyToFeed) {
      if (readyToPlaceOnFieldFromHand) {
        setReadyToPlaceOnFieldFromHand(false);
        dispatch(
          placeToFieldFromHand({
            card: reduxCurrentCard,
            indexInHand: reduxCurrentCardIndex,
            index: indexClicked,
          }),
        );
        playedCard = reduxCurrentCard;
      }
      if (tokenReady) {
        setTokenReady(false);
        dispatch(
          placeTokenOnField({
            card: name,
            index: indexClicked,
          }),
        );
        playedCard = name;
        // dispatch(clearValuesAtIndex(index));
        // dispatch(clearEngagedAtIndex(index));
        // dispatch(clearCountersAtIndex(index));
      }
      if (readyToAdvanced) {
        setReadyToAdvanced(false);
        dispatch(
          advancedToField({
            card: name,
            indexInEvolveDeck: reduxCurrentCardIndex,
            index: indexClicked,
          }),
        );
        playedCard = name;
      }
      if (readyToMoveOnField) {
        setReadyToMoveOnField(false);
        dispatch(
          moveCardOnField({
            card: name,
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(
          moveValuesAtIndex({
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(
          moveCountersAtIndex({
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(
          moveEngagedAtIndex({
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(
          moveStatusAtIndex({
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
        // Reveal when promoting a card from the EX area (5-9) up to the field.
        if (index >= 5) playedCard = name;
      }
      if (readyToMoveEvoOnField) {
        setReadyToMoveEvoOnField(false);
        dispatch(
          moveEvoAndBaseOnField({
            card: name,
            evoCard: name,
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(
          moveValuesAtIndex({
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(
          moveCountersAtIndex({
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(
          moveEngagedAtIndex({
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(
          moveStatusAtIndex({
            prevIndex: index,
            index: indexClicked,
          }),
        );
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
        // Reveal when promoting an evolved card from the EX area up to the field.
        if (index >= 5) playedCard = name;
      }
      if (readyToDuplicateOnField) {
        setReadyToDuplicateOnField(false);
        dispatch(
          duplicateCardOnField({
            card: name,
            index: indexClicked,
          }),
        );
        dispatch(
          moveValuesAtIndex({
            prevIndex: index,
            index: indexClicked,
          }),
        );
        // dispatch(clearValuesAtIndex(indexClicked));
        dispatch(clearEngagedAtIndex(indexClicked));
        dispatch(clearCountersAtIndex(indexClicked));
      }
      if (readyFromDeck) {
        setReadyFromDeck(false);
        console.log("name", name);
        console.log("indexClicked", indexClicked);
        dispatch(
          placeToFieldFromDeck({
            card: name,
            index: indexClicked,
            deckIndex: deckIndex,
          }),
        );
        playedCard = name;
      }
      if (readyFromCemetery) {
        setReadyFromCemetery(false);
        dispatch(
          placeToFieldFromCemetery({
            card: name,
            indexInHand: reduxCurrentCardIndex,
            index: indexClicked,
          }),
        );
        playedCard = name;
      }
      if (readyFromBanish) {
        setReadyFromBanish(false);
        dispatch(
          placeToFieldFromBanish({
            card: name,
            indexInHand: reduxCurrentCardIndex,
            index: indexClicked,
          }),
        );
        playedCard = name;
      }
      // Reveal a card played to the field (top row only; EX area 5-9 is silent).
      if (playedCard !== null && indexClicked < 5)
        triggerCardReveal(
          playedCard,
          reduxCurrentRoom,
          indexClicked,
          fieldSlotCenter(indexClicked),
        );
    } else if (
      (readyToFeed || readyToEvo || readyToRide) &&
      reduxField[indexClicked] !== 0 &&
      reduxEvoField[indexClicked] === 0
    ) {
      if (readyToEvo) {
        setReadyToEvo(false);
        dispatch(
          evolveCardOnField({
            card: name,
            indexInEvolveDeck: reduxCurrentCardIndex,
            index: indexClicked,
          }),
        );
        triggerGameAnimation("evolve", reduxCurrentRoom);
      }
      if (readyToRide) {
        setReadyToRide(false);
        dispatch(
          rideCardOnField({
            card: name,
            index: indexClicked,
            indexInEvolveDeck: reduxCurrentCardIndex,
          }),
        );
      }
      if (readyToFeed) {
        setReadyToFeed(false);
        dispatch(
          feedCardOnField({
            card: name,
            index: indexClicked,
            carrots: 1,
            indexInEvolveDeck: reduxCurrentCardIndex,
          }),
        );
      }
    } else if (
      readyToFeed &&
      reduxField[indexClicked] !== 0 &&
      reduxEvoField[indexClicked].slice(0, 6) === "Carrot"
    ) {
      dispatch(
        feedCardOnField({
          card: name,
          index: indexClicked,
          carrots: 2,
          indexInEvolveDeck: reduxCurrentCardIndex,
        }),
      );
    } else {
      console.log("there is already a card here");
      setReadyToEvo(false);
      setReadyToAdvanced(false);
      setReadyToFeed(false);
      setReadyFromCemetery(false);
      setReadyFromBanish(false);
      setReadyToPlaceOnFieldFromHand(false);
      setReadyToMoveOnField(false);
      setReadyToMoveEvoOnField(false);
      setTokenReady(false);
    }
    setReady(false);
  };

  const cancelClick = () => {
    setReady(false);

    setReadyToEvo(false);
    setReadyToAdvanced(false);
    setReadyToFeed(false);
    setReadyFromCemetery(false);
    setReadyFromBanish(false);
    setReadyToPlaceOnFieldFromHand(false);
    setReadyToMoveOnField(false);
    setReadyToMoveEvoOnField(false);
    setTokenReady(false);
  };

  const handleContextMenu = (event, index, name) => {
    setIndex(index);
    setName(name);
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
  const handleEvoContextMenu = (event, index, name) => {
    setIndex(index);
    setName(name);
    event.preventDefault();
    setContextEvoMenu(
      contextEvoMenu === null
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
  const handleEvoClose = () => {
    setContextEvoMenu(null);
  };
  const handleCardToHandFromField = () => {
    handleClose();
    dispatch(
      addToHandFromField({
        card: name,
        index: index,
      }),
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
    triggerHandReveal(name, reduxCurrentRoom);
  };
  const handleCardToTopDeck = () => {
    handleClose();
    dispatch(
      placeToTopOfDeckFromField({
        card: name,
        index: index,
      }),
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };
  const handleCardToBotDeck = () => {
    handleClose();
    dispatch(
      placeToBotOfDeckFromField({
        card: name,
        index: index,
      }),
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };
  const handleRemoveTokenFromField = () => {
    handleClose();
    dispatch(
      removeTokenOnField({
        card: name,
        index: index,
      }),
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };
  const handleDuplicateToken = () => {
    handleClose();
    setReady(true);
    setReadyToDuplicateOnField(true);
  };

  const handleCardToCemetery = () => {
    handleClose();
    dispatch(
      placeToCemeteryFromField({
        card: name,
        index: index,
      }),
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };
  const handleCardToBanish = () => {
    handleClose();
    dispatch(
      placeToBanishFromField({
        card: name,
        index: index,
      }),
    );
    dispatch(clearValuesAtIndex(index));
    dispatch(clearEngagedAtIndex(index));
    dispatch(clearCountersAtIndex(index));
    dispatch(clearStatusAtIndex(index));
  };

  const handleShowAtkDef = () => {
    handleClose();
    handleEvoClose();
    dispatch(showAtk(index));
    dispatch(showDef(index));
  };

  const handleHideAtkDef = () => {
    handleClose();
    handleEvoClose();
    dispatch(hideAtk(index));
    dispatch(hideDef(index));
  };

  const handleShowStatus = () => {
    // handleClose();
    // handleEvoClose();
    dispatch(showStatus(index));
  };

  const handleHideStatus = () => {
    // handleClose();
    // handleEvoClose();
    dispatch(hideStatus(index));
  };

  // Toggle a keyword status (Aura/Ward/Bane/Storm/Rush/Intimidate) on the card,
  // shown as a black box. The context menu is deliberately left OPEN here so
  // several keywords can be checked in one go; other menu items still close it.
  const handleToggleKeyword = (keyword) => {
    dispatch(showStatus(index));
    dispatch(toggleKeyword({ index, keyword }));
  };

  const handleAddCounter = () => {
    handleClose();
    handleEvoClose();
    dispatch(
      modifyCounter({
        value: 1,
        index: index,
      }),
    );
  };

  // Shared move logic (base or evo) used by drag-to-move. Mirrors the
  // readyToMove* click flow: move the card plus its values/counters/engaged/
  // status to the new slot, then clear the old slot.
  const moveFieldCard = (cardName, fromIndex, toIndex, isEvo) => {
    if (isEvo) {
      dispatch(
        moveEvoAndBaseOnField({
          card: cardName,
          evoCard: cardName,
          prevIndex: fromIndex,
          index: toIndex,
        }),
      );
    } else {
      dispatch(
        moveCardOnField({ card: cardName, prevIndex: fromIndex, index: toIndex }),
      );
    }
    dispatch(moveValuesAtIndex({ prevIndex: fromIndex, index: toIndex }));
    dispatch(moveCountersAtIndex({ prevIndex: fromIndex, index: toIndex }));
    dispatch(moveEngagedAtIndex({ prevIndex: fromIndex, index: toIndex }));
    dispatch(moveStatusAtIndex({ prevIndex: fromIndex, index: toIndex }));
    dispatch(clearValuesAtIndex(fromIndex));
    dispatch(clearEngagedAtIndex(fromIndex));
    dispatch(clearCountersAtIndex(fromIndex));
    dispatch(clearStatusAtIndex(fromIndex));
  };

  const clearFieldSlot = (i) => {
    dispatch(clearValuesAtIndex(i));
    dispatch(clearEngagedAtIndex(i));
    dispatch(clearCountersAtIndex(i));
    dispatch(clearStatusAtIndex(i));
  };

  // Drop handler for dragging the player's own field cards. `dest` is one of:
  //   { type: "field", index } -> move to an empty slot
  //   { type: "cemetery" }     -> send to cemetery
  //   { type: "hand" }         -> return to hand
  // Anything invalid is a no-op (the card snaps back). Cemetery/Hand mirror the
  // right-click menu, which only offers them for plain base cards: tokens and
  // advanced cards can't be returned, and the reducers don't unwind an evolved
  // stack — so those are skipped for cemetery/hand (they can still be moved).
  const handleFieldDrop = (fromIndex, dest) => {
    const isEvo = reduxEvoField[fromIndex] !== 0;
    const baseCard = reduxField[fromIndex];
    const canReturn =
      !isEvo &&
      typeof baseCard === "string" &&
      !isToken(baseCard) &&
      !isAdvanced(baseCard);
    if (dest.type === "cemetery") {
      if (!canReturn) return;
      dispatch(placeToCemeteryFromField({ card: baseCard, index: fromIndex }));
      clearFieldSlot(fromIndex);
      return;
    }
    if (dest.type === "hand") {
      if (!canReturn) return;
      dispatch(addToHandFromField({ card: baseCard, index: fromIndex }));
      clearFieldSlot(fromIndex);
      triggerHandReveal(baseCard, reduxCurrentRoom);
      return;
    }
    // field move
    const toIndex = dest.index;
    if (toIndex < 0 || toIndex === fromIndex) return;
    if (reduxField[toIndex] !== 0) return;
    const cardName = isEvo ? reduxEvoField[fromIndex] : reduxField[fromIndex];
    if (!cardName || cardName === 0) return;
    moveFieldCard(cardName, fromIndex, toIndex, isEvo);
    // Promoting from the EX area (5-9) up to the field (0-4) plays the reveal.
    if (fromIndex >= 5 && toIndex < 5)
      triggerCardReveal(cardName, reduxCurrentRoom, toIndex, fieldSlotCenter(toIndex));
  };

  const handleMoveOnField = () => {
    handleClose();
    setReady(true);
    setReadyToMoveOnField(true);
  };
  const handleMoveEvoOnField = () => {
    handleEvoClose();
    setReady(true);
    setReadyToMoveEvoOnField(true);
  };

  const handleTransfer = () => {
    handleClose();
    dispatch(
      transferToOpponentField({
        card: name,
        prevIndex: index,
      }),
    );
  };

  const handleReturnToEvolveDeck = () => {
    handleEvoClose();
    dispatch(
      backToEvolveDeck({
        card: name,
        index: index,
      }),
    );
  };
  const handleReturnAdvancedToEvolveDeck = () => {
    handleClose();
    dispatch(
      advancedBackToEvolveDeck({
        card: name,
        index: index,
      }),
    );
  };

  const canPlayCard = (instanceId) =>
    automated &&
    leaderActive &&
    !pendingChoices &&
    instanceId &&
    legalActions.includes(`PLAY:${instanceId}`);

  const canQuickPlayCard = (instanceId) =>
    automated &&
    !pendingChoices &&
    instanceId &&
    legalActions.includes(`QUICK_PLAY:${instanceId}`);

  const canPlayFromExArea = (instanceId) =>
    canPlayCard(instanceId) || canQuickPlayCard(instanceId);

  const canAttackWith = (instanceId) =>
    automated &&
    leaderActive &&
    !pendingChoices &&
    instanceId &&
    legalActions.includes(`ATTACK:${instanceId}`);

  const isValidAttackTarget = (targetId) =>
    selectedAttackerId &&
    legalActions.includes(`ATTACK_TARGET:${selectedAttackerId}:${targetId}`);

  const fieldCombatStyle = (idx, isEnemy) => {
    if (!automated) return {};
    const instanceId = isEnemy
      ? enemyFieldInstanceIds[idx]
      : fieldInstanceIds[idx];
    if (!isEnemy && instanceId && selectedAttackerId === instanceId) {
      return { outline: "3px solid #ff9800", borderRadius: "8px", cursor: "pointer" };
    }
    if (!isEnemy && idx >= 5 && canPlayFromExArea(instanceId)) {
      return {
        outline: canQuickPlayCard(instanceId) ? "2px solid #9c27b0" : "2px solid #2196f3",
        borderRadius: "8px",
        cursor: "pointer",
      };
    }
    if (!isEnemy && idx < 5 && canAttackWith(instanceId)) {
      return { outline: "2px solid #4caf50", borderRadius: "8px", cursor: "pointer" };
    }
    if (isEnemy && selectedAttackerId && isValidAttackTarget(instanceId)) {
      return { outline: "3px solid #f44336", borderRadius: "8px", cursor: "pointer" };
    }
    return {};
  };

  const handleAutomatedPlayerFieldClick = (idx) => {
    const instanceId = fieldInstanceIds[idx];
    if (!instanceId || reduxField[idx] === 0) return;
    if (idx >= 5) {
      if (canQuickPlayCard(instanceId)) {
        sendAction({ type: "QUICK_PLAY", handInstanceId: instanceId });
        return;
      }
      if (canPlayCard(instanceId)) {
        sendAction({ type: "PLAY_CARD", handInstanceId: instanceId });
        return;
      }
      if (legalActions.includes(`ACTIVATE_EXAREA:${instanceId}`)) {
        sendAction({ type: "ACTIVATE_EXAREA", exAreaInstanceId: instanceId });
        return;
      }
      return;
    }
    if (idx < 5 && canAttackWith(instanceId)) {
      dispatch(
        setSelectedAttackerId(selectedAttackerId === instanceId ? null : instanceId),
      );
    }
  };

  const handleAutomatedEnemyFieldClick = (enemyIdx) => {
    if (!automated || !selectedAttackerId || pendingChoices) return;
    const targetId = enemyFieldInstanceIds[enemyIdx];
    if (!targetId || reduxEnemyField[enemyIdx] === 0) return;
    if (!isValidAttackTarget(targetId)) return;
    sendAction({
      type: "ATTACK",
      attackerId: selectedAttackerId,
      targetId,
    });
    dispatch(setSelectedAttackerId(null));
  };

  const getEvolveOptionsForFieldCard = (fieldInstanceId) => {
    const opts = [];
    if (legalActions.includes(`EVOLVE:${fieldInstanceId}`)) {
      opts.push({ useEvoPoint: false, useSuperEvo: false, label: "Evolve" });
    }
    if (legalActions.includes(`SUPER_EVOLVE:${fieldInstanceId}`)) {
      opts.push({ useEvoPoint: false, useSuperEvo: true, label: "Super Evolve" });
    }
    if (legalActions.includes(`EVOLVE_EP:${fieldInstanceId}`)) {
      opts.push({ useEvoPoint: true, useSuperEvo: false, label: "Evolve (use EP)" });
    }
    if (legalActions.includes(`SUPER_EVOLVE_EP:${fieldInstanceId}`)) {
      opts.push({ useEvoPoint: true, useSuperEvo: true, label: "Super Evolve (use EP)" });
    }
    return opts;
  };

  const handleAutomatedFieldContextMenu = (event, idx) => {
    if (!automated || !leaderActive || pendingChoices) return;
    const instanceId = fieldInstanceIds[idx];
    if (!instanceId || reduxField[idx] === 0) return;
    event.preventDefault();
    setAutomatedFieldMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      idx,
      instanceId,
    });
  };

  const closeAutomatedFieldMenu = () => setAutomatedFieldMenu(null);

  const handleAutomatedEvolve = (useEvoPoint = false, useSuperEvo = false) => {
    if (!automatedFieldMenu) return;
    sendAction({
      type: "EVOLVE",
      fieldInstanceId: automatedFieldMenu.instanceId,
      useEvoPoint: Boolean(useEvoPoint),
      useSuperEvo: Boolean(useSuperEvo),
    });
    closeAutomatedFieldMenu();
  };

  const getActivateOptionsForFieldCard = (fieldInstanceId) => {
    const opts = [];
    if (legalActions.includes(`ACTIVATE:${fieldInstanceId}`)) {
      opts.push({ useEvoPoint: false, label: "Activate" });
    }
    if (legalActions.includes(`ACTIVATE_EP:${fieldInstanceId}`)) {
      opts.push({ useEvoPoint: true, label: "Activate (use EP)" });
    }
    return opts;
  };

  const handleAutomatedActivate = (useEvoPoint = false) => {
    if (!automatedFieldMenu) return;
    sendAction({
      type: "ACTIVATE",
      fieldInstanceId: automatedFieldMenu.instanceId,
      useEvoPoint: Boolean(useEvoPoint),
    });
    closeAutomatedFieldMenu();
  };

  const handleAutomatedActivateExArea = () => {
    if (!automatedFieldMenu) return;
    sendAction({
      type: "ACTIVATE_EXAREA",
      exAreaInstanceId: automatedFieldMenu.instanceId,
    });
    closeAutomatedFieldMenu();
  };

  const handleSelectEnemyCardInHand = (idx) => {
    if (idx === reduxCardSelectedInHand) dispatch(setCardSelectedInHand(-1));
    else dispatch(setCardSelectedInHand(idx));
  };

  const handleSelectEnemyCardOnField = (idx) => {
    if (idx === reduxCardSelectedOnField) dispatch(setCardSelectedOnField(-1));
    else dispatch(setCardSelectedOnField(idx));
  };

  useEffect(() => {
    switch (reduxEnemyCardBack) {
      case "Aenea":
        setCardback(aeneaCardBack);
        break;
      case "Dionne":
        setCardback(dionneCardBack);
        break;
      case "Dragon":
        setCardback(dragonCardBack);
        break;
      case "Filene":
        setCardback(fileneCardBack);
        break;
      case "Galmieux":
        setCardback(galmieuxCardBack);
        break;
      case "Jeanne":
        setCardback(jeanneCardBack);
        break;
      case "Kuon":
        setCardback(kuonCardBack);
        break;
      case "Ladica":
        setCardback(ladicaCardBack);
        break;
      case "Lishenna":
        setCardback(lishennaCardBack);
        break;
      case "Lishenna2":
        setCardback(lishenna2CardBack);
        break;
      case "Mistolina":
        setCardback(mistolinaCardBack);
        break;
      case "Mono":
        setCardback(monoCardBack);
        break;
      case "Orchis":
        setCardback(orchisCardBack);
        break;
      case "Piercye":
        setCardback(piercyeCardBack);
        break;
      case "RoseQueen":
        setCardback(rosequeenCardBack);
        break;
      case "Shikigami":
        setCardback(shikiCardBack);
        break;
      case "Shuten":
        setCardback(shutenCardBack);
        break;
      case "TidalGunner":
        setCardback(tidalgunnerCardBack);
        break;
      case "Viridia":
        setCardback(viridiaCardBack);
        break;
      case "Wilbert":
        setCardback(wilbertCardBack);
        break;
      default:
        setCardback(defaultCardBack);
    }
  }, [reduxEnemyCardBack]);

  return (
    <>
      <Tooltip title="Copy" placement="top">
        <div
          style={{
            backgroundColor: "black",
            color: "white",
            height: "40px",
            minWidth: "150px",
            position: "absolute",
            fontSize: "20px ",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: ".5em",
            bottom: 3,
            left: 0,
            // pointerEvents: "auto",
            cursor: "pointer",
          }}
          onClick={() => {
            navigator.clipboard.writeText(reduxCurrentRoom);
          }}
        >
          <div>{reduxCurrentRoom}</div>

          <ContentCopyIcon sx={{ fontSize: "20px" }} />
        </div>
      </Tooltip>
      <Menu
        open={chromeVisible && automatedFieldMenu !== null}
        onClose={closeAutomatedFieldMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          automatedFieldMenu !== null
            ? { top: automatedFieldMenu.mouseY, left: automatedFieldMenu.mouseX }
            : undefined
        }
      >
        {automatedFieldMenu &&
          automatedFieldMenu.idx < 5 &&
          getActivateOptionsForFieldCard(automatedFieldMenu.instanceId).map((opt) => (
            <MenuItem
              key={`activate-${opt.useEvoPoint ? "ep" : "pp"}`}
              onClick={() => handleAutomatedActivate(opt.useEvoPoint)}
            >
              {opt.label}
            </MenuItem>
          ))}
        {automatedFieldMenu &&
          automatedFieldMenu.idx >= 5 &&
          legalActions.includes(`ACTIVATE_EXAREA:${automatedFieldMenu.instanceId}`) && (
            <MenuItem onClick={handleAutomatedActivateExArea}>Activate</MenuItem>
          )}
        {automatedFieldMenu &&
          getEvolveOptionsForFieldCard(automatedFieldMenu.instanceId).map((opt) => (
            <MenuItem
              key={`${opt.useSuperEvo ? "super" : "evo"}-${opt.useEvoPoint ? "ep" : "pp"}`}
              onClick={() => handleAutomatedEvolve(opt.useEvoPoint, opt.useSuperEvo)}
            >
              {opt.label}
            </MenuItem>
          ))}
      </Menu>
      <Menu
        open={chromeVisible && contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {isAdvanced(name) && (
          <MenuItem onClick={() => handleReturnAdvancedToEvolveDeck()}>
            Return
          </MenuItem>
        )}
        {isToken(name) && (
          <MenuItem onClick={handleRemoveTokenFromField}>Remove</MenuItem>
        )}
        {isToken(name) && (
          <MenuItem onClick={handleDuplicateToken}>Duplicate</MenuItem>
        )}
        {!isToken(name) && !isAdvanced(name) && (
          <MenuItem onClick={handleCardToCemetery}>Cemetery</MenuItem>
        )}
        {!reduxCustomValues[index].showAtk && (
          <MenuItem onClick={handleShowAtkDef}>Modify Atk/Def</MenuItem>
        )}
        {reduxCustomValues[index].showAtk && (
          <MenuItem onClick={handleHideAtkDef}>Hide Atk/Def</MenuItem>
        )}
        {reduxCounterField[index] < 1 && (
          <MenuItem onClick={handleAddCounter}>Add Counter</MenuItem>
        )}
        {!isToken(name) && !isAdvanced(name) && (
          <MenuItem onClick={handleCardToHandFromField}>Hand</MenuItem>
        )}
        <MenuItem onClick={handleMoveOnField}>Move</MenuItem>
        {!isToken(name) && !isAdvanced(name) && (
          <MenuItem onClick={handleCardToTopDeck}>Top of Deck</MenuItem>
        )}
        {!isToken(name) && !isAdvanced(name) && (
          <MenuItem onClick={handleCardToBotDeck}>Bot of Deck</MenuItem>
        )}
        {!isToken(name) && !isAdvanced(name) && (
          <MenuItem onClick={handleCardToBanish}>Banish</MenuItem>
        )}

        {!isToken(name) && !isAdvanced(name) && (
          <MenuItem onClick={handleTransfer}>Transfer</MenuItem>
        )}
        {!reduxCustomStatus[index] && (
          <MenuItem onClick={handleShowStatus}>Add Status</MenuItem>
        )}
        {reduxCustomStatus[index] && (
          <MenuItem onClick={handleHideStatus}>Hide Status</MenuItem>
        )}
        {reduxCustomStatus[index] &&
          KEYWORDS.map((kw) => (
            <MenuItem key={kw} onClick={() => handleToggleKeyword(kw)}>
              {(reduxKeywordField[index] || []).includes(kw) ? "✓ " : ""}
              {kw}
            </MenuItem>
          ))}
      </Menu>
      <Menu
        open={chromeVisible && contextEvoMenu !== null}
        onClose={handleEvoClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextEvoMenu !== null
            ? { top: contextEvoMenu.mouseY, left: contextEvoMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleReturnToEvolveDeck()}>Return</MenuItem>
        <MenuItem onClick={handleMoveEvoOnField}>Move</MenuItem>
        {!reduxCustomValues[index].showAtk && (
          <MenuItem onClick={handleShowAtkDef}>Modify Atk/Def</MenuItem>
        )}
        {reduxCustomValues[index].showAtk && (
          <MenuItem onClick={handleHideAtkDef}>Hide Atk/Def</MenuItem>
        )}
        {!reduxCustomStatus[index] && (
          <MenuItem onClick={handleShowStatus}>Add Status</MenuItem>
        )}
        {reduxCustomStatus[index] && (
          <MenuItem onClick={handleHideStatus}>Hide Status</MenuItem>
        )}
        {reduxCounterField[index] < 1 && reduxCustomStatus[index] && (
          <MenuItem onClick={handleAddCounter}>Add Counter</MenuItem>
        )}
        {reduxCustomStatus[index] &&
          KEYWORDS.map((kw) => (
            <MenuItem key={kw} onClick={() => handleToggleKeyword(kw)}>
              {(reduxKeywordField[index] || []).includes(kw) ? "✓ " : ""}
              {kw}
            </MenuItem>
          ))}
      </Menu>

      {/* Show Enemy Hand Modal */}

      <Modal
        open={enemyHandModalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          "& > .MuiBackdrop-root": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box sx={style}>
          <ModalHideUiRow />
          <Typography
            sx={{
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "Noto Serif JP, serif",
              fontSize: "20px",
            }}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Viewing Opponent's Hand
          </Typography>
          <CardMUI
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              minHeight: "250px",
              padding: "3%",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
            variant="outlined"
          >
            {reduxEnemyHand.map((card, idx) => (
              <div key={`card-${idx}`}>
                <Card name={card} setHovering={setHovering} />
              </div>
            ))}
          </CardMUI>
        </Box>
      </Modal>

      {/* Show Enemy Card Modal */}

      <Modal
        open={enemyCardModalOpen}
        onClose={handleShowCardModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          "& > .MuiBackdrop-root": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "transparent",
            boxShadow: 24,
            // p: 3,
            width: 0,
            border: "none",
          }}
        >
          <HideUiButton
            sx={{ position: "fixed", top: 16, left: 16, zIndex: 1400 }}
          />
          <CardMUI
            sx={{
              backgroundColor: "transparent",
              width: "100%",
              // height: "80vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "none",
              overflow: "visible",
            }}
            variant="outlined"
          >
            <motion.div
              initial={{ scale: 1.0, rotateY: 180 }}
              transition={{ duration: 0.8 }}
              animate={{ scale: 4.5, rotateY: 0 }}
              // variants={{
              //   start: {
              //     scale: 4.5,
              //     rotateY: [0, 360],
              //     transition: {
              //       duration: 0.8,
              //       ease: "linear",
              //     },
              //   },
              // }}
              // animate={["start"]}
            >
              <img
                className={"cardStyle"}
                src={artImage(reduxEnemyCard, reduxEnemyArt)}
                alt={reduxEnemyCard}
              />
            </motion.div>
          </CardMUI>
        </Box>
      </Modal>

      {/* Three-zone layout that fills the available height: the opponent's
          hand is pinned to the top edge, the field is centered in the space
          between the two hands, and the player's hand is pinned to the bottom
          (rendered in Game.js). Both zones scale by the same boardScale so the
          cards and their pixel-tuned overlays stay aligned at any resolution. */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Opponent hand — pinned to the top */}
        <div
          style={{
            flexShrink: 0,
            transform: `scale(${boardScale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            ref={(el) => registerEnemyHand(el)}
            style={{
              width: `${BASE_WIDTH}px`,
              display: "flex",
              flexDirection: "row",
              // Reserve one card's height at all times (cardbacks are 161px tall,
              // see .cardStyle). The old 130px minHeight was shorter than a card,
              // so the opponent drawing their first card (or playing their last)
              // grew this row ~31px and shoved the whole board down for the
              // viewer. A constant height keeps the board fixed, matching the
              // player-side hand fix.
              height: "161px",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: "2em",
            }}
          >
            {reduxEnemyHand.map((_, idx) => {
              // Keep the opponent's hand within the board width: while the cards
              // fit they sit side by side, but once they'd overflow (cardbacks
              // are 115px wide, so ~10 cards for the 1100px board) a shared
              // negative margin overlaps them so the hand stays within BASE_WIDTH.
              const n = reduxEnemyHand.length;
              const ENEMY_CARD_W = 115;
              const overlap =
                n > 1
                  ? Math.max(0, (n * ENEMY_CARD_W - BASE_WIDTH) / (n - 1))
                  : 0;
              const baseStyle = {
                cursor: `url(${img}) 55 55, auto`,
                marginLeft: idx === 0 ? 0 : -overlap,
              };
              return (
                <img
                  style={
                    reduxCardSelectedInHand === idx
                      ? {
                          ...baseStyle,
                          filter:
                            "sepia() saturate(4) hue-rotate(315deg) brightness(100%) opacity(5)",
                        }
                      : baseStyle
                  }
                  key={idx}
                  className={"cardStyle"}
                  src={cardback}
                  alt={"cardback"}
                  onClick={() => handleSelectEnemyCardInHand(idx)}
                />
              );
            })}
          </div>
        </div>

        {/* Field — centered between the two hands */}
        <div
          ref={boardWrapperRef}
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            ref={boardRef}
            style={{
              width: `${BASE_WIDTH}px`,
              flexShrink: 0,
              transform: `scale(${boardScale})`,
              transformOrigin: "center",
            }}
          >

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: "330px",
          alignItems: "end",
        }}
      >
        {/* Enemy Deck and Cemetery */}

        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            width: "140px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            // background: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
            // style={{
            //   cursor: `url(${img}) 55 55, auto`,
            // }}
            >
              <img className={"cardStyle"} src={cardback} alt={"cardback"} />
            </div>
            <DeckFx side="enemy" />
            {/* {showOpponentDeckSize && ( */}
            <div
              style={{
                width: "50px",
                position: "absolute",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                top: "5%",
                right: "30%",
                color: "rgba(255, 255, 255, 1)",
                fontSize: "30px",
                fontFamily: "Noto Serif JP, serif",
              }}
            >
              {reduxEnemyDeckSize}
            </div>
            {/* )} */}
          </div>

          <EnemyCemetery setHovering={setHovering} ready={ready} />
        </div>

        {/* Enemy Field (1-5) & Ex Area (6-10) */}
        <div
          ref={(el) => registerEnemyFieldGrid(el)}
          style={{
            height: "35vh",
            minHeight: "330px",
            flex: 1,
            minWidth: 0,
            // backgroundColor: "black",
            // backgroundColor: "#131219",
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            // background: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            columnGap: "60px",
            alignItems: "center",
            justifyItems: "center",
            // zIndex: 0,
          }}
        >
          {/* <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              top: "35%",
              width: "50px",
              pointerEvents: "none",
            }}
          >
            Field
          </span>
          <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              top: "18%",
              width: "100px",
              pointerEvents: "none",
            }}
          >
            EX Area
          </span> */}
          {reduxField.map((x, idx) => (
            <motion.div
              key={`enemy1-${idx}`}
              className={"cardStyle"}
              style={{
                zIndex: 2,
                ...fieldCombatStyle(cardPos(idx), true),
              }}
              className={"cardStyle fieldSlot"}
              onClick={() => {
                const enemyIdx = cardPos(idx);
                if (automated && selectedAttackerId) {
                  handleAutomatedEnemyFieldClick(enemyIdx);
                  return;
                }
                handleSelectEnemyCardOnField(enemyIdx);
              }}
            >
              {reduxEnemyField[cardPos(idx)] !== 0 &&
                reduxEnemyEvoField[cardPos(idx)] === 0 && (
                  <Card
                    atkVal={reduxEnemyCustomValues[cardPos(idx)].atk}
                    defVal={reduxEnemyCustomValues[cardPos(idx)].def}
                    showAtk={reduxEnemyCustomValues[cardPos(idx)].showAtk}
                    showDef={reduxEnemyCustomValues[cardPos(idx)].showDef}
                    engaged={reduxEnemyEngaged[cardPos(idx)]}
                    counterVal={reduxEnemyCounterField[cardPos(idx)]}
                    discountedPlayCost={reduxEnemyExPlayCostField[cardPos(idx)]}
                    aura={reduxEnemyAuraField[cardPos(idx)]}
                    bane={reduxEnemyBaneField[cardPos(idx)]}
                    ward={reduxEnemyWardField[cardPos(idx)]}
                    keywords={reduxEnemyKeywordField[cardPos(idx)]}
                    opponentField={true}
                    onField={true}
                    idx={idx}
                    key={`enemy-card-${cardPos(idx)}`}
                    name={reduxEnemyField[cardPos(idx)]}
                    setHovering={setHovering}
                    ready={ready}
                    hidden={isHidden("enemy", cardPos(idx))}
                  />
                )}
              {reduxEnemyEvoField[cardPos(idx)] !== 0 && (
                <Card
                  atkVal={reduxEnemyCustomValues[cardPos(idx)].atk}
                  defVal={reduxEnemyCustomValues[cardPos(idx)].def}
                  showAtk={reduxEnemyCustomValues[cardPos(idx)].showAtk}
                  showDef={reduxEnemyCustomValues[cardPos(idx)].showDef}
                  engaged={reduxEnemyEngaged[cardPos(idx)]}
                  counterVal={reduxEnemyCounterField[cardPos(idx)]}
                  aura={reduxEnemyAuraField[cardPos(idx)]}
                  bane={reduxEnemyBaneField[cardPos(idx)]}
                  ward={reduxEnemyWardField[cardPos(idx)]}
                  keywords={reduxEnemyKeywordField[cardPos(idx)]}
                  opponentField={true}
                  onField={true}
                  idx={idx}
                  key={`enemy-evo-${cardPos(idx)}`}
                  name={reduxEnemyEvoField[cardPos(idx)]}
                  setHovering={setHovering}
                  ready={ready}
                  cardBeneath={reduxEnemyField[cardPos(idx)]}
                  hidden={isHidden("enemy", cardPos(idx))}
                />
              )}
            </motion.div>
          ))}
        </div>
        {/* Enemy Evolve Deck */}
        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            width: "140px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "black",
            // backgroundColor: "#131219",
            // background: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",

            // cursor: `url(${img}) 55 55, auto`,
          }}
        >
          <EnemyEvoDeck setHovering={setHovering} ready={ready} />
        </div>
      </div>

      {/* Player */}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: "330px",
          cursor: ready && `url(${img}) 55 55, auto`,
        }}
      >
        {/* Player Evolve Deck */}
        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            width: "140px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <EvoDeck
            setReadyToEvo={setReadyToEvo}
            setReadyToAdvanced={setReadyToAdvanced}
            setReadyToFeed={setReadyToFeed}
            setReadyToRide={setReadyToRide}
            setReady={setReady}
            setHovering={setHovering}
            ready={ready}
          />
          <ShowDice />
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Token
              setReady={setReady}
              setHovering={setHovering}
              ready={ready}
              setTokenReady={setTokenReady}
            />
            {/* <Lesson /> */}
          </div>
        </div>
        {/* Player Field (1-5) & Ex Area (6-10) */}
        <div
          ref={(el) => registerFieldGrid(el)}
          style={{
            height: "35vh",
            minHeight: "330px",
            flex: 1,
            minWidth: 0,
            // backgroundColor: "black",
            // backgroundColor: "#131219",
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            // padding: "2em",
            // background: "linear-gradient(to top, #09203f 0%, #537895 100%)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            columnGap: "60px",
            alignItems: "center",
            justifyItems: "center",
            // zIndex: 0,
          }}
        >
          <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              bottom: "45%",
              width: "50px",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            Field
          </span>
          <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              bottom: "28%",
              width: "100px",
              pointerEvents: "none",
            }}
          >
            EX Area
          </span>
          {reduxField.map((card, idx) => (
            <div className="fieldSlot" key={`card-${idx}`}>
              {ready && (
                <motion.div
                  onClick={() => {
                    handleClick(reduxCurrentCard, idx);
                  }}
                  onContextMenu={() => {
                    cancelClick();
                  }}
                  key={`player1-${idx}`}
                  style={
                    {
                      // height: "160px",
                      // width: "115px",
                      // backgroundColor: "rgba(255, 255, 255, 0.1)",
                      // backgroundColor: "#131219",
                      // borderRadius: "10px",
                    }
                  }
                  className={
                    reduxField[idx] !== 0 &&
                    reduxEvoField[idx] === 0 &&
                    (readyToEvo || readyToFeed || readyToRide)
                      ? "box"
                      : reduxField[idx] === 0 &&
                          !readyToEvo &&
                          !readyToFeed &&
                          !readyToRide
                        ? "box"
                        : "none"
                  }
                >
                  {reduxField[idx] !== 0 && reduxEvoField[idx] === 0 && (
                    <Card
                      showAtk={reduxCustomValues[idx].showAtk}
                      showDef={reduxCustomValues[idx].showDef}
                      atkVal={reduxCustomValues[idx].atk}
                      defVal={reduxCustomValues[idx].def}
                      engaged={reduxEngaged[idx]}
                      counterVal={reduxCounterField[idx]}
                      discountedPlayCost={reduxExPlayCostField[idx]}
                      aura={reduxAuraField[idx]}
                      bane={reduxBaneField[idx]}
                      ward={reduxWardField[idx]}
                      keywords={reduxKeywordField[idx]}
                      idx={idx}
                      onField={true}
                      key={`card1-${idx}`}
                      name={card}
                      setHovering={setHovering}
                      ready={ready}
                    />
                  )}
                  {reduxEvoField[idx] !== 0 && (
                    <Card
                      showAtk={reduxCustomValues[idx].showAtk}
                      showDef={reduxCustomValues[idx].showDef}
                      atkVal={reduxCustomValues[idx].atk}
                      defVal={reduxCustomValues[idx].def}
                      engaged={reduxEngaged[idx]}
                      counterVal={reduxCounterField[idx]}
                      idx={idx}
                      onField={true}
                      key={`evo1-${idx}`}
                      name={reduxEvoField[idx]}
                      setHovering={setHovering}
                      ready={ready}
                      cardBeneath={reduxField[idx]}
                    />
                  )}
                </motion.div>
              )}
              {!ready && (
                <div
                  onClick={() => {
                    if (automated) handleAutomatedPlayerFieldClick(idx);
                  }}
                  onContextMenu={(e) => {
                    if (automated) {
                      handleAutomatedFieldContextMenu(e, idx);
                      return;
                    }
                    if (reduxField[idx] !== 0 && reduxEvoField[idx] === 0)
                      handleContextMenu(e, idx, reduxField[idx]);
                    else if (reduxField[idx] !== 0)
                      handleEvoContextMenu(e, idx, reduxEvoField[idx]);
                  }}
                  key={`player2-${idx}`}
                  style={fieldCombatStyle(idx, false)}
                  className={"cardStyle"}
                >
                  {reduxField[idx] !== 0 && reduxEvoField[idx] === 0 && (
                    <Card
                      showAtk={reduxCustomValues[idx].showAtk}
                      showDef={reduxCustomValues[idx].showDef}
                      atkVal={reduxCustomValues[idx].atk}
                      defVal={reduxCustomValues[idx].def}
                      engaged={reduxEngaged[idx]}
                      counterVal={reduxCounterField[idx]}
                      discountedPlayCost={reduxExPlayCostField[idx]}
                      aura={reduxAuraField[idx]}
                      bane={reduxBaneField[idx]}
                      ward={reduxWardField[idx]}
                      keywords={reduxKeywordField[idx]}
                      idx={idx}
                      onField={true}
                      key={`card2-${idx}`}
                      name={reduxField[idx]}
                      setHovering={setHovering}
                      ready={ready}
                      onFieldDrop={handleFieldDrop}
                      hidden={isHidden("mine", idx)}
                    />
                  )}
                  {reduxEvoField[idx] !== 0 && (
                    <Card
                      showAtk={reduxCustomValues[idx].showAtk}
                      showDef={reduxCustomValues[idx].showDef}
                      atkVal={reduxCustomValues[idx].atk}
                      defVal={reduxCustomValues[idx].def}
                      engaged={reduxEngaged[idx]}
                      counterVal={reduxCounterField[idx]}
                      discountedPlayCost={reduxExPlayCostField[idx]}
                      aura={reduxAuraField[idx]}
                      bane={reduxBaneField[idx]}
                      ward={reduxWardField[idx]}
                      keywords={reduxKeywordField[idx]}
                      idx={idx}
                      onField={true}
                      key={`evo2-${idx}`}
                      name={reduxEvoField[idx]}
                      setHovering={setHovering}
                      ready={ready}
                      cardBeneath={reduxField[idx]}
                      onFieldDrop={handleFieldDrop}
                      hidden={isHidden("mine", idx)}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Player Deck and Cementery */}
        <div
          style={{
            height: "35vh",
            minHeight: "330px",
            width: "140px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "black",
            // backgroundColor: "#131219",
            zIndex: 0,
            // background: "linear-gradient(to top, #09203f 0%, #537895 100%)",
            // backgroundColor: "rgba(0, 0, 0, 0.60)",
            alignItems: "center",
            justifyContent: "space-evenly",
            // cursor: `url(${img}) 55 55, auto`,
          }}
        >
          <Cemetery
            setReadyFromCemetery={setReadyFromCemetery}
            setReadyFromBanish={setReadyFromBanish}
            setReady={setReady}
            setHovering={setHovering}
            ready={ready}
          />
          <div style={{ zIndex: -1, position: "relative" }}>
            <Deck
              setHovering={setHovering}
              ready={ready}
              setReadyFromDeck={setReadyFromDeck}
              setReady={setReady}
              setDeckIndex={setDeckIndex}
            />
            {/* {showOpponentDeckSize && ( */}
            <div
              style={{
                position: "absolute",
                width: "50px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                top: "65%",
                right: "27%",
                color: "rgba(255, 255, 255, 1)",
                fontSize: "30px",
                fontFamily: "Noto Serif JP, serif",
              }}
            >
              {reduxCurrentDeck.length || 0}
            </div>
            {/* )} */}
          </div>
        </div>
      </div>
      {/* Board-wide overlay for the evolve burst (positioned per side). */}
      <EvoLayer />
      {/* Drop-zone hints shown while dragging a card from the hand. */}
      <FieldDropHints />
      {/* Dice toss animation (shown to both players). */}
      <DiceRoll />
      {/* "Card played" reveal: shows the card centre-screen, then onto the field. */}
      <PlayReveal />
        </div>
      </div>
      </div>
    </>
  );
}
