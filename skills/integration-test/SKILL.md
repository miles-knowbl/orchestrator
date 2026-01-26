---
name: integration-test
description: "Validates that multiple systems work together correctly. Tests cross-system contracts, end-to-end workflows, and interface compatibility. Complements unit testing (test-generation) and code validation (code-validation) by focusing on system boundaries."
phase: TEST
category: core
version: "1.0.0"
depends_on: [test-generation]
tags: [testing, integration, e2e, api-testing, core-workflow]
---

# Integration Test

Validate systems work together.

## When to Use

- **After implementing a system** — Verify it integrates with dependencies
- **Before shipping** — Confirm end-to-end workflows function
- **After contract changes** — Validate interface compatibility
- **Cross-system features** — Test workflows spanning multiple systems
- **Regression prevention** — Ensure changes don't break integrations

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `scenario-templates.md` | Templates for integration test scenarios |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| MCP tool definitions or API specs | When testing specific integrations |

**Verification:** Ensure integration tests are executable, not just documented.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Integration test files | `tests/integration/` | Always |
| `INTEGRATION-TEST.md` | Project root | When documenting test scenarios |

## Core Concept

Integration testing answers: **"Do these systems work together correctly?"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION TESTING                                       │
│                                                                             │
│  Unit Tests        Integration Tests         E2E Tests                      │
│  ──────────        ─────────────────         ─────────                      │
│  Single            System                    Full                           │
│  Component         Boundaries                Workflows                      │
│                                                                             │
│  ┌───────┐         ┌───────┐  ┌───────┐     ┌───────┐                      │
│  │   A   │         │   A   │──│   B   │     │   A   │──▶│   B   │──▶│   C  │
│  └───────┘         └───────┘  └───────┘     └───────┘                      │
│                                                                             │
│  "Does A work?"    "Do A and B work       "Does the whole                  │
│                     together?"              workflow work?"                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Integration Test Types

### 1. Contract Tests

Verify systems honor their API contracts.

| Type | Description | Example |
|------|-------------|---------|
| **Consumer Contract** | Consumer's expectations of provider | "Order Service expects Auth to return JWT with userId" |
| **Provider Contract** | Provider's published interface | "Auth Service returns JWT per OpenAPI spec" |
| **Pact-style** | Bidirectional contract verification | Both sides verify against shared contract |

### 2. API Integration Tests

Test actual HTTP/RPC communication between services.

| Focus | What to Test |
|-------|--------------|
| Happy path | Standard request → expected response |
| Error handling | Invalid input → proper error code |
| Authentication | Token → authorized/unauthorized correctly |
| Rate limiting | Excessive requests → throttled |
| Timeout | Slow response → handled gracefully |

### 3. Event Integration Tests

Test asynchronous message passing.

| Focus | What to Test |
|-------|--------------|
| Event publishing | Action → event published correctly |
| Event consuming | Event received → correct handling |
| Event ordering | Sequence preserved when required |
| Duplicate handling | Same event twice → idempotent |
| Dead letter | Failed processing → captured |

### 4. Data Integration Tests

Test data flows between systems.

| Focus | What to Test |
|-------|--------------|
| Data format | Correct schema between systems |
| Data transformation | Mapped correctly |
| Data consistency | Same data in both systems |
| Referential integrity | Foreign keys valid |

### 5. End-to-End Tests

Test complete user workflows.

| Focus | What to Test |
|-------|--------------|
| Critical paths | Main user journeys |
| Cross-system flows | Actions spanning services |
| State transitions | Complete lifecycle |

## The Integration Test Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  INTEGRATION TEST PROCESS                                    │
│                                                                             │
│  1. IDENTIFY INTEGRATION POINTS                                             │
│     └─→ What systems does this system interact with?                        │
│     └─→ What APIs does it call? What events does it publish/consume?        │
│                                                                             │
│  2. GATHER CONTRACTS                                                        │
│     └─→ Load API specs from interfaces/api/                                 │
│     └─→ Load event schemas from interfaces/events/                          │
│                                                                             │
│  3. DESIGN TEST SCENARIOS                                                   │
│     └─→ Happy path scenarios                                                │
│     └─→ Error scenarios                                                     │
│     └─→ Edge cases                                                          │
│                                                                             │
│  4. SET UP TEST ENVIRONMENT                                                 │
│     └─→ Start required services (or mocks)                                  │
│     └─→ Set up test data                                                    │
│     └─→ Configure test credentials                                          │
│                                                                             │
│  5. IMPLEMENT TESTS                                                         │
│     └─→ Contract tests                                                      │
│     └─→ API integration tests                                               │
│     └─→ Event integration tests                                             │
│     └─→ E2E tests for critical paths                                        │
│                                                                             │
│  6. RUN AND VERIFY                                                          │
│     └─→ Execute tests                                                       │
│     └─→ Analyze failures                                                    │
│     └─→ Fix contract mismatches                                             │
│                                                                             │
│  7. DOCUMENT INTEGRATION                                                    │
│     └─→ Update interface documentation                                      │
│     └─→ Document test coverage                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Step 1: Identify Integration Points

For the system under test, document:

```markdown
## Integration Points: [System Name]

### APIs Called (Outbound)
| Service | Endpoint | Method | Purpose |
|---------|----------|--------|---------|
| Auth | /auth/verify | POST | Verify JWT token |
| User | /users/{id} | GET | Get user details |

### APIs Exposed (Inbound)
| Endpoint | Method | Consumers | Purpose |
|----------|--------|-----------|---------|
| /orders | POST | Mobile App, Web App | Create order |
| /orders/{id} | GET | Mobile App, Web App, Analytics | Get order |

### Events Published
| Event | Channel | Consumers |
|-------|---------|-----------|
| OrderCreated | orders/created | Notification, Analytics |
| OrderCompleted | orders/completed | Billing, Analytics |

### Events Consumed
| Event | Channel | Publisher |
|-------|---------|-----------|
| UserCreated | users/created | User Service |
| PaymentReceived | payments/received | Billing Service |

### Data Dependencies
| System | Data | Direction | Sync Method |
|--------|------|-----------|-------------|
| User Service | User records | Read | API call |
| Inventory | Stock levels | Read | Event |
```

## Step 2: Gather Contracts

Load contracts from domain memory:

```bash
# API contracts
cat domain-memory/{domain}/interfaces/api/auth-service.yaml
cat domain-memory/{domain}/interfaces/api/order-service.yaml

# Event contracts
cat domain-memory/{domain}/interfaces/events/order-events.yaml
```

If contracts don't exist, create them using templates from `memory-manager/references/interface-contracts.md`.

## Step 3: Design Test Scenarios

### Scenario Template

```markdown
## Scenario: [Name]

**Type:** Contract | API | Event | E2E
**Systems Involved:** [List]
**Priority:** High | Medium | Low

### Setup
- [Precondition 1]
- [Precondition 2]

### Steps
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Expected Results
- [Expected outcome 1]
- [Expected outcome 2]

### Cleanup
- [Cleanup step 1]
```

### Scenario Categories

| Category | Scenarios to Include |
|----------|---------------------|
| **Happy Path** | Standard successful flow |
| **Authentication** | Valid token, invalid token, expired token |
| **Authorization** | Permitted actions, forbidden actions |
| **Validation** | Valid input, invalid input, edge cases |
| **Error Handling** | Service down, timeout, malformed response |
| **Concurrency** | Simultaneous requests, race conditions |
| **Data Integrity** | Consistent data across systems |

→ See `references/scenario-templates.md`

## Step 4: Test Environment

### Options

| Environment | Pros | Cons | Use When |
|-------------|------|------|----------|
| **Mocks** | Fast, isolated | Not real services | Unit-level integration |
| **Docker Compose** | Realistic, reproducible | Setup complexity | Local development |
| **Staging** | Production-like | Shared, may be unstable | Pre-production |
| **Production (read-only)** | Real data | Risk | Smoke tests only |

### Docker Compose Example

```yaml
# docker-compose.test.yaml
version: '3.8'

services:
  # System under test
  order-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:3001
      - DATABASE_URL=postgres://postgres:postgres@db:5432/orders
    depends_on:
      - auth-service
      - db

  # Dependency
  auth-service:
    image: auth-service:test
    ports:
      - "3001:3001"
    environment:
      - JWT_SECRET=test-secret

  # Database
  db:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=orders

  # Message broker
  kafka:
    image: confluentinc/cp-kafka:latest
    ports:
      - "9092:9092"
```

### Test Data Setup

```javascript
// test/setup.js
async function setupTestData() {
  // Create test users
  await authService.createUser({
    id: 'test-user-1',
    email: 'test@example.com',
    role: 'technician'
  });
  
  // Create test orders
  await orderService.createOrder({
    id: 'test-order-1',
    customerId: 'test-customer-1',
    status: 'pending'
  });
}

async function teardownTestData() {
  await orderService.deleteOrder('test-order-1');
  await authService.deleteUser('test-user-1');
}
```

→ See `references/test-environment-setup.md`

## Step 5: Implement Tests

### Contract Test Example (Pact-style)

```javascript
// Consumer side (Order Service expects Auth Service)
describe('Auth Service Contract', () => {
  it('verifies JWT token', async () => {
    // Define expected interaction
    await provider.addInteraction({
      state: 'a valid JWT exists',
      uponReceiving: 'a request to verify token',
      withRequest: {
        method: 'POST',
        path: '/auth/verify',
        headers: { 'Content-Type': 'application/json' },
        body: { token: 'valid-jwt-token' }
      },
      willRespondWith: {
        status: 200,
        body: {
          valid: true,
          userId: Matchers.string(),
          expiresAt: Matchers.iso8601DateTime()
        }
      }
    });
    
    // Execute
    const result = await authClient.verifyToken('valid-jwt-token');
    
    // Verify
    expect(result.valid).toBe(true);
    expect(result.userId).toBeDefined();
  });
});
```

### API Integration Test Example

```javascript
// test/integration/order-api.test.js
describe('Order API Integration', () => {
  let authToken;
  
  beforeAll(async () => {
    // Get real auth token from Auth Service
    authToken = await authService.login({
      email: 'test@example.com',
      password: 'test-password'
    });
  });
  
  describe('POST /orders', () => {
    it('creates order with valid token', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: 'test-customer-1',
          items: [{ productId: 'prod-1', quantity: 2 }]
        });
      
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('pending');
      
      // Verify in database
      const order = await db.orders.findById(response.body.id);
      expect(order).toBeDefined();
    });
    
    it('rejects request with invalid token', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', 'Bearer invalid-token')
        .send({ customerId: 'test-customer-1' });
      
      expect(response.status).toBe(401);
    });
    
    it('handles auth service timeout gracefully', async () => {
      // Simulate Auth Service being slow
      authServiceMock.setLatency(5000);
      
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ customerId: 'test-customer-1' });
      
      // Should timeout and return error
      expect(response.status).toBe(503);
      expect(response.body.error).toContain('Service unavailable');
    });
  });
});
```

### Event Integration Test Example

```javascript
// test/integration/order-events.test.js
describe('Order Events Integration', () => {
  let eventCapture;
  
  beforeAll(async () => {
    // Subscribe to events
    eventCapture = await kafka.subscribe('orders/#');
  });
  
  afterAll(async () => {
    await kafka.unsubscribe(eventCapture);
  });
  
  it('publishes OrderCreated event on order creation', async () => {
    // Create order
    const order = await orderService.createOrder({
      customerId: 'test-customer-1',
      items: [{ productId: 'prod-1', quantity: 2 }]
    });
    
    // Wait for event
    const event = await eventCapture.waitForEvent(
      'orders/created',
      { orderId: order.id },
      5000 // timeout
    );
    
    // Verify event
    expect(event.orderId).toBe(order.id);
    expect(event.customerId).toBe('test-customer-1');
    expect(event.timestamp).toBeDefined();
  });
  
  it('handles duplicate events idempotently', async () => {
    const event = {
      eventId: 'evt-123',
      orderId: 'order-123',
      customerId: 'cust-123'
    };
    
    // Publish same event twice
    await kafka.publish('orders/created', event);
    await kafka.publish('orders/created', event);
    
    // Should only create one record
    const orders = await db.orders.findByCustomerId('cust-123');
    expect(orders.length).toBe(1);
  });
});
```

### End-to-End Test Example

```javascript
// test/e2e/order-workflow.test.js
describe('Order Workflow E2E', () => {
  it('completes full order lifecycle', async () => {
    // Step 1: Customer creates order
    const createResponse = await api
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerId: customerId,
        items: [{ productId: 'prod-1', quantity: 1 }]
      });
    
    expect(createResponse.status).toBe(201);
    const orderId = createResponse.body.id;
    
    // Step 2: Order assigned to technician
    const assignResponse = await api
      .post(`/orders/${orderId}/assign`)
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({ technicianId: technicianId });
    
    expect(assignResponse.status).toBe(200);
    
    // Verify notification sent (check Notification Service)
    const notifications = await notificationService
      .getNotifications(technicianId);
    expect(notifications).toContainEqual(
      expect.objectContaining({ type: 'ORDER_ASSIGNED', orderId })
    );
    
    // Step 3: Technician starts work
    const startResponse = await api
      .post(`/orders/${orderId}/start`)
      .set('Authorization', `Bearer ${technicianToken}`);
    
    expect(startResponse.status).toBe(200);
    
    // Step 4: Technician completes order
    const completeResponse = await api
      .post(`/orders/${orderId}/complete`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({
        signature: 'base64-signature',
        notes: 'Work completed successfully'
      });
    
    expect(completeResponse.status).toBe(200);
    
    // Verify final state
    const finalOrder = await api.get(`/orders/${orderId}`);
    expect(finalOrder.body.status).toBe('completed');
    
    // Verify analytics received event
    const analytics = await analyticsService.getOrderMetrics(orderId);
    expect(analytics.completedAt).toBeDefined();
  });
});
```

→ See `references/test-patterns.md`

## Step 6: Run and Verify

### Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npm run test:integration -- order-api.test.js

# Run with coverage
npm run test:integration -- --coverage

# Run in CI
npm run test:integration:ci
```

### Analyzing Failures

| Failure Type | Likely Cause | Investigation |
|--------------|--------------|---------------|
| Connection refused | Service not running | Check Docker, ports |
| 401 Unauthorized | Token issue | Check token generation, expiry |
| 500 Internal Error | Bug in service | Check service logs |
| Timeout | Slow service or deadlock | Check performance, dependencies |
| Contract mismatch | API changed | Compare contract vs implementation |
| Event not received | Pub/sub issue | Check broker, subscriptions |

### Contract Mismatch Resolution

When contract test fails:

1. **Identify mismatch** — What differs from contract?
2. **Determine source of truth** — Is contract wrong or implementation wrong?
3. **Coordinate change** — If contract changes, notify all consumers
4. **Update and verify** — Fix mismatch, re-run tests

## Step 7: Document Integration

### Integration Test Coverage

```markdown
## Integration Test Coverage: [System Name]

### API Integration
| Endpoint | Test Count | Covered Scenarios |
|----------|------------|-------------------|
| POST /orders | 5 | create, validation, auth, error handling |
| GET /orders/{id} | 3 | found, not found, unauthorized |
| POST /orders/{id}/complete | 4 | success, validation, auth, already complete |

### Event Integration
| Event | Direction | Test Count | Covered Scenarios |
|-------|-----------|------------|-------------------|
| OrderCreated | Publish | 3 | publish, format, idempotency |
| PaymentReceived | Consume | 2 | process, duplicate handling |

### E2E Workflows
| Workflow | Test Count | Systems Involved |
|----------|------------|------------------|
| Order Lifecycle | 1 | Auth, Order, Notification, Analytics |
| Payment Flow | 1 | Order, Payment, Billing |

### Coverage Gaps
- [ ] Rate limiting not tested
- [ ] Bulk operations not tested
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `test-generation` | Creates unit tests; integration-test focuses on boundaries |
| `code-validation` | Validates single system; integration-test validates interactions |
| `memory-manager` | Provides interface contracts for testing |
| `loop-controller` | Invokes integration-test during VALIDATE stage |

## Key Principles

**Test at boundaries.** Focus on where systems meet.

**Use real services when practical.** Mocks hide integration issues.

**Test failure modes.** Systems fail; test graceful degradation.

**Keep tests independent.** Each test should set up and clean up.

**Contract tests prevent regression.** They catch breaking changes early.

## Mode-Specific Behavior

Integration testing approach differs by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full coverage—all integration points |
| **Approach** | Comprehensive—contract, API, event, E2E |
| **Patterns** | Free choice—establish test infrastructure |
| **Deliverables** | Full test suite, Docker Compose, docs |
| **Validation** | All integration points tested |
| **Constraints** | Minimal—full control over environment |

**Greenfield integration testing:**
```
1. Define all integration contracts
2. Set up test environment (Docker Compose)
3. Create test data factories
4. Write contract tests for all interfaces
5. Write API integration tests for all endpoints
6. Write event integration tests for all events
7. Write E2E tests for critical user journeys
8. Document integration test coverage
```

**Greenfield test priorities:**
- All outbound API calls tested
- All inbound API endpoints tested
- All events (publish/consume) tested
- Critical E2E flows covered
- Contract tests for all interfaces

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific—new/modified integrations |
| **Approach** | Extend existing—match test patterns |
| **Patterns** | Should match existing test conventions |
| **Deliverables** | Gap tests following existing structure |
| **Validation** | Existing tests pass + gaps covered |
| **Constraints** | Don't restructure—use existing infrastructure |

**Polish integration testing:**
```
1. Identify existing integration test patterns
2. Find untested integration points
3. Add tests following existing conventions
4. Use existing test infrastructure
5. Verify new code doesn't break existing integrations
6. Update documentation for new integrations
```

**Polish considerations:**
- Match existing test file structure
- Use existing test utilities and helpers
- Follow existing naming conventions
- Don't change test configuration
- Add to existing test suites

**Polish gap analysis:**
```markdown
## Integration Test Gaps

### Currently Tested
- Auth API integration ✓
- User API integration ✓

### Missing Tests
- Payment API integration ← Add
- Notification events ← Add
- Rate limiting ← Add
```

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific—affected integrations only |
| **Approach** | Surgical—regression tests for changes |
| **Patterns** | Must conform exactly to existing tests |
| **Deliverables** | Regression tests, contract verification |
| **Validation** | Full regression—existing tests pass |
| **Constraints** | Requires approval—no contract changes without sign-off |

**Enterprise integration testing:**
```
1. Identify which integrations are affected by change
2. Find existing tests for those integrations
3. Add regression tests matching existing patterns
4. Verify existing integration tests still pass
5. Document any contract changes required
6. Get contract changes approved before implementing
```

**Enterprise constraints:**
- Do NOT add new integration test frameworks
- Do NOT modify test environment configuration
- Do NOT change existing contract definitions without approval
- Tests must pass in existing CI/CD pipeline
- Contract changes require consumer notification

### Mode-Specific Test Types

| Test Type | Greenfield | Polish | Enterprise |
|-----------|------------|--------|------------|
| **Contract** | Create all | Add missing | Verify existing |
| **API** | All endpoints | New endpoints | Changed endpoints |
| **Event** | All events | New events | Changed events |
| **E2E** | Critical flows | Gap fill | If affected |

### Environment by Mode

| Mode | Environment | Setup Ownership |
|------|-------------|-----------------|
| **Greenfield** | Docker Compose (custom) | Full control |
| **Polish** | Existing test infrastructure | Extend carefully |
| **Enterprise** | Approved environments only | No modifications |

### Contract Management by Mode

**Greenfield:**
- Create new contracts for all interfaces
- Define contract versioning strategy
- Establish contract testing pipeline
- Full ownership of contract definitions

**Polish:**
- Verify against existing contracts
- Add contracts for new integrations
- Follow existing versioning patterns
- Coordinate changes with existing consumers

**Enterprise:**
- Read-only contract verification
- No contract modifications without approval
- Document contract change requests
- Follow change management process

### Integration Test Coverage Targets

| Mode | Target Coverage |
|------|-----------------|
| **Greenfield** | 100% of integration points |
| **Polish** | Match existing + new integrations |
| **Enterprise** | Changed integrations only |

## References

- `references/scenario-templates.md`: Test scenario templates
- `references/test-environment-setup.md`: Environment configuration
- `references/test-patterns.md`: Common integration test patterns
- `references/contract-testing.md`: Contract testing deep dive
