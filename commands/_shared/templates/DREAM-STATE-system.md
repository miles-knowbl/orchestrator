# System Dream State: {System Name}

> This document defines "done" for this system. All modules roll up here.

## Vision

{What does "done" look like for this system? What problem does it solve when complete?}

---

## Modules

| Module | Path | Status | Functions | Progress |
|--------|------|--------|-----------|----------|
| {name} | {src/path} | pending/in-progress/complete | {done}/{total} | {N}% |

---

## Module Checklists

### {Module 1 Name} ({status})

**Purpose:** {What this module does}

**Required Functions:**
- [ ] {function_name} — {description}
- [x] {completed_function} — {description}

**Completion Criteria:** {What must be true for this module to be done}

---

### {Module 2 Name} ({status})

**Purpose:** {What this module does}

**Required Functions:**
- [ ] {function_name} — {description}

**Completion Criteria:** {What must be true}

---

## Completion Algebra

```
System.done = ALL(Module.done)
            = {module1}.done AND {module2}.done AND ...

Current: {done_count}/{total_count} modules complete ({percentage}%)
```

---

## Active Loops

| Loop | Phase | Module | Started | Last Update |
|------|-------|--------|---------|-------------|
| {loop} | {phase} | {module or "system-wide"} | {date} | {date} |

---

## Recent Completions

> Last 5 completed loop runs for this system.

| Date | Loop | Module | Outcome | Deliverables |
|------|------|--------|---------|--------------|
| {date} | {loop} | {module} | success | {deliverables} |

---

## Dependencies

**Depends on:** {other systems this system depends on}

**Depended on by:** {systems that depend on this one}

---

## Notes

{System-specific notes, architectural decisions, known issues}
