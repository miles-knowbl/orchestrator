# Profiling Tools

Tools and techniques for identifying performance bottlenecks.

## Node.js Profiling

### Built-in Profiler

```bash
# Generate V8 profile
node --prof app.js

# Process the profile
node --prof-process isolate-*.log > profile.txt

# Look for hot functions in output:
# [JavaScript]:
#   ticks  total  nonlib   name
#   1234   45.0%   50.0%  processOrder
```

### Chrome DevTools (Node Inspector)

```bash
# Start with inspector
node --inspect app.js

# Or break on start
node --inspect-brk app.js

# Open chrome://inspect in Chrome
# Go to "Performance" tab to record
```

### Clinic.js Suite

```bash
# Install
npm install -g clinic

# Doctor: Overall health check
clinic doctor -- node app.js

# Flame: CPU profiling (flame graphs)
clinic flame -- node app.js

# Bubbleprof: Async profiling
clinic bubbleprof -- node app.js

# HeapProfiler: Memory profiling
clinic heapprofiler -- node app.js
```

### Console Timing

```typescript
// Simple timing
console.time('operation');
await doSomething();
console.timeEnd('operation');
// operation: 123.456ms

// Nested timing
console.time('total');
console.time('step1');
await step1();
console.timeEnd('step1');
console.time('step2');
await step2();
console.timeEnd('step2');
console.timeEnd('total');
```

### Performance Hooks (Node.js)

```typescript
import { performance, PerformanceObserver } from 'perf_hooks';

// Observe performance entries
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
obs.observe({ entryTypes: ['measure'] });

// Mark and measure
performance.mark('start');
await doSomething();
performance.mark('end');
performance.measure('doSomething', 'start', 'end');

// Function timing wrapper
function timedAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    console.log(`${name}: ${duration.toFixed(2)}ms`);
  });
}
```

## Memory Profiling

### Heap Snapshots

```typescript
import v8 from 'v8';
import fs from 'fs';

// Take heap snapshot
function takeHeapSnapshot(filename: string) {
  const snapshotStream = v8.writeHeapSnapshot(filename);
  console.log(`Heap snapshot written to ${snapshotStream}`);
}

// Compare before/after
takeHeapSnapshot('before.heapsnapshot');
// ... do operations ...
takeHeapSnapshot('after.heapsnapshot');

// Open in Chrome DevTools Memory tab
```

### Memory Usage Tracking

```typescript
// Track memory over time
function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log({
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,        // Resident Set Size
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
  });
}

// Periodic logging
setInterval(logMemoryUsage, 10000);

// Force garbage collection (requires --expose-gc flag)
if (global.gc) {
  global.gc();
  logMemoryUsage();
}
```

### Finding Memory Leaks

```typescript
// Pattern: Growing arrays/maps
class LeakyCache {
  private cache = new Map();  // Never cleared!
  
  set(key: string, value: any) {
    this.cache.set(key, value);
  }
}

// Fix: Bounded cache with LRU eviction
import LRU from 'lru-cache';

class BoundedCache {
  private cache = new LRU({ max: 1000 });
  
  set(key: string, value: any) {
    this.cache.set(key, value);
  }
}

// Pattern: Event listener leaks
class LeakyComponent {
  constructor() {
    // Listener never removed!
    window.addEventListener('resize', this.onResize);
  }
}

// Fix: Clean up listeners
class ProperComponent {
  constructor() {
    window.addEventListener('resize', this.onResize);
  }
  
  destroy() {
    window.removeEventListener('resize', this.onResize);
  }
}
```

## Database Profiling

### PostgreSQL

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries > 100ms
SELECT pg_reload_conf();

-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries
SELECT 
  substring(query, 1, 100) as query,
  calls,
  round(total_exec_time::numeric, 2) as total_ms,
  round(mean_exec_time::numeric, 2) as mean_ms,
  round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) as percent
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Find queries with most calls
SELECT 
  substring(query, 1, 100) as query,
  calls,
  round(mean_exec_time::numeric, 2) as mean_ms
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 20;

-- Reset statistics
SELECT pg_stat_statements_reset();
```

### Query Execution Plans

```sql
-- Basic explain
EXPLAIN SELECT * FROM orders WHERE user_id = 123;

-- With actual execution stats
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 123;

-- What to look for:
-- Seq Scan: Table scan (might need index)
-- Nested Loop: Potentially slow for large datasets
-- Sort: Memory-intensive operation
-- Hash Join: Usually efficient
-- Index Scan: Good, using index

-- Example output analysis:
/*
Seq Scan on orders  (cost=0.00..1234.00 rows=100 width=50)
                     (actual time=0.015..45.123 rows=95 loops=1)
  Filter: (user_id = 123)
  Rows Removed by Filter: 9905
  Buffers: shared hit=500 read=100
Planning Time: 0.150 ms
Execution Time: 45.500 ms

Problem: Seq Scan reading 10,000 rows to find 95
Solution: CREATE INDEX idx_orders_user_id ON orders(user_id);
*/
```

### MongoDB

```javascript
// Enable profiler
db.setProfilingLevel(2);  // Log all queries

// Find slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(10);

// Explain query
db.orders.find({ userId: "123" }).explain("executionStats");

// Index usage stats
db.orders.aggregate([{ $indexStats: {} }]);

// Disable profiler
db.setProfilingLevel(0);
```

## Application Performance Monitoring (APM)

### OpenTelemetry Setup

```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://jaeger:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Custom spans
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service');

async function processOrder(orderId: string) {
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttribute('orderId', orderId);
    
    try {
      await tracer.startActiveSpan('validateOrder', async (validateSpan) => {
        await validateOrder(orderId);
        validateSpan.end();
      });
      
      await tracer.startActiveSpan('chargePayment', async (paymentSpan) => {
        await chargePayment(orderId);
        paymentSpan.end();
      });
      
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Custom Metrics

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('my-service');

// Counter
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
});

// Histogram
const requestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request duration in milliseconds',
});

// Usage in middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    requestCounter.add(1, {
      method: req.method,
      route: req.route?.path || 'unknown',
      status: res.statusCode,
    });
    
    requestDuration.record(duration, {
      method: req.method,
      route: req.route?.path || 'unknown',
    });
  });
  
  next();
});
```

## Browser Profiling

### Chrome DevTools Performance

```markdown
## Recording a Performance Profile

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record (or Ctrl+E)
4. Perform the action you want to profile
5. Click Stop

## What to Look For

### Main Thread Activity
- Yellow: JavaScript execution
- Purple: Rendering (style, layout, paint)
- Green: Painting
- Gray: Idle

### Long Tasks
- Any task > 50ms blocks the main thread
- Look for red triangles indicating long tasks

### Common Issues
- Forced synchronous layout (layout thrashing)
- Large JavaScript execution blocks
- Excessive paint/composite operations
```

### Lighthouse

```bash
# CLI
npm install -g lighthouse
lighthouse https://example.com --output html --output-path report.html

# Programmatic
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runLighthouse(url: string) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
  });
  
  await chrome.kill();
  return result;
}
```

### Web Vitals Monitoring

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
  });
  
  // Use sendBeacon for reliability
  navigator.sendBeacon('/analytics', body);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Flame Graphs

### Reading Flame Graphs

```
┌─────────────────────────────────────────────────────────┐
│                    main()                               │ ← Entry point (bottom)
├───────────────────────┬─────────────────────────────────┤
│     processOrder()    │        sendEmail()              │ ← Called by main
├───────────┬───────────┼─────────────────────────────────┤
│validateOrder│calculate│                                 │ ← Called by processOrder
├───────────┴───────────┤                                 │
│     dbQuery()         │                                 │ ← Hot spot (wide = slow)
└───────────────────────┴─────────────────────────────────┘

Width = Time spent
Height = Call depth
Look for wide boxes = bottlenecks
```

### Generating Flame Graphs

```bash
# Node.js with 0x
npm install -g 0x
0x app.js
# Opens flame graph in browser

# Node.js with clinic flame
clinic flame -- node app.js

# Linux perf + FlameGraph
perf record -g node app.js
perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg
```
