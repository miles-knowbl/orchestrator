# Concurrency Debugging

Debugging race conditions, deadlocks, and ordering issues.

## Why Concurrency Bugs Are Hard

1. **Non-deterministic:** May not happen every time
2. **Timing-dependent:** Change timing, change behavior
3. **Heisenbug effect:** Adding logging can make bug disappear
4. **Hard to reproduce:** Work on your machine, fail in production

## Symptoms

| Symptom | Likely Cause |
|---------|--------------|
| Intermittent failures | Race condition |
| Works in debugger, fails normally | Timing-sensitive race |
| Sometimes wrong data | Read-write race |
| Hangs forever | Deadlock |
| Slow under load | Lock contention |
| Different results each run | Order-dependent race |

## Quick Diagnosis

### Step 1: Confirm It's Concurrency

**Test: Does it work single-threaded?**

```javascript
// Force sequential execution
for (const item of items) {
  await processItem(item); // One at a time
}
// vs
await Promise.all(items.map(processItem)); // Concurrent
```

If single-threaded works but concurrent fails → concurrency bug.

### Step 2: Identify Shared State

List everything that could be shared:
- Global variables
- Module-level variables
- Database records
- Cache entries
- Files
- External services

### Step 3: Find the Race Window

Where could two operations interleave?

```javascript
// Race window between read and write
const balance = await getBalance(userId);    // T1 reads 100
// Another request could read here            // T2 reads 100
if (balance >= amount) {
  await setBalance(userId, balance - amount); // T1 writes 50
}                                              // T2 writes 50 (should be 0!)
```

## Race Condition Patterns

### Pattern 1: Check-Then-Act

```javascript
// RACE: Check and act are not atomic
if (await userExists(email)) {
  throw new Error('Email taken');
}
await createUser(email); // Another request could create between check and create
```

**Fix:** Use atomic operations or locks.

```javascript
// FIX: Atomic insert with unique constraint
try {
  await createUser(email); // DB enforces uniqueness
} catch (e) {
  if (e.code === 'UNIQUE_VIOLATION') {
    throw new Error('Email taken');
  }
  throw e;
}
```

### Pattern 2: Read-Modify-Write

```javascript
// RACE: Three separate operations
const count = await getCount();   // Read
const newCount = count + 1;        // Modify (in memory)
await setCount(newCount);          // Write
```

**Fix:** Atomic increment.

```javascript
// FIX: Single atomic operation
await db.query('UPDATE counters SET count = count + 1 WHERE id = $1', [id]);
```

### Pattern 3: Lost Update

```javascript
// RACE: Both read same version, one update lost
// Request A: read order, modify, save
// Request B: read order, modify, save
// B's save overwrites A's changes
```

**Fix:** Optimistic locking.

```javascript
// FIX: Include version in update condition
const result = await db.query(
  'UPDATE orders SET data = $1, version = $2 WHERE id = $3 AND version = $4',
  [newData, version + 1, orderId, version]
);
if (result.rowCount === 0) {
  throw new ConcurrencyError('Order was modified by another request');
}
```

### Pattern 4: Initialization Race

```javascript
// RACE: Two calls might both initialize
async function getClient() {
  if (!this.client) {
    this.client = await createClient(); // Both might enter this block
  }
  return this.client;
}
```

**Fix:** Store the promise.

```javascript
// FIX: Store promise, not result
function getClient() {
  if (!this.clientPromise) {
    this.clientPromise = createClient();
  }
  return this.clientPromise; // All callers await same promise
}
```

## Debugging Techniques

### 1. Add Strategic Logging

Log entry/exit of critical sections with timestamps:

```javascript
console.log(`[${Date.now()}] [${requestId}] Entering critical section`);
// ... critical section ...
console.log(`[${Date.now()}] [${requestId}] Exiting critical section`);
```

Look for interleaving in logs.

### 2. Add Artificial Delays

Make race windows more likely to trigger:

```javascript
const balance = await getBalance(userId);
await sleep(100); // Widen the race window
if (balance >= amount) {
  await setBalance(userId, balance - amount);
}
```

If it fails more often → confirms race condition.

### 3. Stress Testing

Increase concurrency to trigger races:

```javascript
// Run many concurrent operations
await Promise.all(
  Array(100).fill().map(() => transferMoney(from, to, 1))
);
// Check: is the final balance correct?
```

### 4. Deterministic Testing

Control timing in tests:

```javascript
// Force specific interleaving
const step1 = processA.start();
await processA.waitForCheckpoint('after-read');
const step2 = processB.start();
await processB.waitForCheckpoint('after-write');
await processA.continue();
// Assert the race condition occurred
```

## Deadlock Debugging

### Symptoms

- Process hangs indefinitely
- No CPU usage (waiting, not spinning)
- Multiple processes all blocked

### Finding Deadlocks

**Look for circular wait:**

```
Process A holds Lock 1, waiting for Lock 2
Process B holds Lock 2, waiting for Lock 1
→ Neither can proceed
```

**In databases:**

```sql
-- PostgreSQL: Find blocking queries
SELECT
  blocked.pid AS blocked_pid,
  blocking.pid AS blocking_pid,
  blocked.query AS blocked_query,
  blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_locks blocked_locks ON blocked.pid = blocked_locks.pid
JOIN pg_locks blocking_locks ON blocked_locks.locktype = blocking_locks.locktype
  AND blocked_locks.relation = blocking_locks.relation
JOIN pg_stat_activity blocking ON blocking_locks.pid = blocking.pid
WHERE blocked_locks.granted = false AND blocking_locks.granted = true;
```

### Preventing Deadlocks

1. **Lock ordering:** Always acquire locks in the same order
2. **Lock timeouts:** Don't wait forever
3. **Fewer locks:** Reduce lock scope
4. **Avoid holding locks during I/O**

```javascript
// BAD: Lock order depends on input
async function transfer(from, to, amount) {
  await lock(from);
  await lock(to); // Could deadlock if another transfer goes to→from
}

// GOOD: Consistent lock order
async function transfer(from, to, amount) {
  const [first, second] = from < to ? [from, to] : [to, from];
  await lock(first);
  await lock(second);
}
```

## Concurrency Debugging Checklist

```markdown
### Concurrency Investigation

**Symptom:** [Intermittent failure / hang / wrong data]

**Reproduction:**
- [ ] Confirmed single-threaded works
- [ ] Increased concurrency triggers more failures
- [ ] Added delays widen race window

**Shared State Identified:**
- [ ] [State 1]
- [ ] [State 2]

**Race Window Located:**
- Location: [File:line]
- Operations: [What interleaves]

**Pattern:**
- [ ] Check-then-act
- [ ] Read-modify-write
- [ ] Lost update
- [ ] Initialization race
- [ ] Deadlock

**Fix Strategy:**
- [ ] Atomic operation
- [ ] Locking
- [ ] Optimistic concurrency
- [ ] Lock ordering
- [ ] Remove shared state
```

## Tools

| Tool | Use For |
|------|---------|
| Thread sanitizer (TSan) | Detect races in C/C++ |
| Go race detector | `go run -race` |
| Database lock monitoring | Find blocking queries |
| Load testing tools | Stress test concurrency |
| Logging with request IDs | Trace interleaved operations |
