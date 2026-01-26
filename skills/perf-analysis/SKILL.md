---
name: perf-analysis
description: "Identify and resolve performance bottlenecks in code and systems. Profiles CPU, memory, and I/O usage. Analyzes database queries, API latency, and frontend rendering. Conducts load testing and provides optimization recommendations with measurable impact."
phase: VALIDATE
category: core
version: "1.0.0"
depends_on: [implement]
tags: [performance, validation, optimization, profiling, core-workflow]
---

# Performance Analysis

Identify and fix performance bottlenecks.

## When to Use

- **Slow responses** — API or page load times degraded
- **High resource usage** — CPU, memory, or I/O spikes
- **Scaling issues** — System struggles under load
- **Before launch** — Validate performance requirements
- **After changes** — Verify no performance regression
- **Cost optimization** — Reduce infrastructure costs
- When you say: "why is this slow", "profile this", "load test", "optimize"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `profiling-tools.md` | Tools for performance measurement |
| `optimization-patterns.md` | Common optimization approaches |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `database-optimization.md` | For database performance |
| `frontend-performance.md` | For UI performance |
| `load-testing.md` | For capacity testing |

**Verification:** Ensure performance metrics are measured before and after changes.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `PERF-ANALYSIS.md` | Project root | Always |

## Core Concept

Performance analysis answers: **"Why is this slow and how do we fix it?"**

Performance is about:
- **Latency** — How long does it take? (response time)
- **Throughput** — How much can it handle? (requests/second)
- **Resource efficiency** — How much does it cost? (CPU, memory, I/O)

The optimization process:
1. **Measure** — Get baseline numbers
2. **Identify** — Find the bottleneck
3. **Optimize** — Fix the bottleneck
4. **Verify** — Confirm improvement
5. **Repeat** — Next bottleneck

## The Performance Analysis Process

```
┌─────────────────────────────────────────────────────────┐
│            PERFORMANCE ANALYSIS PROCESS                 │
│                                                         │
│  1. DEFINE REQUIREMENTS                                 │
│     └─→ What are acceptable performance targets?        │
│                                                         │
│  2. MEASURE BASELINE                                    │
│     └─→ Current latency, throughput, resource usage     │
│                                                         │
│  3. IDENTIFY BOTTLENECKS                                │
│     └─→ Profile, trace, analyze metrics                 │
│                                                         │
│  4. ANALYZE ROOT CAUSE                                  │
│     └─→ Why is this the bottleneck?                     │
│                                                         │
│  5. OPTIMIZE                                            │
│     └─→ Apply targeted fix                              │
│                                                         │
│  6. VERIFY IMPROVEMENT                                  │
│     └─→ Measure again, compare to baseline              │
│                                                         │
│  7. DOCUMENT & MONITOR                                  │
│     └─→ Record findings, set up alerts                  │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Define Performance Requirements

### Setting Targets

```markdown
## Performance Requirements

### Response Time (Latency)
| Endpoint | p50 | p95 | p99 |
|----------|-----|-----|-----|
| GET /api/users | <50ms | <100ms | <200ms |
| POST /api/orders | <200ms | <500ms | <1s |
| Page load (FCP) | <1s | <2s | <3s |

### Throughput
| Scenario | Target |
|----------|--------|
| Normal load | 1,000 req/s |
| Peak load | 5,000 req/s |
| Sustained | 500 req/s for 1 hour |

### Resource Limits
| Resource | Limit |
|----------|-------|
| CPU | <70% average |
| Memory | <80% of available |
| Database connections | <80% of pool |
```

### Performance Budgets

```markdown
## Frontend Performance Budget

| Metric | Budget |
|--------|--------|
| First Contentful Paint (FCP) | <1.8s |
| Largest Contentful Paint (LCP) | <2.5s |
| First Input Delay (FID) | <100ms |
| Cumulative Layout Shift (CLS) | <0.1 |
| Time to Interactive (TTI) | <3.8s |
| Total Bundle Size | <200KB gzipped |
| JavaScript | <100KB gzipped |
| CSS | <50KB gzipped |
| Images | <500KB total |
```

## Step 2: Measure Baseline

### What to Measure

| Layer | Metrics |
|-------|---------|
| **Frontend** | FCP, LCP, TTI, bundle size, render time |
| **API** | Response time (p50/p95/p99), throughput, error rate |
| **Database** | Query time, connection pool, locks |
| **Infrastructure** | CPU, memory, disk I/O, network |

### Measurement Tools

```bash
# API response time
curl -w "@curl-format.txt" -o /dev/null -s "http://api.example.com/users"

# curl-format.txt:
#     time_namelookup:  %{time_namelookup}s\n
#        time_connect:  %{time_connect}s\n
#     time_appconnect:  %{time_appconnect}s\n
#    time_pretransfer:  %{time_pretransfer}s\n
#       time_redirect:  %{time_redirect}s\n
#  time_starttransfer:  %{time_starttransfer}s\n
#                     ----------\n
#          time_total:  %{time_total}s\n
```

```typescript
// Application-level timing
const start = performance.now();
const result = await heavyOperation();
const duration = performance.now() - start;
console.log(`Operation took ${duration}ms`);

// With context
console.time('database-query');
const users = await db.users.findMany();
console.timeEnd('database-query');
```

### Baseline Report Template

```markdown
## Performance Baseline Report
**Date:** 2024-01-15
**Environment:** Production
**Load:** Normal (500 req/min)

### API Endpoints
| Endpoint | p50 | p95 | p99 | Throughput |
|----------|-----|-----|-----|------------|
| GET /api/users | 45ms | 120ms | 350ms | 100 req/s |
| GET /api/orders | 80ms | 250ms | 800ms | 50 req/s |
| POST /api/orders | 150ms | 400ms | 1.2s | 20 req/s |

### Database
| Query | Avg Time | Calls/min |
|-------|----------|-----------|
| SELECT users | 5ms | 1000 |
| SELECT orders JOIN | 45ms | 500 |
| INSERT orders | 15ms | 200 |

### Resources
| Resource | Average | Peak |
|----------|---------|------|
| CPU | 35% | 65% |
| Memory | 2.1GB / 4GB | 2.8GB |
| DB Connections | 15 / 50 | 35 |
```

## Step 3: Identify Bottlenecks

### The Bottleneck Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│              WHERE IS THE BOTTLENECK?                   │
│                                                         │
│  Network?                                               │
│  ├─→ DNS resolution                                     │
│  ├─→ TLS handshake                                      │
│  ├─→ Bandwidth                                          │
│  └─→ Latency (geography)                                │
│                                                         │
│  Application?                                           │
│  ├─→ CPU-bound (computation)                            │
│  ├─→ Memory-bound (allocations, GC)                     │
│  ├─→ I/O-bound (waiting for external)                   │
│  └─→ Concurrency (locks, thread pool)                   │
│                                                         │
│  Database?                                              │
│  ├─→ Slow queries                                       │
│  ├─→ Missing indexes                                    │
│  ├─→ Lock contention                                    │
│  └─→ Connection pool exhaustion                         │
│                                                         │
│  External Services?                                     │
│  ├─→ Third-party API latency                            │
│  ├─→ Cache misses                                       │
│  └─→ Queue backlog                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Profiling Tools

| Type | Node.js | Browser | Python |
|------|---------|---------|--------|
| CPU | `--prof`, clinic.js | DevTools Performance | cProfile, py-spy |
| Memory | `--inspect`, heapdump | DevTools Memory | memory_profiler |
| Async | clinic.js bubbleprof | DevTools | asyncio debug |
| Tracing | OpenTelemetry | Lighthouse | OpenTelemetry |

### Quick Diagnostics

```typescript
// Find slow operations with simple timing
async function profiledHandler(req: Request, res: Response) {
  const timings: Record<string, number> = {};
  
  const time = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    timings[name] = performance.now() - start;
    return result;
  };
  
  const user = await time('getUser', () => userService.getById(req.params.id));
  const orders = await time('getOrders', () => orderService.getByUser(user.id));
  const enriched = await time('enrich', () => enrichOrders(orders));
  
  console.log('Timings:', timings);
  // Timings: { getUser: 5, getOrders: 450, enrich: 12 }
  // ^ getOrders is the bottleneck!
  
  res.json(enriched);
}
```

→ See `references/profiling-tools.md`

## Step 4: Analyze Root Cause

### Common Bottleneck Patterns

| Symptom | Likely Cause | Investigation |
|---------|--------------|---------------|
| High CPU, fast response | Efficient but heavy computation | Profile CPU |
| High CPU, slow response | Inefficient algorithm | Profile hot paths |
| Low CPU, slow response | I/O bound (DB, network, disk) | Trace external calls |
| Memory growing | Leak or unbounded cache | Heap snapshot |
| Periodic slowdowns | GC pauses or cron jobs | Correlate with logs |
| Slow under load only | Contention or pool exhaustion | Load test + profile |

### Database Analysis

```sql
-- PostgreSQL: Find slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Find missing indexes
SELECT
  schemaname,
  tablename,
  seq_scan,
  idx_scan,
  seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
ORDER BY seq_tup_read DESC;

-- Analyze specific query
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders 
WHERE user_id = 123 
ORDER BY created_at DESC 
LIMIT 10;
```

### N+1 Query Detection

```typescript
// BAD: N+1 queries
const users = await User.findAll();
for (const user of users) {
  user.orders = await Order.findAll({ where: { userId: user.id } });
  // This runs N additional queries!
}

// GOOD: Eager loading
const users = await User.findAll({
  include: [{ model: Order }]
});
// Single query with JOIN
```

→ See `references/database-optimization.md`

## Step 5: Optimize

### Optimization Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **Caching** | Repeated expensive operations | Redis, CDN |
| **Indexing** | Slow database queries | Add missing indexes |
| **Batching** | Many small operations | Bulk inserts |
| **Async/Parallel** | Independent operations | Promise.all |
| **Lazy loading** | Data not always needed | Load on demand |
| **Pagination** | Large result sets | Limit + offset |
| **Denormalization** | Complex joins | Store computed values |
| **Algorithm** | Inefficient code | Better Big-O |

### Code Optimizations

```typescript
// SLOW: Sequential async
for (const id of ids) {
  const result = await fetchData(id);
  results.push(result);
}

// FAST: Parallel async
const results = await Promise.all(ids.map(id => fetchData(id)));

// FAST with concurrency limit
import pLimit from 'p-limit';
const limit = pLimit(10);
const results = await Promise.all(
  ids.map(id => limit(() => fetchData(id)))
);
```

```typescript
// SLOW: Repeated expensive computation
function renderUsers(users: User[]) {
  return users.map(user => ({
    ...user,
    displayName: computeExpensiveDisplayName(user), // Called every render
  }));
}

// FAST: Memoization
const memoizedDisplayName = memoize(computeExpensiveDisplayName);
function renderUsers(users: User[]) {
  return users.map(user => ({
    ...user,
    displayName: memoizedDisplayName(user),
  }));
}
```

### Caching Patterns

```typescript
// Cache-aside pattern
async function getUser(id: string): Promise<User> {
  // Check cache
  const cached = await cache.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  
  // Fetch from DB
  const user = await db.users.findById(id);
  
  // Store in cache
  await cache.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
  
  return user;
}

// Write-through pattern
async function updateUser(id: string, data: Partial<User>): Promise<User> {
  // Update DB
  const user = await db.users.update(id, data);
  
  // Update cache
  await cache.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
  
  return user;
}
```

→ See `references/optimization-patterns.md`

## Step 6: Verify Improvement

### Before/After Comparison

```markdown
## Optimization Results

### Change
Added index on `orders.user_id` and implemented eager loading.

### Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| GET /api/users/:id/orders p50 | 450ms | 45ms | **90%** |
| GET /api/users/:id/orders p99 | 1.2s | 120ms | **90%** |
| Database CPU | 65% | 25% | **62%** |
| Queries per request | 51 | 2 | **96%** |

### Verification
- [x] Load test passed (1000 req/s sustained)
- [x] No errors in 1 hour test
- [x] Memory stable (no leaks)
```

### Statistical Validity

```typescript
// Don't trust single measurements
// Run multiple times and use statistics

import { mean, std, quantile } from 'simple-statistics';

async function benchmark(fn: () => Promise<void>, iterations = 100) {
  const times: number[] = [];
  
  // Warmup
  for (let i = 0; i < 10; i++) await fn();
  
  // Measure
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }
  
  return {
    mean: mean(times),
    std: std(times),
    p50: quantile(times, 0.5),
    p95: quantile(times, 0.95),
    p99: quantile(times, 0.99),
    min: Math.min(...times),
    max: Math.max(...times),
  };
}
```

## Step 7: Document & Monitor

### Performance Documentation

```markdown
## Performance Optimization Record

**Date:** 2024-01-15
**Author:** @engineer
**Component:** Order Service

### Problem
GET /api/users/:id/orders endpoint taking 450ms average,
causing timeout errors under load.

### Analysis
- Profiling showed 95% time in database queries
- N+1 query pattern: 1 query for user + N queries for orders
- Missing index on orders.user_id

### Solution
1. Added composite index: `CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC)`
2. Implemented eager loading with single JOIN query
3. Added Redis cache with 5-minute TTL

### Results
- Latency reduced from 450ms to 45ms (90% improvement)
- Database load reduced by 60%
- Can now handle 10x more concurrent requests

### Monitoring
- Alert if p99 > 200ms
- Dashboard: grafana.example.com/d/orders
```

### Monitoring Setup

```typescript
// Custom metrics for performance monitoring
import { Histogram, Counter } from 'prom-client';

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['query_type', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
});

// Middleware to track HTTP duration
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path, status: res.statusCode });
  });
  next();
});
```

→ See `references/load-testing.md`

## Load Testing

### Load Test Scenarios

| Scenario | Purpose | Pattern |
|----------|---------|---------|
| **Smoke** | Basic sanity check | 1-2 users, few seconds |
| **Load** | Normal production load | Expected users, 10-30 min |
| **Stress** | Find breaking point | Ramp up until failure |
| **Spike** | Handle sudden traffic | Sudden burst, then normal |
| **Soak** | Find memory leaks | Moderate load, hours |

### k6 Load Test Example

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 200 },  // Ramp to 200
    { duration: '5m', target: 200 },  // Stay at 200
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
};

export default function () {
  const res = http.get('http://api.example.com/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

```bash
# Run load test
k6 run load-test.js

# With output to cloud
k6 run --out cloud load-test.js
```

→ See `references/load-testing.md`

## Frontend Performance

### Core Web Vitals

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| **LCP** (Largest Contentful Paint) | ≤2.5s | ≤4s | >4s |
| **FID** (First Input Delay) | ≤100ms | ≤300ms | >300ms |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | ≤0.25 | >0.25 |

### Frontend Optimization Checklist

```markdown
## Frontend Performance Checklist

### Loading
- [ ] Bundle size minimized (code splitting)
- [ ] Images optimized (WebP, lazy loading)
- [ ] Critical CSS inlined
- [ ] Fonts optimized (subset, preload)
- [ ] Third-party scripts deferred

### Rendering
- [ ] No layout thrashing
- [ ] Virtualized long lists
- [ ] Debounced scroll/resize handlers
- [ ] No forced synchronous layouts

### Caching
- [ ] Static assets have cache headers
- [ ] Service worker for offline
- [ ] API responses cached appropriately
```

→ See `references/frontend-performance.md`

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `architect` | Performance requirements in architecture |
| `implement` | Write performant code from the start |
| `code-review` | Review for performance issues |
| `code-validation` | Performance tests validate behavior |
| `debug-assist` | Performance issues are a type of bug |
| `security-audit` | DoS prevention is security + performance |

## Key Principles

**Measure first.** Don't optimize without data.

**Find the bottleneck.** Optimizing non-bottlenecks is waste.

**One change at a time.** Know what helped.

**Verify improvement.** Measure after, compare to before.

**Good enough is enough.** Stop when targets are met.

**Document findings.** Future you will thank you.

## Mode-Specific Behavior

Performance analysis differs by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full system - establish baselines and performance budgets |
| **Approach** | Comprehensive profiling and load testing |
| **Patterns** | Free choice of monitoring and optimization patterns |
| **Deliverables** | Full PERF-ANALYSIS.md with baselines, budgets, and test results |
| **Validation** | Standard load testing (smoke, load, stress, soak) |
| **Constraints** | Minimal - define targets based on requirements |

**Greenfield performance analysis:**
- Define performance requirements upfront
- Establish baseline measurements
- Set up performance monitoring
- Proactive optimization during development
- Full load testing before launch

**Greenfield deliverables:**
```markdown
- PERF-ANALYSIS.md with baseline
- Performance budgets defined
- Monitoring dashboards created
- Load test results documented
```

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific - identify and address performance gaps |
| **Approach** | Extend existing monitoring and optimization |
| **Patterns** | Should match existing performance patterns |
| **Deliverables** | Delta updates to PERF-ANALYSIS.md |
| **Validation** | Existing baselines plus new gap coverage |
| **Constraints** | Don't regress existing performance |

**Polish considerations:**
- Baseline existing performance
- Identify performance gaps
- Ensure changes don't regress
- Fill performance monitoring gaps
- Targeted optimization of gaps

**Polish focus areas:**
```markdown
- What's slow that shouldn't be?
- What's missing monitoring?
- Where are performance gaps?
- How do we avoid regressions?
```

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific - measure impact of specific changes only |
| **Approach** | Surgical before/after comparison |
| **Patterns** | Must conform exactly to existing performance standards |
| **Deliverables** | Change record with performance impact documentation |
| **Validation** | Full regression testing against baselines |
| **Constraints** | Requires approval for any optimization; no speculative changes |

**Enterprise performance analysis:**
- Measure baseline before change
- Measure after change
- Verify no performance regression
- Document any performance impact
- Escalate if regression detected

**Enterprise constraints:**
- No speculative optimization
- Changes must not degrade performance
- Performance regression blocks deployment
- Document performance impact of change

### Performance Requirements by Mode

| Mode | Response Time | Throughput | Resources |
|------|---------------|------------|-----------|
| **Greenfield** | Define from scratch | Define from scratch | Define budgets |
| **Polish** | Match existing or improve | Match existing | Match existing |
| **Enterprise** | No regression | No regression | No increase |

### Load Testing by Mode

| Mode | Test Types | Duration | Pass Criteria |
|------|------------|----------|---------------|
| **Greenfield** | All (smoke, load, stress, soak) | Comprehensive | Meet targets |
| **Polish** | Load, regression | Focused | No regression + gaps |
| **Enterprise** | Impact, regression | Minimal | No regression |

## References

- `references/profiling-tools.md`: CPU, memory, and async profiling
- `references/database-optimization.md`: Query analysis and indexing
- `references/optimization-patterns.md`: Caching, batching, algorithms
- `references/load-testing.md`: k6, Artillery, stress testing
- `references/frontend-performance.md`: Core Web Vitals, bundle optimization

- `references/profiling-tools.md`: CPU, memory, and async profiling
- `references/database-optimization.md`: Query analysis and indexing
- `references/optimization-patterns.md`: Caching, batching, algorithms
- `references/load-testing.md`: k6, Artillery, stress testing
- `references/frontend-performance.md`: Core Web Vitals, bundle optimization
