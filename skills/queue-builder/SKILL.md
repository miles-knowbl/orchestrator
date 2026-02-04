---
name: queue-builder
description: "Builds prioritized work queue for async operation. Creates a 5-10 move plan with estimated durations and gate points."
phase: PLAN
category: async
version: "1.0.0"
depends_on: [leverage-calculator]
tags: [async, queue, planning, execution]
---

# Queue Builder

Creates the prioritized work queue for async operation.

## When to Use

- During async-loop PLAN phase
- After leverage calculations complete
- To produce the executable work plan

## What It Builds

### Queue Structure

```json
{
  "queue": [
    {
      "position": 1,
      "module": "auth-service",
      "loop": "engineering-loop",
      "leverage_score": 8.2,
      "estimated_hours": 3.5,
      "gate_count": 3,
      "auto_gates": 2,
      "human_gates": 1
    }
  ]
}
```

### Queue Properties

| Property | Description |
|----------|-------------|
| Size | 5-10 moves (configurable) |
| Ordering | By compound leverage |
| Dependencies | Respects blocking order |
| Gates | Identifies approval points |

## Workflow

### Step 1: Load Leverage Data

```typescript
const leverage = await loadJSON('memory/async-queue.json');
const topMoves = leverage.leverage.top_5;
```

### Step 2: Expand to Queue

```typescript
function buildQueue(topMoves, maxSize = 10) {
  const queue = [];

  for (const move of topMoves) {
    // Add the move
    queue.push({
      position: queue.length + 1,
      module: move.module,
      loop: move.recommended_loop,
      leverage_score: move.leverage_score,
      estimated_hours: move.estimated_hours,
      ...analyzeGates(move)
    });

    // Add unlocked moves if space
    if (queue.length < maxSize) {
      const unlocked = getUnlockedAfter(move);
      for (const next of unlocked) {
        if (queue.length >= maxSize) break;
        queue.push(buildQueueItem(next, queue.length + 1));
      }
    }
  }

  return queue;
}
```

### Step 3: Analyze Gates

For each queue item:

```typescript
function analyzeGates(move) {
  const loop = loops[move.recommended_loop];
  const gates = loop.gates || [];

  return {
    gate_count: gates.length,
    auto_gates: gates.filter(g => g.approvalType === 'auto').length,
    human_gates: gates.filter(g => g.approvalType !== 'auto').length,
    first_human_gate: gates.find(g => g.approvalType !== 'auto')?.afterPhase
  };
}
```

### Step 4: Calculate Totals

```typescript
const totals = {
  total_moves: queue.length,
  total_estimated_hours: sum(queue, 'estimated_hours'),
  total_gates: sum(queue, 'gate_count'),
  total_human_gates: sum(queue, 'human_gates'),
  expected_duration: calculateExpectedDuration(queue)
};
```

### Step 5: Add Metadata

```json
{
  "queue_metadata": {
    "built_at": "ISO-timestamp",
    "queue_size": 7,
    "estimated_total_hours": 15.5,
    "gate_summary": {
      "total": 12,
      "auto": 8,
      "human": 4
    },
    "expected_completion": "ISO-timestamp",
    "pause_points": [
      { "after_position": 3, "reason": "human_gate" }
    ]
  }
}
```

## Output

Creates/updates `memory/async-queue.json`:

```json
{
  "queue": {
    "built_at": "ISO-timestamp",
    "items": [
      {
        "position": 1,
        "module": "auth-service",
        "loop": "engineering-loop",
        "leverage_score": 8.2,
        "estimated_hours": 3.5,
        "gates": {
          "total": 3,
          "auto": 2,
          "human": 1,
          "first_human": "REVIEW"
        },
        "status": "pending"
      }
    ],
    "totals": {
      "moves": 7,
      "estimated_hours": 15.5,
      "human_gates": 4
    },
    "execution_plan": {
      "can_auto_complete": 3,
      "first_human_stop": {
        "position": 1,
        "gate": "REVIEW"
      }
    }
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Async queue file | `memory/async-queue.json` | Always |

## Gate at Plan Review

Before proceeding, this phase has a gate for reviewing the queue:

```
╔══════════════════════════════════════════════════════════╗
║  PLAN REVIEW GATE                           [MANUAL]     ║
╠══════════════════════════════════════════════════════════╣
║  Queue: 7 moves                                          ║
║  Estimated: 15.5 hours                                   ║
║  Human gates: 4 (first at position 1, REVIEW phase)      ║
║                                                          ║
║  Top 3 moves:                                            ║
║    1. auth-service (V: 8.2) - engineering-loop           ║
║    2. api-endpoints (V: 7.1) - engineering-loop          ║
║    3. user-dashboard (V: 6.5) - engineering-loop         ║
║                                                          ║
║  Commands:                                               ║
║    approved  — Accept queue, proceed to verification     ║
║    revise    — Adjust queue parameters                   ║
╚══════════════════════════════════════════════════════════╝
```

## References

- [queue-optimization.md](references/queue-optimization.md) — Queue optimization strategies
