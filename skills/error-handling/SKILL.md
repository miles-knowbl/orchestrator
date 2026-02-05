---
name: error-handling
description: "Implement robust error handling strategies for applications. Covers error classification, custom error hierarchies, propagation patterns, recovery mechanisms (retry, fallback, circuit breaker, bulkhead), logging and observability, user-facing messages, and boundary error handling across API, UI, and background job layers."
phase: IMPLEMENT
category: engineering
version: "2.0.0"
depends_on: ["implement"]
tags: [implementation, quality, patterns, reliability]
---

# Error Handling

Implement robust error handling strategies that keep systems reliable and debuggable.

## When to Use

- **Implementing a new service or feature** -- needs error classification, propagation, and recovery from the start
- **Adding external integrations** -- API calls, databases, message queues require retry, timeout, and fallback logic
- **Hardening existing code** -- swallowed errors, missing context, or silent failures need systematic remediation
- **Building user-facing flows** -- error messages must be safe, helpful, and actionable without leaking internals
- **Designing distributed systems** -- cross-service errors need correlation IDs, circuit breakers, and bulkheads
- **After a production incident** -- post-mortem reveals gaps in error handling, logging, or alerting
- When you say: "handle errors properly", "add error handling", "make this resilient", "improve reliability"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `error-classification.md` | Operational vs programmer error taxonomy and severity levels |
| `recovery-strategies.md` | Retry, fallback, circuit breaker, and bulkhead patterns with decision trees |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `logging-standards.md` | When establishing structured logging and log levels for errors |
| `retry-patterns.md` | When implementing retry with exponential backoff, jitter, and idempotency |
| `circuit-breaker-patterns.md` | When protecting services from cascading failures via circuit breakers and bulkheads |

**Verification:** Ensure every public function has explicit error handling, custom errors carry classification and context, and recovery strategies are documented for each failure mode.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Custom error hierarchy | `src/errors/` or `src/common/errors.ts` | Always |
| Error handling middleware | `src/middleware/errorHandler.ts` | When building an API |
| Recovery configuration | `src/config/resilience.ts` | When using retry, circuit breaker, or fallback |
| Error boundary components | `src/components/ErrorBoundary.tsx` | When building a UI |
| Error logging integration | `src/lib/logger.ts` | Always |

## Core Concept

Error handling answers: **"What happens when things go wrong?"**

Robust error handling is:
- **Classified** -- every error has a type, severity, and whether it is operational or a programmer bug
- **Contextual** -- errors carry enough information to diagnose root cause without reproducing
- **Recoverable** -- transient failures are retried, degraded paths exist, blast radius is contained
- **Observable** -- errors are logged with structured data, correlated across services, and alerted on
- **User-respectful** -- users see helpful guidance, never stack traces or internal codes

Error handling is NOT:
- Swallowing exceptions silently
- Logging everything at ERROR level regardless of severity
- Wrapping every line in try/catch without a strategy
- Showing raw error messages to end users
- Treating all failures identically (retry everything, fail on everything)

## The Error Handling Process

```
+-------------------------------------------------------------+
|               ERROR HANDLING PROCESS                         |
|                                                              |
|  1. CLASSIFY ERRORS                                          |
|     +-> Operational vs programmer? Transient vs permanent?   |
|                                                              |
|  2. DEFINE ERROR HIERARCHY                                   |
|     +-> Base error class, domain errors, infrastructure      |
|                                                              |
|  3. DESIGN PROPAGATION STRATEGY                              |
|     +-> Where to catch, wrap, rethrow, or transform?         |
|                                                              |
|  4. IMPLEMENT RECOVERY PATTERNS                              |
|     +-> Retry, fallback, circuit breaker, bulkhead           |
|                                                              |
|  5. ADD LOGGING & OBSERVABILITY                              |
|     +-> Structured logs, correlation IDs, metrics, alerts    |
|                                                              |
|  6. CRAFT USER-FACING MESSAGES                               |
|     +-> Safe, helpful, actionable -- no internals leaked     |
|                                                              |
|  7. HANDLE BOUNDARY ERRORS                                   |
|     +-> API responses, UI boundaries, background job DLQs    |
+-------------------------------------------------------------+
```

## Step 1: Classify Errors

Every error falls into one of two fundamental categories. This classification determines how you handle it.

### Operational vs Programmer Errors

| Aspect | Operational Error | Programmer Error |
|--------|-------------------|------------------|
| **Cause** | External conditions the program cannot prevent | Bugs in the code itself |
| **Examples** | Network timeout, disk full, invalid user input, service unavailable | Null reference, type error, index out of bounds, assertion failure |
| **Expected?** | Yes -- these will happen in production | No -- these indicate defects |
| **Recovery** | Retry, fallback, degrade, report to user | Crash fast, fix the code, deploy a patch |
| **Logging** | WARN or ERROR depending on impact | ERROR or FATAL -- always investigate |
| **User message** | Helpful guidance ("Try again", "Contact support") | Generic ("Something went wrong") |

### Transient vs Permanent Classification

| Type | Description | Action |
|------|-------------|--------|
| **Transient** | Temporary failure that may succeed on retry | Retry with backoff |
| **Permanent** | Condition that will not change without intervention | Fail immediately, notify |
| **Indeterminate** | Cannot determine if transient or permanent | Retry with limited attempts, then escalate |

### Severity Levels

```typescript
enum ErrorSeverity {
  /** Informational -- operation degraded but succeeded via fallback */
  LOW = 'low',
  /** Warning -- operation failed but system is healthy, user can retry */
  MEDIUM = 'medium',
  /** Error -- operation failed, feature unavailable, needs attention */
  HIGH = 'high',
  /** Critical -- system health impacted, cascading risk, page immediately */
  CRITICAL = 'critical',
}
```

### Classification Decision Tree

```
Is the error caused by a bug in our code?
+-- Yes -> PROGRAMMER ERROR -> crash fast, log FATAL, fix code
+-- No -> OPERATIONAL ERROR
             |
             Is the error transient?
             +-- Yes -> TRANSIENT OPERATIONAL
             |          Retry with backoff (see Step 4)
             +-- No -> PERMANENT OPERATIONAL
             |          Fail, notify user, log for investigation
             +-- Unknown -> INDETERMINATE
                            Limited retry, then escalate
```

## Step 2: Define Error Hierarchy

Build a custom error hierarchy that carries classification, context, and operational metadata.

### Base Error Class

```typescript
// src/errors/AppError.ts

export interface ErrorContext {
  [key: string]: unknown;
}

export abstract class AppError extends Error {
  /** Machine-readable error code (e.g., 'PAYMENT_FAILED', 'USER_NOT_FOUND') */
  abstract readonly code: string;

  /** HTTP status code for API responses */
  abstract readonly statusCode: number;

  /** Is this an operational error (expected) vs a programmer error (bug)? */
  abstract readonly isOperational: boolean;

  /** Severity level for logging and alerting */
  readonly severity: ErrorSeverity;

  /** Structured context for debugging -- never exposed to users */
  readonly context: ErrorContext;

  /** Correlation ID for distributed tracing */
  readonly correlationId?: string;

  /** Original error that caused this one */
  readonly cause?: Error;

  constructor(
    message: string,
    options: {
      severity?: ErrorSeverity;
      context?: ErrorContext;
      correlationId?: string;
      cause?: Error;
    } = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.severity = options.severity ?? ErrorSeverity.MEDIUM;
    this.context = options.context ?? {};
    this.correlationId = options.correlationId;
    this.cause = options.cause;

    // Capture proper stack trace (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /** Serialize for logging -- includes all diagnostic data */
  toLogObject(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      isOperational: this.isOperational,
      statusCode: this.statusCode,
      context: this.context,
      correlationId: this.correlationId,
      cause: this.cause?.message,
      stack: this.stack,
    };
  }

  /** Serialize for API responses -- safe for external consumption */
  toApiResponse(): { error: { code: string; message: string } } {
    return {
      error: {
        code: this.code,
        message: this.isOperational ? this.message : 'An unexpected error occurred',
      },
    };
  }
}
```

### Domain Error Classes

```typescript
// src/errors/domain.ts

/** Validation errors -- bad user input, schema violations */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string[]> = {},
    options?: { context?: ErrorContext; correlationId?: string },
  ) {
    super(message, { severity: ErrorSeverity.LOW, ...options });
  }

  toApiResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
        fields: this.fieldErrors,
      },
    };
  }
}

/** Resource not found */
export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(resource: string, identifier: string, options?: { correlationId?: string }) {
    super(`${resource} not found: ${identifier}`, {
      severity: ErrorSeverity.LOW,
      context: { resource, identifier },
      ...options,
    });
  }
}

/** Authorization / permission denied */
export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;
  readonly isOperational = true;

  constructor(message = 'You do not have permission to perform this action', options?: { context?: ErrorContext }) {
    super(message, { severity: ErrorSeverity.MEDIUM, ...options });
  }
}

/** Business rule violation */
export class BusinessRuleError extends AppError {
  readonly code: string;
  readonly statusCode = 422;
  readonly isOperational = true;

  constructor(
    code: string,
    message: string,
    options?: { context?: ErrorContext; correlationId?: string },
  ) {
    super(message, { severity: ErrorSeverity.MEDIUM, ...options });
    this.code = code;
  }
}

/** Conflict -- duplicate, stale data, optimistic lock failure */
export class ConflictError extends AppError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message: string, options?: { context?: ErrorContext }) {
    super(message, { severity: ErrorSeverity.MEDIUM, ...options });
  }
}
```

### Infrastructure Error Classes

```typescript
// src/errors/infrastructure.ts

/** External service failure -- API call, database, message queue */
export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;
  readonly isOperational = true;

  constructor(
    public readonly serviceName: string,
    message: string,
    options?: { cause?: Error; context?: ErrorContext; correlationId?: string },
  ) {
    super(message, { severity: ErrorSeverity.HIGH, ...options });
  }
}

/** Timeout -- operation exceeded time limit */
export class TimeoutError extends AppError {
  readonly code = 'TIMEOUT';
  readonly statusCode = 504;
  readonly isOperational = true;

  constructor(
    operation: string,
    timeoutMs: number,
    options?: { cause?: Error; correlationId?: string },
  ) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, {
      severity: ErrorSeverity.HIGH,
      context: { operation, timeoutMs },
      ...options,
    });
  }
}

/** Rate limited -- too many requests to external resource */
export class RateLimitError extends AppError {
  readonly code = 'RATE_LIMITED';
  readonly statusCode = 429;
  readonly isOperational = true;

  constructor(
    public readonly retryAfterMs: number,
    options?: { context?: ErrorContext },
  ) {
    super(`Rate limited. Retry after ${retryAfterMs}ms`, {
      severity: ErrorSeverity.MEDIUM,
      context: { retryAfterMs },
      ...options,
    });
  }
}

/** Internal / programmer error -- should never reach the user */
export class InternalError extends AppError {
  readonly code = 'INTERNAL_ERROR';
  readonly statusCode = 500;
  readonly isOperational = false;

  constructor(message: string, options?: { cause?: Error; context?: ErrorContext }) {
    super(message, { severity: ErrorSeverity.CRITICAL, ...options });
  }
}
```

### Hierarchy Checklist

```markdown
- [ ] Base AppError class with code, statusCode, isOperational, severity, context
- [ ] toLogObject() for structured logging (includes all diagnostic data)
- [ ] toApiResponse() for safe external serialization (no internals leaked)
- [ ] Domain errors: ValidationError, NotFoundError, ForbiddenError, BusinessRuleError, ConflictError
- [ ] Infrastructure errors: ExternalServiceError, TimeoutError, RateLimitError, InternalError
- [ ] All errors carry correlationId for distributed tracing
- [ ] All errors preserve cause chain for root cause analysis
- [ ] Error codes are UPPER_SNAKE_CASE strings, stable across versions
```

## Step 3: Design Propagation Strategy

Error propagation determines where errors are caught, where they are transformed, and where they surface.

### The Propagation Principle

```
+-------------------------------------------------------------+
|               ERROR PROPAGATION LAYERS                       |
|                                                              |
|   Layer          Action            Why                       |
|   ------         ------            ---                       |
|   Origin         Throw with        Accurate context          |
|                  full context      at point of failure        |
|                                                              |
|   Service        Catch + wrap      Add business context,     |
|                  if crossing       translate infrastructure   |
|                  boundary          errors into domain errors  |
|                                                              |
|   Controller/    Catch + format    Transform into API         |
|   Handler        for consumer      response or UI state       |
|                                                              |
|   Global         Catch-all         Safety net for             |
|   Handler        for uncaught      unhandled errors           |
+-------------------------------------------------------------+
```

### Rules of Propagation

| Rule | Description |
|------|-------------|
| **Catch at the right level** | Catch where you can do something useful -- recover, translate, or report |
| **Never swallow silently** | Every catch block must log, rethrow, or return an error value |
| **Wrap at boundaries** | When crossing a layer boundary, wrap with context from the new layer |
| **Preserve the cause chain** | Always pass the original error as `cause` when wrapping |
| **Transform, do not expose** | Infrastructure errors become domain errors at the service boundary |
| **Let programmer errors crash** | Programmer errors should propagate to the global handler and crash/restart |

### Propagation in Practice

```typescript
// ORIGIN: Repository throws with infrastructure context
class OrderRepository {
  async findById(id: string): Promise<Order | null> {
    try {
      return await db.selectFrom('orders').where('id', '=', id).executeTakeFirst();
    } catch (error) {
      throw new ExternalServiceError('database', `Failed to fetch order ${id}`, {
        cause: error as Error,
        context: { orderId: id, operation: 'findById' },
      });
    }
  }
}

// SERVICE: Wraps infrastructure error into domain context
class OrderService {
  async getOrder(id: string, requestingUserId: string): Promise<Order> {
    const order = await this.orderRepo.findById(id);
    // ExternalServiceError from repo propagates up -- intentional

    if (!order) {
      throw new NotFoundError('Order', id);
    }

    if (order.userId !== requestingUserId) {
      throw new ForbiddenError('You can only view your own orders', {
        context: { orderId: id, requestingUserId },
      });
    }

    return order;
  }
}

// CONTROLLER: Formats for API consumer
class OrderController {
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.getOrder(req.params.id, req.user.id);
      res.json({ data: order });
    } catch (error) {
      next(error); // Delegate to global error handler
    }
  };
}

// GLOBAL HANDLER: Safety net (see Step 7: Boundary Error Handling)
```

### Anti-Patterns to Avoid

```typescript
// ANTI-PATTERN 1: Swallowing errors
try {
  await sendEmail(user.email);
} catch (error) {
  // Silently ignored -- email failures are invisible
}

// FIX: Log even if not rethrowing
try {
  await sendEmail(user.email);
} catch (error) {
  logger.warn('Email send failed', { email: user.email, error: (error as Error).message });
  // Intentionally not rethrowing -- email is non-critical
}

// ANTI-PATTERN 2: Losing context
try {
  await externalApi.call(payload);
} catch (error) {
  throw new Error('API call failed'); // Original error lost
}

// FIX: Preserve cause chain
try {
  await externalApi.call(payload);
} catch (error) {
  throw new ExternalServiceError('payment-api', 'Payment processing failed', {
    cause: error as Error,
    context: { payload },
  });
}

// ANTI-PATTERN 3: Catching too broadly
try {
  const data = JSON.parse(untrustedInput); // Could throw SyntaxError
  const result = processData(data);          // Could throw BusinessRuleError
  await saveResult(result);                  // Could throw ExternalServiceError
} catch (error) {
  // Which operation failed? Cannot tell.
  res.status(500).json({ error: 'Something went wrong' });
}

// FIX: Granular try/catch or let errors propagate to appropriate handler
```

## Step 4: Implement Recovery Patterns

Recovery patterns turn transient failures into successful operations and contain blast radius for permanent failures.

### Pattern Selection Guide

| Situation | Pattern | When |
|-----------|---------|------|
| Transient external failure | **Retry with backoff** | Network blip, temporary overload |
| Repeated failures to same service | **Circuit breaker** | Downstream service degraded |
| Primary path unavailable | **Fallback** | Cache stale data, use default, degrade feature |
| Protecting shared resources | **Bulkhead** | Isolate failures to prevent cascade |
| Nonessential operation | **Fire and forget** | Analytics, logging, notifications |
| Long-running operation | **Timeout** | Prevent indefinite blocking |

### Retry with Exponential Backoff

```typescript
// src/lib/retry.ts

export interface RetryOptions {
  /** Maximum number of attempts (including the first) */
  maxAttempts: number;
  /** Base delay in milliseconds */
  baseDelayMs: number;
  /** Maximum delay cap in milliseconds */
  maxDelayMs: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Add random jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
  /** Predicate to decide if the error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Called before each retry with attempt number and delay */
  onRetry?: (attempt: number, delayMs: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const {
    maxAttempts,
    baseDelayMs,
    maxDelayMs,
    backoffMultiplier = 2,
    jitter = true,
    isRetryable = () => true,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !isRetryable(lastError)) {
        throw lastError;
      }

      // Exponential backoff: baseDelay * multiplier^(attempt-1)
      let delay = Math.min(
        baseDelayMs * Math.pow(backoffMultiplier, attempt - 1),
        maxDelayMs,
      );

      // Add jitter: randomize between 0 and computed delay
      if (jitter) {
        delay = Math.floor(Math.random() * delay);
      }

      onRetry?.(attempt, delay, lastError);
      await sleep(delay);
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Usage
const result = await withRetry(
  () => paymentApi.charge(userId, amountCents),
  {
    maxAttempts: 3,
    baseDelayMs: 500,
    maxDelayMs: 5000,
    isRetryable: (error) =>
      error instanceof ExternalServiceError ||
      error instanceof TimeoutError,
    onRetry: (attempt, delay, error) => {
      logger.warn('Retrying payment charge', { attempt, delay, error: error.message });
    },
  },
);
```

### Circuit Breaker

```typescript
// src/lib/circuitBreaker.ts

enum CircuitState {
  CLOSED = 'closed',       // Normal operation -- requests pass through
  OPEN = 'open',           // Failing -- requests rejected immediately
  HALF_OPEN = 'half_open', // Testing -- single request allowed to probe
}

export interface CircuitBreakerOptions {
  /** Number of failures before opening the circuit */
  failureThreshold: number;
  /** Time in ms to wait before moving from OPEN to HALF_OPEN */
  resetTimeoutMs: number;
  /** Number of successes in HALF_OPEN before closing */
  successThreshold: number;
  /** Name for logging and metrics */
  name: string;
  /** Predicate to classify which errors count as failures */
  isFailure?: (error: Error) => boolean;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;

  constructor(private readonly options: CircuitBreakerOptions) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        logger.info(`Circuit ${this.options.name}: OPEN -> HALF_OPEN`);
      } else {
        throw new ExternalServiceError(
          this.options.name,
          `Circuit breaker is open for ${this.options.name}`,
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      const shouldCountFailure = this.options.isFailure?.(error as Error) ?? true;
      if (shouldCountFailure) {
        this.onFailure();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        logger.info(`Circuit ${this.options.name}: HALF_OPEN -> CLOSED`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (
      this.failureCount >= this.options.failureThreshold ||
      this.state === CircuitState.HALF_OPEN
    ) {
      this.state = CircuitState.OPEN;
      logger.warn(`Circuit ${this.options.name}: -> OPEN after ${this.failureCount} failures`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Usage
const paymentCircuit = new CircuitBreaker({
  name: 'payment-service',
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
  successThreshold: 2,
  isFailure: (error) => error instanceof ExternalServiceError,
});

const result = await paymentCircuit.execute(() => paymentApi.charge(userId, amount));
```

### Fallback Pattern

```typescript
// src/lib/fallback.ts

export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  options?: { onFallback?: (error: Error) => void },
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    options?.onFallback?.(error as Error);
    return await fallback();
  }
}

// Usage: Cache fallback when API is down
const products = await withFallback(
  () => productApi.listFeatured(),
  () => cache.get<Product[]>('featured-products') ?? [],
  {
    onFallback: (error) => {
      logger.warn('Product API unavailable, serving cached data', {
        error: error.message,
      });
    },
  },
);
```

### Bulkhead Pattern

```typescript
// src/lib/bulkhead.ts

export class Bulkhead {
  private activeCount = 0;
  private queue: Array<{ resolve: () => void; reject: (err: Error) => void }> = [];

  constructor(
    private readonly maxConcurrent: number,
    private readonly maxQueue: number,
    private readonly name: string,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.maxConcurrent) {
      if (this.queue.length >= this.maxQueue) {
        throw new ExternalServiceError(
          this.name,
          `Bulkhead ${this.name} at capacity: ${this.maxConcurrent} active, ${this.maxQueue} queued`,
        );
      }
      await new Promise<void>((resolve, reject) => {
        this.queue.push({ resolve, reject });
      });
    }

    this.activeCount++;
    try {
      return await fn();
    } finally {
      this.activeCount--;
      const next = this.queue.shift();
      if (next) next.resolve();
    }
  }
}

// Usage: Isolate payment processing from order queries
const paymentBulkhead = new Bulkhead(10, 50, 'payment');
const orderQueryBulkhead = new Bulkhead(50, 200, 'order-query');
```

### Recovery Checklist

```markdown
- [ ] Every external call has a timeout configured
- [ ] Transient failures use retry with exponential backoff and jitter
- [ ] Retry logic has maxAttempts cap (never retry indefinitely)
- [ ] Only retryable errors trigger retry (validation errors do not)
- [ ] Critical external services use circuit breakers
- [ ] Fallback paths exist for non-critical features
- [ ] Shared resources are protected by bulkheads
- [ ] Recovery events are logged for observability
```

## Step 5: Add Logging and Observability

Errors that are not logged are invisible. Errors without context are useless.

### Structured Error Logging

```typescript
// src/lib/logger.ts

interface LogContext {
  correlationId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  [key: string]: unknown;
}

class Logger {
  error(message: string, error: Error, context?: LogContext): void {
    const logEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof AppError ? error.toLogObject() : {}),
      },
      ...context,
    };
    console.error(JSON.stringify(logEntry));
  }

  warn(message: string, context?: LogContext): void {
    const logEntry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    };
    console.warn(JSON.stringify(logEntry));
  }

  info(message: string, context?: LogContext): void {
    const logEntry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    };
    console.info(JSON.stringify(logEntry));
  }
}

export const logger = new Logger();
```

### Log Level Guidelines

| Level | When | Example |
|-------|------|---------|
| **DEBUG** | Diagnostic detail for development | "Retrying request, attempt 2 of 3" |
| **INFO** | Normal operational events | "Order created", "Payment processed" |
| **WARN** | Recoverable issues, degraded operation | "Using cached data, API unavailable" |
| **ERROR** | Operation failed, needs attention | "Payment charge failed after 3 retries" |
| **FATAL** | System cannot continue | "Database connection pool exhausted" |

### Correlation IDs

```typescript
// src/middleware/correlationId.ts
import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

const correlationStorage = new AsyncLocalStorage<string>();

export function correlationMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const correlationId = (req.headers['x-correlation-id'] as string) ?? randomUUID();
  req.correlationId = correlationId;
  correlationStorage.run(correlationId, () => next());
}

export function getCorrelationId(): string | undefined {
  return correlationStorage.getStore();
}

// Attach to outgoing requests
export function withCorrelation(headers: Record<string, string>): Record<string, string> {
  const id = getCorrelationId();
  return id ? { ...headers, 'x-correlation-id': id } : headers;
}
```

### Error Metrics

Track these metrics for alerting and dashboards:

| Metric | Type | Purpose |
|--------|------|---------|
| `error_total{code, severity}` | Counter | Total errors by type |
| `error_rate_5m{service}` | Gauge | Error rate over 5-minute window |
| `circuit_breaker_state{name}` | Gauge | Current state (0=closed, 1=half_open, 2=open) |
| `retry_total{operation, outcome}` | Counter | Retry attempts and outcomes |
| `recovery_fallback_total{name}` | Counter | How often fallback paths are used |

### Observability Checklist

```markdown
- [ ] All errors logged with structured JSON
- [ ] Correlation IDs flow through all service calls
- [ ] Log levels match severity (not everything is ERROR)
- [ ] Sensitive data (passwords, tokens, PII) stripped from logs
- [ ] Error metrics exported for dashboards and alerting
- [ ] Alert thresholds defined for error rate spikes
- [ ] Circuit breaker state changes logged
- [ ] Retry attempts and outcomes logged
```

## Step 6: Craft User-Facing Messages

Users deserve helpful error messages. Internal details must never leak.

### Message Guidelines

| Principle | Bad | Good |
|-----------|-----|------|
| **Be specific** | "An error occurred" | "We could not process your payment" |
| **Be actionable** | "Error 500" | "Please try again in a few minutes" |
| **No internals** | "NullReferenceException at line 42" | "Something went wrong on our end" |
| **No blame** | "You entered an invalid email" | "Please enter a valid email address" |
| **Suggest next steps** | "Payment failed" | "Payment failed. Please check your card details or try a different payment method." |

### Error Message Map

```typescript
// src/errors/userMessages.ts

const USER_MESSAGES: Record<string, { title: string; message: string; action?: string }> = {
  VALIDATION_ERROR: {
    title: 'Invalid input',
    message: 'Please check the highlighted fields and try again.',
  },
  NOT_FOUND: {
    title: 'Not found',
    message: 'The item you are looking for does not exist or has been removed.',
  },
  FORBIDDEN: {
    title: 'Access denied',
    message: 'You do not have permission to perform this action.',
    action: 'Contact your administrator if you believe this is an error.',
  },
  PAYMENT_FAILED: {
    title: 'Payment failed',
    message: 'We could not process your payment.',
    action: 'Please check your card details or try a different payment method.',
  },
  RATE_LIMITED: {
    title: 'Too many requests',
    message: 'You are making requests too quickly.',
    action: 'Please wait a moment and try again.',
  },
  EXTERNAL_SERVICE_ERROR: {
    title: 'Service temporarily unavailable',
    message: 'One of our services is experiencing issues.',
    action: 'Please try again in a few minutes.',
  },
  TIMEOUT: {
    title: 'Request timed out',
    message: 'The operation took too long to complete.',
    action: 'Please try again. If the problem persists, contact support.',
  },
  INTERNAL_ERROR: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred on our end.',
    action: 'Please try again. If the problem persists, contact support.',
  },
};

export function getUserMessage(code: string): { title: string; message: string; action?: string } {
  return USER_MESSAGES[code] ?? USER_MESSAGES['INTERNAL_ERROR'];
}
```

### API Error Response Format

```typescript
// Standard error response shape
interface ApiErrorResponse {
  error: {
    code: string;            // Machine-readable: 'VALIDATION_ERROR'
    message: string;         // User-safe message
    action?: string;         // Suggested next step
    fields?: Record<string, string[]>;  // Field-level validation errors
    requestId?: string;      // Correlation ID for support reference
  };
}

// Example response:
// HTTP 422
// {
//   "error": {
//     "code": "VALIDATION_ERROR",
//     "message": "Please check the highlighted fields and try again.",
//     "fields": {
//       "email": ["Must be a valid email address"],
//       "quantity": ["Must be between 1 and 9999"]
//     },
//     "requestId": "req_abc123"
//   }
// }
```

## Step 7: Handle Boundary Errors

Each system boundary (API, UI, background jobs) needs its own error handling strategy.

### API Error Middleware

```typescript
// src/middleware/errorHandler.ts

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. Log the error
  const correlationId = req.correlationId ?? 'unknown';

  if (error instanceof AppError) {
    const logLevel = error.isOperational ? 'warn' : 'error';
    logger[logLevel]('Request error', error, {
      correlationId,
      method: req.method,
      path: req.path,
      userId: req.user?.id,
    });

    // 2. Send appropriate response
    const userMessage = getUserMessage(error.code);
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: userMessage.message,
        action: userMessage.action,
        ...(error instanceof ValidationError ? { fields: error.fieldErrors } : {}),
        requestId: correlationId,
      },
    });
  } else {
    // Unclassified error -- treat as programmer error
    logger.error('Unhandled error', error, {
      correlationId,
      method: req.method,
      path: req.path,
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred on our end.',
        action: 'Please try again. If the problem persists, contact support.',
        requestId: correlationId,
      },
    });
  }
}

// Register as the LAST middleware
app.use(errorHandler);
```

### Process-Level Error Handlers

```typescript
// src/bootstrap.ts

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection', reason as Error, {
    type: 'unhandledRejection',
  });
  // In production: trigger graceful shutdown
  // process.exit(1);
});

// Catch uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', error, {
    type: 'uncaughtException',
  });
  // MUST exit -- process is in undefined state
  process.exit(1);
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, starting graceful shutdown');
  // Close server, drain connections, flush logs
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  // Force exit after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout', new Error('Shutdown timeout'));
    process.exit(1);
  }, 30_000);
});
```

### UI Error Boundaries (React)

```typescript
// src/components/ErrorBoundary.tsx
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to error tracking service
    logger.error('React error boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    });
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.reset);
      }
      return this.props.fallback ?? <DefaultErrorFallback error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div role="alert" className="error-fallback">
      <h2>Something went wrong</h2>
      <p>We are sorry for the inconvenience. Please try again.</p>
      <button onClick={onRetry}>Try again</button>
    </div>
  );
}

// Usage: Wrap at feature boundaries, not just the app root
// <ErrorBoundary fallback={<CheckoutErrorView />}>
//   <CheckoutFlow />
// </ErrorBoundary>
```

### Background Job Error Handling

```typescript
// src/jobs/baseJob.ts

export abstract class BaseJob<T> {
  abstract readonly name: string;
  abstract readonly maxRetries: number;

  async run(payload: T, attempt: number): Promise<void> {
    try {
      await this.execute(payload);
    } catch (error) {
      const appError = error instanceof AppError
        ? error
        : new InternalError('Job execution failed', { cause: error as Error });

      logger.error(`Job ${this.name} failed`, appError, {
        attempt,
        maxRetries: this.maxRetries,
        payload: this.sanitizePayload(payload),
      });

      if (attempt < this.maxRetries && this.isRetryable(appError)) {
        // Re-enqueue with backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 60_000);
        await this.enqueue(payload, attempt + 1, delay);
        logger.info(`Job ${this.name} re-enqueued`, { attempt: attempt + 1, delay });
      } else {
        // Send to dead letter queue for manual investigation
        await this.sendToDeadLetterQueue(payload, appError, attempt);
        logger.error(`Job ${this.name} sent to DLQ after ${attempt} attempts`, appError);
      }
    }
  }

  protected abstract execute(payload: T): Promise<void>;
  protected abstract enqueue(payload: T, attempt: number, delayMs: number): Promise<void>;
  protected abstract sendToDeadLetterQueue(payload: T, error: AppError, attempts: number): Promise<void>;

  protected isRetryable(error: AppError): boolean {
    return error.isOperational;
  }

  protected sanitizePayload(payload: T): unknown {
    return payload; // Override to strip sensitive fields
  }
}
```

## Output Formats

### Quick Format (Single Feature)

```markdown
## Error Handling: [Feature Name]

### Error Classification
| Error Code | Type | Transient? | Recovery |
|------------|------|------------|----------|
| [CODE] | operational/programmer | yes/no | retry/fallback/fail |

### Custom Errors Added
- `[ErrorClass]` -- [when thrown]

### Recovery Strategy
- [Pattern used and configuration]

### User Messages
| Code | Message | Action |
|------|---------|--------|
| [CODE] | [message] | [action] |
```

### Full Format (System-Wide)

```markdown
## Error Handling Strategy: [System Name]

### Error Hierarchy
[Class diagram or list of all custom errors]

### Error Classification Matrix
[Complete table of all error codes, types, severities, and recovery strategies]

### Recovery Configuration
[Retry policies, circuit breaker settings, fallback chains]

### Boundary Handlers
- **API**: [middleware description]
- **UI**: [error boundary strategy]
- **Jobs**: [retry and DLQ strategy]

### Logging & Observability
- [Structured logging format]
- [Correlation ID flow]
- [Metrics and alerting thresholds]

### User Message Catalog
[Complete mapping of error codes to user-safe messages]

### Testing Strategy
[How error handling is tested -- fault injection, chaos testing]
```

## Common Patterns

### Pattern 1: API Error Handling

Standard pattern for REST API error handling with middleware, validation, and consistent response format.

```typescript
// Validation at API boundary
app.post('/orders', validate(createOrderSchema), async (req, res, next) => {
  try {
    const order = await orderService.create(req.body);
    res.status(201).json({ data: order });
  } catch (error) {
    next(error); // Global error handler formats response
  }
});

// Global handler produces consistent error responses
// See Step 7: API Error Middleware
```

**Key elements:** Input validation at boundary, try/catch delegates to global handler, consistent JSON error shape, correlation IDs in every response.

### Pattern 2: Background Job Errors

Jobs need retry with backoff, dead letter queues, and idempotency guarantees.

```typescript
// Idempotent job execution
async execute(payload: { orderId: string }): Promise<void> {
  const lock = await this.acquireLock(`process-order:${payload.orderId}`);
  if (!lock) {
    logger.info('Job already processing, skipping', { orderId: payload.orderId });
    return; // Idempotent -- safe to skip
  }
  try {
    await this.processOrder(payload.orderId);
  } finally {
    await this.releaseLock(lock);
  }
}
```

**Key elements:** Idempotency via distributed locks, exponential backoff between retries, dead letter queue after max attempts, sanitized payload logging.

### Pattern 3: UI Error Boundaries

Isolate errors to feature boundaries so one broken component does not crash the entire page.

```typescript
// Feature-level isolation
<Layout>
  <ErrorBoundary fallback={<NavError />}>
    <Navigation />
  </ErrorBoundary>

  <ErrorBoundary fallback={<ContentError onRetry={refetch} />}>
    <MainContent />
  </ErrorBoundary>

  <ErrorBoundary fallback={<SidebarFallback />}>
    <Sidebar />
  </ErrorBoundary>
</Layout>
```

**Key elements:** Boundaries at feature level (not just app root), meaningful fallback UI per boundary, retry mechanism, error logging to tracking service.

### Pattern 4: Distributed System Errors

Cross-service errors need correlation, circuit breakers, and graceful degradation.

```typescript
// Composed resilience: circuit breaker + retry + fallback + timeout
async function getProductRecommendations(userId: string): Promise<Product[]> {
  return withFallback(
    () => recommendationCircuit.execute(
      () => withRetry(
        () => withTimeout(
          () => recommendationApi.getForUser(userId),
          { timeoutMs: 2000, operation: 'get-recommendations' },
        ),
        {
          maxAttempts: 2,
          baseDelayMs: 200,
          maxDelayMs: 1000,
          isRetryable: (e) => e instanceof TimeoutError || e instanceof ExternalServiceError,
        },
      ),
    ),
    () => cache.get<Product[]>(`recommendations:${userId}`) ?? [],
    {
      onFallback: (error) => {
        logger.warn('Recommendations unavailable, serving cached', {
          userId,
          error: error.message,
          correlationId: getCorrelationId(),
        });
      },
    },
  );
}
```

**Key elements:** Timeout wraps the innermost call, retry wraps timeout, circuit breaker wraps retry, fallback wraps everything. Correlation ID flows through all layers. Degraded experience is better than no experience.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `implement` | Error handling is integral to implementation -- every service needs classified errors, propagation strategy, and recovery |
| `code-verification` | Verification confirms error handling exists at all boundaries and follows the defined hierarchy |
| `test-generation` | Tests must cover every error path -- happy path is not enough without error case coverage |
| `deploy` | Deployment must configure monitoring, alerting thresholds, and circuit breaker settings per environment |

## Key Principles

**Classify before you catch.** Know whether an error is operational or a bug, transient or permanent. The classification determines the handling strategy.

**Errors are data, not just strings.** Every error should carry a code, severity, context, and correlation ID. Strings alone cannot drive automated recovery or alerting.

**Recover where possible, fail fast where necessary.** Transient failures deserve retry and fallback. Programmer errors should crash the process -- do not mask bugs with catch blocks.

**Never swallow, never expose.** Every catch block must either recover, log and rethrow, or report to the user. But never expose stack traces, internal codes, or infrastructure details to end users.

**Contain the blast radius.** Use circuit breakers, bulkheads, and error boundaries to prevent one failure from cascading across the system. A broken recommendation engine should not prevent checkout.

**Observe everything.** Errors without structured logging, correlation IDs, and metrics are invisible. You cannot fix what you cannot see.

## References

- `references/error-classification.md`: Operational vs programmer error taxonomy, severity levels, and classification decision trees
- `references/recovery-strategies.md`: Retry, fallback, circuit breaker, and bulkhead patterns with configuration guidance
- `references/logging-standards.md`: Structured logging format, log levels, sensitive data handling, and correlation ID propagation
- `references/retry-patterns.md`: Exponential backoff with jitter, idempotency requirements, and retry budget management
- `references/circuit-breaker-patterns.md`: Circuit breaker state machine, configuration tuning, and bulkhead isolation strategies
