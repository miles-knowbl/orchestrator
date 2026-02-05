---
name: architecture-extractor
description: "Analyze a source system — codebase, documentation, diagrams, or verbal description — and extract a clean, structured architecture document. Reverse-engineers components, data flows, interfaces, patterns, and constraints into ARCHITECTURE.md."
phase: EXTRACT
category: engineering
version: "1.0.0"
depends_on: []
tags: [architecture, analysis, extraction, reverse-engineering, transposition]
---

# Architecture Extractor

Analyze a source system and extract its architecture into a structured document.

## When to Use

- **Porting an existing system** --- Need to understand its architecture before rebuilding in a new stack
- **Reverse-engineering** --- Source system has no architecture docs, need to create them
- **Architecture audit** --- Want a clean snapshot of how a system is actually structured
- **Transposition input** --- First step of the transpose-loop: extract before mapping to a new stack
- When you say: "extract the architecture", "what's the architecture of this system?", "document how this works"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `ARCHITECTURE.md` | Project root | Always |

## Core Concept

Architecture extraction answers: **"What is the actual architecture of this system?"**

This skill works from whatever source material is available:

| Source | Approach |
|--------|----------|
| **Codebase** | Read entry points, trace data flows, map module boundaries |
| **Documentation** | Synthesize from READMEs, wikis, API docs |
| **Diagrams** | Interpret from existing visual representations |
| **Verbal description** | Structure from user's explanation of how the system works |
| **Running system** | Infer from API responses, database schema, logs |

Extraction is NOT:
- Designing a new architecture (that's `architect`)
- Evaluating quality (that's `audit-loop`)
- Planning a migration (that's `migration-planner`)

## The Extraction Process

```
SOURCE MATERIAL
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│                 EXTRACTION PROCESS                       │
│                                                         │
│  1. SURVEY                                              │
│     └─→ What source material exists? What's missing?    │
│                                                         │
│  2. MAP COMPONENTS                                      │
│     └─→ Services, modules, layers, external systems     │
│                                                         │
│  3. TRACE DATA FLOWS                                    │
│     └─→ Request paths, event flows, data pipelines      │
│                                                         │
│  4. EXTRACT DATA MODEL                                  │
│     └─→ Entities, relationships, storage patterns       │
│                                                         │
│  5. IDENTIFY INTERFACES                                 │
│     └─→ APIs, protocols, contracts between components   │
│                                                         │
│  6. CATALOG CROSS-CUTTING CONCERNS                      │
│     └─→ Auth, logging, errors, caching, config          │
│                                                         │
│  7. DOCUMENT PATTERNS                                   │
│     └─→ Architectural patterns in use, conventions      │
│                                                         │
│  8. CAPTURE CONSTRAINTS                                 │
│     └─→ What the architecture optimizes for and why     │
│                                                         │
└─────────────────────────────────────────────────────────┘
     │
     ▼
ARCHITECTURE.md
```

## Step 1: Survey Source Material

Assess what's available and identify gaps:

```markdown
### Source Material Inventory

| Source | Available | Quality | Notes |
|--------|-----------|---------|-------|
| Codebase | Yes/No | High/Medium/Low | [location, language, size] |
| README / docs | Yes/No | | [what's covered] |
| API documentation | Yes/No | | [format, completeness] |
| Database schema | Yes/No | | [access method] |
| Architecture diagrams | Yes/No | | [format, age] |
| User description | Yes/No | | [detail level] |
| Running instance | Yes/No | | [access available] |

### Gaps
- [What's missing that would help]
```

Prioritize codebase and database schema as the most reliable sources. Documentation may be outdated.

## Step 2: Map Components

Identify every distinct component:

```markdown
### Component Inventory

| Component | Type | Responsibility | Technology | Communicates With |
|-----------|------|---------------|------------|-------------------|
| [name] | service/module/layer/external | [what it does] | [language/framework] | [other components] |
```

**Component types:**

| Type | Description | How to Identify |
|------|-------------|-----------------|
| **Service** | Independent deployable unit | Separate process, own entry point |
| **Module** | Logical grouping within a service | Directory/package boundary |
| **Layer** | Horizontal slice (presentation, business, data) | Import direction, naming conventions |
| **External** | Third-party system | API calls, SDK usage |
| **Infrastructure** | Platform component | Database, queue, cache, CDN |

## Step 3: Trace Data Flows

For each major user action or system event, trace the full path:

```markdown
### Data Flow: [Action Name]

1. [Entry point] receives [input]
2. [Component A] validates and transforms
3. [Component B] applies business logic
4. [Storage] persists result
5. [Component C] sends notification
6. [Entry point] returns [output]
```

Identify:
- **Request paths** — user action to response
- **Event flows** — triggers, handlers, side effects
- **Data pipelines** — batch processing, ETL, sync jobs
- **Background processes** — cron jobs, workers, schedulers

## Step 4: Extract Data Model

```markdown
### Data Model

| Entity | Storage | Key Fields | Relationships |
|--------|---------|------------|---------------|
| [name] | [postgres/mongo/redis/etc] | [important fields] | [belongs_to/has_many/references] |

### Storage Patterns

| Pattern | Where Used | Purpose |
|---------|-----------|---------|
| [e.g., soft delete] | [entities] | [why] |
| [e.g., JSONB columns] | [entities] | [why] |
| [e.g., event sourcing] | [entities] | [why] |
```

## Step 5: Identify Interfaces

```markdown
### API Surfaces

| Interface | Protocol | Format | Auth | Consumers |
|-----------|----------|--------|------|-----------|
| [name] | REST/GraphQL/gRPC/WebSocket | JSON/protobuf | [method] | [who calls it] |

### Internal Interfaces

| From | To | Mechanism | Contract |
|------|-----|-----------|----------|
| [component] | [component] | function call/event/queue/HTTP | [shape of data exchanged] |
```

## Step 6: Catalog Cross-Cutting Concerns

| Concern | Implementation | Notes |
|---------|---------------|-------|
| **Authentication** | [method: JWT, session, OAuth, API key] | [provider, flow] |
| **Authorization** | [method: RBAC, ABAC, RLS] | [granularity] |
| **Error handling** | [strategy: exceptions, result types, error codes] | [propagation pattern] |
| **Logging** | [library, format, destination] | [structured? levels?] |
| **Configuration** | [method: env vars, config files, feature flags] | [per-environment?] |
| **Caching** | [what, where, TTL strategy] | [invalidation method] |
| **Monitoring** | [metrics, health checks, alerting] | [tools used] |

## Step 7: Document Patterns

Identify architectural patterns in use:

```markdown
### Architectural Patterns

| Pattern | Where Applied | Confidence |
|---------|--------------|------------|
| [e.g., Layered architecture] | [whole system / specific service] | High/Medium/Low |
| [e.g., Event-driven] | [specific subsystem] | |
| [e.g., Repository pattern] | [data access layer] | |
| [e.g., CQRS] | [read vs write paths] | |

### Conventions

| Convention | Example | Consistency |
|-----------|---------|-------------|
| [naming] | [example from code] | [how consistently followed] |
| [file structure] | [example layout] | |
| [error format] | [example error] | |
```

## Step 8: Capture Constraints and Quality Attributes

```markdown
### Quality Attributes (What the Architecture Optimizes For)

| Attribute | Evidence | Priority |
|-----------|----------|----------|
| [e.g., Developer velocity] | [simple stack, few abstractions] | Inferred: High |
| [e.g., Scalability] | [stateless services, queue-based workers] | Inferred: Medium |

### Constraints

| Constraint | Source | Impact |
|-----------|--------|--------|
| [e.g., Must run on single server] | [infrastructure setup] | [limits horizontal scaling] |
| [e.g., Python-only team] | [all code is Python] | [technology choices] |
```

## ARCHITECTURE.md Template

```markdown
# [System Name] Architecture

## Overview
[One paragraph: what the system does and how it's structured]

## Components
[Component inventory table from Step 2]

### Component Diagram
[ASCII diagram showing components and connections]

## Data Model
[Entity table and storage patterns from Step 4]

## Data Flows
[Major data flow traces from Step 3]

## Interfaces
[API surfaces and internal interfaces from Step 5]

## Cross-Cutting Concerns
[Table from Step 6]

## Architectural Patterns
[Patterns and conventions from Step 7]

## Quality Attributes and Constraints
[From Step 8]

## Source Material
[What was analyzed, confidence level per section]
```

## Confidence Levels

Not all extracted architecture has equal certainty. Mark confidence:

| Level | Meaning | When to Apply |
|-------|---------|---------------|
| **High** | Directly observed in code/schema | Read it in source |
| **Medium** | Inferred from patterns | Multiple clues point to this |
| **Low** | Best guess from limited info | Single clue or user description only |

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `architect` | Architect designs new architecture; extractor documents existing architecture |
| `stack-analyzer` | Extractor output feeds stack-analyzer for transposition mapping |
| `spec` | Extracted architecture informs spec compilation |
| `code-verification` | Extraction may reveal architectural issues |

## Key Principles

**Extract what IS, not what SHOULD BE.** Document the actual architecture, not an idealized version. Note gaps and issues but don't fix them during extraction.

**Trace code over documentation.** Code is truth. Documentation may be outdated. When they conflict, trust the code.

**Confidence matters.** Mark uncertain sections. Downstream skills (stack-analyzer, spec) need to know what's solid and what's inferred.

**Components over code.** Focus on structural elements and their relationships, not implementation details. The goal is architectural understanding, not a code walkthrough.

**One pass is not enough.** Initial survey reveals structure; data flow tracing reveals hidden connections. Plan for at least two passes through the source material.
