# Server Resilience Protocol

**All MCP tool calls in loops MUST follow this retry protocol.** The orchestrator server may restart during a loop (crash, manual restart, port conflict). When this happens, the `ensure-orchestrator.sh` PreToolUse hook will automatically restart the server — but only if you retry the call.

## When an MCP Tool Call Fails

If any `mcp__orchestrator__*` call fails with a connection error, timeout, or server error:

### 1. DO NOT exit the loop

A connection error is NOT a reason to stop the loop. The execution state is persisted to disk and survives server restarts.

### 2. Wait and retry

```
On MCP tool failure:
  1. Note the error (connection refused, timeout, 500, etc.)
  2. Tell the user: "Orchestrator server connection lost. Waiting for restart..."
  3. Wait 5 seconds
  4. Retry the SAME MCP tool call
  5. The PreToolUse hook will auto-start the server if it's down
  6. If retry succeeds → continue the loop normally
  7. If retry fails → wait 10 seconds, retry once more
  8. If 3rd attempt fails → ask the user:
     "Server isn't responding after 3 attempts. Options:
      - wait: I'll keep trying
      - skip: Skip this MCP call and continue the loop locally
      - stop: Pause the loop (you can resume later)"
```

### 3. Continue from where you left off

After the server comes back:
- Your `executionId` is still valid (executions persist to disk)
- Call `get_execution(executionId)` to verify current state
- Resume from the current phase/skill — do NOT restart the loop

## What Errors Trigger Retry

| Error Type | Retry? | Why |
|------------|--------|-----|
| Connection refused | Yes | Server is down, hook will restart it |
| Timeout | Yes | Server may be starting up |
| 500/502/503 error | Yes | Server may be restarting |
| 404 "Execution not found" | Yes (once) | Server may still be loading executions from disk |
| 400 validation error | No | Actual bug in your call, fix the parameters |
| Tool not found | No | MCP registration issue, ask user to check config |

## What NOT to Do

- Do NOT exit the loop on connection errors
- Do NOT start a new execution after server restart (reuse the existing executionId)
- Do NOT manually start the server with `npm start &` — the hook handles this
- Do NOT treat server errors as loop failures — they are infrastructure issues

## Graceful Degradation

If the server is down and you cannot reach it, you can still:
- Continue writing code (IMPLEMENT, TEST phases don't need MCP for the actual work)
- Continue reviewing deliverables
- Queue up MCP calls and make them when the server returns

The MCP calls (complete_skill, complete_phase, advance_phase, approve_gate) are for **tracking and notifications**, not for the actual engineering work. The loop can make progress even while the server is temporarily down — just catch up on the tracking calls once it's back.

## Example Recovery Flow

```
[Loop in IMPLEMENT phase, calling complete_skill...]

  MCP call failed: connection refused

  Orchestrator server connection lost. Waiting for restart...
  [5 second pause]

  Retrying complete_skill...
  [ensure-orchestrator.sh hook fires, opens Terminal, starts server]
  [Hook waits up to 30s for server health]

  complete_skill succeeded. Continuing loop.

  [Loop continues normally from where it left off]
```
