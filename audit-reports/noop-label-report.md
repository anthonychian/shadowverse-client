# Noop label frequency report

Generated: 2026-06-18T05:22:41.875Z

## Audit snapshot
- Identities with noop_inner: **1039**
- Parse-fail noop nodes: **1122**
- Timing-stub noop nodes: **378**
- Audit: 1777/2770 passing

## Buckets (parse-fail nodes)

| Bucket | Nodes | Unique labels |
|--------|-------|---------------|
| damage | 191 | 163 |
| unknown | 180 | 167 |
| search_tutor | 114 | 112 |
| passive_trigger | 110 | 106 |
| buff | 98 | 96 |
| summon | 96 | 94 |
| select_target | 86 | 84 |
| heal_buff_leader | 55 | 52 |
| draw | 50 | 49 |
| destroy_banish | 48 | 47 |
| reminder_text | 40 | 35 |
| evolve | 23 | 22 |
| parser_meta | 20 | 18 |
| choose | 6 | 5 |
| discard | 3 | 3 |
| condition_cost | 2 | 2 |

## Top 30 labels

### 12× — `damage`
> and deal it 2 damage
- Cards: BP01-T12EN, BP02-021EN, BP03-032EN, BP03-099EN, BP14-096EN, BP15-066EN, BP15-067EN, BP16-063EN

### 4× — `damage`
> and, if Overflow is active for you, deal it 4 damage
- Cards: BP13-061EN, BP14-058EN, BP15-072EN, CP03-081EN

### 3× — `damage`
> During each opponent's turn, this follower deals 4 more damage
- Cards: BP01-137EN, SD06-009EN, SD06-010EN

### 3× — `unknown`
> This card costs 4 less to play. ----------
- Cards: BP07-004EN, CP02-050EN, CP02-U06bEN

### 3× — `damage`
> If there are at least 20, deal 8 damage to each enemy leader
- Cards: BP08-028EN, BP08-054EN, BP11-036EN

### 3× — `reminder_text`
> (1) Select an enemy follower on the field and deal it 6 damage
- Cards: BP14-114EN, BP15-048EN, BP17-103EN

### 3× — `unknown`
> play cost reduction condition
- Cards: BP15-008EN, BP15-065EN, BP17-108EN

### 3× — `reminder_text`
> (Followers with Storm can attack enemy followers and leaders on the turn they're
- Cards: CSD02b-010EN, CSD03a-001EN, CSD03b-001EN

### 2× — `select_target`
> Select an enemy leader
- Cards: BP01-028EN, ECP01-SP21EN

### 2× — `damage`
> [cost02]: Select an enemy follower on the field and deal it 4 damage
- Cards: BP02-101EN, BP17-095EN

### 2× — `unknown`
> Put the remaining cards on the bottom of your deck in any order
- Cards: BP03-042EN, CP01-032EN

### 2× — `unknown`
> This ability can be activated
- Cards: BP03-080EN, BP05-059EN

### 2× — `damage`
> Select any number of enemy followers on the field and deal X damage divided between them
- Cards: BP04-001EN, BP04-002EN

### 2× — `unknown`
> variable: hand+ex count
- Cards: BP04-001EN, BP04-002EN

### 2× — `buff`
> Combo (3) - Give this follower +1/+1
- Cards: BP04-011EN, BP10-002EN

### 2× — `unknown`
> Put this follower onto its owner's field
- Cards: BP04-047EN, BP04-048EN

### 2× — `heal_buff_leader`
> X equals the number of times your leader has lost defense this turn
- Cards: BP05-069EN, BP05-081EN

### 2× — `damage`
> If there are 0 cards in your hand, deal 3 damage to each enemy follower on the field
- Cards: BP05-103EN, BP05-104EN

### 2× — `unknown`
> X equals a number of your choice
- Cards: BP06-095EN, BP11-032EN

### 2× — `summon`
> Select a follower that costs 3 or less in your cemetery and summon it
- Cards: BP07-006EN, CP02-U12aEN

### 2× — `evolve`
> evolve cost reduction this turn
- Cards: BP07-086EN, BP13-078EN

### 2× — `damage`
> Select any number of enemy followers on the field and deal 4 damage divided between them
- Cards: BP08-028EN, BP12-078EN

### 2× — `damage`
> Deal it 5 damage and give your leader [def]+5
- Cards: BP08-057EN, ECP02-053EN

### 2× — `destroy_banish`
> Banish the top 5 cards of your deck
- Cards: BP10-060EN, CP03-060EN

### 2× — `heal_buff_leader`
> Change each enemy leader's defense to 6
- Cards: BP10-075EN, BP16-T09EN

### 2× — `damage`
> Combo (5) - Deal it 3 damage
- Cards: BP11-003EN, BP17-T02EN

### 2× — `damage`
> and, if there are at least 3 Mount cards on your field and/or in your EX area, deal it 3 damage
- Cards: BP11-014EN, BP11-114EN

### 2× — `unknown`
> end phase variable atk: the number of followers with Ward on you
- Cards: BP12-093EN, BP12-094EN

### 2× — `select_target`
> You may play this card for 2 more play points. ---------- Select an enemy follower on the field
- Cards: BP13-025EN, BP13-060EN

### 2× — `parser_meta`
> activate overflow
- Cards: BP13-057EN, BP16-060EN

## Automation notes

- Run `npm run auto:fix-noops` to re-apply pattern matchers to noop labels (unattended).
- High-count buckets (`damage`, `draw`, `search_tutor`) → extend `stub-patterns.js`.
- `timing_stub` nodes need implemented `[act]` effects or audit refinement.
- `choose` / `unknown` → hand overrides or parser compound rules.
