---
name: dependency-mapping
description: "Map cross-pipeline dependencies and handoffs (X-series). Identifies where pipelines connect, share data, or have timing dependencies. Documents failure modes at integration boundaries that span multiple pipelines."
phase: INIT
category: engineering
version: "1.0.0"
depends_on: [pipeline-discovery, ui-pipeline-discovery]
tags: [audit, pipeline, dependencies, integration, cross-cutting]
---

# Dependency Mapping

Map cross-pipeline dependencies (X-series).

## When to Use

- **After pipeline discovery** — Runs after P-series and U-series are identified
- **Understanding integration points** — Document where pipelines connect
- **Identifying cross-cutting failures** — Find failure modes at boundaries
- When you say: "map the dependencies", "find integration points", "what connects these?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `dependency-identification.md` | How to find cross-pipeline dependencies |
| `dependency-diagram.md` | Visualization format |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `x-series-patterns.md` | Common cross-pipeline failure patterns |

**Verification:** All pipeline handoffs are documented with failure modes.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Dependency map | `AUDIT-SCOPE.md` | Always (X-series section) |
| X-series failure modes | `PIPELINE-FAILURE-MODES.md` | Always |

## Core Concept

Dependency Mapping answers: **"Where do pipelines connect and what can fail there?"**

Cross-pipeline failures occur at:
- **Data handoffs** — One pipeline's output is another's input
- **Shared state** — Multiple pipelines read/write same data
- **Timing dependencies** — One pipeline must complete before another starts
- **Event chains** — One pipeline triggers another

These are often the most dangerous failures because:
- No single pipeline "owns" them
- They're invisible in unit tests
- They only appear under specific conditions

## Dependency Types

```
┌─────────────────────────────────────────────────────────────┐
│                  DEPENDENCY TYPES                           │
│                                                             │
│  DATA HANDOFF                                               │
│    P1 produces data → P2 consumes it                        │
│    X-001: P1 output missing field P2 expects               │
│                                                             │
│  SHARED STATE                                               │
│    P1 and U1 both read/write user.preferences               │
│    X-002: Race condition on concurrent updates              │
│                                                             │
│  TIMING DEPENDENCY                                          │
│    P2 must wait for P1.source_schema to exist              │
│    X-003: P2 runs before P1 completes                       │
│                                                             │
│  EVENT CHAIN                                                │
│    P3.publish triggers U2.notification                      │
│    X-004: Event lost, notification never shows              │
└─────────────────────────────────────────────────────────────┘
```

## Discovery Process

```
┌─────────────────────────────────────────────────────────────┐
│             DEPENDENCY MAPPING PROCESS                      │
│                                                             │
│  1. FOR EACH PIPELINE                                       │
│     ├─→ What data does it consume? (inputs)                │
│     └─→ What data does it produce? (outputs)               │
│                                                             │
│  2. FIND CONNECTIONS                                        │
│     └─→ Where output of one = input of another             │
│                                                             │
│  3. IDENTIFY SHARED STATE                                   │
│     └─→ Tables/state accessed by multiple pipelines        │
│                                                             │
│  4. MAP TIMING DEPENDENCIES                                 │
│     └─→ What must exist before pipeline can run            │
│                                                             │
│  5. DOCUMENT FAILURE MODES                                  │
│     └─→ What can go wrong at each boundary                 │
│                                                             │
│  6. ASSIGN X-SERIES IDS                                     │
│     └─→ X-001, X-002... per dependency                     │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Documentation Format

```markdown
### X-001: P1 → P2 (source_schema handoff)

**Type:** Data Handoff
**From:** P1 (Source Ingestion)
**To:** P2 (Content Generation)

**Dependency:**
P2 reads `source_schema` produced by P1 to build prompts.

**Failure Modes:**

| ID | Failure | Severity | Detection |
|----|---------|----------|-----------|
| X-001a | source_schema is null | S4-Blocking | P2 throws |
| X-001b | source_schema is stale | S1-Silent | Lower quality output |
| X-001c | source_schema format changed | S3-Visible | Parse error |

**Validation:**
- [ ] P2 checks source_schema exists before use
- [ ] P2 handles null gracefully
- [ ] Schema version is validated
```

## Output Format

### In AUDIT-SCOPE.md

```markdown
## Cross-Pipeline Dependencies (X-series)

### Dependency Map

```
P1 (Source Ingestion)
  │
  ├──[source_schema]──► P2 (Content Generation)
  │                       │
  └──[source_id]─────────►├──[artifact_id]──► U1 (Chat-to-Edit)
                          │
                          └──[artifact_id]──► P3 (Publishing)
                                               │
                                               └──[post_status]──► U3 (Status Display)
```

### Dependencies

| ID | Type | From | To | Data | Risk |
|----|------|------|----|----|------|
| X-001 | Data Handoff | P1 | P2 | source_schema | High |
| X-002 | Shared State | P2, U1 | - | artifact.content | Medium |
| X-003 | Timing | P1 | P2 | source ready | High |
| X-004 | Event Chain | P3 | U3 | publish event | Medium |
```

### In audit-state.json

```json
{
  "dependencies": [
    {
      "id": "X-001",
      "type": "data_handoff",
      "from": "P1",
      "to": "P2",
      "data": "source_schema",
      "failure_modes": ["X-001a", "X-001b", "X-001c"]
    }
  ]
}
```

## Common X-Series Patterns

| Pattern | Example | Typical Failures |
|---------|---------|------------------|
| Schema Handoff | P1 schema → P2 prompt | Missing fields, format changes |
| ID Reference | P2 artifact_id → U1 edit | Invalid ID, deleted entity |
| Status Sync | P3 status → U3 display | Stale status, race condition |
| Event Propagation | P3 event → U2 notification | Lost event, duplicate delivery |
| Context Sync | U1 selection → U2 action | Stale context, wrong entity |

## Failure Mode Format

X-series failure modes follow the same MECE taxonomy:

```yaml
id: X-001a
dependency: X-001
location: L4-Integration  # Always L4 for cross-pipeline
type: T1-Data
severity: S4-Blocking
description: source_schema is null when P2 runs
impact: Generation fails completely
detection: Error thrown in P2
status: UNVALIDATED
```

## Validation Checklist

- [ ] All P-series outputs mapped to consumers
- [ ] All U-series context dependencies documented
- [ ] Shared state identified and race conditions analyzed
- [ ] Timing dependencies have validation checks
- [ ] Each dependency has at least one failure mode
- [ ] X-series IDs assigned consistently
