# Compression Strategies

Techniques for managing context window limits.

## Why Compress?

Context windows are finite. Long sessions accumulate:
- Verbose command outputs
- Exploratory discussions
- Code iterations
- Error messages and stack traces
- Back-and-forth debugging

Compression extracts value and discards noise.

## When to Compress

### Proactive (Before Limit)

| Signal | Action |
|--------|--------|
| Session > 2 hours | Consider creating checkpoint handoff |
| Many long outputs | Summarize and archive |
| Switching focus | Compress current topic, start fresh |
| Exploration complete | Extract decisions, discard attempts |

### Reactive (At Limit)

| Signal | Action |
|--------|--------|
| Context limit warning | Immediate handoff creation |
| Responses truncating | Emergency compression |
| Memory feeling "foggy" | Create handoff, cold boot |

## Compression Strategies

### Strategy 1: Summarize

**What:** Replace verbose content with concise summary.

**When:** Long outputs, exploratory discussions, debugging sessions.

**Before:**
```
[50 lines of npm install output]
[30 lines of build output]
[20 lines of test output showing all tests]
```

**After:**
```
Dependencies installed successfully.
Build completed with 0 warnings.
All 47 tests passing.
```

**Rule:** If output confirmed something works, one sentence is enough.

### Strategy 2: Extract to ADR

**What:** Move architectural discussions to permanent ADR.

**When:** Decision made after exploring options.

**Before:**
```
[Long discussion about auth approaches]
"We could use JWT because X, or sessions because Y, or OAuth because Z..."
[More back and forth]
"Let's go with JWT because of A, B, C reasons"
```

**After:**
```
Created ADR-003: Authentication Approach
Decision: JWT-based authentication
See: domain-memory/{domain}/decisions/003-auth-approach.md
```

**Rule:** If a decision affects architecture, it deserves an ADR.

### Strategy 3: Archive to Handoff

**What:** Move completed work details to handoff document.

**When:** Task/feature complete, moving to next thing.

**Before:**
```
[Detailed implementation of UserService]
[All the code changes made]
[Test results and iterations]
[Debugging session for that one bug]
```

**After:**
```
Completed: UserService implementation
- Added CRUD operations
- Added validation
- Fixed timezone bug (was using local instead of UTC)
- All tests passing
Details: sessions/2024-01-17-user-service.md
Commits: abc1234, def5678
```

**Rule:** If it's done, the details can live in files.

### Strategy 4: Reference Files

**What:** Point to files instead of including content.

**When:** Code, configs, large documents.

**Before:**
```typescript
// Here's the complete implementation:
export class OrderService {
  // [100 lines of code]
}
```

**After:**
```
OrderService implemented at: src/services/order.service.ts
Key methods: create(), update(), complete(), cancel()
```

**Rule:** Code lives in files. Context holds pointers.

### Strategy 5: Prune Irrelevant

**What:** Acknowledge and discard tangential content.

**When:** Off-topic discussions, abandoned approaches.

**Before:**
```
[Long tangent about whether to use Prisma or TypeORM]
[Ultimately didn't matter because we're using raw SQL]
```

**After:**
```
[Removed: ORM discussion - decided on raw SQL per ADR-005]
```

**Rule:** If it didn't affect outcomes, it can go.

### Strategy 6: Batch Similar Items

**What:** Combine multiple similar items into summary.

**When:** Repetitive operations, multiple file changes.

**Before:**
```
Created src/models/user.ts
Created src/models/order.ts
Created src/models/product.ts
Created src/models/category.ts
Created src/models/inventory.ts
```

**After:**
```
Created 5 model files: user, order, product, category, inventory
Location: src/models/*.ts
```

**Rule:** If pattern is clear, summarize the batch.

## Compression Process

### Step 1: Identify Compression Candidates

Look for:
- Long command outputs (builds, tests, installs)
- Exploratory discussions (trying options)
- Debugging sessions (once bug is fixed)
- Repeated information
- Verbose error messages (once resolved)

### Step 2: Extract Value

For each candidate:
- What was the outcome?
- What decision was made?
- What did we learn?
- What needs to be preserved for future?

### Step 3: Choose Strategy

| Content Type | Strategy |
|--------------|----------|
| Command output | Summarize |
| Architecture discussion | Extract to ADR |
| Completed work | Archive to handoff |
| Code blocks | Reference files |
| Tangents | Prune |
| Repetitive items | Batch |

### Step 4: Create Handoff

Before compressing, ensure handoff captures:
- Current state
- Decisions made
- Next steps
- Anything surprising

### Step 5: Compress

Apply strategies, leaving context with:
- Current task and immediate context
- Active blockers
- Pointers to archived content
- Clean starting point

## What to NEVER Compress

| Keep | Reason |
|------|--------|
| Current task context | Need it now |
| Active blockers | Need resolution |
| Uncommitted changes | Could be lost |
| Recent decisions | Need to remember |
| Error being debugged | Currently relevant |

## Compression Templates

### Completed Feature

```markdown
✅ [Feature Name] Complete
- Commits: [list hashes]
- Tests: [X] passing
- Key files: [list]
- Details: sessions/[handoff-file].md
```

### Resolved Bug

```markdown
🐛 Fixed: [Bug description]
- Cause: [Root cause]
- Fix: [What was changed]
- Commit: [hash]
```

### Decision Made

```markdown
📋 Decision: [Topic]
- Choice: [What was decided]
- Rationale: [One sentence]
- ADR: decisions/[number]-[name].md
```

### Exploration Completed

```markdown
🔍 Explored: [Topic]
- Options: [A, B, C]
- Selected: [B]
- Why: [One sentence]
- Details: [ADR or handoff reference]
```

## Emergency Compression

When hitting limit unexpectedly:

```markdown
## EMERGENCY COMPRESSION CHECKLIST

1. [ ] Stop current task safely
2. [ ] Commit any code changes
3. [ ] Note current state in quick handoff:
   - Branch:
   - Last commit:
   - Working on:
   - Tests status:
   - Next step:
4. [ ] Save handoff to sessions/
5. [ ] Start new session with cold boot
```

## Context Budget Guidelines

| Category | Budget |
|----------|--------|
| Current task context | 40% |
| Recent history | 20% |
| Decisions & constraints | 15% |
| Blockers & issues | 10% |
| File references | 10% |
| Buffer | 5% |

If any category exceeds budget, compress that category first.
