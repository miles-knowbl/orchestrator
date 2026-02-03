---
name: prototype-scoping
description: "Scope pilot/prototype projects for deals approaching Production stage. Defines success criteria, timeline, scope boundaries, and resources needed for technical validation."
phase: IMPLEMENT
category: sales
version: "1.0.0"
depends_on: ["use-case-clarity", "deal-scoring"]
tags: [sales, stage-specific, prototype, pilot, scoping, knopilot]
---

# Prototype Scoping

Scope pilot/prototype projects for technical validation.

## When to Use

- **Moving to Production stage** — Define pilot parameters
- **Technical validation needed** — Prove fit before full deal
- **Risk reduction** — Both sides want to test first
- When you say: "scope the pilot", "define POC", "prototype parameters"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `pilot-structure.md` | Standard pilot framework |
| `success-criteria.md` | How to define pilot success |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Pilot scope document | `deals/{slug}/pilot/pilot-scope.md` | Always |
| Success criteria | `deals/{slug}/pilot/pilot-scope.md` | Always |

## Core Concept

Prototype Scoping answers: **"What will we build, how will we measure success, and what does it prove?"**

Good pilot scoping:
- **Bounded** — Clear what's in and out of scope
- **Measurable** — Defined success criteria
- **Timeboxed** — Fixed duration
- **Convertible** — Path from pilot to full deal

## The Scoping Process

```
┌─────────────────────────────────────────────────────────┐
│            PROTOTYPE SCOPING PROCESS                    │
│                                                         │
│  1. DEFINE OBJECTIVES                                   │
│     └─→ What does the pilot need to prove?              │
│                                                         │
│  2. SCOPE BOUNDARIES                                    │
│     └─→ What's in/out of scope                          │
│                                                         │
│  3. SUCCESS CRITERIA                                    │
│     └─→ How will we measure success?                    │
│                                                         │
│  4. TIMELINE AND PHASES                                 │
│     └─→ How long, what milestones                       │
│                                                         │
│  5. RESOURCES NEEDED                                    │
│     └─→ Both sides' commitments                         │
│                                                         │
│  6. PATH TO FULL DEAL                                   │
│     └─→ What happens after successful pilot             │
└─────────────────────────────────────────────────────────┘
```

## pilot-scope.md Format

```markdown
# Pilot Scope: [Company Name]

## Overview
- **Company:** ShopCo
- **Pilot Start:** February 15, 2026
- **Pilot Duration:** 4 weeks
- **Pilot End:** March 15, 2026
- **Decision Date:** March 22, 2026

## Pilot Objectives

### Primary Objective
Validate that AI can successfully automate Tier 1 support inquiries
with acceptable accuracy and customer satisfaction.

### What This Pilot Proves
1. Technical integration with Shopify Plus and Zendesk works
2. AI can handle returns/exchanges/order status accurately
3. Customer satisfaction is maintained or improved
4. Ticket reduction targets are achievable

### What This Pilot Does NOT Prove
- Full scale (limited to subset of traffic)
- All use cases (future phases not included)
- Long-term performance (4 weeks only)

## Scope Definition

### In Scope
| Item | Details |
|------|---------|
| Use cases | Returns, exchanges, order status |
| Channel | Web chat only |
| Traffic | 20% of chat volume |
| Geography | US customers only |
| Languages | English only |

### Out of Scope
| Item | Rationale |
|------|-----------|
| Email support | Phase 2 |
| Phone support | Not planned |
| All chat traffic | Risk mitigation |
| Non-English | Future enhancement |
| Custom integrations | Standard integration only |

### Scope Boundaries
- AI handles Tier 1 inquiries only
- Escalation to human for complex cases
- No access to sensitive payment data
- Standard authentication via Okta

## Success Criteria

### Must Achieve (Required for Success)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Automation rate | >30% | % of chat handled by AI |
| Accuracy | >90% | Spot-check of AI responses |
| Customer satisfaction | No decrease | CSAT survey comparison |
| Escalation rate | <20% | % requiring human handoff |

### Should Achieve (Strongly Desired)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Response time | <30 seconds | Average first response |
| Resolution rate | >80% | % resolved without escalation |
| Agent satisfaction | Positive | Agent feedback survey |

### Nice to Have (Bonus)
| Metric | Target | Measurement |
|--------|--------|-------------|
| CSAT improvement | +5% | Survey comparison |
| Handle time reduction | >20% | Average conversation length |

## Timeline and Milestones

### Week 1: Setup
- [ ] Integration configuration
- [ ] Knowledge base import
- [ ] Initial training
- [ ] Test environment validation

### Week 2: Soft Launch (10% traffic)
- [ ] Launch to 10% of chat volume
- [ ] Daily monitoring
- [ ] Issue identification and fixes
- [ ] Baseline metrics established

### Week 3-4: Expanded Pilot (20% traffic)
- [ ] Expand to 20% of chat volume
- [ ] Continuous monitoring
- [ ] Weekly check-in calls
- [ ] Collect feedback

### Post-Pilot
- [ ] Final metrics report
- [ ] Success criteria evaluation
- [ ] Go/no-go decision meeting
- [ ] Full rollout planning (if successful)

## Resource Commitments

### ShopCo Provides
| Resource | Commitment |
|----------|------------|
| Project lead | Sarah Chen (4 hrs/week) |
| Technical lead | Michael Torres (2 hrs/week) |
| Support manager | TBD (2 hrs/week) |
| API access | Zendesk, Shopify Plus |
| Test accounts | 5 test customer accounts |
| Historical data | 6 months ticket history |

### [Your Company] Provides
| Resource | Commitment |
|----------|------------|
| Implementation lead | [Name] (dedicated) |
| Technical support | [Name] (on-call) |
| Training | Initial + ongoing |
| Reporting | Weekly metrics |
| Support | Slack channel for issues |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Integration delays | Medium | High | Start integration Week -1 |
| Accuracy issues | Medium | High | Start with 10% traffic |
| Customer complaints | Low | High | Real-time monitoring |
| Resource availability | Low | Medium | Confirm commitments upfront |

## Decision Criteria

### Success = Proceed to Full Rollout
All "Must Achieve" criteria met, no major issues.

### Partial Success = Extend Pilot
Some criteria met, issues are fixable.

### Failure = Do Not Proceed
Major criteria missed, fundamental issues.

## Path to Full Deal

### If Pilot Succeeds
1. Final metrics review (March 22)
2. Full rollout proposal (March 25)
3. Contract negotiation (April)
4. Full production launch (May)

### Commercial Terms
- Pilot: No charge / reduced rate
- Full deal: [Pricing approach]
- Pilot credits toward annual contract

## Sign-Off

| Role | Name | Date |
|------|------|------|
| ShopCo Champion | Sarah Chen | |
| ShopCo Technical | Michael Torres | |
| [Your Company] | [Name] | |
```

## Output Format

After scoping:

```
✓ Pilot Scoped: {company}

  OVERVIEW:
    Duration: 4 weeks (Feb 15 - Mar 15)
    Decision Date: March 22, 2026

  PILOT OBJECTIVES:
    ★ Prove technical integration works
    ★ Validate AI accuracy for use cases
    ★ Confirm customer satisfaction maintained
    ★ Demonstrate ticket reduction achievable

  SCOPE:
    IN: Returns, exchanges, order status on web chat (20% traffic)
    OUT: Email, phone, other use cases, non-English

  SUCCESS CRITERIA:
    MUST ACHIEVE:
    □ Automation rate >30%
    □ Accuracy >90%
    □ CSAT no decrease
    □ Escalation <20%

    SHOULD ACHIEVE:
    □ Response time <30 sec
    □ Resolution rate >80%

  TIMELINE:
    Week 1: Setup and integration
    Week 2: Soft launch (10% traffic)
    Week 3-4: Expanded pilot (20% traffic)
    Post: Decision meeting

  RESOURCES:
    ShopCo: Sarah (4 hrs/wk), Michael (2 hrs/wk), API access
    Us: Implementation lead, tech support, training, reporting

  PATH TO FULL DEAL:
    Success → Full rollout proposal → Contract → May launch

  Files Created:
    • pilot/pilot-scope.md
```

## Quality Checklist

- [ ] Objectives clearly defined
- [ ] Scope boundaries explicit
- [ ] Success criteria measurable
- [ ] Timeline with milestones
- [ ] Resources committed both sides
- [ ] Risks identified with mitigations
- [ ] Decision criteria clear
- [ ] Path to full deal documented
