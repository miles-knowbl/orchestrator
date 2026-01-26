# Recovery Strategies Reference

## Overview of Recovery Patterns

Four core patterns form the foundation of resilient systems. Each addresses a different
failure mode. Most production systems combine multiple patterns.

## Pattern 1: Retry

Re-attempt a failed operation, assuming the failure is transient.

**When to use:**
- Network timeouts or temporary connectivity loss
- HTTP 429, 503, or 502 responses
- Database connection pool exhaustion
- Queue publish failures

**When NOT to use:**
- HTTP 400, 401, 403, 404 (non-transient)
- Validation errors or malformed input
- Business logic violations
- Any programmer error

**Configuration:**
- Max retries: 3-5 for network calls, 1-2 for expensive operations
- Backoff: Exponential with jitter (see retry-patterns.md)
- Timeout per attempt: Set lower than total operation budget
- Idempotency: Required for any retried write operation

## Pattern 2: Fallback

Provide degraded but functional service when the primary path fails.

**When to use:**
- Non-critical features that enhance but aren't essential
- Read operations where stale data is acceptable
- Services with multiple data sources
- UI features that can gracefully degrade

**Fallback hierarchy (try in order):**
1. Cache -- return last known good value
2. Default -- return a safe static default
3. Alternative service -- call a backup provider
4. Degraded mode -- disable the feature, inform the user

**Configuration:**
- Cache TTL: Match staleness tolerance (5min for prices, 1hr for profiles)
- Default values: Must be safe and obvious (empty list, not null)
- Fallback timeout: Should be fast (100-500ms), otherwise defeats purpose
- Feature flags: Use flags to toggle fallback behavior without deploys

**Example:**
```
async function getRecommendations(userId) {
  try {
    return await recommendationService.fetch(userId);    // Primary
  } catch (err) {
    log.warn({ err, userId }, 'Recommendation service failed, using fallback');
    const cached = await cache.get(`recs:${userId}`);
    if (cached) return cached;                           // Cache fallback
    return DEFAULT_RECOMMENDATIONS;                      // Static fallback
  }
}
```

## Pattern 3: Circuit Breaker

Stop calling a failing service to let it recover, and to protect your system from
cascading failures. (See circuit-breaker-patterns.md for detailed state machine.)

**When to use:**
- Calling external services or APIs
- Database queries under heavy load
- Any dependency that can fail repeatedly
- Protecting against cascading failures across services

**When NOT to use:**
- In-process function calls (overhead not justified)
- Operations that must succeed (use retry + queue instead)
- Idempotent reads where stale cache suffices (use fallback)

**Configuration:**
- Failure threshold: 5 failures in 60 seconds (tune to your SLA)
- Open duration: 30-60 seconds (long enough for recovery)
- Half-open probe count: 1-3 requests to test recovery
- Monitoring: Alert when circuit opens, track open duration

## Pattern 4: Bulkhead

Isolate components so one failure doesn't exhaust shared resources.

**When to use:**
- Multiple services sharing a thread pool or connection pool
- One slow dependency dragging down all requests
- Multi-tenant systems where one tenant's load shouldn't affect others
- Any shared resource that can be saturated

**Isolation strategies:**

| Strategy | Mechanism | Use case |
|----------|-----------|----------|
| Thread pool | Separate pools per dependency | JVM-based systems |
| Connection pool | Separate DB pools per service | Database access |
| Semaphore | Limit concurrent calls to a service | Lightweight isolation |
| Queue | Separate queues per priority/tenant | Async processing |
| Process | Separate processes per workload | Maximum isolation |

**Configuration:**
- Pool size: Based on dependency's capacity, not caller's demand
- Queue depth: Reject early rather than queue indefinitely
- Timeout: Per-bulkhead timeout prevents hung requests from consuming slots

## Combining Patterns

Patterns compose. The standard combination for external service calls:

```
Request -> [Bulkhead] -> [Circuit Breaker] -> [Retry] -> [Fallback] -> Response
```

**Order matters.** Bulkhead outermost (resource protection), fallback innermost (response guarantee).

## Recovery Strategy Selection Matrix

| Failure type | Primary strategy | Secondary strategy |
|-------------|------------------|-------------------|
| Transient network error | Retry with backoff | Fallback to cache |
| Service outage | Circuit breaker | Fallback to default |
| Resource exhaustion | Bulkhead isolation | Shed load (429) |
| Slow dependency | Timeout + circuit breaker | Fallback to cache |
| Data corruption | Stop processing | Alert + manual review |
| Configuration error | Fail fast | Use last known good config |

## Anti-Patterns

1. **Retry storms**: All clients retry simultaneously, amplifying the outage
2. **Fallback to same failure**: Fallback calls the same broken dependency
3. **No timeout on fallback**: Fallback itself hangs, defeating the purpose
4. **Ignoring partial failure**: Returning empty results without indicating degradation
5. **Recovery without observability**: Recovering silently so operators never know it happened
