---
name: prereq-checker
description: "Validates prerequisites for async operation. Ensures Slack is configured, modules are available for work, and system is ready for autonomous execution."
phase: INIT
category: operations
version: "1.0.0"
depends_on: [state-loader]
tags: [async, validation, prerequisites, readiness]
---

# Prereq Checker

Validates that all prerequisites for async operation are met before proceeding.

## When to Use

- After state-loader completes
- Before entering async/mobile mode
- To validate system readiness for autonomous operation

## Prerequisites Checked

### 1. Slack Configuration

| Check | Required | Fallback |
|-------|----------|----------|
| Bot token configured | Yes | Abort |
| App token configured | Yes (for Socket Mode) | Abort |
| Channel ID set | Yes | Abort |
| User ID set | Yes (for @mentions) | Warn |
| Connection test passes | Yes | Abort |

### 2. Module Availability

| Check | Required | Fallback |
|-------|----------|----------|
| At least 1 unblocked module | Yes | Abort |
| Roadmap accessible | Yes | Abort |
| Dream state accessible | Yes | Warn |

### 3. System Health

| Check | Required | Fallback |
|-------|----------|----------|
| No git conflicts | Yes | Abort |
| No uncommitted changes | No | Warn |
| Server healthy | Yes | Abort |
| Memory writable | Yes | Abort |

### 4. Configuration Validity

| Check | Required | Fallback |
|-------|----------|----------|
| Autonomous mode configured | Yes | Use defaults |
| Tick interval reasonable | Yes | Use default (60s) |
| Max parallel reasonable | Yes | Use default (1) |

## Workflow

### Step 1: Load State

Read `memory/async-state.json` from state-loader output.

### Step 2: Check Slack

```typescript
// Verify config exists
const slackConfig = state.config.slack;
if (!slackConfig.botToken || !slackConfig.channelId) {
  return { valid: false, error: 'SLACK_NOT_CONFIGURED' };
}

// Test connection
const testResult = await testSlackConnection(slackConfig);
if (!testResult.success) {
  return { valid: false, error: 'SLACK_CONNECTION_FAILED' };
}
```

### Step 3: Check Modules

```typescript
// Get available modules from roadmap
const modules = await roadmapService.getModulesNeedingAttention();
const unblocked = modules.filter(m => m.blockedBy.length === 0);

if (unblocked.length === 0) {
  return { valid: false, error: 'NO_AVAILABLE_MODULES' };
}
```

### Step 4: Check System Health

```typescript
// Health checks
const health = {
  git: !state.git.conflict_state,
  server: await healthCheck(),
  memory: await testMemoryWritable()
};

if (!health.git || !health.server || !health.memory) {
  return { valid: false, error: 'SYSTEM_UNHEALTHY', details: health };
}
```

### Step 5: Compile Results

```json
{
  "valid": true,
  "checks": {
    "slack": { "passed": true },
    "modules": { "passed": true, "available": 3 },
    "system": { "passed": true },
    "config": { "passed": true }
  },
  "warnings": ["Uncommitted changes detected"],
  "ready_for_async": true
}
```

## Output

Updates `memory/async-state.json` with prereq results:

```json
{
  "prerequisites": {
    "checked_at": "ISO-timestamp",
    "valid": true,
    "checks": { ... },
    "warnings": [ ... ],
    "ready_for_async": true
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated async state | `memory/async-state.json` | Always |

## Error Handling

| Error | Recovery Action |
|-------|-----------------|
| `SLACK_NOT_CONFIGURED` | Guide user to configure Slack |
| `SLACK_CONNECTION_FAILED` | Check network, token validity |
| `NO_AVAILABLE_MODULES` | All work complete or blocked |
| `SYSTEM_UNHEALTHY` | Show which health check failed |

## References

- [prereq-checklist.md](references/prereq-checklist.md) — Complete checklist with remediation steps
