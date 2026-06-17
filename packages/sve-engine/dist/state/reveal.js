"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldRevealBeforeHand = shouldRevealBeforeHand;
exports.revealCard = revealCard;
exports.clearRevealedCards = clearRevealedCards;
/** Deck searches to hand reveal by default; cemetery returns do not. */
function shouldRevealBeforeHand(to, fromZone, explicit) {
    if (explicit != null)
        return explicit;
    if (to !== "hand")
        return false;
    if (fromZone === "cemetery")
        return false;
    return true;
}
function revealCard(state, owner, instanceId, cardNo) {
    const next = structuredClone(state);
    const list = next.revealedCards ?? [];
    if (!list.some((r) => r.instanceId === instanceId)) {
        next.revealedCards = [...list, { owner, instanceId, cardNo }];
        next.eventLog.push({ type: "reveal", player: owner, data: { instanceId, cardNo } });
    }
    return next;
}
function clearRevealedCards(state) {
    if (!state.revealedCards?.length)
        return state;
    const next = structuredClone(state);
    next.revealedCards = [];
    return next;
}
