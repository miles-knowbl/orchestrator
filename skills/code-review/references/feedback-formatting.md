# Feedback Formatting

How to write effective code review comments.

## Why This Matters

The same technical feedback can build people up or tear them down. Good feedback is specific, actionable, and kind. Bad feedback is vague, personal, and discouraging. The goal is better code AND better engineers.

## Feedback Principles

### 1. Be Specific

**Bad:** "This is confusing."
**Good:** "The function name `process` doesn't indicate what's being processed. Consider `processPayment` or `validateOrder`."

**Bad:** "This could be better."
**Good:** "This has O(n²) complexity due to the nested find(). Build a Map for O(1) lookups."

### 2. Explain the Why

**Bad:** "Don't use var."
**Good:** "Use `const` instead of `var` here—the value never changes, and `const` signals that intent to readers."

**Bad:** "Add error handling."
**Good:** "If the API call fails, this will throw an unhandled error. Add try/catch to return a meaningful error to users."

### 3. Suggest Solutions

**Bad:** "This won't scale."
**Good:** "This loads all orders into memory, which won't work once we have 10K+ orders. Consider pagination or streaming."

### 4. Distinguish Blocking from Non-Blocking

**Blocking (must fix):**
- Security vulnerabilities
- Bugs that will break production
- Missing critical requirements
- Breaking changes without migration

**Non-blocking (should fix but won't block):**
- Code style issues
- Performance optimizations for non-critical paths
- Naming improvements
- Missing optional features

**Non-blocking (nice to have):**
- Alternative approaches
- Future improvements
- Style preferences

### 5. Acknowledge Good Work

Don't just point out problems. Call out what's done well:
- "Nice test coverage!"
- "Good error handling here."
- "This abstraction makes the code much cleaner."

## Severity Markers

Use consistent markers so authors know what's required:

| Marker | Meaning | Author Action |
|--------|---------|---------------|
| 🚫 **Blocker** | Must fix to merge | Fix before approval |
| ⚠️ **Warning** | Should fix, significant issue | Fix or explain why not |
| 💡 **Suggestion** | Optional improvement | Consider for this PR or future |
| ❓ **Question** | Need clarification | Respond before approval |
| 🔧 **Nit** | Trivial issue, nitpick | Fix if easy, ignore if not |
| ✅ **Praise** | This is good | Keep doing this |

## Comment Templates

### Security Issue

```markdown
🚫 **Security: [vulnerability type]**

[Description of the vulnerability and why it's dangerous]

`[file:line]`

[How to fix it with code example if helpful]

[Link to reference if applicable]
```

**Example:**
```markdown
🚫 **Security: SQL Injection**

User input is concatenated directly into the query string, allowing attackers to execute arbitrary SQL.

`src/db/users.js:47`

Use parameterized queries:
```js
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

See: https://owasp.org/www-community/attacks/SQL_Injection
```

### Bug or Logic Error

```markdown
⚠️ **Bug: [brief description]**

[What's wrong and what will happen]

`[file:line]`

[Suggested fix]
```

**Example:**
```markdown
⚠️ **Bug: Off-by-one in pagination**

The last page will be missing one item because `slice(start, end)` excludes `end`.

`src/utils/paginate.js:23`

Change to `slice(start, end + 1)` or use `start + pageSize` instead of `end`.
```

### Improvement Suggestion

```markdown
💡 **Suggestion: [brief description]**

[What could be better and why]

[Optional: alternative approach]
```

**Example:**
```markdown
💡 **Suggestion: Extract to named constant**

The retry count `3` appears twice and its meaning isn't clear.

Consider:
```js
const MAX_PAYMENT_RETRIES = 3;
```
```

### Clarifying Question

```markdown
❓ **Question: [what you're asking]**

[Context for why you're asking]
```

**Example:**
```markdown
❓ **Question: Should this also handle the `refunded` status?**

I see handling for `completed` and `failed`, but customers can also have refunded orders. Is that intentional or should we add it?
```

### Praise

```markdown
✅ **Nice: [what's good]**

[Why it's good, optional]
```

**Example:**
```markdown
✅ **Nice error handling**

Good separation of user-facing error messages from logged details. This pattern makes debugging easier without exposing internals.
```

## Comment Tone

### Use "We" Language

**Instead of:** "You should..."
**Use:** "We could..." or "Consider..."

**Instead of:** "You forgot to..."
**Use:** "This needs..." or "Missing..."

**Instead of:** "Why did you..."
**Use:** "What's the reason for..." or "I'm curious about..."

### Ask, Don't Demand

**Instead of:** "Change this to X."
**Use:** "Would X work better here because...?"

**Instead of:** "This is wrong."
**Use:** "I think there might be an issue here—[explanation]"

### Assume Good Intent

**Instead of:** "Did you even test this?"
**Use:** "This might cause an issue when [scenario]—can we add a test?"

**Instead of:** "This is poorly designed."
**Use:** "I have some concerns about this approach—[specific concerns]"

## Comment Placement

### Inline Comments

Use for:
- Line-specific issues
- Quick fixes
- Code suggestions

### Summary Comment

Use for:
- Overall assessment
- Architectural concerns
- Cross-cutting issues
- Praise for overall approach

**Structure:**
```markdown
## Summary

[Overall assessment]

### Blockers
- [List of must-fix items]

### Suggestions
- [List of optional improvements]

### Questions
- [List of clarifications needed]

### What's Good
- [Positive feedback]
```

## Handling Disagreement

### When Author Pushes Back

1. **Listen first.** They may have context you don't.
2. **Ask questions.** "Help me understand why..."
3. **Explain impact.** "My concern is that this could cause..."
4. **Propose compromise.** "Would it work to..."
5. **Escalate if needed.** Bring in a third opinion.

### When You're Wrong

**Just say so:**
"Good point, I missed that. Approved!"

Don't double down or hedge. Being wrong sometimes means you're learning.

## Review Etiquette

| Do | Don't |
|----|-------|
| Review promptly (same day ideal) | Let PRs languish for days |
| Batch feedback (one review pass) | Drip comments over hours |
| Respond to responses | Ignore author's replies |
| Approve once concerns addressed | Require new review for nits |
| Thank the author | Take good work for granted |

## Output Format

When synthesizing review feedback:

```markdown
## Code Review Summary

### Verdict: REQUEST_CHANGES

Overall good implementation. One security issue needs to be fixed.

---

### 🚫 Blockers (1)

1. **Security: SQL injection** in `src/db/users.js:47`
   - User input concatenated into query
   - Fix: Use parameterized query

---

### ⚠️ Warnings (2)

1. **Bug: Pagination off-by-one** in `src/utils/paginate.js:23`
   - Last page missing one item

2. **Missing test for error case** in order export
   - Add test for API failure scenario

---

### 💡 Suggestions (3)

1. Extract magic number `3` to `MAX_RETRIES` constant
2. Consider renaming `processData` to `transformOrderData`
3. `handleError` could log request ID for debugging

---

### ✅ What's Good

- Clean separation of concerns
- Comprehensive happy path tests
- Good error messages for users

---

**Next steps:** Fix the SQL injection issue, and let's discuss the pagination bug.
```
