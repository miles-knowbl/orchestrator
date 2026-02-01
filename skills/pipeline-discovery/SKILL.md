---
name: pipeline-discovery
description: "Identify backend data pipelines (P-series) in the codebase. Discovers server-side data flows triggered by user actions or system events, documenting triggers, steps, and outcomes. Foundation for MECE failure mode analysis."
phase: INIT
category: core
version: "1.0.0"
depends_on: [requirements]
tags: [audit, pipeline, discovery, backend, data-flow]
---

# Pipeline Discovery

Identify backend data pipelines (P-series).

## When to Use

- **Starting an audit** — Runs in INIT phase to map backend flows
- **Understanding data flows** — Document how data moves through the system
- **Preparing for failure mode analysis** — Identify what can break
- When you say: "find the pipelines", "map the backend", "what data flows exist?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `pipeline-identification.md` | How to find pipelines in code |
| `pipeline-template.md` | How to document each pipeline |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `common-patterns.md` | Recognize typical pipeline patterns |

**Verification:** All major backend data flows are documented with triggers and outcomes.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Pipeline inventory | `AUDIT-SCOPE.md` | Always (P-series section) |
| State update | `audit-state.json` | Always (backend_pipelines array) |

## Core Concept

Pipeline Discovery answers: **"What are the major backend data flows?"**

A pipeline is:
- **Triggered** by user action or system event
- **Processes** data through multiple steps
- **Produces** a persistent outcome

Examples:
- P1: Source Ingestion (file upload → parsed schema)
- P2: Content Generation (generate button → artifact created)
- P3: Publishing (publish button → post live on platform)

## Pipeline Identification

```
┌─────────────────────────────────────────────────────────────┐
│               PIPELINE DISCOVERY PROCESS                    │
│                                                             │
│  1. FIND ENTRY POINTS                                       │
│     ├─→ API routes (POST, PUT, DELETE)                     │
│     ├─→ Background job handlers                            │
│     ├─→ Webhook receivers                                  │
│     └─→ Event listeners                                    │
│                                                             │
│  2. TRACE DATA FLOW                                         │
│     ├─→ Input validation/parsing                           │
│     ├─→ Business logic                                     │
│     ├─→ External service calls                             │
│     └─→ Database writes                                    │
│                                                             │
│  3. DOCUMENT EACH PIPELINE                                  │
│     ├─→ Trigger (what starts it)                           │
│     ├─→ Steps (what happens)                               │
│     └─→ Outcome (what it produces)                         │
│                                                             │
│  4. ASSIGN P-SERIES IDS                                     │
│     └─→ P1, P2, P3... in order of discovery                │
└─────────────────────────────────────────────────────────────┘
```

## Where to Look

### API Routes
```typescript
// Next.js API routes
app/api/*/route.ts

// Express routes
routes/*.ts
controllers/*.ts
```

### Background Jobs
```typescript
// Job processors
jobs/*.ts
workers/*.ts
queues/*.ts
```

### Database Operations
```typescript
// Database writes indicate pipeline endpoints
supabase.from('table').insert()
prisma.model.create()
```

### External Services
```typescript
// External API calls often indicate pipelines
openai.chat.completions.create()
twitter.post()
```

## Pipeline Documentation Format

```markdown
### P1: Source Ingestion

**Trigger:** User uploads file via /sources/upload
**Frequency:** ~50/day

**Steps:**
1. File received at `api/sources/upload/route.ts:23`
2. File type validated (`lib/validators.ts:45`)
3. Content parsed by type (`lib/parsers/index.ts:12`)
4. Schema extracted (`lib/schema-extractor.ts:78`)
5. Source record created (`lib/db/sources.ts:34`)
6. Embedding generated (`lib/embeddings.ts:56`)

**Outcome:**
- `sources` table: new row with metadata
- `source_embeddings` table: vector for search
- `source_schema` JSON: extracted structure

**Key Files:**
- `api/sources/upload/route.ts`
- `lib/parsers/*.ts`
- `lib/schema-extractor.ts`
```

## Output Format

### In AUDIT-SCOPE.md

```markdown
## Backend Pipelines (P-series)

| ID | Name | Trigger | Outcome |
|----|------|---------|---------|
| P1 | Source Ingestion | File upload | source_schema populated |
| P2 | Content Generation | Generate button | Artifact created |
| P3 | Publishing | Publish button | Post live on platform |

### P1: Source Ingestion
[detailed documentation]

### P2: Content Generation
[detailed documentation]
```

### In audit-state.json

```json
{
  "backend_pipelines": [
    {
      "id": "P1",
      "name": "Source Ingestion",
      "trigger": "File upload via /sources/upload",
      "outcome": "source_schema populated",
      "key_files": ["api/sources/upload/route.ts", "lib/parsers/index.ts"],
      "step_count": 6
    }
  ]
}
```

## Discovery Checklist

- [ ] All POST/PUT/DELETE API routes examined
- [ ] Background job handlers identified
- [ ] Database write operations traced
- [ ] External API calls documented
- [ ] Each pipeline has trigger, steps, outcome
- [ ] P-series IDs assigned consistently

## Common Pipeline Patterns

| Pattern | Example | Indicators |
|---------|---------|------------|
| CRUD Create | User registration | POST route → validate → insert |
| File Processing | Document upload | POST multipart → parse → store |
| Generation | AI content | POST → LLM call → store result |
| Publishing | Social post | POST → external API → update status |
| Batch Job | Daily report | Cron → query → aggregate → email |

## Validation

Before completing, verify:

- [ ] All major data flows are documented
- [ ] Each pipeline has a unique P-series ID
- [ ] Triggers are user-observable actions or system events
- [ ] Outcomes are persistent (database writes, external effects)
- [ ] Key files are identified for each pipeline
- [ ] Step counts are accurate
