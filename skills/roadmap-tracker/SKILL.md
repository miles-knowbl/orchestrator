---
name: roadmap-tracker
description: "Maintain and evolve project roadmaps based on execution history, learnings, and re-prioritization signals."
phase: COMPLETE
category: strategy
version: "1.0.0"
depends_on: ["retrospective"]
tags: [meta, planning, roadmap, milestones, prioritization]
---

# Roadmap Tracker

Maintain project roadmaps that evolve from execution learnings.

## When to Use

- **After loop completion** — Update roadmap with what was learned
- **Planning sessions** — Review and re-prioritize the roadmap
- **Milestone tracking** — Check progress against planned milestones
- When you say: "update roadmap", "what's next", "milestone status"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Roadmap file | `ROADMAP.md` or `memory/roadmap.json` | Always |

## Core Concept

Roadmap tracking answers: **"What's planned, what's done, and what should change based on what we learned?"**

```
Retrospective Insights → Roadmap Update → Re-prioritization → Next Loop Planning
```

Roadmaps are living documents that evolve with every loop iteration.

## Roadmap Structure

```markdown
# Project Roadmap

## Current Milestone: v1.0 Launch
- [x] Authentication system
- [x] Core API endpoints
- [ ] Admin dashboard
- [ ] Email notifications

## Next: v1.1 Polish
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Documentation site

## Backlog
- Rate limiting
- Webhook system
- Multi-tenancy
```

## Milestone Schema

```json
{
  "id": "v1.0",
  "title": "v1.0 Launch",
  "status": "in-progress",
  "items": [
    { "id": "auth", "title": "Authentication", "status": "done", "loopId": "exec-001" },
    { "id": "api", "title": "Core API", "status": "done", "loopId": "exec-002" },
    { "id": "admin", "title": "Admin dashboard", "status": "planned" }
  ],
  "confidence": 0.8,
  "updatedAt": "2026-01-26"
}
```

## Re-prioritization Triggers

| Trigger | Action |
|---------|--------|
| Retrospective reveals blocker | Move blocker to current milestone |
| Feature took longer than expected | Re-estimate remaining items |
| User feedback changes priorities | Reorder backlog |
| Technical discovery | Add new items or remove obsolete ones |
| Dependency change | Reorder based on new constraints |

## Checklist

- [ ] Roadmap exists and is current
- [ ] Completed items linked to execution IDs
- [ ] Next milestone clearly defined
- [ ] Backlog prioritized
- [ ] Confidence score reflects reality
- [ ] Updated after every loop completion

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `retrospective` | Retro insights trigger roadmap updates |
| `priority-matrix` | Prioritization feeds into roadmap ordering |
| `requirements` | Requirements flow from roadmap items |
| `estimation` | Estimates inform milestone confidence |

## Key Principles

**Living document.** Roadmaps change with every iteration — that's a feature, not a bug.

**Link to executions.** Every completed item should reference the loop that delivered it.

**Confidence over dates.** Express milestone likelihood, not fixed deadlines.

**Backlog is a queue.** Items move forward based on priority, not wishful planning.
