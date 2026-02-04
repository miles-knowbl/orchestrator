---
name: state-loader
description: "Loads and validates system state for async operation. Reads memory files, execution history, and current configuration to establish baseline context."
phase: INIT
category: async
version: "1.0.0"
depends_on: []
tags: [async, state, initialization, context, memory]
---

# State Loader

Loads current system state from all persistent stores to establish context for async operation.

## When to Use

- At the start of async-loop to establish baseline
- When resuming from a previous async session
- When system state needs validation before autonomous operation

## What It Loads

### Memory State

| Source | Location | Contains |
|--------|----------|----------|
| Orchestrator memory | `memory/orchestrator.json` | Global patterns, decisions, calibration |
| Async state | `memory/async-state.json` | Previous async session state (if exists) |
| Execution history | `data/executions/` | Recent loop execution records |

### Configuration State

| Source | Location | Contains |
|--------|----------|----------|
| Proactive messaging | `data/proactive-messaging/` | Channel configurations, pending interactions |
| Autonomous config | `data/autonomous/` | Executor state, tick history |

### Git State

- Current branch
- Uncommitted changes
- Last commit information
- Remote sync status

## Workflow

### Step 1: Load Memory Files

```typescript
const memoryState = {
  orchestrator: await loadJSON('memory/orchestrator.json'),
  async: await loadJSON('memory/async-state.json'), // may not exist
  patterns: memory.patterns || [],
  decisions: memory.decisions || [],
  calibration: memory.calibration || {}
};
```

### Step 2: Load Execution History

Query recent executions:
- Last 10 completed executions
- Any in-progress executions
- Failed executions needing attention

### Step 3: Load Configuration

```typescript
const config = {
  messaging: await loadMessagingConfig(),
  autonomous: await loadAutonomousConfig(),
  slack: await loadSlackConfig()
};
```

### Step 4: Assess Git State

```bash
git status --porcelain
git log -1 --format="%h %s (%cr)"
git rev-list --left-right --count origin/main...HEAD
```

### Step 5: Validate Integrity

Check for:
- Corrupted JSON files
- Missing required configuration
- Stale state (>24 hours old)
- Incomplete previous sessions

## Output

Produces `memory/async-state.json`:

```json
{
  "loaded_at": "ISO-timestamp",
  "memory": {
    "patterns_count": 15,
    "decisions_count": 8,
    "calibration_version": "1.2.0"
  },
  "executions": {
    "recent": 10,
    "in_progress": 0,
    "failed_unresolved": 1
  },
  "config": {
    "messaging_enabled": true,
    "slack_connected": true,
    "autonomous_enabled": true
  },
  "git": {
    "branch": "main",
    "uncommitted": false,
    "behind_remote": 0,
    "ahead_remote": 0
  },
  "validation": {
    "valid": true,
    "warnings": [],
    "errors": []
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Async state file | `memory/async-state.json` | Always |

## Error Handling

| Error | Recovery |
|-------|----------|
| Missing memory files | Initialize with defaults |
| Corrupted JSON | Report error, abort async prep |
| Missing Slack config | Warn, continue without Slack |
| Git in conflict state | Abort, require manual resolution |

## References

- [state-schema.md](references/state-schema.md) — Full schema for async-state.json
