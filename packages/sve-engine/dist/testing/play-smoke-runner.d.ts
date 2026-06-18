export type PlaySmokeStatus = "play_ok" | "play_noop" | "play_blocked" | "unresolved" | "skipped";
export type PlaySmokeResult = {
    cardNo: string;
    name: string;
    status: PlaySmokeStatus;
    timing?: string;
    error?: string;
    stateDiff?: string;
    hasCondition?: boolean;
};
export declare function runPlaySmoke(cardNo: string): PlaySmokeResult[];
export declare function runPlaySmokeBatch(cardNos: string[]): PlaySmokeResult[];
