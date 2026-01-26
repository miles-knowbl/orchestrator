# Dream State Template

Template for defining the end vision for a domain.

## What is a Dream State?

A dream state is the **complete vision** for a domain when fully realized. It describes:
- What capabilities will exist
- What problems will be solved
- What the user experience will be
- What constraints must be respected
- How success will be measured

The dream state guides all systems built within the domain.

## Template

```markdown
# Dream State: [Domain Name]

## Vision Statement

[2-3 sentences capturing the essence of what this domain will become when complete.
Write as if describing it to someone after it's built.]

Example:
"Azure Standard Operations will be a fully integrated field service management platform
that enables dispatchers to optimize routes in real-time, technicians to access all
job information on mobile devices, and managers to monitor operations through live dashboards.
The platform will reduce average response time by 40% and eliminate paper-based workflows."

---

## Key Capabilities

When complete, the domain will provide:

### Core Capabilities (Must Have)
- [ ] [Capability 1]
- [ ] [Capability 2]
- [ ] [Capability 3]

### Enhanced Capabilities (Should Have)
- [ ] [Capability 4]
- [ ] [Capability 5]

### Future Capabilities (Could Have)
- [ ] [Capability 6]
- [ ] [Capability 7]

---

## Users

### Primary Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| [Role 1] | [Who they are] | [What they need] |
| [Role 2] | [Who they are] | [What they need] |

### Secondary Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| [Role 3] | [Who they are] | [What they need] |

---

## Current State (As-Is)

### Current Process
[Describe how things work today, including pain points]

### Current Systems
- [System 1]: [What it does, limitations]
- [System 2]: [What it does, limitations]

### Key Problems
1. [Problem 1]: [Impact]
2. [Problem 2]: [Impact]
3. [Problem 3]: [Impact]

---

## Future State (To-Be)

### User Journey: [Primary User Type]

```
1. [Step 1]
   └─→ [What happens, what they see]
2. [Step 2]
   └─→ [What happens, what they see]
3. [Step 3]
   └─→ [What happens, what they see]
```

### Key Improvements
| Before | After | Impact |
|--------|-------|--------|
| [Current state] | [Future state] | [Metric] |
| [Current state] | [Future state] | [Metric] |

---

## Constraints

### Technology Constraints
| Constraint | Value | Rationale |
|------------|-------|-----------|
| Primary Language | [e.g., Python] | [Why] |
| Frontend Framework | [e.g., React] | [Why] |
| Database | [e.g., PostgreSQL] | [Why] |
| Cloud Provider | [e.g., AWS] | [Why] |
| Hosting | [e.g., Kubernetes] | [Why] |

### Business Constraints
| Constraint | Value | Rationale |
|------------|-------|-----------|
| Timeline | [e.g., MVP in 3 months] | [Why] |
| Budget | [e.g., $100k total] | [Why] |
| Team Size | [e.g., 3 engineers] | [Why] |

### Compliance Constraints
| Requirement | Details |
|-------------|---------|
| [e.g., SOC2] | [Specific requirements] |
| [e.g., GDPR] | [Specific requirements] |

---

## Integration Requirements

### Must Integrate With
| System | Direction | Data | Priority |
|--------|-----------|------|----------|
| [System 1] | In/Out/Both | [What data] | Required |
| [System 2] | In/Out/Both | [What data] | Required |

### May Integrate With (Future)
| System | Direction | Data | Priority |
|--------|-----------|------|----------|
| [System 3] | In/Out/Both | [What data] | Optional |

---

## Success Metrics

### Launch Criteria (MVP)
| Metric | Target | Measurement |
|--------|--------|-------------|
| [Metric 1] | [Value] | [How measured] |
| [Metric 2] | [Value] | [How measured] |

### 90-Day Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| [Metric 3] | [Value] | [How measured] |
| [Metric 4] | [Value] | [How measured] |

### Long-Term Targets (1 Year)
| Metric | Target | Measurement |
|--------|--------|-------------|
| [Metric 5] | [Value] | [How measured] |
| [Metric 6] | [Value] | [How measured] |

---

## Anti-Goals (Explicitly Out of Scope)

Things we will **NOT** build:
- [Anti-goal 1]: [Why excluded]
- [Anti-goal 2]: [Why excluded]
- [Anti-goal 3]: [Why excluded]

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Strategy] |
| [Risk 2] | High/Med/Low | High/Med/Low | [Strategy] |

---

## Open Questions

Questions that need answers before or during implementation:
- [ ] [Question 1]
- [ ] [Question 2]

---

## Appendix

### Glossary
| Term | Definition |
|------|------------|
| [Term 1] | [Definition] |
| [Term 2] | [Definition] |

### References
- [Link to research]
- [Link to competitor]
- [Link to inspiration]
```

## Example: Completed Dream State

```markdown
# Dream State: Azure Standard Field Service

## Vision Statement

Azure Standard Field Service will be a mobile-first platform that enables our
50+ field technicians to receive work orders, navigate to locations, complete
service tasks, and capture customer signatures—all from their phones. The back
office will have real-time visibility into field operations, with automated
dispatching that reduces average response time from 4 hours to under 1 hour.

---

## Key Capabilities

When complete, the domain will provide:

### Core Capabilities (Must Have)
- [ ] Work order creation and assignment
- [ ] Mobile app for technicians (iOS + Android)
- [ ] Real-time location tracking
- [ ] Digital signature capture
- [ ] Photo documentation
- [ ] Offline support (sync when connected)

### Enhanced Capabilities (Should Have)
- [ ] Automated route optimization
- [ ] Parts inventory management
- [ ] Customer notification system
- [ ] Performance dashboards

### Future Capabilities (Could Have)
- [ ] Predictive maintenance scheduling
- [ ] Customer self-service portal
- [ ] AI-powered dispatching

---

## Users

### Primary Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| Field Technician | 50 techs across 3 regions | Easy mobile access, offline support |
| Dispatcher | 5 people managing daily assignments | Queue visibility, drag-drop scheduling |

### Secondary Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| Operations Manager | 2 people overseeing all operations | KPI dashboards, exception alerts |
| Customer | Companies receiving service | Status updates, appointment windows |

---

## Constraints

### Technology Constraints
| Constraint | Value | Rationale |
|------------|-------|-----------|
| Backend | Django + DRF | Team expertise, existing systems |
| Frontend | Elm | Type safety, team preference |
| Mobile | React Native | Cross-platform, JS skills |
| Database | PostgreSQL | Existing infrastructure |
| Hosting | Azure | Corporate standard |

### Business Constraints
| Constraint | Value | Rationale |
|------------|-------|-----------|
| Timeline | MVP in 4 months | Peak season starts in May |
| Budget | $75k infrastructure | Annual budget allocation |
| Team | 2 engineers + contractor | Current headcount |

---

## Success Metrics

### Launch Criteria (MVP)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Work orders processed | 100% via system | vs paper fallback |
| Mobile app adoption | 80% of technicians | DAU/MAU |

### 90-Day Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| Average response time | <2 hours | Time from request to arrival |
| Customer satisfaction | >4.0/5.0 | Post-service survey |

---

## Anti-Goals

- **Billing/invoicing**: Use existing QuickBooks integration
- **CRM**: Use existing Salesforce, sync only what's needed
- **Fleet management**: Separate system, not in scope
```

## Checklist

Before proceeding, verify the dream state has:

- [ ] Clear vision statement
- [ ] Prioritized capabilities (must/should/could)
- [ ] Defined users and their needs
- [ ] Documented constraints
- [ ] Integration requirements identified
- [ ] Measurable success metrics
- [ ] Explicit anti-goals
- [ ] Known risks listed
