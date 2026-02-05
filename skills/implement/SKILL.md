---
name: implement
description: "Transform specifications into working, production-quality code. Takes FeatureSpecs, requirements, or design documents and produces complete implementations following established patterns. Handles data layer, service layer, API layer, and UI components with proper error handling, validation, and tests."
phase: IMPLEMENT
category: engineering
version: "1.0.0"
depends_on: ["spec", "scaffold"]
tags: [coding, core-workflow, implementation]
---

# Implement

Transform specifications into working code.

## When to Use

- **After spec** — FeatureSpec ready, need implementation
- **After scaffold** — Project structure exists, need feature code
- **Defined task** — Clear requirements, need code
- **Bug fix** — Issue identified, need implementation of fix
- When you say: "implement this", "build this feature", "write the code for"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `service-layer-patterns.md` | Core patterns for business logic |
| `error-handling-patterns.md` | How to handle errors properly |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `data-layer-patterns.md` | When working with databases |
| `api-layer-patterns.md` | When building APIs |
| `testing-patterns.md` | When writing tests alongside |

**Verification:** Ensure code follows patterns from references, not ad-hoc approaches.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Source code files | `src/` | Always |
| Test files | `tests/` | Always (alongside implementation) |

## Core Concept

Implement answers: **"How do I turn this spec into working code?"**

Good implementation is:
- **Faithful** — Matches the specification exactly
- **Complete** — All capabilities, all edge cases, all error handling
- **Tested** — Tests written alongside code
- **Reviewable** — Clean, well-organized, follows conventions

Implementation is NOT:
- Architecture design (that's `architect`)
- Requirements gathering (that's `requirements`)
- Project setup (that's `scaffold`)
- Code improvement (that's `refactor`)

## The Implementation Process

```
┌─────────────────────────────────────────────────────────┐
│                IMPLEMENTATION PROCESS                   │
│                                                         │
│  1. UNDERSTAND THE SPEC                                 │
│     └─→ What exactly needs to be built?                 │
│                                                         │
│  2. PLAN IMPLEMENTATION ORDER                           │
│     └─→ What order minimizes blocked work?              │
│                                                         │
│  3. IMPLEMENT DATA LAYER                                │
│     └─→ Models, migrations, repositories                │
│                                                         │
│  4. IMPLEMENT SERVICE LAYER                             │
│     └─→ Business logic, validation, orchestration       │
│                                                         │
│  5. IMPLEMENT API LAYER                                 │
│     └─→ Endpoints, request/response handling            │
│                                                         │
│  6. IMPLEMENT UI LAYER                                  │
│     └─→ Components, state, user interactions            │
│                                                         │
│  7. VERIFY & TEST                                       │
│     └─→ Unit tests, integration tests, manual verify    │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Understand the Spec

Before writing code, fully understand what you're building.

### Reading a FeatureSpec

If working from a FeatureSpec (from `spec` skill), extract:

| Section | What to Extract |
|---------|-----------------|
| **Feature Overview** | Business context, user stories |
| **Entities** | Database tables, fields, relationships |
| **Capabilities** | What the system must do (CAP-###) |
| **Service Layer** | Business logic implementation |
| **API Layer** | Endpoints, request/response shapes |
| **UI Components** | Components to build, states to handle |
| **Feedback Timing** | How fast things should respond |
| **Test Scenarios** | What tests to write |

### Capability Extraction

For each capability (CAP-###), note:

```markdown
## CAP-001: create_order

**Trigger:** User clicks "Place Order"
**Input:** cart_id, shipping_address, payment_method
**Output:** order_id, confirmation_number
**Validation:** Cart not empty, address valid, payment valid
**Side Effects:** Inventory reserved, payment charged, email sent
**Error Cases:** CART_EMPTY, INVALID_ADDRESS, PAYMENT_FAILED, OUT_OF_STOCK
**Feedback:** Optimistic UI, <50ms visual, background payment
```

### Understanding Checklist

```markdown
- [ ] All entities and relationships understood
- [ ] All capabilities listed with inputs/outputs
- [ ] Validation rules documented
- [ ] Error cases identified
- [ ] Feedback requirements noted
- [ ] Test scenarios extracted
- [ ] Questions resolved (none remaining)
```

## Step 2: Plan Implementation Order

### Dependency-Based Ordering

Build in order that minimizes blocked work:

```
┌─────────────────────────────────────────────────────────┐
│                 IMPLEMENTATION ORDER                    │
│                                                         │
│  Layer 1: DATA LAYER (no dependencies)                  │
│  ├── Database migrations                                │
│  ├── Entity models                                      │
│  └── Repository interfaces                              │
│                                                         │
│  Layer 2: SERVICE LAYER (depends on data)               │
│  ├── Business logic services                            │
│  ├── Validation logic                                   │
│  └── Cross-cutting concerns                             │
│                                                         │
│  Layer 3: API LAYER (depends on services)               │
│  ├── Route definitions                                  │
│  ├── Controllers/handlers                               │
│  └── Request/response DTOs                              │
│                                                         │
│  Layer 4: UI LAYER (depends on API)                     │
│  ├── API client hooks                                   │
│  ├── Components                                         │
│  └── Pages/views                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Within Each Layer

Order by dependency:

```markdown
## Service Layer Order

1. **Independent services first**
   - UserService (no service dependencies)
   - ProductService (no service dependencies)

2. **Dependent services second**
   - CartService (depends on ProductService)
   - OrderService (depends on CartService, UserService)

3. **Orchestration services last**
   - CheckoutService (orchestrates multiple services)
```

### Implementation Plan Template

```markdown
## Implementation Plan: [Feature Name]

### Phase 1: Data Layer
- [ ] Migration: create_orders_table
- [ ] Migration: create_order_items_table
- [ ] Model: Order
- [ ] Model: OrderItem
- [ ] Repository: OrderRepository

### Phase 2: Service Layer
- [ ] Service: OrderService.createOrder
- [ ] Service: OrderService.getOrder
- [ ] Service: OrderService.updateStatus
- [ ] Validation: OrderValidation

### Phase 3: API Layer
- [ ] POST /api/orders
- [ ] GET /api/orders/:id
- [ ] PATCH /api/orders/:id/status

### Phase 4: UI Layer
- [ ] Hook: useCreateOrder
- [ ] Component: OrderForm
- [ ] Component: OrderConfirmation
- [ ] Page: CheckoutPage

### Phase 5: Testing
- [ ] Unit: OrderService tests
- [ ] Integration: Order API tests
- [ ] E2E: Checkout flow test
```

## Step 3: Implement Data Layer

### Database Migrations

```typescript
// migrations/20240115_create_orders.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('orders')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => 
      col.notNull().references('users.id'))
    .addColumn('status', 'varchar(50)', (col) => 
      col.notNull().defaultTo('pending'))
    .addColumn('total_cents', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`))
    .execute();

  // Indexes
  await db.schema
    .createIndex('idx_orders_user_id')
    .on('orders')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_orders_status')
    .on('orders')
    .column('status')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('orders').execute();
}
```

### Entity Models

```typescript
// models/Order.ts
export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export interface CreateOrderInput {
  userId: string;
  items: OrderItemInput[];
  shippingAddressId: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}
```

### Repository Pattern

```typescript
// repositories/OrderRepository.ts
import { db } from '../database';
import type { Order, CreateOrderInput } from '../models/Order';

export class OrderRepository {
  async create(input: CreateOrderInput): Promise<Order> {
    const [order] = await db
      .insertInto('orders')
      .values({
        user_id: input.userId,
        status: 'pending',
        total_cents: 0, // Calculated in service
      })
      .returning(['id', 'user_id', 'status', 'total_cents', 'created_at', 'updated_at'])
      .execute();

    return this.mapToOrder(order);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await db
      .selectFrom('orders')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return order ? this.mapToOrder(order) : null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await db
      .selectFrom('orders')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .execute();

    return orders.map(this.mapToOrder);
  }

  private mapToOrder(row: OrderRow): Order {
    return {
      id: row.id,
      userId: row.user_id,
      status: row.status as OrderStatus,
      totalCents: row.total_cents,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

→ See `references/data-layer-patterns.md`

## Step 4: Implement Service Layer

### Service Structure

```typescript
// services/OrderService.ts
import { OrderRepository } from '../repositories/OrderRepository';
import { ProductService } from './ProductService';
import { InventoryService } from './InventoryService';
import { PaymentService } from './PaymentService';
import { AppError } from '../common/errors';
import type { Order, CreateOrderInput } from '../models/Order';

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private productService: ProductService,
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
  ) {}

  /**
   * CAP-001: create_order
   * Creates a new order from cart items
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    // 1. Validate input
    this.validateCreateInput(input);

    // 2. Check inventory
    await this.checkInventory(input.items);

    // 3. Calculate total
    const totalCents = await this.calculateTotal(input.items);

    // 4. Reserve inventory
    const reservationId = await this.inventoryService.reserve(input.items);

    try {
      // 5. Create order
      const order = await this.orderRepo.create({
        ...input,
        totalCents,
      });

      // 6. Create order items
      await this.createOrderItems(order.id, input.items);

      return order;
    } catch (error) {
      // Rollback inventory reservation
      await this.inventoryService.releaseReservation(reservationId);
      throw error;
    }
  }

  private validateCreateInput(input: CreateOrderInput): void {
    if (!input.items || input.items.length === 0) {
      throw new AppError('CART_EMPTY', 'Cannot create order with empty cart', 400);
    }

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new AppError('INVALID_QUANTITY', 'Quantity must be positive', 400);
      }
    }
  }

  private async checkInventory(items: OrderItemInput[]): Promise<void> {
    for (const item of items) {
      const available = await this.inventoryService.getAvailable(item.productId);
      if (available < item.quantity) {
        throw new AppError(
          'OUT_OF_STOCK',
          `Insufficient inventory for product ${item.productId}`,
          400,
          { productId: item.productId, available, requested: item.quantity }
        );
      }
    }
  }

  private async calculateTotal(items: OrderItemInput[]): Promise<number> {
    let total = 0;
    for (const item of items) {
      const product = await this.productService.getById(item.productId);
      if (!product) {
        throw new AppError('PRODUCT_NOT_FOUND', `Product ${item.productId} not found`, 404);
      }
      total += product.priceCents * item.quantity;
    }
    return total;
  }
}
```

### Validation Layer

```typescript
// validation/orderValidation.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1, 'At least one item required'),
  shippingAddressId: z.string().uuid(),
  paymentMethodId: z.string().uuid().optional(),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;

// Usage in controller
const validated = createOrderSchema.parse(req.body);
```

→ See `references/service-layer-patterns.md`

## Step 5: Implement API Layer

### Route Definition

```typescript
// routes/orders.ts
import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createOrderSchema } from '../validation/orderValidation';

const router = Router();
const controller = new OrderController();

router.use(authenticate);

router.post('/', validate(createOrderSchema), controller.create);
router.get('/:id', controller.getById);
router.get('/', controller.listForUser);
router.patch('/:id/cancel', controller.cancel);

export const orderRoutes = router;
```

### Controller Implementation

```typescript
// controllers/OrderController.ts
import type { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/OrderService';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService(/* dependencies */);
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.createOrder({
        userId: req.user.id,
        items: req.body.items,
        shippingAddressId: req.body.shippingAddressId,
      });

      res.status(201).json({
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.getById(req.params.id);

      if (!order) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Order not found' },
        });
      }

      // Authorization check
      if (order.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Access denied' },
        });
      }

      res.json({ data: order });
    } catch (error) {
      next(error);
    }
  };
}
```

### Request/Response Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Specific response types
export interface CreateOrderResponse {
  data: {
    id: string;
    status: string;
    totalCents: number;
    createdAt: string;
  };
}
```

→ See `references/api-layer-patterns.md`

## Step 6: Implement UI Layer

### API Client Hooks

```typescript
// hooks/useOrders.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Order, CreateOrderInput } from '../types';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => 
      api.post<{ data: Order }>('/orders', input).then(r => r.data.data),
    
    onSuccess: () => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Clear cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => 
      api.get<{ data: Order }>(`/orders/${orderId}`).then(r => r.data.data),
    enabled: !!orderId,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => 
      api.get<{ data: Order[] }>('/orders').then(r => r.data.data),
  });
}
```

### Component with Feedback

```typescript
// components/OrderForm.tsx
import { useState } from 'react';
import { useCreateOrder } from '../hooks/useOrders';
import { Button } from './ui/Button';
import { useHaptic } from '../hooks/useHaptic';

interface OrderFormProps {
  cartId: string;
  onSuccess: (orderId: string) => void;
}

export function OrderForm({ cartId, onSuccess }: OrderFormProps) {
  const createOrder = useCreateOrder();
  const haptic = useHaptic();
  const [optimisticState, setOptimisticState] = useState<'idle' | 'pending' | 'success'>('idle');

  const handleSubmit = async () => {
    // Immediate haptic feedback (0ms)
    haptic.impact('medium');
    
    // Optimistic UI (<50ms)
    setOptimisticState('pending');

    try {
      const order = await createOrder.mutateAsync({ cartId });
      
      // Success haptic
      haptic.notification('success');
      setOptimisticState('success');
      
      // Navigate after animation settles (<300ms)
      setTimeout(() => onSuccess(order.id), 200);
    } catch (error) {
      // Error haptic
      haptic.notification('error');
      setOptimisticState('idle');
    }
  };

  return (
    <div>
      <Button
        onClick={handleSubmit}
        loading={createOrder.isPending}
        disabled={optimisticState !== 'idle'}
      >
        {optimisticState === 'pending' ? 'Placing Order...' : 'Place Order'}
      </Button>

      {createOrder.isError && (
        <p className="text-red-500 mt-2">
          {createOrder.error.message}
        </p>
      )}
    </div>
  );
}
```

### State Management

```typescript
// components/CheckoutPage.tsx
import { useState } from 'react';
import { OrderForm } from './OrderForm';
import { OrderConfirmation } from './OrderConfirmation';
import { useCart } from '../hooks/useCart';

type CheckoutState = 
  | { step: 'review' }
  | { step: 'processing' }
  | { step: 'confirmation'; orderId: string }
  | { step: 'error'; message: string };

export function CheckoutPage() {
  const [state, setState] = useState<CheckoutState>({ step: 'review' });
  const { data: cart } = useCart();

  if (state.step === 'confirmation') {
    return <OrderConfirmation orderId={state.orderId} />;
  }

  if (state.step === 'error') {
    return (
      <div>
        <p>Error: {state.message}</p>
        <button onClick={() => setState({ step: 'review' })}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Checkout</h1>
      <CartSummary cart={cart} />
      <OrderForm
        cartId={cart?.id}
        onSuccess={(orderId) => setState({ step: 'confirmation', orderId })}
      />
    </div>
  );
}
```

→ See `references/ui-layer-patterns.md`

## Step 7: Verify & Test

### Test Alongside Implementation

Write tests as you implement, not after:

```typescript
// services/__tests__/OrderService.test.ts
import { OrderService } from '../OrderService';
import { createMockOrderRepo, createMockProductService } from '../../test/mocks';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepo: ReturnType<typeof createMockOrderRepo>;

  beforeEach(() => {
    mockOrderRepo = createMockOrderRepo();
    service = new OrderService(
      mockOrderRepo,
      createMockProductService(),
      createMockInventoryService(),
      createMockPaymentService(),
    );
  });

  describe('createOrder', () => {
    it('creates order with valid input', async () => {
      const input = {
        userId: 'user-1',
        items: [{ productId: 'prod-1', quantity: 2 }],
        shippingAddressId: 'addr-1',
      };

      const order = await service.createOrder(input);

      expect(order).toMatchObject({
        userId: 'user-1',
        status: 'pending',
      });
      expect(mockOrderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' })
      );
    });

    it('throws CART_EMPTY for empty items', async () => {
      const input = {
        userId: 'user-1',
        items: [],
        shippingAddressId: 'addr-1',
      };

      await expect(service.createOrder(input)).rejects.toThrow('CART_EMPTY');
    });

    it('throws OUT_OF_STOCK when inventory insufficient', async () => {
      // Setup mock to return low inventory
      mockInventoryService.getAvailable.mockResolvedValue(1);

      const input = {
        userId: 'user-1',
        items: [{ productId: 'prod-1', quantity: 10 }],
        shippingAddressId: 'addr-1',
      };

      await expect(service.createOrder(input)).rejects.toThrow('OUT_OF_STOCK');
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/orders.test.ts
import request from 'supertest';
import app from '../../src/app';
import { setupTestDb, teardownTestDb, createTestUser } from '../helpers';

describe('Orders API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestDb();
    const user = await createTestUser();
    userId = user.id;
    authToken = user.token;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('POST /api/orders', () => {
    it('creates order and returns 201', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: 'prod-1', quantity: 2 }],
          shippingAddressId: 'addr-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        status: 'pending',
      });
    });

    it('returns 401 without auth', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ items: [] });

      expect(response.status).toBe(401);
    });

    it('returns 400 for empty cart', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ items: [], shippingAddressId: 'addr-1' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CART_EMPTY');
    });
  });
});
```

→ See `references/testing-patterns.md`

## Implementation Quality Standards

### Code Quality Checklist

```markdown
## Before Submitting

### Completeness
- [ ] All capabilities from spec implemented
- [ ] All error cases handled
- [ ] All validation rules applied
- [ ] All side effects implemented

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Consistent naming conventions
- [ ] Functions are small and focused
- [ ] No magic numbers/strings

### Error Handling
- [ ] All async code has try/catch
- [ ] Errors have appropriate codes
- [ ] User-facing messages are helpful
- [ ] Errors are logged appropriately

### Testing
- [ ] Unit tests for service logic
- [ ] Integration tests for API endpoints
- [ ] Edge cases tested
- [ ] Error cases tested

### Documentation
- [ ] JSDoc on public functions
- [ ] Complex logic has comments
- [ ] API changes documented
```

### Common Implementation Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Missing error handling | Unhandled promise rejections | Always wrap async in try/catch |
| Ignoring validation | Invalid data reaches database | Validate at API boundary |
| N+1 queries | Performance issues | Batch/join queries |
| Missing indexes | Slow queries | Add indexes for frequent filters |
| Hardcoded values | Inflexible code | Use constants/config |
| No tests | Regressions | Write tests alongside code |

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `spec` | Spec provides detailed implementation requirements |
| `frontend-design` | (Frontend systems) DESIGN.md guides UI component implementation |
| `scaffold` | Scaffold provides project structure to implement within |
| `code-verification` | Verifies implementation is structurally correct |
| `code-validation` | Validates implementation matches requirements |
| `code-review` | Reviews implementation before merge |
| `test-generation` | Generates additional tests for implementation |
| `refactor` | Improves implementation after it works |

## Key Principles

**Spec fidelity.** The spec is the contract. Implement exactly what it says.

**Layer by layer.** Build data layer before services, services before API, API before UI.

**Test as you go.** Write tests alongside implementation, not after.

**Handle all errors.** Every error case in the spec needs handling.

**Feedback matters.** Implement the timing and haptic feedback from the spec.

**Small commits.** Commit after each logical unit (one capability, one component).

## References

- `references/data-layer-patterns.md`: Database, models, repositories
- `references/service-layer-patterns.md`: Business logic, validation, transactions
- `references/api-layer-patterns.md`: Routes, controllers, middleware
- `references/ui-layer-patterns.md`: Components, state, feedback
- `references/testing-patterns.md`: Unit, integration, E2E tests
- `references/error-handling-patterns.md`: Error types, handling, logging
