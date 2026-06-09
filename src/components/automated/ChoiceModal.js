import React, { useEffect, useState } from "react";

import {

  Dialog,

  DialogTitle,

  DialogContent,

  DialogActions,

  Button,

  Typography,

  Stack,

  Box,

} from "@mui/material";

import { useSelector } from "react-redux";

import { useEngineSync } from "../hooks/useEngineSync";

import { cardImage } from "../../decks/getCards";

import { getNameByCardNoClient } from "../../engine/cardLookup";



function CardChoiceButton({ cardNo, label, onClick, selected, disabled = false }) {

  const name = cardNo ? getNameByCardNoClient(cardNo) || label : label;

  const imgSrc = cardNo ? cardImage(name) : cardImage(label);

  return (

    <Button

      onClick={onClick}

      disabled={disabled}

      sx={{

        flexDirection: "column",

        p: 1,

        minWidth: 130,

        textTransform: "none",

        outline: selected ? "3px solid #f44336" : "none",

        borderRadius: 2,

        opacity: disabled ? 0.45 : 1,

      }}

    >

      {imgSrc ? (

        <Box

          component="img"

          src={imgSrc}

          alt={name}

          title={name}

          sx={{ height: 140, borderRadius: 1, boxShadow: 2, mb: 0.5 }}

        />

      ) : null}

      <Typography variant="caption" sx={{ maxWidth: 120, textAlign: "center" }}>

        {label}

      </Typography>

    </Button>

  );

}



export default function ChoiceModal() {

  const pending = useSelector((s) => s.gameState.pendingChoices);

  const gameMode = useSelector((s) => s.gameState.gameMode);

  const playerSlot = useSelector((s) => s.gameState.playerSlot);

  const hand = useSelector((s) => s.card.hand);

  const handInstanceIds = useSelector((s) => s.card.handInstanceIds);

  const { sendAction } = useEngineSync();

  const [selectedDiscardIds, setSelectedDiscardIds] = useState([]);



  useEffect(() => {

    setSelectedDiscardIds([]);

  }, [pending?.type, pending?.count, pending?.player, pending?.action]);



  if (gameMode !== "automated" || !pending) return null;

  if (pending.player != null && playerSlot != null && pending.player !== playerSlot) {

    return null;

  }



  const handleMulligan = (redraw) => {

    sendAction({ type: "MULLIGAN", redraw });

  };



  const targetCandidates =

    pending.type === "selectTarget"

      ? pending.candidates.map((c) =>

          typeof c === "string" ? { instanceId: c, label: c } : c,

        )

      : [];



  const zoneOptions =

    pending.type === "selectZoneCard"

      ? pending.options

      : pending.type === "selectDeckCard"

        ? pending.options

        : pending.type === "searchDeckTop"

          ? pending.options

          : [];



  const discardCandidates =

    pending.type === "discard"

      ? pending.candidates?.length

        ? pending.candidates

        : hand.map((name, i) => ({

            instanceId: handInstanceIds[i],

            label: name,

            cardNo: null,

          }))

      : [];



  const toggleDiscard = (instanceId) => {

    if (!instanceId) return;

    setSelectedDiscardIds((prev) => {

      if (prev.includes(instanceId)) {

        return prev.filter((id) => id !== instanceId);

      }

      if (prev.length >= pending.count) return prev;

      return [...prev, instanceId];

    });

  };



  const confirmDiscard = () => {

    sendAction({

      type: "CHOICE_RESPONSE",

      payload: { instanceIds: selectedDiscardIds },

    });

  };



  return (

    <Dialog open maxWidth="md" fullWidth>

      <DialogTitle>Game Choice Required</DialogTitle>

      <DialogContent sx={{ maxHeight: "70vh", overflowY: "auto" }}>

        {pending.sourceLabel && (
          <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 600 }}>
            {pending.sourceLabel}
          </Typography>
        )}

        {pending.reasonLabel && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {pending.reasonLabel}
          </Typography>
        )}

        {pending.type === "mulligan" && (

          <>

            <Typography sx={{ mb: 2 }}>

              Keep your opening hand or redraw 4 cards? (One time only)

            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center" }}>

              {hand.map((name, i) => (

                <Box

                  key={`${name}-${i}`}

                  component="img"

                  src={cardImage(name)}

                  alt={name}

                  title={name}

                  sx={{ height: 160, borderRadius: 1, boxShadow: 2 }}

                />

              ))}

            </Stack>

          </>

        )}

        {pending.type === "selectTrigger" && (

          <Typography>Select which ability resolves first:</Typography>

        )}

        {pending.type === "selectTarget" && (

          <Typography sx={{ mb: 1 }}>Select a target:</Typography>

        )}

        {(pending.type === "selectZoneCard" || pending.type === "selectDeckCard") && (

          <Typography sx={{ mb: 1 }}>Choose a card:</Typography>

        )}

        {pending.type === "searchDeckTop" && (

          <Typography sx={{ mb: 1 }}>

            Choose a matching card to add to your {pending.to}.

          </Typography>

        )}

        {pending.type === "selectZoneCards" && (

          <Typography sx={{ mb: 1 }}>

            Select {pending.count} card{pending.count === 1 ? "" : "s"} to{" "}

            {pending.action === "banish"
              ? "banish"
              : pending.action === "bury"
                ? "bury"
                : "discard"}{" "}
            ({selectedDiscardIds.length}/

            {pending.count}).

          </Typography>

        )}

        {pending.type === "discard" && (

          <>

            <Typography sx={{ mb: 1 }}>

              Select {pending.count} card{pending.count === 1 ? "" : "s"} to discard (

              {selectedDiscardIds.length}/{pending.count}).

            </Typography>

            <Stack

              direction="row"

              spacing={1}

              sx={{ flexWrap: "wrap", justifyContent: "center", mt: 1 }}

            >

              {discardCandidates.map((c) => (

                <CardChoiceButton

                  key={c.instanceId}

                  cardNo={c.cardNo}

                  label={c.label}

                  selected={selectedDiscardIds.includes(c.instanceId)}

                  onClick={() => toggleDiscard(c.instanceId)}

                />

              ))}

            </Stack>

          </>

        )}

        {pending.type === "wardEngage" && (

          <Typography sx={{ mb: 1 }}>

            Engage Ward followers (optional). Engaged followers are placed horizontally.

          </Typography>

        )}

        {pending.type === "choose" && (

          <Typography>Choose an option:</Typography>

        )}

        {pending.type === "chooseMultiple" && (

          <Typography>

            Choose up to {pending.max} option{pending.max === 1 ? "" : "s"} (

            {selectedDiscardIds.length}/{pending.max}). Click options in the order they should resolve.

          </Typography>

        )}

        {pending.type === "putHandOnDeck" && pending.phase === "selectCard" && (

          <Typography sx={{ mb: 1 }}>Choose a card to put on your deck:</Typography>

        )}

        {pending.type === "putHandOnDeck" && pending.phase === "selectPosition" && (

          <Typography sx={{ mb: 1 }}>Put the selected card on the top or bottom of your deck:</Typography>

        )}

        {pending.type === "selectCemeterySummon" && (

          <Typography sx={{ mb: 1 }}>

            Select up to {pending.count} follower(s) with total cost {pending.maxTotalCost} or less (

            {selectedDiscardIds.length}/{pending.count}).

          </Typography>

        )}



        {pending.type === "selectTarget" && (

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center", mt: 1 }}>

            {targetCandidates.map((c) => (

              <CardChoiceButton

                key={c.instanceId}

                cardNo={c.cardNo}

                label={c.label}

                onClick={() =>

                  sendAction({ type: "CHOICE_RESPONSE", payload: { targetId: c.instanceId } })

                }

              />

            ))}

          </Stack>

        )}



        {(pending.type === "selectZoneCard" || pending.type === "selectDeckCard") && (

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center", mt: 1 }}>

            {zoneOptions.map((o) => (

              <CardChoiceButton

                key={o.instanceId}

                cardNo={o.cardNo}

                label={o.label}

                onClick={() => {

                  sendAction({ type: "CHOICE_RESPONSE", payload: { instanceId: o.instanceId } });

                }}

              />

            ))}

          </Stack>

        )}

        {pending.type === "searchDeckTop" && (

          <>

            {zoneOptions.some((o) => o.eligible !== false) && (

              <>

                <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>

                  Eligible cards

                </Typography>

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center" }}>

                  {zoneOptions

                    .filter((o) => o.eligible !== false)

                    .map((o) => (

                      <CardChoiceButton

                        key={o.instanceId}

                        cardNo={o.cardNo}

                        label={o.label}

                        onClick={() => {

                          sendAction({ type: "CHOICE_RESPONSE", payload: { instanceId: o.instanceId } });

                        }}

                      />

                    ))}

                </Stack>

              </>

            )}

            {zoneOptions.some((o) => o.eligible === false) && (

              <>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5, color: "text.secondary" }}>

                  Other cards (cannot choose)

                </Typography>

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center" }}>

                  {zoneOptions

                    .filter((o) => o.eligible === false)

                    .map((o) => (

                      <CardChoiceButton

                        key={o.instanceId}

                        cardNo={o.cardNo}

                        label={o.label}

                        disabled

                        onClick={() => {}}

                      />

                    ))}

                </Stack>

              </>

            )}

          </>

        )}

        {pending.type === "selectZoneCards" && (

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center", mt: 1 }}>

            {pending.options.map((c) => (

              <CardChoiceButton

                key={c.instanceId}

                cardNo={c.cardNo}

                label={c.label}

                selected={selectedDiscardIds.includes(c.instanceId)}

                onClick={() => toggleDiscard(c.instanceId)}

              />

            ))}

          </Stack>

        )}

        {pending.type === "putHandOnDeck" && pending.phase === "selectCard" && (

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center", mt: 1 }}>

            {pending.options.map((o) => (

              <CardChoiceButton

                key={o.instanceId}

                cardNo={o.cardNo}

                label={o.label}

                onClick={() =>

                  sendAction({ type: "CHOICE_RESPONSE", payload: { instanceId: o.instanceId } })

                }

              />

            ))}

          </Stack>

        )}

        {(pending.type === "selectCemeterySummon" || pending.type === "chooseMultiple") && (

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center", mt: 1 }}>

            {pending.options.map((o) => {

              const key = pending.type === "chooseMultiple" ? o.index : o.instanceId;

              const selected =

                pending.type === "chooseMultiple"

                  ? selectedDiscardIds.includes(String(o.index))

                  : selectedDiscardIds.includes(o.instanceId);

              return (

                <CardChoiceButton

                  key={key}

                  cardNo={o.cardNo}

                  label={
                    pending.type === "chooseMultiple"
                      ? selectedDiscardIds.includes(String(o.index))
                        ? `${selectedDiscardIds.indexOf(String(o.index)) + 1}. ${o.label}`
                        : o.label
                      : `${o.label} (${o.cost} PP)`
                  }

                  selected={selected}

                  onClick={() => {

                    if (pending.type === "chooseMultiple") {

                      setSelectedDiscardIds((prev) => {

                        const id = String(o.index);

                        if (prev.includes(id)) return prev.filter((x) => x !== id);

                        if (prev.length >= pending.max) return prev;

                        return [...prev, id];

                      });

                    } else {

                      toggleDiscard(o.instanceId);

                    }

                  }}

                />

              );

            })}

          </Stack>

        )}



        {pending.type === "wardEngage" && (

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center", mt: 1 }}>

            {pending.candidates.map((c) => (

              <CardChoiceButton

                key={c.instanceId}

                cardNo={c.cardNo}

                label={`Engage ${c.label}`}

                selected={selectedDiscardIds.includes(c.instanceId)}

                onClick={() => toggleDiscard(c.instanceId)}

              />

            ))}

          </Stack>

        )}

      </DialogContent>

      <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>

        {pending.type === "mulligan" && (

          <>

            <Button onClick={() => handleMulligan(false)}>Keep</Button>

            <Button onClick={() => handleMulligan(true)} variant="contained">

              Redraw

            </Button>

          </>

        )}

        {pending.type === "discard" && (

          <Button

            variant="contained"

            color="error"

            disabled={selectedDiscardIds.length !== pending.count}

            onClick={confirmDiscard}

          >

            Discard selected

          </Button>

        )}

        {pending.type === "selectZoneCards" && (

          <Button

            variant="contained"

            disabled={selectedDiscardIds.length !== pending.count}

            onClick={() =>

              sendAction({

                type: "CHOICE_RESPONSE",

                payload: { instanceIds: selectedDiscardIds },

              })

            }

          >

            Confirm

          </Button>

        )}

        {pending.type === "selectTrigger" &&

          pending.options.map((o) => (

            <Button

              key={o.triggerId}

              onClick={() =>

                sendAction({ type: "CHOICE_RESPONSE", payload: { triggerId: o.triggerId } })

              }

            >

              {o.label}

            </Button>

          ))}

        {(pending.type === "selectZoneCard" ||

          pending.type === "selectDeckCard" ||

          pending.type === "searchDeckTop") &&

          pending.optional && (

            <Button

              onClick={() => sendAction({ type: "CHOICE_RESPONSE", payload: { skip: true } })}

            >

              Skip

            </Button>

          )}

        {pending.type === "wardEngage" && (

          <>

            <Button

              onClick={() => sendAction({ type: "CHOICE_RESPONSE", payload: { instanceIds: [] } })}

            >

              Skip

            </Button>

            <Button

              variant="contained"

              disabled={selectedDiscardIds.length === 0}

              onClick={() =>

                sendAction({

                  type: "CHOICE_RESPONSE",

                  payload: { instanceIds: selectedDiscardIds },

                })

              }

            >

              Engage selected

            </Button>

          </>

        )}

        {pending.type === "choose" &&

          pending.options.map((o) => (

            <Button

              key={o.index}

              onClick={() =>

                sendAction({ type: "CHOICE_RESPONSE", payload: { optionIndex: o.index } })

              }

            >

              {o.label}

            </Button>

          ))}

        {pending.type === "chooseMultiple" && (

          <Button

            variant="contained"

            disabled={selectedDiscardIds.length < pending.min}

            onClick={() =>

              sendAction({

                type: "CHOICE_RESPONSE",

                payload: {

                  optionIndices: selectedDiscardIds.map((id) => Number(id)),

                },

              })

            }

          >

            Confirm choices

          </Button>

        )}

        {pending.type === "selectCemeterySummon" && (

          <>

            <Button

              variant="contained"

              onClick={() =>

                sendAction({

                  type: "CHOICE_RESPONSE",

                  payload: { instanceIds: selectedDiscardIds },

                })

              }

            >

              Summon selected

            </Button>

            <Button

              onClick={() => sendAction({ type: "CHOICE_RESPONSE", payload: { instanceIds: [] } })}

            >

              Skip

            </Button>

          </>

        )}

        {pending.type === "putHandOnDeck" && pending.phase === "selectPosition" && (

          <>

            <Button

              onClick={() => sendAction({ type: "CHOICE_RESPONSE", payload: { position: "top" } })}

            >

              Top of deck

            </Button>

            <Button

              onClick={() => sendAction({ type: "CHOICE_RESPONSE", payload: { position: "bottom" } })}

            >

              Bottom of deck

            </Button>

          </>

        )}

      </DialogActions>

    </Dialog>

  );

}

