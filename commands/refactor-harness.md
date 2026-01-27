# /refactor-harness Command

**Single entry point for systematic refactoring.** Improve code structure without changing external behavior — verified with tests at every step.

## Purpose

This command orchestrates behavior-preserving code improvements: analyzing current architecture, planning refactoring scope, executing changes, generating regression tests, and verifying nothing broke. The core invariant is that external behavior remains identical before and after.

**The flow you want:** identify the code to improve, say `go`, and the loop refactors with full test coverage and verification.

## Usage

```
/refactor-harness [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing refactor-state.json
- `--phase=PHASE`: Start from specific phase (INIT | IMPLEMENT | TEST | VERIFY | REVIEW | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if refactor-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, analyze architecture for refactoring targets
```

### Step 2: Initialize State

Create `refactor-state.json`:

```json
{
  "loop": "refactor-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "scope-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "verification-gate": { "status": "pending", "required": true, "approvalType": "auto" },
    "review-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["architecture-review"] },
    "IMPLEMENT": { "status": "pending", "skills": ["refactor"] },
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
INIT ──────────► IMPLEMENT ──────────► TEST
  │
  │ [scope-gate]
  │  human
  ▼
architecture-review   refactor          test-generation

  ▼                    ▼                    ▼

VERIFY ──────────► REVIEW ──────────► COMPLETE
  │                  │
  │ [verification]   │ [review-gate]
  │  auto            │  human
  ▼                  ▼
code-verification  code-review         retrospective
```

**6 skills across 6 phases, 3 gates (1 human, 1 auto, 1 human)**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `scope-gate` | INIT | human | User says `approved` | REFACTOR-SCOPE.md |
| `verification-gate` | VERIFY | auto | Build passes, tests pass, lint clean | VERIFICATION.md |
| `review-gate` | REVIEW | human | User says `approved` | CODE-REVIEW.md |

**Gate presentation (scope-gate):**
```
═══════════════════════════════════════════════════════════════
║  SCOPE GATE                                                 ║
║                                                             ║
║  REFACTOR-SCOPE.md ready for review.                        ║
║  Targets: 3 modules, 12 files, estimated 400 LOC changed.  ║
║  Invariant: all existing tests must continue passing.       ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to IMPLEMENT          ║
║    changes: ... — Adjust refactoring scope                  ║
║    show scope   — Display REFACTOR-SCOPE.md                 ║
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
| `refactor-state.json` | Current phase, gate status, progress |
| `REFACTOR-SCOPE.md` | Refactoring targets, rationale, and constraints |
| `VERIFICATION.md` | Build/test/lint results post-refactor |
| `CODE-REVIEW.md` | Review of refactored code for quality |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /refactor-harness

Refactor Harness v1.0.0: Starting systematic refactoring...

  No existing refactor state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Refactor Loop v1.0.0                      ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 6                                          ║
  ║  Gates: scope → verification(auto) → review         ║
  ║  Invariant: no external behavior changes            ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Refactor Harness: Starting INIT phase...

  [1/1] architecture-review → Analyzing code for refactoring targets...
        ✓ REFACTOR-SCOPE.md (3 modules identified)
          - Extract service layer from controllers
          - Consolidate duplicate validation logic
          - Replace callback chains with async/await

  ✓ INIT phase complete

  ═══════════════════════════════════════════════════════
  ║  SCOPE GATE                                         ║
  ║                                                     ║
  ║  REFACTOR-SCOPE.md ready for review.                ║
  ║  3 refactoring targets, ~400 LOC affected.          ║
  ║                                                     ║
  ║  Say 'approved' to continue to IMPLEMENT.           ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: scope-gate ✓

Refactor Harness: Starting IMPLEMENT phase...
  [1/1] refactor → Executing refactoring plan...
  ...
```
