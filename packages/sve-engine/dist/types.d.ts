export type PlayerId = 0 | 1;
export type CardType = "follower" | "spell" | "amulet" | "leader";
export type SpecialType = "evolved" | "advanced" | "token";
export type Phase = "mulligan" | "start" | "main" | "end" | "combat" | "quickWindow" | "gameOver";
export type QuickWindow = "afterAttack" | "endPhase" | null;
export type Keyword = "fanfare" | "lastWords" | "evolve" | "quick" | "ward" | "storm" | "rush" | "assail" | "intimidate" | "drain" | "bane" | "aura" | "onEvolve" | "onSuperEvolve" | "strike" | "advanced" | "stack";
export interface CardDefinition {
    cardNo: string;
    name: string;
    class: string;
    cardType: CardType;
    /** Scraped deck role: base / evolved / token (distinct from cardType spell/follower). */
    printingType?: "base" | "evolved" | "token";
    specialType?: SpecialType;
    cost: number;
    attack?: number;
    defense?: number;
    traits: string[];
    keywords: Keyword[];
    cardText: string;
    evolvesFrom?: string;
    evolvesTo?: string;
    /** PP cost to evolve this follower (defaults to 2, or parsed from [costNN] in card text). */
    evolveCost?: number;
    abilities?: AbilityDefinition[];
}
export type TriggerTiming = "fanfare" | "lastWords" | "onEvolve" | "onSuperEvolve" | "strike" | "startOfMain" | "startOfEnd" | "passive" | "aura" | "onExAreaEntry" | "evolve";
export interface AbilityDefinition {
    timing: TriggerTiming | "activated" | "spell";
    cost?: {
        pp?: number;
        engage?: boolean;
        banishFromCemetery?: DeckFilter;
        banishFromExArea?: DeckFilter;
        banishCount?: number;
        buryFromField?: DeckFilter;
        buryFieldCount?: number;
    };
    quick?: boolean;
    condition?: Condition;
    filter?: DeckFilter;
    activateFrom?: "field" | "cemetery" | "exArea";
    /** Human-readable label for trigger ordering UI. */
    label?: string;
    oncePerTurn?: boolean;
    effect: Effect;
}
export type TargetSelector = {
    type: "self";
} | {
    type: "selfLeader";
} | {
    type: "enemyLeader";
} | {
    type: "enemyFollower";
    count?: number;
} | {
    type: "anyFollower";
    count?: number;
} | {
    type: "selfFollower";
    count?: number;
};
export type DeckFilter = {
    cardNo?: string;
    trait?: string;
    cardClass?: string;
    maxCost?: number;
    minCost?: number;
    cardType?: CardType;
};
export type Condition = {
    type: "always";
} | {
    type: "overflow";
} | {
    type: "combo";
    count: number;
} | {
    type: "namedFollowerOnField";
    cardNo: string;
} | {
    type: "namedFollowerOnFieldByName";
    identityName: string;
} | {
    type: "notEnteredFromHand";
} | {
    type: "opponentCemeteryMin";
    count: number;
} | {
    type: "exAreaTraitMin";
    trait: string;
    count: number;
} | {
    type: "ownCemeteryTraitMin";
    trait: string;
    count: number;
} | {
    type: "ownDeckTraitMin";
    trait: string;
    count: number;
} | {
    type: "fieldTraitMin";
    trait: string;
    count: number;
} | {
    type: "handTraitMin";
    trait: string;
    count: number;
} | {
    type: "ownCemeteryClassMin";
    cardClass: string;
    count: number;
} | {
    type: "ownDeckClassMin";
    cardClass: string;
    count: number;
} | {
    type: "exAreaNamedMin";
    identityName: string;
    count: number;
};
export type DamageAmount = number | {
    op: "otherFieldTraitCount";
    trait: string;
};
export type Effect = {
    op: "draw";
    count: number;
} | {
    op: "dealDamage";
    amount: DamageAmount;
    targets: TargetSelector;
} | {
    op: "buff";
    atk?: number;
    def?: number;
    targets: TargetSelector;
} | {
    op: "buffFieldTrait";
    trait: string;
    atk?: number;
    def?: number;
    keyword?: Keyword;
} | {
    op: "grantKeyword";
    keyword: Keyword;
    targets: TargetSelector;
} | {
    op: "destroy";
    targets: TargetSelector;
} | {
    op: "summon";
    tokenCardNo: string;
    count: number;
    zone: "field" | "exArea";
} | {
    op: "recoverPp";
    amount: number;
} | {
    op: "healLeader";
    amount: number;
} | {
    op: "discard";
    count: number;
} | {
    op: "choose";
    options: {
        label: string;
        effect: Effect;
        additionalPpCost?: number;
    }[];
    min: number;
    max: number;
} | {
    op: "chooseMultiple";
    options: {
        label: string;
        effect: Effect;
        additionalPpCost?: number;
    }[];
    min: number;
    max: number;
} | {
    op: "if";
    condition: Condition;
    then: Effect;
    else?: Effect;
} | {
    op: "sequence";
    steps: Effect[];
} | {
    op: "mill";
    count: number;
} | {
    op: "millOpponent";
    count: number;
} | {
    op: "damageFollowerAndLeader";
    followerAmount: number;
    leaderAmount: number;
} | {
    op: "tutorFromDeck";
    filter: DeckFilter;
    to: "hand" | "exArea" | "field";
} | {
    op: "tutorFromCemetery";
    filter: DeckFilter;
    to: "hand" | "field" | "exArea";
    playCostReduction?: number;
} | {
    op: "autoEvolveIf";
    condition: Condition;
    triggerOnEvolve?: boolean;
} | {
    op: "banishSelf";
} | {
    op: "summonFromEvolveDeck";
    filter?: DeckFilter;
} | {
    op: "summonFromCemetery";
    filter: DeckFilter;
    count: number;
    maxTotalCost?: number;
} | {
    op: "putHandCardOnDeck";
    position: "top" | "bottom";
} | {
    op: "grantLastWords";
    effect: Effect;
} | {
    op: "noop";
} | {
    op: "optionalCost";
    label?: string;
    cost: Effect;
    then: Effect;
} | {
    op: "exAreaPlayCostReduction";
    amount: number;
} | {
    op: "searchDeckChoose";
    filter: DeckFilter;
    lookAt: number;
    to: "hand" | "exArea" | "field";
    optional?: boolean;
    playCostReduction?: number;
    /** Where unchosen cards from the search go (default cemetery). */
    remainderTo?: "cemetery" | "deckBottom";
} | {
    op: "passiveKeywords";
    keywords: Keyword[];
} | {
    op: "playCostReduction";
    amount: number;
} | {
    op: "auraGrantKeyword";
    keyword: Keyword;
    trait?: string;
    excludeSelf?: boolean;
} | {
    op: "damageCap";
    maxPerHit: number;
} | {
    op: "engage";
    targets: TargetSelector;
} | {
    op: "box";
    targets: TargetSelector;
} | {
    op: "grantPlayCostReduction";
    amount: number;
    targets: TargetSelector;
} | {
    op: "banishFromCemetery";
    filter: DeckFilter;
    count: number;
} | {
    op: "banishFromExArea";
    filter: DeckFilter;
    count: number;
} | {
    op: "reviveSelfFromCemetery";
} | {
    op: "moveSourceToExArea";
} | {
    op: "selectFromHand";
    filter: DeckFilter;
    to: "exArea" | "hand";
    optional?: boolean;
} | {
    op: "triggerAbilities";
    timing: TriggerTiming;
} | {
    op: "discardFromHand";
    filter: DeckFilter;
    count: number;
};
export interface Modifier {
    atk?: number;
    def?: number;
    sourceId: string;
    untilEndOfTurn?: boolean;
}
export interface CardInstance {
    instanceId: string;
    cardNo: string;
    controller: PlayerId;
    owner: PlayerId;
    /** false = reserved (free to act); true = engaged (attacked, ward engaged, or [engage] activate) */
    engaged: boolean;
    modifiers: Modifier[];
    counters: Record<string, number>;
    enteredFieldTurn: number;
    evolvedThisTurn: boolean;
    superEvolved: boolean;
    linkedEvoInstanceId?: string;
    onFieldSinceTurnStart: boolean;
    foughtWithBane: boolean;
    foughtWithInstanceId?: string;
    grantedKeywords: Keyword[];
    /** Set when the follower enters the field; cleared at end of turn resolution. */
    enteredFromHand?: boolean;
    /** Follower is boxed until this turn number (exclusive end at start phase). */
    boxedUntilTurn?: number;
    /** PP reduction when playing this card from hand or EX (cleared end of turn). */
    playCostReduction: number;
    /** Keys `${timing}:${index}` for once-per-turn abilities used this turn. */
    abilitiesActivatedThisTurn: string[];
    /** Extra last-words effects granted while on field. */
    grantedLastWords?: Effect[];
}
export interface EvolveLink {
    fieldInstanceId: string;
    evolveInstanceId: string;
}
export interface PlayerZones {
    deck: CardInstance[];
    hand: CardInstance[];
    field: CardInstance[];
    exArea: CardInstance[];
    evolveDeck: CardInstance[];
    evolveZone: EvolveLink[];
    cemetery: CardInstance[];
    banish: CardInstance[];
    raceZone: CardInstance[];
    driveZone: CardInstance[];
    triggerZone: CardInstance[];
    resolutionZone: CardInstance[];
}
export interface PlayerFlags {
    evolvedThisTurn: boolean;
    cardsPlayedThisTurn: number;
    mulliganDone: boolean;
    leaderLostDefThisTurn: boolean;
    /** Unfulfilled draw obligations (checked for deck-out loss after rules handling). */
    owedDraws: number;
    /** Start-of-end abilities queued for the current end phase. */
    endStartAbilitiesQueued?: boolean;
}
export interface PlayerState {
    leaderDef: number;
    pp: number;
    maxPp: number;
    evoPoints: number;
    superEvoPoints: number;
    turnsPassed: number;
    handLimit: number;
    fieldLimit: number;
    exLimit: number;
    zones: PlayerZones;
    flags: PlayerFlags;
}
export interface PendingTrigger {
    id: string;
    controller: PlayerId;
    sourceInstanceId: string;
    ability: AbilityDefinition;
    timing: TriggerTiming;
    label: string;
}
export interface ChoiceSourceContext {
    sourceCardNo?: string;
    sourceLabel?: string;
    reasonLabel?: string;
}
export type ChoicePrompt = ChoiceSourceContext & ({
    type: "mulligan";
    player: PlayerId;
} | {
    type: "selectTrigger";
    player: PlayerId;
    options: {
        triggerId: string;
        label: string;
    }[];
} | {
    type: "selectTarget";
    player: PlayerId;
    effect: Effect;
    candidates: {
        instanceId: string;
        label: string;
        cardNo?: string;
    }[];
} | {
    type: "selectZoneCard";
    player: PlayerId;
    fromZone: "deck" | "cemetery" | "hand" | "evolveDeck";
    to: "hand" | "exArea" | "field";
    options: {
        instanceId: string;
        label: string;
        cardNo: string;
    }[];
    optional?: boolean;
    playCostReduction?: number;
} | {
    type: "choose";
    player: PlayerId;
    options: {
        index: number;
        label: string;
        effect: Effect;
        additionalPpCost?: number;
    }[];
    min: number;
    max: number;
} | {
    type: "chooseMultiple";
    player: PlayerId;
    options: {
        index: number;
        label: string;
        effect: Effect;
        additionalPpCost?: number;
    }[];
    min: number;
    max: number;
} | {
    type: "discard";
    player: PlayerId;
    count: number;
    candidates: {
        instanceId: string;
        label: string;
        cardNo: string;
    }[];
} | {
    type: "wardEngage";
    player: PlayerId;
    candidates: {
        instanceId: string;
        label: string;
        cardNo: string;
    }[];
} | {
    type: "searchDeckTop";
    player: PlayerId;
    to: "hand" | "exArea" | "field";
    filter: DeckFilter;
    topInstanceIds: string[];
    optional?: boolean;
    options: {
        instanceId: string;
        label: string;
        cardNo: string;
        eligible: boolean;
    }[];
    playCostReduction?: number;
    remainderTo?: "cemetery" | "deckBottom";
} | {
    type: "selectZoneCards";
    player: PlayerId;
    fromZone: "cemetery" | "hand" | "exArea" | "field";
    count: number;
    action: "banish" | "discard" | "bury";
    options: {
        instanceId: string;
        label: string;
        cardNo: string;
    }[];
    resumeActivate?: {
        sourceInstanceId: string;
        zone: "field" | "cemetery" | "exArea";
        abilityKey: string;
    };
} | {
    type: "putHandOnDeck";
    player: PlayerId;
    phase: "selectCard" | "selectPosition";
    position?: "top" | "bottom";
    selectedInstanceId?: string;
    options: {
        instanceId: string;
        label: string;
        cardNo: string;
    }[];
} | {
    type: "selectCemeterySummon";
    player: PlayerId;
    count: number;
    maxTotalCost: number;
    filter: DeckFilter;
    options: {
        instanceId: string;
        label: string;
        cardNo: string;
        cost: number;
    }[];
});
export interface CombatState {
    attackerId: string;
    targetId: string | "leader";
    targetPlayer: PlayerId;
    phase: "declared" | "quickWindow" | "damage" | "done";
    /** Resume strike resolution after a mid-combat target choice. */
    strikeAbilityIndex?: number;
}
export interface GameEvent {
    type: string;
    player?: PlayerId;
    data?: Record<string, unknown>;
}
export interface ResolutionContext {
    sourceInstanceId?: string;
    effectStack: Effect[];
    forcedTargetId?: string;
    resumeAfterChoice?: Effect[];
}
export interface GameState {
    players: [PlayerState, PlayerState];
    activePlayer: PlayerId;
    turnNumber: number;
    phase: Phase;
    firstPlayer: PlayerId;
    winner: PlayerId | "draw" | null;
    pendingTriggers: PendingTrigger[];
    pendingChoices: ChoicePrompt | null;
    combat: CombatState | null;
    quickWindow: QuickWindow;
    /** Player who may cast quick spells during the current quick window. */
    quickWindowPlayer?: PlayerId | null;
    eventLog: GameEvent[];
    resolutionContext: ResolutionContext | null;
    /** End phase: opponent quick window was offered or skipped after start-of-end. */
    endPhaseQuickResolved?: boolean;
}
export type GameAction = {
    type: "MULLIGAN";
    redraw: boolean;
} | {
    type: "PLAY_CARD";
    handInstanceId: string;
    targets?: string[];
} | {
    type: "ATTACK";
    attackerId: string;
    targetId: string | "leader";
} | {
    type: "EVOLVE";
    fieldInstanceId: string;
    evolveDeckInstanceId?: string;
    useSuperEvo?: boolean;
    useEvoPoint?: boolean;
} | {
    type: "ACTIVATE";
    fieldInstanceId: string;
    useEvoPoint?: boolean;
} | {
    type: "ACTIVATE_CEMETERY";
    cemeteryInstanceId: string;
} | {
    type: "ACTIVATE_EXAREA";
    exAreaInstanceId: string;
} | {
    type: "END_MAIN";
} | {
    type: "QUICK_PLAY";
    handInstanceId: string;
    targets?: string[];
} | {
    type: "PASS_QUICK_WINDOW";
} | {
    type: "CHOICE_RESPONSE";
    payload: Record<string, unknown>;
} | {
    type: "CONCEDE";
};
export interface ActionResult {
    ok: boolean;
    state: GameState;
    error?: string;
}
export interface PlayerView {
    self: PlayerId;
    state: GameState;
    opponentHandCount: number;
    opponentDeckCount: number;
    opponentEvoDeckCount: number;
    legalActions: string[];
}
