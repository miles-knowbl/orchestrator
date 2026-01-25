# Unit Test Patterns

Patterns and examples for effective unit tests.

## Unit Test Characteristics

| Characteristic | Description |
|----------------|-------------|
| **Fast** | Runs in <10ms |
| **Isolated** | No external dependencies |
| **Repeatable** | Same result every run |
| **Self-validating** | Pass or fail, no manual inspection |
| **Timely** | Written with or before the code |

## Basic Patterns

### Simple Function Test

```typescript
// Code under test
function add(a: number, b: number): number {
  return a + b;
}

// Tests
describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  
  it('adds negative numbers', () => {
    expect(add(-2, -3)).toBe(-5);
  });
  
  it('adds zero', () => {
    expect(add(5, 0)).toBe(5);
  });
});
```

### Class Method Test

```typescript
// Code under test
class Calculator {
  private memory: number = 0;
  
  add(value: number): number {
    this.memory += value;
    return this.memory;
  }
  
  clear(): void {
    this.memory = 0;
  }
  
  getMemory(): number {
    return this.memory;
  }
}

// Tests
describe('Calculator', () => {
  let calculator: Calculator;
  
  beforeEach(() => {
    calculator = new Calculator();
  });
  
  describe('add', () => {
    it('adds value to memory', () => {
      calculator.add(5);
      expect(calculator.getMemory()).toBe(5);
    });
    
    it('accumulates multiple additions', () => {
      calculator.add(5);
      calculator.add(3);
      expect(calculator.getMemory()).toBe(8);
    });
    
    it('returns new memory value', () => {
      const result = calculator.add(5);
      expect(result).toBe(5);
    });
  });
  
  describe('clear', () => {
    it('resets memory to zero', () => {
      calculator.add(10);
      calculator.clear();
      expect(calculator.getMemory()).toBe(0);
    });
  });
});
```

### Async Function Test

```typescript
// Code under test
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
}

// Tests
describe('fetchUser', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  
  it('returns user data on success', async () => {
    const mockUser = { id: '1', name: 'Alice' };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser)
    });
    
    const result = await fetchUser('1');
    
    expect(result).toEqual(mockUser);
  });
  
  it('throws error when user not found', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });
    
    await expect(fetchUser('999')).rejects.toThrow('User not found');
  });
  
  it('calls correct endpoint', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    });
    
    await fetchUser('123');
    
    expect(fetch).toHaveBeenCalledWith('/api/users/123');
  });
});
```

## Testing Patterns

### Testing Validation

```typescript
// Code under test
function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (email.length > 254) {
    return { valid: false, error: 'Email too long' };
  }
  return { valid: true };
}

// Tests
describe('validateEmail', () => {
  describe('valid emails', () => {
    it.each([
      'user@example.com',
      'user.name@example.com',
      'user+tag@example.com',
      'a@b.co',
    ])('accepts %s', (email) => {
      expect(validateEmail(email).valid).toBe(true);
    });
  });
  
  describe('invalid emails', () => {
    it('rejects empty string', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });
    
    it('rejects missing @', () => {
      const result = validateEmail('userexample.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });
    
    it('rejects too long email', () => {
      const longEmail = 'a'.repeat(250) + '@b.com';
      const result = validateEmail(longEmail);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email too long');
    });
  });
});
```

### Testing State Machines

```typescript
// Code under test
class OrderStateMachine {
  private state: OrderState = 'pending';
  
  getState(): OrderState {
    return this.state;
  }
  
  confirm(): void {
    if (this.state !== 'pending') {
      throw new Error('Can only confirm pending orders');
    }
    this.state = 'confirmed';
  }
  
  ship(): void {
    if (this.state !== 'confirmed') {
      throw new Error('Can only ship confirmed orders');
    }
    this.state = 'shipped';
  }
  
  cancel(): void {
    if (this.state === 'shipped') {
      throw new Error('Cannot cancel shipped orders');
    }
    this.state = 'cancelled';
  }
}

// Tests
describe('OrderStateMachine', () => {
  let machine: OrderStateMachine;
  
  beforeEach(() => {
    machine = new OrderStateMachine();
  });
  
  describe('initial state', () => {
    it('starts in pending state', () => {
      expect(machine.getState()).toBe('pending');
    });
  });
  
  describe('confirm', () => {
    it('transitions from pending to confirmed', () => {
      machine.confirm();
      expect(machine.getState()).toBe('confirmed');
    });
    
    it('throws when already confirmed', () => {
      machine.confirm();
      expect(() => machine.confirm()).toThrow('Can only confirm pending orders');
    });
  });
  
  describe('ship', () => {
    it('transitions from confirmed to shipped', () => {
      machine.confirm();
      machine.ship();
      expect(machine.getState()).toBe('shipped');
    });
    
    it('throws when pending', () => {
      expect(() => machine.ship()).toThrow('Can only ship confirmed orders');
    });
  });
  
  describe('cancel', () => {
    it('can cancel pending order', () => {
      machine.cancel();
      expect(machine.getState()).toBe('cancelled');
    });
    
    it('can cancel confirmed order', () => {
      machine.confirm();
      machine.cancel();
      expect(machine.getState()).toBe('cancelled');
    });
    
    it('cannot cancel shipped order', () => {
      machine.confirm();
      machine.ship();
      expect(() => machine.cancel()).toThrow('Cannot cancel shipped orders');
    });
  });
});
```

### Testing Callbacks and Events

```typescript
// Code under test
class EventEmitter {
  private listeners = new Map<string, Set<Function>>();
  
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }
  
  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

// Tests
describe('EventEmitter', () => {
  let emitter: EventEmitter;
  
  beforeEach(() => {
    emitter = new EventEmitter();
  });
  
  it('calls listener when event emitted', () => {
    const listener = jest.fn();
    emitter.on('test', listener);
    
    emitter.emit('test');
    
    expect(listener).toHaveBeenCalled();
  });
  
  it('passes data to listener', () => {
    const listener = jest.fn();
    emitter.on('test', listener);
    
    emitter.emit('test', { value: 42 });
    
    expect(listener).toHaveBeenCalledWith({ value: 42 });
  });
  
  it('calls multiple listeners', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    emitter.on('test', listener1);
    emitter.on('test', listener2);
    
    emitter.emit('test');
    
    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });
  
  it('does not call listeners for other events', () => {
    const listener = jest.fn();
    emitter.on('other', listener);
    
    emitter.emit('test');
    
    expect(listener).not.toHaveBeenCalled();
  });
});
```

### Testing Time-Dependent Code

```typescript
// Code under test
class TokenExpiry {
  constructor(private expiresAt: Date) {}
  
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
  
  timeRemaining(): number {
    const remaining = this.expiresAt.getTime() - Date.now();
    return Math.max(0, remaining);
  }
}

// Tests
describe('TokenExpiry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  describe('isExpired', () => {
    it('returns false when token not expired', () => {
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const token = new TokenExpiry(new Date('2024-01-01T13:00:00Z'));
      
      expect(token.isExpired()).toBe(false);
    });
    
    it('returns true when token expired', () => {
      jest.setSystemTime(new Date('2024-01-01T14:00:00Z'));
      const token = new TokenExpiry(new Date('2024-01-01T13:00:00Z'));
      
      expect(token.isExpired()).toBe(true);
    });
    
    it('returns true exactly at expiry time', () => {
      const expiryTime = new Date('2024-01-01T13:00:00Z');
      jest.setSystemTime(expiryTime);
      const token = new TokenExpiry(expiryTime);
      
      // Advance 1ms past expiry
      jest.advanceTimersByTime(1);
      
      expect(token.isExpired()).toBe(true);
    });
  });
  
  describe('timeRemaining', () => {
    it('returns remaining milliseconds', () => {
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const token = new TokenExpiry(new Date('2024-01-01T13:00:00Z'));
      
      expect(token.timeRemaining()).toBe(3600000); // 1 hour in ms
    });
    
    it('returns 0 when expired', () => {
      jest.setSystemTime(new Date('2024-01-01T14:00:00Z'));
      const token = new TokenExpiry(new Date('2024-01-01T13:00:00Z'));
      
      expect(token.timeRemaining()).toBe(0);
    });
  });
});
```

### Testing Random/Non-Deterministic Code

```typescript
// Code under test
class IdGenerator {
  constructor(private randomFn: () => number = Math.random) {}
  
  generate(): string {
    const timestamp = Date.now().toString(36);
    const random = this.randomFn().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }
}

// Tests
describe('IdGenerator', () => {
  it('generates id with timestamp prefix', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
    
    const generator = new IdGenerator(() => 0.123456);
    const id = generator.generate();
    
    expect(id).toMatch(/^[a-z0-9]+-/);
    jest.useRealTimers();
  });
  
  it('generates unique ids', () => {
    let counter = 0;
    const mockRandom = () => ++counter / 1000000;
    const generator = new IdGenerator(mockRandom);
    
    const ids = new Set([
      generator.generate(),
      generator.generate(),
      generator.generate(),
    ]);
    
    expect(ids.size).toBe(3);
  });
  
  it('uses injected random function', () => {
    const mockRandom = jest.fn().mockReturnValue(0.5);
    const generator = new IdGenerator(mockRandom);
    
    generator.generate();
    
    expect(mockRandom).toHaveBeenCalled();
  });
});
```

## Parameterized Tests

### Using it.each

```typescript
describe('isEven', () => {
  it.each([
    [0, true],
    [1, false],
    [2, true],
    [3, false],
    [-2, true],
    [-1, false],
  ])('isEven(%i) returns %s', (input, expected) => {
    expect(isEven(input)).toBe(expected);
  });
});

// With named parameters
describe('calculateDiscount', () => {
  it.each`
    total    | customerType  | expected
    ${100}   | ${'regular'}  | ${0}
    ${100}   | ${'gold'}     | ${10}
    ${100}   | ${'platinum'} | ${20}
    ${500}   | ${'regular'}  | ${25}
    ${500}   | ${'gold'}     | ${75}
  `('calculates $expected discount for $customerType with $total total',
    ({ total, customerType, expected }) => {
      expect(calculateDiscount(total, customerType)).toBe(expected);
    }
  );
});
```

## Test Doubles Comparison

| Type | Purpose | Example |
|------|---------|---------|
| **Dummy** | Fill parameters, never used | `processOrder(order, dummyLogger)` |
| **Stub** | Return canned data | `stub.getUser.mockReturnValue(testUser)` |
| **Spy** | Record calls, use real impl | `jest.spyOn(service, 'save')` |
| **Mock** | Verify interactions | `expect(mock.save).toHaveBeenCalledWith(...)` |
| **Fake** | Working simplified impl | `new InMemoryRepository()` |

## Anti-Patterns to Avoid

### Testing Implementation Details

```typescript
// BAD: Tests internal state
it('sets internal flag', () => {
  service.process(data);
  expect((service as any)._processed).toBe(true); // Accessing private
});

// GOOD: Tests observable behavior
it('marks item as processed', () => {
  service.process(data);
  expect(service.isProcessed(data.id)).toBe(true);
});
```

### Over-Mocking

```typescript
// BAD: Mocking the thing under test
const mockCalculator = { add: jest.fn().mockReturnValue(5) };
expect(mockCalculator.add(2, 3)).toBe(5); // Tests nothing!

// GOOD: Mock dependencies, not the subject
const mockRepository = { save: jest.fn() };
const service = new OrderService(mockRepository);
service.createOrder(data);
expect(mockRepository.save).toHaveBeenCalled();
```

### Test Interdependence

```typescript
// BAD: Tests depend on each other
let user: User;

it('creates user', () => {
  user = createUser({ name: 'Test' });
  expect(user.id).toBeDefined();
});

it('updates user', () => {
  updateUser(user.id, { name: 'Updated' }); // Depends on previous test!
});

// GOOD: Independent tests
it('creates user', () => {
  const user = createUser({ name: 'Test' });
  expect(user.id).toBeDefined();
});

it('updates user', () => {
  const user = createUser({ name: 'Test' }); // Creates own test data
  updateUser(user.id, { name: 'Updated' });
  expect(getUser(user.id).name).toBe('Updated');
});
```
