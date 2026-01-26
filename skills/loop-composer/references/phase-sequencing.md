# Phase Sequencing Reference

Rules and guidance for ordering phases within a loop. Phase sequencing is the structural backbone of every loop -- get it wrong and skills execute in an invalid order.

## Canonical Phase Order

Every loop must respect the canonical ordering. Phases can be omitted but never reordered.

```
Position 1:  INIT        -- Requirements, context, specification
Position 2:  SCAFFOLD    -- Architecture, project structure, design
Position 3:  IMPLEMENT   -- Core implementation, coding
Position 4:  TEST        -- Test generation and execution
Position 5:  VERIFY      -- Structural verification (lint, types, complexity)
Position 6:  VALIDATE    -- Semantic validation (correctness, performance)
Position 7:  DOCUMENT    -- Documentation generation
Position 8:  REVIEW      -- Code review, architecture review
Position 9:  SHIP        -- Deployment, release, distribution
Position 10: COMPLETE    -- Loop finalization, metrics, cleanup
Special:     META        -- Meta-operations (outside standard flow)
```

## Phase Categories

### Always Required

| Phase | Why |
|-------|-----|
| INIT | Every loop must begin somewhere -- requirements, context, or specification |
| COMPLETE | Every loop must finalize -- cleanup, metrics, state transitions |

### Typically Required

| Phase | Why |
|-------|-----|
| IMPLEMENT | Most loops produce something -- code, documents, analysis |
| SCAFFOLD | Design before implementation prevents rework |

### Conditionally Required

| Phase | Include When |
|-------|-------------|
| TEST | Loop produces code that needs testing |
| VERIFY | Loop produces code that needs structural checking |
| VALIDATE | Loop needs semantic correctness checks |
| REVIEW | Loop output needs human quality assessment |

### Typically Optional

| Phase | Include When |
|-------|-------------|
| DOCUMENT | Loop output needs documentation beyond the deliverables themselves |
| SHIP | Loop output needs to be deployed or distributed |

## Valid Phase Subsets

Not every loop needs all 10 phases. Here are common valid subsets:

### Minimal (3 phases)
```
INIT → IMPLEMENT → COMPLETE
```
Use for: Quick prototypes, focused tasks, scripting.

### Standard (5 phases)
```
INIT → SCAFFOLD → IMPLEMENT → REVIEW → COMPLETE
```
Use for: Features that need design and review but not full testing infrastructure.

### Quality (7 phases)
```
INIT → SCAFFOLD → IMPLEMENT → TEST → VERIFY → REVIEW → COMPLETE
```
Use for: Production code with testing and verification.

### Full (9 phases)
```
INIT → SCAFFOLD → IMPLEMENT → TEST → VERIFY → DOCUMENT → REVIEW → SHIP → COMPLETE
```
Use for: Full engineering lifecycle with documentation and deployment.

### Research (4 phases)
```
INIT → SCAFFOLD → IMPLEMENT → COMPLETE
```
Use for: Proposal loops, analysis pipelines, content creation.

## Phase Transition Rules

### Valid Transitions

Any phase can transition to any later phase in the canonical order. Skipping phases is valid.

```
INIT → SCAFFOLD       (standard next)
INIT → IMPLEMENT      (skip SCAFFOLD)
INIT → COMPLETE       (skip everything -- degenerate but valid)
SCAFFOLD → IMPLEMENT  (standard next)
SCAFFOLD → REVIEW     (skip middle phases)
IMPLEMENT → TEST      (standard next)
IMPLEMENT → COMPLETE  (skip quality phases)
```

### Invalid Transitions

A phase can NEVER transition to an earlier phase. Loops do not cycle.

```
IMPLEMENT → INIT       (INVALID -- backward)
REVIEW → IMPLEMENT     (INVALID -- backward)
COMPLETE → INIT        (INVALID -- backward, loops don't repeat)
```

### META Phase

The META phase is special -- it exists outside the canonical order and is used for meta-skills that operate on the loop itself (like loop-controller during certain operations). In practice, META is rarely used in loop.json definitions.

## Phase-Skill Mapping Guidance

While any skill CAN be assigned to any phase, the following are conventional assignments:

| Phase | Natural Skills | Anti-pattern |
|-------|---------------|--------------|
| INIT | spec, entry-portal, requirements, context-ingestion | Putting implementation skills in INIT |
| SCAFFOLD | architect, scaffold, context-cultivation | Putting review skills in SCAFFOLD |
| IMPLEMENT | implement, error-handling, priority-matrix | Putting spec skills in IMPLEMENT |
| TEST | test-generation, integration-test | Putting deployment in TEST |
| VERIFY | code-verification | Putting documentation in VERIFY |
| VALIDATE | code-validation, perf-analysis | Skipping validation for security-critical code |
| DOCUMENT | document | Excessive documentation for prototypes |
| REVIEW | code-review, security-audit | Review before implementation |
| SHIP | deploy, distribute | Shipping without review |
| COMPLETE | loop-controller, proposal-builder | Non-finalization skills in COMPLETE |

## Required vs Optional Decision Matrix

| Factor | Mark Required | Mark Optional |
|--------|--------------|---------------|
| Loop cannot succeed without this phase | Yes | -- |
| Phase produces a deliverable that downstream phases need | Yes | -- |
| Phase has a required gate after it | Yes | -- |
| Phase is INIT or COMPLETE | Yes | -- |
| Phase adds value but loop can succeed without it | -- | Yes |
| Phase is domain-specific, not universally needed | -- | Yes |
| Stakeholder may choose to skip at runtime | -- | Yes |
| Phase is DOCUMENT or SHIP | Usually | Yes |

## Phase Ordering Validation Algorithm

```
Given: phases[] from loop.json

canonical = [INIT, SCAFFOLD, IMPLEMENT, TEST, VERIFY, VALIDATE, DOCUMENT, REVIEW, SHIP, COMPLETE]

For i = 0 to phases.length - 1:
  Assert phases[i].name is in canonical
  If i > 0:
    Assert indexOf(canonical, phases[i].name) > indexOf(canonical, phases[i-1].name)

Assert phases[0].name == "INIT"
Assert phases[phases.length - 1].name == "COMPLETE"
Assert no duplicate phase names
```

Any violation of these assertions is a composition error that must be fixed before the loop can be saved.
