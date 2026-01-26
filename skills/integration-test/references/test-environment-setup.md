# Test Environment Setup

Comprehensive guide for configuring integration test environments across different deployment scenarios.

## Purpose

This reference provides patterns and procedures for setting up reliable, reproducible integration test environments. Use this when:

- Setting up local development testing
- Configuring CI/CD pipeline test stages
- Creating isolated test environments
- Managing test dependencies and services
- Troubleshooting environment issues

## Core Concepts

### Environment Isolation Levels

Integration tests require careful isolation to ensure reliability and prevent cross-test contamination.

```
+------------------------------------------------------------------+
|                    ISOLATION LEVELS                               |
|                                                                   |
|  Level 1: Process Isolation                                       |
|  +------------------+  +------------------+                       |
|  | Test Process A   |  | Test Process B   |                       |
|  | - Shared DB      |  | - Shared DB      |                       |
|  | - Shared Services|  | - Shared Services|                       |
|  +------------------+  +------------------+                       |
|  Fast but risk of interference                                    |
|                                                                   |
|  Level 2: Database Isolation                                      |
|  +------------------+  +------------------+                       |
|  | Test Suite A     |  | Test Suite B     |                       |
|  | - Own Schema     |  | - Own Schema     |                       |
|  | - Shared Services|  | - Shared Services|                       |
|  +------------------+  +------------------+                       |
|  Balanced isolation and speed                                     |
|                                                                   |
|  Level 3: Container Isolation                                     |
|  +------------------+  +------------------+                       |
|  | Container Set A  |  | Container Set B  |                       |
|  | - Own DB         |  | - Own DB         |                       |
|  | - Own Services   |  | - Own Services   |                       |
|  +------------------+  +------------------+                       |
|  Full isolation, slower startup                                   |
|                                                                   |
+------------------------------------------------------------------+
```

### Test Environment Components

| Component | Purpose | Options |
|-----------|---------|---------|
| **Database** | Persistent storage | PostgreSQL, MySQL, MongoDB, In-memory |
| **Cache** | Fast data access | Redis, Memcached, In-memory |
| **Message Broker** | Async communication | Kafka, RabbitMQ, In-memory |
| **External Services** | Third-party APIs | Mocks, Stubs, Sandboxes |
| **Identity Provider** | Authentication | Mock IdP, Test accounts |
| **File Storage** | Binary data | Local FS, MinIO, Mock S3 |

## Docker Compose Setup

### Basic Configuration

```yaml
# docker-compose.test.yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: test-postgres
    ports:
      - "5433:5432"  # Use non-standard port to avoid conflicts
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test_db
    volumes:
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test -d test_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: test-redis
    ports:
      - "6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Kafka Message Broker
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    container_name: test-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "2181"]
      interval: 10s
      timeout: 5s
      retries: 5

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    container_name: test-kafka
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "9093:9093"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9093"]
      interval: 10s
      timeout: 10s
      retries: 5

  # MinIO S3-Compatible Storage
  minio:
    image: minio/minio:latest
    container_name: test-minio
    ports:
      - "9001:9000"
      - "9002:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Application Under Test
  app:
    build:
      context: .
      dockerfile: Dockerfile.test
    container_name: test-app
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      kafka:
        condition: service_healthy
    ports:
      - "3001:3000"
    environment:
      NODE_ENV: test
      DATABASE_URL: postgres://test:test@postgres:5432/test_db
      REDIS_URL: redis://redis:6379
      KAFKA_BROKERS: kafka:29092
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: minioadmin
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 10

networks:
  default:
    name: integration-test-network
```

### Multi-Service Configuration

```yaml
# docker-compose.microservices.test.yaml
version: '3.8'

services:
  # Infrastructure Services
  postgres:
    extends:
      file: docker-compose.test.yaml
      service: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    extends:
      file: docker-compose.test.yaml
      service: redis

  kafka:
    extends:
      file: docker-compose.test.yaml
      service: kafka
    depends_on:
      - zookeeper

  zookeeper:
    extends:
      file: docker-compose.test.yaml
      service: zookeeper

  # Application Services
  auth-service:
    build:
      context: ./services/auth
      dockerfile: Dockerfile
    container_name: test-auth-service
    ports:
      - "3010:3000"
    environment:
      DATABASE_URL: postgres://test:test@postgres:5432/auth_db
      JWT_SECRET: test-jwt-secret-key-for-testing
      JWT_EXPIRY: 3600
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  user-service:
    build:
      context: ./services/user
      dockerfile: Dockerfile
    container_name: test-user-service
    ports:
      - "3011:3000"
    environment:
      DATABASE_URL: postgres://test:test@postgres:5432/user_db
      AUTH_SERVICE_URL: http://auth-service:3000
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  order-service:
    build:
      context: ./services/order
      dockerfile: Dockerfile
    container_name: test-order-service
    ports:
      - "3012:3000"
    environment:
      DATABASE_URL: postgres://test:test@postgres:5432/order_db
      AUTH_SERVICE_URL: http://auth-service:3000
      USER_SERVICE_URL: http://user-service:3000
      KAFKA_BROKERS: kafka:29092
    depends_on:
      postgres:
        condition: service_healthy
      kafka:
        condition: service_healthy
      auth-service:
        condition: service_healthy
      user-service:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  notification-service:
    build:
      context: ./services/notification
      dockerfile: Dockerfile
    container_name: test-notification-service
    ports:
      - "3013:3000"
    environment:
      KAFKA_BROKERS: kafka:29092
      REDIS_URL: redis://redis:6379
      SMTP_HOST: mailhog
      SMTP_PORT: 1025
    depends_on:
      kafka:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Test Utilities
  mailhog:
    image: mailhog/mailhog
    container_name: test-mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  postgres-data:

networks:
  default:
    name: microservices-test-network
```

## Database Setup Patterns

### Schema Initialization

```sql
-- scripts/init-db.sql

-- Create separate databases for each service
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE order_db;

-- Create test user with full privileges
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO test_user;
GRANT ALL PRIVILEGES ON DATABASE user_db TO test_user;
GRANT ALL PRIVILEGES ON DATABASE order_db TO test_user;

-- Connect to each database and create schemas
\c auth_db;
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO test_user;

\c user_db;
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO test_user;

\c order_db;
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO test_user;
```

### Test Database Utilities

```typescript
// test/utils/database.ts
import { Pool, PoolClient } from 'pg';

export interface TestDatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class TestDatabase {
  private pool: Pool;
  private client: PoolClient | null = null;

  constructor(config: TestDatabaseConfig) {
    this.pool = new Pool(config);
  }

  /**
   * Begin a transaction that will be rolled back after test
   * Provides test isolation without database cleanup
   */
  async beginTransaction(): Promise<PoolClient> {
    this.client = await this.pool.connect();
    await this.client.query('BEGIN');
    return this.client;
  }

  /**
   * Rollback transaction to restore database state
   */
  async rollbackTransaction(): Promise<void> {
    if (this.client) {
      await this.client.query('ROLLBACK');
      this.client.release();
      this.client = null;
    }
  }

  /**
   * Truncate all tables in specified schema
   * Use for complete data reset between test suites
   */
  async truncateAllTables(schema: string = 'public'): Promise<void> {
    const result = await this.pool.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = $1
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE '_prisma_%'
    `, [schema]);

    const tables = result.rows.map(row => row.tablename);

    if (tables.length > 0) {
      await this.pool.query(`
        TRUNCATE TABLE ${tables.map(t => `"${schema}"."${t}"`).join(', ')}
        RESTART IDENTITY CASCADE
      `);
    }
  }

  /**
   * Seed database with test data
   */
  async seed(seedData: Record<string, any[]>): Promise<void> {
    for (const [table, rows] of Object.entries(seedData)) {
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await this.pool.query(`
          INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `, values);
      }
    }
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Usage in tests
export const testDb = new TestDatabase({
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5433'),
  user: process.env.TEST_DB_USER || 'test',
  password: process.env.TEST_DB_PASSWORD || 'test',
  database: process.env.TEST_DB_NAME || 'test_db',
});
```

### Database Isolation Strategies

| Strategy | Speed | Isolation | Complexity | Use Case |
|----------|-------|-----------|------------|----------|
| **Transaction Rollback** | Fast | High | Low | Unit-like integration tests |
| **Table Truncation** | Medium | High | Low | Suite-level cleanup |
| **Schema Per Test** | Slow | Complete | Medium | Parallel test execution |
| **Database Per Test** | Slowest | Complete | High | Complex state scenarios |

```typescript
// test/utils/isolation-strategies.ts

/**
 * Transaction-based isolation (fastest)
 */
export function withTransactionIsolation(
  db: TestDatabase
): jest.Lifecycle {
  return {
    beforeEach: async () => {
      await db.beginTransaction();
    },
    afterEach: async () => {
      await db.rollbackTransaction();
    },
  };
}

/**
 * Truncation-based isolation (moderate speed)
 */
export function withTruncationIsolation(
  db: TestDatabase,
  tables: string[]
): jest.Lifecycle {
  return {
    beforeEach: async () => {
      // No-op before each
    },
    afterEach: async () => {
      await db.truncateAllTables();
    },
  };
}

/**
 * Schema-based isolation (supports parallelism)
 */
export function withSchemaIsolation(
  db: TestDatabase,
  schemaPrefix: string
): jest.Lifecycle {
  const schemaName = `${schemaPrefix}_${process.pid}`;

  return {
    beforeAll: async () => {
      await db.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      await db.query(`SET search_path TO "${schemaName}"`);
    },
    afterAll: async () => {
      await db.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    },
  };
}
```

## Test Data Management

### Fixture Loading System

```typescript
// test/fixtures/loader.ts
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface Fixture {
  name: string;
  table: string;
  data: Record<string, any>[];
  dependencies?: string[];
}

export class FixtureLoader {
  private fixturesDir: string;
  private loadedFixtures: Map<string, Fixture> = new Map();

  constructor(fixturesDir: string) {
    this.fixturesDir = fixturesDir;
  }

  /**
   * Load fixture from YAML file
   */
  loadFixture(name: string): Fixture {
    if (this.loadedFixtures.has(name)) {
      return this.loadedFixtures.get(name)!;
    }

    const filePath = path.join(this.fixturesDir, `${name}.yaml`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const fixture = yaml.load(content) as Fixture;

    this.loadedFixtures.set(name, fixture);
    return fixture;
  }

  /**
   * Load fixture and all its dependencies in correct order
   */
  loadWithDependencies(name: string): Fixture[] {
    const fixture = this.loadFixture(name);
    const result: Fixture[] = [];

    // Load dependencies first (recursively)
    if (fixture.dependencies) {
      for (const dep of fixture.dependencies) {
        result.push(...this.loadWithDependencies(dep));
      }
    }

    // Add current fixture if not already loaded
    if (!result.find(f => f.name === fixture.name)) {
      result.push(fixture);
    }

    return result;
  }

  /**
   * Apply fixtures to database
   */
  async applyFixtures(
    db: TestDatabase,
    fixtures: Fixture[]
  ): Promise<void> {
    for (const fixture of fixtures) {
      await db.seed({ [fixture.table]: fixture.data });
    }
  }
}

// Example fixture file: test/fixtures/users.yaml
/*
name: users
table: users
data:
  - id: "usr-001"
    email: "admin@test.com"
    role: "admin"
    created_at: "2024-01-01T00:00:00Z"
  - id: "usr-002"
    email: "user@test.com"
    role: "user"
    created_at: "2024-01-01T00:00:00Z"
*/

// Example fixture file: test/fixtures/orders.yaml
/*
name: orders
table: orders
dependencies:
  - users
data:
  - id: "ord-001"
    user_id: "usr-002"
    status: "pending"
    total: 100.00
    created_at: "2024-01-15T10:00:00Z"
*/
```

### Factory Pattern for Test Data

```typescript
// test/factories/index.ts
import { faker } from '@faker-js/faker';

// Base factory interface
interface Factory<T> {
  build(overrides?: Partial<T>): T;
  buildMany(count: number, overrides?: Partial<T>): T[];
  create(overrides?: Partial<T>): Promise<T>;
  createMany(count: number, overrides?: Partial<T>): Promise<T[]>;
}

// User factory
export const userFactory: Factory<User> = {
  build(overrides = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  buildMany(count, overrides = {}) {
    return Array.from({ length: count }, () => this.build(overrides));
  },

  async create(overrides = {}) {
    const user = this.build(overrides);
    await db.query(`
      INSERT INTO users (id, email, name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [user.id, user.email, user.name, user.role, user.createdAt, user.updatedAt]);
    return user;
  },

  async createMany(count, overrides = {}) {
    const users = this.buildMany(count, overrides);
    for (const user of users) {
      await this.create(user);
    }
    return users;
  },
};

// Order factory with relationships
export const orderFactory: Factory<Order> = {
  build(overrides = {}) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      status: 'pending',
      items: [],
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  buildMany(count, overrides = {}) {
    return Array.from({ length: count }, () => this.build(overrides));
  },

  async create(overrides = {}) {
    // Create user if not provided
    let userId = overrides.userId;
    if (!userId) {
      const user = await userFactory.create();
      userId = user.id;
    }

    const order = this.build({ ...overrides, userId });
    await db.query(`
      INSERT INTO orders (id, user_id, status, items, total, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [order.id, order.userId, order.status, JSON.stringify(order.items),
        order.total, order.createdAt, order.updatedAt]);
    return order;
  },

  async createMany(count, overrides = {}) {
    const orders = [];
    for (let i = 0; i < count; i++) {
      orders.push(await this.create(overrides));
    }
    return orders;
  },
};
```

## Service Mocking

### WireMock Configuration

```yaml
# wiremock/mappings/auth-service.json
{
  "request": {
    "method": "POST",
    "url": "/auth/verify"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "valid": true,
      "userId": "{{randomValue type='UUID'}}",
      "expiresAt": "{{now offset='1 hour' format='yyyy-MM-dd HH:mm:ss'}}"
    },
    "transformers": ["response-template"]
  }
}
```

```yaml
# docker-compose with WireMock
services:
  wiremock:
    image: wiremock/wiremock:3.0.0
    container_name: test-wiremock
    ports:
      - "8080:8080"
    volumes:
      - ./wiremock:/home/wiremock
    command: ["--verbose", "--global-response-templating"]
```

### HTTP Mock Server (Node.js)

```typescript
// test/mocks/http-mock-server.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import { Server } from 'http';

export interface MockEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: (req: Request, res: Response) => void;
  latency?: number;
}

export class HttpMockServer {
  private app: Express;
  private server: Server | null = null;
  private endpoints: Map<string, MockEndpoint> = new Map();
  private requestLog: Array<{ method: string; path: string; body: any; headers: any }> = [];

  constructor(private port: number = 9999) {
    this.app = express();
    this.app.use(express.json());
    this.app.use(this.logRequest.bind(this));
    this.app.use(this.routeHandler.bind(this));
  }

  private logRequest(req: Request, _res: Response, next: NextFunction): void {
    this.requestLog.push({
      method: req.method,
      path: req.path,
      body: req.body,
      headers: req.headers,
    });
    next();
  }

  private routeHandler(req: Request, res: Response): void {
    const key = `${req.method}:${req.path}`;
    const endpoint = this.endpoints.get(key);

    if (endpoint) {
      if (endpoint.latency) {
        setTimeout(() => endpoint.handler(req, res), endpoint.latency);
      } else {
        endpoint.handler(req, res);
      }
    } else {
      res.status(404).json({ error: 'Mock endpoint not configured' });
    }
  }

  /**
   * Register a mock endpoint
   */
  mock(endpoint: MockEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}`;
    this.endpoints.set(key, endpoint);
  }

  /**
   * Set latency for simulating slow responses
   */
  setLatency(method: string, path: string, latencyMs: number): void {
    const key = `${method}:${path}`;
    const endpoint = this.endpoints.get(key);
    if (endpoint) {
      endpoint.latency = latencyMs;
    }
  }

  /**
   * Get all requests made to a specific endpoint
   */
  getRequests(method?: string, path?: string): typeof this.requestLog {
    return this.requestLog.filter(r =>
      (!method || r.method === method) && (!path || r.path === path)
    );
  }

  /**
   * Clear request log and reset endpoints
   */
  reset(): void {
    this.requestLog = [];
  }

  /**
   * Start the mock server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`Mock server running on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Stop the mock server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Usage example
const mockAuthService = new HttpMockServer(3010);

mockAuthService.mock({
  method: 'POST',
  path: '/auth/verify',
  handler: (req, res) => {
    const { token } = req.body;
    if (token === 'valid-token') {
      res.json({ valid: true, userId: 'user-123' });
    } else if (token === 'expired-token') {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  },
});
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/integration-tests.yaml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run db:migrate:test
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/test_db

      - name: Seed test data
        run: npm run db:seed:test
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/test_db

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          NODE_ENV: test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-results
          path: test-results/
          retention-days: 7
```

### Docker-in-Docker Setup for Complex Tests

```yaml
# .github/workflows/e2e-tests.yaml
name: E2E Tests

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Run nightly

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Start test environment
        run: |
          docker compose -f docker-compose.test.yaml up -d --build
          docker compose -f docker-compose.test.yaml logs -f &

          # Wait for services to be healthy
          ./scripts/wait-for-services.sh

      - name: Run E2E tests
        run: |
          docker compose -f docker-compose.test.yaml exec -T app \
            npm run test:e2e

      - name: Collect logs on failure
        if: failure()
        run: |
          docker compose -f docker-compose.test.yaml logs > docker-logs.txt

      - name: Upload logs on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: docker-logs
          path: docker-logs.txt

      - name: Stop test environment
        if: always()
        run: docker compose -f docker-compose.test.yaml down -v
```

### Service Health Wait Script

```bash
#!/bin/bash
# scripts/wait-for-services.sh

set -e

MAX_RETRIES=30
RETRY_INTERVAL=2

wait_for_service() {
  local service_name=$1
  local health_url=$2
  local retries=0

  echo "Waiting for $service_name..."

  while [ $retries -lt $MAX_RETRIES ]; do
    if curl -sf "$health_url" > /dev/null 2>&1; then
      echo "$service_name is ready!"
      return 0
    fi

    retries=$((retries + 1))
    echo "  Attempt $retries/$MAX_RETRIES..."
    sleep $RETRY_INTERVAL
  done

  echo "ERROR: $service_name did not become ready in time"
  return 1
}

# Wait for all services
wait_for_service "PostgreSQL" "http://localhost:5432"
wait_for_service "Redis" "http://localhost:6379"
wait_for_service "Application" "http://localhost:3001/health"

echo "All services are ready!"
```

## Test Configuration

### Jest Integration Test Config

```javascript
// jest.integration.config.js
module.exports = {
  displayName: 'integration',
  testEnvironment: 'node',
  testMatch: ['**/*.integration.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup/integration.ts'],
  globalSetup: '<rootDir>/test/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/setup/global-teardown.ts',
  testTimeout: 30000,
  maxWorkers: 1,  // Run serially for database isolation
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
};
```

### Global Setup and Teardown

```typescript
// test/setup/global-setup.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalSetup(): Promise<void> {
  console.log('Starting test environment...');

  // Start Docker Compose if not in CI (CI has its own services)
  if (!process.env.CI) {
    await execAsync('docker compose -f docker-compose.test.yaml up -d');

    // Wait for services
    await waitForServices();
  }

  // Run migrations
  await execAsync('npm run db:migrate:test');

  console.log('Test environment ready!');
}

async function waitForServices(): Promise<void> {
  const maxRetries = 30;
  const retryInterval = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check database
      await execAsync('pg_isready -h localhost -p 5433 -U test');
      // Check Redis
      await execAsync('redis-cli -p 6380 ping');
      console.log('All services are ready');
      return;
    } catch {
      console.log(`Waiting for services... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }

  throw new Error('Services did not become ready in time');
}
```

```typescript
// test/setup/global-teardown.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalTeardown(): Promise<void> {
  console.log('Cleaning up test environment...');

  // Stop Docker Compose if not in CI
  if (!process.env.CI) {
    await execAsync('docker compose -f docker-compose.test.yaml down -v');
  }

  console.log('Test environment cleaned up!');
}
```

```typescript
// test/setup/integration.ts
import { testDb, TestDatabase } from '../utils/database';

beforeAll(async () => {
  await testDb.truncateAllTables();
});

afterEach(async () => {
  // Clear any mocks
  jest.clearAllMocks();
});

afterAll(async () => {
  await testDb.close();
});
```

## Troubleshooting Guide

### Common Issues and Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Port conflicts** | "Address already in use" | Use non-standard ports in test config |
| **Stale containers** | Tests see old data | Add `--force-recreate` to docker compose |
| **Slow startup** | Tests timeout waiting | Increase health check retries |
| **Database locks** | Tests hang | Use transaction rollback isolation |
| **Flaky tests** | Intermittent failures | Add proper waits, check race conditions |
| **Memory issues** | Container OOM | Limit test data, increase container memory |

### Debugging Commands

```bash
# View container logs
docker compose -f docker-compose.test.yaml logs -f

# Execute shell in container
docker compose -f docker-compose.test.yaml exec app sh

# Check container health
docker compose -f docker-compose.test.yaml ps

# View database contents
docker compose -f docker-compose.test.yaml exec postgres psql -U test -d test_db

# Clear all volumes and restart
docker compose -f docker-compose.test.yaml down -v
docker compose -f docker-compose.test.yaml up -d --force-recreate

# Check network connectivity
docker compose -f docker-compose.test.yaml exec app ping postgres
```

### Performance Optimization

| Optimization | Impact | Implementation |
|--------------|--------|----------------|
| **Parallel test suites** | 2-4x faster | Schema-per-worker isolation |
| **Cached base images** | Faster startup | Use CI image caching |
| **Volume mounts** | Faster rebuilds | Mount node_modules |
| **Health check tuning** | Faster readiness | Optimize check intervals |
| **Test data subset** | Faster seeding | Use minimal fixture sets |

## Examples

### Complete Integration Test Suite Setup

```typescript
// test/integration/orders.integration.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { testDb } from '../utils/database';
import { userFactory, orderFactory } from '../factories';
import { mockAuthService } from '../mocks/auth-service';

describe('Orders API Integration', () => {
  let testUser: User;
  let authToken: string;

  beforeAll(async () => {
    // Start mock auth service
    await mockAuthService.start();

    // Create test user
    testUser = await userFactory.create({ role: 'customer' });
    authToken = 'test-token-' + testUser.id;

    // Configure mock to accept our token
    mockAuthService.mock({
      method: 'POST',
      path: '/auth/verify',
      handler: (req, res) => {
        if (req.body.token === authToken) {
          res.json({ valid: true, userId: testUser.id });
        } else {
          res.status(401).json({ error: 'Invalid token' });
        }
      },
    });
  });

  afterAll(async () => {
    await mockAuthService.stop();
    await testDb.truncateAllTables();
  });

  beforeEach(async () => {
    await testDb.beginTransaction();
  });

  afterEach(async () => {
    await testDb.rollbackTransaction();
    mockAuthService.reset();
  });

  describe('POST /orders', () => {
    it('creates order with valid authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: 'prod-1', quantity: 2 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        userId: testUser.id,
        status: 'pending',
        items: expect.arrayContaining([
          expect.objectContaining({ productId: 'prod-1', quantity: 2 }),
        ]),
      });

      // Verify auth service was called
      const authRequests = mockAuthService.getRequests('POST', '/auth/verify');
      expect(authRequests).toHaveLength(1);
      expect(authRequests[0].body.token).toBe(authToken);
    });

    it('rejects request without authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] });

      expect(response.status).toBe(401);
    });

    it('handles auth service timeout gracefully', async () => {
      // Set high latency on auth service
      mockAuthService.setLatency('POST', '/auth/verify', 5000);

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ items: [{ productId: 'prod-1', quantity: 1 }] })
        .timeout(3000);

      expect(response.status).toBe(503);
      expect(response.body.error).toContain('Service unavailable');
    });
  });

  describe('GET /orders/:id', () => {
    let existingOrder: Order;

    beforeEach(async () => {
      existingOrder = await orderFactory.create({ userId: testUser.id });
    });

    it('returns order for authenticated owner', async () => {
      const response = await request(app)
        .get(`/orders/${existingOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(existingOrder.id);
    });

    it('returns 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/orders/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 403 when accessing other user order', async () => {
      const otherUser = await userFactory.create();
      const otherOrder = await orderFactory.create({ userId: otherUser.id });

      const response = await request(app)
        .get(`/orders/${otherOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});
```

## See Also

- `scenario-templates.md` - Test scenario templates
- `test-patterns.md` - Common integration test patterns
- `contract-testing.md` - Contract testing deep dive
