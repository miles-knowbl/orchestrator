---
name: debug-assist
description: "Systematic bug isolation for when you're stuck. Guides structured debugging using hypothesis generation, binary search, and systematic elimination. Tracks debugging state across turns. Specialized modes for memory issues, concurrency bugs, performance problems, and production incidents."
phase: VERIFY
category: core
version: "1.0.0"
depends_on: []
tags: [debugging, diagnosis, troubleshooting, error-analysis, core-workflow]
---

# Debug Assist

Systematic debugging guidance for isolating and fixing bugs.

## When to Use

- **Stuck on a bug** — "I can't figure out why this is failing"
- **Intermittent failures** — "It works sometimes but not always"
- **Production incident** — "Something is broken in prod"
- **Performance issue** — "This is slow but I don't know why"
- When you say: "help me debug", "why isn't this working?", "I'm stuck"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `hypothesis-generation.md` | Systematic debugging approach |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `concurrency-debugging.md` | For race conditions, deadlocks |
| `memory-debugging.md` | For memory leaks, corruption |
| `performance-debugging.md` | For slowness issues |
| `production-debugging.md` | For prod incidents |

**Verification:** Document hypothesis and verification for each debugging attempt.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `DEBUG-LOG.md` | Project root or inline | When debugging session occurs |
| Bug fix code | `src/` | When bug is fixed |

## Core Concept

Debugging is **systematic elimination**, not random guessing.

The scientific method for bugs:
1. **Observe** — What exactly is happening?
2. **Hypothesize** — What could cause this?
3. **Test** — Design an experiment to confirm or eliminate
4. **Repeat** — Narrow down until root cause is found

## The Debug Loop

```
┌─────────────────────────────────────────────────────────┐
│                    DEBUG LOOP                           │
│                                                         │
│  1. SPECIFY THE SYMPTOM                                 │
│     └─→ What exactly is wrong? Be precise.              │
│                                                         │
│  2. REPRODUCE                                           │
│     └─→ Can you make it happen reliably?                │
│                                                         │
│  3. GENERATE HYPOTHESES                                 │
│     └─→ What could cause this symptom?                  │
│                                                         │
│  4. PRIORITIZE                                          │
│     └─→ Most likely? Easiest to test?                   │
│                                                         │
│  5. TEST ONE HYPOTHESIS                                 │
│     └─→ Design experiment, observe result               │
│                                                         │
│  6. UPDATE AND REPEAT                                   │
│     └─→ Eliminate hypothesis, refine, continue          │
│                                                         │
│  7. ROOT CAUSE FOUND                                    │
│     └─→ Fix, verify, document                           │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Specify the Symptom

**Be precise.** Vague symptoms lead to vague debugging.

| Bad | Good |
|-----|------|
| "It doesn't work" | "Clicking submit returns 500 error" |
| "It's slow" | "API response takes 8 seconds instead of 200ms" |
| "It crashes" | "Process exits with SIGKILL after 10 minutes" |
| "Data is wrong" | "User balance shows $0 after successful payment" |

**Capture:**
- Exact error message (copy/paste, don't paraphrase)
- Stack trace if available
- When it started (after which change?)
- Who/what is affected
- Frequency (always? sometimes? once?)

→ See `references/symptom-specification.md`

## Step 2: Reproduce

**If you can't reproduce it, you can't fix it.**

| Reproducibility | Approach |
|-----------------|----------|
| Always happens | Proceed to hypothesize |
| Sometimes happens | Find the conditions that trigger it |
| Happened once | Gather logs, make best hypothesis |

**To improve reproducibility:**
- Simplify: Remove variables until minimal reproduction
- Isolate: Test component in isolation
- Control: Fix all variables (data, time, environment)
- Log: Add logging to capture state at failure

**Minimal reproduction:**
```
Start: Full application with 100 features
Goal: Smallest code that still shows the bug

Remove half → still fails? → remove half again
                → works? → bug is in removed half
```

→ See `references/reproduction-techniques.md`

## Step 3: Generate Hypotheses

**List everything that could cause this symptom.**

Categories to consider:

| Category | Examples |
|----------|----------|
| **Input** | Bad data, unexpected format, edge case |
| **State** | Stale cache, race condition, corrupted state |
| **Environment** | Config, permissions, dependencies |
| **Code** | Logic error, typo, wrong assumption |
| **External** | API change, network issue, third-party bug |
| **Resources** | Memory, disk, connections exhausted |

**Hypothesis format:**
```
H1: [What might be wrong]
    Evidence for: [Why this might be it]
    Evidence against: [Why this might not be it]
    Test: [How to confirm or eliminate]
```

**Example:**
```
H1: Database connection pool exhausted
    Evidence for: Error mentions timeout, high traffic lately
    Evidence against: Error is immediate, not after 30s timeout
    Test: Check connection pool metrics, try increasing pool size

H2: Query is missing index, timing out
    Evidence for: Slow query log shows this table
    Evidence against: Query worked yesterday
    Test: EXPLAIN ANALYZE the query
```

→ See `references/hypothesis-generation.md`

## Step 4: Prioritize Hypotheses

**Test the most likely or easiest to eliminate first.**

| Prioritization Factor | Higher Priority |
|----------------------|-----------------|
| Likelihood | More likely causes first |
| Test speed | Quick tests before slow tests |
| Risk | Eliminate dangerous causes early |
| Reversibility | Easy-to-undo tests first |

**Quick wins:**
- Check recent changes (git log, deploys)
- Check obvious things (config, permissions, typos)
- Check external dependencies (status pages, logs)

**Don't skip:** Even if you're "sure" it's not X, quick tests to eliminate X are worth it. Assumptions are dangerous.

## Step 5: Test One Hypothesis

**One at a time.** Changing multiple things means you won't know what fixed it.

**Experiment design:**
```
Hypothesis: Connection pool is exhausted
Test: Increase pool size from 10 to 50
Expected if true: Errors stop
Expected if false: Same errors continue
```

**Testing techniques:**

| Technique | When to Use |
|-----------|-------------|
| **Binary search** | Narrow down in code/commits |
| **Substitution** | Replace component with known-good |
| **Isolation** | Test component alone |
| **Injection** | Force specific conditions |
| **Logging** | Observe internal state |
| **Bisect** | Find breaking commit |

→ See `references/testing-techniques.md`

## Step 6: Update and Repeat

After each test:

| Result | Action |
|--------|--------|
| Hypothesis confirmed | You found it! Fix and verify |
| Hypothesis eliminated | Remove from list, update others |
| Inconclusive | Refine test, gather more data |
| New information | Generate new hypotheses |

**Track your progress:**
```
## Debug Log

### Symptom
API returns 500 on /users endpoint

### Hypotheses
- [x] H1: Database down — ELIMINATED (DB healthy)
- [x] H2: Auth token expired — ELIMINATED (token valid)
- [ ] H3: Query timeout — TESTING
- [ ] H4: Memory pressure — Not yet tested

### Tests Run
1. Checked DB status → healthy, 50ms ping
2. Validated auth token → token valid, not expired
3. Running: EXPLAIN ANALYZE on user query
```

## Step 7: Root Cause Found

**Don't stop at the fix.** Document and prevent recurrence.

```markdown
## Root Cause Analysis

**Symptom:** API returns 500 on /users endpoint

**Root Cause:** Missing index on users.organization_id.
Query did full table scan on 2M rows, timing out.

**Fix:** Added index, query now 50ms.

**Prevention:**
- Added query performance monitoring
- Alert on queries > 1 second
- Review process for schema changes

**Timeline:**
- 14:30 - Reports of errors
- 14:35 - Identified slow query in logs
- 14:45 - Confirmed missing index
- 14:50 - Index deployed, verified fix
```

## Specialized Modes

### Memory Issues

**Symptoms:** OOM kills, growing memory, GC pauses

**Approach:**
1. Confirm it's memory (monitor RSS over time)
2. Identify growth pattern (steady leak vs. spike)
3. Isolate (which operation causes growth?)
4. Inspect (heap dump, allocation profiling)

→ See `references/memory-debugging.md`

### Concurrency Issues

**Symptoms:** Intermittent failures, race conditions, deadlocks

**Approach:**
1. Confirm it's concurrency (does single-threaded work?)
2. Identify shared state
3. Add logging around critical sections
4. Try stress testing (increase concurrency)
5. Look for: check-then-act, shared mutable state, lock ordering

→ See `references/concurrency-debugging.md`

### Performance Issues

**Symptoms:** Slow responses, high latency, timeouts

**Approach:**
1. Measure (where is time spent?)
2. Profile (CPU? I/O? Network? Waiting?)
3. Identify hotspots (what takes the most time?)
4. Focus on the critical path
5. Fix highest-impact issues first

→ See `references/performance-debugging.md`

### Production Incidents

**Symptoms:** Alerts firing, users complaining

**Approach:**
1. **Mitigate first** — Restore service, then debug
2. Gather data (logs, metrics, traces)
3. Identify blast radius (what's affected?)
4. Correlate with changes (what changed recently?)
5. Fix or rollback
6. Post-mortem later

→ See `references/production-debugging.md`

## Debug State Tracking

When debugging across multiple turns, maintain state:

```markdown
## Debug Session: [Brief Description]

### Symptom
[Precise description of the bug]

### Environment
[Relevant context: versions, config, etc.]

### Hypotheses
| # | Hypothesis | Status | Evidence |
|---|------------|--------|----------|
| 1 | [Theory] | Eliminated/Testing/Confirmed | [Notes] |
| 2 | [Theory] | Not tested | |

### Tests Run
| # | Test | Result | Conclusion |
|---|------|--------|------------|
| 1 | [What you did] | [What happened] | [What this means] |

### Current Focus
[What we're investigating now]

### Next Steps
1. [Next action]
```

## Anti-Patterns

### Shotgun Debugging

**Symptom:** Changing random things hoping something works.

**Problem:** You won't know what fixed it, and you might introduce new bugs.

**Fix:** One change at a time, test between each.

### Assumption Blindness

**Symptom:** "It can't be X" without actually testing X.

**Problem:** X is frequently the problem.

**Fix:** Test your assumptions, even "obvious" ones.

### Tunnel Vision

**Symptom:** Convinced it's a certain cause, ignoring evidence.

**Problem:** Wastes time on wrong path.

**Fix:** Let evidence guide you. Write down hypotheses, update based on tests.

### Insufficient Logging

**Symptom:** "I don't know what's happening inside."

**Problem:** Can't debug what you can't observe.

**Fix:** Add logging, then reproduce.

### Debugging in Production

**Symptom:** Making changes to prod to debug.

**Problem:** High risk, pressure, incomplete data.

**Fix:** Reproduce locally first. If impossible, add observability, don't experiment.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `code-verification` | Verification catches bugs before they need debugging |
| `code-validation` | Validation may surface issues that need debugging |
| `code-review` | Review may identify potential bug sources |
| `implement` | Return to implement to fix identified bugs |
| `test-generation` | Create regression tests after fixing |

## Quick Reference

**When stuck:**
1. Be precise about the symptom
2. Reproduce reliably (or understand why you can't)
3. List all possible causes
4. Test one at a time, most likely first
5. Track what you've tried
6. Ask for help after 30 minutes of no progress

**Golden rules:**
- Change one thing at a time
- Don't trust assumptions—verify them
- If you can't reproduce, add logging
- Recent changes are prime suspects
- Take breaks—fresh eyes find bugs

## Mode-Specific Behavior

Debugging approach and constraints differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full system - any code in the new system |
| **Approach** | Comprehensive hypothesis exploration |
| **Patterns** | Free choice of debugging techniques |
| **Deliverables** | Full debug log + fix + regression tests |
| **Validation** | Standard verification after fix |
| **Constraints** | Minimal - refactor freely if needed |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-related code primarily |
| **Approach** | Extend debugging with existing system awareness |
| **Patterns** | Should match existing logging/testing patterns |
| **Deliverables** | Delta debug log + fix matching existing style |
| **Validation** | Existing tests + new regression tests |
| **Constraints** | Don't break existing functionality |

**Polish considerations:**
- Bug may be in existing code, not new code
- Existing workarounds may mask root cause
- Fix must not break existing functionality
- Regression testing against baseline required

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Changed code path only |
| **Approach** | Surgical fix - minimal modification |
| **Patterns** | Must conform exactly to existing patterns |
| **Deliverables** | Change record with audit trail |
| **Validation** | Full regression + change-specific testing |
| **Constraints** | Requires approval - escalate if bug in existing code |

**Enterprise debugging constraints:**
- Do not modify code outside the change scope
- If bug is in existing code, escalate to team
- Rollback is preferred over complex fix
- All debugging steps must be documented for audit

---

## References

- `references/symptom-specification.md`: How to describe bugs precisely
- `references/reproduction-techniques.md`: Getting bugs to happen reliably
- `references/hypothesis-generation.md`: Thinking of all possible causes
- `references/testing-techniques.md`: Binary search, isolation, bisect
- `references/memory-debugging.md`: Leaks, OOM, GC issues
- `references/concurrency-debugging.md`: Races, deadlocks, ordering
- `references/performance-debugging.md`: Profiling and optimization
- `references/production-debugging.md`: Incident response
