# Memory Axioms for Spec Compilation

Principles for developing and maintaining project memory across sessions.

---

## The Three-Layer Memory Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECT MEMORY LAYERS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LAYER 3: SESSION CONTEXT (Ephemeral)                          │
│  ─────────────────────────────────────                          │
│  • Current task state                                           │
│  • Decisions made this session                                  │
│  • User preferences observed                                    │
│  • Compilation progress                                         │
│  │                                                              │
│  │ survives via                                                 │
│  ▼                                                              │
│  LAYER 2: COMPILED SPECS (Reference)                           │
│  ────────────────────────────────────                          │
│  • Exemplar implementations                                     │
│  • Patterns for similar features                                │
│  • Senior Engineer audit resolutions                            │
│  • Stack-specific adaptations                                   │
│  │                                                              │
│  │ indexed by                                                   │
│  ▼                                                              │
│  LAYER 1: PROCESS MAP (Ground Truth)                           │
│  ───────────────────────────────────                           │
│  • All entities and their schemas                               │
│  • All services/hooks/components                                │
│  • Coverage percentages                                         │
│  • Architecture diagrams                                        │
│  • Changelog history                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Axioms

### Axiom 1: The Process Map Never Lies

The Process Map is the single source of truth for:
- What entities exist
- What their columns are
- What hooks/services reference them
- What coverage has been achieved

**Implication:** Always read the Process Map before making claims about the system.

### Axiom 2: Compiled Specs Are Immutable

Once a spec is compiled at version X.Y, it doesn't change. If updates are needed:
- Create version X.(Y+1)
- Document what changed
- Update Process Map changelog

**Implication:** You can safely reference "Subscriptions v1.2" knowing it won't drift.

### Axiom 3: Patterns Emerge From Repetition

After compiling 3+ specs, patterns become visible:
- Common entity structures
- Recurring capability shapes
- Consistent feedback timings
- Typical error handling

**Implication:** Reference exemplar specs when compiling new ones.

### Axiom 4: Coverage Is Measurable

Every process has a coverage percentage:
- 0%: Not started
- 25%: Schema exists
- 50%: Basic CRUD
- 75%: Full features
- 95%: Production-ready with edge cases
- 100%: Complete with observability

**Implication:** Track progress numerically, not vaguely.

### Axiom 5: Decisions Deserve Documentation

When making non-obvious choices:
- Log the decision in the Compilation Summary
- Explain the reasoning
- Note alternatives considered

**Implication:** Future sessions can understand why choices were made.

---

## Memory Accumulation Strategies

### Strategy 1: Entity Registry

Maintain a running list of all entities:

```markdown
## Entity Registry

| Entity | Table | Spec | Purpose |
|--------|-------|------|---------|
| Conversation | `conversations` | SPEC-008 | Message threads |
| Message | `messages` | SPEC-008 | Individual messages |
| Subscription | `subscriptions` | SPEC-004 | Recurring service plans |
```

### Strategy 2: Pattern Library

Document recurring patterns:

```markdown
## Pattern: Optimistic Mutation

Used in: SPEC-004, SPEC-006, SPEC-008

```typescript
const mutation = useMutation({
  mutationFn: async (input) => { /* ... */ },
  onMutate: async (input) => {
    // 1. Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey });
    // 2. Snapshot previous
    const previous = queryClient.getQueryData(queryKey);
    // 3. Optimistically update
    queryClient.setQueryData(queryKey, (old) => /* ... */);
    // 4. Return rollback context
    return { previous };
  },
  onError: (err, _, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKey, context?.previous);
  },
});
```
```

### Strategy 3: Decision Log

Track significant decisions:

```markdown
## Decision Log

### 2026-01-11: XOR Constraints for Sender Identity

**Context:** Messages can be sent by either a profile (team member) or a customer.

**Decision:** Use XOR CHECK constraint: `(sender_profile_id IS NOT NULL) != (sender_customer_id IS NOT NULL)`

**Rationale:** 
- Prevents invalid states at database level
- Clearer than nullable foreign keys
- Matches participant pattern

**Alternatives Considered:**
- Single polymorphic sender_id with sender_type: Rejected (loses FK integrity)
- Separate message tables: Rejected (duplicates schema)
```

### Strategy 4: Coverage Snapshots

Track coverage over time:

```markdown
## Coverage History

| Date | Version | U01 | U02 | U03 | ... | Total |
|------|---------|-----|-----|-----|-----|-------|
| Jan 9 | v4.0 | 75% | 80% | 85% | ... | 72% |
| Jan 10 | v4.1 | 75% | 80% | 95% | ... | 76% |
| Jan 11 | v4.3 | 75% | 80% | 95% | ... | 79% |
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Memory in Comments

❌ Bad:
```typescript
// NOTE: We decided to use XOR constraints because...
```

✅ Good:
Document in Compilation Summary or Decision Log, not in code comments.

### Anti-Pattern 2: Implicit Dependencies

❌ Bad:
```markdown
This feature requires the customer table.
```

✅ Good:
```markdown
**Dependencies:** 
- `customers` table (SPEC-001)
- `useCustomers` hook (SPEC-001)
```

### Anti-Pattern 3: Vague Coverage

❌ Bad:
```markdown
Coverage: Good progress on messaging.
```

✅ Good:
```markdown
Coverage: 60% → 80% (+20%)
- Added: conversations, messages, participants tables
- Missing: attachment processing, push notifications
```

### Anti-Pattern 4: Orphaned Entities

❌ Bad: Entity exists in code but not in Process Map.

✅ Good: Every entity in code is registered in Process Map with its source spec.

---

## Session Handoff Protocol

When ending a session, ensure:

1. **Process Map is current**
   - All new entities added
   - Coverage updated
   - Changelog entry added

2. **Compiled specs are saved**
   - Version number correct
   - All 18 sections complete

3. **Context is captured**
   - What was accomplished
   - What's next
   - Any open decisions

### Handoff Template

```markdown
## Session Summary: [Date]

### Completed
- Compiled SPEC-008 (TeamMessaging v1.1, 4,215 lines)
- Updated Process Map to v4.3
- Added MESSAGING system to architecture

### Process Map Changes
- Support Systems: 10 → 11
- New tables: 5
- New hooks: 3

### Next Priority
- Alignment audit for TranscriptToRequest
- Or: Start new feature spec

### Open Decisions
- None pending
```

---

## Memory Recovery

If starting fresh without context:

1. **Read Process Map first** - Gives you the full picture
2. **Scan Compiled Specs Registry** - Shows what's been done
3. **Check Changelog** - Shows recent activity
4. **Review latest compiled spec** - Shows current style/patterns

This gets you to 90% context in ~2 minutes of reading.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial axioms, extracted from ServiceGrid experience |
