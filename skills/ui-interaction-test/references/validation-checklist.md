# Validation Checklist

What to check at each step of a UI flow.

## Universal Checks (Every Step)

### Responsiveness
- [ ] Action triggers within 100ms
- [ ] Loading state appears if action takes > 500ms
- [ ] No UI freezing or blocking

### Feedback
- [ ] Loading indicator visible for async actions
- [ ] Success confirmation for state changes
- [ ] Error messages for failures
- [ ] Progress for long operations

### Accessibility
- [ ] Can trigger with keyboard
- [ ] Focus managed correctly
- [ ] Screen reader announces changes

### Console
- [ ] No JavaScript errors
- [ ] No failed network requests
- [ ] No unexpected warnings

## By Interaction Type

### Button Click
- [ ] Button visually responds to click
- [ ] Disabled state during processing
- [ ] Re-enabled after completion
- [ ] Double-click handled gracefully

### Form Submit
- [ ] Validation runs before submit
- [ ] Invalid fields highlighted
- [ ] Error messages clear and specific
- [ ] Data preserved on validation failure
- [ ] Success redirects/updates appropriately

### Navigation
- [ ] URL changes correctly
- [ ] Browser back works
- [ ] Scroll position handled
- [ ] Previous state preserved if expected

### Selection
- [ ] Selection visually indicated
- [ ] Context updates with selection
- [ ] Multi-select works if applicable
- [ ] Deselection works

### Modal/Dialog
- [ ] Opens with animation
- [ ] Focus trapped inside
- [ ] Escape closes
- [ ] Click outside closes (if expected)
- [ ] Form data cleared on close (if expected)

### Chat/Message
- [ ] Message appears in thread
- [ ] Scroll to new message
- [ ] Response appears
- [ ] Streaming content renders incrementally

## By Pipeline Phase

### Initiation
- [ ] Trigger element visible
- [ ] Trigger element enabled
- [ ] Prerequisites met
- [ ] Context correct

### Processing
- [ ] Loading state shown
- [ ] Progress indicated if long
- [ ] Cancellation possible if applicable
- [ ] Timeout handled

### Completion
- [ ] Success state shown
- [ ] Data updated
- [ ] Cache invalidated if needed
- [ ] Next action enabled

### Error
- [ ] Error state shown
- [ ] Message is helpful
- [ ] Recovery path available
- [ ] Data not corrupted

## Result Template

```markdown
## Step N: [Action Description]

### Checks
- [x] Responsiveness: Action triggers immediately
- [ ] Feedback: No loading indicator
- [x] Accessibility: Keyboard accessible
- [x] Console: No errors

### Result: PARTIAL

### Notes:
Missing loading indicator. User doesn't know action is processing.
Related to failure mode U1-003.
```
