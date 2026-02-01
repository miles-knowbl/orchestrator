# Test Specification Template

Standard format for test specifications.

## Full Template

```markdown
### TEST-{failure-mode-id}: {Short description}

**Failure Mode:** {id} ({Location}, {Type}, {Severity})
**Test Type:** Unit | Integration | E2E | Component | Hook
**Framework:** {Vitest | Jest | Playwright | RTL}

**Setup:**
- {Prerequisite 1}
- {Prerequisite 2}
- {Mock/fixture description}

**Steps:**
1. {Action 1}
2. {Action 2}
3. {Action 3}

**Pass Criteria:**
- {What indicates success}
- {Expected state/output}

**Fail Criteria:**
- {What indicates failure}
- {Unexpected state/output}

**Implementation Notes:**
- {Helpful hints for implementer}
```

## Example: Unit Test Spec

```markdown
### TEST-P1-003: File size validation

**Failure Mode:** P1-003 (L1-Input, T1-Data, S3-Visible)
**Test Type:** Unit
**Framework:** Vitest

**Setup:**
- Import validateFileSize function
- Create mock files of various sizes

**Steps:**
1. Call validateFileSize with 5MB file
2. Call validateFileSize with 15MB file
3. Call validateFileSize with exactly 10MB file

**Pass Criteria:**
- 5MB file passes (no throw)
- 15MB file throws 'exceeds limit' error
- 10MB file passes (boundary case)

**Fail Criteria:**
- Any valid file throws
- Large file doesn't throw
- Wrong error message

**Implementation Notes:**
- Use Buffer.alloc() for mock file creation
- Consider parameterized test for multiple sizes
```

## Example: Integration Test Spec

```markdown
### TEST-P2-007: Template selection variety

**Failure Mode:** P2-007 (L2-Processing, T4-Quality, S1-Silent)
**Test Type:** Integration
**Framework:** Vitest

**Setup:**
- Seed database with 3 test sources
- Ensure 10+ templates exist in pool
- Reset random seed for reproducibility

**Steps:**
1. Call generateContent() 20 times with same source
2. Collect template IDs used in each generation
3. Calculate distribution of template usage

**Pass Criteria:**
- At least 6 different templates used
- No single template used > 30% of time
- Distribution appears random

**Fail Criteria:**
- Fewer than 4 templates used
- One template dominates (> 50%)
- Same sequence every run

**Implementation Notes:**
- May need to mock Math.random for determinism
- Consider snapshot testing for output variety
- Run multiple times to catch flaky randomness
```

## Example: E2E Test Spec

```markdown
### TEST-U1-E2E-001: Chat-to-Edit full flow

**Failure Mode:** U1-* (Full pipeline validation)
**Test Type:** E2E
**Framework:** Playwright

**Setup:**
- Seed database with test artifact
- Authenticate test user
- Navigate to artifact editor

**Steps:**
1. Open artifact in editor view
2. Verify "Editing: {title}" badge shows
3. Type "make it shorter" in chat input
4. Press Enter to send
5. Wait for tool call to complete
6. Observe artifact content update

**Pass Criteria:**
- Badge shows correct artifact title
- Chat shows agent response
- Tool call bubble shows success
- Artifact content visibly shorter
- No console errors

**Fail Criteria:**
- Badge missing or wrong title
- No response after 30 seconds
- Error shown to user
- Artifact unchanged
- Console errors present

**Implementation Notes:**
- Use data-testid for reliable selectors
- Mock LLM response for speed
- Screenshot on failure for debugging
```

## Example: Component Test Spec

```markdown
### TEST-U2-003: Loading state visibility

**Failure Mode:** U2-003 (L3-Output, T5-UX, S3-Visible)
**Test Type:** Component
**Framework:** Vitest + React Testing Library

**Setup:**
- Import GenerateButton component
- Mock useGeneration hook

**Steps:**
1. Render GenerateButton with isLoading=false
2. Verify button is enabled and shows "Generate"
3. Re-render with isLoading=true
4. Verify button is disabled and shows spinner

**Pass Criteria:**
- Loading spinner visible when isLoading=true
- Button disabled when loading
- Text changes appropriately

**Fail Criteria:**
- No visual change when loading
- Button remains clickable
- Spinner doesn't appear

**Implementation Notes:**
- Use getByRole('progressbar') for spinner
- Check aria-busy attribute
```

## Minimal Template

For quick specs:

```markdown
### TEST-{id}: {Description}

**Type:** {Unit | Integration | E2E}
**Failure Mode:** {id}

**Test:** {What to test}
**Expect:** {Expected result}
```
