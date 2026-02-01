# Reporting Format

How to document UI validation results.

## Document Structure

```markdown
# UI Validation Results

**Date:** YYYY-MM-DD
**Tester:** [name or system]
**Environment:** [dev | staging | prod]
**Version:** [app version if applicable]

## Executive Summary

[1-2 sentences on overall state]

Validation Rate: XX%
Critical Issues: N
Pipelines Tested: N

## Summary Table

| Pipeline | Steps | Pass | Partial | Fail | Rate |
|----------|-------|------|---------|------|------|
| U1: Name | N | N | N | N | XX% |
| ...      | ... | ... | ... | ... | ... |
| **Total** | **N** | **N** | **N** | **N** | **XX%** |

## Detailed Results

### U1: Pipeline Name

[Pipeline-specific details]

### U2: Pipeline Name

[Pipeline-specific details]

## Issues Summary

[All issues in one place]

## Recommendations

[Prioritized action items]
```

## Pipeline Section Format

```markdown
### U1: Chat-to-Edit

**Overall:** PASS | PARTIAL | FAIL (XX%)
**Prerequisites:** [What must exist]
**Time to complete:** [Approximate]

#### Step-by-Step

| Step | Action | Result | Notes |
|------|--------|--------|-------|
| 1 | [Action] | PASS | [Notes] |
| 2 | [Action] | PARTIAL | [Notes] |
| 3 | [Action] | FAIL | [Notes] |

#### Issues Found

1. **[Issue Title]** (Step N)
   - Expected: [What should happen]
   - Actual: [What happened]
   - Impact: [User impact]
   - Related: [Failure mode ID if applicable]

#### Screenshots (if applicable)

[Include relevant screenshots]
```

## Issue Summary Format

```markdown
## Issues Summary

### Critical

| Issue | Pipeline | Step | Failure Mode |
|-------|----------|------|--------------|
| [Description] | U1 | N | U1-NNN |

### High

| Issue | Pipeline | Step | Failure Mode |
|-------|----------|------|--------------|
| [Description] | U2 | N | U2-NNN |

### Medium

[Same format]

### Low

[Same format]
```

## Recommendations Format

```markdown
## Recommendations

### Immediate (Before Ship)

1. **[Action]**
   - Issue: [What's wrong]
   - Impact: [Why it matters]
   - Effort: S | M | L

### Before Polish Complete

2. **[Action]**
   - Issue: [What's wrong]
   - Impact: [Why it matters]
   - Effort: S | M | L

### Nice to Have

3. **[Action]**
   - Issue: [What's wrong]
   - Impact: [Why it matters]
   - Effort: S | M | L
```

## Status Definitions

### PASS
- All checks pass
- No issues found
- Works as designed

### PARTIAL
- Core functionality works
- Minor issues present
- Usable but not ideal

### FAIL
- Core functionality broken
- Blocks user flow
- Must be fixed

## Validation Rate Calculation

```
Pipeline Rate = (PASS steps + 0.5 × PARTIAL steps) / Total steps × 100%

Overall Rate = Sum of all step results / Total steps across all pipelines × 100%
```

Note: PARTIAL counts as 0.5 because it partially works.
