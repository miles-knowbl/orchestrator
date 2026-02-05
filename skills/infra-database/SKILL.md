---
name: infra-database
description: "Set up database schema, ORM configuration, migrations, and data access layer with connection pooling and seed data."
phase: IMPLEMENT
category: engineering
version: "1.0.0"
depends_on: ["infra-devenv", "scaffold"]
tags: [infrastructure, database, orm, schema, migrations]
---

# Infra Database

Set up database schema and data access layer.

## When to Use

- **New project with persistence** — Setting up the database from scratch
- **Adding a database** — Existing project needs data persistence
- **Schema redesign** — Major changes to data model
- When you say: "set up database", "add persistence", "create schema"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Schema definition | `src/db/schema.ts` or equivalent | Always |
| Migration files | `drizzle/` or `prisma/migrations/` | Always |
| DB initialization | `src/db/index.ts` | Always |

## Core Concept

Database setup answers: **"How does the application persist and retrieve data reliably?"**

```
Schema Definition → Migration Generation → Connection Pool → Repository Layer → Application
```

## ORM Selection

| ORM | Best For | Tradeoffs |
|-----|----------|-----------|
| **Drizzle** | TypeScript-first, lightweight | Newer, smaller ecosystem |
| **Prisma** | Rapid development, schema-first | Heavier runtime, query engine binary |
| **Knex** | SQL-close, flexible | More manual, less type safety |
| **None (pg/mysql2)** | Maximum control | All manual, no migrations |

## Drizzle Setup Pattern

```typescript
// src/db/schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

## Migration Workflow

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Push schema directly (dev only)
npx drizzle-kit push
```

## Connection Pooling

Always use connection pooling in production:

| Setting | Development | Production |
|---------|-------------|------------|
| Pool size | 5 | 20 |
| Idle timeout | 30s | 10s |
| Connection timeout | 5s | 3s |

## Seed Data

```typescript
// src/db/seed.ts
import { db } from './index';
import { users } from './schema';

async function seed() {
  await db.insert(users).values([
    { email: 'admin@example.com', name: 'Admin' },
  ]);
}

seed().then(() => process.exit(0));
```

## Checklist

- [ ] Schema defined with proper types and constraints
- [ ] Migrations generated and tested
- [ ] Connection pooling configured
- [ ] Environment variable for DATABASE_URL
- [ ] Seed data for development
- [ ] Indexes on frequently queried columns

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `infra-devenv` | Dev environment must include database setup |
| `infra-services` | Services consume the database layer |
| `scaffold` | Project structure includes db directory |
| `deploy` | Migrations must run safely in production |

## Key Principles

**Schema is code.** Version-controlled, reviewed, tested like any other code.

**Migrations are forward-only.** Never edit applied migrations; create new ones.

**Pool connections.** Never create a new connection per request.

**Seed for development.** Realistic seed data makes development faster.
