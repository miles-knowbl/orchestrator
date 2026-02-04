---
name: knowledge-integrator
description: "Integrate cultivated knowledge into the project. Updates CLAUDE.md with key insights, links to detailed documentation, and ensures knowledge is discoverable and actionable."
phase: COMPLETE
category: meta
version: "1.0.0"
depends_on: ["context-cultivation"]
tags: [integration, knowledge-management, documentation, claude-md]
---

# Knowledge Integrator

Make cultivated knowledge actionable.

## When to Use

- **End of cultivation loop** - Insights ready for integration
- **CLAUDE.md needs updating** - New patterns, gotchas, or guarantees
- **Knowledge scattered** - Need to consolidate references
- **Onboarding improvement** - Make project more accessible

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated `CLAUDE.md` | Project root | Always |
| `KNOWLEDGE-INDEX.md` | Project root | When 3+ knowledge docs exist |

## Integration Points

### CLAUDE.md Updates

Add sections for:
- **Key Gotchas** - Top 5 things that trip people up
- **Critical Guarantees** - Must-know system promises
- **Common Patterns** - Recurring solutions in this codebase
- **Context Links** - Pointers to detailed docs

### Knowledge Index

Create a discoverable index:
```markdown
# Knowledge Index

## Quick Reference
- [GOTCHAS.md](./GOTCHAS.md) - Things that trip people up
- [GUARANTEES.md](./GUARANTEES.md) - System promises
- [PATTERNS.md](./PATTERNS.md) - Recurring solutions

## By Topic
- Authentication: GOTCHAS.md#auth, GUARANTEES.md#tokens
- Data Model: PATTERNS.md#models, GUARANTEES.md#data
- API: GOTCHAS.md#api, GUARANTEES.md#api

## Recent Updates
- [Date]: Added gotcha about X
- [Date]: Documented guarantee Y
```

## Integration Checklist

- [ ] CLAUDE.md has "Key Gotchas" section
- [ ] CLAUDE.md has "Critical Guarantees" section
- [ ] CLAUDE.md links to detailed docs
- [ ] Knowledge docs are cross-referenced
- [ ] Index exists if 3+ knowledge docs
- [ ] Recent updates section maintained

## Quality Criteria

Good integration:
- Knowledge is discoverable from CLAUDE.md
- Links are valid and maintained
- Most important items surfaced first
- Cross-references aid navigation
- Updates are dated for freshness
