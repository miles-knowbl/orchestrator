---
name: taste-eval
description: "Execute taste evaluation against discovered dimensions. Scores each dimension 1-5 with evidence, calculates weighted scores, identifies gaps where score falls below floor, and determines ship status. Produces TASTE-EVAL.md and TASTE-GAPS.md."
phase: TASTE
category: core
version: "1.0.0"
depends_on: [taste-discovery]
tags: [audit, taste, quality, evaluation, scoring]
---

# Taste Eval

Execute taste evaluation and produce dimension scores.

## When to Use

- **After taste-discovery** — Second skill in TASTE phase
- **Evaluating system quality** — Score each dimension with evidence
- **Identifying gaps** — Find where quality falls below acceptable floors
- When you say: "evaluate the taste", "score the dimensions", "find quality gaps"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `scoring-rubric.md` | Consistent scoring methodology |
| `gap-identification.md` | When a score becomes a gap |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `ship-decision-matrix.md` | Determining ship status from scores |

**Verification:** Ensure all dimensions are scored and gaps are identified.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `TASTE-EVAL.md` | Project root | Always |
| `TASTE-GAPS.md` | Project root | Always (even if no gaps) |

## Core Concept

Taste Eval answers: **"How does this system score on what matters?"**

Evaluation is:
- **Evidence-based** — Every score has supporting observations
- **Dimension-specific** — Uses project's defined quality criteria
- **Gap-focused** — Identifies where quality falls short
- **Decision-enabling** — Produces clear ship/polish/fix recommendation

## The Evaluation Process

```
┌─────────────────────────────────────────────────────────────┐
│                  EVALUATION PROCESS                         │
│                                                             │
│  1. LOAD DIMENSIONS                                         │
│     └─→ From taste-discovery output in audit-state.json    │
│                                                             │
│  2. FOR EACH DIMENSION                                      │
│     ├─→ Gather evidence (code, output samples, behavior)   │
│     ├─→ Apply scoring rubric                               │
│     └─→ Assign score 1-5 with evidence                     │
│                                                             │
│  3. CALCULATE SCORES                                        │
│     ├─→ Category scores (weighted average)                 │
│     └─→ Overall score (category-weighted average)          │
│                                                             │
│  4. IDENTIFY GAPS                                           │
│     └─→ Where score < floor                                │
│                                                             │
│  5. DETERMINE SHIP STATUS                                   │
│     └─→ Apply quality gates to overall score               │
│                                                             │
│  6. GENERATE DELIVERABLES                                   │
│     ├─→ TASTE-EVAL.md (full scores)                        │
│     └─→ TASTE-GAPS.md (identified gaps)                    │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Load Dimensions

Read dimensions from `audit-state.json`:

```json
{
  "taste": {
    "dimensions": [
      {
        "name": "voice_fidelity",
        "category": "content",
        "weight": 0.40,
        "floor": 2.5
      }
    ]
  }
}
```

## Step 2: Score Each Dimension

For each dimension:

1. **Gather evidence:**
   - Review code that produces outputs
   - Examine actual outputs/samples
   - Test user flows
   - Check error handling

2. **Apply rubric:**
   | Score | General Meaning |
   |-------|-----------------|
   | 5 | Exceeds expectations, delightful |
   | 4 | Meets expectations, minor issues |
   | 3 | Acceptable, has rough edges |
   | 2 | Below expectations, frustrating |
   | 1 | Fails to meet basic requirements |

3. **Document evidence:**
   ```yaml
   dimension: voice_fidelity
   score: 3.2
   evidence:
     - "Generated tweets occasionally sound generic"
     - "Personality markers present but inconsistent"
     - "Tone matches target ~70% of time"
   ```

## Step 3: Calculate Weighted Scores

**Category score:**
```
category_score = Σ(dimension_score × dimension_weight)
```

**Overall score:**
```
overall_score = Σ(category_score × category_weight)
```

Example:
```
Content: (voice: 3.2×0.4) + (topic: 4.1×0.35) + (engage: 2.4×0.25) = 3.32
UX: (responsive: 4.0×0.3) + (feedback: 2.8×0.3) + ... = 3.48
Overall: (content: 3.32×0.6) + (ux: 3.48×0.4) = 3.38
```

## Step 4: Identify Gaps

A **gap** exists when `score < floor`:

| Gap Type | Condition | Priority |
|----------|-----------|----------|
| Critical | score < floor AND floor >= 3.0 | P1 |
| Significant | score < floor AND floor < 3.0 | P2 |

Gap format:
```yaml
id: TG-001
category: content
dimension: engagement
score: 2.4
floor: 2.5
status: gap
evidence:
  - "Content lacks hooks"
  - "Repetitive structure"
traced_failure_modes: []  # Populated in REVIEW by taste-trace
```

## Step 5: Determine Ship Status

Apply quality gates:

| Overall Score | Status | Action |
|---------------|--------|--------|
| >= ship threshold | SHIP | Ready to launch |
| >= polish threshold | POLISH_THEN_SHIP | Address gaps, then launch |
| < fix threshold | FIX_FIRST | Must improve before launch |

**Special rule:** If ANY critical gap exists, status cannot be SHIP.

## Step 6: Generate Deliverables

### TASTE-EVAL.md

```markdown
# Taste Evaluation

**Project:** [name]
**Eval Source:** [manifest | convention | defaults]
**Timestamp:** [ISO 8601]

## Summary

| Metric | Value |
|--------|-------|
| Overall Score | 3.38 |
| Ship Status | POLISH_THEN_SHIP |
| Gaps Found | 2 |
| Critical Gaps | 1 |

## Dimension Scores

### Content Quality (weight: 60%)

| Dimension | Weight | Score | Floor | Status |
|-----------|--------|-------|-------|--------|
| voice_fidelity | 40% | 3.2 | 2.5 | ✓ |
| topic_relevance | 35% | 4.1 | 3.0 | ✓ |
| engagement | 25% | 2.4 | 2.5 | ✗ GAP |

**Category Score:** 3.32

### UX Quality (weight: 40%)

| Dimension | Weight | Score | Floor | Status |
|-----------|--------|-------|-------|--------|
| responsiveness | 30% | 4.0 | 3.0 | ✓ |
| feedback_clarity | 30% | 2.8 | 3.0 | ✗ GAP |

**Category Score:** 3.48

## Evidence

### voice_fidelity: 3.2
- Generated tweets occasionally sound generic
- Personality markers present but inconsistent

### engagement: 2.4 (GAP)
- Content lacks compelling hooks
- Structure becomes repetitive
- Missing variety in templates
```

### TASTE-GAPS.md

```markdown
# Taste Gaps

**Project:** [name]
**Gaps Found:** 2
**Critical:** 1

## TG-001: engagement (CRITICAL)

| Attribute | Value |
|-----------|-------|
| Category | content |
| Score | 2.4 |
| Floor | 2.5 |
| Delta | -0.1 |
| Pipeline | P2 (likely) |

**Evidence:**
- Content lacks compelling hooks
- Structure becomes repetitive
- Missing variety in templates

**Traced Failure Modes:** *(populated by taste-trace)*

---

## TG-002: feedback_clarity (SIGNIFICANT)

| Attribute | Value |
|-----------|-------|
| Category | ux |
| Score | 2.8 |
| Floor | 3.0 |
| Delta | -0.2 |
| Pipeline | U2 (likely) |

**Evidence:**
- Loading states unclear during generation
- Change summaries often missing
```

## Validation

Before completing, verify:

- [ ] All dimensions have scores (1-5)
- [ ] All scores have at least one evidence item
- [ ] Category scores are calculated correctly
- [ ] Overall score matches weighted calculation
- [ ] All gaps are identified (score < floor)
- [ ] Ship status matches quality gates
- [ ] TASTE-EVAL.md is generated
- [ ] TASTE-GAPS.md is generated (even if empty)

## Common Issues

| Issue | Resolution |
|-------|------------|
| Can't evaluate dimension | Mark as N/A, explain why, exclude from averages |
| Score is borderline | Round to nearest 0.5, document uncertainty |
| No evidence available | Cannot score - request access or mark as blocked |
| Conflicting evidence | Average the implied scores, note the conflict |
