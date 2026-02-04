---
name: module-scorer
description: "Scores available modules for async queue prioritization. Calculates leverage scores using dream state alignment, downstream impact, and execution likelihood."
phase: SCORE
category: async
version: "1.0.0"
depends_on: [dream-sync, pattern-collector, calibration-sync]
tags: [async, scoring, leverage, prioritization]
---

# Module Scorer

Calculates leverage scores for available modules to prioritize the async work queue.

## When to Use

- During async-loop SCORE phase
- After context gathering is complete
- To determine which modules to work on during async operation

## Scoring Model

### Leverage Equation

```
V = (DSA × 0.40) + (Downstream × 0.25) + (Likelihood × 0.15)
    ─────────────────────────────────────────────────────────
                (Time × 0.10) + (Effort × 0.10)
```

### Dimensions

| Dimension | Weight | Range | Meaning |
|-----------|--------|-------|---------|
| Dream State Alignment | 40% | 0-10 | How directly does this advance the dream state? |
| Downstream Unlock | 25% | 0-10 | How many subsequent modules does this unblock? |
| Likelihood | 15% | 0-10 | How likely is successful completion? |
| Time | 10% | 0-10 | Inverse: faster is better |
| Effort | 10% | 0-10 | Inverse: lower friction is better |

## Workflow

### Step 1: Get Available Modules

```typescript
const modules = await roadmapService.getModulesNeedingAttention();
const available = modules.filter(m =>
  m.status !== 'complete' &&
  m.status !== 'deferred' &&
  m.blockedBy.length === 0
);
```

### Step 2: Score Each Module

For each available module:

```typescript
const score = {
  dsa: calculateDreamStateAlignment(module, dreamContext),
  downstream: calculateDownstreamImpact(module, roadmap),
  likelihood: calculateLikelihood(module, history, patterns),
  time: estimateTime(module, calibration),
  effort: estimateEffort(module, patterns)
};

const leverage = (
  (score.dsa * 0.40) +
  (score.downstream * 0.25) +
  (score.likelihood * 0.15)
) / (
  (score.time * 0.10) +
  (score.effort * 0.10)
);
```

### Step 3: Rank Modules

```typescript
const ranked = modules
  .map(m => ({ module: m, score: calculateLeverage(m) }))
  .sort((a, b) => b.score - a.score);
```

### Step 4: Build Score Report

```json
{
  "module_scores": {
    "scored_at": "ISO-timestamp",
    "available_count": 5,
    "ranked": [
      {
        "module": "auth-service",
        "leverage_score": 8.2,
        "components": {
          "dsa": 9,
          "downstream": 8,
          "likelihood": 7,
          "time": 5,
          "effort": 4
        },
        "reasoning": "Unblocks 3 dependent modules"
      }
    ]
  }
}
```

## Output

Updates `memory/module-scores.json`:

```json
{
  "scored_at": "ISO-timestamp",
  "model_version": "1.0.0",
  "available_modules": 5,
  "ranked_modules": [
    {
      "name": "auth-service",
      "leverage_score": 8.2,
      "rank": 1,
      "components": { ... },
      "recommended_loop": "engineering-loop",
      "estimated_duration_hours": 3.5,
      "reasoning": "..."
    }
  ],
  "deferred": [
    { "name": "...", "reason": "..." }
  ]
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Module scores file | `memory/module-scores.json` | Always |

## Component Calculations

### Dream State Alignment (DSA)

```typescript
const dsa = (
  moduleInDreamState ? 5 : 0 +
  moduleHasChecklistItems ? 3 : 0 +
  moduleAdvancesVision ? 2 : 0
);
```

### Downstream Impact

```typescript
const downstream = countDependentModules(module) * 2;
// Capped at 10
```

### Likelihood

```typescript
const likelihood = (
  hasSuccessfulPriorAttempts ? 3 : 0 +
  patternsExist ? 2 : 0 +
  noKnownBlockers ? 3 : 0 +
  clearRequirements ? 2 : 0
);
```

## References

- [scoring-algorithm.md](references/scoring-algorithm.md) — Detailed scoring algorithm
