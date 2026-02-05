---
name: coordination-protocol
description: "Define communication patterns and handoff protocols for multi-agent orchestration with locks, heartbeats, and conflict resolution."
phase: COMPLETE
category: operations
version: "1.0.0"
depends_on: ["memory-manager"]
tags: [meta, coordination, multi-agent, locking, synchronization]
---

# Coordination Protocol

Define communication and handoff protocols for multi-agent orchestration.

## When to Use

- **Multi-agent workflows** — Multiple agents working on the same project
- **Concurrent skill execution** — Parallel phases need coordination
- **Handoff between sessions** — One agent picks up where another left off
- When you say: "coordinate agents", "handoff protocol", "conflict resolution"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Coordination config | `memory/coordination.json` | When multi-agent |
| Handoff document | `HANDOFF.md` | On session end |

## Core Concept

Coordination answers: **"How do multiple agents work on the same project without conflicts?"**

```
Agent A ─── acquires lock ─── works ─── releases lock ─── handoff
                                                            ↓
Agent B ─────────── waits ─────────────────────── acquires lock ─── works
```

## Lock Protocol

```typescript
interface Lock {
  resource: string;     // File path or resource ID
  holder: string;       // Agent/session ID
  acquired: string;     // ISO timestamp
  expires: string;      // Auto-release time
  purpose: string;      // What the holder is doing
}
```

### Lock Rules

1. **Acquire before modifying** — Always lock files before editing
2. **Short-lived locks** — Maximum 5 minutes, renewable
3. **Auto-release on timeout** — Prevents deadlocks from crashed agents
4. **Conflict detection** — Report conflicts immediately, don't silently overwrite

## Handoff Protocol

When transferring work between sessions:

```markdown
## Handoff Document

### Current State
- Phase: IMPLEMENT
- Last completed skill: scaffold
- Pending: implement skill

### In Progress
- File: src/services/auth.ts (50% complete)
- Blocked on: API design decision

### Decisions Made
- Using JWT over session tokens (see ADR-001)
- PostgreSQL for persistence

### Next Steps
1. Complete auth service implementation
2. Add middleware integration
3. Run test-generation skill
```

## Heartbeat Pattern

```typescript
interface Heartbeat {
  agentId: string;
  timestamp: string;
  phase: string;
  activeSkill: string;
  filesLocked: string[];
}
```

Agents emit heartbeats every 30 seconds. If no heartbeat for 2 minutes, locks are released.

## Conflict Resolution

| Conflict | Resolution | Priority |
|----------|------------|----------|
| Same file, same section | Last writer warns, merge required | High |
| Same file, different sections | Auto-merge | Low |
| Different files | No conflict | None |
| Schema change | Exclusive lock required | Critical |

## Checklist

- [ ] Lock protocol defined for shared resources
- [ ] Handoff document created at session end
- [ ] Heartbeat interval configured
- [ ] Conflict resolution strategy documented
- [ ] Auto-release timeouts prevent deadlocks

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `memory-manager` | Coordination state stored in memory |
| `loop-controller` | Controller manages agent assignments |
| `journey-tracer` | Coordination events logged in journey |
| `retrospective` | Multi-agent coordination reviewed in retro |

## Key Principles

**Explicit handoffs.** Never assume another agent knows the context — write it down.

**Short-lived locks.** Acquire late, release early, auto-expire always.

**Conflict prevention over resolution.** Good coordination avoids conflicts entirely.

**Heartbeats prove liveness.** If an agent is silent, assume it's gone.
