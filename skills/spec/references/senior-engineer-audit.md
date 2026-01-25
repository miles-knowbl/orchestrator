# Senior Engineer Audit

Comprehensive checklist for production-readiness review.

## Why Audit Matters

Every compiled spec undergoes a Senior Engineer audit. This catches issues that are expensive to fix after implementation: security vulnerabilities, race conditions, scalability bottlenecks, and operational blind spots.

**All issues must be resolved in the spec itself**, not noted as comments. The compiled spec should be production-ready.

## Audit Process

1. **Review each category** using the checklists below
2. **Document issues found** with category and description
3. **Resolve each issue** by updating the spec
4. **Record resolution** in the Compilation Summary table

## Audit Categories

### 1. Security

| Check | What to Look For |
|-------|------------------|
| **Input validation** | All user inputs validated before processing |
| **Authentication** | All endpoints require appropriate auth |
| **Authorization** | Granular RLS policies, not "FOR ALL" |
| **Rate limiting** | Public endpoints have rate limits |
| **SQL injection** | Parameterized queries, no string interpolation |
| **XSS prevention** | Output encoding, Content Security Policy |
| **Secrets handling** | No hardcoded secrets, proper env vars |
| **Data exposure** | Only necessary fields returned to client |
| **Audit logging** | Sensitive operations logged |

**Common Issues:**

| Issue | Resolution Pattern |
|-------|-------------------|
| RLS policy missing INSERT | Add explicit INSERT policy with business_id check |
| No rate limiting on API | Add rate limit: 100 req/min per user |
| Portal function lacks ownership check | Add business_id validation in RPC |
| Events could contain PII | Define explicit schema with IDs only |

### 2. Concurrency

| Check | What to Look For |
|-------|------------------|
| **Race conditions** | Check-then-act patterns protected |
| **Optimistic locking** | Version fields on frequently updated records |
| **Distributed locking** | Cron jobs and batch operations use locks |
| **Idempotency** | Mutations can be safely retried |
| **Deadlock prevention** | Consistent lock ordering |
| **Transaction boundaries** | Related operations in single transaction |

**Common Issues:**

| Issue | Resolution Pattern |
|-------|-------------------|
| Duplicate job race condition | Add unique constraint + SELECT FOR UPDATE SKIP LOCKED |
| Counter drift on denormalized fields | Add reconciliation job + trigger-based updates |
| Cron job overlap | Add cron_locks table with distributed locking |
| Skip race condition | Add optimistic locking with version field |
| Missing transaction | Wrap related operations in stored procedure |

### 3. Reliability

| Check | What to Look For |
|-------|------------------|
| **Retry logic** | Failed operations can be retried with backoff |
| **Graceful degradation** | Feature fails gracefully, doesn't crash system |
| **Timeout handling** | All external calls have timeouts |
| **Circuit breakers** | Failing dependencies don't cascade |
| **Error recovery** | Clear recovery path for partial failures |
| **Idempotency keys** | One-time operations are idempotent |

**Common Issues:**

| Issue | Resolution Pattern |
|-------|-------------------|
| No retry logic | Add retry with exponential backoff (3 attempts, 1s/2s/4s) |
| Missing timeout | Add 30s timeout to all external calls |
| Partial failure unhandled | Add transaction with rollback on error |
| No idempotency | Add idempotency_key column, check before processing |

### 4. Scalability

| Check | What to Look For |
|-------|------------------|
| **Unbounded queries** | All list queries have limits/pagination |
| **Batch processing** | Large operations processed in batches |
| **N+1 queries** | No loops that make N database calls |
| **Missing indexes** | Frequently queried columns are indexed |
| **Denormalization** | Counters/aggregates updated efficiently |
| **Connection pooling** | Database connections properly pooled |

**Common Issues:**

| Issue | Resolution Pattern |
|-------|-------------------|
| Unbounded query | Add LIMIT with pagination (default 100, max 1000) |
| N+1 query in batch | Replace loop with bulk operation or JOIN |
| Missing index | Add composite index on (business_id, status, created_at) |
| Counter requires COUNT(*) | Add denormalized counter with trigger updates |

### 5. Observability

| Check | What to Look For |
|-------|------------------|
| **Metrics defined** | Key operations have counters/histograms |
| **Structured logging** | JSON logs with consistent schema |
| **Log levels** | Appropriate use of info/warn/error |
| **Alerts defined** | Thresholds and runbooks for alerts |
| **Request tracing** | Request IDs propagate through calls |
| **Error context** | Errors include enough context to debug |

**Common Issues:**

| Issue | Resolution Pattern |
|-------|-------------------|
| No structured logging | Add JSON logging with timestamp, event, context |
| No metrics | Add counters for success/failure, histograms for duration |
| No alerts | Add alert for error rate > 1% with runbook |
| Missing request ID | Add request_id to all logs in same request |

### 6. Data Model

| Check | What to Look For |
|-------|------------------|
| **Constraints** | CHECK constraints for valid values |
| **Foreign keys** | All references have FK constraints |
| **Default values** | Sensible defaults for optional fields |
| **NOT NULL** | Required fields are NOT NULL |
| **Soft delete** | Deleted records preserved with deleted_at |
| **Audit fields** | created_at, updated_at, created_by tracked |
| **State machines** | Status transitions validated |

**Common Issues:**

| Issue | Resolution Pattern |
|-------|-------------------|
| No state machine validation | Add CHECK constraint or trigger for valid transitions |
| updated_at not maintained | Add trigger: `BEFORE UPDATE ... SET updated_at = NOW()` |
| Number collision | Add advisory locks for sequence generation |
| Missing payment failure tracking | Add failure_count, failure_reason, last_failure_at |

### 7. API Design

| Check | What to Look For |
|-------|------------------|
| **Consistent naming** | Endpoint names follow conventions |
| **Error responses** | Consistent error format with codes |
| **Pagination** | List endpoints support pagination |
| **Filtering** | List endpoints support filtering |
| **Versioning** | API version strategy defined |
| **Documentation** | OpenAPI/Swagger spec or equivalent |

### 8. Authorization Patterns

| Check | What to Look For |
|-------|------------------|
| **Business isolation** | All queries filter by business_id |
| **Role-based access** | Different capabilities for different roles |
| **Owner vs admin** | Authors can edit their own, admins can edit all |
| **Soft delete filtering** | RLS includes `deleted_at IS NULL` |
| **INSERT policies** | Explicit INSERT policies, not just SELECT |

**RLS Policy Template:**

```sql
-- SELECT: Business users (respecting soft delete)
CREATE POLICY "{table}_select" ON {table} FOR SELECT
USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  AND deleted_at IS NULL
);

-- INSERT: Role-restricted
CREATE POLICY "{table}_insert" ON {table} FOR INSERT
WITH CHECK (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- UPDATE: Author or elevated role
CREATE POLICY "{table}_update" ON {table} FOR UPDATE
USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  AND deleted_at IS NULL
  AND (
    created_by = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  )
);

-- DELETE: Owner only (prefer soft delete)
CREATE POLICY "{table}_delete" ON {table} FOR DELETE
USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'owner'
  )
);
```

## Audit Documentation

### Issues Table Format

```markdown
| # | Category | Issue | Resolution |
|---|----------|-------|------------|
| 1 | Security | RLS INSERT gap | Added explicit INSERT policies |
| 2 | Concurrency | Race condition on skip | Added optimistic locking |
| 3 | Scalability | Missing index | Added composite index |
```

### Summary Table Format

```markdown
| Category | Issues Found | Issues Resolved | Status |
|----------|--------------|-----------------|--------|
| Security | 3 | 3 | ✅ |
| Concurrency | 2 | 2 | ✅ |
| Reliability | 1 | 1 | ✅ |
| Scalability | 2 | 2 | ✅ |
| Observability | 1 | 1 | ✅ |
| Data Model | 3 | 3 | ✅ |
| **Total** | **12** | **12** | ✅ |
```

## Test Scenarios

Every audit must verify test scenarios exist:

### Security Tests (minimum 3)

```yaml
security_tests:
  - Unauthorized user cannot access endpoint
  - Cross-tenant data isolation verified
  - Input sanitization prevents injection
  - Rate limiting blocks excessive requests
```

### Concurrency Tests (minimum 3)

```yaml
concurrency_tests:
  - Simultaneous creates don't cause duplicates
  - Optimistic locking prevents lost updates
  - Distributed lock prevents cron overlap
  - Race condition in check-then-act handled
```

### Failure Mode Tests (minimum 3)

```yaml
failure_tests:
  - Database timeout handled gracefully
  - Partial failure rolls back correctly
  - Network error shows user-friendly message
  - Invalid state transition rejected
```

### Load Tests (minimum 1)

```yaml
load_tests:
  - System handles 1000 concurrent users
  - Response time < 200ms at p95
  - No memory leaks over 24h operation
  - Batch processing completes in < 5min for 10K records
```

## Audit Checklist

```markdown
### Security
- [ ] All inputs validated
- [ ] Auth required on all endpoints
- [ ] RLS policies granular (not FOR ALL)
- [ ] Rate limiting on public endpoints
- [ ] No SQL injection vectors
- [ ] Secrets in env vars only

### Concurrency
- [ ] Race conditions protected
- [ ] Optimistic locking on contested resources
- [ ] Cron jobs use distributed locks
- [ ] Idempotency keys where needed
- [ ] Transactions for related operations

### Reliability
- [ ] Retry with backoff for failures
- [ ] Timeouts on all external calls
- [ ] Graceful degradation paths
- [ ] Clear error recovery

### Scalability
- [ ] All queries bounded (LIMIT)
- [ ] Batch processing for large operations
- [ ] No N+1 query patterns
- [ ] Indexes on query columns

### Observability
- [ ] Metrics for key operations
- [ ] Structured logging throughout
- [ ] Alerts with runbooks
- [ ] Request tracing

### Data Model
- [ ] CHECK constraints for valid values
- [ ] FK constraints on references
- [ ] Audit fields (created_at, updated_at)
- [ ] State machine validation

### Test Coverage
- [ ] 3+ security tests
- [ ] 3+ concurrency tests
- [ ] 3+ failure mode tests
- [ ] 1+ load test
```
