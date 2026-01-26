# PRD Template

Full Product Requirements Document for major features.

## When to Use

Use a full PRD for:
- Major features (> 4 weeks development)
- Cross-team initiatives
- Features requiring executive sign-off
- High-risk or high-visibility projects
- Features with significant business impact

## Template

```markdown
# PRD: [Feature Name]

## Document Control

| Field | Value |
|-------|-------|
| Author | [Name] |
| Created | [Date] |
| Last Updated | [Date] |
| Version | [1.0] |
| Status | Draft / In Review / Approved / In Development / Shipped |
| Approvers | [Names and roles] |

---

## Executive Summary

[2-3 paragraphs maximum. Busy executives will read only this section.]

### The Problem
[One paragraph describing the problem we're solving]

### The Solution
[One paragraph describing what we're building]

### Expected Impact
[Key metrics and business outcomes]

### Timeline & Investment
[High-level timeline and resource requirements]

---

## Problem Definition

### Problem Statement
[Detailed description of the problem. Include data if available.]

### Who Has This Problem?
[User personas affected]

| Persona | Description | Pain Points |
|---------|-------------|-------------|
| [Persona 1] | [Description] | [Pain points] |
| [Persona 2] | [Description] | [Pain points] |

### Current State
[How do users solve this problem today? What's the workaround?]

### Impact of Not Solving
[What happens if we don't build this? Business impact, user impact.]

### Evidence
[Data, research, or user feedback supporting this problem]
- [Customer quote or data point]
- [Usage statistics]
- [Support ticket volume]

---

## Goals & Success Metrics

### Goals
| Goal | Description | Priority |
|------|-------------|----------|
| [Goal 1] | [Description] | P0 |
| [Goal 2] | [Description] | P1 |
| [Goal 3] | [Description] | P2 |

### Success Metrics

| Metric | Current | Target | Timeframe |
|--------|---------|--------|-----------|
| [Metric 1] | [Baseline] | [Target] | [When] |
| [Metric 2] | [Baseline] | [Target] | [When] |

### Non-Goals
[What this project is explicitly NOT trying to achieve]
- [Non-goal 1]
- [Non-goal 2]

---

## Solution Overview

### Proposed Solution
[High-level description of what we're building]

### Key Capabilities
1. **[Capability 1]**: [Description]
2. **[Capability 2]**: [Description]
3. **[Capability 3]**: [Description]

### User Experience
[How will users interact with this feature? Include flow diagrams or wireframes.]

### Technical Approach
[High-level technical approach. Not detailed design—that's a separate doc.]

---

## Detailed Requirements

### User Stories

#### Epic: [Epic Name]

**User Story 1:** [Story Title]
As a [user type], I want to [action] so that [benefit].

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

**Priority:** P0 / P1 / P2
**Estimated Effort:** [T-shirt size or story points]

---

**User Story 2:** [Story Title]
[Repeat format]

---

### Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-001 | [Requirement] | P0 | [Criteria] |
| FR-002 | [Requirement] | P1 | [Criteria] |

### Non-Functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| Performance | [Requirement] | [Target] |
| Security | [Requirement] | [Target] |
| Scalability | [Requirement] | [Target] |
| Accessibility | [Requirement] | [Target] |
| Reliability | [Requirement] | [Target] |

---

## Scope

### In Scope
| Phase | Capabilities |
|-------|--------------|
| MVP | [Capability list] |
| V1.1 | [Capability list] |
| Future | [Capability list] |

### Out of Scope
| Item | Reason | Future Consideration? |
|------|--------|----------------------|
| [Item] | [Reason] | Yes / No |

---

## User Experience

### User Flows
[Diagrams or step-by-step flows for key scenarios]

#### Flow 1: [Flow Name]
```
[Start] → [Step 1] → [Step 2] → [Step 3] → [End]
                         ↓
                    [Error Path]
```

### Wireframes / Mockups
[Links to Figma, screenshots, or embedded images]

### Edge Cases & Error States
| Scenario | Expected Behavior |
|----------|-------------------|
| [Scenario] | [Behavior] |

---

## Technical Considerations

### Architecture Impact
[How does this affect system architecture? New services? Database changes?]

### Integrations
| System | Integration Type | Description |
|--------|------------------|-------------|
| [System] | [Type] | [Description] |

### Data Requirements
- New data entities: [List]
- Data migrations: [Description]
- Data retention: [Policy]

### Security Considerations
- Authentication: [Requirements]
- Authorization: [Requirements]
- Data privacy: [Requirements]

### Performance Considerations
- Expected load: [Numbers]
- Latency requirements: [Targets]
- Scaling approach: [Description]

---

## Go-to-Market

### Launch Strategy
| Phase | Description | Date |
|-------|-------------|------|
| Internal alpha | [Description] | [Date] |
| Beta | [Description] | [Date] |
| GA | [Description] | [Date] |

### Feature Flags
| Flag | Description | Default |
|------|-------------|---------|
| [Flag name] | [What it controls] | [On/Off] |

### Documentation & Training
- [ ] User documentation
- [ ] API documentation
- [ ] Internal training
- [ ] Support team training

### Communication Plan
| Audience | Channel | Message | Timing |
|----------|---------|---------|--------|
| [Audience] | [Channel] | [Key message] | [When] |

---

## Dependencies & Risks

### Dependencies
| Dependency | Type | Owner | Status | Impact if Delayed |
|------------|------|-------|--------|-------------------|
| [Dependency] | [Tech/Team/External] | [Name] | [Status] | [Impact] |

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | H/M/L | H/M/L | [Mitigation] |

### Open Questions
| Question | Owner | Due Date | Status |
|----------|-------|----------|--------|
| [Question] | [Name] | [Date] | Open/Resolved |

---

## Timeline & Resources

### Milestones
| Milestone | Description | Target Date | Status |
|-----------|-------------|-------------|--------|
| [Milestone] | [Description] | [Date] | [Status] |

### Resource Requirements
| Role | Allocation | Duration |
|------|------------|----------|
| [Role] | [% or FTE] | [Duration] |

### Phase Breakdown
| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Discovery | [X weeks] | [Deliverables] |
| Design | [X weeks] | [Deliverables] |
| Development | [X weeks] | [Deliverables] |
| Testing | [X weeks] | [Deliverables] |
| Launch | [X weeks] | [Deliverables] |

---

## Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| [Alternative 1] | [Pros] | [Cons] | [Reason] |
| [Alternative 2] | [Pros] | [Cons] | [Reason] |

---

## Appendix

### Glossary
| Term | Definition |
|------|------------|
| [Term] | [Definition] |

### References
- [Link to research]
- [Link to related docs]
- [Link to competitive analysis]

### Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Name] | Initial version |

### Approvals
| Role | Name | Date | Status |
|------|------|------|--------|
| Product | [Name] | [Date] | Approved/Pending |
| Engineering | [Name] | [Date] | Approved/Pending |
| Design | [Name] | [Date] | Approved/Pending |
```

## Section Guidance

### Executive Summary

This is the most important section. Many stakeholders will only read this.

**Write it last.** You can't summarize what you haven't written.

**Keep it to one page.** If it takes more, you don't understand the project well enough.

### Problem Definition

Spend time here. If you don't understand the problem deeply, your solution will be shallow.

**Use data.** "Customers are frustrated" is weak. "47 support tickets last month about data export; 23% of churn interviews mention reporting gaps" is strong.

### Goals & Success Metrics

**Goals are qualitative:** "Make it easier to analyze data"
**Metrics are quantitative:** "50% of users export data within 30 days"

**Non-goals are critical.** They prevent scope creep and align stakeholders on what you're NOT doing.

### Solution Overview

Stay high-level. This is a PRD, not a design doc. If you're specifying database schemas here, you're going too deep.

### Alternatives Considered

This section builds confidence that you've thought through options. Even if stakeholders would have chosen the same solution, seeing alternatives shows rigor.

## PRD Review Checklist

Before circulating for review:

```markdown
### Completeness
- [ ] Executive summary stands alone
- [ ] Problem is clearly defined with evidence
- [ ] Success metrics are specific and measurable
- [ ] All requirements have acceptance criteria
- [ ] Scope boundaries are explicit
- [ ] Major risks identified with mitigations
- [ ] Timeline and resources estimated

### Quality
- [ ] No jargon without definition
- [ ] No ambiguous requirements
- [ ] No implementation details in requirements
- [ ] Alternatives were considered
- [ ] Stakeholder concerns addressed

### Alignment
- [ ] Goals align with company priorities
- [ ] Metrics align with goals
- [ ] Scope is achievable in timeline
- [ ] Dependencies are acknowledged by owners
```
