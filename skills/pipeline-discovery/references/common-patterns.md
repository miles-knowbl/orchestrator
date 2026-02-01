# Common Pipeline Patterns

Typical backend pipeline patterns to recognize.

## CRUD Patterns

### Create Pattern
```
POST request → Validate input → Create record → Return ID

Example: User registration
POST /users → validate email/password → insert user → return user_id
```

### Update Pattern
```
PUT/PATCH request → Load existing → Validate changes → Update record

Example: Profile update
PATCH /users/:id → load user → validate fields → update user
```

### Delete Pattern
```
DELETE request → Load existing → Check permissions → Delete/soft-delete

Example: Source deletion
DELETE /sources/:id → load source → check owner → soft delete
```

## Processing Patterns

### File Ingestion
```
Upload → Validate type → Parse content → Extract metadata → Store

Example: Document upload
POST /upload → check mime type → parse PDF → extract text → store in sources
```

### AI Generation
```
Request → Gather context → Build prompt → Call LLM → Parse response → Store

Example: Content generation
POST /generate → get sources → build prompt → call GPT → parse → store artifact
```

### Transformation
```
Input → Load data → Transform → Validate output → Store

Example: Format conversion
POST /convert → load source → convert format → validate → store result
```

## Integration Patterns

### Publish to External
```
Request → Load content → Format for platform → Call external API → Update status

Example: Twitter publish
POST /publish → load artifact → format tweet → call Twitter API → mark published
```

### Webhook Receiver
```
Webhook → Validate signature → Parse payload → Update internal state

Example: Payment webhook
POST /webhooks/stripe → verify signature → parse event → update subscription
```

### Sync Pattern
```
Trigger → Fetch external data → Compare with local → Update local state

Example: Calendar sync
POST /sync/calendar → fetch Google events → diff with local → update events
```

## Batch Patterns

### Scheduled Job
```
Cron trigger → Query data → Process batch → Update records

Example: Daily digest
Cron 9am → query unread items → generate digest → send email → mark sent
```

### Queue Worker
```
Job picked → Load job data → Process → Update job status

Example: Video encoding
Pick job → load video → encode formats → upload to CDN → mark complete
```

## Pattern Indicators

| Pattern | Code Indicators |
|---------|----------------|
| CRUD | REST routes, model operations |
| File Ingestion | Multipart parsing, file type checks |
| AI Generation | LLM client calls, prompt building |
| External Publish | OAuth tokens, API clients |
| Webhook | Signature verification, event parsing |
| Batch | Cron expressions, queue.process() |

## Anti-Patterns (Not Pipelines)

| Pattern | Why Not a Pipeline |
|---------|-------------------|
| Health check | No state change |
| Auth middleware | Shared, not a flow |
| Utility functions | No trigger/outcome |
| Event logging | Side effect only |
