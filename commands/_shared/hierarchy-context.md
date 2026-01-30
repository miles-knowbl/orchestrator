# Shared: Context Hierarchy

> This section is included in all loop command definitions.

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

3. Module Dream State (if module-scoped)
   └── Module functions, completion criteria

4. Recent Runs (auto-injected)
   └── Last 3-5 relevant runs for context continuity

5. Memory (patterns, calibration)
   └── Learned patterns from all applicable tiers
```

### Scope Detection

On fresh start, the loop detects scope:

```
Is this scoped to a specific module? → Module-level execution
Is this in a git repository? → System-level execution
Otherwise → Organization-level execution
```

### State Schema Addition

All loop state files include:

```json
{
  "context": {
    "tier": "system",           // "organization" | "system" | "module"
    "organization": "personal", // org identifier
    "system": "orchestrator",   // repo/system name (null if org-level)
    "module": null              // module name (null if system-level)
  }
}
```
