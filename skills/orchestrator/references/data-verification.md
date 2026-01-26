# Data Verification Reference

Ensuring data integrity across the application.

---

## Purpose

Data verification ensures:
1. **Schema completeness** — All required fields/tables exist
2. **CRUD operations work** — Create, Read, Update, Delete functional
3. **Validation enforced** — Bad data rejected at boundaries
4. **Data flows correctly** — Static and dynamic data populate properly

---

## Verification Categories (MECE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA VERIFICATION CATEGORIES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. SCHEMA VERIFICATION                                                     │
│     └── Tables, columns, types, constraints                                 │
│                                                                             │
│  2. SEED DATA VERIFICATION                                                  │
│     └── Initial data, test fixtures, demo data                              │
│                                                                             │
│  3. CRUD VERIFICATION                                                       │
│     └── Create, Read, Update, Delete operations                             │
│                                                                             │
│  4. VALIDATION VERIFICATION                                                 │
│     └── Input validation, type coercion, constraints                        │
│                                                                             │
│  5. RELATIONSHIP VERIFICATION                                               │
│     └── Foreign keys, joins, cascades                                       │
│                                                                             │
│  6. FLOW VERIFICATION                                                       │
│     └── Data through the system, state transitions                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Schema Verification

### Checks

| Check | How to Verify | Expected |
|-------|---------------|----------|
| Schema file exists | `ls prisma/schema.prisma` | File present |
| Schema valid | `npx prisma validate` | No errors |
| Migrations exist | `ls prisma/migrations/` | Migration folders |
| DB in sync | `npx prisma migrate status` | All applied |
| Types generated | `ls node_modules/.prisma/client` | Generated client |

### Schema Completeness Checklist

```
Schema Verification
═══════════════════

Models
  [ ] All required models defined
  [ ] Primary keys on all models
  [ ] Created/updated timestamps
  [ ] Soft delete if needed

Fields
  [ ] All required fields present
  [ ] Correct types (String, Int, etc.)
  [ ] Nullable fields marked optional
  [ ] Default values where appropriate

Relationships
  [ ] Foreign keys defined
  [ ] Relation fields present
  [ ] Cascade behavior specified

Indexes
  [ ] Primary key indexes (automatic)
  [ ] Foreign key indexes
  [ ] Query-specific indexes
  [ ] Unique constraints

Enums
  [ ] Status fields use enums
  [ ] Enum values comprehensive
```

### Schema Verification Script

```bash
#!/bin/bash
# verify-schema.sh

echo "Schema Verification"
echo "==================="

# Check schema exists
if [ -f "prisma/schema.prisma" ]; then
  echo "✓ Schema file exists"
else
  echo "✗ Schema file missing"
  exit 1
fi

# Validate schema
if npx prisma validate 2>/dev/null; then
  echo "✓ Schema is valid"
else
  echo "✗ Schema has errors"
  exit 1
fi

# Check migration status
if npx prisma migrate status 2>/dev/null | grep -q "applied"; then
  echo "✓ Migrations applied"
else
  echo "⚠ Check migration status"
fi

# Check generated client
if [ -d "node_modules/.prisma/client" ]; then
  echo "✓ Client generated"
else
  echo "⚠ Run prisma generate"
fi

echo "Done"
```

---

## 2. Seed Data Verification

### Checks

| Check | How to Verify | Expected |
|-------|---------------|----------|
| Seed script exists | `grep seed package.json` | Script defined |
| Seed runs | `npm run seed` | No errors |
| Data created | Query database | Expected rows |
| Idempotent | Run seed twice | No duplicates/errors |

### Seed Data Requirements

```javascript
// prisma/seed.ts - Example structure

async function main() {
  // 1. Clear existing data (dev only)
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create reference data
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', permissions: ['all'] }
  });

  // 3. Create test users
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      roleId: adminRole.id
    }
  });

  // 4. Create sample data
  await prisma.item.createMany({
    data: [
      { name: 'Item 1', userId: testUser.id },
      { name: 'Item 2', userId: testUser.id },
      { name: 'Item 3', userId: testUser.id },
    ]
  });

  console.log('Seed complete');
}
```

### Seed Verification Script

```bash
#!/bin/bash
# verify-seed.sh

echo "Seed Data Verification"
echo "======================"

# Run seed
if npm run seed 2>&1 | grep -q "Seed complete"; then
  echo "✓ Seed ran successfully"
else
  echo "✗ Seed failed"
  exit 1
fi

# Verify data exists (example queries)
USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM users" 2>/dev/null)
if [ "$USER_COUNT" -gt 0 ]; then
  echo "✓ Users created: $USER_COUNT"
else
  echo "✗ No users created"
fi

# Test idempotency
if npm run seed 2>&1 | grep -q "Seed complete"; then
  echo "✓ Seed is idempotent"
else
  echo "✗ Seed not idempotent"
fi

echo "Done"
```

---

## 3. CRUD Verification

### Verification Matrix

| Entity | Create | Read | Update | Delete | Test |
|--------|--------|------|--------|--------|------|
| User | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | `test:user` |
| Item | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | `test:item` |
| ... | | | | | |

### CRUD Test Template

```typescript
// tests/user.crud.test.ts

describe('User CRUD', () => {
  describe('Create', () => {
    it('creates a user with valid data', async () => {
      const user = await createUser({
        email: 'new@example.com',
        name: 'New User'
      });
      expect(user.id).toBeDefined();
      expect(user.email).toBe('new@example.com');
    });

    it('rejects invalid email', async () => {
      await expect(createUser({
        email: 'invalid',
        name: 'Test'
      })).rejects.toThrow();
    });
  });

  describe('Read', () => {
    it('reads a user by id', async () => {
      const user = await getUser(testUserId);
      expect(user).not.toBeNull();
    });

    it('returns null for non-existent id', async () => {
      const user = await getUser('non-existent');
      expect(user).toBeNull();
    });

    it('lists all users', async () => {
      const users = await listUsers();
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe('Update', () => {
    it('updates user name', async () => {
      const updated = await updateUser(testUserId, {
        name: 'Updated Name'
      });
      expect(updated.name).toBe('Updated Name');
    });

    it('rejects invalid update', async () => {
      await expect(updateUser(testUserId, {
        email: 'invalid'
      })).rejects.toThrow();
    });
  });

  describe('Delete', () => {
    it('deletes a user', async () => {
      await deleteUser(testUserId);
      const user = await getUser(testUserId);
      expect(user).toBeNull();
    });

    it('handles delete of non-existent gracefully', async () => {
      await expect(deleteUser('non-existent')).resolves.not.toThrow();
    });
  });
});
```

### API CRUD Verification

```bash
# Manual API testing

# Create
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test"}'

# Read
curl http://localhost:3000/api/users/1

# Read all
curl http://localhost:3000/api/users

# Update
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated"}'

# Delete
curl -X DELETE http://localhost:3000/api/users/1
```

---

## 4. Validation Verification

### Validation Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      VALIDATION LAYERS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CLIENT SIDE (UI)                                                           │
│  └── HTML5 validation, form libraries                                       │
│      • required, type="email", min, max                                     │
│      • Nice UX, but can be bypassed                                         │
│                                                                             │
│  API LAYER                                                                  │
│  └── Schema validation (Zod, Yup, Joi)                                      │
│      • Parse and validate all inputs                                        │
│      • Return clear error messages                                          │
│      • MUST validate here                                                   │
│                                                                             │
│  DATABASE LAYER                                                             │
│  └── Constraints, types, foreign keys                                       │
│      • Last line of defense                                                 │
│      • Catch anything that slipped through                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Validation Schema Example (Zod)

```typescript
// schemas/user.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name required').max(100, 'Name too long'),
  age: z.number().int().positive().optional(),
});

export const updateUserSchema = createUserSchema.partial();

// Usage in API
export async function POST(request: Request) {
  const body = await request.json();

  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return Response.json({
      error: 'Validation failed',
      details: result.error.issues
    }, { status: 400 });
  }

  const user = await createUser(result.data);
  return Response.json(user, { status: 201 });
}
```

### Validation Test Cases

```typescript
describe('User Validation', () => {
  describe('Email', () => {
    it('accepts valid email', () => {
      expect(createUserSchema.safeParse({
        email: 'valid@example.com',
        name: 'Test'
      }).success).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(createUserSchema.safeParse({
        email: 'invalid',
        name: 'Test'
      }).success).toBe(false);
    });

    it('rejects missing email', () => {
      expect(createUserSchema.safeParse({
        name: 'Test'
      }).success).toBe(false);
    });
  });

  describe('Name', () => {
    it('accepts valid name', () => {
      expect(createUserSchema.safeParse({
        email: 'test@example.com',
        name: 'Valid Name'
      }).success).toBe(true);
    });

    it('rejects empty name', () => {
      expect(createUserSchema.safeParse({
        email: 'test@example.com',
        name: ''
      }).success).toBe(false);
    });

    it('rejects name over 100 chars', () => {
      expect(createUserSchema.safeParse({
        email: 'test@example.com',
        name: 'a'.repeat(101)
      }).success).toBe(false);
    });
  });
});
```

---

## 5. Relationship Verification

### Checks

| Relationship | Type | Cascade | Test |
|--------------|------|---------|------|
| User → Items | 1:many | Delete items | Delete user, check items |
| Item → User | many:1 | Restrict | Delete user with items |
| ... | | | |

### Relationship Tests

```typescript
describe('Relationships', () => {
  describe('User → Items', () => {
    it('user has many items', async () => {
      const user = await getUserWithItems(userId);
      expect(user.items).toBeInstanceOf(Array);
    });

    it('deleting user cascades to items', async () => {
      const user = await createUserWithItems();
      const itemIds = user.items.map(i => i.id);

      await deleteUser(user.id);

      for (const itemId of itemIds) {
        const item = await getItem(itemId);
        expect(item).toBeNull();
      }
    });
  });

  describe('Foreign Key Integrity', () => {
    it('cannot create item with invalid userId', async () => {
      await expect(createItem({
        name: 'Test',
        userId: 'non-existent'
      })).rejects.toThrow();
    });
  });
});
```

---

## 6. Flow Verification

### Data Flow Checklist

```
Data Flow Verification
══════════════════════

User Registration Flow
  [ ] Form data validated client-side
  [ ] API validates and creates user
  [ ] Confirmation email sent (if applicable)
  [ ] User can log in
  [ ] User appears in admin list

Item Creation Flow
  [ ] User authenticated
  [ ] Form validates input
  [ ] Item created in database
  [ ] Item appears in user's list
  [ ] Item editable by owner
  [ ] Item deletable by owner

Data Display Flow
  [ ] Static data loads correctly
  [ ] Dynamic data fetches and displays
  [ ] Loading states shown during fetch
  [ ] Error states on failure
  [ ] Empty states when no data
```

### E2E Flow Tests

```typescript
// tests/e2e/user-flow.spec.ts

describe('User Registration Flow', () => {
  it('completes full registration flow', async () => {
    // 1. Visit registration page
    await page.goto('/register');

    // 2. Fill form
    await page.fill('[name="email"]', 'new@example.com');
    await page.fill('[name="name"]', 'New User');
    await page.fill('[name="password"]', 'securepassword');

    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // 5. Verify user data displayed
    await expect(page.locator('text=New User')).toBeVisible();

    // 6. Verify in database
    const user = await prisma.user.findUnique({
      where: { email: 'new@example.com' }
    });
    expect(user).not.toBeNull();
  });
});
```

---

## Integration Test Suite

### Complete Data Verification Suite

```typescript
// tests/data-verification.test.ts

describe('Data Verification Suite', () => {
  describe('1. Schema', () => {
    it('schema is valid', () => {
      // Run prisma validate
    });

    it('all migrations applied', () => {
      // Check migration status
    });
  });

  describe('2. Seed Data', () => {
    it('seed creates expected data', async () => {
      await seed();
      const users = await prisma.user.count();
      expect(users).toBeGreaterThan(0);
    });
  });

  describe('3. CRUD Operations', () => {
    // User CRUD
    // Item CRUD
    // etc.
  });

  describe('4. Validation', () => {
    // Schema validation tests
    // API validation tests
  });

  describe('5. Relationships', () => {
    // Relationship integrity tests
  });

  describe('6. Data Flows', () => {
    // End-to-end flow tests
  });
});
```

---

## Manual Spot-Check Procedure

For human verification:

```
Data Spot-Check Procedure
═════════════════════════

1. SCHEMA CHECK
   - Open database client (Prisma Studio, pgAdmin, etc.)
   - Verify all tables exist
   - Check column types match schema
   - Verify indexes present

2. SEED DATA CHECK
   - Run: npm run seed
   - Open Prisma Studio: npx prisma studio
   - Verify expected rows in each table
   - Check relationships populated

3. CRUD CHECK
   - Create: Add a new record via UI
   - Read: View the record in list and detail
   - Update: Edit the record
   - Delete: Remove the record
   - Verify changes in database

4. VALIDATION CHECK
   - Try submitting invalid data
   - Verify error messages
   - Check database wasn't corrupted

5. FLOW CHECK
   - Complete a full user journey
   - Verify data correct at each step
   - Check nothing lost or corrupted
```

---

## Quick Fixes

### Missing Seed Script

```json
// package.json
{
  "scripts": {
    "seed": "npx prisma db seed"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Missing Validation

```typescript
// Add Zod validation to API routes
import { z } from 'zod';

const schema = z.object({
  // define schema
});

export async function POST(req: Request) {
  const data = schema.parse(await req.json());
  // proceed with validated data
}
```

### Missing Tests

```bash
# Generate basic CRUD tests
npx hygen crud-test new --entity User
```

---

*Data integrity is non-negotiable. Verify thoroughly.*
