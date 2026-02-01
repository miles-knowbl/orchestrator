# Test Type Selection

When to use each type of test.

## Test Type Overview

| Type | Speed | Scope | Confidence | Cost |
|------|-------|-------|------------|------|
| Unit | Fast | Single function | Low | Low |
| Integration | Medium | Multiple components | Medium | Medium |
| E2E | Slow | Full user flow | High | High |

## Selection by Location Code

### L1: Input
**Recommended:** Unit test

Why: Input validation is isolated, fast to test.

```typescript
test('rejects empty name', () => {
  expect(() => validateInput({ name: '' })).toThrow();
});
```

### L2: Processing
**Recommended:** Unit test

Why: Business logic should be testable in isolation.

```typescript
test('calculates correct score', () => {
  expect(calculateScore([3, 4, 5])).toBe(4);
});
```

### L3: Output
**Recommended:** Integration test

Why: Needs real database/API to verify storage.

```typescript
test('stores artifact in database', async () => {
  const artifact = await createArtifact(data);
  const stored = await db.artifacts.findById(artifact.id);
  expect(stored).toBeDefined();
});
```

### L4: Integration
**Recommended:** Integration or E2E

Why: Cross-boundary, needs full stack.

```typescript
test('P2 uses P1 schema correctly', async () => {
  const source = await ingestSource(file);
  const artifact = await generateFromSource(source.id);
  expect(artifact.content).toContain(source.schema.title);
});
```

### L5: Interaction
**Recommended:** Component + E2E

Why: Needs UI context and real interactions.

```typescript
// Component test
test('button triggers handler', () => {
  const handler = vi.fn();
  render(<EditButton onClick={handler} />);
  fireEvent.click(screen.getByRole('button'));
  expect(handler).toHaveBeenCalled();
});

// E2E test
test('edit updates artifact', async ({ page }) => {
  await page.fill('.chat-input', 'make it shorter');
  await page.click('text=Send');
  await expect(page.locator('.artifact')).toContainText('...');
});
```

### L6: Streaming
**Recommended:** Integration test

Why: Needs to mock/test real SSE/WebSocket.

```typescript
test('handles stream disconnect', async () => {
  const { result } = renderHook(() => useStream('/api/chat'));
  simulateDisconnect();
  await waitFor(() => {
    expect(result.current.status).toBe('reconnecting');
  });
});
```

## Selection by Severity

| Severity | Minimum Test | Why |
|----------|--------------|-----|
| S1-Silent | Integration + E2E | Silent failures need thorough testing |
| S2-Partial | Integration | Need to verify partial states |
| S3-Visible | Unit or Integration | Error display testable at unit level |
| S4-Blocking | Unit | Usually caught by basic tests |

## Selection by Type

| Type Code | Best Test |
|-----------|-----------|
| T1-Data | Unit (validation) + Integration (storage) |
| T2-Logic | Unit (isolated logic testing) |
| T3-Infrastructure | Integration (with mocks) |
| T4-Quality | Integration + E2E (output evaluation) |
| T5-UX | Component + E2E (user experience) |

## Hybrid Strategy

For critical failure modes, use multiple levels:

```
P2-007 (Template selection)
├── Unit: Test template_select() function
├── Integration: Test full generation with template mock
└── E2E: Verify user sees varied outputs
```

## Resource Constraints

If time is limited, prioritize:

1. **S1-Silent failures** — These are invisible, need tests
2. **L4-Integration failures** — Often untested
3. **High-impact paths** — Critical user flows
