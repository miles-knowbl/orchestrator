# Slack Integration Feature Specification

## 1. Overview

**Module:** slack-integration
**Version:** 1.0.0
**Layer:** 3 (Interface)
**Depends on:** proactive-messaging

### Purpose

Enable full bidirectional control of the orchestrator via Slack, matching terminal capabilities with channel parity. Engineers can run loops, approve gates, merge branches, and coordinate with teammates - all from their phone.

### User Stories

1. As an engineer, I want to start a loop from Slack so I can work async from my phone
2. As an engineer, I want to approve gates via buttons so I don't need my laptop
3. As an engineer, I want to merge my branch when a loop completes so I can ship from anywhere
4. As an engineer, I want to see when teammates merge so I can rebase and avoid conflicts
5. As an engineer, I want the same commands in Slack as terminal so I don't learn two systems

---

## 2. Architecture

### 2.1 Human Workflow Stack

```
┌─────────────────────────────────────────────────────────────┐
│  HUMAN INPUT                                                │
├─────────────────────────────────────────────────────────────┤
│  Terminal              Slack                Voice           │
│  ─────────────         ─────────────        ─────────────   │
│  Primary               Async + Mobile       Hands-free      │
│  "show up, say go"     Notifications        (future)        │
│                        Coordination                         │
└─────────────────────────────────────────────────────────────┘
                              │
                     SEMANTIC COMMANDS
                              │
                      ┌───────┴───────┐
                      │  ORCHESTRATOR │
                      └───────┬───────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  SYSTEM OUTPUTS (monitoring only)                           │
├─────────────────────────────────────────────────────────────┤
│  GitHub                Kanban                               │
│  ─────────────         ─────────────                        │
│  PRs by agents         Progress tracking                    │
│  CI/CD                 Scope isolation                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Channel Architecture

```
Channel: #superorganism-orchestrator-alice
         ─────────────  ────────────  ─────
              org          project    engineer

Maps to:
  - projectPath: /Users/alice/workspaces/orchestrator
  - worktreePath: /Users/alice/worktrees/orchestrator-alice
  - branchPrefix: alice/
  - engineer: alice
```

### 2.3 Thread-per-Execution Model

```
#superorganism-orchestrator-alice
│
├── Thread: "eng-loop: slack-integration (alice/slack-integration)"
│   ├── [INIT] Started...
│   ├── [SPEC GATE] notification
│   ├── User: *clicks Approve*
│   ├── [SCAFFOLD] ...
│   └── [COMPLETE] [Merge to Main]
│
└── Thread: "bugfix-loop: #142 (alice/fix-142)"
    └── ...
```

---

## 3. Semantic Commands

### 3.1 Command Table

| Command | Description | Terminal | Slack | Voice |
|---------|-------------|----------|-------|-------|
| `go` | Continue/resume | text | button + text | speech |
| `approved` | Pass gate | text | button + text | speech |
| `reject` | Block gate | text | button + text | speech |
| `changes: X` | Request modifications | text | text | speech |
| `merge` | Merge to main | text | button + text | speech |
| `rebase` | Rebase from main | text | button + text | speech |
| `status` | Show current state | text | text | speech |
| `show X` | Display deliverable | text | text | speech |
| `/engineering-loop` | Start engineering loop | text | @mention + text | speech |
| `/learning-loop` | Start learning loop | text | @mention + text | speech |

### 3.2 Command Parsing

```typescript
interface SemanticCommand {
  type: 'go' | 'approved' | 'reject' | 'changes' | 'merge' | 'rebase' | 
        'status' | 'show' | 'start_loop';
  payload?: {
    reason?: string;      // For reject, changes
    target?: string;      // For show, start_loop
    loopId?: string;      // For start_loop
  };
}

// Parse from text (works across all channels)
function parseCommand(text: string): SemanticCommand | null;
```

---

## 4. Capabilities

### 4.1 Loop Invocation

**Trigger:** `@Orchestrator /engineering-loop` or `@Orchestrator /engineering-loop voice-module`

**Flow:**
1. Parse loop type and optional target
2. If no target, calculate NHLM from RoadmapService
3. Check/create worktree for engineer
4. Create branch: `{branchPrefix}{target}`
5. Create thread for execution
6. Start loop execution

**Response:**
```
═══════════════════════════════════════════════════════════════
║  ENGINEERING LOOP                              [STARTED]   ║
║                                                             ║
║  Target: slack-integration                                  ║
║  Branch: alice/slack-integration                            ║
║  Worktree: ~/worktrees/orchestrator-alice                   ║
║                                                             ║
║  Phase: INIT                                                ║
═══════════════════════════════════════════════════════════════

[Continue]
```

### 4.2 Gate Approvals

**Trigger:** Button click or text command in thread

**Flow:**
1. Identify execution from thread context
2. Validate command is valid for current state
3. Execute approval/rejection
4. Post update to thread

### 4.3 Merge Workflow

**Trigger:** [Merge to Main] button or `merge` command

**Flow:**
1. Check for conflicts with main
2. If clean: execute merge, notify other engineers
3. If conflicts: show conflict details, offer options

**Merge notification:**
```
═══════════════════════════════════════════════════════════════
║  MERGE COMPLETE                                             ║
║                                                             ║
║  Branch: alice/slack-integration → main                     ║
║  Commits: 7                                                 ║
║  Files: 12                                                  ║
║                                                             ║
║  Notified: bob, carol                                       ║
═══════════════════════════════════════════════════════════════
```

**Cross-engineer notification:**
```
═══════════════════════════════════════════════════════════════
║  MAIN UPDATED                                               ║
║                                                             ║
║  alice merged: slack-integration                            ║
║  Your branch: bob/voice-module                              ║
║  Status: 3 commits behind main                              ║
║                                                             ║
║  Potentially affected:                                      ║
║    - src/index.ts                                           ║
║    - src/services/proactive-messaging/*                     ║
═══════════════════════════════════════════════════════════════

[Rebase from Main]  [View Diff]  [Ignore]
```

### 4.4 Rebase Workflow

**Trigger:** [Rebase from Main] button or `rebase` command

**Flow:**
1. Attempt rebase of current branch onto main
2. If clean: report success
3. If conflicts: show conflict details, offer resolution options

---

## 5. Configuration

### 5.1 Extended Slack Config

```typescript
interface SlackIntegrationConfig {
  enabled: boolean;
  botToken: string;
  appToken: string;
  channelId: string;
  socketMode: boolean;
  
  // New for slack-integration
  engineer: string;
  projectPath: string;
  worktreePath: string;
  branchPrefix: string;
  
  // Optional
  defaultLoop?: string;  // Default loop type if not specified
  autoRebase?: boolean;  // Auto-rebase on main update notification
}
```

### 5.2 Multi-Channel Config

For organizations with multiple engineers:

```json
{
  "channels": {
    "slack": {
      "instances": [
        {
          "channelId": "C0ALICE",
          "engineer": "alice",
          "projectPath": "/Users/alice/workspaces/orchestrator",
          "worktreePath": "/Users/alice/worktrees/orchestrator-alice",
          "branchPrefix": "alice/"
        },
        {
          "channelId": "C0BOB", 
          "engineer": "bob",
          "projectPath": "/Users/bob/workspaces/orchestrator",
          "worktreePath": "/Users/bob/worktrees/orchestrator-bob",
          "branchPrefix": "bob/"
        }
      ]
    }
  }
}
```

---

## 6. Components

### 6.1 New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| SlackCommandParser | src/services/slack-integration/SlackCommandParser.ts | Parse commands from text |
| SlackThreadManager | src/services/slack-integration/SlackThreadManager.ts | Manage thread-per-execution |
| SlackMergeWorkflow | src/services/slack-integration/SlackMergeWorkflow.ts | Handle merge/rebase flows |
| SlackIntegrationService | src/services/slack-integration/SlackIntegrationService.ts | Orchestrate components |

### 6.2 Extended Components

| Component | Changes |
|-----------|---------|
| SlackAdapter | Add thread support, extended config |
| ProactiveMessagingService | Route to correct thread |
| MultiAgentCoordinator | Expose merge/rebase via Slack |

### 6.3 Integration Points

```
SlackIntegrationService
    ├── SlackAdapter (messaging)
    ├── SlackCommandParser (input)
    ├── SlackThreadManager (context)
    ├── SlackMergeWorkflow (git)
    ├── ExecutionEngine (loops)
    ├── RoadmapService (NHLM)
    └── MultiAgentCoordinator (worktrees)
```

---

## 7. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/slack/channels | GET | List configured channels |
| /api/slack/channels/:id | GET | Get channel config |
| /api/slack/channels/:id | PUT | Update channel config |
| /api/slack/threads | GET | List active threads |
| /api/slack/threads/:id | GET | Get thread details |
| /api/slack/command | POST | Execute command (for testing) |

---

## 8. MCP Tools

| Tool | Purpose |
|------|---------|
| configure_slack_channel | Configure channel for engineer |
| list_slack_channels | List all configured channels |
| get_slack_threads | Get active threads for channel |
| send_slack_command | Send command to channel (testing) |
| get_engineer_status | Get engineer's current work status |
| trigger_merge | Trigger merge workflow |
| trigger_rebase | Trigger rebase workflow |

---

## 9. Testing

### 9.1 Unit Tests

- SlackCommandParser: All command variations
- SlackThreadManager: Thread creation, context lookup
- SlackMergeWorkflow: Conflict detection, merge execution

### 9.2 Integration Tests

- Full loop execution via Slack
- Gate approval via button and text
- Merge workflow with conflict simulation
- Cross-engineer notification delivery

---

## 10. Migration

### 10.1 From proactive-messaging

Existing proactive-messaging config continues to work. New fields are optional:

```json
{
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "...",
      "appToken": "...",
      "channelId": "...",
      "socketMode": true,
      // New optional fields
      "engineer": "alice",
      "projectPath": "...",
      "worktreePath": "...",
      "branchPrefix": "alice/"
    }
  }
}
```

If new fields are missing, slack-integration features are disabled but proactive-messaging continues to work.

---

## 11. Security

- Channel access controlled by Slack workspace permissions
- Bot token scoped to minimum required permissions
- Worktree paths validated to prevent path traversal
- Merge operations require explicit confirmation
- All actions logged with engineer attribution

---

## 12. Future Considerations

- Multi-project per channel (explicit project specification)
- Slack slash commands (/orchestrator)
- Voice TTS integration for spoken notifications
- Local-first messaging replacement for Slack
- Channel auto-provisioning for new engineers
