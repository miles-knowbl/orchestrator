---
name: use-case-clarity
description: "Assess how well-defined the prospect's use case is. Evaluates specificity, scope definition, and success criteria to determine implementation readiness."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["communication-parse"]
tags: [sales, scoring, use-case, knopilot]
---

# Use Case Clarity

Assess the clarity and definition of the prospect's use case.

## When to Use

- **After discovery** — Evaluate use case definition
- **Deal qualification** — Assess readiness to proceed
- **Proposal prep** — Ensure scope is clear
- When you say: "how defined is the use case", "use case assessment", "clarity check"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `clarity-levels.md` | Use case maturity framework |
| `clarity-questions.md` | Questions to improve clarity |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Use case assessment | `deals/{slug}/intelligence/use-case-assessment.json` | Always |
| Updated scores in deal.json | `deals/{slug}/deal.json` | Always |

## Core Concept

Use Case Clarity answers: **"Do they know what they want to build?"**

Good use case clarity means:
- **Specific** — Clear automation target, not vague "AI"
- **Scoped** — Bounded, not boiling the ocean
- **Measurable** — Defined success criteria

## Clarity Levels

| Level | Score | Description |
|-------|-------|-------------|
| Scoped | 85-100 | Ready for proposal/implementation |
| Defined | 60-84 | Clear direction, some details TBD |
| Exploring | 35-59 | General interest, needs shaping |
| Vague | 0-34 | "We need AI" with no specifics |

## The Assessment Process

```
┌─────────────────────────────────────────────────────────┐
│            USE CASE CLARITY ASSESSMENT                  │
│                                                         │
│  1. GATHER USE CASE SIGNALS                             │
│     └─→ From communications and discovery               │
│                                                         │
│  2. ASSESS SPECIFICITY                                  │
│     └─→ How specific is the automation target?          │
│                                                         │
│  3. EVALUATE SCOPE                                      │
│     └─→ Is it bounded? In/out of scope clear?           │
│                                                         │
│  4. CHECK SUCCESS CRITERIA                              │
│     └─→ How will they measure success?                  │
│                                                         │
│  5. IDENTIFY GAPS                                       │
│     └─→ What's still unclear?                           │
│                                                         │
│  6. RECOMMEND ACTIONS                                   │
│     └─→ How to improve clarity                          │
└─────────────────────────────────────────────────────────┘
```

## use-case-assessment.json Format

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "useCase": {
    "primary": "Tier 1 chat automation for returns and exchanges",
    "secondary": ["FAQ automation", "Order status inquiries"],
    "futurePhases": ["Voice support", "Proactive outreach"]
  },
  "clarityLevel": "defined",
  "score": {
    "overall": 78,
    "components": {
      "specificity": {
        "score": 85,
        "factors": ["Clear automation target", "Specific interactions defined"]
      },
      "scope": {
        "score": 70,
        "factors": ["Primary use case bounded", "Secondary not fully defined"]
      },
      "successCriteria": {
        "score": 75,
        "factors": ["Target: 30% ticket reduction", "Baseline not measured"]
      }
    }
  },
  "defined": {
    "automationTarget": "Tier 1 support chat",
    "channels": ["Web chat"],
    "interactions": ["Returns", "Exchanges", "Order status"],
    "users": "E-commerce customers"
  },
  "undefined": {
    "items": [
      "Secondary use case scope (FAQ, auth help)",
      "Current baseline metrics",
      "Edge case handling strategy",
      "Escalation workflow details"
    ]
  },
  "successCriteria": {
    "defined": true,
    "metrics": [
      {
        "metric": "Ticket reduction",
        "target": "30%",
        "baseline": "unknown",
        "measurementMethod": "TBD"
      }
    ]
  },
  "risks": [
    "Secondary scope may expand",
    "No baseline measurement yet"
  ],
  "recommendations": [
    "Conduct baseline measurement before pilot",
    "Scope secondary use cases before proposal",
    "Define escalation workflow in detail"
  ]
}
```

## Scoring Components

### Specificity (40%)

| Level | Score | Indicators |
|-------|-------|------------|
| Very Specific | 90-100 | Specific interactions, user flows, edge cases defined |
| Specific | 70-89 | Clear target automation, most interactions known |
| Moderate | 50-69 | General area known, details fuzzy |
| Vague | 0-49 | "AI for customer support" level |

### Scope (30%)

| Level | Score | Indicators |
|-------|-------|------------|
| Tightly Scoped | 90-100 | Clear in/out of scope, phased approach |
| Well Scoped | 70-89 | Primary scope clear, secondary fuzzy |
| Loosely Scoped | 50-69 | General boundaries, risk of creep |
| Unbounded | 0-49 | "Everything", no limits |

### Success Criteria (30%)

| Level | Score | Indicators |
|-------|-------|------------|
| Fully Defined | 90-100 | Metrics, targets, baselines, measurement method |
| Mostly Defined | 70-89 | Metrics and targets, baseline TBD |
| Partially Defined | 50-69 | General goals, no specific targets |
| Undefined | 0-49 | "Make it better" |

## Output Format

After assessment:

```
✓ Use Case Clarity Assessment: {company}

  CLARITY LEVEL: Defined (78/100)

  USE CASE SUMMARY:
    Primary: Tier 1 chat automation for returns and exchanges
    Secondary: FAQ automation, Order status inquiries
    Future: Voice support, Proactive outreach

  COMPONENT SCORES:

    Specificity: 85/100 ✓
      • Clear automation target: Tier 1 chat
      • Specific interactions: Returns, exchanges, order status
      • Channel defined: Web chat

    Scope: 70/100
      • Primary use case: Well bounded ✓
      • Secondary use cases: Need more definition
      • Risk: Scope creep on secondary

    Success Criteria: 75/100
      • Target: 30% ticket reduction ✓
      • Baseline: Not yet measured ⚠️
      • Measurement method: TBD

  WHAT'S DEFINED:
    ✓ Automation target (Tier 1 chat)
    ✓ Channels (Web chat)
    ✓ Interactions (Returns, exchanges, order status)
    ✓ Users (E-commerce customers)
    ✓ Success target (30% reduction)

  WHAT'S STILL UNCLEAR:
    ⚠️ Secondary use case scope
    ⚠️ Current baseline metrics
    ⚠️ Edge case handling
    ⚠️ Escalation workflow details

  RECOMMENDATIONS:
    → Conduct baseline measurement before pilot
    → Scope secondary use cases before proposal
    → Define escalation workflow in detail

  Files Updated:
    • intelligence/use-case-assessment.json
    • deal.json (use case clarity score)
```

## Quality Checklist

- [ ] Primary use case clearly stated
- [ ] Specificity assessed with evidence
- [ ] Scope boundaries identified
- [ ] Success criteria captured
- [ ] Gaps documented
- [ ] Risks identified
- [ ] Recommendations actionable
- [ ] Clarity level assigned
