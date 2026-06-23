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
  setEnemyArt,
  setEnemyKeyword,
  restoreOwnState,
  setSelfResyncing,
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
  if (s.keywordField !== undefined) dispatch(setEnemyKeyword(s.keywordField));
  if (s.counterField !== undefined) dispatch(setEnemyCounter(s.counterField));
  if (s.customValues !== undefined)
    dispatch(setEnemyCustomValues(s.customValues));
  if (s.engagedField !== undefined) dispatch(setEnemyEngaged(s.engagedField));
  // The opponent's own art choices (their `myArt`) become our enemy art.
  if (s.myArt !== undefined) dispatch(setEnemyArt(s.myArt));
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
        dispatch(setSelfResyncing(false));
      });
    });

    // Peer-based sync: the opponent sends their full live state. We use it ONLY
    // to refresh our view of the enemy (gap repair / reconnect reconciliation).
    //
    // We deliberately do NOT reconstruct our OWN board from the opponent's
    // `enemy*` mirror here: that mirror is the laggy copy and using it would
    // overwrite our authoritative local state, causing the very desyncs we are
    // trying to fix. Own-state recovery after a reload/reconnect is handled
    // authoritatively by the server snapshot via `receive_stored_state`.
    socket.on("receive_full_state", (message) => {
      console.log("[receive_full_state] peer state received");
      const fullState = message.data || message;
      unstable_batchedUpdates(() => {
        applyEnemyState(dispatch, fullState);
        dispatch(setSelfResyncing(false));
      });
    });

    return () => {
      socket.off("receive_stored_state");
      socket.off("receive_full_state");
    };
  }, [dispatch]);
};

export default useReceiveFullState;
