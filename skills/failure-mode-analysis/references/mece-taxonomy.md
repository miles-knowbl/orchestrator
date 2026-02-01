# MECE Taxonomy

The three dimensions for classifying failure modes.

## What is MECE?

**M**utually **E**xclusive, **C**ollectively **E**xhaustive

- **Mutually Exclusive:** Each failure belongs to exactly one category
- **Collectively Exhaustive:** All possible failures are covered

## Dimension 1: Location (WHERE)

Where in the data flow does the failure occur?

### L1: Input
Failure when data enters the pipeline.

**Examples:**
- Missing required field in request
- Invalid data format
- Authentication failure
- File too large

**Code patterns:**
```typescript
if (!request.body.name) throw new Error('Missing name');
```

### L2: Processing
Failure during data transformation.

**Examples:**
- Algorithm produces wrong result
- Edge case not handled
- Type conversion fails
- Business rule violated

**Code patterns:**
```typescript
const result = transform(data);  // Logic error here
```

### L3: Output
Failure when storing or delivering result.

**Examples:**
- Database write fails
- External API returns error
- Response serialization fails
- File write permission denied

**Code patterns:**
```typescript
await db.insert(record);  // DB error here
```

### L4: Integration
Failure at pipeline boundaries.

**Examples:**
- Upstream pipeline didn't run
- Data format changed incompatibly
- Event lost between systems
- Timing dependency violated

**Code patterns:**
```typescript
const schema = await getSourceSchema(id);  // Depends on P1
```

## Dimension 2: Type (WHAT)

What category of failure is it?

### T1: Data
Problem with the data itself.

**Examples:**
- Null/undefined value
- Wrong data type
- Stale/outdated data
- Malformed structure

### T2: Logic
Problem with the code logic.

**Examples:**
- Algorithm bug
- Wrong conditional branch
- Off-by-one error
- Race condition

### T3: Infrastructure
Problem with systems/services.

**Examples:**
- Network timeout
- Rate limit exceeded
- Service unavailable
- Resource exhausted

### T4: Quality
Technically succeeds but output is bad.

**Examples:**
- Generated text is generic
- Image is low resolution
- Response time too slow
- Results not relevant

### T5: UX
Technically works but experience is broken.

**Examples:**
- No loading indicator
- Error message is confusing
- Success not confirmed
- State not updated

## Dimension 3: Severity (HOW BAD)

How serious is the impact?

### S1: Silent
Failure happens but no one knows.

**Characteristics:**
- No error thrown
- Bad data persists
- User proceeds unaware
- Discovered much later

**Risk:** HIGHEST — problems accumulate

### S2: Partial
Some data correct, some wrong.

**Characteristics:**
- Mixed results
- Partial success
- Inconsistent state
- Confusing situation

**Risk:** HIGH — data corruption possible

### S3: Visible
Error is shown but unclear.

**Characteristics:**
- Error message displayed
- User knows something's wrong
- May not know what to do
- Operation didn't complete

**Risk:** MEDIUM — user aware but stuck

### S4: Blocking
Cannot proceed at all.

**Characteristics:**
- Operation fails completely
- Clear error state
- User cannot continue
- Must seek help or retry

**Risk:** LOW — obvious, usually handled

## Classification Examples

| Failure | Location | Type | Severity |
|---------|----------|------|----------|
| Missing required field | L1-Input | T1-Data | S3-Visible |
| Off-by-one in loop | L2-Processing | T2-Logic | S1-Silent |
| DB connection timeout | L3-Output | T3-Infra | S4-Blocking |
| Generic AI output | L2-Processing | T4-Quality | S1-Silent |
| No loading spinner | L3-Output | T5-UX | S3-Visible |
| Upstream data stale | L4-Integration | T1-Data | S1-Silent |
