# Pipeline Loop

Weekly pipeline review and planning.

## When to Use

- Monday morning planning
- Weekly pipeline review
- When pipeline feels unclear
- Before forecast/reporting
- Any time: "show me my pipeline"

## What It Does

Complete pipeline review:
1. Generates pipeline snapshot
2. Identifies alerts and at-risk deals
3. Ranks and prioritizes deals
4. Creates weekly focus plan
5. Allocates time across tiers

## Phases

### SNAPSHOT: Pipeline Snapshot
Generate current pipeline state.
- Total deals and value
- Weighted pipeline
- Health distribution
- Stage breakdown
- Comparison to last week

**Gate:** Pipeline Health Gate
- Snapshot generated
- Alerts reviewed

### PRIORITIZE: Prioritize
Rank all deals by priority.
- Calculate priority scores
- Assign to tiers (Focus, Maintain, Monitor, Backburner)
- Recommend time allocation

### FOCUS: Weekly Focus
Create execution plan.
- Top 3-5 priorities
- Daily schedule
- Success criteria
- Anticipated blockers

### COMPLETE: Complete
Finalize and commit.
- Review plan
- Commit to priorities
- Set calendar

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| None | — | Reviews all deals |

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Snapshot | pipeline/snapshot-{date}.json | Pipeline state |
| Priorities | pipeline/priorities-{date}.json | Ranked deals |
| Weekly plan | pipeline/weekly-focus-{date}.md | Execution plan |

## Example

```
/pipeline-loop

═══════════════════════════════════════════
  SNAPSHOT PHASE
═══════════════════════════════════════════

→ Generating pipeline snapshot...

  PIPELINE SUMMARY
  ┌─────────────────────────────────────┐
  │ Total Deals     │ 12               │
  │ Pipeline Value  │ $2,400,000       │
  │ Weighted Value  │ $1,120,000       │
  │ Average Health  │ 68/100           │
  └─────────────────────────────────────┘

  BY STAGE:
  Lead         █░░░░ 3 deals  $450K
  Target       █░░░░ 2 deals  $300K
  Discovery    ███░░ 4 deals  $800K
  Contracting  ██░░░ 2 deals  $500K
  Production   █░░░░ 1 deal   $350K

  ALERTS:
  ⚠️ At Risk: TechStart (health 35)
  ⏸️ Stalled: GlobalCo (35 days)
  📋 Action: ShopCo tech meeting overdue

[Pipeline Health Gate]
  ✓ Snapshot generated
  ✓ 3 alerts reviewed
  → PASSED

═══════════════════════════════════════════
  PRIORITIZE PHASE
═══════════════════════════════════════════

→ Calculating priorities...

  FOCUS TIER (60% time):
  #1 BigTech Inc     $350K  Score: 92
  #2 ShopCo          $250K  Score: 78
  #3 Enterprise Co   $150K  Score: 76

  MAINTAIN TIER (25% time):
  #4 RetailPlus      $200K  Score: 65
  #5 ServeCo         $150K  Score: 58

  MONITOR TIER (10% time):
  #6 CloudCo         $200K  Score: 48

  BACKBURNER (5% time):
  #7 TechStart       $100K  Score: 32 ⚠️

═══════════════════════════════════════════
  FOCUS PHASE
═══════════════════════════════════════════

→ Creating weekly focus...

  THIS WEEK'S PRIORITIES:

  ★ #1: Close BigTech Contract
     Target: Signed by Friday
     Actions: Legal follow-up → Final version → Signature

  → #2: Advance ShopCo to Proposal
     Target: CTO aligned, proposal drafted
     Actions: CTO meeting → Debrief → Draft proposal

  ⚠️ #3: Decide on TechStart
     Target: Recover or qualify out
     Actions: Champion call → Decision by Wednesday

  TIME ALLOCATION:
  Focus:    24 hrs (60%)
  Maintain: 10 hrs (25%)
  Monitor:  4 hrs  (10%)
  Admin:    2 hrs  (5%)

═══════════════════════════════════════════
  COMPLETE PHASE
═══════════════════════════════════════════

✓ Pipeline review complete

  Pipeline: $2.4M ($1.12M weighted)
  Health: 68/100 (Good)

  Week Focus:
  1. Close BigTech
  2. Advance ShopCo
  3. Decide TechStart

  Say 'go' to commit to this plan.
```

## Related Loops

- **deal-review-loop** — Deep dive on specific deals
- **intelligence-loop** — Update deal intelligence
- **weekly-focus** — Reference during week
