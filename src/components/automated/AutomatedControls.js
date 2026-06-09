import React from "react";

import { Button, Stack, Chip } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";

import { useEngineSync } from "../hooks/useEngineSync";

import { setSelectedAttackerId } from "../../redux/GameStateSlice";



export default function AutomatedControls() {

  const dispatch = useDispatch();

  const gameMode = useSelector((s) => s.gameState.gameMode);

  const phase = useSelector((s) => s.gameState.enginePhase);

  const legal = useSelector((s) => s.gameState.legalActions);

  const winner = useSelector((s) => s.gameState.engineWinner);

  const leaderActive = useSelector((s) => s.card.leaderActive);

  const selectedAttackerId = useSelector((s) => s.gameState.selectedAttackerId);

  const pendingChoices = useSelector((s) => s.gameState.pendingChoices);

  const { sendAction } = useEngineSync();



  if (gameMode !== "automated") return null;



  const canAttackLeader =

    selectedAttackerId &&

    legal.includes(`ATTACK_LEADER:${selectedAttackerId}`);



  const handleAttackLeader = () => {

    if (!canAttackLeader) return;

    sendAction({

      type: "ATTACK",

      attackerId: selectedAttackerId,

      targetId: "leader",

    });

    dispatch(setSelectedAttackerId(null));

  };



  return (

    <Stack direction="row" spacing={1} sx={{ position: "fixed", bottom: 120, left: 16, zIndex: 1000 }}>

      <Chip label={`Phase: ${phase || "—"}`} color="primary" size="small" />

      {phase === "gameOver" && winner != null && (

        <Chip label={`Winner: P${winner}`} color="success" />

      )}

      {selectedAttackerId && !pendingChoices && (

        <Chip label="Select attack target" color="warning" size="small" />

      )}

      {canAttackLeader && (

        <Button variant="contained" size="small" color="secondary" onClick={handleAttackLeader}>

          Attack Leader

        </Button>

      )}

      {legal.includes("PASS_QUICK_WINDOW") && (

        <Button variant="contained" size="small" color="secondary" onClick={() => sendAction({ type: "PASS_QUICK_WINDOW" })}>

          Pass Quick

        </Button>

      )}

    </Stack>

  );

}

