---
name: refactor
description: "Improve existing code without changing its external behavior. Identifies code smells, applies proven refactoring patterns, and ensures safety through tests. Makes code more readable, maintainable, and performant while preserving functionality."
phase: REVIEW
category: core
version: "1.0.0"
depends_on: [implement]
tags: [quality, refactoring, improvement, code-quality]
---

# Refactor

Improve code without changing behavior.

## When to Use

- **Before adding features** — Clean up code that will be modified
- **After code review** — Address feedback about code quality
- **Technical debt** — Pay down accumulated cruft
- **Performance issues** — Optimize hot paths
- **Comprehension problems** — Make code easier to understand
- When you say: "refactor this", "clean up", "improve this code"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `refactoring-catalog.md` | Named refactoring patterns |
| `code-smells.md` | Identify what needs refactoring |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `refactoring-strategies.md` | When planning large refactors |
| `legacy-code-patterns.md` | When working with legacy code |

**Verification:** Ensure tests pass after refactoring to confirm behavior preserved.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Refactored code | `src/` | Always |
| Updated tests | `tests/` | If behavior changed |
| `REFACTOR.md` | Project root | For significant refactors |

## Core Concept

Refactor answers: **"How do I make this code better without breaking it?"**

Refactoring is:
- **Behavior-preserving** — External behavior stays the same
- **Incremental** — Small steps, each leaving code working
- **Test-supported** — Tests verify nothing broke
- **Intentional** — Driven by specific improvements

Refactoring is NOT:
- Adding new features
- Fixing bugs (that changes behavior)
- Rewriting from scratch
- Performance optimization alone (though it can enable it)

## The Refactoring Process

```
┌─────────────────────────────────────────────────────────┐
│                  REFACTORING PROCESS                    │
│                                                         │
│  1. ENSURE TEST COVERAGE                                │
│     └─→ Can't refactor safely without tests             │
│                                                         │
│  2. IDENTIFY CODE SMELLS                                │
│     └─→ What specifically is wrong?                     │
│                                                         │
│  3. SELECT REFACTORING                                  │
│     └─→ Which pattern addresses the smell?              │
│                                                         │
│  4. APPLY IN SMALL STEPS                                │
│     └─→ One change at a time, tests passing             │
│                                                         │
│  5. TEST AFTER EACH STEP                                │
│     └─→ Run tests, verify behavior unchanged            │
│                                                         │
│  6. COMMIT FREQUENTLY                                   │
│     └─→ Small commits, easy to revert                   │
│                                                         │
│  7. REVIEW THE RESULT                                   │
│     └─→ Is the code actually better?                    │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Ensure Test Coverage

**Never refactor without tests.**

Before refactoring, verify:

```markdown
## Pre-Refactoring Checklist

- [ ] Unit tests exist for the code being changed
- [ ] Tests cover the main behaviors
- [ ] Tests cover important edge cases
- [ ] All tests pass
- [ ] You understand what the tests are checking
```

If tests don't exist:

```markdown
## Adding Tests Before Refactoring

1. Write characterization tests (tests that capture current behavior)
2. Focus on inputs and outputs, not implementation
3. Cover happy path and error cases
4. Get tests passing before any refactoring
```

```typescript
// Characterization test - captures current behavior
describe('OrderCalculator', () => {
  it('calculates total for current production data', () => {
    // Use actual examples from production
    const order = {
      items: [
        { price: 1999, quantity: 2 },
        { price: 499, quantity: 1 },
      ],
      discount: 0.1,
    };

    // Capture current output (run once to get value)
    expect(calculator.getTotal(order)).toBe(4047);
  });
});
```

## Step 2: Identify Code Smells

Code smells are symptoms that suggest refactoring opportunities.

### Bloaters (Too Big)

| Smell | Symptom | Refactoring |
|-------|---------|-------------|
| **Long Method** | Method >20 lines, hard to understand | Extract Method |
| **Large Class** | Class does too many things | Extract Class |
| **Long Parameter List** | >3 parameters | Parameter Object |
| **Primitive Obsession** | Using primitives for domain concepts | Value Objects |
| **Data Clumps** | Same fields appear together repeatedly | Extract Class |

### Object-Orientation Abusers

| Smell | Symptom | Refactoring |
|-------|---------|-------------|
| **Switch Statements** | Repeated switches on type | Replace with Polymorphism |
| **Parallel Inheritance** | Subclass in one hierarchy requires subclass in another | Move Method, Collapse Hierarchy |
| **Refused Bequest** | Subclass doesn't use inherited methods | Replace Inheritance with Delegation |
| **Alternative Classes** | Different classes with similar interfaces | Extract Superclass |

### Change Preventers

| Smell | Symptom | Refactoring |
|-------|---------|-------------|
| **Divergent Change** | One class changed for multiple reasons | Extract Class |
| **Shotgun Surgery** | One change requires edits to many classes | Move Method, Inline Class |
| **Feature Envy** | Method uses another class's data more than its own | Move Method |

### Dispensables (Remove)

| Smell | Symptom | Refactoring |
|-------|---------|-------------|
| **Comments** | Code needs explanation to understand | Extract Method, Rename |
| **Duplicate Code** | Same code in multiple places | Extract Method, Pull Up |
| **Dead Code** | Unreachable or unused code | Delete it |
| **Speculative Generality** | Unused abstractions "just in case" | Collapse Hierarchy, Inline |
| **Lazy Class** | Class that doesn't do enough | Inline Class |

### Couplers (Too Connected)

| Smell | Symptom | Refactoring |
|-------|---------|-------------|
| **Feature Envy** | Method uses another class more than its own | Move Method |
| **Inappropriate Intimacy** | Classes know too much about each other | Move Method, Extract Class |
| **Message Chains** | a.b().c().d().e() | Hide Delegate |
| **Middle Man** | Class just delegates everything | Remove Middle Man |

→ See `references/code-smells.md`

## Step 3: Select Refactoring

Match the smell to the refactoring:

```
┌─────────────────────────────────────────────────────────┐
│             SMELL → REFACTORING DECISION                │
│                                                         │
│  Long Method?                                           │
│  └─→ Extract Method                                     │
│                                                         │
│  Duplicate Code?                                        │
│  ├─→ Same class: Extract Method                         │
│  ├─→ Sibling classes: Pull Up Method                    │
│  └─→ Unrelated classes: Extract Class                   │
│                                                         │
│  Long Parameter List?                                   │
│  ├─→ Related params: Introduce Parameter Object         │
│  └─→ Can compute: Replace Parameter with Method Call    │
│                                                         │
│  Switch on Type?                                        │
│  └─→ Replace Conditional with Polymorphism              │
│                                                         │
│  Feature Envy?                                          │
│  └─→ Move Method to the class it envies                 │
│                                                         │
│  Data Clump?                                            │
│  └─→ Extract Class for the clumped data                 │
│                                                         │
│  Primitive Obsession?                                   │
│  └─→ Replace Primitive with Value Object                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Step 4: Apply in Small Steps

**The key to safe refactoring: small, reversible steps.**

### Extract Method Example

Before:
```typescript
function printOrder(order: Order): void {
  console.log('Order Details');
  console.log('=============');

  // Print items
  let total = 0;
  for (const item of order.items) {
    console.log(`${item.name}: $${item.price}`);
    total += item.price * item.quantity;
  }

  // Apply discount
  if (order.discount > 0) {
    const discountAmount = total * order.discount;
    total -= discountAmount;
    console.log(`Discount: -$${discountAmount}`);
  }

  // Print total
  console.log('=============');
  console.log(`Total: $${total}`);
}
```

Step 1 - Extract `printItems`:
```typescript
function printOrder(order: Order): void {
  console.log('Order Details');
  console.log('=============');

  const subtotal = printItems(order.items);  // ← Extracted

  // Apply discount
  let total = subtotal;
  if (order.discount > 0) {
    const discountAmount = total * order.discount;
    total -= discountAmount;
    console.log(`Discount: -$${discountAmount}`);
  }

  console.log('=============');
  console.log(`Total: $${total}`);
}

function printItems(items: OrderItem[]): number {
  let total = 0;
  for (const item of items) {
    console.log(`${item.name}: $${item.price}`);
    total += item.price * item.quantity;
  }
  return total;
}
```

**Run tests. ✓**

Step 2 - Extract `applyDiscount`:
```typescript
function printOrder(order: Order): void {
  console.log('Order Details');
  console.log('=============');

  const subtotal = printItems(order.items);
  const total = applyDiscount(subtotal, order.discount);  // ← Extracted

  console.log('=============');
  console.log(`Total: $${total}`);
}

function applyDiscount(subtotal: number, discount: number): number {
  if (discount > 0) {
    const discountAmount = subtotal * discount;
    console.log(`Discount: -$${discountAmount}`);
    return subtotal - discountAmount;
  }
  return subtotal;
}
```

**Run tests. ✓**

Step 3 - Extract `printHeader` and `printTotal`:
```typescript
function printOrder(order: Order): void {
  printHeader();
  const subtotal = printItems(order.items);
  const total = applyDiscount(subtotal, order.discount);
  printTotal(total);
}

function printHeader(): void {
  console.log('Order Details');
  console.log('=============');
}

function printTotal(total: number): void {
  console.log('=============');
  console.log(`Total: $${total}`);
}
```

**Run tests. ✓ Commit.**

→ See `references/refactoring-catalog.md`

## Step 5: Test After Each Step

```typescript
// After EVERY small change:
npm test

// If tests fail:
// 1. Undo the change (git checkout)
// 2. Try smaller step
// 3. Or fix the issue before continuing
```

### Testing Strategies During Refactoring

| Strategy | When to Use |
|----------|-------------|
| **Run all tests** | Small codebase, fast tests |
| **Run affected tests** | Large codebase, slow tests |
| **Snapshot testing** | Complex output you want to preserve |
| **Manual verification** | UI changes, no automated tests |

## Step 6: Commit Frequently

```bash
# Good: Small, atomic commits
git commit -m "refactor: extract printItems method"
git commit -m "refactor: extract applyDiscount method"
git commit -m "refactor: extract header and footer printing"

# Bad: One big commit
git commit -m "refactor: cleaned up printOrder"
```

Benefits:
- Easy to revert one step if something breaks
- Clear history of what changed
- Easier code review
- Can bisect to find problems

## Step 7: Review the Result

After refactoring, ask:

```markdown
## Post-Refactoring Review

### Readability
- [ ] Is the code easier to understand?
- [ ] Are names clearer?
- [ ] Is the structure more logical?

### Maintainability
- [ ] Is it easier to change?
- [ ] Are responsibilities clear?
- [ ] Is duplication reduced?

### Correctness
- [ ] All tests still pass?
- [ ] No behavior changed?
- [ ] Edge cases still work?

### Did we overdo it?
- [ ] Is it simpler, not more complex?
- [ ] Did we avoid premature abstraction?
- [ ] Is it still easy to debug?
```

## Common Refactorings

### Extract Method

**When:** Long method, code block that can be named

```typescript
// Before
function processOrder(order: Order): void {
  // Validate order
  if (!order.items.length) throw new Error('Empty order');
  if (!order.customer) throw new Error('No customer');
  if (order.total < 0) throw new Error('Invalid total');

  // Process...
}

// After
function processOrder(order: Order): void {
  validateOrder(order);
  // Process...
}

function validateOrder(order: Order): void {
  if (!order.items.length) throw new Error('Empty order');
  if (!order.customer) throw new Error('No customer');
  if (order.total < 0) throw new Error('Invalid total');
}
```

### Rename

**When:** Name doesn't clearly express intent

```typescript
// Before
function calc(d: number[]): number {
  let t = 0;
  for (const n of d) t += n;
  return t / d.length;
}

// After
function calculateAverage(numbers: number[]): number {
  let sum = 0;
  for (const number of numbers) sum += number;
  return sum / numbers.length;
}
```

### Replace Conditional with Polymorphism

**When:** Switch statement on type that appears in multiple places

```typescript
// Before
function calculatePay(employee: Employee): number {
  switch (employee.type) {
    case 'hourly':
      return employee.hours * employee.rate;
    case 'salaried':
      return employee.salary / 12;
    case 'commission':
      return employee.sales * employee.commissionRate;
  }
}

// After
interface Employee {
  calculatePay(): number;
}

class HourlyEmployee implements Employee {
  constructor(private hours: number, private rate: number) {}
  calculatePay(): number {
    return this.hours * this.rate;
  }
}

class SalariedEmployee implements Employee {
  constructor(private salary: number) {}
  calculatePay(): number {
    return this.salary / 12;
  }
}

class CommissionEmployee implements Employee {
  constructor(private sales: number, private rate: number) {}
  calculatePay(): number {
    return this.sales * this.rate;
  }
}
```

### Introduce Parameter Object

**When:** Same parameters passed together repeatedly

```typescript
// Before
function createEvent(
  startDate: Date,
  endDate: Date,
  startTime: string,
  endTime: string,
  timezone: string
): Event { }

function validateDateRange(
  startDate: Date,
  endDate: Date,
  startTime: string,
  endTime: string,
  timezone: string
): boolean { }

// After
interface DateRange {
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  timezone: string;
}

function createEvent(range: DateRange): Event { }
function validateDateRange(range: DateRange): boolean { }
```

### Replace Primitive with Value Object

**When:** Primitive carries domain meaning

```typescript
// Before
function processPayment(amountCents: number, currency: string): void {
  // Easy to make mistakes:
  // - Pass dollars instead of cents
  // - Pass invalid currency
  // - Mix up currencies
}

// After
class Money {
  constructor(
    private readonly cents: number,
    private readonly currency: Currency
  ) {
    if (cents < 0) throw new Error('Amount cannot be negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
    return new Money(this.cents + other.cents, this.currency);
  }

  toString(): string {
    return `${this.currency} ${(this.cents / 100).toFixed(2)}`;
  }
}

function processPayment(amount: Money): void {
  // Type system prevents mistakes
}
```

→ See `references/refactoring-catalog.md`

## When NOT to Refactor

| Situation | Why Not | Alternative |
|-----------|---------|-------------|
| **No tests** | Can't verify behavior preserved | Write tests first |
| **Deadline pressure** | Risk of breaking things | Schedule for later |
| **Rewrite needed** | Refactoring won't help | Plan rewrite instead |
| **Working code you won't touch** | No benefit | Leave it alone |
| **During feature development** | Context switching | Finish feature first |

## Refactoring vs Rewriting

| Refactoring | Rewriting |
|-------------|-----------|
| Incremental changes | Start from scratch |
| Behavior preserved | May change behavior |
| Low risk | High risk |
| Continuous delivery | Big bang |
| Tests guide you | Need new tests |

**Rule of thumb:** If you can improve the code through a series of small, safe changes, refactor. If the code is fundamentally broken or the design is wrong, consider rewriting.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `code-review` | Review may identify refactoring opportunities |
| `code-verification` | Verify structure after refactoring |
| `code-validation` | Validate behavior preserved |
| `implement` | Refactor before implementing new features |
| `debug-assist` | May refactor to make debugging easier |
| `test-generation` | Need tests before refactoring |

## Key Principles

**Small steps.** Each change should be trivial and safe.

**Tests first.** Never refactor without tests.

**One thing at a time.** Don't mix refactoring with feature work.

**Commit often.** Make it easy to revert.

**Know when to stop.** Good enough is good enough.

**Preserve behavior.** The whole point is not changing what the code does.

## Mode-Specific Behavior

Refactoring scope and constraints differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full—any code in the new system |
| **Approach** | Comprehensive—refactor as you go |
| **Patterns** | Free choice—establish clean patterns |
| **Deliverables** | Full refactored code with tests |
| **Validation** | Standard—tests before and after |
| **Constraints** | Minimal—separate commits encouraged |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific—related code primarily |
| **Approach** | Extend existing—refactor before filling gap |
| **Patterns** | Should match existing codebase style |
| **Deliverables** | Delta refactoring separate from features |
| **Validation** | Existing tests + new coverage |
| **Constraints** | Don't restructure unrelated code |

**Polish considerations:**
- Refactor only what you're changing
- Don't "improve" unrelated code
- Match refactoring style to codebase
- Document why refactoring was needed
- Get approval for large refactors

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific—related code only |
| **Approach** | Surgical—avoid refactoring if possible |
| **Patterns** | Must conform exactly—no style changes |
| **Deliverables** | Change record with separate CR |
| **Validation** | Full regression testing required |
| **Constraints** | Requires approval—never mix with features |

**Enterprise refactoring constraints:**
- Refactoring requires separate change request
- No refactoring mixed with feature changes
- Must justify business value of refactoring
- Full test coverage required before and after
- Rollback plan required

**Enterprise refactoring process:**
1. Create separate CR for refactoring
2. Get CR approved
3. Implement refactoring in isolation
4. Full regression testing
5. Merge refactoring first
6. Then implement feature change

---

## References

- `references/code-smells.md`: Detailed catalog of code smells
- `references/refactoring-catalog.md`: Complete refactoring patterns
- `references/refactoring-strategies.md`: Large-scale refactoring approaches
- `references/legacy-code-patterns.md`: Working with code without tests
