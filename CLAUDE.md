# Orchestrator - Claude Code Instructions

## Project Overview

Orchestrator is a self-improving meta-system where **skills are the atomic primitive**. It manages skills, composes them into loops, learns at all levels, and generates UI apps from loop definitions.

## Quick Start

```bash
# Build and run the server
npm run build && node dist/index.js

# Server runs on http://localhost:3002
# Dashboard at http://localhost:3003 (cd apps/dashboard && npm run dev)
```

## Directory Structure

- `src/` - TypeScript source code
  - `services/` - Core services (SkillRegistry, LoopComposer, ExecutionEngine, MemoryService, LearningService, CalibrationService, InboxProcessor)
  - `tools/` - MCP tool handlers
  - `server/` - HTTP server and API routes
  - `generator/` - Loop App generation
- `skills/` - Skill definitions (each skill is a directory with SKILL.md)
- `loops/` - Loop definitions (loop.json + LOOP.md)
- `memory/` - Persistent learning state
- `inbox/` - Second brain capture directory
- `apps/` - Generated applications
  - `dashboard/` - Real-time monitoring UI

## MCP Tools (54+ tools)

### Skill Tools
| Tool | Purpose |
|------|---------|
| `list_skills` | Filter by phase/category/query |
| `get_skill` | Full content + references |
| `create_skill` | Draft new skill |
| `update_skill` | Edit + version bump |
| `search_skills` | Search by keyword |
| `capture_improvement` | Log feedback for skill improvement |

### Loop Tools
| Tool | Purpose |
|------|---------|
| `list_loops` | Available loops |
| `get_loop` | Definition + skills |
| `create_loop` | Compose from skills |
| `validate_loop` | Check composition |

### Execution Tools
| Tool | Purpose |
|------|---------|
| `start_execution` | Begin loop run |
| `get_execution` | Current state |
| `advance_phase` | Move to next phase |
| `complete_phase` | Mark current phase complete |
| `complete_skill` | Mark skill complete |
| `skip_skill` | Skip a skill with reason |
| `approve_gate` | Pass quality gate |
| `reject_gate` | Block at gate with feedback |
| `pause_execution` | Pause execution |
| `resume_execution` | Resume execution |

### Memory Tools
| Tool | Purpose |
|------|---------|
| `get_memory` | Read at any level |
| `update_summary` | Write memory summary |
| `record_decision` | Add ADR |
| `record_pattern` | Add learned pattern |
| `create_handoff` | Session summary |
| `load_context` | Cold boot |
| `get_calibrated_estimate` | Calibrated effort estimate |

### Inbox Tools (Second Brain)
| Tool | Purpose |
|------|---------|
| `add_to_inbox` | Add paste/conversation |
| `add_url_to_inbox` | Fetch URL content |
| `list_inbox` | List items |
| `process_inbox_item` | Extract skills via AI |
| `approve_extraction` | Create skill from extraction |
| `reject_extraction` | Reject extracted skill |

## Available Loops

### Engineering Loop (engineering-loop)
Complete engineering workflow with 9 phases:
INIT → SCAFFOLD → IMPLEMENT → TEST → VERIFY → VALIDATE → DOCUMENT → REVIEW → SHIP

Gates after: SCAFFOLD, IMPLEMENT, TEST, VALIDATE, DOCUMENT, REVIEW

### Proposal Loop (proposal-loop)
Proposal generation with 4 phases:
INIT → SCAFFOLD → IMPLEMENT → COMPLETE

## Workflow Example

```
1. start_execution(loopId="engineering-loop", project="my-feature")
2. View in dashboard: http://localhost:3003
3. For each phase:
   - Get current state: get_execution(executionId)
   - Complete skills: complete_skill(executionId, skillId)
   - Mark phase done: complete_phase(executionId)
   - Pass gates: approve_gate(executionId, gateId)
   - Advance: advance_phase(executionId)
```

## Improvement Command

When you want to improve a skill based on what you learned:
```
improve: [your feedback about what could be better]
```

This creates an improvement proposal that can be reviewed and applied.

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/dashboard` | Dashboard summary |
| `GET /api/executions` | List executions |
| `GET /api/executions/:id` | Execution details |
| `GET /api/executions/:id/stream` | SSE live logs |
| `GET /api/skills` | List skills |
| `GET /api/loops` | List loops |
| `GET /api/inbox/stats` | Inbox statistics |

## Key Patterns

### Skill Versioning
Skills use semantic versioning with Git tags:
```
skill/{name}@{version}
# Example: skill/implement@2.1.0
```

### Memory Hierarchy
```
Orchestrator Memory (global patterns)
    └── Loop Memory (loop-specific learning)
            └── Skill Memory (skill-specific calibration)
```

### Execution Logs
Executions track detailed logs with categories:
- `phase` - Phase transitions
- `skill` - Skill completions
- `gate` - Gate approvals/rejections
- `system` - System events

## Development

```bash
npm run dev    # Hot reload development
npm run build  # Compile TypeScript
npm test       # Run tests
```

## Conventions

- All skills have SKILL.md + CHANGELOG.md + optional ui.json
- Loops have LOOP.md (human) + loop.json (machine)
- Memory files are JSON in memory/
- Use Zod for runtime validation
- Execution logs include timestamp, level, category, and context
