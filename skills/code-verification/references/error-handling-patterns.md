# Error Handling Patterns

Patterns that indicate missing or improper error handling. These cause silent failures, data corruption, and difficult-to-debug production issues.

## Why This Matters

AI code generators focus on the happy path. They write code that works when everything goes right, but production is where everything goes wrong. A function without error handling is a function waiting to fail silently.

Your job: Ensure every failure path is handled.

## Detection Patterns

### Pattern 1: Unhandled Promise Rejection

**Anti-pattern:**
```javascript
// VULNERABLE - no catch, no await in try
async function processUser(id) {
  const user = await fetchUser(id);  // What if this fails?
  await updateStats(user);
  return user;
}

// Worse - fire and forget
function handleClick() {
  submitData();  // Promise ignored entirely
}
```

**Detection signal:** 
- `async` function without try/catch around await
- Promise-returning function call without `.catch()` or `await` in try block
- Calling async function without `await`

**Fix:**
```javascript
// SAFE - explicit error handling
async function processUser(id) {
  try {
    const user = await fetchUser(id);
    await updateStats(user);
    return user;
  } catch (error) {
    logger.error('Failed to process user', { id, error });
    throw new ProcessingError('User processing failed', { cause: error });
  }
}

// SAFE - handle the promise
function handleClick() {
  submitData().catch(error => {
    showErrorToast('Submission failed');
    logger.error('Submit failed', error);
  });
}
```

### Pattern 2: Empty Catch Block

**Anti-pattern:**
```javascript
// VULNERABLE - swallowed exception
try {
  await riskyOperation();
} catch (e) {
  // Silently ignored
}

try {
  parseConfig();
} catch {
  // "It's fine"
}
```

**Detection signal:** `catch` block that is empty or contains only a comment.

**Why it's dangerous:** Failures happen silently. You won't know something broke until much later (or never).

**Fix:**
```javascript
// SAFE - at minimum, log it
try {
  await riskyOperation();
} catch (error) {
  logger.error('Risky operation failed', error);
  // Then decide: rethrow, return default, or recover
}

// SAFE - intentional ignore with documentation
try {
  await optionalCleanup();
} catch (error) {
  // Intentionally ignored: cleanup failure shouldn't block main flow
  // But still log for observability
  logger.debug('Optional cleanup failed', error);
}
```

### Pattern 3: Missing Null/Undefined Checks

**Anti-pattern:**
```javascript
// VULNERABLE - assumes user exists
function getDisplayName(user) {
  return user.firstName + ' ' + user.lastName;
}

// VULNERABLE - assumes nested property exists
const city = response.data.user.address.city;
```

**Detection signal:** Property access on values that could be null/undefined, especially from:
- Function parameters
- API responses
- Database queries
- Optional chaining candidates

**Fix:**
```javascript
// SAFE - explicit check
function getDisplayName(user) {
  if (!user) {
    throw new ArgumentError('User is required');
  }
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
}

// SAFE - optional chaining with fallback
const city = response?.data?.user?.address?.city ?? 'Unknown';

// SAFE - validation at boundary
if (!response?.data?.user) {
  throw new ApiError('Invalid response: missing user');
}
```

### Pattern 4: Catching Too Broadly

**Anti-pattern:**
```javascript
// VULNERABLE - catches everything, including bugs
try {
  const data = JSON.parse(input);
  processData(data);
  saveToDatabase(data);
} catch (e) {
  return { error: 'Something went wrong' };  // What went wrong??
}
```

**Detection signal:** Single try/catch around multiple operations with generic error handling.

**Why it's dangerous:** Programming errors (typos, null references) get treated like data errors. You lose stack traces and specificity.

**Fix:**
```javascript
// SAFE - catch specific errors, let bugs bubble
try {
  const data = JSON.parse(input);
  processData(data);
  await saveToDatabase(data);
} catch (error) {
  if (error instanceof SyntaxError) {
    return { error: 'Invalid JSON input' };
  }
  if (error instanceof ValidationError) {
    return { error: error.message };
  }
  if (error instanceof DatabaseError) {
    logger.error('Database save failed', error);
    return { error: 'Failed to save data' };
  }
  // Unknown error - rethrow to crash (it's probably a bug)
  throw error;
}
```

### Pattern 5: Error Information Leakage

**Anti-pattern:**
```javascript
// VULNERABLE - exposes internals
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    query: err.sql  // Exposes database schema!
  });
});
```

**Detection signal:** Error objects, stack traces, or internal details in API responses.

**Why it's dangerous:** Attackers learn about your system's internals—file paths, database schema, library versions.

**Fix:**
```javascript
// SAFE - generic external message, detailed internal logging
app.use((err, req, res, next) => {
  // Log full details internally
  logger.error('Request failed', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path
  });
  
  // Return generic message externally
  const status = err.status || 500;
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message,
    requestId: req.id  // For support correlation
  });
});
```

### Pattern 6: No Timeout on External Calls

**Anti-pattern:**
```javascript
// VULNERABLE - waits forever
const response = await fetch('https://external-api.com/data');
const result = await db.query('SELECT * FROM large_table');
```

**Detection signal:** HTTP requests, database queries, or other I/O without explicit timeout.

**Why it's dangerous:** If external service hangs, your service hangs. Resource exhaustion follows.

**Fix:**
```javascript
// SAFE - explicit timeout
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch('https://external-api.com/data', {
    signal: controller.signal
  });
} finally {
  clearTimeout(timeout);
}

// SAFE - database timeout
const result = await db.query('SELECT * FROM large_table', {
  timeout: 10000  // 10 seconds
});
```

### Pattern 7: Inadequate Finally Block

**Anti-pattern:**
```javascript
// VULNERABLE - connection not released on error
async function queryData() {
  const conn = await pool.getConnection();
  const result = await conn.query('SELECT * FROM users');
  conn.release();  // Never reached if query throws
  return result;
}
```

**Detection signal:** Resource acquisition followed by operations, with cleanup only in the success path.

**Fix:**
```javascript
// SAFE - cleanup in finally
async function queryData() {
  const conn = await pool.getConnection();
  try {
    return await conn.query('SELECT * FROM users');
  } finally {
    conn.release();  // Always runs
  }
}

// SAFE - use patterns that handle cleanup
const result = await pool.query('SELECT * FROM users');  // Pool handles connection
```

### Pattern 8: Assumptions About External Data

**Anti-pattern:**
```javascript
// VULNERABLE - assumes API returns expected shape
const response = await fetch('/api/user');
const data = await response.json();
const userName = data.user.name;  // What if data.user is undefined?
```

**Detection signal:** Parsing external responses and immediately accessing nested properties.

**Fix:**
```javascript
// SAFE - validate response shape
const response = await fetch('/api/user');
if (!response.ok) {
  throw new ApiError(`API returned ${response.status}`);
}

const data = await response.json();
if (!data?.user?.name) {
  throw new ApiError('Invalid response: missing user.name');
}
const userName = data.user.name;

// Or use schema validation
const data = UserResponseSchema.parse(await response.json());
```

### Pattern 9: Error in Error Handler

**Anti-pattern:**
```javascript
// VULNERABLE - error handler can throw
try {
  await processData();
} catch (error) {
  await logToExternalService(error);  // What if this fails?
  throw error;
}
```

**Detection signal:** Async operations or potentially-throwing code inside catch blocks.

**Fix:**
```javascript
// SAFE - error handler is defensive
try {
  await processData();
} catch (error) {
  try {
    await logToExternalService(error);
  } catch (loggingError) {
    console.error('Failed to log error', loggingError);
    // Don't let logging failure mask original error
  }
  throw error;
}
```

### Pattern 10: Non-Atomic Check-Then-Act

**Anti-pattern:**
```javascript
// VULNERABLE - race condition in error handling
if (await fileExists(path)) {
  const content = await readFile(path);  // File might be deleted between check and read
}
```

**Detection signal:** Existence check followed by operation on the same resource.

**Fix:**
```javascript
// SAFE - just try it and handle failure
try {
  const content = await readFile(path);
} catch (error) {
  if (error.code === 'ENOENT') {
    // File doesn't exist - handle gracefully
    return null;
  }
  throw error;  // Some other error
}
```

## Quick Reference Table

| Pattern | Detection Signal | Severity | Fix Strategy |
|---------|------------------|----------|--------------|
| Unhandled Promise | await without try/catch | High | Add try/catch or .catch() |
| Empty Catch | Empty catch block | High | Log and handle or rethrow |
| Missing Null Check | Property access on uncertain values | Medium | Optional chaining + validation |
| Broad Catch | Single catch for multiple ops | Medium | Catch specific error types |
| Error Leakage | Error details in response | Medium | Generic external, detailed internal |
| No Timeout | External calls without timeout | High | Add explicit timeouts |
| Missing Finally | Cleanup only in success path | High | Move cleanup to finally |
| Assumed Shape | Nested access on external data | Medium | Validate before access |
| Error in Handler | Async ops in catch | Medium | Defensive error handler |
| Check-Then-Act | Existence check then operation | Medium | Try and catch instead |

## Verification Checklist

For every code block, scan for:

1. [ ] Async functions without try/catch around awaits
2. [ ] Promise-returning calls without await or .catch()
3. [ ] Empty or comment-only catch blocks
4. [ ] Property access on values that could be null/undefined
5. [ ] Single catch block around multiple distinct operations
6. [ ] Error objects or stack traces in API responses
7. [ ] External HTTP/database calls without timeouts
8. [ ] Resource acquisition without finally cleanup
9. [ ] External API responses accessed without shape validation
10. [ ] Existence checks followed by operations (check-then-act)

If any found: **FAIL** with location and fix.
