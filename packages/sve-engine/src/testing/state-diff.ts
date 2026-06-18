import { getCardDef } from "../cards/registry";
import { getEffectiveStats } from "../state/queries";
import { GameState, PlayerId } from "../types";
import { ZoneName } from "./scenario-types";

function zoneLabel(zone: ZoneName, player: PlayerId): string {
  return `P${player}.${zone}`;
}

function summarizeZone(state: GameState, player: PlayerId, zone: ZoneName): string[] {
  const list = state.players[player].zones[zone];
  if (!Array.isArray(list)) return [];
  return list.map((c) => {
    const def = getCardDef(c.cardNo);
    const name = def?.name ?? c.cardNo;
    const kw =
      c.grantedKeywords.length > 0 ? ` [+${c.grantedKeywords.join(",")}]` : "";
    if (zone === "field" && def?.cardType === "follower") {
      const { atk, def: defense } = getEffectiveStats(c, state);
      return `${name} (${atk}/${defense})${kw}`;
    }
    return `${name}${kw}`;
  });
}

export function snapshotState(state: GameState): Record<string, string[]> {
  const zones: ZoneName[] = ["hand", "field", "cemetery", "exArea", "banish", "deck"];
  const out: Record<string, string[]> = {};
  for (const p of [0, 1] as PlayerId[]) {
    out[`leaderDef:P${p}`] = [String(state.players[p].leaderDef)];
    out[`pp:P${p}`] = [String(state.players[p].pp)];
    for (const z of zones) {
      out[zoneLabel(z, p)] = summarizeZone(state, p, z);
    }
  }
  return out;
}

export function formatStateDiff(before: GameState, after: GameState): string {
  const a = snapshotState(before);
  const b = snapshotState(after);
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const lines: string[] = [];
  for (const key of [...keys].sort()) {
    const av = a[key] ?? [];
    const bv = b[key] ?? [];
    if (JSON.stringify(av) === JSON.stringify(bv)) continue;
    lines.push(`**${key}**`);
    lines.push(`  before: ${av.length ? av.join(", ") : "(empty)"}`);
    lines.push(`  after:  ${bv.length ? bv.join(", ") : "(empty)"}`);
  }
  if (after.pendingChoices) {
    lines.push(`**pendingChoice**: ${after.pendingChoices.type}`);
  }
  if (after.pendingTriggers.length) {
    lines.push(
      `**pendingTriggers**: ${after.pendingTriggers.map((t) => t.timing).join(", ")}`,
    );
  }
  return lines.length ? lines.join("\n") : "(no changes)";
}
