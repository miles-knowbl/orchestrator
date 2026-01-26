# Edge Case Identification

Finding corner cases systematically during specification.

## Why This Matters

Edge cases found during spec are cheap to handle. Edge cases found in production are expensive disasters. Systematic identification prevents surprises.

## Edge Case Categories

### Data Edge Cases

| Category | Cases to Consider |
|----------|-------------------|
| **Empty** | No data, null, undefined, empty string, empty array |
| **One** | Single item (affects pluralization, layout, aggregation) |
| **Many** | Thousands of items (pagination, performance, memory) |
| **Maximum** | At the limit (max length, max count, max size) |
| **Over maximum** | Exceeds the limit (rejection, truncation?) |
| **Invalid** | Wrong type, wrong format, corrupted |
| **Special characters** | Unicode, emoji, HTML, SQL characters |
| **Boundary values** | 0, -1, MAX_INT, start/end of range |

### User Edge Cases

| Category | Cases to Consider |
|----------|-------------------|
| **No permission** | User can't access feature |
| **Partial permission** | User can see but not edit |
| **New user** | No history, no preferences |
| **Power user** | Extreme usage patterns |
| **Multiple users** | Concurrent access, shared resources |
| **Deleted user** | Orphaned data, references |

### State Edge Cases

| Category | Cases to Consider |
|----------|-------------------|
| **First time** | Initial state, onboarding |
| **Mid-operation** | Interrupted workflow |
| **After failure** | Recovery state |
| **Stale data** | Cache invalidation |
| **Concurrent modification** | Two users edit same thing |
| **Race condition** | Timing-dependent behavior |

### Time Edge Cases

| Category | Cases to Consider |
|----------|-------------------|
| **Timezone** | Different timezones, DST transitions |
| **Date boundaries** | Month end, year end, leap year |
| **Expiration** | Expired tokens, subscriptions, data |
| **Timing** | Too fast (debounce), too slow (timeout) |
| **Clock skew** | Different system times |

### Environment Edge Cases

| Category | Cases to Consider |
|----------|-------------------|
| **Offline** | No network connection |
| **Slow network** | High latency, low bandwidth |
| **Different devices** | Mobile, tablet, desktop |
| **Different browsers** | Chrome, Safari, Firefox, Edge |
| **Accessibility** | Screen readers, keyboard navigation |

### Integration Edge Cases

| Category | Cases to Consider |
|----------|-------------------|
| **Service unavailable** | Dependency is down |
| **Service slow** | Dependency is degraded |
| **Service returns error** | API error responses |
| **Service returns unexpected data** | Schema change, malformed response |
| **Rate limited** | Exceeded API limits |

## Systematic Edge Case Discovery

### Step 1: List All Inputs

For each input to the feature:
- What's the valid range?
- What's empty/null?
- What's at the boundary?
- What's invalid?
- What's malicious?

### Step 2: List All States

For each state the system can be in:
- What's the initial state?
- What transitions are possible?
- What's an invalid state?
- What happens during transition?

### Step 3: List All Users

For each user type:
- What can they do?
- What can't they do?
- What if they try something not allowed?
- What if they do something unexpected?

### Step 4: List All Integrations

For each external dependency:
- What if it's down?
- What if it's slow?
- What if it returns an error?
- What if it returns unexpected data?

### Step 5: Consider Concurrency

- What if two users do this at the same time?
- What if the same user does this in two tabs?
- What if this operation runs twice?

## Edge Case Documentation

### Table Format

```markdown
| Edge Case | Category | Expected Behavior | Priority |
|-----------|----------|-------------------|----------|
| User has no orders | Empty data | Show "No orders" message | Must handle |
| Order has no items | Invalid state | Should not be possible (prevent) | Must handle |
| Export during another export | Concurrent | Show "Export in progress" message | Should handle |
| Date range spans DST | Time | Use UTC consistently | Should handle |
| 100,000+ orders | Many data | Queue export, email when ready | Must handle |
```

### Scenario Format

```markdown
### Edge Case: Export with No Orders

**Scenario:** User clicks "Export CSV" but has no orders.

**Current State:** Button is visible regardless of order count.

**Expected Behavior:**
- Show message: "You don't have any orders to export."
- Don't generate/download empty file.

**Priority:** Must handle (common case for new users)

**Test Case:**
Given a user with zero orders
When they click "Export CSV"
Then they see "You don't have any orders to export."
And no file is downloaded
```

## Edge Case Prioritization

| Priority | Criteria | Example |
|----------|----------|---------|
| **Must handle** | Common scenario, breaks feature if not handled | Empty state |
| **Should handle** | Less common, poor UX if not handled | Timeout errors |
| **Could handle** | Rare, acceptable to show generic error | Malformed unicode |
| **Won't handle** | Extremely rare, out of scope | Solar flare corrupts data |

## Common Missed Edge Cases

### Often Forgotten

1. **Empty state** — First-time users, filtered to nothing
2. **Permissions** — User can see but not act
3. **Concurrent access** — Two people editing same thing
4. **Partial failure** — Some items succeed, some fail
5. **Retry behavior** — What if user clicks twice?
6. **Back button** — User navigates back mid-flow
7. **Timezone** — User in different timezone than server
8. **Long strings** — Names, addresses, descriptions
9. **Special characters** — Quotes, ampersands, emoji
10. **Mobile** — Touch, small screen, orientation

### Questions to Find Missing Cases

```markdown
- What if this is the first time?
- What if there's nothing?
- What if there's too much?
- What if it takes forever?
- What if it fails halfway?
- What if it happens twice?
- What if someone else does it at the same time?
- What if the user goes back?
- What if the user refreshes?
- What if the user loses connection?
- What if they're on a phone?
- What if they're in a different timezone?
- What if they copy/paste weird characters?
- What if they're using a screen reader?
```

## Edge Case Checklist

```markdown
### Data
- [ ] Empty (no data)
- [ ] One item
- [ ] Many items (pagination boundary)
- [ ] Maximum allowed
- [ ] Over maximum
- [ ] Null/undefined values
- [ ] Special characters

### User
- [ ] No permission
- [ ] New user (no history)
- [ ] Power user (extreme usage)
- [ ] Concurrent users

### State
- [ ] First time
- [ ] Mid-operation
- [ ] After failure
- [ ] Stale data

### Time
- [ ] Timezone differences
- [ ] Date boundaries
- [ ] Expiration
- [ ] Timeout

### Environment
- [ ] Offline
- [ ] Slow connection
- [ ] Mobile device
- [ ] Different browsers

### Integration
- [ ] Service down
- [ ] Service slow
- [ ] Service error
- [ ] Unexpected response
```
