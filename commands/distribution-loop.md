# /distribution-loop Command

**Distribute to all targets through a single, fast pipeline.** Keep local, Railway, Vercel, and GitHub Releases in sync with auto gates.

## Purpose

This command is the **single entry point** for distributing changes to all deployment targets. It handles everything: assessing what changed, verifying readiness, committing and pushing, and confirming all targets received the update.

**The flow you want:** decide what to ship, say `go`, and the loop verifies, pushes, and confirms distribution across all targets automatically.

Works for:
- **Routine distribution** --- push latest changes to all targets after a feature lands
- **Hotfix distribution** --- fast-track a fix through verify and ship
- **Full resync** --- rebuild local, redeploy Railway and Vercel, update GitHub Release

## Usage

```
/distribution-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing distribution-state.json
- `--phase=PHASE`: Start from specific phase (INIT | VERIFY | SHIP | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if distribution-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, assess what needs distributing
```

### Step 2: Initialize State

Create `distribution-state.json`:

```json
{
  "loop": "distribution-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "readiness-gate": { "status": "pending", "required": true, "approvalType": "auto" },
    "distribution-gate": { "status": "pending", "required": true, "approvalType": "auto" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["release-planner"] },
    "VERIFY": { "status": "pending", "skills": ["code-verification"] },
    "SHIP": { "status": "pending", "skills": ["git-workflow", "deploy", "distribute"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────────► VERIFY ──────────► SHIP ──────────► COMPLETE
  │                │                  │                  │
  │                │ [readiness-gate] │ [distribution-   │
  │                │  auto            │  gate] auto      │
  ▼                ▼                  ▼                  ▼
release-planner  code-verification  git-workflow       retrospective
                                    deploy
                                    distribute
```

**6 skills across 4 phases, 2 auto gates**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Passes When |
|------|-------------|------|-------------|
| `readiness-gate` | VERIFY | auto | Build passes, tests pass, lint clean |
| `distribution-gate` | SHIP | auto | Push succeeded, pipeline triggered |

**Gate presentation (readiness-gate):**
```
═══════════════════════════════════════════════════════════════
║  READINESS GATE (auto)                                      ║
║                                                             ║
║  Running distribution readiness checks...                   ║
║    ✓ Build: clean compile                                   ║
║    ✓ Tests: all passing                                     ║
║    ✓ Lint: 0 errors                                         ║
║    ✓ No uncommitted changes                                 ║
║                                                             ║
║  Gate passed automatically. Continuing to SHIP.             ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (distribution-gate):**
```
═══════════════════════════════════════════════════════════════
║  DISTRIBUTION GATE (auto)                                   ║
║                                                             ║
║  Verifying distribution targets...                          ║
║    ✓ Git: pushed to origin/main                             ║
║    ✓ CI: workflow triggered                                 ║
║    ✓ Railway: deploy initiated                              ║
║    ✓ Vercel: deploy initiated                               ║
║    ✓ Release: tarball will be created by CI                 ║
║                                                             ║
║  Gate passed automatically. Continuing to COMPLETE.         ║
═══════════════════════════════════════════════════════════════
```

## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current gate (auto gates pass automatically) |
| `changes: [feedback]` | Request changes at gate |
| `pause` | Stop after current skill |
| `skip [skill]` | Skip a skill (requires reason) |
| `show [deliverable]` | Display a deliverable |
| `phase [name]` | Jump to specific phase |

## State Files

| File | Purpose |
|------|---------|
| `distribution-state.json` | Current phase, gate status, progress |

## Example Session

```
User: /distribution-loop

Distribution Loop v1.0.0: Starting distribution...

  No existing distribution state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Distribution Loop v1.0.0                  ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 4                                          ║
  ║  Gates: readiness(auto) → distribution(auto)        ║
  ║  Targets: Local | Railway | Vercel | GitHub Release ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Distribution Loop: Starting INIT phase...

  [1/1] release-planner → Assessing changes...
        ✓ 3 commits since last distribution
        ✓ Version: 2.0.0 (unchanged)
        ✓ Scope: 1 feature, 2 fixes

  ✓ INIT phase complete

Distribution Loop: Starting VERIFY phase...

  [1/1] code-verification → Build, test, lint...
        ✓ Build: clean
        ✓ Tests: 42/42 passing
        ✓ Lint: 0 errors

  ✓ VERIFY phase complete

  ═══════════════════════════════════════════════════════
  ║  READINESS GATE (auto)                              ║
  ║    ✓ All checks passed                              ║
  ║  Gate passed automatically. Continuing to SHIP.     ║
  ═══════════════════════════════════════════════════════

Distribution Loop: Starting SHIP phase...

  [1/3] git-workflow → Committing and pushing...
        ✓ Committed: "feat: add distribution loop"
        ✓ Pushed to origin/main

  [2/3] deploy → Local rebuild...
        ✓ npm run build complete

  [3/3] distribute → Verifying CI pipeline...
        ✓ GitHub Actions workflow triggered
        ✓ Railway deploy will run
        ✓ Vercel deploy will run
        ✓ Tarball release will update

  ✓ SHIP phase complete

  ═══════════════════════════════════════════════════════
  ║  DISTRIBUTION GATE (auto)                           ║
  ║    ✓ All targets received update                    ║
  ║  Gate passed automatically. Continuing to COMPLETE. ║
  ═══════════════════════════════════════════════════════

Distribution Loop: Starting COMPLETE phase...

  [1/1] retrospective → Summary...
        All 4 targets synced. No issues.

  ✓ Distribution complete
```

## Resuming a Session

```
User: /distribution-loop --resume

Distribution Loop v1.0.0: Resuming...

  Found distribution-state.json
  ┌──────────┬─────────────┬──────────┐
  │ Phase    │ Status      │ Skills   │
  ├──────────┼─────────────┼──────────┤
  │ INIT     │ ✓ complete  │ 1/1      │
  │ VERIFY   │ ✓ complete  │ 1/1      │
  │ SHIP     │ ▶ active    │ 1/3      │
  │ COMPLETE │ ○ pending   │ 0/1      │
  └──────────┴─────────────┴──────────┘

  Resume from SHIP phase? [Y/n]

User: y

Distribution Loop: Resuming SHIP phase...
  [2/3] deploy → Local rebuild...
```

## Skill Invocation Sequence

```
1. release-planner (INIT)
   +-- Assess git log since last distribution
   +-- Determine version and scope

2. code-verification (VERIFY)
   +-- Run: npm run build
   +-- Run: npm test
   +-- Run: lint check
   +-- Output: readiness status

--- readiness-gate (auto) ---

3. git-workflow (SHIP)
   +-- Stage changes
   +-- Commit with conventional message
   +-- Push to origin/main

4. deploy (SHIP)
   +-- Local: npm run build
   +-- Verify server starts cleanly

5. distribute (SHIP)
   +-- Read: github-actions-workflow.md
   +-- Read: platform-selection.md
   +-- Verify CI pipeline triggered
   +-- Confirm all targets will receive update

--- distribution-gate (auto) ---

6. retrospective (COMPLETE)
   +-- Summarize distribution results
   +-- Record any issues for next run
```

## References

This command uses the **skills-library MCP server** for skill definitions:

```
mcp__skills-library__get_skill(name: "release-planner", includeReferences: true)
mcp__skills-library__get_skill(name: "code-verification", includeReferences: true)
mcp__skills-library__get_skill(name: "git-workflow", includeReferences: true)
mcp__skills-library__get_skill(name: "deploy", includeReferences: true)
mcp__skills-library__get_skill(name: "distribute", includeReferences: true)
mcp__skills-library__get_skill(name: "retrospective", includeReferences: true)
```
