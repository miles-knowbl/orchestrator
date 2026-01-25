# Service Layer Patterns

Patterns for implementing business logic, validation, and service orchestration.

## Service Structure

### Basic Service

```typescript
// services/ProductService.ts
import { ProductRepository } from '../repositories/ProductRepository';
import { AppError } from '../common/errors';
import type { Product, CreateProductInput, UpdateProductInput } from '../models/Product';

export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async getById(id: string): Promise<Product> {
    const product = await this.productRepo.findById(id);
    
    if (!product) {
      throw new AppError('PRODUCT_NOT_FOUND', `Product ${id} not found`, 404);
    }
    
    return product;
  }

  async create(input: CreateProductInput): Promise<Product> {
    // Validate
    this.validateCreateInput(input);
    
    // Create
    return this.productRepo.create(input);
  }

  async update(input: UpdateProductInput): Promise<Product> {
    // Check exists
    const existing = await this.productRepo.findById(input.id);
    if (!existing) {
      throw new AppError('PRODUCT_NOT_FOUND', `Product ${input.id} not found`, 404);
    }
    
    // Validate
    this.validateUpdateInput(input);
    
    // Update
    const updated = await this.productRepo.update(input);
    return updated!;
  }

  private validateCreateInput(input: CreateProductInput): void {
    if (input.priceCents < 0) {
      throw new AppError('INVALID_PRICE', 'Price cannot be negative', 400);
    }
    
    if (input.name.length < 1 || input.name.length > 255) {
      throw new AppError('INVALID_NAME', 'Name must be 1-255 characters', 400);
    }
  }

  private validateUpdateInput(input: UpdateProductInput): void {
    if (input.priceCents !== undefined && input.priceCents < 0) {
      throw new AppError('INVALID_PRICE', 'Price cannot be negative', 400);
    }
  }
}
```

### Service with Dependencies

```typescript
// services/OrderService.ts
export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private productService: ProductService,
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
    private emailService: EmailService,
    private eventBus: EventBus,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    // 1. Validate
    await this.validateOrder(input);

    // 2. Calculate pricing
    const pricing = await this.calculatePricing(input.items);

    // 3. Reserve inventory
    const reservation = await this.inventoryService.reserve(
      input.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
    );

    try {
      // 4. Create order record
      const order = await this.orderRepo.create({
        userId: input.userId,
        items: input.items,
        subtotalCents: pricing.subtotal,
        taxCents: pricing.tax,
        totalCents: pricing.total,
      });

      // 5. Emit event (async side effects)
      await this.eventBus.publish('order.created', {
        orderId: order.id,
        userId: order.userId,
      });

      return order;
    } catch (error) {
      // Rollback inventory reservation
      await this.inventoryService.release(reservation.id);
      throw error;
    }
  }
}
```

## Validation Patterns

### Schema Validation with Zod

```typescript
// validation/productValidation.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  description: z.string().max(5000).optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  priceCents: z.number()
    .int('Price must be a whole number')
    .min(0, 'Price cannot be negative'),
  metadata: z.object({
    weight: z.number().positive().optional(),
    tags: z.array(z.string()).max(10).optional(),
  }).optional(),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;

// Usage in service
async create(input: unknown): Promise<Product> {
  // Parse and validate
  const validated = createProductSchema.parse(input);
  
  // Now validated has correct types
  return this.productRepo.create(validated);
}
```

### Custom Validation Rules

```typescript
// validation/orderValidation.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  )
  .min(1, 'At least one item required')
  .max(50, 'Maximum 50 items per order'),
  
  shippingAddressId: z.string().uuid(),
  
  couponCode: z.string().optional(),
})
.refine(
  (data) => {
    // Custom validation: no duplicate products
    const productIds = data.items.map(i => i.productId);
    return new Set(productIds).size === productIds.length;
  },
  { message: 'Duplicate products not allowed', path: ['items'] }
);
```

### Business Rule Validation

```typescript
// services/OrderService.ts
private async validateOrder(input: CreateOrderInput): Promise<void> {
  const errors: ValidationError[] = [];

  // Check each product exists and is available
  for (const item of input.items) {
    const product = await this.productService.findById(item.productId);
    
    if (!product) {
      errors.push({
        field: `items.${item.productId}`,
        code: 'PRODUCT_NOT_FOUND',
        message: `Product ${item.productId} not found`,
      });
      continue;
    }

    if (!product.isActive) {
      errors.push({
        field: `items.${item.productId}`,
        code: 'PRODUCT_UNAVAILABLE',
        message: `Product ${product.name} is no longer available`,
      });
    }

    // Check inventory
    const available = await this.inventoryService.getAvailable(item.productId);
    if (available < item.quantity) {
      errors.push({
        field: `items.${item.productId}.quantity`,
        code: 'INSUFFICIENT_INVENTORY',
        message: `Only ${available} units available`,
        context: { available, requested: item.quantity },
      });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Order validation failed', errors);
  }
}
```

## Transaction Patterns

### Service-Level Transactions

```typescript
// services/TransferService.ts
export class TransferService {
  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amountCents: number,
  ): Promise<Transfer> {
    // Use database transaction
    return await this.db.transaction().execute(async (trx) => {
      // Debit source account
      const fromAccount = await this.accountRepo.debit(
        trx, 
        fromAccountId, 
        amountCents
      );
      
      if (fromAccount.balanceCents < 0) {
        throw new AppError('INSUFFICIENT_FUNDS', 'Insufficient balance');
      }

      // Credit destination account
      await this.accountRepo.credit(trx, toAccountId, amountCents);

      // Create transfer record
      const transfer = await this.transferRepo.create(trx, {
        fromAccountId,
        toAccountId,
        amountCents,
        status: 'completed',
      });

      return transfer;
    });
  }
}
```

### Saga Pattern for Distributed Transactions

```typescript
// services/CheckoutSaga.ts
export class CheckoutSaga {
  async execute(input: CheckoutInput): Promise<Order> {
    const sagaLog: SagaStep[] = [];

    try {
      // Step 1: Reserve inventory
      const reservation = await this.inventoryService.reserve(input.items);
      sagaLog.push({ step: 'inventory', data: reservation, compensate: () => 
        this.inventoryService.release(reservation.id) 
      });

      // Step 2: Process payment
      const payment = await this.paymentService.charge(input.paymentMethod, input.total);
      sagaLog.push({ step: 'payment', data: payment, compensate: () => 
        this.paymentService.refund(payment.id) 
      });

      // Step 3: Create order
      const order = await this.orderService.create({
        ...input,
        reservationId: reservation.id,
        paymentId: payment.id,
      });
      sagaLog.push({ step: 'order', data: order, compensate: () => 
        this.orderService.cancel(order.id) 
      });

      // Step 4: Confirm inventory (commit reservation)
      await this.inventoryService.confirm(reservation.id);

      return order;
    } catch (error) {
      // Compensate in reverse order
      for (const step of sagaLog.reverse()) {
        try {
          await step.compensate();
        } catch (compensateError) {
          // Log but don't throw - best effort rollback
          this.logger.error('Saga compensation failed', {
            step: step.step,
            error: compensateError,
          });
        }
      }
      throw error;
    }
  }
}
```

## Domain Event Patterns

### Event Publishing

```typescript
// events/EventBus.ts
export interface DomainEvent {
  type: string;
  payload: unknown;
  metadata: {
    timestamp: Date;
    correlationId: string;
  };
}

export class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  subscribe(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  async publish(eventType: string, payload: unknown): Promise<void> {
    const event: DomainEvent = {
      type: eventType,
      payload,
      metadata: {
        timestamp: new Date(),
        correlationId: getCorrelationId(),
      },
    };

    const handlers = this.handlers.get(eventType) ?? [];
    
    // Fire and forget - handlers run async
    for (const handler of handlers) {
      handler(event).catch(error => {
        this.logger.error('Event handler failed', { eventType, error });
      });
    }
  }
}
```

### Event Handlers

```typescript
// events/handlers/OrderEventHandlers.ts
export function registerOrderEventHandlers(eventBus: EventBus): void {
  // Send confirmation email
  eventBus.subscribe('order.created', async (event) => {
    const { orderId, userId } = event.payload as OrderCreatedPayload;
    
    const order = await orderRepo.findById(orderId);
    const user = await userRepo.findById(userId);
    
    await emailService.send({
      to: user.email,
      template: 'order-confirmation',
      data: { order, user },
    });
  });

  // Update analytics
  eventBus.subscribe('order.created', async (event) => {
    const { orderId } = event.payload as OrderCreatedPayload;
    await analyticsService.trackOrder(orderId);
  });

  // Notify warehouse
  eventBus.subscribe('order.paid', async (event) => {
    const { orderId } = event.payload as OrderPaidPayload;
    await warehouseService.queueForFulfillment(orderId);
  });
}
```

## Caching Patterns

### Service-Level Caching

```typescript
// services/ProductService.ts
export class ProductService {
  private cache: Cache;

  async getById(id: string): Promise<Product> {
    // Try cache first
    const cacheKey = `product:${id}`;
    const cached = await this.cache.get<Product>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const product = await this.productRepo.findById(id);
    
    if (!product) {
      throw new AppError('PRODUCT_NOT_FOUND', `Product ${id} not found`, 404);
    }

    // Cache for 5 minutes
    await this.cache.set(cacheKey, product, { ttl: 300 });
    
    return product;
  }

  async update(input: UpdateProductInput): Promise<Product> {
    const updated = await this.productRepo.update(input);
    
    // Invalidate cache
    await this.cache.delete(`product:${input.id}`);
    
    return updated!;
  }
}
```

### Cache-Aside with Batch Loading

```typescript
// services/ProductService.ts
async getByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  // Check cache for all IDs
  const cacheKeys = ids.map(id => `product:${id}`);
  const cached = await this.cache.mget<Product>(cacheKeys);

  // Find missing IDs
  const missingIds: string[] = [];
  const results = new Map<string, Product>();

  ids.forEach((id, index) => {
    if (cached[index]) {
      results.set(id, cached[index]!);
    } else {
      missingIds.push(id);
    }
  });

  // Fetch missing from database
  if (missingIds.length > 0) {
    const products = await this.productRepo.findByIds(missingIds);
    
    // Cache and add to results
    const toCache: Array<{ key: string; value: Product; ttl: number }> = [];
    
    for (const product of products) {
      results.set(product.id, product);
      toCache.push({
        key: `product:${product.id}`,
        value: product,
        ttl: 300,
      });
    }

    await this.cache.mset(toCache);
  }

  // Return in original order
  return ids.map(id => results.get(id)).filter(Boolean) as Product[];
}
```

## Authorization Patterns

### Service-Level Authorization

```typescript
// services/OrderService.ts
async getOrder(orderId: string, requestingUser: User): Promise<Order> {
  const order = await this.orderRepo.findById(orderId);
  
  if (!order) {
    throw new AppError('ORDER_NOT_FOUND', `Order ${orderId} not found`, 404);
  }

  // Authorization check
  if (order.userId !== requestingUser.id && !requestingUser.isAdmin) {
    throw new AppError('FORBIDDEN', 'You do not have access to this order', 403);
  }

  return order;
}

async cancelOrder(orderId: string, requestingUser: User): Promise<Order> {
  const order = await this.getOrder(orderId, requestingUser);

  // Business rule: can only cancel pending orders
  if (order.status !== 'pending') {
    throw new AppError(
      'CANNOT_CANCEL',
      `Cannot cancel order in ${order.status} status`,
      400
    );
  }

  return this.orderRepo.update({ id: orderId, status: 'cancelled' });
}
```

### Policy-Based Authorization

```typescript
// policies/OrderPolicy.ts
export class OrderPolicy {
  canView(user: User, order: Order): boolean {
    return order.userId === user.id || user.roles.includes('admin');
  }

  canCancel(user: User, order: Order): boolean {
    if (!this.canView(user, order)) return false;
    return order.status === 'pending';
  }

  canRefund(user: User, order: Order): boolean {
    if (!user.roles.includes('admin')) return false;
    return ['paid', 'shipped', 'delivered'].includes(order.status);
  }
}

// Usage in service
async cancelOrder(orderId: string, user: User): Promise<Order> {
  const order = await this.orderRepo.findById(orderId);
  
  if (!order) {
    throw new AppError('ORDER_NOT_FOUND', `Order ${orderId} not found`, 404);
  }

  if (!this.orderPolicy.canCancel(user, order)) {
    throw new AppError('FORBIDDEN', 'You cannot cancel this order', 403);
  }

  return this.performCancellation(order);
}
```
