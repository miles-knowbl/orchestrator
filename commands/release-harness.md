# /release-harness Command

**Single entry point for release management.** Version, validate, document, and distribute releases with quality gates through a structured 5-phase pipeline.

## Purpose

This command orchestrates the complete release workflow: planning release scope, validating code readiness, generating changelogs and release notes, and shipping through CI/CD distribution. It ensures every release is tested, documented, and traceable.

**The flow you want:** decide what to release, say `go`, and the loop validates, documents, and distributes the release with full audit trail.

## Usage

```
/release-harness [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing release-state.json
- `--phase=PHASE`: Start from specific phase (INIT | VALIDATE | DOCUMENT | SHIP | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if release-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, plan the release
```

### Step 2: Initialize State

Create `release-state.json`:

```json
{
  "loop": "release-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "scope-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "readiness-gate": { "status": "pending", "required": true, "approvalType": "auto" },
    "notes-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "release-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["release-planner"] },
    "VALIDATE": { "status": "pending", "skills": ["code-verification", "integration-test"] },
    "DOCUMENT": { "status": "pending", "skills": ["changelog-generator", "release-notes"] },
    "SHIP": { "status": "pending", "skills": ["deploy", "distribute", "git-workflow"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────────► VALIDATE ──────────► DOCUMENT ──────────► SHIP
  │                │                    │                    │
  │ [scope-gate]   │ [readiness-gate]   │ [notes-gate]      │ [release-gate]
  │  human         │  auto              │  human            │  human
  ▼                ▼                    ▼                    ▼
release-planner  code-verification   changelog-generator   deploy
                 integration-test    release-notes         distribute
                                                           git-workflow

  ▼

COMPLETE
  ▼
retrospective
```

**7 skills across 5 phases, 4 gates (3 human, 1 auto)**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `scope-gate` | INIT | human | User says `approved` | RELEASE-PLAN.md |
| `readiness-gate` | VALIDATE | auto | Build passes, all tests pass, lint clean | READINESS-REPORT.md |
| `notes-gate` | DOCUMENT | human | User says `approved` | CHANGELOG.md, RELEASE-NOTES.md |
| `release-gate` | SHIP | human | User says `approved` | Tagged release, distribution artifacts |

**Gate presentation (readiness-gate):**
```
═══════════════════════════════════════════════════════════════
║  READINESS GATE (auto)                                      ║
║                                                             ║
║  Running release readiness checks...                        ║
║    ✓ Build: clean compile                                   ║
║    ✓ Unit tests: 142/142 passing                            ║
║    ✓ Integration tests: 28/28 passing                       ║
║    ✓ Lint: 0 errors, 0 warnings                             ║
║    ✓ Types: no errors                                       ║
║    ✓ No uncommitted changes                                 ║
║                                                             ║
║  Gate passed automatically. Continuing to DOCUMENT.         ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (notes-gate):**
```
═══════════════════════════════════════════════════════════════
║  NOTES GATE                                                 ║
║                                                             ║
║  Release documentation ready for review:                    ║
║    CHANGELOG.md — 12 entries (4 features, 6 fixes, 2 chores)║
║    RELEASE-NOTES.md — user-facing summary                   ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to SHIP              ║
║    changes: ...  — Edit release notes                       ║
║    show changelog — Display CHANGELOG.md                    ║
║    show notes    — Display RELEASE-NOTES.md                 ║
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
| `release-state.json` | Current phase, gate status, progress |
| `RELEASE-PLAN.md` | Release scope, version, included changes |
| `READINESS-REPORT.md` | Automated test/build/lint results |
| `CHANGELOG.md` | Structured changelog for this release |
| `RELEASE-NOTES.md` | User-facing release summary |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /release-harness

Release Harness v1.0.0: Starting release management...

  No existing release state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Release Loop v1.0.0                       ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 5                                          ║
  ║  Gates: scope → readiness(auto) → notes → release   ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Release Harness: Starting INIT phase...

  [1/1] release-planner → Planning release...

User: Release v2.3.0. Includes the new auth system, 6 bug fixes from
      the last sprint, and the API rate limiting feature.

  [1/1] release-planner → Structuring release plan...
        ✓ RELEASE-PLAN.md
          Version: 2.3.0
          Type: minor (new features, backward compatible)
          Includes: 2 features, 6 fixes
          Branch: main (24 commits since v2.2.0)

  ✓ INIT phase complete

  ═══════════════════════════════════════════════════════
  ║  SCOPE GATE                                         ║
  ║                                                     ║
  ║  RELEASE-PLAN.md ready for review.                  ║
  ║  Version: 2.3.0 (minor)                             ║
  ║  24 commits, 2 features, 6 fixes.                   ║
  ║                                                     ║
  ║  Say 'approved' to continue to VALIDATE.            ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: scope-gate ✓

Release Harness: Starting VALIDATE phase...
  [1/2] code-verification → Running build and tests...
  [2/2] integration-test → Running integration suite...
  ...
```
