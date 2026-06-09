import { CardDefinition } from "../types";
export declare function getCardDef(cardNo: string): CardDefinition | undefined;
export declare function getGameplayCardNo(cardNo: string): string;
export declare function getAllCardDefs(): CardDefinition[];
export declare function registerCard(def: CardDefinition): void;
export declare function getCardByName(name: string): CardDefinition | undefined;
