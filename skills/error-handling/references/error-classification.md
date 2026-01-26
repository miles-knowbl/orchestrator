# Error Classification Reference

## Two Fundamental Categories

### Operational Errors
Runtime problems that occur in correctly written programs. These are expected failure modes
that the system must handle gracefully.

| Type | Examples | Response |
|------|----------|----------|
| Network | Timeout, DNS failure, connection refused | Retry with backoff |
| Resource | Disk full, memory exhausted, file locked | Alert + degrade gracefully |
| Dependency | Database down, API 503, queue full | Circuit breaker + fallback |
| Input | Malformed request, invalid JSON, missing field | Validate + reject with details |
| Permission | Auth expired, insufficient privileges, rate limited | Re-auth or propagate 403/429 |

### Programmer Errors
Bugs in the code itself. These should never be "handled" -- they should be fixed.

| Type | Examples | Response |
|------|----------|----------|
| Type | Calling method on undefined, wrong argument type | Crash + fix code |
| Logic | Off-by-one, infinite loop, race condition | Crash + fix code |
| Contract | Violating API contract, missing required config | Crash + fix code |
| Assertion | Failed invariant, impossible state reached | Crash + fix code |

**Key rule:** Never retry programmer errors. Never add fallbacks for bugs. Fix them.

## Severity Levels

### Critical (Immediate action required)
- System is down or data integrity is at risk
- Revenue-impacting failure in production
- Security breach or credential exposure
- Escalation: Page on-call immediately
- Example: Database corruption, payment processing failure, auth bypass

### High (Action required within 1 hour)
- Major feature is broken for all users
- Dependency failure with no fallback
- Error rate exceeds 5% of requests
- Escalation: Alert team channel, assign owner
- Example: Search service down, email delivery failing, cache cluster unreachable

### Medium (Action required within 24 hours)
- Feature degraded but functional
- Fallback is active and handling load
- Error rate between 1-5% of requests
- Escalation: Create ticket, schedule fix
- Example: Slow query degrading response time, non-critical API returning stale data

### Low (Track and batch)
- Cosmetic or minor UX impact
- Single user affected, workaround exists
- Error rate below 1%
- Escalation: Log for weekly review
- Example: Tooltip not rendering, pagination off-by-one on edge case

## Classification Decision Tree

```
Error occurred
  |
  +-- Is this a bug in our code?
  |     YES -> Programmer Error -> Crash, log, fix
  |     NO  -> Operational Error
  |              |
  |              +-- Is the system usable?
  |              |     NO  -> Is data at risk?
  |              |     |       YES -> CRITICAL
  |              |     |       NO  -> HIGH
  |              |     YES -> Is a fallback active?
  |              |             YES -> MEDIUM
  |              |             NO  -> Is user impacted?
  |              |                     YES -> HIGH
  |              |                     NO  -> LOW
```

## Transient vs Persistent Classification

**Transient errors** resolve on their own. Retry is appropriate.
- Network timeout (server was momentarily busy)
- HTTP 429 (rate limit will reset)
- HTTP 503 (service restarting)
- Lock contention (other transaction will complete)

**Persistent errors** will not resolve without intervention. Do not retry.
- HTTP 400 (bad request won't become valid)
- HTTP 401/403 (credentials won't fix themselves)
- HTTP 404 (resource doesn't exist)
- Schema validation failure (data shape is wrong)
- Disk full (needs cleanup, not retries)

## Error Code Conventions

Use structured error codes for programmatic handling:

```
Format: DOMAIN.CATEGORY.SPECIFIC

Examples:
  AUTH.TOKEN.EXPIRED      -> Re-authenticate
  AUTH.TOKEN.INVALID      -> Reject, do not retry
  DB.CONNECTION.TIMEOUT   -> Retry with backoff
  DB.QUERY.SYNTAX         -> Programmer error, fix query
  API.RATE.EXCEEDED       -> Back off, respect Retry-After
  API.INPUT.VALIDATION    -> Return 400 with field details
  STORAGE.DISK.FULL       -> Alert ops, degrade gracefully
  QUEUE.PUBLISH.TIMEOUT   -> Retry, then dead-letter
```

## Classification Anti-Patterns

1. **Catch-all suppression**: `catch(e) {}` -- silently swallowing errors hides bugs
2. **Over-retrying**: Retrying 404s or validation errors wastes resources
3. **Wrong severity**: Logging a database outage as "warning" delays response
4. **Missing context**: Logging "error occurred" without the error object or stack trace
5. **Treating bugs as operational**: Adding retry logic around null pointer exceptions
