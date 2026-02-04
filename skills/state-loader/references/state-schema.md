# Async State Schema

Complete schema for `memory/async-state.json`.

## Root Object

```json
{
  "loaded_at": "string (ISO 8601 timestamp)",
  "version": "string (schema version)",
  "memory": { ... },
  "executions": { ... },
  "config": { ... },
  "git": { ... },
  "validation": { ... }
}
```

## Memory Block

```json
{
  "memory": {
    "patterns_count": "number",
    "patterns_recent": "number (last 7 days)",
    "decisions_count": "number",
    "decisions_recent": "number (last 7 days)",
    "calibration_version": "string",
    "calibration_accuracy": "number (0-1)",
    "last_handoff": "string (ISO timestamp) | null"
  }
}
```

## Executions Block

```json
{
  "executions": {
    "recent": "number (last 10)",
    "in_progress": "number",
    "failed_unresolved": "number",
    "last_completed": {
      "id": "string",
      "loop": "string",
      "completed_at": "string (ISO timestamp)",
      "outcome": "success | failed | abandoned"
    },
    "pending_gates": [
      {
        "execution_id": "string",
        "gate_id": "string",
        "waiting_since": "string (ISO timestamp)"
      }
    ]
  }
}
```

## Config Block

```json
{
  "config": {
    "messaging_enabled": "boolean",
    "messaging_channels": ["terminal", "slack"],
    "slack_connected": "boolean",
    "slack_channel_id": "string | null",
    "autonomous_enabled": "boolean",
    "autonomous_tick_interval": "number (ms)",
    "autonomous_max_parallel": "number"
  }
}
```

## Git Block

```json
{
  "git": {
    "branch": "string",
    "uncommitted": "boolean",
    "uncommitted_files": "number",
    "behind_remote": "number",
    "ahead_remote": "number",
    "last_commit": {
      "hash": "string (short)",
      "message": "string",
      "time_ago": "string"
    },
    "conflict_state": "boolean"
  }
}
```

## Validation Block

```json
{
  "validation": {
    "valid": "boolean",
    "warnings": [
      {
        "code": "string",
        "message": "string",
        "recoverable": "boolean"
      }
    ],
    "errors": [
      {
        "code": "string",
        "message": "string",
        "blocking": "boolean"
      }
    ]
  }
}
```

## Warning Codes

| Code | Meaning |
|------|---------|
| `STALE_STATE` | Previous async state >24 hours old |
| `MISSING_SLACK` | Slack not configured |
| `LOW_CALIBRATION` | Calibration accuracy <70% |
| `PENDING_GATES` | Gates waiting for approval |

## Error Codes

| Code | Meaning | Blocking |
|------|---------|----------|
| `CORRUPTED_MEMORY` | Memory JSON invalid | Yes |
| `GIT_CONFLICT` | Git in conflict state | Yes |
| `NO_EXECUTIONS` | No execution history | No |
| `MISSING_CONFIG` | Required config missing | Depends |
