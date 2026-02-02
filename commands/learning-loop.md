# /learning-loop Command

**Iterate on the skills library.** Review past work, identify gaps, create new skills, and refine existing ones — turning execution experience into lasting improvements.

## Purpose

This command orchestrates continuous improvement of the skills library: analyzing recent loop executions for patterns and gaps, verifying skill effectiveness, designing new or improved skills, calibrating estimates, and persisting learnings to memory. It is the meta-cognitive loop that makes all other loops better over time.

**The flow you want:** point it at recent work, say `go`, and the learning-loop produces verified skill improvements and calibrated patterns.

## Usage

```
/learning-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing learning-state.json
- `--phase=PHASE`: Start from specific phase (INIT | ANALYZE | IMPROVE | VALIDATE | COMPLETE)

---

## Prerequisites (MUST DO FIRST)

**Before starting the loop, ensure the orchestrator server is running.**

### Step 1: Check Server Health

```bash
curl -s http://localhost:3002/health
```

**Expected response:** `{"status":"ok","timestamp":"...","version":"..."}`

### Step 2: If Server Not Running

If the health check fails, **DO NOT manually start the server**. The `ensure-orchestrator.sh` hook will automatically:

1. Open a new Terminal/iTerm window
2. Start the server there (with visible logs)
3. Wait for it to become healthy

**Just proceed to call an MCP tool** (like `start_execution`) — the hook triggers on any `mcp__orchestrator__*` call and handles server startup automatically.

**NEVER run `npm start &` in background.** The server needs its own Terminal window for persistent operation and log visibility.

---

## Execution Flow

### Step 1: Cold Start Detection

```
if learning-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, gather learning scope
```

### Step 2: Initialize State

Create `learning-state.json`:

```json
{
  "loop": "learning-loop",
  "version": "2.0.0",
  "phase": "INIT",
  "status": "active",
  "context": {
    "tier": "system",
    "organization": "personal",
    "system": "orchestrator",
    "module": null
  },
  "gates": {
    "analysis-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "improvement-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["requirements"] },
    "ANALYZE": { "status": "pending", "skills": ["retrospective", "skill-verifier"] },
    "IMPROVE": { "status": "pending", "skills": ["skill-design", "calibration-tracker"] },
    "VALIDATE": { "status": "pending", "skills": ["memory-manager"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────► ANALYZE ──────► IMPROVE ──────► VALIDATE ──────► COMPLETE
               │                │
               │ [analysis-     │ [improvement-
               │  gate]         │  gate]
               │  human         │  human
               ▼                ▼
requirements  retrospective   skill-design     memory-manager   retrospective
              skill-verifier  calibration-tracker
```

**7 skills across 5 phases, 2 human gates**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `analysis-gate` | ANALYZE | human | User says `approved` | ANALYSIS-FINDINGS.md |
| `improvement-gate` | IMPROVE | human | User says `approved` | SKILL.md, CHANGELOG.md |

**Gate presentation (analysis-gate):**
```
═══════════════════════════════════════════════════════════════
║  ANALYSIS GATE                                    [HUMAN]  ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 ANALYSIS-FINDINGS.md — Patterns and gaps identified   ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Executions reviewed: N                                 ║
║    ✓ Patterns identified: N                                 ║
║    ✓ Gaps found: N                                          ║
║    ✓ Skills verified: N                                     ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to IMPROVE           ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (improvement-gate):**
```
═══════════════════════════════════════════════════════════════
║  IMPROVEMENT GATE                                 [HUMAN]  ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 SKILL.md — New or updated skill definitions           ║
║    📄 CHANGELOG.md — Skill change history                   ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Skills created: N                                      ║
║    ✓ Skills updated: N                                      ║
║    ✓ Calibrations adjusted: N                               ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to VALIDATE          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
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
| `learning-state.json` | Current phase, gate status, progress |
| `ANALYSIS-FINDINGS.md` | Patterns, gaps, verification results |
| `SKILL.md` | New or updated skill definitions |
| `CHANGELOG.md` | Skill version history |
| `RETROSPECTIVE.md` | Learning loop learnings |

## Example Session

```
User: /learning-loop

Learning Loop v1.0.0: Starting skills improvement cycle...

  No existing learning state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Learning Loop v1.0.0                       ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 5                                          ║
  ║  Gates: analysis → improvement                      ║
  ║  Output: improved skills + calibrated patterns      ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

══════════════════════════════════════════════════════════════
  INIT [1/5]
══════════════════════════════════════════════════════════════

  What should we analyze for improvement?

User: Review the last 3 engineering-loop executions and look for
      patterns in the IMPLEMENT phase taking longer than expected.

  ┌─ requirements
  │  Structuring learning scope...
  │  Scope: engineering-loop executions
  │  Focus: IMPLEMENT phase calibration
  │  Executions to review: 3
  └─ ✓ requirements complete

  ✓ INIT complete (1 skill)

══════════════════════════════════════════════════════════════
  ANALYZE [2/5]
══════════════════════════════════════════════════════════════

  ┌─ retrospective
  │  Reviewing execution history...
  │  Execution 1: IMPLEMENT took 2.3x estimate
  │  Execution 2: IMPLEMENT took 1.8x estimate
  │  Execution 3: IMPLEMENT took 2.1x estimate
  │  Pattern: consistent underestimation in IMPLEMENT
  └─ ✓ retrospective complete

  ┌─ skill-verifier
  │  Verifying skill definitions...
  │  implement skill: missing complexity factors
  │  test skill: adequate
  │  verify skill: adequate
  └─ ✓ skill-verifier complete

  ✓ ANALYZE complete (2 skills, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  ANALYSIS GATE                                    [HUMAN]  ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 ANALYSIS-FINDINGS.md — Patterns and gaps identified   ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Executions reviewed: 3                                 ║
  ║    ✓ Patterns identified: 1 (IMPLEMENT underestimation)     ║
  ║    ✓ Gaps found: 1 (missing complexity factors)             ║
  ║    ✓ Skills verified: 3                                     ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to IMPROVE           ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: analysis-gate ✓

══════════════════════════════════════════════════════════════
  IMPROVE [3/5]
══════════════════════════════════════════════════════════════

  ┌─ skill-design
  │  Updating implement skill with complexity factors...
  │  Adding: integration complexity multiplier
  │  Adding: dependency risk assessment
  │  Writing SKILL.md
  │  Writing CHANGELOG.md
  └─ ✓ skill-design complete

  ┌─ calibration-tracker
  │  Adjusting calibration data...
  │  IMPLEMENT base estimate: +40% adjustment
  │  Recording pattern: brownfield integration penalty
  └─ ✓ calibration-tracker complete

  ✓ IMPROVE complete (2 skills, 2 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  IMPROVEMENT GATE                                 [HUMAN]  ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 SKILL.md — Updated implement skill                    ║
  ║    📄 CHANGELOG.md — Version 2.1.0 changes                  ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Skills created: 0                                      ║
  ║    ✓ Skills updated: 1                                      ║
  ║    ✓ Calibrations adjusted: 1                               ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to VALIDATE          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: improvement-gate ✓

══════════════════════════════════════════════════════════════
  VALIDATE [4/5]
══════════════════════════════════════════════════════════════

  ┌─ memory-manager
  │  Persisting learnings to memory...
  │  Writing pattern: brownfield-integration-penalty
  │  Updating skill memory: implement
  │  Updating calibration data
  └─ ✓ memory-manager complete

  ✓ VALIDATE complete (1 skill)

══════════════════════════════════════════════════════════════
  COMPLETE [5/5]
══════════════════════════════════════════════════════════════

  ┌─ retrospective
  │  Capturing learning loop learnings...
  │  Writing RETROSPECTIVE.md
  └─ ✓ retrospective complete

  ✓ COMPLETE complete (1 skill, 1 deliverable)

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   LEARNING LOOP COMPLETE                                            ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT        Learning scope defined                              ║
║   ✓ ANALYZE     Patterns identified, skills verified                ║
║   ✓ IMPROVE     Skills updated, calibrations adjusted               ║
║   ✓ VALIDATE    Learnings persisted to memory                       ║
║   ✓ COMPLETE    Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Analysis Review [HUMAN]                                         ║
║   ✓ Improvement Review [HUMAN]                                      ║
║                                                                     ║
║   IMPROVEMENTS                                                      ║
║   ────────────                                                      ║
║   📄 implement skill — Added complexity factors (v2.1.0)            ║
║   📊 Calibration — IMPLEMENT +40% base adjustment                   ║
║   🧠 Pattern — brownfield-integration-penalty recorded              ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

---

## MCP Execution Protocol (REQUIRED for Slack Notifications)

**CRITICAL: All loop executions MUST be tracked through the MCP server to enable Slack thread notifications and execution history.**

### On Loop Start

When the loop begins, call:

```
mcp__orchestrator__start_execution({
  loopId: "learning-loop",
  project: "[learning target]"
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
      { "phase": "ANALYZE", "skill": "run-analyzer", "deliverables": ["RUN-ANALYSIS.md"] }
    ],
    "skillGuarantees": [
      { "skill": "run-analyzer", "guaranteeCount": 3, "guaranteeNames": ["..."] }
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

**DO NOT proceed to ANALYZE phase until you have loaded this context.** Skipping this step causes poor loop execution (missing deliverables, no completion proposal, etc.).

### During Execution

**After completing each skill**, call:
```
mcp__orchestrator__complete_skill({
  executionId: "[stored executionId]",
  skillId: "[skill name]",
  deliverables: ["IMPROVEMENT-PLAN.md"]  // optional
})
```

**After completing all skills in a phase**, call:
```
mcp__orchestrator__complete_phase({ executionId: "[stored executionId]" })
```

### At Gates

**When user approves a gate**, call:
```
mcp__orchestrator__approve_gate({
  executionId: "[stored executionId]",
  gateId: "[gate name]",
  approvedBy: "user"
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

1. **Probe relentlessly** — Ask 5-10+ questions about what to improve and why
2. **Surface assumptions** — "I'm assuming the gap is X — correct?"
3. **Gather learning scope** — Which executions? Which skills? What patterns?
4. **Don't stop early** — Keep asking until improvement targets are clear

At every phase transition and gate, pause to ask:
- "Does this analysis match your observations?"
- "Any patterns I'm missing?"
- "Ready to proceed with these improvements?"

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
   └── CRITICAL: learning-loop uses these to analyze past executions

4. Memory (patterns, calibration)
   └── Learned patterns from all applicable tiers
```

### Learning Loop Context

The learning-loop has special context requirements:
- **Queries past runs** to find patterns and gaps
- **Analyzes specific loops** (e.g., engineering-loop calibration)
- **Updates patterns** at appropriate tier (system or org)

---

## On Completion

When this loop reaches COMPLETE phase:

### 1. Archive Run (Full Artifacts)

**Location:** `~/.claude/runs/{year-month}/{project}-learning-loop-{timestamp}/`

Create a directory containing ALL loop artifacts:

```bash
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${PROJECT}-learning-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"

mv learning-state.json "$ARCHIVE_DIR/" 2>/dev/null || true
cp ANALYSIS-FINDINGS.md CHANGELOG.md RETROSPECTIVE.md \
   "$ARCHIVE_DIR/" 2>/dev/null || true
```

**Artifact organization:**
| Category | Location | Files |
|----------|----------|-------|
| **Permanent** | skills-library | Updated SKILL.md files |
| **Transient** | `~/.claude/runs/` | `learning-state.json`, `ANALYSIS-FINDINGS.md`, `CHANGELOG.md`, `RETROSPECTIVE.md` |

### 2. Update Dream State

At the System level (if system-scoped improvements):
- Update module progress based on skill improvements
- Record pattern in system memory

At the Organization level (if org-wide patterns):
- Add to org patterns list
- Update calibration data

### 3. Commit All Artifacts

**Principle:** A completed loop leaves no orphaned files.

```bash
git add -A
git diff --cached --quiet || git commit -m "Learning complete: [description]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Note:** This step commits but does NOT push. Use `/distribution-loop` to push to remote and trigger CI/CD.

### 4. Clean Project Directory

Remove transient artifacts that have been archived:

```bash
rm -f ANALYSIS-FINDINGS.md CHANGELOG.md RETROSPECTIVE.md learning-state.json 2>/dev/null || true
```

**Result:** Next `/learning-loop` invocation starts fresh with context gathering.

### 5. Leverage Proposal (REQUIRED)

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
  Run archived: ~/.claude/runs/2025-01/orchestrator-learning-loop-29T14-30.json
  Dream State updated: .claude/DREAM-STATE.md
  Patterns recorded: 1

  Next invocation will start fresh.
══════════════════════════════════════════════════════════════
```
