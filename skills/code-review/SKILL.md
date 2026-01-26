---
name: code-review
description: "Comprehensive PR review combining structural verification, semantic validation, and PR-specific concerns. Use before merging to assess code quality, correctness, and merge readiness. Produces actionable feedback formatted for PR comments with clear blocking vs. non-blocking distinctions."
phase: REVIEW
category: core
version: "1.0.0"
depends_on: ["code-verification"]
tags: [quality, review, core-workflow]
---

# Code Review

Comprehensive review for pull request merge readiness. Orchestrates verification and validation, adds PR-specific analysis, and produces actionable feedback.

## When to Use

- **Before merging a PR** — "Is this ready to merge?"
- **During review** — "What feedback should I give?"
- **Self-review** — "What did I miss before requesting review?"
- When you say: "review this PR", "is this mergeable?", "what's wrong with this code?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `maintainability-checklist.md` | Quality criteria for review |
| `feedback-formatting.md` | How to structure review comments |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `diff-analysis.md` | When reviewing PR diffs |
| `commit-quality.md` | When assessing commit hygiene |
| `test-expectations.md` | When verifying test coverage |

**Verification:** Ensure CODE-REVIEW.md is produced with all 4 passes completed.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `CODE-REVIEW.md` | Project root | Always |

## Core Concept

Code review answers: **"Should this be merged?"**

It combines:
1. **Verification** — Is this structurally sound? (code-verification, thorough)
2. **Validation** — Does this solve the right problem? (code-validation)
3. **PR hygiene** — Is this a good PR? (commits, scope, documentation)
4. **Maintainability** — Will future developers thank or curse us?

## Review Passes

Code review runs four sequential passes:

```
┌─────────────────────────────────────────────────────────┐
│                    CODE REVIEW                          │
│                                                         │
│  Pass 1: Verification (structural)                      │
│     └─→ Invoke code-verification (thorough mode)        │
│         • Complexity, security, error handling          │
│         • Memory, concurrency, resources                │
│                                                         │
│  Pass 2: Validation (semantic)                          │
│     └─→ Invoke code-validation                          │
│         • Requirements, edge cases, failure modes       │
│         • Operations, integration, scalability          │
│                                                         │
│  Pass 3: PR Hygiene                                     │
│     └─→ PR-specific concerns                            │
│         • Diff analysis, commit quality                 │
│         • Scope appropriateness, documentation          │
│                                                         │
│  Pass 4: Maintainability                                │
│     └─→ Long-term code health                           │
│         • Naming, structure, clarity                    │
│         • Patterns, conventions, testability            │
│                                                         │
│  Synthesis: Merge Verdict                               │
│     └─→ APPROVE / REQUEST_CHANGES / COMMENT             │
└─────────────────────────────────────────────────────────┘
```

## Pass 1: Verification

**Invoke `code-verification` in thorough mode.**

This catches structural issues:
- Complexity anti-patterns (O(n²), etc.)
- Security vulnerabilities (injection, auth bypass, etc.)
- Error handling gaps
- Memory leaks
- Concurrency issues
- Resource management problems

**If verification fails:** Stop and report. No point reviewing semantics if structure is broken.

→ See `code-verification` skill for details

## Pass 2: Validation

**Invoke `code-validation`.**

This checks semantic correctness:
- Requirements alignment
- Edge case coverage
- Failure mode handling
- Operational readiness
- Integration correctness
- Scalability assessment

**If validation fails:** Report blockers. Recommendations can proceed to later passes.

→ See `code-validation` skill for details

## Pass 3: PR Hygiene

**Analyze PR-specific concerns.**

### 3.1 Diff Analysis

**What changed, and is it appropriate?**

| Check | What to Look For |
|-------|------------------|
| Scope | Does the diff match the PR description? |
| Unrelated changes | Formatting, refactoring mixed with feature? |
| Size | Is this reviewable? (>500 lines is a smell) |
| Risk distribution | Are high-risk changes isolated? |

**Red flags:**
- PR titled "Feature X" but includes unrelated refactoring
- Massive PR that should be split
- Changes to critical paths buried in large diff

→ See `references/diff-analysis.md`

### 3.2 Commit Quality

**Are commits well-structured?**

| Check | Good | Bad |
|-------|------|-----|
| Message format | "Add user export endpoint" | "fixes" |
| Atomic commits | One logical change per commit | "WIP", "more changes" |
| History | Clean, reviewable | Merge commits, reverts, fixups |
| Commit scope | Matches message | Message says X, commit does Y |

**Commit message format:**
```
<type>: <short summary>

<body explaining what and why>

<footer with references>
```

Types: feat, fix, refactor, docs, test, chore

→ See `references/commit-quality.md`

### 3.3 Documentation Updates

**Is documentation in sync with code?**

| Change Type | Documentation Needed |
|-------------|---------------------|
| New endpoint | API docs, README if public |
| Config change | Config reference, deployment notes |
| New feature | User-facing docs if applicable |
| Breaking change | Migration guide, changelog |
| New dependency | README, setup instructions |

### 3.4 Test Coverage

**Are changes tested?**

| Check | Expectation |
|-------|-------------|
| New code | Has corresponding tests |
| Bug fix | Has regression test |
| Edge cases | Critical paths tested |
| Coverage | No significant decrease |

**Not everything needs tests**, but changes without tests need justification.

→ See `references/test-expectations.md`

## Pass 4: Maintainability

**Will future developers understand and extend this?**

### 4.1 Naming

| Element | Good Naming | Bad Naming |
|---------|-------------|------------|
| Functions | Verb + noun: `calculateTotal()` | `doIt()`, `process()`, `handle()` |
| Variables | Descriptive: `userCount` | `x`, `temp`, `data` |
| Booleans | Question form: `isActive`, `hasPermission` | `flag`, `status` |
| Classes | Noun: `OrderProcessor` | `Manager`, `Helper`, `Utils` |

**Ask:** Could someone understand this without context?

### 4.2 Structure

| Concern | What to Check |
|---------|---------------|
| Single responsibility | Does each function/class do one thing? |
| Appropriate abstraction | Not too abstract, not too concrete |
| Consistent patterns | Matches rest of codebase |
| Reasonable file size | <500 lines per file |
| Logical organization | Related code together |

### 4.3 Code Clarity

| Smell | Symptom | Fix |
|-------|---------|-----|
| Magic numbers | `if (status === 3)` | Named constants |
| Deep nesting | 4+ levels of indentation | Early returns, extraction |
| Long functions | >50 lines | Extract methods |
| Complex conditionals | `if (a && b \|\| c && !d)` | Named predicates |
| Comments explaining "what" | `// increment i` | Code should be self-documenting |

**Good comments explain "why", not "what".**

### 4.4 Consistency

**Does this match codebase conventions?**

- Formatting (should be automated)
- Naming conventions
- Error handling patterns
- Logging patterns
- File organization
- Import ordering

**Consistency > personal preference.** Match existing patterns unless changing them project-wide.

→ See `references/maintainability-checklist.md`

## Synthesis: Merge Verdict

After all passes, synthesize a verdict:

### APPROVE

All of the following are true:
- Verification passed (no structural issues)
- Validation passed (no blockers)
- PR hygiene acceptable
- Maintainability acceptable
- Minor issues documented as non-blocking comments

### REQUEST_CHANGES

Any of the following are true:
- Verification failed (structural issues)
- Validation has blockers
- Critical PR hygiene issues (wrong target branch, breaking change without migration)
- Severe maintainability issues

### COMMENT

- Validation passed but has recommendations
- PR hygiene suggestions
- Maintainability improvements suggested
- Questions needing answers before approval

## Feedback Formatting

### Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| 🚫 **Blocker** | Must fix before merge | REQUEST_CHANGES |
| ⚠️ **Warning** | Should fix, but not blocking | COMMENT |
| 💡 **Suggestion** | Nice to have, optional | COMMENT |
| ❓ **Question** | Need clarification | COMMENT |
| ✅ **Praise** | This is good, call it out | APPROVE |

### Comment Structure

```markdown
**[SEVERITY] Category: Brief summary**

[Explanation of the issue]

[Specific location if applicable]

[Suggested fix if applicable]
```

**Example:**
```markdown
🚫 **Security: SQL injection vulnerability**

User input is interpolated directly into the query string.

`src/db/users.js:47`

Use parameterized queries instead:
```sql
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```
```

### Grouping Feedback

Group by file, then by severity:

```markdown
## src/services/order-service.js

🚫 **Blocker:** Missing error handling for payment API timeout (line 142)

⚠️ **Warning:** This function is 80 lines—consider extracting payment logic (lines 120-200)

💡 **Suggestion:** `processOrder` could be renamed to `submitOrderForPayment` for clarity

## src/controllers/order-controller.js

✅ **Good:** Nice input validation pattern, matches our conventions
```

→ See `references/feedback-formatting.md`

## Output Format

### Structured Output

```json
{
  "verdict": "REQUEST_CHANGES",
  "summary": "Security issue blocks merge. Good feature implementation otherwise.",
  "passes": {
    "verification": {
      "status": "fail",
      "blockers": 1,
      "warnings": 0
    },
    "validation": {
      "status": "pass",
      "blockers": 0,
      "recommendations": 2
    },
    "pr_hygiene": {
      "status": "pass",
      "issues": ["Large PR—consider splitting in future"]
    },
    "maintainability": {
      "status": "warn",
      "suggestions": 3
    }
  },
  "blockers": [
    {
      "pass": "verification",
      "category": "security",
      "location": "src/db/users.js:47",
      "issue": "SQL injection via string interpolation",
      "suggestion": "Use parameterized query"
    }
  ],
  "comments": [
    {
      "severity": "warning",
      "location": "src/services/order-service.js:120-200",
      "issue": "Function too long (80 lines)",
      "suggestion": "Extract payment processing logic"
    }
  ]
}
```

### Conversational Output

```markdown
## Code Review: Add Order Export Feature

### Verdict: REQUEST_CHANGES

Good feature implementation, but there's a security issue that needs to be fixed before merge.

---

### 🚫 Blockers (1)

**Security: SQL injection in user lookup**
`src/db/users.js:47`

User input is interpolated directly into the query. Use parameterized queries:
```javascript
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

---

### ⚠️ Warnings (2)

**Long function in order-service.js**
`src/services/order-service.js:120-200`

`processOrder` is 80 lines. Consider extracting the payment processing logic into a separate function.

**Missing test for edge case**
The export should handle empty order lists—add a test case.

---

### 💡 Suggestions (2)

- Rename `processOrder` to `submitOrderForPayment` for clarity
- Consider adding JSDoc for the new `exportOrders` function

---

### ✅ What's Good

- Clean separation between controller and service
- Good input validation pattern
- Matches existing codebase conventions

---

Fix the SQL injection issue, and this is good to merge. The other items are non-blocking.
```

## Review Principles

**Be constructive, not critical.** The goal is better code, not proving you're smart.

**Distinguish blocking from non-blocking.** Don't block a PR for style preferences.

**Explain the "why".** "This is bad" isn't helpful. "This could cause X because Y" is.

**Offer solutions.** Don't just point out problems—suggest fixes.

**Acknowledge good work.** Positive feedback reinforces good patterns.

**Right-size the review.** A typo fix doesn't need the same scrutiny as a payment system.

**Consider the author.** Junior dev? More teaching. Senior dev? More trust.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `code-verification` | Invoked as Pass 1 (thorough mode) |
| `code-validation` | Invoked as Pass 2 |
| `implement` | Review is the gate after implementation |
| `test-generation` | Review may identify missing tests |
| `spec` | Review checks against spec if available |
| `frontend-design` | (Frontend systems) Review verifies code matches DESIGN.md |

## References

- `references/diff-analysis.md`: How to analyze what changed
- `references/commit-quality.md`: Commit message and history standards
- `references/test-expectations.md`: What tests to expect for different changes
- `references/maintainability-checklist.md`: Code quality checklist
- `references/feedback-formatting.md`: How to write effective review comments
