import { CardInstance, GameState, PlayerId, PlayerState } from "../types";

let idCounter = 0;
export function nextId(prefix = "c"): string {
  idCounter += 1;
  return `${prefix}_${idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

export function createCardInstance(cardNo: string, owner: PlayerId, controller?: PlayerId): CardInstance {
  return {
    instanceId: nextId(),
    cardNo,
    owner,
    controller: controller ?? owner,
    engaged: false,
    modifiers: [],
    counters: {},
    enteredFieldTurn: 0,
    evolvedThisTurn: false,
    superEvolved: false,
    onFieldSinceTurnStart: false,
    foughtWithBane: false,
    grantedKeywords: [],
    playCostReduction: 0,
    persistentPlayCostReduction: 0,
    abilitiesActivatedThisTurn: [],
    grantedLastWords: [],
  };
}

export function emptyPlayer(player: PlayerId): PlayerState {
  return {
    leaderDef: 20,
    pp: 0,
    maxPp: 0,
    evoPoints: player === 1 ? 3 : 0,
    superEvoPoints: 1,
    turnsPassed: 0,
    handLimit: 7,
    fieldLimit: 5,
    exLimit: 5,
    zones: {
      deck: [],
      hand: [],
      field: [],
      exArea: [],
      evolveDeck: [],
      evolveZone: [],
      cemetery: [],
      banish: [],
      raceZone: [],
      driveZone: [],
      triggerZone: [],
      resolutionZone: [],
    },
    flags: {
      evolvedThisTurn: false,
      cardsPlayedThisTurn: 0,
      mulliganDone: false,
      leaderLostDefThisTurn: false,
      owedDraws: 0,
    },
  };
}

export function createInitialGameState(firstPlayer: PlayerId = 0): GameState {
  return {
    players: [emptyPlayer(0), emptyPlayer(1)],
    activePlayer: firstPlayer,
    turnNumber: 0,
    phase: "mulligan",
    firstPlayer,
    winner: null,
    pendingTriggers: [],
    pendingChoices: { type: "mulligan", player: firstPlayer },
    combat: null,
    quickWindow: null,
    eventLog: [],
    resolutionContext: null,
  };
}
