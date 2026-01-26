# Database Optimization

Techniques for optimizing database performance.

## Query Analysis

### Identifying Slow Queries

```sql
-- PostgreSQL: Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 100;  -- ms
SELECT pg_reload_conf();

-- MySQL: Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1;  -- seconds
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- View slow query log
-- PostgreSQL: /var/log/postgresql/
-- MySQL: SHOW VARIABLES LIKE 'slow_query_log_file';
```

### Execution Plan Analysis

```sql
-- PostgreSQL EXPLAIN
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.*, u.name as user_name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC
LIMIT 10;

/* Output analysis:
Limit  (cost=1000.00..1000.50 rows=10 width=200) (actual time=50.123..50.145 rows=10 loops=1)
  ->  Sort  (cost=1000.00..1025.00 rows=10000 width=200) (actual time=50.120..50.130 rows=10 loops=1)
        Sort Key: o.created_at DESC
        Sort Method: top-N heapsort  Memory: 25kB
        ->  Hash Join  (cost=100.00..800.00 rows=10000 width=200) (actual time=5.000..45.000 rows=10000 loops=1)
              Hash Cond: (o.user_id = u.id)
              ->  Seq Scan on orders o  (cost=0.00..500.00 rows=10000 width=150) (actual time=0.010..30.000 rows=10000 loops=1)
                    Filter: (status = 'pending')
                    Rows Removed by Filter: 90000    <- Reading 100k rows to get 10k!
              ->  Hash  (cost=50.00..50.00 rows=1000 width=50) (actual time=4.500..4.500 rows=1000 loops=1)
                    ->  Seq Scan on users u ...
Planning Time: 0.500 ms
Execution Time: 50.500 ms

Problems identified:
1. Seq Scan on orders with filter removing 90% of rows -> Need index on status
2. Sorting 10000 rows to get 10 -> Need composite index for ORDER BY
*/
```

### Plan Node Types

| Node Type | What It Means | Optimization |
|-----------|---------------|--------------|
| Seq Scan | Full table scan | Add index |
| Index Scan | Using index | Good |
| Index Only Scan | Using covering index | Best |
| Bitmap Scan | Combines multiple indexes | Acceptable for complex queries |
| Nested Loop | O(n*m) joins | Ensure inner side is indexed |
| Hash Join | Builds hash table | Good for large joins |
| Merge Join | Both sides sorted | Good for sorted data |
| Sort | Sorting in memory/disk | Add index for ORDER BY |

## Indexing Strategies

### Index Types

```sql
-- B-tree (default): Equality and range queries
CREATE INDEX idx_orders_created ON orders(created_at);
-- Good for: =, <, >, <=, >=, BETWEEN, IN, IS NULL

-- Hash: Equality only (PostgreSQL)
CREATE INDEX idx_users_email ON users USING HASH (email);
-- Good for: = only (faster than B-tree for equality)

-- GIN: Full-text search, arrays, JSONB
CREATE INDEX idx_products_tags ON products USING GIN (tags);
-- Good for: @>, ?, ?&, ?| on arrays/jsonb

-- GiST: Geometric, full-text
CREATE INDEX idx_locations_point ON locations USING GIST (point);
-- Good for: Spatial queries, range types

-- Partial: Index subset of rows
CREATE INDEX idx_orders_pending ON orders(created_at) 
WHERE status = 'pending';
-- Only indexes pending orders
```

### Composite Indexes

```sql
-- Order matters! (leftmost prefix rule)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- This index helps:
WHERE user_id = 123                          -- ✓ Uses full index
WHERE user_id = 123 AND status = 'pending'   -- ✓ Uses full index
WHERE user_id = 123 ORDER BY status          -- ✓ Uses full index

-- This index does NOT help:
WHERE status = 'pending'                     -- ✗ Can't use (no user_id)
ORDER BY status                              -- ✗ Can't use (no user_id)
```

### Covering Indexes (Index-Only Scans)

```sql
-- Include non-key columns
CREATE INDEX idx_orders_user_covering ON orders(user_id) 
INCLUDE (total, status);

-- Query can be satisfied from index alone
SELECT total, status FROM orders WHERE user_id = 123;
-- Index-only scan: no table access needed!
```

### Index Maintenance

```sql
-- Find unused indexes (PostgreSQL)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%pkey%';

-- Find duplicate indexes
SELECT
  indrelid::regclass as table,
  array_agg(indexrelid::regclass) as indexes
FROM pg_index
GROUP BY indrelid, indkey
HAVING COUNT(*) > 1;

-- Rebuild bloated indexes
REINDEX INDEX idx_orders_user_id;
-- Or concurrently (no locks)
REINDEX INDEX CONCURRENTLY idx_orders_user_id;
```

## Query Optimization

### N+1 Query Problem

```typescript
// BAD: N+1 queries
const orders = await Order.findAll({ where: { status: 'pending' } });
for (const order of orders) {
  order.user = await User.findByPk(order.userId);  // N additional queries!
  order.items = await OrderItem.findAll({ where: { orderId: order.id } });  // N more!
}

// GOOD: Eager loading (2 queries with JOIN)
const orders = await Order.findAll({
  where: { status: 'pending' },
  include: [
    { model: User },
    { model: OrderItem },
  ],
});

// GOOD: Batch loading (3 queries total)
const orders = await Order.findAll({ where: { status: 'pending' } });
const userIds = [...new Set(orders.map(o => o.userId))];
const users = await User.findAll({ where: { id: userIds } });
const userMap = new Map(users.map(u => [u.id, u]));
orders.forEach(o => o.user = userMap.get(o.userId));
```

### Pagination

```sql
-- OFFSET pagination (slow for deep pages)
SELECT * FROM orders ORDER BY id LIMIT 10 OFFSET 10000;
-- Must scan 10010 rows!

-- Keyset/Cursor pagination (fast)
SELECT * FROM orders 
WHERE id > :last_id 
ORDER BY id 
LIMIT 10;
-- Always scans just 10 rows

-- For complex sorting
SELECT * FROM orders 
WHERE (created_at, id) > (:last_created_at, :last_id)
ORDER BY created_at, id
LIMIT 10;
```

### Batch Operations

```sql
-- BAD: Individual inserts
INSERT INTO items (name) VALUES ('a');
INSERT INTO items (name) VALUES ('b');
INSERT INTO items (name) VALUES ('c');

-- GOOD: Batch insert
INSERT INTO items (name) VALUES ('a'), ('b'), ('c');

-- BAD: Individual updates
UPDATE users SET last_seen = NOW() WHERE id = 1;
UPDATE users SET last_seen = NOW() WHERE id = 2;

-- GOOD: Batch update
UPDATE users SET last_seen = NOW() WHERE id IN (1, 2, 3);

-- GOOD: UPSERT batch
INSERT INTO stats (user_id, count) 
VALUES (1, 1), (2, 1), (3, 1)
ON CONFLICT (user_id) 
DO UPDATE SET count = stats.count + 1;
```

### Query Rewrites

```sql
-- BAD: OR on different columns (can't use index efficiently)
SELECT * FROM orders WHERE user_id = 123 OR status = 'pending';

-- GOOD: UNION (uses indexes)
SELECT * FROM orders WHERE user_id = 123
UNION
SELECT * FROM orders WHERE status = 'pending';

-- BAD: Function on indexed column
SELECT * FROM users WHERE LOWER(email) = 'test@example.com';

-- GOOD: Expression index
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
-- Or store normalized
SELECT * FROM users WHERE email_normalized = 'test@example.com';

-- BAD: LIKE with leading wildcard
SELECT * FROM products WHERE name LIKE '%widget%';

-- GOOD: Full-text search
CREATE INDEX idx_products_name_fts ON products USING GIN(to_tsvector('english', name));
SELECT * FROM products WHERE to_tsvector('english', name) @@ to_tsquery('widget');
```

## Connection Management

### Connection Pooling

```typescript
// Node.js with pg-pool
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  database: 'myapp',
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail if can't connect in 2s
});

// Use pool for queries
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

// Monitor pool
pool.on('error', (err) => console.error('Pool error', err));
pool.on('connect', () => console.log('New connection'));
pool.on('remove', () => console.log('Connection removed'));
```

### Connection Pool Sizing

```markdown
## Pool Sizing Guidelines

### Formula
connections = ((core_count * 2) + effective_spindle_count)

For SSD: effective_spindle_count ≈ 1
For 4-core server with SSD: (4 * 2) + 1 = 9 connections

### Per-Application
If you have 3 app servers, each with pool size 10:
- Total connections: 30
- Database max_connections should be > 30 + some buffer

### Signs of Wrong Pool Size
Too small:
- Queries waiting for connections
- Connection timeout errors

Too large:
- Memory pressure on database
- Context switching overhead
- Lock contention
```

## Caching Strategies

### Query Result Caching

```typescript
import Redis from 'ioredis';

const redis = new Redis();

async function getUser(userId: string): Promise<User> {
  const cacheKey = `user:${userId}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Query database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  
  // Cache result (expire in 5 minutes)
  await redis.setex(cacheKey, 300, JSON.stringify(user));
  
  return user;
}

// Invalidate on update
async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  const user = await db.query(
    'UPDATE users SET ... WHERE id = $1 RETURNING *',
    [userId, ...]
  );
  
  // Invalidate cache
  await redis.del(`user:${userId}`);
  
  return user;
}
```

### Materialized Views

```sql
-- Create materialized view for expensive aggregation
CREATE MATERIALIZED VIEW order_stats AS
SELECT
  user_id,
  COUNT(*) as order_count,
  SUM(total) as total_spent,
  MAX(created_at) as last_order_at
FROM orders
GROUP BY user_id;

-- Create index on materialized view
CREATE INDEX idx_order_stats_user ON order_stats(user_id);

-- Refresh periodically
REFRESH MATERIALIZED VIEW order_stats;

-- Refresh concurrently (no locks, requires unique index)
REFRESH MATERIALIZED VIEW CONCURRENTLY order_stats;

-- Use in queries
SELECT u.*, os.order_count, os.total_spent
FROM users u
LEFT JOIN order_stats os ON u.id = os.user_id
WHERE u.id = 123;
```

## Database-Specific Optimizations

### PostgreSQL

```sql
-- Analyze tables for query planner
ANALYZE orders;

-- Vacuum to reclaim space
VACUUM orders;
-- Or full vacuum (locks table)
VACUUM FULL orders;

-- Tune work_mem for complex queries
SET work_mem = '256MB';
-- Good for: sorting, hash joins
-- Caution: per-operation, not per-query

-- Parallel query settings
SET max_parallel_workers_per_gather = 4;
SET parallel_tuple_cost = 0.01;
```

### MySQL/MariaDB

```sql
-- Buffer pool (most important setting)
SET GLOBAL innodb_buffer_pool_size = 4G;
-- Should be ~70-80% of available RAM

-- Query cache (deprecated in MySQL 8)
-- Use application-level caching instead

-- Index hints (use sparingly)
SELECT * FROM orders FORCE INDEX (idx_status) WHERE status = 'pending';
```

### MongoDB

```javascript
// Compound indexes
db.orders.createIndex({ userId: 1, createdAt: -1 });

// Text indexes
db.products.createIndex({ name: "text", description: "text" });

// Aggregation pipeline optimization
db.orders.aggregate([
  { $match: { status: "pending" } },  // Filter early!
  { $sort: { createdAt: -1 } },
  { $limit: 10 },
  { $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
  }}
]);

// allowDiskUse for large aggregations
db.orders.aggregate([...], { allowDiskUse: true });
```
