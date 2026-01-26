# Optimization Patterns

Common patterns for improving application performance.

## Caching Patterns

### Cache-Aside (Lazy Loading)

```typescript
async function getUser(userId: string): Promise<User> {
  // 1. Check cache
  const cached = await cache.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);
  
  // 2. Load from database
  const user = await db.users.findById(userId);
  
  // 3. Store in cache
  await cache.set(`user:${userId}`, JSON.stringify(user), 'EX', 3600);
  
  return user;
}

// Pros: Only caches what's actually used
// Cons: Cache miss is slow (DB + cache write)
```

### Write-Through

```typescript
async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  // 1. Update database
  const user = await db.users.update(userId, data);
  
  // 2. Update cache synchronously
  await cache.set(`user:${userId}`, JSON.stringify(user), 'EX', 3600);
  
  return user;
}

// Pros: Cache always consistent with DB
// Cons: Write latency increased
```

### Write-Behind (Write-Back)

```typescript
class WriteBackCache {
  private dirty = new Map<string, any>();
  private flushInterval: NodeJS.Timeout;
  
  constructor() {
    // Flush every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }
  
  async set(key: string, value: any): Promise<void> {
    // Write to cache immediately
    await cache.set(key, JSON.stringify(value));
    // Mark as dirty for later DB write
    this.dirty.set(key, value);
  }
  
  private async flush(): Promise<void> {
    const entries = [...this.dirty.entries()];
    this.dirty.clear();
    
    // Batch write to database
    await db.batchUpdate(entries);
  }
}

// Pros: Fast writes
// Cons: Data loss risk if crash before flush
```

### Cache Invalidation Strategies

```typescript
// 1. Time-based (TTL)
await cache.set('key', 'value', 'EX', 3600);  // Expire in 1 hour

// 2. Event-based
async function updateProduct(id: string, data: any) {
  await db.products.update(id, data);
  await cache.del(`product:${id}`);           // Invalidate specific
  await cache.del(`products:list`);           // Invalidate list
}

// 3. Version-based
async function getProducts(): Promise<Product[]> {
  const version = await cache.get('products:version');
  const cached = await cache.get(`products:list:${version}`);
  if (cached) return JSON.parse(cached);
  
  const products = await db.products.findAll();
  await cache.set(`products:list:${version}`, JSON.stringify(products));
  return products;
}

async function invalidateProducts() {
  await cache.incr('products:version');  // Bump version
}

// 4. Tag-based invalidation
async function cacheWithTags(key: string, value: any, tags: string[]) {
  await cache.set(key, JSON.stringify(value));
  for (const tag of tags) {
    await cache.sadd(`tag:${tag}`, key);
  }
}

async function invalidateTag(tag: string) {
  const keys = await cache.smembers(`tag:${tag}`);
  await cache.del(...keys, `tag:${tag}`);
}
```

### Cache Stampede Prevention

```typescript
// Problem: Cache expires, 100 requests all hit DB simultaneously

// Solution 1: Locking
async function getWithLock(key: string, fetchFn: () => Promise<any>) {
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached);
  
  const lockKey = `lock:${key}`;
  const acquired = await cache.set(lockKey, '1', 'NX', 'EX', 10);
  
  if (!acquired) {
    // Wait and retry
    await sleep(100);
    return getWithLock(key, fetchFn);
  }
  
  try {
    const value = await fetchFn();
    await cache.set(key, JSON.stringify(value), 'EX', 3600);
    return value;
  } finally {
    await cache.del(lockKey);
  }
}

// Solution 2: Probabilistic early expiration
async function getWithJitter(key: string, fetchFn: () => Promise<any>) {
  const data = await cache.get(key);
  if (!data) {
    return refreshAndCache(key, fetchFn);
  }
  
  const { value, expiresAt } = JSON.parse(data);
  const ttl = expiresAt - Date.now();
  
  // Probabilistically refresh before expiry
  const refreshProbability = Math.exp(-ttl / 60000);  // Higher as TTL decreases
  if (Math.random() < refreshProbability) {
    refreshAndCache(key, fetchFn);  // Fire and forget
  }
  
  return value;
}
```

## Async and Parallel Patterns

### Parallel Execution

```typescript
// BAD: Sequential
const user = await getUser(id);
const orders = await getOrders(id);
const preferences = await getPreferences(id);

// GOOD: Parallel
const [user, orders, preferences] = await Promise.all([
  getUser(id),
  getOrders(id),
  getPreferences(id),
]);

// With error handling
const results = await Promise.allSettled([
  getUser(id),
  getOrders(id),
  getPreferences(id),
]);

const [userResult, ordersResult, prefsResult] = results;
const user = userResult.status === 'fulfilled' ? userResult.value : null;
```

### Concurrency Limiting

```typescript
import pLimit from 'p-limit';

// Limit to 5 concurrent operations
const limit = pLimit(5);

const urls = ['url1', 'url2', /* ... 100 more */];

// Without limit: 100 concurrent requests
// const results = await Promise.all(urls.map(fetch));

// With limit: max 5 concurrent
const results = await Promise.all(
  urls.map(url => limit(() => fetch(url)))
);
```

### Batching

```typescript
import DataLoader from 'dataloader';

// Create batch loader
const userLoader = new DataLoader(async (ids: string[]) => {
  // Single query for all IDs
  const users = await db.users.findMany({ where: { id: { in: ids } } });
  
  // Return in same order as input
  const userMap = new Map(users.map(u => [u.id, u]));
  return ids.map(id => userMap.get(id) ?? null);
});

// Usage: automatically batched
async function getOrderWithUser(orderId: string) {
  const order = await db.orders.findById(orderId);
  const user = await userLoader.load(order.userId);  // Batched!
  return { ...order, user };
}

// Multiple calls in same tick are batched
const [user1, user2, user3] = await Promise.all([
  userLoader.load('1'),
  userLoader.load('2'),
  userLoader.load('3'),
]);
// Single DB query: SELECT * FROM users WHERE id IN ('1', '2', '3')
```

### Background Processing

```typescript
// Move slow operations out of request path
import { Queue, Worker } from 'bullmq';

const emailQueue = new Queue('email');

// In request handler: quick enqueue
app.post('/orders', async (req, res) => {
  const order = await createOrder(req.body);
  
  // Don't wait for email
  await emailQueue.add('order-confirmation', { orderId: order.id });
  
  res.json(order);  // Response in <100ms
});

// Worker processes in background
const worker = new Worker('email', async (job) => {
  const order = await getOrder(job.data.orderId);
  await sendEmail(order.user.email, 'Order Confirmed', ...);
});
```

## Algorithm Optimizations

### Memoization

```typescript
// Simple memoization
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

const expensiveCalculation = memoize((n: number) => {
  // Expensive computation
  return fibonacci(n);
});

// With size limit
import { LRUCache } from 'lru-cache';

function memoizeWithLimit<T extends (...args: any[]) => any>(fn: T, max = 1000): T {
  const cache = new LRUCache<string, any>({ max });
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
```

### Lazy Evaluation

```typescript
// Eager: computes everything
function getFullReport(data: Data[]) {
  const processed = data.map(expensiveProcess);      // All items
  const filtered = processed.filter(isRelevant);     // All items again
  return filtered.slice(0, 10);                      // Only need 10!
}

// Lazy: computes only what's needed
function* lazyProcess(data: Data[]) {
  for (const item of data) {
    const processed = expensiveProcess(item);
    if (isRelevant(processed)) {
      yield processed;
    }
  }
}

function getFullReport(data: Data[]) {
  const results = [];
  for (const item of lazyProcess(data)) {
    results.push(item);
    if (results.length >= 10) break;  // Stop early!
  }
  return results;
}
```

### Data Structure Selection

| Operation | Array | Set | Map | Object |
|-----------|-------|-----|-----|--------|
| Access by index | O(1) | - | - | - |
| Access by key | O(n) | - | O(1) | O(1) |
| Search | O(n) | O(1) | O(1) | O(1) |
| Insert | O(n)* | O(1) | O(1) | O(1) |
| Delete | O(n) | O(1) | O(1) | O(1) |

```typescript
// BAD: Array for lookups
const users = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }];
const user = users.find(u => u.id === targetId);  // O(n)

// GOOD: Map for lookups
const userMap = new Map(users.map(u => [u.id, u]));
const user = userMap.get(targetId);  // O(1)

// BAD: Array for uniqueness
const uniqueIds: string[] = [];
for (const id of ids) {
  if (!uniqueIds.includes(id)) {  // O(n) each check
    uniqueIds.push(id);
  }
}

// GOOD: Set for uniqueness
const uniqueIds = new Set(ids);  // O(n) total
```

### Early Termination

```typescript
// BAD: Always processes all items
function hasAdmin(users: User[]): boolean {
  return users.filter(u => u.role === 'admin').length > 0;
}

// GOOD: Stops at first match
function hasAdmin(users: User[]): boolean {
  return users.some(u => u.role === 'admin');
}

// BAD: Sorts entire array for top N
function getTop10(items: Item[]): Item[] {
  return items.sort((a, b) => b.score - a.score).slice(0, 10);
}

// GOOD: Partial sort / heap
function getTop10(items: Item[]): Item[] {
  const heap = new MinHeap<Item>((a, b) => a.score - b.score);
  
  for (const item of items) {
    heap.push(item);
    if (heap.size > 10) heap.pop();  // Remove smallest
  }
  
  return heap.toArray().reverse();
}
```

## Memory Optimization

### Object Pooling

```typescript
class ObjectPool<T> {
  private pool: T[] = [];
  private create: () => T;
  private reset: (obj: T) => void;
  
  constructor(create: () => T, reset: (obj: T) => void, initialSize = 10) {
    this.create = create;
    this.reset = reset;
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(create());
    }
  }
  
  acquire(): T {
    return this.pool.pop() ?? this.create();
  }
  
  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// Usage for expensive objects
const bufferPool = new ObjectPool(
  () => Buffer.allocUnsafe(1024),
  (buf) => buf.fill(0)
);

const buffer = bufferPool.acquire();
// Use buffer...
bufferPool.release(buffer);
```

### Streaming

```typescript
// BAD: Load entire file into memory
const content = await fs.readFile('large-file.json', 'utf8');
const data = JSON.parse(content);
for (const item of data) {
  process(item);
}

// GOOD: Stream processing
import { createReadStream } from 'fs';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';

const pipeline = createReadStream('large-file.json')
  .pipe(parser())
  .pipe(streamArray());

pipeline.on('data', ({ value }) => {
  process(value);
});

// For CSV
import csv from 'csv-parser';

createReadStream('large-file.csv')
  .pipe(csv())
  .on('data', (row) => process(row));
```

### String Optimization

```typescript
// BAD: String concatenation in loop
let result = '';
for (const item of items) {
  result += item.toString() + ',';  // Creates new string each iteration
}

// GOOD: Array join
const result = items.map(item => item.toString()).join(',');

// GOOD: StringBuilder pattern for many operations
const parts: string[] = [];
for (const item of items) {
  parts.push(item.toString());
}
const result = parts.join(',');
```

## Network Optimization

### Request Coalescing

```typescript
class RequestCoalescer<T> {
  private pending = new Map<string, Promise<T>>();
  
  async fetch(key: string, fetcher: () => Promise<T>): Promise<T> {
    // If request already in flight, return same promise
    const existing = this.pending.get(key);
    if (existing) return existing;
    
    const promise = fetcher().finally(() => {
      this.pending.delete(key);
    });
    
    this.pending.set(key, promise);
    return promise;
  }
}

const coalescer = new RequestCoalescer<User>();

// 100 concurrent calls for same user = 1 actual request
await Promise.all(
  Array(100).fill(null).map(() => 
    coalescer.fetch('user:123', () => fetchUser('123'))
  )
);
```

### Connection Reuse

```typescript
// HTTP Keep-Alive
import { Agent } from 'http';

const agent = new Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

fetch(url, { agent });

// Database connection pooling (covered in database-optimization.md)
```

### Compression

```typescript
import compression from 'compression';

// Enable gzip compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6,  // 1-9, higher = more compression, more CPU
  threshold: 1024,  // Don't compress below 1KB
}));
```
