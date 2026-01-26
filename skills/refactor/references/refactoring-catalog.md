# Refactoring Catalog

Detailed examples of common refactoring patterns.

## Method Composition

### Extract Method

**When:** Code fragment that can be grouped together and named.

**Steps:**
1. Create new method with descriptive name
2. Copy extracted code to new method
3. Replace original code with method call
4. Compile and test

```typescript
// Before
function printOwing(invoice: Invoice): void {
  let outstanding = 0;

  console.log('***********************');
  console.log('**** Customer Owes ****');
  console.log('***********************');

  for (const order of invoice.orders) {
    outstanding += order.amount;
  }

  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}

// After
function printOwing(invoice: Invoice): void {
  printBanner();
  const outstanding = calculateOutstanding(invoice);
  printDetails(invoice, outstanding);
}

function printBanner(): void {
  console.log('***********************');
  console.log('**** Customer Owes ****');
  console.log('***********************');
}

function calculateOutstanding(invoice: Invoice): number {
  return invoice.orders.reduce((sum, order) => sum + order.amount, 0);
}

function printDetails(invoice: Invoice, outstanding: number): void {
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}
```

### Inline Method

**When:** Method body is as clear as its name.

```typescript
// Before
function getRating(): number {
  return moreThanFiveLateDeliveries() ? 2 : 1;
}

function moreThanFiveLateDeliveries(): boolean {
  return this.numberOfLateDeliveries > 5;
}

// After
function getRating(): number {
  return this.numberOfLateDeliveries > 5 ? 2 : 1;
}
```

### Replace Temp with Query

**When:** Temporary variable holds result of expression.

```typescript
// Before
function calculateTotal(): number {
  const basePrice = quantity * itemPrice;
  if (basePrice > 1000) {
    return basePrice * 0.95;
  }
  return basePrice * 0.98;
}

// After
function calculateTotal(): number {
  if (basePrice() > 1000) {
    return basePrice() * 0.95;
  }
  return basePrice() * 0.98;
}

function basePrice(): number {
  return quantity * itemPrice;
}
```

### Split Temporary Variable

**When:** Temp variable assigned more than once (not a loop counter).

```typescript
// Before
let temp = 2 * (height + width);
console.log(temp);
temp = height * width;
console.log(temp);

// After
const perimeter = 2 * (height + width);
console.log(perimeter);
const area = height * width;
console.log(area);
```

## Moving Features

### Move Method

**When:** Method uses or is used by more features of another class.

```typescript
// Before
class Account {
  overdraftCharge(): number {
    if (this.type.isPremium()) {
      const baseCharge = 10;
      if (this.daysOverdrawn > 7) {
        return baseCharge + (this.daysOverdrawn - 7) * 0.85;
      }
      return baseCharge;
    }
    return this.daysOverdrawn * 1.75;
  }
}

// After - method moved to AccountType
class AccountType {
  overdraftCharge(daysOverdrawn: number): number {
    if (this.isPremium()) {
      const baseCharge = 10;
      if (daysOverdrawn > 7) {
        return baseCharge + (daysOverdrawn - 7) * 0.85;
      }
      return baseCharge;
    }
    return daysOverdrawn * 1.75;
  }
}

class Account {
  overdraftCharge(): number {
    return this.type.overdraftCharge(this.daysOverdrawn);
  }
}
```

### Move Field

**When:** Field used more by another class.

```typescript
// Before
class Account {
  private interestRate: number;
  private type: AccountType;

  interestForAmount(days: number): number {
    return this.interestRate * days * 365;
  }
}

// After - interestRate belongs with AccountType
class AccountType {
  private interestRate: number;

  getInterestRate(): number {
    return this.interestRate;
  }
}

class Account {
  private type: AccountType;

  interestForAmount(days: number): number {
    return this.type.getInterestRate() * days * 365;
  }
}
```

### Extract Class

**When:** Class does work that should be done by two classes.

```typescript
// Before
class Person {
  private name: string;
  private officeAreaCode: string;
  private officeNumber: string;

  getTelephoneNumber(): string {
    return `(${this.officeAreaCode}) ${this.officeNumber}`;
  }
}

// After
class TelephoneNumber {
  private areaCode: string;
  private number: string;

  getTelephoneNumber(): string {
    return `(${this.areaCode}) ${this.number}`;
  }
}

class Person {
  private name: string;
  private officeTelephone: TelephoneNumber;

  getTelephoneNumber(): string {
    return this.officeTelephone.getTelephoneNumber();
  }
}
```

### Inline Class

**When:** Class isn't doing enough to justify its existence.

```typescript
// Before
class TelephoneNumber {
  private areaCode: string;
  private number: string;

  getAreaCode(): string { return this.areaCode; }
  getNumber(): string { return this.number; }
}

class Person {
  private name: string;
  private telephone: TelephoneNumber;

  getAreaCode(): string { return this.telephone.getAreaCode(); }
  getNumber(): string { return this.telephone.getNumber(); }
}

// After - if TelephoneNumber doesn't pull its weight
class Person {
  private name: string;
  private areaCode: string;
  private number: string;

  getAreaCode(): string { return this.areaCode; }
  getNumber(): string { return this.number; }
}
```

## Organizing Data

### Replace Primitive with Object

**When:** Primitive needs more behavior than just storage.

```typescript
// Before
class Order {
  private customerId: string;

  getCustomer(): string {
    return this.customerId;
  }

  setCustomer(id: string): void {
    this.customerId = id;
  }
}

// After
class Customer {
  constructor(private readonly id: string) {}

  getId(): string { return this.id; }
}

class Order {
  private customer: Customer;

  getCustomer(): Customer {
    return this.customer;
  }

  setCustomer(customer: Customer): void {
    this.customer = customer;
  }
}
```

### Replace Magic Number with Constant

**When:** Literal number with particular meaning.

```typescript
// Before
function potentialEnergy(mass: number, height: number): number {
  return mass * 9.81 * height;
}

// After
const GRAVITATIONAL_CONSTANT = 9.81;

function potentialEnergy(mass: number, height: number): number {
  return mass * GRAVITATIONAL_CONSTANT * height;
}
```

### Introduce Parameter Object

**When:** Group of parameters that naturally go together.

```typescript
// Before
function amountInvoiced(startDate: Date, endDate: Date): number { }
function amountReceived(startDate: Date, endDate: Date): number { }
function amountOverdue(startDate: Date, endDate: Date): number { }

// After
class DateRange {
  constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {}

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }
}

function amountInvoiced(range: DateRange): number { }
function amountReceived(range: DateRange): number { }
function amountOverdue(range: DateRange): number { }
```

## Simplifying Conditionals

### Decompose Conditional

**When:** Complex conditional (if-then-else) with complex clauses.

```typescript
// Before
if (date.before(SUMMER_START) || date.after(SUMMER_END)) {
  charge = quantity * winterRate + winterServiceCharge;
} else {
  charge = quantity * summerRate;
}

// After
if (isSummer(date)) {
  charge = summerCharge(quantity);
} else {
  charge = winterCharge(quantity);
}

function isSummer(date: Date): boolean {
  return !date.before(SUMMER_START) && !date.after(SUMMER_END);
}

function summerCharge(quantity: number): number {
  return quantity * summerRate;
}

function winterCharge(quantity: number): number {
  return quantity * winterRate + winterServiceCharge;
}
```

### Consolidate Conditional Expression

**When:** Sequence of conditional checks with same result.

```typescript
// Before
function disabilityAmount(): number {
  if (this.seniority < 2) return 0;
  if (this.monthsDisabled > 12) return 0;
  if (this.isPartTime) return 0;
  // compute the disability amount
  return baseAmount * 1.5;
}

// After
function disabilityAmount(): number {
  if (this.isNotEligibleForDisability()) return 0;
  return baseAmount * 1.5;
}

function isNotEligibleForDisability(): boolean {
  return this.seniority < 2
    || this.monthsDisabled > 12
    || this.isPartTime;
}
```

### Replace Conditional with Polymorphism

**When:** Conditional that chooses different behavior based on type.

```typescript
// Before
class Bird {
  getSpeed(): number {
    switch (this.type) {
      case 'EUROPEAN':
        return this.getBaseSpeed();
      case 'AFRICAN':
        return this.getBaseSpeed() - this.getLoadFactor() * this.numberOfCoconuts;
      case 'NORWEGIAN_BLUE':
        return this.isNailed ? 0 : this.getBaseSpeed();
    }
  }
}

// After
abstract class Bird {
  abstract getSpeed(): number;
  protected getBaseSpeed(): number { /* ... */ }
}

class EuropeanBird extends Bird {
  getSpeed(): number {
    return this.getBaseSpeed();
  }
}

class AfricanBird extends Bird {
  getSpeed(): number {
    return this.getBaseSpeed() - this.getLoadFactor() * this.numberOfCoconuts;
  }
}

class NorwegianBlueBird extends Bird {
  getSpeed(): number {
    return this.isNailed ? 0 : this.getBaseSpeed();
  }
}
```

### Replace Nested Conditional with Guard Clauses

**When:** Conditional with special cases obscuring main logic.

```typescript
// Before
function getPayAmount(): number {
  let result: number;
  if (this.isDead) {
    result = deadAmount();
  } else {
    if (this.isSeparated) {
      result = separatedAmount();
    } else {
      if (this.isRetired) {
        result = retiredAmount();
      } else {
        result = normalPayAmount();
      }
    }
  }
  return result;
}

// After
function getPayAmount(): number {
  if (this.isDead) return deadAmount();
  if (this.isSeparated) return separatedAmount();
  if (this.isRetired) return retiredAmount();
  return normalPayAmount();
}
```

## Simplifying Method Calls

### Rename Method

**When:** Name of method does not reveal its purpose.

```typescript
// Before
class Customer {
  getinvcdtlmt(): number { /* ... */ }
}

// After
class Customer {
  getInvoiceableCreditLimit(): number { /* ... */ }
}
```

### Separate Query from Modifier

**When:** Method returns value and has side effects.

```typescript
// Before
function getTotalOutstandingAndSetReadyForSummaries(): number {
  this.isReadyForSummaries = true;
  return this.invoices.reduce((sum, inv) => sum + inv.amount, 0);
}

// After
function getTotalOutstanding(): number {
  return this.invoices.reduce((sum, inv) => sum + inv.amount, 0);
}

function setReadyForSummaries(): void {
  this.isReadyForSummaries = true;
}
```

### Replace Parameter with Method Call

**When:** Parameter value can be obtained by called method.

```typescript
// Before
const basePrice = quantity * itemPrice;
const discount = getDiscount(basePrice);
const finalPrice = applyDiscount(basePrice, discount);

// After
const basePrice = quantity * itemPrice;
const finalPrice = applyDiscount(basePrice);

function applyDiscount(basePrice: number): number {
  const discount = getDiscount(basePrice);
  return basePrice - discount;
}
```

### Preserve Whole Object

**When:** Getting several values from object to pass as parameters.

```typescript
// Before
const low = room.getTempRange().getLow();
const high = room.getTempRange().getHigh();
const withinPlan = plan.withinRange(low, high);

// After
const withinPlan = plan.withinRange(room.getTempRange());
```

## Dealing with Generalization

### Pull Up Method

**When:** Methods with identical results on subclasses.

```typescript
// Before
class Salesperson extends Employee {
  getName(): string { return this.name; }
}

class Engineer extends Employee {
  getName(): string { return this.name; }
}

// After
class Employee {
  getName(): string { return this.name; }
}

class Salesperson extends Employee { }
class Engineer extends Employee { }
```

### Push Down Method

**When:** Behavior on superclass is relevant only for some subclasses.

```typescript
// Before
class Employee {
  getQuota(): number { /* ... */ }
}

class Salesperson extends Employee { }
class Engineer extends Employee { }

// After - only Salesperson has quotas
class Employee { }

class Salesperson extends Employee {
  getQuota(): number { /* ... */ }
}

class Engineer extends Employee { }
```

### Extract Superclass

**When:** Two classes have similar features.

```typescript
// Before
class Department {
  getName(): string { /* ... */ }
  getAnnualCost(): number { /* ... */ }
  getHeadCount(): number { /* ... */ }
}

class Employee {
  getName(): string { /* ... */ }
  getAnnualCost(): number { /* ... */ }
  getId(): string { /* ... */ }
}

// After
abstract class Party {
  abstract getName(): string;
  abstract getAnnualCost(): number;
}

class Department extends Party {
  getName(): string { /* ... */ }
  getAnnualCost(): number { /* ... */ }
  getHeadCount(): number { /* ... */ }
}

class Employee extends Party {
  getName(): string { /* ... */ }
  getAnnualCost(): number { /* ... */ }
  getId(): string { /* ... */ }
}
```

### Replace Inheritance with Delegation

**When:** Subclass uses only part of superclass interface or inheritance isn't appropriate.

```typescript
// Before
class Stack extends ArrayList {
  push(element: T): void {
    this.add(element);
  }

  pop(): T {
    return this.remove(this.size() - 1);
  }
}

// After
class Stack {
  private items: ArrayList = new ArrayList();

  push(element: T): void {
    this.items.add(element);
  }

  pop(): T {
    return this.items.remove(this.items.size() - 1);
  }

  size(): number {
    return this.items.size();
  }
}
```
