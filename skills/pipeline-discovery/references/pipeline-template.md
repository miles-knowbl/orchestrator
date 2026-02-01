# Pipeline Template

Standard format for documenting a backend pipeline.

## Full Template

```markdown
### P{N}: {Pipeline Name}

**Trigger:** {What starts this pipeline}
**Frequency:** {How often it runs, approximate}

**Steps:**
1. {Step description} (`{file}:{line}`)
2. {Step description} (`{file}:{line}`)
3. {Step description} (`{file}:{line}`)
...

**Outcome:**
- {Database table}: {what changes}
- {External system}: {what happens}

**Key Files:**
- `{primary file path}`
- `{secondary file path}`

**Dependencies:**
- {External service or internal dependency}

**Notes:**
- {Any important context}
```

## Example: Content Generation

```markdown
### P2: Content Generation

**Trigger:** User clicks "Generate" button with sources selected
**Frequency:** ~200/day

**Steps:**
1. Request received at `api/generate/route.ts:45`
2. Sources fetched from context (`lib/context.ts:23`)
3. Source content aggregated (`lib/sources/aggregate.ts:67`)
4. Prompt constructed (`lib/prompts/builder.ts:89`)
5. OpenAI completion requested (`lib/llm/openai.ts:34`)
6. Response parsed and validated (`lib/parsers/content.ts:12`)
7. Artifact record created (`lib/db/artifacts.ts:56`)
8. Generation job marked complete (`lib/jobs/status.ts:78`)

**Outcome:**
- `artifacts` table: new row with generated content
- `generation_jobs` table: status updated to 'complete'
- User sees new artifact in UI

**Key Files:**
- `api/generate/route.ts` — Entry point
- `lib/llm/openai.ts` — LLM integration
- `lib/db/artifacts.ts` — Persistence

**Dependencies:**
- OpenAI API (gpt-4)
- Supabase (database)

**Notes:**
- Generation can take 10-30 seconds
- Implements retry logic for API failures
```

## Minimal Template

For quick documentation:

```markdown
### P{N}: {Name}

**Trigger:** {What starts it}
**Outcome:** {What it produces}
**Entry:** `{main file path}`
```

## Step Documentation

Each step should include:
- Action verb (received, validated, parsed, created)
- Object (request, data, record)
- Location (file:line)

**Good:**
```
3. Source content aggregated (`lib/sources/aggregate.ts:67`)
```

**Bad:**
```
3. Aggregate sources
```

## Outcome Documentation

Be specific about effects:

**Good:**
```
- `artifacts` table: new row with type, content, metadata
- `jobs` table: status changed from 'pending' to 'complete'
```

**Bad:**
```
- Database updated
```
