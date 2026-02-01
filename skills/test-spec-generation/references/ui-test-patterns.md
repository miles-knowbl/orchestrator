# UI Test Patterns

Patterns for testing React UI components and flows.

## Component Test Patterns

### Render and Assert
Basic component rendering test.

```typescript
test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### Event Handling
Test user interactions.

```typescript
test('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);

  await userEvent.click(screen.getByRole('button'));

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Loading States
Test async state transitions.

```typescript
test('shows loading then content', async () => {
  render(<DataLoader />);

  // Initially loading
  expect(screen.getByRole('progressbar')).toBeVisible();

  // Eventually shows data
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeVisible();
  });
});
```

### Error States
Test error handling.

```typescript
test('shows error message on failure', async () => {
  server.use(
    rest.get('/api/data', (req, res, ctx) => res(ctx.status(500)))
  );

  render(<DataLoader />);

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load');
  });
});
```

## Hook Test Patterns

### Basic Hook
Test hook return values.

```typescript
test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter(0));

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

### Async Hook
Test hooks with async operations.

```typescript
test('useArtifact fetches data', async () => {
  const { result } = renderHook(() => useArtifact('123'));

  // Initially loading
  expect(result.current.isLoading).toBe(true);

  // Eventually has data
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

### Context Hook
Test hooks that use context.

```typescript
test('useChatContext provides sendMessage', () => {
  const wrapper = ({ children }) => (
    <ChatProvider>{children}</ChatProvider>
  );

  const { result } = renderHook(() => useChatContext(), { wrapper });

  expect(typeof result.current.sendMessage).toBe('function');
});
```

## Integration Test Patterns

### Multi-Component Flow
Test components working together.

```typescript
test('form submits and shows success', async () => {
  render(
    <FormProvider>
      <CreateSourceForm />
    </FormProvider>
  );

  await userEvent.type(screen.getByLabelText('Name'), 'Test Source');
  await userEvent.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() => {
    expect(screen.getByText('Source created')).toBeVisible();
  });
});
```

### Context Updates
Test context changes affect components.

```typescript
test('selecting source updates context', async () => {
  render(
    <SelectionProvider>
      <SourceList />
      <SelectionSummary />
    </SelectionProvider>
  );

  await userEvent.click(screen.getByTestId('source-1-checkbox'));

  expect(screen.getByTestId('selection-count')).toHaveTextContent('1 selected');
});
```

## E2E Test Patterns

### Full User Flow
Test complete user journey.

```typescript
test('user creates and edits artifact', async ({ page }) => {
  // Navigate
  await page.goto('/sources');

  // Select source
  await page.click('[data-testid="source-1"]');

  // Generate
  await page.click('text=Generate');
  await page.waitForSelector('.artifact');

  // Edit via chat
  await page.fill('.chat-input', 'make it shorter');
  await page.press('.chat-input', 'Enter');

  // Verify update
  await expect(page.locator('.artifact')).toContainText('shorter version');
});
```

### Visual Regression
Screenshot testing for UI.

```typescript
test('dashboard matches snapshot', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveScreenshot('dashboard.png');
});
```

### Error Recovery
Test error handling end-to-end.

```typescript
test('user can retry after error', async ({ page }) => {
  // Cause error
  await page.route('/api/generate', route => route.abort());
  await page.click('text=Generate');

  // Verify error shown
  await expect(page.locator('.error-message')).toBeVisible();

  // Enable network and retry
  await page.unroute('/api/generate');
  await page.click('text=Retry');

  // Verify success
  await expect(page.locator('.artifact')).toBeVisible();
});
```

## Mock Patterns

### API Mocking (MSW)
```typescript
const handlers = [
  rest.get('/api/artifact/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, content: 'Test' }));
  }),
];

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterAll(() => server.close());
```

### Context Mocking
```typescript
const mockContext = {
  artifactId: '123',
  sendMessage: vi.fn(),
};

render(
  <ChatContext.Provider value={mockContext}>
    <ChatPanel />
  </ChatContext.Provider>
);
```
