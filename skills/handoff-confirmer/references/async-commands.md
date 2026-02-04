# Async Commands

Slack commands available during async operation.

## Command Reference

### start next

Begins the next item in the queue.

**Usage:** `start next` or `go`

**Response:**
```
Starting: auth-service (engineering-loop)
Estimated duration: 3.5 hours
First human gate: REVIEW phase

I'll notify you when the gate is reached.
```

### status

Shows current execution status.

**Usage:** `status` or `show status`

**Response:**
```
Current Status

Executing: auth-service
Phase: IMPLEMENT
Progress: 2/6 phases complete
Duration: 45 minutes

Queue: 6 more items remaining
Next: api-endpoints
```

### approved

Approves the current waiting gate.

**Usage:** `approved` or `approve`

**Requires:** Gate currently waiting

**Response:**
```
Gate approved: code-review-gate
Continuing execution...
```

### rejected [reason]

Rejects the current waiting gate.

**Usage:** `rejected Need more tests` or `reject`

**Requires:** Gate currently waiting

**Response:**
```
Gate rejected: code-review-gate
Reason: Need more tests
Execution paused. Review feedback logged.
```

### pause

Pauses current execution.

**Usage:** `pause`

**Response:**
```
Execution paused.
Current state: IMPLEMENT phase, 45 minutes in
Resume with "resume" when ready.
```

### resume

Resumes paused execution.

**Usage:** `resume`

**Response:**
```
Resuming execution...
Continuing from: IMPLEMENT phase
```

### skip

Skips the current queue item.

**Usage:** `skip` or `skip [reason]`

**Response:**
```
Skipping: auth-service
Reason: Will revisit later
Moving to: api-endpoints
```

### show queue

Displays the full queue.

**Usage:** `show queue` or `queue`

**Response:**
```
Async Queue (7 items)

1. [active] auth-service (3.5h)
2. [pending] api-endpoints (2h)
3. [pending] user-dashboard (3h)
...

Total estimated: 15.5 hours
Human gates: 4
```

### show details

Shows details for current or specified item.

**Usage:** `show details` or `details auth-service`

**Response:**
```
auth-service Details

Loop: engineering-loop
Leverage: 8.2
Estimated: 3.5 hours
Gates: 3 (2 auto, 1 human)
Human gate at: REVIEW phase

Unlocks: api-endpoints, user-dashboard
```

## Command Shortcuts

| Full Command | Shortcut |
|--------------|----------|
| `start next` | `go` |
| `status` | `s` |
| `approved` | `ok`, `approve` |
| `rejected` | `no`, `reject` |
| `show queue` | `q` |
| `show details` | `d` |

## Button Actions

Some commands are also available as buttons:

| Button | Command | Context |
|--------|---------|---------|
| [Start Next] | `start next` | Handoff notification |
| [Approve] | `approved` | Gate notification |
| [Reject] | `rejected` | Gate notification |
| [View Details] | `show details` | Any notification |
| [Pause] | `pause` | Status notification |

## Natural Language

The command parser also understands:
- "let's go" → `start next`
- "looks good" → `approved`
- "what's happening" → `status`
- "hold on" → `pause`
- "continue" → `resume`

## Error Messages

### No execution active
```
No execution currently active. Use "start next" to begin.
```

### No gate waiting
```
No gate currently waiting for approval.
Current status: Executing IMPLEMENT phase
```

### Unknown command
```
I didn't understand that. Try:
• status — Show current state
• start next — Begin next item
• approved — Approve waiting gate
```
