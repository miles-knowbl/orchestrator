# Code Smells

A comprehensive catalog of code smells and how to identify them.

## What Are Code Smells?

Code smells are surface indications that usually correspond to deeper problems in the system. They're not bugs—the code works—but they indicate weakness in design that may slow development or increase risk of bugs in the future.

## Bloaters

Code that has grown too large to handle effectively.

### Long Method

**Symptoms:**
- Method is longer than 20 lines
- Need to scroll to see the whole method
- Multiple levels of abstraction in one method
- Comments separating "sections" within a method

**Example:**
```typescript
// SMELL: Method does too many things
function processOrder(order: Order): Result {
  // Validate order (10 lines)
  // Calculate totals (15 lines)
  // Check inventory (20 lines)
  // Process payment (25 lines)
  // Send notifications (15 lines)
  // Update database (10 lines)
}
```

**Refactorings:**
- Extract Method
- Replace Temp with Query
- Introduce Parameter Object
- Decompose Conditional

### Large Class

**Symptoms:**
- Class has >300 lines
- Class has >10 methods
- Class has >5 instance variables
- Class name includes "And" or "Manager"
- Hard to summarize what the class does

**Example:**
```typescript
// SMELL: Class does too many unrelated things
class UserManager {
  // User CRUD (50 lines)
  // Authentication (100 lines)
  // Password hashing (50 lines)
  // Email sending (75 lines)
  // Session management (50 lines)
  // Audit logging (40 lines)
}
```

**Refactorings:**
- Extract Class
- Extract Subclass
- Extract Interface

### Long Parameter List

**Symptoms:**
- More than 3-4 parameters
- Parameters often passed together
- Hard to remember parameter order
- Boolean parameters control behavior

**Example:**
```typescript
// SMELL: Too many parameters
function createUser(
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  street: string,
  city: string,
  state: string,
  zip: string,
  country: string,
  isAdmin: boolean,
  sendWelcomeEmail: boolean
): User { }
```

**Refactorings:**
- Introduce Parameter Object
- Preserve Whole Object
- Replace Parameter with Method Call

### Primitive Obsession

**Symptoms:**
- Using strings for phone numbers, emails, money
- Using numbers for IDs, amounts, distances
- Using arrays for structured data
- Constants for "type codes"

**Example:**
```typescript
// SMELL: Primitives for domain concepts
function processPayment(
  amount: number,        // Cents? Dollars? What currency?
  cardNumber: string,    // No validation
  expiry: string,        // What format?
  customerId: string     // Could be any string
): void { }
```

**Refactorings:**
- Replace Primitive with Value Object
- Replace Type Code with Class
- Replace Type Code with Subclasses

### Data Clumps

**Symptoms:**
- Same 3+ fields appear together in multiple places
- Parameters that always travel together
- Fields that are always used together

**Example:**
```typescript
// SMELL: These three always appear together
function validateAddress(street: string, city: string, zip: string): boolean { }
function formatAddress(street: string, city: string, zip: string): string { }
function geocodeAddress(street: string, city: string, zip: string): Coords { }

class Customer {
  billingStreet: string;
  billingCity: string;
  billingZip: string;
  shippingStreet: string;
  shippingCity: string;
  shippingZip: string;
}
```

**Refactorings:**
- Extract Class
- Introduce Parameter Object
- Preserve Whole Object

## Object-Orientation Abusers

Code that doesn't use OO principles effectively.

### Switch Statements

**Symptoms:**
- Switch on type/enum in multiple places
- Adding new type requires changes in multiple files
- Switch in methods that should be polymorphic

**Example:**
```typescript
// SMELL: Type switch appears everywhere
function calculateArea(shape: Shape): number {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    case 'triangle': return 0.5 * shape.base * shape.height;
  }
}

function draw(shape: Shape): void {
  switch (shape.type) {
    case 'circle': drawCircle(shape);
    case 'rectangle': drawRectangle(shape);
    case 'triangle': drawTriangle(shape);
  }
}
```

**Refactorings:**
- Replace Conditional with Polymorphism
- Replace Type Code with Subclasses
- Replace Type Code with State/Strategy

### Refused Bequest

**Symptoms:**
- Subclass doesn't use most inherited methods
- Subclass overrides methods to do nothing
- "Is-a" relationship doesn't make sense

**Example:**
```typescript
// SMELL: Stack isn't really a List
class Stack extends ArrayList {
  push(item: T): void { this.add(item); }
  pop(): T { return this.remove(this.size() - 1); }

  // Inherited but shouldn't be used:
  // add(index, item), remove(index), get(index), etc.
}
```

**Refactorings:**
- Replace Inheritance with Delegation
- Extract Superclass
- Push Down Method

### Temporary Field

**Symptoms:**
- Instance variables only used in some methods
- Variables set to null/undefined when not needed
- Fields that only make sense in certain states

**Example:**
```typescript
// SMELL: These fields only used in one method
class Order {
  // Always used
  items: Item[];
  total: number;

  // Only used during checkout
  tempShippingCost: number | null;
  tempTaxAmount: number | null;
  tempDiscountApplied: boolean;
}
```

**Refactorings:**
- Extract Class
- Replace Method with Method Object
- Introduce Null Object

## Change Preventers

Code that makes changes difficult.

### Divergent Change

**Symptoms:**
- One class changes for different reasons
- Different developers change same file for unrelated features
- "God class" that knows everything

**Example:**
```typescript
// SMELL: Changes for different reasons
class Employee {
  // Changes when: HR policy changes
  calculatePay(): number { }

  // Changes when: Reporting requirements change
  generateReport(): string { }

  // Changes when: Database schema changes
  save(): void { }
}
```

**Refactorings:**
- Extract Class
- Extract Module

### Shotgun Surgery

**Symptoms:**
- Small change requires edits to many files
- Related code scattered across codebase
- Easy to miss one place when making changes

**Example:**
```typescript
// SMELL: Adding a new field requires changes everywhere
// user.ts
interface User { email: string; /* need to add phone */ }

// userForm.ts
// need to add phone input

// userValidation.ts
// need to add phone validation

// userRepository.ts
// need to add phone to queries

// userApi.ts
// need to add phone to serialization
```

**Refactorings:**
- Move Method
- Move Field
- Inline Class

### Parallel Inheritance Hierarchies

**Symptoms:**
- Creating subclass in one hierarchy requires subclass in another
- Class names have same prefix in different hierarchies
- Hierarchies evolve together

**Example:**
```typescript
// SMELL: Every Shape needs a ShapeRenderer
class Shape { }
class Circle extends Shape { }
class Rectangle extends Shape { }

class ShapeRenderer { }
class CircleRenderer extends ShapeRenderer { }
class RectangleRenderer extends ShapeRenderer { }
```

**Refactorings:**
- Move Method to collapse hierarchies
- Visitor pattern
- Strategy pattern

## Dispensables

Code that could be removed.

### Comments

**Symptoms:**
- Comments explain what code does (not why)
- Comments apologize for bad code
- Commented-out code
- TODOs that are years old

**Example:**
```typescript
// SMELL: Comments that should be code
// Loop through users and check if they're active
for (let i = 0; i < users.length; i++) {
  // Get the current user
  const u = users[i];
  // Check if the user is active
  if (u.a === true) {
    // Add to the result
    r.push(u);
  }
}

// BETTER: Self-documenting code
const activeUsers = users.filter(user => user.isActive);
```

**Refactorings:**
- Extract Method (give it a good name)
- Rename Variable
- Introduce Assertion

### Duplicate Code

**Symptoms:**
- Same code in multiple places
- Similar code with minor variations
- Copy-paste with search-replace

**Example:**
```typescript
// SMELL: Same validation in multiple places
function createUser(data: UserData): User {
  if (!data.email) throw new Error('Email required');
  if (!data.email.includes('@')) throw new Error('Invalid email');
  // ...
}

function updateUser(id: string, data: UserData): User {
  if (!data.email) throw new Error('Email required');
  if (!data.email.includes('@')) throw new Error('Invalid email');
  // ...
}
```

**Refactorings:**
- Extract Method
- Pull Up Method
- Form Template Method

### Dead Code

**Symptoms:**
- Unused variables, parameters, methods, classes
- Unreachable code after return/throw
- Code commented "just in case"
- Features no one uses

**Example:**
```typescript
// SMELL: Unused code
function processOrder(order: Order, debug: boolean = false): void {
  const startTime = Date.now();  // Never used

  if (false) {
    // This can never execute
    console.log('Debug mode');
  }

  // Old implementation - keeping just in case
  // function oldProcess() { ... }
}
```

**Refactorings:**
- Delete it (version control has it)
- Remove parameter

### Speculative Generality

**Symptoms:**
- Abstract classes with one implementation
- Parameters that are never used
- Hooks for "future extensibility"
- YAGNI violations

**Example:**
```typescript
// SMELL: Over-engineered for hypothetical future
interface PaymentProcessor { }
interface PaymentProcessorFactory { }
abstract class AbstractPaymentProcessor implements PaymentProcessor { }
class PaymentProcessorFactoryImpl implements PaymentProcessorFactory { }
class ConcretePaymentProcessor extends AbstractPaymentProcessor { }

// Only one payment processor ever used
```

**Refactorings:**
- Collapse Hierarchy
- Inline Class
- Remove Parameter

## Couplers

Code that's too tightly connected.

### Feature Envy

**Symptoms:**
- Method uses data from another class more than its own
- Method could move to another class entirely
- Lots of getter calls on one object

**Example:**
```typescript
// SMELL: This method envies Customer
class Order {
  getCustomerDiscount(): number {
    const customer = this.customer;
    if (customer.loyaltyYears > 5) {
      return customer.totalPurchases > 10000 ? 0.15 : 0.10;
    }
    return customer.hasCoupon ? 0.05 : 0;
  }
}
```

**Refactorings:**
- Move Method
- Extract Method then Move

### Inappropriate Intimacy

**Symptoms:**
- Classes access each other's private members
- Circular dependencies between classes
- Classes know implementation details of each other

**Example:**
```typescript
// SMELL: Too much knowledge of each other
class Order {
  private items: Item[];

  // Customer reaches into Order's internals
}

class Customer {
  getTotalSpent(orders: Order[]): number {
    let total = 0;
    for (const order of orders) {
      // Accessing private field through backdoor
      for (const item of (order as any).items) {
        total += item.price;
      }
    }
    return total;
  }
}
```

**Refactorings:**
- Move Method
- Replace Bidirectional with Unidirectional
- Extract Class

### Message Chains

**Symptoms:**
- Long chains of method calls: a.b().c().d()
- Client knows about intermediate objects
- Changes to chain structure break many clients

**Example:**
```typescript
// SMELL: Long chain exposes structure
const departmentName = employee
  .getDepartment()
  .getManager()
  .getDepartment()
  .getName();
```

**Refactorings:**
- Hide Delegate
- Extract Method

### Middle Man

**Symptoms:**
- Class delegates most methods to another class
- Thin wrapper that adds no value
- Pass-through methods everywhere

**Example:**
```typescript
// SMELL: Order just forwards to OrderDetails
class Order {
  private details: OrderDetails;

  getItems(): Item[] { return this.details.getItems(); }
  getTotal(): number { return this.details.getTotal(); }
  getCustomer(): Customer { return this.details.getCustomer(); }
  getShipping(): Address { return this.details.getShipping(); }
  // Every method just delegates
}
```

**Refactorings:**
- Remove Middle Man
- Inline Method
- Replace Delegation with Inheritance
