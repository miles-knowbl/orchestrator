# UI Failure Patterns

The 8 common UI failure patterns to check for.

## 1. Dead Click

**Code:** L5-T2
**Description:** User action produces no visible response.

**Causes:**
- Event handler not attached
- Handler throws but error swallowed
- Async operation with no feedback
- Disabled state not visible

**Detection:**
```typescript
// Look for handlers that might fail silently
onClick={async () => {
  await doSomething();  // If this fails, nothing happens
}}
```

**User experience:** "Did I click it? Is it broken?"

## 2. Stale Closure

**Code:** L5-T1
**Description:** Callback captures outdated state value.

**Causes:**
- useCallback without proper deps
- Event listener not updated
- Interval/timeout using old value

**Detection:**
```typescript
// Look for closures that might be stale
const handleEdit = useCallback(() => {
  editArtifact(artifactId);  // artifactId might be old
}, []);  // Missing artifactId in deps!
```

**User experience:** Wrong item affected, mysterious behavior.

## 3. State Desync

**Code:** L3-T1
**Description:** UI displays data that doesn't match backend.

**Causes:**
- Cache not invalidated after mutation
- Optimistic update not reverted on failure
- Subscription missed an update
- Local state diverged from server

**Detection:**
```typescript
// Look for mutations without cache invalidation
await updateArtifact(id, data);
// Should have: queryClient.invalidateQueries(['artifact', id])
```

**User experience:** "I just saved that, where did it go?"

## 4. Missing Feedback

**Code:** L3-T5
**Description:** No visual indication of loading, success, or error.

**Causes:**
- No loading state during async operation
- Success not confirmed
- Error not displayed
- Progress not shown for long operations

**Detection:**
```typescript
// Look for async without loading state
const handleSubmit = async () => {
  await createSource(data);  // User sees nothing during this
};
// Should have: setLoading(true) ... setLoading(false)
```

**User experience:** Uncertainty, repeated clicks, anxiety.

## 5. Context Loss

**Code:** L4-T1
**Description:** Navigation or action clears important context.

**Causes:**
- Context not persisted across routes
- Selection cleared on view change
- Modal close resets form
- Back button loses state

**Detection:**
```typescript
// Look for context that might be lost
const { selectedSources } = useContext(SelectionContext);
// After navigate(), is selectedSources still there?
```

**User experience:** Frustration, have to re-select, lost work.

## 6. Race Condition

**Code:** L5-T2
**Description:** Fast or concurrent actions cause wrong state.

**Causes:**
- Double-click submits twice
- Response arrives out of order
- Rapid toggle causes wrong final state

**Detection:**
```typescript
// Look for unprotected rapid actions
onClick={() => {
  createItem();  // What if clicked twice fast?
}}
// Should have: disabled during operation, or debounce
```

**User experience:** Duplicates, wrong order, unexpected state.

## 7. Stream Disconnect

**Code:** L6-T3
**Description:** SSE/WebSocket connection drops mid-operation.

**Causes:**
- Network interruption
- Server timeout
- Client navigates away
- Mobile sleep/wake

**Detection:**
```typescript
// Look for stream handling without error recovery
const es = new EventSource('/api/stream');
es.onmessage = handleChunk;
// Should have: es.onerror with reconnection logic
```

**User experience:** Partial content, hanging state, confusion.

## 8. Callback Leak

**Code:** L5-T3
**Description:** Event listeners accumulate, causing slowdown.

**Causes:**
- useEffect cleanup missing
- Event listener not removed
- Subscription not unsubscribed
- Interval not cleared

**Detection:**
```typescript
// Look for effects without cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // Missing: return () => window.removeEventListener(...)
}, []);
```

**User experience:** Gradual slowdown, high memory, eventual crash.

## Pattern Checklist

For each UI pipeline step, check:

- [ ] Dead Click: Could this action fail silently?
- [ ] Stale Closure: Are callbacks using fresh state?
- [ ] State Desync: Is cache invalidated after changes?
- [ ] Missing Feedback: Is there loading/success/error indication?
- [ ] Context Loss: Is state preserved across navigation?
- [ ] Race Condition: What if this is triggered rapidly?
- [ ] Stream Disconnect: Is streaming connection resilient?
- [ ] Callback Leak: Are effects cleaned up properly?
