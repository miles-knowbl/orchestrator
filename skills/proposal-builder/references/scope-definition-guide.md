# Scope Definition Guide

Clear scope definition prevents disputes, controls costs, and sets expectations. Ambiguous scope is the leading cause of failed engagements.

---

## In-Scope / Out-of-Scope Framework

Every proposal must explicitly state both what is included and what is not. Silence on a topic is not exclusion -- the client will assume it is included.

### Writing In-Scope Items

Each in-scope item should pass the **SMART-D test:**

| Criterion | Question | Example |
|-----------|----------|---------|
| **Specific** | Can someone unfamiliar with the project understand it? | "Build user authentication module" not "Handle security" |
| **Measurable** | How do we know it is done? | "Supports email + OAuth login for up to 10K users" |
| **Achievable** | Can we deliver this within the engagement? | Scoped to current constraints |
| **Relevant** | Does the client need this to achieve the stated outcome? | Tied to a stated objective |
| **Time-bound** | When will this be delivered? | Assigned to a phase with dates |
| **Deliverable** | What tangible artifact is produced? | "Deployed module + technical documentation" |

### Writing Out-of-Scope Items

Organize exclusions into four categories: **Adjacent systems** (integrations not covered), **Ongoing operations** (support, content, data entry), **Future capabilities** (deferred features), and **Client responsibilities** (actions the client must take).

**Rule of thumb:** If a client could reasonably expect it to be included, and it is not, call it out.

---

## Assumptions and Dependencies

Assumptions are conditions you believe to be true that, if false, would change the scope, timeline, or cost. Document them upfront.

### Common Assumption Categories

| Category | Example Assumptions |
|----------|-------------------|
| **Access** | Client provides VPN access within 5 business days of kickoff |
| **Availability** | Client stakeholders available for 2 hours/week for reviews |
| **Data** | Source data is in the format described during discovery |
| **Environment** | Staging environment is available and mirrors production |
| **Decisions** | Design approvals provided within 3 business days |
| **Technology** | Existing API supports required operations per documentation |
| **Third-party** | Vendor licenses are current and will remain active |

### Dependencies Documentation Template

```markdown
### Dependencies

| ID | Dependency | Owner | Required By | Impact if Late |
|----|-----------|-------|-------------|----------------|
| D1 | API credentials for [system] | Client | Week 1 | Delays Phase 2 by equivalent time |
| D2 | Brand guidelines and assets | Client | Week 2 | Design phase cannot begin |
| D3 | [Third-party] integration docs | Vendor | Week 3 | Integration scope may change |
```

---

## Change Management Process

Define how scope changes are handled before they occur. Include this in every proposal.

### Change Request Framework

Four-step process to include in every proposal:

1. **Request** -- Either party submits a written change request
2. **Assessment** -- Impact on scope, timeline, and investment evaluated within [3] business days
3. **Approval** -- Changes proceed only with written approval from authorized roles on both sides
4. **Adjustment** -- Approved changes documented in an addendum

For each change, assess the delta across scope, timeline, and investment in a comparison table (original vs. with change vs. delta).

---

## Scope Creep Prevention Techniques

### At Proposal Stage

| Technique | How to Apply |
|-----------|-------------|
| **Numbered deliverables** | Assign an ID to each deliverable (D1, D2...) for traceability |
| **Acceptance criteria** | Define "done" for each major deliverable |
| **Revision limits** | State included revision rounds (e.g., "2 rounds of design revisions") |
| **Boundary examples** | Use "such as" lists to clarify intent without exhaustive enumeration |
| **Phase gates** | Require sign-off before moving to the next phase |

### During Execution

| Technique | How to Apply |
|-----------|-------------|
| **Scope log** | Maintain a shared document tracking all scope discussions |
| **"Yes, and" responses** | Never say no; say "Yes, we can add that -- here is the impact" |
| **Weekly scope check** | Review scope alignment in every status meeting |
| **Parking lot** | Capture ideas for future phases without committing to current scope |
| **Reference the proposal** | Always point back to the signed scope when questions arise |

---

## Scope Definition Checklist

Use before finalizing any proposal:

- [ ] Every in-scope item has a tangible deliverable
- [ ] Out-of-scope section covers adjacent work the client might assume is included
- [ ] Assumptions are documented with impact statements
- [ ] Dependencies list includes owner and required-by date
- [ ] Change management process is defined
- [ ] Revision/iteration limits are stated where applicable
- [ ] Client responsibilities are explicit
- [ ] Acceptance criteria exist for major deliverables
- [ ] Phase gates require sign-off before progression
- [ ] Timeline accounts for client review and approval cycles

---

## Scope Statement Examples

**Weak:** "We will build a website."
**Strong:** "We will design and develop a 10-page marketing website on WordPress, including responsive design for mobile and tablet, contact form integration with HubSpot, and basic on-page SEO. Content writing and photography are not included. Two rounds of design revisions are included; additional rounds are billed at $150/hour."

**Weak:** "We will improve your data pipeline."
**Strong:** "We will refactor the ETL pipeline for the orders dataset (D1), reducing processing time from 4 hours to under 30 minutes (D2), and deploy it to your existing Airflow instance (D3). Pipeline monitoring dashboards are included (D4). Migration of historical data and changes to upstream source systems are out of scope."
