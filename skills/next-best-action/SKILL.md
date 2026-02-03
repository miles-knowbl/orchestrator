---
name: next-best-action
description: "Generate prioritized action recommendations using the NBA Engine. Scores actions by likelihood of success, effort required, and champion value to identify highest-impact next moves."
phase: ACT
category: sales
version: "1.0.0"
depends_on: ["deal-scoring", "risk-assessment"]
tags: [sales, action-generation, nba, knopilot]
---

# Next Best Action

Generate prioritized action recommendations for a deal.

## When to Use

- **After deal review** — What should I do next?
- **Weekly planning** — Prioritize across deals
- **Stuck deals** — Find the move to unstick
- When you say: "what should I do", "next steps", "priorities"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `nba-formula.md` | How actions are scored |
| `action-library.md` | Standard action types |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Next best actions | `deals/{slug}/actions/nba-{date}.json` | Always |
| Updated DEAL.md | `deals/{slug}/DEAL.md` | Action section |

## Core Concept

Next Best Action answers: **"What's the single most valuable thing I can do right now?"**

The NBA Engine scores actions by:
- **Likelihood** — Will this action actually work?
- **Effort** — How much work is required?
- **Champion Value** — Does this strengthen our champion?

## The NBA Formula

```
NBA Score = (Likelihood × 0.40) + (Effort Factor × 0.30) + (Champion Value × 0.30)

Where:
- Likelihood: 0-100 (probability of success)
- Effort Factor: 100 - Effort (lower effort = higher score)
- Champion Value: 0-100 (how much this helps champion)
```

## The Generation Process

```
┌─────────────────────────────────────────────────────────┐
│           NEXT BEST ACTION GENERATION                   │
│                                                         │
│  1. ANALYZE DEAL STATE                                  │
│     └─→ Scores, risks, gaps, stage                      │
│                                                         │
│  2. IDENTIFY CANDIDATE ACTIONS                          │
│     └─→ From action library + deal context              │
│                                                         │
│  3. SCORE EACH ACTION                                   │
│     └─→ Likelihood × Effort Factor × Champion Value     │
│                                                         │
│  4. RANK AND FILTER                                     │
│     └─→ Top 3-5 actions                                 │
│                                                         │
│  5. ADD CONTEXT                                         │
│     └─→ Why this action, what it addresses              │
│                                                         │
│  6. GENERATE OUTPUT                                     │
│     └─→ Prioritized action list                         │
└─────────────────────────────────────────────────────────┘
```

## nba-{date}.json Format

```json
{
  "generatedAt": "2026-02-03T15:00:00Z",
  "dealId": "shopco",
  "dealStage": "discovery",
  "dealHealth": 72,
  "actions": [
    {
      "rank": 1,
      "action": "Build ROI model for CFO",
      "type": "champion-enablement",
      "nbaScore": 87,
      "scoring": {
        "likelihood": 85,
        "effort": 30,
        "effortFactor": 70,
        "championValue": 90
      },
      "addresses": ["CFO skepticism", "Budget approval risk"],
      "involves": ["Champion (Sarah)", "CFO (Lisa)"],
      "timeline": "Before end of week",
      "outcome": "CFO has specific ROI data to evaluate",
      "status": "recommended"
    },
    {
      "rank": 2,
      "action": "Request CTO introduction from Sarah",
      "type": "stakeholder-engagement",
      "nbaScore": 78,
      "scoring": {
        "likelihood": 90,
        "effort": 10,
        "effortFactor": 90,
        "championValue": 60
      },
      "addresses": ["CTO not engaged", "Technical approval risk"],
      "involves": ["Champion (Sarah)", "CTO (Michael)"],
      "timeline": "This week",
      "outcome": "Technical evaluation path opened",
      "status": "recommended"
    },
    {
      "rank": 3,
      "action": "Schedule discovery follow-up",
      "type": "meeting",
      "nbaScore": 72,
      "scoring": {
        "likelihood": 95,
        "effort": 15,
        "effortFactor": 85,
        "championValue": 45
      },
      "addresses": ["Maintain momentum", "Clarify remaining scope"],
      "involves": ["Champion (Sarah)"],
      "timeline": "Within 3 days",
      "outcome": "Next meeting scheduled, questions answered",
      "status": "recommended"
    }
  ],
  "notRecommended": [
    {
      "action": "Send proposal",
      "reason": "Use case not fully scoped, CTO not engaged",
      "prerequisite": "Complete technical discovery"
    }
  ],
  "context": {
    "stageActions": ["Continue discovery", "Engage technical stakeholders"],
    "riskActions": ["Address CFO concerns", "Build backup champion"],
    "gapActions": ["Improve DM engagement", "Clarify use case scope"]
  }
}
```

## Action Types

| Type | Description | When to Use |
|------|-------------|-------------|
| meeting | Schedule/conduct meeting | Advance deal stage |
| champion-enablement | Create materials for champion | Help champion sell internally |
| stakeholder-engagement | Engage new stakeholder | Expand relationships |
| content-delivery | Send relevant content | Address objection or educate |
| technical | Technical demo/POC/review | Address technical concerns |
| executive | Executive engagement | Unstick deal, accelerate |
| proposal | Send proposal/pricing | Close stage |
| follow-up | Follow up on previous | Maintain momentum |

## Output Format

After generation:

```
✓ Next Best Actions: {company}

  Deal: ShopCo (Discovery Stage)
  Health: 72/100

  ═══════════════════════════════════════════════════════════
  #1 BUILD ROI MODEL FOR CFO                      Score: 87
  ═══════════════════════════════════════════════════════════
  Type: Champion Enablement
  Timeline: Before end of week

  Why This Action:
    • Addresses: CFO skepticism, Budget approval risk
    • Likelihood: 85% (CFO open to data)
    • Effort: Low (30/100)
    • Champion Value: High (90 - enables Sarah)

  What It Achieves:
    CFO has specific ROI data to evaluate

  Involves: Sarah Chen (Champion), Lisa Park (CFO)

  ───────────────────────────────────────────────────────────
  #2 REQUEST CTO INTRODUCTION                     Score: 78
  ───────────────────────────────────────────────────────────
  Type: Stakeholder Engagement
  Timeline: This week

  Why This Action:
    • Addresses: CTO not engaged, Technical approval risk
    • Likelihood: 90% (Sarah offered)
    • Effort: Very Low (10/100)
    • Champion Value: Medium (60)

  What It Achieves:
    Technical evaluation path opened

  Involves: Sarah Chen, Michael Torres (CTO)

  ───────────────────────────────────────────────────────────
  #3 SCHEDULE DISCOVERY FOLLOW-UP                 Score: 72
  ───────────────────────────────────────────────────────────
  Type: Meeting
  Timeline: Within 3 days

  Why This Action:
    • Addresses: Maintain momentum, Clarify scope
    • Likelihood: 95%
    • Effort: Very Low (15/100)
    • Champion Value: Moderate (45)

  NOT YET RECOMMENDED:
    ✗ Send proposal
      Why: Use case not fully scoped, CTO not engaged
      First: Complete technical discovery

  Files Updated:
    • actions/nba-2026-02-03.json
    • DEAL.md (next actions section)
```

## Quality Checklist

- [ ] Deal state analyzed
- [ ] Multiple candidate actions considered
- [ ] Each action scored with formula
- [ ] Actions ranked by NBA score
- [ ] Context provided for each action
- [ ] Timeline specified
- [ ] Involves stakeholders listed
- [ ] Not-recommended actions explained
