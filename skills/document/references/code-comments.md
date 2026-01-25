# Code Comments

Guidelines for writing effective code comments.

## The Golden Rule

**Comment the "why", not the "what".**

The code shows what it does. Comments explain why it does it that way.

## When to Comment

### ✅ DO Comment

```typescript
// WHY: Using insertion sort because array is nearly sorted (avg 2 swaps)
// and n < 10, where insertion sort beats quicksort
function sortSmallArray(items: number[]): number[] {
  // insertion sort implementation
}

// WORKAROUND: Safari doesn't support lookbehind in regex
// Remove this when Safari 16.4+ has majority adoption
// See: https://bugs.webkit.org/show_bug.cgi?id=174931
const pattern = /(?:^|[^\\])"/g;

// WARNING: This function has O(n²) complexity
// Only use for small datasets (<1000 items)
function findDuplicates(items: string[]): string[] {
  // ...
}

// HACK: The API returns dates as strings without timezone
// Assume UTC until they fix their API (ticket #1234)
const date = new Date(apiDate + 'Z');

// NOTE: Order matters here - auth must run before rate limiting
// because rate limits are per-user
app.use(authenticate);
app.use(rateLimit);
```

### ❌ DON'T Comment

```typescript
// BAD: States the obvious
// Increment counter
counter++;

// BAD: Repeats the code
// Check if user is admin
if (user.isAdmin) {

// BAD: Outdated/wrong comment
// Returns user's full name
function getEmail(user: User): string {
  return user.email;
}

// BAD: Commented-out code (just delete it)
// function oldImplementation() {
//   ...
// }
```

## Comment Types

### JSDoc/TSDoc for Public APIs

```typescript
/**
 * Calculates the shipping cost for an order.
 *
 * Uses weight-based pricing for domestic orders and zone-based
 * pricing for international orders. Express shipping adds 50% premium.
 *
 * @param order - The order to calculate shipping for
 * @param options - Shipping options
 * @returns Shipping cost in cents
 * @throws {InvalidAddressError} If shipping address is incomplete
 *
 * @example
 * ```typescript
 * const cost = calculateShipping(order, { express: true });
 * console.log(`Shipping: $${cost / 100}`);
 * ```
 */
export function calculateShipping(
  order: Order,
  options: ShippingOptions = {}
): number {
  // ...
}
```

### Interface/Type Documentation

```typescript
/**
 * Configuration options for the API client.
 */
export interface ClientConfig {
  /**
   * API key for authentication.
   * Get yours at https://dashboard.example.com/api-keys
   */
  apiKey: string;

  /**
   * Base URL for API requests.
   * @default "https://api.example.com/v1"
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 5000
   */
  timeout?: number;

  /**
   * Number of retry attempts for failed requests.
   * Set to 0 to disable retries.
   * @default 2
   */
  retries?: number;
}
```

### Inline Explanations

```typescript
function processOrder(order: Order): void {
  // Skip validation for legacy orders imported before 2020
  // These have different data formats that would fail validation
  if (order.createdAt < LEGACY_CUTOFF_DATE) {
    return processLegacyOrder(order);
  }

  // Lock order to prevent concurrent modifications
  // This is a distributed lock with 30s TTL
  const lock = await acquireLock(`order:${order.id}`, { ttl: 30000 });

  try {
    // Process in specific order: inventory → payment → shipping
    // Payment must come after inventory to avoid charging for out-of-stock items
    await reserveInventory(order);
    await processPayment(order);
    await scheduleShipping(order);
  } finally {
    await lock.release();
  }
}
```

### Section Markers

```typescript
export class OrderService {
  // ============================================================
  // Public API
  // ============================================================

  async createOrder(input: CreateOrderInput): Promise<Order> {
    // ...
  }

  async cancelOrder(orderId: string): Promise<void> {
    // ...
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  private validateOrder(order: Order): void {
    // ...
  }

  private calculateTotal(items: OrderItem[]): number {
    // ...
  }
}
```

### TODO/FIXME/HACK

```typescript
// TODO: Add pagination support (ticket #123)
async function getUsers(): Promise<User[]> {
  return db.query('SELECT * FROM users');
}

// FIXME: Race condition when multiple requests update same user
// Need to add optimistic locking
async function updateUser(id: string, data: UserUpdate): Promise<User> {
  // ...
}

// HACK: Workaround for bug in third-party library
// Remove when upgrading to v3.0 (see issue #456)
const result = JSON.parse(JSON.stringify(data));

// NOTE: This timeout is intentionally long for slow network conditions
// in some customer environments
const TIMEOUT = 30000;

// WARNING: Do not call this in a loop - makes N database queries
// Use batchGetUsers() instead for multiple users
async function getUser(id: string): Promise<User> {
  // ...
}

// DEPRECATED: Use newFunction() instead. Will be removed in v3.0
function oldFunction(): void {
  console.warn('oldFunction is deprecated, use newFunction instead');
  // ...
}
```

## File Headers

```typescript
/**
 * @fileoverview Order processing service
 *
 * Handles order creation, payment processing, and fulfillment.
 * This is the main entry point for all order-related operations.
 *
 * @module services/order
 * @see {@link https://wiki.example.com/orders|Order Processing Wiki}
 */
```

## Module Documentation

```typescript
/**
 * Authentication and authorization utilities.
 *
 * @packageDocumentation
 *
 * @remarks
 * This module provides JWT-based authentication for the API.
 * All tokens expire after 24 hours and must be refreshed.
 *
 * @example
 * ```typescript
 * import { createToken, verifyToken } from './auth';
 *
 * const token = createToken({ userId: '123' });
 * const payload = verifyToken(token);
 * ```
 */

export * from './token';
export * from './middleware';
export * from './types';
```

## Comment Formatting

### Multi-line Comments

```typescript
/*
 * This algorithm uses a modified Dijkstra's approach:
 * 1. Build graph from warehouse locations
 * 2. Weight edges by shipping cost + time
 * 3. Find shortest path considering inventory
 *
 * Time complexity: O(V log V + E) where V = warehouses, E = routes
 * Space complexity: O(V + E) for adjacency list
 */
function findOptimalRoute(warehouses: Warehouse[]): Route {
  // ...
}
```

### Alignment

```typescript
const config = {
  timeout: 5000,    // Request timeout in ms
  retries: 3,       // Number of retry attempts
  backoff: 1000,    // Initial backoff delay in ms
  maxBackoff: 30000 // Maximum backoff delay in ms
};
```

## Comments to Avoid

### Redundant Comments

```typescript
// BAD
// Constructor
constructor() { }

// Get the user's name
getName(): string {
  return this.name;
}

// GOOD - no comment needed, the code is clear
constructor(private readonly name: string) { }

getName(): string {
  return this.name;
}
```

### Changelog in Comments

```typescript
// BAD
// v1.0: Initial implementation
// v1.1: Added caching
// v1.2: Fixed bug with null values
// v2.0: Refactored for performance
function processData() { }

// GOOD - use git history instead
function processData() { }
```

### Commented-Out Code

```typescript
// BAD
function calculate(x: number): number {
  // const oldResult = x * 2;
  // return oldResult + 1;
  return x * 3;
}

// GOOD - just delete it
function calculate(x: number): number {
  return x * 3;
}
```

## Testing Comments

```typescript
describe('OrderService', () => {
  describe('createOrder', () => {
    // Happy path tests
    it('creates order with valid input', async () => {
      // ...
    });

    // Edge cases
    it('handles empty cart gracefully', async () => {
      // ...
    });

    // Error cases
    it('throws when product not found', async () => {
      // ...
    });

    // Regression tests
    // Regression: #789 - orders failed when quantity was exactly 100
    it('accepts quantity of exactly 100', async () => {
      // ...
    });
  });
});
```

## Language-Specific Patterns

### Python

```python
def calculate_shipping(order: Order, express: bool = False) -> int:
    """Calculate shipping cost for an order.

    Uses weight-based pricing for domestic and zone-based for international.
    Express shipping adds 50% premium.

    Args:
        order: The order to calculate shipping for.
        express: Whether to use express shipping.

    Returns:
        Shipping cost in cents.

    Raises:
        InvalidAddressError: If shipping address is incomplete.

    Example:
        >>> cost = calculate_shipping(order, express=True)
        >>> print(f"Shipping: ${cost / 100}")
    """
    pass
```

### Go

```go
// CalculateShipping calculates the shipping cost for an order.
//
// It uses weight-based pricing for domestic orders and zone-based
// pricing for international orders. Express shipping adds 50% premium.
//
// Returns an error if the shipping address is incomplete.
func CalculateShipping(order *Order, express bool) (int, error) {
    // ...
}
```
