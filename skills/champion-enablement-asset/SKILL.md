---
name: champion-enablement-asset
description: "Create materials that enable champions to sell internally. Generates ROI models, executive one-pagers, objection responses, and business cases tailored to the deal context."
phase: ACT
category: sales
version: "1.0.0"
depends_on: ["deal-scoring", "pain-point-extraction", "budget-timeline-extraction"]
tags: [sales, action-generation, champion-enablement, knopilot]
---

# Champion Enablement Asset

Create materials to help champions sell internally.

## When to Use

- **Champion needs ammunition** — Help them advocate
- **Internal meeting prep** — Arm for presentations
- **Stakeholder objections** — Counter specific concerns
- When you say: "create materials", "help champion sell", "ROI model"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `asset-types.md` | Types of enablement assets |
| `personalization.md` | How to tailor to context |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Enablement asset(s) | `deals/{slug}/assets/` | Always |
| Asset log | `deals/{slug}/assets/asset-log.json` | Always |

## Core Concept

Champion Enablement answers: **"What does my champion need to win internally?"**

Good enablement materials:
- **Tailored** — Specific to their situation, not generic
- **Usable** — Ready to present or share
- **Compelling** — Persuasive to their audience
- **Complete** — Answers likely questions

## Asset Types

| Type | Purpose | Audience |
|------|---------|----------|
| ROI Model | Quantify financial impact | CFO, Finance |
| Executive One-Pager | High-level summary | CEO, VPs |
| Objection Responses | Counter specific concerns | Various |
| Business Case | Formal justification | Committee |
| Competitive Comparison | Differentiation | Evaluators |
| Technical Summary | Architecture overview | CTO, IT |
| Implementation Plan | Timeline and approach | Operations |

## The Creation Process

```
┌─────────────────────────────────────────────────────────┐
│         CHAMPION ENABLEMENT ASSET CREATION              │
│                                                         │
│  1. IDENTIFY NEED                                       │
│     └─→ What does champion need to accomplish?          │
│                                                         │
│  2. DETERMINE ASSET TYPE                                │
│     └─→ ROI, one-pager, objection responses, etc.       │
│                                                         │
│  3. GATHER CONTEXT                                      │
│     └─→ Deal intelligence, pain points, metrics         │
│                                                         │
│  4. PERSONALIZE                                         │
│     └─→ Their numbers, their pain, their language       │
│                                                         │
│  5. CREATE ASSET                                        │
│     └─→ Draft content with their specifics              │
│                                                         │
│  6. DELIVER                                             │
│     └─→ Save to assets folder, share with champion      │
└─────────────────────────────────────────────────────────┘
```

## Asset Templates

### ROI Model

```markdown
# ROI Analysis: [Company Name]

## Executive Summary
Based on your stated volume of [X tickets/month] and current cost of [$Y/ticket],
implementing AI support automation could save [$Z annually].

## Current State
- Monthly support volume: [X]
- Cost per ticket: [$Y]
- Annual support cost: [$Z]
- Current resolution rate: [%]

## Projected Impact
| Metric | Current | With AI | Improvement |
|--------|---------|---------|-------------|
| Tickets handled automatically | 0% | 40% | +40% |
| Cost per ticket | $Y | $Z | -$% |
| Response time | X hours | Y seconds | -X% |
| Annual cost | $A | $B | -$C |

## Investment
- Implementation: [$X]
- Annual subscription: [$Y]
- Total year 1: [$Z]

## Return
- Year 1 savings: [$A]
- Year 1 ROI: [X%]
- Payback period: [X months]

## Additional Benefits
- [Benefit 1 specific to their pain]
- [Benefit 2 specific to their pain]
```

### Executive One-Pager

```markdown
# [Company Name]: AI Support Automation

## The Challenge
[Their specific pain point in one sentence]
- [Quantified impact 1]
- [Quantified impact 2]

## The Solution
[One sentence description]

## Why Now
- [Urgency driver 1]
- [Urgency driver 2]

## Expected Results
| Metric | Target |
|--------|--------|
| [Metric 1] | [Target] |
| [Metric 2] | [Target] |

## Investment & Timeline
- Investment: [$X]
- Timeline: [X weeks to live]
- ROI: [X% in year 1]

## Next Steps
1. [Specific next step]
2. [Following step]

## About [Your Company]
[2-sentence credibility statement]
```

## asset-log.json Format

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "dealId": "shopco",
  "assets": [
    {
      "id": "ASSET-001",
      "type": "roi-model",
      "filename": "shopco-roi-model-2026-02-03.md",
      "createdAt": "2026-02-03T15:00:00Z",
      "purpose": "Enable Sarah to address CFO ROI concerns",
      "targetAudience": "CFO Lisa Park",
      "inputs": {
        "ticketVolume": "15,000/month",
        "costPerTicket": "$12",
        "targetReduction": "30%"
      },
      "deliveredTo": "Sarah Chen",
      "deliveredAt": "2026-02-03T15:30:00Z",
      "outcome": "CFO reviewed, requested meeting"
    }
  ]
}
```

## Output Format

After creation:

```
✓ Champion Enablement Asset Created

  ASSET: ROI Model for CFO
  TYPE: roi-model
  FILE: assets/shopco-roi-model-2026-02-03.md

  PURPOSE: Enable Sarah to address CFO ROI concerns
  TARGET AUDIENCE: Lisa Park (CFO)

  PERSONALIZATION:
    ✓ Their ticket volume: 15,000/month
    ✓ Their cost per ticket: $12
    ✓ Their pain points: Volume increase, response time
    ✓ Their timeline: Q2 2026

  KEY METRICS:
    • Current annual cost: $2.16M
    • Projected savings: $648K/year
    • ROI: 162% year 1
    • Payback: 4.5 months

  ASSET PREVIEW:
    ─────────────────────────────────────────
    # ROI Analysis: ShopCo

    ## Executive Summary
    Based on your stated volume of 15,000 tickets/month
    and current cost of $12/ticket, implementing AI
    support automation could save $648K annually.
    ...
    ─────────────────────────────────────────

  FILES CREATED:
    • assets/shopco-roi-model-2026-02-03.md

  DELIVERY:
    → Send to Sarah Chen for CFO presentation
    → Offer to walk through if helpful
```

## Personalization Guidelines

### Always Personalize

| Element | Use Their Data |
|---------|----------------|
| Company name | Throughout |
| Numbers | Their metrics, not generic |
| Pain points | Their specific challenges |
| Timeline | Their deadlines |
| Stakeholders | Their names/roles |
| Industry | Their terminology |

### Data Sources

Pull personalization from:
- Pain point extraction
- Budget/timeline extraction
- Deal.json metrics
- Communications
- Stakeholder information

## Quality Checklist

- [ ] Asset type matches need
- [ ] Personalized with their data
- [ ] Numbers are realistic
- [ ] Pain points addressed
- [ ] Easy to present/share
- [ ] Professional formatting
- [ ] Saved to assets folder
- [ ] Logged in asset-log.json
- [ ] Delivered to champion
