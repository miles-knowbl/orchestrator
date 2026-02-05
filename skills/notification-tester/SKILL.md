---
name: notification-tester
description: "Tests notification delivery for async operation. Verifies that notifications reach the user across all configured channels."
phase: VERIFY
category: operations
version: "1.0.0"
depends_on: [slack-validator]
tags: [async, notifications, testing, communication]
---

# Notification Tester

Tests that notifications will reach the user during async operation.

## When to Use

- During async-loop VERIFY phase
- After Slack validation passes
- To confirm end-to-end notification delivery

## What It Tests

### Notification Types

| Type | Purpose | Test |
|------|---------|------|
| Gate waiting | Alert user to approve gate | Send mock gate notification |
| Loop complete | Inform of completion | Send mock completion notification |
| Error alert | Warn of problems | Send mock error notification |
| Status update | Progress updates | Send mock status notification |

### Delivery Channels

| Channel | Test Method |
|---------|-------------|
| Slack | Message with buttons |
| Terminal | Console output + OS notification |

## Workflow

### Step 1: Get Enabled Channels

```typescript
const channels = await messagingService.getEnabledChannels();
// ['slack', 'terminal']
```

### Step 2: Test Each Channel

```typescript
for (const channel of channels) {
  const result = await testChannel(channel);
  results[channel] = result;
}
```

### Step 3: Send Test Gate Notification

Simulates a gate waiting notification:

```typescript
const gateNotification = await messagingService.notifyGateWaiting({
  executionId: 'test-execution',
  gate: {
    id: 'test-gate',
    name: 'Test Gate',
    type: 'human'
  },
  context: {
    loop: 'test-loop',
    phase: 'TEST',
    waiting_since: new Date().toISOString()
  },
  test: true // Marks as test, may be styled differently
});
```

### Step 4: Verify @mention

For Slack, verify user is @mentioned:

```typescript
const mentionWorking = gateNotification.text?.includes(`<@${userId}>`);
```

### Step 5: Test Response Handling

Verify that clicking buttons triggers correct handling:

```typescript
// This is tested by slack-validator interactive test
// Here we just verify the handlers are registered
const handlers = messagingService.getRegisteredHandlers();
const requiredHandlers = ['approve_gate', 'reject_gate', 'show_status'];

for (const handler of requiredHandlers) {
  if (!handlers.includes(handler)) {
    results.handlers.missing.push(handler);
  }
}
```

### Step 6: Report Results

```json
{
  "notification_test": {
    "tested_at": "ISO-timestamp",
    "channels_tested": ["slack", "terminal"],
    "results": {
      "slack": {
        "gate_notification": "delivered",
        "mention_working": true,
        "buttons_rendered": true
      },
      "terminal": {
        "gate_notification": "displayed",
        "os_notification": "sent"
      }
    },
    "handlers_registered": ["approve_gate", "reject_gate", "show_status"],
    "overall_valid": true
  }
}
```

## Output

Updates execution state with test results.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Test report | Execution logs | Always |

## Notification Formats

### Gate Waiting (Slack)

```
@user Gate Approval Needed

Loop: engineering-loop
Phase: REVIEW
Gate: code-review-gate

Waiting since: 2 minutes ago

[Approve] [Reject] [View Details]
```

### Loop Complete (Slack)

```
Loop Completed Successfully

Loop: engineering-loop
Duration: 2h 15m
Outcome: All gates passed

[View Summary] [Start Next]
```

## References

- [notification-formats.md](references/notification-formats.md) — All notification format specifications
