# Acceptance Criteria

Writing clear, testable criteria for feature completion.

## Why This Matters

Acceptance criteria are the contract between stakeholders and implementers. They define "done." Vague criteria lead to endless scope debates; clear criteria make completion unambiguous.

## What Good Acceptance Criteria Look Like

### The INVEST Criteria

Good acceptance criteria are:

| Letter | Meaning | Example |
|--------|---------|---------|
| **I**ndependent | Can be verified alone | "User can export CSV" (not "User can export after setting preferences") |
| **N**egotiable | Details can be discussed | Focus on what, leave room for how |
| **V**aluable | Delivers user value | "User can see order history" not "Database stores orders" |
| **E**stimable | Can estimate effort | Specific enough to scope |
| **S**mall | Testable in one scenario | Not "User can manage account" but specific actions |
| **T**estable | Clear pass/fail | Can write a test for it |

### Format Options

#### Simple Checklist

```markdown
**Acceptance Criteria:**
- [ ] User can click "Export" button on Orders page
- [ ] Export downloads a CSV file to user's device
- [ ] CSV contains columns: order_id, date, total, status
- [ ] Export completes within 30 seconds for up to 10,000 orders
- [ ] Empty state shows "No orders to export" message
```

#### Given-When-Then (Gherkin)

```gherkin
Feature: Order Export

Scenario: Successful export with orders
  Given a user with 100 orders
  When they click "Export CSV" on the Orders page
  Then a file named "orders-{date}.csv" downloads
  And the file contains 100 rows plus header
  And each row has columns: order_id, date, total, status

Scenario: Export with no orders
  Given a user with no orders
  When they click "Export CSV"
  Then they see message "No orders to export"
  And no file downloads

Scenario: Export with many orders
  Given a user with 15,000 orders
  When they click "Export CSV"
  Then they see message "Export started. You'll receive an email when ready."
  And export is queued for background processing
```

#### Structured Format

```markdown
### AC-1: Basic Export

**Description:** User can export their orders as CSV

**Preconditions:**
- User is logged in
- User has at least one order

**Steps:**
1. Navigate to Orders page
2. Click "Export CSV" button

**Expected Result:**
- CSV file downloads immediately
- Filename: orders-YYYY-MM-DD.csv
- Contains all user's orders

**Verification:**
- [ ] Manual test completed
- [ ] Automated test written
```

## Writing Good Criteria

### Be Specific About Outcomes

| Vague | Specific |
|-------|----------|
| "File downloads" | "File named 'orders-{date}.csv' downloads to browser's download folder" |
| "Shows error" | "Shows red banner with message 'Export failed. Please try again.'" |
| "Sends notification" | "Sends email to user's registered email within 5 minutes" |

### Include Boundaries

| Missing Boundary | With Boundary |
|------------------|---------------|
| "User can upload files" | "User can upload files up to 10MB" |
| "Page loads quickly" | "Page loads in under 2 seconds on 3G connection" |
| "Shows recent orders" | "Shows orders from the last 30 days" |

### Cover the Unhappy Path

For each happy path, consider:
- What if input is invalid?
- What if user lacks permission?
- What if external service fails?
- What if data doesn't exist?

```markdown
### Happy Path
- [ ] User with orders can export successfully

### Unhappy Paths
- [ ] User with no orders sees "No orders to export" message
- [ ] User with too many orders (>10K) sees queued message
- [ ] Network error shows "Export failed. Please try again." with retry button
- [ ] Unauthorized user sees 403 error (not the export button)
```

### Specify Timing Requirements

```markdown
**Performance Criteria:**
- Export of 1,000 orders completes in < 5 seconds
- Export of 10,000 orders completes in < 30 seconds
- Export of > 10,000 orders is queued (not synchronous)
```

### Include Data Requirements

```markdown
**CSV Format:**
| Column | Type | Description |
|--------|------|-------------|
| order_id | string | Unique order identifier |
| date | ISO 8601 | Order creation timestamp |
| customer_name | string | Customer's full name |
| total | decimal | Order total in USD, 2 decimal places |
| status | enum | One of: pending, shipped, delivered, cancelled |
```

## Common Mistakes

### Mistake 1: Testing Implementation, Not Behavior

```markdown
❌ Bad: "API returns JSON with orders array"
✅ Good: "User sees their order history on the Orders page"
```

### Mistake 2: Vague Success Criteria

```markdown
❌ Bad: "Export works correctly"
✅ Good: "Exported CSV opens in Excel without errors and contains all user orders"
```

### Mistake 3: Missing Error Cases

```markdown
❌ Bad: Only happy path criteria
✅ Good: Includes criteria for empty state, errors, edge cases
```

### Mistake 4: Implementation Details

```markdown
❌ Bad: "Use pandas to generate CSV with UTF-8 encoding"
✅ Good: "CSV is UTF-8 encoded and opens correctly in Excel"
```

### Mistake 5: Untestable Criteria

```markdown
❌ Bad: "Export should be user-friendly"
✅ Good: "Export button is visible without scrolling on desktop"
```

## Acceptance Criteria Templates

### For UI Features

```markdown
### [Feature Name]

**User Story:** As a [user type], I want to [action] so that [benefit].

**Entry Criteria:**
- [ ] [Precondition 1]
- [ ] [Precondition 2]

**Acceptance Criteria:**

1. **Visibility**
   - [ ] [What user sees, where]

2. **Interaction**
   - [ ] [What happens when user does X]

3. **Feedback**
   - [ ] [What feedback user receives]

4. **Error Handling**
   - [ ] [What happens on error]

5. **Edge Cases**
   - [ ] [Edge case handling]

**Exit Criteria:**
- [ ] All acceptance criteria verified
- [ ] No critical bugs
- [ ] Performance within targets
```

### For API Features

```markdown
### [Endpoint Name]

**Endpoint:** [METHOD] /path/{param}

**Request:**
- [ ] Accepts [format]
- [ ] Requires authentication via [method]
- [ ] Validates [fields]

**Response (Success):**
- [ ] Returns [status code]
- [ ] Body contains [fields]
- [ ] Response time < [X]ms

**Response (Error):**
- [ ] Invalid input returns 400 with [format]
- [ ] Unauthorized returns 401
- [ ] Not found returns 404
- [ ] Server error returns 500

**Side Effects:**
- [ ] [What data changes]
- [ ] [What notifications sent]
```

### For Data Features

```markdown
### [Feature Name]

**Data Input:**
- [ ] Accepts [format/source]
- [ ] Validates [rules]
- [ ] Handles [edge cases]

**Data Processing:**
- [ ] Transforms [how]
- [ ] Completes in < [time]
- [ ] Handles errors by [method]

**Data Output:**
- [ ] Produces [format]
- [ ] Contains [fields]
- [ ] Accessible via [method]

**Data Quality:**
- [ ] [Validation rules]
- [ ] [Consistency checks]
```

## Verification Methods

For each criterion, specify how it will be verified:

| Method | When to Use |
|--------|-------------|
| **Automated test** | Repeatable, critical functionality |
| **Manual test** | UI/UX, complex scenarios |
| **Code review** | Implementation details, security |
| **Performance test** | Load, latency requirements |
| **User acceptance** | Business logic, workflows |

```markdown
### Acceptance Criteria Verification

| AC | Description | Verification Method |
|----|-------------|---------------------|
| 1 | Export downloads CSV | Automated E2E test |
| 2 | CSV contains all orders | Automated unit test |
| 3 | Export < 30s for 10K orders | Performance test |
| 4 | Error message on failure | Manual test |
| 5 | Button visible on Orders page | Automated E2E test |
```
