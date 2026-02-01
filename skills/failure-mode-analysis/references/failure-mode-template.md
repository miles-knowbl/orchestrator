# Failure Mode Template

Standard format for documenting a failure mode.

## Full Template

```markdown
### P{N}-{NNN}: {Short description}

| Attribute | Value |
|-----------|-------|
| **ID** | P{N}-{NNN} |
| **Pipeline** | P{N}: {Pipeline Name} |
| **Step** | {Step number}. {Step description} |
| **Location** | L{N}-{Name} |
| **Type** | T{N}-{Name} |
| **Severity** | S{N}-{Name} |
| **Description** | {What goes wrong} |
| **Impact** | {What happens to user/data} |
| **Detection** | {How is it detected, or "None"} |
| **Status** | VALIDATED | UNVALIDATED |
| **Handling** | {Code location if validated} |
| **Test Spec** | TEST-P{N}-{NNN} |
| **Fix** | {What would fix it} |
| **Effort** | S | M | L |
```

## Example: Input Validation

```markdown
### P1-003: Source file exceeds size limit

| Attribute | Value |
|-----------|-------|
| **ID** | P1-003 |
| **Pipeline** | P1: Source Ingestion |
| **Step** | 1. File received at upload endpoint |
| **Location** | L1-Input |
| **Type** | T1-Data |
| **Severity** | S3-Visible |
| **Description** | Uploaded file exceeds 10MB limit |
| **Impact** | Upload rejected, user sees error |
| **Detection** | Size check before processing |
| **Status** | VALIDATED |
| **Handling** | `api/upload/route.ts:34` |
| **Test Spec** | - |
| **Fix** | - (already handled) |
| **Effort** | - |
```

## Example: Silent Failure

```markdown
### P2-007: Template selection too narrow

| Attribute | Value |
|-----------|-------|
| **ID** | P2-007 |
| **Pipeline** | P2: Content Generation |
| **Step** | 4. Template selection |
| **Location** | L2-Processing |
| **Type** | T4-Quality |
| **Severity** | S1-Silent |
| **Description** | Only 3 templates in pool, causing repetitive output |
| **Impact** | Users see repetitive content after several generations |
| **Detection** | None (no error, just lower quality) |
| **Status** | UNVALIDATED |
| **Handling** | - |
| **Test Spec** | TEST-P2-007 |
| **Fix** | Expand template pool to 10+ variations |
| **Effort** | M |
```

## Minimal Template

For quick documentation:

```markdown
### P{N}-{NNN}: {Description}

**Location:** L{N} | **Type:** T{N} | **Severity:** S{N}
**Status:** VALIDATED | UNVALIDATED
```

## ID Convention

```
P{pipeline_number}-{sequence_number}

P1-001  First failure mode in P1
P1-002  Second failure mode in P1
P2-001  First failure mode in P2
```

Keep sequence numbers contiguous within each pipeline.

## Status Determination

### VALIDATED
- Explicit try-catch with specific handling
- Input validation that rejects bad data
- Test that covers this scenario
- Retry/fallback logic that handles it

### UNVALIDATED
- No explicit handling
- Generic error catch only
- No test coverage
- Silent failure path
