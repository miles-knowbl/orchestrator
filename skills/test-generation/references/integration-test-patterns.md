# Integration Test Patterns

Patterns for testing component interactions.

## Integration Test Characteristics

| Characteristic | Description |
|----------------|-------------|
| **Scope** | Multiple components together |
| **Speed** | Slower than unit (ms to seconds) |
| **Dependencies** | May use real or test databases |
| **Isolation** | Isolated from other tests via transactions/cleanup |

## API Integration Tests

### Express/Node.js API Testing

```typescript
import request from 'supertest';
import { app } from '../app';
import { db } from '../database';

describe('Users API', () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });
  
  beforeEach(async () => {
    await db('users').truncate();
  });
  
  afterAll(async () => {
    await db.destroy();
  });
  
  describe('POST /api/users', () => {
    it('creates a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        })
        .expect(201);
      
      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: 'test@example.com',
        name: 'Test User'
      });
      expect(response.body).not.toHaveProperty('password');
    });
    
    it('returns 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123'
        })
        .expect(400);
      
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
    
    it('returns 409 for duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'First User',
          password: 'password123'
        });
      
      // Try to create duplicate
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'Second User',
          password: 'password123'
        })
        .expect(409);
      
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });
  });
  
  describe('GET /api/users/:id', () => {
    it('returns user by id', async () => {
      // Create user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        });
      
      const userId = createResponse.body.id;
      
      // Fetch user
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);
      
      expect(response.body).toMatchObject({
        id: userId,
        email: 'test@example.com',
        name: 'Test User'
      });
    });
    
    it('returns 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);
    });
  });
});
```

### Testing with Authentication

```typescript
describe('Protected Routes', () => {
  let authToken: string;
  let userId: string;
  
  beforeEach(async () => {
    // Create user and get token
    const userResponse = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });
    
    userId = userResponse.body.id;
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });
  
  describe('GET /api/profile', () => {
    it('returns profile with valid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.id).toBe(userId);
    });
    
    it('returns 401 without token', async () => {
      await request(app)
        .get('/api/profile')
        .expect(401);
    });
    
    it('returns 401 with invalid token', async () => {
      await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
```

## Database Integration Tests

### Repository Testing

```typescript
import { UserRepository } from '../repositories/userRepository';
import { db } from '../database';

describe('UserRepository', () => {
  let repository: UserRepository;
  
  beforeAll(async () => {
    await db.migrate.latest();
    repository = new UserRepository(db);
  });
  
  beforeEach(async () => {
    await db('users').truncate();
  });
  
  afterAll(async () => {
    await db.destroy();
  });
  
  describe('create', () => {
    it('inserts user into database', async () => {
      const user = await repository.create({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed'
      });
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
    });
    
    it('throws on duplicate email', async () => {
      await repository.create({
        email: 'test@example.com',
        name: 'First',
        passwordHash: 'hash1'
      });
      
      await expect(repository.create({
        email: 'test@example.com',
        name: 'Second',
        passwordHash: 'hash2'
      })).rejects.toThrow(/duplicate/i);
    });
  });
  
  describe('findById', () => {
    it('returns user when found', async () => {
      const created = await repository.create({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed'
      });
      
      const found = await repository.findById(created.id);
      
      expect(found).toMatchObject({
        id: created.id,
        email: 'test@example.com',
        name: 'Test User'
      });
    });
    
    it('returns null when not found', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });
  
  describe('findByEmail', () => {
    it('returns user by email', async () => {
      await repository.create({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed'
      });
      
      const found = await repository.findByEmail('test@example.com');
      
      expect(found?.email).toBe('test@example.com');
    });
    
    it('is case-insensitive', async () => {
      await repository.create({
        email: 'Test@Example.com',
        name: 'Test User',
        passwordHash: 'hashed'
      });
      
      const found = await repository.findByEmail('test@example.com');
      
      expect(found).not.toBeNull();
    });
  });
});
```

### Transaction Testing

```typescript
describe('OrderService with transactions', () => {
  let orderService: OrderService;
  
  beforeEach(async () => {
    await db('orders').truncate();
    await db('order_items').truncate();
    await db('inventory').truncate();
    
    // Seed inventory
    await db('inventory').insert([
      { sku: 'SKU-1', quantity: 10 },
      { sku: 'SKU-2', quantity: 5 },
    ]);
    
    orderService = new OrderService(db);
  });
  
  it('creates order and reduces inventory atomically', async () => {
    const order = await orderService.createOrder({
      customerId: 'cust-1',
      items: [
        { sku: 'SKU-1', quantity: 2 },
        { sku: 'SKU-2', quantity: 1 },
      ]
    });
    
    expect(order.id).toBeDefined();
    
    // Verify inventory reduced
    const sku1 = await db('inventory').where('sku', 'SKU-1').first();
    const sku2 = await db('inventory').where('sku', 'SKU-2').first();
    
    expect(sku1.quantity).toBe(8);
    expect(sku2.quantity).toBe(4);
  });
  
  it('rolls back on inventory failure', async () => {
    await expect(orderService.createOrder({
      customerId: 'cust-1',
      items: [
        { sku: 'SKU-1', quantity: 2 },
        { sku: 'SKU-2', quantity: 100 }, // More than available
      ]
    })).rejects.toThrow('Insufficient inventory');
    
    // Verify no partial changes
    const sku1 = await db('inventory').where('sku', 'SKU-1').first();
    expect(sku1.quantity).toBe(10); // Unchanged
    
    const orders = await db('orders').count('* as count');
    expect(orders[0].count).toBe(0); // No order created
  });
});
```

## Service Integration Tests

### Testing Service Composition

```typescript
describe('CheckoutService integration', () => {
  let checkoutService: CheckoutService;
  let inventoryService: InventoryService;
  let paymentService: PaymentService;
  let orderRepository: OrderRepository;
  
  beforeEach(async () => {
    // Real services with test database
    inventoryService = new InventoryService(db);
    orderRepository = new OrderRepository(db);
    
    // Mock external payment service
    paymentService = {
      charge: jest.fn().mockResolvedValue({ id: 'pay_123', status: 'succeeded' }),
      refund: jest.fn().mockResolvedValue({ id: 'ref_123' })
    };
    
    checkoutService = new CheckoutService(
      inventoryService,
      paymentService,
      orderRepository
    );
    
    // Seed test data
    await db('inventory').truncate();
    await db('inventory').insert([
      { sku: 'ITEM-1', quantity: 10, price: 1000 }
    ]);
  });
  
  it('completes checkout flow', async () => {
    const result = await checkoutService.checkout({
      customerId: 'cust-1',
      items: [{ sku: 'ITEM-1', quantity: 2 }],
      paymentMethod: 'pm_test'
    });
    
    // Order created
    expect(result.orderId).toBeDefined();
    expect(result.status).toBe('confirmed');
    
    // Payment charged
    expect(paymentService.charge).toHaveBeenCalledWith({
      customerId: 'cust-1',
      amount: 2000, // 2 * 1000
      paymentMethod: 'pm_test'
    });
    
    // Inventory reduced
    const inventory = await db('inventory').where('sku', 'ITEM-1').first();
    expect(inventory.quantity).toBe(8);
    
    // Order in database
    const order = await orderRepository.findById(result.orderId);
    expect(order.status).toBe('confirmed');
    expect(order.total).toBe(2000);
  });
  
  it('does not charge payment when inventory insufficient', async () => {
    await expect(checkoutService.checkout({
      customerId: 'cust-1',
      items: [{ sku: 'ITEM-1', quantity: 100 }],
      paymentMethod: 'pm_test'
    })).rejects.toThrow('Insufficient inventory');
    
    expect(paymentService.charge).not.toHaveBeenCalled();
  });
  
  it('refunds payment when order save fails', async () => {
    // Make order save fail
    jest.spyOn(orderRepository, 'create').mockRejectedValue(new Error('DB error'));
    
    await expect(checkoutService.checkout({
      customerId: 'cust-1',
      items: [{ sku: 'ITEM-1', quantity: 1 }],
      paymentMethod: 'pm_test'
    })).rejects.toThrow('DB error');
    
    // Payment was charged then refunded
    expect(paymentService.charge).toHaveBeenCalled();
    expect(paymentService.refund).toHaveBeenCalledWith('pay_123');
  });
});
```

## External Service Integration Tests

### Testing with Real APIs (Controlled)

```typescript
// Only run these tests when INTEGRATION_TESTS=true
const describeIntegration = process.env.INTEGRATION_TESTS 
  ? describe 
  : describe.skip;

describeIntegration('Stripe Integration', () => {
  let stripeClient: StripeClient;
  
  beforeAll(() => {
    stripeClient = new StripeClient(process.env.STRIPE_TEST_KEY!);
  });
  
  it('creates payment intent', async () => {
    const intent = await stripeClient.createPaymentIntent({
      amount: 1000,
      currency: 'usd'
    });
    
    expect(intent.id).toMatch(/^pi_/);
    expect(intent.status).toBe('requires_payment_method');
  });
  
  it('handles invalid amount', async () => {
    await expect(stripeClient.createPaymentIntent({
      amount: -100,
      currency: 'usd'
    })).rejects.toThrow(/amount/i);
  });
});
```

### Contract Testing

```typescript
// Verify our mock matches real API behavior
describe('Payment Service Contract', () => {
  const mockPaymentService = createMockPaymentService();
  const realPaymentService = new StripePaymentService(process.env.STRIPE_TEST_KEY!);
  
  describe('charge', () => {
    it('mock matches real response structure', async () => {
      const input = {
        amount: 1000,
        currency: 'usd',
        paymentMethod: 'pm_card_visa'
      };
      
      // Get real response structure
      const realResponse = await realPaymentService.charge(input);
      
      // Configure mock
      mockPaymentService.charge.mockResolvedValue({
        id: 'pay_mock',
        status: 'succeeded',
        amount: input.amount
      });
      
      const mockResponse = await mockPaymentService.charge(input);
      
      // Verify same shape
      expect(Object.keys(mockResponse)).toEqual(
        expect.arrayContaining(Object.keys(realResponse))
      );
    });
  });
});
```

## Test Database Management

### Database Setup/Teardown

```typescript
// test/setup.ts
import { db } from '../database';

beforeAll(async () => {
  // Run migrations
  await db.migrate.latest();
});

afterAll(async () => {
  // Close connection
  await db.destroy();
});

// Per-test isolation
beforeEach(async () => {
  // Option 1: Truncate tables
  await db.raw('TRUNCATE users, orders, order_items CASCADE');
  
  // Option 2: Use transactions (faster)
  // await db.raw('BEGIN');
});

afterEach(async () => {
  // If using transactions
  // await db.raw('ROLLBACK');
});
```

### Test Data Seeding

```typescript
// test/seeds/testData.ts
export async function seedTestData(db: Knex) {
  // Clear existing data
  await db('order_items').del();
  await db('orders').del();
  await db('products').del();
  await db('users').del();
  
  // Seed users
  const [user1, user2] = await db('users')
    .insert([
      { id: 'user-1', email: 'alice@test.com', name: 'Alice' },
      { id: 'user-2', email: 'bob@test.com', name: 'Bob' },
    ])
    .returning('*');
  
  // Seed products
  const [product1, product2] = await db('products')
    .insert([
      { id: 'prod-1', name: 'Widget', price: 1000, stock: 100 },
      { id: 'prod-2', name: 'Gadget', price: 2000, stock: 50 },
    ])
    .returning('*');
  
  return { users: [user1, user2], products: [product1, product2] };
}

// In tests
describe('Order API', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>;
  
  beforeEach(async () => {
    testData = await seedTestData(db);
  });
  
  it('creates order for existing user', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        userId: testData.users[0].id,
        items: [{ productId: testData.products[0].id, quantity: 2 }]
      });
    
    expect(response.status).toBe(201);
  });
});
```

## Testing Message Queues

```typescript
describe('Order Event Processing', () => {
  let queue: TestQueue;
  let orderEventHandler: OrderEventHandler;
  
  beforeEach(() => {
    queue = new TestQueue();
    orderEventHandler = new OrderEventHandler(db, emailService);
    orderEventHandler.subscribe(queue);
  });
  
  it('sends confirmation email on order.created', async () => {
    const emailSpy = jest.spyOn(emailService, 'send');
    
    // Publish event
    await queue.publish('order.created', {
      orderId: 'ord-123',
      customerEmail: 'test@example.com',
      total: 5000
    });
    
    // Wait for processing
    await queue.waitForProcessing();
    
    expect(emailSpy).toHaveBeenCalledWith({
      to: 'test@example.com',
      template: 'order-confirmation',
      data: expect.objectContaining({ orderId: 'ord-123' })
    });
  });
  
  it('updates inventory on order.confirmed', async () => {
    // Setup initial inventory
    await db('inventory').insert({ sku: 'SKU-1', quantity: 100 });
    
    await queue.publish('order.confirmed', {
      orderId: 'ord-123',
      items: [{ sku: 'SKU-1', quantity: 5 }]
    });
    
    await queue.waitForProcessing();
    
    const inventory = await db('inventory').where('sku', 'SKU-1').first();
    expect(inventory.quantity).toBe(95);
  });
});
```
