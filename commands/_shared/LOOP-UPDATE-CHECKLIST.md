# Loop Update Checklist

Use this checklist when updating each loop to support the unified architecture.

## Updates Required

### 1. State Schema Update

Add `context` field after `status`:

```json
{
  "loop": "{loop-name}",
  "version": "{bump-version}",
  "phase": "INIT",
  "status": "active",
  "context": {
    "tier": "system",
    "organization": "personal",
    "system": "{repo-name}",
    "module": null
  },
  // ... rest of state
}
```

### 2. Add Context Hierarchy Section

Insert before any "References" or at end of main content:

```markdown
---

## Context Hierarchy

This loop operates within the **Organization → System → Module** hierarchy:

| Tier | Scope | Dream State Location |
|------|-------|---------------------|
| **Organization** | All systems across workspace | `~/.claude/DREAM-STATE.md` |
| **System** | This repository/application | `{repo}/.claude/DREAM-STATE.md` |
| **Module** | Specific concern within system | `{repo}/{path}/.claude/DREAM-STATE.md` or inline |

### Context Loading (Automatic on Init)

When this loop initializes, it automatically loads:

```
1. Organization Dream State (~/.claude/DREAM-STATE.md)
   └── Org-wide vision, active systems, master checklist

2. System Dream State ({repo}/.claude/DREAM-STATE.md)
   └── System vision, modules, progress checklist

3. Recent Runs (auto-injected via query_runs)
   └── Last 3-5 relevant runs for context continuity

4. Memory (patterns, calibration)
   └── Learned patterns from all applicable tiers
```
```

### 3. Add On Completion Section

Insert after Context Hierarchy:

```markdown
---

## On Completion

When this loop reaches COMPLETE phase:

### 1. Archive Run

**Location:** `~/.claude/runs/{year-month}/{system}-{loop-name}-{timestamp}.json`

**Contents:** Full state + summary

### 2. Update Dream State

- Update relevant checklist items
- Append to "Recent Completions"

### 3. Prune Active State

**Delete:** `{loop}-state.json` from working directory.

**Result:** Next invocation starts fresh.
```

## Loop Status

| Loop | Version | Updated | Notes |
|------|---------|---------|-------|
| engineering-loop | 5.0.0 | ✓ | Reference implementation |
| learning-loop | 2.0.0 | ✓ | Second reference |
| bugfix-loop | 2.0.0 | ✓ | Updated 2025-01-29 |
| proposal-loop | 3.0.0 | ✓ | Updated 2025-01-29 |
| meta-loop | 2.0.0 | ✓ | Updated 2025-01-29 |
| infra-loop | 2.0.0 | ✓ | Updated 2025-01-29 |
| distribution-loop | 2.0.0 | ✓ | Updated 2025-01-29 |
| audit-loop | 2.0.0 | ✓ | Updated 2025-01-29 |
| deck-loop | 2.0.0 | ✓ | Updated 2025-01-29 |
| transpose-loop | 2.0.0 | ✓ | Updated 2025-01-29 |

## Validation

After updating each loop, verify:

1. [ ] State schema includes `context` field
2. [ ] Context Hierarchy section present
3. [ ] On Completion section present
4. [ ] Version bumped
5. [ ] No syntax errors in JSON examples
