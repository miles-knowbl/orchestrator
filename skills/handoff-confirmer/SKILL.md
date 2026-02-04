---
name: handoff-confirmer
description: "Confirms system is ready for async handoff. Performs final validation and produces handoff summary before entering mobile operation mode."
phase: HANDOFF
category: async
version: "1.0.0"
depends_on: [queue-builder, notification-tester]
tags: [async, handoff, confirmation, mobile]
---

# Handoff Confirmer

Final confirmation that system is ready for async operation.

## When to Use

- Final step of async-loop
- After all verifications pass
- To produce handoff summary and enter async mode

## What It Confirms

### Readiness Checklist

| Check | Source | Required |
|-------|--------|----------|
| State loaded | state-loader | Yes |
| Prerequisites met | prereq-checker | Yes |
| Context gathered | dream-sync, etc. | Yes |
| Queue built | queue-builder | Yes |
| Slack working | slack-validator | Yes |
| Notifications working | notification-tester | Yes |

### Handoff Package

Everything needed for async operation:
- Work queue (memory/async-queue.json)
- Context cache (memory/async-context.json)
- State snapshot (memory/async-state.json)

## Workflow

### Step 1: Verify All Prior Steps

```typescript
const checks = {
  state: await verifyFile('memory/async-state.json'),
  context: await verifyFile('memory/async-context.json'),
  queue: await verifyFile('memory/async-queue.json'),
  slack: execution.gates['verify-gate']?.status === 'approved'
};

if (!Object.values(checks).every(Boolean)) {
  return { ready: false, missing: getMissing(checks) };
}
```

### Step 2: Load Queue Summary

```typescript
const queue = await loadJSON('memory/async-queue.json');
const summary = {
  moves: queue.queue.items.length,
  first_move: queue.queue.items[0],
  estimated_hours: queue.totals.estimated_hours,
  human_gates: queue.totals.human_gates
};
```

### Step 3: Calculate Autonomous Duration

How long until human intervention needed:

```typescript
function calculateAutonomousDuration(queue) {
  let hours = 0;

  for (const item of queue.items) {
    if (item.gates.human > 0) {
      // Hits human gate
      return { hours, stops_at: item.module };
    }
    hours += item.estimated_hours;
  }

  return { hours, stops_at: null };
}
```

### Step 4: Produce Handoff Summary

```
╔══════════════════════════════════════════════════════════════╗
║  ASYNC HANDOFF CONFIRMED                                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Queue: 7 moves planned                                      ║
║  First: auth-service (engineering-loop)                      ║
║  Estimated: 15.5 hours total                                 ║
║                                                              ║
║  Autonomous Duration: 3.5 hours                              ║
║  First Human Gate: auth-service @ REVIEW                     ║
║                                                              ║
║  Slack Channel: #orchestrator                                ║
║  Notifications: Enabled (@mention on gates)                  ║
║                                                              ║
║  Commands available via Slack:                               ║
║    "start next" — Begin first queue item                     ║
║    "status"     — Show current progress                      ║
║    "approved"   — Approve current gate                       ║
║    "pause"      — Pause execution                            ║
║                                                              ║
║  Ready for mobile operation.                                 ║
╚══════════════════════════════════════════════════════════════╝
```

### Step 5: Send Slack Notification

```typescript
await messagingService.notify({
  type: 'handoff_complete',
  channel: 'slack',
  message: `Async handoff complete. Queue: ${summary.moves} moves. Say "start next" to begin.`,
  buttons: [
    { text: 'Start Next', action: 'start_next' },
    { text: 'Show Queue', action: 'show_queue' }
  ]
});
```

### Step 6: Update State

```typescript
await updateAsyncState({
  mode: 'async',
  handoff_at: new Date().toISOString(),
  queue_position: 0,
  status: 'ready'
});
```

## Output

Updates `memory/async-state.json`:

```json
{
  "mode": "async",
  "handoff_at": "ISO-timestamp",
  "handoff_summary": {
    "queue_size": 7,
    "estimated_hours": 15.5,
    "autonomous_hours": 3.5,
    "first_human_gate": {
      "module": "auth-service",
      "gate": "REVIEW"
    }
  },
  "status": "ready",
  "awaiting_command": true
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated async state | `memory/async-state.json` | Always |
| Slack notification | Slack channel | If enabled |

## Completion Message

The loop ends with:

```
Ready for async operation. Go mobile and use 'Start Next' on Slack.
```

## Post-Handoff Operation

After handoff, the system:
1. Waits for "start next" command
2. Executes queue items in order
3. Notifies on gates
4. Pauses on human gates
5. Continues when approved

## References

- [async-commands.md](references/async-commands.md) — Slack commands for async operation
