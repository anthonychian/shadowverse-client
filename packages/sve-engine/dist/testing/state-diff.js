"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshotState = snapshotState;
exports.formatStateDiff = formatStateDiff;
const registry_1 = require("../cards/registry");
const queries_1 = require("../state/queries");
function zoneLabel(zone, player) {
    return `P${player}.${zone}`;
}
function summarizeZone(state, player, zone) {
    const list = state.players[player].zones[zone];
    if (!Array.isArray(list))
        return [];
    return list.map((c) => {
        const def = (0, registry_1.getCardDef)(c.cardNo);
        const name = def?.name ?? c.cardNo;
        const kw = c.grantedKeywords.length > 0 ? ` [+${c.grantedKeywords.join(",")}]` : "";
        if (zone === "field" && def?.cardType === "follower") {
            const { atk, def: defense } = (0, queries_1.getEffectiveStats)(c, state);
            return `${name} (${atk}/${defense})${kw}`;
        }
        return `${name}${kw}`;
    });
}
function snapshotState(state) {
    const zones = ["hand", "field", "cemetery", "exArea", "banish", "deck"];
    const out = {};
    for (const p of [0, 1]) {
        out[`leaderDef:P${p}`] = [String(state.players[p].leaderDef)];
        out[`pp:P${p}`] = [String(state.players[p].pp)];
        for (const z of zones) {
            out[zoneLabel(z, p)] = summarizeZone(state, p, z);
        }
    }
    return out;
}
function formatStateDiff(before, after) {
    const a = snapshotState(before);
    const b = snapshotState(after);
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const lines = [];
    for (const key of [...keys].sort()) {
        const av = a[key] ?? [];
        const bv = b[key] ?? [];
        if (JSON.stringify(av) === JSON.stringify(bv))
            continue;
        lines.push(`**${key}**`);
        lines.push(`  before: ${av.length ? av.join(", ") : "(empty)"}`);
        lines.push(`  after:  ${bv.length ? bv.join(", ") : "(empty)"}`);
    }
    if (after.pendingChoices) {
        lines.push(`**pendingChoice**: ${after.pendingChoices.type}`);
    }
    if (after.pendingTriggers.length) {
        lines.push(`**pendingTriggers**: ${after.pendingTriggers.map((t) => t.timing).join(", ")}`);
    }
    return lines.length ? lines.join("\n") : "(no changes)";
}
