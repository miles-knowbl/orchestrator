# Performance Debugging

Finding and fixing slow code.

## Symptoms

| Symptom | Likely Area |
|---------|-------------|
| High latency | Slow operation in critical path |
| Timeout errors | Operation exceeds time limit |
| High CPU | CPU-bound computation or busy loop |
| High memory | Memory allocation or leak |
| High I/O wait | Database, disk, or network bound |
| Works fast then slows | Resource exhaustion, GC pressure |

## The Performance Debugging Process

### Step 1: Measure, Don't Guess

**Never optimize without data.** Intuition about performance is often wrong.

```javascript
// Add timing
const start = Date.now();
await expensiveOperation();
console.log(`Operation took ${Date.now() - start}ms`);
```

### Step 2: Find the Bottleneck

Where is time actually spent?

| Resource | How to Check |
|----------|--------------|
| CPU | `top`, `htop`, CPU profiler |
| Memory | Memory profiler, heap snapshots |
| Database | Slow query log, EXPLAIN ANALYZE |
| Network | Network tab, latency metrics |
| Disk | `iostat`, disk I/O metrics |

### Step 3: Focus on the Critical Path

The critical path is the sequence of operations that determines total time.

```
Request time = auth(50ms) + getData(500ms) + transform(10ms) + respond(5ms)
                                  ↑
                           Optimize THIS
```

### Step 4: Fix Highest Impact First

Amdahl's Law: Optimizing something that takes 1% of time won't help much.

| Time Spent | Max Improvement if Fixed |
|------------|--------------------------|
| 90% | 10x faster |
| 50% | 2x faster |
| 10% | 1.1x faster |
| 1% | 1.01x faster |

## Database Performance

### Finding Slow Queries

```sql
-- PostgreSQL: Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = '1000'; -- Log queries > 1 second
SELECT pg_reload_conf();

-- Find currently running slow queries
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 seconds';
```

### EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;
```

**Red flags:**
- `Seq Scan` on large table (needs index)
- High `actual rows` vs `planned rows` (bad statistics)
- `Nested Loop` with high row counts (O(n²))

### Common Database Fixes

| Problem | Fix |
|---------|-----|
| Seq Scan | Add index |
| N+1 queries | Use JOIN or eager loading |
| Large result set | Add pagination |
| Lock contention | Smaller transactions |
| Connection exhaustion | Connection pooling |

## API/Network Performance

### Finding Network Issues

```javascript
// Log external call timing
const start = Date.now();
const response = await fetch(url);
console.log(`External API: ${Date.now() - start}ms`);
```

### Common Network Fixes

| Problem | Fix |
|---------|-----|
| Sequential calls | Promise.all for parallel |
| No timeout | Add timeout |
| No caching | Cache responses |
| Large payloads | Compression, pagination |
| SSL handshake | Connection reuse |

## Code Performance

### Profiling

**Node.js:**
```bash
# CPU profiling
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Or use Chrome DevTools
node --inspect app.js
```

### Common Code Fixes

| Problem | Fix |
|---------|-----|
| O(n²) loops | Use Map for O(1) lookup |
| Repeated computation | Caching, memoization |
| Blocking I/O | Async I/O |
| Large JSON parsing | Streaming parser |
| Regex backtracking | Simpler regex, anchoring |

## Quick Wins Checklist

```markdown
### Performance Quick Wins

**Database:**
- [ ] Check for missing indexes (EXPLAIN ANALYZE)
- [ ] Check for N+1 queries
- [ ] Check connection pool size
- [ ] Add pagination to large queries

**Network:**
- [ ] Parallelize independent calls (Promise.all)
- [ ] Add timeouts to external calls
- [ ] Enable compression
- [ ] Add caching headers

**Code:**
- [ ] Check for O(n²) patterns
- [ ] Cache expensive computations
- [ ] Use async for I/O operations
- [ ] Check for memory leaks (GC pressure)

**Infrastructure:**
- [ ] Check resource limits (CPU, memory)
- [ ] Check for resource contention
- [ ] Review scaling configuration
```

## Performance Investigation Template

```markdown
## Performance Issue: [Description]

**Symptom:** [What's slow, how slow]

**Baseline:** [What's expected]

**Measurements:**
| Operation | Time | % of Total |
|-----------|------|------------|
| [Op 1] | [X ms] | [Y%] |
| [Op 2] | [X ms] | [Y%] |

**Bottleneck:** [What's taking the most time]

**Root Cause:** [Why it's slow]

**Fix:** [What to change]

**Expected Improvement:** [How much faster]

**Actual Result:** [After fix]
```

## Tools

| Tool | Use For |
|------|---------|
| Chrome DevTools | JS profiling, network analysis |
| `ab`, `wrk`, `k6` | Load testing |
| `EXPLAIN ANALYZE` | Database query analysis |
| `perf` (Linux) | System-level profiling |
| APM tools | End-to-end tracing |
