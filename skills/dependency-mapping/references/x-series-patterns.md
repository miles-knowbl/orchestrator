# X-Series Patterns

Common cross-pipeline failure patterns.

## Data Handoff Failures

### Missing Data
Output from upstream pipeline doesn't exist.

```
P1 didn't run → P2 tries to read source_schema → null
```

**Severity:** Usually S4-Blocking
**Prevention:** Check existence before use

### Stale Data
Data exists but is outdated.

```
User updates source → P1 re-ingests → P2 still using cached schema
```

**Severity:** Usually S1-Silent (wrong output, no error)
**Prevention:** Cache invalidation, version checks

### Format Mismatch
Data format changed incompatibly.

```
P1 now outputs schema v2 → P2 expects schema v1 → parse fails
```

**Severity:** Usually S3-Visible (parse error)
**Prevention:** Schema versioning, migration

## Shared State Failures

### Race Condition
Two pipelines write same data concurrently.

```
U1 edits artifact → P2 regenerates artifact → Last write wins
```

**Severity:** S1-Silent (data loss) or S2-Partial
**Prevention:** Optimistic locking, versioning

### Phantom Read
Pipeline reads data that's about to change.

```
P3 reads artifact → U1 edits → P3 publishes stale content
```

**Severity:** S1-Silent (wrong publish)
**Prevention:** Transaction isolation, refresh before use

### Lost Update
Pipeline overwrites another's changes.

```
U1 saves v1 → P2 saves v2 → U1 saves v1 again (didn't see v2)
```

**Severity:** S1-Silent (data loss)
**Prevention:** Version checks, conflict detection

## Timing Failures

### Premature Execution
Downstream runs before upstream completes.

```
P2 starts → P1 still running → P2 gets incomplete data
```

**Severity:** S2-Partial or S4-Blocking
**Prevention:** Status checks, event-driven triggering

### Timeout
Upstream takes too long, downstream gives up.

```
P1 processing large file → P2 times out waiting → Error
```

**Severity:** S3-Visible or S4-Blocking
**Prevention:** Longer timeouts, async handling

### Ordering Violation
Steps execute in wrong order.

```
Expected: P1 → P2 → P3
Actual: P1 → P3 → P2 (P3 sees incomplete state)
```

**Severity:** Varies
**Prevention:** Explicit dependencies, state machines

## Event Chain Failures

### Lost Event
Event published but not received.

```
P3 emits publish_complete → Network glitch → U4 never updates
```

**Severity:** S1-Silent (UI out of sync)
**Prevention:** Acknowledgment, polling fallback

### Duplicate Event
Same event delivered multiple times.

```
Retry logic → Event delivered twice → U4 shows duplicate
```

**Severity:** S2-Partial
**Prevention:** Idempotency, deduplication

### Event Storm
Cascade of events overwhelms system.

```
P1 → triggers P2, P3, P4 → each triggers more → system overload
```

**Severity:** S3-Visible or S4-Blocking
**Prevention:** Rate limiting, circuit breakers

## Context Sync Failures

### Stale Context
UI context doesn't reflect current state.

```
User selects sources → navigates away → returns → context still has old selection
```

**Severity:** S1-Silent (wrong operation)
**Prevention:** Context refresh, subscription

### Context Loss
Context cleared unexpectedly.

```
User has artifact open → page refresh → context.artifact_id is null
```

**Severity:** S4-Blocking (can't edit)
**Prevention:** Persistence, URL state

### Context Conflict
Multiple sources trying to set context.

```
U1 sets artifact_id → U2 also sets → Wrong artifact edited
```

**Severity:** S1-Silent (wrong target)
**Prevention:** Single source of truth, locks
