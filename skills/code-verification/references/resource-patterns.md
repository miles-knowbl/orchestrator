# Resource Patterns

Patterns that indicate improper resource management—connections, files, handles, and external dependencies. These cause exhaustion and cascading failures.

## Why This Matters

Every external resource is limited. Database connections, file handles, HTTP sockets, memory—all have caps. AI-generated code often acquires resources without releasing them, or holds them longer than necessary. At low load, this works. At production load, you run out.

Your job: Ensure every acquisition has a release, and every external call has a timeout.

## Detection Patterns

### Pattern 1: Database Connection Not Released

**Anti-pattern:**
```javascript
// VULNERABLE - connection never returned to pool
async function getUser(id) {
  const conn = await pool.getConnection();
  const result = await conn.query('SELECT * FROM users WHERE id = ?', [id]);
  return result[0];  // Connection leaked if error or just... forgotten
}

// VULNERABLE - released only on success path
async function updateUser(id, data) {
  const conn = await pool.getConnection();
  const result = await conn.query('UPDATE users SET ...', [...]);
  conn.release();  // Never reached if query throws
  return result;
}
```

**Detection signal:** `pool.getConnection()` without `release()` in a `finally` block.

**Why it's dangerous:** Pool exhaustion. New requests wait for connections that will never return. Eventually, everything times out.

**Fix:**
```javascript
// SAFE - finally guarantees cleanup
async function getUser(id) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('SELECT * FROM users WHERE id = ?', [id]);
    return result[0];
  } finally {
    conn.release();
  }
}

// BETTER - use pool.query() which handles this
async function getUser(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return result[0];
}

// BEST - use a wrapper that ensures cleanup
async function withConnection(fn) {
  const conn = await pool.getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release();
  }
}

const user = await withConnection(conn => 
  conn.query('SELECT * FROM users WHERE id = ?', [id])
);
```

### Pattern 2: File Handle Not Closed

**Anti-pattern:**
```javascript
// VULNERABLE - file handle leaked
async function readConfig(path) {
  const file = await fs.open(path, 'r');
  const content = await file.readFile();
  return JSON.parse(content);
  // file.close() never called
}

// VULNERABLE - stream not closed on error
function processLargeFile(path) {
  const stream = fs.createReadStream(path);
  stream.on('data', chunk => {
    process(chunk);  // If this throws, stream stays open
  });
}
```

**Detection signal:** `fs.open()` or `createReadStream/WriteStream` without corresponding `close()` or error handling.

**Fix:**
```javascript
// SAFE - finally cleanup
async function readConfig(path) {
  const file = await fs.open(path, 'r');
  try {
    const content = await file.readFile();
    return JSON.parse(content);
  } finally {
    await file.close();
  }
}

// SAFE - use convenience methods that handle cleanup
async function readConfig(path) {
  const content = await fs.readFile(path, 'utf8');
  return JSON.parse(content);
}

// SAFE - proper stream error handling
function processLargeFile(path) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(path);
    
    stream.on('data', chunk => {
      try {
        process(chunk);
      } catch (err) {
        stream.destroy();
        reject(err);
      }
    });
    
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}
```

### Pattern 3: HTTP Client Without Timeout

**Anti-pattern:**
```javascript
// VULNERABLE - waits forever
const response = await fetch('https://external-api.com/data');

const response = await axios.get('https://external-api.com/data');

// VULNERABLE - timeout only on connect, not read
const response = await fetch(url, {
  timeout: 5000  // This isn't even a real option in standard fetch!
});
```

**Detection signal:** HTTP client calls (`fetch`, `axios`, `got`, `request`) without explicit timeout configuration.

**Fix:**
```javascript
// SAFE - AbortController with timeout
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// SAFE - axios with timeout
const response = await axios.get('https://external-api.com/data', {
  timeout: 5000  // Axios actually supports this
});

// SAFE - got with timeout (best support)
const response = await got('https://external-api.com/data', {
  timeout: {
    lookup: 100,
    connect: 500,
    secureConnect: 500,
    socket: 1000,
    send: 5000,
    response: 5000
  }
});
```

### Pattern 4: Missing Circuit Breaker

**Anti-pattern:**
```javascript
// VULNERABLE - keeps hitting failing service
async function getRecommendations(userId) {
  const response = await fetch('https://recommendation-service/api/' + userId);
  return response.json();
}
// Service is down → every request tries → every request waits → cascade
```

**Detection signal:** External service calls without failure detection or fallback.

**Fix:**
```javascript
// SAFE - circuit breaker pattern
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.failures = 0;
    this.lastFailure = null;
    this.state = 'CLOSED';
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'HALF-OPEN';
      } else {
        throw new CircuitOpenError('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

const recommendationBreaker = new CircuitBreaker();

async function getRecommendations(userId) {
  try {
    return await recommendationBreaker.call(() =>
      fetch('https://recommendation-service/api/' + userId).then(r => r.json())
    );
  } catch (error) {
    if (error instanceof CircuitOpenError) {
      return getDefaultRecommendations();  // Fallback
    }
    throw error;
  }
}
```

### Pattern 5: Unbounded Queue or Buffer

**Anti-pattern:**
```javascript
// VULNERABLE - queue grows without limit
const jobQueue = [];

function enqueue(job) {
  jobQueue.push(job);
}

// Producer is faster than consumer → memory exhaustion
```

**Detection signal:** Array or collection used as queue without size limit or backpressure.

**Fix:**
```javascript
// SAFE - bounded queue with backpressure
class BoundedQueue {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.queue = [];
  }

  enqueue(item) {
    if (this.queue.length >= this.maxSize) {
      throw new QueueFullError('Queue at capacity');
      // Or: return false, or block, or drop oldest
    }
    this.queue.push(item);
  }

  dequeue() {
    return this.queue.shift();
  }
}

// SAFE - use proper job queue library
const Queue = require('bull');
const jobQueue = new Queue('jobs', {
  limiter: {
    max: 1000,
    duration: 60000
  }
});
```

### Pattern 6: Connection Pool Misconfiguration

**Anti-pattern:**
```javascript
// VULNERABLE - new connection per request
async function query(sql) {
  const conn = await mysql.createConnection({...});
  const result = await conn.query(sql);
  await conn.end();
  return result;
}

// VULNERABLE - pool too small for load
const pool = mysql.createPool({
  connectionLimit: 5  // But you have 50 concurrent requests
});
```

**Detection signal:** 
- `createConnection` instead of pool
- Pool with suspiciously small `connectionLimit`

**Fix:**
```javascript
// SAFE - properly sized pool
const pool = mysql.createPool({
  connectionLimit: 20,  // Based on expected concurrency
  queueLimit: 0,  // Unlimited queue (or set reasonable limit)
  waitForConnections: true,
  acquireTimeout: 10000  // Don't wait forever
});

// Rule of thumb: connectionLimit ≈ max_concurrent_requests / 2
// Because connections can handle multiple queries via pipelining
```

### Pattern 7: Transaction Not Committed or Rolled Back

**Anti-pattern:**
```javascript
// VULNERABLE - transaction left open
async function updateData(data) {
  const trx = await db.transaction();
  await trx.query('UPDATE ...');
  // No commit or rollback!
  // Transaction stays open, locks held
}

// VULNERABLE - commit only on success path
async function updateData(data) {
  const trx = await db.transaction();
  await trx.query('UPDATE ...');
  await trx.commit();  // Never reached if query throws
}
```

**Detection signal:** `db.transaction()` without `commit()` and `rollback()` in try/catch/finally.

**Fix:**
```javascript
// SAFE - explicit try/finally
async function updateData(data) {
  const trx = await db.transaction();
  try {
    await trx.query('UPDATE ...');
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

// BETTER - use callback pattern that handles this
async function updateData(data) {
  await db.transaction(async (trx) => {
    await trx.query('UPDATE ...');
    // Auto-commits on success, auto-rollbacks on error
  });
}
```

### Pattern 8: Missing Retry with Backoff

**Anti-pattern:**
```javascript
// VULNERABLE - immediate retry hammers failing service
async function fetchData() {
  for (let i = 0; i < 3; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      // Immediately retry
    }
  }
  throw new Error('Failed after 3 attempts');
}
```

**Detection signal:** Retry loops without delay or with fixed delay.

**Fix:**
```javascript
// SAFE - exponential backoff
async function fetchWithRetry(url, options = {}) {
  const { maxRetries = 3, baseDelay = 1000 } = options;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * delay * 0.1;
      await sleep(delay + jitter);
    }
  }
}

// SAFE - use retry library
const retry = require('async-retry');

const result = await retry(
  async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 10000,
    randomize: true
  }
);
```

## Quick Reference Table

| Pattern | Detection Signal | Severity | Fix Strategy |
|---------|------------------|----------|--------------|
| Connection leak | getConnection without release in finally | High | finally cleanup or use pool.query |
| File handle leak | fs.open without close | High | finally cleanup or convenience methods |
| Missing timeout | HTTP calls without timeout option | High | AbortController or library timeout |
| No circuit breaker | External calls without failure handling | Medium | Implement circuit breaker + fallback |
| Unbounded queue | Collection as queue without limit | High | Bounded queue with backpressure |
| Pool misconfigured | createConnection or tiny connectionLimit | Medium | Use pool with appropriate size |
| Transaction leak | transaction without commit/rollback | High | try/finally or callback pattern |
| Retry without backoff | Retry loop without delay | Medium | Exponential backoff with jitter |

## Verification Checklist

For every code block, scan for:

1. [ ] pool.getConnection() without release() in finally
2. [ ] fs.open() or createReadStream without close
3. [ ] HTTP client calls (fetch, axios) without timeout
4. [ ] External service calls without circuit breaker or fallback
5. [ ] Arrays/collections used as queues without size limits
6. [ ] createConnection() instead of connection pool
7. [ ] Connection pools with suspiciously small limits
8. [ ] db.transaction() without commit/rollback in try/catch
9. [ ] Retry loops without exponential backoff

If any found: **FAIL** with location and fix.
