# Failure Modes

Framework for analyzing what happens when dependencies fail.

## Why This Matters

Production is where things fail. Networks drop, databases timeout, third-party services go down. AI-generated code typically handles the happy path—your job is to ask "what if this breaks?"

## Failure Analysis Framework

### Step 1: Dependency Inventory

List everything the code depends on:

```markdown
## Dependencies

**External Services:**
- Stripe API (payments)
- SendGrid API (email)
- S3 (file storage)

**Internal Services:**
- Auth service
- User service
- Notification service

**Infrastructure:**
- PostgreSQL database
- Redis cache
- Message queue

**Resources:**
- File system
- Memory
- CPU
```

### Step 2: Failure Mode Analysis

For each dependency, analyze three failure modes:

| Mode | What Happens | Duration |
|------|--------------|----------|
| **Down** | Service completely unavailable | Minutes to hours |
| **Slow** | Service responds but takes 10-100x longer | Intermittent |
| **Wrong** | Service responds but with bad data | Until noticed |

### Step 3: Impact Assessment

For each failure mode, determine:

1. **User impact**: What does the user see/experience?
2. **Data impact**: Is data lost, corrupted, or inconsistent?
3. **System impact**: Does this cascade to other failures?
4. **Business impact**: Revenue loss? Reputation damage?

### Step 4: Mitigation Strategy

For each significant impact, define:

1. **Detection**: How do we know it's happening?
2. **Response**: What happens automatically?
3. **Recovery**: How do we restore normal operation?
4. **Communication**: Who needs to know?

## Failure Mode Catalog

### External API Failures

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Connection refused | Request fails immediately | Retry with backoff, circuit breaker |
| Timeout | Resource held, user waiting | Aggressive timeout, async processing |
| 500 error | Request fails | Retry for idempotent, fail for mutations |
| 429 rate limit | Requests rejected | Queue, backoff, request pooling |
| Bad gateway/proxy | Intermittent failures | Retry, alternative endpoints |
| SSL/TLS failure | Complete failure | Alert, manual intervention |
| DNS failure | Can't reach service | Cache DNS, fallback IPs |

### Database Failures

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Connection lost | Queries fail | Connection pooling, retry |
| Connection pool exhausted | New requests wait/fail | Pool sizing, timeout, monitoring |
| Query timeout | Long operations fail | Query optimization, pagination |
| Lock contention | Transactions wait/fail | Smaller transactions, retry |
| Disk full | Writes fail | Monitoring, cleanup policies |
| Replication lag | Stale reads | Read from primary for critical ops |
| Full database down | Complete failure | Failover, degraded mode |

### Cache Failures

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Cache miss | Slower response, DB load | Graceful fallback, warm-up |
| Cache down | All requests hit DB | Circuit breaker, DB can handle |
| Stale cache | Wrong data served | TTL, invalidation, versioning |
| Cache full | New entries rejected | Eviction policy, monitoring |

### File System Failures

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Disk full | Writes fail | Monitoring, cleanup, quota |
| Permission denied | Operations fail | Proper permissions, error handling |
| File locked | Operations wait/fail | Retry, timeout |
| File corrupted | Bad data read | Validation, checksums |

### Message Queue Failures

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Queue unavailable | Messages can't be sent | Retry, fallback to sync |
| Consumer down | Messages accumulate | Auto-scaling, alerts |
| Poison message | Consumer crashes repeatedly | Dead letter queue |
| Duplicate delivery | Operation runs twice | Idempotency |

## Cascade Analysis

Failures often cascade. Map the domino effect:

```
Payment API slow (5s → 30s response)
    ↓
Request threads held longer
    ↓
Thread pool exhausted
    ↓
New requests queued/rejected
    ↓
User-facing timeouts
    ↓
Users retry (making it worse)
    ↓
Other endpoints affected (shared thread pool)
    ↓
Health checks fail
    ↓
Load balancer removes instance
    ↓
Remaining instances overloaded
    ↓
Full outage
```

**Breaking the cascade:**
- Timeouts at each step (don't wait forever)
- Circuit breakers (stop calling failing service)
- Bulkheads (isolate resources per dependency)
- Backpressure (reject early when overloaded)
- Graceful degradation (return partial results)

## Failure Mode Questions

Ask these for each dependency:

```markdown
### [Dependency Name]

**If it's completely down:**
- What happens to in-flight requests?
- What error does the user see?
- What data is lost or stuck?
- Can the operation be retried later?
- What's the fallback?

**If it's slow (10x normal):**
- Do we timeout? At what threshold?
- What happens to resources while waiting?
- Does slowness cascade to other operations?
- Will users retry and make it worse?

**If it returns bad data:**
- How would we know?
- What validation exists?
- What's the blast radius of bad data?
- Can bad data be detected and corrected?

**If it's intermittently failing:**
- Do we retry? How many times?
- Is the operation idempotent?
- How do we avoid making it worse?
```

## Graceful Degradation Strategies

When dependencies fail, degrade gracefully:

| Scenario | Bad Response | Good Response |
|----------|--------------|---------------|
| Recommendation service down | Show error page | Show popular items instead |
| Payment slow | User waits indefinitely | Queue payment, confirm later |
| Search down | Search broken | Show browse/categories |
| Profile picture service down | Broken images | Show default avatar |
| Analytics down | Block user action | Skip analytics, continue |

**Principle:** Core functionality should survive non-core failures.

## Output Format

When documenting failure mode analysis:

```markdown
## Failure Mode Analysis

### Payment API (Stripe)

**Down:**
- Detection: 5xx responses, connection refused
- User impact: Cannot complete checkout
- Response: Show "payment temporarily unavailable" message
- Recovery: Retry on next attempt
- Mitigation: ❌ NOT IMPLEMENTED - should queue for retry

**Slow (>5s):**
- Detection: Response time metrics
- User impact: Checkout feels stuck
- Response: Show progress indicator, timeout at 30s
- Mitigation: ✅ Timeout configured, loading state shown

**Wrong (bad response):**
- Detection: Schema validation
- User impact: Charge might fail silently
- Response: Validate response, log anomalies
- Mitigation: ⚠️ Basic validation only, needs improvement

### Blockers

1. No retry mechanism for failed payments - user must retry manually

### Recommendations

1. Add payment queue for retry
2. Implement circuit breaker for Stripe API
3. Add fallback payment provider
```
