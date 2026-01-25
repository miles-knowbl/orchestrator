# Failure Handling

Comprehensive guide to detecting, diagnosing, and recovering from failures.

## Failure Categories

| Category | Examples | Severity | Auto-Retry |
|----------|----------|----------|------------|
| **Build** | Compile error, missing dependency | High | Yes |
| **Lint** | Style violations, formatting | Low | Yes |
| **Type** | Type errors, interface mismatch | High | Yes |
| **Test** | Unit/integration test failure | High | Yes |
| **Security** | Vulnerability detected | Critical | No |
| **Performance** | Threshold exceeded | Medium | Limited |
| **External** | API unavailable, timeout | Medium | Yes (with backoff) |
| **Logic** | Infinite loop, deadlock | Critical | No |

## Detection

### Build Failure Detection

```bash
# Capture build output
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
  echo "Build failed with exit code $BUILD_EXIT"
  echo "$BUILD_OUTPUT" > .failure-log
  # Transition to FAILED
fi
```

### Test Failure Detection

```bash
# Run tests with JSON output
npm test -- --json --outputFile=test-results.json

# Parse results
FAILED=$(jq '.numFailedTests' test-results.json)
if [ "$FAILED" -gt 0 ]; then
  # Extract failed test names
  jq '.testResults[].assertionResults[] | select(.status=="failed") | .fullName' test-results.json
  # Transition to FAILED
fi
```

### Lint Failure Detection

```bash
# Run lint with machine-readable output
npm run lint -- --format json > lint-results.json 2>&1
LINT_EXIT=$?

if [ $LINT_EXIT -ne 0 ]; then
  ERROR_COUNT=$(jq '[.[] | .errorCount] | add' lint-results.json)
  echo "Lint failed with $ERROR_COUNT errors"
  # Transition to FAILED
fi
```

## Diagnosis

### Diagnosis Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DIAGNOSIS FLOW                                         │
│                                                                             │
│  1. CAPTURE ERROR                                                           │
│     ├─→ Full error message                                                  │
│     ├─→ Stack trace (if available)                                          │
│     ├─→ File and line number                                                │
│     └─→ Context (what was being executed)                                   │
│                                                                             │
│  2. CATEGORIZE                                                              │
│     ├─→ Build / Lint / Type / Test / Security / External?                   │
│     └─→ Determines retry strategy                                           │
│                                                                             │
│  3. INVOKE debug-assist                                                     │
│     ├─→ Provide error details                                               │
│     ├─→ Provide recent changes                                              │
│     └─→ Get diagnosis and fix suggestions                                   │
│                                                                             │
│  4. FORM HYPOTHESIS                                                         │
│     ├─→ Most likely cause                                                   │
│     ├─→ Alternative causes                                                  │
│     └─→ Verification approach                                               │
│                                                                             │
│  5. PLAN FIX                                                                │
│     ├─→ Minimal change to fix                                               │
│     ├─→ Files to modify                                                     │
│     └─→ Verification steps                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Error Pattern Recognition

| Pattern | Likely Cause | Fix Approach |
|---------|--------------|--------------|
| `Cannot find module 'X'` | Missing dependency | `npm install X` |
| `Property 'X' does not exist on type 'Y'` | Type mismatch | Update type or access |
| `Expected X but got Y` (test) | Logic error | Check assertion and implementation |
| `Timeout of X exceeded` | Slow operation or deadlock | Optimize or increase timeout |
| `ECONNREFUSED` | Service not running | Start service or mock |
| `401 Unauthorized` | Auth issue | Check credentials/tokens |
| `Circular dependency` | Import cycle | Restructure imports |

## Retry Strategy

### Retry Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RETRY DECISION                                          │
│                                                                             │
│  Should we retry?                                                           │
│  │                                                                          │
│  ├─ Is it a security finding?                                               │
│  │   └─ NO: Don't auto-retry, escalate                                      │
│  │                                                                          │
│  ├─ Is it the same error as last attempt?                                   │
│  │   ├─ YES: Increment same-error counter                                   │
│  │   │   └─ Same error > 2 times? → Escalate                                │
│  │   └─ NO: Reset same-error counter                                        │
│  │                                                                          │
│  ├─ Total failures < max (10)?                                              │
│  │   └─ NO: → Escalate                                                      │
│  │                                                                          │
│  ├─ Current retry count < max (3)?                                          │
│  │   ├─ YES: → Retry                                                        │
│  │   └─ NO: → Escalate                                                      │
│  │                                                                          │
│  └─ Retry with:                                                             │
│      ├─ Diagnosis from debug-assist                                         │
│      ├─ Targeted fix                                                        │
│      └─ Re-run from failed stage                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Retry Backoff (External Failures)

For external service failures, use exponential backoff:

```javascript
const backoff = {
  initial: 1000,      // 1 second
  multiplier: 2,
  maxDelay: 30000,    // 30 seconds
  maxRetries: 5
};

function getDelay(attempt) {
  const delay = backoff.initial * Math.pow(backoff.multiplier, attempt);
  return Math.min(delay, backoff.maxDelay);
}

// Attempt 0: 1s
// Attempt 1: 2s
// Attempt 2: 4s
// Attempt 3: 8s
// Attempt 4: 16s
```

## Fix Application

### Fix Guidelines

1. **Minimal changes only** — Fix the error, nothing else
2. **Separate commit** — Commit fix separately from feature code
3. **Explain the fix** — Commit message explains what and why
4. **Verify thoroughly** — Run all checks, not just the failed one
5. **Check for regressions** — Ensure fix doesn't break other tests

### Fix Commit Format

```
fix({scope}): {description}

Error: {original error message}
Cause: {root cause}
Fix: {what was changed}

Attempt: {N}/{max}
```

Example:
```
fix(work-order): correct type for assignedTo field

Error: Type 'string | null' is not assignable to type 'string'
Cause: Database returns null for unassigned orders
Fix: Made assignedTo field optional in WorkOrder interface

Attempt: 1/3
```

## Escalation

### When to Escalate

| Condition | Escalate To |
|-----------|-------------|
| Max retries (3) exceeded | Human engineer |
| Same error 3 times | Human engineer |
| Total failures (10) exceeded | Human engineer |
| Security finding | Security team |
| Circular fix (A breaks B, B breaks A) | Human engineer |
| External service down > 1 hour | Human / ops |
| Ambiguous requirement discovered | Product owner |

### Escalation Template

```markdown
## 🚨 Escalation Required: [System Name]

### Summary
[One sentence description of the problem]

### Error Details
```
[Error message and stack trace]
```

### Retry History
| Attempt | Error | Fix Tried | Outcome |
|---------|-------|-----------|---------|
| 1 | [Error] | [Fix] | [Still failed] |
| 2 | [Error] | [Fix] | [Different error] |
| 3 | [Error] | [Fix] | [Same error] |

### Analysis
[What debug-assist determined]

### Root Cause Hypothesis
[Best guess at underlying issue]

### Human Action Needed
[Specific request]

### To Resume After Resolution
1. Fix the underlying issue
2. Run verification: `npm test`
3. Update loop-state.json: set `state` to `[stage]`
4. Clear failure: set `failures.count` to `0`
5. Run `loop resume`

### Context
- Branch: [branch]
- Last commit: [hash]
- Worktree: [path]
- GitHub Issue: #[number]
```

## Recovery

### After Human Fix

```bash
# 1. Verify the fix
cd .worktrees/[system]
npm test
npm run lint
npm run build

# 2. Update loop state
# Edit loop-state.json:
{
  "state": "VERIFY",  // or wherever to resume
  "failures": {
    "count": 0,       // reset retry counter
    ...
  }
}

# 3. Resume loop
loop resume
```

### State Recovery

If loop-state.json is corrupted:

```bash
# 1. Check git for last good state
git log --oneline loop-state.json

# 2. Restore from commit
git checkout [hash] -- loop-state.json

# 3. Or reconstruct from code state
# - Check git log for last successful commits
# - Check test results
# - Determine current stage
# - Manually create valid loop-state.json
```

## Failure Log

Maintain failure history for learning:

```json
// failure-log.json (append-only)
{
  "failures": [
    {
      "timestamp": "2024-01-17T10:15:00Z",
      "system": "sys-002",
      "stage": "VERIFY",
      "error": "Type error in WorkOrder model",
      "errorType": "type",
      "file": "src/models/work-order.ts",
      "line": 15,
      "retries": 1,
      "resolution": "Fixed type definition",
      "resolutionTime": 600,  // seconds
      "wasEscalated": false
    }
  ]
}
```

Use for:
- Identifying common failure patterns
- Improving error detection
- Updating fix strategies
- Measuring reliability
