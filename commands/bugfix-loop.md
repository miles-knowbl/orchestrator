# /bugfix-loop Command

**Single entry point for systematic bug fixing.** From reproduction to verified fix with regression protection through a structured 7-phase pipeline.

## Purpose

This command orchestrates the complete bug resolution workflow: reproducing the issue, diagnosing root cause, implementing the fix, generating regression tests, and verifying the fix holds. It enforces discipline against "shotgun debugging" by requiring confirmed reproduction before any code changes.

**The flow you want:** describe the bug, say `go`, and the loop walks from reproduction through verified fix with regression tests.

## Usage

```
/bugfix-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing bugfix-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | IMPLEMENT | TEST | VERIFY | REVIEW | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if bugfix-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, gather bug report details
```

### Step 2: Initialize State

Create `bugfix-state.json`:

```json
{
  "loop": "bugfix-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "repro-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "diagnosis-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "verification-gate": { "status": "pending", "required": true, "approvalType": "auto" },
    "review-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["bug-reproducer"] },
    "SCAFFOLD": { "status": "pending", "skills": ["debug-assist", "root-cause-analysis"] },
    "IMPLEMENT": { "status": "pending", "skills": ["implement"] },
    "TEST": { "status": "pending", "skills": ["test-generation"] },
    "VERIFY": { "status": "pending", "skills": ["code-verification"] },
    "REVIEW": { "status": "pending", "skills": ["code-review"] },
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
  │ [repro-gate]   │ [diagnosis-gate]
  │  human         │  human
  ▼                ▼
bug-reproducer   debug-assist          implement          test-generation
                 root-cause-analysis

  ▼                ▼                    ▼                    ▼

VERIFY ──────────► REVIEW ──────────► COMPLETE
  │                  │
  │ [verification]   │ [review-gate]
  │  auto            │  human
  ▼                  ▼
code-verification  code-review         retrospective
```

**7 skills across 7 phases, 4 gates (3 human, 1 auto)**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `repro-gate` | INIT | human | User says `approved` | BUG-REPRODUCTION.md |
| `diagnosis-gate` | SCAFFOLD | human | User says `approved` | ROOT-CAUSE.md |
| `verification-gate` | VERIFY | auto | Build passes, tests pass, lint clean | VERIFICATION.md |
| `review-gate` | REVIEW | human | User says `approved` | CODE-REVIEW.md |

**Gate presentation (repro-gate):**
```
═══════════════════════════════════════════════════════════════
║  REPRO GATE                                                 ║
║                                                             ║
║  BUG-REPRODUCTION.md ready for review.                      ║
║  Status: reproduced consistently (3/3 attempts)             ║
║  Environment: Node 20.x, macOS, SQLite 3.42                ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to SCAFFOLD           ║
║    changes: ... — Adjust reproduction steps                 ║
║    show repro   — Display BUG-REPRODUCTION.md               ║
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
| `bugfix-state.json` | Current phase, gate status, progress |
| `BUG-REPRODUCTION.md` | Steps to reproduce, environment, frequency |
| `ROOT-CAUSE.md` | Diagnosis with debug traces and root cause |
| `VERIFICATION.md` | Build/test/lint results post-fix |
| `CODE-REVIEW.md` | Review of fix quality and regression coverage |
| `RETROSPECTIVE.md` | Loop learnings and prevention recommendations |

## Example Session

```
User: /bugfix-loop

Bugfix Loop v1.0.0: Starting systematic bug fix...

  No existing bugfix state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Bugfix Loop v1.0.0                        ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 7                                          ║
  ║  Gates: repro → diagnosis → verification(auto)      ║
  ║         → review                                    ║
  ║  Rule: no code changes until reproduction confirmed ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Bugfix Loop: Starting INIT phase...

  [1/1] bug-reproducer → Describe the bug.

User: Users report 500 error when submitting forms with file attachments
      larger than 5MB. Started after last deploy. Error: "PayloadTooLargeError".

  [1/1] bug-reproducer → Reproducing...
        ✓ BUG-REPRODUCTION.md
          Reproduced: 3/3 attempts with 6MB file upload
          Error: PayloadTooLargeError at express body-parser
          Not reproducible with files < 5MB

  ✓ INIT phase complete

  ═══════════════════════════════════════════════════════
  ║  REPRO GATE                                         ║
  ║                                                     ║
  ║  Bug reproduced consistently.                       ║
  ║  Trigger: file upload > 5MB                         ║
  ║                                                     ║
  ║  Say 'approved' to continue to SCAFFOLD.            ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: repro-gate ✓

Bugfix Loop: Starting SCAFFOLD phase...
  [1/2] debug-assist → Tracing error path...
  [2/2] root-cause-analysis → Identifying root cause...
        ✓ ROOT-CAUSE.md
          Cause: body-parser limit reduced from 50mb to default 100kb
          in config refactor (commit abc123)
  ...
```
