# Slack Integration Requirements

## Module Overview

**Module:** slack-integration
**Layer:** 3 (Interface)
**Depends on:** proactive-messaging (complete)
**Status:** In Progress

## Problem Statement

Proactive-messaging established outbound notifications and button-based approvals via Slack. However, full bidirectional control is missing - engineers cannot issue loop commands, capture to inbox, or coordinate merges from Slack. This creates friction for async/mobile workflows.

## Requirements

### R1: Full Command Support
Engineers must be able to issue any loop command from Slack that they can issue from terminal.

**Acceptance Criteria:**
- All semantic commands work: go, approved, reject, changes, merge, status, show
- Loop invocation: `@Orchestrator /engineering-loop` starts the next highest leverage move
- Explicit target override: `@Orchestrator /engineering-loop voice-module`
- Commands parsed from text messages (buttons are affordances, not requirements)

### R2: Channel = Engineer Context
Each Slack channel maps to one engineer's context for one project.

**Acceptance Criteria:**
- Channel configuration includes: projectPath, worktreePath, engineer, branchPrefix
- Commands in a channel execute against that engineer's worktree
- No need to specify project - implicit from channel
- Target defaults to NHLM or current loop state

### R3: Thread-per-Execution
Each loop execution gets its own thread for conversation continuity.

**Acceptance Criteria:**
- Starting a loop creates a new thread
- All notifications for that execution appear in the thread
- Gate approvals/rejections happen in context
- Thread title: `{loop}: {target} ({branch})`

### R4: Merge Workflow
Engineers can merge their branch to main via Slack at loop completion.

**Acceptance Criteria:**
- [Merge to Main] button appears on loop completion
- Conflict check runs before merge
- If conflicts, show conflicting files and options
- On successful merge, notify other engineers in their channels
- Update kanban module status

### R5: Cross-Engineer Notifications
When main updates, affected engineers are notified.

**Acceptance Criteria:**
- After merge, identify engineers with branches behind main
- Send notification to their channels with: who merged, what, files affected
- Offer [Rebase from Main] button
- Show divergence: "3 commits behind main"

### R6: Inbox Capture via /learning-loop
Capturing content to inbox uses the same flow as terminal.

**Acceptance Criteria:**
- `/learning-loop` in Slack triggers learning loop
- Can reference thread content or linked URLs
- Same flow as terminal /learning-loop
- Processed by InboxProcessor

### R7: Channel Parity
Same semantic commands across Terminal, Slack, and Voice.

**Acceptance Criteria:**
- Commands table defined once, rendered per-adapter
- Buttons are optional affordances in Slack
- Text input always works
- Notification format identical (box-drawing in code blocks)
- Voice: TTS reads, STT transcribes to same commands

### R8: Worktree Integration
Commands execute against engineer's isolated worktree.

**Acceptance Criteria:**
- Channel config specifies worktreePath
- Loop execution uses that worktree
- Branch created as {branchPrefix}{target}
- Parallel agents all commit to same branch
- MultiAgentCoordinator manages reservations

## Success Metrics

| Metric | Target |
|--------|--------|
| Command parity | 100% of terminal commands available |
| Thread context | All loop messages in correct thread |
| Merge success rate | Conflicts detected before merge attempt |
| Cross-engineer notification | <5s after merge |
| Mobile workflow | Full loop completable from phone |

## Non-Requirements (Out of Scope)

- Slash commands (`/orchestrator`) - use @mentions instead
- Multiple worktrees per channel - 1:1 relationship
- Real-time terminal mirroring - async notifications only
- Voice TTS - separate voice module
- Channel auto-creation - manual setup for now

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| proactive-messaging | Complete | SlackAdapter, MessageFormatter |
| multi-agent-worktrees | Complete | Worktree management, merge queue |
| InboxProcessor | Complete | Capture flow |
| RoadmapService | Complete | NHLM calculation |

## Configuration Schema

```json
{
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "xoxb-...",
      "appToken": "xapp-...",
      "channelId": "C0ALICE",
      "engineer": "alice",
      "projectPath": "/Users/alice/workspaces/orchestrator",
      "worktreePath": "/Users/alice/worktrees/orchestrator-alice",
      "branchPrefix": "alice/"
    }
  }
}
```
