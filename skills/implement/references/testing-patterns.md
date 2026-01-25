# Testing Patterns

Patterns for unit tests, integration tests, and end-to-end tests.

## Testing Philosophy

**Write tests as you implement.** Don't leave testing until the end.

**Test behavior, not implementation.** Tests should survive refactoring.

**Follow the testing pyramid:**
- Many unit tests (fast, isolated)
- Fewer integration tests (slower, verify integrations)
- Few E2E tests (slowest, critical paths only)

## Unit Tests

### Service Tests

```typescript
// services/__tests__/OrderService.test.ts
import { OrderService } from '../OrderService';
import { createMockOrderRepo } from '../../test/mocks/orderRepo';
import { createMockProductService } from '../../test/mocks/productService';
import { createMockInventoryService } from '../../test/mocks/inventoryService';
import { AppError } from '../../common/errors';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepo: ReturnType<typeof createMockOrderRepo>;
  let mockProductService: ReturnType<typeof createMockProductService>;
  let mockInventoryService: ReturnType<typeof createMockInventoryService>;

  beforeEach(() => {
    mockOrderRepo = createMockOrderRepo();
    mockProductService = createMockProductService();
    mockInventoryService = createMockInventoryService();

    service = new OrderService(
      mockOrderRepo,
      mockProductService,
      mockInventoryService,
    );
  });

  describe('createOrder', () => {
    const validInput = {
      userId: 'user-1',
      items: [{ productId: 'prod-1', quantity: 2 }],
      shippingAddressId: 'addr-1',
    };

    it('creates order with valid input', async () => {
      // Arrange
      mockProductService.getById.mockResolvedValue({
        id: 'prod-1',
        priceCents: 1000,
        isActive: true,
      });
      mockInventoryService.getAvailable.mockResolvedValue(10);
      mockOrderRepo.create.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'pending',
        totalCents: 2000,
      });

      // Act
      const order = await service.createOrder(validInput);

      // Assert
      expect(order).toEqual({
        id: 'order-1',
        userId: 'user-1',
        status: 'pending',
        totalCents: 2000,
      });
      expect(mockOrderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          totalCents: 2000,
        })
      );
    });

    it('throws CART_EMPTY when items array is empty', async () => {
      // Arrange
      const input = { ...validInput, items: [] };

      // Act & Assert
      await expect(service.createOrder(input))
        .rejects
        .toThrow(AppError);
      
      await expect(service.createOrder(input))
        .rejects
        .toMatchObject({ code: 'CART_EMPTY' });
    });

    it('throws OUT_OF_STOCK when inventory is insufficient', async () => {
      // Arrange
      mockProductService.getById.mockResolvedValue({
        id: 'prod-1',
        priceCents: 1000,
        isActive: true,
      });
      mockInventoryService.getAvailable.mockResolvedValue(1); // Only 1 available

      // Act & Assert
      await expect(service.createOrder(validInput))
        .rejects
        .toMatchObject({
          code: 'OUT_OF_STOCK',
          details: { available: 1, requested: 2 },
        });
    });

    it('reserves inventory before creating order', async () => {
      // Arrange
      mockProductService.getById.mockResolvedValue({
        id: 'prod-1',
        priceCents: 1000,
        isActive: true,
      });
      mockInventoryService.getAvailable.mockResolvedValue(10);
      mockInventoryService.reserve.mockResolvedValue({ id: 'res-1' });

      // Act
      await service.createOrder(validInput);

      // Assert
      expect(mockInventoryService.reserve).toHaveBeenCalledBefore(
        mockOrderRepo.create
      );
    });

    it('releases reservation if order creation fails', async () => {
      // Arrange
      mockProductService.getById.mockResolvedValue({
        id: 'prod-1',
        priceCents: 1000,
        isActive: true,
      });
      mockInventoryService.getAvailable.mockResolvedValue(10);
      mockInventoryService.reserve.mockResolvedValue({ id: 'res-1' });
      mockOrderRepo.create.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(service.createOrder(validInput)).rejects.toThrow();
      expect(mockInventoryService.releaseReservation).toHaveBeenCalledWith('res-1');
    });
  });
});
```

### Mock Factories

```typescript
// test/mocks/orderRepo.ts
import { vi } from 'vitest';
import type { OrderRepository } from '../../repositories/OrderRepository';

export function createMockOrderRepo(): jest.Mocked<OrderRepository> {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

// test/mocks/productService.ts
export function createMockProductService(): jest.Mocked<ProductService> {
  return {
    getById: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}
```

### Testing Validation

```typescript
// validation/__tests__/orderValidation.test.ts
import { createOrderSchema } from '../orderValidation';

describe('createOrderSchema', () => {
  it('accepts valid input', () => {
    const input = {
      items: [{ productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 }],
      shippingAddressId: '123e4567-e89b-12d3-a456-426614174001',
    };

    expect(() => createOrderSchema.parse(input)).not.toThrow();
  });

  it('rejects empty items array', () => {
    const input = {
      items: [],
      shippingAddressId: '123e4567-e89b-12d3-a456-426614174001',
    };

    expect(() => createOrderSchema.parse(input)).toThrow(/at least one item/i);
  });

  it('rejects invalid product ID format', () => {
    const input = {
      items: [{ productId: 'not-a-uuid', quantity: 2 }],
      shippingAddressId: '123e4567-e89b-12d3-a456-426614174001',
    };

    expect(() => createOrderSchema.parse(input)).toThrow(/invalid/i);
  });

  it('rejects negative quantity', () => {
    const input = {
      items: [{ productId: '123e4567-e89b-12d3-a456-426614174000', quantity: -1 }],
      shippingAddressId: '123e4567-e89b-12d3-a456-426614174001',
    };

    expect(() => createOrderSchema.parse(input)).toThrow(/positive/i);
  });
});
```

## Integration Tests

### API Integration Tests

```typescript
// tests/integration/orders.test.ts
import request from 'supertest';
import app from '../../src/app';
import { setupTestDb, teardownTestDb, resetTestDb } from '../helpers/db';
import { createTestUser, createTestProduct } from '../helpers/factories';

describe('Orders API', () => {
  let authToken: string;
  let userId: string;
  let productId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
    
    // Create test user and get token
    const user = await createTestUser();
    userId = user.id;
    authToken = user.token;

    // Create test product
    const product = await createTestProduct({ priceCents: 1000 });
    productId = product.id;
  });

  describe('POST /api/orders', () => {
    it('returns 201 and creates order', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId, quantity: 2 }],
          shippingAddressId: 'addr-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        status: 'pending',
        totalCents: 2000,
      });
      expect(response.body.data.id).toBeDefined();
    });

    it('returns 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ items: [] });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 400 for empty cart', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [],
          shippingAddressId: 'addr-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for invalid product ID', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: 'nonexistent', quantity: 1 }],
          shippingAddressId: 'addr-1',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('returns order for owner', async () => {
      // Create order first
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId, quantity: 1 }],
          shippingAddressId: 'addr-1',
        });

      const orderId = createResponse.body.data.id;

      // Fetch order
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(orderId);
    });

    it('returns 403 for non-owner', async () => {
      // Create order as user 1
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId, quantity: 1 }],
          shippingAddressId: 'addr-1',
        });

      // Try to access as user 2
      const user2 = await createTestUser();

      const response = await request(app)
        .get(`/api/orders/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${user2.token}`);

      expect(response.status).toBe(403);
    });

    it('returns 404 for nonexistent order', async () => {
      const response = await request(app)
        .get('/api/orders/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
```

### Database Test Helpers

```typescript
// tests/helpers/db.ts
import { db } from '../../src/database';
import { migrate } from '../../src/database/migrations';

export async function setupTestDb() {
  // Run migrations
  await migrate(db, 'latest');
}

export async function teardownTestDb() {
  await db.destroy();
}

export async function resetTestDb() {
  // Truncate all tables in reverse dependency order
  await db.deleteFrom('order_items').execute();
  await db.deleteFrom('orders').execute();
  await db.deleteFrom('products').execute();
  await db.deleteFrom('users').execute();
}

// tests/helpers/factories.ts
export async function createTestUser(overrides = {}) {
  const user = await db
    .insertInto('users')
    .values({
      email: `test-${Date.now()}@example.com`,
      password_hash: 'hashed',
      ...overrides,
    })
    .returningAll()
    .executeTakeFirst();

  const token = generateToken({ userId: user.id });

  return { ...user, token };
}

export async function createTestProduct(overrides = {}) {
  return db
    .insertInto('products')
    .values({
      name: 'Test Product',
      price_cents: 1000,
      status: 'active',
      is_active: true,
      ...overrides,
    })
    .returningAll()
    .executeTakeFirst();
}
```

## Component Tests

### React Testing Library

```typescript
// components/__tests__/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    priceCents: 1999,
    imageUrl: 'https://example.com/image.jpg',
  };

  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockProduct.imageUrl);
  });

  it('calls onAddToCart when button clicked', () => {
    const onAddToCart = vi.fn();
    
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(onAddToCart).toHaveBeenCalledWith('1');
  });

  it('does not show add to cart button if no handler', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
```

### Testing Hooks

```typescript
// hooks/__tests__/useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../useProducts';
import { api } from '../../lib/api';

vi.mock('../../lib/api');

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useProducts', () => {
  it('fetches products successfully', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1' },
      { id: '2', name: 'Product 2' },
    ];

    vi.mocked(api.get).mockResolvedValue({
      data: { data: mockProducts, meta: { total: 2 } },
    });

    const { result } = renderHook(() => useProducts(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual(mockProducts);
  });

  it('handles error state', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProducts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network error');
  });
});
```

### Testing Forms

```typescript
// components/__tests__/ProductForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from '../ProductForm';

describe('ProductForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('submits valid form data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    await user.type(screen.getByLabelText(/name/i), 'New Product');
    await user.type(screen.getByLabelText(/price/i), '1999');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Product',
        priceCents: 1999,
      });
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();

    render(
      <ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Submit without filling required fields
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows API errors', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue({
      details: [{ field: 'name', message: 'Name already exists' }],
    });

    render(
      <ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    await user.type(screen.getByLabelText(/name/i), 'Existing Product');
    await user.type(screen.getByLabelText(/price/i), '1000');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name already exists/i)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();

    render(
      <ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
```

## E2E Tests

### Playwright Tests

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('complete checkout flow', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child button');
    
    // Verify cart updated
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    await page.waitForURL('/cart');

    // Proceed to checkout
    await page.click('button:has-text("Checkout")');
    await page.waitForURL('/checkout');

    // Fill shipping
    await page.selectOption('[name="shippingAddressId"]', { index: 1 });
    await page.click('button:has-text("Continue")');

    // Fill payment
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');
    
    // Place order
    await page.click('button:has-text("Place Order")');

    // Verify confirmation
    await page.waitForURL(/\/orders\/[a-z0-9-]+/);
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });

  test('shows error for out of stock item', async ({ page }) => {
    // Add out of stock product
    await page.goto('/products/out-of-stock-product');
    await page.click('button:has-text("Add to Cart")');
    
    await page.goto('/checkout');
    await page.click('button:has-text("Place Order")');

    await expect(page.locator('.error')).toContainText(/out of stock/i);
  });
});
```

### Test Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```
