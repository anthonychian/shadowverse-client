"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvolveCost = exports.getEffectiveStats = exports.hasKeyword = exports.getLegalAttackTargets = exports.findInstance = exports.tryAction = exports.createPlayerView = exports.resolveSpell = exports.resolveEffect = exports.runConfirmationTiming = exports.advanceCombatIfNeeded = exports.applyAction = exports.beginStartPhase = exports.applyMulligan = exports.loadDecks = exports.resetIdCounter = exports.createCardInstance = exports.createInitialGameState = exports.MVP_CARD_DEFS = exports.getCardByName = exports.registerCard = exports.getAllCardDefs = exports.getCardDef = void 0;
__exportStar(require("./types"), exports);
var registry_1 = require("./cards/registry");
Object.defineProperty(exports, "getCardDef", { enumerable: true, get: function () { return registry_1.getCardDef; } });
Object.defineProperty(exports, "getAllCardDefs", { enumerable: true, get: function () { return registry_1.getAllCardDefs; } });
Object.defineProperty(exports, "registerCard", { enumerable: true, get: function () { return registry_1.registerCard; } });
Object.defineProperty(exports, "getCardByName", { enumerable: true, get: function () { return registry_1.getCardByName; } });
var mvp_cards_1 = require("./cards/mvp-cards");
Object.defineProperty(exports, "MVP_CARD_DEFS", { enumerable: true, get: function () { return mvp_cards_1.MVP_CARD_DEFS; } });
var factory_1 = require("./state/factory");
Object.defineProperty(exports, "createInitialGameState", { enumerable: true, get: function () { return factory_1.createInitialGameState; } });
Object.defineProperty(exports, "createCardInstance", { enumerable: true, get: function () { return factory_1.createCardInstance; } });
Object.defineProperty(exports, "resetIdCounter", { enumerable: true, get: function () { return factory_1.resetIdCounter; } });
var setup_1 = require("./phases/setup");
Object.defineProperty(exports, "loadDecks", { enumerable: true, get: function () { return setup_1.loadDecks; } });
Object.defineProperty(exports, "applyMulligan", { enumerable: true, get: function () { return setup_1.applyMulligan; } });
Object.defineProperty(exports, "beginStartPhase", { enumerable: true, get: function () { return setup_1.beginStartPhase; } });
var applyAction_1 = require("./actions/applyAction");
Object.defineProperty(exports, "applyAction", { enumerable: true, get: function () { return applyAction_1.applyAction; } });
Object.defineProperty(exports, "advanceCombatIfNeeded", { enumerable: true, get: function () { return applyAction_1.advanceCombatIfNeeded; } });
var confirmation_1 = require("./rules/confirmation");
Object.defineProperty(exports, "runConfirmationTiming", { enumerable: true, get: function () { return confirmation_1.runConfirmationTiming; } });
var resolver_1 = require("./effects/resolver");
Object.defineProperty(exports, "resolveEffect", { enumerable: true, get: function () { return resolver_1.resolveEffect; } });
Object.defineProperty(exports, "resolveSpell", { enumerable: true, get: function () { return resolver_1.resolveSpell; } });
var filterView_1 = require("./view/filterView");
Object.defineProperty(exports, "createPlayerView", { enumerable: true, get: function () { return filterView_1.createPlayerView; } });
Object.defineProperty(exports, "tryAction", { enumerable: true, get: function () { return filterView_1.tryAction; } });
var queries_1 = require("./state/queries");
Object.defineProperty(exports, "findInstance", { enumerable: true, get: function () { return queries_1.findInstance; } });
Object.defineProperty(exports, "getLegalAttackTargets", { enumerable: true, get: function () { return queries_1.getLegalAttackTargets; } });
Object.defineProperty(exports, "hasKeyword", { enumerable: true, get: function () { return queries_1.hasKeyword; } });
Object.defineProperty(exports, "getEffectiveStats", { enumerable: true, get: function () { return queries_1.getEffectiveStats; } });
Object.defineProperty(exports, "getEvolveCost", { enumerable: true, get: function () { return queries_1.getEvolveCost; } });
