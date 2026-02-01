---
name: test-spec-generation
description: "Generate test specifications for unvalidated failure modes. Creates detailed test specs with setup, steps, and assertions for each unvalidated failure mode. Produces PIPELINE-TEST-SPECS.md and UI-TEST-SPECS.md."
phase: VALIDATE
category: core
version: "1.0.0"
depends_on: [failure-mode-analysis, ui-failure-mode-analysis]
tags: [audit, testing, specs, validation, coverage]
---

# Test Spec Generation

Generate test specifications for unvalidated failure modes.

## When to Use

- **After failure mode analysis** — Runs in VALIDATE phase
- **Creating test coverage plan** — Spec tests for all unvalidated modes
- **Enabling implementation** — Detailed specs developers can implement
- When you say: "generate test specs", "what tests do we need?", "create test plan"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `test-type-selection.md` | When to use unit/integration/e2e |
| `test-spec-template.md` | Format for test specifications |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `ui-test-patterns.md` | Component, hook, integration, e2e patterns |

**Verification:** Every unvalidated failure mode has a test specification.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `PIPELINE-TEST-SPECS.md` | Project root | If unvalidated backend modes exist |
| `UI-TEST-SPECS.md` | Project root | If unvalidated UI modes exist |

## Core Concept

Test Spec Generation answers: **"How do we validate each failure mode?"**

A test specification includes:
- **What to test** — The failure mode being validated
- **Setup** — Prerequisites and mock data
- **Steps** — Actions to trigger the failure
- **Assertions** — How to verify correct handling

## Test Type Selection

| Failure Mode Type | Recommended Test Type |
|-------------------|----------------------|
| L1-Input validation | Unit test |
| L2-Processing logic | Unit test |
| L3-Output/storage | Integration test |
| L4-Integration | Integration or E2E |
| L5-Interaction | Component + E2E |
| L6-Streaming | Integration test |

## Generation Process

```
┌─────────────────────────────────────────────────────────────┐
│            TEST SPEC GENERATION PROCESS                     │
│                                                             │
│  1. LOAD FAILURE MODES                                      │
│     ├─→ From PIPELINE-FAILURE-MODES.md                     │
│     └─→ From UI-FAILURE-MODES.md                           │
│                                                             │
│  2. FILTER TO UNVALIDATED                                   │
│     └─→ Status == UNVALIDATED                              │
│                                                             │
│  3. FOR EACH UNVALIDATED MODE                               │
│     ├─→ Select test type                                   │
│     ├─→ Define setup requirements                          │
│     ├─→ Specify test steps                                 │
│     ├─→ Define pass/fail criteria                          │
│     └─→ Generate ID: TEST-{mode-id}                        │
│                                                             │
│  4. ORGANIZE BY PIPELINE                                    │
│     └─→ Group specs by pipeline for implementation         │
│                                                             │
│  5. GENERATE DELIVERABLES                                   │
│     ├─→ PIPELINE-TEST-SPECS.md                             │
│     └─→ UI-TEST-SPECS.md                                   │
└─────────────────────────────────────────────────────────────┘
```

## Test Specification Format

```markdown
### TEST-P2-007: Template selection too narrow

**Failure Mode:** P2-007 (L2-Processing, T4-Quality, S1-Silent)
**Test Type:** Integration

**Setup:**
- Mock source data with varied topics
- Ensure template pool is accessible
- Configure generation settings

**Steps:**
1. Trigger generation 10 times with same source
2. Collect all generated outputs
3. Analyze template usage distribution

**Pass Criteria:**
- At least 5 different templates used
- No template used more than 40% of time
- Outputs show meaningful variation

**Fail Criteria:**
- Same template used for > 50% of outputs
- Outputs are nearly identical
- Only 1-3 templates ever used

**Implementation Notes:**
- Consider parameterized test for scale
- May need to mock random selection for determinism
```

## Backend Test Types

### Unit Test
Tests individual functions in isolation.

```markdown
**Test Type:** Unit
**Framework:** Vitest / Jest

**Setup:**
- Import function under test
- Mock dependencies

**Pattern:**
```typescript
test('rejects file over size limit', () => {
  const largeFile = createMockFile(15_000_000);
  expect(() => validateFileSize(largeFile)).toThrow('exceeds limit');
});
```
```

### Integration Test
Tests interactions between components.

```markdown
**Test Type:** Integration
**Framework:** Vitest / Jest

**Setup:**
- Set up test database
- Configure API mocks
- Prepare test fixtures

**Pattern:**
```typescript
test('source ingestion creates schema', async () => {
  const source = await ingestSource(testFile);
  expect(source.schema).toBeDefined();
  expect(source.schema.fields).toHaveLength(5);
});
```
```

### E2E Test
Tests full user flows.

```markdown
**Test Type:** E2E
**Framework:** Playwright

**Setup:**
- Seed test database
- Authenticate test user

**Pattern:**
```typescript
test('user can generate content', async ({ page }) => {
  await page.goto('/sources');
  await page.click('[data-testid="source-1"]');
  await page.click('text=Generate');
  await expect(page.locator('.artifact')).toBeVisible();
});
```
```

## UI Test Types

### Component Test
Tests individual React components.

```markdown
**Test Type:** Component
**Framework:** Vitest + React Testing Library

**Setup:**
- Render component with test props
- Mock context if needed

**Pattern:**
```typescript
test('shows loading state during generation', () => {
  render(<GenerateButton isLoading={true} />);
  expect(screen.getByRole('progressbar')).toBeVisible();
});
```
```

### Hook Test
Tests custom React hooks.

```markdown
**Test Type:** Hook
**Framework:** Vitest + @testing-library/react-hooks

**Setup:**
- Wrap in test providers
- Mock API calls

**Pattern:**
```typescript
test('useArtifact returns artifact data', async () => {
  const { result } = renderHook(() => useArtifact('123'));
  await waitFor(() => expect(result.current.data).toBeDefined());
});
```
```

## Output Format

### PIPELINE-TEST-SPECS.md

```markdown
# Pipeline Test Specifications

## Summary

| Pipeline | Unvalidated | Test Specs |
|----------|-------------|------------|
| P1: Source Ingestion | 5 | 5 |
| P2: Content Generation | 9 | 9 |
| P3: Publishing | 3 | 3 |
| **Total** | **17** | **17** |

## P1: Source Ingestion

### TEST-P1-003: File type validation

**Failure Mode:** P1-003 (L1-Input, T1-Data, S3-Visible)
**Test Type:** Unit

[... spec details ...]

## P2: Content Generation

### TEST-P2-007: Template selection

[... spec details ...]
```

### UI-TEST-SPECS.md

```markdown
# UI Test Specifications

## Summary

| Pipeline | Unvalidated | Component | Hook | Integration | E2E |
|----------|-------------|-----------|------|-------------|-----|
| U1: Chat-to-Edit | 6 | 2 | 1 | 2 | 1 |
| U2: Chat-to-Generate | 7 | 3 | 1 | 2 | 1 |
| **Total** | **13** | **5** | **2** | **4** | **2** |

## U1: Chat-to-Edit

### TEST-U1-005: Cache invalidation

**Failure Mode:** U1-005 (L3-Output, T1-Data, S1-Silent)
**Test Type:** Integration (Vitest + RTL)

[... spec details ...]
```

## Validation Checklist

- [ ] Every unvalidated mode has a test spec
- [ ] Test type appropriate for failure mode
- [ ] Setup is complete and reproducible
- [ ] Steps are specific and actionable
- [ ] Pass/fail criteria are unambiguous
- [ ] Specs organized by pipeline
- [ ] Implementation notes included where helpful
