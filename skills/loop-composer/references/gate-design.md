# Gate Design Reference

Comprehensive guide to designing and placing gates within loops. Gates are the human-in-the-loop mechanism that provides oversight, quality control, and decision authority at critical points in the workflow.

## Gate Purpose

Gates serve three functions:

1. **Quality checkpoint** -- Ensure the output of preceding phases meets standards before continuing
2. **Decision point** -- Allow humans to approve, redirect, or abort based on intermediate results
3. **Audit trail** -- Create a documented record of approvals and reviews for compliance

## Gate Types

### Human Gate

```json
{
  "id": "spec-gate",
  "name": "Specification Approval",
  "afterPhase": "INIT",
  "required": true,
  "approvalType": "human",
  "deliverables": ["FEATURESPEC.md"]
}
```

**Behavior:** Loop pauses. Human reviews deliverables. Human explicitly approves or rejects.

**Use when:**
- Decisions are consequential and hard to reverse (architecture, spec, final review)
- Stakeholder sign-off is required
- Output quality cannot be assessed programmatically
- Trust in the automation is still being established

### Conditional Gate

```json
{
  "id": "deploy-gate",
  "name": "Deployment Approval",
  "afterPhase": "SHIP",
  "required": false,
  "approvalType": "conditional",
  "deliverables": []
}
```

**Behavior:** Gate auto-clears if a condition is met (e.g., phase actually ran). Blocks if condition is not met.

**Use when:**
- Gate is needed only if an optional phase executed
- Approval depends on runtime state rather than human judgment
- Deployment gating (only gate if SHIP phase was included)

### Automated Gate

```json
{
  "id": "test-gate",
  "name": "Test Verification",
  "afterPhase": "TEST",
  "required": true,
  "approvalType": "automated",
  "deliverables": ["test-results.json"]
}
```

**Behavior:** Programmatic check runs automatically. Gate clears if check passes, blocks if check fails.

**Use when:**
- Pass/fail criteria are objective and measurable
- Tests, linting, coverage thresholds, type checks
- Speed is important and human review adds no value
- Loop is configured for semi-autonomous or autonomous execution

## Gate Placement Rules

### Rule 1: After Decision Boundaries

Place gates where the cost of proceeding with a bad decision is high:

| Boundary | Why Gate Here | Example |
|----------|---------------|---------|
| After INIT | Wrong spec leads to building the wrong thing | Spec Gate |
| After SCAFFOLD | Wrong architecture is expensive to refactor | Architecture Gate |
| After REVIEW | Merging bad code is hard to undo | Review Gate |
| After COMPLETE | Final output needs stakeholder sign-off | Final Gate |

### Rule 2: Deliverable-Backed

Every human gate should reference specific deliverables the reviewer examines. Gates without deliverables force reviewers to assess the phase's effect holistically, which is unreliable.

```
GOOD: "deliverables": ["FEATURESPEC.md"]
      (Reviewer reads the spec)

BAD:  "deliverables": []
      (Reviewer must somehow assess "was INIT done well?")
```

Exception: Conditional and automated gates may have empty deliverables when the gate logic is programmatic.

### Rule 3: Match Phase Required-ness

| Phase Required? | Gate Required? | Valid? |
|-----------------|----------------|--------|
| Yes | Yes | Valid -- required phase, required gate |
| Yes | No | Valid -- required phase, optional gate (skip-able review) |
| No | Yes | INVALID -- cannot require gate on optional phase |
| No | No | Valid -- optional phase, optional gate |

### Rule 4: Diminishing Returns

Each gate adds latency (waiting for human). Add gates only where the expected value of review exceeds the cost of delay.

| Phases | Recommended Gates | Rationale |
|--------|-------------------|-----------|
| 3 (minimal) | 1 gate (after INIT) | Minimal overhead for minimal loop |
| 5 (standard) | 2 gates (INIT, REVIEW) | Bookend review -- start and end |
| 7 (quality) | 3 gates (INIT, SCAFFOLD, REVIEW) | Design review + output review |
| 9 (full) | 3-4 gates (INIT, SCAFFOLD, REVIEW, SHIP) | Full oversight |

### Rule 5: No Adjacent Gates

Avoid placing gates after consecutive phases. If phases P1 and P2 are adjacent and both have gates, consider whether one gate after P2 covers both.

## Autonomy and Gate Interaction

The loop's `defaults.autonomy` affects how gates behave:

### Supervised (default)

```
All gates active.
Human gates: require explicit approval.
Conditional gates: evaluate condition, block if unmet.
Automated gates: run checks, block if failed.
```

### Semi-Autonomous

```
Critical gates active (required: true, approvalType: "human").
Non-critical gates: auto-clear with notification.
Automated gates: run checks silently.
```

### Autonomous

```
All gates auto-clear.
Human notification sent at each gate point.
Automated gates still enforce pass/fail.
Loop runs to completion unless automated gate fails.
```

## Gate Design Checklist

When designing gates for a new loop:

```markdown
- [ ] Identified the 2-3 highest-consequence decision points
- [ ] Each human gate has deliverables to review
- [ ] No required gate on an optional phase
- [ ] Gate count is proportional to loop length (not 1:1 with phases)
- [ ] Gate IDs are unique and follow naming convention
- [ ] Gate names are descriptive for the approval UI
- [ ] Autonomy level is consistent with gate types chosen
- [ ] Conditional gates have clear auto-clear conditions
- [ ] Automated gates have measurable pass/fail criteria
```

## Gate Naming Convention

```
[context]-gate

Examples:
  spec-gate           (after INIT, reviews specification)
  architecture-gate   (after SCAFFOLD, reviews architecture)
  test-gate           (after TEST, verifies test results)
  review-gate         (after REVIEW, approves code review)
  deploy-gate         (after SHIP, approves deployment)
  context-gate        (after INIT in proposal loops)
  cultivation-gate    (after SCAFFOLD in proposal loops)
  priorities-gate     (after IMPLEMENT in proposal loops)
  final-gate          (after COMPLETE, final sign-off)
```

## Common Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Gate after every phase | Excessive latency, reviewer fatigue | Only gate at decision boundaries |
| Gate with no deliverables | Reviewer has nothing concrete to assess | Add deliverable references |
| Required gate on optional phase | Loop blocks on a phase that may not run | Make gate optional or phase required |
| All automated gates on supervised loop | Contradicts supervision intent | Use human gates for critical points |
| Human gate on trivial phase | Delays loop for no value | Remove gate or make automated |

## Real-World Gate Configurations

### Engineering Loop (4 gates)

```
INIT ──[spec-gate: human]──→ SCAFFOLD ──[architecture-gate: human]──→
IMPLEMENT → TEST → VERIFY → DOCUMENT →
REVIEW ──[review-gate: human]──→ SHIP ──[deploy-gate: conditional]──→ COMPLETE
```

### Proposal Loop (4 gates)

```
INIT ──[context-gate: human]──→ SCAFFOLD ──[cultivation-gate: human]──→
IMPLEMENT ──[priorities-gate: human]──→ COMPLETE ──[final-gate: human]──→ END
```

### Lightweight Loop (1 gate)

```
INIT ──[approval-gate: human]──→ IMPLEMENT → COMPLETE
```

### Autonomous Loop (2 automated gates)

```
INIT → IMPLEMENT → TEST ──[test-gate: automated]──→
VERIFY ──[verify-gate: automated]──→ COMPLETE
```
