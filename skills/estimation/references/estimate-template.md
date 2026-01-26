# Estimate Template

Standard format for documenting estimates.

## Full Estimate Template

```markdown
# Estimate: [System/Feature Name]

**Estimated by:** [Agent/Person]
**Date:** [YYYY-MM-DD]
**Spec Reference:** [Link to FeatureSpec or GitHub Issue]
**Valid until:** [Date or "requirements change"]

---

## Executive Summary

| Dimension | Value |
|-----------|-------|
| **Complexity** | [S / M / L / XL] |
| **Effort** | [X-Y hours] |
| **Duration** | [X-Y days/weeks] |
| **Confidence** | [High / Medium / Low] |
| **Risk Level** | [Low / Medium / High] |

**One-line summary:** [Brief description of what's being estimated]

---

## Scope

### Included

- [ ] Capability 1: [Description]
- [ ] Capability 2: [Description]
- [ ] Capability 3: [Description]
- [ ] Testing (unit, integration)
- [ ] Documentation
- [ ] Code review

### Explicitly NOT Included

- Deployment/infrastructure changes
- [Other exclusions]
- [Future features]

### Gray Areas (Need Clarification)

- [ ] [Item needing clarification]
- [ ] [Item needing clarification]

---

## Breakdown

### By Capability

| Capability | Base Hours | Complexity Factor | Adjusted Hours |
|------------|------------|-------------------|----------------|
| [Capability 1] | X | [factor] | Y |
| [Capability 2] | X | [factor] | Y |
| [Capability 3] | X | [factor] | Y |
| Testing | X | — | X |
| Documentation | X | — | X |
| Review/Polish | X | — | X |
| **Total** | **X** | | **Y** |

### By Phase (Alternative)

| Phase | Hours | Notes |
|-------|-------|-------|
| Design/Planning | X | |
| Implementation | X | |
| Testing | X | |
| Documentation | X | |
| Review/Fixes | X | |
| **Total** | **X** | |

---

## Assumptions

Critical assumptions this estimate depends on:

1. **[Assumption 1]**
   - If false: [Impact on estimate]
   
2. **[Assumption 2]**
   - If false: [Impact on estimate]

3. **[Assumption 3]**
   - If false: [Impact on estimate]

---

## Risks

| Risk | Probability | Impact | Mitigation | Estimate Impact |
|------|-------------|--------|------------|-----------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [Action] | +X hours |
| [Risk 2] | [H/M/L] | [H/M/L] | [Action] | +X hours |
| [Risk 3] | [H/M/L] | [H/M/L] | [Action] | +X hours |

**Risk-adjusted estimate:** [If risks materialize, estimate could be X-Y hours]

---

## Dependencies

### Blocking Dependencies

| Dependency | Status | Owner | Expected Resolution |
|------------|--------|-------|---------------------|
| [Dependency 1] | [Status] | [Team/Person] | [Date] |

### Non-Blocking Dependencies

| Dependency | Impact if Delayed |
|------------|-------------------|
| [Dependency 1] | [Impact] |

---

## Historical Comparison

| Similar Work | Estimated | Actual | Variance | Relevance |
|--------------|-----------|--------|----------|-----------|
| [Past project 1] | X hours | Y hours | +/-Z% | [How similar] |
| [Past project 2] | X hours | Y hours | +/-Z% | [How similar] |

**Lessons applied from history:**
- [Lesson 1]
- [Lesson 2]

---

## Duration Calculation

### Effort to Duration

| Scenario | Effort | Resources | Duration |
|----------|--------|-----------|----------|
| Solo developer | X hours | 1 | Y days |
| Pair | X hours | 2 | Y days |
| Team | X hours | 3 | Y days |

### Critical Path

```
[Dependency 1] ──► [Task A] ──► [Task B] ──► [Task C]
                                    │
                              [Task D] (parallel)
```

**Minimum duration:** [X days] (assuming no blockers)
**Expected duration:** [Y days] (with typical delays)

---

## Confidence Assessment

### Confidence: [High / Medium / Low]

| Factor | Assessment |
|--------|------------|
| Scope clarity | [Clear / Somewhat clear / Unclear] |
| Technical familiarity | [High / Medium / Low] |
| Team availability | [Confirmed / Likely / Unknown] |
| Dependency status | [Resolved / In progress / Unknown] |
| Historical data | [Strong / Some / None] |

### What Would Increase Confidence

- [ ] [Action that would increase confidence]
- [ ] [Spike or prototype]
- [ ] [Clarification from stakeholder]

---

## Estimate History

| Date | Estimate | Change | Reason |
|------|----------|--------|--------|
| [Date] | [X hours] | Initial | — |
| [Date] | [Y hours] | +Z hours | [Reason for change] |

---

## Approvals

| Role | Name | Date | Notes |
|------|------|------|-------|
| Estimator | [Name] | [Date] | |
| Reviewer | [Name] | [Date] | |
| Approver | [Name] | [Date] | |
```

---

## Quick Estimate Template

For faster estimates when full detail isn't needed:

```markdown
# Quick Estimate: [Feature Name]

**Date:** [Date]
**Complexity:** [S/M/L/XL]
**Effort:** [X-Y hours]
**Confidence:** [H/M/L]

## Scope
[2-3 sentence description of what's included]

## Key Assumptions
1. [Assumption 1]
2. [Assumption 2]

## Main Risks
1. [Risk 1] — could add [X hours]

## Basis
[How estimate was derived — analogous, parametric, etc.]
```

---

## Estimate Update Template

For updating existing estimates:

```markdown
# Estimate Update: [Feature Name]

**Original Estimate:** [X hours] ([Date])
**Updated Estimate:** [Y hours] ([Today])
**Change:** [+/-Z hours] ([+/-N%])

## Reason for Update

[Explanation of what changed]

## Impact

- **Schedule:** [Impact on timeline]
- **Scope:** [Any scope changes]
- **Resources:** [Any resource changes]

## Revised Assumptions

[Updated assumptions list]

## Next Update

[When estimate will be revisited, if applicable]
```
