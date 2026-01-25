# Autonomy Configuration

Configure execution mode for the engineering loop.

## Execution Modes

| Mode | Description | Human Involvement | Use Case |
|------|-------------|-------------------|----------|
| **Autonomous** | Run to completion | Only on failure escalation | Small systems, high confidence |
| **Supervised** | Pause at configured gates | Approval at stage boundaries | Large systems, enterprise |
| **Hybrid** | Autonomous with critical gates | Approval only for high-risk stages | Standard projects |

## Domain-Level Configuration

Set default mode for all systems in a domain:

```json
// domain-memory/{domain}/config.json
{
  "autonomy": {
    "defaultMode": "hybrid",
    "failureRetries": 3,
    "escalationTimeout": "30m",
    "gates": {
      "architecture": {
        "required": true,
        "mode": "human",
        "description": "Architecture approval before implementation"
      },
      "security": {
        "required": true,
        "mode": "human",
        "description": "Security review before ship"
      },
      "deploy": {
        "required": true,
        "mode": "human",
        "description": "Deploy approval before production"
      }
    }
  }
}
```

## System-Level Override

Override domain defaults for specific systems:

```json
// In system-queue.json, per system
{
  "id": "sys-001",
  "name": "Auth Service",
  "autonomy": {
    "mode": "supervised",
    "gates": {
      "architecture": { "required": true },
      "security": { "required": true },
      "database": { "required": true },
      "deploy": { "required": true }
    },
    "reason": "Security-critical system requires full oversight"
  }
}
```

## Mode Behaviors

### Autonomous Mode

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTONOMOUS MODE                                       │
│                                                                             │
│  Agent executes continuously until:                                         │
│  • System is complete, OR                                                   │
│  • Unrecoverable failure (max retries exceeded), OR                         │
│  • Explicitly configured gate                                               │
│                                                                             │
│  INIT ──▶ SCAFFOLD ──▶ IMPLEMENT ──▶ TEST ──▶ VERIFY ──▶                   │
│  VALIDATE ──▶ DOCUMENT ──▶ REVIEW ──▶ SHIP ──▶ COMPLETE                    │
│                                                                             │
│  No human interaction unless failure escalation                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Supervised Mode

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPERVISED MODE                                       │
│                                                                             │
│  Agent pauses at each configured gate for human approval:                   │
│                                                                             │
│  INIT ──▶ [GATE: Architecture] ──▶ SCAFFOLD ──▶ IMPLEMENT ──▶              │
│  TEST ──▶ VERIFY ──▶ VALIDATE ──▶ [GATE: Security] ──▶                     │
│  DOCUMENT ──▶ REVIEW ──▶ [GATE: Deploy] ──▶ SHIP ──▶ COMPLETE              │
│                                                                             │
│  Human receives notification at each gate                                   │
│  Agent waits for approval/feedback before proceeding                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Hybrid Mode (Default)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HYBRID MODE                                           │
│                                                                             │
│  Agent runs autonomously with gates only at critical points:                │
│                                                                             │
│  INIT ──▶ SCAFFOLD ──▶ IMPLEMENT ──▶ TEST ──▶ VERIFY ──▶                   │
│  VALIDATE ──▶ [GATE: Security] ──▶ DOCUMENT ──▶ REVIEW ──▶                 │
│  [GATE: Deploy] ──▶ SHIP ──▶ COMPLETE                                      │
│                                                                             │
│  Security gate: Ensure no vulnerabilities before shipping                   │
│  Deploy gate: Ensure readiness before production                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Gate Types

| Gate | Stage | Mode | Risk Level |
|------|-------|------|------------|
| `specification` | After INIT | Optional | Low |
| `architecture` | After SCAFFOLD | Recommended | Medium |
| `implementation` | After IMPLEMENT | Optional | Low |
| `security` | After VALIDATE | **Recommended** | High |
| `database` | Before DB migrations | Context-dependent | Medium |
| `deploy` | Before SHIP | **Recommended** | High |

## Gate Approval Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GATE APPROVAL FLOW                                    │
│                                                                             │
│  1. GATE TRIGGERED                                                          │
│     └─→ Agent reaches configured gate                                       │
│     └─→ Generate gate summary (what was done, what's next)                  │
│     └─→ Create notification for human                                       │
│                                                                             │
│  2. HUMAN REVIEW                                                            │
│     └─→ Human receives notification (GitHub, Slack, email)                  │
│     └─→ Reviews deliverables and summary                                    │
│     └─→ Provides decision: APPROVE / REQUEST_CHANGES / REJECT               │
│                                                                             │
│  3. GATE RESOLUTION                                                         │
│     └─→ APPROVE: Agent proceeds to next stage                               │
│     └─→ REQUEST_CHANGES: Agent addresses feedback, re-triggers gate         │
│     └─→ REJECT: Agent marks system as BLOCKED, creates handoff              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Failure Handling with Autonomy

### Automatic Retry

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTOMATIC RETRY                                       │
│                                                                             │
│  On failure:                                                                │
│  1. Log failure to journey                                                  │
│  2. Invoke debug-assist to diagnose                                         │
│  3. Attempt fix                                                             │
│  4. Re-run failed stage                                                     │
│  5. If still failing:                                                       │
│     └─→ If retries < max: Go to step 2                                      │
│     └─→ If retries >= max: Escalate to human                                │
│                                                                             │
│  Default max retries: 3                                                     │
│  Retry timeout: 30 minutes per attempt                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Human Escalation

When automatic retry fails:

```markdown
## Escalation: [System Name]

**Stage:** [Failed Stage]
**Attempts:** 3/3
**Time in Failure:** 45 minutes

### Failure Summary
[What went wrong]

### Attempted Fixes
1. [Fix 1] — Result: [Still failing]
2. [Fix 2] — Result: [Still failing]
3. [Fix 3] — Result: [Still failing]

### Diagnostics
[Debug output, logs, error messages]

### Recommended Actions
1. [Action human should take]
2. [Alternative approach]

### To Resume
After resolving, run:
```
/resume --domain {domain} --system {system}
```
```

## Configuration Examples

### Small Personal Project (Full Autonomy)

```json
{
  "autonomy": {
    "defaultMode": "autonomous",
    "gates": {},
    "failureRetries": 5,
    "reason": "Personal project, trust agent fully"
  }
}
```

### Standard Team Project (Hybrid)

```json
{
  "autonomy": {
    "defaultMode": "hybrid",
    "gates": {
      "security": { "required": true },
      "deploy": { "required": true }
    },
    "failureRetries": 3,
    "reason": "Team project with standard oversight"
  }
}
```

### Enterprise Critical System (Supervised)

```json
{
  "autonomy": {
    "defaultMode": "supervised",
    "gates": {
      "specification": { "required": true },
      "architecture": { "required": true },
      "security": { "required": true },
      "database": { "required": true },
      "deploy": { "required": true }
    },
    "failureRetries": 1,
    "notificationChannel": "slack:#security-reviews",
    "reason": "Critical system requires full human oversight"
  }
}
```

## Integration Points

### With Journey Tracer

- Log mode and gates in journey
- Track time waiting at gates
- Record approval/rejection history

### With Skill Verifier

- Gates trigger skill verification
- Gate approval includes verification status
- Failed verification blocks gate approval

### With MCP Tools

```
loop_state_update:
  - Set autonomy mode
  - Configure gates
  - Record gate approvals

queue_update:
  - Set per-system autonomy overrides
```

## User Experience

### Starting Autonomous Build

```
User: "Let's build a notification service"

Agent: 
  I'll create a notification service for you. Based on domain config:
  - Mode: Hybrid (autonomous with security and deploy gates)
  - Expected time: ~4 hours
  - Human approval needed: Security review, Deploy approval
  
  Starting now. I'll notify you when I reach a gate or complete.
  
  [Begins execution...]
```

### Gate Notification

```
Agent:
  🚦 Security Gate Reached — Notification Service
  
  ## Summary
  - Implementation complete (4 capabilities)
  - All tests passing
  - Verification: PASS
  
  ## Security Findings
  - No vulnerabilities detected
  - Input validation: ✅
  - Authentication: ✅
  - Authorization: ✅
  
  ## Ready for Review
  [Link to VALIDATION.md]
  [Link to security section]
  
  Reply with:
  - "approve" to continue
  - "changes: <feedback>" for modifications
  - "reject" to stop
```

### Failure Escalation

```
Agent:
  ⚠️ Escalation Required — Notification Service
  
  I've attempted to fix this issue 3 times without success.
  
  ## Issue
  Database connection failing in test environment
  
  ## Attempted
  1. Verified credentials — correct
  2. Checked network — reachable
  3. Increased timeout — still failing
  
  ## Need Human Help
  Likely infrastructure issue beyond my access.
  
  Once resolved, reply "resume" to continue.
```

## Autonomy Checklist

```markdown
## Autonomy Configuration Verification

### Domain Config
- [ ] config.json exists with autonomy settings
- [ ] Default mode appropriate for domain
- [ ] Gates configured for risk level
- [ ] Failure retries reasonable

### System Overrides
- [ ] Critical systems have explicit config
- [ ] Security-sensitive systems have human gates
- [ ] Notification channels configured

### Execution
- [ ] Agent respects configured mode
- [ ] Gates trigger correctly
- [ ] Escalation works
- [ ] Resume from escalation works
```
