---
name: failure-mode-analysis
description: "Apply MECE failure mode taxonomy to backend pipelines. Classifies failures by Location (L1-L4), Type (T1-T5), and Severity (S1-S4). Produces comprehensive failure mode inventory with validation status and coverage calculation."
phase: REVIEW
category: engineering
version: "1.0.0"
depends_on: [pipeline-discovery]
tags: [audit, failure-modes, mece, backend, analysis]
---

# Failure Mode Analysis

Apply MECE failure mode taxonomy to backend pipelines.

## When to Use

- **After pipeline discovery** — Runs in REVIEW phase on identified P-series
- **Systematic failure identification** — Find all ways each pipeline can fail
- **Coverage assessment** — Calculate what percentage of failures are validated
- When you say: "analyze failure modes", "what can break?", "find the risks"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `mece-taxonomy.md` | The three classification dimensions |
| `failure-mode-template.md` | How to document each failure mode |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `validation-checking.md` | How to verify if mode is validated |

**Verification:** Every pipeline step has been analyzed for failure modes.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `PIPELINE-FAILURE-MODES.md` | Project root | Always |
| Coverage update | `audit-state.json` | Always |

## Core Concept

Failure Mode Analysis answers: **"What are all the ways this pipeline can fail?"**

MECE = Mutually Exclusive, Collectively Exhaustive
- Every failure belongs to exactly one category
- All possible failures are covered

The three dimensions:
1. **Location (WHERE)** — Where in the pipeline does it fail?
2. **Type (WHAT)** — What kind of failure is it?
3. **Severity (HOW BAD)** — How serious is the impact?

## The MECE Taxonomy

### Dimension 1: Location (WHERE)

| Code | Location | Description | Examples |
|------|----------|-------------|----------|
| L1 | **Input** | Data entering pipeline is invalid/missing | Bad request, missing field |
| L2 | **Processing** | Transformation logic fails | Algorithm error, edge case |
| L3 | **Output** | Storage or delivery fails | DB write error, API failure |
| L4 | **Integration** | Cross-pipeline handoff fails | Missing dependency, format mismatch |

### Dimension 2: Type (WHAT)

| Code | Type | Description | Examples |
|------|------|-------------|----------|
| T1 | **Data** | Missing, malformed, stale data | Null field, wrong format |
| T2 | **Logic** | Algorithm error, wrong branch | Edge case, off-by-one |
| T3 | **Infrastructure** | Auth, network, timeout | Rate limit, connection lost |
| T4 | **Quality** | Succeeds but output is bad | Low quality, wrong tone |
| T5 | **UX** | Works but experience is broken | Confusing, no feedback |

### Dimension 3: Severity (HOW BAD)

| Code | Severity | Description | User Impact |
|------|----------|-------------|-------------|
| S1 | **Silent** | Fails without error | Bad data persists, user unaware |
| S2 | **Partial** | Some data correct, some wrong | Partial results, confusing |
| S3 | **Visible** | Error surfaced but unclear | User sees error, doesn't understand |
| S4 | **Blocking** | Cannot complete | User stuck, needs help |

## Analysis Process

```
┌─────────────────────────────────────────────────────────────┐
│              FAILURE MODE ANALYSIS PROCESS                  │
│                                                             │
│  FOR EACH PIPELINE:                                         │
│                                                             │
│  1. WALK THROUGH EACH STEP                                  │
│     └─→ What can go wrong at this step?                    │
│                                                             │
│  2. FOR EACH POTENTIAL FAILURE                              │
│     ├─→ Assign Location (L1-L4)                            │
│     ├─→ Assign Type (T1-T5)                                │
│     ├─→ Assign Severity (S1-S4)                            │
│     └─→ Generate ID: P{N}-{NNN}                            │
│                                                             │
│  3. CHECK VALIDATION STATUS                                 │
│     ├─→ Is there explicit error handling?                  │
│     ├─→ Is there test coverage?                            │
│     └─→ Mark VALIDATED or UNVALIDATED                      │
│                                                             │
│  4. CALCULATE COVERAGE                                      │
│     └─→ (Validated / Total) × 100%                         │
└─────────────────────────────────────────────────────────────┘
```

## Failure Mode Documentation

```markdown
### P2-007: Template selection too narrow

| Attribute | Value |
|-----------|-------|
| **ID** | P2-007 |
| **Pipeline** | P2: Content Generation |
| **Step** | 4. Template selection |
| **Location** | L2-Processing |
| **Type** | T4-Quality |
| **Severity** | S1-Silent |
| **Description** | Only 3 templates available, causing repetitive output |
| **Impact** | Generated content lacks variety |
| **Detection** | None (silent) |
| **Status** | UNVALIDATED |
| **Test Spec** | TEST-P2-007 |
| **Fix** | Expand template pool to 10+ variations |
| **Effort** | M |
```

## Output Format

### PIPELINE-FAILURE-MODES.md

```markdown
# Pipeline Failure Modes

## Summary

| Pipeline | Failure Modes | Validated | Coverage |
|----------|---------------|-----------|----------|
| P1: Source Ingestion | 9 | 4 | 44% |
| P2: Content Generation | 12 | 3 | 25% |
| P3: Publishing | 8 | 5 | 63% |
| **Total** | **29** | **12** | **41%** |

## Risk Distribution

| Severity | Count | Validated | Risk Level |
|----------|-------|-----------|------------|
| S1-Silent | 8 | 2 | HIGHEST |
| S2-Partial | 7 | 3 | HIGH |
| S3-Visible | 9 | 5 | MEDIUM |
| S4-Blocking | 5 | 2 | LOW |

## P1: Source Ingestion

### P1-001: File type not supported

| Attribute | Value |
|-----------|-------|
| **Location** | L1-Input |
| **Type** | T1-Data |
| **Severity** | S3-Visible |
| **Description** | User uploads unsupported file type |
| **Status** | VALIDATED (try-catch in upload handler) |

[... more failure modes ...]
```

## Coverage Calculation

A failure mode is **Validated** only if:

1. **Explicit handling exists:**
   ```typescript
   try {
     await processFile(file);
   } catch (error) {
     // Specific handling for this failure
   }
   ```

2. **Test coverage exists:**
   ```typescript
   test('handles unsupported file type', () => {
     expect(() => upload(badFile)).toThrow();
   });
   ```

Coverage formula:
```
Coverage = (Validated Modes / Total Modes) × 100%
```

## Priority Order for Fixes

1. **S1 (Silent)** — Highest risk: fail without anyone knowing
2. **L4 (Integration)** — High risk: cross-pipeline, often 0% validated
3. **S2 (Partial)** — Medium risk: data corruption possible
4. **S3 (Visible)** — Lower risk: at least user knows
5. **S4 (Blocking)** — Usually already handled (obvious failures)

## Validation Checklist

- [ ] Every pipeline step analyzed
- [ ] Each failure mode has L/T/S codes
- [ ] Unique ID assigned (P{N}-{NNN})
- [ ] Validation status checked against code
- [ ] Coverage percentages calculated
- [ ] Summary table generated
