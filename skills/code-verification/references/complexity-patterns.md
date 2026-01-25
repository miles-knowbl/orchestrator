# Complexity Patterns

Patterns that indicate problematic time or space complexity. These are the most common issues in AI-generated code.

## Why This Matters

AI code generators optimize for correctness and readability, not performance. They frequently produce O(n²) solutions where O(n) is possible. At small scale (n < 100), this doesn't matter. At production scale (n > 10,000), it's catastrophic.

Your job: Catch these before they reach production.

## Detection Patterns

### Pattern 1: Nested Loop Over Same Data

**Anti-pattern:**
```javascript
// O(n²) - for each user, scan all orders
users.forEach(user => {
  const userOrders = orders.filter(o => o.userId === user.id);
});
```

**Detection signal:** Loop inside loop over related data structures.

**Fix:**
```javascript
// O(n) - build index once, lookup in constant time
const ordersByUser = new Map();
orders.forEach(o => {
  if (!ordersByUser.has(o.userId)) ordersByUser.set(o.userId, []);
  ordersByUser.get(o.userId).push(o);
});

users.forEach(user => {
  const userOrders = ordersByUser.get(user.id) || [];
});
```

### Pattern 2: Search Inside Loop

**Anti-pattern:**
```javascript
// O(n²) - .find() is O(n), called n times
items.map(item => {
  const category = categories.find(c => c.id === item.categoryId);
  return { ...item, categoryName: category?.name };
});
```

**Detection signal:** `.find()`, `.filter()`, `.includes()`, `.indexOf()` inside `.map()`, `.forEach()`, `for` loop.

**Fix:**
```javascript
// O(n) - build Map once
const categoryMap = new Map(categories.map(c => [c.id, c]));

items.map(item => {
  const category = categoryMap.get(item.categoryId);
  return { ...item, categoryName: category?.name };
});
```

### Pattern 3: String Concatenation in Loop

**Anti-pattern:**
```javascript
// O(n²) in many languages - strings are immutable, each += copies
let result = '';
for (const item of items) {
  result += item.toString() + ',';
}
```

**Detection signal:** String `+=` or `+` inside a loop.

**Why it's O(n²):** Each concatenation creates a new string, copying all previous characters. First iteration copies 1 char, second copies 2, etc. Total: 1 + 2 + 3 + ... + n = O(n²).

**Fix:**
```javascript
// O(n) - join handles this efficiently
const result = items.map(item => item.toString()).join(',');

// Or use array accumulation
const parts = [];
for (const item of items) {
  parts.push(item.toString());
}
const result = parts.join(',');
```

### Pattern 4: Sorting Inside Loop

**Anti-pattern:**
```javascript
// O(n² log n) - sorting is O(n log n), done n times
users.forEach(user => {
  const sorted = user.transactions.sort((a, b) => b.date - a.date);
  // ...
});
```

**Detection signal:** `.sort()` inside any loop construct.

**Fix:** Sort once outside the loop if possible, or question whether sorting is needed at all.

### Pattern 5: Recursive Branching

**Anti-pattern:**
```javascript
// O(2ⁿ) - exponential, will hang for n > 30
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);  // Two recursive calls
}
```

**Detection signal:** Function that calls itself twice (or more) per invocation without memoization.

**Fix:**
```javascript
// O(n) with memoization
function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}

// Or O(n) iterative
function fib(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}
```

### Pattern 6: Repeated Array Operations

**Anti-pattern:**
```javascript
// O(n²) - unshift is O(n), done n times
const reversed = [];
for (const item of items) {
  reversed.unshift(item);  // Shifts all elements each time
}
```

**Detection signal:** `.unshift()`, `.splice(0, ...)` inside a loop.

**Fix:**
```javascript
// O(n) - push is O(1) amortized
const reversed = [];
for (const item of items) {
  reversed.push(item);
}
reversed.reverse();

// Or just use built-in
const reversed = [...items].reverse();
```

### Pattern 7: Uniqueness Check via Array

**Anti-pattern:**
```javascript
// O(n²) - includes is O(n), called n times
const unique = [];
for (const item of items) {
  if (!unique.includes(item)) {
    unique.push(item);
  }
}
```

**Detection signal:** `.includes()` on an array that's being built in the same loop.

**Fix:**
```javascript
// O(n) - Set has O(1) lookup
const unique = [...new Set(items)];

// Or if you need more control
const seen = new Set();
const unique = [];
for (const item of items) {
  if (!seen.has(item)) {
    seen.add(item);
    unique.push(item);
  }
}
```

### Pattern 8: Cartesian Product (Intentional but Dangerous)

**Not always wrong, but flag for review:**
```javascript
// O(n × m) - intentional but verify this is necessary
for (const a of listA) {
  for (const b of listB) {
    if (shouldMatch(a, b)) {
      // ...
    }
  }
}
```

**Question to ask:** Is this actually necessary, or can we index one side?

## Quick Reference Table

| Pattern | Complexity | Detection Signal | Fix Strategy |
|---------|------------|------------------|--------------|
| Nested loop, same data | O(n²) | Loop in loop | Build index/Map |
| Search in loop | O(n²) | find/filter/includes in loop | Pre-build Map |
| String concat in loop | O(n²) | += string in loop | Array + join |
| Sort in loop | O(n² log n) | .sort() in loop | Sort once outside |
| Recursive branching | O(2ⁿ) | Multiple recursive calls | Memoization/iteration |
| Unshift in loop | O(n²) | .unshift() in loop | Push + reverse |
| Includes on growing array | O(n²) | .includes() on accumulator | Use Set |

## When Complexity is Acceptable

Not all O(n²) is bad. Consider:

- **n is bounded and small**: If n is always < 50, O(n²) is 2500 operations max. Fine.
- **It's not in a hot path**: If this runs once at startup, not per request, less critical.
- **Readability tradeoff**: Sometimes the O(n) version is significantly less readable.

But in verification, **flag it anyway**. The human or the next iteration can decide if it's acceptable. Don't pre-optimize the warning away.

## Verification Checklist

For every code block, scan for:

1. [ ] Loops inside loops over related data
2. [ ] `.find()`, `.filter()`, `.includes()` inside loops
3. [ ] String concatenation with `+=` inside loops
4. [ ] `.sort()` inside loops
5. [ ] Recursive functions with multiple self-calls
6. [ ] `.unshift()` or `.splice(0, ...)` inside loops
7. [ ] `.includes()` on an array being built in same loop

If any found: **FAIL** with location and suggested fix.
