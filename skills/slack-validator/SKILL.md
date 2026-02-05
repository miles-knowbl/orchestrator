---
name: slack-validator
description: "Validates Slack connection and configuration for async operation. Ensures bidirectional communication is working before handoff."
phase: VERIFY
category: operations
version: "1.0.0"
depends_on: [prereq-checker]
tags: [async, slack, validation, communication]
---

# Slack Validator

Validates that Slack integration is properly configured and working.

## When to Use

- During async-loop VERIFY phase
- Before entering mobile/async operation
- To confirm bidirectional Slack communication

## What It Validates

### Configuration

| Check | Required | Test |
|-------|----------|------|
| Bot token | Yes | Token format valid |
| App token | Yes | Token format valid |
| Channel ID | Yes | Channel exists |
| User ID | Yes | User can be mentioned |
| Socket Mode | Yes | Connection established |

### Connectivity

| Check | Required | Test |
|-------|----------|------|
| Can send | Yes | Test message delivered |
| Can receive | Yes | Button click received |
| Can @mention | Yes | User mentioned successfully |

### Features

| Check | Required | Test |
|-------|----------|------|
| Block Kit | Yes | Buttons render |
| Threading | Yes | Reply to thread works |
| Reactions | No | Can add reactions |

## Workflow

### Step 1: Validate Configuration

```typescript
const config = await loadSlackConfig();

const configChecks = {
  botToken: config.botToken?.startsWith('xoxb-'),
  appToken: config.appToken?.startsWith('xapp-'),
  channelId: config.channelId?.match(/^[CG]/),
  userId: config.slackUserId?.startsWith('U')
};

if (!Object.values(configChecks).every(Boolean)) {
  return { valid: false, error: 'INVALID_CONFIG', details: configChecks };
}
```

### Step 2: Test Connection

```typescript
// Test socket connection
const socketHealth = await slackAdapter.checkConnection();

if (!socketHealth.connected) {
  return { valid: false, error: 'CONNECTION_FAILED' };
}
```

### Step 3: Send Test Message

```typescript
const testMessage = await slackAdapter.sendMessage({
  channel: config.channelId,
  text: "Async validation test",
  blocks: [
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Async Loop Validation*\nTesting communication..." }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Confirm Receipt" },
          action_id: "async_validation_confirm"
        }
      ]
    }
  ]
});

if (!testMessage.ok) {
  return { valid: false, error: 'SEND_FAILED' };
}
```

### Step 4: Wait for Confirmation (Optional)

If running interactively:
```typescript
const confirmation = await waitForButtonClick(
  'async_validation_confirm',
  timeout: 60000
);
```

### Step 5: Report Results

```json
{
  "slack_validation": {
    "validated_at": "ISO-timestamp",
    "config_valid": true,
    "connection_valid": true,
    "send_valid": true,
    "receive_valid": true,
    "overall_valid": true,
    "test_message_ts": "1234567890.123456"
  }
}
```

## Output

Updates execution state with validation results.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Validation report | Execution logs | Always |

## Error Recovery

| Error | Recovery Action |
|-------|-----------------|
| `INVALID_CONFIG` | Guide to fix configuration |
| `CONNECTION_FAILED` | Check network, regenerate tokens |
| `SEND_FAILED` | Verify bot in channel |
| `RECEIVE_FAILED` | Check Socket Mode enabled |

## References

- [slack-setup.md](references/slack-setup.md) — Slack app setup guide
