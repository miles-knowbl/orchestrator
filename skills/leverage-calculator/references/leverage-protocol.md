# Leverage Protocol

Full specification of the leverage calculation system.

## Core Principle

**Always think: "What's the next highest leverage move?"**

Leverage = Impact / Effort

High leverage moves:
- Advance dream state significantly
- Unlock downstream work
- Are likely to succeed
- Don't take too long

## Value Equation Components

### Dream State Alignment (DSA) — 40%

How directly does this move the checklist toward "done"?

| Score | Criteria |
|-------|----------|
| 10 | Directly completes dream state milestone |
| 8 | Major progress on critical path |
| 6 | Meaningful advancement |
| 4 | Incremental progress |
| 2 | Tangential benefit |
| 0 | No alignment |

### Downstream Unlock — 25%

How many subsequent moves does this make easier/possible?

| Score | Criteria |
|-------|----------|
| 10 | Unblocks 5+ modules |
| 8 | Unblocks 3-4 modules |
| 6 | Unblocks 2 modules |
| 4 | Unblocks 1 module |
| 2 | Enables easier work |
| 0 | No downstream impact |

### Likelihood — 15%

Can we actually complete this given current context?

| Score | Criteria |
|-------|----------|
| 10 | Done before, clear path |
| 8 | Similar work succeeded |
| 6 | Good patterns exist |
| 4 | Unclear but no blockers |
| 2 | Known challenges |
| 0 | Major uncertainty |

### Time Required — 10% (Inverse)

Faster is better.

| Score | Time |
|-------|------|
| 10 | < 1 hour |
| 8 | 1-2 hours |
| 6 | 2-4 hours |
| 4 | 4-8 hours |
| 2 | 1-2 days |
| 0 | > 2 days |

### Effort Required — 10% (Inverse)

Lower friction is better.

| Score | Effort |
|-------|--------|
| 10 | Trivial change |
| 8 | Straightforward |
| 6 | Moderate complexity |
| 4 | Significant work |
| 2 | Major undertaking |
| 0 | Heroic effort |

## Multi-Move Planning

### Line Thinking

Look multiple moves ahead:

```
Move 1: auth-service (V: 8.2)
    └── Move 2: api-endpoints (V: 7.1, unlocked by #1)
            └── Move 3: user-dashboard (V: 6.5, unlocked by #2)
```

### Compound Value

```
Compound V = V₁ + (V₂ × 0.5) + (V₃ × 0.25) + ...
```

### Chain Selection

Choose the chain with highest compound value, not just the best single move.

## Loop Sequence Patterns

Common effective sequences:

| Pattern | Description |
|---------|-------------|
| engineering → bugfix | Build then fix |
| bugfix → distribution | Fix then ship |
| learning → engineering | Learn then apply |
| engineering → distribution | Build then ship |

## Async-Specific Adjustments

### Mobile Context

When operating mobile:
- Prefer smaller moves (< 2 hours)
- Avoid moves requiring deep focus
- Prioritize moves with clear gates

### Autonomy Level

Adjust for human availability:
- Full autonomy: Can proceed through auto-gates
- Supervised: Wait at human gates
- Manual: Require approval at each step

## Decision Framework

1. Calculate single-move leverage for all candidates
2. For top 3, calculate compound leverage
3. Consider loop sequence patterns
4. Apply async-specific adjustments
5. Select highest compound value
