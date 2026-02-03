# Async Preparation Loop

## Purpose

Prepares the orchestrator for autonomous Slack-based operation. Run this loop before going mobile (jogging, driving, AFK). After completion, you can control work entirely through Slack "Start Next" buttons.

## When to Use

- Before going mobile/AFK
- When you want autonomous loop execution
- To set up a work queue for async processing

## The 7 Layers

This loop ensures all context layers are populated:

| Layer | Description | File |
|-------|-------------|------|
| 1. Dream State | Vision and goals | `memory/dream-state.json` |
| 2. Roadmap | Available moves | `memory/roadmap.json` |
| 3. Module Scores | What's ready vs blocked | `memory/module-scores.json` |
| 4. Patterns | Learned behaviors | `memory/patterns.json` |
| 5. Calibration | Accurate effort estimates | `memory/calibration.json` |
| 6. Run History | Recent completions | `memory/run-history.json` |
| 7. Improvements | Pending skill upgrades | `memory/improvements.json` |

## Phases

### INIT
Load current system state. Check prerequisites:
- Slack configured and connected
- At least one module ready for work
- No critical blockers

### GATHER
Collect and sync all 7 layers:
- Refresh dream state if stale
- Load recent run history
- Collect learned patterns
- Sync calibration data

### SCORE
Score all available modules:
- Calculate leverage scores
- Identify blockers
- Determine what's actionable

### PLAN
Build the async queue:
- Apply leverage protocol to all modules
- Rank by: Dream State Alignment (40%) + Downstream Unlock (25%) + Likelihood (15%) - Time (10%) - Effort (10%)
- Select top 5-10 moves
- Write to `memory/async-queue.json`

**Gate:** Review planned moves before proceeding

### VERIFY
Test async channels:
- Verify Slack Socket Mode connected
- Send test notification
- Confirm delivery

**Gate:** Slack must be working

### HANDOFF
Final confirmation:
- Display the queue summary
- Show estimated work time
- Confirm ready for async operation

## Output: async-queue.json

```json
{
  "createdAt": "2024-01-15T10:00:00Z",
  "createdBy": "async-loop",
  "moves": [
    {
      "rank": 1,
      "loopId": "engineering-loop",
      "module": "auth-service",
      "reason": "Unblocks 3 dependent modules",
      "score": 8.7,
      "estimatedEffort": "medium"
    },
    {
      "rank": 2,
      "loopId": "engineering-loop",
      "module": "api-gateway",
      "reason": "High dream state alignment",
      "score": 8.2,
      "estimatedEffort": "medium"
    }
  ],
  "totalMoves": 5,
  "estimatedTotalEffort": "2-3 sessions"
}
```

## How "Start Next" Works After This

1. You click "Start Next" on Slack
2. Spawned Claude Code reads `memory/async-queue.json`
3. Pops move #1 from the queue
4. Executes that loop (e.g., `/engineering-loop auth-service`)
5. On completion, notifies you with "Start Next" button
6. Repeat until queue exhausted

## Differences from Other Loops

| Aspect | Async Loop | Other Loops |
|--------|------------|-------------|
| **Purpose** | Preparation | Execution |
| **Output** | Queue of moves | Deliverables |
| **Human** | Present at start | Present throughout |
| **After** | Go mobile | Stay at terminal |

## Example Session

```
Terminal:
> /async-loop

[INIT] Loading state... ✓
[GATHER] Syncing 7 layers... ✓
[SCORE] Scoring 12 modules... ✓
[PLAN] Building queue...
  1. engineering-loop → auth-service (8.7)
  2. engineering-loop → api-gateway (8.2)
  3. bugfix-loop → flaky-tests (7.1)
  4. engineering-loop → dashboard (6.9)
  5. learning-loop → review-runs (5.2)
[Gate] Review queue? (approve/reject)
> approve
[VERIFY] Testing Slack... ✓ Notification delivered
[HANDOFF] Ready for async operation!

Queue: 5 moves | Est: 2-3 sessions
Go mobile. Use "Start Next" on Slack to begin.
```

Then on Slack:
```
[Notification] auth-service complete. Start Next?
[Click] → api-gateway starts
[Notification] api-gateway complete. Start Next?
...
```
