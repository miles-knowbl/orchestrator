---
name: ui-interaction-test
description: "Validate that UI flows actually work by tracing through each U-series pipeline step by step. Documents what works, what fails, and what needs attention. Produces UI-VALIDATION.md with interaction test results."
phase: VALIDATE
category: core
version: "1.0.0"
depends_on: [ui-pipeline-discovery]
tags: [audit, testing, ui, validation, interaction]
---

# UI Interaction Test

Validate that UI flows actually work.

## When to Use

- **After UI pipeline discovery** — Runs in VALIDATE phase
- **Verifying UI functionality** — Actually test if flows work
- **Documenting current state** — Record what works and what doesn't
- When you say: "test the UI flows", "verify interactions work", "validate the UX"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `interaction-validation.md` | How to validate UI flows |
| `validation-checklist.md` | What to check at each step |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `reporting-format.md` | How to document results |

**Verification:** Every U-series pipeline has been walked through and validated.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `UI-VALIDATION.md` | Project root | Always |

## Core Concept

UI Interaction Test answers: **"Does the UI actually work as intended?"**

This is not about test automation — it's about:
- Walking through each UI flow manually
- Documenting what happens at each step
- Recording success, partial success, or failure
- Identifying specific issues found

## Validation Process

```
┌─────────────────────────────────────────────────────────────┐
│            UI INTERACTION VALIDATION PROCESS                │
│                                                             │
│  FOR EACH U-SERIES PIPELINE:                                │
│                                                             │
│  1. SET UP PREREQUISITES                                    │
│     └─→ Ensure required context/data exists                │
│                                                             │
│  2. WALK THROUGH EACH STEP                                  │
│     ├─→ Trigger the action                                 │
│     ├─→ Observe what happens                               │
│     ├─→ Check feedback (loading, success, error)           │
│     └─→ Verify outcome matches expectation                 │
│                                                             │
│  3. DOCUMENT RESULTS                                        │
│     ├─→ PASS: Works as expected                            │
│     ├─→ PARTIAL: Works but with issues                     │
│     └─→ FAIL: Doesn't work                                 │
│                                                             │
│  4. NOTE ISSUES FOUND                                       │
│     └─→ Link to failure modes if applicable                │
│                                                             │
│  5. CALCULATE VALIDATION RATE                               │
│     └─→ (Passed Steps / Total Steps) × 100%                │
└─────────────────────────────────────────────────────────────┘
```

## Validation Checklist Per Step

At each step in a UI pipeline, check:

### Trigger
- [ ] Can the action be triggered?
- [ ] Is the trigger element visible and accessible?
- [ ] Does the trigger respond to interaction?

### Feedback
- [ ] Is there loading indication?
- [ ] Is there progress indication for long operations?
- [ ] Are errors displayed clearly?
- [ ] Is success confirmed?

### Outcome
- [ ] Does the expected state change occur?
- [ ] Is the UI updated to reflect the change?
- [ ] Is data persisted correctly?
- [ ] Can the user continue their workflow?

### Edge Cases
- [ ] What happens if triggered twice quickly?
- [ ] What happens if network is slow?
- [ ] What happens if an error occurs?
- [ ] What happens if user navigates away?

## Result Classifications

### PASS
Everything works as expected:
- Action triggers correctly
- Feedback is clear
- Outcome matches expectation
- No errors or unexpected behavior

### PARTIAL
Works but with issues:
- Action completes but feedback missing
- Outcome correct but UI glitchy
- Minor issues that don't block flow
- Works but feels wrong

### FAIL
Doesn't work:
- Action doesn't trigger
- Error occurs
- Outcome doesn't match expectation
- User cannot complete flow

## Output Format

### UI-VALIDATION.md

```markdown
# UI Validation Results

**Date:** [timestamp]
**Environment:** [dev | staging | prod]

## Summary

| Pipeline | Steps | Pass | Partial | Fail | Rate |
|----------|-------|------|---------|------|------|
| U1: Chat-to-Edit | 11 | 8 | 2 | 1 | 73% |
| U2: Chat-to-Generate | 10 | 6 | 3 | 1 | 60% |
| U3: Selection-to-Context | 6 | 5 | 1 | 0 | 83% |
| **Total** | **27** | **19** | **6** | **2** | **70%** |

## U1: Chat-to-Edit

**Overall:** PARTIAL (73%)
**Prerequisites:** Artifact must exist, user authenticated

### Step-by-Step Results

| Step | Action | Result | Notes |
|------|--------|--------|-------|
| 1 | Open artifact in editor | PASS | Loads correctly |
| 2 | Verify context.artifact_id set | PASS | Badge shows |
| 3 | ChatPanel shows editing badge | PASS | "Editing: Title" |
| 4 | Type edit instruction | PASS | Input works |
| 5 | Submit message | PASS | Sends correctly |
| 6 | SSE stream initiates | PARTIAL | No loading indicator |
| 7 | Agent processes | PASS | Tool call shown |
| 8 | edit_artifact executes | PASS | Returns success |
| 9 | Cache invalidated | FAIL | Stale content shown |
| 10 | Change summary shown | PARTIAL | Sometimes missing |
| 11 | Artifact re-renders | PASS (after refresh) | Needs manual refresh |

### Issues Found

1. **Missing loading indicator** (Step 6)
   - Related: U1-003 (Missing Feedback pattern)
   - Impact: User doesn't know if action is processing

2. **Cache not invalidated** (Step 9)
   - Related: U1-005 (State Desync pattern)
   - Impact: User sees stale content until refresh

3. **Change summary inconsistent** (Step 10)
   - Related: U1-004
   - Impact: User doesn't know what changed

## U2: Chat-to-Generate

[... similar format ...]

## Issues Summary

| Issue | Pipeline | Step | Severity | Failure Mode |
|-------|----------|------|----------|--------------|
| No loading during stream | U1 | 6 | Medium | U1-003 |
| Cache not invalidated | U1 | 9 | High | U1-005 |
| Missing change summary | U1 | 10 | Medium | U1-004 |
| Generate button unresponsive | U2 | 4 | High | U2-003 |

## Recommendations

1. **Critical:** Fix cache invalidation in Chat-to-Edit flow
2. **High:** Add loading indicators for all async operations
3. **Medium:** Ensure change summaries always display
```

## Validation Tips

### Be Systematic
- Follow the documented pipeline steps exactly
- Don't skip steps even if they seem obvious
- Test happy path first, then edge cases

### Be Observant
- Watch for console errors
- Note timing issues
- Observe visual glitches
- Feel the UX friction

### Be Honest
- If it doesn't feel right, mark it PARTIAL
- If it breaks, mark it FAIL
- Don't assume issues will be fixed later

### Link to Failure Modes
- When you find an issue, check if there's a failure mode for it
- If not, note it as a new discovery
- This connects validation to the failure mode inventory

## Validation Checklist

- [ ] All U-series pipelines validated
- [ ] Each step has PASS/PARTIAL/FAIL status
- [ ] Issues linked to failure modes where applicable
- [ ] Validation rate calculated per pipeline
- [ ] Summary table generated
- [ ] Recommendations prioritized
