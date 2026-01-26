# Requirements Template

Standard template for requirements documents.

## When to Use

Use this template for medium-sized features that need clear documentation but don't require a full PRD. Good for:
- Features taking 1-4 weeks to build
- Work with 1-3 developers
- Moderate complexity
- Some stakeholder alignment needed

## Template

```markdown
# Requirements: [Feature Name]

**Author:** [Name]
**Created:** [Date]
**Last Updated:** [Date]
**Status:** Draft | Review | Approved | In Spec | Implemented

---

## Overview

### Problem Statement
[What problem are we solving? Why does it matter?]

### Goal
[One sentence: what we're building and why]

### Success Metrics
[How will we know this is successful?]
- Metric 1: [target]
- Metric 2: [target]

---

## User Stories

### Primary User Story
As a [user type], I want to [action] so that [benefit].

### Secondary User Stories (if applicable)
- As a [user type], I want to [action] so that [benefit].
- As a [user type], I want to [action] so that [benefit].

---

## Scope

### In Scope (Must Have)
- [ ] [Core capability 1]
- [ ] [Core capability 2]
- [ ] [Core capability 3]

### In Scope (Should Have)
- [ ] [Important but not blocking]
- [ ] [Can ship without if needed]

### Out of Scope
- [Explicitly excluded item 1]
- [Explicitly excluded item 2]
- [Future consideration]

---

## Requirements

### Functional Requirements

#### FR-1: [Requirement Name]
**Description:** [What the system should do]

**Acceptance Criteria:**
- [ ] [Testable criterion]
- [ ] [Testable criterion]

#### FR-2: [Requirement Name]
**Description:** [What the system should do]

**Acceptance Criteria:**
- [ ] [Testable criterion]
- [ ] [Testable criterion]

### Non-Functional Requirements

#### Performance
- [Requirement]: [Target]
- Example: Page load time < 2 seconds on 3G

#### Security
- [Requirement]: [Target]
- Example: All data encrypted in transit (TLS 1.2+)

#### Scalability
- [Requirement]: [Target]
- Example: Support 10,000 concurrent users

#### Accessibility
- [Requirement]: [Target]
- Example: WCAG 2.1 AA compliance

---

## User Experience

### User Flow
[Describe the step-by-step user journey]

1. User [action]
2. System [response]
3. User [action]
4. System [response]

### Wireframes/Mockups
[Link to designs or embedded images]

### Error States
| Error Condition | User Message | System Behavior |
|-----------------|--------------|-----------------|
| [Condition] | [Message] | [Behavior] |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| [Empty state] | [Behavior] |
| [Error state] | [Behavior] |
| [Boundary condition] | [Behavior] |
| [Concurrent access] | [Behavior] |

---

## Dependencies

### Technical Dependencies
- [System/service this depends on]
- [API or integration required]

### Team Dependencies
- [Other team work needed]
- [Timing dependencies]

### External Dependencies
- [Third-party services]
- [Data sources]

---

## Open Questions

| Question | Impact | Owner | Due Date | Resolution |
|----------|--------|-------|----------|------------|
| [Question] | [High/Med/Low] | [Name] | [Date] | [Answer when resolved] |

---

## Assumptions

- [Assumption 1]: [Basis for assumption]
- [Assumption 2]: [Basis for assumption]

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | [H/M/L] | [H/M/L] | [Mitigation plan] |

---

## Timeline

| Phase | Description | Duration | Target Date |
|-------|-------------|----------|-------------|
| Design | [Description] | [X days] | [Date] |
| Development | [Description] | [X days] | [Date] |
| Testing | [Description] | [X days] | [Date] |
| Release | [Description] | [X days] | [Date] |

---

## Glossary

| Term | Definition |
|------|------------|
| [Term] | [Definition] |

---

## Appendix

### Related Documents
- [Link to related spec]
- [Link to design doc]

### Change Log

| Date | Author | Changes |
|------|--------|---------|
| [Date] | [Name] | [What changed] |
```

## Section Guidance

### Overview

Keep it brief. Someone should understand what this is about in 30 seconds.

**Problem Statement:** The pain point, not the solution. "Users can't analyze their data in Excel" not "We need an export feature."

**Goal:** One sentence. What + why. "Allow users to export orders as CSV so they can analyze data in their preferred tools."

**Success Metrics:** How you'll measure success. Be specific: "50% of active users use export within 30 days" not "Users like the feature."

### Scope

**Be ruthless about Out of Scope.** Everything not explicitly in scope should be explicitly out of scope. This prevents scope creep.

The Must/Should/Could prioritization helps when time runs short—you know what to cut.

### Requirements

**Functional requirements** describe what the system does.
**Non-functional requirements** describe how well it does it.

Each requirement should be testable. If you can't write a test for it, it's not a requirement—it's a wish.

### Edge Cases

This section often reveals missing requirements. If you can't define the behavior for an edge case, you have an ambiguity.

### Open Questions

Don't pretend you know everything. Document unknowns explicitly. Assign owners and due dates so they get resolved.

### Assumptions

Assumptions are requirements in disguise. If an assumption is wrong, the spec may need to change. Make them explicit so they can be validated.

## Example: Order Export Requirements

```markdown
# Requirements: Order Export

**Author:** Jane Developer
**Created:** 2024-01-15
**Status:** Approved

---

## Overview

### Problem Statement
Users need to analyze their order data in Excel for accounting and reporting purposes. Currently, they must manually copy data from the web interface, which is time-consuming and error-prone.

### Goal
Allow users to export their orders as CSV so they can analyze data in Excel or other tools.

### Success Metrics
- 30% of active users use export within 60 days
- Support tickets about "getting data out" decrease by 50%

---

## User Stories

### Primary User Story
As a shop owner, I want to export my orders as CSV so that I can analyze sales trends in Excel.

---

## Scope

### In Scope (Must Have)
- [ ] Export all orders as CSV
- [ ] Filter by date range before export
- [ ] Include key order fields (id, date, customer, total, status)

### In Scope (Should Have)
- [ ] Choose which columns to include
- [ ] Export as Excel format (xlsx)

### Out of Scope
- Scheduled/recurring exports (future consideration)
- Export to Google Sheets directly
- Export of customer or product data (separate features)

---

## Requirements

### FR-1: Basic CSV Export

**Description:** Users can export their orders as a CSV file.

**Acceptance Criteria:**
- [ ] "Export CSV" button visible on Orders page
- [ ] Clicking button downloads CSV to user's device
- [ ] CSV contains columns: order_id, date, customer_name, total, status
- [ ] CSV opens correctly in Excel (proper encoding, formatting)
- [ ] Export completes in < 30 seconds for up to 10,000 orders

### FR-2: Date Range Filter

**Description:** Users can filter orders by date range before exporting.

**Acceptance Criteria:**
- [ ] Date range picker appears before export
- [ ] Default range is last 30 days
- [ ] Only orders in selected range are exported
- [ ] Invalid date range shows error message

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User has no orders | Show "No orders to export" message |
| User has > 10,000 orders | Show warning, queue export, email when ready |
| Date range has no orders | Show "No orders in selected range" message |
| Export fails mid-download | Show "Export failed" with retry button |

---

## Open Questions

| Question | Impact | Owner | Due Date | Resolution |
|----------|--------|-------|----------|------------|
| Include archived orders? | Scope | Product | 2024-01-20 | No, exclude archived |

---

## Assumptions

- Users have fewer than 100,000 orders (based on current data)
- Monthly export frequency is typical use case
- CSV format is sufficient for most users (Excel format is nice-to-have)
```
