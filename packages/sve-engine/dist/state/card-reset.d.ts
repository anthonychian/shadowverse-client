import { CardInstance } from "../types";
/** Clear combat/field state when a card leaves the field for hand, EX area, deck, etc. */
export declare function resetFieldInstanceState(card: CardInstance): void;
/** Reset mutable instance state when a card leaves play (cemetery/banish). */
export declare function resetCardInstanceState(card: CardInstance): void;
