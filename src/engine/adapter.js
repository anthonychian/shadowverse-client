import {
  getCardDefClient,
  getCardByNameClient,
  getNameByCardNoClient,
  getCardStatsClient,
} from "./cardLookup";
import { cardImage, getCardNoFromName } from "../decks/getCards";

/**
 * Maps authoritative engine PlayerView state into legacy Redux CardSlice shape
 * so existing Field/Hand/PlayPoints components render without a full rewrite.
 */
export function engineViewToRedux(view, playerSlot) {
  if (!view?.state) return null;

  const self = view.self;
  const enemy = self === 0 ? 1 : 0;
  const ps = view.state.players[self];
  const es = view.state.players[enemy];

  const field = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const fieldInstanceIds = Array(10).fill(null);
  const evoField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const engagedField = Array(10).fill(false);
  const customValues = Array(10)
    .fill(null)
    .map(() => ({ showAtk: true, atk: 0, showDef: true, def: 0 }));
  const wardField = Array(10).fill(0);
  const baneField = Array(10).fill(0);
  const auraField = Array(10).fill(0);
  const exPlayCostField = Array(10).fill(null);

  const cardName = (instance) => {
    if (instance.cardNo === "HIDDEN") return "Hidden Card";
    return (
      getNameByCardNoClient(instance.cardNo) ||
      getCardDefClient(instance.cardNo)?.name ||
      instance.cardNo
    );
  };

  const findEvoInstance = (playerState, evolveInstanceId) => {
    if (!evolveInstanceId) return null;
    return (
      playerState.zones.resolutionZone.find((c) => c.instanceId === evolveInstanceId) ||
      playerState.zones.evolveDeck.find((c) => c.instanceId === evolveInstanceId) ||
      playerState.zones.cemetery.find((c) => c.instanceId === evolveInstanceId)
    );
  };

  const applyStats = (inst, idx, displayCardNo) => {
    const stats = getCardStatsClient(displayCardNo || inst.cardNo);
    let atk = stats.attack;
    let defVal = stats.defense;
    for (const m of inst.modifiers || []) {
      atk += m.atk ?? 0;
      defVal += m.def ?? 0;
    }
    customValues[idx] = { showAtk: true, atk, showDef: true, def: defVal };
    wardField[idx] = stats.keywords.includes("ward") ? 1 : 0;
    baneField[idx] = stats.keywords.includes("bane") ? 1 : 0;
    auraField[idx] = stats.keywords.includes("aura") ? 1 : 0;
    // Engaged = horizontal; reserved = vertical (do not rotate).
    engagedField[idx] = Boolean(inst.engaged);
  };

  ps.zones.field.forEach((inst, i) => {
    field[i] = cardName(inst);
    fieldInstanceIds[i] = inst.instanceId;
    const link = ps.zones.evolveZone.find((l) => l.fieldInstanceId === inst.instanceId);
    const evoInst =
      (link ? findEvoInstance(ps, link.evolveInstanceId) : null) ||
      (inst.linkedEvoInstanceId ? findEvoInstance(ps, inst.linkedEvoInstanceId) : null);
    if (evoInst) {
      evoField[i] = cardName(evoInst);
      applyStats(inst, i, evoInst.cardNo);
    } else {
      applyStats(inst, i);
    }
  });

  ps.zones.exArea.forEach((inst, i) => {
    const idx = 5 + i;
    field[idx] = cardName(inst);
    fieldInstanceIds[idx] = inst.instanceId;
    applyStats(inst, idx);
    const printed = getCardStatsClient(inst.cardNo).cost ?? 0;
    const effective = view.exPlayCosts?.[inst.instanceId];
    if (effective != null && effective < printed) {
      exPlayCostField[idx] = effective;
    }
  });

  const enemyField = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const enemyFieldInstanceIds = Array(10).fill(null);
  const enemyEvoField = Array(10).fill(0);
  const enemyEngaged = Array(10).fill(false);
  const enemyExPlayCostField = Array(10).fill(null);
  const enemyCustom = Array(10)
    .fill(null)
    .map(() => ({ showAtk: true, atk: 0, showDef: true, def: 0 }));

  es.zones.field.forEach((inst, i) => {
    enemyField[i] = cardName(inst);
    enemyFieldInstanceIds[i] = inst.instanceId;
    enemyEngaged[i] = Boolean(inst.engaged);
    const link = es.zones.evolveZone.find((l) => l.fieldInstanceId === inst.instanceId);
    const evoInst =
      (link ? findEvoInstance(es, link.evolveInstanceId) : null) ||
      (inst.linkedEvoInstanceId ? findEvoInstance(es, inst.linkedEvoInstanceId) : null);
    if (evoInst) {
      enemyEvoField[i] = cardName(evoInst);
    }
    const displayNo = evoInst?.cardNo || inst.cardNo;
    const est = getCardStatsClient(displayNo);
    let atk = est.attack;
    let defVal = est.defense;
    for (const m of inst.modifiers || []) {
      atk += m.atk ?? 0;
      defVal += m.def ?? 0;
    }
    enemyCustom[i] = { showAtk: true, atk, showDef: true, def: defVal };
  });
  es.zones.exArea.forEach((inst, i) => {
    const idx = 5 + i;
    enemyField[idx] = cardName(inst);
    enemyFieldInstanceIds[idx] = inst.instanceId;
    const est = getCardStatsClient(inst.cardNo);
    let atk = est.attack;
    let defVal = est.defense;
    for (const m of inst.modifiers || []) {
      atk += m.atk ?? 0;
      defVal += m.def ?? 0;
    }
    enemyCustom[idx] = { showAtk: true, atk, showDef: true, def: defVal };
    const printed = getCardStatsClient(inst.cardNo).cost ?? 0;
    const effective = view.opponentExPlayCosts?.[inst.instanceId];
    if (effective != null && effective < printed) {
      enemyExPlayCostField[idx] = effective;
    }
  });

  return {
    hand: ps.zones.hand.map((c) => cardName(c)),
    handInstanceIds: ps.zones.hand.map((c) => c.instanceId),
    enemyHand: Array(view.opponentHandCount).fill("Hidden Card"),
    deck: ps.zones.deck.map((c) => cardName(c)),
    field,
    fieldInstanceIds,
    evoField,
    engagedField,
    customValues,
    wardField,
    baneField,
    auraField,
    exPlayCostField,
    enemyField,
    enemyFieldInstanceIds,
    enemyEvoField,
    enemyEngagedField: enemyEngaged,
    enemyExPlayCostField,
    enemyCustomValues: enemyCustom,
    cemetery: ps.zones.cemetery.map((c) => cardName(c)),
    cemeteryInstanceIds: ps.zones.cemetery.map((c) => c.instanceId),
    enemyCemetery: es.zones.cemetery.map((c) => cardName(c)),
    playPoints: { available: ps.pp, max: ps.maxPp },
    enemyPlayPoints: { available: es.pp, max: es.maxPp },
    evoPoints: ps.evoPoints,
    enemyEvoPoints: es.evoPoints,
    playerHealth: ps.leaderDef,
    enemyHealth: es.leaderDef,
    leaderActive: view.state.activePlayer === self && view.state.phase === "main",
    enemyLeaderActive: view.state.activePlayer === enemy && view.state.phase === "main",
    superEvoActive: ps.superEvoPoints > 0,
    instanceMap: buildInstanceMap(ps),
  };
}

function buildInstanceMap(ps) {
  const map = {};
  const add = (list) => {
    for (const c of list) {
      const name =
        getNameByCardNoClient(c.cardNo) ||
        getCardDefClient(c.cardNo)?.name ||
        c.cardNo;
      map[name] = { instanceId: c.instanceId, cardNo: c.cardNo };
    }
  };
  add(ps.zones.hand);
  add(ps.zones.field);
  add(ps.zones.exArea);
  return map;
}

/** Build deck payload for server from deck names (uses MVP mapping fallback). */
function resolveCardNo(name, evoFallback) {
  return (
    getCardByNameClient(name)?.cardNo ||
    getCardNoFromName(name) ||
    evoFallback
  );
}

export function deckToEnginePayload(mainDeckNames, evoDeckNames) {
  const mainDeck = mainDeckNames.map((name) => resolveCardNo(name, "MVP-012"));
  const evolveDeck = evoDeckNames.map((name) => resolveCardNo(name, "MVP-014"));
  return { mainDeck, evolveDeck };
}

/** Default MVP deck for rules-enforced mode when selected deck has no engine mapping. */
export function defaultMvpDeck() {
  const filler = Array(35).fill("MVP-012");
  const extras = ["MVP-006", "MVP-006", "MVP-013", "MVP-013", "MVP-009"];
  return {
    mainDeck: [...filler, ...extras],
    evolveDeck: ["MVP-014", "MVP-014"],
  };
}

export function resolveCardImage(cardName) {
  return cardImage(cardName) || "";
}
