# Pipeline Identification

How to find backend pipelines in a codebase.

## What Qualifies as a Pipeline

A backend pipeline must have:

1. **Trigger** — Something that starts it (user action, system event)
2. **Processing** — Multiple steps that transform data
3. **Outcome** — Persistent result (database write, external effect)

## Discovery Strategy

### 1. Start with Entry Points

Look for:
```
app/api/*/route.ts          # Next.js App Router
pages/api/*.ts              # Next.js Pages Router
routes/*.ts                 # Express
controllers/*.ts            # MVC patterns
functions/*.ts              # Serverless
```

### 2. Filter to State-Changing Operations

Focus on:
- POST requests (create)
- PUT/PATCH requests (update)
- DELETE requests (remove)

Skip:
- GET requests (read-only, not pipelines)
- OPTIONS/HEAD (metadata)

### 3. Trace the Data Flow

From entry point, follow:
```
Request → Validation → Business Logic → Database → Response
```

Document each step with file:line references.

### 4. Identify External Effects

Pipelines often involve:
- Database writes (Supabase, Prisma, etc.)
- External API calls (OpenAI, Twitter, etc.)
- File storage (S3, local fs)
- Queue operations (add job, publish event)

## Code Patterns to Search

### Database Writes
```typescript
// Supabase
supabase.from('table').insert()
supabase.from('table').update()
supabase.from('table').upsert()

// Prisma
prisma.model.create()
prisma.model.update()

// Raw SQL
db.execute('INSERT INTO...')
```

### External API Calls
```typescript
// OpenAI
openai.chat.completions.create()

// HTTP clients
fetch('https://api.external.com', { method: 'POST' })
axios.post()
```

### Job Queues
```typescript
// Bull/BullMQ
queue.add('jobName', data)

// Custom
jobRunner.enqueue()
```

## Non-Pipeline Patterns

Don't document these as pipelines:

| Pattern | Why Not |
|---------|---------|
| GET requests | Read-only, no state change |
| Pure functions | No persistent outcome |
| Middleware | Shared logic, not a flow |
| Utilities | Helpers, not data flows |
| Auth checks | Gate, not a pipeline |

## Pipeline Naming Convention

```
P{N}: {Noun} {Action}

P1: Source Ingestion
P2: Content Generation
P3: Post Publishing
P4: User Registration
P5: Subscription Update
```

## Minimum Documentation

Each pipeline needs at minimum:
1. ID (P1, P2, etc.)
2. Name (descriptive)
3. Trigger (what starts it)
4. Outcome (what it produces)
5. Key files (entry point at least)
