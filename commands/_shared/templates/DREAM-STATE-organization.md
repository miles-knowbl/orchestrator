# Organization Dream State

> This document defines "done" at the organization level. All domains and systems roll up here.

## Vision

{Describe the high-level organizational goals. What does success look like across all your domains and systems?}

---

## Domains

| Domain | Purpose | Systems | Progress | Status |
|--------|---------|---------|----------|--------|
| {name} | {what capability it provides} | {count} | {N}% | active/paused/complete |

---

## Domain Checklists

### {Domain 1 Name} ({status})

**Purpose:** {What this domain provides to the organization}

**Systems:**
- [ ] {system_name} — {brief description}
- [x] {completed_system} — {brief description}

---

### {Domain 2 Name} ({status})

**Purpose:** {What this domain provides}

**Systems:**
- [ ] {system_name} — {brief description}

---

## Completion Algebra

```
Organization.done = ALL(Domain.done)
                  = {domain1}.done AND {domain2}.done AND ...

Domain.done = ALL(System.done)
System.done = ALL(Module.done)
Module.done = ALL(Function.operational)

Current: {done_domains}/{total_domains} domains complete ({percentage}%)
```

---

## Active Systems (Cross-Domain View)

| System | Domain | Repository | Status | Progress | Last Activity |
|--------|--------|------------|--------|----------|---------------|
| {name} | {domain} | {repo-path} | active/paused/complete | {N}% | {date} |

---

## Master Checklist

> Aggregated from all domain/system checklists. Updated automatically on loop completion.

### {Domain 1 Name}

#### {System 1 Name}
- [ ] {checklist item from system dream state}
- [x] {completed item}

#### {System 2 Name}
- [ ] {checklist item}

---

## Recent Completions

> Last 10 completed loop runs across all systems.

| Date | System | Loop | Outcome | Summary |
|------|--------|------|---------|---------|
| {date} | {system} | {loop} | success | {brief summary} |

---

## Patterns & Learnings

> Organization-wide patterns extracted from loop executions.

### Patterns
- {pattern-name}: {description}

### Calibration Adjustments
- {adjustment}: {description}

---

## Notes

{Any organization-level notes, priorities, or context}
