---
name: memory-manager
description: "Maintains context across long-running autonomous tasks. Handles session handoffs, context compression, cold boot procedures, and domain memory persistence. Enables continuity between sessions and coordination between multiple agents working on the same domain."
phase: META
category: operations
version: "1.0.0"
depends_on: []
tags: [meta, memory, context, session, handoff]
---

# Memory Manager

Persist context across sessions and agents.

## When to Use

- **Ending a session** — Create handoff document for next session
- **Starting a session** — Cold boot from previous handoff
- **Context limit approaching** — Compress context to continue
- **Recording decisions** — Archive ADRs and design decisions
- **Cross-system contracts** — Document interfaces between systems
- **Multiple agents** — Coordinate shared understanding

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `handoff-template.md` | Template for session handoff documents |
| `cold-boot-checklist.md` | Procedure for resuming work |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `adr-template.md` | When recording architectural decisions |
| `interface-contracts.md` | When documenting cross-system contracts |
| `compression-strategies.md` | When context window filling up |

**Verification:** Ensure handoff document enables cold boot by another agent.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `HANDOFF.md` | `domain-memory/{domain}/` | On warm handoff |
| `loop-state.json` | `domain-memory/{domain}/` | Always (create or update) |
| `context-summary.md` | `domain-memory/{domain}/` | On session end |

## Hook Integration

Session lifecycle hooks automate context loading and handoff prompting:

| Hook | Trigger | What it does |
|------|---------|--------------|
| `cold-boot-loader` | Notification (session_start) | Loads prior state, displays resume context |
| `warm-handoff-creator` | Notification (session_end) | Prompts for handoff creation |
| `context-pruner` | Notification (context_limit_warning) | Prompts for emergency handoff |

**Note:** Hooks handle prompting and context display. This skill creates the actual `HANDOFF.md` document with full context.

See `.claude/hooks/cold-boot-loader.sh`, `.claude/hooks/warm-handoff-creator.sh`, and `HOOKS.md` for details.

## Core Concept

Memory Manager solves the **context continuity problem**: how does an agent resume work after a session ends, or how do multiple agents share understanding of a domain?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MEMORY ARCHITECTURE                                   │
│                                                                             │
│  ┌─────────────────┐                        ┌─────────────────┐             │
│  │   Session 1     │──── Handoff ──────────▶│   Session 2     │             │
│  │   Agent A       │      Document          │   Agent A       │             │
│  └────────┬────────┘                        └────────┬────────┘             │
│           │                                          │                      │
│           │  write                          read     │                      │
│           ▼                                          ▼                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       DOMAIN MEMORY                                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Dream   │ │  System  │ │Decisions │ │Interfaces│ │ Sessions │  │   │
│  │  │  State   │ │  Queue   │ │  (ADRs)  │ │(Contracts)│ │(Handoffs)│  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Domain Memory Structure

### File Organization

```
domain-memory/
└── {domain-name}/
    ├── dream-state.md              # The vision (from entry-portal)
    ├── system-queue.json           # Current queue state
    ├── glossary.md                 # Domain terminology
    │
    ├── decisions/                  # Architectural Decision Records
    │   ├── 000-template.md
    │   ├── 001-technology-stack.md
    │   ├── 002-auth-approach.md
    │   └── ...
    │
    ├── interfaces/                 # Cross-system contracts
    │   ├── api/
    │   │   ├── auth-service.yaml
    │   │   └── order-service.yaml
    │   └── events/
    │       ├── order-events.yaml
    │       └── notification-events.yaml
    │
    └── sessions/                   # Session handoff logs
        ├── 2024-01-15-auth-service.md
        ├── 2024-01-16-order-service-part1.md
        ├── 2024-01-17-order-service-part2.md
        └── ...
```

### Initialize Domain Memory

```bash
# Create domain memory structure
mkdir -p domain-memory/{domain-name}/{decisions,interfaces/api,interfaces/events,sessions}

# Create initial files
touch domain-memory/{domain-name}/dream-state.md
touch domain-memory/{domain-name}/system-queue.json
touch domain-memory/{domain-name}/glossary.md
```

## Session Handoff

### When to Create Handoff

Create a handoff document when:
- Session is ending (time limit, user leaving)
- Context window is filling up
- Switching to different system/task
- Handing off to human engineer
- Pausing for external dependency

### Handoff Document Format

```markdown
# Session Handoff: [Date] - [System/Task]

## Session Metadata
| Property | Value |
|----------|-------|
| Date | YYYY-MM-DD |
| Duration | [X hours] |
| System | [system name] |
| Agent/Engineer | [identifier] |
| Branch | feature/[name] |
| Last Commit | [hash] - [message] |

---

## Context Summary

[2-3 paragraph summary of what this session was about and the current state]

---

## Completed This Session

- [x] [Completed item 1]
- [x] [Completed item 2]
- [x] [Completed item 3]

### Key Commits
| Commit | Description |
|--------|-------------|
| abc1234 | [What it did] |
| def5678 | [What it did] |

---

## Current State

### Working On
[What was actively being worked on when session ended]

### Code State
- Tests: [passing/failing - details if failing]
- Lint: [passing/failing]
- Build: [passing/failing]

### Files Modified (uncommitted)
- [file1.ts] - [what changed]
- [file2.ts] - [what changed]

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Decision 1] | [Choice] | [Why] |
| [Decision 2] | [Choice] | [Why] |

[If significant, create ADR in decisions/ folder]

---

## Blockers & Issues

### Current Blockers
- [ ] [Blocker 1] - [who/what is needed]
- [ ] [Blocker 2] - [who/what is needed]

### Known Issues
- [Issue 1] - [details]
- [Issue 2] - [details]

---

## Next Steps

### Immediate (Next Session)
1. [First thing to do]
2. [Second thing to do]
3. [Third thing to do]

### After That
- [Subsequent task 1]
- [Subsequent task 2]

---

## Open Questions

Questions needing answers:
- [ ] [Question 1] - [context]
- [ ] [Question 2] - [context]

---

## References

- GitHub Issue: #[number]
- PR (if open): #[number]
- Related Docs: [links]

---

## For Next Session

### Commands to Run First
```bash
cd [path]
git status
npm test  # or equivalent
```

### Files to Review
- [file1] - [why]
- [file2] - [why]

### Context to Load
- Read: decisions/[relevant].md
- Read: interfaces/[relevant].yaml
- Read: Last 2-3 session handoffs
```

→ See `references/handoff-template.md`

## Cold Boot Procedure

### When Starting a New Session

Follow this procedure to resume work:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COLD BOOT PROCEDURE                                  │
│                                                                             │
│  1. LOAD DOMAIN CONTEXT                                                     │
│     ├─→ Read dream-state.md (understand the vision)                         │
│     ├─→ Read glossary.md (understand terminology)                           │
│     └─→ Read system-queue.json (understand priorities)                      │
│                                                                             │
│  2. LOAD CURRENT SYSTEM CONTEXT                                             │
│     ├─→ Read GitHub issue for current system                                │
│     ├─→ Read FeatureSpec attached to issue                                  │
│     └─→ Read relevant interface contracts                                   │
│                                                                             │
│  3. LOAD SESSION HISTORY                                                    │
│     ├─→ Read last 2-3 session handoffs                                      │
│     ├─→ Understand what was completed                                       │
│     └─→ Understand current blockers/issues                                  │
│                                                                             │
│  4. LOAD DECISIONS                                                          │
│     └─→ Read relevant ADRs in decisions/                                    │
│                                                                             │
│  5. VERIFY STATE                                                            │
│     ├─→ Check git status in worktree                                        │
│     ├─→ Run tests to confirm state                                          │
│     └─→ Review any uncommitted changes                                      │
│                                                                             │
│  6. CONFIRM UNDERSTANDING                                                   │
│     └─→ Summarize context back to verify                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Cold Boot Checklist

```markdown
## Cold Boot Checklist

### Domain Context
- [ ] Read dream-state.md
- [ ] Read glossary.md
- [ ] Read system-queue.json
- [ ] Understand current priorities

### System Context
- [ ] Identified current system to work on
- [ ] Read GitHub issue #[number]
- [ ] Read FeatureSpec
- [ ] Read relevant interface contracts

### Session History
- [ ] Read last session handoff
- [ ] Understand what was completed
- [ ] Understand current blockers
- [ ] Know immediate next steps

### Decisions
- [ ] Read relevant ADRs
- [ ] Understand architectural constraints

### Code State
- [ ] Navigated to correct worktree
- [ ] Checked git status
- [ ] Ran tests
- [ ] Reviewed any uncommitted changes

### Ready to Continue
- [ ] Can articulate what I'm working on
- [ ] Know the immediate next task
- [ ] Understand success criteria
```

→ See `references/cold-boot-checklist.md`

## Context Compression

### When to Compress

Compress context when:
- Approaching context window limit
- Session becoming unwieldy
- Need to switch focus
- Conversation has lots of verbose output

### Compression Strategies

| Strategy | What to Do | When to Use |
|----------|------------|-------------|
| **Summarize** | Replace verbose content with summary | Long outputs, exploration |
| **Extract** | Move decisions to ADRs | Architectural discussions |
| **Archive** | Move to handoff, reference by file | Completed work |
| **Prune** | Remove irrelevant content | Tangential discussions |
| **Reference** | Point to files instead of including | Large code blocks |

### Compression Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CONTEXT COMPRESSION                                    │
│                                                                             │
│  1. IDENTIFY what's taking space                                            │
│     • Long code outputs                                                     │
│     • Verbose error messages                                                │
│     • Exploratory discussions                                               │
│     • Completed work details                                                │
│                                                                             │
│  2. EXTRACT important information                                           │
│     • Decisions → ADRs                                                      │
│     • Code → files (already there)                                          │
│     • Findings → handoff notes                                              │
│                                                                             │
│  3. SUMMARIZE for continuity                                                │
│     • "We explored X, Y, Z and decided on Y because..."                     │
│     • "The error was caused by... and fixed by..."                          │
│     • "Completed: A, B, C. Remaining: D, E"                                 │
│                                                                             │
│  4. CREATE handoff document                                                 │
│     • Capture everything needed to continue                                 │
│     • Reference files instead of including content                          │
│                                                                             │
│  5. CONTINUE with fresh context                                             │
│     • Start new session with cold boot                                      │
│     • Load only what's needed                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What to Keep vs. Archive

| Keep in Context | Archive to Files |
|-----------------|------------------|
| Current task and immediate context | Completed tasks |
| Active blockers | Resolved issues |
| Relevant decisions | Decision rationale (→ ADR) |
| Current file state | Previous iterations |
| Next steps | Historical exploration |

→ See `references/compression-strategies.md`

## Decision Records (ADRs)

### When to Create an ADR

Create an ADR when:
- Choosing between technologies
- Defining architectural patterns
- Establishing conventions
- Making trade-offs
- Decisions that affect multiple systems

### ADR Format

```markdown
# ADR-[NNN]: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Date
YYYY-MM-DD

## Context
[What is the issue that we're seeing that is motivating this decision?]

## Options Considered

### Option 1: [Name]
**Description:** [What is this option?]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

### Option 2: [Name]
[Same structure]

### Option 3: [Name]
[Same structure]

## Decision
[What is the decision that was made?]

## Rationale
[Why was this decision made? What factors were most important?]

## Consequences

### Positive
- [Consequence 1]
- [Consequence 2]

### Negative
- [Consequence 1]
- [Consequence 2]

### Risks
- [Risk 1] - Mitigation: [how]

## Related
- ADR-[NNN]: [Related decision]
- Issue: #[number]
```

→ See `references/adr-template.md`

## Interface Contracts

### API Contracts

Store in `interfaces/api/`:

```yaml
# auth-service.yaml
openapi: 3.0.0
info:
  title: Auth Service API
  version: 1.0.0
  description: Authentication and authorization endpoints

paths:
  /auth/login:
    post:
      summary: Authenticate user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Successful authentication
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

components:
  schemas:
    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string

    AuthResponse:
      type: object
      properties:
        token:
          type: string
        expiresAt:
          type: string
          format: date-time
```

### Event Contracts

Store in `interfaces/events/`:

```yaml
# order-events.yaml
asyncapi: 2.0.0
info:
  title: Order Events
  version: 1.0.0

channels:
  orders/created:
    publish:
      message:
        $ref: '#/components/messages/OrderCreated'

  orders/completed:
    publish:
      message:
        $ref: '#/components/messages/OrderCompleted'

components:
  messages:
    OrderCreated:
      payload:
        type: object
        properties:
          orderId:
            type: string
          customerId:
            type: string
          createdAt:
            type: string
            format: date-time

    OrderCompleted:
      payload:
        type: object
        properties:
          orderId:
            type: string
          completedAt:
            type: string
            format: date-time
          signature:
            type: string
            description: Base64 encoded signature image
```

→ See `references/interface-contracts.md`

## Glossary

Maintain domain terminology:

```markdown
# Glossary: [Domain Name]

## Business Terms

| Term | Definition | Example |
|------|------------|---------|
| Work Order | A task assigned to a technician | WO-12345 |
| Service Window | Time range for appointment | 8am-12pm |
| First-Time Fix Rate | % of jobs completed on first visit | 85% |

## Technical Terms

| Term | Definition | Used In |
|------|------------|---------|
| JWT | JSON Web Token for auth | Auth Service |
| Idempotency Key | Unique key to prevent duplicates | Order Service |

## Abbreviations

| Abbrev | Full Form |
|--------|-----------|
| WO | Work Order |
| SLA | Service Level Agreement |
| ETA | Estimated Time of Arrival |

## System Names

| Name | Description | Repo |
|------|-------------|------|
| ServiceGrid | Core work order system | azure-standard/servicegrid |
| RouteOpt | Route optimization | azure-standard/routeopt |
```

## Multi-Agent Coordination

### Shared Memory Protocol

When multiple agents work on same domain:

1. **Read before write** — Always load latest memory state
2. **Atomic updates** — Complete handoff before stopping
3. **Conflict resolution** — Later timestamp wins, merge if possible
4. **Communication** — Use GitHub issue comments for async coordination

### Coordination File

```json
// domain-memory/{domain}/coordination.json
{
  "domain": "azure-standard",
  "activeAgents": [
    {
      "id": "agent-1",
      "system": "sys-002",
      "worktree": "system-orders",
      "startedAt": "2024-01-17T09:00:00Z",
      "lastHeartbeat": "2024-01-17T14:30:00Z"
    }
  ],
  "locks": [
    {
      "resource": "interfaces/api/order-service.yaml",
      "holder": "agent-1",
      "acquiredAt": "2024-01-17T14:00:00Z",
      "reason": "Updating API contract"
    }
  ]
}
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `entry-portal` | Creates dream-state.md and system-queue.json |
| `engineering` (loop) | Uses memory for cold boot and handoff |
| `architect` | Decisions go to ADRs |
| `git-workflow` | Worktree state tracked in handoffs |
| `spec` | FeatureSpecs referenced from issues |

## Key Principles

**Always create handoff.** Never end a session without documenting state.

**Read before you work.** Cold boot procedure ensures continuity.

**Compress, don't lose.** Extract value before archiving.

**Decisions are forever.** ADRs capture why, not just what.

**Contracts are agreements.** Interface changes need coordination.

## Mode-Specific Behavior

Context management and handoff scope differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full domain memory structure |
| **Approach** | Comprehensive context management setup |
| **Patterns** | Free choice of memory organization |
| **Deliverables** | Full HANDOFF.md + domain memory structure |
| **Validation** | Standard handoff verification |
| **Constraints** | Minimal - design optimal memory structure |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific context management |
| **Approach** | Extend existing domain memory |
| **Patterns** | Should match existing documentation patterns |
| **Deliverables** | Delta handoff + gap-specific context |
| **Validation** | Existing context + new additions |
| **Constraints** | Don't restructure existing memory artifacts |

**Polish considerations:**
- Existing project may have its own context storage
- Handoffs should reference existing docs, not duplicate
- ADRs only for new decisions, not existing ones
- Cold boot includes understanding existing system state

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific context only |
| **Approach** | Surgical context updates for audit |
| **Patterns** | Must conform exactly to existing conventions |
| **Deliverables** | Change record referencing ticket |
| **Validation** | Full compliance verification |
| **Constraints** | Requires approval for any memory structure changes |

**Enterprise memory constraints:**
- Memory artifacts must follow existing conventions
- No new domain memory structures without approval
- Handoffs must reference change tickets
- Cold boot must verify change approval still valid
