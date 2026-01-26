# Integration Test Patterns

Comprehensive guide to common patterns for integration testing distributed systems, APIs, and event-driven architectures.

## Purpose

This reference provides battle-tested patterns for writing effective integration tests. Use this when:

- Testing API endpoints that interact with databases
- Validating service-to-service communication
- Testing event publishing and consumption
- Implementing end-to-end workflow tests
- Handling authentication and authorization in tests
- Testing error scenarios and failure modes

## Core Patterns Overview

```
+------------------------------------------------------------------+
|                 INTEGRATION TEST PATTERNS                         |
|                                                                   |
|  +-----------------+     +------------------+                     |
|  | API Testing     |     | Event Testing    |                     |
|  | - Request/Response |  | - Publish/Consume|                     |
|  | - Auth flows    |     | - Event ordering |                     |
|  | - Error handling|     | - Idempotency    |                     |
|  +-----------------+     +------------------+                     |
|                                                                   |
|  +-----------------+     +------------------+                     |
|  | Database Testing|     | External Service |                     |
|  | - Transactions  |     | - Mocking        |                     |
|  | - Migrations    |     | - Stubbing       |                     |
|  | - Constraints   |     | - Sandboxes      |                     |
|  +-----------------+     +------------------+                     |
|                                                                   |
|  +-----------------+     +------------------+                     |
|  | E2E Workflows   |     | Resilience       |                     |
|  | - Multi-step    |     | - Timeouts       |                     |
|  | - State machines|     | - Retries        |                     |
|  | - User journeys |     | - Circuit breakers|                    |
|  +-----------------+     +------------------+                     |
|                                                                   |
+------------------------------------------------------------------+
```

## API Testing Patterns

### Pattern 1: Request-Response Validation

Validates that API endpoints return correct responses for given inputs.

```typescript
// patterns/api-testing.ts

/**
 * Pattern: Complete Request-Response Testing
 * Tests the full HTTP cycle including headers, status codes, and body
 */
describe('User API', () => {
  describe('GET /users/:id', () => {
    it('returns user with all expected fields', async () => {
      // Arrange
      const user = await userFactory.create({
        id: 'usr-123',
        email: 'test@example.com',
        name: 'Test User',
      });

      // Act
      const response = await request(app)
        .get('/users/usr-123')
        .set('Accept', 'application/json');

      // Assert - Status code
      expect(response.status).toBe(200);

      // Assert - Headers
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('private, max-age=300');

      // Assert - Body structure
      expect(response.body).toMatchObject({
        id: 'usr-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(String),
      });

      // Assert - No sensitive fields exposed
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('internalId');
    });

    it('returns 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/users/non-existent')
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: {
          code: 'USER_NOT_FOUND',
          message: expect.stringContaining('not found'),
        },
      });
    });
  });
});
```

### Pattern 2: CRUD Operation Testing

Comprehensive testing of Create, Read, Update, Delete operations.

```typescript
/**
 * Pattern: Full CRUD Lifecycle Testing
 * Ensures all CRUD operations work correctly and consistently
 */
describe('Products CRUD', () => {
  let createdProductId: string;

  describe('CREATE - POST /products', () => {
    it('creates product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        price: 29.99,
        category: 'electronics',
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        ...productData,
        createdAt: expect.any(String),
      });

      // Store for subsequent tests
      createdProductId = response.body.id;

      // Verify in database
      const dbProduct = await db.products.findById(createdProductId);
      expect(dbProduct).toMatchObject(productData);
    });

    it('rejects invalid price', async () => {
      const response = await request(app)
        .post('/products')
        .send({ name: 'Test', price: -10 })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({ field: 'price' })
      );
    });
  });

  describe('READ - GET /products/:id', () => {
    it('retrieves created product', async () => {
      const response = await request(app)
        .get(`/products/${createdProductId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdProductId);
    });
  });

  describe('UPDATE - PUT /products/:id', () => {
    it('updates product fields', async () => {
      const updateData = { price: 39.99 };

      const response = await request(app)
        .put(`/products/${createdProductId}`)
        .send(updateData)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.price).toBe(39.99);

      // Verify in database
      const dbProduct = await db.products.findById(createdProductId);
      expect(dbProduct.price).toBe(39.99);
    });

    it('preserves unmodified fields', async () => {
      const before = await db.products.findById(createdProductId);

      await request(app)
        .put(`/products/${createdProductId}`)
        .send({ price: 49.99 })
        .set('Authorization', `Bearer ${adminToken}`);

      const after = await db.products.findById(createdProductId);
      expect(after.name).toBe(before.name);
      expect(after.category).toBe(before.category);
    });
  });

  describe('DELETE - DELETE /products/:id', () => {
    it('deletes product', async () => {
      const response = await request(app)
        .delete(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      // Verify deletion
      const dbProduct = await db.products.findById(createdProductId);
      expect(dbProduct).toBeNull();
    });

    it('returns 404 for already deleted product', async () => {
      const response = await request(app)
        .delete(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
```

### Pattern 3: Authentication Flow Testing

Complete testing of authentication and authorization.

```typescript
/**
 * Pattern: Authentication and Authorization Testing
 * Tests login, token validation, and permission enforcement
 */
describe('Authentication', () => {
  describe('Login Flow', () => {
    it('returns JWT token for valid credentials', async () => {
      // Create user with known password
      const password = 'SecurePass123!';
      const user = await userFactory.create({
        email: 'auth@test.com',
        passwordHash: await hashPassword(password),
      });

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'auth@test.com', password });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
      });

      // Verify token is valid
      const decoded = jwt.verify(response.body.accessToken, JWT_SECRET);
      expect(decoded.userId).toBe(user.id);
    });

    it('returns 401 for invalid password', async () => {
      await userFactory.create({ email: 'user@test.com' });

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'wrong' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');

      // Should not reveal if email exists
      expect(response.body.error.message).not.toContain('password');
    });

    it('rate limits after failed attempts', async () => {
      const email = 'ratelimit@test.com';
      await userFactory.create({ email });

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/auth/login')
          .send({ email, password: 'wrong' });
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/auth/login')
        .send({ email, password: 'correct' });

      expect(response.status).toBe(429);
      expect(response.headers['retry-after']).toBeDefined();
    });
  });

  describe('Protected Routes', () => {
    let validToken: string;
    let adminToken: string;

    beforeAll(async () => {
      const user = await userFactory.create({ role: 'user' });
      const admin = await userFactory.create({ role: 'admin' });
      validToken = generateToken(user);
      adminToken = generateToken(admin);
    });

    it('allows access with valid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
    });

    it('rejects expired token', async () => {
      const expiredToken = generateToken({ id: 'user-1' }, { expiresIn: '-1h' });

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('rejects malformed token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });

    it('enforces role-based access', async () => {
      // Admin-only endpoint
      const userResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${validToken}`);

      expect(userResponse.status).toBe(403);

      const adminResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
    });
  });
});
```

### Pattern 4: Pagination and Filtering

Testing list endpoints with pagination, sorting, and filtering.

```typescript
/**
 * Pattern: Pagination and Filtering Testing
 * Ensures list endpoints handle pagination correctly
 */
describe('Products List API', () => {
  beforeAll(async () => {
    // Create 50 products for pagination testing
    await productFactory.createMany(50, {
      category: (i) => i < 25 ? 'electronics' : 'clothing',
      price: (i) => 10 + i,
      createdAt: (i) => new Date(Date.now() - i * 86400000),
    });
  });

  describe('Pagination', () => {
    it('returns default page size', async () => {
      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(20); // Default page size
      expect(response.body.meta).toMatchObject({
        page: 1,
        pageSize: 20,
        totalItems: 50,
        totalPages: 3,
      });
    });

    it('returns requested page', async () => {
      const response = await request(app)
        .get('/products')
        .query({ page: 2, pageSize: 10 });

      expect(response.body.items).toHaveLength(10);
      expect(response.body.meta.page).toBe(2);
    });

    it('returns empty array for page beyond data', async () => {
      const response = await request(app)
        .get('/products')
        .query({ page: 100 });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(0);
    });

    it('includes pagination links', async () => {
      const response = await request(app)
        .get('/products')
        .query({ page: 2 });

      expect(response.body.links).toMatchObject({
        first: expect.stringContaining('page=1'),
        prev: expect.stringContaining('page=1'),
        next: expect.stringContaining('page=3'),
        last: expect.stringContaining('page=3'),
      });
    });
  });

  describe('Filtering', () => {
    it('filters by category', async () => {
      const response = await request(app)
        .get('/products')
        .query({ category: 'electronics' });

      expect(response.body.items).toHaveLength(20);
      expect(response.body.items.every(p => p.category === 'electronics')).toBe(true);
    });

    it('filters by price range', async () => {
      const response = await request(app)
        .get('/products')
        .query({ minPrice: 30, maxPrice: 40 });

      expect(response.body.items.every(p => p.price >= 30 && p.price <= 40)).toBe(true);
    });

    it('combines multiple filters', async () => {
      const response = await request(app)
        .get('/products')
        .query({
          category: 'electronics',
          minPrice: 20,
          maxPrice: 30,
        });

      expect(response.body.items.every(p =>
        p.category === 'electronics' &&
        p.price >= 20 &&
        p.price <= 30
      )).toBe(true);
    });
  });

  describe('Sorting', () => {
    it('sorts by price ascending', async () => {
      const response = await request(app)
        .get('/products')
        .query({ sort: 'price', order: 'asc' });

      const prices = response.body.items.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('sorts by price descending', async () => {
      const response = await request(app)
        .get('/products')
        .query({ sort: 'price', order: 'desc' });

      const prices = response.body.items.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('sorts by creation date by default', async () => {
      const response = await request(app).get('/products');

      const dates = response.body.items.map(p => new Date(p.createdAt).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a)); // Newest first
    });
  });
});
```

## Event Testing Patterns

### Pattern 5: Event Publishing Verification

Testing that actions correctly publish events.

```typescript
/**
 * Pattern: Event Publishing Verification
 * Ensures actions publish correct events to message broker
 */
describe('Order Events', () => {
  let eventCapture: EventCapture;

  beforeAll(async () => {
    eventCapture = await kafka.createCapture(['orders.*']);
  });

  afterAll(async () => {
    await eventCapture.close();
  });

  beforeEach(() => {
    eventCapture.clear();
  });

  describe('Order Creation Events', () => {
    it('publishes OrderCreated event when order is created', async () => {
      // Act
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: 'prod-1', quantity: 2 }],
        });

      // Wait for event
      const event = await eventCapture.waitForEvent({
        topic: 'orders.created',
        timeout: 5000,
        filter: (e) => e.payload.orderId === response.body.id,
      });

      // Assert event structure
      expect(event).toMatchObject({
        topic: 'orders.created',
        payload: {
          orderId: response.body.id,
          userId: expect.any(String),
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: 'prod-1',
              quantity: 2,
            }),
          ]),
          timestamp: expect.any(String),
        },
        metadata: {
          correlationId: expect.any(String),
          version: '1.0',
        },
      });
    });

    it('includes all required fields in event', async () => {
      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      const event = await eventCapture.waitForEvent({
        topic: 'orders.created',
        timeout: 5000,
      });

      // Verify against event schema
      const schema = await loadEventSchema('orders.created');
      const validation = schema.validate(event.payload);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Order Status Events', () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await orderFactory.create({ status: 'pending' });
      orderId = order.id;
    });

    it('publishes OrderShipped event on shipment', async () => {
      await request(app)
        .post(`/orders/${orderId}/ship`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ trackingNumber: 'TRACK123' });

      const event = await eventCapture.waitForEvent({
        topic: 'orders.shipped',
        timeout: 5000,
      });

      expect(event.payload).toMatchObject({
        orderId,
        trackingNumber: 'TRACK123',
        shippedAt: expect.any(String),
      });
    });

    it('does not publish event if action fails', async () => {
      // Try to ship already shipped order
      await db.orders.update(orderId, { status: 'shipped' });

      await request(app)
        .post(`/orders/${orderId}/ship`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ trackingNumber: 'TRACK123' });

      // Wait briefly then verify no event
      await new Promise(resolve => setTimeout(resolve, 1000));
      const events = eventCapture.getEvents('orders.shipped');
      expect(events.filter(e => e.payload.orderId === orderId)).toHaveLength(0);
    });
  });
});
```

### Pattern 6: Event Consumption Testing

Testing that services correctly process incoming events.

```typescript
/**
 * Pattern: Event Consumption Testing
 * Verifies services correctly handle incoming events
 */
describe('Notification Service - Event Handling', () => {
  describe('OrderCreated Event', () => {
    it('sends confirmation email on order creation', async () => {
      // Arrange
      const user = await userFactory.create({ email: 'notify@test.com' });
      const order = await orderFactory.create({ userId: user.id });

      // Act - Publish event
      await kafka.publish('orders.created', {
        orderId: order.id,
        userId: user.id,
        items: order.items,
        total: order.total,
        timestamp: new Date().toISOString(),
      });

      // Wait for processing
      await waitForCondition(async () => {
        const notifications = await db.notifications.findByUserId(user.id);
        return notifications.length > 0;
      }, 5000);

      // Assert - Check notification created
      const notifications = await db.notifications.findByUserId(user.id);
      expect(notifications).toContainEqual(
        expect.objectContaining({
          type: 'ORDER_CONFIRMATION',
          channel: 'email',
          orderId: order.id,
        })
      );

      // Assert - Check email sent (via mock mail service)
      const sentEmails = await mockMailService.getSentEmails();
      expect(sentEmails).toContainEqual(
        expect.objectContaining({
          to: 'notify@test.com',
          subject: expect.stringContaining('Order Confirmation'),
        })
      );
    });

    it('handles duplicate events idempotently', async () => {
      const user = await userFactory.create();
      const order = await orderFactory.create({ userId: user.id });

      const event = {
        eventId: 'evt-unique-123',
        orderId: order.id,
        userId: user.id,
        items: order.items,
        timestamp: new Date().toISOString(),
      };

      // Publish same event twice
      await kafka.publish('orders.created', event);
      await kafka.publish('orders.created', event);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Should only create one notification
      const notifications = await db.notifications.findByUserId(user.id);
      const orderNotifications = notifications.filter(
        n => n.orderId === order.id && n.type === 'ORDER_CONFIRMATION'
      );
      expect(orderNotifications).toHaveLength(1);
    });

    it('handles malformed events gracefully', async () => {
      // Publish invalid event
      await kafka.publish('orders.created', {
        // Missing required fields
        orderId: 'incomplete',
      });

      // Wait briefly
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check event was sent to dead letter queue
      const dlqEvents = await kafka.getEvents('orders.created.dlq');
      expect(dlqEvents).toContainEqual(
        expect.objectContaining({
          originalEvent: expect.objectContaining({ orderId: 'incomplete' }),
          error: expect.stringContaining('validation'),
        })
      );
    });
  });
});
```

### Pattern 7: Event Ordering and Sequencing

Testing that events are processed in correct order.

```typescript
/**
 * Pattern: Event Ordering Verification
 * Ensures event sequences are handled correctly
 */
describe('Order State Machine Events', () => {
  it('processes order lifecycle events in sequence', async () => {
    const orderId = 'order-lifecycle-test';

    // Publish events in order with delays
    const events = [
      { topic: 'orders.created', payload: { orderId, status: 'pending' } },
      { topic: 'orders.paid', payload: { orderId, paymentId: 'pay-1' } },
      { topic: 'orders.shipped', payload: { orderId, trackingNumber: 'TRK-1' } },
      { topic: 'orders.delivered', payload: { orderId, deliveredAt: new Date() } },
    ];

    for (const event of events) {
      await kafka.publish(event.topic, event.payload);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Wait for processing
    await waitForCondition(async () => {
      const order = await db.orders.findById(orderId);
      return order?.status === 'delivered';
    }, 10000);

    // Verify final state
    const order = await db.orders.findById(orderId);
    expect(order.status).toBe('delivered');

    // Verify state history
    const history = await db.orderHistory.findByOrderId(orderId);
    const statuses = history.map(h => h.status);
    expect(statuses).toEqual(['pending', 'paid', 'shipped', 'delivered']);
  });

  it('rejects out-of-order events', async () => {
    const orderId = 'order-ooo-test';

    // Create order in pending state
    await orderFactory.create({ id: orderId, status: 'pending' });

    // Try to deliver without shipping first
    await kafka.publish('orders.delivered', {
      orderId,
      deliveredAt: new Date(),
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Order should still be pending
    const order = await db.orders.findById(orderId);
    expect(order.status).toBe('pending');

    // Check error logged
    const errors = await db.eventErrors.findByOrderId(orderId);
    expect(errors).toContainEqual(
      expect.objectContaining({
        event: 'orders.delivered',
        error: expect.stringContaining('Invalid state transition'),
      })
    );
  });
});
```

## Database Integration Patterns

### Pattern 8: Transaction Testing

Testing database transactions and rollback behavior.

```typescript
/**
 * Pattern: Transaction Behavior Testing
 * Verifies transactions commit or rollback correctly
 */
describe('Order Transaction Handling', () => {
  it('commits transaction on successful order', async () => {
    const initialInventory = await db.inventory.getQuantity('prod-1');

    const response = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: 'prod-1', quantity: 5 }],
      });

    expect(response.status).toBe(201);

    // Verify all changes committed
    const order = await db.orders.findById(response.body.id);
    expect(order).toBeDefined();

    const newInventory = await db.inventory.getQuantity('prod-1');
    expect(newInventory).toBe(initialInventory - 5);

    const payment = await db.payments.findByOrderId(response.body.id);
    expect(payment).toBeDefined();
  });

  it('rolls back transaction on payment failure', async () => {
    const initialInventory = await db.inventory.getQuantity('prod-1');
    const initialOrderCount = await db.orders.count();

    // Mock payment to fail
    mockPaymentService.mockFailure('INSUFFICIENT_FUNDS');

    const response = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: 'prod-1', quantity: 5 }],
      });

    expect(response.status).toBe(402);

    // Verify no changes persisted
    const newInventory = await db.inventory.getQuantity('prod-1');
    expect(newInventory).toBe(initialInventory);

    const newOrderCount = await db.orders.count();
    expect(newOrderCount).toBe(initialOrderCount);
  });

  it('handles concurrent modifications correctly', async () => {
    // Only 10 items in stock
    await db.inventory.setQuantity('limited-prod', 10);

    // Attempt 3 orders of 5 items simultaneously
    const orderPromises = [
      request(app).post('/orders').set('Authorization', `Bearer ${token1}`).send({
        items: [{ productId: 'limited-prod', quantity: 5 }],
      }),
      request(app).post('/orders').set('Authorization', `Bearer ${token2}`).send({
        items: [{ productId: 'limited-prod', quantity: 5 }],
      }),
      request(app).post('/orders').set('Authorization', `Bearer ${token3}`).send({
        items: [{ productId: 'limited-prod', quantity: 5 }],
      }),
    ];

    const responses = await Promise.all(orderPromises);

    // Exactly 2 should succeed, 1 should fail with out of stock
    const successes = responses.filter(r => r.status === 201);
    const failures = responses.filter(r => r.status === 409);

    expect(successes).toHaveLength(2);
    expect(failures).toHaveLength(1);

    // Inventory should be 0
    const finalInventory = await db.inventory.getQuantity('limited-prod');
    expect(finalInventory).toBe(0);
  });
});
```

### Pattern 9: Constraint Validation

Testing database constraints and data integrity.

```typescript
/**
 * Pattern: Database Constraint Testing
 * Verifies database constraints are enforced
 */
describe('Data Integrity', () => {
  describe('Unique Constraints', () => {
    it('prevents duplicate email registration', async () => {
      await userFactory.create({ email: 'unique@test.com' });

      const response = await request(app)
        .post('/users')
        .send({
          email: 'unique@test.com',
          name: 'Duplicate User',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('allows same email after soft delete', async () => {
      const user = await userFactory.create({ email: 'reuse@test.com' });
      await db.users.softDelete(user.id);

      const response = await request(app)
        .post('/users')
        .send({
          email: 'reuse@test.com',
          name: 'New User',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Foreign Key Constraints', () => {
    it('prevents order with non-existent product', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: 'non-existent-product', quantity: 1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_PRODUCT');
    });

    it('cascades deletion appropriately', async () => {
      const user = await userFactory.create();
      const order = await orderFactory.create({ userId: user.id });

      // Delete user
      await request(app)
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Order should be archived, not deleted
      const archivedOrder = await db.orders.findById(order.id);
      expect(archivedOrder.status).toBe('archived');
      expect(archivedOrder.userId).toBeNull();
    });
  });

  describe('Check Constraints', () => {
    it('prevents negative prices', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Product',
          price: -10,
        });

      expect(response.status).toBe(400);
    });

    it('enforces order status transitions', async () => {
      const order = await orderFactory.create({ status: 'delivered' });

      const response = await request(app)
        .put(`/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'pending' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });
  });
});
```

## External Service Integration Patterns

### Pattern 10: Mock Service Switching

Testing with different mock responses for various scenarios.

```typescript
/**
 * Pattern: Configurable Mock Services
 * Allows switching mock behavior per test
 */
describe('Payment Processing', () => {
  let paymentMock: PaymentServiceMock;

  beforeAll(() => {
    paymentMock = new PaymentServiceMock();
    paymentMock.start(3030);
  });

  afterAll(() => {
    paymentMock.stop();
  });

  beforeEach(() => {
    paymentMock.reset();
  });

  describe('Successful Payments', () => {
    beforeEach(() => {
      paymentMock.configure({
        '/charge': {
          status: 200,
          body: {
            transactionId: 'txn-success-123',
            status: 'completed',
            amount: 100,
          },
        },
      });
    });

    it('processes payment and updates order', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      expect(response.status).toBe(201);
      expect(response.body.paymentStatus).toBe('completed');
    });
  });

  describe('Payment Failures', () => {
    it('handles insufficient funds', async () => {
      paymentMock.configure({
        '/charge': {
          status: 402,
          body: { error: 'INSUFFICIENT_FUNDS' },
        },
      });

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      expect(response.status).toBe(402);
      expect(response.body.error.code).toBe('PAYMENT_FAILED');
    });

    it('handles card declined', async () => {
      paymentMock.configure({
        '/charge': {
          status: 400,
          body: { error: 'CARD_DECLINED' },
        },
      });

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CARD_DECLINED');
    });
  });

  describe('Payment Service Outages', () => {
    it('handles timeout with retry', async () => {
      let callCount = 0;
      paymentMock.configure({
        '/charge': {
          handler: async (req, res) => {
            callCount++;
            if (callCount < 3) {
              // Timeout on first 2 calls
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
            res.json({ transactionId: 'txn-retry-123', status: 'completed' });
          },
        },
      });

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      expect(response.status).toBe(201);
      expect(callCount).toBe(3); // Retried twice
    });

    it('fails gracefully after retries exhausted', async () => {
      paymentMock.configure({
        '/charge': {
          latency: 10000, // Always timeout
        },
      });

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
    });
  });
});
```

### Pattern 11: Webhook Testing

Testing incoming webhooks and callbacks.

```typescript
/**
 * Pattern: Webhook Integration Testing
 * Tests receiving and processing webhooks from external services
 */
describe('Payment Webhooks', () => {
  const WEBHOOK_SECRET = 'whsec_test123';

  function signPayload(payload: object): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(`${timestamp}.${payloadString}`)
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

  describe('Payment Completed Webhook', () => {
    it('updates order on successful payment', async () => {
      const order = await orderFactory.create({
        status: 'pending_payment',
        paymentIntentId: 'pi_test123',
      });

      const payload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            status: 'succeeded',
            amount: 10000,
          },
        },
      };

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('Stripe-Signature', signPayload(payload))
        .send(payload);

      expect(response.status).toBe(200);

      // Verify order updated
      const updatedOrder = await db.orders.findById(order.id);
      expect(updatedOrder.status).toBe('paid');
      expect(updatedOrder.paidAt).toBeDefined();
    });

    it('rejects webhook with invalid signature', async () => {
      const payload = {
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test123' } },
      };

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('Stripe-Signature', 'invalid-signature')
        .send(payload);

      expect(response.status).toBe(401);
    });

    it('rejects replay attacks', async () => {
      const payload = {
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test123' } },
      };

      // Use old timestamp
      const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 6+ minutes old
      const payloadString = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(`${oldTimestamp}.${payloadString}`)
        .digest('hex');

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('Stripe-Signature', `t=${oldTimestamp},v1=${signature}`)
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expired');
    });

    it('handles duplicate webhooks idempotently', async () => {
      const order = await orderFactory.create({
        status: 'pending_payment',
        paymentIntentId: 'pi_duplicate',
      });

      const payload = {
        id: 'evt_unique_123',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_duplicate' } },
      };

      // Send same webhook twice
      await request(app)
        .post('/webhooks/stripe')
        .set('Stripe-Signature', signPayload(payload))
        .send(payload);

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('Stripe-Signature', signPayload(payload))
        .send(payload);

      expect(response.status).toBe(200);

      // Verify processed only once
      const logs = await db.webhookLogs.findByEventId('evt_unique_123');
      expect(logs).toHaveLength(1);
    });
  });

  describe('Payment Failed Webhook', () => {
    it('notifies customer on payment failure', async () => {
      const user = await userFactory.create({ email: 'customer@test.com' });
      const order = await orderFactory.create({
        userId: user.id,
        status: 'pending_payment',
        paymentIntentId: 'pi_failed',
      });

      const payload = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_failed',
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined',
            },
          },
        },
      };

      await request(app)
        .post('/webhooks/stripe')
        .set('Stripe-Signature', signPayload(payload))
        .send(payload);

      // Verify notification sent
      const notifications = await db.notifications.findByUserId(user.id);
      expect(notifications).toContainEqual(
        expect.objectContaining({
          type: 'PAYMENT_FAILED',
          channel: 'email',
        })
      );
    });
  });
});
```

## Resilience Testing Patterns

### Pattern 12: Timeout and Retry Behavior

Testing system behavior under degraded conditions.

```typescript
/**
 * Pattern: Resilience and Timeout Testing
 * Verifies system handles slow/failing dependencies correctly
 */
describe('Resilience', () => {
  describe('Timeout Handling', () => {
    it('times out slow external service calls', async () => {
      mockUserService.setLatency(10000); // 10 second delay

      const startTime = Date.now();
      const response = await request(app)
        .get('/orders/with-user-details')
        .set('Authorization', `Bearer ${token}`);

      const duration = Date.now() - startTime;

      expect(response.status).toBe(503);
      expect(duration).toBeLessThan(5000); // Should timeout before 5s
    });

    it('uses cached data when service times out', async () => {
      // Prime cache
      mockUserService.setLatency(0);
      await request(app)
        .get('/orders/with-user-details')
        .set('Authorization', `Bearer ${token}`);

      // Make service slow
      mockUserService.setLatency(10000);

      const response = await request(app)
        .get('/orders/with-user-details')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['x-data-source']).toBe('cache');
    });
  });

  describe('Circuit Breaker', () => {
    it('opens circuit after consecutive failures', async () => {
      mockPaymentService.configure({ '/charge': { status: 500 } });

      // Make requests until circuit opens
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ items: [{ productId: 'prod-1', quantity: 1 }] });
      }

      // Next request should fail fast
      const startTime = Date.now();
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      const duration = Date.now() - startTime;

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('CIRCUIT_OPEN');
      expect(duration).toBeLessThan(100); // Should fail fast
    });

    it('half-opens circuit after cooldown', async () => {
      mockPaymentService.configure({ '/charge': { status: 500 } });

      // Open circuit
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({ items: [{ productId: 'prod-1', quantity: 1 }] });
      }

      // Wait for cooldown
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Make service healthy
      mockPaymentService.configure({
        '/charge': { status: 200, body: { transactionId: 'txn-1' } },
      });

      // Should attempt request (half-open)
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      expect(response.status).toBe(201);
    });
  });

  describe('Retry Logic', () => {
    it('retries on transient failures', async () => {
      let attempts = 0;
      mockPaymentService.configure({
        '/charge': {
          handler: (req, res) => {
            attempts++;
            if (attempts < 3) {
              res.status(503).json({ error: 'Service busy' });
            } else {
              res.json({ transactionId: 'txn-retry' });
            }
          },
        },
      });

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      expect(response.status).toBe(201);
      expect(attempts).toBe(3);
    });

    it('does not retry on client errors', async () => {
      let attempts = 0;
      mockPaymentService.configure({
        '/charge': {
          handler: (req, res) => {
            attempts++;
            res.status(400).json({ error: 'Invalid card' });
          },
        },
      });

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      expect(response.status).toBe(400);
      expect(attempts).toBe(1); // No retries
    });

    it('uses exponential backoff', async () => {
      const callTimes: number[] = [];
      mockPaymentService.configure({
        '/charge': {
          handler: (req, res) => {
            callTimes.push(Date.now());
            if (callTimes.length < 4) {
              res.status(503).json({ error: 'Retry' });
            } else {
              res.json({ transactionId: 'txn-1' });
            }
          },
        },
      });

      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      // Verify exponential delays
      const delays = [];
      for (let i = 1; i < callTimes.length; i++) {
        delays.push(callTimes[i] - callTimes[i - 1]);
      }

      // Each delay should be roughly double the previous
      expect(delays[1]).toBeGreaterThan(delays[0] * 1.5);
      expect(delays[2]).toBeGreaterThan(delays[1] * 1.5);
    });
  });
});
```

## End-to-End Workflow Patterns

### Pattern 13: Multi-Step Workflow Testing

Testing complete user journeys across services.

```typescript
/**
 * Pattern: Complete Workflow Testing
 * Tests entire user journeys spanning multiple services
 */
describe('E-Commerce Order Workflow', () => {
  let customer: User;
  let customerToken: string;
  let orderId: string;

  beforeAll(async () => {
    customer = await userFactory.create({
      email: 'e2e@test.com',
      role: 'customer',
    });
    customerToken = generateToken(customer);
  });

  describe('Complete Purchase Flow', () => {
    it('Step 1: Add items to cart', async () => {
      const response = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: 'prod-laptop',
          quantity: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].productId).toBe('prod-laptop');
    });

    it('Step 2: Apply discount code', async () => {
      const response = await request(app)
        .post('/cart/discount')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          code: 'SAVE10',
        });

      expect(response.status).toBe(200);
      expect(response.body.discount).toBe(10);
      expect(response.body.discountedTotal).toBeLessThan(response.body.subtotal);
    });

    it('Step 3: Set shipping address', async () => {
      const response = await request(app)
        .post('/cart/shipping')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zip: '12345',
            country: 'US',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.shippingCost).toBeGreaterThan(0);
    });

    it('Step 4: Create order from cart', async () => {
      const response = await request(app)
        .post('/orders/from-cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          paymentMethodId: 'pm_test_visa',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('pending_payment');
      orderId = response.body.id;

      // Cart should be cleared
      const cartResponse = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(cartResponse.body.items).toHaveLength(0);
    });

    it('Step 5: Process payment (via webhook)', async () => {
      // Simulate Stripe webhook
      await request(app)
        .post('/webhooks/stripe')
        .set('Stripe-Signature', signPayload({
          type: 'payment_intent.succeeded',
          data: { object: { id: `pi_${orderId}` } },
        }))
        .send({
          type: 'payment_intent.succeeded',
          data: { object: { id: `pi_${orderId}` } },
        });

      // Verify order status
      const orderResponse = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(orderResponse.body.status).toBe('paid');
    });

    it('Step 6: Verify confirmation email sent', async () => {
      await waitForCondition(async () => {
        const emails = await mockMailService.getSentEmails();
        return emails.some(e => e.to === 'e2e@test.com');
      }, 5000);

      const emails = await mockMailService.getSentEmails();
      const confirmationEmail = emails.find(e =>
        e.to === 'e2e@test.com' &&
        e.subject.includes('Order Confirmation')
      );

      expect(confirmationEmail).toBeDefined();
      expect(confirmationEmail.body).toContain(orderId);
    });

    it('Step 7: Ship order', async () => {
      const response = await request(app)
        .post(`/orders/${orderId}/ship`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          carrier: 'UPS',
          trackingNumber: 'UPS123456789',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('shipped');
    });

    it('Step 8: Verify shipping notification', async () => {
      await waitForCondition(async () => {
        const emails = await mockMailService.getSentEmails();
        return emails.some(e =>
          e.to === 'e2e@test.com' &&
          e.subject.includes('Shipped')
        );
      }, 5000);

      const emails = await mockMailService.getSentEmails();
      const shippingEmail = emails.find(e =>
        e.to === 'e2e@test.com' &&
        e.subject.includes('Shipped')
      );

      expect(shippingEmail).toBeDefined();
      expect(shippingEmail.body).toContain('UPS123456789');
    });

    it('Step 9: Mark as delivered', async () => {
      const response = await request(app)
        .post(`/orders/${orderId}/deliver`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('delivered');
    });

    it('Step 10: Customer leaves review', async () => {
      const response = await request(app)
        .post(`/orders/${orderId}/review`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          comment: 'Great product, fast shipping!',
        });

      expect(response.status).toBe(201);

      // Verify review appears on product
      const productResponse = await request(app)
        .get('/products/prod-laptop/reviews');

      expect(productResponse.body.reviews).toContainEqual(
        expect.objectContaining({
          rating: 5,
          comment: 'Great product, fast shipping!',
          verified: true,
        })
      );
    });
  });
});
```

## Utility Functions

### Wait Helpers

```typescript
// test/utils/wait.ts

/**
 * Wait for a condition to become true
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Wait for an event to be captured
 */
export async function waitForEvent<T>(
  capture: EventCapture,
  filter: (event: T) => boolean,
  timeoutMs: number = 5000
): Promise<T> {
  return waitForCondition(async () => {
    const events = capture.getEvents();
    return events.some(filter);
  }, timeoutMs).then(() => {
    const events = capture.getEvents() as T[];
    return events.find(filter)!;
  });
}

/**
 * Wait for database record to match condition
 */
export async function waitForRecord<T>(
  query: () => Promise<T | null>,
  condition: (record: T) => boolean,
  timeoutMs: number = 5000
): Promise<T> {
  return waitForCondition(async () => {
    const record = await query();
    return record !== null && condition(record);
  }, timeoutMs).then(async () => {
    return (await query())!;
  });
}
```

### Response Matchers

```typescript
// test/utils/matchers.ts

expect.extend({
  toBeValidApiResponse(received) {
    const hasStatus = typeof received.status === 'number';
    const hasBody = typeof received.body === 'object';

    if (hasStatus && hasBody) {
      return {
        message: () => 'Expected not to be a valid API response',
        pass: true,
      };
    }

    return {
      message: () => `Expected valid API response with status and body`,
      pass: false,
    };
  },

  toHavePaginationMeta(received) {
    const requiredFields = ['page', 'pageSize', 'totalItems', 'totalPages'];
    const hasMeta = received.body?.meta;
    const hasAllFields = requiredFields.every(
      field => hasMeta && typeof hasMeta[field] === 'number'
    );

    if (hasAllFields) {
      return {
        message: () => 'Expected not to have pagination meta',
        pass: true,
      };
    }

    return {
      message: () =>
        `Expected response to have pagination meta with ${requiredFields.join(', ')}`,
      pass: false,
    };
  },
});
```

## See Also

- `scenario-templates.md` - Test scenario templates
- `test-environment-setup.md` - Environment configuration
- `contract-testing.md` - Contract testing deep dive
