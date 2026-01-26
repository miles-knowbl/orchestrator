# Gate Prompts

Templates for gate approval prompts, deliverable checklists, skip-with-reason logic, and approval type handling. Gates are the human-in-the-loop enforcement mechanism that ensures quality at each phase transition.

## Prompt Structure

Every gate prompt follows the same visual structure:

```
====================================================================
|  {GATE NAME}                                                      |
|                                                                   |
|  {Context line: what is ready for review}                         |
|                                                                   |
|  Deliverables:                                                    |
|    {check/cross} {deliverable-1} ({status})                       |
|    {check/cross} {deliverable-2} ({status})                       |
|                                                                   |
|  Commands:                                                        |
|    approved     --- Pass gate, continue to {next phase}           |
|    changes: ... --- Request modifications                         |
|    show {item}  --- Display deliverable                           |
====================================================================
```

Unicode box-drawing characters create the border. Use `=` for top/bottom, `|` for sides. This renders consistently in all terminal environments.

## Gate Type Templates

### Human Approval Gate

The most common type. Blocks until the user explicitly says `approved`.

```markdown
====================================================================
|  {GATE_NAME} GATE                                                 |
|                                                                   |
|  {DELIVERABLE}.md is ready for review.                            |
|                                                                   |
|  Deliverables:                                                    |
|    [check] {DELIVERABLE-1}.md (created, {size} bytes)             |
|    [check] {DELIVERABLE-2}.md (created, {size} bytes)             |
|                                                                   |
|  Commands:                                                        |
|    approved     --- Pass gate, continue to {NEXT_PHASE}           |
|    changes: ... --- Request modifications                         |
|    show {name}  --- Display a deliverable                         |
====================================================================
```

**Generation rule:** Used when `gate.approvalType === "human"`.

### Conditional Gate

Blocks only when a condition is met. If the condition is not met, the gate passes automatically with a notification.

```markdown
====================================================================
|  {GATE_NAME} GATE                                                 |
|                                                                   |
|  Condition: {condition description}                               |
|                                                                   |
|  {IF CONDITION MET}                                               |
|  Deliverables require review:                                     |
|    [check] {DELIVERABLE}.md (created)                             |
|                                                                   |
|  Commands:                                                        |
|    approved     --- Pass gate, continue to {NEXT_PHASE}           |
|    changes: ... --- Request modifications                         |
|                                                                   |
|  {IF CONDITION NOT MET}                                           |
|  Condition not met --- gate auto-passed.                          |
|  Continuing to {NEXT_PHASE}...                                    |
====================================================================
```

**Generation rule:** Used when `gate.approvalType === "conditional"`. The condition description must be derived from the gate context (e.g., "backend infrastructure present").

### Auto Gate

Passes automatically after deliverable verification. No user action required, but a notification is shown.

```markdown
====================================================================
|  {GATE_NAME} GATE                                                 |
|                                                                   |
|  Verifying deliverables...                                        |
|                                                                   |
|    [check] {DELIVERABLE-1}.md exists (verified)                   |
|    [check] {DELIVERABLE-2}.md exists (verified)                   |
|    [check] Content validation passed                              |
|                                                                   |
|  Gate auto-passed. Continuing to {NEXT_PHASE}...                  |
====================================================================
```

**Generation rule:** Used when `gate.approvalType === "auto"` or when the gate only checks for file existence.

## Deliverable Checklist Generation

For each gate, generate a deliverable checklist from `gate.deliverables`:

```
Deliverable check for gate "{gate.id}":

For each file in gate.deliverables:
  1. Check file exists
  2. Check file has content (> 0 bytes)
  3. Check file has expected structure (if known)

Status indicators:
  [check]  = file exists and validated
  [cross]  = file missing or empty
  [warn]   = file exists but validation failed
```

### Checklist Template

```markdown
Deliverables:
  {status} {FILE-1}.md ({detail})
  {status} {FILE-2}.md ({detail})

Where:
  {status} = checkmark (exists + valid) | cross (missing) | warning (exists, invalid)
  {detail} = "created, 2,450 bytes" | "MISSING" | "exists, validation failed"
```

## Skip Logic

Gates can be skipped with explicit justification. The skip syntax and rules differ based on whether the gate is required.

### Skip Syntax

```
skip-gate {gate-id} --reason "{justification}"
```

### Required Gate Skip

When a required gate is skipped, emit a warning:

```markdown
WARNING: {GATE_NAME} is a REQUIRED gate.

Skipping required gates may compromise quality assurance.
The skip reason will be logged in the state file.

Reason provided: "{justification}"

Proceeding to {NEXT_PHASE}...

State updated:
  gates.{gate-id}.status = "skipped"
  gates.{gate-id}.skippedReason = "{justification}"
```

### Optional Gate Skip

When an optional gate is skipped:

```markdown
Gate {GATE_NAME} skipped.

Reason: "{justification}"
Proceeding to {NEXT_PHASE}...
```

### Skip Validation Rules

| Rule | Enforcement |
|------|------------|
| `--reason` flag is required | Skip fails without a reason |
| Reason must be >10 characters | Prevents empty or trivial reasons |
| Required gate skip logs a warning | Warning is visible in output |
| Skip is recorded in state file | `skippedReason` field populated |
| Skip cannot be undone | Once skipped, gate status is permanent |

## Gate Ordering

Gates are ordered by their `afterPhase` field. The generation process must place gate prompts in the execution flow at the correct position:

```
Phase execution order from loop.json:
  INIT -> SCAFFOLD -> IMPLEMENT -> TEST -> VERIFY -> REVIEW -> SHIP -> COMPLETE

Gate placement:
  After INIT     -> spec-gate prompt
  After SCAFFOLD -> architecture-gate prompt
  After REVIEW   -> review-gate prompt
  After SHIP     -> deploy-gate prompt (if required)
```

### No-Gate Phases

Phases without a gate after them flow directly to the next phase with a transition notification:

```markdown
Phase {CURRENT} complete. Proceeding to {NEXT}...
```

## Contextual Enrichment

Gate prompts should include contextual information when available:

| Context | Source | Example |
|---------|--------|---------|
| Deliverable size | File system check | "2,450 bytes" |
| Section count | Content parsing | "18 sections" |
| Capability count | Content parsing | "3 capabilities defined" |
| Coverage metric | Skill output | "92% coverage achieved" |
| Warning count | Validation | "2 non-blocking warnings" |

## Quick Reference

```markdown
Gate prompt generation:
1. Determine gate type (human / conditional / auto)
2. Select template based on type
3. Insert gate name, deliverables, next phase
4. Generate deliverable checklist
5. Add contextual enrichment if available
6. Add skip-gate instructions

Gate types:
  human       -> Full prompt, blocks for "approved"
  conditional -> Checks condition, blocks or auto-passes
  auto        -> Checks deliverables, auto-passes

Skip rules:
  --reason is always required
  Required gates emit warnings
  Skips are permanent and logged
```
