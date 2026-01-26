# Refactoring Strategies

Approaches for large-scale refactoring and codebase improvement.

## Strategy Selection

| Situation | Strategy |
|-----------|----------|
| Small, focused changes | Opportunistic Refactoring |
| Preparing for a feature | Preparatory Refactoring |
| Understanding code | Comprehension Refactoring |
| Cleaning up after feature | Cleanup Refactoring |
| Large architectural change | Planned Refactoring |
| Introducing patterns gradually | Strangler Fig |
| Changing interfaces safely | Expand-Contract |

## Opportunistic Refactoring

**When:** You notice small improvements while working on other code.

**Approach:** "Leave the code cleaner than you found it."

```markdown
## Example Workflow

1. Working on feature X
2. Notice poorly named variable
3. Quick rename (2 minutes)
4. Continue with feature X
5. Notice duplicate code
6. Quick extract method (5 minutes)
7. Continue with feature X
8. Commit feature + refactorings together
```

**Guidelines:**
- Keep refactorings small (<10 minutes)
- Don't start if it becomes large
- Run tests after each refactoring
- Include in same PR as feature

## Preparatory Refactoring

**When:** Current code structure makes new feature difficult.

**Approach:** "First make the change easy, then make the easy change."

```markdown
## Example Workflow

1. Feature: Add new payment method
2. Current code has hardcoded payment logic
3. Before feature:
   - Extract PaymentProcessor interface
   - Move existing logic to StripePaymentProcessor
   - Add factory for payment processors
4. Commit refactoring (separate PR)
5. Now feature is easy:
   - Add PayPalPaymentProcessor
   - Register in factory
6. Commit feature
```

```typescript
// Before: Hardcoded Stripe
function processPayment(amount: number, card: CardInfo): void {
  stripe.charges.create({ amount, source: card.token });
}

// After preparatory refactoring: Extensible
interface PaymentProcessor {
  process(amount: number, details: PaymentDetails): Promise<PaymentResult>;
}

class StripeProcessor implements PaymentProcessor { /* ... */ }

// Now adding PayPal is easy
class PayPalProcessor implements PaymentProcessor { /* ... */ }
```

**Guidelines:**
- Separate refactoring from feature in commits
- Consider separate PR for large refactorings
- Refactoring should make feature trivial to add

## Comprehension Refactoring

**When:** You're trying to understand confusing code.

**Approach:** Refactor as you learn to capture your understanding.

```markdown
## Example Workflow

1. Reading complex function
2. "What does this section do?"
3. Extract method with descriptive name
4. "Ah, it calculates shipping discount"
5. Rename variables as you understand them
6. Add type annotations where unclear
7. Now code documents your understanding
```

```typescript
// Before: What is this?
function calc(o: any): number {
  let t = 0;
  for (const i of o.i) {
    t += i.p * i.q;
  }
  if (o.c && o.c.d > 0) {
    t = t * (1 - o.c.d);
  }
  if (t > 100) {
    t = t * 0.9;
  }
  return t;
}

// After: Now it's clear
function calculateOrderTotal(order: Order): number {
  const subtotal = calculateSubtotal(order.items);
  const afterCoupon = applyCouponDiscount(subtotal, order.coupon);
  const afterBulk = applyBulkDiscount(afterCoupon);
  return afterBulk;
}

function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function applyCouponDiscount(amount: number, coupon?: Coupon): number {
  if (coupon && coupon.discountPercent > 0) {
    return amount * (1 - coupon.discountPercent);
  }
  return amount;
}

function applyBulkDiscount(amount: number): number {
  const BULK_THRESHOLD = 100;
  const BULK_DISCOUNT = 0.1;
  return amount > BULK_THRESHOLD ? amount * (1 - BULK_DISCOUNT) : amount;
}
```

## Branch by Abstraction

**When:** Need to replace a large component that's used everywhere.

**Approach:** Introduce abstraction, migrate gradually, remove old code.

```markdown
## Steps

1. Create abstraction layer over existing implementation
2. Change all clients to use abstraction
3. Create new implementation behind abstraction
4. Gradually migrate from old to new
5. Remove old implementation
```

```typescript
// Step 1: Create abstraction
interface NotificationService {
  send(user: User, message: string): Promise<void>;
}

// Step 2: Wrap old implementation
class LegacyNotificationAdapter implements NotificationService {
  async send(user: User, message: string): Promise<void> {
    oldNotificationSystem.sendEmail(user.email, message);
  }
}

// Step 3: Create new implementation
class ModernNotificationService implements NotificationService {
  async send(user: User, message: string): Promise<void> {
    await this.twilioClient.send(user.phone, message);
    await this.sendgrid.send(user.email, message);
  }
}

// Step 4: Gradual migration with feature flag
class NotificationRouter implements NotificationService {
  async send(user: User, message: string): Promise<void> {
    if (featureFlags.isEnabled('modern-notifications', user.id)) {
      await this.modernService.send(user, message);
    } else {
      await this.legacyAdapter.send(user, message);
    }
  }
}

// Step 5: After full migration, remove legacy
```

## Strangler Fig Pattern

**When:** Replacing large legacy system incrementally.

**Approach:** Build new system around the old, gradually strangling it.

```markdown
## Steps

1. Identify seams in the old system
2. Build new functionality at the edges
3. Route some traffic to new system
4. Gradually expand new system
5. Eventually replace old system entirely
```

```
Phase 1: New facade, old system behind
┌────────────────────────────────────┐
│            New Facade              │
└─────────────────┬──────────────────┘
                  │
┌─────────────────▼──────────────────┐
│          Legacy System             │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Users │ │Orders│ │Payment│       │
│  └──────┘ └──────┘ └──────┘       │
└────────────────────────────────────┘

Phase 2: Some functionality migrated
┌────────────────────────────────────┐
│            New Facade              │
└───┬──────────────────┬─────────────┘
    │                  │
┌───▼───┐    ┌─────────▼─────────────┐
│ New   │    │    Legacy System      │
│ Users │    │  ┌──────┐ ┌──────┐   │
└───────┘    │  │Orders│ │Payment│   │
             │  └──────┘ └──────┘   │
             └───────────────────────┘

Phase 3: Legacy almost gone
┌────────────────────────────────────┐
│            New Facade              │
└───┬────────────┬───────────────────┘
    │            │
┌───▼───┐  ┌─────▼────┐  ┌───────────┐
│ New   │  │   New    │  │  Legacy   │
│ Users │  │  Orders  │  │  Payment  │
└───────┘  └──────────┘  └───────────┘
```

## Expand-Contract (Parallel Change)

**When:** Changing a widely-used interface without breaking clients.

**Approach:** Expand to support both old and new, migrate clients, contract to remove old.

```markdown
## Steps

1. Expand: Add new interface alongside old
2. Migrate: Move all clients to new interface
3. Contract: Remove old interface
```

```typescript
// Step 1: EXPAND - Add new method, keep old
class UserService {
  // Old method - still works
  getUser(userId: string): User {
    return this.getUserById(userId);
  }

  // New method - better name, same logic
  getUserById(userId: string): User {
    return this.db.users.findById(userId);
  }
}

// Step 2: MIGRATE - Update all clients
// Before: userService.getUser(id)
// After: userService.getUserById(id)

// Step 3: CONTRACT - Remove old method
class UserService {
  getUserById(userId: string): User {
    return this.db.users.findById(userId);
  }

  // getUser removed
}
```

**For APIs:**

```typescript
// Phase 1: Add new field, keep old
interface UserResponse {
  userId: string;      // Old - deprecated
  user_id: string;     // New - preferred
}

// Phase 2: Clients migrate to user_id

// Phase 3: Remove userId
interface UserResponse {
  user_id: string;
}
```

## Mikado Method

**When:** Complex refactoring with many dependencies.

**Approach:** Try change, record failures, fix dependencies first, repeat.

```markdown
## Steps

1. Set a goal
2. Try to achieve it
3. If it works, done!
4. If it breaks, note what needs to change first
5. Revert your changes
6. Recursively fix prerequisites
7. Try original goal again
```

```
Goal: Extract PaymentService from OrderService
│
├── Try: Move payment methods
│   └── Breaks: OrderService.process() uses PaymentService.charge()
│       └── Fix first: Make OrderService use dependency injection
│           │
│           ├── Try: Add constructor injection
│           │   └── Breaks: Tests create OrderService without params
│           │       └── Fix first: Update tests to inject mock
│           │           └── Done ✓
│           │
│           └── Now: Constructor injection works ✓
│
└── Now: Extract PaymentService works ✓
```

## Parallel Run

**When:** Replacing critical system where correctness is essential.

**Approach:** Run both old and new in parallel, compare results.

```typescript
class PaymentProcessor {
  async process(payment: Payment): Promise<Result> {
    // Run both in parallel
    const [oldResult, newResult] = await Promise.all([
      this.legacyProcessor.process(payment),
      this.newProcessor.process(payment),
    ]);

    // Compare results
    if (!this.resultsMatch(oldResult, newResult)) {
      this.logger.warn('Payment result mismatch', {
        payment,
        oldResult,
        newResult,
      });
      // Alert for investigation
      this.alertService.paymentMismatch(payment);
    }

    // Use old result until confident
    return oldResult;

    // After validation period:
    // return newResult;
  }
}
```

## Feature Toggles for Refactoring

**When:** Gradual rollout of refactored code.

```typescript
class OrderService {
  calculateTotal(order: Order): number {
    if (featureFlags.isEnabled('new-pricing-engine', order.customerId)) {
      return this.newPricingEngine.calculate(order);
    }
    return this.legacyPricing.calculate(order);
  }
}

// Rollout stages:
// 1. Internal users only
// 2. 1% of customers
// 3. 10% of customers
// 4. 50% of customers
// 5. 100% of customers
// 6. Remove flag and legacy code
```

## Refactoring Planning

### Assessing Refactoring Size

| Size | Duration | Approach |
|------|----------|----------|
| Tiny | <30 min | Opportunistic, same commit |
| Small | 1-4 hours | Same PR as feature or separate small PR |
| Medium | 1-3 days | Dedicated PR, proper review |
| Large | 1-2 weeks | Phased approach, multiple PRs |
| Huge | >2 weeks | Project plan, incremental strategy |

### Refactoring Sprint Planning

```markdown
## Refactoring Backlog Item

**Title:** Extract PaymentService from OrderService

**Current State:**
- Payment logic embedded in OrderService
- 500 lines of mixed concerns
- Hard to test payment logic in isolation

**Target State:**
- Separate PaymentService class
- Clear interface between services
- Payment logic testable independently

**Approach:**
1. Add characterization tests for payment behavior
2. Extract PaymentProcessor interface
3. Move payment methods to new class
4. Update OrderService to use PaymentService
5. Remove duplication

**Estimated Effort:** 3 points
**Risk:** Medium (touches payment flow)
**Dependencies:** None

**Acceptance Criteria:**
- [ ] All existing tests pass
- [ ] Payment logic in separate service
- [ ] New unit tests for PaymentService
- [ ] No functional changes
```
