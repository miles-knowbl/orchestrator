# Contract Testing

Comprehensive guide to contract testing for validating API contracts between services in distributed systems.

## Purpose

This reference provides patterns and practices for implementing contract testing. Use this when:

- Validating API contracts between microservices
- Preventing breaking changes in service interfaces
- Ensuring consumer expectations match provider implementations
- Implementing continuous contract verification in CI/CD
- Managing API versioning and evolution
- Coordinating interface changes across teams

## Core Concepts

### What is Contract Testing?

Contract testing verifies that two services (a consumer and a provider) can communicate correctly by testing against a shared contract definition.

```
+------------------------------------------------------------------+
|                    CONTRACT TESTING MODEL                         |
|                                                                   |
|   CONSUMER                    CONTRACT               PROVIDER     |
|   (Client)                                          (Server)      |
|                                                                   |
|   +---------+             +------------+           +---------+    |
|   |         |  Expects    |            |  Honors   |         |    |
|   | Order   |------------>|  Contract  |<----------|  Auth   |    |
|   | Service |             |            |           | Service |    |
|   |         |             | - Request  |           |         |    |
|   +---------+             |   format   |           +---------+    |
|                           | - Response |                          |
|                           |   format   |                          |
|                           | - Status   |                          |
|                           |   codes    |                          |
|                           +------------+                          |
|                                                                   |
|   Consumer Test:              Contract:         Provider Test:    |
|   "When I call verify,       "POST /verify      "When receiving   |
|    I expect these fields"     returns {...}"     valid request,   |
|                                                  return {...}"    |
|                                                                   |
+------------------------------------------------------------------+
```

### Contract Testing vs Other Testing

| Test Type | Scope | Dependencies | Speed | Purpose |
|-----------|-------|--------------|-------|---------|
| **Unit** | Single function | Mocked | Fast | Logic correctness |
| **Integration** | Multiple components | Real/Mocked | Medium | Component interaction |
| **Contract** | API boundary | Mocked | Fast | Interface compatibility |
| **E2E** | Full system | Real | Slow | User journey validation |

### Types of Contract Testing

| Approach | Description | Best For |
|----------|-------------|----------|
| **Consumer-Driven** | Consumers define expectations, providers verify | APIs with known consumers |
| **Provider-Driven** | Providers publish contract, consumers verify | Public APIs, OpenAPI |
| **Bidirectional** | Both sides verify against shared contract | Internal microservices |

## Consumer-Driven Contract Testing

### Workflow Overview

```
+------------------------------------------------------------------+
|              CONSUMER-DRIVEN CONTRACT WORKFLOW                    |
|                                                                   |
|  1. CONSUMER DEFINES EXPECTATIONS                                 |
|     +------------------+                                          |
|     | Consumer Test    |---> "I expect POST /verify               |
|     | (Pact)           |      to return {valid: true, userId}"    |
|     +------------------+                                          |
|              |                                                    |
|              v                                                    |
|  2. CONTRACT GENERATED                                            |
|     +------------------+                                          |
|     | Contract File    |---> Stored in Pact Broker                |
|     | (JSON/YAML)      |     or version control                   |
|     +------------------+                                          |
|              |                                                    |
|              v                                                    |
|  3. PROVIDER VERIFIES                                             |
|     +------------------+                                          |
|     | Provider Test    |---> Verify implementation                |
|     | (Pact Verifier)  |     meets consumer expectations          |
|     +------------------+                                          |
|              |                                                    |
|              v                                                    |
|  4. RESULTS PUBLISHED                                             |
|     +------------------+                                          |
|     | Pact Broker      |---> Track verification status            |
|     |                  |     across versions                      |
|     +------------------+                                          |
|                                                                   |
+------------------------------------------------------------------+
```

### Consumer Side Implementation (Pact)

```typescript
// consumer/tests/auth-service.contract.test.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { AuthServiceClient } from '../clients/auth-service';

const { like, eachLike, regex, datetime } = MatchersV3;

describe('Auth Service Contract', () => {
  const provider = new PactV3({
    consumer: 'OrderService',
    provider: 'AuthService',
    dir: './pacts',
  });

  describe('Token Verification', () => {
    it('verifies valid JWT token', async () => {
      // Define the expected interaction
      provider
        .given('a valid JWT token exists')
        .uponReceiving('a request to verify a valid token')
        .withRequest({
          method: 'POST',
          path: '/auth/verify',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            token: like('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            valid: true,
            userId: like('user-123'),
            email: like('user@example.com'),
            roles: eachLike('user'),
            expiresAt: datetime('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
          },
        });

      await provider.executeTest(async (mockServer) => {
        // Create client pointing to mock server
        const client = new AuthServiceClient(mockServer.url);

        // Execute the actual call
        const result = await client.verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

        // Verify the client handles the response correctly
        expect(result.valid).toBe(true);
        expect(result.userId).toBeDefined();
        expect(result.email).toBeDefined();
        expect(result.roles).toBeInstanceOf(Array);
        expect(new Date(result.expiresAt)).toBeInstanceOf(Date);
      });
    });

    it('handles invalid token', async () => {
      provider
        .given('an invalid token is provided')
        .uponReceiving('a request to verify an invalid token')
        .withRequest({
          method: 'POST',
          path: '/auth/verify',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            token: like('invalid-token'),
          },
        })
        .willRespondWith({
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            error: {
              code: 'INVALID_TOKEN',
              message: like('Token is invalid or expired'),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const client = new AuthServiceClient(mockServer.url);

        await expect(client.verifyToken('invalid-token'))
          .rejects
          .toThrow('Token is invalid or expired');
      });
    });

    it('handles expired token', async () => {
      provider
        .given('an expired token is provided')
        .uponReceiving('a request to verify an expired token')
        .withRequest({
          method: 'POST',
          path: '/auth/verify',
          body: {
            token: like('expired-token'),
          },
        })
        .willRespondWith({
          status: 401,
          body: {
            error: {
              code: 'TOKEN_EXPIRED',
              message: like('Token has expired'),
              expiredAt: datetime('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const client = new AuthServiceClient(mockServer.url);

        try {
          await client.verifyToken('expired-token');
          fail('Should have thrown');
        } catch (error) {
          expect(error.code).toBe('TOKEN_EXPIRED');
          expect(error.expiredAt).toBeDefined();
        }
      });
    });
  });

  describe('User Info', () => {
    it('retrieves user information', async () => {
      provider
        .given('user usr-123 exists')
        .uponReceiving('a request to get user info')
        .withRequest({
          method: 'GET',
          path: '/auth/users/usr-123',
          headers: {
            Authorization: regex(/^Bearer .+$/, 'Bearer valid-token'),
          },
        })
        .willRespondWith({
          status: 200,
          body: {
            id: 'usr-123',
            email: like('user@example.com'),
            name: like('John Doe'),
            roles: eachLike('user'),
            createdAt: datetime('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
            lastLoginAt: datetime('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const client = new AuthServiceClient(mockServer.url);
        const user = await client.getUserInfo('usr-123', 'valid-token');

        expect(user.id).toBe('usr-123');
        expect(user.email).toBeDefined();
        expect(user.name).toBeDefined();
      });
    });
  });
});
```

### Provider Side Verification

```typescript
// provider/tests/contract.verification.test.ts
import { Verifier } from '@pact-foundation/pact';
import { app } from '../src/app';
import { Server } from 'http';
import { db } from '../src/database';

describe('Auth Service Provider Verification', () => {
  let server: Server;
  const port = 4000;

  beforeAll(async () => {
    server = app.listen(port);
  });

  afterAll(async () => {
    server.close();
    await db.close();
  });

  it('verifies contracts with all consumers', async () => {
    const verifier = new Verifier({
      provider: 'AuthService',
      providerBaseUrl: `http://localhost:${port}`,

      // Fetch contracts from Pact Broker
      pactBrokerUrl: process.env.PACT_BROKER_URL,
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,

      // Or use local pact files
      // pactUrls: ['./pacts/OrderService-AuthService.json'],

      // Provider states setup
      stateHandlers: {
        'a valid JWT token exists': async () => {
          // Setup: Create valid token in test database
          await db.tokens.create({
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            userId: 'user-123',
            expiresAt: new Date(Date.now() + 3600000),
          });
        },

        'an invalid token is provided': async () => {
          // No setup needed - token doesn't exist
        },

        'an expired token is provided': async () => {
          await db.tokens.create({
            token: 'expired-token',
            userId: 'user-123',
            expiresAt: new Date(Date.now() - 3600000), // Expired
          });
        },

        'user usr-123 exists': async () => {
          await db.users.create({
            id: 'usr-123',
            email: 'user@example.com',
            name: 'John Doe',
            roles: ['user'],
            createdAt: new Date(),
            lastLoginAt: new Date(),
          });
        },
      },

      // Cleanup after each interaction
      afterEach: async () => {
        await db.tokens.deleteAll();
        await db.users.deleteAll();
      },

      // Publish results to Pact Broker
      publishVerificationResult: process.env.CI === 'true',
      providerVersion: process.env.GIT_COMMIT_SHA || '1.0.0',
      providerVersionBranch: process.env.GIT_BRANCH || 'main',

      // Logging
      logLevel: 'info',
    });

    await verifier.verifyProvider();
  });
});
```

### Pact Matchers Reference

| Matcher | Purpose | Example |
|---------|---------|---------|
| `like(value)` | Match type, not exact value | `like('user-123')` |
| `eachLike(value)` | Array with elements matching pattern | `eachLike({ id: like('1') })` |
| `regex(pattern, example)` | Match regex pattern | `regex(/^\d{4}-\d{2}$/, '2024-01')` |
| `datetime(format)` | Match datetime format | `datetime("yyyy-MM-dd'T'HH:mm:ss")` |
| `integer()` | Match integer | `integer(123)` |
| `decimal()` | Match decimal | `decimal(12.34)` |
| `boolean()` | Match boolean | `boolean(true)` |
| `uuid()` | Match UUID format | `uuid()` |
| `email()` | Match email format | `email()` |
| `ipv4Address()` | Match IPv4 address | `ipv4Address()` |
| `nullValue()` | Match null | `nullValue()` |
| `atLeastOneLike(value, min)` | Array with minimum elements | `atLeastOneLike(item, 2)` |
| `atMostOneLike(value, max)` | Array with maximum elements | `atMostOneLike(item, 5)` |

## Provider-Driven Contract Testing

### OpenAPI Schema Validation

```typescript
// tests/openapi-contract.test.ts
import SwaggerParser from '@apidevtools/swagger-parser';
import request from 'supertest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { app } from '../src/app';

describe('OpenAPI Contract Compliance', () => {
  let api: any;
  let ajv: Ajv;

  beforeAll(async () => {
    // Load and validate OpenAPI spec
    api = await SwaggerParser.dereference('./openapi.yaml');

    // Setup JSON Schema validator
    ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
  });

  function validateResponse(
    path: string,
    method: string,
    statusCode: number,
    body: any
  ): void {
    const pathSpec = api.paths[path];
    if (!pathSpec) {
      throw new Error(`Path ${path} not found in OpenAPI spec`);
    }

    const operationSpec = pathSpec[method.toLowerCase()];
    if (!operationSpec) {
      throw new Error(`Method ${method} not found for path ${path}`);
    }

    const responseSpec = operationSpec.responses[statusCode];
    if (!responseSpec) {
      throw new Error(`Status ${statusCode} not defined for ${method} ${path}`);
    }

    const schema = responseSpec.content?.['application/json']?.schema;
    if (schema) {
      const validate = ajv.compile(schema);
      const valid = validate(body);

      if (!valid) {
        throw new Error(
          `Response does not match schema: ${ajv.errorsText(validate.errors)}`
        );
      }
    }
  }

  describe('GET /users/{id}', () => {
    it('returns response matching OpenAPI schema', async () => {
      const user = await userFactory.create();

      const response = await request(app)
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      validateResponse('/users/{id}', 'GET', 200, response.body);
    });

    it('returns 404 matching OpenAPI error schema', async () => {
      const response = await request(app)
        .get('/users/non-existent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      validateResponse('/users/{id}', 'GET', 404, response.body);
    });
  });

  describe('POST /orders', () => {
    it('accepts request matching OpenAPI request schema', async () => {
      // This tests that the request body matches the spec
      const requestBody = {
        items: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          country: 'US',
        },
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(requestBody);

      expect(response.status).toBe(201);
      validateResponse('/orders', 'POST', 201, response.body);
    });

    it('rejects request not matching schema with 400', async () => {
      // Missing required fields
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [] }); // Empty items not allowed

      expect(response.status).toBe(400);
      validateResponse('/orders', 'POST', 400, response.body);
    });
  });
});
```

### Prism Mock Server

Use Prism to create a mock server from OpenAPI spec for consumer testing:

```bash
# Install Prism
npm install -g @stoplight/prism-cli

# Run mock server from OpenAPI spec
prism mock openapi.yaml -p 4010

# Run with dynamic responses
prism mock openapi.yaml -p 4010 --dynamic
```

```typescript
// Consumer test against Prism mock
describe('User Service Client', () => {
  const baseUrl = 'http://localhost:4010';

  it('handles user response from API', async () => {
    const client = new UserServiceClient(baseUrl);
    const user = await client.getUser('usr-123');

    // Response matches OpenAPI schema
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
  });
});
```

## Bidirectional Contract Testing

### Schema Registry Approach

```typescript
// shared/contracts/user-events.ts
import { z } from 'zod';

// Define contract schemas
export const UserCreatedEventSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.literal('UserCreated'),
  timestamp: z.string().datetime(),
  payload: z.object({
    userId: z.string(),
    email: z.string().email(),
    name: z.string(),
    roles: z.array(z.string()),
  }),
});

export type UserCreatedEvent = z.infer<typeof UserCreatedEventSchema>;

export const UserUpdatedEventSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.literal('UserUpdated'),
  timestamp: z.string().datetime(),
  payload: z.object({
    userId: z.string(),
    changes: z.record(z.unknown()),
  }),
});

export type UserUpdatedEvent = z.infer<typeof UserUpdatedEventSchema>;

// Registry of all event schemas
export const EventSchemas = {
  UserCreated: UserCreatedEventSchema,
  UserUpdated: UserUpdatedEventSchema,
};
```

```typescript
// producer/tests/event-contract.test.ts
import { UserCreatedEventSchema } from '@shared/contracts/user-events';

describe('User Service Event Contracts', () => {
  describe('UserCreated Event', () => {
    it('publishes event matching contract schema', async () => {
      const user = await userService.createUser({
        email: 'new@example.com',
        name: 'New User',
      });

      const event = await eventCapture.waitForEvent('user.created');

      // Validate against contract schema
      const validation = UserCreatedEventSchema.safeParse(event);
      expect(validation.success).toBe(true);

      if (!validation.success) {
        console.error('Schema validation errors:', validation.error.errors);
      }
    });
  });
});

// consumer/tests/event-contract.test.ts
import { UserCreatedEventSchema, UserCreatedEvent } from '@shared/contracts/user-events';

describe('Order Service - User Events Consumer', () => {
  describe('UserCreated Event Handler', () => {
    it('handles event matching contract schema', async () => {
      // Create valid event per contract
      const validEvent: UserCreatedEvent = {
        eventId: crypto.randomUUID(),
        eventType: 'UserCreated',
        timestamp: new Date().toISOString(),
        payload: {
          userId: 'usr-123',
          email: 'user@example.com',
          name: 'Test User',
          roles: ['customer'],
        },
      };

      // Validate test data matches contract
      expect(UserCreatedEventSchema.safeParse(validEvent).success).toBe(true);

      // Publish and verify handling
      await kafka.publish('user.created', validEvent);

      await waitForCondition(async () => {
        const user = await db.users.findById('usr-123');
        return user !== null;
      });

      const user = await db.users.findById('usr-123');
      expect(user.email).toBe('user@example.com');
    });
  });
});
```

## CI/CD Integration

### Contract Testing Pipeline

```yaml
# .github/workflows/contract-tests.yaml
name: Contract Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Consumer tests - generate contracts
  consumer-contracts:
    runs-on: ubuntu-latest
    services:
      pact-broker:
        image: pactfoundation/pact-broker:latest
        ports:
          - 9292:9292
        env:
          PACT_BROKER_DATABASE_URL: sqlite:////tmp/pact.sqlite

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run consumer contract tests
        run: npm run test:contract:consumer
        env:
          PACT_BROKER_URL: http://localhost:9292

      - name: Publish pacts to broker
        run: |
          npx pact-broker publish ./pacts \
            --broker-base-url=$PACT_BROKER_URL \
            --consumer-app-version=${{ github.sha }} \
            --branch=${{ github.ref_name }}
        env:
          PACT_BROKER_URL: http://localhost:9292

      - name: Upload pact files
        uses: actions/upload-artifact@v4
        with:
          name: pact-contracts
          path: ./pacts

  # Provider verification
  provider-verification:
    runs-on: ubuntu-latest
    needs: consumer-contracts
    strategy:
      matrix:
        provider: [auth-service, user-service, order-service]

    steps:
      - uses: actions/checkout@v4
        with:
          repository: org/${{ matrix.provider }}

      - name: Download pact files
        uses: actions/download-artifact@v4
        with:
          name: pact-contracts
          path: ./pacts

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Start provider service
        run: npm run start:test &
        env:
          PORT: 4000

      - name: Wait for service
        run: |
          timeout 30 bash -c 'until curl -sf http://localhost:4000/health; do sleep 1; done'

      - name: Verify provider contracts
        run: npm run test:contract:provider
        env:
          PROVIDER_BASE_URL: http://localhost:4000
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_COMMIT: ${{ github.sha }}
          GIT_BRANCH: ${{ github.ref_name }}

  # Can-i-deploy check
  can-i-deploy:
    runs-on: ubuntu-latest
    needs: provider-verification
    if: github.event_name == 'push'

    steps:
      - name: Check deployment safety
        run: |
          npx pact-broker can-i-deploy \
            --pacticipant OrderService \
            --version ${{ github.sha }} \
            --to production \
            --broker-base-url ${{ secrets.PACT_BROKER_URL }} \
            --broker-token ${{ secrets.PACT_BROKER_TOKEN }}
```

### Can-I-Deploy Workflow

```
+------------------------------------------------------------------+
|                    CAN-I-DEPLOY WORKFLOW                          |
|                                                                   |
|  Before deploying a service version, verify:                      |
|                                                                   |
|  1. All consumer contracts are satisfied                          |
|     +---------------+     +-----------------+                     |
|     | OrderService  |---->| Pact Broker     |                     |
|     | v1.2.3        |     | Verification DB |                     |
|     +---------------+     +-----------------+                     |
|                                  |                                |
|                                  v                                |
|  2. Provider can fulfill all consumer expectations                |
|     +-----------------+                                           |
|     | AuthService     |  Verified against:                        |
|     | production      |  - OrderService v1.2.3 (pending deploy)   |
|     +-----------------+  - PaymentService v2.0.1 (production)     |
|                         - NotificationService v1.5.0 (production) |
|                                                                   |
|  3. Decision Matrix:                                              |
|                                                                   |
|     Consumer    Provider    Status      Can Deploy?               |
|     v1.2.3      prod        VERIFIED    YES                       |
|     v1.2.3      prod        FAILED      NO - fix contract         |
|     v1.2.3      prod        UNKNOWN     NO - run verification     |
|                                                                   |
+------------------------------------------------------------------+
```

## Best Practices

### Contract Design Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| **Postel's Law** | Be conservative in what you send, liberal in what you accept | Accept extra fields, only require minimum |
| **Versioning** | Version contracts to allow evolution | `/api/v1/users`, `Accept: application/vnd.api+json;version=1` |
| **Backward Compatibility** | New versions should not break existing consumers | Add fields, don't remove or rename |
| **Minimal Contracts** | Only specify what you actually need | Don't match entire response if you only use 2 fields |

### Consumer Contract Best Practices

```typescript
// DO: Only specify what you actually use
provider
  .uponReceiving('a request for user')
  .willRespondWith({
    status: 200,
    body: {
      // Only match fields the consumer actually uses
      id: like('usr-123'),
      email: like('user@example.com'),
      // Don't match fields you ignore
    },
  });

// DON'T: Over-specify the contract
provider
  .uponReceiving('a request for user')
  .willRespondWith({
    status: 200,
    body: {
      // Matching every field creates brittle contracts
      id: 'usr-123',
      email: 'user@example.com',
      name: 'John Doe',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lastLoginAt: '2024-01-15T10:30:00Z',
      preferences: { theme: 'dark', language: 'en' },
      // etc...
    },
  });
```

### Provider State Management

```typescript
// Good: Clear, specific state names
stateHandlers: {
  'user usr-123 exists with role admin': async () => {
    await db.users.create({
      id: 'usr-123',
      roles: ['admin'],
    });
  },

  'user usr-123 has 3 orders': async () => {
    await db.users.create({ id: 'usr-123' });
    await db.orders.createMany([
      { userId: 'usr-123', status: 'completed' },
      { userId: 'usr-123', status: 'pending' },
      { userId: 'usr-123', status: 'shipped' },
    ]);
  },

  'no users exist': async () => {
    await db.users.deleteAll();
  },
}

// Bad: Vague state names
stateHandlers: {
  'user exists': async () => { /* Which user? What properties? */ },
  'data is set up': async () => { /* What data? */ },
}
```

### Contract Versioning Strategy

```typescript
// Version in URL path
/api/v1/users
/api/v2/users

// Version in header
Accept: application/vnd.myapi.v1+json
Accept: application/vnd.myapi.v2+json

// Version in query parameter
/users?version=1
/users?version=2

// Recommended: URL path for major versions, header for minor
```

### Breaking vs Non-Breaking Changes

| Change Type | Breaking? | Example |
|-------------|-----------|---------|
| Add optional field | No | Add `middleName?: string` |
| Add required field | Yes | Add `phoneNumber: string` |
| Remove field | Yes | Remove `legacyId` |
| Rename field | Yes | `userName` -> `username` |
| Change field type | Yes | `age: string` -> `age: number` |
| Add enum value | Maybe | Add new status value |
| Remove enum value | Yes | Remove status value |
| Change URL | Yes | `/users` -> `/accounts` |
| Add optional query param | No | Add `?includeDeleted=true` |
| Add required query param | Yes | Require `?tenantId=xxx` |

### Handling Breaking Changes

```typescript
// Step 1: Add new field alongside old (backward compatible)
{
  userName: 'johndoe',     // Deprecated
  username: 'johndoe',     // New
}

// Step 2: Update all consumers to use new field

// Step 3: Mark old field as deprecated in docs

// Step 4: After all consumers migrated, remove old field in next major version
```

## Troubleshooting

### Common Contract Failures

| Failure | Cause | Solution |
|---------|-------|----------|
| `Missing provider state` | State handler not defined | Add state handler for the state |
| `Response body mismatch` | Response structure changed | Update consumer expectations or fix provider |
| `Status code mismatch` | Different error handling | Align on error status codes |
| `Header mismatch` | Missing or different headers | Add required headers in provider |
| `No matching interaction` | Request doesn't match contract | Check URL, method, headers, body |

### Debugging Contract Failures

```typescript
// Enable verbose logging
const verifier = new Verifier({
  logLevel: 'debug',
  // ...
});

// Print request/response details
provider
  .uponReceiving('a request')
  .withRequest({
    method: 'POST',
    path: '/test',
  })
  // Add request logging
  .willRespondWith({
    status: 200,
  });

// Use Pact Broker's comparison UI
// Navigate to: {PACT_BROKER_URL}/pacts/provider/{PROVIDER}/consumer/{CONSUMER}/latest
```

### Flaky Contract Tests

```typescript
// Problem: Time-sensitive values
body: {
  createdAt: '2024-01-15T10:30:00Z', // Exact match fails
}

// Solution: Use matchers
body: {
  createdAt: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'"),
}

// Problem: Random IDs
body: {
  id: 'abc-123', // Exact value
}

// Solution: Use type matcher
body: {
  id: like('abc-123'), // Matches any string
}

// Problem: Order-dependent arrays
body: {
  items: [
    { id: '1', name: 'First' },
    { id: '2', name: 'Second' },
  ],
}

// Solution: Use eachLike for unordered
body: {
  items: eachLike({ id: like('1'), name: like('First') }),
}
```

## Examples

### Complete Contract Test Suite

```typescript
// consumer/tests/contracts/payment-service.contract.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const { like, eachLike, decimal, uuid, datetime } = MatchersV3;

describe('Payment Service Contract', () => {
  const provider = new PactV3({
    consumer: 'OrderService',
    provider: 'PaymentService',
    dir: './pacts',
  });

  describe('Create Payment Intent', () => {
    it('creates payment intent for order', async () => {
      provider
        .given('merchant account is active')
        .uponReceiving('a request to create payment intent')
        .withRequest({
          method: 'POST',
          path: '/payment-intents',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': like('Bearer sk_test_xxx'),
            'Idempotency-Key': uuid(),
          },
          body: {
            amount: decimal(9999),
            currency: 'usd',
            orderId: like('ord-123'),
            customerId: like('cus-123'),
            metadata: {
              orderNumber: like('ORD-2024-001'),
            },
          },
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            id: like('pi_1234567890'),
            status: 'requires_payment_method',
            amount: decimal(9999),
            currency: 'usd',
            clientSecret: like('pi_xxx_secret_yyy'),
            createdAt: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'"),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const client = new PaymentServiceClient(mockServer.url, 'sk_test_xxx');

        const result = await client.createPaymentIntent({
          amount: 99.99,
          currency: 'usd',
          orderId: 'ord-123',
          customerId: 'cus-123',
          metadata: { orderNumber: 'ORD-2024-001' },
        });

        expect(result.id).toMatch(/^pi_/);
        expect(result.status).toBe('requires_payment_method');
        expect(result.clientSecret).toBeDefined();
      });
    });

    it('handles duplicate idempotency key', async () => {
      provider
        .given('payment intent pi_existing exists with idempotency key idem-123')
        .uponReceiving('a duplicate request with same idempotency key')
        .withRequest({
          method: 'POST',
          path: '/payment-intents',
          headers: {
            'Idempotency-Key': 'idem-123',
          },
          body: like({
            amount: 9999,
            currency: 'usd',
          }),
        })
        .willRespondWith({
          status: 200,
          body: {
            id: 'pi_existing',
            // Returns the existing payment intent
          },
        });

      await provider.executeTest(async (mockServer) => {
        const client = new PaymentServiceClient(mockServer.url, 'sk_test_xxx');

        const result = await client.createPaymentIntent(
          { amount: 99.99, currency: 'usd' },
          { idempotencyKey: 'idem-123' }
        );

        expect(result.id).toBe('pi_existing');
      });
    });
  });

  describe('Capture Payment', () => {
    it('captures authorized payment', async () => {
      provider
        .given('payment intent pi_authorized is authorized for $99.99')
        .uponReceiving('a request to capture payment')
        .withRequest({
          method: 'POST',
          path: '/payment-intents/pi_authorized/capture',
          body: {
            amountToCapture: decimal(9999),
          },
        })
        .willRespondWith({
          status: 200,
          body: {
            id: 'pi_authorized',
            status: 'succeeded',
            amountCaptured: decimal(9999),
            capturedAt: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'"),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const client = new PaymentServiceClient(mockServer.url, 'sk_test_xxx');

        const result = await client.capturePayment('pi_authorized', 99.99);

        expect(result.status).toBe('succeeded');
        expect(result.amountCaptured).toBe(99.99);
      });
    });

    it('fails to capture already captured payment', async () => {
      provider
        .given('payment intent pi_captured is already captured')
        .uponReceiving('a request to capture already captured payment')
        .withRequest({
          method: 'POST',
          path: '/payment-intents/pi_captured/capture',
        })
        .willRespondWith({
          status: 400,
          body: {
            error: {
              code: 'ALREADY_CAPTURED',
              message: like('Payment has already been captured'),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const client = new PaymentServiceClient(mockServer.url, 'sk_test_xxx');

        await expect(client.capturePayment('pi_captured'))
          .rejects
          .toMatchObject({
            code: 'ALREADY_CAPTURED',
          });
      });
    });
  });

  describe('Refund Payment', () => {
    it('creates full refund', async () => {
      provider
        .given('payment intent pi_captured has $99.99 captured')
        .uponReceiving('a request to refund full amount')
        .withRequest({
          method: 'POST',
          path: '/payment-intents/pi_captured/refund',
          body: {
            amount: decimal(9999),
            reason: 'customer_request',
          },
        })
        .willRespondWith({
          status: 201,
          body: {
            id: like('re_123'),
            paymentIntentId: 'pi_captured',
            amount: decimal(9999),
            status: 'succeeded',
            reason: 'customer_request',
            createdAt: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'"),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const client = new PaymentServiceClient(mockServer.url, 'sk_test_xxx');

        const refund = await client.refundPayment('pi_captured', {
          amount: 99.99,
          reason: 'customer_request',
        });

        expect(refund.status).toBe('succeeded');
        expect(refund.amount).toBe(99.99);
      });
    });

    it('handles refund exceeding captured amount', async () => {
      provider
        .given('payment intent pi_small has $10.00 captured')
        .uponReceiving('a request to refund more than captured')
        .withRequest({
          method: 'POST',
          path: '/payment-intents/pi_small/refund',
          body: {
            amount: decimal(9999), // $99.99 > $10.00
          },
        })
        .willRespondWith({
          status: 400,
          body: {
            error: {
              code: 'REFUND_EXCEEDS_CAPTURED',
              message: like('Refund amount exceeds captured amount'),
              maxRefundable: decimal(1000),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const client = new PaymentServiceClient(mockServer.url, 'sk_test_xxx');

        try {
          await client.refundPayment('pi_small', { amount: 99.99 });
          fail('Should have thrown');
        } catch (error) {
          expect(error.code).toBe('REFUND_EXCEEDS_CAPTURED');
          expect(error.maxRefundable).toBe(10.00);
        }
      });
    });
  });
});
```

## See Also

- `scenario-templates.md` - Test scenario templates
- `test-environment-setup.md` - Environment configuration
- `test-patterns.md` - Common integration test patterns
