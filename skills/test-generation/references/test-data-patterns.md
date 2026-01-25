# Test Data Patterns

Strategies for creating and managing test data.

## Principles

1. **Minimal** — Include only what's needed for the test
2. **Readable** — Easy to understand at a glance
3. **Isolated** — Each test controls its own data
4. **Realistic** — Similar enough to production to catch bugs
5. **Maintainable** — Easy to update when requirements change

## Factory Functions

### Basic Factory

```typescript
// factories/user.ts
export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: `usr_${Math.random().toString(36).substring(7)}`,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Usage
it('updates user name', async () => {
  const user = createTestUser({ name: 'Original Name' });
  
  const updated = await service.updateUser(user.id, { name: 'New Name' });
  
  expect(updated.name).toBe('New Name');
});
```

### Factory with Sequences

```typescript
// factories/user.ts
let userSequence = 0;

export function createTestUser(overrides: Partial<User> = {}): User {
  const seq = ++userSequence;
  return {
    id: `usr_${seq}`,
    email: `user${seq}@example.com`,
    name: `User ${seq}`,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function resetUserSequence(): void {
  userSequence = 0;
}

// In test setup
beforeEach(() => {
  resetUserSequence();
});
```

### Nested Factories

```typescript
// factories/order.ts
export function createTestOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: `ord_${Math.random().toString(36).substring(7)}`,
    customerId: createTestUser().id,
    items: [createTestOrderItem()],
    status: 'pending',
    total: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

export function createTestOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: `item_${Math.random().toString(36).substring(7)}`,
    productId: createTestProduct().id,
    quantity: 1,
    unitPrice: 1000,
    ...overrides,
  };
}

// Usage with custom nested data
const order = createTestOrder({
  items: [
    createTestOrderItem({ quantity: 2, unitPrice: 500 }),
    createTestOrderItem({ quantity: 1, unitPrice: 1500 }),
  ],
});
```

### Factory with Traits

```typescript
// factories/user.ts
type UserTrait = 'admin' | 'verified' | 'premium' | 'banned';

const traits: Record<UserTrait, Partial<User>> = {
  admin: { role: 'admin', permissions: ['all'] },
  verified: { emailVerified: true, verifiedAt: new Date() },
  premium: { tier: 'premium', subscriptionEndsAt: addDays(new Date(), 30) },
  banned: { status: 'banned', bannedAt: new Date() },
};

export function createTestUser(
  overrides: Partial<User> = {},
  ...userTraits: UserTrait[]
): User {
  const traitOverrides = userTraits.reduce(
    (acc, trait) => ({ ...acc, ...traits[trait] }),
    {}
  );
  
  return {
    id: `usr_${Math.random().toString(36).substring(7)}`,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date(),
    ...traitOverrides,
    ...overrides,
  };
}

// Usage
const adminUser = createTestUser({}, 'admin');
const premiumVerifiedUser = createTestUser({}, 'premium', 'verified');
const bannedUser = createTestUser({ name: 'Bad Actor' }, 'banned');
```

## Builder Pattern

### Fluent Builder

```typescript
// builders/OrderBuilder.ts
export class OrderBuilder {
  private order: Partial<Order> = {
    status: 'pending',
    items: [],
  };
  
  withId(id: string): this {
    this.order.id = id;
    return this;
  }
  
  forCustomer(customerId: string): this {
    this.order.customerId = customerId;
    return this;
  }
  
  withItem(item: OrderItem): this {
    this.order.items = [...(this.order.items ?? []), item];
    return this;
  }
  
  withItems(items: OrderItem[]): this {
    this.order.items = items;
    return this;
  }
  
  withStatus(status: OrderStatus): this {
    this.order.status = status;
    return this;
  }
  
  confirmed(): this {
    this.order.status = 'confirmed';
    this.order.confirmedAt = new Date();
    return this;
  }
  
  shipped(): this {
    this.order.status = 'shipped';
    this.order.shippedAt = new Date();
    return this;
  }
  
  build(): Order {
    const total = (this.order.items ?? []).reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    
    return {
      id: this.order.id ?? `ord_${Math.random().toString(36).substring(7)}`,
      customerId: this.order.customerId ?? 'cust_default',
      items: this.order.items ?? [],
      status: this.order.status ?? 'pending',
      total,
      createdAt: new Date(),
      ...this.order,
    } as Order;
  }
}

// Usage
const order = new OrderBuilder()
  .forCustomer('cust_123')
  .withItem({ productId: 'prod_1', quantity: 2, unitPrice: 500 })
  .withItem({ productId: 'prod_2', quantity: 1, unitPrice: 1000 })
  .confirmed()
  .build();
```

### Builder with Presets

```typescript
export class OrderBuilder {
  // ... existing methods
  
  static simple(): OrderBuilder {
    return new OrderBuilder()
      .withItem({ productId: 'prod_1', quantity: 1, unitPrice: 1000 });
  }
  
  static withMultipleItems(): OrderBuilder {
    return new OrderBuilder()
      .withItem({ productId: 'prod_1', quantity: 2, unitPrice: 500 })
      .withItem({ productId: 'prod_2', quantity: 1, unitPrice: 1500 })
      .withItem({ productId: 'prod_3', quantity: 3, unitPrice: 250 });
  }
  
  static completedOrder(): OrderBuilder {
    return OrderBuilder.simple()
      .confirmed()
      .shipped()
      .withStatus('delivered');
  }
}

// Usage
const simpleOrder = OrderBuilder.simple().build();
const complexOrder = OrderBuilder.withMultipleItems().forCustomer('vip_1').build();
```

## Mother Pattern

Centralized test data definitions.

```typescript
// testData/ObjectMother.ts
export const ObjectMother = {
  users: {
    alice: () => createTestUser({
      id: 'usr_alice',
      email: 'alice@example.com',
      name: 'Alice Smith',
    }),
    
    bob: () => createTestUser({
      id: 'usr_bob',
      email: 'bob@example.com',
      name: 'Bob Jones',
    }),
    
    admin: () => createTestUser({
      id: 'usr_admin',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    }),
  },
  
  products: {
    widget: () => createTestProduct({
      id: 'prod_widget',
      name: 'Widget',
      price: 1000,
      stock: 100,
    }),
    
    gadget: () => createTestProduct({
      id: 'prod_gadget',
      name: 'Gadget',
      price: 2500,
      stock: 50,
    }),
    
    outOfStock: () => createTestProduct({
      id: 'prod_oos',
      name: 'Out of Stock Item',
      price: 500,
      stock: 0,
    }),
  },
  
  orders: {
    pending: () => new OrderBuilder()
      .forCustomer(ObjectMother.users.alice().id)
      .withItem({ productId: ObjectMother.products.widget().id, quantity: 1, unitPrice: 1000 })
      .build(),
    
    confirmed: () => new OrderBuilder()
      .forCustomer(ObjectMother.users.alice().id)
      .withItem({ productId: ObjectMother.products.widget().id, quantity: 1, unitPrice: 1000 })
      .confirmed()
      .build(),
  },
};

// Usage
it('sends email when order confirmed', async () => {
  const alice = ObjectMother.users.alice();
  const order = ObjectMother.orders.pending();
  
  await service.confirmOrder(order.id);
  
  expect(emailService.send).toHaveBeenCalledWith({
    to: alice.email,
    subject: expect.stringContaining('confirmed'),
  });
});
```

## Fixtures

### JSON Fixtures

```json
// fixtures/users.json
{
  "validUser": {
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  },
  "adminUser": {
    "email": "admin@example.com",
    "name": "Admin User",
    "password": "adminpass",
    "role": "admin"
  }
}
```

```typescript
// In tests
import fixtures from './fixtures/users.json';

it('creates user from valid data', async () => {
  const user = await service.createUser(fixtures.validUser);
  expect(user.email).toBe(fixtures.validUser.email);
});
```

### Fixture Files

```typescript
// fixtures/sampleInvoice.pdf - actual PDF file
// fixtures/largeImage.jpg - test image

import fs from 'fs';
import path from 'path';

export function loadFixture(filename: string): Buffer {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename));
}

// Usage
it('processes PDF invoice', async () => {
  const pdfBuffer = loadFixture('sampleInvoice.pdf');
  const result = await invoiceProcessor.process(pdfBuffer);
  expect(result.total).toBe(1500);
});
```

## Parameterized Test Data

### Test Tables

```typescript
describe('calculateDiscount', () => {
  const testCases = [
    { total: 50, customerType: 'regular', expected: 0 },
    { total: 100, customerType: 'regular', expected: 0 },
    { total: 100, customerType: 'gold', expected: 10 },
    { total: 100, customerType: 'platinum', expected: 20 },
    { total: 500, customerType: 'regular', expected: 25 },
    { total: 500, customerType: 'gold', expected: 75 },
    { total: 1000, customerType: 'platinum', expected: 250 },
  ];
  
  it.each(testCases)(
    'returns $expected for $total total with $customerType customer',
    ({ total, customerType, expected }) => {
      expect(calculateDiscount(total, customerType)).toBe(expected);
    }
  );
});
```

### Edge Case Sets

```typescript
const invalidEmails = [
  '',
  'plaintext',
  '@nodomain.com',
  'spaces in@email.com',
  'missing@.com',
  'double@@at.com',
];

const validEmails = [
  'simple@example.com',
  'with.dots@example.com',
  'with+plus@example.com',
  'numbers123@example.com',
];

describe('email validation', () => {
  it.each(invalidEmails)('rejects invalid email: %s', (email) => {
    expect(validateEmail(email)).toBe(false);
  });
  
  it.each(validEmails)('accepts valid email: %s', (email) => {
    expect(validateEmail(email)).toBe(true);
  });
});
```

## Database Test Data

### Seeding Functions

```typescript
// testData/seeders.ts
export async function seedUsers(db: Database): Promise<User[]> {
  const users = [
    createTestUser({ id: 'usr_1', email: 'user1@test.com' }),
    createTestUser({ id: 'usr_2', email: 'user2@test.com' }),
    createTestUser({ id: 'usr_admin', email: 'admin@test.com' }, 'admin'),
  ];
  
  await db('users').insert(users);
  return users;
}

export async function seedProducts(db: Database): Promise<Product[]> {
  const products = [
    createTestProduct({ id: 'prod_1', stock: 100 }),
    createTestProduct({ id: 'prod_2', stock: 50 }),
    createTestProduct({ id: 'prod_3', stock: 0 }),
  ];
  
  await db('products').insert(products);
  return products;
}

export async function seedTestData(db: Database) {
  await db.raw('TRUNCATE users, products, orders CASCADE');
  
  const users = await seedUsers(db);
  const products = await seedProducts(db);
  
  return { users, products };
}
```

### Per-Test Data Setup

```typescript
describe('OrderService', () => {
  let testData: { users: User[]; products: Product[] };
  
  beforeEach(async () => {
    testData = await seedTestData(db);
  });
  
  it('creates order for existing user', async () => {
    const order = await service.createOrder({
      customerId: testData.users[0].id,
      items: [{ productId: testData.products[0].id, quantity: 1 }],
    });
    
    expect(order.customerId).toBe(testData.users[0].id);
  });
});
```

## Randomized Test Data

### Faker.js

```typescript
import { faker } from '@faker-js/faker';

export function createRandomUser(): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
    },
    createdAt: faker.date.past(),
  };
}

export function createRandomOrder(): Order {
  return {
    id: faker.string.uuid(),
    customerId: faker.string.uuid(),
    items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
      productId: faker.string.uuid(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      unitPrice: faker.number.int({ min: 100, max: 10000 }),
    })),
    status: faker.helpers.arrayElement(['pending', 'confirmed', 'shipped']),
    createdAt: faker.date.past(),
  };
}

// Seeded for reproducibility
export function createSeededData(seed: number) {
  faker.seed(seed);
  return {
    user: createRandomUser(),
    order: createRandomOrder(),
  };
}
```

### Property-Based Testing

```typescript
import fc from 'fast-check';

describe('calculateTotal', () => {
  it('always returns non-negative value', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          quantity: fc.integer({ min: 0, max: 100 }),
          price: fc.integer({ min: 0, max: 100000 }),
        })),
        (items) => {
          const total = calculateTotal(items);
          return total >= 0;
        }
      )
    );
  });
  
  it('is commutative (order of items does not matter)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          quantity: fc.integer({ min: 1, max: 10 }),
          price: fc.integer({ min: 100, max: 10000 }),
        }), { minLength: 2 }),
        (items) => {
          const total1 = calculateTotal(items);
          const total2 = calculateTotal([...items].reverse());
          return total1 === total2;
        }
      )
    );
  });
});
```

## Anti-Patterns

### Shared Mutable State

```typescript
// BAD: Tests can affect each other
const testUser = createTestUser();

it('test 1', () => {
  testUser.name = 'Modified';
  // ...
});

it('test 2', () => {
  // testUser.name is still 'Modified'!
});

// GOOD: Fresh data per test
let testUser: User;

beforeEach(() => {
  testUser = createTestUser();
});
```

### Over-Specified Data

```typescript
// BAD: Too much irrelevant detail
const user = {
  id: 'usr_123',
  email: 'john.smith@example.com',
  firstName: 'John',
  lastName: 'Smith',
  phone: '+1-555-123-4567',
  address: { street: '123 Main St', city: 'NYC', zip: '10001' },
  createdAt: new Date('2024-01-15T10:30:00Z'),
  // ... 20 more fields
};

// GOOD: Only relevant fields
const user = createTestUser({ role: 'admin' }); // Only role matters for this test
```

### Magic Values

```typescript
// BAD: What does '42' mean?
expect(calculateDiscount(42, 'gold')).toBe(4.2);

// GOOD: Named constants
const STANDARD_ORDER_TOTAL = 100;
const GOLD_DISCOUNT_RATE = 0.10;
const EXPECTED_DISCOUNT = STANDARD_ORDER_TOTAL * GOLD_DISCOUNT_RATE;

expect(calculateDiscount(STANDARD_ORDER_TOTAL, 'gold')).toBe(EXPECTED_DISCOUNT);
```
