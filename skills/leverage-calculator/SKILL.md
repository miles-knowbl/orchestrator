---
name: leverage-calculator
description: "Calculates leverage scores for queue planning. Uses the leverage protocol to determine optimal work ordering for async operation."
phase: PLAN
category: async
version: "1.0.0"
depends_on: [module-scorer, blocker-analyzer]
tags: [async, leverage, planning, prioritization]
---

# Leverage Calculator

Applies the leverage protocol to determine optimal work ordering.

## When to Use

- During async-loop PLAN phase
- After modules have been scored
- To create prioritized work queue

## Leverage Protocol

### Value Equation

```
       (DSA × 0.40) + (Downstream Unlock × 0.25) + (Likelihood × 0.15)
V = ─────────────────────────────────────────────────────────────────────
                    (Time × 0.10) + (Effort × 0.10)
```

### Multi-Move Planning

Beyond single-move leverage, consider:
- What completing this unlocks
- Sequence optimization (loop chains)
- Compound leverage across moves

## Workflow

### Step 1: Load Scored Modules

```typescript
const scores = await loadJSON('memory/module-scores.json');
const ranked = scores.ranked_modules;
```

### Step 2: Calculate Compound Leverage

For top candidates, calculate multi-move value:

```typescript
function calculateCompoundLeverage(module, depth = 3) {
  let totalValue = module.leverage_score;

  // Look ahead
  const unlocks = getUnlockedModules(module);
  for (const unlocked of unlocks.slice(0, depth)) {
    const nextScore = calculateLeverage(unlocked);
    totalValue += nextScore * (0.5 ** depth); // Discount future
  }

  return totalValue;
}
```

### Step 3: Consider Loop Sequences

Apply loop sequencing patterns:

```typescript
const sequences = await loopSequencingService.getTransitions();
const optimalSequence = sequences.find(seq =>
  seq.fromLoop === lastCompletedLoop &&
  seq.confidence > 0.7
);

if (optimalSequence) {
  // Boost modules that match expected next loop
  ranked.forEach(m => {
    if (m.recommended_loop === optimalSequence.toLoop) {
      m.leverage_score *= 1.2; // 20% boost
    }
  });
}
```

### Step 4: Build Leverage Report

```json
{
  "leverage_calculation": {
    "calculated_at": "ISO-timestamp",
    "top_moves": [
      {
        "rank": 1,
        "module": "auth-service",
        "leverage_score": 8.2,
        "compound_leverage": 12.5,
        "unlocks": ["api-endpoints", "user-dashboard"],
        "recommended_loop": "engineering-loop",
        "reasoning": "High DSA (9/10), unblocks 2 modules"
      }
    ],
    "sequence_recommendation": {
      "line": ["auth-service", "api-endpoints", "user-dashboard"],
      "compound_value": 18.7,
      "estimated_hours": 10.5
    }
  }
}
```

## Output

Updates `memory/async-queue.json` with leverage calculations:

```json
{
  "leverage": {
    "calculated_at": "ISO-timestamp",
    "single_move_best": {
      "module": "auth-service",
      "score": 8.2
    },
    "multi_move_best": {
      "line": ["auth-service", "api-endpoints"],
      "compound_score": 12.5
    },
    "top_5": [...]
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Async queue file | `memory/async-queue.json` | Always |

## Compound Leverage Calculation

### Discount Factor

Future value is discounted:
- Move 1: 100% value
- Move 2: 50% value
- Move 3: 25% value

### Chain Value

```typescript
const chainValue = moves.reduce((total, move, index) => {
  const discount = Math.pow(0.5, index);
  return total + (move.leverage * discount);
}, 0);
```

## References

- [leverage-protocol.md](references/leverage-protocol.md) — Full leverage protocol specification
