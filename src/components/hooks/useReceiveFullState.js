import { useEffect } from "react";
import { useDispatch } from "react-redux";
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
    socket.on("receive_full_state", (fullState) => {
      dispatch(setEnemyField(fullState.field));
      dispatch(setEnemyEvoField(fullState.evoField));
      dispatch(setEnemyHand(fullState.hand));
      dispatch(setEnemyLeader(fullState.leader));
      dispatch(setEnemyLeaderActive(fullState.leaderActive));
      dispatch(setEnemyHealth(fullState.health));
      dispatch(setEnemyPlayPoints(fullState.playPoints));
      dispatch(setEnemyEvoPoints(fullState.evoPoints));
      dispatch(setEnemyEvoDeck(fullState.evoDeck));
      dispatch(setEnemyDeckSize(fullState.deck.length));
      dispatch(setEnemyCemetery(fullState.cemetery));
      dispatch(setEnemyCardBack(fullState.cardBack));
      dispatch(setEnemyCard(fullState.currentCard));
      dispatch(setEnemyBanish(fullState.banish));
      dispatch(setEnemyAura(fullState.aura));
      dispatch(setEnemyCounter(fullState.counter));
      dispatch(setEnemyCustomValues(fullState.customValues));
      dispatch(setEnemyOnlineStatus(fullState.onlineStatus));
      dispatch(setEnemyLog(fullState.log));
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
