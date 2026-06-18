# DSL authoring guide

Hand-authored card definitions live in:

```
packages/sve-engine/data/card-defs/sets/<SET>.json
```

Each key is a `cardNo`; value is a partial `CardDefinition` with stats, keywords, traits, and `abilities`.

## Ability shape

```json
{
  "timing": "fanfare",
  "effect": { "op": "draw", "count": 1 }
}
```

Timings: `fanfare`, `lastWords`, `onEvolve`, `onSuperEvolve`, `spell`, `activated`, `strike`, `passive`, `aura`, `startOfMain`, `startOfEnd`, `startOfOpponentEnd`, …

## Common effects

| Op | Use |
|----|-----|
| `sequence` | Multiple steps in order |
| `if` | Condition + then (+ else) |
| `choose` | Player picks between options |
| `draw`, `discard`, `mill` | Card movement |
| `dealDamage`, `healLeader` | Combat / leader |
| `summon` | Token to field or exArea |
| `tutorFromCemetery`, `tutorFromDeck` | Search zones |
| `grantKeyword`, `buff` | Stat / keyword changes |
| `burySelf` | Amulet act cost (use in `cost.burySelf` on `activated`) |

## Conditions

- `necrocharge: { count: N }` — cemetery size ≥ N (Abysscraft)
- `ownCemeteryMin: { count: N }` — same check, generic
- `overflow` — max PP ≥ 7

## Targets

- `selfFollower`, `enemyFollower`, `lastSummoned`, `self`, `selfLeader`

## Scenarios

Behavioral tests are YAML files in `packages/sve-engine/scenarios/cards/`.

Run: `npm run eval:scenarios` or `node src/scripts/eval-card.js <cardNo>`

## Pipeline

1. `node src/scripts/parse-effects-to-dsl.js --set BPxx` — auto stubs
2. Hand-edit `sets/BPxx.json` for complex cards
3. `node src/scripts/regenerate-deck-cards.js` — sync scrape stats (preserves set abilities)
4. `npm run generate:manifest`
5. `node src/scripts/eval-card.js <cardNo>` — LLM evaluation packet
