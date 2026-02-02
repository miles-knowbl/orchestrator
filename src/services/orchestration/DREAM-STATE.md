# 2-Layer Orchestration Module Dream State

> Orchestrator that spawns and manages sub-agents for parallel module execution

## Overview

The 2-layer orchestration system enables a single orchestrator per system to spawn and coordinate multiple sub-agents, each working on different modules in parallel. This is the foundation for autonomous operation.

## Status: Complete

**Version**: 1.0.0
**Completion**: 30/30 functions (100%)

## Architecture

### Layer 1: System Orchestrator (Persistent)
- One per System (project/repo/app)
- Human-facing portal
- Manages git worktrees per module
- Spawns and coordinates Layer 2 agents
- Tracks progress toward dream state

### Layer 2: Task Agents (Ephemeral)
- Spawned for specific module + loop combinations
- Execute in isolation (own worktree/branch)
- Report progress back to orchestrator
- Commit to parent orchestrator's branch
- Spun down on completion

## Functions

### OrchestrationService (Layer 1)
- [x] `initializeOrchestrator(systemId, systemPath)` - Create/resume orchestrator
- [x] `setDependencies(deps)` - Wire up services
- [x] `getOrchestrator()` - Get orchestrator state
- [x] `getNextWorkItems(count)` - Get leverage-scored work
- [x] `spawnAgentsForWork(workItems)` - Spawn agents for work
- [x] `handleAgentComplete(agentId)` - Handle agent completion
- [x] `handleAgentFailed(agentId)` - Handle agent failure (escalation)
- [x] `runAutonomousCycle()` - Full autonomous cycle
- [x] `getAgents()` - List all agents
- [x] `getAgent(id)` - Get specific agent
- [x] `getWorkQueue()` - Get work queue state
- [x] `getEventLog(limit)` - Get orchestration events
- [x] `getProgressSummary()` - Dashboard-ready summary
- [x] `pause()` - Pause orchestrator
- [x] `resume()` - Resume orchestrator
- [x] `shutdown()` - Graceful shutdown
- [x] `generateTerminalView()` - Terminal visualization

### AgentManager
- [x] `initialize()` - Initialize manager
- [x] `spawnAgent(options)` - Spawn a Layer 2 agent
- [x] `getAgent(id)` - Get agent by ID
- [x] `getAllAgents()` - List all agents
- [x] `getActiveAgents()` - List active agents
- [x] `getAgentsByModule(moduleId)` - Filter by module
- [x] `getAgentsByStatus(status)` - Filter by status
- [x] `updateAgentProgress(id, progress)` - Update progress
- [x] `updateAgentStatus(id, status)` - Update status
- [x] `terminateAgent(id)` - Terminate agent
- [x] `decideConcurrencyMode(workItems)` - Decide parallel strategy
- [x] `getSummary()` - Get statistics
- [x] `shutdown()` - Graceful shutdown

### WorktreeManager
- [x] `initialize()` - Initialize and discover worktrees
- [x] `createWorktree(moduleId)` - Create worktree for module
- [x] `getWorktree(moduleId)` - Get worktree info
- [x] `listWorktrees()` - List all worktrees
- [x] `commit(moduleId, message, files)` - Commit in worktree
- [x] `getStatus(moduleId)` - Get worktree status
- [x] `mergeToMain(moduleId, deleteAfter)` - Merge to main
- [x] `deleteWorktree(moduleId, force)` - Delete worktree
- [x] `getCommitLog(moduleId, limit)` - Get commit history
- [x] `getSummary()` - Get statistics

### MCP Tools (17 tools)
- [x] `init_orchestrator` - Initialize orchestrator
- [x] `get_orchestrator` - Get orchestrator state
- [x] `pause_orchestrator` - Pause
- [x] `resume_orchestrator` - Resume
- [x] `shutdown_orchestrator` - Shutdown
- [x] `spawn_agent` - Spawn single agent
- [x] `spawn_agents_auto` - Auto-spawn for leverage
- [x] `get_agent` - Get agent details
- [x] `list_agents` - List all agents
- [x] `get_agents_by_module` - Filter by module
- [x] `terminate_agent` - Terminate agent
- [x] `get_work_queue` - Get work queue
- [x] `get_next_work` - Get next work items
- [x] `get_orchestration_progress` - Progress summary
- [x] `get_orchestration_events` - Event log
- [x] `render_orchestration_terminal` - Terminal view
- [x] `run_autonomous_cycle` - Run autonomous cycle

### API Endpoints (15 endpoints)
- [x] POST `/api/orchestration/init`
- [x] GET `/api/orchestration`
- [x] PUT `/api/orchestration/pause`
- [x] PUT `/api/orchestration/resume`
- [x] PUT `/api/orchestration/shutdown`
- [x] POST `/api/orchestration/agents`
- [x] POST `/api/orchestration/agents/auto`
- [x] GET `/api/orchestration/agents`
- [x] GET `/api/orchestration/agents/:id`
- [x] DELETE `/api/orchestration/agents/:id`
- [x] GET `/api/orchestration/work-queue`
- [x] GET `/api/orchestration/next-work`
- [x] GET `/api/orchestration/progress`
- [x] GET `/api/orchestration/events`
- [x] GET `/api/orchestration/terminal`

## Key Design Decisions

1. **Two-Layer Architecture**: Clear separation between persistent orchestrator (Layer 1) and ephemeral task agents (Layer 2).

2. **Git Worktrees Per Module**: Each module gets its own branch and worktree for isolation. Agents commit to their module's branch.

3. **Concurrency Modes**:
   - `sequential` - For dependent tasks or file overlap
   - `parallel-async` - For 2-4 independent agents
   - `parallel-threads` - For 5+ agents (true parallelism)

4. **Failure Cascade**: Retry with context → Reassign to fresh agent → Escalate to human (last resort).

5. **Leverage-Driven Work**: Uses RoadmapService leverage scores to prioritize work.

## Data Location

```
data/orchestrators/{systemId}.json  - Orchestrator state
.worktrees/{moduleId}/              - Git worktrees per module
```

## Integration

- **RoadmapService**: Module priorities and dependencies
- **ExecutionEngine**: Loop execution for agents
- **LoopComposer**: Loop definitions
- **MemoryService**: Context and learning

## Unlocks

- autonomous (Layer 1) - Full loop execution without gates
- dreaming (Layer 1) - Background proposal generation
- multi-agent-worktrees (Layer 1) - Multiple agents across hierarchy
