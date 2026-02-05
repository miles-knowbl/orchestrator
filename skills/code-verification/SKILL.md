---
name: code-verification
description: "Fast structural correctness checks for code generation loops. Use after every code generation to catch complexity issues, security vulnerabilities, resource leaks, and error handling gaps before they compound. Supports two strictness levels: 'fast' for tight iteration loops, 'thorough' for pre-PR checks. Outputs pass/fail per category with specific issues."
phase: VERIFY
category: engineering
version: "1.0.0"
depends_on: ["implement"]
tags: [quality, verification, core-workflow]
---

# Code Verification

Structural correctness checks designed for agentic code generation loops. Fast, automatable, binary pass/fail orientation.

## When to Use

- **Every code generation** in agentic workflows (fast mode)
- **Before committing** or creating a PR (thorough mode)
- **After refactoring** to ensure no regressions
- When you say: "verify this", "check this code", "is this safe to ship?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `complexity-patterns.md` | Identify O(n²) and other complexity issues |
| `error-handling-patterns.md` | Proper error handling verification |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `concurrency-patterns.md` | When verifying concurrent code |
| `memory-patterns.md` | When checking for memory issues |
| `resource-patterns.md` | When verifying resource cleanup |

**Verification:** All categories should have PASS/FAIL status with evidence.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `VERIFICATION.md` | Project root | Always |

## Core Concept

Verification answers: **"Did we build it correctly?"**

This is distinct from validation ("Did we build the right thing?"). Verification is structural—it catches bugs that exist regardless of requirements. It should be:

- **Fast**: Seconds, not minutes
- **Automatable**: Can run without human judgment
- **Binary**: Pass or fail, with specific issues listed
- **Composable**: Part of every generation loop

## Strictness Levels

| Level | When to Use | Categories Checked | Time Budget |
|-------|-------------|-------------------|-------------|
| **Fast** | Every iteration in agentic loop | Complexity, Security, Error Handling | <30 seconds |
| **Thorough** | Before PR, before shipping | All categories, deeper analysis | 2-5 minutes |

Default to **fast** unless explicitly requested otherwise or at a shipping checkpoint.

## Verification Categories

Six categories, each with specific patterns to detect:

### 1. Complexity (Fast + Thorough)

**Question**: Will this perform acceptably at production scale?

**Check for**:
- Nested loops over same data structure → O(n²)
- `.find()`, `.filter()`, `.includes()` inside loops → hidden O(n²)
- Recursive calls that branch → potential O(2ⁿ)
- String concatenation in loops → O(n²) in many languages
- Sorting inside loops → O(n² log n)

**Pass criteria**: No unintentional quadratic or worse complexity in hot paths.

→ See `references/complexity-patterns.md`

### 2. Memory (Thorough only)

**Question**: Will this leak memory or blow the stack?

**Check for**:
- Event listeners without cleanup
- Closures capturing more than needed
- Recursive calls without depth limits
- Growing collections without bounds
- Circular references preventing GC

**Pass criteria**: No obvious memory leaks, bounded resource usage.

→ See `references/memory-patterns.md`

### 3. Concurrency (Thorough only)

**Question**: Is this safe when multiple things run at once?

**Check for**:
- Shared mutable state without synchronization
- Check-then-act patterns (TOCTOU)
- Sequential awaits that should be parallel
- Missing Promise.all for independent operations
- Callback hell or unhandled promise rejections

**Pass criteria**: No race conditions, appropriate use of async patterns.

→ See `references/concurrency-patterns.md`

### 4. Security (Fast + Thorough)

**Question**: Could this be exploited?

**Check for**:
- String concatenation in SQL/queries → injection
- Unescaped user input in HTML → XSS
- Missing authentication/authorization checks
- Sensitive data in logs or error messages
- Hardcoded secrets or credentials
- Insecure direct object references

**Pass criteria**: No injection vectors, no auth bypasses, no data exposure.

→ See `references/security-patterns.md`

### 5. Error Handling (Fast + Thorough)

**Question**: What happens when things fail?

**Check for**:
- Missing try/catch around I/O operations
- Swallowed exceptions (empty catch blocks)
- Error messages that expose internals
- Missing null/undefined checks
- Assumptions about external service responses

**Pass criteria**: All failure paths handled, errors propagate appropriately.

→ See `references/error-handling-patterns.md`

### 6. Resource Management (Thorough only)

**Question**: Are resources properly acquired and released?

**Check for**:
- Database connections not returned to pool
- File handles not closed
- Missing cleanup in finally blocks
- Timeout absence on external calls
- Unbounded queues or buffers

**Pass criteria**: All resources have cleanup paths, timeouts on external dependencies.

→ See `references/resource-patterns.md`

## Workflow

### Fast Mode (Every Iteration)

```
1. Scan for complexity anti-patterns
2. Scan for security anti-patterns  
3. Scan for error handling gaps
4. Report: PASS or FAIL with specific issues
```

Time budget: <30 seconds. If you find issues, stop and report—don't continue checking.

### Thorough Mode (Pre-PR)

```
1. Run all Fast mode checks
2. Analyze memory patterns
3. Analyze concurrency patterns
4. Analyze resource management
5. Cross-reference: Do error handlers leak resources?
6. Report: Full assessment with severity levels
```

Time budget: 2-5 minutes. Complete all categories before reporting.

## Output Format

### Fast Mode Output

```json
{
  "mode": "fast",
  "result": "FAIL",
  "issues": [
    {
      "category": "complexity",
      "severity": "high",
      "location": "processOrders():15",
      "issue": "O(n²) - .find() inside .map() loop",
      "suggestion": "Build lookup Map before loop for O(n) total"
    }
  ],
  "categories_checked": ["complexity", "security", "error_handling"],
  "pass_count": 2,
  "fail_count": 1
}
```

### Thorough Mode Output

```json
{
  "mode": "thorough",
  "result": "PASS",
  "summary": "All checks passed. Minor suggestions below.",
  "categories": {
    "complexity": {"status": "pass", "issues": []},
    "memory": {"status": "pass", "issues": []},
    "concurrency": {"status": "pass", "issues": []},
    "security": {"status": "pass", "issues": []},
    "error_handling": {"status": "pass", "issues": []},
    "resource_management": {"status": "pass", "issues": []}
  },
  "suggestions": [
    {
      "category": "concurrency",
      "severity": "low",
      "note": "Consider Promise.all for independent fetches at line 42"
    }
  ]
}
```

### Conversational Output

When context is conversational (not part of automated loop), report naturally:

> **Verification: PASS** (fast mode)
> 
> Checked complexity, security, and error handling. No issues found. 
> Ready for next iteration or thorough check before PR.

Or:

> **Verification: FAIL** (fast mode)
> 
> Found 1 issue:
> - **Complexity** (high): `processOrders():15` has O(n²) complexity—`.find()` inside `.map()`. Build a lookup Map before the loop.
>
> Fix this before continuing.

## Integration with Agentic Loops

This skill is designed to run after every code generation:

```
[User request]
     ↓
[Agent generates code]
     ↓
[engineering-verification: fast] ← automatic
     ↓
   PASS? → continue or deliver
   FAIL? → fix issues, regenerate, re-verify
```

For PR-ready code:

```
[Feature complete]
     ↓
[engineering-verification: thorough]
     ↓
   PASS? → ready for human review
   FAIL? → address issues first
```

## Key Principles

**Speed over comprehensiveness in fast mode.** The goal is catching obvious issues quickly, not exhaustive analysis. Save thorough analysis for checkpoints.

**Binary outcomes.** Resist "maybe" or "probably fine." Either it passes or it doesn't. Ambiguous cases are failures that need investigation.

**Specific locations.** Every issue must point to a specific line or function. "There might be a memory leak somewhere" is not actionable.

**Suggestions, not just problems.** Every issue should include a suggested fix or investigation path.

**Severity matters.** High severity = must fix before continuing. Low severity = note for later or optional improvement.

## Severity Definitions

| Severity | Definition | Action |
|----------|------------|--------|
| **Critical** | Will break in production or security vulnerability | Stop. Fix immediately. |
| **High** | Significant bug or performance issue | Fix before continuing. |
| **Medium** | Code smell or potential issue | Fix before PR. |
| **Low** | Improvement opportunity | Note for later. |

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `implement` | Verification runs automatically (fast mode) after each code generation |
| `code-validation` | Verification checks structure; validation checks semantics. Both needed. |
| `code-review` | Invokes verification (thorough mode) as first pass |
| `security-audit` | Verification catches common vulnerabilities; security-audit does threat modeling |
| `perf-analysis` | Verification catches O(n²); perf-analysis profiles and identifies bottlenecks |

**Verification answers:** "Is this code structurally sound?"
**Validation answers:** "Does this code solve the right problem?"

## References

- `references/complexity-patterns.md`: Detailed complexity anti-patterns and fixes
- `references/memory-patterns.md`: Memory leak patterns and detection
- `references/concurrency-patterns.md`: Race conditions and async patterns
- `references/security-patterns.md`: Security vulnerability patterns
- `references/error-handling-patterns.md`: Error handling anti-patterns
- `references/resource-patterns.md`: Resource management patterns
