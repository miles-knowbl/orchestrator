# Assessment Template

Full architecture assessment document template.

## When to Use

Use this template for comprehensive architecture reviews that require:
- Formal documentation for stakeholders
- Baseline for improvement planning
- Audit trail of architectural state
- Input for strategic planning

## Document Structure

```markdown
# Architecture Assessment: [System Name]

**Assessment Date:** [Date]
**Assessors:** [Names]
**Version:** [1.0]
**Classification:** [Internal/Confidential]

---

## Executive Summary

### Purpose
[Why was this assessment conducted?]

### Scope
[What was reviewed? What was out of scope?]

### Overall Finding
[One paragraph summary of overall health]

### Health Score

| Dimension | Score |
|-----------|-------|
| Structural Soundness | [1-5] |
| Quality Attributes | [1-5] |
| Operational Fitness | [1-5] |
| Evolution Readiness | [1-5] |
| **Overall** | **[1-5]** |

### Critical Findings
1. [Most critical finding]
2. [Second critical finding]
3. [Third critical finding]

### Recommended Actions
1. [Highest priority action]
2. [Second priority action]
3. [Third priority action]

---

## 1. Context

### 1.1 System Overview
[What does this system do? Business purpose?]

### 1.2 History
| Milestone | Date | Notes |
|-----------|------|-------|
| Initial development | [Date] | [Notes] |
| Major rewrite | [Date] | [Notes] |
| Last significant change | [Date] | [Notes] |

### 1.3 Team
| Role | Count | Notes |
|------|-------|-------|
| Developers | [X] | [Skill level, tenure] |
| DevOps/SRE | [X] | |
| Product | [X] | |

### 1.4 Constraints
| Constraint | Description | Impact |
|------------|-------------|--------|
| Budget | [Description] | [Impact] |
| Timeline | [Description] | [Impact] |
| Technology | [Description] | [Impact] |
| Regulatory | [Description] | [Impact] |

### 1.5 Review Trigger
[Why is this review happening? Incident? Change? Periodic?]

---

## 2. Current State

### 2.1 System Context Diagram

```
[ASCII diagram showing system and external actors/systems]
```

### 2.2 Component Architecture

```
[ASCII diagram showing internal components]
```

### 2.3 Component Inventory

| Component | Type | Technology | Version | Owner | Health |
|-----------|------|------------|---------|-------|--------|
| [Name] | [Service/DB/Queue/etc] | [Tech] | [Ver] | [Team] | [🟢/🟡/🔴] |

### 2.4 Technology Stack

#### Application
| Layer | Technology | Version | Support Status |
|-------|------------|---------|----------------|
| Frontend | [Tech] | [Ver] | [Active/LTS/EOL] |
| Backend | [Tech] | [Ver] | [Active/LTS/EOL] |
| API | [Tech] | [Ver] | [Active/LTS/EOL] |

#### Data
| Store | Technology | Version | Size | Growth |
|-------|------------|---------|------|--------|
| [Name] | [Tech] | [Ver] | [Size] | [Rate] |

#### Infrastructure
| Component | Technology | Configuration |
|-----------|------------|---------------|
| Compute | [Tech] | [Details] |
| Network | [Tech] | [Details] |
| Storage | [Tech] | [Details] |

### 2.5 Data Flow

```
[ASCII diagram showing how data flows through system]
```

### 2.6 Integration Points

| External System | Direction | Protocol | Criticality | SLA |
|-----------------|-----------|----------|-------------|-----|
| [System] | [In/Out/Both] | [Protocol] | [H/M/L] | [SLA] |

### 2.7 Deployment Architecture

```
[ASCII diagram showing deployment topology]
```

---

## 3. Architectural Drivers

### 3.1 Discovered Drivers

Based on requirements, SLAs, stakeholder interviews, and incident history:

#### P0 (Critical)
1. **[Driver]** — [Description and evidence]
2. **[Driver]** — [Description and evidence]

#### P1 (Important)
3. **[Driver]** — [Description and evidence]
4. **[Driver]** — [Description and evidence]

#### P2 (Desirable)
5. **[Driver]** — [Description and evidence]

### 3.2 Driver-Architecture Alignment

| Driver | Priority | Current Support | Gap |
|--------|----------|-----------------|-----|
| [Driver] | P0 | [✅/⚠️/❌] | [Gap description] |

---

## 4. Evaluation

### 4.1 Quality Attributes

#### 4.1.1 Performance
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| p50 latency | [X]ms | [Y]ms | [✅/⚠️/❌] |
| p95 latency | [X]ms | [Y]ms | [✅/⚠️/❌] |
| Throughput | [X]/sec | [Y]/sec | [✅/⚠️/❌] |

**Assessment:** [Summary]

#### 4.1.2 Scalability
| Aspect | Current Capacity | Required Capacity | Status |
|--------|------------------|-------------------|--------|
| Users | [X] | [Y] | [✅/⚠️/❌] |
| Data | [X]GB | [Y]GB | [✅/⚠️/❌] |
| Requests | [X]/sec | [Y]/sec | [✅/⚠️/❌] |

**Assessment:** [Summary]

#### 4.1.3 Availability
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Uptime | [X]% | [Y]% | [✅/⚠️/❌] |
| MTTR | [X] min | [Y] min | [✅/⚠️/❌] |
| Outages (12mo) | [X] | [Y] | [✅/⚠️/❌] |

**Assessment:** [Summary]

#### 4.1.4 Security
| Aspect | Status | Notes |
|--------|--------|-------|
| Authentication | [✅/⚠️/❌] | [Notes] |
| Authorization | [✅/⚠️/❌] | [Notes] |
| Data Protection | [✅/⚠️/❌] | [Notes] |
| Audit | [✅/⚠️/❌] | [Notes] |

**Assessment:** [Summary]

#### 4.1.5 Maintainability
| Aspect | Status | Notes |
|--------|--------|-------|
| Test Coverage | [X]% | [Notes] |
| Documentation | [✅/⚠️/❌] | [Notes] |
| Complexity | [Low/Med/High] | [Notes] |
| Onboarding | [X] days | [Notes] |

**Assessment:** [Summary]

### 4.2 Structural Soundness

#### Modularity
[Assessment of module boundaries, separation of concerns]

#### Coupling
[Assessment of inter-component dependencies]

#### Cohesion
[Assessment of intra-component relatedness]

### 4.3 Operational Fitness

#### Deployability
[Assessment of deployment process, automation, risk]

#### Observability
[Assessment of monitoring, logging, alerting]

#### Recoverability
[Assessment of backup, recovery, disaster readiness]

### 4.4 Evolution Readiness

#### Extensibility
[Assessment of ability to add new features]

#### Modifiability
[Assessment of ability to change existing features]

#### Technical Debt
[Assessment of accumulated debt]

---

## 5. Findings

### 5.1 Critical Issues

#### ARCH-001: [Issue Title]
**Category:** [Security/Availability/Performance/Structure]
**Severity:** Critical
**Description:** [Detailed description]
**Evidence:** [Data, code examples, incidents]
**Impact:** [Business and technical impact]
**Recommendation:** [What to do]
**Effort:** [T-shirt size]

[Repeat for each critical issue]

### 5.2 High Priority Issues

#### ARCH-00X: [Issue Title]
[Same format as above]

### 5.3 Medium Priority Issues

| ID | Issue | Category | Effort | Recommendation |
|----|-------|----------|--------|----------------|
| ARCH-00X | [Issue] | [Category] | [Effort] | [Recommendation] |

### 5.4 Low Priority Issues

| ID | Issue | Category | Effort | Recommendation |
|----|-------|----------|--------|----------------|
| ARCH-00X | [Issue] | [Category] | [Effort] | [Recommendation] |

### 5.5 Strengths

[Document what's working well]
1. [Strength 1]
2. [Strength 2]
3. [Strength 3]

---

## 6. Recommendations

### 6.1 Immediate Actions (0-2 weeks)

| Priority | Action | Owner | Due | Status |
|----------|--------|-------|-----|--------|
| 1 | [Action] | [Owner] | [Date] | [ ] |

### 6.2 Short-term Improvements (1-3 months)

| Priority | Action | Effort | Dependencies |
|----------|--------|--------|--------------|
| 1 | [Action] | [T-shirt] | [Dependencies] |

### 6.3 Long-term Roadmap (3-12 months)

| Phase | Focus | Key Deliverables | Timeline |
|-------|-------|------------------|----------|
| 1 | [Focus] | [Deliverables] | [Timeline] |

### 6.4 Accept/Monitor

| Issue | Reason to Accept | Monitor How |
|-------|------------------|-------------|
| [Issue] | [Reason] | [How to monitor] |

---

## 7. Technical Debt Register

| ID | Description | Category | Severity | Effort | Priority |
|----|-------------|----------|----------|--------|----------|
| TD-001 | [Description] | [Category] | [H/M/L] | [T-shirt] | [1-N] |

**Total Technical Debt Estimate:** [X] person-weeks

**Recommended Debt Budget:** [Y]% of sprint capacity

---

## 8. Appendices

### A. Interview Notes
[Summarized notes from stakeholder interviews]

### B. Detailed Metrics
[Extended metrics data]

### C. Code Analysis Results
[Static analysis, coverage reports]

### D. Incident History
[Relevant incidents from past 12 months]

### E. Glossary
[Definitions of terms used]

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Author] | Initial assessment |
```

## Quick Assessment Template

For lighter-weight reviews:

```markdown
# Architecture Quick Review: [System Name]

**Date:** [Date]
**Reviewer:** [Name]
**Time Spent:** [X hours]

## Summary

**Overall Health:** 🟢 Good | 🟡 Concerns | 🔴 Critical

[2-3 sentence overall assessment]

## Scope

[What was reviewed]

## Key Findings

### Strengths
- [Strength 1]
- [Strength 2]

### Concerns
1. **[Issue 1]** — [Brief description]
   - Impact: [High/Medium/Low]
   - Recommendation: [Brief recommendation]

2. **[Issue 2]** — [Brief description]
   - Impact: [High/Medium/Low]
   - Recommendation: [Brief recommendation]

## Red Flags

- [ ] No critical security issues
- [ ] No single points of failure
- [ ] No data integrity risks
- [ ] No compliance violations

## Recommendations

| Priority | Action | Effort |
|----------|--------|--------|
| 1 | [Action] | [T-shirt] |
| 2 | [Action] | [T-shirt] |
| 3 | [Action] | [T-shirt] |

## Follow-up

- [ ] [Follow-up action needed]
- [ ] [Follow-up action needed]
```
