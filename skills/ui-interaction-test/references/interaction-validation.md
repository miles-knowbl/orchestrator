# Interaction Validation

How to validate UI flows work correctly.

## Validation Approach

### 1. Prepare the Environment
- Ensure test data exists
- Authenticate if required
- Clear relevant caches
- Open dev tools console

### 2. Execute Systematically
Follow pipeline steps in exact order:
1. Trigger action
2. Observe response
3. Check console
4. Verify outcome
5. Document result

### 3. Document Everything
Record at each step:
- What you did
- What happened
- What you expected
- Any discrepancies

## What to Check

### Visual Checks
- Does UI change as expected?
- Are loading states visible?
- Do success/error states show?
- Is the layout correct?

### Console Checks
- Any JavaScript errors?
- Any network errors?
- Unexpected warnings?
- Failed requests?

### State Checks
- Did data update?
- Is cache correct?
- Did URL change if expected?
- Is context preserved?

### Timing Checks
- How long did it take?
- Was there feedback during wait?
- Did anything flash or glitch?

## Validation Techniques

### Happy Path First
Test the expected flow:
1. All inputs valid
2. Network working
3. Server responding
4. User following expected path

### Then Edge Cases
Test variations:
- Empty inputs
- Invalid inputs
- Rapid repeated actions
- Navigation mid-flow
- Slow network (simulate)
- Concurrent actions

### Then Error Cases
Test failure scenarios:
- Network offline
- Server error responses
- Auth expired
- Missing prerequisites

## Recording Results

### For Each Step

```markdown
| Step | Action | Expected | Actual | Result | Notes |
|------|--------|----------|--------|--------|-------|
| 1 | Click Generate | Button responds | Button did nothing | FAIL | Handler error in console |
```

### For Partial Results

Document specifically what's wrong:
```markdown
**Step 6:** PARTIAL
- Expected: Loading spinner visible
- Actual: No spinner, but action eventually completes
- Impact: User confused during wait
```

### For Failures

Document reproduction:
```markdown
**Step 9:** FAIL
- Expected: Artifact content updates
- Actual: Shows stale content
- Reproduction: 100% reproducible
- Console: No errors
- Network: PUT succeeded (200)
- Root cause: Cache not invalidated
```

## Common Issues to Watch For

### Dead Ends
- Button does nothing
- Form submits but no feedback
- Navigation leads nowhere

### State Bugs
- Wrong data displayed
- Selection lost
- Form resets unexpectedly

### Timing Issues
- Flash of wrong content
- Loading appears after content
- Updates out of order

### Feedback Gaps
- No loading indicator
- Success not confirmed
- Error message missing or unclear
