# Concurrency Patterns

Patterns that indicate race conditions, deadlocks, or inefficient async handling. These cause intermittent bugs—the hardest kind to debug.

## Why This Matters

Concurrency bugs are quantum bugs—they exist in superposition until observed, then collapse into "works on my machine." AI-generated code especially struggles here because correctness and concurrency are orthogonal: code can be functionally correct but completely broken under concurrent access.

Your job: Ask "what if two of these run at the same time?" for every operation.

## Detection Patterns

### Pattern 1: Check-Then-Act (TOCTOU)

**Anti-pattern:**
```javascript
// VULNERABLE - race between check and act
async function withdrawMoney(userId, amount) {
  const balance = await getBalance(userId);
  if (balance >= amount) {
    // Another request could modify balance here!
    await setBalance(userId, balance - amount);
  }
}

// VULNERABLE - file check then operation
if (await fileExists(path)) {
  // File could be deleted between check and read
  const content = await readFile(path);
}
```

**Detection signal:** 
- Read followed by conditional followed by write, without atomicity
- Existence check followed by operation on the resource

**Why it's dangerous:** Two simultaneous requests both read balance=100, both see balance >= 50, both subtract, result is -50 instead of 0.

**Fix:**
```javascript
// SAFE - atomic operation
async function withdrawMoney(userId, amount) {
  const result = await db.query(
    'UPDATE accounts SET balance = balance - $1 WHERE user_id = $2 AND balance >= $1 RETURNING balance',
    [amount, userId]
  );
  if (result.rowCount === 0) {
    throw new InsufficientFundsError();
  }
}

// SAFE - optimistic locking
async function withdrawMoney(userId, amount) {
  const account = await getAccount(userId);
  const result = await db.query(
    'UPDATE accounts SET balance = $1, version = $2 WHERE user_id = $3 AND version = $4',
    [account.balance - amount, account.version + 1, userId, account.version]
  );
  if (result.rowCount === 0) {
    throw new ConcurrencyError('Account modified by another request');
  }
}

// SAFE - try and catch instead of check
try {
  const content = await readFile(path);
} catch (err) {
  if (err.code === 'ENOENT') {
    // Handle missing file
  }
  throw err;
}
```

### Pattern 2: Sequential Awaits That Should Be Parallel

**Anti-pattern:**
```javascript
// SLOW - waits for each in sequence
async function loadDashboard(userId) {
  const user = await fetchUser(userId);
  const orders = await fetchOrders(userId);
  const notifications = await fetchNotifications(userId);
  return { user, orders, notifications };
}
// Total time: user + orders + notifications
```

**Detection signal:** Multiple independent `await` calls in sequence.

**Fix:**
```javascript
// FAST - parallel execution
async function loadDashboard(userId) {
  const [user, orders, notifications] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchNotifications(userId)
  ]);
  return { user, orders, notifications };
}
// Total time: max(user, orders, notifications)
```

**Caveat:** Only parallelize if operations are truly independent. If order B depends on result of A, they must be sequential.

### Pattern 3: Shared Mutable State Without Synchronization

**Anti-pattern:**
```javascript
// VULNERABLE - shared counter without lock
let requestCount = 0;

async function handleRequest(req) {
  requestCount++;  // Not atomic!
  // Read-modify-write can interleave
}

// VULNERABLE - shared object mutation
const cache = {};

async function getOrCreate(key) {
  if (!cache[key]) {
    cache[key] = await createExpensive(key);  // Two calls might both create
  }
  return cache[key];
}
```

**Detection signal:** Module-level or shared variables modified by async functions.

**Fix:**
```javascript
// SAFE - use atomic operations (where available)
const { Atomics } = require('worker_threads');
// Or use database/Redis for shared state

// SAFE - use a mutex for complex operations
const mutex = new Mutex();

async function getOrCreate(key) {
  return await mutex.runExclusive(async () => {
    if (!cache[key]) {
      cache[key] = await createExpensive(key);
    }
    return cache[key];
  });
}

// SAFE - use Map's atomic get-or-set pattern
const pending = new Map();

async function getOrCreate(key) {
  if (cache[key]) return cache[key];
  
  if (!pending.has(key)) {
    pending.set(key, createExpensive(key).finally(() => pending.delete(key)));
  }
  
  cache[key] = await pending.get(key);
  return cache[key];
}
```

### Pattern 4: Missing Promise.all Error Handling

**Anti-pattern:**
```javascript
// VULNERABLE - partial failure leaves inconsistent state
async function updateAll(items) {
  await Promise.all(items.map(item => updateItem(item)));
  // If one fails, others might have succeeded - inconsistent state
}
```

**Detection signal:** `Promise.all` over mutation operations without transaction or rollback.

**Fix:**
```javascript
// SAFE - use allSettled and handle partial failure
async function updateAll(items) {
  const results = await Promise.allSettled(items.map(item => updateItem(item)));
  
  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    // Log failures, potentially retry or alert
    logger.error('Partial failure', { failures: failures.map(f => f.reason) });
    throw new PartialUpdateError(failures);
  }
}

// SAFE - use database transaction for atomicity
async function updateAll(items) {
  await db.transaction(async (trx) => {
    await Promise.all(items.map(item => updateItem(item, trx)));
  });
  // Either all succeed or all fail
}
```

### Pattern 5: Callback vs. Promise Confusion

**Anti-pattern:**
```javascript
// VULNERABLE - mixing callbacks and promises
async function processFile(path) {
  fs.readFile(path, (err, data) => {
    if (err) throw err;  // This throw goes nowhere!
    return data;  // This return goes nowhere!
  });
}

// VULNERABLE - not awaiting inside callback
items.forEach(async (item) => {
  await processItem(item);  // forEach doesn't await this!
});
```

**Detection signal:** 
- `async` function using callback-based APIs without promisification
- `async` callback inside `.forEach()`, `.map()`, etc. without handling the promises

**Fix:**
```javascript
// SAFE - use promise version
const { readFile } = require('fs/promises');

async function processFile(path) {
  const data = await readFile(path);
  return data;
}

// SAFE - collect and await promises
await Promise.all(items.map(async (item) => {
  await processItem(item);
}));

// SAFE - use for...of for sequential async
for (const item of items) {
  await processItem(item);
}
```

### Pattern 6: Deadlock Potential

**Anti-pattern:**
```javascript
// VULNERABLE - lock ordering inconsistency
async function transferA(from, to, amount) {
  await from.lock.acquire();
  await to.lock.acquire();  // If another transfer does to→from, deadlock
  // ... transfer ...
}
```

**Detection signal:** Multiple lock acquisitions in a function without consistent ordering.

**Fix:**
```javascript
// SAFE - consistent lock ordering
async function transfer(from, to, amount) {
  // Always lock lower ID first
  const [first, second] = from.id < to.id ? [from, to] : [to, from];
  
  await first.lock.acquire();
  try {
    await second.lock.acquire();
    try {
      // ... transfer ...
    } finally {
      second.lock.release();
    }
  } finally {
    first.lock.release();
  }
}

// SAFE - use try-lock with retry
async function transfer(from, to, amount, retries = 3) {
  for (let i = 0; i < retries; i++) {
    if (await from.lock.tryAcquire()) {
      if (await to.lock.tryAcquire()) {
        try {
          // ... transfer ...
          return;
        } finally {
          to.lock.release();
          from.lock.release();
        }
      }
      from.lock.release();
    }
    await sleep(Math.random() * 100);  // Random backoff
  }
  throw new Error('Could not acquire locks');
}
```

### Pattern 7: Unhandled Promise Rejection in Background Task

**Anti-pattern:**
```javascript
// VULNERABLE - error crashes process in newer Node
function startBackgroundJob() {
  setInterval(() => {
    processQueue();  // If this returns rejected promise, unhandled!
  }, 5000);
}

// VULNERABLE - fire and forget
button.onclick = () => {
  submitForm();  // Promise rejection goes nowhere
};
```

**Detection signal:** Promise-returning function called without `await` or `.catch()`, especially in event handlers or timers.

**Fix:**
```javascript
// SAFE - handle errors in background tasks
function startBackgroundJob() {
  setInterval(async () => {
    try {
      await processQueue();
    } catch (error) {
      logger.error('Background job failed', error);
      // Decide: stop the job? Alert? Continue?
    }
  }, 5000);
}

// SAFE - handle in event handler
button.onclick = async () => {
  try {
    await submitForm();
  } catch (error) {
    showErrorMessage(error);
  }
};
```

### Pattern 8: Async Initialization Race

**Anti-pattern:**
```javascript
// VULNERABLE - multiple calls might initialize multiple times
class Service {
  async getClient() {
    if (!this.client) {
      this.client = await createClient();  // Race: two calls both see !client
    }
    return this.client;
  }
}
```

**Detection signal:** Lazy initialization of async resources without synchronization.

**Fix:**
```javascript
// SAFE - store the promise, not the result
class Service {
  getClient() {
    if (!this.clientPromise) {
      this.clientPromise = createClient();
    }
    return this.clientPromise;  // All callers await same promise
  }
}

// SAFE - use mutex for complex initialization
class Service {
  async getClient() {
    if (!this.client) {
      await this.initMutex.runExclusive(async () => {
        if (!this.client) {  // Double-check after acquiring lock
          this.client = await createClient();
        }
      });
    }
    return this.client;
  }
}
```

## Quick Reference Table

| Pattern | Detection Signal | Severity | Fix Strategy |
|---------|------------------|----------|--------------|
| TOCTOU | Read → check → write sequence | High | Atomic operations or locking |
| Sequential awaits | Multiple independent awaits | Low | Promise.all for parallelism |
| Shared mutable state | Module vars in async functions | High | Mutex or atomic operations |
| Promise.all mutations | Promise.all over write operations | Medium | allSettled or transactions |
| Callback/Promise mix | async with callback APIs | High | Use promise APIs |
| Deadlock | Multiple locks without ordering | High | Consistent lock ordering |
| Unhandled background | Promise without await/catch | High | try/catch in handlers |
| Async init race | Lazy async init without sync | Medium | Store promise, not result |

## Verification Checklist

For every code block, scan for:

1. [ ] Read-check-write sequences without atomicity guarantees
2. [ ] Multiple independent awaits that could be parallelized
3. [ ] Module-level variables modified by async functions
4. [ ] Promise.all over mutation operations without transaction
5. [ ] Callback-based APIs used in async functions without promisification
6. [ ] forEach/map with async callback without awaiting results
7. [ ] Multiple lock acquisitions without consistent ordering
8. [ ] Promise-returning functions called without await or .catch()
9. [ ] Lazy async initialization without synchronization

If any found: **FAIL** (High/Medium severity) with location and fix.
