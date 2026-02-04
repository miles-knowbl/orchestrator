# Orchestrator - Claude Code Instructions

## Project Overview

Orchestrator is a self-improving meta-system where **skills are the atomic primitive**. It manages skills, composes them into loops, learns at all levels, and generates UI apps from loop definitions.

## Quick Start

For new users: Run `/orchestrator-start-loop` in Claude Code. It handles everything.

For development:
```bash
npm run build && npm start   # Server runs on http://localhost:3002
```

The server auto-starts in a Terminal window when any orchestrator MCP tool is called (via the `ensure-orchestrator.sh` hook).

## Distribution (LOCAL-FIRST - NOT Railway)

**Orchestrator runs locally, NOT on Railway.** Do not suggest Railway deployment.

Distribution flow:
1. Commit and push to main
2. GitHub Actions runs `.github/workflows/distribute.yml`:
   - Builds and tests
   - Deploys **dashboard** to Vercel (orchestrator-xi.vercel.app)
   - Creates rolling GitHub Release tarball
3. Users download tarball or clone repo and run locally

To dogfood changes:
```bash
npm run build   # Compile TypeScript
npm start       # Restart server with new code
```

Then commit/push to trigger the full distribution workflow.

## Slack Integration (Mobile Loop Control)

Slack notifications allow running loops while mobile (jogging, driving). All notifications @mention the user and include actionable buttons.

**Config file:** `data/proactive-messaging/proactive-messaging-config.json`

### Solo Mode (current setup)
```json
{
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "xoxb-...",
      "appToken": "xapp-...",
      "channelId": "C0XXXXXXX",
      "socketMode": true,
      "slackUserId": "U0AC9T1HP9Q"
    }
  }
}
```

### Multi-Engineer Mode
```json
{
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "xoxb-...",
      "appToken": "xapp-...",
      "socketMode": true,
      "engineers": [
        { "name": "alice", "slackUserId": "U123", "channelId": "C_ALICE" },
        { "name": "bob", "slackUserId": "U456", "channelId": "C_BOB" }
      ]
    }
  }
}
```

Notifications route to engineer's channel based on `engineer` field in events.

### Environment Variables
```bash
SLACK_BOT_TOKEN=xoxb-...    # Bot User OAuth Token
SLACK_APP_TOKEN=xapp-...    # App-Level Token (Socket Mode)
```

### Code Location
- **NEW:** `src/services/slack/` - Unified Slack service (notifications + commands + threads)
- **LEGACY:** `src/services/proactive-messaging/` - Being replaced by unified service
- **LEGACY:** `src/services/slack-integration/` - Being replaced by unified service

### Unified Slack Architecture
```
src/services/slack/
  UnifiedSlackService.ts   # Main service
  MessageComposer.ts       # Slack-native formatting (no terminal borders)
  ThreadManager.ts         # Persistent thread tracking
  CommandParser.ts         # Natural language commands
  types.ts                 # Shared types
```

Design principles:
- Glanceable: 2-second comprehension
- Speakable: Natural conversational voice
- Thread-smart: One thread per execution, persistent
- No emojis

## Directory Structure

- `src/` - TypeScript source code
  - `services/` - Core services (SkillRegistry, LoopComposer, ExecutionEngine, MemoryService, LearningService, CalibrationService, InboxProcessor, ProactiveMessagingService)
  - `services/slack/` - Unified Slack service (notifications, commands, threads)
  - `services/proactive-messaging/` - Legacy notification system (being replaced)
  - `services/slack-integration/` - Legacy command handling (being replaced)
  - `tools/` - MCP tool handlers
  - `server/` - HTTP server and API routes
  - `generator/` - Loop App generation
- `skills/` - Skill definitions (each skill is a directory with SKILL.md)
- `loops/` - Loop definitions (loop.json + LOOP.md)
- `memory/` - Persistent learning state
- `inbox/` - Second brain capture directory
- `apps/` - Generated applications
  - `dashboard/` - Real-time monitoring UI (deployed to Vercel, not used in local dev)

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

### Slack Integration Tools
| Tool | Purpose |
|------|---------|
| `configure_slack_channel` | Configure channel for engineer |
| `list_slack_channels` | List all configured channels |
| `get_slack_threads` | Get active threads for channel |
| `get_thread_context` | Get full context for thread |
| `send_slack_command` | Send command (for testing) |
| `parse_slack_command` | Parse text into command |
| `get_engineer_status` | Get engineer's work status |
| `list_engineers` | List all registered engineers |
| `trigger_merge` | Trigger merge to main |
| `trigger_rebase` | Trigger rebase from main |
| `get_branch_status` | Check behind/ahead of main |
| `get_pending_merges` | Get pending merge requests |
| `get_pending_rebases` | Get pending rebase requests |

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
| `GET /api/slack/channels` | List configured channels |
| `GET /api/slack/engineers` | List all engineers |
| `GET /api/slack/threads` | Get active threads |
| `POST /api/slack/command` | Execute command |
| `POST /api/slack/merge` | Trigger merge |
| `POST /api/slack/rebase` | Trigger rebase |

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
npm test -- --run  # Run tests (IMPORTANT: --run flag required to exit, otherwise vitest hangs in watch mode)
```

## Deep Context Protocol

All interactions in this system follow the **Deep Context Protocol**:

1. **Upfront Gathering**: Ask 5-10+ clarifying questions before any non-trivial task
2. **Terrain Check**: After every response, assess uphill (uncertain → ask) vs downhill (clear → proceed)
3. **Don't assume**: When in doubt, ask — don't push through uncertainty

See `~/.claude/CLAUDE.md` for full protocol and `commands/_shared/clarification-protocol.md` for loop-specific guidance.

## Conventions

- All skills have SKILL.md + CHANGELOG.md + optional ui.json
- Loops have LOOP.md (human) + loop.json (machine)
- Memory files are JSON in memory/
- Use Zod for runtime validation
- Execution logs include timestamp, level, category, and context
