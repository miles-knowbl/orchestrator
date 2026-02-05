---
name: code-validation
description: "Semantic correctness checks at development checkpoints. Use before committing, before PR, or at feature milestones to verify the code solves the right problem correctly. Evaluates requirements alignment, edge case coverage, failure modes, operational readiness, and integration correctness. Complements code-verification (structural) with semantic analysis."
phase: VALIDATE
category: engineering
version: "1.0.0"
depends_on: [code-verification]
tags: [validation, semantics, logic, correctness, core-workflow]
---

# Code Validation

Semantic correctness checks for development checkpoints. Ensures code solves the intended problem correctly and completely.

## When to Use

- **Before committing** — "Is this feature complete?"
- **Before opening PR** — "Is this ready for review?"
- **At milestones** — "Does this increment deliver value?"
- **After major changes** — "Did refactoring preserve behavior?"
- When you say: "validate this", "is this complete?", "am I missing anything?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `requirements-alignment.md` | How to verify requirements coverage |
| `edge-cases.md` | Common edge cases to check |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `failure-modes.md` | When validating error handling |
| `integration-correctness.md` | When validating integrations |
| `operational-readiness.md` | When validating for production |

**Verification:** Ensure VALIDATION.md is produced with all categories addressed.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `VALIDATION.md` | Project root | Always |

## Core Concept

Validation answers: **"Did we build the right thing?"**

This is distinct from verification ("Did we build it correctly?"). Validation requires understanding intent—it can't be fully automated. It asks:

- Does this actually solve the stated problem?
- What inputs or scenarios weren't considered?
- What happens when things go wrong?
- Is this ready for production?

## Relationship to Verification

| Aspect | Verification | Validation |
|--------|--------------|------------|
| Question | "Is this structurally sound?" | "Does this solve the problem?" |
| Focus | Code patterns | Requirements + behavior |
| Speed | Fast (seconds) | Deliberate (minutes) |
| Trigger | Auto, every iteration | Explicit checkpoint |
| Automation | Fully automatable | Requires judgment |

**Run verification first.** If verification fails, fix structural issues before validation. Validation assumes the code is structurally sound.

## Validation Dimensions

Six dimensions, each with guiding questions:

### 1. Requirements Alignment

**Question:** Does this code actually solve what was asked?

**Check for:**
- Spec-to-implementation traceability — can you map each requirement to code?
- Scope creep — does it do MORE than asked? (often a smell)
- Scope gap — does it do LESS than asked?
- Implicit requirements — what wasn't stated but was assumed?
- Acceptance criteria — if defined, are they all met?

**Key questions:**
- "What was the user actually trying to accomplish?"
- "If I demo this, will they say 'yes, that's what I wanted'?"
- "What did I assume that wasn't explicitly stated?"

→ See `references/requirements-alignment.md`

### 2. Edge Case Coverage

**Question:** What inputs or scenarios weren't considered?

**Check for:**
- Boundary values — 0, 1, -1, MAX_INT, empty string, empty array
- Null/undefined/missing — what if required data isn't there?
- Type variations — what if string instead of number? Array instead of object?
- Unicode/i18n — special characters, RTL text, emoji, long strings
- Timing — what if slow? What if instant? What if never?
- State — what if called twice? Out of order? During shutdown?

**Key questions:**
- "What's the weirdest valid input?"
- "What's the most malicious valid input?"
- "What happens at the boundaries?"

→ See `references/edge-cases.md`

### 3. Failure Mode Analysis

**Question:** What happens when dependencies fail?

**Check for:**
- External service failures — API down, slow, returning errors
- Database failures — connection lost, query timeout, constraint violation
- Resource exhaustion — out of memory, disk full, rate limited
- Partial failures — some items succeed, some fail
- Cascading failures — does this failure cause other failures?

**Key questions:**
- "What are all the external dependencies?"
- "For each: what if it's down? Slow? Wrong?"
- "What's the blast radius if this fails?"

→ See `references/failure-modes.md`

### 4. Operational Readiness

**Question:** Is this ready to run in production?

**Check for:**
- Observability — can you tell if it's working? Logs? Metrics? Traces?
- Configurability — are magic numbers configurable? Environment-specific?
- Deployment — any migration needed? Feature flags? Rollback plan?
- Documentation — how does someone operate this at 3 AM?
- Alerting — what should page someone?

**Key questions:**
- "How will I know this is broken in production?"
- "What does the runbook look like?"
- "Can this be rolled back?"

→ See `references/operational-readiness.md`

### 5. Integration Correctness

**Question:** Does this work with the rest of the system?

**Check for:**
- API contracts — does this match what callers expect?
- Data contracts — does this produce/consume the right schema?
- State management — does this interact correctly with shared state?
- Event/message contracts — correct format, correct topics?
- Backward compatibility — does this break existing clients?

**Key questions:**
- "What calls this? What does this call?"
- "If I change this interface, what breaks?"
- "Is there a contract test?"

→ See `references/integration-correctness.md`

### 6. Scalability Assessment

**Question:** What happens at 10x the current load?

**Check for:**
- Hot paths — what runs most frequently?
- Data growth — what if the table has 10M rows instead of 10K?
- Concurrency — what if 100 users do this simultaneously?
- Resource scaling — does this need more memory/CPU/connections?
- Bottleneck identification — what's the first thing to break?

**Key questions:**
- "What's N in production? What if N × 10?"
- "Where's the bottleneck?"
- "What's the scaling strategy?"

→ See `references/scalability-assessment.md`

## Workflow

### Standard Validation (Pre-PR)

```
1. Confirm verification passed (if not, run code-verification first)
2. Gather context:
   - What was the requirement/spec?
   - What changed? (diff if available)
   - What's the deployment context?
3. Evaluate each dimension:
   - Requirements alignment
   - Edge case coverage
   - Failure mode analysis
   - Operational readiness
   - Integration correctness
   - Scalability assessment
4. Synthesize findings:
   - Blockers (must fix before merge)
   - Recommendations (should fix)
   - Notes (nice to have / future work)
5. Verdict: READY / NOT READY with reasoning
```

### Quick Validation (Checkpoint)

For mid-development checkpoints, focus on:
1. Requirements alignment — "Am I still solving the right problem?"
2. Edge cases — "What am I not handling yet?"
3. Integration — "Will this work with the rest of the system?"

Skip operational readiness and scalability until closer to PR.

## Output Format

### Structured Output

```json
{
  "validation_result": "NOT_READY",
  "summary": "Core functionality complete but missing error handling for external API failures",
  "dimensions": {
    "requirements_alignment": {
      "status": "pass",
      "notes": "All acceptance criteria addressed"
    },
    "edge_cases": {
      "status": "pass",
      "notes": "Boundary conditions handled, null checks present"
    },
    "failure_modes": {
      "status": "fail",
      "blockers": [
        {
          "issue": "No handling for payment API timeout",
          "impact": "User sees generic error, order state unknown",
          "suggestion": "Add timeout handling with retry and idempotency key"
        }
      ]
    },
    "operational_readiness": {
      "status": "warn",
      "recommendations": [
        "Add metrics for payment processing duration",
        "Add alert for payment failure rate > 5%"
      ]
    },
    "integration_correctness": {
      "status": "pass",
      "notes": "API contract matches OpenAPI spec"
    },
    "scalability_assessment": {
      "status": "pass",
      "notes": "Query uses indexed columns, pagination in place"
    }
  },
  "blockers": 1,
  "recommendations": 2,
  "notes": 0
}
```

### Conversational Output

> **Validation: NOT READY**
>
> Core functionality is solid—requirements are met, edge cases handled, integration looks correct. However:
>
> **Blockers (1):**
> - Payment API timeout isn't handled. If the API is slow, users see a generic error and the order state is unknown. Add timeout handling with retry logic and idempotency keys.
>
> **Recommendations (2):**
> - Add metrics for payment processing duration
> - Add alert for payment failure rate > 5%
>
> Fix the blocker, then this is ready for review.

## Validation Without Spec

Sometimes there's no formal spec. In that case:

1. **Infer intent** from code, commit messages, PR description, conversation
2. **State your understanding** explicitly before validating
3. **Ask clarifying questions** if intent is ambiguous
4. **Validate against inferred requirements** with caveat

Example:
> "Based on the code and commit message, I understand this feature should:
> 1. Allow users to export orders as CSV
> 2. Include all orders from the last 30 days
> 3. Support filtering by status
>
> Is this correct? Validating against these assumptions..."

## Integration with Development Loop

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT LOOP                      │
│                                                          │
│   ┌──────┐    ┌───────────┐    ┌────────────────────┐   │
│   │ spec │───▶│ implement │───▶│ code-verification  │   │
│   └──────┘    └───────────┘    │ (auto, every iter) │   │
│                     ▲          └─────────┬──────────┘   │
│                     │                    │              │
│                     │ fix issues         │ pass        │
│                     │                    ▼              │
│                     │          ┌────────────────────┐   │
│                     └──────────│ code-validation    │   │
│                      fail      │ (explicit checkpoint)│  │
│                                └─────────┬──────────┘   │
│                                          │              │
│                                          │ ready        │
│                                          ▼              │
│                                   ┌─────────────┐       │
│                                   │ code-review │       │
│                                   └─────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## Key Principles

**Judgment over automation.** Validation requires understanding what the code should do. The checklist helps structure thinking, but the answers require judgment.

**Context is critical.** A feature for an internal tool has different validation criteria than a public API. Adjust scrutiny to risk.

**Blockers are binary.** Either something must be fixed before merge, or it's a recommendation. Don't hedge with "maybe blockers."

**Missing requirements are findings.** If validation reveals the spec was incomplete, that's valuable. Document what was assumed or discovered.

**Validate early, validate often.** Don't wait until PR to discover you solved the wrong problem. Quick validation at milestones catches drift early.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `spec` | Validation checks against spec; good spec makes validation easier |
| `code-verification` | Run verification first; validation assumes structural soundness |
| `code-review` | Invokes validation as Pass 2 of PR review |
| `test-generation` | Validation findings often become test cases |
| `debug-assist` | Validation may reveal issues that need debugging |

## Mode-Specific Behavior

Validation scope and criteria differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full system validation against FEATURESPEC.md |
| **Approach** | Comprehensive validation of all six dimensions |
| **Patterns** | Free choice of validation criteria |
| **Deliverables** | Full VALIDATION.md with all dimensions |
| **Validation** | Standard validation checklist |
| **Constraints** | Minimal—validate what was specified |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific validation + integration boundaries |
| **Approach** | Extend existing validation with gap focus |
| **Patterns** | Should match existing validation practices |
| **Deliverables** | Delta validation for gap scope |
| **Validation** | Existing tests + new gap validation |
| **Constraints** | Don't break existing functionality |

**Polish considerations:**
- Does gap fill the identified need?
- Does gap integrate with existing code correctly?
- Are existing tests still passing?
- Is existing functionality unchanged?

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific validation against CR |
| **Approach** | Surgical validation of change boundaries only |
| **Patterns** | Must conform exactly to enterprise validation policy |
| **Deliverables** | Change record with validation evidence |
| **Validation** | Full regression + security review |
| **Constraints** | Requires approval for any validation scope expansion |

**Enterprise validation requirements:**
- Change implements CR exactly—no more, no less
- No unintended side effects
- Rollback capability verified
- All validation results documented
- Security impact assessed

**Enterprise validation checklist:**
- [ ] Change matches CR specification exactly
- [ ] No scope creep detected
- [ ] Existing behavior unchanged
- [ ] Regression tests pass
- [ ] Rollback procedure tested
- [ ] Security review complete

---

## References

- `references/requirements-alignment.md`: Spec-to-code traceability techniques
- `references/edge-cases.md`: Comprehensive edge case checklist
- `references/failure-modes.md`: Failure analysis framework
- `references/operational-readiness.md`: Production readiness checklist
- `references/integration-correctness.md`: Contract validation techniques
- `references/scalability-assessment.md`: Load and growth analysis
