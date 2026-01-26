# Triage Triggers

Common triggers for priority reassessment and how to respond.

## Trigger Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRIAGE TRIGGERS                                           │
│                                                                             │
│  SCOPE CHANGES          BLOCKERS              RESOURCES                     │
│  ─────────────          ────────              ─────────                     │
│  New requirement        Technical block       Team change                   │
│  Scope reduction        External dependency   Budget change                 │
│  Clarification          Approval needed       Capacity shift                │
│                                                                             │
│  TIMELINE              STRATEGIC              LEARNING                      │
│  ────────              ─────────              ────────                      │
│  Deadline moved        Priority shift         Risk discovered               │
│  Release date          Market change          Opportunity found             │
│  External event        Competitor action      Spike completed               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Scope Change Triggers

### New Requirement Discovered

**Trigger:** Stakeholder requests new feature or system.

**Response:**
1. Create FeatureSpec (or placeholder)
2. Estimate effort
3. Score against prioritization framework
4. Insert into queue at appropriate position
5. Communicate impact on timeline

**Template:**
```markdown
## New Requirement: [Name]

**Requested by:** [Stakeholder]
**Date:** [Date]

**Description:** [What was requested]

**Preliminary Assessment:**
- Complexity: [S/M/L/XL]
- Effort: [X hours]
- Dependencies: [List]
- Proposed Priority: [N] (because [rationale])

**Impact:**
- [System X] moves from priority Y to Z
- Timeline impact: +[N] days/weeks

**Decision needed:** Accept and reprioritize? / Defer to next phase?
```

### Scope Reduction

**Trigger:** Stakeholder agrees to descope or defer items.

**Response:**
1. Update affected items to status "deferred" or remove
2. Recalculate remaining effort
3. Potentially accelerate other items
4. Document what was descoped and why

### Scope Clarification

**Trigger:** Ambiguous requirement becomes clear.

**Response:**
1. Update FeatureSpec with clarified details
2. Re-estimate if scope changed significantly
3. Re-prioritize if effort changed dramatically
4. Note what was clarified for future reference

---

## Blocker Triggers

### Technical Blocker

**Trigger:** Technical obstacle prevents progress.

**Response:**
```
1. IMMEDIATE
   - Mark system as "blocked"
   - Record blockedReason
   - Stop work on blocked item

2. ASSESS
   - Can we work around it?
   - How long to resolve?
   - What else is blocked (transitive)?

3. ADAPT
   - Switch to non-blocked work
   - Assign someone to resolve blocker
   - Update queue order

4. RESOLVE
   - Once unblocked, update status
   - Re-prioritize if needed
```

**Common Technical Blockers:**
| Blocker | Typical Resolution |
|---------|-------------------|
| Missing API | Build mock, negotiate with team |
| Infrastructure not ready | Parallel work, escalate |
| Performance issue | Spike to investigate |
| Design decision needed | Convene decision meeting |

### External Dependency

**Trigger:** Waiting on external team, vendor, or system.

**Response:**
1. Document the dependency clearly
2. Set expected resolution date
3. Identify owner/contact
4. Work on unblocked items
5. Follow up proactively

**Tracking:**
```markdown
## External Dependencies

| System | Dependency | Owner | Status | ETA | Last Contact |
|--------|------------|-------|--------|-----|--------------|
| [System] | [What] | [Who] | [Status] | [Date] | [Date] |
```

### Approval Blocker

**Trigger:** Gate requires human approval.

**Response:**
1. Ensure approval request is submitted
2. Note approver and timeline expectation
3. Work on non-blocked items
4. Escalate if exceeding expected time

---

## Resource Triggers

### Team Change

**Trigger:** Team member joins, leaves, or becomes unavailable.

**Response:**

**Member Leaves:**
1. Assess in-progress work
2. Handoff or reassign
3. May need to reduce parallelism
4. Adjust timeline expectations

**Member Joins:**
1. Account for onboarding time (typically 2-4 weeks partial)
2. Don't immediately increase velocity estimates
3. Assign to lower-risk work initially

### Budget Change

**Trigger:** Budget increased or decreased.

**Response:**

**Increase:**
1. What could we accelerate?
2. What deferred items could we add?
3. Could we add resources?

**Decrease:**
1. What can we defer?
2. Apply MoSCoW — protect Musts
3. Communicate impact

### Capacity Shift

**Trigger:** Team capacity changes (holidays, other priorities).

**Response:**
1. Recalculate available hours
2. Adjust timeline
3. May need to defer lower-priority items
4. Communicate changes

---

## Timeline Triggers

### Deadline Moved

**Trigger:** Release date changes.

**Response:**

**Deadline Earlier:**
```
1. ASSESS
   - What was planned vs. what fits
   - Which Musts are at risk?

2. OPTIONS
   - Descope (move to Should/Could)
   - Add resources (if available)
   - Reduce quality (rarely advisable)
   - Negotiate deadline

3. DECIDE
   - Document what's in/out
   - Communicate to stakeholders
```

**Deadline Later:**
```
1. ASSESS
   - What deferred items could fit?
   - Should we add scope?

2. OPTIONS
   - Add Should items
   - Improve quality
   - Reduce risk with buffer

3. DECIDE
   - Resist scope creep
   - Document decision
```

### External Event

**Trigger:** Conference, regulatory deadline, competitor launch.

**Response:**
1. Assess relevance to our work
2. Does this change priorities?
3. Is there a hard deadline now?
4. Adjust urgency scores

---

## Strategic Triggers

### Business Priority Shift

**Trigger:** Company/org changes strategic direction.

**Response:**
1. Re-evaluate value scores
2. Some items may become critical
3. Some items may become irrelevant
4. Major reordering likely needed

### Market/Competitive Change

**Trigger:** Competitor launches feature, market shifts.

**Response:**
1. Does this change what we're building?
2. Does this change urgency?
3. Should we accelerate or pivot?
4. Stakeholder discussion needed

---

## Learning Triggers

### Risk Discovered

**Trigger:** Spike or research reveals problem.

**Response:**
```
1. ASSESS RISK
   - How bad is it?
   - What's affected?
   - Can we mitigate?

2. OPTIONS
   - Continue with mitigation
   - Pivot approach
   - Descope risky item
   - Seek help/expertise

3. ADJUST
   - May need to increase estimates
   - May need to add de-risking work
   - Update priority if risk outweighs value
```

### Opportunity Found

**Trigger:** Discovery that something is easier than expected.

**Response:**
1. Can we accelerate?
2. Can we add scope?
3. Are estimates too pessimistic elsewhere?
4. Reallocate effort if capacity freed

### Spike Completed

**Trigger:** Investigation reveals new information.

**Response:**
1. Update estimates with real data
2. Resolve uncertainties
3. May increase or decrease priority
4. Convert spike learnings to tasks

---

## Trigger Response Matrix

| Trigger | Urgency | Response Time | Scope of Impact |
|---------|---------|---------------|-----------------|
| Critical blocker | High | Immediate | Current work |
| New requirement | Medium | Same day | Queue order |
| Team member leaves | High | Immediate | Timeline |
| Deadline moved | High | Same day | Full queue |
| Budget change | Medium | This week | Scope |
| Strategic shift | High | Same day | Full queue |
| Spike completed | Low | This sprint | Estimates |

---

## Trigger Log Template

Keep a record of triggers and responses:

```markdown
## Triage Trigger Log

### [Date] — [Trigger Type]

**Trigger:** [What happened]

**Impact:** [What was affected]

**Response:** [What we did]

**Queue Changes:**
| System | Before | After | Reason |
|--------|--------|-------|--------|
| [System] | [State] | [State] | [Why] |

**Lessons:** [What we learned]

---
```
