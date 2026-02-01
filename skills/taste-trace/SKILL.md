---
name: taste-trace
description: "Link taste gaps to technical failure modes. Creates traceability from subjective quality gaps to specific technical failures, enabling taste-ordered prioritization of fixes. Produces TASTE-TRACE.md with gap-to-failure-mode mappings."
phase: REVIEW
category: core
version: "1.0.0"
depends_on: [taste-eval, failure-mode-analysis, ui-failure-mode-analysis]
tags: [audit, taste, traceability, failure-modes, prioritization]
---

# Taste Trace

Link taste gaps to technical failure modes.

## When to Use

- **After failure mode analysis** — Runs in REVIEW phase after failure modes identified
- **Connecting taste to technical** — Map subjective gaps to objective failures
- **Prioritizing fixes** — Enable taste-ordered checklist generation
- When you say: "trace the gaps", "link taste to failures", "what causes this gap?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `tracing-methodology.md` | How to link gaps to failure modes |
| `trace-matrix-template.md` | Output format for traces |

**Verification:** Every gap should have at least one traced failure mode (or explicit "no technical cause").

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `TASTE-TRACE.md` | Project root | Always |
| Updated `TASTE-GAPS.md` | Project root | Update traced_failure_modes field |

## Core Concept

Taste Trace answers: **"What technical failures cause this taste gap?"**

The connection between taste and technical:
- **Taste gap:** "Generated content lacks engagement" (subjective)
- **Technical failure:** "Template selection logic uses only 3 templates" (objective)
- **Trace:** TG-001 (engagement) ← P2-007 (limited templates)

This enables:
1. Fixing technical issues that matter most (taste impact)
2. Understanding why technical debt affects users
3. Prioritizing work by user-perceived impact

## The Tracing Process

```
┌─────────────────────────────────────────────────────────────┐
│                   TRACING PROCESS                           │
│                                                             │
│  1. LOAD INPUTS                                             │
│     ├─→ Taste gaps from TASTE-GAPS.md                      │
│     ├─→ Backend failure modes from PIPELINE-FAILURE-MODES.md│
│     └─→ UI failure modes from UI-FAILURE-MODES.md          │
│                                                             │
│  2. FOR EACH GAP                                            │
│     ├─→ Analyze gap evidence                               │
│     ├─→ Identify candidate failure modes                   │
│     ├─→ Verify causal relationship                         │
│     └─→ Document trace with confidence                     │
│                                                             │
│  3. CLASSIFY TRACES                                         │
│     ├─→ Direct cause (failure directly causes gap)         │
│     ├─→ Contributing (failure contributes to gap)          │
│     └─→ Correlated (related but not causal)                │
│                                                             │
│  4. GENERATE DELIVERABLES                                   │
│     ├─→ TASTE-TRACE.md (full trace documentation)          │
│     └─→ Update TASTE-GAPS.md traced_failure_modes          │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Load Inputs

**From TASTE-GAPS.md:**
```yaml
id: TG-001
dimension: engagement
score: 2.4
floor: 2.5
evidence:
  - "Content lacks compelling hooks"
  - "Structure becomes repetitive"
```

**From PIPELINE-FAILURE-MODES.md:**
```yaml
id: P2-007
pipeline: P2-Content-Generation
location: L2-Processing
type: T4-Quality
description: Template selection uses only 3 templates
```

## Step 2: Analyze and Match

For each gap, examine the evidence and find failure modes that could cause it:

| Gap Evidence | Candidate Failure Modes |
|--------------|------------------------|
| "Content lacks hooks" | P2-003 (hook generation weak) |
| "Structure repetitive" | P2-007 (limited templates) |
| "Loading unclear" | U2-003 (missing loading state) |

## Step 3: Verify Causality

For each candidate, determine relationship:

### Direct Cause
The failure mode directly produces the gap symptom.

**Test:** If we fix this failure mode, does the gap improve?

```
P2-007 (3 templates) → TG-001 (repetitive content)
Relationship: DIRECT
Confidence: HIGH
```

### Contributing Cause
The failure mode contributes to but doesn't fully explain the gap.

**Test:** Fixing this helps but doesn't fully resolve the gap.

```
P2-003 (weak hooks) → TG-001 (lacks engagement)
Relationship: CONTRIBUTING
Confidence: MEDIUM
```

### Correlated
Related symptoms but not causal.

**Test:** These appear together but one doesn't cause the other.

```
P1-002 (slow ingestion) ~ TG-002 (poor responsiveness)
Relationship: CORRELATED (both caused by infra)
```

## Step 4: Document Traces

### TASTE-TRACE.md Format

```markdown
# Taste-to-Failure-Mode Trace

**Project:** [name]
**Gaps Traced:** N
**Failure Modes Linked:** M

## Trace Summary

| Gap | Dimension | Direct Causes | Contributing |
|-----|-----------|---------------|--------------|
| TG-001 | engagement | P2-007 | P2-003 |
| TG-002 | feedback_clarity | U2-003, U1-004 | - |

## Detailed Traces

### TG-001: engagement (CRITICAL)

**Gap Details:**
- Score: 2.4 (floor: 2.5)
- Evidence: "Content lacks hooks", "Structure repetitive"

**Traced Failure Modes:**

| ID | Relationship | Confidence | Impact |
|----|--------------|------------|--------|
| P2-007 | Direct | High | Fixing would improve score +0.3 |
| P2-003 | Contributing | Medium | Fixing would improve score +0.2 |

**Trace Reasoning:**
- P2-007: Template pool has only 3 variations, causing repetition
- P2-003: Hook generation uses static patterns, lacks variety

**Estimated Impact:** Fixing both would raise engagement to ~2.9

---

### TG-002: feedback_clarity (SIGNIFICANT)

**Gap Details:**
- Score: 2.8 (floor: 3.0)
- Evidence: "Loading unclear", "Change summaries missing"

**Traced Failure Modes:**

| ID | Relationship | Confidence | Impact |
|----|--------------|------------|--------|
| U2-003 | Direct | High | Fixing would improve score +0.3 |
| U1-004 | Direct | High | Fixing would improve score +0.2 |

## Untraced Failure Modes

Failure modes not linked to any taste gap:

| ID | Location | Severity | Note |
|----|----------|----------|------|
| U1-005 | L3-Output | S1-Silent | Technical issue, no taste impact |
| P1-007 | L2-Processing | S1-Silent | Internal quality, not user-facing |

These go to Tier 3 in the final checklist.
```

## Trace Confidence Levels

| Level | Meaning | When to Use |
|-------|---------|-------------|
| High | Clear causal link | Code path shows direct relationship |
| Medium | Likely causal | Evidence suggests but not certain |
| Low | Possible link | Hypothesized based on patterns |

## Impact Estimation

Estimate how much fixing a failure mode improves the gap:

```
Current score: 2.4
Floor: 2.5
Gap delta: -0.1

Failure mode P2-007 estimated impact: +0.3
If fixed, projected score: 2.7 (above floor)
```

## No Technical Cause

Some gaps may have no technical failure mode:

```markdown
### TG-003: brand_voice (SIGNIFICANT)

**Gap Details:**
- Score: 2.6 (floor: 3.0)
- Evidence: "Tone doesn't match brand guidelines"

**Traced Failure Modes:** None

**Note:** This is a content/prompt issue, not a technical failure.
The system works correctly but produces off-brand content.

**Resolution:** Update prompts/examples, not code.
```

## Validation

Before completing, verify:

- [ ] Every gap has been analyzed
- [ ] Each trace has relationship type (direct/contributing/correlated)
- [ ] Each trace has confidence level
- [ ] Impact estimates are provided
- [ ] TASTE-GAPS.md is updated with traced_failure_modes
- [ ] Untraced failure modes are documented
