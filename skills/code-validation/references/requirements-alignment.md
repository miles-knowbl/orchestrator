# Requirements Alignment

How to verify code actually solves the stated problem.

## Why This Matters

The most expensive bugs aren't technical—they're building the wrong thing. AI agents are excellent at producing correct code for the wrong problem. Validation catches this before it reaches review.

Your job: Ensure the solution matches the intent.

## Alignment Techniques

### 1. Spec-to-Code Traceability

For each requirement, find the corresponding implementation:

```
Requirement: "Users can filter orders by status"
     ↓
Code: OrderList component with statusFilter prop
      + filterOrders(orders, status) function
      + API endpoint: GET /orders?status=pending
```

**Red flags:**
- Requirement with no corresponding code → incomplete
- Code with no corresponding requirement → scope creep or implicit requirement

### 2. Acceptance Criteria Walkthrough

If acceptance criteria exist, verify each one:

```markdown
## Acceptance Criteria

- [x] User can select status from dropdown (COMPLETED: StatusFilter component)
- [x] Filtered results update without page reload (COMPLETED: React state update)
- [ ] Filter persists across sessions (MISSING: No localStorage implementation)
- [x] "All" option shows unfiltered results (COMPLETED: null status handling)
```

### 3. Intent Verification Questions

Ask these questions to surface misalignment:

| Question | What It Reveals |
|----------|-----------------|
| "What problem is the user trying to solve?" | Whether you're solving root cause or symptom |
| "What will the user do immediately after?" | Missing next steps in the flow |
| "What did they do before this existed?" | Whether solution matches mental model |
| "What's the 'job to be done'?" | Core need vs. stated request |
| "If I demo this, will they say 'yes'?" | Overall alignment check |

### 4. Scope Analysis

**Scope Gap (doing less than asked):**
- Missing requirements
- Partial implementations ("works for happy path only")
- Deferred functionality without documentation

**Scope Creep (doing more than asked):**
- Features nobody requested
- "While I was in there..." additions
- Premature optimization
- Unnecessary abstraction

Scope creep isn't always bad, but it should be intentional and documented.

## Common Misalignment Patterns

### Pattern 1: Solving the Wrong Level

**Request:** "Make the page load faster"
**Wrong solution:** Add a loading spinner
**Right solution:** Optimize the slow query

**Detection:** Ask "Does this solve the root cause or mask the symptom?"

### Pattern 2: Literal vs. Intent

**Request:** "Add a button to refresh the data"
**Literal solution:** Refresh button that reloads everything
**Intent solution:** Auto-refresh with manual override (user wanted fresh data, not a button)

**Detection:** Ask "What's the user actually trying to accomplish?"

### Pattern 3: Missing Context

**Request:** "Allow users to delete their account"
**Implementation:** DELETE /users/:id endpoint
**Missing context:** Legal requirement for data retention, soft delete, confirmation flow

**Detection:** Ask "What regulatory, business, or UX constraints apply?"

### Pattern 4: Assumed Requirements

Things often assumed but not stated:
- Error handling for invalid input
- Loading states during async operations
- Mobile responsiveness
- Accessibility basics
- Reasonable performance
- Security (auth, input validation)

**Detection:** Explicitly list assumptions: "I assumed X. Is that correct?"

## Validation Checklist

### With Spec/Requirements

```markdown
For each stated requirement:
- [ ] Requirement is implemented (not just planned)
- [ ] Implementation is complete (not partial)
- [ ] Implementation matches intent (not just letter)
- [ ] Edge cases for this requirement are handled

For the implementation:
- [ ] No significant code without corresponding requirement
- [ ] Scope creep is intentional and documented
- [ ] Assumptions are stated and validated
```

### Without Spec

```markdown
1. State inferred requirements explicitly
2. Get confirmation or correction
3. Then validate against stated understanding

Inference sources:
- [ ] Code structure and naming
- [ ] Commit messages and PR description
- [ ] Conversation history
- [ ] Similar features in codebase
- [ ] Domain knowledge
```

## Output Format

When documenting requirements alignment:

```markdown
## Requirements Alignment

**Stated Requirements:**
1. Users can filter orders by status ✅
2. Filter selection persists across sessions ❌ NOT IMPLEMENTED
3. Results update without page reload ✅

**Inferred Requirements:**
- Error state when API fails ✅
- Loading indicator during fetch ✅
- Mobile responsive ⚠️ NOT TESTED

**Scope Additions (not requested):**
- Added keyboard shortcuts for filter selection (intentional UX improvement)

**Assumptions Made:**
- "Status" means order status (pending, shipped, delivered), not payment status
- "Persist" means localStorage, not server-side preference

**Verdict:** NOT ALIGNED - missing session persistence requirement
```

## When Requirements Are Ambiguous

Don't guess. Surface the ambiguity:

```markdown
**Ambiguity Identified:**

The requirement "users can export orders" doesn't specify:
- Export format (CSV? Excel? PDF?)
- Which orders (all? filtered? selected?)
- Who can export (all users? admins only?)

**Current Implementation:**
- CSV format
- Currently visible (filtered) orders
- All authenticated users

**Recommendation:** Confirm these decisions before merge.
```
