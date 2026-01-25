# Mocking Patterns

Strategies for isolating code under test.

## When to Mock

### Mock These

| Dependency | Why Mock |
|------------|----------|
| **External APIs** | Slow, unreliable, costs money |
| **Databases** | Slow, requires setup |
| **File system** | Side effects, slow |
| **Network requests** | Unreliable, slow |
| **Time/dates** | Non-deterministic |
| **Random numbers** | Non-deterministic |
| **Environment variables** | Varies between environments |

### Don't Mock These

| Dependency | Why Not |
|------------|---------|
| **Pure functions** | No side effects, fast |
| **Value objects** | Simple, no behavior |
| **The code under test** | Defeats purpose |
| **Simple utilities** | More work than value |

## Mock Types

### Stub

Returns canned data, no verification.

```typescript
// Simple stub
const userService = {
  getUser: jest.fn().mockReturnValue({ id: '1', name: 'Test' })
};

// Async stub
const apiClient = {
  fetch: jest.fn().mockResolvedValue({ data: [] })
};

// Stub with different returns
const counter = {
  next: jest.fn()
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(3)
};
```

### Mock

Records calls for verification.

```typescript
const emailService = {
  send: jest.fn().mockResolvedValue({ sent: true })
};

// Use in test
await orderService.completeOrder(order);

// Verify interactions
expect(emailService.send).toHaveBeenCalledTimes(1);
expect(emailService.send).toHaveBeenCalledWith({
  to: order.customerEmail,
  subject: 'Order Confirmation',
  body: expect.stringContaining(order.id)
});
```

### Spy

Wraps real implementation, records calls.

```typescript
const logger = new Logger();
const spy = jest.spyOn(logger, 'error');

// Real method still executes
service.doSomething();

// But we can verify it was called
expect(spy).toHaveBeenCalledWith('Something went wrong');

// Restore original
spy.mockRestore();
```

### Fake

Working implementation for tests.

```typescript
// Fake repository
class FakeUserRepository implements UserRepository {
  private users = new Map<string, User>();
  
  async save(user: User): Promise<void> {
    this.users.set(user.id, { ...user });
  }
  
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find(u => u.email === email) ?? null;
  }
  
  // Test helper
  clear(): void {
    this.users.clear();
  }
}

// Usage
describe('UserService', () => {
  let repository: FakeUserRepository;
  let service: UserService;
  
  beforeEach(() => {
    repository = new FakeUserRepository();
    service = new UserService(repository);
  });
  
  it('creates and retrieves user', async () => {
    const user = await service.createUser({ email: 'test@example.com', name: 'Test' });
    const found = await service.getUser(user.id);
    expect(found).toEqual(user);
  });
});
```

## Jest Mocking Patterns

### Module Mocking

```typescript
// Mock entire module
jest.mock('../database', () => ({
  query: jest.fn().mockResolvedValue([]),
  connect: jest.fn().mockResolvedValue(true),
}));

// Mock with factory
jest.mock('../emailService', () => {
  return {
    EmailService: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({ sent: true }),
    })),
  };
});

// Partial mock (keep some real implementations)
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  formatDate: jest.fn().mockReturnValue('2024-01-01'),
}));
```

### Manual Mocks

```typescript
// __mocks__/axios.ts
export default {
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  create: jest.fn(() => ({
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
  })),
};

// In test file
jest.mock('axios');
import axios from 'axios';

it('fetches data', async () => {
  (axios.get as jest.Mock).mockResolvedValue({ data: { id: '1' } });
  // ...
});
```

### Mock Reset and Restore

```typescript
describe('with mocks', () => {
  const mockFn = jest.fn();
  
  beforeEach(() => {
    // Clear call history, keep implementation
    mockFn.mockClear();
    
    // Or reset everything including implementation
    // mockFn.mockReset();
  });
  
  afterAll(() => {
    // Restore original (for spies)
    // mockFn.mockRestore();
  });
});

// Clear all mocks at once
afterEach(() => {
  jest.clearAllMocks();
});
```

## Dependency Injection for Testing

### Constructor Injection

```typescript
// Production code
class OrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService
  ) {}
  
  async createOrder(data: CreateOrderData): Promise<Order> {
    const order = await this.repository.create(data);
    await this.paymentService.charge(order.total);
    await this.emailService.sendConfirmation(order);
    return order;
  }
}

// Test
describe('OrderService', () => {
  let service: OrderService;
  let mockRepository: jest.Mocked<OrderRepository>;
  let mockPayment: jest.Mocked<PaymentService>;
  let mockEmail: jest.Mocked<EmailService>;
  
  beforeEach(() => {
    mockRepository = {
      create: jest.fn().mockResolvedValue({ id: 'ord-1', total: 100 }),
      findById: jest.fn(),
    };
    mockPayment = {
      charge: jest.fn().mockResolvedValue({ success: true }),
    };
    mockEmail = {
      sendConfirmation: jest.fn().mockResolvedValue(undefined),
    };
    
    service = new OrderService(mockRepository, mockPayment, mockEmail);
  });
  
  it('creates order and charges payment', async () => {
    await service.createOrder({ items: [] });
    
    expect(mockPayment.charge).toHaveBeenCalledWith(100);
  });
});
```

### Factory Functions for Mocks

```typescript
// __mocks__/factories.ts
export function createMockOrderRepository(): jest.Mocked<OrderRepository> {
  return {
    create: jest.fn().mockResolvedValue({ id: 'ord-1', total: 100 }),
    findById: jest.fn().mockResolvedValue(null),
    findByCustomer: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ id: 'ord-1' }),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}

export function createMockPaymentService(): jest.Mocked<PaymentService> {
  return {
    charge: jest.fn().mockResolvedValue({ id: 'pay-1', success: true }),
    refund: jest.fn().mockResolvedValue({ id: 'ref-1', success: true }),
  };
}

// Usage
beforeEach(() => {
  mockRepository = createMockOrderRepository();
  mockPayment = createMockPaymentService();
  service = new OrderService(mockRepository, mockPayment);
});
```

## Mocking Specific Scenarios

### Mocking HTTP Requests

```typescript
// With fetch
global.fetch = jest.fn();

beforeEach(() => {
  (fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
  });
});

it('fetches data', async () => {
  const result = await fetchData('/api/data');
  
  expect(fetch).toHaveBeenCalledWith('/api/data', expect.any(Object));
  expect(result).toEqual({ data: 'test' });
});

// With axios
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

it('posts data', async () => {
  mockedAxios.post.mockResolvedValue({ data: { id: '1' } });
  
  const result = await createUser({ name: 'Test' });
  
  expect(mockedAxios.post).toHaveBeenCalledWith('/api/users', { name: 'Test' });
});
```

### Mocking Timers

```typescript
describe('with timers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('debounces function calls', async () => {
    const callback = jest.fn();
    const debounced = debounce(callback, 1000);
    
    debounced();
    debounced();
    debounced();
    
    expect(callback).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalledTimes(1);
  });
  
  it('retries with exponential backoff', async () => {
    const failingFn = jest.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');
    
    const promise = retryWithBackoff(failingFn, { maxRetries: 3 });
    
    // First attempt fails immediately
    await jest.advanceTimersByTimeAsync(0);
    expect(failingFn).toHaveBeenCalledTimes(1);
    
    // Wait for first backoff (1s)
    await jest.advanceTimersByTimeAsync(1000);
    expect(failingFn).toHaveBeenCalledTimes(2);
    
    // Wait for second backoff (2s)
    await jest.advanceTimersByTimeAsync(2000);
    expect(failingFn).toHaveBeenCalledTimes(3);
    
    await expect(promise).resolves.toBe('success');
  });
});
```

### Mocking Date/Time

```typescript
describe('with dates', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('formats current date', () => {
    expect(formatCurrentDate()).toBe('January 15, 2024');
  });
  
  it('calculates days until expiry', () => {
    const expiry = new Date('2024-01-20T10:00:00Z');
    expect(daysUntil(expiry)).toBe(5);
  });
});
```

### Mocking Environment Variables

```typescript
describe('with env vars', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    process.env = { ...originalEnv };
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  it('uses production API in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.API_URL = 'https://api.example.com';
    
    expect(getApiUrl()).toBe('https://api.example.com');
  });
  
  it('uses localhost in development', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.API_URL;
    
    expect(getApiUrl()).toBe('http://localhost:3000');
  });
});
```

### Mocking File System

```typescript
import fs from 'fs';
import path from 'path';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('FileReader', () => {
  it('reads file content', () => {
    mockFs.readFileSync.mockReturnValue('file content');
    
    const result = readConfig('/path/to/config.json');
    
    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      '/path/to/config.json',
      'utf-8'
    );
    expect(result).toBe('file content');
  });
  
  it('handles file not found', () => {
    mockFs.readFileSync.mockImplementation(() => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      throw error;
    });
    
    expect(() => readConfig('/nonexistent')).toThrow('Config file not found');
  });
});
```

## Verifying Mock Interactions

```typescript
describe('interaction verification', () => {
  it('verifies call count', () => {
    expect(mock).toHaveBeenCalledTimes(3);
    expect(mock).toHaveBeenCalled(); // At least once
    expect(mock).not.toHaveBeenCalled();
  });
  
  it('verifies call arguments', () => {
    expect(mock).toHaveBeenCalledWith('arg1', 'arg2');
    expect(mock).toHaveBeenCalledWith(expect.any(String));
    expect(mock).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    expect(mock).toHaveBeenLastCalledWith('final call');
    expect(mock).toHaveBeenNthCalledWith(1, 'first call');
  });
  
  it('verifies call order', () => {
    const mock1 = jest.fn();
    const mock2 = jest.fn();
    
    // ... code that calls mock1 then mock2
    
    const mock1Order = mock1.mock.invocationCallOrder[0];
    const mock2Order = mock2.mock.invocationCallOrder[0];
    expect(mock1Order).toBeLessThan(mock2Order);
  });
  
  it('accesses call arguments', () => {
    mock('call1');
    mock('call2');
    
    expect(mock.mock.calls[0][0]).toBe('call1');
    expect(mock.mock.calls[1][0]).toBe('call2');
  });
});
```

## Common Mistakes

### Over-Mocking

```typescript
// BAD: Mocking everything
it('processes order', () => {
  const mockOrder = { id: '1', total: 100 };
  const mockResult = { success: true };
  
  jest.spyOn(orderService, 'process').mockReturnValue(mockResult);
  
  const result = orderService.process(mockOrder);
  
  expect(result).toBe(mockResult); // Tests nothing!
});

// GOOD: Mock only external dependencies
it('processes order', () => {
  mockPaymentService.charge.mockResolvedValue({ success: true });
  mockRepository.save.mockResolvedValue({ id: '1' });
  
  const result = await orderService.process(testOrder);
  
  expect(result.success).toBe(true);
  expect(mockPaymentService.charge).toHaveBeenCalledWith(testOrder.total);
});
```

### Forgetting to Reset Mocks

```typescript
// BAD: Mocks leak between tests
const mock = jest.fn();

it('first test', () => {
  mock('first');
  expect(mock).toHaveBeenCalledTimes(1);
});

it('second test', () => {
  mock('second');
  expect(mock).toHaveBeenCalledTimes(1); // FAILS! Called twice total
});

// GOOD: Reset between tests
beforeEach(() => {
  mock.mockClear();
});
```

### Mock Implementation vs Return Value

```typescript
// mockReturnValue - simple return
mock.mockReturnValue(42);

// mockImplementation - custom logic
mock.mockImplementation((x) => x * 2);

// For async
mock.mockResolvedValue(42);
mock.mockImplementation(async (x) => {
  await delay(100);
  return x * 2;
});

// For errors
mock.mockRejectedValue(new Error('Failed'));
mock.mockImplementation(() => {
  throw new Error('Sync error');
});
```
