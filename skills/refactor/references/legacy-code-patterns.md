# Legacy Code Patterns

Techniques for working with code that has no tests.

## The Legacy Code Dilemma

**Problem:** Need tests to refactor safely, but code is untestable without refactoring.

**Solution:** Make tiny, safe changes to get code under test, then refactor properly.

## Characterization Tests

Tests that capture current behavior, not expected behavior.

### Writing Characterization Tests

```typescript
// Step 1: Call the code and see what happens
it('characterizes calculateDiscount behavior', () => {
  const order = { items: [...], customer: {...} };
  const result = calculateDiscount(order);
  console.log(result); // Run once to see: 127.50
});

// Step 2: Assert the actual output
it('characterizes calculateDiscount behavior', () => {
  const order = { items: [...], customer: {...} };
  const result = calculateDiscount(order);
  expect(result).toBe(127.50); // Now we have a safety net
});
```

### Characterization Test Process

```markdown
1. Find a code path you need to test
2. Write a test that calls the code
3. Run it and observe the output
4. Assert that output (even if it seems wrong)
5. Repeat for different inputs
6. Now you can refactor safely
```

### Example: Complex Function

```typescript
// Legacy code with no tests
function processOrder(order: any): any {
  // 200 lines of complex logic
  // Nobody knows exactly what it does
}

// Characterization tests
describe('processOrder characterization', () => {
  it('handles empty order', () => {
    const result = processOrder({ items: [] });
    expect(result).toEqual({ status: 'error', message: 'No items' });
  });

  it('handles single item order', () => {
    const order = {
      items: [{ sku: 'ABC', qty: 1, price: 10 }],
      customer: { id: 'C1', tier: 'gold' }
    };
    const result = processOrder(order);
    expect(result).toMatchSnapshot(); // Capture complex output
  });

  it('applies gold customer discount', () => {
    const order = {
      items: [{ sku: 'ABC', qty: 1, price: 100 }],
      customer: { id: 'C1', tier: 'gold' }
    };
    const result = processOrder(order);
    expect(result.total).toBe(90); // 10% discount observed
  });
});
```

## Seams

Points where you can alter behavior without editing code.

### Types of Seams

| Seam Type | How It Works | Example |
|-----------|--------------|---------|
| **Object Seam** | Override via subclass/injection | Replace database with mock |
| **Link Seam** | Replace at link time | Different library in test |
| **Preprocessing Seam** | Conditional compilation | #ifdef TEST |

### Object Seam Example

```typescript
// Legacy code - hard to test
class OrderProcessor {
  process(order: Order): void {
    // Complex logic...
    this.database.save(order);
    this.emailService.sendConfirmation(order.customer);
  }

  private database = new Database();
  private emailService = new EmailService();
}

// Step 1: Extract seams (minimal change)
class OrderProcessor {
  process(order: Order): void {
    // Complex logic...
    this.getDatabase().save(order);
    this.getEmailService().sendConfirmation(order.customer);
  }

  protected getDatabase(): Database {
    return new Database();
  }

  protected getEmailService(): EmailService {
    return new EmailService();
  }
}

// Step 2: Test via subclass
class TestableOrderProcessor extends OrderProcessor {
  public mockDatabase = new MockDatabase();
  public mockEmail = new MockEmailService();

  protected getDatabase(): Database {
    return this.mockDatabase;
  }

  protected getEmailService(): EmailService {
    return this.mockEmail;
  }
}

// Step 3: Write tests
it('saves order to database', () => {
  const processor = new TestableOrderProcessor();
  processor.process(testOrder);
  expect(processor.mockDatabase.savedOrders).toContain(testOrder);
});
```

### Dependency Injection Seam

```typescript
// Legacy: Dependencies created internally
class PaymentProcessor {
  process(payment: Payment): void {
    const stripe = new StripeClient(process.env.STRIPE_KEY);
    stripe.charge(payment);
  }
}

// Step 1: Constructor injection (minimal change)
class PaymentProcessor {
  private stripeClient: StripeClient;

  constructor(stripeClient?: StripeClient) {
    this.stripeClient = stripeClient ?? new StripeClient(process.env.STRIPE_KEY);
  }

  process(payment: Payment): void {
    this.stripeClient.charge(payment);
  }
}

// Step 2: Now testable
it('charges via Stripe', () => {
  const mockStripe = { charge: jest.fn() };
  const processor = new PaymentProcessor(mockStripe);

  processor.process(testPayment);

  expect(mockStripe.charge).toHaveBeenCalledWith(testPayment);
});
```

## Sprout Methods

Add new functionality in a tested method, call from legacy code.

### Sprout Method Process

```markdown
1. Identify where new code needs to go
2. Write new code as a separate, tested method
3. Call the new method from the legacy code
```

```typescript
// Legacy code - untested mess
class InvoiceProcessor {
  process(invoice: Invoice): void {
    // 100 lines of untested code
    // ...
    // Need to add: tax calculation
    // ...
    // 100 more lines
  }
}

// Step 1: Write new functionality with tests
class InvoiceProcessor {
  // NEW: Tested method
  calculateTax(invoice: Invoice): number {
    const taxRate = this.getTaxRate(invoice.region);
    return invoice.subtotal * taxRate;
  }

  private getTaxRate(region: string): number {
    const rates: Record<string, number> = {
      'CA': 0.0725,
      'NY': 0.08,
      'TX': 0.0625,
    };
    return rates[region] ?? 0;
  }

  process(invoice: Invoice): void {
    // 100 lines of untested code
    // ...
    invoice.tax = this.calculateTax(invoice); // Call sprouted method
    // ...
    // 100 more lines
  }
}

// Tests for new functionality
describe('calculateTax', () => {
  it('calculates CA tax correctly', () => {
    const invoice = { subtotal: 100, region: 'CA' };
    expect(processor.calculateTax(invoice)).toBe(7.25);
  });
});
```

## Sprout Classes

When sprouting a method isn't enough, create a new class.

```typescript
// Legacy code
class OrderService {
  submitOrder(order: Order): void {
    // 500 lines of legacy code
    // Need to add: fraud detection
  }
}

// Step 1: Create new tested class
class FraudDetector {
  constructor(private readonly rules: FraudRule[]) {}

  check(order: Order): FraudResult {
    for (const rule of this.rules) {
      const result = rule.evaluate(order);
      if (result.isFraudulent) {
        return result;
      }
    }
    return { isFraudulent: false };
  }
}

// Step 2: Call from legacy code
class OrderService {
  private fraudDetector = new FraudDetector(this.loadRules());

  submitOrder(order: Order): void {
    // Check for fraud first (new, tested code)
    const fraudResult = this.fraudDetector.check(order);
    if (fraudResult.isFraudulent) {
      throw new FraudDetectedError(fraudResult);
    }

    // 500 lines of legacy code continues...
  }
}
```

## Wrap Method

Wrap existing method to add behavior before/after.

```typescript
// Legacy code
class Employee {
  pay(): void {
    // Complex payroll logic
    Money amount = this.calculatePay();
    this.dispatchPayment(amount);
  }
}

// Need to add logging
// Step 1: Rename existing method
class Employee {
  private dispatchPayroll(): void {
    Money amount = this.calculatePay();
    this.dispatchPayment(amount);
  }
}

// Step 2: Create wrapper with old name
class Employee {
  pay(): void {
    this.logPayment();        // New behavior
    this.dispatchPayroll();   // Original behavior
  }

  private logPayment(): void {
    this.auditLog.record('payment', this.id, new Date());
  }

  private dispatchPayroll(): void {
    Money amount = this.calculatePay();
    this.dispatchPayment(amount);
  }
}
```

## Breaking Dependencies

### Extract Interface

```typescript
// Legacy: Concrete dependency
class OrderProcessor {
  constructor(private db: PostgresDatabase) {}
}

// Step 1: Extract interface
interface Database {
  save(entity: Entity): void;
  find(id: string): Entity | null;
}

class PostgresDatabase implements Database {
  save(entity: Entity): void { /* ... */ }
  find(id: string): Entity | null { /* ... */ }
}

// Step 2: Depend on interface
class OrderProcessor {
  constructor(private db: Database) {}
}

// Step 3: Create test double
class InMemoryDatabase implements Database {
  private data = new Map<string, Entity>();

  save(entity: Entity): void {
    this.data.set(entity.id, entity);
  }

  find(id: string): Entity | null {
    return this.data.get(id) ?? null;
  }
}
```

### Parameterize Constructor

```typescript
// Legacy: Hardcoded dependencies
class ReportGenerator {
  private formatter = new PdfFormatter();
  private sender = new EmailSender();

  generate(data: ReportData): void {
    const pdf = this.formatter.format(data);
    this.sender.send(pdf);
  }
}

// Step 1: Add parameters with defaults
class ReportGenerator {
  private formatter: Formatter;
  private sender: Sender;

  constructor(
    formatter: Formatter = new PdfFormatter(),
    sender: Sender = new EmailSender()
  ) {
    this.formatter = formatter;
    this.sender = sender;
  }
}

// Production code unchanged
const generator = new ReportGenerator();

// Test code can inject mocks
const generator = new ReportGenerator(mockFormatter, mockSender);
```

### Extract and Override Call

```typescript
// Legacy: Static method call
class PriceCalculator {
  calculate(items: Item[]): number {
    let total = 0;
    for (const item of items) {
      total += item.price * TaxService.getCurrentRate(); // Static call!
    }
    return total;
  }
}

// Step 1: Extract to instance method
class PriceCalculator {
  calculate(items: Item[]): number {
    let total = 0;
    for (const item of items) {
      total += item.price * this.getTaxRate(); // Instance method
    }
    return total;
  }

  protected getTaxRate(): number {
    return TaxService.getCurrentRate();
  }
}

// Step 2: Override in test
class TestablePriceCalculator extends PriceCalculator {
  public taxRate = 0.1;

  protected getTaxRate(): number {
    return this.taxRate;
  }
}

it('calculates with tax', () => {
  const calc = new TestablePriceCalculator();
  calc.taxRate = 0.1;

  const result = calc.calculate([{ price: 100 }]);

  expect(result).toBe(110);
});
```

## Golden Master Testing

For code that produces complex output.

```typescript
// Step 1: Generate golden master
function generateGoldenMaster(): void {
  const inputs = loadProductionInputs(); // Real data samples
  const results = inputs.map(input => ({
    input,
    output: legacyFunction(input)
  }));
  fs.writeFileSync('golden-master.json', JSON.stringify(results, null, 2));
}

// Step 2: Test against golden master
describe('legacyFunction', () => {
  const goldenMaster = JSON.parse(fs.readFileSync('golden-master.json'));

  goldenMaster.forEach(({ input, output }, index) => {
    it(`matches golden master case ${index}`, () => {
      expect(legacyFunction(input)).toEqual(output);
    });
  });
});

// Step 3: Now safe to refactor
// If tests pass, behavior is preserved
```

## Safe Refactoring Moves

Changes that are safe without tests (if done carefully):

| Change | Safety | Notes |
|--------|--------|-------|
| Rename variable | Very safe | IDE refactoring |
| Rename method | Safe | IDE refactoring, check all usages |
| Extract variable | Safe | No behavior change |
| Extract method | Safe | If done mechanically |
| Inline variable | Safe | Simple substitution |
| Reorder methods | Very safe | No behavior change |
| Add whitespace | Very safe | No behavior change |
| Extract interface | Safe | Adding, not changing |

## Risky Changes Without Tests

| Change | Risk | Why |
|--------|------|-----|
| Change conditional | High | Easy to change behavior |
| Change loop | High | Off-by-one errors |
| Change method signature | Medium | Can break callers |
| Move code between methods | Medium | Side effect changes |
| Remove code | High | Might be needed |
| Optimize | High | Subtle behavior changes |
