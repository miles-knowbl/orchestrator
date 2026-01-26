# Retrospective Templates

Templates for conducting retrospectives and extracting learning.

---

## RETROSPECTIVE.md Template

```markdown
# Retrospective: [System/Journey Name]

**Journey:** [Journey name or ID]
**Date:** [Date of retrospective]
**Facilitator:** [Who ran it]
**Participants:** [Who participated]

---

## Summary

| Metric | Value |
|--------|-------|
| Estimated Duration | [X hours] |
| Actual Duration | [Y hours] |
| Accuracy Ratio | [Z] |
| Skills Applied | [N] |
| Verification Pass Rate | [P%] |
| Reference Utilization | [R%] |

**One-line summary:** [Single sentence describing the journey outcome]

---

## What Worked Well

### 1. [Title] ✅

**Evidence:**
- [Specific observation 1]
- [Specific observation 2]

**Why it worked:**
- [Root cause of success]

**Keep doing:**
- [Action to continue]

### 2. [Title] ✅

[Same format...]

---

## What Didn't Work

### 1. [Title] ❌

**Evidence:**
- [Specific observation 1]
- [Specific observation 2]

**Root Cause Analysis (5 Whys):**

1. Why [problem]?
   - [Answer 1]

2. Why [answer 1]?
   - [Answer 2]

3. Why [answer 2]?
   - [Answer 3]

4. Why [answer 3]?
   - [Answer 4]

5. Why [answer 4]?
   - **[Root cause]**

**Impact:** [Low/Medium/High]

**Remediation:**
- [Action taken or proposed]

### 2. [Title] ❌

[Same format...]

---

## Root Cause Summary

| Issue | Root Cause | Category |
|-------|------------|----------|
| [Issue] | [Root cause] | [Process/Skill/Tool/Data] |

---

## Improvement Proposals

### 1. [Proposal Title] ([Priority])

**Skill:** [Which skill to amend]
**Change:** [What to change]

**Before:**
```
[Current state]
```

**After:**
```
[Proposed state]
```

**Rationale:** [Why this improves things]
**Status:** [Proposed/Approved/Implemented]

### 2. [Proposal Title] ([Priority])

[Same format...]

---

## Action Items

### Immediate (This Session)

| Item | Owner | Status |
|------|-------|--------|
| [Action] | [Owner] | [Status] |

### Next Journey

| Item | Owner | Status |
|------|-------|--------|
| [Action] | [Owner] | Pending |

### Backlog

| Item | Priority | Status |
|------|----------|--------|
| [Action] | [High/Medium/Low] | Pending |

---

## Learning Integration

### Exported to Calibration Tracker

```json
{
  "domain": "[domain]",
  "records": [
    {
      "system": "[system]",
      "estimated": { "effortHours": [X] },
      "actual": { "effortHours": [Y] },
      "ratio": [Z],
      "factors": { ... }
    }
  ]
}
```

### Pattern Candidates

1. **[Pattern Name]**
   - Context: [When this applies]
   - Solution: [What to do]
   - Evidence: [Where this worked]

### Skill Amendments Queued

| Skill | Amendment | Status |
|-------|-----------|--------|
| [skill] | [change] | [Queued/Approved/Done] |

---

## Conclusion

[2-3 sentences summarizing key takeaways and next steps]

**Next Steps:**
1. [Next step 1]
2. [Next step 2]

---

*Retrospective complete. Learning integrated.*
```

---

## 5 Whys Template

For root cause analysis:

```markdown
### Root Cause Analysis: [Problem Statement]

**Problem:** [Clear statement of what went wrong]

**5 Whys:**

1. **Why** [problem happened]?
   → [First-level cause]

2. **Why** [first-level cause]?
   → [Second-level cause]

3. **Why** [second-level cause]?
   → [Third-level cause]

4. **Why** [third-level cause]?
   → [Fourth-level cause]

5. **Why** [fourth-level cause]?
   → **[ROOT CAUSE]**

**Verification:** Does fixing the root cause prevent the problem?
- [ ] Yes - proceed with remediation
- [ ] No - dig deeper or try different path

**Remediation:** [Action to address root cause]
```

---

## Improvement Proposal Template

```markdown
## Improvement Proposal: [Title]

**ID:** IMP-[NNN]
**Date:** [Date]
**Author:** [Who proposed]
**Status:** Proposed | Under Review | Approved | Implemented | Rejected

---

### Problem Statement

[What problem does this solve?]

### Proposed Change

**Affected Skill(s):** [list]

**Current State:**
```
[How it works now]
```

**Proposed State:**
```
[How it should work]
```

### Rationale

- [Reason 1]
- [Reason 2]

### Impact Assessment

| Dimension | Impact |
|-----------|--------|
| Frequency of problem | [How often this occurs] |
| Effort to implement | [Low/Medium/High] |
| Risk of change | [Low/Medium/High] |
| Benefit | [Description] |

### Implementation Plan

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Verification

How will we know this worked?
- [ ] [Verification criterion 1]
- [ ] [Verification criterion 2]

---

**Review Notes:**
[Space for reviewer comments]

**Decision:** [Approved/Rejected]
**Decision Date:** [Date]
**Implemented:** [Date or N/A]
```

---

## Quick Retrospective Format

For smaller journeys or rapid iteration:

```markdown
# Quick Retro: [System]

**Date:** [Date]
**Duration:** [Estimated] → [Actual]

## ✅ What Worked
- [Item 1]
- [Item 2]

## ❌ What Didn't
- [Item 1] → Root cause: [cause]
- [Item 2] → Root cause: [cause]

## 🔧 Actions
- [ ] [Action 1] - [Owner]
- [ ] [Action 2] - [Owner]

## 📊 Metrics
- Estimate accuracy: [X%]
- Verification pass rate: [Y%]
- Reference utilization: [Z%]
```

---

*Use these templates to ensure consistent, actionable retrospectives.*
