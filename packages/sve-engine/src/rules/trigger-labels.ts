import { getCardDef } from "../cards/registry";
import { AbilityDefinition, Effect } from "../types";

export function describeEffect(effect: Effect): string {
  switch (effect.op) {
    case "choose":
      return "choose an option";
    case "chooseMultiple":
      return "choose options";
    case "summon":
      return `summon ${getCardDef(effect.tokenCardNo)?.name ?? effect.tokenCardNo}`;
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

export function describeAbility(sourceCardNo: string, ability: AbilityDefinition): string {
  if (ability.label) return ability.label;
  const name = getCardDef(sourceCardNo)?.name ?? sourceCardNo;
  const timingLabel =
    ability.timing === "onExAreaEntry"
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
