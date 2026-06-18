import { GameState, PlayerId } from "../types";

export type ZoneName =
  | "deck"
  | "hand"
  | "field"
  | "cemetery"
  | "exArea"
  | "banish"
  | "evolveDeck";

export type ScenarioSetup = {
  activePlayer?: PlayerId;
  phase?: GameState["phase"];
  turnNumber?: number;
  pp?: [number, number];
  leaderDef?: [number, number];
  /** Per-player zone contents as cardNo strings (top/first = front of zone where order matters). */
  deck?: [string[], string[]];
  hand?: [string[], string[]];
  field?: [string[], string[]];
  cemetery?: [string[], string[]];
  exArea?: [string[], string[]];
  banish?: [string[], string[]];
  evolveDeck?: [string[], string[]];
  mulliganDone?: boolean;
};

export type ScenarioAction =
  | { play: string }
  | { activate: string }
  | { evolve: string }
  | { attack: { attacker: string; target: string | "leader" } }
  | { endMain: true }
  | { resolveTrigger: string }
  | { selectZone: { zone: ZoneName; cardNo: string } }
  | { selectTarget: string | "leader" }
  | { chooseOption: number }
  | { engageFollowers: string[] }
  | { autoResolve: true };

export type ScenarioAssertion =
  | {
      type: "zoneContains";
      zone: ZoneName;
      player: PlayerId;
      cardNo: string;
      count?: number;
      grantedKeywords?: string[];
    }
  | {
      type: "notGranted";
      player?: PlayerId;
      cardNo: string;
      keyword: string;
    }
  | {
      type: "leaderDef";
      player: PlayerId;
      equals: number;
    }
  | {
      type: "zoneLength";
      zone: ZoneName;
      player: PlayerId;
      equals: number;
    }
  | {
      type: "actionOk";
      equals: boolean;
    }
  | {
      type: "noPendingChoices";
    }
  | {
      type: "ppEquals";
      player: PlayerId;
      equals: number;
    }
  | {
      type: "cardStat";
      player: PlayerId;
      zone: ZoneName;
      cardNo: string;
      stat: "attack" | "defense";
      equals: number;
    }
  | {
      type: "hasKeyword";
      player: PlayerId;
      zone: ZoneName;
      cardNo: string;
      keyword: string;
    }
  | {
      type: "cemeteryCount";
      player: PlayerId;
      equals: number;
    };

export type ScenarioDefinition = {
  id?: string;
  cardNo?: string;
  name: string;
  setup: ScenarioSetup;
  actions: ScenarioAction[];
  assertions?: ScenarioAssertion[];
};

export type ActionTraceEntry = {
  index: number;
  action: ScenarioAction;
  ok: boolean;
  error?: string;
  pendingChoiceType?: string;
};

export type AssertionResult = {
  assertion: ScenarioAssertion;
  pass: boolean;
  message: string;
};

export type ScenarioResult = {
  scenario: ScenarioDefinition;
  success: boolean;
  finalState: GameState;
  trace: ActionTraceEntry[];
  assertionResults: AssertionResult[];
  unresolvedChoice: string | null;
  stateDiff: string;
};
