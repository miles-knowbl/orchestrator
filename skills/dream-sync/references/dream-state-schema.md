# Dream State Schema

Expected structure of DREAM-STATE.md files.

## Required Sections

### Header

```markdown
# System Dream State: {name}

> {brief description}

**Organization:** {org name}
**Location:** {path}
**Roadmap:** [ROADMAP.md](../ROADMAP.md) — {summary}
```

### Vision

```markdown
## Vision

{Paragraph describing the vision}

**Dream State:** {One-line summary of "done"}
```

### Modules Table

```markdown
## Modules

| Module | Path | Status | Functions | Progress |
|--------|------|--------|-----------|----------|
| {name} | {path} | {complete|in-progress|blocked} | {n}/{m} | {%} |
```

### Completion Algebra

```markdown
## Completion Algebra

\`\`\`
System.done = ALL(Module.done)
            = module1.done AND module2.done AND ...

Current: {n}/{m} modules complete ({%}%)
Pending: {list or "None"}
Status: {summary}
\`\`\`
```

## Parsing Rules

### Status Values

| Value | Meaning |
|-------|---------|
| `complete` | All functions implemented and verified |
| `in-progress` | Work started but not complete |
| `blocked` | Cannot proceed due to dependency |
| `planned` | Scoped but not started |

### Progress Calculation

```
progress = complete_modules / total_modules * 100
```

### Module Dependencies

Extracted from completion algebra or explicit depends_on fields.

## Example Minimal Dream State

```markdown
# System Dream State: my-app

**Organization:** my-org
**Location:** ~/workspaces/my-app

## Vision

A simple app that does X.

**Dream State:** Deployed and operational.

## Modules

| Module | Status | Progress |
|--------|--------|----------|
| core | complete | 100% |
| api | in-progress | 50% |

## Completion Algebra

System.done = core.done AND api.done

Current: 1/2 complete (50%)
```
