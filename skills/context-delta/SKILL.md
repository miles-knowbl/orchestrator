---
name: context-delta
description: "The Reflexive phase of ADIR reasoning. Audits the frame itself after Abductive-Deductive-Inductive analysis, producing a Context Delta that captures what to keep, discard, add, reweight, test next, and guard against."
phase: VALIDATE
category: operations
version: "1.0.0"
depends_on: [retrospective, skill-verifier, calibration-tracker]
tags: [meta, adir, reflexive, learning, improvement]
---

# Context Delta

Produce the Reflexive output of ADIR reasoning.

## When to Use

- **After retrospective** — Distill learnings into actionable deltas
- **After calibration** — Formalize belief updates
- **After pattern detection** — Decide what patterns to keep or discard
- **At learning-loop completion** — Produce improvement proposals

## Core Concept

Context Delta answers: **"What changed in our understanding, and what should we do about it?"**

This is the **R** in ADIR:

```
A (Abductive)  → retrospective generates hypotheses from observations
D (Deductive)  → skill-verifier derives testable predictions
I (Inductive)  → calibration-tracker updates beliefs from results
R (Reflexive)  → context-delta audits the frame & produces delta
```

## Context Delta Structure

```json
{
  "timestamp": "ISO-8601",
  "source": "learning-loop execution ID",
  "delta": {
    "keep": [
      "Patterns and beliefs that survived testing"
    ],
    "discard": [
      "Assumptions invalidated by evidence"
    ],
    "add": [
      "Newly discovered constraints or opportunities"
    ],
    "reweight": {
      "belief-id": { "from": 0.5, "to": 0.8, "evidence": "..." }
    },
    "next_tests": [
      "1-3 highest-leverage experiments to run"
    ],
    "guardrails": [
      "Failure modes to avoid going forward"
    ]
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `CONTEXT-DELTA.md` | Working directory | Always |
| `context-delta.json` | `memory/deltas/` | Always (append to history) |

## The Reflexive Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REFLEXIVE PROCESS (ADIR Phase R)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUTS (from A-D-I phases)                                                 │
│  ──────────────────────────                                                 │
│                                                                             │
│  From retrospective (A):                                                    │
│    • Observations about what happened                                       │
│    • Hypotheses about why                                                   │
│    • Initial improvement ideas                                              │
│                                                                             │
│  From skill-verifier (D):                                                   │
│    • Predictions tested against reality                                     │
│    • Skill gaps identified                                                  │
│    • Verification results                                                   │
│                                                                             │
│  From calibration-tracker (I):                                              │
│    • Estimate accuracy data                                                 │
│    • Updated multipliers                                                    │
│    • Confidence levels                                                      │
│                                                                             │
│  REFLEXIVE ANALYSIS                                                         │
│  ──────────────────────                                                     │
│                                                                             │
│  1. AUDIT THE FRAME                                                         │
│     └─→ What assumptions were we operating under?                           │
│     └─→ Which assumptions were validated?                                   │
│     └─→ Which assumptions were invalidated?                                 │
│                                                                             │
│  2. CLASSIFY LEARNINGS                                                      │
│     └─→ Keep: Stable truths that held up                                    │
│     └─→ Discard: Beliefs proven wrong                                       │
│     └─→ Add: New knowledge discovered                                       │
│     └─→ Reweight: Beliefs that need confidence adjustment                   │
│                                                                             │
│  3. PROJECT FORWARD                                                         │
│     └─→ Next tests: What experiments would resolve remaining uncertainty?   │
│     └─→ Guardrails: What failure modes should we avoid?                     │
│                                                                             │
│  OUTPUT                                                                     │
│  ──────                                                                     │
│                                                                             │
│  CONTEXT-DELTA.md + context-delta.json                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Delta Categories

### Keep
Patterns, beliefs, or approaches that **survived testing**:
- Skill that performed well
- Estimate approach that was accurate
- Pattern that consistently worked

**Evidence required:** Must cite specific validation (test passed, estimate within 20%, pattern succeeded N times)

### Discard
Assumptions **invalidated by evidence**:
- Skill that consistently failed
- Estimate bias identified
- Pattern that didn't hold

**Evidence required:** Must cite specific failure (test failed, estimate off by >50%, pattern broke N times)

### Add
**Newly discovered** constraints or opportunities:
- New pattern observed
- New failure mode identified
- New capability needed

**Evidence required:** Must cite observation source (run archive, verification, user feedback)

### Reweight
Beliefs that need **confidence adjustment**:
- Increased confidence after validation
- Decreased confidence after partial failure
- Uncertainty resolved or introduced

**Format:**
```json
{
  "agentic-speed-multiplier": {
    "from": 0.3,
    "to": 0.25,
    "evidence": "3 more runs confirmed faster execution"
  }
}
```

### Next Tests
**1-3 highest-leverage experiments** that would resolve remaining uncertainty:
- Should be specific and actionable
- Should target the biggest unknowns
- Should be feasible in near-term

**Format:** Each test should specify what we're testing and how we'd know if it worked.

### Guardrails
**Failure modes to avoid** going forward:
- Anti-patterns observed
- Edge cases that broke things
- Constraints that must be respected

**Format:** Each guardrail should specify the failure mode and the constraint that prevents it.

## Example Context Delta

```markdown
## Context Delta: Learning Loop Run 2026-02-04

### Keep
- **Agentic execution multiplier (0.3x)** — Validated across 5 runs, consistent results
- **PAT-004 terrain-check** — Correctly identified uphill moments in 8/10 cases
- **Guarantee validation at gates** — Caught 3 issues that would have shipped broken

### Discard
- **"Documentation phase is always fast"** — Took 2x estimated in 3/5 runs
- **"Brownfield is just greenfield with constraints"** — Requires fundamentally different approach

### Add
- **New pattern: Phase-skip detection** — When VERIFY has no tests, skip to VALIDATE
- **New constraint: Max 3 skills per phase** — More than 3 causes cognitive overload
- **New opportunity: Parallel skill execution** — Would speed up IMPLEMENT phase 40%

### Reweight
| Belief | From | To | Evidence |
|--------|------|-----|----------|
| Documentation time estimate | 1.0x | 1.5x | 3 runs showed consistent overrun |
| Test generation accuracy | 0.7 | 0.85 | Improved after skill update |
| Gate approval time | 5min | 2min | Auto-gates working well |

### Next Tests
1. **Parallel skills in IMPLEMENT** — Try running implement + test-generation concurrently
2. **Brownfield-specific loop** — Test abbreviated phase sequence for existing codebases
3. **Voice status updates** — Test comprehension while mobile (jogging)

### Guardrails
- **Never skip VERIFY for greenfield** — Caught critical bugs in 2 runs
- **Don't auto-approve human gates** — User review caught design issues
- **Limit autonomous runs to 2 hours** — Longer runs drift from intent
```

## Integration with Dreaming (Passive Mode)

In **active mode** (learning-loop), context-delta runs explicitly after A-D-I phases.

In **passive mode** (dreaming), the same Context Delta structure is produced automatically:
- Dreaming runs ADIR cycle on execution history
- Context Deltas accumulate as "dream proposals"
- User reviews deltas when returning from idle

## Mode-Specific Behavior

### Active Mode (Learning Loop)
- Runs after retrospective, skill-verifier, calibration-tracker
- Requires human review of delta before applying
- Changes are applied immediately after approval

### Passive Mode (Dreaming - Future)
- Runs automatically during idle periods
- Accumulates deltas for batch review
- Changes queued until user returns

## Verification Checklist

```markdown
## context-delta Verification

### Inputs Gathered
- [ ] Retrospective findings reviewed
- [ ] Skill verification results incorporated
- [ ] Calibration data considered

### Delta Categories Complete
- [ ] Keep: Items have validation evidence
- [ ] Discard: Items have invalidation evidence
- [ ] Add: Items have observation source
- [ ] Reweight: Items have before/after/evidence
- [ ] Next tests: 1-3 specific experiments identified
- [ ] Guardrails: Failure modes and constraints specified

### Outputs Created
- [ ] CONTEXT-DELTA.md in working directory
- [ ] context-delta.json appended to memory/deltas/
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Running only A-D-I without R | Conclusions but no meta-learning | Always complete the cycle |
| Skipping to R without A-D-I | Opinions without evidence | Ensure inputs are gathered |
| Keeping everything | No pruning of bad beliefs | Be willing to discard |
| Discarding without evidence | Premature optimization | Require failure evidence |
| Vague next_tests | "Test more things" | Specify concrete experiments |
| Generic guardrails | "Be careful" | Specify exact failure modes |

---

> The Reflexive phase is what turns experience into wisdom.
> Without it, you have data. With it, you have learning.
