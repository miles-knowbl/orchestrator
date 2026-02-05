---
name: guarantee-tracker
description: "Track and document project guarantees - the contracts, invariants, and promises that the codebase maintains. Captures what must always be true, what can never happen, and the boundaries of acceptable behavior."
phase: DOCUMENT
category: operations
version: "1.0.0"
depends_on: ["context-cultivation"]
tags: [documentation, contracts, invariants, guarantees, quality]
---

# Guarantee Tracker

Document what the system promises.

## When to Use

- **After context cultivation** - Insights reveal implicit guarantees
- **API design** - Document what callers can rely on
- **Architecture decisions** - Capture system invariants
- **Bug fix** - Root cause was a violated guarantee
- **Code review** - Reviewer asks "is this always true?"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `GUARANTEES.md` | Project root | Always |

## Guarantee Types

### Behavioral Guarantees
- "This function never throws"
- "This operation is idempotent"
- "This call is thread-safe"
- "Results are always sorted"

### Data Guarantees
- "This field is never null"
- "IDs are globally unique"
- "Timestamps are always UTC"
- "Amounts are always positive"

### Performance Guarantees
- "Response time < 100ms for p99"
- "Memory usage bounded by X"
- "Batch size never exceeds Y"

### Security Guarantees
- "User data is always encrypted at rest"
- "Tokens expire within 24 hours"
- "PII is never logged"

### Lifecycle Guarantees
- "Resources are always cleaned up"
- "Connections are pooled and reused"
- "Retry with exponential backoff"

## Template

```markdown
## [Type]: [Guarantee Name]

**Guarantee:** [What is always/never true]

**Scope:** [Where this applies]

**Rationale:** [Why this guarantee exists]

**Enforcement:**
- [ ] Compile-time (types, lint rules)
- [ ] Runtime (assertions, validation)
- [ ] Testing (unit, integration, property)
- [ ] Review (checklist, automated)

**Violations:** [What happens if violated, how to detect]

**Related:** [Links to code, tests, docs]
```

## Quality Criteria

A good guarantee entry:
- Is precise and testable
- Specifies scope clearly
- Explains enforcement mechanism
- Documents what happens on violation
- Links to relevant code/tests
