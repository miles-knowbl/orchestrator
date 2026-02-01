# Validation Checking

How to determine if a failure mode is validated.

## Definition of Validated

A failure mode is **validated** when the system explicitly handles it, either through:
1. Code that catches and handles the failure
2. Tests that verify the failure is handled

## Code Validation Patterns

### Explicit Error Handling
```typescript
// VALIDATED: Specific catch for this failure
try {
  await uploadFile(file);
} catch (error) {
  if (error.code === 'FILE_TOO_LARGE') {
    return { error: 'File exceeds 10MB limit' };
  }
  throw error;  // Re-throw unknown errors
}
```

### Input Validation
```typescript
// VALIDATED: Rejects bad input before processing
if (!file.type.startsWith('text/')) {
  throw new ValidationError('Only text files supported');
}
```

### Retry Logic
```typescript
// VALIDATED: Handles transient failures
const result = await retry(
  () => callExternalAPI(data),
  { retries: 3, delay: 1000 }
);
```

### Fallback Behavior
```typescript
// VALIDATED: Graceful degradation
const schema = await getSchema(id).catch(() => DEFAULT_SCHEMA);
```

## Test Validation Patterns

### Direct Test Coverage
```typescript
// VALIDATED: Test specifically covers this failure
test('rejects files over 10MB', async () => {
  const largeFile = createLargeFile(15_000_000);
  await expect(upload(largeFile)).rejects.toThrow('exceeds limit');
});
```

### Edge Case Test
```typescript
// VALIDATED: Test covers edge case
test('handles empty source schema', async () => {
  const result = await generate({ sourceId: emptySourceId });
  expect(result.content).toBeDefined();  // Uses fallback
});
```

## NOT Validated

### Generic Catch
```typescript
// NOT VALIDATED: Generic, doesn't handle specific failure
try {
  await process(data);
} catch (error) {
  console.error(error);
  throw error;
}
```

### Silent Ignore
```typescript
// NOT VALIDATED: Swallows error without handling
try {
  await optional();
} catch {
  // Ignore
}
```

### No Handling
```typescript
// NOT VALIDATED: No try-catch, failure crashes
const result = await riskyOperation();
```

### Happy Path Only
```typescript
// NOT VALIDATED: Test only covers success
test('generates content', async () => {
  const result = await generate(validInput);
  expect(result).toBeDefined();
});
// No test for invalid input!
```

## Validation Checklist

For each failure mode, check:

- [ ] Is there a try-catch that specifically handles this case?
- [ ] Is there input validation that prevents this case?
- [ ] Is there a test that exercises this failure?
- [ ] Does retry/fallback logic cover this case?

If ANY of these is true, mark as **VALIDATED**.
If NONE of these is true, mark as **UNVALIDATED**.

## Partial Validation

Sometimes a failure is partially handled:

```typescript
// PARTIALLY VALIDATED: Catches but doesn't fully handle
try {
  await process(data);
} catch (error) {
  logger.error(error);  // Logged but not recovered
  throw error;
}
```

Mark as **UNVALIDATED** with note: "Logged but not handled"
