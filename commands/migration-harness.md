# /migration-harness Command

**Single entry point for technology migrations.** Move between frameworks, databases, or architectures with rollback safety through a structured 9-phase pipeline.

## Purpose

This command orchestrates high-risk technology transitions: planning the migration path, checking compatibility, implementing changes, validating rollback capability, and deploying with confidence. Migrations are the highest-risk engineering operation — this loop has the most gates of any harness (6) to match.

**The flow you want:** define your migration (e.g., "Postgres to CockroachDB"), say `go`, and the loop handles planning, compatibility, implementation, rollback validation, and deployment.

## Usage

```
/migration-harness [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing migration-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | IMPLEMENT | TEST | VERIFY | VALIDATE | REVIEW | SHIP | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if migration-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, define migration scope
```

### Step 2: Initialize State

Create `migration-state.json`:

```json
{
  "loop": "migration-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "plan-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "architecture-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "verification-gate": { "status": "pending", "required": true, "approvalType": "auto" },
    "validation-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "review-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "deploy-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["migration-planner"] },
    "SCAFFOLD": { "status": "pending", "skills": ["architect", "compatibility-checker"] },
    "IMPLEMENT": { "status": "pending", "skills": ["implement"] },
    "TEST": { "status": "pending", "skills": ["test-generation", "integration-test"] },
    "VERIFY": { "status": "pending", "skills": ["code-verification"] },
    "VALIDATE": { "status": "pending", "skills": ["rollback-validator"] },
    "REVIEW": { "status": "pending", "skills": ["code-review"] },
    "SHIP": { "status": "pending", "skills": ["deploy"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────────► SCAFFOLD ──────────► IMPLEMENT ──────────► TEST
  │                │
  │ [plan-gate]    │ [architecture-gate]
  │  human         │  human
  ▼                ▼
migration-planner architect             implement          test-generation
                  compatibility-checker                     integration-test

  ▼                ▼                     ▼                    ▼

VERIFY ──────────► VALIDATE ──────────► REVIEW ──────────► SHIP
  │                  │                    │                   │
  │ [verification]   │ [validation-gate]  │ [review-gate]    │ [deploy-gate]
  │  auto            │  human             │  human           │  human
  ▼                  ▼                    ▼                  ▼
code-verification  rollback-validator   code-review        deploy

  ▼

COMPLETE
  ▼
retrospective
```

**9 skills across 9 phases, 6 gates (5 human, 1 auto) — the most gates of any loop**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `plan-gate` | INIT | human | User says `approved` | MIGRATION-PLAN.md |
| `architecture-gate` | SCAFFOLD | human | User says `approved` | ARCHITECTURE.md, COMPATIBILITY-REPORT.md |
| `verification-gate` | VERIFY | auto | Build passes, tests pass, lint clean | VERIFICATION.md |
| `validation-gate` | VALIDATE | human | User says `approved` | ROLLBACK-REPORT.md |
| `review-gate` | REVIEW | human | User says `approved` | CODE-REVIEW.md |
| `deploy-gate` | SHIP | human | User says `approved` | Deploy artifacts |

**Gate presentation (validation-gate):**
```
═══════════════════════════════════════════════════════════════
║  VALIDATION GATE                                            ║
║                                                             ║
║  ROLLBACK-REPORT.md ready for review.                       ║
║  Rollback tested: full reversal in 3m 12s                   ║
║  Data integrity: verified (0 records lost)                  ║
║  Rollback trigger: documented and scripted                  ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to REVIEW             ║
║    changes: ... — Request additional rollback testing        ║
║    show rollback — Display ROLLBACK-REPORT.md               ║
═══════════════════════════════════════════════════════════════
```

## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current human gate |
| `changes: [feedback]` | Request changes at gate |
| `pause` | Stop after current skill |
| `skip [skill]` | Skip a skill (requires reason) |
| `show [deliverable]` | Display a deliverable |
| `phase [name]` | Jump to specific phase |

## State Files

| File | Purpose |
|------|---------|
| `migration-state.json` | Current phase, gate status, progress |
| `MIGRATION-PLAN.md` | Migration strategy, timeline, risk assessment |
| `ARCHITECTURE.md` | Target architecture design |
| `COMPATIBILITY-REPORT.md` | Source/target compatibility analysis |
| `VERIFICATION.md` | Build/test/lint results |
| `ROLLBACK-REPORT.md` | Rollback procedure and validation results |
| `CODE-REVIEW.md` | Migration code quality review |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /migration-harness

Migration Harness v1.0.0: Starting technology migration...

  No existing migration state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Migration Loop v1.0.0                     ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 9                                          ║
  ║  Gates: plan → architecture → verification(auto)    ║
  ║         → validation → review → deploy              ║
  ║  Risk level: HIGH (6 gates enforced)                ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Migration Harness: Starting INIT phase...

  [1/1] migration-planner → What are you migrating?

User: Migrate from Express.js to Fastify. 45 routes, 12 middleware,
      PostgreSQL stays the same. Need zero-downtime cutover.

  [1/1] migration-planner → Planning migration path...
        ✓ MIGRATION-PLAN.md
          Source: Express.js 4.18
          Target: Fastify 4.x
          Scope: 45 routes, 12 middleware adapters
          Strategy: parallel run with traffic splitting
          Estimated effort: 3 iterations
          Risk: medium (middleware compatibility)

  ✓ INIT phase complete

  ═══════════════════════════════════════════════════════
  ║  PLAN GATE                                          ║
  ║                                                     ║
  ║  MIGRATION-PLAN.md ready for review.                ║
  ║  Strategy: parallel run with traffic splitting.     ║
  ║                                                     ║
  ║  Say 'approved' to continue to SCAFFOLD.            ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: plan-gate ✓

Migration Harness: Starting SCAFFOLD phase...
  [1/2] architect → Designing target architecture...
  [2/2] compatibility-checker → Checking middleware compatibility...
  ...
```
