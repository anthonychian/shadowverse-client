"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeEffect = describeEffect;
exports.describeAbility = describeAbility;
const registry_1 = require("../cards/registry");
function describeEffect(effect) {
    switch (effect.op) {
        case "choose":
            return "choose an option";
        case "chooseMultiple":
            return "choose options";
        case "summon": {
            const tokenLabel = effect.tokenName ??
                (effect.tokenCardNo ? ((0, registry_1.getCardDef)(effect.tokenCardNo)?.name ?? effect.tokenCardNo) : "token");
            return `summon ${tokenLabel}`;
        }
        case "dealDamage":
            return "deal damage";
        case "damageFollowerAndLeader":
            return "deal 3 to a follower and 1 to leader";
        case "draw":
            return `draw ${effect.count}`;
        case "sequence":
            return effect.steps.map(describeEffect).join(", then ");
        case "if":
            return describeEffect(effect.then);
        default:
            return effect.op;
    }
}
function describeAbility(sourceCardNo, ability) {
    if (ability.label)
        return ability.label;
    const name = (0, registry_1.getCardDef)(sourceCardNo)?.name ?? sourceCardNo;
    const timingLabel = ability.timing === "onExAreaEntry"
        ? "EX area entry"
        : ability.timing === "fanfare"
            ? "Fanfare"
            : ability.timing === "lastWords"
                ? "Last Words"
                : ability.timing === "onEvolve"
                    ? "On Evolve"
                    : ability.timing === "startOfEnd"
                        ? "End of turn"
                        : ability.timing === "onCardPlayed"
                            ? "When you play a card"
                            : ability.timing === "onAllyFollowerEnter"
                                ? "When an ally enters the field"
                                : ability.timing;
    return `${name} — ${timingLabel}: ${describeEffect(ability.effect)}`;
}
