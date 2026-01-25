# Maintainability Checklist

How to assess long-term code health.

## Why This Matters

Code is read more than written. Code that works today but can't be understood tomorrow is a liability. Maintainability is about respecting future developers—including future you.

## Maintainability Dimensions

### 1. Naming

**Variables and Parameters**

| Good | Bad | Why |
|------|-----|-----|
| `userCount` | `n`, `count` | Unclear what's being counted |
| `isActive` | `flag`, `status` | Boolean should be yes/no question |
| `maxRetries` | `max`, `m` | Max of what? |
| `orderTotal` | `total` | Total of what? |
| `filteredUsers` | `result` | What's in the result? |

**Functions and Methods**

| Good | Bad | Why |
|------|-----|-----|
| `calculateShippingCost` | `calc`, `process` | What does it calculate/process? |
| `validateEmail` | `check` | Check what? Return what? |
| `fetchUserOrders` | `getData` | What data? |
| `isExpired` | `checkExpiry` | Boolean functions should be predicates |
| `sendWelcomeEmail` | `handleUser` | Handle how? |

**Classes and Types**

| Good | Bad | Why |
|------|-----|-----|
| `OrderRepository` | `OrderManager` | Manager doesn't say what it does |
| `EmailValidator` | `Helper` | Helper is meaningless |
| `PaymentProcessor` | `PaymentUtils` | Utils is a junk drawer |
| `UserSession` | `UserData` | Data is vague |

**Anti-patterns:**
- `Manager`, `Helper`, `Utils`, `Handler` — usually means unclear responsibility
- Single letters except in tiny scopes (loop indices)
- Abbreviations that aren't universally known
- Names that lie (`userList` that's actually a Map)

### 2. Function Design

**Length**

| Lines | Assessment |
|-------|------------|
| 1-10 | Great |
| 10-30 | Fine |
| 30-50 | Consider splitting |
| 50+ | Should split |

**Complexity**

| Issue | Symptom | Fix |
|-------|---------|-----|
| Too many parameters | >3-4 params | Introduce parameter object |
| Deep nesting | >3 levels | Early returns, extract methods |
| Long conditionals | `if (a && b \|\| c && !d)` | Extract to named predicate |
| Multiple responsibilities | Does A, B, and C | Split into focused functions |

**Function Design Principles:**

- **Do one thing.** If you need "and" to describe it, split it.
- **Same level of abstraction.** Don't mix high-level and low-level.
- **Few side effects.** Prefer returning values to mutating state.
- **Fail fast.** Handle error cases at the top, happy path below.

**Example: Before**
```javascript
function processOrder(order, user, config) {
  if (order) {
    if (order.items && order.items.length > 0) {
      let total = 0;
      for (let i = 0; i < order.items.length; i++) {
        if (order.items[i].price) {
          total += order.items[i].price * order.items[i].quantity;
        }
      }
      if (user.discount) {
        total = total * (1 - user.discount);
      }
      if (total > config.freeShippingThreshold) {
        // shipping is free
      } else {
        total += config.shippingCost;
      }
      return total;
    }
  }
  return 0;
}
```

**Example: After**
```javascript
function calculateOrderTotal(order, user, config) {
  if (!order?.items?.length) return 0;
  
  const subtotal = calculateSubtotal(order.items);
  const discounted = applyDiscount(subtotal, user.discount);
  const shipping = calculateShipping(discounted, config);
  
  return discounted + shipping;
}

function calculateSubtotal(items) {
  return items.reduce((sum, item) => 
    sum + (item.price ?? 0) * (item.quantity ?? 0), 0);
}

function applyDiscount(amount, discount) {
  return discount ? amount * (1 - discount) : amount;
}

function calculateShipping(subtotal, config) {
  return subtotal > config.freeShippingThreshold ? 0 : config.shippingCost;
}
```

### 3. Code Structure

**File Organization**

| Guideline | Rationale |
|-----------|-----------|
| One concept per file | Easy to find things |
| Related code together | Changes are localized |
| Public API at top | Readers see interface first |
| Implementation details below | Can skip if not needed |
| <500 lines per file | Larger files are harder to navigate |

**Module Organization**

| Pattern | When to Use |
|---------|-------------|
| By feature | When features are independent |
| By layer | When cross-cutting concerns dominate |
| By domain | When domain boundaries are clear |

**Dependency Direction**

Good:
```
Controller → Service → Repository → Database
```

Bad:
```
Controller ← → Service ← → Repository (circular)
```

### 4. Comments

**Good Comments (Why)**

```javascript
// We retry 3 times because the payment API has intermittent failures
// that resolve within seconds. See incident report #456.
const MAX_RETRIES = 3;

// Using linear search because n < 20 and the added complexity
// of maintaining a sorted structure isn't worth it.
const item = items.find(i => i.id === targetId);
```

**Bad Comments (What)**

```javascript
// Increment counter
counter++;

// Loop through users
for (const user of users) {

// Check if null
if (value === null) {
```

**Comment Rules:**

- Comment **why**, not **what**
- Comment surprises, workarounds, business rules
- Don't comment obvious code—improve the code instead
- Keep comments updated (stale comments are worse than none)

### 5. Consistency

**Within File:**
- Same naming conventions throughout
- Same patterns (arrow vs function, etc.)
- Same error handling approach

**Within Codebase:**
- Match existing patterns
- Match existing naming
- Match existing structure

**Consistency > Personal Preference.**

If the codebase uses `callback` but you prefer `cb`, use `callback`. Consistency aids comprehension.

### 6. Testability

Code that's hard to test is often poorly designed.

| Testing Difficulty | Design Issue |
|-------------------|--------------|
| Can't test in isolation | Too many dependencies |
| Need complex setup | Too much coupling |
| Tests are brittle | Testing implementation, not behavior |
| Can't mock dependency | Hardcoded dependencies |
| Random/time-dependent | Impure functions |

**Design for testability:**
- Inject dependencies
- Separate pure logic from I/O
- Small, focused functions
- Avoid global state

## Maintainability Review Checklist

```markdown
### Naming
- [ ] Variables describe what they hold
- [ ] Functions describe what they do
- [ ] No meaningless names (temp, data, result, manager)
- [ ] Consistent naming conventions

### Structure
- [ ] Functions are focused (one job)
- [ ] Functions are short (<50 lines)
- [ ] Nesting is shallow (<4 levels)
- [ ] Files are focused (<500 lines)
- [ ] Related code is grouped

### Clarity
- [ ] Code is self-documenting
- [ ] Comments explain why, not what
- [ ] No dead/commented code
- [ ] No magic numbers

### Consistency
- [ ] Matches codebase conventions
- [ ] Patterns are applied uniformly
- [ ] Similar code looks similar

### Testability
- [ ] Dependencies are injectable
- [ ] Pure logic is separated
- [ ] No global state mutation
```

## Output Format

When reporting maintainability:

```markdown
## Maintainability Assessment

### Naming

✅ Good:
- Function names are clear and descriptive
- Variable names describe their contents

⚠️ Issues:
- `data` in `processData()` line 45 — what kind of data?
- `result` used throughout — be specific

### Structure

✅ Good:
- Functions are reasonably sized
- Clear separation between controller and service

⚠️ Issues:
- `processOrder()` is 75 lines — consider splitting
- 5 levels of nesting in `validateItems()` — use early returns

### Clarity

✅ Good:
- Business rules have explanatory comments

⚠️ Issues:
- Magic number `3` on line 67 — extract to named constant
- Commented-out code on lines 120-135 — remove

### Consistency

✅ Good:
- Follows existing codebase patterns
- Naming conventions match

### Verdict

Minor maintainability issues. Non-blocking, but recommend:
1. Rename generic variables
2. Extract magic numbers
3. Remove dead code
```
