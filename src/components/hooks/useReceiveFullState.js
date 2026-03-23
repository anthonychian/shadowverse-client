import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { unstable_batchedUpdates } from "react-dom";
import { socket } from "../../sockets";

import {
  setEnemyAura,
  setEnemyBanish,
  setEnemyCard,
  setEnemyCardBack,
  setEnemyCemetery,
  setEnemyCounter,
  setEnemyCustomValues,
  setEnemyDeckSize,
  setEnemyEngaged,
  setEnemyEvoDeck,
  setEnemyEvoField,
  setEnemyEvoPoints,
  setEnemyField,
  setEnemyHand,
  setEnemyHealth,
  setEnemyLeader,
  setEnemyLeaderActive,
  setEnemySuperEvoActive,
  setEnemyPlayPoints,
  restoreOwnState,
} from "../../redux/CardSlice";

const applyEnemyState = (dispatch, s) => {
  if (s.field !== undefined) dispatch(setEnemyField(s.field));
  if (s.evoField !== undefined) dispatch(setEnemyEvoField(s.evoField));
  if (s.hand !== undefined) dispatch(setEnemyHand(s.hand));
  if (s.leader !== undefined) dispatch(setEnemyLeader(s.leader));
  if (s.leaderActive !== undefined)
    dispatch(setEnemyLeaderActive(s.leaderActive));
  if (s.superEvoActive !== undefined)
    dispatch(setEnemySuperEvoActive(s.superEvoActive));
  if (s.playerHealth !== undefined) dispatch(setEnemyHealth(s.playerHealth));
  if (s.playPoints !== undefined) dispatch(setEnemyPlayPoints(s.playPoints));
  if (s.evoPoints !== undefined) dispatch(setEnemyEvoPoints(s.evoPoints));
  if (s.evoDeck !== undefined) dispatch(setEnemyEvoDeck(s.evoDeck));
  if (s.deck !== undefined) dispatch(setEnemyDeckSize(s.deck.length));
  if (s.cemetery !== undefined) dispatch(setEnemyCemetery(s.cemetery));
  if (s.cardback !== undefined) dispatch(setEnemyCardBack(s.cardback));
  if (s.currentCard !== undefined) dispatch(setEnemyCard(s.currentCard));
  if (s.banish !== undefined) dispatch(setEnemyBanish(s.banish));
  if (s.auraField !== undefined) dispatch(setEnemyAura(s.auraField));
  if (s.counterField !== undefined) dispatch(setEnemyCounter(s.counterField));
  if (s.customValues !== undefined)
    dispatch(setEnemyCustomValues(s.customValues));
  if (s.engagedField !== undefined) dispatch(setEnemyEngaged(s.engagedField));
};

const useReceiveFullState = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Primary path: server has stored state for both players
    socket.on("receive_stored_state", ({ ownState, enemyState }) => {
      console.log(
        "[receive_stored_state] own:",
        !!ownState,
        "enemy:",
        !!enemyState,
      );
      unstable_batchedUpdates(() => {
        if (ownState) dispatch(restoreOwnState(ownState));
        if (enemyState) applyEnemyState(dispatch, enemyState);
      });
    });

    // Fallback: peer-based sync (opponent sends their state directly)
    socket.on("receive_full_state", (message) => {
      console.log("[receive_full_state] peer state received");
      const fullState = message.data || message;
      unstable_batchedUpdates(() => {
        applyEnemyState(dispatch, fullState);
        // Recover own state from opponent's enemy* fields
        dispatch(
          restoreOwnState({
            field: fullState.enemyField,
            evoField: fullState.enemyEvoField,
            hand: fullState.enemyHand,
            playerHealth: fullState.enemyHealth,
            playPoints: fullState.enemyPlayPoints,
            evoPoints: fullState.enemyEvoPoints,
            leader: fullState.enemyLeader,
            leaderActive: fullState.enemyLeaderActive,
            superEvoActive: fullState.enemySuperEvoActive,
            cardback: fullState.enemyCardback,
            cemetery: fullState.enemyCemetery,
            banish: fullState.enemyBanish,
            evoDeck: fullState.enemyEvoDeck,
            engagedField: fullState.enemyEngagedField,
            counterField: fullState.enemyCounterField,
            auraField: fullState.enemyAuraField,
            baneField: fullState.enemyBaneField,
            wardField: fullState.enemyWardField,
            customValues: fullState.enemyCustomValues,
          }),
        );
      });
    });

    return () => {
      socket.off("receive_stored_state");
      socket.off("receive_full_state");
    };
  }, [dispatch]);
};

export default useReceiveFullState;
