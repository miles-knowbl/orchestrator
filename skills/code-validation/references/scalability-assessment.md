# Scalability Assessment

Analyzing what happens when load increases.

## Why This Matters

Code that works at 100 users breaks at 10,000. Code that works with 10,000 database rows crawls at 10 million. AI-generated code optimizes for correctness at current scale—you need to think about future scale.

## Scalability Questions Framework

### The Core Question

> "What is N, and what happens when N × 10?"

For every piece of code, identify what scales:
- Number of users
- Number of records
- Request rate
- Data size
- Concurrent connections

Then ask: what breaks first?

## Scalability Dimensions

### 1. Data Volume

**What happens as data grows?**

| Concern | Current | 10x | 100x |
|---------|---------|-----|------|
| Table rows | 10K | 100K | 1M |
| Query time | 50ms | ? | ? |
| Memory usage | 100MB | ? | ? |
| Index size | 10MB | ? | ? |

**What to check:**
```markdown
- [ ] Queries use indexes (EXPLAIN ANALYZE)
- [ ] Pagination implemented (not loading all)
- [ ] Aggregations are bounded
- [ ] Old data archival strategy exists
- [ ] Partitioning needed?
```

### 2. Request Rate

**What happens as traffic grows?**

| Concern | Current | 10x | 100x |
|---------|---------|-----|------|
| Requests/sec | 10 | 100 | 1000 |
| Response time | 100ms | ? | ? |
| CPU usage | 20% | ? | ? |
| DB connections | 5 | 50 | 500? |

**What to check:**
```markdown
- [ ] Connection pooling configured
- [ ] Caching for repeated queries
- [ ] Rate limiting for protection
- [ ] Horizontal scaling possible
- [ ] No per-request resource leaks
```

### 3. Concurrency

**What happens with more simultaneous users?**

| Concern | What Breaks |
|---------|-------------|
| Lock contention | Operations wait, timeout |
| Connection exhaustion | New requests rejected |
| Race conditions | Data corruption |
| Thundering herd | Cache stampede |

**What to check:**
```markdown
- [ ] Locks are fine-grained
- [ ] Connection pools sized for concurrency
- [ ] Race conditions handled
- [ ] Cache stampede protection
```

### 4. Payload Size

**What happens with larger data?**

| Concern | Current | 10x | 100x |
|---------|---------|-----|------|
| Request body | 1KB | 10KB | 100KB |
| Response body | 10KB | 100KB | 1MB |
| File uploads | 1MB | 10MB | 100MB |

**What to check:**
```markdown
- [ ] Request size limits set
- [ ] Streaming for large responses
- [ ] Pagination for lists
- [ ] Chunked uploads for large files
- [ ] Memory usage bounded
```

## Bottleneck Identification

### Common Bottlenecks

| Bottleneck | Symptoms | Diagnosis | Fix |
|------------|----------|-----------|-----|
| Database queries | High latency, DB CPU | EXPLAIN, slow query log | Index, cache, optimize |
| Connection pool | Requests waiting | Pool metrics | Increase pool, optimize queries |
| Memory | OOM, GC pauses | Memory profiling | Reduce allocation, streaming |
| CPU | High CPU, slow responses | CPU profiling | Optimize hot paths, cache |
| Network | High latency to external | Latency metrics | Caching, connection reuse |
| Single resource | One thing at 100% | Resource metrics | Scale or optimize that resource |

### Finding the Bottleneck

Ask these questions in order:

1. **What's the slowest part?** (measure, don't guess)
2. **What resource is most utilized?** (CPU? Memory? DB? Network?)
3. **What happens if we add more of that resource?**
4. **What becomes the bottleneck after?**

## Scalability Patterns

### Patterns That Scale

| Pattern | Why It Scales |
|---------|---------------|
| Stateless services | Can add instances |
| Connection pooling | Reuse expensive resources |
| Caching | Reduce repeated work |
| Pagination | Bound response size |
| Async processing | Decouple from request |
| Partitioning/sharding | Divide data across nodes |
| Read replicas | Scale reads independently |

### Patterns That Don't Scale

| Pattern | Why It Doesn't Scale |
|---------|----------------------|
| Loading all into memory | O(n) memory |
| Full table scans | O(n) queries |
| Synchronous external calls | Latency accumulates |
| Global locks | Serializes operations |
| Single database | Vertical scaling limits |
| Session stickiness | Uneven load distribution |

## Scalability Checklist

### Database Queries

```markdown
For each query:
- [ ] Uses appropriate indexes
- [ ] No SELECT * (only needed columns)
- [ ] Has LIMIT/pagination
- [ ] No N+1 patterns
- [ ] EXPLAIN ANALYZE looks reasonable
- [ ] Estimated rows at scale are acceptable
```

### API Endpoints

```markdown
For each endpoint:
- [ ] Response size bounded
- [ ] Pagination for lists
- [ ] Caching where appropriate
- [ ] No unbounded loops
- [ ] Async for expensive operations
```

### Background Jobs

```markdown
For each job:
- [ ] Batch size limited
- [ ] Can be parallelized
- [ ] Progress is resumable
- [ ] Memory usage bounded
- [ ] Run time predictable
```

## Load Estimation

### How to Estimate

1. **Current load**: What are the actual numbers today?
2. **Growth rate**: How fast is it growing?
3. **Target horizon**: What load in 1 year? 3 years?
4. **Margin**: 2-3x headroom beyond target

### Example Estimation

```markdown
## Load Estimation: Order Service

**Current (measured):**
- Orders/day: 1,000
- Peak orders/hour: 200
- Orders table size: 500K rows
- Avg response time: 80ms

**Growth:**
- Orders growing 3x/year
- Users growing 2x/year

**1-Year Target:**
- Orders/day: 3,000
- Peak orders/hour: 600
- Orders table size: 1.5M rows

**3-Year Target:**
- Orders/day: 27,000
- Peak orders/hour: 5,400
- Orders table size: 13.5M rows

**Current architecture can handle:**
- Orders/day: ~5,000 (tested)
- Table size: ~2M (before queries degrade)

**Action needed:**
- Query optimization before 1.5M rows
- Consider sharding before 10M rows
```

## Output Format

When documenting scalability assessment:

```markdown
## Scalability Assessment

### Current Scale
- Users: 5,000 DAU
- Requests: 50/sec peak
- Data: 500K orders, 2M line items

### Growth Projection
- 3x in 12 months based on current trend

### Bottleneck Analysis

**Database:**
- ✅ Queries use indexes
- ✅ Pagination implemented
- ⚠️ Aggregate queries may slow at 2M+ orders
  - Recommendation: Pre-compute daily summaries

**API:**
- ✅ Response size bounded
- ✅ Caching for product catalog
- ⚠️ Order history loads all orders
  - Blocker: Add pagination

**Background Jobs:**
- ✅ Batch processing for exports
- ❌ Invoice generation is serial
  - Recommendation: Parallelize invoice generation

### Scaling Strategy

| At | Action Needed |
|----|---------------|
| 2M orders | Optimize aggregate queries |
| 10M orders | Consider partitioning by date |
| 500 req/sec | Add read replica |
| 1000 req/sec | Consider caching layer |

### Blockers
1. Order history must have pagination before 10K orders/user

### Recommendations
1. Pre-compute daily order summaries
2. Parallelize invoice generation
3. Add query for order count to avoid loading all
```
