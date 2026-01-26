---
name: architecture-review
description: "Evaluate existing system architecture for soundness, risks, and improvement opportunities. Assesses structural integrity, quality attributes, technical debt, and alignment with business needs. Produces actionable findings with prioritized recommendations. Complements architect skill which designs new architecture."
phase: REVIEW
category: core
version: "1.0.0"
depends_on: [architect]
tags: [quality, review, architecture, assessment]
---

# Architecture Review

Evaluate existing architecture for soundness and improvement opportunities.

## When to Use

- **Before major changes** — Understand current state before modifying
- **Tech debt assessment** — Quantify and prioritize architectural debt
- **Post-incident** — Determine if architecture contributed to failure
- **New team/project** — Understand inherited system
- **Periodic health check** — Regular architecture assessment
- When you say: "review this architecture", "assess technical debt", "is this architecture sound?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `assessment-template.md` | Defines review structure and deliverable |
| `evaluation-dimensions.md` | How to score against drivers |
| `red-flags-checklist.md` | Quick issue identification scan |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `common-architecture-issues.md` | When identifying issues |
| `current-state-mapping.md` | When documenting system state |

**Verification:** Ensure ARCHITECTURE-REVIEW.md is produced with all 7 steps completed.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `ARCHITECTURE-REVIEW.md` | Project root | Always |

## Core Concept

Architecture review answers: **"Is this architecture fit for purpose?"**

Good architecture reviews are:
- **Objective** — Based on evidence, not opinions
- **Contextual** — Judged against actual requirements
- **Actionable** — Findings lead to clear next steps
- **Prioritized** — Issues ranked by impact and urgency

Architecture review is NOT:
- Designing new architecture (that's `architect`)
- Code review (that's `code-review`)
- Performance testing (that's `perf-analysis`)
- Security audit (that's `security-audit`)

## The Review Process

```
┌─────────────────────────────────────────────────────────┐
│              ARCHITECTURE REVIEW PROCESS                │
│                                                         │
│  1. ESTABLISH CONTEXT                                   │
│     └─→ What is this system? What are its goals?        │
│                                                         │
│  2. MAP CURRENT STATE                                   │
│     └─→ What does the architecture actually look like?  │
│                                                         │
│  3. IDENTIFY ARCHITECTURAL DRIVERS                      │
│     └─→ What should the architecture optimize for?      │
│                                                         │
│  4. EVALUATE AGAINST DRIVERS                            │
│     └─→ How well does it meet each driver?              │
│                                                         │
│  5. IDENTIFY ISSUES                                     │
│     └─→ What problems exist? What risks?                │
│                                                         │
│  6. PRIORITIZE FINDINGS                                 │
│     └─→ What matters most? What's urgent?               │
│                                                         │
│  7. RECOMMEND ACTIONS                                   │
│     └─→ What should be done? In what order?             │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Establish Context

Before reviewing, understand:

| Aspect | Questions |
|--------|-----------|
| **Purpose** | What does this system do? Who uses it? |
| **History** | How old? How did it evolve? Major changes? |
| **Team** | Who built it? Who maintains it? Size? |
| **Constraints** | Budget? Timeline? Skills? Politics? |
| **Scope** | Full system or specific area? |

### Context Questions

```markdown
## System Context

**What does this system do?**
[Primary purpose and value]

**Who are the users?**
[User types and volumes]

**How critical is it?**
[Business impact of failure]

**How old is the codebase?**
[Age, major rewrites, evolution]

**What's the team situation?**
[Size, experience, turnover]

**Why is this review happening?**
[Trigger: incident, change, assessment, etc.]

**What's the review scope?**
[Full system, specific component, specific concern]
```

## Step 2: Map Current State

Document what actually exists (not what was planned):

### Information Sources

| Source | What It Reveals |
|--------|-----------------|
| **Code** | Actual structure, dependencies, patterns |
| **Documentation** | Intended design (may be outdated) |
| **Diagrams** | Visual structure (verify accuracy) |
| **Interviews** | Tribal knowledge, pain points |
| **Monitoring** | Actual behavior, bottlenecks |
| **Incidents** | Failure modes, weak points |
| **Git history** | Evolution, hotspots, churn |

### Current State Artifacts

Create or verify:

```markdown
## Current State

### System Diagram
[Actual components and their relationships]

### Technology Stack
| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Frontend | [Tech] | [Ver] | [Notes] |
| Backend | [Tech] | [Ver] | [Notes] |
| Database | [Tech] | [Ver] | [Notes] |
| Infrastructure | [Tech] | [Ver] | [Notes] |

### Component Inventory
| Component | Purpose | Owner | Health |
|-----------|---------|-------|--------|
| [Name] | [Purpose] | [Team] | [RAG] |

### Integration Points
| System | Protocol | Direction | Criticality |
|--------|----------|-----------|-------------|
| [System] | [Protocol] | [In/Out/Both] | [High/Med/Low] |

### Data Stores
| Store | Type | Size | Growth | Backup |
|-------|------|------|--------|--------|
| [Name] | [Type] | [Size] | [Rate] | [Strategy] |
```

→ See `references/current-state-mapping.md`

## Step 3: Identify Architectural Drivers

What should this architecture optimize for?

### Discover Drivers

| Source | Questions |
|--------|-----------|
| **Requirements** | What non-functional requirements exist? |
| **SLAs** | What uptime/performance is promised? |
| **Stakeholders** | What do they care about most? |
| **Incidents** | What keeps breaking? |
| **Roadmap** | What future needs must it support? |

### Prioritize Drivers

```markdown
## Architectural Drivers (Discovered)

### P0 (Critical)
1. **Availability** — 99.9% SLA, revenue-critical
2. **Security** — Handles PII, regulatory compliance

### P1 (Important)
3. **Performance** — <500ms response time expected
4. **Scalability** — 3x growth planned next year

### P2 (Desirable)
5. **Maintainability** — Small team, need simplicity
6. **Extensibility** — New integrations planned
```

## Step 4: Evaluate Against Drivers

For each driver, assess how well the architecture supports it:

### Evaluation Matrix

| Driver | Rating | Evidence | Gap |
|--------|--------|----------|-----|
| Availability | ⚠️ Partial | Single DB, no failover | No redundancy |
| Security | ✅ Good | Encryption, auth, audit | Minor gaps |
| Performance | ❌ Poor | p95 at 2s, target 500ms | 4x over target |
| Scalability | ⚠️ Partial | Stateless app, but single DB | DB bottleneck |

### Rating Scale

| Rating | Meaning |
|--------|---------|
| ✅ **Good** | Fully meets driver requirements |
| ⚠️ **Partial** | Meets some requirements, gaps exist |
| ❌ **Poor** | Does not meet requirements |
| ❓ **Unknown** | Cannot assess, need more information |

→ See `references/evaluation-dimensions.md`

## Step 5: Identify Issues

### Issue Categories

| Category | Examples |
|----------|----------|
| **Structural** | Circular dependencies, god classes, tight coupling |
| **Quality Attribute** | Performance bottlenecks, security holes, scalability limits |
| **Operational** | Hard to deploy, monitor, debug |
| **Evolution** | Hard to change, extend, or maintain |
| **Alignment** | Doesn't match business needs, over/under-engineered |

### Issue Documentation

For each issue:

```markdown
### Issue: [Title]

**Category:** [Structural | Quality | Operational | Evolution | Alignment]

**Severity:** [Critical | High | Medium | Low]

**Description:**
[What is the issue?]

**Evidence:**
[How do we know this is an issue? Data, incidents, code examples]

**Impact:**
[What happens if not addressed?]

**Affected Drivers:**
[Which architectural drivers does this impact?]

**Root Cause:**
[Why does this issue exist?]
```

→ See `references/common-architecture-issues.md`

## Step 6: Prioritize Findings

### Prioritization Matrix

| | High Impact | Low Impact |
|---|------------|-----------|
| **High Urgency** | Do First | Schedule Soon |
| **Low Urgency** | Plan Carefully | Consider Later |

### Prioritization Factors

| Factor | Questions |
|--------|-----------|
| **Impact** | How much does it affect users/business? |
| **Risk** | What's the probability of failure? |
| **Urgency** | Is it getting worse? Time-sensitive? |
| **Effort** | How hard to fix? |
| **Dependencies** | Does it block other work? |

### Priority Assignment

```markdown
## Prioritized Issues

### Critical (Address Immediately)
1. **Single point of failure in database** — System goes down if DB fails
   - Impact: High (full outage)
   - Urgency: High (incident waiting to happen)
   - Effort: Medium (add read replica, failover)

### High (Address Soon)
2. **No rate limiting on API** — Vulnerable to abuse
   - Impact: High (security, availability)
   - Urgency: Medium (no incidents yet)
   - Effort: Low (add rate limiter)

### Medium (Plan to Address)
3. **Circular dependency between services** — Hard to deploy independently
   - Impact: Medium (slows development)
   - Urgency: Low (working, just painful)
   - Effort: High (requires refactoring)

### Low (Monitor/Backlog)
4. **Inconsistent logging format** — Hard to search logs
   - Impact: Low (debugging slower)
   - Urgency: Low (not critical)
   - Effort: Low (standardize format)
```

## Step 7: Recommend Actions

### Recommendation Format

```markdown
### Recommendation: [Title]

**Addresses:** [Issue #X, Issue #Y]

**Action:**
[Specific, actionable recommendation]

**Approach:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Effort:** [T-shirt size]

**Risk:** [Risk of making this change]

**Dependencies:** [What must happen first]

**Success Criteria:**
[How to know this is done/working]
```

### Recommendation Types

| Type | Description |
|------|-------------|
| **Quick Win** | Low effort, immediate benefit |
| **Strategic Investment** | High effort, high long-term value |
| **Risk Mitigation** | Prevent future problems |
| **Monitoring** | Watch but don't act yet |
| **Accept** | Known issue, cost of change exceeds benefit |

## Review Dimensions

### Structural Review

| Aspect | What to Check |
|--------|---------------|
| **Modularity** | Clear boundaries? Single responsibility? |
| **Coupling** | Dependencies between components? |
| **Cohesion** | Related things together? |
| **Layering** | Clear layers? Dependencies flow correctly? |
| **Abstraction** | Right level? Leaky abstractions? |

### Quality Attribute Review

| Attribute | What to Check |
|-----------|---------------|
| **Performance** | Bottlenecks? N+1 queries? Caching? |
| **Scalability** | Horizontal scaling? Statelessness? |
| **Availability** | Redundancy? Failover? Recovery? |
| **Security** | Auth? Encryption? Input validation? |
| **Maintainability** | Complexity? Documentation? Tests? |

### Operational Review

| Aspect | What to Check |
|--------|---------------|
| **Deployability** | How hard to deploy? Rollback? |
| **Observability** | Metrics? Logs? Traces? Alerts? |
| **Debuggability** | Can issues be diagnosed? |
| **Configurability** | Environment handling? Feature flags? |

### Evolution Review

| Aspect | What to Check |
|--------|---------------|
| **Extensibility** | How hard to add features? |
| **Modifiability** | How hard to change existing? |
| **Portability** | Vendor lock-in? |
| **Technical Debt** | Accumulated shortcuts? |

→ See `references/review-checklists.md`

## Output Formats

### Quick Review (1-2 hours)

```markdown
# Architecture Quick Review: [System Name]

**Date:** [Date]
**Reviewer:** [Name]
**Scope:** [What was reviewed]

## Summary

[2-3 sentence overall assessment]

**Overall Health:** 🟢 Good | 🟡 Concerns | 🔴 Critical Issues

## Key Findings

### Strengths
- [Strength 1]
- [Strength 2]

### Concerns
1. **[Issue 1]** — [Brief description]
2. **[Issue 2]** — [Brief description]

## Recommendations

1. **[Recommendation 1]** — [Priority: High/Medium/Low]
2. **[Recommendation 2]** — [Priority: High/Medium/Low]

## Next Steps

- [ ] [Immediate action]
- [ ] [Follow-up investigation]
```

### Full Assessment (1-2 days)

```markdown
# Architecture Assessment: [System Name]

## Executive Summary
[One page summary for leadership]

## Context
[System purpose, history, team, constraints]

## Current State
[Diagrams, component inventory, technology stack]

## Architectural Drivers
[Prioritized list of what architecture should optimize for]

## Evaluation
[Assessment against each driver]

## Findings

### Critical Issues
[Detailed issue documentation]

### High Priority Issues
[Detailed issue documentation]

### Medium/Low Priority Issues
[Summary]

## Recommendations

### Immediate Actions
[Quick wins, critical fixes]

### Short-term Improvements (1-3 months)
[Planned work]

### Long-term Roadmap (3-12 months)
[Strategic improvements]

## Technical Debt Register
[Catalog of known debt with estimates]

## Appendix
[Supporting data, detailed diagrams, interview notes]
```

→ See `references/assessment-template.md`

## Red Flags

Issues that should trigger immediate attention:

### Structural Red Flags

- 🚩 Circular dependencies between services
- 🚩 God class/service handling too much
- 🚩 No clear module boundaries
- 🚩 Shared mutable state across components
- 🚩 Tight coupling to specific technologies

### Quality Red Flags

- 🚩 Single point of failure (no redundancy)
- 🚩 No authentication on internal services
- 🚩 Secrets in code or config files
- 🚩 No encryption for sensitive data
- 🚩 Unbounded queries or operations

### Operational Red Flags

- 🚩 No monitoring or alerting
- 🚩 Cannot deploy without downtime
- 🚩 No rollback capability
- 🚩 Cannot reproduce production issues locally
- 🚩 Manual steps required for deployment

### Evolution Red Flags

- 🚩 "Don't touch that code" warnings
- 🚩 No tests for critical paths
- 🚩 Documentation completely outdated
- 🚩 Only one person understands the system
- 🚩 Every change requires coordinated deploys

→ See `references/red-flags-checklist.md`

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `architect` | Architect designs new; architecture-review evaluates existing |
| `code-review` | Code-review is per-change; architecture-review is system-wide |
| `code-validation` | Validation checks code; architecture-review checks structure |
| `security-audit` | Security-audit deep-dives security; architecture-review is broader |
| `debug-assist` | Debug-assist fixes issues; architecture-review identifies systemic causes |

## Key Principles

**Evidence over opinion.** Back findings with data, code examples, incidents.

**Context matters.** Judge architecture against its actual requirements, not ideal standards.

**Prioritize ruthlessly.** Not all issues are worth fixing. Focus on what matters.

**Actionable findings.** Every issue should have a path forward.

**Respect constraints.** Recommendations must be achievable within real constraints.

**Balance criticism with recognition.** Note what's working well, not just problems.

## Mode-Specific Behavior

Architecture review scope and depth differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full proposed architecture design |
| **Approach** | Comprehensive 7-step review process |
| **Patterns** | Free choice—evaluating proposed patterns |
| **Deliverables** | Full ARCHITECTURE-REVIEW.md |
| **Validation** | Standard design soundness checks |
| **Constraints** | Minimal—can block SCAFFOLD phase |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific architecture impact |
| **Approach** | Extend existing—targeted review of affected areas |
| **Patterns** | Should match existing architecture patterns |
| **Deliverables** | Delta review document |
| **Validation** | Existing architecture + gap integration |
| **Constraints** | Don't restructure—blocks if gap violates architecture |

**Polish considerations:**
- Does the gap fit existing architecture?
- Will filling the gap require architectural changes?
- Are there existing patterns that must be followed?
- Will the gap introduce new dependencies?

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change impact assessment only |
| **Approach** | Surgical—impact analysis, not full review |
| **Patterns** | Must conform exactly—no architectural alterations |
| **Deliverables** | Architecture impact assessment |
| **Validation** | Full risk and compliance analysis |
| **Constraints** | Requires approval—any architectural impact escalates |

**Enterprise architecture review requirements:**
- Change must not alter existing architecture
- Any architectural impact requires escalation
- Review focuses on risk, not improvement
- Document why change is architecturally safe

---

## References

- `references/current-state-mapping.md`: How to document existing architecture
- `references/evaluation-dimensions.md`: What to evaluate and how
- `references/common-architecture-issues.md`: Catalog of typical problems
- `references/review-checklists.md`: Dimension-specific checklists
- `references/red-flags-checklist.md`: Warning signs requiring attention
- `references/assessment-template.md`: Full assessment document template
