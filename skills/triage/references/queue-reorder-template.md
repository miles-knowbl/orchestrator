# Queue Reorder Template

Standardized templates for documenting and communicating priority changes to the system queue.

## Purpose

This reference provides:
- Templates for documenting queue reorders
- Communication patterns for stakeholders
- Change tracking best practices
- Rollback and audit trail guidance

Use these templates whenever the queue priority order changes to maintain clear records and ensure stakeholder alignment.

---

## When to Document Queue Changes

Always document when:
- Priority order changes for any item
- Items are added to or removed from the queue
- Items are blocked or unblocked
- Dependencies change
- Scope significantly changes

Documentation ensures:
- Stakeholders understand changes
- Decisions are traceable
- Future you understands past reasoning
- Patterns emerge for improvement

---

## Quick Reorder Template

For minor adjustments (1-2 items moved):

```markdown
## Queue Adjustment: YYYY-MM-DD

**Trigger:** [Brief description of what prompted the change]

**Change:**
- [Item X] moved from priority [N] to priority [M]
- Reason: [Why this change makes sense]

**Impact:**
- [What this affects]
- [Any deadlines or dependencies impacted]

**Approved by:** [Name/Role]
```

### Quick Reorder Example

```markdown
## Queue Adjustment: 2025-01-20

**Trigger:** Route Optimization blocked waiting for mapping API credentials

**Change:**
- Route Optimization moved from priority 3 to priority 5 (blocked)
- Mobile App moved from priority 4 to priority 3
- Reason: Cannot proceed with Route Optimization until blocker resolved (ETA: 1 week)

**Impact:**
- Mobile App development accelerates by ~1 week
- Route Optimization delayed until API access granted
- No dependency impacts (Mobile App doesn't depend on Routes)

**Approved by:** Tech Lead
```

---

## Full Reorder Template

For significant prioritization changes:

```markdown
# Queue Reorder: [Domain Name]

**Date:** YYYY-MM-DD
**Trigger:** [What prompted this reorder]
**Decision Maker:** [Name/Role]

---

## Context

[2-3 sentences explaining the situation that led to this reorder]

---

## Before State

| Priority | System | Status | Notes |
|----------|--------|--------|-------|
| 1 | [System A] | complete | |
| 2 | [System B] | in-progress | |
| 3 | [System C] | ready | |
| 4 | [System D] | specified | |
| 5 | [System E] | discovered | |

---

## After State

| Priority | System | Status | Change | Reason |
|----------|--------|--------|--------|--------|
| 1 | [System A] | complete | — | |
| 2 | [System B] | in-progress | — | |
| 3 | [System D] | specified | +1 | [reason] |
| 4 | [System C] | blocked | -1, blocked | [reason] |
| 5 | [System E] | discovered | — | |

---

## Changes Summary

### Items Moved Up
- **[System D]:** [Why it moved up]

### Items Moved Down
- **[System C]:** [Why it moved down]

### Items Blocked
- **[System C]:** [What's blocking it, expected resolution]

### Items Unblocked
- [None / List if applicable]

### Items Added
- [None / List if applicable]

### Items Removed
- [None / List if applicable]

---

## Impact Assessment

### Timeline Impact
- [How this affects delivery dates]

### Resource Impact
- [How this affects team allocation]

### Dependency Impact
- [Any dependent systems affected]

### Risk Impact
- [New risks introduced or mitigated]

---

## Stakeholder Communication

### Who Needs to Know
| Stakeholder | Impact | Communication Method |
|-------------|--------|---------------------|
| [Name/Team] | [Impact] | [Email/Slack/Meeting] |

### Key Message
[The main point to communicate]

### FAQ Anticipated
- Q: [Expected question]
  A: [Answer]

---

## Rationale

### Framework Used
[WSJF/RICE/MoSCoW/Eisenhower/Dependency-First]

### Scoring (if applicable)
[Include relevant scoring worksheet or summary]

### Discussion Notes
[Key points from prioritization discussion]

### Alternatives Considered
- [Alternative 1]: [Why rejected]
- [Alternative 2]: [Why rejected]

---

## Follow-up Actions

- [ ] Update system-queue.json
- [ ] Notify stakeholders
- [ ] Update project tracking tools
- [ ] Schedule blocker resolution check-in
- [ ] [Other actions]

---

## Approval

- **Proposed by:** [Name]
- **Approved by:** [Name]
- **Approval date:** YYYY-MM-DD
```

---

## Blocker Documentation Template

When an item becomes blocked:

```markdown
# Blocker Report: [System Name]

**Date Blocked:** YYYY-MM-DD
**Reported By:** [Name]

---

## Blocker Details

**Type:** [Technical / External / Resource / Approval / Information]

**Description:**
[Detailed description of what's blocking progress]

**Impact:**
- This system: [Cannot proceed / Partially blocked]
- Dependent systems: [List any systems waiting on this one]

---

## Resolution Path

**Owner:** [Who is responsible for resolving]

**Actions Required:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Expected Resolution:** YYYY-MM-DD

**Escalation Path:**
- If not resolved by [date]: [Escalate to whom]

---

## Workarounds Considered

| Workaround | Feasible? | Why/Why Not |
|------------|-----------|-------------|
| [Option 1] | Yes/No | [Explanation] |
| [Option 2] | Yes/No | [Explanation] |

---

## Queue Adjustments

Due to this blocker:
- [System X] moved up to fill the gap
- [System Y] may also be blocked if not resolved by [date]

---

## Status Updates

| Date | Update | Next Check |
|------|--------|------------|
| YYYY-MM-DD | [Initial report] | YYYY-MM-DD |
| | | |

---

## Resolution Record

**Resolved:** YYYY-MM-DD
**Resolution:** [What fixed it]
**Lessons Learned:** [What to do differently next time]
```

---

## Unblock Documentation Template

When a blocker is resolved:

```markdown
# Blocker Resolved: [System Name]

**Date Resolved:** YYYY-MM-DD
**Originally Blocked:** YYYY-MM-DD
**Duration:** [X days]

---

## Resolution Details

**How Resolved:**
[Description of what fixed the blocker]

**Resolved By:** [Name]

---

## Queue Impact

### System Status Change
- **Before:** blocked
- **After:** ready

### Priority Reassessment
- Previous priority: [N]
- New priority: [M]
- Rationale: [Why this priority now]

### Unlocked Systems
| System | Was Waiting For | Now Status |
|--------|-----------------|------------|
| [System X] | This blocker | ready |

---

## Follow-up

- [ ] Update system-queue.json status
- [ ] Notify stakeholders
- [ ] Resume work on system
- [ ] Update dependent systems
```

---

## Scope Change Template

When scope significantly changes:

```markdown
# Scope Change: [System Name]

**Date:** YYYY-MM-DD
**Requested By:** [Name/Source]
**Approved By:** [Name]

---

## Change Description

### Original Scope
[What was originally planned]

### New Scope
[What's now planned]

### Delta
- **Added:** [New items]
- **Removed:** [Removed items]
- **Modified:** [Changed items]

---

## Impact Assessment

### Effort Change
- Original estimate: [X person-days]
- New estimate: [Y person-days]
- Delta: [+/- Z person-days]

### Timeline Change
- Original completion: YYYY-MM-DD
- New completion: YYYY-MM-DD
- Delta: [+/- N days]

### Priority Change
- Original priority: [N]
- New priority: [M]
- Rationale: [Why changed]

---

## Ripple Effects

### Affected Systems
| System | How Affected |
|--------|--------------|
| [System X] | [Description] |

### Resource Reallocation
[Any changes to team assignments]

---

## Approval Record

**Change Request:** [Link or reference]
**Justification:** [Why this change is needed]
**Trade-offs Accepted:** [What we're giving up]

---

## Updated Artifacts

- [ ] FEATURESPEC.md updated
- [ ] ESTIMATE.md updated
- [ ] system-queue.json updated
- [ ] GitHub issue updated
- [ ] Stakeholders notified
```

---

## Strategic Shift Template

When business priorities change:

```markdown
# Strategic Reprioritization: [Domain Name]

**Date:** YYYY-MM-DD
**Triggered By:** [Business event/decision]
**Decision Makers:** [Names/Roles]

---

## Context

### Previous Strategy
[What we were optimizing for]

### New Strategy
[What we're now optimizing for]

### Reason for Shift
[Why the change]

---

## Complete Queue Reorder

### Old Priority Order
| Rank | System | Rationale |
|------|--------|-----------|
| 1 | | |
| 2 | | |
| 3 | | |

### New Priority Order
| Rank | System | Change | Rationale |
|------|--------|--------|-----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## Major Changes

### Systems Accelerated
| System | From | To | Why |
|--------|------|-----|-----|
| | | | |

### Systems Deferred
| System | From | To | Why |
|--------|------|-----|-----|
| | | | |

### Systems Cancelled
| System | Why Cancelled | Sunk Cost |
|--------|---------------|-----------|
| | | |

---

## Resource Reallocation

### Team Changes
| Resource | Previous Assignment | New Assignment |
|----------|--------------------| ---------------|
| | | |

### Timeline Changes
| Milestone | Previous Date | New Date |
|-----------|---------------|----------|
| | | |

---

## Stakeholder Communication Plan

### Announcement
- **Medium:** [All-hands / Email / Slack]
- **Date:** YYYY-MM-DD
- **Messaging:** [Key points]

### Individual Follow-ups
| Stakeholder | Specific Message | Owner |
|-------------|------------------|-------|
| | | |

---

## Risk Assessment

### New Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| | | | |

### Risks Reduced
| Risk | How Reduced |
|------|-------------|
| | |

---

## Success Metrics

How we'll know if this reprioritization was correct:
- [ ] [Metric 1]: [Target]
- [ ] [Metric 2]: [Target]
- [ ] [Metric 3]: [Target]

Review Date: YYYY-MM-DD
```

---

## Communication Patterns

### Email Template for Queue Changes

```
Subject: [Domain] Queue Update: [Brief Description]

Hi [Stakeholder],

Quick update on [Domain] priorities:

**What Changed:**
[1-2 sentence summary]

**Why:**
[Brief rationale]

**Impact on You:**
[Specific impact to this stakeholder]

**New Timeline:**
[Any date changes]

**Questions?**
Let me know if you have concerns or need clarification.

Best,
[Name]
```

### Slack Template for Queue Changes

```
:rotating_light: *Queue Update: [Domain]*

*Change:* [Brief description]
*Reason:* [Brief rationale]
*Impact:* [Who/what is affected]

Full details: [Link to documentation]

Questions? Thread here :point_down:
```

### Meeting Agenda for Major Reorder

```markdown
## Queue Reprioritization Meeting

**Duration:** 30-60 minutes
**Attendees:** [List]

### Agenda

1. **Context** (5 min)
   - What triggered this discussion
   - Current queue state

2. **Proposed Changes** (10 min)
   - Walk through changes
   - Rationale for each

3. **Impact Discussion** (15 min)
   - Timeline impacts
   - Resource impacts
   - Stakeholder impacts

4. **Q&A** (10 min)
   - Address concerns
   - Gather feedback

5. **Decision** (5 min)
   - Confirm or adjust
   - Assign action items

6. **Communication Plan** (5 min)
   - Who tells whom
   - By when
```

---

## Audit Trail Best Practices

### Version Control

Store queue reorder documents in version control:
```
domain-memory/
  {domain}/
    system-queue.json          # Current state
    queue-history/
      2025-01-15-initial.md    # Initial prioritization
      2025-01-18-blocker.md    # Blocker adjustment
      2025-01-20-strategic.md  # Strategic shift
```

### Change Log Format

Append to `queue-history/CHANGELOG.md`:
```markdown
# Queue Change Log

## 2025-01-20
- **Type:** Strategic Shift
- **Changes:** [Summary]
- **Document:** `2025-01-20-strategic.md`

## 2025-01-18
- **Type:** Blocker
- **Changes:** [Summary]
- **Document:** `2025-01-18-blocker.md`

## 2025-01-15
- **Type:** Initial
- **Changes:** [Summary]
- **Document:** `2025-01-15-initial.md`
```

### JSON Diff Recording

When updating `system-queue.json`, record the diff:

```json
{
  "changeRecord": {
    "timestamp": "2025-01-20T10:30:00Z",
    "type": "reorder",
    "trigger": "Blocker resolved",
    "changes": [
      {
        "systemId": "sys-003",
        "field": "status",
        "from": "blocked",
        "to": "ready"
      },
      {
        "systemId": "sys-003",
        "field": "priority",
        "from": 5,
        "to": 3
      }
    ],
    "documentRef": "queue-history/2025-01-20-unblock.md"
  }
}
```

---

## Rollback Procedures

If a reorder decision needs to be reversed:

```markdown
# Queue Rollback: [Domain]

**Date:** YYYY-MM-DD
**Original Change:** [Reference to original change]
**Reason for Rollback:** [Why we're reverting]

---

## Rollback Actions

1. Restore queue to state as of [date/document]
2. Notify stakeholders of reversal
3. Document lessons learned

---

## Restored State

| Priority | System | Status |
|----------|--------|--------|
| | | |

---

## Lessons Learned

- What led to the original decision
- Why it didn't work
- What to do differently next time
```

---

## Checklist: After Every Reorder

- [ ] `system-queue.json` updated with new priorities
- [ ] Change document created in `queue-history/`
- [ ] CHANGELOG.md updated
- [ ] Stakeholders notified (email/Slack)
- [ ] Project tracking tools updated (Jira, Linear, etc.)
- [ ] GitHub issues updated if applicable
- [ ] Team informed in standup/sync
- [ ] Calendar updated with new milestones

---

## See Also

- `prioritization-frameworks.md` - Methods for deciding priority
- `priority-scoring.md` - Scoring worksheets
- `triage-triggers.md` - What triggers reprioritization
- `../entry-portal/references/queue-operations.md` - Queue data structure operations
