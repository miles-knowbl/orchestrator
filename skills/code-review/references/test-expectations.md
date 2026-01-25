# Test Expectations

What tests to expect for different types of changes.

## Why This Matters

Tests are proof that code works. During review, missing tests are as important as buggy code—maybe more, because bugs will be discovered eventually, but missing tests are missing forever.

## Test Expectations by Change Type

### Feature Code

**Expectation:** Tests for new functionality.

| Feature Type | Expected Tests |
|--------------|----------------|
| New endpoint | Request/response for happy path + errors |
| New UI component | Render test, interaction tests |
| New service method | Unit test for logic, mock dependencies |
| New utility function | Unit tests including edge cases |

**Minimum bar:** Happy path works.
**Good bar:** Happy path + error cases + edge cases.

### Bug Fixes

**Expectation:** Regression test proving the bug is fixed.

```markdown
1. Test that would have caught the bug (fails before fix)
2. After fix, test passes
3. Bug can never silently regress
```

**If no test:** The bug WILL come back. It's not fixed, it's hiding.

### Refactoring

**Expectation:** Existing tests still pass. No new tests required.

**If tests break:** Refactoring changed behavior (not a refactor).
**If tests don't exist:** Add them before refactoring, so you know behavior is preserved.

### Configuration Changes

**Expectation:** Depends on what changed.

| Change | Testing Expectation |
|--------|---------------------|
| Environment variable | Verify default behavior, document |
| Dependency update | Full test suite passes |
| Build config | Build still works, artifacts correct |
| Feature flag | Test both flag states |

### Data Model Changes

**Expectation:** Tests for new model behavior.

| Change | Testing Expectation |
|--------|---------------------|
| New field | Validation tests if validated |
| New relation | Tests for relationship behavior |
| New constraint | Tests that constraint is enforced |
| Migration | Migration runs both directions |

## Test Coverage Levels

### Critical Code (Must Test)

- Authentication/authorization
- Payment processing
- Data mutations (create, update, delete)
- Security-sensitive operations
- Core business logic
- Public API contracts

### Important Code (Should Test)

- Most feature code
- Validation logic
- Error handling paths
- Integration points
- State management

### Lower Priority (Nice to Test)

- Pure UI (visual testing harder to maintain)
- Configuration wiring
- Logging/metrics (verify in integration)
- Simple CRUD without business logic

### Don't Test

- Framework code (test your code, not React)
- Third-party libraries
- Generated code (test the generator)
- Trivial getters/setters

## Test Quality Criteria

### Good Tests

| Quality | Description |
|---------|-------------|
| **Isolated** | Doesn't depend on other tests or external state |
| **Repeatable** | Same result every time |
| **Fast** | Runs in milliseconds (unit) or seconds (integration) |
| **Clear** | Test name explains what's being tested |
| **Focused** | Tests one thing, fails for one reason |
| **Maintainable** | Easy to update when requirements change |

### Test Smells

| Smell | Symptom | Problem |
|-------|---------|---------|
| **Brittle** | Breaks on unrelated changes | Tests implementation, not behavior |
| **Slow** | Takes seconds per test | Too much setup, not isolated |
| **Flaky** | Sometimes passes, sometimes fails | Race conditions, external deps |
| **Obscure** | Hard to tell what it tests | Bad naming, too complex |
| **Redundant** | Tests same thing multiple ways | Maintenance burden |
| **Gap-covering** | Tests only to increase coverage | Not testing useful scenarios |

## Test Review Checklist

### Are Tests Present?

```markdown
For each production code change:
- [ ] Corresponding test exists
- [ ] Test would fail without the change
- [ ] Test covers the primary use case
```

### Are Tests Sufficient?

```markdown
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested (null, empty, boundary)
- [ ] Integration points mocked/stubbed appropriately
```

### Are Tests Good?

```markdown
- [ ] Test names describe the scenario
- [ ] Tests are focused (one assertion per test or logical group)
- [ ] Tests don't depend on each other
- [ ] Tests don't depend on external state
- [ ] No obvious flakiness risks (time, network, random)
```

## Missing Test Scenarios

Common scenarios that should have tests but often don't:

### API Endpoints

- [ ] Valid request returns expected response
- [ ] Invalid request returns appropriate error
- [ ] Missing auth returns 401
- [ ] Forbidden action returns 403
- [ ] Not found returns 404
- [ ] Malformed request returns 400
- [ ] Server error is handled gracefully

### Data Validation

- [ ] Valid data passes
- [ ] Missing required field fails
- [ ] Wrong type fails
- [ ] Out-of-range value fails
- [ ] Empty string vs null handling
- [ ] Unicode/special characters handled

### State Transitions

- [ ] Valid transition succeeds
- [ ] Invalid transition fails with message
- [ ] Concurrent transitions handled
- [ ] Transition from each state tested

### Collections/Lists

- [ ] Empty list
- [ ] Single item
- [ ] Multiple items
- [ ] Maximum size
- [ ] Pagination boundaries
- [ ] Filtering returns correct subset
- [ ] Sorting works correctly

## When No Tests Are Acceptable

Testing isn't always required. Acceptable exceptions:

| Situation | Rationale |
|-----------|-----------|
| Spike/prototype | Code will be rewritten |
| Trivial change | Risk is very low (typo fix) |
| Generated code | Test the generator instead |
| Dead code removal | Removing tests is fine |
| Config-only change | Manual verification sufficient |

**But document the justification.** "No tests because X" is better than silent omission.

## Output Format

When reporting test expectations:

```markdown
## Test Coverage

### Changes Without Tests

| File | Change | Expected Test |
|------|--------|---------------|
| `order-service.js` | New `exportOrders` function | Unit test for export logic |
| `order-controller.js` | New endpoint | API test for request/response |

### Test Gaps

⚠️ **Missing edge cases:**
- No test for empty order list
- No test for date range with no orders
- No test for export format validation

### Existing Tests

✅ Happy path tested:
- Export with valid orders
- Date filtering works

✅ Error cases tested:
- Authentication required

### Recommendation

Add tests for edge cases before merge:
1. Empty order list should return empty CSV (not error)
2. Invalid date range should return 400
```
