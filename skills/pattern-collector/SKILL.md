---
name: pattern-collector
description: "Collects and organizes patterns from memory for async context. Gathers relevant patterns that inform autonomous decision-making."
phase: GATHER
category: async
version: "1.0.0"
depends_on: [state-loader]
tags: [async, patterns, context, memory]
---

# Pattern Collector

Gathers patterns from memory service to inform async operation decisions.

## When to Use

- During async-loop GATHER phase
- To provide decision-making context for autonomous operation
- To surface relevant learnings for the work ahead

## What It Collects

### Pattern Types

| Type | Source | Relevance |
|------|--------|-----------|
| Behavioral | Run archives | How loops typically execute |
| Codebase | Skill documentation | Implementation patterns |
| Strategic | Memory ADRs | Decision-making patterns |
| Anti-patterns | Retrospectives | What to avoid |

### Filtering Criteria

Patterns are filtered by relevance to:
- Available modules (from roadmap)
- Loop types likely to be executed
- Recent execution history

## Workflow

### Step 1: Query Patterns

```typescript
const patterns = await patternsService.queryPatterns({
  level: 'all',
  recent: true,
  limit: 50
});
```

### Step 2: Score Relevance

For each pattern, calculate relevance score:

```typescript
const relevanceScore = (pattern) => {
  let score = 0;

  // Recency bonus
  if (isRecent(pattern.detectedAt, 7)) score += 2;

  // Category match
  if (matchesAvailableWork(pattern.categories)) score += 3;

  // Frequency bonus
  if (pattern.frequency > 3) score += 1;

  return score;
};
```

### Step 3: Categorize

Group patterns by utility:

```json
{
  "patterns": {
    "execution": [...],  // How to run loops
    "technical": [...],  // Implementation guidance
    "strategic": [...],  // Decision frameworks
    "avoid": [...]       // Anti-patterns
  }
}
```

### Step 4: Summarize

Create actionable summary:

```json
{
  "pattern_summary": {
    "total_collected": 25,
    "high_relevance": 8,
    "key_insights": [
      "Engineering loops typically take 2-4 hours",
      "Always run tests before distribution",
      "Gate rejections usually require code changes"
    ],
    "warnings": [
      "Avoid: Skipping VALIDATE phase",
      "Avoid: Large commits without incremental testing"
    ]
  }
}
```

## Output

Updates `memory/async-context.json`:

```json
{
  "patterns": {
    "collected_at": "ISO-timestamp",
    "total": 25,
    "by_type": {
      "execution": 10,
      "technical": 8,
      "strategic": 5,
      "avoid": 2
    },
    "high_relevance": [...],
    "key_insights": [...],
    "warnings": [...]
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated async context | `memory/async-context.json` | Always |

## References

- [pattern-categories.md](references/pattern-categories.md) — Pattern categorization taxonomy
