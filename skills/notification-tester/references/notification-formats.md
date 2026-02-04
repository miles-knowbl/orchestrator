# Notification Formats

Specifications for all notification types.

## Gate Waiting Notification

### Slack Format

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Gate Approval Needed"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Loop:* engineering-loop\n*Phase:* REVIEW\n*Gate:* code-review-gate"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Waiting since: 2 minutes ago"
        }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "Approve" },
          "style": "primary",
          "action_id": "approve_gate",
          "value": "exec-123:code-review-gate"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "Reject" },
          "style": "danger",
          "action_id": "reject_gate",
          "value": "exec-123:code-review-gate"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "View Details" },
          "action_id": "show_details",
          "value": "exec-123"
        }
      ]
    }
  ],
  "text": "<@USER_ID> Gate Approval Needed"
}
```

### Terminal Format

```
╔══════════════════════════════════════════════════════════╗
║  GATE APPROVAL NEEDED                                    ║
╠══════════════════════════════════════════════════════════╣
║  Loop: engineering-loop                                  ║
║  Phase: REVIEW                                           ║
║  Gate: code-review-gate                                  ║
║                                                          ║
║  Waiting since: 2 minutes ago                            ║
║                                                          ║
║  Run: approved / rejected / show status                  ║
╚══════════════════════════════════════════════════════════╝
```

## Loop Complete Notification

### Slack Format

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Loop Completed"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Loop:* engineering-loop\n*Duration:* 2h 15m\n*Outcome:* Success"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Deliverables:*\n• SPEC.md\n• Implementation complete\n• Tests passing"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "View Summary" },
          "action_id": "show_summary",
          "value": "exec-123"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "Start Next" },
          "style": "primary",
          "action_id": "start_next",
          "value": "queue"
        }
      ]
    }
  ],
  "text": "Loop engineering-loop completed successfully"
}
```

## Error Notification

### Slack Format

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Execution Error"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Loop:* engineering-loop\n*Phase:* IMPLEMENT\n*Error:* Test failures detected"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "```\n5 tests failed\nSee execution logs for details\n```"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "View Logs" },
          "action_id": "show_logs",
          "value": "exec-123"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "Retry" },
          "action_id": "retry_phase",
          "value": "exec-123:IMPLEMENT"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "Abort" },
          "style": "danger",
          "action_id": "abort_execution",
          "value": "exec-123"
        }
      ]
    }
  ],
  "text": "<@USER_ID> Execution error in engineering-loop"
}
```

## Status Update Notification

### Slack Format

```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Phase *IMPLEMENT* completed. Moving to *TEST*."
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Progress: 3/6 phases complete"
        }
      ]
    }
  ]
}
```

## @Mention Rules

| Notification Type | @Mention |
|-------------------|----------|
| Gate waiting | Always |
| Error | Always |
| Loop complete | Optional |
| Status update | Never |
