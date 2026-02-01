# UI Failure Mode Template

Standard format for documenting UI failure modes.

## Full Template

```markdown
### U{N}-{NNN}: {Short description}

| Attribute | Value |
|-----------|-------|
| **ID** | U{N}-{NNN} |
| **Pipeline** | U{N}: {Pipeline Name} |
| **Step** | {Step number}. {Step description} |
| **Location** | L{N}-{Name} |
| **Type** | T{N}-{Name} |
| **Severity** | S{N}-{Name} |
| **Pattern** | {UI pattern name or "N/A"} |
| **Description** | {What goes wrong} |
| **Impact** | {What user experiences} |
| **Detection** | {How detected, or "None"} |
| **Status** | VALIDATED | UNVALIDATED |
| **Handling** | {Code location if validated} |
| **Test Spec** | TEST-U{N}-{NNN} |
| **Fix** | {What would fix it} |
| **Effort** | S | M | L |
```

## Example: State Desync

```markdown
### U1-005: Cache not invalidated after edit

| Attribute | Value |
|-----------|-------|
| **ID** | U1-005 |
| **Pipeline** | U1: Chat-to-Edit |
| **Step** | 9. React Query cache invalidation |
| **Location** | L3-Output |
| **Type** | T1-Data |
| **Severity** | S1-Silent |
| **Pattern** | State Desync |
| **Description** | Edit succeeds but React Query cache not invalidated |
| **Impact** | User sees stale artifact content until manual refresh |
| **Detection** | None (user must notice stale content) |
| **Status** | UNVALIDATED |
| **Handling** | - |
| **Test Spec** | TEST-U1-005 |
| **Fix** | Add queryClient.invalidateQueries(['artifact', id]) |
| **Effort** | S |
```

## Example: Dead Click

```markdown
### U2-003: Generate button unresponsive

| Attribute | Value |
|-----------|-------|
| **ID** | U2-003 |
| **Pipeline** | U2: Chat-to-Generate |
| **Step** | 4. User clicks generate |
| **Location** | L5-Interaction |
| **Type** | T2-Logic |
| **Severity** | S4-Blocking |
| **Pattern** | Dead Click |
| **Description** | Generate button click handler throws on missing context |
| **Impact** | User clicks, nothing happens, thinks app is broken |
| **Detection** | Console error (not visible to user) |
| **Status** | UNVALIDATED |
| **Handling** | - |
| **Test Spec** | TEST-U2-003 |
| **Fix** | Add try-catch with user-visible error message |
| **Effort** | S |
```

## Example: Stream Disconnect

```markdown
### U1-008: SSE stream disconnects mid-response

| Attribute | Value |
|-----------|-------|
| **ID** | U1-008 |
| **Pipeline** | U1: Chat-to-Edit |
| **Step** | 6. SSE stream from agent |
| **Location** | L6-Streaming |
| **Type** | T3-Infrastructure |
| **Severity** | S3-Visible |
| **Pattern** | Stream Disconnect |
| **Description** | Network interruption drops SSE connection |
| **Impact** | Partial response shown, no retry, user confused |
| **Detection** | EventSource onerror fires |
| **Status** | UNVALIDATED |
| **Handling** | - |
| **Test Spec** | TEST-U1-008 |
| **Fix** | Add reconnection logic with resume from last event ID |
| **Effort** | M |
```

## Minimal Template

```markdown
### U{N}-{NNN}: {Description}

**Location:** L{N} | **Type:** T{N} | **Severity:** S{N}
**Pattern:** {Pattern or N/A}
**Status:** VALIDATED | UNVALIDATED
```

## Pattern Field

Include pattern when it matches one of the 8 UI patterns:

| Pattern | Use When |
|---------|----------|
| Dead Click | User action has no visible response |
| Stale Closure | Callback uses outdated state |
| State Desync | UI shows stale data |
| Missing Feedback | No loading/success/error |
| Context Loss | State lost on navigation |
| Race Condition | Rapid actions cause issues |
| Stream Disconnect | Real-time connection fails |
| Callback Leak | Event listeners accumulate |

If none apply, use "N/A".
