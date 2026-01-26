---
name: loop-controller
description: "Orchestrates the engineering loop execution. Manages state machine transitions, decides what to do next, handles failures and retries, determines completion, and triggers human handoffs. The 'brain' that runs the autonomous development cycle."
phase: META
category: meta
version: "1.0.0"
depends_on: []
tags: [meta, orchestration, control]
---

# Loop Controller

The execution brain of the agentic harness.

## When to Use

- **Starting a system build** — Initialize loop state and begin execution
- **Resuming work** — Determine where to continue after cold boot
- **After any skill completes** — Decide what's next
- **On failure** — Determine retry strategy or escalation
- **At checkpoints** — Decide if human approval needed

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `decision-trees.md` | State transition logic |
| `gate-procedures.md` | How to handle stage gates |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `failure-handling.md` | When handling failures/retries |
| `autonomy-configuration.md` | When configuring autonomy mode |
| `loop-state-schema.json` | When initializing/updating state |

**Verification:** Ensure loop-state.json is accurate and transitions are valid.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `loop-state.json` | `domain-memory/{domain}/` | Always (maintained) |

## Core Concept

Loop Controller answers: **"What should I do next?"**

It maintains execution state and makes orchestration decisions so the agent doesn't have to reason about the loop itself — just execute the current skill.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LOOP CONTROLLER                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      STATE MACHINE                                   │   │
│  │                                                                      │   │
│  │  INIT → SCAFFOLD → IMPLEMENT → TEST → VERIFY → VALIDATE →          │   │
│  │         DOCUMENT → REVIEW → SHIP → COMPLETE                         │   │
│  │                                                                      │   │
│  │  Any stage can transition to: FAILED → RETRY or BLOCKED             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      DECISION ENGINE                                 │   │
│  │                                                                      │   │
│  │  Current State + Context → Next Action                               │   │
│  │                                                                      │   │
│  │  • What skill to invoke?                                             │   │
│  │  • Is human approval needed?                                         │   │
│  │  • Should we retry or escalate?                                      │   │
│  │  • Is the system complete?                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Loop State Machine

### States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOOP STATES                                          │
│                                                                             │
│  ┌──────────┐                                                               │
│  │   INIT   │ ─── Load context, verify prerequisites                        │
│  └────┬─────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐                                                               │
│  │ SCAFFOLD │ ─── Create project structure, setup config                    │
│  └────┬─────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                            │
│  │IMPLEMENT │────▶│   TEST   │────▶│  VERIFY  │ ─── Per-capability loop    │
│  └────┬─────┘     └────┬─────┘     └────┬─────┘                            │
│       │                │                │                                   │
│       │◀───────────────┴────────────────┘ (next capability)                │
│       │                                                                     │
│       ▼ (all capabilities done)                                            │
│  ┌──────────┐                                                               │
│  │ VALIDATE │ ─── Full system validation (security, perf, integration)     │
│  └────┬─────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐                                                               │
│  │ DOCUMENT │ ─── Generate/update documentation                             │
│  └────┬─────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐                                                               │
│  │  REVIEW  │ ─── Self-review, prepare PR                                   │
│  └────┬─────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐                                                               │
│  │   SHIP   │ ─── Create PR, await approval, merge                          │
│  └────┬─────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐                                                               │
│  │ COMPLETE │ ─── Update queue, create handoff, trigger next system         │
│  └──────────┘                                                               │
│                                                                             │
│  ─────────────────────── FAILURE STATES ───────────────────────             │
│                                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                            │
│  │  FAILED  │────▶│  RETRY   │────▶│ BLOCKED  │                            │
│  └──────────┘     └──────────┘     └──────────┘                            │
│       │                                   │                                 │
│       └─── Auto-retry if retries remain   │                                 │
│                                           └─── Human intervention needed    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State Definitions

| State | Description | Entry Condition | Exit Condition |
|-------|-------------|-----------------|----------------|
| `INIT` | Load context, verify ready | System claimed from queue | Context loaded, worktree ready |
| `SCAFFOLD` | Create project structure | Init complete | Structure exists, builds |
| `IMPLEMENT` | Write code for capability | Scaffold done or prev capability done | Code written |
| `TEST` | Write tests for capability | Implementation done | Tests written |
| `VERIFY` | Run verification checks | Tests done | Lint, types, tests pass |
| `VALIDATE` | Full system validation | All capabilities done | Security, perf, integration pass |
| `DOCUMENT` | Generate documentation | Validation passed | Docs updated |
| `REVIEW` | Self-review, prep PR | Docs done | PR ready |
| `SHIP` | Create PR, await merge | Review done | PR merged |
| `COMPLETE` | Finalize, update queue | PR merged | Queue updated, handoff created |
| `FAILED` | Something went wrong | Any check fails | Retry initiated or blocked |
| `RETRY` | Attempting fix | Failure with retries left | Back to failed stage or blocked |
| `BLOCKED` | Needs human help | Max retries exceeded | Human resolves |

## Loop State File

Store execution state in `loop-state.json`:

```json
{
  "systemId": "sys-002",
  "systemName": "Work Order Service",
  "githubIssue": 123,
  "branch": "feature/system-work-orders",
  "worktree": ".worktrees/system-work-orders",
  
  "state": "IMPLEMENT",
  "stateEnteredAt": "2024-01-17T10:30:00Z",
  
  "capabilities": {
    "total": 5,
    "completed": 2,
    "current": "work-order-assignment",
    "remaining": ["status-transitions", "completion-flow"]
  },
  
  "stages": {
    "INIT": { "status": "complete", "completedAt": "2024-01-17T09:00:00Z" },
    "SCAFFOLD": { "status": "complete", "completedAt": "2024-01-17T09:30:00Z" },
    "IMPLEMENT": { "status": "in-progress", "startedAt": "2024-01-17T09:35:00Z" },
    "TEST": { "status": "pending" },
    "VERIFY": { "status": "pending" },
    "VALIDATE": { "status": "pending" },
    "DOCUMENT": { "status": "pending" },
    "REVIEW": { "status": "pending" },
    "SHIP": { "status": "pending" },
    "COMPLETE": { "status": "pending" }
  },
  
  "failures": {
    "count": 1,
    "maxRetries": 3,
    "history": [
      {
        "stage": "VERIFY",
        "capability": "work-order-creation",
        "error": "Type error in WorkOrder model",
        "timestamp": "2024-01-17T10:15:00Z",
        "resolution": "Fixed type definition",
        "resolvedAt": "2024-01-17T10:25:00Z"
      }
    ]
  },
  
  "gates": {
    "architecture": { "required": false },
    "security": { "required": true, "status": "pending" },
    "database": { "required": true, "status": "approved", "approvedBy": "dba@company.com" },
    "deploy": { "required": true, "status": "pending" }
  },
  
  "checkpoints": [
    { "type": "commit", "hash": "abc1234", "message": "feat: work order model", "at": "..." },
    { "type": "commit", "hash": "def5678", "message": "feat: create endpoint", "at": "..." }
  ],
  
  "updatedAt": "2024-01-17T10:30:00Z"
}
```

### Skills Logging

Track which skills are invoked, why, and how long they take:

```json
{
  "skillsUsage": {
    "entry-portal": 1,
    "spec": 1,
    "estimation": 1,
    "architect": 0,
    "scaffold": 0,
    "implement": 0,
    "...": 0
  },
  
  "skillsLog": [
    {
      "skill": "entry-portal",
      "reason": "New domain: define dream state and systems",
      "startedAt": "2025-01-17T21:48:00Z",
      "completedAt": "2025-01-17T22:00:00Z",
      "durationMs": 720000,
      "status": "complete",
      "deliverables": ["dream-state.md", "system-queue.json"],
      "referencesRead": ["clarifying-questions.md", "system-decomposition.md"],
      "children": [
        {
          "skill": "spec",
          "reason": "Generate FEATURESPEC for first system",
          "startedAt": "2025-01-17T21:52:00Z",
          "completedAt": "2025-01-17T21:55:00Z",
          "durationMs": 180000,
          "status": "complete",
          "deliverables": ["FEATURESPEC.md"]
        }
      ]
    }
  ]
}
```

**skillsUsage** — Count of invocations per skill for this system. Provides at-a-glance view of which skills are being used heavily vs rarely.

**skillsLog** — Sequential log with full details:

| Field | Description |
|-------|-------------|
| `skill` | Skill name |
| `reason` | Why this skill was invoked |
| `startedAt` | When skill execution began |
| `completedAt` | When skill finished |
| `durationMs` | Execution time in milliseconds |
| `status` | complete, failed, skipped |
| `deliverables` | Files produced |
| `referencesRead` | Reference docs consulted |
| `children` | Nested skill invocations (e.g., entry-portal → spec) |

**Logging rules:**
- Create log entry when skill starts
- Update with completion time and deliverables when skill finishes
- Increment skillsUsage count on completion
- Nested calls appear as children of parent skill
- Failed skills remain in log with status: failed

### Velocity Tracking Integration

For real-time velocity monitoring, also append to `metrics.skillHistory` when each skill completes:

```json
{
  "metrics": {
    "skillsInvoked": 5,
    "skillHistory": [
      {
        "skill": "implement",
        "timestamp": "2025-01-18T10:30:00Z",
        "durationMs": 1800000
      }
    ]
  }
}
```

**Required fields:**
- `skill`: Name of the skill invoked
- `timestamp`: ISO-8601 completion timestamp
- `durationMs`: Duration in milliseconds (optional but recommended)

This enables velocity-tracker's loop-monitor to detect skill invocations in real-time and display them in the dashboard.

→ See `references/loop-state-schema.json`

## Decision Engine

### Main Decision Loop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DECISION ALGORITHM                                    │
│                                                                             │
│  function decideNextAction(loopState, context):                             │
│                                                                             │
│    1. CHECK BLOCKED                                                         │
│       if state == BLOCKED:                                                  │
│         return { action: "WAIT_FOR_HUMAN", reason: blockedReason }          │
│                                                                             │
│    2. CHECK GATES                                                           │
│       gate = getPendingGate(loopState)                                      │
│       if gate and gate.required:                                            │
│         return { action: "WAIT_FOR_APPROVAL", gate: gate }                  │
│                                                                             │
│    3. CHECK FAILURE                                                         │
│       if state == FAILED:                                                   │
│         if failures.count < maxRetries:                                     │
│           return { action: "RETRY", stage: lastFailedStage }                │
│         else:                                                               │
│           return { action: "ESCALATE", reason: "Max retries exceeded" }     │
│                                                                             │
│    4. DETERMINE NEXT STATE                                                  │
│       nextState = getNextState(currentState, context)                       │
│       skill = getSkillForState(nextState)                                   │
│       return { action: "EXECUTE_SKILL", state: nextState, skill: skill }    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State Transitions

```javascript
function getNextState(current, context) {
  switch (current) {
    case "INIT":
      return "SCAFFOLD";
      
    case "SCAFFOLD":
      return "IMPLEMENT";
      
    case "IMPLEMENT":
      return "TEST";
      
    case "TEST":
      return "VERIFY";
      
    case "VERIFY":
      if (context.capabilities.remaining.length > 0) {
        // More capabilities to implement
        return "IMPLEMENT";
      }
      return "VALIDATE";
      
    case "VALIDATE":
      return "DOCUMENT";
      
    case "DOCUMENT":
      return "REVIEW";
      
    case "REVIEW":
      return "SHIP";
      
    case "SHIP":
      if (context.prMerged) {
        return "COMPLETE";
      }
      return "SHIP"; // Wait for merge
      
    case "COMPLETE":
      return null; // Done
      
    default:
      throw new Error(`Unknown state: ${current}`);
  }
}
```

### State to Skill Mapping

| State | Primary Skill | Supporting Skills |
|-------|--------------|-------------------|
| `INIT` | `memory-manager` (cold boot) | `git-workflow` |
| `SCAFFOLD` | `scaffold` | `architect` |
| `IMPLEMENT` | `implement` | — |
| `TEST` | `test-generation` | — |
| `VERIFY` | `code-verification` | `debug-assist` on failure |
| `VALIDATE` | `code-validation` | `security-audit`, `perf-analysis`, `integration-test` |
| `DOCUMENT` | `document` | — |
| `REVIEW` | `code-review` | — |
| `SHIP` | `git-workflow` | — |
| `COMPLETE` | `memory-manager` (handoff) | `entry-portal` (queue update) |

### Hard Verification Gates

**Build and tests MUST pass before any stage transition.** This is enforced, not optional.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VERIFICATION GATE (HARD REQUIREMENT)                      │
│                                                                             │
│  BEFORE transitioning from any state:                                       │
│                                                                             │
│  1. RUN BUILD                                                               │
│     npm run build  (or equivalent)                                          │
│     → If fails: STOP, invoke debug-assist, fix, retry                       │
│                                                                             │
│  2. RUN TESTS (if tests exist)                                              │
│     npm test  (or equivalent)                                               │
│     → If fails: STOP, invoke debug-assist, fix, retry                       │
│                                                                             │
│  3. RUN LINT (if configured)                                                │
│     npm run lint  (or equivalent)                                           │
│     → If fails: STOP, fix lint errors, retry                                │
│                                                                             │
│  4. LOG VERIFICATION                                                        │
│     Record in journey-log: { verification: "pass", timestamp: ... }         │
│                                                                             │
│  ONLY proceed to next state if ALL checks pass                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Transition | Required Checks | On Failure |
|------------|-----------------|------------|
| SCAFFOLD → IMPLEMENT | Build compiles | Fix build errors |
| IMPLEMENT → TEST | Build compiles | Fix build errors |
| TEST → VERIFY | Build + Tests pass | Fix failing tests |
| VERIFY → VALIDATE | Build + Tests + Lint | Fix all issues |
| VALIDATE → DOCUMENT | Build + Tests | Fix regressions |
| DOCUMENT → REVIEW | Build + Tests | Fix regressions |
| REVIEW → SHIP | Build + Tests + Approved | Wait for approval |

**No exceptions.** Autonomous execution must never ship broken code.

## Failure Handling

### Failure Detection

| Check Type | Failure Signal | Severity |
|------------|---------------|----------|
| Build | Non-zero exit code | High |
| Lint | Lint errors | Medium |
| Type check | Type errors | High |
| Unit tests | Test failures | High |
| Integration tests | Test failures | High |
| Security scan | Critical/High findings | High |
| Performance | Exceeds thresholds | Medium |

### Retry Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RETRY STRATEGY                                       │
│                                                                             │
│  On Failure:                                                                │
│                                                                             │
│  1. CAPTURE                                                                 │
│     • Error message and stack trace                                         │
│     • Failing file/line if available                                        │
│     • Test output if test failure                                           │
│                                                                             │
│  2. DIAGNOSE                                                                │
│     • Invoke debug-assist skill                                             │
│     • Form hypotheses                                                       │
│     • Identify likely root cause                                            │
│                                                                             │
│  3. FIX                                                                     │
│     • Apply targeted fix                                                    │
│     • Do NOT change unrelated code                                          │
│     • Commit fix separately                                                 │
│                                                                             │
│  4. VERIFY FIX                                                              │
│     • Re-run failed check                                                   │
│     • Ensure fix doesn't break other tests                                  │
│     • Run full verification suite                                           │
│                                                                             │
│  5. CONTINUE OR ESCALATE                                                    │
│     • If fixed: continue to next state                                      │
│     • If still failing: increment retry counter                             │
│     • If max retries: transition to BLOCKED                                 │
│                                                                             │
│  Retry Limits:                                                              │
│     • Default: 3 retries per failure                                        │
│     • Same error: 2 retries (don't keep trying same thing)                  │
│     • Different error: Reset counter                                        │
│     • Total failures: 10 max before forced BLOCKED                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Escalation to Human

Transition to BLOCKED when:
- Max retries exceeded
- Circular failure (fix breaks something else, fixing that breaks original)
- Security finding requires human decision
- External dependency unavailable
- Ambiguous requirement discovered

Blocked state message:
```markdown
## 🚫 BLOCKED: [System Name]

**Reason:** [Why blocked]
**Last Failure:** [Error details]
**Retry Attempts:** [X] / [Max]

**What was tried:**
1. [Attempt 1]
2. [Attempt 2]
3. [Attempt 3]

**Human action needed:**
[Specific ask]

**To resume:**
1. Resolve the issue
2. Update loop-state.json: set state to [resume state]
3. Run loop controller
```

→ See `references/failure-handling.md`

## Verification Gates (Hard Requirements)

**Build and tests MUST pass before any stage transition.** This is a hard gate, not optional.

### Verification Matrix

| Transition | Required Checks | Block If |
|------------|-----------------|----------|
| SCAFFOLD → IMPLEMENT | Build compiles | Build fails |
| IMPLEMENT → TEST | Build compiles | Build fails |
| TEST → VERIFY | Build + Unit tests | Any test fails |
| VERIFY → VALIDATE | Build + All tests + Lint | Verification fails |
| VALIDATE → DOCUMENT | Build + All tests | Validation fails |
| REVIEW → SHIP | Build + All tests + Review approved | Any check fails |

### Verification Protocol

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HARD VERIFICATION GATE                                    │
│                                                                             │
│  BEFORE any stage transition:                                               │
│                                                                             │
│  1. RUN BUILD                                                               │
│     npm run build  (or equivalent)                                          │
│     If fails → STOP, do not transition                                      │
│                                                                             │
│  2. RUN TESTS                                                               │
│     npm test  (or equivalent)                                               │
│     If fails → STOP, do not transition                                      │
│                                                                             │
│  3. RUN LINT (if configured)                                                │
│     npm run lint  (or equivalent)                                           │
│     If fails → STOP, do not transition                                      │
│                                                                             │
│  4. RECORD RESULT                                                           │
│     Log verification status in journey-log                                  │
│     Update loop-state.json with lastVerification timestamp                  │
│                                                                             │
│  ONLY if all pass → Transition to next stage                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Verification Commands

Standard commands to run (adapt to project):

```bash
# TypeScript/Node
npm run build && npm test && npm run lint

# Python
python -m pytest && python -m flake8 && python -m mypy .

# Django
python manage.py check && python manage.py test

# Rust
cargo build && cargo test && cargo clippy
```

### On Verification Failure

1. **Do NOT proceed to next stage**
2. Invoke `debug-assist` skill to diagnose
3. Fix the issue
4. Re-run verification
5. Only transition when all checks pass

This ensures autonomous execution never ships broken code.

## Mandatory Skill Enforcement

### Phase Skill Requirements

Before transitioning out of any phase, ALL required skills for that phase MUST be completed (or explicitly skipped).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MANDATORY SKILL CHECK                                     │
│                                                                             │
│  BEFORE transitioning from any phase:                                       │
│                                                                             │
│  1. GET REQUIRED SKILLS                                                     │
│     required = skillExecution[currentPhase].required                        │
│                                                                             │
│  2. CHECK COMPLETION                                                        │
│     completed = skillExecution[currentPhase].completed                      │
│     skipped = skillExecution[currentPhase].skipped                          │
│     missing = required - completed - skipped                                │
│                                                                             │
│  3. BLOCK IF MISSING                                                        │
│     if missing.length > 0:                                                  │
│       Display: "⚠️ Cannot proceed: [skill] not invoked"                     │
│       Options:                                                              │
│         - Invoke the skill now                                              │
│         - Skip with reason: skip [skill] --reason "explanation"             │
│       STOP - do not transition                                              │
│                                                                             │
│  4. VERIFY DELIVERABLES                                                     │
│     Run skill-verifier on all completed skills                              │
│     if verification fails: BLOCK                                            │
│                                                                             │
│  5. PROCEED                                                                 │
│     Only if all checks pass → Transition to next phase                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Required Skills by Phase

| Phase | Required Skills |
|-------|-----------------|
| INIT | entry-portal, requirements, spec, estimation, triage, memory-manager |
| SCAFFOLD | architect, architecture-review, scaffold, git-workflow |
| IMPLEMENT | implement |
| TEST | test-generation |
| VERIFY | code-verification (+ debug-assist if tests fail) |
| VALIDATE | code-validation, integration-test, security-audit, perf-analysis |
| DOCUMENT | document |
| REVIEW | code-review, refactor |
| SHIP | deploy, git-workflow |
| COMPLETE | memory-manager, retrospective, calibration-tracker, loop-controller |

### Skip Command

When a mandatory skill cannot be completed, use the skip command:

```bash
skip [skill] --reason "explanation"
```

Example:
```bash
skip git-workflow --reason "No git repo configured, user chose to continue without version control"
skip security-audit --reason "CLI tool with no user input, security audit not applicable"
```

Skips are recorded in:
- `loop-state.json` → `skillExecution[phase].skipped`
- `journey-log.jsonl` → Entry with `status: "skipped"` and `reason`

### Prerequisite Prompts

For skills with external dependencies:

| Skill | Prerequisite | Prompt |
|-------|--------------|--------|
| git-workflow | .git/ directory | "No git repo configured. 'init' to create or 'skip git' to continue without" |
| deploy | Deploy target | "No deploy target configured. Specify target or 'skip deploy' to skip" |

Record prerequisite decisions in `loop-state.json`:
```json
{
  "prerequisites": {
    "git": { "status": "configured|skipped", "prompted": true },
    "deploy": { "status": "configured|skipped", "target": "npm publish", "prompted": true }
  }
}
```

---

## Human Gates

### Gate Types

| Gate | Trigger | Approver | How to Approve |
|------|---------|----------|----------------|
| `architecture` | New patterns, major structural changes | Tech Lead | PR comment: "architecture approved" |
| `security` | Auth, crypto, PII handling | Security Team | Security review checklist |
| `database` | Schema migrations | DBA | Migration review |
| `external` | Third-party API integration | Tech Lead | Integration review |
| `deploy` | Production merge | Release Manager | PR approval |

### Gate Enforcement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GATE CHECK                                           │
│                                                                             │
│  function checkGates(loopState, changesInStage):                            │
│                                                                             │
│    // Determine which gates apply                                           │
│    requiredGates = []                                                       │
│                                                                             │
│    if changesInStage.hasNewArchitecturalPatterns:                           │
│      requiredGates.push("architecture")                                     │
│                                                                             │
│    if changesInStage.touchesSecurity:                                       │
│      requiredGates.push("security")                                         │
│                                                                             │
│    if changesInStage.hasSchemaChanges:                                      │
│      requiredGates.push("database")                                         │
│                                                                             │
│    if changesInStage.hasExternalAPIs:                                       │
│      requiredGates.push("external")                                         │
│                                                                             │
│    // Always require deploy gate for SHIP                                   │
│    if currentState == "REVIEW":                                             │
│      requiredGates.push("deploy")                                           │
│                                                                             │
│    // Check approval status                                                 │
│    for gate in requiredGates:                                               │
│      if not loopState.gates[gate].approved:                                 │
│        return { blocked: true, gate: gate }                                 │
│                                                                             │
│    return { blocked: false }                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Requesting Approval

When gate is required:
1. Create PR (or update existing)
2. Add appropriate label (`needs:security-review`, etc.)
3. Add reviewer
4. Post comment explaining what needs review
5. Transition to waiting state
6. Check periodically for approval

```bash
# Request security review
gh pr edit $PR_NUMBER \
  --add-label "needs:security-review" \
  --add-reviewer @security-team

gh pr comment $PR_NUMBER --body "## Security Review Requested

This PR includes authentication changes:
- JWT token handling in \`src/auth/\`
- Password hashing in \`src/users/\`

Please review per security checklist."
```

→ See `references/gate-procedures.md`

## Completion Criteria

### System Complete When

All must be true:
- [ ] All capabilities implemented
- [ ] All tests passing
- [ ] Code verification passing (lint, types, complexity)
- [ ] Code validation passing (logic, requirements)
- [ ] Security audit passing (no critical/high)
- [ ] Performance targets met
- [ ] Documentation updated
- [ ] Code review self-assessment passing
- [ ] PR approved and merged
- [ ] All required gates approved

### Completion Actions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ON COMPLETION                                         │
│                                                                             │
│  1. UPDATE QUEUE                                                            │
│     • Set system status to "complete"                                       │
│     • Set completedAt timestamp                                             │
│     • Identify newly unblocked systems                                      │
│                                                                             │
│  2. CREATE HANDOFF                                                          │
│     • Document what was built                                               │
│     • Note any deferred items                                               │
│     • Archive to sessions/                                                  │
│                                                                             │
│  3. UPDATE INTERFACES                                                       │
│     • Finalize API contracts                                                │
│     • Update event schemas                                                  │
│     • Notify dependent systems                                              │
│                                                                             │
│  4. CLEAN UP                                                                │
│     • Remove loop-state.json (or archive)                                   │
│     • Remove worktree                                                       │
│     • Delete branch (if configured)                                         │
│                                                                             │
│  5. TRIGGER NEXT                                                            │
│     • Check queue for next ready system                                     │
│     • If found and auto-continue: start next                                │
│     • If found and manual: notify human                                     │
│     • If none: report domain progress                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Running the Loop

### Manual Execution

```bash
# 1. Initialize loop for a system
./loop init sys-002

# 2. Run one iteration
./loop next

# 3. Check status
./loop status

# 4. Run until blocked or complete
./loop run

# 5. Resume after human intervention
./loop resume
```

### Session Integration

At start of session:
```markdown
1. Cold boot (memory-manager)
2. Load loop-state.json
3. Call loop controller: decideNextAction()
4. Execute returned action
5. Update loop-state.json
6. Repeat until session ends or system completes
```

At end of session:
```markdown
1. Complete current skill cleanly (don't leave mid-implementation)
2. Commit any pending changes
3. Update loop-state.json
4. Create session handoff (memory-manager)
5. Save all state files
```

## Loop Commands Reference

### Initialize

```bash
# From queue, claim next ready system
loop init --next

# Specific system
loop init sys-002

# Creates:
# - Worktree
# - loop-state.json
# - Initial branch
```

### Status

```bash
loop status

# Output:
# System: Work Order Service (sys-002)
# State: IMPLEMENT (capability 3/5: work-order-assignment)
# Failures: 1 (resolved)
# Gates: database ✓, security pending
# Last activity: 2024-01-17T10:30:00Z
```

### Next

```bash
loop next

# Executes one state transition:
# 1. Decide next action
# 2. Execute skill
# 3. Update state
# 4. Return
```

### Run

```bash
loop run

# Runs until:
# - COMPLETE reached
# - BLOCKED reached
# - Gate requires approval
# - Max iterations (safety)
```

### Resume

```bash
loop resume

# After human intervention:
# 1. Validates state
# 2. Clears BLOCKED if resolved
# 3. Continues from current state
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| All 17 other skills | Loop controller invokes them based on state |
| `memory-manager` | Provides cold boot and handoff |
| `entry-portal` | Provides systems to build, queue updates |
| `git-workflow` | Provides worktree and PR operations |
| `debug-assist` | Invoked on failures |

## Key Principles

**One state at a time.** Complete current state before transitioning.

**Fail fast, retry smart.** Detect failures immediately, diagnose before retrying.

**Gates are non-negotiable.** Never bypass required human approvals.

**State is sacred.** Always update loop-state.json after any change.

**Clean handoffs.** Never end session with corrupt or ambiguous state.

## References

- `references/loop-state-schema.json`: JSON Schema for state file
- `references/failure-handling.md`: Detailed retry and escalation logic
- `references/gate-procedures.md`: How to request and check approvals
- `references/decision-trees.md`: Visual decision flowcharts
