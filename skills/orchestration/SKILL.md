# 2-Layer Orchestration Skill

> Spawn and coordinate sub-agents for parallel module execution

## Overview

The 2-layer orchestration system enables a single **Layer 1 Orchestrator** per system to spawn multiple **Layer 2 Agents** that work on different modules in parallel. This is the foundation for autonomous operation.

## Architecture

### Layer 1: System Orchestrator
- **Persistent** - stays active as long as you're working on the system
- **Human-facing portal** - the interface you interact with
- **Strategic decisions** - which modules to work on, in what order
- **Coordinates agents** - spawns, monitors, handles failures

### Layer 2: Task Agents
- **Ephemeral** - spawned for a task, terminated on completion
- **Module-scoped** - each agent works on one module
- **Isolated** - commits to its own git branch via worktree
- **Autonomous** - executes loops without human intervention

## Git Worktree Model

Each module gets its own git worktree and branch:

```
project/
├── src/                    ← main branch
└── .worktrees/
    ├── auth/               ← branch: module/auth
    ├── api/                ← branch: module/api
    └── dashboard/          ← branch: module/dashboard
```

Benefits:
- **Isolation** - no merge conflicts during parallel development
- **Parallel** - multiple agents can work simultaneously
- **Clean merges** - module completion = merge to main

## MCP Tools

### Orchestrator Management
| Tool | Description |
|------|-------------|
| `init_orchestrator` | Initialize orchestrator for a system |
| `get_orchestrator` | Get orchestrator state |
| `pause_orchestrator` | Pause (no new work assigned) |
| `resume_orchestrator` | Resume paused orchestrator |
| `shutdown_orchestrator` | Graceful shutdown |

### Agent Management
| Tool | Description |
|------|-------------|
| `spawn_agent` | Spawn single agent for module + loop |
| `spawn_agents_auto` | Auto-spawn for highest leverage work |
| `list_agents` | List all agents |
| `get_agent` | Get agent details |
| `get_agents_by_module` | Filter agents by module |
| `terminate_agent` | Terminate an agent |

### Work Queue
| Tool | Description |
|------|-------------|
| `get_work_queue` | View pending/in-progress/completed work |
| `get_next_work` | Get leverage-scored next items |

### Monitoring
| Tool | Description |
|------|-------------|
| `get_orchestration_progress` | Progress summary |
| `get_orchestration_events` | Event log |
| `render_orchestration_terminal` | Terminal visualization |

### Autonomous Execution
| Tool | Description |
|------|-------------|
| `run_autonomous_cycle` | Full cycle: identify → spawn → execute |

## API Endpoints

### Orchestrator
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orchestration/init` | POST | Initialize orchestrator |
| `/api/orchestration` | GET | Get orchestrator state |
| `/api/orchestration/pause` | PUT | Pause |
| `/api/orchestration/resume` | PUT | Resume |
| `/api/orchestration/shutdown` | PUT | Shutdown |

### Agents
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orchestration/agents` | POST | Spawn agent |
| `/api/orchestration/agents/auto` | POST | Auto-spawn |
| `/api/orchestration/agents` | GET | List agents |
| `/api/orchestration/agents/:id` | GET | Get agent |
| `/api/orchestration/agents/:id` | DELETE | Terminate agent |

### Work & Monitoring
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orchestration/work-queue` | GET | Work queue |
| `/api/orchestration/next-work` | GET | Next work items |
| `/api/orchestration/progress` | GET | Progress summary |
| `/api/orchestration/events` | GET | Event log |
| `/api/orchestration/terminal` | GET | Terminal view |

## Concurrency Modes

The orchestrator automatically selects concurrency mode:

| Mode | When | Use Case |
|------|------|----------|
| `sequential` | File overlap or dependencies | Avoid conflicts |
| `parallel-async` | 2-4 independent tasks | Light parallelism |
| `parallel-threads` | 5+ tasks | Full parallelism |

## Failure Handling

Cascading recovery:

1. **Retry with context** - Agent retries with knowledge of what failed
2. **Reassign** - Terminate agent, spawn fresh one with failure context
3. **Escalate** - Last resort, alert human (considered failure toward autonomy)

## Usage Flow

### Initialize
```typescript
// Initialize orchestrator for your system
init_orchestrator({
  systemId: "taste-mixer",
  systemPath: "/Users/you/projects/taste-mixer"
})
```

### Manual Agent Spawn
```typescript
// Spawn agent for specific module
spawn_agent({
  moduleId: "auth",
  loopId: "engineering-loop",
  scope: "Implement authentication system"
})
```

### Autonomous Execution
```typescript
// Let orchestrator decide what to work on
run_autonomous_cycle()
// Returns: { cycleId, agentsSpawned, modulesTargeted }
```

### Monitor Progress
```typescript
// Get overall progress
get_orchestration_progress()

// Watch specific agent
get_agent({ agentId: "..." })

// View terminal dashboard
render_orchestration_terminal()
```

## Integration

- **RoadmapService** - Module priorities and dependencies
- **ExecutionEngine** - Loop execution
- **LoopComposer** - Loop definitions
- **MemoryService** - Context and learning

## Configuration

Default configuration (can be overridden):

```typescript
{
  defaultConcurrencyMode: 'parallel-threads',
  maxParallelAgents: undefined,      // Unlimited
  defaultMaxRetries: 3,
  retryDelayMs: 5000,
  escalationThreshold: 10,
  worktreesDirectory: '.worktrees',
  branchPrefix: 'module/',
  autoMergeOnComplete: false,        // Require human approval
  heartbeatIntervalMs: 5000,
  heartbeatTimeoutMs: 30000,
}
```

## Data Persistence

```
data/orchestrators/{systemId}.json   - Orchestrator state
.worktrees/{moduleId}/               - Git worktrees
```
