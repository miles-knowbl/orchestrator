# Logging Standards Reference

## Structured Logging Format

All logs MUST be structured JSON. Unstructured string logs are not searchable,
not parseable, and not useful at scale.

**Required fields in every log entry:**

```json
{
  "timestamp": "2025-01-15T14:32:01.123Z",
  "level": "error",
  "message": "Database connection timeout",
  "service": "user-api",
  "correlationId": "req-a1b2c3d4",
  "environment": "production"
}
```

**Additional fields for errors:** Include `error` object (name, message, code, stack)
and `context` object (relevant parameters like database name, attempt number, timeout).

## Log Level Guidelines

### FATAL
System cannot continue. Process will exit.
- Unrecoverable startup failure (missing required config, port in use)
- Data corruption detected
- **Action:** Pages on-call, process restarts

### ERROR
Operation failed. Requires attention but system continues.
- Dependency call failed after all retries exhausted
- Circuit breaker opened
- **Action:** Alert team channel, create incident if sustained

### WARN
Unexpected situation that the system handled. May indicate a growing problem.
- Fallback activated, retry attempt, approaching resource limits
- **Action:** Review in daily triage

### INFO
Normal operational events. The narrative of what the system is doing.
- Request completed (with duration), service started/stopped, job finished
- **Action:** None. Used for auditing and debugging.

### DEBUG
Detailed information for development and troubleshooting.
- SQL queries, HTTP bodies, cache hit/miss, state transitions
- **Action:** None. Disabled in production by default.

**Rule of thumb:** If you need to add a log to debug production, it should be
INFO or WARN, not DEBUG.

## Sensitive Data Handling

### Never log directly:
- Passwords, API keys, tokens, secrets
- Credit card numbers, SSNs, government IDs
- Full email addresses, phone numbers (GDPR contexts)
- Session tokens, JWTs (log a hash or last 4 chars)

### PII Redaction

```
// Before: NEVER do this
log.info({ email: user.email, token: authToken }, 'User authenticated');

// After: Redact sensitive fields
log.info({
  email: redact(user.email),        // "j***@example.com"
  tokenSuffix: authToken.slice(-4), // "...x7f2"
  userId: user.id                   // Use opaque ID instead
}, 'User authenticated');
```

### Credential Masking

Implement at the logger level, not at each call site:

```
const SENSITIVE_KEYS = [
  'password', 'secret', 'token', 'apiKey', 'authorization',
  'cookie', 'ssn', 'creditCard', 'cardNumber'
];
// Deep clone and replace sensitive values with '[REDACTED]'
// Applied automatically by the logger before serialization
```

## Correlation ID Propagation

Every request gets a correlation ID at the edge. It flows through every service call.

```
Client -> API Gateway -> Service A -> Service B -> Database
           |                |            |
           correlationId    correlationId correlationId
           (generated)      (propagated)  (propagated)
```

**Implementation rules:**
1. Generate at the edge: `X-Correlation-ID: ${uuid()}` if not present
2. Extract from incoming headers in every service
3. Include in all outgoing HTTP calls, queue messages, and log entries
4. Store in async context (AsyncLocalStorage in Node.js, Context in Go)
5. Return in response headers for client-side debugging

## Contextual Logging

Attach request context to every log within a request lifecycle:

```
const requestLogger = logger.child({
  correlationId: req.headers['x-correlation-id'],
  method: req.method,
  path: req.path,
  userId: req.auth?.userId
});
// All subsequent logs include the context automatically
requestLogger.info('Processing order');
```

## Log Retention and Rotation

| Environment | Retention | Rotation |
|-------------|-----------|----------|
| Development | 7 days | 100MB per file |
| Staging | 14 days | Daily |
| Production (INFO+) | 30 days hot, 90 days cold | Hourly |
| Production (ERROR+) | 90 days hot, 1 year cold | Daily |
| Audit logs | 7 years | Daily, immutable storage |

**Rotation rules:** Rotate on size (100MB) OR time (daily), whichever first.
Compress rotated files. Delete after retention period automatically.

## Anti-Patterns

1. **Log and throw**: Logging then re-throwing causes duplicate entries
2. **String concatenation**: `log('Error: ' + err)` loses structure and context
3. **Logging in loops**: Thousands of identical logs overwhelm aggregators
4. **Missing error object**: `log.error('Failed')` without the actual error
5. **Logging secrets**: Even at DEBUG level, secrets in logs are a security incident
