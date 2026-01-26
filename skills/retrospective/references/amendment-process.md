# Amendment Process

How retrospective insights become skill improvements.

---

## Purpose

The amendment process ensures that lessons learned from retrospectives systematically improve the skills library. Without a formal process, insights remain isolated observations instead of becoming institutional knowledge.

**When to Use This Guide:**
- After completing a retrospective that identified skill gaps
- When a skill consistently produces suboptimal results
- When new patterns emerge that should be codified
- When external changes (tools, APIs, practices) require skill updates

---

## Amendment Types

| Type | Description | Example | Urgency |
|------|-------------|---------|---------|
| **Clarification** | Make existing guidance clearer | Add example to SKILL.md | Low |
| **Addition** | Add missing guidance | New reference document | Medium |
| **Correction** | Fix incorrect guidance | Update wrong command | High |
| **Deprecation** | Mark guidance as outdated | Deprecate old pattern | Medium |
| **Removal** | Delete obsolete content | Remove dead links | Low |
| **Restructure** | Reorganize for clarity | Split large reference | Medium |

### Type Selection Guide

```
Is the current guidance wrong?
  └─ Yes → CORRECTION (high priority)
  └─ No → Continue...

Is guidance missing entirely?
  └─ Yes → ADDITION
  └─ No → Continue...

Is existing guidance unclear?
  └─ Yes → CLARIFICATION
  └─ No → Continue...

Is guidance outdated but not wrong?
  └─ Yes → DEPRECATION
  └─ No → Probably no amendment needed
```

---

## Amendment Workflow

### Phase 1: Identification

Amendments are identified through:

1. **Retrospectives** - Primary source
   ```markdown
   ## What Didn't Work

   ### 1. Spec was too vague on error handling

   **Root Cause:** spec skill doesn't emphasize error scenarios

   **Proposed Amendment:**
   - Skill: spec
   - Type: Addition
   - Change: Add "Error Scenarios" subsection to capability format
   ```

2. **Journey Analysis** - Pattern detection
   ```
   Journey logs show implement skill was applied 3x for same system.
   Root cause: Unclear definition of "done" for capabilities.
   ```

3. **Verification Failures** - Systematic issues
   ```
   skill-verifier consistently flags missing security considerations.
   Root cause: security-audit skill not triggered at right time.
   ```

4. **External Feedback** - User reports
   ```
   Multiple users report confusion about loop-controller autonomy levels.
   ```

### Phase 2: Proposal

Create an Amendment Proposal document:

```markdown
# Amendment Proposal: AP-2025-001

## Metadata

| Field | Value |
|-------|-------|
| ID | AP-2025-001 |
| Date | 2025-01-17 |
| Author | agent-001 |
| Status | Proposed |
| Priority | High |
| Skill | spec |
| Type | Addition |

## Problem Statement

The spec skill's capability format does not explicitly require error scenarios,
leading to implementations that lack comprehensive error handling.

## Evidence

1. Retrospective from skills-library-mcp identified this gap
2. 3 out of 5 recent systems required rework for error handling
3. Average of 2.3 additional implement iterations per system

## Proposed Change

### Current State

```markdown
## Capability: [CAP-001] Name

### Description
[What this capability does]

### Inputs
[Input parameters]

### Outputs
[Expected outputs]
```

### Proposed State

```markdown
## Capability: [CAP-001] Name

### Description
[What this capability does]

### Inputs
[Input parameters]

### Outputs
[Expected outputs]

### Error Scenarios
[Required section listing all error conditions and expected handling]
```

## Impact Assessment

| Dimension | Assessment |
|-----------|------------|
| Breaking Change | No - additive only |
| Affected Skills | spec, implement |
| Affected Domains | All |
| Effort to Implement | Low (1 hour) |
| Risk | Low |

## Implementation Plan

1. Update spec/references/capability-format.md
2. Update spec/SKILL.md deliverable checklist
3. Add example to spec/references/18-section-template.md
4. Update implement skill to check for error scenarios

## Verification

How we'll know this worked:
- [ ] Next 3 systems have explicit error scenarios in spec
- [ ] Reduction in implement rework cycles
- [ ] skill-verifier passes on error handling checks
```

### Phase 3: Review

Amendment proposals go through review:

#### Review Criteria

| Criterion | Question | Weight |
|-----------|----------|--------|
| Evidence-Based | Is there data supporting this change? | High |
| Minimal Impact | Is this the smallest change that solves the problem? | Medium |
| Backward Compatible | Does this break existing usage? | High |
| Testable | Can we verify the change works? | Medium |
| Documented | Is the rationale clear? | Medium |

#### Review Process

```
1. Author submits proposal
   ↓
2. Reviewer checks criteria (human or agent)
   ↓
3. Decision: APPROVE / REQUEST_CHANGES / REJECT
   ↓
4. If approved, proceed to implementation
```

#### Review Template

```markdown
## Amendment Review: AP-2025-001

**Reviewer:** [Name]
**Date:** [Date]

### Criteria Assessment

| Criterion | Pass/Fail | Notes |
|-----------|-----------|-------|
| Evidence-Based | PASS | 3 retrospectives cited |
| Minimal Impact | PASS | Single section addition |
| Backward Compatible | PASS | Additive change |
| Testable | PASS | Clear verification criteria |
| Documented | PASS | Comprehensive proposal |

### Decision

**APPROVED**

### Conditions (if any)

- None

### Notes

Good proposal. Addresses real pain point with minimal disruption.
```

### Phase 4: Implementation

Execute the approved amendment:

#### Implementation Checklist

```markdown
## Implementation: AP-2025-001

### Pre-Implementation
- [ ] Amendment approved
- [ ] Backup current skill version
- [ ] Notify affected stakeholders

### Implementation Steps
- [ ] Step 1: [description]
- [ ] Step 2: [description]
- [ ] Step 3: [description]

### Post-Implementation
- [ ] Run skill-verifier on modified skill
- [ ] Update VERSION.json
- [ ] Update CHANGELOG.md
- [ ] Commit with amendment ID in message
```

#### Commit Message Format

```
[amendment] AP-2025-001: Add error scenarios to capability format

- Added Error Scenarios section to capability format reference
- Updated spec SKILL.md deliverable checklist
- Added example in 18-section-template.md

Addresses: RETRO-skills-library-mcp-2025-01-17

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Phase 5: Verification

Confirm the amendment achieved its goal:

```markdown
## Verification: AP-2025-001

### Immediate Verification
- [ ] Modified files pass linting
- [ ] skill-verifier passes on affected skill
- [ ] No regression in existing functionality

### Follow-up Verification (after 3 uses)
- [ ] Problem described in proposal no longer occurs
- [ ] No unintended side effects
- [ ] Users report improvement (if applicable)

### Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Implement rework cycles | 2.3/system | [TBD] | [TBD] |
| Error handling coverage | 60% | [TBD] | [TBD] |
```

---

## Amendment Lifecycle

```
┌──────────────┐
│  IDENTIFIED  │  ← From retrospective, journey, or feedback
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   PROPOSED   │  ← Amendment proposal created
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  IN REVIEW   │  ← Under evaluation
└──────┬───────┘
       │
       ├─────────────────────┐
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│   APPROVED   │      │   REJECTED   │
└──────┬───────┘      └──────────────┘
       │
       ▼
┌──────────────┐
│ IMPLEMENTING │  ← Changes being made
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  VERIFYING   │  ← Confirming effectiveness
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   COMPLETE   │  ← Amendment integrated
└──────────────┘
```

---

## Amendment Registry

Track all amendments in `learning/amendments.json`:

```json
{
  "amendments": [
    {
      "id": "AP-2025-001",
      "title": "Add error scenarios to capability format",
      "skill": "spec",
      "type": "addition",
      "status": "complete",
      "priority": "high",
      "proposedAt": "2025-01-17T10:00:00Z",
      "approvedAt": "2025-01-17T12:00:00Z",
      "implementedAt": "2025-01-17T14:00:00Z",
      "verifiedAt": "2025-01-20T10:00:00Z",
      "source": {
        "type": "retrospective",
        "id": "RETRO-skills-library-mcp-2025-01-17"
      },
      "files": [
        "spec/references/capability-format.md",
        "spec/SKILL.md"
      ]
    }
  ],
  "statistics": {
    "total": 15,
    "byStatus": {
      "proposed": 2,
      "inReview": 1,
      "approved": 1,
      "implementing": 1,
      "verifying": 2,
      "complete": 8
    },
    "byType": {
      "clarification": 5,
      "addition": 6,
      "correction": 3,
      "deprecation": 1
    },
    "avgTimeToComplete": "3.2 days"
  }
}
```

---

## Prioritization

When multiple amendments are proposed, prioritize using:

### Priority Matrix

| Urgency \ Impact | High Impact | Low Impact |
|-----------------|-------------|------------|
| **High Urgency** | P1 - Do Now | P2 - Do Soon |
| **Low Urgency** | P3 - Plan | P4 - Backlog |

### Scoring Formula

```
Priority Score = (Impact × 3) + (Urgency × 2) + Evidence Quality

Where:
- Impact: 1-5 (how much improvement expected)
- Urgency: 1-5 (how soon it's needed)
- Evidence: 1-5 (how strong the supporting data)
```

### Priority Queue

```markdown
## Amendment Priority Queue

| Priority | ID | Title | Score | Status |
|----------|-----|-------|-------|--------|
| P1 | AP-2025-003 | Fix security audit trigger | 23 | In Review |
| P1 | AP-2025-001 | Add error scenarios | 21 | Implementing |
| P2 | AP-2025-002 | Clarify autonomy levels | 17 | Proposed |
| P3 | AP-2025-004 | Add MCP examples | 14 | Proposed |
```

---

## Anti-Patterns

### Things to Avoid

1. **Amendment Without Evidence**
   - Bad: "I think we should add X"
   - Good: "Retrospective R-001 identified gap, 3 systems affected"

2. **Scope Creep**
   - Bad: "While we're here, let's also refactor the whole skill"
   - Good: "This amendment addresses one specific issue"

3. **Breaking Changes Without Migration**
   - Bad: Rename skill output format without transition period
   - Good: Support both formats, deprecate old with timeline

4. **Undocumented Changes**
   - Bad: Edit skill file directly without amendment proposal
   - Good: All changes traced to approved amendments

5. **Skipping Verification**
   - Bad: "It's a small change, no need to verify"
   - Good: Every amendment verified after implementation

---

## Integration with Other Skills

### From Retrospective

```
retrospective → identifies gap → creates amendment proposal
```

### To Skill-Verifier

```
amendment implemented → skill-verifier validates → confirms fix
```

### To Journey-Tracer

```
amendment affects skill → journey logs reference amendment ID
```

### To Calibration-Tracker

```
amendment improves estimates → calibration reflects improvement
```

---

## Emergency Amendments

For critical issues requiring immediate fix:

### Emergency Process

1. **Identify** - Document the critical issue
2. **Hotfix** - Make minimal change to address issue
3. **Notify** - Alert all affected parties
4. **Document** - Create amendment proposal post-hoc
5. **Review** - Retrospective review of emergency process

### Emergency Template

```markdown
# Emergency Amendment: EA-2025-001

## Critical Issue
[Description of critical issue]

## Immediate Impact
[What breaks without this fix]

## Hotfix Applied
[Minimal change made]

## Notification Sent
- [ ] Stakeholder 1
- [ ] Stakeholder 2

## Post-Hoc Proposal
[Full amendment proposal to follow within 24 hours]
```

---

## Metrics and Reporting

### Amendment Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Time to Approve | Proposal → Approved | < 48 hours |
| Time to Implement | Approved → Implemented | < 24 hours |
| Verification Rate | Amendments verified effective | > 80% |
| Rejection Rate | Proposals rejected | < 20% |

### Monthly Report Template

```markdown
## Amendment Report: January 2025

### Summary
- Amendments Proposed: 8
- Amendments Completed: 6
- Amendments Rejected: 1
- Amendments In Progress: 3

### Completed Amendments
| ID | Skill | Type | Impact |
|----|-------|------|--------|
| AP-2025-001 | spec | addition | Reduced rework by 40% |
| AP-2025-002 | implement | clarification | Clearer guidance |

### Lessons Learned
- [Insight 1]
- [Insight 2]

### Upcoming
- [Planned amendment 1]
- [Planned amendment 2]
```

---

*Use this process to ensure retrospective insights systematically improve skills.*
