---
name: journey-tracer
description: "Track execution journey through phases and skills with structured logging, state persistence, and timeline visualization for post-mortem analysis."
phase: DOCUMENT
category: meta
version: "1.0.0"
depends_on: ["retrospective"]
tags: [meta, logging, tracing, state-machine, execution-log]
---

# Journey Tracer

Track the execution journey with structured logging and state persistence.

## When to Use

- **During loop execution** — Capture every phase transition, skill completion, and gate decision
- **Post-mortem analysis** — Understand what happened and why during a loop run
- **Performance analysis** — Identify bottlenecks in the engineering process
- When you say: "trace execution", "what happened in this loop", "execution timeline"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Journey log | `memory/journeys/{executionId}.json` | Always |
| Timeline summary | Included in retrospective | Always |

## Core Concept

Journey tracing answers: **"What exactly happened during this loop execution, and in what order?"**

```
Phase Start → Skill Invoked → Decision Made → Gate Evaluated → Phase Complete
     ↓              ↓              ↓                ↓               ↓
  [logged]      [logged]       [logged]         [logged]        [logged]
```

Every significant event is captured with timestamp, context, and outcome.

## Event Schema

```typescript
interface JourneyEvent {
  id: string;
  timestamp: string;          // ISO 8601
  category: 'phase' | 'skill' | 'gate' | 'decision' | 'system';
  action: string;             // "started", "completed", "approved", "rejected"
  subject: string;            // Phase name, skill ID, gate ID
  context: Record<string, unknown>;  // Additional metadata
  duration?: number;          // Milliseconds (for completed events)
  outcome?: 'success' | 'failure' | 'skipped';
}
```

## Event Categories

| Category | Events | Example |
|----------|--------|---------|
| `phase` | started, completed, skipped | Phase IMPLEMENT started |
| `skill` | invoked, completed, skipped, failed | Skill implement completed (success) |
| `gate` | evaluated, approved, rejected | Gate spec-gate approved by human |
| `decision` | made, deferred, overridden | Decision: use Drizzle over Prisma |
| `system` | paused, resumed, error, recovered | Execution paused by user |

## Timeline Visualization

```
INIT ─────────── SCAFFOLD ──── IMPLEMENT ─────────────── TEST ──── ...
├─ requirements   ├─ architect  ├─ implement              ├─ test-gen
│  (2 min)        │  (5 min)    │  (45 min)               │  (10 min)
├─ spec           ├─ scaffold   │                          │
│  (8 min)        │  (3 min)    │                          │
├─ [spec-gate]    ├─ [arch-gate]│                          │
│  APPROVED       │  APPROVED   │                          │
```

## Checklist

- [ ] All phase transitions logged with timestamps
- [ ] All skill invocations logged with duration
- [ ] All gate decisions logged with reason
- [ ] Key decisions captured with context
- [ ] Journey file persisted to memory/journeys/
- [ ] Timeline summary available for retrospective

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `retrospective` | Consumes journey data for loop analysis |
| `calibration-tracker` | Uses journey timing data for calibration |
| `loop-controller` | Journey traces the controller's decisions |
| `memory-manager` | Journey data persisted via memory service |

## Key Principles

**Log everything.** Better to have too much data than too little for post-mortem.

**Structured events.** Every log entry follows the same schema for queryability.

**Timestamps are mandatory.** Duration is derived from start/end pairs.

**Context captures why.** Not just what happened, but the reasoning behind decisions.
