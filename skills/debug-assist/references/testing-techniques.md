# Testing Techniques

Systematic methods for confirming or eliminating hypotheses.

## Why This Matters

Random testing wastes time. Systematic testing efficiently narrows down the root cause. Each test should either confirm a hypothesis, eliminate it, or provide information for better hypotheses.

## Core Techniques

### 1. Binary Search

**When to use:** Bug is in a large codebase or long time range.

**How it works:**
```
[---------------------?---------------------]
                      ↓
[---------?---------] [-------------------]
          ↓
[---?---] [---------]
    ↓
[?] [---]
 ↓
Found!
```

**In code:**
1. Comment out half the code
2. Still fails? Bug is in remaining half
3. Works? Bug is in commented half
4. Repeat until isolated

**In time (git bisect):**
```bash
git bisect start
git bisect bad HEAD           # Current version is bad
git bisect good v1.2.0        # This version was good
# Git checks out middle commit
# You test: good or bad?
git bisect good  # or git bisect bad
# Repeat until found
```

**In data:**
1. Take half the input data
2. Still fails? Bug is triggered by this half
3. Works? Bug is triggered by other half
4. Repeat until minimal failing input found

### 2. Substitution

**When to use:** Suspect a specific component.

**How it works:** Replace the suspected component with a known-good version.

| Suspected | Substitution |
|-----------|--------------|
| Database | Hardcode the expected response |
| API call | Return mock data |
| Config | Use known-working config |
| Library | Downgrade to previous version |
| Service | Point to different instance |

**Example:**
```javascript
// Original
const users = await userService.getUsers();

// Substitution test
const users = [{ id: 1, name: 'Test User' }]; // Hardcoded

// If bug disappears: problem is in userService
// If bug persists: problem is elsewhere
```

### 3. Isolation

**When to use:** Bug happens in a complex system.

**How it works:** Test the suspected component completely alone.

**Techniques:**
- Write a minimal script that only calls the failing function
- Create a test case that exercises just the buggy path
- Remove all other code and dependencies
- Use a REPL to test interactively

**Example:**
```javascript
// Isolation test
const { calculateTotal } = require('./order-utils');

// Test in isolation with controlled input
const result = calculateTotal([
  { price: 10, quantity: 2 },
  { price: 5, quantity: 3 }
]);

console.log(result); // Expected: 35
```

### 4. Injection

**When to use:** Bug depends on specific conditions that are hard to reproduce.

**How it works:** Force the suspected condition to occur.

| Condition | Injection Method |
|-----------|------------------|
| Error response | Mock to return error |
| Slow response | Add artificial delay |
| Empty data | Pass empty array/object |
| Specific time | Mock Date.now() |
| Race condition | Add sleeps to control timing |
| Resource exhaustion | Artificially limit resources |

**Example:**
```javascript
// Inject slow response to test timeout handling
jest.mock('./api', () => ({
  fetchUsers: () => new Promise(resolve =>
    setTimeout(() => resolve([]), 10000) // 10 second delay
  )
}));
```

### 5. Logging

**When to use:** Can't see what's happening inside.

**How it works:** Add output to observe internal state.

**Strategic logging:**
```javascript
// Log inputs
console.log('calculateTotal input:', JSON.stringify(items));

// Log intermediate state
console.log('subtotal before discount:', subtotal);

// Log decisions
console.log('discount applied:', discount, 'because:', reason);

// Log outputs
console.log('calculateTotal output:', total);
```

**What to log:**
- Function inputs and outputs
- Branch decisions (which if path taken)
- Loop iterations (first, last, count)
- External call request/response
- Error details and stack traces
- Timestamps for performance

**Structured logging for production:**
```javascript
logger.info('Processing order', {
  orderId: order.id,
  itemCount: order.items.length,
  userId: order.userId,
  timestamp: Date.now()
});
```

### 6. Comparison

**When to use:** It works in one case but not another.

**How it works:** Find the difference between working and failing cases.

**Compare:**
- Working vs. failing input
- Working vs. failing environment
- Working vs. failing time
- Previous version vs. current version

**Example:**
```markdown
## Working Case
- Input: { userId: 1, items: [{ id: 'A', qty: 1 }] }
- User: Regular user
- Time: Monday 10 AM
- Result: Success

## Failing Case
- Input: { userId: 2, items: [{ id: 'B', qty: 0 }] }  ← qty: 0
- User: Admin user
- Time: Monday 10 AM
- Result: Error

Hypothesis: qty: 0 causes division by zero or validation failure
```

### 7. Simplification

**When to use:** Complex scenario, want minimal reproduction.

**How it works:** Remove elements until bug disappears, then add back the essential one.

**Process:**
1. Start with full failing case
2. Remove one element
3. Still fails? Element wasn't required
4. Works? Element is required for bug
5. Repeat until minimal case

**Result:** Minimal reproduction with only essential elements.

### 8. Reversal

**When to use:** Something that used to work now fails.

**How it works:** Go back to when it worked, then forward to when it broke.

**Techniques:**
- `git checkout` previous commits
- Roll back deployments
- Restore database from backup
- Revert config changes

**Once you find the breaking change:** Examine what that change did to understand why it broke things.

## Test Design

### The Scientific Method

For each hypothesis:

```markdown
**Hypothesis:** [What you think is wrong]

**Prediction:** If this hypothesis is true, then [observable outcome]

**Experiment:** [Specific action to test]

**Expected results:**
- If hypothesis TRUE: [what you'll observe]
- If hypothesis FALSE: [what you'll observe]

**Actual result:** [what happened]

**Conclusion:** [confirmed / eliminated / inconclusive]
```

### Good Tests

| Quality | Description |
|---------|-------------|
| **Specific** | Tests exactly one hypothesis |
| **Observable** | Clear pass/fail outcome |
| **Reversible** | Can undo changes after test |
| **Quick** | Fast feedback loop |
| **Safe** | Won't cause more damage |

### Test Checklist

Before running a test:
- [ ] Do I know what I'm testing?
- [ ] Do I know what result means?
- [ ] Can I undo this change?
- [ ] Will this affect users/data?
- [ ] Am I changing only one thing?

## Debugging Tools

### General

| Tool | Use For |
|------|---------|
| Debugger | Step through code, inspect variables |
| REPL | Test code snippets interactively |
| Logging | Observe internal state |
| Profiler | Find performance bottlenecks |
| Network inspector | See HTTP requests/responses |

### Language-Specific

| Language | Tools |
|----------|-------|
| JavaScript | Chrome DevTools, node --inspect, console.log |
| Python | pdb, ipdb, print(), logging |
| Java | IDE debugger, jstack, jmap |
| Go | delve, fmt.Printf, runtime/pprof |

### Database

| Task | Tool/Command |
|------|--------------|
| Query analysis | EXPLAIN ANALYZE |
| Lock inspection | pg_stat_activity, SHOW PROCESSLIST |
| Slow queries | Slow query log |
| Connection status | Pool metrics, max_connections |

### Production

| Task | Tool |
|------|------|
| Distributed tracing | Jaeger, Zipkin, Datadog APM |
| Log aggregation | ELK, Splunk, CloudWatch |
| Metrics | Prometheus, Grafana, Datadog |
| Error tracking | Sentry, Bugsnag, Rollbar |

## Output Format

When documenting tests:

```markdown
## Test Log

### Test 1: Check database connection pool

**Hypothesis:** Connection pool exhausted

**Action:** Query pg_stat_activity for connection count

**Command:**
```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'myapp';
```

**Result:** 12 connections (pool max is 20)

**Conclusion:** ELIMINATED - Pool is not exhausted

---

### Test 2: Check query performance

**Hypothesis:** Query missing index

**Action:** Run EXPLAIN ANALYZE on suspect query

**Result:**
```
Seq Scan on users  (cost=0.00..1000.00 rows=50000)
```

**Conclusion:** CONFIRMED - Full table scan, missing index
```
