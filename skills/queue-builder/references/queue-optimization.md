# Queue Optimization

Strategies for building optimal async work queues.

## Size Optimization

### Minimum Size: 5

Ensures meaningful async session:
- Enough work to stay busy
- Provides options if one blocks
- Justifies async setup overhead

### Maximum Size: 10

Prevents over-planning:
- Context changes over time
- Priorities may shift
- Estimates become unreliable far out

### Optimal Size

```
optimal_size = min(
  available_modules,
  max(5, estimated_hours_available / 2)
)
```

## Ordering Strategies

### Leverage-First (Default)

Order by leverage score:
- Maximizes value per time
- Front-loads impact
- May hit blockers early

### Dependency-Aware

Respects dependency chains:
- Never schedule blocked work
- Automatically reorder when dependencies complete
- May not be strictly leverage-ordered

### Gate-Optimized

Minimizes context switches:
- Group auto-gate work together
- Batch human gates when possible
- Ideal for async operation

## Gate Handling

### Auto-Gate Batching

When multiple items have only auto-gates:
- Can run back-to-back
- No human intervention needed
- Good for overnight/mobile operation

### Human Gate Clustering

When items need human approval:
- Group at natural break points
- Consider time zones
- Notify in advance

### First Human Gate Analysis

Important for async planning:
- Position in queue where human needed
- Estimated time until reached
- Determines autonomous run length

## Duration Calculation

### Expected Duration Formula

```typescript
function calculateExpectedDuration(queue) {
  let duration = 0;

  for (const item of queue) {
    // Work time
    duration += item.estimated_hours;

    // Auto-gate overhead (minimal)
    duration += item.gates.auto * 0.1;

    // Human gate wait time (significant)
    duration += item.gates.human * AVG_HUMAN_GATE_WAIT;
  }

  return duration;
}
```

### Wait Time Estimates

| Scenario | Expected Wait |
|----------|---------------|
| Synchronous | 5 minutes |
| Async (active) | 15-30 minutes |
| Async (mobile) | 1-2 hours |
| Overnight | 8+ hours |

## Adjustment Strategies

### Dynamic Reordering

When execution reveals new info:
- Blocker discovered → skip, reorder
- Faster than expected → add more
- Slower than expected → reduce scope

### Partial Queue Execution

Can execute portion of queue:
- "Execute until first human gate"
- "Execute first N items"
- "Execute for N hours"

## Async-Specific Optimizations

### Mobile-Friendly Queue

Optimize for phone-based approval:
- Clear gate descriptions
- One-tap approval options
- Status visible in notification

### Overnight Queue

Optimize for unattended operation:
- Only auto-gates
- Conservative estimates
- Clear pause points

### Hybrid Queue

Mix of auto and human gates:
- Auto work first
- Pause at human gates
- Notify when waiting
