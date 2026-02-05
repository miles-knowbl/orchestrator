---
name: quality-eval-design
description: "Design content and UX quality evaluation frameworks. Creates scoring rubrics, defines evaluation methodology, and produces eval documentation that can be used for ongoing quality assessment."
phase: REVIEW
category: engineering
version: "1.0.0"
depends_on: [pipeline-discovery, ui-pipeline-discovery]
tags: [audit, quality, evaluation, content, ux]
---

# Quality Eval Design

Design content and UX quality evaluation frameworks.

## When to Use

- **After pipeline discovery** — Runs in REVIEW phase once pipelines are known
- **Creating quality standards** — Define what "good" looks like for this system
- **Enabling ongoing evaluation** — Produce reusable eval frameworks
- When you say: "design quality evals", "create scoring rubrics", "define quality standards"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `content-dimensions.md` | Common content quality dimensions |
| `ux-dimensions.md` | UX quality dimensions |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `eval-methodology.md` | How to run evaluations |

**Verification:** Eval frameworks are specific to what the system produces.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `CONTENT-QUALITY-EVALS.md` | Project root | If system generates content |
| `UX-QUALITY-EVALS.md` | Project root | Always (UI exists) |

## Core Concept

Quality Eval Design answers: **"What does 'good' look like for this system?"**

Evaluations should be:
- **System-specific** — Tailored to what this system produces
- **Measurable** — 5-point scale with clear rubrics
- **Evidence-based** — Examples of each score level
- **Reusable** — Can be run repeatedly over time

## Eval Design Process

```
┌─────────────────────────────────────────────────────────────┐
│               QUALITY EVAL DESIGN PROCESS                   │
│                                                             │
│  1. IDENTIFY OUTPUTS                                        │
│     └─→ What does this system produce?                     │
│                                                             │
│  2. DETERMINE CATEGORIES                                    │
│     ├─→ Content? (text, images, data)                      │
│     └─→ UX? (always yes for interactive systems)          │
│                                                             │
│  3. SELECT DIMENSIONS                                       │
│     └─→ What matters for each output type?                 │
│                                                             │
│  4. DEFINE WEIGHTS                                          │
│     └─→ How important is each dimension?                   │
│                                                             │
│  5. CREATE RUBRICS                                          │
│     └─→ What does 1-5 look like for each dimension?        │
│                                                             │
│  6. SET FLOORS                                              │
│     └─→ What's the minimum acceptable score?               │
│                                                             │
│  7. DOCUMENT EXAMPLES                                       │
│     └─→ Concrete examples of each score level              │
└─────────────────────────────────────────────────────────────┘
```

## Content Quality Dimensions

Common dimensions for content-generating systems:

| Dimension | Description | Applies To |
|-----------|-------------|------------|
| voice_fidelity | Matches intended voice/persona | All generated text |
| topic_relevance | Addresses intended topic | All generated text |
| engagement | Interesting, holds attention | Social, marketing |
| accuracy | Factually correct | Informational |
| clarity | Easy to understand | Documentation, instructions |
| coherence | Logical flow and structure | Long-form content |
| originality | Fresh, not generic | Creative content |

## UX Quality Dimensions

Common dimensions for interactive systems:

| Dimension | Description | Weight |
|-----------|-------------|--------|
| responsiveness | UI responds quickly | 25% |
| feedback_clarity | Clear loading/success/error states | 25% |
| error_recovery | User can recover from errors | 20% |
| state_consistency | UI shows current state | 20% |
| accessibility | Keyboard, screen reader, contrast | 10% |

## Rubric Template

```markdown
### dimension_name
- **Weight:** NN%
- **Floor:** N.N
- **Description:** What this dimension measures

#### Scoring Rubric
| Score | Label | Definition |
|-------|-------|------------|
| 5 | Excellent | Exceeds expectations; delightful |
| 4 | Good | Meets expectations; minor issues |
| 3 | Acceptable | Functional; has rough edges |
| 2 | Poor | Below expectations; frustrating |
| 1 | Failed | Does not meet basic requirements |

#### Evidence Examples
- Score 5: "{Concrete example of excellent}"
- Score 3: "{Concrete example of acceptable}"
- Score 1: "{Concrete example of failed}"
```

## Output Format

### CONTENT-QUALITY-EVALS.md

```markdown
# Content Quality Evaluations

Measures the quality of AI-generated content in [system name].

## Content Types

| Type | Pipeline | Description |
|------|----------|-------------|
| Twitter Thread | P2 | Generated tweet threads |
| Article | P2 | Long-form articles |
| Caption | P3 | Image captions |

## Dimensions

### voice_fidelity
- **Weight:** 40%
- **Floor:** 2.5
- **Description:** Generated content matches the intended voice and persona

#### Scoring Rubric
| Score | Label | Definition |
|-------|-------|------------|
| 5 | Excellent | Indistinguishable from target voice; natural, authentic |
| 4 | Good | Clearly in target voice; minor inconsistencies |
| 3 | Acceptable | Generally correct voice; occasionally generic |
| 2 | Poor | Voice inconsistent; often wrong |
| 1 | Failed | No resemblance to target voice |

#### Evidence Examples
- Score 5: "Thread captures creator's signature humor and catchphrases naturally"
- Score 3: "Thread is professional but lacks creator's distinctive style"
- Score 1: "Thread sounds like corporate press release despite casual persona"

[... more dimensions ...]

## Evaluation Methodology

1. Sample 5 outputs from each content type
2. Score each dimension 1-5
3. Calculate weighted average
4. Compare against quality gates
```

### UX-QUALITY-EVALS.md

```markdown
# UX Quality Evaluations

Measures the user experience of [system name].

## Dimensions

### responsiveness
- **Weight:** 25%
- **Floor:** 3.0
- **Description:** UI responds quickly to user actions

#### Scoring Rubric
| Score | Label | Definition |
|-------|-------|------------|
| 5 | Excellent | Instant response (<100ms); feels native |
| 4 | Good | Quick response (<500ms); smooth |
| 3 | Acceptable | Noticeable delay (<2s); usable |
| 2 | Poor | Slow response (2-5s); frustrating |
| 1 | Failed | Very slow or hangs (>5s) |

[... more dimensions ...]

## Evaluation Methodology

1. Walk through each U-series pipeline
2. Score each dimension at each step
3. Note specific issues as evidence
4. Calculate weighted average
```

## Quality Gates

Define ship thresholds:

| Weighted Score | Status | Action |
|----------------|--------|--------|
| >= 4.0 | Ship | Ready to launch |
| 3.0 - 4.0 | Polish then ship | Address gaps first |
| < 3.0 | Fix before ship | Significant issues |

## Validation Checklist

- [ ] All system outputs identified
- [ ] Relevant categories selected (content/UX)
- [ ] Dimensions tailored to this system
- [ ] Weights sum to 100% per category
- [ ] Rubrics have clear score definitions
- [ ] Floors set for each dimension
- [ ] Examples provided where helpful
- [ ] Methodology documented
