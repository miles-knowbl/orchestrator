# Edge Cases

Comprehensive checklist for inputs, states, and scenarios that are often missed.

## Why This Matters

AI-generated code handles the happy path beautifully. Edge cases are where it falls apart. These aren't exotic scenarios—they're the inputs your users will inevitably provide.

Your job: Think like the weirdest, most adversarial user.

## Edge Case Categories

### 1. Boundary Values

The edges of valid ranges:

| Type | Boundaries to Test |
|------|-------------------|
| Numbers | 0, 1, -1, MAX_INT, MIN_INT, MAX_SAFE_INTEGER |
| Strings | "", single char, very long (10K+ chars) |
| Arrays | [], single element, very large (10K+ items) |
| Dates | epoch, far future, far past, DST transitions |
| IDs | first valid, last valid, just outside range |

**Common misses:**
- Zero is often not handled (division, array access)
- Negative numbers when only positive expected
- Empty collections causing null reference
- Off-by-one at boundaries

### 2. Null/Undefined/Missing

What if expected data isn't there?

```javascript
// For every property access, ask: what if this is null?
user.address.city          // What if user is null? address is null?
orders[0].total            // What if orders is empty?
response.data.items.map()  // What if any level is missing?
```

**Checklist:**
- [ ] Function parameters: what if null/undefined?
- [ ] API responses: what if fields missing?
- [ ] Database results: what if no rows?
- [ ] Config values: what if not set?
- [ ] Optional fields: what if omitted?

### 3. Type Variations

What if the type isn't what you expect?

```javascript
// User input often comes as strings
const quantity = req.body.quantity;  // "5" not 5
const enabled = req.query.enabled;   // "true" not true

// API responses may vary
const id = response.id;  // Sometimes string, sometimes number
```

**Checklist:**
- [ ] String where number expected (and vice versa)
- [ ] Array where object expected (and vice versa)
- [ ] "null" (string) vs null (value)
- [ ] "undefined" (string) vs undefined
- [ ] "true"/"false" (string) vs boolean
- [ ] Scientific notation: "1e10" parsed as number

### 4. String Edge Cases

Strings have many edge cases:

| Case | Example | What Breaks |
|------|---------|-------------|
| Empty | "" | Length checks, display |
| Whitespace only | "   " | Validation that checks truthiness |
| Unicode | "こんにちは" | Length, display, storage |
| Emoji | "👨‍👩‍👧‍👦" | Length (this is 11 code units!) |
| RTL text | "مرحبا" | Layout, display |
| Null chars | "hello\0world" | C-based systems, some DBs |
| Very long | 10KB+ | Memory, display, DB columns |
| HTML/Script | "<script>" | XSS (also a security issue) |
| SQL chars | "'; DROP" | Injection (also a security issue) |
| Newlines | "line1\nline2" | Single-line displays |
| Tabs | "col1\tcol2" | Parsing, display |

### 5. Timing Edge Cases

What if timing is unexpected?

| Scenario | What Could Break |
|----------|------------------|
| Instant response | Loading state flickers |
| Very slow response | Timeouts, user retries |
| Never responds | Memory leaks, stuck UI |
| Response after cancel | State corruption |
| Out-of-order responses | Race conditions |
| Exactly at timeout boundary | Flaky behavior |

### 6. State Edge Cases

What if the system is in an unexpected state?

| Scenario | Example |
|----------|---------|
| First use | No data, no history, no preferences |
| After logout | Cached data from previous user |
| Mid-operation | Page refresh during checkout |
| Concurrent access | Same record opened in two tabs |
| After failure | Partial state from failed operation |
| During shutdown | Cleanup interrupted |
| Stale data | Cache expired, data changed |

### 7. Sequence/Ordering Edge Cases

What if operations happen in unexpected order?

- Called before initialization
- Called after cleanup/dispose
- Called twice in a row
- Callbacks fire out of order
- Events processed out of order
- Operations interleaved (concurrent)

### 8. Volume Edge Cases

What if there's much more (or less) than expected?

| Scenario | Impact |
|----------|--------|
| Zero items | Empty state handling |
| One item | Singular/plural text |
| Exactly page size | Pagination edge |
| Page size + 1 | Off-by-one in pagination |
| Maximum allowed | Boundary behavior |
| Above maximum | Rejection handling |
| Millions | Performance, memory |

## Edge Case Discovery Process

### Step 1: Identify Inputs

List all inputs to the code:
- Function parameters
- User input (forms, URL, etc.)
- API responses
- Database results
- Configuration
- Environment variables
- Time/date

### Step 2: For Each Input, Ask

```
- What if it's null/undefined?
- What if it's empty?
- What if it's at the boundary?
- What if it's the wrong type?
- What if it's malformed?
- What if it's missing expected fields?
- What if it's much larger than expected?
```

### Step 3: Identify State Dependencies

List all state the code depends on:
- Local state (variables, caches)
- Shared state (global, database)
- External state (APIs, services)

### Step 4: For Each State, Ask

```
- What if it doesn't exist yet?
- What if it was deleted?
- What if it changed since we read it?
- What if another process changed it?
- What if it's corrupted?
```

## Edge Case Checklist by Domain

### Form Input
- [ ] Empty submission
- [ ] Whitespace-only fields
- [ ] Very long input (paste 10KB)
- [ ] Special characters in all fields
- [ ] Emoji in text fields
- [ ] Negative numbers in quantity fields
- [ ] Zero in required numeric fields
- [ ] Future dates where past expected
- [ ] Invalid email formats
- [ ] Script tags in text fields

### File Upload
- [ ] Zero-byte file
- [ ] Very large file (over limit)
- [ ] Wrong extension with valid content
- [ ] Right extension with wrong content
- [ ] Filename with special characters
- [ ] Filename with path traversal (../../../)
- [ ] Duplicate filenames
- [ ] Upload cancellation mid-transfer

### Lists/Tables
- [ ] Zero rows
- [ ] One row
- [ ] Exactly one page
- [ ] Many pages
- [ ] Search with no results
- [ ] Filter that excludes everything
- [ ] Sort on null values
- [ ] Items added/removed during scroll

### Authentication
- [ ] Login while already logged in
- [ ] Token expires during session
- [ ] Multiple tabs with different users
- [ ] Login from new device
- [ ] Password with special characters
- [ ] Very long password
- [ ] Account locked after attempts

### Payments
- [ ] Zero amount
- [ ] Fractional cents
- [ ] Very large amount
- [ ] Currency conversion edge cases
- [ ] Declined card
- [ ] Card expires mid-checkout
- [ ] Duplicate submission
- [ ] Timeout during processing

## Output Format

When documenting edge case coverage:

```markdown
## Edge Case Analysis

**Covered:**
- Empty input: ✅ Shows validation error
- Null user: ✅ Redirects to login
- Large files: ✅ Size limit enforced

**Not Covered (Blockers):**
- Concurrent edits: ❌ Last write wins silently
  - Impact: Data loss possible
  - Recommendation: Add optimistic locking

**Not Covered (Recommendations):**
- Very long names: ⚠️ May break layout
  - Impact: Visual only
  - Recommendation: Truncate with ellipsis

**Out of Scope:**
- Unicode normalization: Different representations treated as different
  - Acceptable for MVP, track for future
```
