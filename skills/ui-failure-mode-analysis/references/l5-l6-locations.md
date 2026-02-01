# L5 and L6 Location Codes

Extended location codes for UI-specific failures.

## L5: Interaction

Failures in user action handling, tool execution, and callbacks.

### What It Covers

- Button click handlers
- Form submissions
- Keyboard shortcuts
- Drag and drop handlers
- Tool call execution
- Callback registration and invocation
- Event listener behavior

### Examples

| Failure | Code | Description |
|---------|------|-------------|
| Dead Click | L5-T2 | Handler doesn't respond |
| Stale Closure | L5-T1 | Callback uses old data |
| Race Condition | L5-T2 | Rapid clicks cause issues |
| Callback Leak | L5-T3 | Listeners accumulate |
| Tool Failure | L5-T2 | Tool handler throws |

### Code Patterns

```typescript
// L5 failures occur in interaction code
onClick={() => {
  // L5-T2: Handler error
}}

const callback = useCallback(() => {
  doSomething(value);  // L5-T1: Stale value
}, []);

useEffect(() => {
  element.addEventListener('click', handler);
  // L5-T3: No cleanup
}, []);
```

## L6: Streaming

Failures in SSE parsing, incremental updates, and real-time synchronization.

### What It Covers

- Server-Sent Events (SSE)
- WebSocket connections
- Streaming response parsing
- Incremental rendering
- Real-time subscriptions
- Live updates

### Examples

| Failure | Code | Description |
|---------|------|-------------|
| Stream Disconnect | L6-T3 | Connection dropped |
| Parse Error | L6-T1 | Malformed chunk |
| Partial Render | L6-T2 | Incomplete display |
| Buffer Overflow | L6-T3 | Too much data |
| Sync Lost | L6-T1 | Missed updates |

### Code Patterns

```typescript
// L6 failures occur in streaming code
const es = new EventSource('/api/stream');
es.onmessage = (event) => {
  const data = JSON.parse(event.data);  // L6-T1: Parse error
  appendContent(data.chunk);  // L6-T2: Render error
};
es.onerror = () => {
  // L6-T3: Connection error
};

// Supabase channels
supabase.channel('updates')
  .on('*', (payload) => {
    updateState(payload);  // L6-T1: Missing update
  });
```

## When to Use L5 vs L6

| Scenario | Location |
|----------|----------|
| Button click fails | L5 |
| Form submit fails | L5 |
| Tool call fails | L5 |
| SSE stream drops | L6 |
| WebSocket message lost | L6 |
| Real-time update missed | L6 |
| Callback memory leak | L5 |
| Streaming response partial | L6 |

## Combined with L1-L4

UI pipelines also use standard locations:

| Code | UI Context |
|------|------------|
| L1-Input | User input validation, form field errors |
| L2-Processing | Client-side computation, parsing |
| L3-Output | Rendering, display, visual feedback |
| L4-Integration | Context sync, API calls, state handoff |
| L5-Interaction | User action handling, callbacks |
| L6-Streaming | Real-time updates, SSE, WebSocket |

## Distribution Expectations

Typical UI failure distribution:

```
L5-Interaction: 30-40%  (interaction bugs common)
L6-Streaming:   10-20%  (if app uses streaming)
L3-Output:      25-35%  (rendering/feedback issues)
L4-Integration: 15-25%  (context sync issues)
L1-Input:        5-10%  (input validation)
L2-Processing:   5-10%  (client logic)
```
