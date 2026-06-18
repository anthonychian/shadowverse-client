"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetFieldInstanceState = resetFieldInstanceState;
exports.resetCardInstanceState = resetCardInstanceState;
/** Clear combat/field state when a card leaves the field for hand, EX area, deck, etc. */
function resetFieldInstanceState(card) {
    card.modifiers = [];
    card.grantedKeywords = [];
    card.grantedLastWords = [];
    card.grantedOnCardPlayed = [];
    card.grantedOnDamaged = [];
    card.ignoresWard = undefined;
    card.damageImmunityThisTurn = undefined;
    card.abilitiesActivatedThisTurn = [];
    card.engaged = false;
    card.evolvedThisTurn = false;
    card.superEvolved = false;
    card.enteredFromHand = undefined;
    card.enteredFromCemetery = undefined;
    card.maneuveringUntilTurn = undefined;
    card.cannotAttack = undefined;
    card.boxedUntilTurn = undefined;
    card.skipRefreshOnTurn = undefined;
    card.foughtWithBane = false;
    card.foughtWithInstanceId = undefined;
    card.onFieldSinceTurnStart = false;
    card.counters = {};
}
/** Reset mutable instance state when a card leaves play (cemetery/banish). */
function resetCardInstanceState(card) {
    card.modifiers = [];
    card.grantedKeywords = [];
    card.grantedLastWords = [];
    card.grantedOnCardPlayed = [];
    card.grantedOnDamaged = [];
    card.ignoresWard = undefined;
    card.damageImmunityThisTurn = undefined;
    card.playCostReduction = 0;
    card.persistentPlayCostReduction = 0;
    card.abilitiesActivatedThisTurn = [];
    card.engaged = false;
    card.linkedEvoInstanceId = undefined;
    card.evolvedThisTurn = false;
    card.superEvolved = false;
    card.enteredFromHand = undefined;
    card.enteredFromCemetery = undefined;
    card.maneuveringUntilTurn = undefined;
    card.cannotAttack = undefined;
    card.boxedUntilTurn = undefined;
    card.skipRefreshOnTurn = undefined;
    card.foughtWithBane = false;
    card.foughtWithInstanceId = undefined;
    card.onFieldSinceTurnStart = false;
    card.counters = {};
}
