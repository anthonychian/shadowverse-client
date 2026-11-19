import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Box } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import { setViewingEvoDeckOpponent } from "../../redux/CardSlice";
import { countCardTypes, compareCardsByCost } from "../../decks/cardDetails";

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
import { useUiModalOpen } from "../hooks/useUiChromeVisible";
import { ModalHideUiRow } from "../ui/HideUiButton";
import {
  useDeckModalBoxStyle,
  deckModalToolbar,
  deckModalTitle,
  deckModalCount,
  deckModalCards,
} from "./deckModalStyles";

export default function EnemyEvoDeck({ setHovering, ready }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const modalOpen = useUiModalOpen(open);
  const modalBoxStyle = useDeckModalBoxStyle(modalOpen);
  const [cardback, setCardback] = useState();
  const reduxEnemyCardBack = useSelector((state) => state.card.enemyCardback);
  const reduxEnemyEvoDeck = useSelector((state) => state.card.enemyEvoDeck);
  const orderedEnemyEvoDeck = useMemo(
    () => [...reduxEnemyEvoDeck].sort((a, b) => compareCardsByCost(a.card, b.card)),
    [reduxEnemyEvoDeck],
  );

  const handleModalOpen = () => {
    setOpen(true);
    dispatch(setViewingEvoDeckOpponent(true));
  };
  const handleModalClose = () => {
    setOpen(false);
    dispatch(setViewingEvoDeckOpponent(false));
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

  const revealedEvoCards = reduxEnemyEvoDeck
    .filter((entry) => entry.status)
    .map((entry) => entry.card);
  const evoTypeCounts = countCardTypes(revealedEvoCards);

  return (
    <>
      <div
        onClick={handleModalOpen}
        style={{
          // height: "160px",
          // width: "115px",
          cursor: "default",
        }}
        className={"cardStyle"}
      >
        <img className={"cardStyle"} src={cardback} alt={"cardback"} />
      </div>

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
        <Box sx={modalBoxStyle}>
          <ModalHideUiRow />
          <div style={deckModalToolbar}>
            <span style={deckModalTitle}>OPPONENT EVOLVE DECK</span>
            <span style={deckModalCount}>
              {evoTypeCounts.Follower} FOLLOWERS
            </span>
            <span style={deckModalCount}>{evoTypeCounts.Spell} SPELLS</span>
            <span style={deckModalCount}>
              {evoTypeCounts.Amulet} AMULETS
            </span>
          </div>
          <CardMUI sx={deckModalCards} variant="outlined">
            {orderedEnemyEvoDeck.map((card, idx) => (
              <div style={{ width: "115px" }} key={`card-${idx}`}>
                {card.status && (
                  <Card
                    name={card.card}
                    ready={ready}
                    setHovering={setHovering}
                  />
                )}

                {!card.status && (
                  <img
                    className={"cardStyle"}
                    src={cardback}
                    alt={"cardback"}
                  />
                )}
              </div>
            ))}
          </CardMUI>
        </Box>
      </Modal>
    </>
  );
}
