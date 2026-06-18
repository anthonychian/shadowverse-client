"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveChoicesWithHints = resolveChoicesWithHints;
exports.hintsFromAction = hintsFromAction;
const applyAction_1 = require("../actions/applyAction");
const confirmation_1 = require("../rules/confirmation");
function findInstanceIdByCardNo(state, player, cardNo, zone) {
    const zones = zone
        ? { [zone]: state.players[player].zones[zone] }
        : state.players[player].zones;
    for (const [zoneName, list] of Object.entries(zones)) {
        if (!Array.isArray(list))
            continue;
        const card = list.find((c) => c.cardNo === cardNo);
        if (card)
            return card.instanceId;
    }
    return null;
}
function resolveChoicesWithHints(state, player, hints = {}, maxSteps = 40) {
    let current = state;
    for (let step = 0; step < maxSteps; step++) {
        if (!current.pendingChoices && current.pendingTriggers.length > 0) {
            current = (0, confirmation_1.runConfirmationTiming)(current);
        }
        if (!current.pendingChoices)
            break;
        const choice = current.pendingChoices;
        if (choice.player !== player && choice.type !== "discard") {
            break;
        }
        if (choice.type === "selectTrigger") {
            const preferred = hints.triggerTiming
                ? current.pendingTriggers.find((t) => t.timing === hints.triggerTiming)
                : undefined;
            const triggerId = preferred?.id ?? choice.options[0]?.triggerId;
            if (!triggerId)
                break;
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { triggerId },
            });
            if (!resolved.ok)
                break;
            current = resolved.state;
            continue;
        }
        if (choice.type === "selectTarget") {
            let targetId = "leader";
            if (hints.targetCardNo === "leader") {
                targetId = "leader";
            }
            else if (hints.targetCardNo) {
                const id = findInstanceIdByCardNo(current, player, hints.targetCardNo, "field") ??
                    findInstanceIdByCardNo(current, 1 - player, hints.targetCardNo, "field");
                if (id)
                    targetId = id;
            }
            else {
                targetId = choice.candidates[0]?.instanceId ?? "leader";
            }
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { targetId },
            });
            if (!resolved.ok)
                break;
            current = resolved.state;
            continue;
        }
        if (choice.type === "choose") {
            const index = hints.optionIndex ?? choice.options[0]?.index ?? 0;
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { optionIndex: index },
            });
            if (!resolved.ok)
                break;
            current = resolved.state;
            continue;
        }
        if (choice.type === "selectEvolveDeckCard") {
            const opt = choice.options[0];
            if (!opt)
                break;
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceId: opt.instanceId },
            });
            if (!resolved.ok)
                break;
            current = (0, confirmation_1.runConfirmationTiming)(resolved.state);
            continue;
        }
        if (choice.type === "selectZoneCard") {
            const cardNo = hints.selectCardNo;
            const opt = cardNo
                ? choice.options.find((o) => o.cardNo === cardNo) ?? choice.options[0]
                : choice.options[0];
            if (!opt)
                break;
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceId: opt.instanceId },
            });
            if (!resolved.ok)
                break;
            current = (0, confirmation_1.runConfirmationTiming)(resolved.state);
            continue;
        }
        if (choice.type === "selectZoneCards") {
            const pickCount = choice.maxCount ?? choice.count ?? 1;
            const cardNo = hints.selectCardNo;
            const picked = cardNo
                ? choice.options.filter((o) => o.cardNo === cardNo).slice(0, pickCount)
                : choice.options.slice(0, pickCount);
            if (picked.length < (choice.minCount ?? pickCount) || picked.length > pickCount)
                break;
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceIds: picked.map((o) => o.instanceId) },
            });
            if (!resolved.ok)
                break;
            current = resolved.state;
            continue;
        }
        if (choice.type === "engageFollowersForCost") {
            const ids = hints.engageCardNos?.length
                ? hints.engageCardNos
                    .map((cn) => findInstanceIdByCardNo(current, player, cn, "field"))
                    .filter((id) => Boolean(id))
                : choice.options.slice(0, 2).map((o) => o.instanceId);
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceIds: ids },
            });
            if (!resolved.ok)
                break;
            current = resolved.state;
            continue;
        }
        if (choice.type === "selectDeckSummon") {
            const eligible = choice.options.filter((o) => o.eligible);
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceIds: eligible.map((o) => o.instanceId) },
            });
            if (!resolved.ok)
                break;
            current = resolved.state;
            continue;
        }
        if (choice.type === "selectCemeterySummon") {
            const cardNo = hints.selectCardNo;
            const ids = cardNo
                ? choice.options.filter((o) => o.cardNo === cardNo).map((o) => o.instanceId)
                : choice.options.slice(0, choice.count).map((o) => o.instanceId);
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceIds: ids },
            });
            if (!resolved.ok)
                break;
            current = resolved.state;
            continue;
        }
        if (choice.type === "searchDeckTop") {
            const cardNo = hints.selectCardNo;
            const opt = cardNo
                ? choice.options.find((o) => o.cardNo === cardNo && o.eligible)
                : choice.options.find((o) => o.eligible);
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: choice.optional && !opt ? { skip: true } : { instanceId: opt.instanceId },
            });
            if (!resolved.ok)
                break;
            current = resolved.state;
            continue;
        }
        if (choice.type === "discard") {
            const resolved = (0, applyAction_1.applyAction)(current, player, {
                type: "CHOICE_RESPONSE",
                payload: { instanceIds: [choice.candidates[0].instanceId] },
            });
            if (!resolved.ok)
                break;
            current = resolved.state;
            continue;
        }
        break;
    }
    return current;
}
function hintsFromAction(action) {
    if ("resolveTrigger" in action) {
        return { triggerTiming: action.resolveTrigger };
    }
    if ("selectZone" in action) {
        return { selectCardNo: action.selectZone.cardNo };
    }
    if ("selectTarget" in action) {
        return { targetCardNo: action.selectTarget };
    }
    if ("chooseOption" in action) {
        return { optionIndex: action.chooseOption };
    }
    if ("engageFollowers" in action) {
        return { engageCardNos: action.engageFollowers };
    }
    return {};
}
