# /meta-loop Command

**Single entry point for loop authorship.** Design, compose, and publish new loops and skills — the loop that creates loops.

## Purpose

This command orchestrates the creation of new loops and skills for the skills library: gathering requirements for the new loop, composing its phases and gates, designing individual skills, generating slash command documentation, and publishing. It is self-referential by design — it follows the same patterns it creates.

**The flow you want:** describe the loop you need, say `go`, and the meta-loop produces a fully documented, publishable loop definition.

## Usage

```
/meta-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing meta-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | DOCUMENT | COMPLETE)

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
if meta-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, gather loop requirements
```

### Step 2: Initialize State

Create `meta-state.json`:

```json
{
  "loop": "meta-loop",
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
    "design-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "composition-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["requirements"] },
    "SCAFFOLD": { "status": "pending", "skills": ["loop-composer", "skill-design"] },
    "DOCUMENT": { "status": "pending", "skills": ["loop-to-slash-command", "document"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────────► SCAFFOLD ──────────► DOCUMENT ──────────► COMPLETE
  │                │
  │ [design-gate]  │ [composition-gate]
  │  human         │  human
  ▼                ▼
requirements     loop-composer        loop-to-slash-command   retrospective
                 skill-design         document
```

**5 skills across 4 phases, 2 human gates**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `design-gate` | INIT | human | User says `approved` | LOOP-REQUIREMENTS.md |
| `composition-gate` | SCAFFOLD | human | User says `approved` | loop.json, SKILL.md files |

**Gate presentation (design-gate):**
```
═══════════════════════════════════════════════════════════════
║  DESIGN GATE                                      [HUMAN]  ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 LOOP-REQUIREMENTS.md — Loop specification             ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Phases defined: N                                      ║
║    ✓ Skills identified: N                                   ║
║    ✓ Gates planned: N                                       ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to SCAFFOLD          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (composition-gate):**
```
═══════════════════════════════════════════════════════════════
║  COMPOSITION GATE                                 [HUMAN]  ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 loop.json — Loop definition                           ║
║    📄 SKILL.md files — Skill definitions                    ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Skills created: N                                      ║
║    ✓ Loop validated: yes                                    ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to DOCUMENT          ║
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
| `meta-state.json` | Current phase, gate status, progress |
| `LOOP-REQUIREMENTS.md` | Requirements for the new loop |
| `loop.json` | Loop definition (phases, gates, skills) |
| `skills/*/SKILL.md` | Individual skill definitions |
| `commands/{name}-loop.md` | Generated slash command file |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /meta-loop

Meta Loop v1.0.0: Starting loop authorship...

  No existing meta state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Meta Loop v1.0.0                          ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 4                                          ║
  ║  Gates: design → composition                        ║
  ║  Output: a new loop definition + slash command      ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

══════════════════════════════════════════════════════════════
  INIT [1/4]
══════════════════════════════════════════════════════════════

  What loop do you need?

User: I need a data pipeline loop that ingests, transforms, validates,
      and publishes datasets with quality checks.

  ┌─ requirements
  │  Structuring loop requirements...
  │  Writing LOOP-REQUIREMENTS.md
  │    Domain: data engineering
  │    Phases: 6 (INIT → INGEST → TRANSFORM → VALIDATE → PUBLISH → COMPLETE)
  │    Gates: 3 (schema-gate, quality-gate, publish-gate)
  └─ ✓ requirements complete

  ✓ INIT complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  DESIGN GATE                                      [HUMAN]  ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 LOOP-REQUIREMENTS.md — Loop specification             ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Phases defined: 6                                      ║
  ║    ✓ Skills identified: 7                                   ║
  ║    ✓ Gates planned: 3                                       ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to SCAFFOLD          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: design-gate ✓

══════════════════════════════════════════════════════════════
  SCAFFOLD [2/4]
══════════════════════════════════════════════════════════════

  ┌─ loop-composer
  │  Composing loop definition from requirements...
  │  Writing loop.json (6 phases, 3 gates, 7 skills)
  └─ ✓ loop-composer complete

  ┌─ skill-design
  │  Generating SKILL.md for each skill...
  │  Writing skills/ingest/SKILL.md
  │  Writing skills/transform/SKILL.md
  │  Writing skills/validate/SKILL.md
  │  Writing skills/publish/SKILL.md
  └─ ✓ skill-design complete

  ✓ SCAFFOLD complete (2 skills, 5 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  COMPOSITION GATE                                 [HUMAN]  ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 loop.json — Loop definition                           ║
  ║    📄 SKILL.md files — Skill definitions                    ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Skills created: 4                                      ║
  ║    ✓ Loop validated: yes                                    ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to DOCUMENT          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: composition-gate ✓

══════════════════════════════════════════════════════════════
  DOCUMENT [3/4]
══════════════════════════════════════════════════════════════

  ┌─ loop-to-slash-command
  │  Generating slash command from loop definition...
  │  Writing commands/data-pipeline-loop.md
  └─ ✓ loop-to-slash-command complete

  ┌─ document
  │  Writing LOOP.md documentation...
  └─ ✓ document complete

  ✓ DOCUMENT complete (2 skills, 2 deliverables)

══════════════════════════════════════════════════════════════
  COMPLETE [4/4]
══════════════════════════════════════════════════════════════

  ┌─ retrospective
  │  Capturing loop creation learnings...
  │  Writing RETROSPECTIVE.md
  └─ ✓ retrospective complete

  ✓ COMPLETE complete (1 skill, 1 deliverable)

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   META LOOP COMPLETE                                                ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT        Loop requirements defined                           ║
║   ✓ SCAFFOLD    Loop composed, skills designed                      ║
║   ✓ DOCUMENT    Slash command and docs generated                    ║
║   ✓ COMPLETE    Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Design Review [HUMAN]                                           ║
║   ✓ Composition Review [HUMAN]                                      ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 LOOP-REQUIREMENTS.md   Loop specification                      ║
║   📄 loop.json               Loop definition                        ║
║   📄 SKILL.md files          Skill definitions                      ║
║   📄 {loop-id}.md            Slash command file                     ║
║   📄 RETROSPECTIVE.md        Loop creation learnings                ║
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
  loopId: "meta-loop",
  project: "[new loop name being created]"
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
      { "phase": "DESIGN", "skill": "loop-design", "deliverables": ["LOOP-SPEC.md"] }
    ],
    "skillGuarantees": [
      { "skill": "loop-design", "guaranteeCount": 3, "guaranteeNames": ["..."] }
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

**DO NOT proceed to DESIGN phase until you have loaded this context.** Skipping this step causes poor loop execution (missing deliverables, no completion proposal, etc.).

### During Execution

**After completing each skill**, call:
```
mcp__orchestrator__complete_skill({
  executionId: "[stored executionId]",
  skillId: "[skill name]",
  deliverables: ["new-loop.md"]  // optional
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

1. **Probe relentlessly** — Ask 5-10+ questions about the loop being created
2. **Surface assumptions** — "I'm assuming this loop needs X phases — correct?"
3. **Gather requirements** — What problem does this loop solve? Who uses it? What's the output?
4. **Don't stop early** — Keep asking until the loop design is crystal clear

At every phase transition and gate, pause to ask:
- "Does this loop structure match your vision?"
- "Any skills or gates I should add/remove?"
- "Ready to proceed with this design?"

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

### 1. Archive Run (Full Artifacts)

**Location:** `~/.claude/runs/{year-month}/{project}-meta-loop-{timestamp}/`

Create a directory containing ALL loop artifacts:

```bash
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${PROJECT}-meta-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"

mv meta-state.json "$ARCHIVE_DIR/" 2>/dev/null || true
cp LOOP-REQUIREMENTS.md RETROSPECTIVE.md \
   "$ARCHIVE_DIR/" 2>/dev/null || true
```

**Artifact organization:**
| Category | Location | Files |
|----------|----------|-------|
| **Permanent** | `~/.claude/commands/` | Generated `{name}-loop.md` |
| **Permanent** | skills-library | New `skills/*/SKILL.md` files |
| **Transient** | `~/.claude/runs/` | `meta-state.json`, `LOOP-REQUIREMENTS.md`, `RETROSPECTIVE.md` |

### 2. Update Dream State

At the System level (`{repo}/.claude/DREAM-STATE.md`):
- Update "Recent Completions" section
- Note new loops/skills added

### 3. Commit All Artifacts

**Principle:** A completed loop leaves no orphaned files.

```bash
git add -A
git diff --cached --quiet || git commit -m "Meta-loop complete: [description]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Note:** This step commits but does NOT push. Use `/distribution-loop` to push to remote and trigger CI/CD.

### 4. Clean Project Directory

Remove transient artifacts that have been archived:

```bash
rm -f LOOP-REQUIREMENTS.md RETROSPECTIVE.md meta-state.json 2>/dev/null || true
```

**Result:** Next `/meta-loop` invocation starts fresh with context gathering.

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
  Run archived: ~/.claude/runs/2025-01/orchestrator-meta-loop-29T14-30.json
  Dream State updated: .claude/DREAM-STATE.md

  Next invocation will start fresh.
══════════════════════════════════════════════════════════════
```
