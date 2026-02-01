---
name: ui-failure-mode-analysis
description: "Apply MECE failure mode taxonomy to UI pipelines with L5/L6 extensions. Identifies UI-specific failure patterns like Dead Click, Stale Closure, State Desync. Produces UI-FAILURE-MODES.md with coverage calculation."
phase: REVIEW
category: core
version: "1.0.0"
depends_on: [ui-pipeline-discovery]
tags: [audit, failure-modes, mece, ui, frontend, analysis]
---

# UI Failure Mode Analysis

Apply MECE failure mode taxonomy to UI pipelines.

## When to Use

- **After UI pipeline discovery** — Runs in REVIEW phase on identified U-series
- **UI-specific failure identification** — Find ways UI interactions can fail
- **Coverage assessment** — Calculate what percentage of UI failures are validated
- When you say: "analyze UI failures", "what can break in the UI?", "find interaction bugs"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `ui-failure-patterns.md` | The 8 UI-specific failure patterns |
| `l5-l6-locations.md` | Interaction and Streaming location codes |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `ui-failure-template.md` | How to document UI failure modes |

**Verification:** Every UI pipeline step analyzed for failure modes including L5/L6.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `UI-FAILURE-MODES.md` | Project root | Always |
| Coverage update | `audit-state.json` | Always (ui coverage) |

## Core Concept

UI Failure Mode Analysis answers: **"What are all the ways UI interactions can fail?"**

UI failures are different from backend failures:
- Users experience them directly
- They involve state, callbacks, and visual feedback
- They include interaction timing and streaming
- They affect perceived quality even when "working"

## Extended Location Codes (L5/L6)

UI pipelines need additional location codes:

| Code | Location | Description | Examples |
|------|----------|-------------|----------|
| L5 | **Interaction** | Tool execution, callbacks, user action handling | Dead click, stale closure |
| L6 | **Streaming** | SSE parsing, incremental updates, real-time sync | Stream disconnect, partial render |

Combined with L1-L4 from backend analysis:
- L1-Input: User input handling
- L2-Processing: Client-side logic
- L3-Output: Rendering, display
- L4-Integration: Context sync, API calls

## UI-Specific Failure Patterns

| Pattern | Code | Description | User Experience |
|---------|------|-------------|-----------------|
| **Dead Click** | L5-T2 | Button/action produces no response | "Is it broken?" |
| **Stale Closure** | L5-T1 | Callback uses outdated state | Wrong item affected |
| **State Desync** | L3-T1 | UI shows stale data | Confusion, lost work |
| **Missing Feedback** | L3-T5 | No loading/error indicator | Uncertainty |
| **Context Loss** | L4-T1 | Navigation loses selection | Frustration, re-work |
| **Race Condition** | L5-T2 | Fast clicks cause wrong state | Duplicates, wrong order |
| **Stream Disconnect** | L6-T3 | SSE connection drops | Partial content |
| **Callback Leak** | L5-T3 | Unregistered callbacks accumulate | Slowdown, memory |

## Analysis Process

```
┌─────────────────────────────────────────────────────────────┐
│            UI FAILURE MODE ANALYSIS PROCESS                 │
│                                                             │
│  FOR EACH UI PIPELINE:                                      │
│                                                             │
│  1. WALK THROUGH EACH STEP                                  │
│     └─→ What can go wrong at this interaction point?       │
│                                                             │
│  2. CHECK EACH PATTERN                                      │
│     └─→ Could Dead Click occur here? Stale Closure? etc.   │
│                                                             │
│  3. FOR EACH POTENTIAL FAILURE                              │
│     ├─→ Assign Location (L1-L6)                            │
│     ├─→ Assign Type (T1-T5)                                │
│     ├─→ Assign Severity (S1-S4)                            │
│     ├─→ Identify pattern if applicable                     │
│     └─→ Generate ID: U{N}-{NNN}                            │
│                                                             │
│  4. CHECK VALIDATION STATUS                                 │
│     ├─→ Is there explicit handling?                        │
│     ├─→ Is there test coverage?                            │
│     └─→ Mark VALIDATED or UNVALIDATED                      │
│                                                             │
│  5. CALCULATE COVERAGE                                      │
│     └─→ (Validated / Total) × 100%                         │
└─────────────────────────────────────────────────────────────┘
```

## UI Failure Mode Documentation

```markdown
### U1-005: Cache not invalidated after edit

| Attribute | Value |
|-----------|-------|
| **ID** | U1-005 |
| **Pipeline** | U1: Chat-to-Edit |
| **Step** | 9. React Query cache invalidation |
| **Location** | L3-Output |
| **Type** | T1-Data |
| **Severity** | S1-Silent |
| **Pattern** | State Desync |
| **Description** | Edit succeeds but cache not invalidated |
| **Impact** | User sees stale artifact until manual refresh |
| **Detection** | None (silent) |
| **Status** | UNVALIDATED |
| **Test Spec** | TEST-U1-005 |
| **Fix** | Add queryClient.invalidateQueries(['artifact', id]) |
| **Effort** | S |
```

## Output Format

### UI-FAILURE-MODES.md

```markdown
# UI Failure Modes

## Summary

| Pipeline | Failure Modes | Validated | Coverage |
|----------|---------------|-----------|----------|
| U1: Chat-to-Edit | 8 | 2 | 25% |
| U2: Chat-to-Generate | 10 | 3 | 30% |
| U3: Selection-to-Context | 5 | 2 | 40% |
| **Total** | **23** | **7** | **30%** |

## Pattern Distribution

| Pattern | Count | Description |
|---------|-------|-------------|
| Dead Click | 3 | Actions with no response |
| Stale Closure | 2 | Callbacks using old state |
| State Desync | 5 | UI showing stale data |
| Missing Feedback | 4 | No loading/error states |
| Stream Disconnect | 3 | SSE connection issues |
| Other | 6 | Various |

## Location Distribution

| Location | Count | Note |
|----------|-------|------|
| L5-Interaction | 8 | UI-specific |
| L6-Streaming | 5 | UI-specific |
| L3-Output | 6 | Rendering issues |
| L4-Integration | 4 | Context sync |

## U1: Chat-to-Edit

### U1-001: artifact_id not in context

| Attribute | Value |
|-----------|-------|
| **Location** | L5-Interaction |
| **Type** | T1-Data |
| **Severity** | S4-Blocking |
| **Pattern** | Context Loss |
| **Description** | User tries to edit but context.artifact_id is null |
| **Status** | UNVALIDATED |

[... more failure modes ...]
```

## Priority Order for UI Fixes

1. **S1 (Silent) + L5/L6** — Invisible interaction bugs
2. **S4 (Blocking)** — User completely stuck
3. **State Desync** — Confusing, loses trust
4. **Missing Feedback** — Anxiety, repeated clicks
5. **Stream issues** — Partial content

## Validation Checklist

- [ ] Every UI pipeline step analyzed
- [ ] All 8 UI patterns checked for each step
- [ ] L5/L6 locations used appropriately
- [ ] Each failure mode has pattern identified (if applicable)
- [ ] Unique ID assigned (U{N}-{NNN})
- [ ] Validation status checked
- [ ] Coverage percentages calculated
