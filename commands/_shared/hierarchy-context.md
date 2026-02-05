# Shared: Context Hierarchy

> This section is included in all loop command definitions.

## Context Hierarchy

This loop operates within the **Organization → Domain → System → Module** hierarchy:

| Tier | Scope | Dream State Location |
|------|-------|---------------------|
| **Organization** | All domains and systems in workspace | `~/workspaces/{org}/.claude/DREAM-STATE.md` |
| **Domain** | Related systems within organization | `~/workspaces/{org}/.claude/domains/{domain}/DREAM-STATE.md` |
| **System** | This repository/application | `{project}/.claude/DREAM-STATE.md` |
| **Module** | Specific concern within system | `{project}/src/{module}/DREAM-STATE.md` or inline |

### Completion Algebra

```
Organization.done = ALL(Domain.done)
Domain.done       = ALL(System.done)
System.done       = ALL(Module.done)
Module.done       = ALL(Function.operational)
```

### Context Loading (Automatic on Init)

When this loop initializes, the **observe-grounding hook** automatically loads:

```
1. Organization Dream State (~/workspaces/{org}/.claude/DREAM-STATE.md)
   └── Org-wide vision, domains, master checklist

2. Domain Dream State (~/workspaces/{org}/.claude/domains/{domain}/DREAM-STATE.md)
   └── Domain vision, systems in domain, cross-system integrations

3. System Dream State ({project}/.claude/DREAM-STATE.md)
   └── System vision, modules, progress checklist

4. Module Dream State (if module-scoped)
   └── Module functions, completion criteria

5. Recent Runs (auto-injected)
   └── Last 3-5 relevant runs for context continuity

6. Memory (patterns, calibration)
   └── Learned patterns from all applicable tiers
```

### Observe Skill

After grounding, the **observe skill** runs opportunity mapping:

```
1. Case-Based Reasoning
   └── Match current context against memory patterns

2. Bundling Detection
   └── Aggregate checklists-to-done, find multi-solve opportunities

3. Reframing Candidates
   └── Question current frame, find compression opportunities

4. Paradigm Shift Detection
   └── Surface 100x leverage moves (may return "nothing significant")
```

### Scope Detection

On fresh start, the loop detects scope:

```
Is this scoped to a specific module? → Module-level execution
Is this in a git repository?        → System-level execution
Does system specify a domain?       → Include domain context
Otherwise                           → Organization-level execution
```

### Tier Affiliation

Systems declare their organizational affiliation in their dream state:

```markdown
<!-- In {project}/.claude/DREAM-STATE.md -->
# System Dream State: {System Name}

**Organization:** my-org
**Domain:** infrastructure
```

This allows systems to live anywhere in the filesystem while maintaining hierarchy.

### State Schema

All loop state files include:

```json
{
  "context": {
    "tier": "system",
    "organization": "my-org",
    "domain": "infrastructure",
    "system": "my-project",
    "module": null,
    "grounding_complete": true,
    "grounding_at": "2026-01-29T10:30:00Z"
  }
}
```

### Dream State File Discovery

```
Organization: ~/workspaces/{context.organization}/.claude/DREAM-STATE.md
Domain:       ~/workspaces/{context.organization}/.claude/domains/{context.domain}/DREAM-STATE.md
System:       {project}/.claude/DREAM-STATE.md
Module:       {project}/src/{context.module}/DREAM-STATE.md
```

### Fallback Behavior

If a tier's dream state doesn't exist:
- **Organization missing:** Log warning, continue without org context
- **Domain missing:** Skip domain context (many systems may not have domains yet)
- **System missing:** Create from template on first loop completion
- **Module missing:** Use inline completion criteria from code comments
