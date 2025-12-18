import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { unstable_batchedUpdates } from "react-dom";
import { socket } from "../../sockets";

import {
  setEnemyAura,
  setEnemyBanish,
  setEnemyCard,
  setEnemyCardBack,
  setEnemyCardSelectedInHand,
  setEnemyCardSelectedOnField,
  setEnemyCemetery,
  setEnemyCounter,
  setEnemyCustomValues,
  setEnemyDeckSize,
  setEnemyDice,
  setEnemyEvoDeck,
  setEnemyEvoField,
  setEnemyEvoPoints,
  setEnemyField,
  setEnemyHand,
  setEnemyHealth,
  setEnemyLeader,
  setEnemyLeaderActive,
  setEnemyLog,
  setEnemyOnlineStatus,
  setEnemyPlayPoints,
  setEnemyViewingCemetery,
  setEnemyViewingCemeteryOpponent,
  setEnemyViewingDeck,
  setEnemyViewingEvoDeck,
  setEnemyViewingEvoDeckOpponent,
  setEnemyViewingHand,
  setEnemyViewingTopCards,
  setShowEnemyCard,
  setShowEnemyHand,
} from "../../redux/CardSlice";

const useReceiveFullState = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("receive_full_state", (message) => {
      // Handle both old format (direct fullState) and new format (wrapped in message)
      const fullState = message.data || message;
      
      // Batch all state updates together to prevent intermediate renders
      unstable_batchedUpdates(() => {
        if (fullState.field !== undefined) dispatch(setEnemyField(fullState.field));
        if (fullState.evoField !== undefined) dispatch(setEnemyEvoField(fullState.evoField));
        if (fullState.hand !== undefined) dispatch(setEnemyHand(fullState.hand));
        if (fullState.leader !== undefined) dispatch(setEnemyLeader(fullState.leader));
        if (fullState.leaderActive !== undefined) dispatch(setEnemyLeaderActive(fullState.leaderActive));
        if (fullState.health !== undefined) dispatch(setEnemyHealth(fullState.health));
        if (fullState.playPoints !== undefined) dispatch(setEnemyPlayPoints(fullState.playPoints));
        if (fullState.evoPoints !== undefined) dispatch(setEnemyEvoPoints(fullState.evoPoints));
        if (fullState.evoDeck !== undefined) dispatch(setEnemyEvoDeck(fullState.evoDeck));
        if (fullState.deck !== undefined) dispatch(setEnemyDeckSize(fullState.deck.length));
        if (fullState.cemetery !== undefined) dispatch(setEnemyCemetery(fullState.cemetery));
        if (fullState.cardBack !== undefined) dispatch(setEnemyCardBack(fullState.cardBack));
        if (fullState.currentCard !== undefined) dispatch(setEnemyCard(fullState.currentCard));
        if (fullState.banish !== undefined) dispatch(setEnemyBanish(fullState.banish));
        if (fullState.aura !== undefined) dispatch(setEnemyAura(fullState.aura));
        if (fullState.counter !== undefined) dispatch(setEnemyCounter(fullState.counter));
        if (fullState.customValues !== undefined) dispatch(setEnemyCustomValues(fullState.customValues));
        if (fullState.onlineStatus !== undefined) dispatch(setEnemyOnlineStatus(fullState.onlineStatus));
        if (fullState.log !== undefined) dispatch(setEnemyLog(fullState.log));
      // dispatch(setEnemyViewingCemetery(fullState.viewingCemetery));
      // dispatch(
      //   setEnemyViewingCemeteryOpponent(fullState.viewingCemeteryOpponent)
      // );
      // dispatch(setEnemyViewingDeck(fullState.viewingDeck));
      // dispatch(setEnemyViewingEvoDeck(fullState.viewingEvoDeck));
      // dispatch(
      //   setEnemyViewingEvoDeckOpponent(fullState.viewingEvoDeckOpponent)
      // );
      // dispatch(setShowEnemyHand(fullState.showEnemyHand));
      // dispatch(setShowEnemyCard(fullState.showEnemyCard));

      // dispatch(setEnemyViewingHand(fullState.viewingHand));
      // dispatch(setEnemyViewingTopCards(fullState.viewingTopCards));
      // dispatch(setEnemyCardSelectedInHand(fullState.cardSelectedInHand));
      // dispatch(setEnemyCardSelectedOnField(fullState.cardSelectedOnField));
    });

    return () => {
      socket.off("receive_full_state");
    };
  }, [dispatch]);
};

export default useReceiveFullState;
