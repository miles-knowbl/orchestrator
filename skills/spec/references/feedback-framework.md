# Feedback Framework

Timing bands, haptics, and optimistic UI patterns for responsive interfaces.

## The Paintbrush Principle

A paintbrush feels instantaneous because feedback arrives **before you consciously expect it**. The brain takes ~100ms to form the question "did that work?" — anything under 50ms feels like cause-and-effect, anything at 0ms feels like an extension of your body.

**Goal:** Every interaction should pass the Paintbrush Test.

## Timing Bands Reference

| Band | Target | Perception | Use For |
|------|--------|------------|---------|
| **0ms** | At input event | Extension of body | Haptic, press state, selection toggle |
| **<16ms** | Every frame | Fluid tracking | Cursor position, drag follow, scroll |
| **<50ms** | Perceived instant | Cause-and-effect | Optimistic add, chip appear, count update |
| **<150ms** | Animated | Smooth transition | Dropdown open, filter apply, modal appear |
| **<300ms** | Spring settle | Physics-based | Drop into place, card flip, reorder settle |
| **Background** | Never blocks UI | Invisible | Network calls, heavy computation, sync |

## The Four Gaps to Eliminate

Every interaction has potential gaps where users lose confidence:

### Gap 1: Input Gap — "Did the system hear me?"

| Technique | Timing | Implementation |
|-----------|--------|----------------|
| **Haptic on touch** | 0ms | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` |
| **Press state** | 0ms | `:active` style, scale 0.98, opacity change |
| **Cursor attachment** | <16ms | Dragged item follows pointer exactly |
| **Selection highlight** | 0ms | Border/background change on touch, not release |

**Anti-patterns:**
- Waiting for server before any visual feedback
- Press state only on mouseup
- Drag item that lags behind cursor

### Gap 2: Thinking Gap — "What will this do?"

| Technique | Timing | Implementation |
|-----------|--------|----------------|
| **Hover preview** | 0ms | Show outcome on hover before click |
| **Drag placeholders** | <16ms | Ghost shows exactly where item will land |
| **Live preview** | <16ms | See effect as slider moves, not on release |
| **Affordance hints** | 0ms | Visual cues that invite interaction |

**Anti-patterns:**
- Click and pray
- Drag with no drop target indicators
- Settings that require "Apply" button

### Gap 3: Wait Gap — "Is it still working?"

| Technique | Timing | Implementation |
|-----------|--------|----------------|
| **Optimistic mutation** | 0ms | Show success immediately, rollback on error |
| **Skeleton shimmer** | <50ms | Content shape appears before data loads |
| **Staggered reveal** | 50ms intervals | First items show while rest load |
| **Spring physics** | 150-300ms | Animation implies settling, not loading |

**Anti-patterns:**
- Spinners for anything under 500ms
- Full-screen loading states
- "Please wait..." messages

### Gap 4: Completion Gap — "Did it work?"

| Technique | Timing | Implementation |
|-----------|--------|----------------|
| **State change** | <50ms | Visual confirms new state |
| **Checkmark/animation** | <150ms | Brief success indicator |
| **Toast (sparingly)** | <300ms | Only for non-obvious completions |

**Anti-patterns:**
- Toast for every action
- No visual confirmation of change
- Success message that blocks interaction

## Interaction Patterns Quick Reference

| Action Type | 0ms | <50ms | <150ms | <300ms |
|-------------|-----|-------|--------|--------|
| **Tap/Select** | Haptic + highlight | — | — | — |
| **Toggle** | Haptic + state flip | Count update | — | — |
| **Add to list** | Haptic | Item appears | — | Settle |
| **Delete** | Haptic | Item fades | List reflows | — |
| **Drag start** | Haptic + lift | — | Scale + shadow | — |
| **Drop** | Haptic (medium) | — | — | Spring settle |
| **Submit** | Haptic + button state | Optimistic success | — | Redirect |
| **Open modal** | — | — | Fade + scale | — |
| **Close modal** | — | — | Fade out | — |
| **Filter** | — | Results update | — | — |
| **Search** | — | — | Results appear | — |
| **Sort** | — | — | List reorders | Settle |

## Capability Feedback Block Template

Every capability must include:

```yaml
feedback:
  timing:
    input_acknowledgment: 0ms  # Haptic/visual on trigger
    local_render: <50ms        # Optimistic UI update
    server_confirm: background # Actual mutation
    
  haptic:
    on_action: light_impact    # When user triggers
    on_success: none           # Usually silent
    on_error: error_pattern    # Only on failure
    
  visual:
    pending: "What user sees while waiting"
    success: "What user sees on success"
    error: "What user sees on failure"
    
  optimistic:
    strategy: "How to show success before server confirms"
    rollback: "How to revert if server fails"
```

## Optimistic UI Pattern

### React Query Implementation

```typescript
const mutation = useMutation({
  mutationFn: async (input) => {
    return await api.createItem(input);
  },
  
  onMutate: async (input) => {
    // 1. Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: ['items'] });
    
    // 2. Snapshot previous state
    const previous = queryClient.getQueryData(['items']);
    
    // 3. Optimistically update
    queryClient.setQueryData(['items'], (old) => [
      ...old,
      { ...input, id: 'temp-' + Date.now(), isPending: true }
    ]);
    
    // 4. Return rollback context
    return { previous };
  },
  
  onError: (err, input, context) => {
    // Rollback on error
    queryClient.setQueryData(['items'], context?.previous);
    
    // Show error feedback
    toast.error('Failed to create item');
    Haptics.notificationAsync(NotificationFeedbackType.Error);
  },
  
  onSuccess: (data, input) => {
    // Replace temp item with real item
    queryClient.setQueryData(['items'], (old) =>
      old.map(item => 
        item.id.startsWith('temp-') ? data : item
      )
    );
  },
  
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

### Key Principles

1. **Immediate visual feedback** — Don't wait for server
2. **Graceful rollback** — Revert cleanly on error
3. **Temp IDs** — Mark optimistic items clearly
4. **Eventual consistency** — Invalidate after settle

## Haptic Patterns

| Pattern | When to Use | iOS | Android |
|---------|-------------|-----|---------|
| **Light impact** | Selection, toggle | `ImpactFeedbackStyle.Light` | `HapticFeedbackConstants.VIRTUAL_KEY` |
| **Medium impact** | Confirm action, drop | `ImpactFeedbackStyle.Medium` | `HapticFeedbackConstants.CONTEXT_CLICK` |
| **Heavy impact** | Important action | `ImpactFeedbackStyle.Heavy` | `HapticFeedbackConstants.LONG_PRESS` |
| **Success** | Completion | `NotificationFeedbackType.Success` | Custom pattern |
| **Error** | Failure | `NotificationFeedbackType.Error` | Custom pattern |
| **Selection** | Picker change | `SelectionFeedback` | `HapticFeedbackConstants.CLOCK_TICK` |

## Animation Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Button press | 100ms | ease-out |
| Fade in | 150ms | ease-out |
| Fade out | 100ms | ease-in |
| Slide in | 200ms | ease-out |
| Slide out | 150ms | ease-in |
| Scale up | 150ms | spring |
| Reorder | 200ms | spring |
| Drop settle | 300ms | spring (damping: 0.7) |

## Anti-Pattern Checklist

```markdown
### Input Gap
- [ ] No haptic on touch
- [ ] Press state waits for server
- [ ] Drag lags behind cursor

### Thinking Gap
- [ ] No preview of action
- [ ] No drop target indicators
- [ ] Unclear what will happen

### Wait Gap
- [ ] Spinner for short operations
- [ ] Full-screen loading
- [ ] No optimistic update

### Completion Gap
- [ ] No visual state change
- [ ] Toast for every action
- [ ] No way to know it worked
```

## Testing Feedback

### Manual Testing

1. **Slow network simulation** — Does optimistic UI work?
2. **Error injection** — Does rollback work smoothly?
3. **Rapid interaction** — Does it handle fast repeated actions?
4. **Device testing** — Do haptics feel right?

### Automated Testing

```typescript
test('optimistic update shows immediately', async () => {
  const { result } = renderHook(() => useCreateItem());
  
  act(() => {
    result.current.mutate({ name: 'Test' });
  });
  
  // Should appear immediately, not after server response
  expect(queryClient.getQueryData(['items'])).toContainEqual(
    expect.objectContaining({ name: 'Test', isPending: true })
  );
});

test('rollback on error', async () => {
  server.use(
    rest.post('/api/items', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );
  
  const { result } = renderHook(() => useCreateItem());
  const previous = queryClient.getQueryData(['items']);
  
  await act(async () => {
    await result.current.mutateAsync({ name: 'Test' }).catch(() => {});
  });
  
  // Should rollback to previous state
  expect(queryClient.getQueryData(['items'])).toEqual(previous);
});
```
