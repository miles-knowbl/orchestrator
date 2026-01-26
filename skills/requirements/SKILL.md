---
name: requirements
description: "Gather and clarify requirements from vague input. Transforms ambiguous requests into clear, testable requirements documents with explicit scope, acceptance criteria, and identified unknowns. Supports multiple formality levels from quick requirements for small features to full PRDs for major initiatives. Produces artifacts that feed directly into spec, architect, and implementation."
phase: INIT
category: core
version: "1.0.0"
depends_on: []
tags: [planning, requirements, discovery, elicitation]
---

# Requirements

Gather and clarify requirements from vague requests.

## When to Use

- **Vague request** — "Can you add a way to export data?"
- **Complex feature** — Multiple components, unclear scope
- **Before spec/architecture** — Need to know what before how
- **Scope disagreement** — Different people have different expectations
- When you say: "gather requirements", "what exactly are we building?", "scope this out"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `clarifying-questions.md` | How to elicit missing requirements |
| `prd-template.md` | Format for requirements document |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `acceptance-criteria.md` | When defining done criteria |
| `ambiguity-detection.md` | When resolving unclear requirements |
| `edge-case-identification.md` | When finding edge cases |

**Verification:** Ensure all clarifying questions are answered before proceeding.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `REQUIREMENTS.md` | Project root or domain-memory | Always |

## Core Concept

Requirements gathering answers: **"What exactly are we building?"**

Good requirements are:
- **Unambiguous** — One interpretation, not many
- **Testable** — Can verify if requirement is met
- **Complete** — Covers scope, non-scope, and edge cases
- **Minimal** — No unnecessary constraints on implementation

A requirements doc is NOT:
- A technical spec (that's `spec`)
- A design document (that's `architect`)
- Implementation details (that's `implement`)
- A wish list (that's a feature request)

## The Requirements Process

```
┌─────────────────────────────────────────────────────────┐
│                 REQUIREMENTS PROCESS                    │
│                                                         │
│  1. UNDERSTAND THE REQUEST                              │
│     └─→ What is the user actually trying to do?         │
│                                                         │
│  2. IDENTIFY AMBIGUITIES                                │
│     └─→ What's unclear? What could be interpreted       │
│         multiple ways?                                  │
│                                                         │
│  3. ASK CLARIFYING QUESTIONS                            │
│     └─→ Resolve ambiguities before specifying           │
│                                                         │
│  4. DEFINE SCOPE                                        │
│     └─→ What's in? What's explicitly out?               │
│                                                         │
│  5. WRITE ACCEPTANCE CRITERIA                           │
│     └─→ How do we know when it's done?                  │
│                                                         │
│  6. IDENTIFY EDGE CASES                                 │
│     └─→ What weird situations need handling?            │
│                                                         │
│  7. NOTE UNKNOWNS                                       │
│     └─→ What can't be determined yet?                   │
│                                                         │
│  8. REVIEW AND CONFIRM                                  │
│     └─→ Does this match what was intended?              │
└─────────────────────────────────────────────────────────┘
```

## Requirements Levels

| Level | When to Use | Time | Output |
|-------|-------------|------|--------|
| **Quick** | Small feature, low risk | 5-15 min | Inline requirements |
| **Standard** | Medium feature, some complexity | 30-60 min | Requirements document |
| **Full PRD** | Major feature, high risk, multiple stakeholders | 2-4 hours | Full PRD |

### Quick Requirements

For small, well-understood features:

```markdown
## Quick Requirements: [Feature Name]

**Goal:** [One sentence: what and why]

**Scope:**
- [What's included]
- [What's included]

**Not in scope:**
- [What's explicitly excluded]

**Acceptance Criteria:**
- [ ] [Testable criterion]
- [ ] [Testable criterion]

**Edge Cases:**
- [Edge case]: [How to handle]
```

### Standard Requirements

For medium features with some complexity:

```markdown
## Requirements: [Feature Name]

### Overview
[2-3 sentences: what we're building and why]

### User Stories
As a [user type], I want to [action] so that [benefit].

### Scope

#### In Scope
- [Capability 1]
- [Capability 2]

#### Out of Scope
- [Explicitly excluded 1]
- [Explicitly excluded 2]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### Edge Cases
| Case | Expected Behavior |
|------|-------------------|
| [Case] | [Behavior] |

### Open Questions
- [Question needing answer]

### Dependencies
- [What this depends on]

### Success Metrics
- [How we measure success]
```

### Full PRD

For major features—see `references/prd-template.md`.

## Step 1: Understand the Request

### Dig for Intent

| They Say | They Might Mean |
|----------|-----------------|
| "Export data" | CSV download? API endpoint? Scheduled report? |
| "Make it faster" | Faster load? Faster interaction? Faster processing? |
| "Add notifications" | Email? Push? In-app? All of the above? |
| "User management" | CRUD? Roles? Permissions? Teams? |

### The "Job to Be Done" Question

> "What is the user trying to accomplish, and why?"

Not "add an export button" but "let users analyze their data in Excel because our built-in reports don't cover their use cases."

### Context Questions

- Who is the user? (Role, technical level, frequency of use)
- What triggers this need? (What happened right before they need this?)
- What do they do after? (What's the next step in their workflow?)
- What do they do today? (Current workaround or process)
- What's the cost of not having this? (Urgency, impact)

→ See `references/requirements-elicitation.md`

## Step 2: Identify Ambiguities

### Ambiguity Types

| Type | Example | Question to Ask |
|------|---------|-----------------|
| **Scope** | "User management" | "Which user operations specifically?" |
| **Terminology** | "Report" | "What format? What data? Who sees it?" |
| **Behavior** | "Notify the user" | "When? How? What content?" |
| **Constraints** | "Should be fast" | "What response time is acceptable?" |
| **Edge cases** | "Handle errors" | "Which errors? How should each be handled?" |

### Ambiguity Detection Checklist

```markdown
- [ ] Vague nouns: "data", "report", "notification", "settings"
- [ ] Vague verbs: "manage", "handle", "process", "support"
- [ ] Vague adjectives: "fast", "secure", "user-friendly", "robust"
- [ ] Implicit scope: What's assumed but not stated?
- [ ] Missing actors: Who does this? Who sees this?
- [ ] Missing triggers: When does this happen?
- [ ] Missing constraints: Size limits? Time limits? Access control?
```

→ See `references/ambiguity-detection.md`

## Step 3: Ask Clarifying Questions

### Good Questions

| Characteristic | Example |
|----------------|---------|
| **Specific** | "Should CSV export include archived orders?" |
| **Bounded** | "Which of these three options: A, B, or C?" |
| **Prioritized** | "If we can only do one, which is more important?" |
| **Scenario-based** | "What should happen if the user has 10,000 orders?" |

### Question Batching

Don't ask one question at a time. Batch related questions:

```markdown
## Questions about Export Feature

### Scope
1. Which data types can be exported? (Orders only? Customers? Products?)
2. Should archived/deleted records be included?

### Format
3. CSV only, or also Excel/PDF?
4. What columns should be included?

### Access
5. All users or admin only?
6. Any rate limits or size limits?

### Delivery
7. Immediate download or email delivery for large exports?
```

→ See `references/clarifying-questions.md`

## Step 4: Define Scope

### The Scope Triangle

```
        MUST HAVE
           /\
          /  \
         /    \
        /      \
       / SHOULD \
      /   HAVE   \
     /            \
    /______________\
      COULD HAVE

   (WON'T HAVE is outside the triangle)
```

### Scope Definition Format

```markdown
### In Scope (Must Have)
- [Core capability that defines the feature]
- [Another essential capability]

### In Scope (Should Have)
- [Important but not blocking]
- [Can ship without if needed]

### In Scope (Could Have)
- [Nice to have]
- [If time permits]

### Out of Scope (Won't Have)
- [Explicitly excluded]
- [Future consideration]
- [Different feature]
```

### Scope Negotiation

When scope is too large:

1. **Identify the MVP** — What's the smallest useful version?
2. **Phase the work** — What can be V2, V3?
3. **Find the 80/20** — What 20% of effort gives 80% of value?
4. **Question necessity** — Is this actually needed, or assumed?

→ See `references/scope-definition.md`

## Step 5: Write Acceptance Criteria

### The SMART Criteria

| Letter | Meaning | Example |
|--------|---------|---------|
| **S**pecific | One thing, clearly stated | "User can download orders as CSV" |
| **M**easurable | Can verify pass/fail | "Download completes in < 30 seconds" |
| **A**chievable | Actually possible | Not "AI predicts user intent perfectly" |
| **R**elevant | Tied to user need | Not "code has 100% test coverage" |
| **T**estable | Can write a test for it | "CSV contains order_id, date, total columns" |

### Given-When-Then Format

```gherkin
Given [precondition]
When [action]
Then [expected result]
```

**Example:**
```gherkin
Given a user with 100 orders
When they click "Export to CSV"
Then a CSV file downloads containing all 100 orders
And the file includes columns: order_id, date, customer, total, status
And the download completes within 30 seconds
```

### Acceptance Criteria Checklist

```markdown
For each criterion:
- [ ] Is it testable? (Can write automated or manual test)
- [ ] Is it specific? (One interpretation only)
- [ ] Is it independent? (Doesn't depend on other criteria)
- [ ] Is it necessary? (Tied to user need)
- [ ] Is it achievable? (Actually possible to implement)
```

→ See `references/acceptance-criteria.md`

## Step 6: Identify Edge Cases

### Edge Case Categories

| Category | Examples |
|----------|----------|
| **Empty** | No data, no results, no selection |
| **One** | Single item (pluralization, layout) |
| **Many** | Thousands of items (performance, pagination) |
| **Boundary** | At the limit (max size, max count) |
| **Invalid** | Wrong format, wrong type, corrupted |
| **Concurrent** | Multiple users, multiple tabs |
| **Timing** | Slow network, timeout, retry |
| **Permissions** | No access, partial access |
| **State** | Mid-operation, after failure |

### Edge Case Format

```markdown
| Edge Case | Expected Behavior |
|-----------|-------------------|
| User has no orders | Show "No orders to export" message |
| User has 100,000 orders | Queue export, email when ready |
| Export while another export running | Show "Export in progress" message |
| Network fails during download | Show retry button, preserve progress |
| User logs out during export | Cancel export, clear partial data |
```

→ See `references/edge-case-identification.md`

## Step 7: Note Unknowns

### Unknown Types

| Type | Example | Action |
|------|---------|--------|
| **Needs research** | "What's the max CSV size Excel can open?" | Research before finalizing |
| **Needs decision** | "Should archived orders be included?" | Escalate for decision |
| **Needs discovery** | "How do users actually use exports?" | User research |
| **Technical unknown** | "Can we stream large CSV generation?" | Spike/prototype |

### Documenting Unknowns

```markdown
### Open Questions

| Question | Impact if Wrong | Owner | Due |
|----------|-----------------|-------|-----|
| Max practical export size? | Performance, UX | Engineering | Before dev |
| Include archived orders? | Scope, data volume | Product | Before spec final |
| Email or download for large? | Architecture | Engineering | During design |
```

### Unknowns vs. Assumptions

- **Unknown:** "We don't know X" — requires answer
- **Assumption:** "We're assuming X" — may need validation

Document both:
```markdown
### Assumptions
- Users have < 10,000 orders (based on current data)
- Export will be used monthly, not daily
- CSV format is sufficient (no Excel formatting needed)
```

## Step 8: Review and Confirm

### Self-Review Checklist

```markdown
- [ ] Goal is clear and tied to user need
- [ ] Scope is explicit (in and out)
- [ ] Acceptance criteria are testable
- [ ] Edge cases are identified and handled
- [ ] Unknowns are documented
- [ ] No implementation details (what, not how)
- [ ] Stakeholders can understand this
```

### Confirmation Techniques

| Technique | How It Works |
|-----------|--------------|
| **Walkthrough** | "Let me make sure I understand..." |
| **Scenarios** | "So if a user does X, then Y happens?" |
| **Counter-examples** | "This does NOT include Z, correct?" |
| **Priority check** | "If we can only ship one, which is most important?" |

## Output Format

### Quick Requirements Output

```markdown
## Quick Requirements: Order Export

**Goal:** Let users download their order history as CSV for analysis in Excel.

**Scope:**
- Export current user's orders as CSV
- Include: order_id, date, customer_name, total, status
- Filter by date range

**Not in scope:**
- Export other users' orders (admin feature, future)
- Excel or PDF format (CSV only for V1)
- Scheduled exports (manual trigger only)

**Acceptance Criteria:**
- [ ] "Export CSV" button visible on Orders page
- [ ] Clicking downloads CSV with all orders in selected date range
- [ ] CSV opens correctly in Excel
- [ ] Export completes in < 30 seconds for up to 10,000 orders

**Edge Cases:**
- No orders: Show "No orders to export" message
- > 10,000 orders: Show warning, allow anyway (V1), queue for V2
- Mid-export navigation: Cancel export, no partial file
```

### Standard Requirements Output

See `references/requirements-template.md` for full template.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `spec` | Requirements feed into spec; spec compiles requirements into implementation-ready specs |
| `architect` | Requirements define what; architect defines high-level how |
| `frontend-design` | (Frontend systems) UI requirements feed into DESIGN.md |
| `implement` | Implementation should trace back to requirements |
| `code-validation` | Validation checks against requirements criteria |
| `code-review` | Review verifies requirements are met |
| `test-generation` | Tests derived from acceptance criteria |

## Key Principles

**What, not how.** Spec defines the problem, not the solution. "User can export orders" not "Add an API endpoint that generates CSV."

**Testable over vague.** Every requirement should have a clear pass/fail test. "Fast" is vague; "< 2 second response time" is testable.

**Explicit over implicit.** State assumptions. Define terms. List what's NOT included. Ambiguity is the enemy.

**User-centric.** Requirements should trace to user needs. "As a user, I want X so that Y" forces this connection.

**Living document.** Specs evolve. Update them when requirements change. A stale spec is worse than no spec.

## Mode-Specific Behavior

Requirements gathering scope and approach differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full system requirements |
| **Approach** | Comprehensive requirements elicitation |
| **Patterns** | Free choice of requirements format |
| **Deliverables** | Full REQUIREMENTS.md or PRD |
| **Validation** | Standard requirements review |
| **Constraints** | Minimal - gather all requirements |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific requirements only |
| **Approach** | Extend existing requirements context |
| **Patterns** | Should match existing documentation style |
| **Deliverables** | Delta requirements document |
| **Validation** | Gap + integration requirements verified |
| **Constraints** | Don't restructure existing requirements |

**Polish considerations:**
```markdown
## Gap Requirements: [Gap Name]

**Current state:** [What exists]
**Gap:** [What's missing]
**Target state:** [What should exist]

**Acceptance criteria:**
- [ ] Gap is filled
- [ ] Existing functionality unchanged
- [ ] Integration points work correctly
```

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific requirements only |
| **Approach** | Surgical change specification |
| **Patterns** | Must conform exactly to change request format |
| **Deliverables** | Change request specification |
| **Validation** | Full regression impact assessment |
| **Constraints** | Requires approval - formal change process |

**Enterprise requirements format:**
```markdown
## Change Request: [CR Number]

**Business justification:** [Why this change]
**Current behavior:** [What happens now]
**Requested behavior:** [What should happen]
**Impact scope:** [What's affected]

**Acceptance criteria:**
- [ ] Change implemented as specified
- [ ] No regression in existing behavior
- [ ] Performance within acceptable range

**Risk assessment:**
- Impact: [High/Medium/Low]
- Rollback: [Possible/Complex/Impossible]
```

---

## References

- `references/requirements-elicitation.md`: Getting requirements from stakeholders
- `references/ambiguity-detection.md`: Finding and resolving unclear requirements
- `references/clarifying-questions.md`: Asking the right questions
- `references/scope-definition.md`: Drawing boundaries effectively
- `references/acceptance-criteria.md`: Writing testable criteria
- `references/edge-case-identification.md`: Finding corner cases systematically
- `references/requirements-template.md`: Standard requirements document template
- `references/prd-template.md`: Full PRD template for major features
