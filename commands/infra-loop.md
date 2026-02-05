# /infra-loop Command

**Single entry point for infrastructure provisioning.** Sets up dev environments, databases, containers, and CI/CD pipelines through a structured 5-phase pipeline.

## Purpose

This command orchestrates the complete infrastructure setup workflow: gathering requirements, planning architecture, provisioning services, and deploying to production. It handles dev environments, Docker containerization, database setup, monorepo configuration, and CI/CD distribution.

**The flow you want:** describe your infrastructure needs, say `go`, and the loop provisions everything from local dev to production deployment.

## Usage

```
/infra-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing infra-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | IMPLEMENT | SHIP | COMPLETE)

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
if infra-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, gather infrastructure requirements
```

### Step 2: Initialize State

Create `infra-state.json`:

```json
{
  "loop": "infra-loop",
  "version": "2.0.0",
  "phase": "INIT",
  "status": "active",

  "context": {
    "tier": "system",
    "organization": "personal",
    "system": "my-infra",
    "module": null
  },

  "gates": {
    "infra-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "deploy-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["requirements"] },
    "SCAFFOLD": { "status": "pending", "skills": ["scaffold", "infra-devenv"] },
    "IMPLEMENT": { "status": "pending", "skills": ["infra-docker", "infra-database", "infra-monorepo", "infra-services"] },
    "SHIP": { "status": "pending", "skills": ["deploy", "distribute"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────────► SCAFFOLD ──────────► IMPLEMENT
  │                │
  │                │ [infra-gate]
  │                │  human
  ▼                ▼
requirements     scaffold              infra-docker
                 infra-devenv          infra-database
                                       infra-monorepo
                                       infra-services

  ▼                ▼                    ▼

SHIP ──────────► COMPLETE
  │
  │ [deploy-gate]
  │  human
  ▼
deploy            retrospective
distribute
```

**9 skills across 5 phases, 2 human gates**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `infra-gate` | SCAFFOLD | human | User says `approved` | INFRA-PLAN.md |
| `deploy-gate` | SHIP | human | User says `approved` | DEPLOY-REPORT.md |

**Gate presentation (infra-gate):**
```
═══════════════════════════════════════════════════════════════
║  INFRA GATE                                    [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 INFRA-PLAN.md — Infrastructure architecture plan      ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Services provisioned: Docker, database, CI/CD          ║
║    ✓ Environments configured: dev, staging, production      ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to IMPLEMENT         ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (deploy-gate):**
```
═══════════════════════════════════════════════════════════════
║  DEPLOY GATE                                   [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 DEPLOY-REPORT.md — Deployment verification report     ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Deployment status: all targets healthy                 ║
║    ✓ CI/CD pipeline: distribute.yml operational             ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to COMPLETE          ║
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
| `infra-state.json` | Current phase, gate status, progress |
| `REQUIREMENTS.md` | Infrastructure requirements |
| `INFRASTRUCTURE-PLAN.md` | Full infra architecture and provisioning plan |
| `docker-compose.yml` | Container orchestration |
| `Dockerfile` | Container build definition |
| `.github/workflows/distribute.yml` | CI/CD pipeline |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /infra-loop

Infra Loop v1.0.0: Starting infrastructure provisioning...

  No existing infra state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Infra Loop v1.0.0                         ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 5                                          ║
  ║  Gates: infra → deploy                              ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

══════════════════════════════════════
  INIT                           [1/5]
══════════════════════════════════════

  ┌─ requirements
  │  Gathering infrastructure requirements...
  │  Analyzing database, Docker, CI/CD, dev environment needs...
  │
  │  Output:
  │    📄 REQUIREMENTS.md — Infrastructure requirements captured
  └─ ✓ requirements complete

  ✓ INIT complete (1 skill, 1 deliverable)

══════════════════════════════════════
  SCAFFOLD                       [2/5]
══════════════════════════════════════

  ┌─ scaffold
  │  Creating project structure...
  │  Generating directory layout and config files...
  │
  │  Output:
  │    📄 Directory structure scaffolded
  └─ ✓ scaffold complete

  ┌─ infra-devenv
  │  Configuring dev environment...
  │  Setting up local tooling and environment variables...
  │
  │  Output:
  │    📄 Dev environment configured
  └─ ✓ infra-devenv complete

  ✓ SCAFFOLD complete (2 skills, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  INFRA GATE                                    [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 INFRA-PLAN.md — Infrastructure architecture plan      ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Services provisioned: Docker, database, CI/CD          ║
  ║    ✓ Environments configured: dev, staging, production      ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to IMPLEMENT         ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: infra-gate ✓

══════════════════════════════════════
  IMPLEMENT                      [3/5]
══════════════════════════════════════

  ┌─ infra-docker
  │  Building container definitions...
  │  Creating Dockerfile and docker-compose.yml...
  │
  │  Output:
  │    📄 Docker configuration created
  └─ ✓ infra-docker complete

  ┌─ infra-database
  │  Provisioning database...
  │  Setting up schemas, migrations, connection pooling...
  │
  │  Output:
  │    📄 Database provisioned and configured
  └─ ✓ infra-database complete

  ┌─ infra-monorepo
  │  Configuring monorepo structure...
  │  Setting up workspaces and shared dependencies...
  │
  │  Output:
  │    📄 Monorepo workspace configured
  └─ ✓ infra-monorepo complete

  ┌─ infra-services
  │  Configuring services...
  │  Setting up service discovery and networking...
  │
  │  Output:
  │    📄 Services configured and connected
  └─ ✓ infra-services complete

  ✓ IMPLEMENT complete (4 skills, 4 deliverables)

══════════════════════════════════════
  SHIP                           [4/5]
══════════════════════════════════════

  ┌─ deploy
  │  Deploying to target environments...
  │  Verifying deployment health...
  │
  │  Output:
  │    📄 DEPLOY-REPORT.md — Deployment verification
  └─ ✓ deploy complete

  ┌─ distribute
  │  Setting up CI/CD workflow...
  │
  │  Output:
  │    📄 .github/workflows/distribute.yml
  └─ ✓ distribute complete

  ✓ SHIP complete (2 skills, 2 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  DEPLOY GATE                                   [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 DEPLOY-REPORT.md — Deployment verification report     ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Deployment status: all targets healthy                 ║
  ║    ✓ CI/CD pipeline: distribute.yml operational             ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to COMPLETE          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: deploy-gate ✓

══════════════════════════════════════
  COMPLETE                       [5/5]
══════════════════════════════════════

  ┌─ retrospective
  │  Reviewing loop execution...
  │  Capturing infrastructure learnings...
  │
  │  Output:
  │    📄 RETROSPECTIVE.md — Infrastructure learnings
  └─ ✓ retrospective complete

  ✓ COMPLETE (1 skill, 1 deliverable)

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   INFRA LOOP COMPLETE                                               ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT        Requirements gathered                               ║
║   ✓ SCAFFOLD    Dev environment and scaffold set up                 ║
║   ✓ IMPLEMENT   Docker, database, monorepo, services configured    ║
║   ✓ SHIP        Deployed and distributed                            ║
║   ✓ COMPLETE    Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Infrastructure Review [HUMAN]                                   ║
║   ✓ Deployment Review [HUMAN]                                       ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 INFRA-PLAN.md        Infrastructure architecture               ║
║   📄 DEPLOY-REPORT.md     Deployment verification                   ║
║   📄 RETROSPECTIVE.md     Infrastructure learnings                  ║
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
  loopId: "infra-loop",
  project: "[infrastructure target]"
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
      { "phase": "ANALYZE", "skill": "infra-audit", "deliverables": ["INFRA-SPEC.md"] }
    ],
    "skillGuarantees": [
      { "skill": "infra-audit", "guaranteeCount": 3, "guaranteeNames": ["..."] }
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
  deliverables: ["INFRA-SPEC.md"]  // optional
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

### Server Resilience (CRITICAL)

**If any MCP tool call fails with a connection error, DO NOT exit the loop.** Follow the retry protocol in `commands/_shared/server-resilience-protocol.md`:

1. Tell the user the server connection was lost
2. Wait 5 seconds, then retry the same call (the PreToolUse hook will restart the server)
3. If 3 retries fail, ask the user whether to wait, skip, or stop
4. Your executionId survives server restarts — do NOT create a new execution
5. Continue the loop from where you left off

### Why This Matters

Without MCP execution tracking:
- No Slack notifications (thread-per-execution)
- No execution history
- No calibration data collection

---

## Clarification Protocol

This loop follows the **Deep Context Protocol**. Before proceeding past INIT:

1. **Probe relentlessly** — Ask 5-10+ questions about infrastructure requirements
2. **Surface assumptions** — "I'm assuming you need X database — correct?"
3. **Gather constraints** — Cloud provider? Budget? Compliance? Scale requirements?
4. **Don't stop early** — Keep asking until all infrastructure decisions are clear

At every phase transition and gate, pause to ask:
- "Does this infrastructure plan match your needs?"
- "Any services or configurations I'm missing?"
- "Ready to proceed with provisioning?"

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

**Location:** `~/.claude/runs/{year-month}/{project}-infra-loop-{timestamp}/`

```bash
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${PROJECT}-infra-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"
mv infra-state.json "$ARCHIVE_DIR/" 2>/dev/null || true
cp INFRA-REQUIREMENTS.md RETROSPECTIVE.md "$ARCHIVE_DIR/" 2>/dev/null || true
```

**Artifact organization:**
| Category | Location | Files |
|----------|----------|-------|
| **Permanent** | Project root | Dockerfiles, CI/CD configs, infra code |
| **Transient** | `~/.claude/runs/` | `infra-state.json`, planning docs |

### 2. Update Dream State

At the System level (`{repo}/.claude/DREAM-STATE.md`):
- Update "Recent Completions" section
- Note infrastructure changes

### 3. Commit Infra Changes

```bash
git add -A
git diff --cached --quiet || git commit -m "Infra complete: [description]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Note:** Commits before archiving. Use `/distribution-loop` to push.

### 4. Clean Project Directory

```bash
rm -f INFRA-REQUIREMENTS.md RETROSPECTIVE.md infra-state.json 2>/dev/null || true
```

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
  Run archived: ~/.claude/runs/2025-01/myinfra-infra-loop-29T14-30.json
  Dream State updated: .claude/DREAM-STATE.md

  Next invocation will start fresh.
══════════════════════════════════════════════════════════════
```
