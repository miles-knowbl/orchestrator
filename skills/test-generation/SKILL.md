---
name: test-generation
description: "Generate comprehensive test suites for code. Creates unit tests, integration tests, and end-to-end tests. Identifies what to test, designs test cases, and produces readable, maintainable tests. Ensures adequate coverage of happy paths, edge cases, and error conditions."
phase: TEST
category: engineering
version: "1.0.0"
depends_on: ["implement"]
tags: [quality, testing, core-workflow]
---

# Test Generation

Generate comprehensive tests for code.

## When to Use

- **New code** — Write tests alongside implementation
- **Existing code** — Add tests before refactoring
- **Bug fixes** — Write regression test first
- **Code review** — Identify missing test coverage
- **Increasing coverage** — Fill gaps in test suite
- When you say: "write tests for", "add test coverage", "create unit tests"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `unit-test-patterns.md` | Patterns for effective unit tests |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `integration-test-patterns.md` | When testing component interactions |
| `e2e-test-patterns.md` | When testing full user flows |
| `mocking-patterns.md` | When isolating dependencies |
| `test-data-patterns.md` | When managing test fixtures |

**Verification:** Ensure tests exist for all public functions at minimum.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Test files | `tests/` | Always |
| Test coverage report | Console or file | When coverage tools available |

## Core Concept

Test generation answers: **"How do I prove this code works correctly?"**

Good tests are:
- **Fast** — Run in milliseconds (unit) to seconds (integration)
- **Reliable** — Same result every time, no flakiness
- **Independent** — Don't depend on other tests or order
- **Readable** — Serve as documentation
- **Maintainable** — Easy to update when code changes

Tests should NOT:
- Test implementation details (test behavior)
- Require manual setup or cleanup
- Depend on external services (mock them)
- Be brittle to refactoring

## The Testing Pyramid

```
                    ┌───────────┐
                   /   E2E      \        Few, slow, expensive
                  /   Tests      \       Test full user journeys
                 /─────────────────\
                /   Integration     \    Some, medium speed
               /      Tests          \   Test component interaction
              /───────────────────────\
             /        Unit             \  Many, fast, cheap
            /         Tests             \ Test individual units
           /─────────────────────────────\
```

| Level | Speed | Scope | Count | Purpose |
|-------|-------|-------|-------|---------|
| **Unit** | <10ms | Single function/class | Many | Logic correctness |
| **Integration** | <1s | Multiple components | Some | Component interaction |
| **E2E** | >1s | Full system | Few | User journey validation |

## The Test Generation Process

```
┌─────────────────────────────────────────────────────────┐
│              TEST GENERATION PROCESS                    │
│                                                         │
│  1. UNDERSTAND THE CODE                                 │
│     └─→ What does it do? What are inputs/outputs?       │
│                                                         │
│  2. IDENTIFY TEST CASES                                 │
│     └─→ Happy paths, edge cases, error cases            │
│                                                         │
│  3. DETERMINE TEST TYPE                                 │
│     └─→ Unit, integration, or E2E?                      │
│                                                         │
│  4. SET UP TEST STRUCTURE                               │
│     └─→ Arrange-Act-Assert, describe/it blocks          │
│                                                         │
│  5. WRITE TEST CASES                                    │
│     └─→ One assertion per test, clear names             │
│                                                         │
│  6. ADD EDGE CASES                                      │
│     └─→ Boundaries, empty inputs, nulls                 │
│                                                         │
│  7. VERIFY COVERAGE                                     │
│     └─→ All paths covered? Missing scenarios?           │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Understand the Code

Before writing tests, analyze:

```markdown
## Code Analysis Checklist

### Inputs
- [ ] What parameters does it accept?
- [ ] What are valid input ranges?
- [ ] What inputs are invalid?
- [ ] Are there optional parameters?

### Outputs
- [ ] What does it return?
- [ ] What side effects does it have?
- [ ] What errors can it throw?
- [ ] What state does it modify?

### Dependencies
- [ ] What external services does it call?
- [ ] What database operations does it perform?
- [ ] What other modules does it use?

### Business Logic
- [ ] What are the business rules?
- [ ] What conditions change behavior?
- [ ] What are the edge cases?
```

### Example Analysis

```typescript
// Code to test
async function processOrder(order: Order): Promise<OrderResult> {
  // Validate order
  if (!order.items.length) {
    throw new ValidationError('Order must have items');
  }
  
  // Check inventory
  for (const item of order.items) {
    const stock = await inventory.check(item.sku);
    if (stock < item.quantity) {
      throw new OutOfStockError(item.sku);
    }
  }
  
  // Calculate total
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  
  // Process payment
  const payment = await paymentService.charge(order.customerId, total);
  
  // Create order record
  const result = await orderRepository.create({
    ...order,
    total,
    paymentId: payment.id,
    status: 'confirmed'
  });
  
  return result;
}
```

Analysis:
```markdown
## Inputs
- order: Order object with items[], customerId

## Outputs
- Returns: OrderResult with total, paymentId, status
- Throws: ValidationError, OutOfStockError, PaymentError
- Side effects: Creates order in database, charges payment

## Dependencies
- inventory.check() - external service
- paymentService.charge() - external service
- orderRepository.create() - database

## Business Logic
- Orders must have at least one item
- All items must be in stock
- Tax is 10% of subtotal
- Payment must succeed before order created
```

## Step 2: Identify Test Cases

### Test Case Categories

```
┌─────────────────────────────────────────────────────────┐
│                    TEST CATEGORIES                      │
│                                                         │
│  HAPPY PATH                                             │
│  └─→ Normal successful operation                        │
│      • Valid input, expected output                     │
│      • Most common use case                             │
│                                                         │
│  EDGE CASES                                             │
│  └─→ Boundary conditions                                │
│      • Empty collections                                │
│      • Single item                                      │
│      • Maximum values                                   │
│      • Zero values                                      │
│                                                         │
│  ERROR CASES                                            │
│  └─→ Invalid inputs and failure conditions              │
│      • Missing required fields                          │
│      • Invalid data types                               │
│      • External service failures                        │
│      • Timeout/network errors                           │
│                                                         │
│  SECURITY CASES                                         │
│  └─→ Malicious or unexpected inputs                     │
│      • SQL injection attempts                           │
│      • XSS payloads                                     │
│      • Authorization bypass                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### MECE Failure Taxonomy (Required Coverage)

Every public function MUST have tests covering these mutually exclusive, collectively exhaustive categories:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MECE FAILURE TAXONOMY                                     │
│                                                                             │
│  For each public function/capability, tests MUST cover:                     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 1. HAPPY PATH (at least 1 test)                                      │   │
│  │    • Valid inputs produce expected outputs                           │   │
│  │    • Normal successful operation                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 2. ERROR CASES (1 test per distinct error type)                      │   │
│  │    • Each exception/error the function can throw                     │   │
│  │    • Validation errors (bad input format, missing required)          │   │
│  │    • Business logic errors (insufficient funds, not found)           │   │
│  │    • External failures (network, timeout, service unavailable)       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 3. EDGE CASES (1 test per boundary)                                  │   │
│  │    • Empty/null inputs (empty array, null optional)                  │   │
│  │    • Boundary values (0, 1, max, min)                                │   │
│  │    • Single vs multiple (1 item vs N items)                          │   │
│  │    • Unicode/special characters (if string input)                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 4. STATE TRANSITIONS (if stateful)                                   │   │
│  │    • Valid state transitions succeed                                 │   │
│  │    • Invalid state transitions fail appropriately                    │   │
│  │    • Idempotency (if applicable)                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  These categories are:                                                      │
│  • Mutually Exclusive: Each test belongs to exactly one category            │
│  • Collectively Exhaustive: All failure modes are covered                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Minimum Test Requirements

| Function Type | Happy | Errors | Edges | State | Total Min |
|---------------|-------|--------|-------|-------|-----------|
| Pure function | 1 | Per error type | 2+ | N/A | 4+ |
| Service method | 1 | Per error type | 2+ | If stateful | 5+ |
| API endpoint | 1 | Per HTTP error | 3+ | N/A | 6+ |
| State machine | 1 | Per invalid transition | 2+ | All transitions | 8+ |

### Coverage Verification

Before marking test-generation complete:

```markdown
## Test Coverage Checklist

For each public function:
- [ ] Happy path test exists and passes
- [ ] Every error type has a dedicated test
- [ ] Empty/null inputs are tested
- [ ] Boundary values are tested
- [ ] State transitions tested (if applicable)
- [ ] All tests have clear, descriptive names
- [ ] No test depends on another test's state
```

### Test Case Template

```markdown
## Test Cases for: processOrder

### Happy Path
- [ ] Creates order with single item
- [ ] Creates order with multiple items
- [ ] Calculates correct total with tax
- [ ] Returns confirmed status

### Edge Cases
- [ ] Handles item with quantity of 1
- [ ] Handles item with quantity at max (9999)
- [ ] Handles order with exactly available stock
- [ ] Handles very small prices (0.01)
- [ ] Handles very large totals

### Error Cases
- [ ] Rejects empty order
- [ ] Rejects order with out-of-stock item
- [ ] Handles payment failure
- [ ] Handles database error
- [ ] Handles inventory service timeout

### Integration Points
- [ ] Calls inventory service for each item
- [ ] Charges correct amount to payment service
- [ ] Creates order record in database
```

## Step 3: Determine Test Type

| Scenario | Test Type | Reason |
|----------|-----------|--------|
| Pure calculation logic | Unit | No dependencies |
| Function with mockable deps | Unit | Fast, isolated |
| Multiple components together | Integration | Test interaction |
| Database operations | Integration | Need real/test DB |
| API endpoints | Integration | HTTP layer involved |
| Full user workflow | E2E | End-to-end validation |
| UI interactions | E2E | Browser automation |

### Decision Tree

```
Does it have external dependencies?
├─ No → Unit Test
└─ Yes → Can dependencies be mocked?
         ├─ Yes, and logic is the focus → Unit Test with mocks
         └─ No, or interaction is the focus → Integration Test
                                              └─ Full user journey? → E2E Test
```

## Step 4: Set Up Test Structure

### Arrange-Act-Assert Pattern

```typescript
describe('processOrder', () => {
  it('creates order with correct total', async () => {
    // ARRANGE: Set up test data and mocks
    const order = createTestOrder({ items: [{ price: 100, quantity: 2 }] });
    mockInventory.check.mockResolvedValue(10);
    mockPayment.charge.mockResolvedValue({ id: 'pay_123' });
    mockRepository.create.mockResolvedValue({ id: 'ord_123' });
    
    // ACT: Execute the code under test
    const result = await processOrder(order);
    
    // ASSERT: Verify the results
    expect(result.total).toBe(220); // 200 + 10% tax
    expect(result.status).toBe('confirmed');
  });
});
```

### Given-When-Then (BDD Style)

```typescript
describe('Order Processing', () => {
  describe('given a valid order with items in stock', () => {
    const order = createTestOrder();
    
    beforeEach(() => {
      mockInventory.check.mockResolvedValue(100);
      mockPayment.charge.mockResolvedValue({ id: 'pay_123' });
    });
    
    describe('when the order is processed', () => {
      let result: OrderResult;
      
      beforeEach(async () => {
        result = await processOrder(order);
      });
      
      it('then the order status is confirmed', () => {
        expect(result.status).toBe('confirmed');
      });
      
      it('then the payment is charged', () => {
        expect(mockPayment.charge).toHaveBeenCalled();
      });
    });
  });
});
```

## Step 5: Write Test Cases

### Naming Conventions

```typescript
// Pattern: [unit]_[scenario]_[expected result]
describe('calculateTotal', () => {
  it('returns_zero_when_cart_is_empty', () => {});
  it('sums_item_prices_for_single_item', () => {});
  it('applies_discount_when_coupon_valid', () => {});
  it('throws_error_when_items_null', () => {});
});

// Pattern: should [expected behavior] when [condition]
describe('calculateTotal', () => {
  it('should return zero when cart is empty', () => {});
  it('should sum item prices for single item', () => {});
  it('should apply discount when coupon is valid', () => {});
  it('should throw error when items is null', () => {});
});
```

### One Assertion Per Test

```typescript
// BAD: Multiple assertions testing different things
it('processes order correctly', async () => {
  const result = await processOrder(order);
  expect(result.total).toBe(220);
  expect(result.status).toBe('confirmed');
  expect(mockPayment.charge).toHaveBeenCalledWith('cust_1', 220);
  expect(mockRepository.create).toHaveBeenCalled();
});

// GOOD: Separate tests for each behavior
it('calculates correct total with tax', async () => {
  const result = await processOrder(order);
  expect(result.total).toBe(220);
});

it('sets status to confirmed', async () => {
  const result = await processOrder(order);
  expect(result.status).toBe('confirmed');
});

it('charges payment with correct amount', async () => {
  await processOrder(order);
  expect(mockPayment.charge).toHaveBeenCalledWith('cust_1', 220);
});
```

### Testing Errors

```typescript
describe('error handling', () => {
  it('throws ValidationError for empty order', async () => {
    const emptyOrder = createTestOrder({ items: [] });
    
    await expect(processOrder(emptyOrder))
      .rejects
      .toThrow(ValidationError);
  });
  
  it('throws OutOfStockError when item unavailable', async () => {
    mockInventory.check.mockResolvedValue(0);
    
    await expect(processOrder(order))
      .rejects
      .toThrow(OutOfStockError);
  });
  
  it('includes SKU in OutOfStockError message', async () => {
    mockInventory.check.mockResolvedValue(0);
    
    await expect(processOrder(order))
      .rejects
      .toThrow(/SKU-123/);
  });
});
```

→ See `references/unit-test-patterns.md`

## Step 6: Add Edge Cases

### Common Edge Cases

| Category | Cases to Test |
|----------|---------------|
| **Numbers** | 0, 1, -1, MAX_INT, MIN_INT, decimals, NaN, Infinity |
| **Strings** | Empty "", single char, very long, unicode, whitespace only |
| **Arrays** | Empty [], single item, many items, duplicates |
| **Objects** | Empty {}, missing fields, extra fields, null |
| **Dates** | Now, past, future, leap years, timezone boundaries |
| **Async** | Fast response, slow response, timeout, retry |

### Boundary Testing

```typescript
describe('quantity validation', () => {
  // Boundary: minimum valid value
  it('accepts quantity of 1', () => {
    expect(() => validateQuantity(1)).not.toThrow();
  });
  
  // Boundary: just below minimum
  it('rejects quantity of 0', () => {
    expect(() => validateQuantity(0)).toThrow('Quantity must be positive');
  });
  
  // Boundary: maximum valid value
  it('accepts quantity of 9999', () => {
    expect(() => validateQuantity(9999)).not.toThrow();
  });
  
  // Boundary: just above maximum
  it('rejects quantity of 10000', () => {
    expect(() => validateQuantity(10000)).toThrow('Quantity exceeds maximum');
  });
});
```

### Null and Undefined

```typescript
describe('null handling', () => {
  it('handles null input gracefully', () => {
    expect(() => processUser(null)).toThrow('User is required');
  });
  
  it('handles undefined input gracefully', () => {
    expect(() => processUser(undefined)).toThrow('User is required');
  });
  
  it('handles user with null email', () => {
    const user = { name: 'Test', email: null };
    expect(() => processUser(user)).toThrow('Email is required');
  });
});
```

## Step 7: Verify Coverage

### Coverage Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Line** | Lines executed | >80% |
| **Branch** | If/else paths taken | >80% |
| **Function** | Functions called | >90% |
| **Statement** | Statements executed | >80% |

### Finding Coverage Gaps

```bash
# Generate coverage report
npm test -- --coverage

# Look for:
# - Red lines (not covered)
# - Yellow branches (partial coverage)
# - Files with low percentages
```

### Coverage vs Quality

```markdown
## High Coverage ≠ Good Tests

Coverage tells you what code ran, not if it's tested correctly.

BAD: 100% coverage, no assertions
```typescript
it('has coverage', () => {
  processOrder(order); // Code runs but nothing verified
});
```

GOOD: Meaningful coverage with assertions
```typescript
it('calculates tax correctly', () => {
  const result = processOrder(order);
  expect(result.tax).toBe(order.subtotal * 0.1);
});
```
```

## Test Organization

### File Structure

```
src/
├── services/
│   └── orderService.ts
├── __tests__/
│   ├── unit/
│   │   └── orderService.test.ts
│   ├── integration/
│   │   └── orderService.integration.test.ts
│   └── e2e/
│       └── checkout.e2e.test.ts
```

### Test File Template

```typescript
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { OrderService } from '../orderService';
import { createMockInventory, createMockPayment } from '../__mocks__';

describe('OrderService', () => {
  // Shared setup
  let service: OrderService;
  let mockInventory: jest.Mocked<InventoryService>;
  let mockPayment: jest.Mocked<PaymentService>;
  
  beforeEach(() => {
    mockInventory = createMockInventory();
    mockPayment = createMockPayment();
    service = new OrderService(mockInventory, mockPayment);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('processOrder', () => {
    describe('happy path', () => {
      it('creates order successfully', async () => {
        // ...
      });
    });
    
    describe('validation', () => {
      it('rejects empty order', async () => {
        // ...
      });
    });
    
    describe('error handling', () => {
      it('handles payment failure', async () => {
        // ...
      });
    });
  });
});
```

## Mocking Strategies

### When to Mock

| Mock | Don't Mock |
|------|------------|
| External APIs | Pure functions |
| Databases | Simple utilities |
| File system | Value objects |
| Time/dates | The code under test |
| Randomness | |

### Mock Types

```typescript
// Stub: Returns canned data
const stubInventory = {
  check: jest.fn().mockResolvedValue(100)
};

// Mock: Verifies interactions
const mockPayment = {
  charge: jest.fn().mockResolvedValue({ id: 'pay_1' })
};
// Later: expect(mockPayment.charge).toHaveBeenCalledWith(...)

// Spy: Wraps real implementation
const spy = jest.spyOn(logger, 'error');
// Later: expect(spy).toHaveBeenCalled();

// Fake: Working implementation for tests
class FakeUserRepository implements UserRepository {
  private users = new Map<string, User>();
  
  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
  
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }
}
```

→ See `references/mocking-patterns.md`

## Test Data

### Factory Functions

```typescript
// factories/order.ts
export function createTestOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord_test_123',
    customerId: 'cust_test_1',
    items: [
      { sku: 'SKU-1', name: 'Test Item', price: 100, quantity: 1 }
    ],
    status: 'pending',
    createdAt: new Date(),
    ...overrides
  };
}

// Usage in tests
it('handles multiple items', async () => {
  const order = createTestOrder({
    items: [
      { sku: 'A', name: 'Item A', price: 50, quantity: 2 },
      { sku: 'B', name: 'Item B', price: 30, quantity: 1 },
    ]
  });
  
  const result = await processOrder(order);
  expect(result.subtotal).toBe(130);
});
```

### Builder Pattern

```typescript
class OrderBuilder {
  private order: Partial<Order> = {};
  
  withCustomer(customerId: string): this {
    this.order.customerId = customerId;
    return this;
  }
  
  withItem(item: OrderItem): this {
    this.order.items = [...(this.order.items ?? []), item];
    return this;
  }
  
  withStatus(status: OrderStatus): this {
    this.order.status = status;
    return this;
  }
  
  build(): Order {
    return createTestOrder(this.order);
  }
}

// Usage
const order = new OrderBuilder()
  .withCustomer('cust_vip')
  .withItem({ sku: 'PREMIUM', name: 'Premium', price: 500, quantity: 1 })
  .withStatus('pending')
  .build();
```

→ See `references/test-data-patterns.md`

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `implement` | Tests written alongside implementation |
| `refactor` | Tests enable safe refactoring |
| `code-verification` | Tests verify structural correctness |
| `code-validation` | Tests validate semantic correctness |
| `code-review` | Review checks for adequate tests |
| `debug-assist` | Tests help isolate bugs |
| `spec` | Specs define what to test |

## Key Principles

**Test behavior, not implementation.** Tests should survive refactoring.

**One reason to fail.** Each test should test one thing.

**Tests are documentation.** A reader should understand the code from tests.

**Fast feedback.** Tests should run in seconds, not minutes.

**Deterministic.** Same input, same result, every time.

**Independent.** Tests shouldn't depend on each other or run order.

## References

- `references/unit-test-patterns.md`: Unit testing patterns and examples
- `references/integration-test-patterns.md`: Integration testing approaches
- `references/e2e-test-patterns.md`: End-to-end testing with Playwright
- `references/mocking-patterns.md`: Mocking strategies and best practices
- `references/test-data-patterns.md`: Test data generation patterns
