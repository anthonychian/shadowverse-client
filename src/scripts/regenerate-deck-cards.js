#!/usr/bin/env node
/**
 * Regenerate packages/sve-engine/data/card-defs/deck-cards.json from
 * deck-scraped-cards.json (fresh website scrape) plus hand-tuned ability DSL.
 *
 * Usage: node src/scripts/regenerate-deck-cards.js
 */
const fs = require("fs");
const path = require("path");
const { normalizeIdentityName } = require("./scrape-utils");

const SCRAPED = path.join(__dirname, "deck-scraped-cards.json");
const EXISTING = path.join(
  __dirname,
  "..",
  "..",
  "packages",
  "sve-engine",
  "data",
  "card-defs",
  "deck-cards.json",
);
const OUTPUT = EXISTING;

const GOLD = "BP14-T02EN";
const SOOT = "BP14-T01EN";
const ASSEMBLY = "BP17-T17EN";
const REPAIR = "BP17-T18EN";
const DROID = "BP12-T10EN";

function parseEvolveCost(text) {
  const m = (text || "").match(/\[evolve\]\s*\[cost(\d+)\]/i);
  return m ? Number(m[1]) : undefined;
}

function statsFromScrape(card) {
  const entry = {};
  if (card.type === "base" || card.type === "token") entry.printingType = card.type;
  if (card.type === "evolved") entry.printingType = "evolved";
  if (card.cost != null) entry.cost = card.cost;
  if (card.attack != null) entry.attack = card.attack;
  if (card.defense != null) entry.defense = card.defense;
  if (card.evolvesTo) entry.evolvesTo = card.evolvesTo;
  if (card.evolvesFrom) entry.evolvesFrom = card.evolvesFrom;
  const evolveCost = parseEvolveCost(card.cardText);
  if (evolveCost != null) entry.evolveCost = evolveCost;
  if (card.keywords?.length) entry.keywords = [...card.keywords];
  if (card.cardType) entry.cardType = card.cardType;
  if (card.specialType) entry.specialType = card.specialType;
  if (card.traits?.length) entry.traits = card.traits;
  return entry;
}

function buildAbilities(cardNo, card, text) {
  switch (cardNo) {
    case "BP05-025EN":
      return [
        {
          timing: "strike",
          effect: {
            op: "sequence",
            steps: [
              { op: "millOpponent", count: 1 },
              {
                op: "if",
                condition: { type: "opponentCemeteryMin", count: 10 },
                then: { op: "buff", atk: 2, def: 0, targets: { type: "self" } },
              },
            ],
          },
        },
      ];

    case "BP11-018EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "tutorFromDeck",
            filter: { cardClass: "sword", maxCost: 1 },
            to: "exArea",
          },
        },
        {
          timing: "activated",
          cost: { pp: 0 },
          oncePerTurn: true,
          effect: { op: "box", targets: { type: "enemyFollower", count: 1 } },
        },
      ];

    case "BP11-P07EN":
      return [
        {
          timing: "passive",
          condition: { type: "namedFollowerOnField", cardNo: "BP11-018EN" },
          effect: { op: "exAreaPlayCostReduction", amount: 1 },
        },
        {
          timing: "fanfare",
          effect: {
            op: "if",
            condition: { type: "namedFollowerOnField", cardNo: "BP11-018EN" },
            then: { op: "draw", count: 1 },
          },
        },
      ];

    case "BP14-018EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "sequence",
            steps: [
              { op: "draw", count: 1 },
              { op: "discard", count: 1 },
              { op: "summon", tokenCardNo: GOLD, count: 1, zone: "exArea" },
            ],
          },
        },
        {
          timing: "activated",
          cost: { pp: 4 },
          effect: {
            op: "if",
            condition: { type: "ownCemeteryTraitMin", trait: "Festive", count: 5 },
            then: {
              op: "sequence",
              steps: [
                { op: "banishSelf" },
                { op: "summonFromEvolveDeck", filter: { cardNo: "BP14-019EN" } },
              ],
            },
            else: {
              op: "if",
              condition: { type: "ownCemeteryClassMin", cardClass: "sword", count: 10 },
              then: {
                op: "sequence",
                steps: [
                  { op: "banishSelf" },
                  { op: "summonFromEvolveDeck", filter: { cardNo: "BP14-019EN" } },
                ],
              },
            },
          },
        },
      ];

    case "BP14-022EN":
      return [
        {
          timing: "aura",
          effect: {
            op: "auraGrantKeyword",
            keyword: "storm",
            trait: "Festive",
            excludeSelf: true,
          },
        },
        {
          timing: "fanfare",
          effect: { op: "summon", tokenCardNo: GOLD, count: 1, zone: "exArea" },
        },
      ];

    case "BP14-023EN":
      return [
        {
          timing: "aura",
          effect: {
            op: "auraGrantKeyword",
            keyword: "storm",
            trait: "Festive",
            excludeSelf: true,
          },
        },
        {
          timing: "onEvolve",
          effect: {
            op: "sequence",
            steps: [
              { op: "banishFromExArea", filter: { cardNo: GOLD }, count: 2 },
              {
                op: "searchDeckChoose",
                filter: { trait: "Festive", maxCost: 3 },
                lookAt: 5,
                to: "exArea",
                optional: true,
                playCostReduction: 3,
              },
            ],
          },
        },
        {
          timing: "activated",
          cost: { pp: 1 },
          effect: { op: "triggerAbilities", timing: "onEvolve" },
        },
      ];

    case "BP14-025EN":
      return [
        {
          timing: "spell",
          effect: {
            op: "sequence",
            steps: [
              {
                op: "dealDamage",
                amount: 5,
                targets: { type: "enemyFollower", count: 1 },
              },
              { op: "summon", tokenCardNo: GOLD, count: 1, zone: "exArea" },
              {
                op: "if",
                condition: { type: "ownCemeteryTraitMin", trait: "Festive", count: 5 },
                then: {
                  op: "tutorFromDeck",
                  filter: { cardNo: "BP14-018EN" },
                  to: "field",
                },
                else: {
                  op: "if",
                  condition: { type: "ownCemeteryClassMin", cardClass: "sword", count: 10 },
                  then: {
                    op: "tutorFromDeck",
                    filter: { cardNo: "BP14-018EN" },
                    to: "field",
                  },
                },
              },
            ],
          },
        },
      ];

    case "BP14-026EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "sequence",
            steps: [
              { op: "summon", tokenCardNo: GOLD, count: 1, zone: "exArea" },
              {
                op: "if",
                condition: {
                  type: "namedFollowerOnFieldByName",
                  identityName: "Jiemon, Thief Lord",
                },
                then: { op: "healLeader", amount: 3 },
              },
            ],
          },
        },
      ];

    case "BP14-027EN":
      return [
        {
          timing: "onExAreaEntry",
          filter: { cardNo: GOLD },
          effect: {
            op: "damageFollowerAndLeader",
            followerAmount: 3,
            leaderAmount: 1,
          },
        },
        {
          timing: "onEvolve",
          effect: { op: "summon", tokenCardNo: GOLD, count: 1, zone: "exArea" },
        },
      ];

    case "BP14-030EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "sequence",
            steps: [
              { op: "summon", tokenCardNo: GOLD, count: 1, zone: "exArea" },
              {
                op: "autoEvolveIf",
                condition: {
                  type: "namedFollowerOnFieldByName",
                  identityName: "Jiemon, Thief Lord",
                },
                triggerOnEvolve: false,
              },
            ],
          },
        },
        { timing: "evolve", effect: { op: "passiveKeywords", keywords: [] } },
      ];

    case "BP14-031EN":
      return [
        {
          timing: "onEvolve",
          effect: {
            op: "sequence",
            steps: [
              {
                op: "dealDamage",
                amount: 2,
                targets: { type: "enemyFollower", count: 1 },
              },
              {
                op: "if",
                condition: { type: "exAreaTraitMin", trait: "Festive", count: 3 },
                then: { op: "draw", count: 1 },
              },
            ],
          },
        },
      ];

    case "BP14-034EN":
      return [
        {
          timing: "spell",
          effect: {
            op: "choose",
            min: 1,
            max: 1,
            options: [
              {
                label: "Deal 2 damage and add Gold",
                effect: {
                  op: "sequence",
                  steps: [
                    {
                      op: "dealDamage",
                      amount: 2,
                      targets: { type: "enemyFollower", count: 1 },
                    },
                    { op: "summon", tokenCardNo: GOLD, count: 1, zone: "exArea" },
                  ],
                },
              },
              {
                label: "Deal 4 if 3+ Festive in EX",
                effect: {
                  op: "if",
                  condition: { type: "exAreaTraitMin", trait: "Festive", count: 3 },
                  then: {
                    op: "dealDamage",
                    amount: 4,
                    targets: { type: "enemyFollower", count: 1 },
                  },
                },
              },
            ],
          },
        },
      ];

    case "BP14-035EN":
      return [
        {
          timing: "spell",
          effect: {
            op: "sequence",
            steps: [
              { op: "draw", count: 1 },
              { op: "summon", tokenCardNo: GOLD, count: 1, zone: "exArea" },
            ],
          },
        },
      ];

    case "BP14-115EN":
      return [
        {
          timing: "spell",
          effect: {
            op: "searchDeckChoose",
            filter: { trait: "Festive" },
            lookAt: 4,
            to: "exArea",
            optional: true,
            remainderTo: "cemetery",
          },
        },
      ];

    case "BP14-118EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "optionalCost",
            label: "Put a Festive card from your hand into your EX area",
            cost: {
              op: "selectFromHand",
              filter: { trait: "Festive" },
              to: "exArea",
            },
            then: {
              op: "sequence",
              steps: [
                { op: "draw", count: 1 },
                {
                  op: "if",
                  condition: { type: "exAreaTraitMin", trait: "Festive", count: 3 },
                  then: { op: "buff", atk: 1, def: 1, targets: { type: "self" } },
                },
              ],
            },
          },
        },
      ];

    case "BP16-022EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "if",
            condition: {
              type: "namedFollowerOnFieldByName",
              identityName: "Jiemon, Thief Lord",
            },
            then: {
              op: "chooseMultiple",
              min: 0,
              max: 3,
              options: [
                {
                  label: "Engage enemy follower (no refresh next turn)",
                  effect: { op: "box", targets: { type: "enemyFollower", count: 1 } },
                },
                {
                  label: "Draw a card and put a hand card on deck",
                  effect: {
                    op: "sequence",
                    steps: [{ op: "draw", count: 1 }, { op: "putHandCardOnDeck" }],
                  },
                },
                {
                  label: "Add 2 Glittering Gold",
                  effect: { op: "summon", tokenCardNo: GOLD, count: 2, zone: "exArea" },
                },
              ],
            },
            else: {
              op: "chooseMultiple",
              min: 0,
              max: 2,
              options: [
                {
                  label: "Engage enemy follower (no refresh next turn)",
                  effect: { op: "box", targets: { type: "enemyFollower", count: 1 } },
                },
                {
                  label: "Draw a card and put a hand card on deck",
                  effect: {
                    op: "sequence",
                    steps: [{ op: "draw", count: 1 }, { op: "putHandCardOnDeck" }],
                  },
                },
              ],
            },
          },
        },
      ];

    case "SDD02-006EN":
      return [
        {
          timing: "passive",
          effect: { op: "passiveKeywords", keywords: ["aura", "intimidate"] },
        },
        {
          timing: "startOfEnd",
          effect: {
            op: "dealDamage",
            amount: 1,
            targets: { type: "enemyFollower", count: 1 },
          },
        },
      ];

    case "SDD02-007EN":
      return [
        {
          timing: "passive",
          effect: { op: "passiveKeywords", keywords: ["aura", "intimidate"] },
        },
        {
          timing: "onEvolve",
          effect: {
            op: "choose",
            min: 1,
            max: 1,
            options: [
              {
                label: "Deal 2 to enemy leader",
                effect: {
                  op: "dealDamage",
                  amount: 2,
                  targets: { type: "enemyLeader" },
                },
              },
              {
                label: "Deal 2 to enemy follower",
                effect: {
                  op: "dealDamage",
                  amount: 2,
                  targets: { type: "enemyFollower", count: 1 },
                },
              },
            ],
          },
        },
        {
          timing: "startOfEnd",
          effect: {
            op: "dealDamage",
            amount: 1,
            targets: { type: "enemyFollower", count: 1 },
          },
        },
      ];

    case "BP14-019EN":
      return [
        {
          timing: "fanfare",
          effect: { op: "summon", tokenCardNo: SOOT, count: 2, zone: "field" },
        },
        {
          timing: "activated",
          cost: { pp: 0, engage: true },
          effect: {
            op: "sequence",
            steps: [
              {
                op: "dealDamage",
                amount: 5,
                targets: { type: "enemyFollower", count: 1 },
              },
              {
                op: "dealDamage",
                amount: 3,
                targets: { type: "enemyLeader" },
              },
            ],
          },
        },
      ];

    case "PR-173EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "tutorFromDeck",
            filter: { trait: "Machina", cardType: "follower", maxCost: 3 },
            to: "field",
          },
        },
        { timing: "lastWords", effect: { op: "healLeader", amount: 2 } },
      ];

    case "PR-358EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "choose",
            min: 1,
            max: 1,
            options: [
              {
                label: "Assembly Droid token",
                effect: { op: "summon", tokenCardNo: ASSEMBLY, count: 1, zone: "exArea" },
              },
              {
                label: "Repair Mode token",
                effect: { op: "summon", tokenCardNo: REPAIR, count: 1, zone: "exArea" },
              },
            ],
          },
        },
        {
          timing: "lastWords",
          effect: {
            op: "optionalCost",
            label: "Discard a Machina card",
            cost: { op: "discardFromHand", filter: { trait: "Machina" }, count: 1 },
            then: { op: "draw", count: 1 },
          },
        },
      ];

    case "BP07-075EN":
      return [
        {
          timing: "spell",
          effect: {
            op: "choose",
            min: 1,
            max: 1,
            options: [
              {
                label: "Return Machina from cemetery",
                effect: {
                  op: "tutorFromCemetery",
                  filter: { trait: "Machina", cardType: "follower" },
                  to: "hand",
                },
              },
              {
                label: "Summon Mono from cemetery",
                effect: {
                  op: "tutorFromCemetery",
                  filter: { cardNo: "BP07-SL13EN" },
                  to: "field",
                },
              },
            ],
          },
        },
      ];

    case "BP07-P22EN":
      return [];

    case "BP11-075EN":
    case "SDD05-012EN":
      return [
        {
          timing: "spell",
          quick: true,
          effect: {
            op: "buff",
            atk: -2,
            def: -2,
            targets: { type: "enemyFollower", count: 1 },
          },
        },
      ];

    case "BP12-075EN":
      return [
        {
          timing: "spell",
          effect: {
            op: "summonFromCemetery",
            filter: { trait: "Machina", cardType: "follower" },
            count: 2,
            maxTotalCost: 5,
          },
        },
      ];

    case "BP12-082EN":
      return [
        {
          timing: "passive",
          condition: {
            type: "namedFollowerOnFieldByName",
            identityName: "Aenea, Amethyst Rebel",
          },
          effect: { op: "damageCap", maxPerHit: 1 },
        },
        {
          timing: "activated",
          activateFrom: "cemetery",
          cost: { pp: 1 },
          condition: {
            type: "namedFollowerOnFieldByName",
            identityName: "Aenea, Amethyst Rebel",
          },
          effect: {
            op: "sequence",
            steps: [
              { op: "reviveSelfFromCemetery" },
              { op: "buff", atk: 1, def: 0, targets: { type: "self" } },
              { op: "grantLastWords", effect: { op: "banishSelf" } },
            ],
          },
        },
      ];

    case "BP17-077EN":
      return [];

    case "BP17-079EN":
      return [
        {
          timing: "passive",
          condition: { type: "fieldTraitMin", trait: "Machina", count: 2 },
          effect: { op: "passiveKeywords", keywords: ["rush", "bane"] },
        },
        {
          timing: "fanfare",
          effect: {
            op: "if",
            condition: { type: "notEnteredFromHand" },
            then: { op: "grantKeyword", keyword: "assail", targets: { type: "self" } },
          },
        },
        {
          timing: "lastWords",
          effect: {
            op: "if",
            condition: { type: "handTraitMin", trait: "Machina", count: 2 },
            then: {
              op: "sequence",
              steps: [
                { op: "discardFromHand", filter: { trait: "Machina" }, count: 2 },
                { op: "moveSourceToExArea" },
                { op: "grantPlayCostReduction", amount: 1, targets: { type: "self" } },
              ],
            },
          },
        },
      ];

    case "BP17-080EN":
      return [
        {
          timing: "spell",
          effect: {
            op: "choose",
            min: 1,
            max: 1,
            options: [
              {
                label: "Search Machina to hand",
                effect: {
                  op: "tutorFromDeck",
                  filter: { trait: "Machina", cardType: "follower" },
                  to: "hand",
                },
              },
              {
                label: "Summon Machina from deck",
                effect: {
                  op: "tutorFromDeck",
                  filter: { trait: "Machina", cardType: "follower", maxCost: 2 },
                  to: "field",
                },
              },
            ],
          },
        },
      ];

    case "BP17-083EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "searchDeckChoose",
            filter: { trait: "Machina" },
            lookAt: 2,
            to: "hand",
            optional: true,
          },
        },
      ];

    case "BP17-113EN":
      return [
        {
          timing: "fanfare",
          effect: {
            op: "sequence",
            steps: [
              { op: "summon", tokenCardNo: ASSEMBLY, count: 1, zone: "field" },
              { op: "summon", tokenCardNo: REPAIR, count: 1, zone: "exArea" },
            ],
          },
        },
        { timing: "evolve", effect: { op: "passiveKeywords", keywords: [] } },
      ];

    case "BP07-SL13EN":
      return [
        {
          timing: "evolve",
          condition: { type: "fieldTraitMin", trait: "Machina", count: 5 },
          effect: { op: "passiveKeywords", keywords: [] },
        },
        {
          timing: "activated",
          oncePerTurn: true,
          cost: {
            pp: 0,
            banishFromCemetery: { trait: "Machina" },
            banishCount: 2,
          },
          effect: { op: "summon", tokenCardNo: DROID, count: 1, zone: "field" },
        },
      ];

    case "BP12-SL22EN":
      return [
        {
          timing: "spell",
          effect: {
            op: "choose",
            min: 1,
            max: 1,
            options: [
              {
                label: "Deal 2 to enemy leader, 1 to yours",
                effect: {
                  op: "sequence",
                  steps: [
                    { op: "dealDamage", amount: 2, targets: { type: "enemyLeader" } },
                    { op: "dealDamage", amount: 1, targets: { type: "selfLeader" } },
                  ],
                },
              },
              {
                label: "Summon Assembly Droid",
                effect: {
                  op: "sequence",
                  steps: [
                    { op: "summon", tokenCardNo: ASSEMBLY, count: 1, zone: "field" },
                    {
                      op: "if",
                      condition: {
                        type: "namedFollowerOnFieldByName",
                        identityName: "Mono, Garnet Rebel",
                      },
                      then: {
                        op: "summon",
                        tokenCardNo: ASSEMBLY,
                        count: 1,
                        zone: "field",
                      },
                      else: {
                        op: "summon",
                        tokenCardNo: ASSEMBLY,
                        count: 1,
                        zone: "exArea",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ];

    case "BP17-SL20EN":
      return [
        {
          timing: "fanfare",
          effect: { op: "summon", tokenCardNo: ASSEMBLY, count: 1, zone: "field" },
        },
        {
          timing: "strike",
          effect: {
            op: "dealDamage",
            amount: { op: "otherFieldTraitCount", trait: "Machina" },
            targets: { type: "enemyFollower", count: 1 },
          },
        },
        {
          timing: "activated",
          oncePerTurn: true,
          cost: { pp: 0 },
          condition: { type: "fieldTraitMin", trait: "Machina", count: 5 },
          effect: {
            op: "sequence",
            steps: [
              { op: "buff", atk: 1, def: 1, targets: { type: "self" } },
              { op: "grantKeyword", keyword: "storm", targets: { type: "self" } },
            ],
          },
        },
      ];

    case "BP07-077EN":
      return [
        {
          timing: "onEvolve",
          effect: {
            op: "tutorFromCemetery",
            filter: { trait: "Machina", cardType: "follower", maxCost: 2 },
            to: "exArea",
            playCostReduction: 2,
          },
        },
      ];

    case "BP07-U05EN":
      return [
        {
          timing: "activated",
          oncePerTurn: true,
          cost: {
            pp: 2,
            banishFromCemetery: { cardNo: "BP07-075EN" },
            banishCount: 1,
          },
          effect: {
            op: "buffFieldTrait",
            trait: "Machina",
            atk: 2,
            def: 2,
            keyword: "rush",
          },
        },
      ];

    case "BP17-078EN":
      return [
        {
          timing: "onEvolve",
          effect: {
            op: "tutorFromDeck",
            filter: { cardNo: "BP17-083EN" },
            to: "field",
          },
        },
        {
          timing: "onSuperEvolve",
          effect: {
            op: "tutorFromCemetery",
            filter: { trait: "Machina" },
            to: "exArea",
            playCostReduction: 3,
          },
        },
      ];

    case "BP17-114EN":
      return [
        {
          timing: "onEvolve",
          effect: {
            op: "sequence",
            steps: [
              { op: "summon", tokenCardNo: ASSEMBLY, count: 1, zone: "field" },
              { op: "summon", tokenCardNo: REPAIR, count: 1, zone: "exArea" },
            ],
          },
        },
      ];

    case "BP14-T01EN":
      return [
        {
          timing: "lastWords",
          effect: {
            op: "dealDamage",
            amount: 2,
            targets: { type: "enemyFollower", count: 1 },
          },
        },
      ];

    case "BP12-T10EN":
    case "PR-170EN":
      return [
        {
          timing: "activated",
          cost: {
            pp: 0,
            engage: true,
            buryFromField: { trait: "Machina" },
            buryFieldCount: 3,
          },
          effect: {
            op: "dealDamage",
            amount: 5,
            targets: { type: "enemyFollower", count: 1 },
          },
        },
      ];

    case "BP14-T02EN":
      return [
        {
          timing: "activated",
          activateFrom: "exArea",
          cost: {
            pp: 1,
            banishFromExArea: { cardNo: GOLD },
            banishCount: 3,
          },
          effect: {
            op: "sequence",
            steps: [{ op: "healLeader", amount: 1 }, { op: "draw", count: 1 }],
          },
        },
      ];

    case "BP17-T18EN":
    case "PR-171EN":
      return [
        { timing: "spell", quick: true, effect: { op: "healLeader", amount: 1 } },
      ];

    case "BP12-T03EN":
      return [
        {
          timing: "lastWords",
          effect: { op: "healLeader", amount: 4 },
        },
      ];

    case "BP12-T04EN":
      return [
        {
          timing: "lastWords",
          effect: {
            op: "dealDamage",
            amount: 4,
            targets: { type: "enemyFollower", count: 1 },
          },
        },
      ];

    default:
      return null;
  }
}

function extraKeywords(cardNo, card, text) {
  const kw = new Set(card.keywords || []);
  if ((card.type === "evolved" || /^Storm\b/i.test(text.trim())) && /\bStorm\b/i.test(text)) {
    kw.add("storm");
  }
  if (/\bWard\b/i.test(text)) kw.add("ward");
  if (/\bStrike\b/i.test(text) || /Strike\s*-/i.test(text)) kw.add("strike");
  if (cardNo === "BP07-U05EN") kw.add("storm");
  if (cardNo === "BP12-082EN") kw.add("ward");
  if (cardNo === "BP17-083EN") kw.add("ward");
  if (cardNo === "BP07-037EN") kw.add("rush");
  if (cardNo === "BP12-T03EN") kw.add("ward");
  if (cardNo === "BP12-T04EN") kw.add("storm");
  if (cardNo === "BP14-018EN") kw.add("advanced");
  if (cardNo === "BP14-019EN") kw.add("advanced");
  return [...kw];
}

function main() {
  if (!fs.existsSync(SCRAPED)) {
    console.error("Run scrapecardnos.js first:", SCRAPED);
    process.exit(1);
  }
  const scraped = JSON.parse(fs.readFileSync(SCRAPED, "utf8"));
  const existing = fs.existsSync(EXISTING)
    ? JSON.parse(fs.readFileSync(EXISTING, "utf8"))
    : {};

  const out = {};
  for (const card of scraped) {
    const text = card.cardText || "";
    const entry = statsFromScrape(card);
    entry.keywords = extraKeywords(card.cardNo, card, text);
    const abilities = buildAbilities(card.cardNo, card, text);
    if (abilities) entry.abilities = abilities;
    else if (existing[card.cardNo]?.abilities) {
      entry.abilities = existing[card.cardNo].abilities;
    }
    out[card.cardNo] = entry;
  }

  // Preserve token defs not in latest scrape batch.
  for (const [cardNo, def] of Object.entries(existing)) {
    if (!out[cardNo] && (cardNo.includes("-T") || cardNo.startsWith("PR-"))) {
      out[cardNo] = def;
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${Object.keys(out).length} card defs to ${OUTPUT}`);
}

main();
