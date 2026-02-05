---
name: triage
description: "Prioritize and re-prioritize work in the system queue based on changing conditions. Uses prioritization frameworks to order work by value, urgency, and dependencies. Responds to triggers like new requirements, blockers, and resource changes."
phase: INIT
category: engineering
version: "1.0.0"
depends_on: []
tags: [planning, prioritization, queue, triage]
---

# Triage

Decide what to work on next.

## When to Use

- **Initial prioritization** — Order newly created queue
- **New system discovered** — Insert into existing queue
- **Blocker identified** — Re-prioritize around obstacle
- **Blocker resolved** — Unlock waiting work
- **Scope change** — Requirements shift
- **Resource change** — Team capacity changes
- **Deadline change** — Timeline pressure
- **Strategic shift** — Business priorities change

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `prioritization-frameworks.md` | Methods for ordering work |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `triage-triggers.md` | When identifying what triggered re-triage |

**Verification:** Ensure system-queue.json is updated with clear priority rationale.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated `system-queue.json` | `domain-memory/{domain}/` | Always |
| Priority annotations | In queue or separate doc | When reordering |

## Core Concept

Triage answers: **"What should we work on next, and in what order?"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TRIAGE                                            │
│                                                                             │
│  INPUTS                                 OUTPUTS                             │
│  ──────                                 ───────                             │
│  System Queue    ─────────────────────▶ Reordered Queue                     │
│  New Information ─────────────────────▶ Priority Rationale                  │
│  Constraints     ─────────────────────▶ Impact Assessment                   │
│  Dependencies    ─────────────────────▶ Blocked Items Identified            │
│                                                                             │
│  Triage is continuous — priorities evolve as conditions change              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Triage Triggers

| Trigger | Response |
|---------|----------|
| **New system discovered** | Score and insert into queue |
| **Blocker identified** | Mark blocked, adjust dependents |
| **Blocker resolved** | Unblock and re-prioritize |
| **Scope change** | Re-estimate, re-score |
| **Deadline moved** | Adjust urgency scores |
| **Resource change** | Adjust capacity assumptions |
| **Dependency completed** | Unlock waiting items |
| **Strategic direction change** | Re-score value alignment |

## The Triage Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TRIAGE PROCESS                                          │
│                                                                             │
│  1. IDENTIFY TRIGGER                                                        │
│     └─→ What changed?                                                       │
│     └─→ What's affected?                                                    │
│                                                                             │
│  2. GATHER CONTEXT                                                          │
│     └─→ Current queue state                                                 │
│     └─→ Dependencies                                                        │
│     └─→ Constraints (time, resources)                                       │
│                                                                             │
│  3. APPLY FRAMEWORK                                                         │
│     └─→ Choose appropriate prioritization method                            │
│     └─→ Score affected items                                                │
│     └─→ Consider dependencies                                               │
│                                                                             │
│  4. REORDER QUEUE                                                           │
│     └─→ Update priorities                                                   │
│     └─→ Mark blocked items                                                  │
│     └─→ Identify newly ready items                                          │
│                                                                             │
│  5. DOCUMENT & COMMUNICATE                                                  │
│     └─→ Record rationale                                                    │
│     └─→ Note what changed                                                   │
│     └─→ Inform stakeholders                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Prioritization Frameworks

### 1. Dependency-First

**Use when:** Building a new domain with interdependent systems.

Order by dependency depth — foundations before dependents:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY-FIRST                                          │
│                                                                             │
│  Priority 1: No dependencies (foundations)                                  │
│  ┌────────────┐  ┌────────────┐                                            │
│  │   Auth     │  │   Config   │                                            │
│  └─────┬──────┘  └─────┬──────┘                                            │
│        │               │                                                    │
│  Priority 2: Depend only on P1                                              │
│        ▼               ▼                                                    │
│  ┌────────────┐  ┌────────────┐                                            │
│  │   Users    │  │   Orders   │                                            │
│  └─────┬──────┘  └─────┬──────┘                                            │
│        │               │                                                    │
│  Priority 3: Depend on P1 or P2                                             │
│        └───────┬───────┘                                                    │
│                ▼                                                            │
│         ┌────────────┐                                                      │
│         │ Analytics  │                                                      │
│         └────────────┘                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Algorithm:**
1. Build dependency graph
2. Topological sort
3. Same-level items ordered by value

### 2. Value/Effort (WSJF)

**Use when:** Maximizing value delivery with limited capacity.

**Weighted Shortest Job First:**
```
Priority Score = (Business Value + Time Criticality + Risk Reduction) / Effort
```

| Factor | Scale | Description |
|--------|-------|-------------|
| Business Value | 1-10 | Revenue, cost savings, strategic |
| Time Criticality | 1-10 | Urgency, deadline pressure |
| Risk Reduction | 1-10 | Removes uncertainty, enables learning |
| Effort | 1-10 | T-shirt size converted to number |

**Example:**

| System | Value | Time | Risk | Effort | Score | Rank |
|--------|-------|------|------|--------|-------|------|
| Payment integration | 9 | 8 | 6 | 8 | 2.9 | 2 |
| Mobile app | 8 | 5 | 4 | 10 | 1.7 | 4 |
| Reporting | 6 | 3 | 2 | 3 | 3.7 | 1 |
| Admin panel | 5 | 4 | 3 | 5 | 2.4 | 3 |

### 3. MoSCoW

**Use when:** Fixed deadline, need to define MVP.

| Category | Meaning | Action |
|----------|---------|--------|
| **Must** | Critical for success | Do first, non-negotiable |
| **Should** | Important but not critical | Do if time permits |
| **Could** | Nice to have | Only if ahead of schedule |
| **Won't** | Explicitly out of scope | Document as deferred |

**Example:**

```markdown
## Release 1.0 Scope

### Must Have
- User authentication
- Work order CRUD
- Basic assignment

### Should Have
- Notifications
- Status history
- Basic reporting

### Could Have
- Route optimization
- Offline mode
- Advanced filters

### Won't Have (This Release)
- Mobile app
- Analytics dashboard
- Third-party integrations
```

### 4. Eisenhower Matrix

**Use when:** Mixed bag of urgent vs important work.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EISENHOWER MATRIX                                         │
│                                                                             │
│                     URGENT                    NOT URGENT                    │
│              ┌─────────────────────┬─────────────────────┐                  │
│              │                     │                     │                  │
│   IMPORTANT  │     DO FIRST        │     SCHEDULE        │                  │
│              │                     │                     │                  │
│              │  • Critical bugs    │  • Architecture     │                  │
│              │  • Deadline items   │  • Tech debt        │                  │
│              │  • Blockers         │  • Documentation    │                  │
│              │                     │                     │                  │
│              ├─────────────────────┼─────────────────────┤                  │
│              │                     │                     │                  │
│ NOT          │     DELEGATE        │     ELIMINATE       │                  │
│ IMPORTANT    │                     │                     │                  │
│              │  • Nice-to-haves    │  • Low-value items  │                  │
│              │  • Quick wins       │  • Distractions     │                  │
│              │                     │                     │                  │
│              └─────────────────────┴─────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5. RICE Scoring

**Use when:** Need quantitative comparison of many items.

```
RICE Score = (Reach × Impact × Confidence) / Effort
```

| Factor | Scale | Description |
|--------|-------|-------------|
| **Reach** | # users/period | How many people will this affect? |
| **Impact** | 0.25, 0.5, 1, 2, 3 | How much will it affect each person? |
| **Confidence** | 0-100% | How sure are we of estimates? |
| **Effort** | Person-months | How much work? |

**Impact Scale:**
- 3 = Massive (game-changer)
- 2 = High (significant improvement)
- 1 = Medium (noticeable)
- 0.5 = Low (minor)
- 0.25 = Minimal

**Example:**

| System | Reach | Impact | Confidence | Effort | Score |
|--------|-------|--------|------------|--------|-------|
| Mobile app | 5000 | 2 | 80% | 4 | 2000 |
| Admin panel | 50 | 1 | 90% | 1 | 45 |
| API v2 | 1000 | 1 | 70% | 2 | 350 |

→ See `references/prioritization-frameworks.md`

## Handling Blockers

### Blocker Identified

When a system becomes blocked:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BLOCKER RESPONSE                                          │
│                                                                             │
│  1. MARK BLOCKED                                                            │
│     └─→ Update status: "blocked"                                            │
│     └─→ Record blockedReason                                                │
│     └─→ Note expected resolution                                            │
│                                                                             │
│  2. ASSESS IMPACT                                                           │
│     └─→ What depends on this?                                               │
│     └─→ Are those items also effectively blocked?                           │
│                                                                             │
│  3. FIND ALTERNATIVES                                                       │
│     └─→ Can we work on something else?                                      │
│     └─→ Can we work around the blocker?                                     │
│     └─→ Can we parallelize unblocked work?                                  │
│                                                                             │
│  4. ESCALATE IF NEEDED                                                      │
│     └─→ Is this blocking critical path?                                     │
│     └─→ Who can unblock?                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Blocker Resolved

When a blocker is removed:

1. Update status: "blocked" → "ready"
2. Clear blockedReason
3. Re-evaluate priority (may have shifted)
4. Check if this unblocks other items
5. Update queue order

### Common Blockers

| Blocker Type | Response |
|--------------|----------|
| Technical dependency | Work on other items or spike solutions |
| External team | Escalate, find workarounds |
| Information needed | Ask questions, make assumptions (document) |
| Resource unavailable | Reschedule, find alternatives |
| Approval pending | Escalate, work on non-blocked items |

## Priority Factors

Factors to consider when scoring:

| Factor | Questions |
|--------|-----------|
| **Business Value** | How much revenue/savings? Strategic alignment? |
| **User Impact** | How many users? How much does it help them? |
| **Urgency** | Hard deadline? Market window? Competitive pressure? |
| **Dependencies** | What does this unblock? What blocks it? |
| **Risk** | Does early work reduce uncertainty? |
| **Effort** | How much work? Do we have capacity? |
| **Technical Foundation** | Does this enable future work? |
| **Learning** | Will this teach us something valuable? |

## Queue Reordering

### Before/After Template

```markdown
## Queue Reorder: [Date]

### Trigger
[What caused this reorder]

### Before
| Priority | System | Status |
|----------|--------|--------|
| 1 | Auth Service | complete |
| 2 | Work Orders | in-progress |
| 3 | Route Optimization | specified |
| 4 | Mobile App | specified |

### After
| Priority | System | Status | Change |
|----------|--------|--------|--------|
| 1 | Auth Service | complete | — |
| 2 | Work Orders | in-progress | — |
| 3 | Mobile App | specified | ↑ from 4 |
| 4 | Route Optimization | blocked | ↓ + blocked |

### Rationale
- Route Optimization blocked waiting for mapping API access
- Mobile App has no blockers and stakeholder requested acceleration

### Impact
- Mobile App accelerated by ~2 weeks
- Route Optimization delayed until blocker resolved (ETA: 1 week)
```

## Integration with Queue

### Updating system-queue.json

```javascript
// Priority update
system.priority = newPriority;

// Blocking
system.status = "blocked";
system.blockedReason = "Waiting for DBA approval on schema";

// Unblocking
system.status = "ready";  // or previous status
delete system.blockedReason;

// Always update timestamp
queue.updatedAt = new Date().toISOString();
```

### Finding Next Ready System

```javascript
function getNextReady(queue) {
  return queue.systems
    .filter(s => s.status === "ready" || s.status === "specified")
    .filter(s => allDependenciesMet(s, queue))
    .sort((a, b) => a.priority - b.priority)[0];
}

function allDependenciesMet(system, queue) {
  return system.dependencies.every(depId => {
    const dep = queue.systems.find(s => s.id === depId);
    return dep && dep.status === "complete";
  });
}
```

→ See `references/queue-operations.md`

## Triage Meeting Template

For regular triage sessions:

```markdown
## Triage Session: [Date]

### Attendees
- [Names]

### Queue Status
- Total systems: X
- Complete: X
- In Progress: X
- Ready: X
- Blocked: X

### Review Blockers
| System | Blocker | Owner | ETA |
|--------|---------|-------|-----|
| [System] | [Blocker] | [Who] | [When] |

### New Items to Prioritize
| System | Proposed Priority | Discussion |
|--------|-------------------|------------|
| [System] | [Priority] | [Notes] |

### Priority Changes
| System | Old | New | Reason |
|--------|-----|-----|--------|
| [System] | X | Y | [Why] |

### Decisions
- [Decision 1]
- [Decision 2]

### Action Items
- [ ] [Action] — [Owner]
- [ ] [Action] — [Owner]

### Next Triage
[Date/Time]
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `entry-portal` | Creates items that triage prioritizes |
| `estimation` | Provides effort estimates for scoring |
| `loop-controller` | Uses triage output to select next system |
| `memory-manager` | Triage decisions recorded in domain memory |

## Key Principles

**Dependencies first.** Can't build on missing foundations.

**Value over effort.** Prioritize impact, not ease.

**Revisit regularly.** Priorities change; triage is ongoing.

**Document rationale.** Future you will wonder "why?".

**Communicate changes.** Stakeholders need to know.

**Avoid thrashing.** Don't reprioritize constantly; batch changes.

## Mode-Specific Behavior

Triage behavior differs by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full systems in queue |
| **Approach** | Dependency-first prioritization |
| **Patterns** | Free choice—establish build order |
| **Deliverables** | Prioritized system queue |
| **Validation** | Dependencies ordered correctly |
| **Constraints** | Minimal—parallelize where possible |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gaps by category |
| **Approach** | Value/effort quick-win prioritization |
| **Patterns** | Should group by existing categories |
| **Deliverables** | Prioritized gap queue |
| **Validation** | High-impact gaps first |
| **Constraints** | Deploy gaps often unblock others |

**Polish considerations:**
- Group by category (deploy, UI, data, test)
- Score each gap: Impact × Ease / Effort
- Deploy gaps often first (unblocks everything)
- Batch related changes together

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change steps within request |
| **Approach** | Risk-minimization prioritization |
| **Patterns** | Must conform to release windows |
| **Deliverables** | Risk-ordered change plan |
| **Validation** | Blast radius minimized |
| **Constraints** | Requires approval at each step |

**Enterprise constraints:**
- Minimize blast radius of each step
- Prefer reversible changes first
- Prioritize high-test-coverage areas
- Align with release windows and approvals

### Mode-Aware Triage

```javascript
function triageItems(items, mode) {
  switch (mode) {
    case 'greenfield':
      return topologicalSort(items)
        .thenBy(wsjfScore);

    case 'brownfield-polish':
      return sortByCategory(items)
        .map(category => sortByQuickWins(category));

    case 'brownfield-enterprise':
      return sortByRisk(items, { ascending: true })
        .filterByApprovalStatus();
  }
}
```

---

## References

- `references/prioritization-frameworks.md`: Detailed framework guidance
- `references/triage-triggers.md`: Common triggers and responses
- `references/priority-scoring.md`: Scoring worksheets
- `references/queue-reorder-template.md`: Change documentation
