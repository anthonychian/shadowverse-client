import React, { useState, useEffect, useMemo } from "react";
import { socket } from "../../sockets";
import { useDispatch, useSelector } from "react-redux";
import {
  drawFromDeck,
  shuffleDeck,
  mulliganFour,
  drawFourFromDeck,
  shuffleCards,
  addToHandFromDeck,
  addToHandFromDeckWithoutRevealing,
  addToTopOfDeckFromDeck,
  addToBotOfDeckFromDeck,
  addToCemeteryFromDeck,
  addToCemeteryFromTopOfDeck,
  addToBanishFromDeck,
  addToBanishFromTopOfDeck,
  placeToFieldFromDeck,
  playCardToSharedZone,
  placeToExFromTopOfDeck,
  setViewingDeck,
  setViewingTopCards,
  setViewingCardsLog,
  setViewingDeckLog,
  setViewingOpponentTopCards,
} from "../../redux/CardSlice";
import { Menu, MenuItem, Modal, Box, Popover, Button } from "@mui/material";
import { useUiModalOpen } from "../hooks/useUiChromeVisible";
import { ModalHideUiRow } from "../ui/HideUiButton";
import { triggerGameAnimation } from "./animationBus";
import {
  countCardTypes,
  matchesFilters,
  primaryType,
  traitsInCards,
} from "../../decks/cardDetails";
import {
  triggerHandReveal,
  triggerHiddenHandReveal,
  triggerCardReveal,
  triggerMillReveal,
  triggerPlayedZoneReveal,
} from "./cardRevealBus";
import { fieldSlotCenter, registerDeck } from "./handDrag";
import {
  deckModalCards,
  deckModalCount,
  deckModalTitle,
  deckModalToolbar,
  ghostButtonSx,
  primaryButtonSx,
  traitButtonSx,
  useDeckModalBoxStyle,
} from "./deckModalStyles";
import { useModalCardDrag, ModalDragGhost } from "./modalCardDrag";
import { DeckFx, useShuffleDeckActive } from "./GameFx";

import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";

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
import "../../css/Card.css";

export default function Deck({
  ready,
  setHovering,
  setReadyFromDeck,
  setReady,
  setDeckIndex,
}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const modalOpen = useUiModalOpen(open);
  const [name, setName] = useState("");
  const [index, setIndex] = useState(0);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [cardContextMenu, setCardContextMenu] = React.useState(null);
  const [reveal, setReveal] = useState(false);
  const [textInput, setTextInput] = useState("0");
  const [partialDeck, setPartialDeck] = useState([]);
  // Deck indices for each card in `partialDeck`, so Look At Bottom's cards can
  // be acted on from the far end of the deck just like Look At Top's.
  const [partialIndices, setPartialIndices] = useState([]);
  // Whether the Look At modal is peeking at the bottom of the deck instead of
  // the top. Same modal, same controls — only the viewed end changes.
  const [lookBottom, setLookBottom] = useState(false);
  // Whether the current Look At Top cards are revealed to the opponent. The
  // Reveal All button toggles between revealing and hiding them.
  const [revealAllActive, setRevealAllActive] = useState(false);
  // Indices (into the active list) that are multi-selected in the deck modal.
  // Left-click toggles a card in here; right-click opens the options menu, which
  // then applies to every selected card. A Set preserves click order.
  const [selected, setSelected] = useState(() => new Set());
  const [traits, setTraits] = useState([]);
  const [traitMenuAnchor, setTraitMenuAnchor] = useState(null);

  // Top-anchored drawer bounds, measured from the live (CSS-scaled) board.
  const deckModalBoxStyle = useDeckModalBoxStyle(modalOpen);

  const [cardback, setCardback] = useState();
  const reduxCardBack = useSelector((state) => state.card.cardback);

  const reduxDeck = useSelector((state) => state.card.deck);
  const reduxField = useSelector((state) => state.card.field);
  const reduxHand = useSelector((state) => state.card.hand);
  const reduxRoom = useSelector((state) => state.card.room);
  // Hide the deck's cardback while the deck-shuffle riffle plays.
  const shufflingDeck = useShuffleDeckActive("player");
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const automated = gameMode === "automated";

  // The list backing the open modal (Look At Top -> partialDeck, View Deck ->
  // reduxDeck). Multi-select applies to both lists.
  const activePile = reveal ? partialDeck : reduxDeck;
  const multi = selected.size > 1;

  const availableTraits = useMemo(() => traitsInCards(activePile), [activePile]);
  const visibleIndices = useMemo(
    () =>
      activePile.reduce((indices, card, index) => {
        if (matchesFilters(card, { traits })) indices.push(index);
        return indices;
      }, []),
    [activePile, traits],
  );

  useEffect(() => {
    if (!traits.every((trait) => availableTraits.includes(trait))) {
      setTraits(traits.filter((trait) => availableTraits.includes(trait)));
      setSelected(new Set());
    }
  }, [availableTraits, traits]);

  const activeTypeCounts = countCardTypes(
    visibleIndices.map((index) => activePile[index]),
  );

  // Selected indices in click order, dropping any stale entries. Click order
  // drives the order multi-actions are applied in.
  const selectedOrder = [...selected].filter(
    (i) => i >= 0 && i < activePile.length && visibleIndices.includes(i),
  );

  // Playing is only valid for Spell cards, so hide the Play option unless every
  // selected card is a Spell.
  const selectedAreSpells =
    selectedOrder.length > 0 &&
    selectedOrder.every((i) => primaryType(activePile[i]) === "Spell");

  // Act on the selected cards in the given index order. Each card's original
  // index is translated to its current position *after* the cards already acted
  // on have been removed, so earlier removals don't shift later cards out from
  // under us. `fn(card, currentIndex)`.
  const runSelected = (order, fn) => {
    const removed = [];
    order.forEach((orig) => {
      const idx = orig - removed.reduce((n, r) => n + (r < orig ? 1 : 0), 0);
      removed.push(orig);
      fn(activePile[orig], idx);
    });
  };

  // Load `num` cards from one end of the deck into the Look At modal. Top cards
  // run top-down; bottom cards run bottom-up, so the first tile is always the
  // card at the looked-at end. Keeps a parallel deck-index map for bottom mode.
  const applyLookSide = (bottom, num) => {
    const n = Math.min(Math.max(0, Math.floor(Number(num)) || 0), reduxDeck.length);
    if (bottom) {
      const start = reduxDeck.length - n;
      const cards = [];
      const indices = [];
      for (let i = reduxDeck.length - 1; i >= start; i -= 1) {
        cards.push(reduxDeck[i]);
        indices.push(i);
      }
      setPartialDeck(cards);
      setPartialIndices(indices);
    } else {
      setPartialDeck(reduxDeck.slice(0, n));
      setPartialIndices(Array.from({ length: n }, (_, i) => i));
    }
    setSelected(new Set());
  };

  // Remove revealed cards (by modal position) from the deck and from the
  // displayed list, translating each position to its current deck index first.
  const removePartial = (positions, fn) => {
    const entries = positions
      .map((position) => ({ position, deckIndex: partialIndices[position] }))
      .filter((entry) => entry.deckIndex != null)
      .sort((a, b) => a.deckIndex - b.deckIndex);
    const removed = [];
    entries.forEach(({ position, deckIndex }) => {
      const current = deckIndex - removed.filter((r) => r < deckIndex).length;
      fn(partialDeck[position], current);
      removed.push(deckIndex);
    });
    const removedPositions = new Set(positions);
    setPartialDeck((prev) => prev.filter((_, i) => !removedPositions.has(i)));
    setPartialIndices((prev) =>
      prev
        .map((deckIndex, position) => ({ deckIndex, position }))
        .filter(({ position }) => !removedPositions.has(position))
        .map(
          ({ deckIndex }) =>
            deckIndex - removed.filter((r) => r < deckIndex).length,
        ),
    );
    setSelected(new Set());
  };

  // Move revealed cards to the top or bottom of the deck, keeping the displayed
  // list's deck-index map in sync. Cards that leave the viewed end drop out of
  // the window (unless the whole deck is being viewed).
  const movePartialToEdge = (toTop) => {
    const order = selectedOrder;
    if (order.length === 0) return;
    const remainingPositions = partialDeck
      .map((_, i) => i)
      .filter((i) => !order.includes(i));
    const working = reduxDeck.map((card, key) => ({ card, key }));
    const move = (position) => {
      const key = partialIndices[position];
      if (key == null) return;
      const idx = working.findIndex((item) => item.key === key);
      if (idx === -1) return;
      const [item] = working.splice(idx, 1);
      if (toTop) {
        working.unshift(item);
        dispatch(addToTopOfDeckFromDeck({ card: item.card, index: idx }));
      } else {
        working.push(item);
        dispatch(addToBotOfDeckFromDeck({ card: item.card, index: idx }));
      }
    };
    if (toTop) [...order].reverse().forEach(move);
    else order.forEach(move);

    const staysInWindow = lookBottom ? !toTop : toTop;
    const fullDeck = partialDeck.length === reduxDeck.length;
    let nextOrder;
    if (staysInWindow) nextOrder = [...order, ...remainingPositions];
    else if (fullDeck) nextOrder = [...remainingPositions, ...order];
    else nextOrder = remainingPositions;

    setPartialDeck(nextOrder.map((position) => partialDeck[position]));
    setPartialIndices(
      nextOrder.map((position) => {
        const key = partialIndices[position];
        return working.findIndex((item) => item.key === key);
      }),
    );
    setSelected(new Set());
  };

  // Left-click toggles a card in/out of the multi-selection (a click that ends a
  // drag is ignored by the caller, so dragging still moves cards).
  const handleCardClick = (event, idx) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // popover
  const [anchorEl, setAnchorEl] = React.useState(null);
  const popoverOpen = Boolean(anchorEl);
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.target);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleModalOpen = () => {
    if (automated || reduxDeck.length === 0 || ready) return;
    setOpen(true);
    setSelected(new Set());
    setTraits([]);
    setTraitMenuAnchor(null);
    dispatch(setViewingDeck(true));
  };

  const handleModalRevealOpen = () => {
    if (automated || reduxDeck.length === 0 || ready) return;
    setOpen(true);
    setSelected(new Set());
    setTraits([]);
    setTraitMenuAnchor(null);
    setTextInput("0");
    setPartialDeck([]);
    setPartialIndices([]);
    setLookBottom(false);
    dispatch(setViewingTopCards(true));
  };

  const handleModalClose = () => {
    setOpen(false);
    setSelected(new Set());
    setTraits([]);
    setTraitMenuAnchor(null);
    if (reveal) {
      setReveal(false);
      setTextInput("");
      setPartialDeck([]);
      setPartialIndices([]);
      setLookBottom(false);
      setRevealAllActive(false);
      dispatch(setViewingTopCards(false));
    } else {
      dispatch(setViewingDeck(false));
      // dispatch(shuffleDeck());
    }
  };

  const handleTextInput = (text) => {
    setTextInput(text);
  };

  // const handleContextMenu = (event) => {
  //   event.preventDefault();
  //   setContextMenu(
  //     contextMenu === null
  //       ? {
  //           mouseX: event.clientX + 2,
  //           mouseY: event.clientY - 6,
  //         }
  //       : null
  //   );
  // };
  const handleCardContextMenu = (event, name, index) => {
    setName(name);
    setIndex(index);
    setDeckIndex(index);
    // Right-click selects the card if it isn't already part of the selection, so
    // the menu targets it (and everything else selected).
    setSelected((cur) => (cur.has(index) ? cur : new Set([index])));
    // console.log(index);
    event.preventDefault();
    setCardContextMenu(
      cardContextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleCardClose = () => {
    setCardContextMenu(null);
  };

  const handleTraitSelect = (value) => {
    setTraits(value ? [value] : []);
    setSelected(new Set());
    setTraitMenuAnchor(null);
  };

  const handleViewDeck = () => {
    handlePopoverClose();
    handleModalOpen();
    dispatch(setViewingDeckLog());
  };
  const handleRevealDeck = () => {
    setReveal(true);
    handlePopoverClose();
    handleModalRevealOpen();
  };

  // Draw the top card, and play a draw animation (on both boards) when there's
  // actually a card to draw. Shared by the deck click and the "Draw" menu item.
  const doDraw = () => {
    if (reduxDeck.length === 0) return;
    dispatch(drawFromDeck());
    triggerGameAnimation("draw", reduxRoom);
  };

  const handleShuffle = () => {
    // handlePopoverClose();
    dispatch(shuffleDeck());
    if (reduxDeck.length > 0) triggerGameAnimation("shuffle", reduxRoom);
  };

  const handleMulligan = () => {
    // handlePopoverClose();
    dispatch(mulliganFour());
  };

  const handleDraw = () => {
    doDraw();
  };

  const handleDrawFour = () => {
    // handlePopoverClose();
    dispatch(drawFourFromDeck());
    if (reduxDeck.length > 0) triggerGameAnimation("draw", reduxRoom);
  };

  const handleShuffleHand = () => {
    dispatch(shuffleCards());
    if (reduxHand.length > 0) triggerGameAnimation("shuffleHand", reduxRoom);
  };

  const handleAddFromDeckToHand = () => {
    handleCardClose();
    handleModalClose();
    runSelected(selectedOrder, (card, i) => {
      dispatch(addToHandFromDeck({ card, index: i }));
      triggerHandReveal(card, reduxRoom);
    });
    setSelected(new Set());
  };
  const handleAddFromDeckToHandWithoutRevealing = () => {
    handleCardClose();
    handleModalClose();
    runSelected(selectedOrder, (card, i) => {
      dispatch(addToHandFromDeckWithoutRevealing({ card, index: i }));
      triggerHiddenHandReveal(card, reduxRoom, cardback);
    });
    setSelected(new Set());
  };

  const handleCardToFieldFromDeck = () => {
    handleCardClose();
    handleModalClose();
    setReady(true);
    setReadyFromDeck(true);
  };

  const handleCardToPlayedFromDeck = () => {
    handleCardClose();
    handleModalClose();
    setSelected(new Set());
    runSelected(selectedOrder, (card, i) => {
      dispatch(playCardToSharedZone({ card, index: i, from: "deck" }));
      triggerPlayedZoneReveal(card, reduxRoom);
    });
  };

  const handleToHandFromRevealed = () => {
    handleCardClose();
    removePartial(selectedOrder, (card, deckIndex) => {
      dispatch(addToHandFromDeck({ card, index: deckIndex }));
      triggerHandReveal(card, reduxRoom);
    });
  };

  const handleToBanish = () => {
    handleCardClose();
    if (reveal) {
      removePartial(selectedOrder, (card, deckIndex) => {
        dispatch(addToBanishFromDeck({ card, index: deckIndex }));
      });
      return;
    }
    const order = selectedOrder;
    setSelected(new Set());
    runSelected(order, (card, i) =>
      dispatch(addToBanishFromDeck({ card, index: i })),
    );
  };

  const handleBanishAll = () => {
    if (partialDeck.length === 0) return;
    removePartial(
      partialDeck.map((_, i) => i),
      (card, deckIndex) => {
        dispatch(addToBanishFromDeck({ card, index: deckIndex }));
      },
    );
    setTextInput("0");
  };

  const handleCemeteryAll = () => {
    if (partialDeck.length === 0) return;
    removePartial(
      partialDeck.map((_, i) => i),
      (card, deckIndex) => {
        dispatch(addToCemeteryFromDeck({ card, index: deckIndex }));
      },
    );
    setTextInput("0");
  };

  const handleAllToDeckEdge = (toTop) => {
    if (partialDeck.length === 0) return;
    // Default order is the order the cards are shown in the modal.
    const defaultOrder = partialDeck.map((_, i) => i);
    // Selected cards move first, in click order; the rest follow in the default
    // display order. Pushing reaches the bottom in order, unshifting reverses it.
    const selected = selectedOrder;
    const order =
      selected.length > 0
        ? [...selected, ...defaultOrder.filter((p) => !selected.includes(p))]
        : defaultOrder;
    const dispatchOrder = toTop ? [...order].reverse() : order;
    const working = reduxDeck.map((card, key) => ({ card, key }));
    dispatchOrder.forEach((position) => {
      const key = partialIndices[position];
      if (key == null) return;
      const idx = working.findIndex((item) => item.key === key);
      if (idx === -1) return;
      const [item] = working.splice(idx, 1);
      if (toTop) {
        working.unshift(item);
        dispatch(addToTopOfDeckFromDeck({ card: item.card, index: idx }));
      } else {
        working.push(item);
        dispatch(addToBotOfDeckFromDeck({ card: item.card, index: idx }));
      }
    });
    setPartialDeck([]);
    setPartialIndices([]);
    setSelected(new Set());
    setTextInput("0");
  };

  const handleMill = () => {
    const card = reduxDeck[0];
    if (!card) return;
    dispatch(addToCemeteryFromTopOfDeck());
    triggerMillReveal(card, reduxRoom);
  };

  const handleBanishFromTop = () => {
    const card = reduxDeck[0];
    if (!card) return;
    dispatch(addToBanishFromTopOfDeck());
    triggerMillReveal(card, reduxRoom);
  };

  // The EX area is the bottom field row (indices 5-9); an empty slot is 0.
  const exAreaFull = reduxField.slice(5).every((slot) => slot !== 0);

  const handleCardToEx = () => {
    if (exAreaFull) return;
    const card = reduxDeck[0];
    if (!card) return;
    // Mirror the reducer's first-open-EX-slot logic so the reveal flies to the
    // exact slot the card lands in (EX area = field indices 5-9).
    const relativeIndex = reduxField.slice(5).findIndex((slot) => slot === 0);
    if (relativeIndex === -1) return;
    const exIndex = 5 + relativeIndex;
    dispatch(placeToExFromTopOfDeck());
    triggerCardReveal(card, reduxRoom, exIndex, fieldSlotCenter(exIndex));
  };

  // Move every selected Look At card to the top/bottom of the deck.
  const handleToTopOfDeck = () => {
    handleCardClose();
    movePartialToEdge(true);
  };

  const handleToBotOfDeck = () => {
    handleCardClose();
    movePartialToEdge(false);
  };

  // ---- drag a card out of the deck modal (Look At Top/Bottom or View Deck) ----
  // The modal hides while dragging and reappears on release with the dropped
  // card removed. Revealed cards translate their list position to a deck index
  // (Look At Bottom views the far end) before dispatching.
  const deckDrag = useModalCardDrag({
    targets: { field: true, hand: true, cemetery: true, played: true },
    spellFrontRowLocked: true,
    field: reduxField,
    onDrop: (card, index, dest) => {
      // A drop removes the card, shifting every index after it — drop any
      // multi-selection rather than leave it pointing at the wrong cards.
      setSelected(new Set());
      const deckIndex = reveal ? partialIndices[index] : index;
      if (reveal && deckIndex != null) {
        setPartialDeck((prev) => prev.filter((_, i) => i !== index));
        setPartialIndices((prev) =>
          prev
            .filter((_, i) => i !== index)
            .map((di) => (di > deckIndex ? di - 1 : di)),
        );
      }
      if (deckIndex == null) return;
      if (dest.type === "played") {
        dispatch(playCardToSharedZone({ card, index: deckIndex, from: "deck" }));
        triggerPlayedZoneReveal(card, reduxRoom);
      } else if (dest.type === "hand") {
        dispatch(addToHandFromDeck({ card, index: deckIndex }));
        triggerHandReveal(card, reduxRoom);
      } else if (dest.type === "cemetery") {
        dispatch(addToCemeteryFromDeck({ card, index: deckIndex }));
      } else {
        dispatch(
          placeToFieldFromDeck({
            card,
            deckIndex,
            index: dest.index,
          }),
        );
        // Reveal only when played to the field row (0-4), not the EX area.
        if (dest.index < 5)
          triggerCardReveal(card, reduxRoom, dest.index, fieldSlotCenter(dest.index));
      }
    },
  });

  const submitCount = (rawNum) => {
    const num = Math.max(0, Number(rawNum) || 0);
    dispatch(setViewingCardsLog({ number: num }));
    applyLookSide(lookBottom, num);
  };

  const handleToggleLookSide = () => {
    const nextBottom = !lookBottom;
    setLookBottom(nextBottom);
    if (revealAllActive) {
      socket.emit("send msg", {
        type: "revealTopCardsClose",
        data: true,
        room: reduxRoom,
      });
      dispatch(setViewingOpponentTopCards(false));
      setRevealAllActive(false);
    }
    const num =
      partialDeck.length > 0
        ? partialDeck.length
        : Math.max(0, Number(textInput) || 0);
    setTextInput(String(num));
    applyLookSide(nextBottom, num);
  };

  const handleSubmit = () => {
    submitCount(textInput);
  };

  // +/- step the count and submit immediately, clamped to the deck size so the
  // buttons never log a no-op at the ends.
  const handleStepCount = (delta) => {
    const current = Number(textInput) || 0;
    const next = Math.min(Math.max(current + delta, 0), reduxDeck.length);
    if (next === current) return;
    setTextInput(String(next));
    submitCount(next);
  };

  const handleRevealAll = () => {
    if (revealAllActive) {
      socket.emit("send msg", {
        type: "revealTopCardsClose",
        data: true,
        room: reduxRoom,
      });
      dispatch(setViewingOpponentTopCards(false));
      setRevealAllActive(false);
      return;
    }
    socket.emit("send msg", {
      type: "revealTopCards",
      data: partialDeck,
      room: reduxRoom,
    });
    dispatch(setViewingOpponentTopCards(true));
    setRevealAllActive(true);
  };

  useEffect(() => {
    switch (reduxCardBack) {
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
  }, [reduxCardBack]);

  return (
    <>
      <div
        ref={(el) => registerDeck(el)}
        onMouseEnter={automated ? undefined : (event) => handlePopoverOpen(event)}
        onClick={
          automated
            ? undefined
            : () => {
                if (!ready) doDraw();
              }
        }
        style={{
          cursor: "default",
          position: "relative",
        }}
      >
        <img
          className={"cardStyle"}
          src={cardback}
          alt={"cardback"}
          style={{ visibility: shufflingDeck ? "hidden" : "visible" }}
        />
        <DeckFx side="player" />
      </div>

      {!automated && (
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
        }}
        open={popoverOpen}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        disableRestoreFocus
      >
        <Menu
          open={popoverOpen}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          onMouseLeave={() => handlePopoverClose()}
        >
          <div onMouseLeave={() => handlePopoverClose()}>
            <MenuItem onClick={() => handleDraw()}>Draw</MenuItem>
            <MenuItem onClick={() => handleMill()}>Mill</MenuItem>
            <MenuItem onClick={() => handleBanishFromTop()}>Banish</MenuItem>
            <MenuItem onClick={() => handleCardToEx()} disabled={exAreaFull}>
              Card to EX
            </MenuItem>
            <MenuItem onClick={() => handleShuffle()}>Shuffle Deck</MenuItem>
            <MenuItem onClick={() => handleViewDeck()}>View Deck</MenuItem>
            <MenuItem onClick={() => handleRevealDeck()}>Look At Top</MenuItem>
            <MenuItem onClick={() => handleDrawFour()}>Draw Four</MenuItem>
            <MenuItem onClick={() => handleMulligan()}>Mulligan Four</MenuItem>
            <MenuItem onClick={() => handleShuffleHand()}>
              Shuffle Hand
            </MenuItem>
            {/* <MenuItem onClick={(event) => handleReset(event)}>Reset</MenuItem> */}
          </div>
        </Menu>
      </Popover>
      )}
      {!automated && (
      <Menu
        open={cardContextMenu !== null}
        onClose={handleCardClose}
        anchorReference="anchorPosition"
        anchorPosition={
          cardContextMenu !== null
            ? {
                top: cardContextMenu.mouseY - 100,
                left: cardContextMenu.mouseX - 45,
              }
            : undefined
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {multi && <MenuItem disabled>{selected.size} cards selected</MenuItem>}
        {!reveal && (
          <MenuItem onClick={() => handleAddFromDeckToHand()}>Hand</MenuItem>
        )}
        {!reveal && !multi && primaryType(name) !== "Spell" && (
          <MenuItem onClick={() => handleCardToFieldFromDeck()}>
            Field
          </MenuItem>
        )}
        {!reveal && selectedAreSpells && (
          <MenuItem onClick={() => handleCardToPlayedFromDeck()}>Play</MenuItem>
        )}
        {reveal && (
          <MenuItem onClick={() => handleToHandFromRevealed()}>Hand</MenuItem>
        )}
        {reveal && (
          <MenuItem onClick={() => handleToTopOfDeck()}>Top of Deck</MenuItem>
        )}
        {reveal && (
          <MenuItem onClick={() => handleToBotOfDeck()}>Bot of Deck</MenuItem>
        )}
        <MenuItem onClick={() => handleToBanish()}>Banish</MenuItem>
        {!reveal && (
          <MenuItem onClick={() => handleAddFromDeckToHandWithoutRevealing()}>
            Hand (No Reveal)
          </MenuItem>
        )}
      </Menu>
      )}

      <Menu
        anchorEl={traitMenuAnchor}
        open={Boolean(traitMenuAnchor)}
        onClose={() => setTraitMenuAnchor(null)}
        PaperProps={{ style: { maxHeight: 420 } }}
      >
        <MenuItem selected={traits.length === 0} onClick={() => handleTraitSelect(null)}>
          All Traits
        </MenuItem>
        {availableTraits.map((trait) => (
          <MenuItem
            key={trait}
            selected={traits[0] === trait}
            onClick={() => handleTraitSelect(trait)}
          >
            {trait}
          </MenuItem>
        ))}
      </Menu>

      {!automated && (
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
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
            ...deckModalBoxStyle,
            // Hidden with opacity (not visibility/display) while dragging so the
            // dragged card's wrapper stays rendered and keeps its pointer
            // capture — otherwise the browser would release it and drop tracking.
            opacity: deckDrag.isDragging ? 0 : 1,
          }}
        >
          <ModalHideUiRow />
          {reveal && (
            <Button
              onClick={handleToggleLookSide}
              aria-label={lookBottom ? "Look at top of deck" : "Look at bottom of deck"}
              sx={{
                ...ghostButtonSx,
                position: "absolute",
                top: 8,
                right: 10,
                zIndex: 2,
                padding: "3px 12px",
              }}
            >
              {lookBottom ? "Top" : "Bottom"}
            </Button>
          )}
          <div
            style={{
              ...deckModalToolbar,
              ...(reveal ? { paddingRight: 82 } : {}),
            }}
          >
            <span style={deckModalTitle}>
              {reveal
                ? lookBottom
                  ? "LOOK AT BOTTOM"
                  : "LOOK AT TOP"
                : "VIEW DECK"}
            </span>
            <Button
              onClick={(e) => setTraitMenuAnchor(e.currentTarget)}
              sx={traitButtonSx}
              title={traits[0] || "All Traits"}
            >
              {traits[0] ? `Trait: ${traits[0]}` : "Trait: All"}
            </Button>
            {!reveal && (
              <>
                <span style={deckModalCount}>
                  {activeTypeCounts.Follower} FOLLOWERS
                </span>
                <span style={deckModalCount}>
                  {activeTypeCounts.Spell} SPELLS
                </span>
                <span style={deckModalCount}>
                  {activeTypeCounts.Amulet} AMULETS
                </span>
              </>
            )}
            {reveal && (
              <>
                <Button
                  onClick={() => handleStepCount(-1)}
                  sx={{ ...ghostButtonSx, minWidth: 34, padding: "4px 0" }}
                  aria-label="Decrease cards"
                >
                  −
                </Button>
                <input
                  className="no-number-spin"
                  style={{
                    width: 92,
                    fontSize: 14,
                    fontFamily: "Noto Serif JP, serif",
                    color: "#daf6ff",
                    background: "rgba(10, 14, 20, 0.75)",
                    border: "1px solid rgba(72, 171, 224, 0.5)",
                    borderRadius: 8,
                    outline: "none",
                    padding: "4px 8px",
                    textAlign: "center",
                    boxSizing: "border-box",
                  }}
                  type="number"
                  min={0}
                  value={textInput}
                  onChange={(event) => handleTextInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSubmit();
                  }}
                  placeholder="# of Cards"
                />
                <Button
                  onClick={() => handleStepCount(1)}
                  sx={{ ...primaryButtonSx, minWidth: 34, padding: "4px 0" }}
                  aria-label="Increase cards"
                >
                  +
                </Button>
                {(partialDeck.length > 0 || revealAllActive) && (
                  <>
                    {partialDeck.length > 0 && (
                      <>
                        <Button
                          onClick={() => handleAllToDeckEdge(lookBottom)}
                          sx={ghostButtonSx}
                        >
                          {lookBottom ? "Top Deck All" : "Bot Deck All"}
                        </Button>
                        <Button onClick={handleCemeteryAll} sx={ghostButtonSx}>
                          Cemetery All
                        </Button>
                        <Button onClick={handleBanishAll} sx={ghostButtonSx}>
                          Banish All
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={handleRevealAll}
                      sx={revealAllActive ? ghostButtonSx : primaryButtonSx}
                    >
                      {revealAllActive ? "Hide All" : "Reveal All"}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
          <CardMUI sx={deckModalCards} variant="outlined">
            {!reveal &&
              visibleIndices.map((idx) => {
                const card = reduxDeck[idx];
                return (
                  <div
                    key={`card-${idx}`}
                    onContextMenu={(e) => {
                      handleCardContextMenu(e, card, idx);
                    }}
                    onClick={(e) => {
                      // A click that ends a drag must not toggle selection.
                      if (deckDrag.movedRef.current) return;
                      handleCardClick(e, idx);
                    }}
                    {...deckDrag.dragProps(card, idx)}
                    className={selected.has(idx) ? "multiSelected" : "none"}
                    style={{ position: "relative", ...deckDrag.dragStyle }}
                  >
                    <Card ready={ready} name={card} setHovering={setHovering} />
                    {selected.has(idx) && (
                      <div
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          minWidth: 26,
                          height: 26,
                          padding: "0 6px",
                          borderRadius: 13,
                          background: "#1565c0",
                          border: "2px solid #ffffff",
                          color: "#ffffff",
                          fontFamily: "Noto Serif JP, serif",
                          fontSize: 16,
                          fontWeight: 800,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1002,
                          pointerEvents: "none",
                          textShadow: "0 1px 3px rgba(0,0,0,0.95)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.85)",
                        }}
                      >
                        {selectedOrder.indexOf(idx) + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            {reveal &&
              visibleIndices.map((idx) => {
                const card = partialDeck[idx];
                return (
                  <div
                    key={`card-${idx}`}
                    onContextMenu={(e) => {
                      handleCardContextMenu(e, card, idx);
                    }}
                    onClick={(e) => {
                      // A click that ends a drag must not toggle selection.
                      if (deckDrag.movedRef.current) return;
                      handleCardClick(e, idx);
                    }}
                    {...deckDrag.dragProps(card, idx)}
                    className={selected.has(idx) ? "multiSelected" : "none"}
                    style={{ position: "relative", ...deckDrag.dragStyle }}
                  >
                    <Card ready={ready} name={card} setHovering={setHovering} />
                    {selected.has(idx) && (
                      <div
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          minWidth: 26,
                          height: 26,
                          padding: "0 6px",
                          borderRadius: 13,
                          background: "#1565c0",
                          border: "2px solid #ffffff",
                          color: "#ffffff",
                          fontFamily: "Noto Serif JP, serif",
                          fontSize: 16,
                          fontWeight: 800,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1002,
                          pointerEvents: "none",
                          textShadow: "0 1px 3px rgba(0,0,0,0.95)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.85)",
                        }}
                      >
                        {selectedOrder.indexOf(idx) + 1}
                      </div>
                    )}
                  </div>
                );
              })}
          </CardMUI>
        </Box>
      </Modal>
      )}

      <ModalDragGhost drag={deckDrag} ready={ready} setHovering={setHovering} />
    </>
  );
}
