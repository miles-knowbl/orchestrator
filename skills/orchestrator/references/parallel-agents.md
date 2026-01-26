# Parallel Agents Reference

Patterns for spawning and coordinating multiple sub-agents.

---

## Overview

The orchestrator can spawn up to 6-7 sub-agents working on independent systems simultaneously. Each agent operates in its own git worktree with coordination via shared state files.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PARALLEL AGENT ARCHITECTURE                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        ORCHESTRATOR                                  │   │
│  │  • Mode detection                                                    │   │
│  │  • Scope discovery                                                   │   │
│  │  • Agent spawning                                                    │   │
│  │  • Progress monitoring                                               │   │
│  │  • Gate queue management                                             │   │
│  │  • Merge coordination                                                │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│            ┌────────────────────┼────────────────────┐                      │
│            │                    │                    │                      │
│            ▼                    ▼                    ▼                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │    Sub-Agent 1   │ │    Sub-Agent 2   │ │    Sub-Agent 3   │            │
│  │                  │ │                  │ │                  │            │
│  │  Worktree:       │ │  Worktree:       │ │  Worktree:       │            │
│  │  .worktrees/     │ │  .worktrees/     │ │  .worktrees/     │            │
│  │  feature-auth/   │ │  feature-api/    │ │  feature-ui/     │            │
│  │                  │ │                  │ │                  │            │
│  │  Branch:         │ │  Branch:         │ │  Branch:         │            │
│  │  feature/auth    │ │  feature/api     │ │  feature/ui      │            │
│  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘            │
│           │                    │                    │                      │
│           └────────────────────┼────────────────────┘                      │
│                                │                                           │
│                                ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     SHARED COORDINATION                              │   │
│  │                                                                      │   │
│  │  coordination/                                                       │   │
│  │  ├── agents/                                                         │   │
│  │  │   ├── agent-1.json    (status, progress, heartbeat)              │   │
│  │  │   ├── agent-2.json                                               │   │
│  │  │   └── agent-3.json                                               │   │
│  │  ├── gates-pending.json  (stage gates awaiting human)               │   │
│  │  ├── locks.json          (resource locks)                           │   │
│  │  └── events.json         (coordination events)                      │   │
│  │                                                                      │   │
│  │  loop-state.json         (orchestrator state + agent registry)      │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Spawning Sub-Agents

### Prerequisites

Before spawning:
1. Mode detected and confirmed
2. Scope discovery complete
3. Systems identified as parallelizable
4. Worktree paths planned

### Spawn Procedure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SPAWN PROCEDURE                                        │
│                                                                             │
│  1. CREATE WORKTREE                                                         │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │ git worktree add .worktrees/{system-name} -b feature/{system}   │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  2. CREATE AGENT STATE FILE                                                 │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │ Write coordination/agents/{agent-id}.json                        │    │
│     │ {                                                                │    │
│     │   "id": "agent-{system-name}",                                   │    │
│     │   "system": "{system-name}",                                     │    │
│     │   "worktree": ".worktrees/{system-name}",                        │    │
│     │   "branch": "feature/{system-name}",                             │    │
│     │   "status": "spawning",                                          │    │
│     │   "startedAt": "{timestamp}"                                     │    │
│     │ }                                                                │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  3. SPAWN VIA TASK TOOL                                                     │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │ Task(                                                            │    │
│     │   description: "Sub-agent for {system-name}",                    │    │
│     │   subagent_type: "general-purpose",                              │    │
│     │   run_in_background: true,                                       │    │
│     │   prompt: "{agent-prompt}"                                       │    │
│     │ )                                                                │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  4. RECORD IN LOOP-STATE                                                    │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │ Update loop-state.json subAgents array                           │    │
│     │ Record outputFile from Task tool result                          │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Prompt Template

```markdown
# Sub-Agent Assignment: {system-name}

You are a sub-agent spawned by the orchestrator to work on a specific system.

## Context

**Mode:** {mode} (inherited from orchestrator)
**Orchestrator ID:** {orchestrator-id}

## Your Assignment

**System:** {system-name}
**Description:** {system-description}

## Your Workspace

**Worktree:** {worktree-path}
**Branch:** feature/{system-name}

**IMPORTANT:**
- All your work MUST be done in this worktree
- Do NOT modify files outside your worktree
- Start by navigating: `cd {worktree-path}`

## Your Task

{system-specific-feature-spec-or-gap-description}

## Coordination Protocol

### Status Updates

Update your status file regularly:
- Path: coordination/agents/{agent-id}.json
- Update on: stage transitions, completion, blocking issues

```json
{
  "id": "{agent-id}",
  "status": "running|waiting-gate|completed|failed",
  "currentStage": "SCAFFOLD|IMPLEMENT|TEST|...",
  "progress": "description of current work",
  "lastHeartbeat": "{timestamp}"
}
```

### Stage Gates

When you reach a checkpoint requiring human review:

1. Update your status to "waiting-gate"
2. Add entry to coordination/gates-pending.json:

```json
{
  "id": "gate-{uuid}",
  "agent": "{agent-id}",
  "type": "{gate-type}",
  "description": "{what needs review}",
  "artifacts": ["{paths to review}"],
  "requestedAt": "{timestamp}",
  "status": "pending"
}
```

3. Wait for approval (check gates-pending.json for status: "approved")

### Resource Locks

Before modifying shared files (outside your worktree):

1. Check coordination/locks.json
2. If unlocked, acquire lock:
```json
{
  "resource": "{file-path}",
  "lockedBy": "{agent-id}",
  "lockedAt": "{timestamp}",
  "expiresAt": "{timestamp + 5min}",
  "reason": "{why}"
}
```
3. Make changes
4. Release lock (remove entry)

### Completion

When done:
1. Commit all changes to your branch
2. Update status to "completed"
3. Add completion event to coordination/events.json:
```json
{
  "type": "agent.completed",
  "agent": "{agent-id}",
  "system": "{system-name}",
  "timestamp": "{timestamp}",
  "branch": "feature/{system-name}",
  "commits": ["{commit-hashes}"]
}
```

## Mode-Specific Behavior

{mode-specific-instructions}

## Begin

Navigate to your worktree and begin execution:

```bash
cd {worktree-path}
git status
```

Execute the loop for your system. Good luck!
```

---

## State Files

### Agent State (coordination/agents/{agent-id}.json)

```json
{
  "id": "agent-ui-polish",
  "system": "ui-polish",
  "worktree": ".worktrees/ui-polish",
  "branch": "feature/ui-polish",
  "status": "running",
  "currentStage": "IMPLEMENT",
  "progress": "Adding dark mode styles to components",
  "startedAt": "2026-01-20T15:00:00Z",
  "lastHeartbeat": "2026-01-20T15:45:00Z",
  "outputFile": "/path/to/task-output.txt",
  "metrics": {
    "filesModified": 12,
    "testsAdded": 5,
    "commitsCreated": 3
  }
}
```

### Gates Pending (coordination/gates-pending.json)

```json
{
  "gates": [
    {
      "id": "gate-abc123",
      "agent": "agent-ui-polish",
      "type": "visual-review",
      "description": "Dark mode styling complete, ready for visual review",
      "artifacts": [
        "screenshots/home-dark.png",
        "screenshots/dashboard-dark.png"
      ],
      "requestedAt": "2026-01-20T16:00:00Z",
      "status": "pending",
      "priority": "normal"
    },
    {
      "id": "gate-def456",
      "agent": "agent-data-validation",
      "type": "schema-review",
      "description": "Database schema changes ready for review",
      "artifacts": [
        "prisma/schema.prisma",
        "prisma/migrations/20260120_add_validation/"
      ],
      "requestedAt": "2026-01-20T16:05:00Z",
      "status": "pending",
      "priority": "high"
    }
  ]
}
```

### Locks (coordination/locks.json)

```json
{
  "locks": [
    {
      "resource": "shared/types/index.ts",
      "lockedBy": "agent-api",
      "lockedAt": "2026-01-20T15:30:00Z",
      "expiresAt": "2026-01-20T15:35:00Z",
      "reason": "Adding new API types"
    }
  ]
}
```

### Events (coordination/events.json)

```json
{
  "events": [
    {
      "id": "evt-001",
      "type": "agent.spawned",
      "agent": "agent-ui-polish",
      "timestamp": "2026-01-20T15:00:00Z"
    },
    {
      "id": "evt-002",
      "type": "agent.stage_changed",
      "agent": "agent-ui-polish",
      "fromStage": "SCAFFOLD",
      "toStage": "IMPLEMENT",
      "timestamp": "2026-01-20T15:15:00Z"
    },
    {
      "id": "evt-003",
      "type": "agent.completed",
      "agent": "agent-data-validation",
      "timestamp": "2026-01-20T16:30:00Z",
      "branch": "feature/data-validation"
    }
  ]
}
```

---

## Orchestrator Monitoring

### Progress Check Loop

```javascript
async function monitorAgents(agents) {
  while (agents.some(a => a.status !== 'completed' && a.status !== 'failed')) {
    // Check each agent
    for (const agent of agents) {
      const state = await readAgentState(agent.id);

      // Update heartbeat check
      if (isHeartbeatStale(state.lastHeartbeat)) {
        console.warn(`Agent ${agent.id} heartbeat stale`);
        // Consider intervention
      }

      // Check for gate requests
      if (state.status === 'waiting-gate') {
        await queueGateForHuman(agent.id);
      }

      // Check for completion
      if (state.status === 'completed') {
        await handleAgentCompletion(agent.id);
      }

      // Check for failure
      if (state.status === 'failed') {
        await handleAgentFailure(agent.id);
      }
    }

    // Check pending gates
    await processGateQueue();

    // Sleep before next check
    await sleep(30000); // 30 seconds
  }
}
```

### Gate Queue Processing

```
Orchestrator displays pending gates to user:

═══════════════════════════════════════════════════════════
STAGE GATES PENDING (3)
═══════════════════════════════════════════════════════════

[1] agent-ui-polish: Visual Review (normal priority)
    Dark mode styling complete, ready for visual review
    Artifacts: screenshots/home-dark.png, screenshots/dashboard-dark.png
    Waiting: 5 minutes

[2] agent-data-validation: Schema Review (HIGH priority)
    Database schema changes ready for review
    Artifacts: prisma/schema.prisma
    Waiting: 3 minutes

[3] agent-api: Security Review (normal priority)
    New API endpoints ready for security check
    Artifacts: src/routes/api/users.ts
    Waiting: 1 minute

═══════════════════════════════════════════════════════════

Select gate to review [1-3] or 'all' for batch:
```

---

## Merge Coordination

### When All Agents Complete

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MERGE PROCEDURE                                        │
│                                                                             │
│  1. VERIFY ALL AGENTS COMPLETE                                              │
│     • All status = "completed"                                              │
│     • No pending gates                                                      │
│                                                                             │
│  2. MERGE SEQUENTIALLY (safest)                                             │
│     For each agent branch:                                                  │
│     a. git checkout main                                                    │
│     b. git merge feature/{system} --no-ff                                   │
│     c. Resolve conflicts if any                                             │
│     d. Run tests                                                            │
│     e. If tests pass, continue; else stop                                   │
│                                                                             │
│  3. ALTERNATIVE: MERGE TO INTEGRATION BRANCH                                │
│     a. Create integration branch                                            │
│     b. Merge all feature branches                                           │
│     c. Test integration branch                                              │
│     d. PR integration → main                                                │
│                                                                             │
│  4. CLEANUP                                                                 │
│     • Remove worktrees: git worktree remove .worktrees/{name}               │
│     • Delete branches if merged                                             │
│     • Archive coordination files                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Limits and Guidelines

### Resource Limits

| Resource | Recommended Limit | Reason |
|----------|------------------|--------|
| Max sub-agents | 7 | System resources, coordination overhead |
| Heartbeat timeout | 5 minutes | Detect stale agents |
| Lock TTL | 5 minutes | Prevent deadlocks |
| Gate timeout | 30 minutes | Don't block indefinitely |

### When to Use Parallel Agents

**Use parallel agents when:**
- Systems are truly independent
- No shared file modifications
- Each system has clear boundaries
- Speedup justifies coordination overhead

**Don't use parallel agents when:**
- Systems have tight dependencies
- Shared state requires coordination
- Single system with sequential steps
- User prefers to review sequentially

---

## Troubleshooting

### Agent Not Responding

1. Check output file via `Read` tool
2. Check agent state file
3. If stale, consider:
   - Resume agent with Task tool (using agent ID)
   - Kill and restart
   - Absorb work into another agent

### Merge Conflicts

1. Identify conflicting files
2. Determine which agent's changes take precedence
3. Manual resolution in integration branch
4. Re-run tests

### Gate Queue Backup

1. Prioritize critical gates
2. Batch review similar gates
3. Consider auto-approve for low-risk gates
4. Communicate delays to agents (via events)

---

*Parallel agents multiply throughput when used correctly. Coordinate carefully.*
