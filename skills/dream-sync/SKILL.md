---
name: dream-sync
description: "Synchronizes dream state context for async operation. Loads and caches the current dream state hierarchy (org → system → module) for offline reference."
phase: GATHER
category: operations
version: "1.0.0"
depends_on: [state-loader]
tags: [async, dream-state, context, synchronization]
---

# Dream Sync

Loads the complete dream state hierarchy and caches it for async operation context.

## When to Use

- During async-loop GATHER phase
- When preparing for mobile/offline operation
- To establish "where we're going" context

## What It Syncs

### Dream State Hierarchy

```
Organization: ~/workspaces/{org}/.claude/DREAM-STATE.md
    └── System: {project}/.claude/DREAM-STATE.md
            └── Modules: Listed in system dream state
```

### Key Data Extracted

| Data Point | Source | Purpose |
|------------|--------|---------|
| Vision | Dream state header | North star reference |
| Module checklist | Dream state modules table | Track completion |
| Completion algebra | Dream state formula | Understand dependencies |
| Progress percentage | Calculated from checklist | Quick status |

## Workflow

### Step 1: Locate Dream States

```typescript
const dreamPaths = {
  org: `~/workspaces/${org}/.claude/DREAM-STATE.md`,
  system: `${project}/.claude/DREAM-STATE.md`
};
```

### Step 2: Parse Dream States

For each dream state:
- Extract vision statement
- Parse module table
- Calculate progress
- Extract completion algebra

### Step 3: Build Context Cache

```json
{
  "dream_context": {
    "org": {
      "name": "superorganism",
      "vision": "...",
      "systems": ["orchestrator", "..."]
    },
    "system": {
      "name": "orchestrator",
      "vision": "Self-improving meta-system...",
      "progress": {
        "complete": 34,
        "total": 34,
        "percentage": 100
      },
      "modules": [
        { "name": "skill-registry", "status": "complete" },
        ...
      ],
      "next_milestone": null
    }
  }
}
```

### Step 4: Identify Next Actions

Based on dream state:
- Which modules are incomplete?
- Which are unblocked (no pending dependencies)?
- What's the highest-leverage next move?

## Output

Updates `memory/async-context.json`:

```json
{
  "dream_state": {
    "synced_at": "ISO-timestamp",
    "org_vision": "...",
    "system_vision": "...",
    "system_progress": {
      "complete": 34,
      "total": 34,
      "percentage": 100
    },
    "incomplete_modules": [],
    "unblocked_modules": [],
    "next_milestone": null
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Async context file | `memory/async-context.json` | Always |

## Error Handling

| Error | Recovery |
|-------|----------|
| Dream state not found | Create minimal context, warn user |
| Parse error | Report specific line, use cached version |
| No modules found | Warn, may indicate complete system |

## References

- [dream-state-schema.md](references/dream-state-schema.md) — Expected dream state structure
