---
name: history-collector
description: "Collects execution history for async context. Gathers recent loop executions, outcomes, and learnings to inform queue planning."
phase: GATHER
category: async
version: "1.0.0"
depends_on: [state-loader]
tags: [async, history, executions, context]
---

# History Collector

Gathers execution history to provide temporal context for async operation.

## When to Use

- During async-loop GATHER phase
- To understand recent activity and momentum
- To identify incomplete work needing continuation

## What It Collects

### Execution History

| Data | Source | Purpose |
|------|--------|---------|
| Recent executions | Run archives | What was done recently |
| Outcomes | Execution results | Success/failure patterns |
| Duration data | Timestamps | Actual vs estimated time |
| Gate history | Gate records | Approval patterns |

### Analysis Points

- Last 10 completed executions
- Any incomplete executions
- Failed executions needing retry
- Gate approval wait times

## Workflow

### Step 1: Query Execution History

```typescript
const history = await runArchivalService.queryRuns({
  limit: 20,
  sortBy: 'completedAt',
  order: 'desc'
});
```

### Step 2: Categorize Executions

```json
{
  "executions": {
    "completed": [...],
    "incomplete": [...],
    "failed": [...]
  }
}
```

### Step 3: Extract Insights

```typescript
const insights = {
  recentLoops: extractLoopTypes(history.completed),
  averageDuration: calculateAvgDuration(history.completed),
  successRate: calculateSuccessRate(history),
  commonGateDelays: findGatePatterns(history)
};
```

### Step 4: Identify Action Items

- Incomplete executions to resume
- Failed executions to retry
- Patterns to inform queue

## Output

Updates `memory/async-context.json`:

```json
{
  "history": {
    "collected_at": "ISO-timestamp",
    "recent_executions": [
      {
        "id": "exec-123",
        "loop": "engineering-loop",
        "completed_at": "ISO-timestamp",
        "duration_minutes": 180,
        "outcome": "success"
      }
    ],
    "incomplete": [],
    "needs_retry": [],
    "insights": {
      "most_common_loop": "engineering-loop",
      "average_duration_minutes": 120,
      "success_rate": 0.92,
      "avg_gate_wait_minutes": 15
    },
    "momentum": {
      "streak": 5,
      "last_active": "ISO-timestamp",
      "days_since_activity": 0
    }
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated async context | `memory/async-context.json` | Always |

## Momentum Tracking

### Streak Calculation

```typescript
const streak = countConsecutiveSuccesses(history.completed);
```

### Activity Recency

```typescript
const daysSinceActivity = daysBetween(
  history.completed[0]?.completedAt,
  now
);
```

## References

- [history-analysis.md](references/history-analysis.md) — How to analyze execution history
