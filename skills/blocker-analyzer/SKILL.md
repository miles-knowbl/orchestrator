---
name: blocker-analyzer
description: "Analyzes blockers preventing module progress. Identifies blocked modules, their dependencies, and potential unblocking strategies."
phase: SCORE
category: async
version: "1.0.0"
depends_on: [dream-sync]
tags: [async, blockers, dependencies, analysis]
---

# Blocker Analyzer

Analyzes what's blocking modules and identifies potential unblocking strategies.

## When to Use

- During async-loop SCORE phase
- To understand why certain modules aren't available
- To identify unblocking opportunities

## What It Analyzes

### Blocker Types

| Type | Description | Example |
|------|-------------|---------|
| Dependency | Waiting on another module | "Needs auth-service complete" |
| External | Waiting on external factor | "Needs API key from vendor" |
| Technical | Technical obstacle | "Requires library upgrade" |
| Resource | Needs unavailable resource | "Needs design review" |
| Decision | Waiting on decision | "Architecture choice pending" |

### Analysis Outputs

- Which modules are blocked
- What's blocking them
- Potential workarounds
- Unblocking priorities

## Workflow

### Step 1: Identify Blocked Modules

```typescript
const blocked = roadmap.modules.filter(m =>
  m.status !== 'complete' &&
  m.status !== 'deferred' &&
  (m.blockedBy?.length > 0 || m.status === 'blocked')
);
```

### Step 2: Classify Blockers

For each blocked module:

```typescript
const blockers = module.blockedBy.map(dep => ({
  dependency: dep,
  type: classifyBlockerType(dep, roadmap),
  severity: calculateSeverity(dep),
  unblockPath: findUnblockPath(dep, roadmap)
}));
```

### Step 3: Find Unblock Paths

```typescript
function findUnblockPath(blocker, roadmap) {
  // Is blocker itself unblocked?
  const blockerModule = roadmap.find(m => m.name === blocker);
  if (blockerModule?.blockedBy?.length === 0) {
    return {
      strategy: 'complete_dependency',
      target: blocker,
      effort: 'direct'
    };
  }

  // Can we work around?
  if (hasWorkaround(blocker)) {
    return {
      strategy: 'workaround',
      description: getWorkaround(blocker),
      effort: 'moderate'
    };
  }

  // Need to unblock chain
  return {
    strategy: 'chain_unblock',
    chain: getBlockerChain(blocker, roadmap),
    effort: 'significant'
  };
}
```

### Step 4: Prioritize Unblocking

```typescript
const unblockPriorities = blocked
  .flatMap(m => m.blockers)
  .reduce((acc, blocker) => {
    // Count how many modules each blocker blocks
    acc[blocker.dependency] = (acc[blocker.dependency] || 0) + 1;
    return acc;
  }, {});

const prioritized = Object.entries(unblockPriorities)
  .sort(([, a], [, b]) => b - a)
  .map(([blocker, count]) => ({ blocker, blocksCount: count }));
```

## Output

Updates `memory/module-scores.json` with blocker analysis:

```json
{
  "blocker_analysis": {
    "analyzed_at": "ISO-timestamp",
    "blocked_modules": 3,
    "blockers": [
      {
        "module": "api-endpoints",
        "blocked_by": ["auth-service"],
        "blocker_type": "dependency",
        "unblock_path": {
          "strategy": "complete_dependency",
          "target": "auth-service",
          "effort": "direct"
        }
      }
    ],
    "unblock_priorities": [
      {
        "blocker": "auth-service",
        "blocks_count": 3,
        "recommendation": "Complete auth-service to unblock 3 modules"
      }
    ],
    "cascading_unlocks": [
      {
        "if_complete": "auth-service",
        "unlocks": ["api-endpoints", "user-dashboard", "admin-panel"]
      }
    ]
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated module scores | `memory/module-scores.json` | Always |

## Cascading Unlock Analysis

Identifies high-leverage unblocking opportunities:

```typescript
function findCascadingUnlocks(roadmap) {
  return roadmap.modules
    .filter(m => m.blockedBy?.length === 0 && m.status !== 'complete')
    .map(m => ({
      module: m.name,
      directlyUnlocks: countDirectDependents(m, roadmap),
      transitivelyUnlocks: countTransitiveDependents(m, roadmap)
    }))
    .filter(m => m.directlyUnlocks > 0)
    .sort((a, b) => b.transitivelyUnlocks - a.transitivelyUnlocks);
}
```

## References

- [blocker-types.md](references/blocker-types.md) — Blocker classification guide
