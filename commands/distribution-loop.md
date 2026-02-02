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
  "version": "2.0.0",
  "phase": "INIT",
  "status": "active",

  "context": {
    "tier": "system",
    "organization": "personal",
    "system": "my-project",
    "module": null
  },

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
║  READINESS GATE                                    [AUTO]  ║
║                                                             ║
║  Running checks...                                          ║
║    ✓ Build: clean compile                                   ║
║    ✓ Tests: all passing                                     ║
║    ✓ Lint: 0 errors                                         ║
║                                                             ║
║  All checks passed. Continuing to SHIP.                     ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (distribution-gate):**
```
═══════════════════════════════════════════════════════════════
║  DISTRIBUTION GATE                                 [AUTO]  ║
║                                                             ║
║  Running checks...                                          ║
║    ✓ Railway: deploy confirmed                              ║
║    ✓ Vercel: deploy confirmed                               ║
║    ✓ GitHub Release: tarball updated                        ║
║                                                             ║
║  All checks passed. Continuing to COMPLETE.                 ║
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

  ══════════════════════════════════════
    INIT                          [1/4]
  ══════════════════════════════════════

  ┌─ release-planner
  │  Assessing git log since last distribution...
  │  Determining version and scope...
  │
  │  Current: 0.7.0 → Shipping: 1 feature, 2 fixes
  │  Proposed: 0.8.0 (minor bump for new feature)
  │
  │  Bump version? [Y/n/specify]: y
  │  ✓ package.json updated: 0.7.0 → 0.8.0
  │
  │  Output:
  │    📄 release-scope.md — 3 commits, 1 feature, 2 fixes
  └─ ✓ release-planner complete

  ✓ INIT complete (1 skill, 1 deliverable)

  ══════════════════════════════════════
    VERIFY                        [2/4]
  ══════════════════════════════════════

  ┌─ code-verification
  │  Running build... clean compile
  │  Running tests... 42/42 passing
  │  Running lint... 0 errors
  │
  │  Output:
  │    📄 verification-report.md — Build, test, lint all green
  └─ ✓ code-verification complete

  ✓ VERIFY complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  READINESS GATE                                    [AUTO]  ║
  ║                                                             ║
  ║  Running checks...                                          ║
  ║    ✓ Build: clean compile                                   ║
  ║    ✓ Tests: 42/42 passing                                   ║
  ║    ✓ Lint: 0 errors                                         ║
  ║                                                             ║
  ║  All checks passed. Continuing to SHIP.                     ║
  ═══════════════════════════════════════════════════════════════

  ══════════════════════════════════════
    SHIP                          [3/4]
  ══════════════════════════════════════

  ┌─ git-workflow
  │  Staging changes...
  │  Committed: "feat: add distribution loop"
  │  Pushed to origin/main
  │
  │  Output:
  │    📄 git-summary.md — Commit pushed to origin/main
  └─ ✓ git-workflow complete

  ┌─ deploy
  │  Running npm run build...
  │  Verifying server starts cleanly...
  │
  │  Output:
  │    📄 deploy-report.md — Local build verified
  └─ ✓ deploy complete

  ┌─ distribute
  │  Verifying CI pipeline triggered...
  │  Checking Railway deploy status...
  │  Checking Vercel deploy status...
  │  Checking GitHub Release tarball...
  │
  │  Output:
  │    📄 distribution-manifest.md — All 4 targets confirmed
  └─ ✓ distribute complete

  ✓ SHIP complete (3 skills, 3 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  DISTRIBUTION GATE                                 [AUTO]  ║
  ║                                                             ║
  ║  Running checks...                                          ║
  ║    ✓ Railway: deploy confirmed                              ║
  ║    ✓ Vercel: deploy confirmed                               ║
  ║    ✓ GitHub Release: tarball updated                        ║
  ║                                                             ║
  ║  All checks passed. Continuing to COMPLETE.                 ║
  ═══════════════════════════════════════════════════════════════

  ══════════════════════════════════════
    COMPLETE                      [4/4]
  ══════════════════════════════════════

  ┌─ retrospective
  │  Summarizing distribution results...
  │  All 4 targets synced. No issues.
  │
  │  Output:
  │    📄 retrospective.md — Distribution summary and learnings
  └─ ✓ retrospective complete

  ✓ COMPLETE complete (1 skill, 1 deliverable)

  ╔═════════════════════════════════════════════════════════════════════╗
  ║                                                                     ║
  ║   DISTRIBUTION LOOP COMPLETE                                        ║
  ║                                                                     ║
  ╠═════════════════════════════════════════════════════════════════════╣
  ║                                                                     ║
  ║   PHASES                                                            ║
  ║   ──────                                                            ║
  ║   ✓ INIT        Release scope assessed                              ║
  ║   ✓ VERIFY      Build/test/lint all passing                         ║
  ║   ✓ SHIP        All targets updated                                 ║
  ║   ✓ COMPLETE    Retrospective captured                              ║
  ║                                                                     ║
  ║   GATES PASSED                                                      ║
  ║   ────────────                                                      ║
  ║   ✓ Readiness Check [AUTO]                                          ║
  ║   ✓ Distribution Confirmation [AUTO]                                ║
  ║                                                                     ║
  ║   DELIVERABLES                                                      ║
  ║   ────────────                                                      ║
  ║   📄 release-scope.md — Release scope and version                   ║
  ║   📄 verification-report.md — Build, test, lint results             ║
  ║   📄 git-summary.md — Commit and push details                       ║
  ║   📄 deploy-report.md — Local build verification                    ║
  ║   📄 distribution-manifest.md — All target confirmations            ║
  ║   📄 retrospective.md — Distribution summary and learnings          ║
  ║                                                                     ║
  ╚═════════════════════════════════════════════════════════════════════╝
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
   +-- Bump package.json version if shipping new features
   +-- Verify version alignment (package.json → server → release)

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
   +-- **Sync slash commands to ~/.claude/commands/**

--- distribution-gate (auto) ---

6. retrospective (COMPLETE)
   +-- Summarize distribution results
   +-- Record any issues for next run
```

## Version Alignment

The distribution loop ensures version stays aligned across all surfaces:

```
package.json (single source of truth)
     │
     ├─→ src/version.ts reads at runtime
     │   ├─→ MCP server metadata
     │   ├─→ /health endpoint
     │   └─→ Startup banner
     │
     └─→ GitHub Actions reads on push
         └─→ Release body: "Version: X.Y.Z"
             └─→ /distribute page parses and displays
```

### Version Bump Rules

| Change Type | Bump | Example |
|-------------|------|---------|
| Breaking change | Major | 0.7.0 → 1.0.0 |
| New feature | Minor | 0.7.0 → 0.8.0 |
| Bug fix only | Patch | 0.7.0 → 0.7.1 |
| No code changes | None | Stay at 0.7.0 |

### During INIT Phase

The release-planner skill will:
1. Analyze commits since last release
2. Propose appropriate version bump
3. Ask for confirmation (or accept custom version)
4. Update package.json before proceeding

This ensures the version in the release matches the shipped features.

## Slash Command Sync

After successful push, the distribution loop syncs orchestrator commands to Claude Code:

```bash
# Sync all loop commands to user's Claude Code
cp commands/*-loop.md ~/.claude/commands/

# Report sync status
echo "✓ Synced $(ls -1 commands/*-loop.md | wc -l | tr -d ' ') slash commands"
```

This ensures the user's Claude Code always has the latest loop definitions after each distribution. A post-push hook (`~/.claude/hooks/sync-commands.sh`) provides backup sync for pushes outside the distribution loop.

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

---

## MCP Execution Protocol (REQUIRED for Slack Notifications)

**CRITICAL: All loop executions MUST be tracked through the MCP server to enable Slack thread notifications and execution history.**

### On Loop Start

When the loop begins, call:

```
mcp__orchestrator__start_execution({
  loopId: "distribution-loop",
  project: "[current project name]"
})
```

**Store the returned `executionId`** — you'll need it for all subsequent calls.

### Pre-Loop Context Loading (MANDATORY)

**CRITICAL: Before proceeding with any phase, you MUST process the `preLoopContext` returned by start_execution.**

The response includes:
```json
{
  "executionId": "...",
  "preLoopContext": {
    "requiredDeliverables": [
      { "phase": "INIT", "skill": "release-planner", "deliverables": ["RELEASE-PLAN.md"] }
    ],
    "skillGuarantees": [
      { "skill": "release-planner", "guaranteeCount": 3, "guaranteeNames": ["..."] }
    ],
    "dreamStatePath": ".claude/DREAM-STATE.md",
    "roadmapPath": "ROADMAP.md"
  }
}
```

**You MUST:**
1. **Read the Dream State** (if `dreamStatePath` provided) — understand the vision and checklist
2. **Read the ROADMAP** (if `roadmapPath` provided) — see available next moves for completion proposal
3. **Note all required deliverables** — know what each skill must produce
4. **Note guarantee counts** — understand what will be validated

**DO NOT proceed to INIT phase until you have loaded this context.** Skipping this step causes poor loop execution (missing deliverables, no completion proposal, etc.).

### During Execution

**After completing each skill**, call:
```
mcp__orchestrator__complete_skill({
  executionId: "[stored executionId]",
  skillId: "[skill name]",
  deliverables: ["list", "of", "outputs"]  // optional
})
```

**After completing all skills in a phase**, call:
```
mcp__orchestrator__complete_phase({ executionId: "[stored executionId]" })
```

### At Gates

**When auto-gate passes**, call:
```
mcp__orchestrator__approve_gate({
  executionId: "[stored executionId]",
  gateId: "[gate name]",
  approvedBy: "auto"
})
```

### Phase Transitions

**To advance to the next phase**, call:
```
mcp__orchestrator__advance_phase({ executionId: "[stored executionId]" })
```

### Why This Matters

Without MCP execution tracking:
- No Slack notifications (thread-per-execution)
- No execution history
- No calibration data collection

---

## Clarification Protocol

This loop follows the **Deep Context Protocol**. Before proceeding past INIT:

1. **Probe relentlessly** — Ask questions about what's being distributed and why
2. **Surface assumptions** — "I'm assuming all targets should receive this — correct?"
3. **Gather scope** — Which commits? Which targets? Any targets to skip?
4. **Don't stop early** — Keep asking until distribution scope is clear

At every phase transition and gate, pause to ask:
- "Does this release scope look right?"
- "Any targets I should skip or add?"
- "Ready to push to all targets?"

See `commands/_shared/clarification-protocol.md` for detailed guidance.

---

## Context Hierarchy

This loop operates within the **Organization → System → Module** hierarchy:

| Tier | Scope | Dream State Location |
|------|-------|---------------------|
| **Organization** | All systems across workspace | `~/.claude/DREAM-STATE.md` |
| **System** | This repository/application | `{repo}/.claude/DREAM-STATE.md` |
| **Module** | Specific concern within system | `{repo}/{path}/.claude/DREAM-STATE.md` or inline |

### Context Loading (Automatic on Init)

When this loop initializes, it automatically loads:

```
1. Organization Dream State (~/.claude/DREAM-STATE.md)
   └── Org-wide vision, active systems, master checklist

2. System Dream State ({repo}/.claude/DREAM-STATE.md)
   └── System vision, modules, progress checklist

3. Recent Runs (auto-injected via query_runs)
   └── Last 3-5 relevant runs for context continuity

4. Memory (patterns, calibration)
   └── Learned patterns from all applicable tiers
```

---

## On Completion

When this loop reaches COMPLETE phase and finishes:

### 1. Archive Run

**Location:** `~/.claude/runs/{year-month}/{system}-distribution-loop-{timestamp}.json`

**Contents:** Full state + summary including:
- Release scope and version
- Targets deployed
- Gates passed
- Distribution manifest

### 2. Update Dream State

At the System level (`{repo}/.claude/DREAM-STATE.md`):
- Update "Recent Completions" section
- Note deployment status

### 3. Prune Active State

**Delete:** `distribution-state.json` from working directory.

**Result:** Next `/distribution-loop` invocation starts fresh with context gathering.

### 4. Leverage Proposal (REQUIRED)

Before showing completion, evaluate and propose the next highest leverage move.

See `commands/_shared/leverage-protocol.md` for full details.

**Output:**
```
══════════════════════════════════════════════════════════════
  NEXT HIGHEST LEVERAGE MOVE

  Recommended: /{loop} → {target}
  Value Score: X.X/10

  Say 'go' to start, or specify a different loop.
══════════════════════════════════════════════════════════════
```

### 5. Completion Message

```
══════════════════════════════════════════════════════════════
  Run archived: ~/.claude/runs/2025-01/myproject-distribution-loop-29T14-30.json
  Dream State updated: .claude/DREAM-STATE.md

  Next invocation will start fresh.
══════════════════════════════════════════════════════════════
```
