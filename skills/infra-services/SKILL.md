---
name: infra-services
description: "Configure service layer with lazy singleton initialization, dependency management, and lifecycle hooks."
phase: IMPLEMENT
category: infra
version: "1.0.0"
depends_on: ["infra-database", "scaffold"]
tags: [infrastructure, services, dependency-injection, singletons, initialization]
---

# Infra Services

Configure the service layer with proper initialization and dependency management.

## When to Use

- **New backend** — Setting up the service architecture from scratch
- **Service layer refactor** — Moving from ad-hoc to structured services
- **Adding dependencies** — Connecting database, cache, external APIs
- When you say: "set up services", "service layer", "dependency injection"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Service definitions | `src/services/` | Always |
| Service initialization | `src/services/index.ts` | Always |

## Core Concept

Service setup answers: **"How do application components get initialized, connected, and managed?"**

```
App Start → Initialize Services (lazy) → Register Dependencies → Ready to Serve
```

## Lazy Singleton Pattern

```typescript
// src/services/index.ts
let _db: Database | null = null;
let _cache: Cache | null = null;

export function getDatabase(): Database {
  if (!_db) {
    _db = new Database(process.env.DATABASE_URL!);
  }
  return _db;
}

export function getCache(): Cache {
  if (!_cache) {
    _cache = new Cache(process.env.REDIS_URL!);
  }
  return _cache;
}
```

## Service Registry Pattern

```typescript
// src/services/registry.ts
interface ServiceRegistry {
  db: Database;
  cache: Cache;
  mailer: Mailer;
}

const registry: Partial<ServiceRegistry> = {};

export function register<K extends keyof ServiceRegistry>(
  name: K,
  service: ServiceRegistry[K]
): void {
  registry[name] = service;
}

export function resolve<K extends keyof ServiceRegistry>(
  name: K
): ServiceRegistry[K] {
  const service = registry[name];
  if (!service) throw new Error(`Service not registered: ${name}`);
  return service;
}
```

## Initialization Order

Services often have dependencies. Initialize in dependency order:

```
1. Configuration (env vars, config files)
2. Database connections
3. Cache connections
4. External API clients
5. Business services (depend on above)
6. HTTP server (depends on everything)
```

## Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await server.close();
  await db.end();
  await cache.quit();
  process.exit(0);
});
```

## Checklist

- [ ] Services initialized lazily (not at import time)
- [ ] Dependency order documented and enforced
- [ ] Graceful shutdown handles all connections
- [ ] Health check verifies all critical services
- [ ] Environment variables validated at startup

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `infra-database` | Database is a core service dependency |
| `scaffold` | Project structure includes services directory |
| `implement` | Business logic builds on the service layer |
| `deploy` | Graceful shutdown required for zero-downtime deploys |

## Key Principles

**Lazy initialization.** Don't connect until needed; fail fast when connection fails.

**Explicit dependencies.** No hidden globals; services declare what they need.

**Graceful shutdown.** Always clean up connections on process exit.

**Health checks.** Every service should be verifiable at runtime.
