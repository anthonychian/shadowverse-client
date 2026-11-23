import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { artImage, artThumb } from "../../decks/getCards";
import {
  countCardTypes,
  matchesFilters,
  traitsInCards,
} from "../../decks/cardDetails";
import { Menu, MenuItem, Modal, Box, Button } from "@mui/material";
import CardMUI from "@mui/material/Card";
import Card from "../hand/Card";
import { setViewingCemeteryOpponent } from "../../redux/CardSlice";
import { registerEnemyCemetery } from "./handDrag";
import {
  deckModalCards,
  deckModalCount,
  deckModalTitle,
  deckModalToolbar,
  ghostButtonSx,
  traitButtonSx,
  useDeckModalBoxStyle,
} from "./deckModalStyles";
import "../../css/Card.css";
import { useUiModalOpen } from "../hooks/useUiChromeVisible";
import { ModalHideUiRow } from "../ui/HideUiButton";

const img = require("../../assets/pin_bellringer_angel.png");

export default function EnemyCemetery({ setHovering, ready }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const modalOpen = useUiModalOpen(open);
  const modalBoxStyle = useDeckModalBoxStyle(modalOpen);
  const [cemeterySelected, setCemeterySelected] = useState(true);
  const [banishSelected, setBanishSelected] = useState(false);
  const [traits, setTraits] = useState([]);
  const [traitMenuAnchor, setTraitMenuAnchor] = useState(null);

  const reduxEnemyCemetery = useSelector((state) => state.card.enemyCemetery);
  const reduxEnemyArt = useSelector((state) => state.card.enemyArt);
  const reduxEnemyBanish = useSelector((state) => state.card.enemyBanish);

  const activePile = cemeterySelected ? reduxEnemyCemetery : reduxEnemyBanish;
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
    }
  }, [availableTraits, traits]);

  const activeTypeCounts = countCardTypes(
    visibleIndices.map((index) => activePile[index]),
  );

  const handleModalOpen = () => {
    if (
      (reduxEnemyCemetery.length > 0 || reduxEnemyBanish.length > 0) &&
      !ready
    ) {
      setOpen(true);
      setTraits([]);
      setTraitMenuAnchor(null);
      dispatch(setViewingCemeteryOpponent(true));
    }
  };
  const handleModalClose = () => {
    setOpen(false);
    setTraits([]);
    setTraitMenuAnchor(null);
    dispatch(setViewingCemeteryOpponent(false));
  };
  const handleTraitSelect = (value) => {
    setTraits(value ? [value] : []);
    setTraitMenuAnchor(null);
  };
  const handleCemeterySelected = () => {
    setCemeterySelected(true);
    setBanishSelected(false);
    setTraits([]);
    setTraitMenuAnchor(null);
  };
  const handleBanishSelected = () => {
    setCemeterySelected(false);
    setBanishSelected(true);
    setTraits([]);
    setTraitMenuAnchor(null);
  };

  return (
    <>
      <div
        ref={(el) => registerEnemyCemetery(el)}
        onClick={handleModalOpen}
        style={{
          // height: "160px",
          // width: "115px",
          borderRadius: "10px",
          border: "4px solid #1a20d6c8",
          cursor: `url(${img}) 55 55, auto`,
          position: "relative",
        }}
        className={"cardStyle"}
      >
        {reduxEnemyCemetery && reduxEnemyCemetery.length > 0 && (
          <img
            // height={"160px"}
            className={"cardStyle"}
            src={artThumb(reduxEnemyCemetery[0], reduxEnemyArt)}
            onError={(e) => {
              if (e.currentTarget.src.indexOf("/thumbs/") !== -1)
                e.currentTarget.src = artImage(reduxEnemyCemetery[0], reduxEnemyArt);
            }}
            alt={"cardback"}
          />
        )}
        <div
          style={{
            width: "50px",
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            top: "70%",
            right: "30%",
            color: "rgba(255, 255, 255, 1)",
            fontSize: "30px",
            fontFamily: "Noto Serif JP, serif",
          }}
        >
          {reduxEnemyCemetery.length || 0}
        </div>
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
          <Button
            onClick={
              cemeterySelected ? handleBanishSelected : handleCemeterySelected
            }
            aria-label={cemeterySelected ? "View banish" : "View cemetery"}
            sx={{
              ...ghostButtonSx,
              position: "absolute",
              top: 8,
              right: 10,
              zIndex: 2,
              padding: "3px 12px",
            }}
          >
            {cemeterySelected ? "Banish" : "Cemetery"}
          </Button>
          <div style={{ ...deckModalToolbar, paddingRight: 82 }}>
            <span style={deckModalTitle}>
              {cemeterySelected ? "CEMETERY" : "BANISH"}
            </span>
            <Button
              onClick={(e) => setTraitMenuAnchor(e.currentTarget)}
              sx={traitButtonSx}
              title={traits[0] || "All Traits"}
            >
              {traits[0] ? `Trait: ${traits[0]}` : "Trait: All"}
            </Button>
            <span style={deckModalCount}>
              {activeTypeCounts.Follower} FOLLOWERS
            </span>
            <span style={deckModalCount}>
              {activeTypeCounts.Spell} SPELLS
            </span>
            <span style={deckModalCount}>
              {activeTypeCounts.Amulet} AMULETS
            </span>
          </div>
          <CardMUI sx={deckModalCards} variant="outlined">
            {cemeterySelected &&
              visibleIndices.map((idx) => (
                <div key={`card-${idx}`}>
                  <Card
                    ready={ready}
                    name={reduxEnemyCemetery[idx]}
                    setHovering={setHovering}
                  />
                </div>
              ))}
            {banishSelected &&
              visibleIndices.map((idx) => (
                <div key={`card-${idx}`} style={{ width: "115px" }}>
                  <Card
                    ready={ready}
                    name={reduxEnemyBanish[idx]}
                    evolvedUsed={true}
                    setHovering={setHovering}
                  />
                </div>
              ))}
          </CardMUI>
        </Box>
      </Modal>

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
    </>
  );
}
