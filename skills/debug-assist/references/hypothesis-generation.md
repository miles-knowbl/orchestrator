# Hypothesis Generation

How to think of all possible causes.

## Why This Matters

The root cause will be one of your hypotheses. If you don't think of it, you won't test it. Systematic hypothesis generation ensures you don't miss obvious (or non-obvious) possibilities.

## Hypothesis Categories

Work through each category to generate hypotheses:

### 1. Recent Changes

**"What changed?"** is the most powerful debugging question.

| Change Type | Questions to Ask |
|-------------|------------------|
| Code | What commits since it last worked? |
| Deploy | What was deployed recently? |
| Config | Any environment variable changes? |
| Data | New records, migrations, imports? |
| Dependencies | Any updates, new packages? |
| Infrastructure | Scaling, DNS, certificates? |
| External | Third-party API changes, deprecations? |

**Technique:** `git log --since="2 days ago"` or check deploy history.

### 2. Input Problems

**"Is the input what we expect?"**

| Hypothesis Type | Examples |
|-----------------|----------|
| Missing data | Required field is null/undefined |
| Wrong type | String where number expected |
| Wrong format | Date in wrong timezone, encoding issue |
| Edge case | Empty array, very long string, special characters |
| Invalid state | Enum value that shouldn't exist |
| Stale data | Cached data doesn't match current state |

### 3. State Problems

**"Is the system in the state we expect?"**

| Hypothesis Type | Examples |
|-----------------|----------|
| Stale cache | Cached value doesn't reflect reality |
| Race condition | Two processes interleaved unexpectedly |
| Corrupted state | Invalid data in database/memory |
| Missing state | Expected record doesn't exist |
| Leaked state | State from previous operation persists |
| Order dependency | Operations ran in wrong order |

### 4. Environment Problems

**"Is the environment configured correctly?"**

| Hypothesis Type | Examples |
|-----------------|----------|
| Missing config | Environment variable not set |
| Wrong config | Pointing to wrong database/service |
| Permissions | File/network permissions denied |
| Resources | Disk full, memory exhausted, ports in use |
| Network | DNS failure, firewall, timeout |
| Version mismatch | Incompatible dependency versions |

### 5. Code Problems

**"Is the code logic correct?"**

| Hypothesis Type | Examples |
|-----------------|----------|
| Logic error | Wrong operator, inverted condition |
| Off-by-one | Loop bounds, array indices |
| Null handling | Accessing property of null/undefined |
| Error handling | Exception not caught, swallowed |
| Type coercion | Implicit conversion causes bug |
| Concurrency | Race condition, deadlock |

### 6. External Problems

**"Is something outside our control broken?"**

| Hypothesis Type | Examples |
|-----------------|----------|
| API change | Third-party changed their API |
| Service down | External dependency is unavailable |
| Rate limited | Exceeded API limits |
| Network issues | Latency, packet loss, DNS |
| Certificate | Expired SSL cert |
| Time-related | Timezone, DST, expiration |

## Hypothesis Generation Techniques

### The Five Whys

Keep asking "why" to get to root cause:

```
Bug: User sees error page
Why? → Server returned 500
Why? → Database query threw exception
Why? → Query timed out
Why? → Query did full table scan
Why? → Missing index on frequently-queried column
```

### Fault Tree Analysis

Work backward from symptom:

```
                    [Error on checkout]
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    [API error]      [JS error]       [Network error]
         │                 │                 │
    ┌────┴────┐       ┌────┴────┐      [timeout?]
    │         │       │         │      [DNS?]
[auth fail] [DB fail] [null ref] [type error]
```

### Similar Past Bugs

Questions:
- Have we seen this symptom before?
- What caused it last time?
- Are there related bug reports in history?
- Did we fix something similar that might have regressed?

### Component Isolation

List all components involved and hypothesize failures for each:

```
Request flow: Browser → CDN → Load Balancer → App Server → Cache → Database

Hypotheses:
- Browser: JavaScript error, cookie issue
- CDN: Cached stale response, routing error
- Load Balancer: Health check failing, wrong backend
- App Server: Code bug, memory exhaustion
- Cache: Stale data, connection failure
- Database: Query error, connection pool exhausted
```

## Hypothesis Format

For each hypothesis, document:

```markdown
### H[N]: [Brief description]

**What it would explain:** [How this hypothesis explains the symptom]

**Evidence for:**
- [Observation that supports this]
- [Another supporting observation]

**Evidence against:**
- [Observation that doesn't fit]

**Test:**
[Specific action to confirm or eliminate]

**Status:** Not tested / Testing / Eliminated / Confirmed
```

### Example Hypotheses

```markdown
### H1: Database connection pool exhausted

**What it would explain:** Requests timeout waiting for connection

**Evidence for:**
- Error mentions "connection timeout"
- High traffic period
- Other endpoints also affected

**Evidence against:**
- Error is immediate (50ms), not after 30s pool timeout
- Connection pool metrics show available connections

**Test:**
1. Check connection pool metrics (pg_stat_activity)
2. Temporarily increase pool size
3. Add logging around connection acquisition

**Status:** Testing

---

### H2: Query missing index, timing out

**What it would explain:** Query takes too long, times out

**Evidence for:**
- Slow query log shows this table
- Table has grown recently

**Evidence against:**
- Same query worked yesterday
- Index exists for common query pattern

**Test:**
1. Run EXPLAIN ANALYZE on the query
2. Check if query plan changed
3. Check table statistics freshness

**Status:** Not tested
```

## Prioritizing Hypotheses

After generating hypotheses, prioritize:

| Factor | Higher Priority |
|--------|-----------------|
| **Likelihood** | Matches evidence, fits symptom |
| **Test speed** | Quick to confirm or eliminate |
| **Recent change** | Something changed around failure time |
| **Past occurrence** | This type of bug has happened before |
| **Risk** | Could cause data loss or security issue |

### Quick Wins First

Always check these first (quick to eliminate):
- [ ] Recent deployments/changes
- [ ] Service status pages (external dependencies)
- [ ] Resource metrics (CPU, memory, disk, connections)
- [ ] Log for obvious errors
- [ ] Config/environment variables

## When You're Stuck

If no hypotheses seem right:

1. **Widen the scope** — Are you looking in the right place?
2. **Question assumptions** — What are you "sure" isn't the problem?
3. **Add more logging** — You might be missing visibility
4. **Take a break** — Fresh eyes often see what tired eyes miss
5. **Explain to someone** — Rubber duck debugging
6. **Bisect** — Find the exact commit that introduced the bug

## Output Format

When presenting hypotheses:

```markdown
## Hypotheses for: [Bug summary]

### Most Likely

| # | Hypothesis | Supporting Evidence | Test |
|---|------------|---------------------|------|
| 1 | Connection pool exhausted | Timeout error, high traffic | Check pool metrics |
| 2 | Missing database index | Slow query log, recent data growth | EXPLAIN ANALYZE |

### Possible

| # | Hypothesis | Supporting Evidence | Test |
|---|------------|---------------------|------|
| 3 | Memory pressure causing GC pauses | Response times variable | Check memory metrics |
| 4 | External API rate limited | Uses third-party API | Check API response headers |

### Already Eliminated

| # | Hypothesis | How Eliminated |
|---|------------|----------------|
| 5 | Database down | Confirmed DB healthy, other queries work |
| 6 | Auth token expired | Validated token, not expired |

### Next Steps
1. Check connection pool metrics
2. If pool healthy, run EXPLAIN ANALYZE on suspect query
```
