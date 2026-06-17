import { CardDefinition } from "../types";
export declare function getCardDef(cardNo: string): CardDefinition | undefined;
export declare function getGameplayCardNo(cardNo: string): string;
/** Resolve any printing of a card or token by normalized identity name. */
export declare function resolveCardNoByIdentity(identityName: string): string | undefined;
export declare function getAllCardDefs(): CardDefinition[];
export declare function registerCard(def: CardDefinition): void;
export declare function getCardByName(name: string): CardDefinition | undefined;
