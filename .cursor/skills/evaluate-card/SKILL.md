---
name: evaluate-card
description: Evaluate Shadowverse card DSL behavior using eval-card.js scenario packets. Use when verifying card implementations, fixing DSL, or marking cards pass/fail in card-manifest.json.
---

# Evaluate Card DSL

## When to use

- User asks to verify a card works correctly
- After authoring or changing DSL in `packages/sve-engine/data/card-defs/sets/<SET>.json`
- During expansion rollout (BP01, BP02, …)

## Workflow

1. **Build engine** (if needed):
   ```bash
   npm run build:engine
   ```

2. **Run eval packet**:
   ```bash
   node src/scripts/eval-card.js <cardNo>
   ```
   Output: `eval-reports/<cardNo>.md` plus stdout.

3. **Read the packet**:
   - Official card text vs resolved DSL
   - Scenario results (action trace, assertions, state diff)
   - Open questions (missing scenarios, unresolved choices)

4. **Compare behavior to text** using the embedded rubric:
   - Timings (fanfare, last words, evolve, activate, spell)
   - Costs, targets, conditions (including Necrocharge)
   - Optional branches and once-per-turn limits

5. **If fail** — fix DSL in the correct set file:
   `packages/sve-engine/data/card-defs/sets/<SET>.json`

6. **If scenario gap** — add YAML under:
   `packages/sve-engine/scenarios/cards/<cardNo>-<slug>.yaml`

7. **Re-run** until scenarios pass:
   ```bash
   npm run eval:scenarios
   node src/scripts/eval-card.js <cardNo>
   ```

8. **Update manifest**:
   - Edit `packages/sve-engine/data/card-manifest.json` for the card:
     - `evalStatus`: `pass` | `fail` | `blocked` | `keyword-only`
     - `dslStatus`: `verified` | `authored` | `keyword-only` | `missing`
     - `blockers`: engine primitives still needed
     - `lastEvalAt`: ISO date
   - Or regenerate base manifest: `npm run generate:manifest`

## Scenario authoring

See `packages/sve-engine/docs/dsl-authoring.md` for DSL schema.

Example scenario actions:
- `play: CARDNO` — play from hand
- `resolveTrigger: fanfare`
- `selectZone: { zone: cemetery, cardNo: CARDNO }`
- `activate: CARDNO`
- `engageFollowers: [ALLY1, ALLY2]`

## Batch commands

```bash
node src/scripts/eval-card.js --set BP01 --inventory
node src/scripts/parse-effects-to-dsl.js --set BP01
npm run coverage:cards
```

## Verdicts

| Verdict | Meaning |
|---------|---------|
| `pass` | Text matches DSL and scenarios |
| `fail` | DSL wrong; fix set file |
| `blocked` | Needs new engine primitive (add to manifest `blockers`) |
| `keyword-only` | No effects beyond printed keywords |
