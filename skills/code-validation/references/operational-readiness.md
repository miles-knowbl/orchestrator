# Operational Readiness

Checklist for production readiness—can this be deployed, monitored, and operated?

## Why This Matters

Code that works locally isn't ready for production. Production requires observability, configurability, recoverability. AI-generated code almost never includes operational concerns—that's your job to add.

## Operational Readiness Checklist

### 1. Observability

**Can you tell if it's working?**

| Category | Questions | Signals |
|----------|-----------|---------|
| **Logging** | What gets logged? At what level? | Key operations, errors, request IDs |
| **Metrics** | What numbers matter? | Rate, errors, duration, saturation |
| **Tracing** | Can you follow a request? | Trace IDs propagated, spans created |
| **Health checks** | How does the system report health? | Endpoint, dependencies checked |

**Minimum logging:**
```javascript
// Every external call
logger.info('Calling payment API', { orderId, amount, requestId });
logger.info('Payment API responded', { orderId, status, duration, requestId });

// Every error
logger.error('Payment failed', { orderId, error: error.message, requestId });

// Key business events
logger.info('Order completed', { orderId, userId, total });
```

**Minimum metrics:**
```
- Request rate (requests/second)
- Error rate (errors/second, error percentage)
- Duration (p50, p95, p99 latency)
- Saturation (queue depth, connection pool usage)
```

### 2. Configurability

**Are environment-specific values externalized?**

| Category | Example | Configuration Method |
|----------|---------|---------------------|
| Service URLs | API endpoints | Environment variables |
| Credentials | API keys, passwords | Secrets management |
| Timeouts | Connection, request timeouts | Environment variables |
| Feature flags | New feature enabled | Feature flag service |
| Rate limits | Max requests/second | Environment or config |

**Anti-patterns:**
```javascript
// BAD: Hardcoded values
const API_URL = 'https://api.stripe.com';
const TIMEOUT = 5000;
const MAX_RETRIES = 3;

// GOOD: Configurable
const API_URL = process.env.STRIPE_API_URL || 'https://api.stripe.com';
const TIMEOUT = parseInt(process.env.PAYMENT_TIMEOUT_MS) || 5000;
const MAX_RETRIES = parseInt(process.env.PAYMENT_MAX_RETRIES) || 3;
```

### 3. Deployment Readiness

**Can this be deployed safely?**

| Concern | Questions |
|---------|-----------|
| **Migration** | Database schema changes? Data migration needed? |
| **Backward compatibility** | Can old and new versions run simultaneously? |
| **Feature flags** | Can this be deployed dark and enabled later? |
| **Rollback** | If this breaks, can we roll back safely? |
| **Dependencies** | New services or infrastructure required? |

**Migration safety checklist:**
- [ ] Schema changes are backward compatible
- [ ] Old code can run with new schema
- [ ] New code can run with old schema (during rollout)
- [ ] Migration is reversible
- [ ] Migration has been tested with production-like data volume

### 4. Error Handling for Operations

**What happens when things go wrong?**

| Scenario | Operational Need |
|----------|------------------|
| Unexpected error | Logged with context, alert if frequent |
| Expected error | Handled gracefully, metrics updated |
| Dependency failure | Circuit breaker, fallback behavior |
| Rate limiting | Backpressure, queue management |
| Data inconsistency | Detection, alert, recovery path |

### 5. Alerting

**What should wake someone up at 3 AM?**

Alerts should be:
- **Actionable**: Someone can do something about it
- **Urgent**: It can't wait until morning
- **Accurate**: Low false positive rate

| Alert | Threshold | Rationale |
|-------|-----------|-----------|
| Error rate spike | >5% errors over 5 min | Users impacted |
| Latency spike | p99 > 10s over 5 min | Users impacted |
| Service down | Health check fails | Complete outage |
| Queue backup | >1000 items for 10 min | Processing blocked |
| Disk space | <10% free | Imminent failure |

**NOT alertworthy (log/dashboard only):**
- Individual errors (unless very unusual)
- Slightly elevated latency
- Expected error types (validation errors)

### 6. Documentation

**Can someone else operate this at 3 AM?**

| Document | Content |
|----------|---------|
| **README** | What is this? How to run/deploy? |
| **Architecture** | Components, data flow, dependencies |
| **Runbook** | How to diagnose common issues |
| **API docs** | Endpoints, request/response formats |
| **Config reference** | Environment variables and their effects |

**Runbook template:**
```markdown
## [Issue Name]

**Symptoms:**
- What you'll see in logs
- What users will report
- What metrics will show

**Diagnosis:**
1. Check X
2. Look at Y
3. Verify Z

**Resolution:**
1. If A, do B
2. If C, do D
3. Escalate if E

**Prevention:**
How to prevent recurrence
```

### 7. Graceful Shutdown

**Does the service stop cleanly?**

```javascript
// Handle shutdown signals
process.on('SIGTERM', async () => {
  logger.info('Shutdown signal received');

  // Stop accepting new requests
  server.close();

  // Complete in-flight requests (with timeout)
  await Promise.race([
    finishInFlightRequests(),
    timeout(30000)
  ]);

  // Close connections cleanly
  await database.close();
  await cache.close();

  process.exit(0);
});
```

### 8. Resource Limits

**Are resources bounded?**

| Resource | Limit | What Happens at Limit |
|----------|-------|----------------------|
| Memory | Container limit | OOM kill, restart |
| Connections | Pool max | Queue, timeout |
| Request rate | Rate limit | 429 response |
| Request size | Body limit | 413 response |
| File upload | Size limit | Rejection |

## Operational Readiness Review

### Pre-Deployment Checklist

```markdown
## Operational Readiness: [Feature Name]

### Observability
- [ ] Key operations logged with context
- [ ] Errors logged with stack traces
- [ ] Metrics exported (rate, errors, duration)
- [ ] Request tracing implemented
- [ ] Health check updated if needed

### Configuration
- [ ] No hardcoded secrets
- [ ] Environment-specific values externalized
- [ ] Defaults are safe for production
- [ ] Config changes don't require redeploy

### Deployment
- [ ] Migration plan documented
- [ ] Rollback plan documented
- [ ] Feature flag available (if high risk)
- [ ] No breaking API changes (or versioned)

### Alerting
- [ ] New alerts defined (if needed)
- [ ] Existing alerts still valid
- [ ] Dashboard updated

### Documentation
- [ ] README updated
- [ ] Runbook entry added (if new failure mode)
- [ ] API docs updated (if API changed)

### Resource Management
- [ ] Timeouts configured on external calls
- [ ] Connection pools sized appropriately
- [ ] Graceful shutdown handled
```

## Output Format

When documenting operational readiness:

```markdown
## Operational Readiness Assessment

### Observability
- Logging: ✅ Key operations logged, request IDs present
- Metrics: ⚠️ No custom metrics for payment processing
- Tracing: ✅ Spans created for external calls
- Health: ✅ Health check includes DB and cache

### Configuration
- ✅ All URLs configurable
- ✅ Secrets in environment variables
- ⚠️ Timeout hardcoded (should be configurable)

### Deployment
- ✅ No schema changes
- ✅ API backward compatible
- ✅ Feature flag available

### Alerting
- ⚠️ No alert for payment failure rate

### Documentation
- ✅ README current
- ❌ No runbook for payment failures

### Blockers
1. Need runbook for payment failures

### Recommendations
1. Add payment processing metrics
2. Make timeout configurable
3. Add alert for payment failure rate > 2%
```
