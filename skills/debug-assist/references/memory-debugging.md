# Memory Debugging

Debugging memory leaks, OOM, and GC issues.

## Symptoms

| Symptom | Possible Cause |
|---------|----------------|
| OOM kill (code 137) | Memory leak or unbounded growth |
| Gradual memory growth | Slow leak |
| Sudden memory spike | Large allocation |
| High GC pause times | Too many objects, memory pressure |
| Degrading performance over time | Memory pressure causing GC thrashing |

## Quick Diagnosis

### Step 1: Confirm It's Memory

```bash
# Watch memory over time
watch -n 1 'ps -o pid,rss,command -p $(pgrep node)'

# Check for OOM kills
dmesg | grep -i "out of memory"
grep -i "oom" /var/log/syslog
```

### Step 2: Identify Growth Pattern

| Pattern | Likely Cause |
|---------|--------------|
| Steady climb | Classic leak (objects not released) |
| Sawtooth | Normal—GC working but baseline increasing |
| Sudden spike | Large allocation, bulk operation |
| Plateau then spike | Slow leak until threshold |

### Step 3: Correlate with Operations

- What operations are running when memory grows?
- Does memory drop after certain operations complete?
- Is growth proportional to traffic/data?

## Node.js Memory Debugging

### Heap Snapshot

```javascript
// In code: trigger heap dump
const v8 = require('v8');
const fs = require('fs');

function takeHeapSnapshot() {
  const snapshotFile = `/tmp/heap-${Date.now()}.heapsnapshot`;
  const stream = fs.createWriteStream(snapshotFile);
  v8.writeHeapSnapshot(snapshotFile);
  console.log(`Heap snapshot written to ${snapshotFile}`);
}

// Trigger via signal
process.on('SIGUSR2', takeHeapSnapshot);
```

```bash
# Trigger snapshot
kill -USR2 $(pgrep node)
```

**Analyze in Chrome DevTools:**
1. Open DevTools → Memory tab
2. Load snapshot file
3. Look for: Retained size, object counts, detached DOM

### Comparing Snapshots

1. Take snapshot when memory is normal
2. Run suspected leaky operation
3. Take another snapshot
4. Compare: what objects increased?

### Memory Timeline

```javascript
// Log memory usage periodically
setInterval(() => {
  const usage = process.memoryUsage();
  console.log({
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    external: Math.round(usage.external / 1024 / 1024) + 'MB'
  });
}, 5000);
```

### Garbage Collection Logging

```bash
# Run Node with GC logging
node --trace-gc app.js

# More detailed
node --trace-gc --trace-gc-verbose app.js
```

## Common Memory Leak Patterns

### 1. Event Listeners Not Removed

```javascript
// LEAK: Listener never removed
class Component {
  start() {
    window.addEventListener('resize', this.handleResize);
  }
  // No cleanup method!
}

// FIX: Remove listener
class Component {
  start() {
    window.addEventListener('resize', this.handleResize);
  }
  stop() {
    window.removeEventListener('resize', this.handleResize);
  }
}
```

### 2. Closures Holding References

```javascript
// LEAK: Closure captures large object
function createHandler(hugeData) {
  return () => {
    console.log(hugeData.items[0]); // Holds reference to all of hugeData
  };
}

// FIX: Capture only what's needed
function createHandler(hugeData) {
  const firstItem = hugeData.items[0];
  return () => {
    console.log(firstItem); // Only holds reference to one item
  };
}
```

### 3. Unbounded Caches/Collections

```javascript
// LEAK: Cache grows forever
const cache = {};
function getData(key) {
  if (!cache[key]) {
    cache[key] = expensiveComputation(key);
  }
  return cache[key];
}

// FIX: Bounded cache with LRU eviction
const LRU = require('lru-cache');
const cache = new LRU({ max: 500 });
```

### 4. Timers Not Cleared

```javascript
// LEAK: Interval runs forever
function startPolling() {
  setInterval(poll, 1000);
}

// FIX: Store and clear interval
let pollInterval;
function startPolling() {
  pollInterval = setInterval(poll, 1000);
}
function stopPolling() {
  clearInterval(pollInterval);
}
```

### 5. Subscriptions Not Unsubscribed

```javascript
// LEAK: Subscription never cancelled
useEffect(() => {
  const sub = eventBus.subscribe('event', handler);
  // No cleanup!
}, []);

// FIX: Unsubscribe on cleanup
useEffect(() => {
  const sub = eventBus.subscribe('event', handler);
  return () => sub.unsubscribe();
}, []);
```

## Memory Debugging Checklist

```markdown
### Memory Investigation

**Symptom:** [What you're seeing]

**Measurements:**
- Starting memory: [X MB]
- After 1 hour: [Y MB]
- Growth rate: [Z MB/hour]

**Correlation:**
- [ ] Checked correlation with traffic
- [ ] Checked correlation with specific operations
- [ ] Checked for scheduled tasks

**Analysis:**
- [ ] Took heap snapshots
- [ ] Compared snapshots
- [ ] Identified growing object types

**Common Causes Checked:**
- [ ] Event listeners
- [ ] Closures
- [ ] Caches without limits
- [ ] Timers not cleared
- [ ] Subscriptions not cancelled
- [ ] Global variables accumulating

**Root Cause:** [What's leaking]

**Fix:** [How to fix it]
```

## Tools

| Tool | Use For |
|------|---------|
| Chrome DevTools | Heap snapshots, memory timeline |
| `node --inspect` | Attach Chrome DevTools to Node |
| `heapdump` package | Programmatic heap dumps |
| `clinic` | Memory profiling suite |
| `memwatch-next` | Leak detection for Node |
| `valgrind` | Native memory analysis |
