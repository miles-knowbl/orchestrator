# /async-loop Command

**Prepare for autonomous Slack-based operation.** Gathers context, populates all 7 memory layers, builds a prioritized work queue, and verifies Slack connectivity — enabling fully autonomous "Start Next" workflows.

## Purpose

This command orchestrates preparation for mobile/async operation: syncing the dream state, collecting patterns and calibration data, scoring available modules, building a prioritized queue of next moves, and verifying Slack is ready. After completion, you can go mobile and control work entirely through Slack "Start Next" buttons.

**The flow you want:** run `/async-loop`, say `go`, and when it completes you're ready for fully autonomous operation via Slack.

## When to Use

- Before going mobile (jogging, driving, AFK)
- When you want autonomous loop execution without terminal access
- To set up a work queue for async processing
- Before a period where you want Claude to work independently

## The 7 Memory Layers

This loop ensures all context layers are populated for autonomous operation:

| Layer | Description | File |
|-------|-------------|------|
| 1. Dream State | Vision and goals | `memory/dream-state.json` |
| 2. Roadmap | Available moves | `memory/roadmap.json` |
| 3. Module Scores | What's ready vs blocked | `memory/module-scores.json` |
| 4. Patterns | Learned behaviors | `memory/patterns.json` |
| 5. Calibration | Accurate effort estimates | `memory/calibration.json` |
| 6. Run History | Recent completions | `memory/run-history.json` |
| 7. Improvements | Pending skill upgrades | `memory/improvements.json` |

## Usage

```
/async-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing async-state.json
- `--phase=PHASE`: Start from specific phase (INIT | GATHER | SCORE | PLAN | VERIFY | HANDOFF)

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

---

## Execution Flow

```
INIT ──► GATHER ──► SCORE ──► PLAN ──► VERIFY ──► HANDOFF
                               │
                               │ [plan-gate]
                               │  human
                               ▼
state-loader    dream-sync     module-scorer    leverage-calc    slack-validator   ready-confirm
prereq-checker  pattern-coll   blocker-analyzer queue-builder    notif-tester
                calibration-sync
                history-coll
```

**10 skills across 6 phases, 1 human gate**

---

## Phase Details

### INIT Phase
Load current system state and check prerequisites:
- Verify Slack is configured
- Check for active executions (warn if any)
- Load existing async-queue if present (offer to refresh)

**Skills:** `state-loader`, `prereq-checker`

### GATHER Phase
Collect and sync all 7 memory layers:
- Refresh dream state from `.claude/DREAM-STATE.md`
- Load recent run history (last 10 runs)
- Collect learned patterns from memory
- Sync calibration data for effort estimates
- Check pending improvements

**Skills:** `dream-sync`, `pattern-collector`, `calibration-sync`, `history-collector`

**Deliverable:** `memory/async-context.json`

### SCORE Phase
Score all available modules for prioritization:
- Calculate leverage scores using the value equation
- Identify blockers (dependencies, missing prereqs)
- Determine what's immediately actionable

**Skills:** `module-scorer`, `blocker-analyzer`

**Deliverable:** `memory/module-scores.json`

### PLAN Phase
Build the async work queue:
- Apply leverage protocol to scored modules
- Rank by: DSA (40%) + Downstream (25%) + Likelihood (15%) - Time (10%) - Effort (10%)
- Select top 5-10 moves
- Include loop type and target for each move

**Skills:** `leverage-calculator`, `queue-builder`

**Deliverable:** `memory/async-queue.json`

**Gate:** Review planned moves before proceeding

### VERIFY Phase
Test async channels are working:
- Verify Slack Socket Mode is connected
- Send test notification to configured channel
- Confirm delivery and button functionality

**Skills:** `slack-validator`, `notification-tester`

### HANDOFF Phase
Final confirmation and summary:
- Display the queue summary
- Show estimated total effort
- Confirm system is ready for async operation
- Provide instructions for mobile workflow

**Skills:** `handoff-confirmer`

---

## Gate Presentation

### plan-gate

```
═══════════════════════════════════════════════════════════════
║  PLAN GATE                                        [HUMAN]   ║
║                                                             ║
║  Async Queue (5 moves):                                     ║
║                                                             ║
║  #1  engineering-loop → auth-service                        ║
║      Score: 8.7 | Effort: Medium                            ║
║      Reason: Unblocks 3 dependent modules                   ║
║                                                             ║
║  #2  engineering-loop → api-gateway                         ║
║      Score: 8.2 | Effort: Medium                            ║
║      Reason: High dream state alignment                     ║
║                                                             ║
║  #3  bugfix-loop → flaky-tests                              ║
║      Score: 7.1 | Effort: Small                             ║
║      Reason: Improves CI reliability                        ║
║                                                             ║
║  #4  engineering-loop → dashboard                           ║
║      Score: 6.9 | Effort: Large                             ║
║      Reason: User-facing feature                            ║
║                                                             ║
║  #5  learning-loop → review-runs                            ║
║      Score: 5.2 | Effort: Small                             ║
║      Reason: Calibration improvement                        ║
║                                                             ║
║  Total Estimated Effort: 2-3 sessions                       ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Accept queue, continue to VERIFY         ║
║    changes: ...  — Request modifications                    ║
║    add [loop] [target] — Add a move to the queue            ║
║    remove [#]    — Remove a move from the queue             ║
║    reorder [#] [position] — Move item to new position       ║
═══════════════════════════════════════════════════════════════
```

---

## Output: async-queue.json

```json
{
  "version": "1.0.0",
  "createdAt": "2024-01-15T10:00:00Z",
  "createdBy": "async-loop",
  "context": {
    "dreamStateHash": "abc123",
    "patternsCount": 12,
    "calibrationVersion": "2024-01-15"
  },
  "moves": [
    {
      "rank": 1,
      "loopId": "engineering-loop",
      "module": "auth-service",
      "reason": "Unblocks 3 dependent modules",
      "score": 8.7,
      "estimatedEffort": "medium",
      "blockedBy": [],
      "unlocks": ["api-gateway", "dashboard", "mobile-app"]
    },
    {
      "rank": 2,
      "loopId": "engineering-loop",
      "module": "api-gateway",
      "reason": "High dream state alignment",
      "score": 8.2,
      "estimatedEffort": "medium",
      "blockedBy": ["auth-service"],
      "unlocks": ["dashboard"]
    }
  ],
  "totalMoves": 5,
  "estimatedTotalEffort": "2-3 sessions",
  "expiresAt": "2024-01-16T10:00:00Z"
}
```

---

## How "Start Next" Works After This

1. Async-loop completes → you go mobile
2. Spawned Claude Code reads `memory/async-queue.json`
3. Pops move #1 from the queue (auth-service)
4. Executes: `/engineering-loop auth-service`
5. Loop runs autonomously (no gate notifications)
6. On completion, Slack notification: "auth-service complete. Start Next?"
7. You click "Start Next"
8. Spawned Claude Code pops move #2 (api-gateway)
9. Repeat until queue exhausted
10. Final notification: "Queue complete. Run /async-loop to plan more."

---

## Differences from Other Loops

| Aspect | Async Loop | Other Loops |
|--------|------------|-------------|
| **Purpose** | Preparation | Execution |
| **Output** | Work queue | Deliverables |
| **Human presence** | At start only | Throughout |
| **After completion** | Go mobile | Stay at terminal |
| **Notifications** | Setup verification | Progress updates |

---

## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, progress |
| `approved` | Pass the plan gate |
| `changes: [feedback]` | Request changes to the queue |
| `add [loop] [target]` | Add a move to the queue |
| `remove [#]` | Remove a move by rank |
| `reorder [#] [position]` | Move item to new position |
| `pause` | Stop after current phase |

---

## Example Session

```
User: /async-loop

Async Loop v1.0.0: Preparing for autonomous operation...

  ═══════════════════════════════════════════════════════
  ║  READY — Async Preparation Loop v1.0.0              ║
  ║                                                     ║
  ║  This loop prepares the system for Slack-based     ║
  ║  autonomous operation. After completion, you can   ║
  ║  go mobile and use "Start Next" buttons.           ║
  ║                                                     ║
  ║  Phases: INIT → GATHER → SCORE → PLAN → VERIFY → HANDOFF
  ║  Gate: Plan review (human approval of work queue)  ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

══════════════════════════════════════════════════════════════
  INIT [1/6]
══════════════════════════════════════════════════════════════

  ┌─ state-loader
  │  Loading current system state...
  │  Active executions: 0
  │  Existing async-queue: none
  └─ ✓ state-loader complete

  ┌─ prereq-checker
  │  Checking prerequisites...
  │  ✓ Slack configured
  │  ✓ Socket Mode enabled
  │  ✓ Channel ID set
  └─ ✓ prereq-checker complete

  ✓ INIT complete

══════════════════════════════════════════════════════════════
  GATHER [2/6]
══════════════════════════════════════════════════════════════

  ┌─ dream-sync
  │  Syncing dream state...
  │  Vision: "Autonomous engineering assistant"
  │  Checklist items: 12 (7 complete, 5 remaining)
  └─ ✓ dream-sync complete

  ┌─ pattern-collector
  │  Collecting learned patterns...
  │  Patterns loaded: 8
  │  Recent: brownfield-integration-penalty
  └─ ✓ pattern-collector complete

  ┌─ calibration-sync
  │  Syncing calibration data...
  │  Calibrated skills: 15
  │  Accuracy: 82%
  └─ ✓ calibration-sync complete

  ┌─ history-collector
  │  Loading run history...
  │  Recent runs: 10
  │  Completed today: 2
  └─ ✓ history-collector complete

  ✓ GATHER complete (async-context.json written)

══════════════════════════════════════════════════════════════
  SCORE [3/6]
══════════════════════════════════════════════════════════════

  ┌─ module-scorer
  │  Scoring available modules...
  │  Modules found: 8
  │  Actionable: 5
  │  Blocked: 3
  └─ ✓ module-scorer complete

  ┌─ blocker-analyzer
  │  Analyzing blockers...
  │  dashboard blocked by: auth-service
  │  mobile-app blocked by: api-gateway
  └─ ✓ blocker-analyzer complete

  ✓ SCORE complete (module-scores.json written)

══════════════════════════════════════════════════════════════
  PLAN [4/6]
══════════════════════════════════════════════════════════════

  ┌─ leverage-calculator
  │  Calculating leverage scores...
  │  Using: DSA(40%) + Downstream(25%) + Likelihood(15%) - Time(10%) - Effort(10%)
  └─ ✓ leverage-calculator complete

  ┌─ queue-builder
  │  Building async queue...
  │  Moves queued: 5
  │  Total effort: ~2-3 sessions
  └─ ✓ queue-builder complete

  ✓ PLAN complete (async-queue.json written)

  ═══════════════════════════════════════════════════════════════
  ║  PLAN GATE                                        [HUMAN]   ║
  ║                                                             ║
  ║  Async Queue (5 moves):                                     ║
  ║                                                             ║
  ║  #1  engineering-loop → auth-service (8.7)                  ║
  ║  #2  engineering-loop → api-gateway (8.2)                   ║
  ║  #3  bugfix-loop → flaky-tests (7.1)                        ║
  ║  #4  engineering-loop → dashboard (6.9)                     ║
  ║  #5  learning-loop → review-runs (5.2)                      ║
  ║                                                             ║
  ║  Commands: approved | changes: ... | add/remove/reorder     ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: plan-gate ✓

══════════════════════════════════════════════════════════════
  VERIFY [5/6]
══════════════════════════════════════════════════════════════

  ┌─ slack-validator
  │  Verifying Slack connection...
  │  Socket Mode: connected
  │  Channel: #claude-notifications
  └─ ✓ slack-validator complete

  ┌─ notification-tester
  │  Sending test notification...
  │  ✓ Delivered to Slack
  │  ✓ Buttons rendered correctly
  └─ ✓ notification-tester complete

  ✓ VERIFY complete

══════════════════════════════════════════════════════════════
  HANDOFF [6/6]
══════════════════════════════════════════════════════════════

  ┌─ handoff-confirmer
  │  Finalizing async setup...
  │  Queue: 5 moves ready
  │  Slack: verified
  │  Context: fully loaded
  └─ ✓ handoff-confirmer complete

  ✓ HANDOFF complete

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   ASYNC LOOP COMPLETE                                               ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   READY FOR AUTONOMOUS OPERATION                                    ║
║                                                                     ║
║   Queue: 5 moves                                                    ║
║   Estimated effort: 2-3 sessions                                    ║
║   Slack: verified ✓                                                 ║
║                                                                     ║
║   ─────────────────────────────────────────────────────────────     ║
║                                                                     ║
║   NEXT STEPS:                                                       ║
║                                                                     ║
║   1. Go mobile (close terminal if you want)                         ║
║   2. Wait for first completion notification on Slack                ║
║   3. Click "Start Next" to execute queued moves                     ║
║   4. Repeat until queue exhausted                                   ║
║                                                                     ║
║   The spawned Claude Code will:                                     ║
║   • Read memory/async-queue.json                                    ║
║   • Execute moves in order                                          ║
║   • Notify only on completion or errors                             ║
║   • Ask for human input only if truly stuck                         ║
║                                                                     ║
║   ─────────────────────────────────────────────────────────────     ║
║                                                                     ║
║   To start immediately (without going mobile):                      ║
║   Say 'start' to begin executing the queue now.                     ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

---

## MCP Execution Protocol

### On Loop Start

```
mcp__orchestrator__start_execution({
  loopId: "async-loop",
  project: "[current project]"
})
```

### During Execution

Track skills and phases as with other loops:
- `complete_skill` after each skill
- `complete_phase` after each phase
- `approve_gate` when user approves plan

---

## State Files

| File | Purpose |
|------|---------|
| `async-state.json` | Current phase, progress |
| `memory/async-context.json` | Full 7-layer context snapshot |
| `memory/module-scores.json` | Scored modules with blockers |
| `memory/async-queue.json` | **The work queue for "Start Next"** |

---

## On Completion

### Archive

```bash
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${PROJECT}-async-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"
mv async-state.json "$ARCHIVE_DIR/"
```

### Clean Up

```bash
rm -f async-state.json
# Note: Do NOT delete memory/*.json - those are needed for async operation
```

### No Leverage Proposal

Unlike other loops, async-loop does NOT propose a next move — the queue IS the next moves.

---

## Queue Expiration

The async-queue includes an `expiresAt` timestamp (default: 24 hours). If the queue expires:
- "Start Next" will notify: "Queue expired. Run /async-loop to refresh."
- This ensures context doesn't become stale

---

## Resuming After Queue Exhaustion

When the queue is empty:
1. Slack notification: "Queue complete! All 5 moves executed."
2. You can either:
   - Run `/async-loop` again to build a new queue
   - Return to terminal for interactive work
