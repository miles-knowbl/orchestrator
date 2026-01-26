# Circuit Breaker Patterns Reference

## State Machine

A circuit breaker wraps calls to an external dependency and tracks failures
to prevent cascading outages. It has three states:

```
                 failure threshold
                    exceeded
    +--------+    ----------->    +--------+
    | CLOSED |                    |  OPEN  |
    +--------+    <-----------    +--------+
         ^         probe fails         |
         |                             | timeout expires
         |                             v
         |                       +-----------+
         +-------- success ------|  HALF-OPEN |
                   threshold     +-----------+
```

### CLOSED (Normal Operation)
- All requests pass through to the dependency
- Failures are counted within a sliding window
- Transitions to OPEN when failure threshold is exceeded

### OPEN (Failing Fast)
- All requests immediately rejected without calling the dependency
- Returns a fallback response or error
- Transitions to HALF-OPEN when the timeout expires

### HALF-OPEN (Testing Recovery)
- A limited number of probe requests are allowed through
- If probes succeed: transition to CLOSED (dependency recovered)
- If probes fail: transition back to OPEN (still broken)

## Configuration Parameters

### Failure Threshold

| Parameter | Typical value | Notes |
|-----------|--------------|-------|
| failureRate | 50% | Percentage of calls that failed |
| slidingWindow | 60 seconds | Time window for counting failures |
| minimumCalls | 10 | Don't open on low volume (avoid false positives) |

**Recommendation:** Use failure rate with a minimum call count. 3 failures out of 5
calls is concerning; 3 failures out of 5000 is noise.

### Open State Timeout

| Dependency type | Timeout | Rationale |
|----------------|---------|-----------|
| Internal microservice | 15-30s | Fast restart, container orchestration |
| External API | 30-60s | Less control over recovery time |
| Database | 10-20s | Failover is usually fast |
| Third-party SaaS | 60-120s | Unpredictable recovery |

### Half-Open Configuration

| Parameter | Typical value | Notes |
|-----------|--------------|-------|
| probeCount | 3 | Number of requests to test |
| successThreshold | 2 out of 3 | Required successes to close |
| probeTimeout | 5s | Shorter timeout for probes |

## Implementation Pattern

```javascript
class CircuitBreaker {
  constructor(options) {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.openTimeout = options.openTimeout || 30000;
  }

  async call(fn, fallback) {
    if (this.state === 'OPEN') {
      return fallback ? fallback() : Promise.reject(new CircuitOpenError());
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  transitionTo(newState) {
    const prev = this.state;
    this.state = newState;
    this.failureCount = 0;
    this.successCount = 0;
    if (newState === 'OPEN') {
      setTimeout(() => this.transitionTo('HALF_OPEN'), this.openTimeout);
    }
    this.emit('stateChange', { from: prev, to: newState });
  }
}
```

## Bulkhead Isolation Strategies

Bulkheads prevent one dependency from consuming all shared resources.

| Strategy | Mechanism | Use case |
|----------|-----------|----------|
| Semaphore | Limit concurrent calls per dependency | Lightweight isolation |
| Connection pool | Separate pools per downstream | Database access |
| Queue | Separate queues per priority/tenant | Async processing |
| Process | Separate processes per workload | Maximum isolation |

**Sizing rule:** Base pool size on the dependency's capacity, not the caller's demand.

## Monitoring and Alerting

### Metrics to Track

| Metric | Alert threshold | Meaning |
|--------|----------------|---------|
| Circuit state | Any OPEN event | Dependency failure detected |
| Time in OPEN | > 5 minutes | Sustained outage, needs intervention |
| State transitions/hour | > 10 | Flapping, intermittent failure |
| Rejected requests | Rate > baseline | Users are impacted |
| Fallback rate | > 20% of requests | Degraded service quality |

### Dashboard Essentials

Every circuit breaker should expose:
1. Current state (CLOSED / OPEN / HALF-OPEN) with color indicator
2. Failure rate over sliding window (line chart)
3. State transition history (timeline)
4. Fallback activation rate (percentage)
5. P99 latency (should decrease when circuit is open)

## Anti-Patterns

1. **Single global circuit breaker**: One circuit for all dependencies; one failure opens everything
2. **Too sensitive threshold**: Opens on 2 failures; flaps on normal error rates
3. **Too long open timeout**: 10-minute timeout delays recovery detection
4. **No fallback on OPEN**: Returns raw errors to users instead of degraded response
5. **No monitoring**: Circuit silently opens and closes; operators never know
